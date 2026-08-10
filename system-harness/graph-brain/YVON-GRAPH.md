# YVON Graph & System Architecture

**Merged from and superseding:** `docs/YVON-DASHBOARD-BRIEF.md` and
`docs/YVON-Graph ARCHITECTURE.md`. Both were written without repo access; all of
their content is carried here, reconciled against what is actually built.
**Governs:** the `/brain` graph viewer, its data sources, and the visual model behind
them. **Scope narrowed 2026-08-09** — this document used to also carry the system/
execution architecture (Part II); that content moved to `GRAPH-BRAIN-DESIGN.md` §16
onward, which is now the technical/system-architecture file. Two pieces stayed here as
graph-viewer-specific — see the Part II pointer below.
**Companion:** `docs/GRAPH-BRAIN-DESIGN.md` (system/execution architecture, §16 onward),
`docs/MASTER.md` PART 5 (multi-tenant layers, now deferring to `GRAPH-BRAIN-DESIGN.md`
§18 for the canonical 4-layer model), PART 7 (execution).

Every claim was checked against the repo on **2026-08-04**.

**Status markers used throughout:** `[built]` verified present · `[partial]`
started, incomplete · `[planned]` designed, no code yet. The retired architecture
document described a target system as though it existed; those claims are marked
`[planned]` here rather than deleted. Appendix D lists every divergence.

---

## How to read this

| You want to… | Go to |
|---|---|
| Understand what the graph renders and where its data comes from | **Part I**, §0–§2 |
| Write a query against the graph | **Part I**, §3 |
| Know what is built vs missing | **Part I**, §5 |
| Understand *why* the system is shaped this way | `GRAPH-BRAIN-DESIGN.md` §16–§18 |
| Work on execution, concurrency, or memory | `GRAPH-BRAIN-DESIGN.md` §20–§22 |
| Onboard a brand or client | `GRAPH-BRAIN-DESIGN.md` §23 |
| See how the graph viewer renders live activity | **Part II**, §16 (stayed here) |
| Run the SQL | **Appendix A** |

---

## Table of Contents

**Part I — The Graph**

- [0 · Orientation](#0--orientation)
- [1 · Data model](#1--data-model)
- [2 · Visual model → data mapping](#2--visual-model--data-mapping)
- [3 · Query catalog](#3--query-catalog)
- [4 · Rebuild & sync paths](#4--rebuild--sync-paths)
- [5 · Current state vs remaining work](#5--current-state-vs-remaining-work)
- [6 · Graph invariants & failure modes](#6--graph-invariants--failure-modes)

**Part II — The System** *(mostly moved to `GRAPH-BRAIN-DESIGN.md` §16–27 on 2026-08-09;
§16 and §19 below are what stayed here — see the pointer at the top of Part II)*

- [16 · Observability & the dashboard](#16--observability--the-dashboard)
- [19 · Build sequence](#19--build-sequence)

**Appendices**

- [A — Copy-paste SQL](#appendix-a--copy-paste-sql)
- [B — Retired decisions](#appendix-b--retired-decisions)
- [C — Vocabulary](#appendix-c--vocabulary)
- [D — Where the retired docs diverged from the repo](#appendix-d--where-the-retired-docs-diverged-from-the-repo)

---

# Part I — The Graph

---

## 0 · Orientation

### 0.1 There are three graphs. This doc governs one.

The single most expensive mistake available here is treating these as one system.
They have different sources, different shapes, and different reasons to exist.

| | **Code graph** | **Org graph** | **Context graph** |
|---|---|---|---|
| **What it maps** | files → functions → calls | departments → agents | brands → enabled agents |
| **Produced by** | Graphify (AST scan) | `scripts/build-structure.mjs` | Supabase rows |
| **Size today** | 7,421 nodes / 15,857 links | 7 depts / 46 agents | **[built 2026-08-09]** 2 context rows (`yvon-os` core, `novizio` venture), 92 grant rows |
| **Artifact** | `graphify-out/graph.json` (9.4 MB) | `dashboard/public/structure.json` (3.9 KB) | `ventures` + `venture_agents` |
| **Consumer** | RAG retrieval; deep `/brain` view | `/brain` L1 + L2 | `/brain` L3 satellites |
| **Changes when** | code changes | an agent directory is added | a brand is onboarded |

**Graphify is not the brand graph and never will be.** It indexes
`Teams/**/*.py` as *source files* — e.g. node
`teams_ai_agents_anneal_custom_skill_quality_audit_scripts_skill_audit`. It has no
concept of a brand, a grant, or a run. It stays in the retrieval lane
(`src/cie/sources/graphify.ts`) and is read by the viewer only as an optional deep
layer. Any attempt to derive department→agent edges from it will produce noise.

### 0.2 Source, transport, cadence

| Layer | Source of truth | Transport | Cadence | Deploy needed? |
|---|---|---|---|---|
| Org structure | `Teams/` directory tree | static JSON at build | on commit | **yes** |
| Contexts (brands) | Supabase `ventures` | REST fetch | on change | **no** |
| Grants (brand×agent) | Supabase `venture_agents` | REST fetch | on change | **no** |
| Live activity | Supabase `events` | Realtime WebSocket | sub-second | no |
| Code graph | Graphify on the VPS | Supabase Storage | nightly | no |

The split on "deploy needed" is the whole design. Adding an **agent** is a repo
change and should require a deploy — agents are definitions under review. Adding a
**brand** must not, because onboarding a client cannot be gated on a git push.

### 0.3 What this replaces

`YVON-DASHBOARD-BRIEF.md` was an investigation brief; every task in its §2 has
since been answered and roughly half its §3 build list is shipped. Following it
today walks backwards. `YVON-Graph ARCHITECTURE.md` §§4, 8, 9, 14, 15 duplicate
`MASTER.md` PART 5. Both are retired by this document; see Appendix B.

---

## 1 · Data model

Each layer below gives its **contract**, its **shape**, and the **query** that
reads it. Query numbers cross-reference [§3](#3--query-catalog).

### 1.1 Org structure — `Teams/` → `structure.json`

The org chart *is* the directory tree. `scripts/build-structure.mjs` walks
`Teams/`, treating a directory as an agent **iff** it contains `agent.md` or
`agent.toon`. Departments with no agents (`Shared OS`, `Books`) are skipped.

```
Teams/<Department>/<agent>/agent.md   →   { id: slug(dept)-<agent>, name, tag }
```

**Verified output — 7 departments, 46 agents:**

| id | name | n | agents |
|---|---|---|---|
| `ai-agents` | AI & Agents | 8 | anneal edge forge gauge meta proto relay scout |
| `brand-studio` | Brand Studio | 11 | atlas kai lena muse nate pixel pulse rio spark tempo weave |
| `cybersecurity` | Cybersecurity | 5 | bastion cortex keyring veil warden |
| `engineering` | Engineering | 11 | aegis axiom cypher dana dev mia nova ops quinn raj rank |
| `executive-office` | Executive Office | 3 | echo marcus vista |
| `governance` | Governance | 3 | board precedent sentinel |
| `product` | Product | 5 | loom metric price spec ux |

**Shape** (`dashboard/public/structure.json`):

```json
{
  "version": 1785822117844,
  "departments": [
    { "id": "ai-agents", "name": "AI & Agents",
      "metric": "08", "metricLabel": "Agents",
      "agents": [ { "id": "ai-agents-proto", "name": "proto", "tag": "Prototyping" } ] }
  ]
}
```

`tag` is read from `agent.md` — YAML frontmatter `role:` first, then the
`# name — Role (Dept)` H1 form, else `""`. **Never invented.**

The same script emits `vps-scripts/yvon-hermes-http/agent-alias.json`, a bare-name
→ id map (`mia` → `engineering-mia`). It throws if two agents share a name, so the
1:1 mapping cannot silently break. → **Q1**

### 1.2 Contexts — extending `ventures` `[built 2026-08-09]`

All seven columns below now exist live (`dashboard/supabase/migrations/112_context_graph_columns.sql`,
applied via Supabase MCP against `cjjllgexiecesgwenpph`). `kind`/`status`/`tier` were added earlier
in this session (109/014/111); `parent_id`/`context_path`/`guardrails`/`credentials_ref`/`sort_order`
were added in 112 along with the `context_path` trigger, verified live with a real `BEGIN…ROLLBACK`
insert (child row correctly produced `context_path = 'novizio/test-child-verify'`). `guardrails` and
`credentials_ref` are schema-only — no runtime code reads either yet. `sort_order` is unused by any
query. The re-centering below (YVON as its own row) was discussed with the operator before applying —
see 112's header comment.

`ventures` already exists (`001_phase3_tables.sql`) and already carries brand
identity: `slug`, `name`, `color`, social handles, `ga4_property_id`,
`hosting_platform`, `deployment_config`, `local_repo_path`, and more across ~8
later migrations. `venture_agent_memories` already keys memory on
`(venture_slug, agent_id)`.

**Decision: extend `ventures`; do not create a parallel `contexts` table.** A
second table describing the same brands would fork `tasks.venture_id`,
`venture_agent_memories.venture_slug`, and every `/api/ventures*` route.

Seven columns are added for the graph:

| Column | Type | Purpose | Without it |
|---|---|---|---|
| `parent_id` | `UUID → ventures(id)` | one level of nesting (platform → client) | every client is a top-level satellite |
| `context_path` | `TEXT UNIQUE` | `parent.slug/slug`, the `events.context_id` join key | glow has nothing to match on |
| `kind` | `core` / `venture` / `client` | centre orb vs satellite vs sub-orb; policy class | cannot tell YVON from a brand |
| `status` | `active` / `paused` / `archived` | render + halt state | retired brands stay lit forever |
| `tier` | `TEXT` | concurrency cap + model routing | every client gets top-tier models |
| `guardrails` | `JSONB` | per-context policy | client agents inherit your grants |
| `credentials_ref` | `TEXT` | vault key name — **never a secret** | secrets in table rows |

`credentials_ref` points into the existing vault (`036_app_secrets_vault.sql`) — not verified this
session that that vault table exists; `credentials_ref` itself is unset on both live rows either way.

**YVON itself is now a row** `[built 2026-08-09]` — `kind='core'`, `slug='yvon-os'`,
`context_path='yvon-os'` — so one query serves the centre and every satellite. `novizio` was
demoted from the `kind='core'` this session had originally (mistakenly) given it, to `kind='venture'`
— a real brand orbiting the centre, not the centre itself. Its 46 pre-existing `venture_agents`
grants were left untouched (now an ordinary venture-level grant set); `yvon-os` received its own
matching 46-row grant set so `syncVentureAgents()` (which only auto-grants `kind='core'` ventures)
keeps targeting the right row going forward.

> **`context_path` cannot be a Postgres `GENERATED` column.** Generated columns may
> only reference the *same row*; resolving `parent.slug` is a cross-row lookup.
> It is maintained by a `BEFORE INSERT OR UPDATE` trigger instead (Appendix A).
> With nesting fixed at one level the trigger is four lines and cannot recurse.

→ **Q2**

### 1.3 Grants — `venture_agents`

Nothing in the repo currently records which agents a brand has. This is the one
genuinely new table.

```text
venture_agents                                    ← shape only; runnable DDL in Appendix A
  venture_slug  TEXT         → ventures(slug), ON DELETE CASCADE
  agent_id      TEXT            MUST equal a structure.json agent id
  enabled       BOOLEAN         default true
  config        JSONB           per-context overrides
  granted_at    TIMESTAMPTZ
  granted_by    TEXT
  PRIMARY KEY (venture_slug, agent_id)
```

Explicit rows, not policy expressions. 100 clients × ~10 agents = ~1,000 rows —
trivial to store, trivial to audit, and answerable with one indexed query.
Granting a whole department expands to rows at write time; the read path stays
flat. → **Q3**

### 1.4 Events — already shipped

`052_events.sql` defines an **append-only** log. Never `UPDATE`, never `DELETE`;
run lifecycle is expressed as successive `kind` values.

```text
events(id BIGSERIAL, ts, source, context_id, kind, actor, payload JSONB, correlation UUID)
  source      'hermes' | 'claude-code' | 'yvon'
  context_id  joins ventures.context_path
  kind        'run.started' | 'run.completed' | 'run.failed'
  actor       agent id — slug(dept)-name, or 'system'
```

RLS: `authenticated` reads, `service_role` writes. Published to
`supabase_realtime`. Indexed on `(context_id, ts DESC)`, `(correlation)`,
`(actor, ts DESC)`.

**The producer exists.** `vps-scripts/yvon-hermes-http/events.py` posts to
PostgREST on a daemon thread with all exceptions swallowed — telemetry can never
break a run. `main.py` emits `run.started` before dispatch and
`run.completed` / `run.failed` after, with a shared `correlation` UUID and
`context_id=req.workspace`.

`resolve_actor()` maps bare names through `agent-alias.json` and **logs a warning
for any unknown name** — the drift that would silently kill the glow fails loudly
in the VPS log instead. → **Q4, Q5**

### 1.5 Graphify — adjacent, not part of this graph

Produced by an external AST tool; published by `cli/graph-sync.sh` +
`cli/graph-publish.py` into `dashboard/public/`. Two artifacts:
`graph-full.json` (9.1 MB, every node) and `graph-view.json` (17 KB, overview).

Consumed by `src/cie/sources/graphify.ts` → `queryGraphify()` for RAG retrieval,
which parses communities out of `GRAPH_REPORT.md` and caches on mtime.

Its role in `/brain` is an **optional deep layer**, loaded on demand, never on
first paint. It contributes no department, agent, brand, or run edges.

### 1.6 Derived — never stored

These are computed at read time. Storing them guarantees a stale number on the one
surface whose entire job is showing truth.

| Value | Derivation |
|---|---|
| A brand's **active departments** | `venture_agents` where `enabled` → map agent ids → departments via `structure.json` |
| Agent / department **counts** | `length` of the resolved lists |
| Satellite **card metric** | `count(*)` over `events` in a window (default 7d) |
| Node **status** | fold of `events` through `applyEvent` |
| Department status | `bubbleUp` — strongest child state, `error > active > idle` |

---

## 2 · Visual model → data mapping `[built 2026-08-09]`

Three levels, all now implemented. Level 1 and 2 were already built and deployed;
level 3 (satellites) was specified but unbuilt going into this session and was
built 2026-08-09 — see §2.3.

Implementation lives in `dashboard/components/YvonGraph.tsx` (~800 lines after the L3 addition),
rendered by `dashboard/app/brain/page.tsx`. Verified via a full-program `tsc --noEmit` (clean) —
a production `next build` could not be run in this session's sandbox (missing platform SWC
binary, an environment limitation, not a code issue); re-run `next build` and a real browser
pass the first time this lands somewhere with a working Next.js toolchain.

**Regression caught and fixed while wiring this up:** `/api/ventures/route.ts` hardcoded a
synthetic `yvon-os` object ("always present, never a DB row") and prepended it to every
response. Migration 112 (§1.2) made `yvon-os` a real row, so that hardcode started producing a
duplicate `yvon-os` entry. Removed; `getAllVentures()` now returns the real row directly, with
`kind`/`status`/`tier`/`context_path`/`parent_id`/`sort_order` added to its column selection and
`VentureConfig`/`VentureLite` (optional fields, ~67 and several importers respectively —
non-breaking additions).

### 2.1 L1 — YVON overview

Centre orb + **all 7 departments** as cards on a collision-free ring. Cards show
`metric` (agent count, zero-padded) over `metricLabel`, plus a sparkline.

- Data: `fetch('/structure.json')` → `Dept[]`
- Layout: `buildLayout(DEPARTMENTS)` — seeded PRNG (`rngFrom(20260803)`) places
  cards on an elliptical ring at alternating bands (430 / 570), then runs 360
  iterations of AABB relaxation with 48×42 padding. Deterministic; identical every
  reload.
- Status: `bubbleUp(status, DEPARTMENTS)`

### 2.2 L2 — department detail

One department centred, its agents fanned out. Existing `DetailView`. Agent nodes
key on the stable `slug(dept)-name` id — the same id that arrives in
`events.actor`.

### 2.3 L3 — satellites `[built 2026-08-09]`

This is the layer in the reference imagery: the YVON system at the centre, and
separate brand systems orbiting it, each with its own smaller ring.

**Rendering rule, per your decision:**

- **YVON (`kind='core'`)** — every department, every agent. The full 7 / 46.
- **Brands (`kind='venture'|'client'`)** — **only active departments**, and within
  each, only the agents granted to that brand.

> A department appears in a brand's ring **iff ≥ 1 of its agents is enabled for
> that context.** A brand with only `mia` and `raj` renders one node
> (Engineering, 2 agents) — not seven dim ones.

Consequences that must be handled, not designed around:

| Consequence | Handling |
|---|---|
| Ring sizes differ per brand | Satellite radius scales with active-department count; do not pad to a fixed 7 |
| A brand may have 1 department | Single-node ring is a legal state — must not collapse into the orb |
| A brand may have 0 grants | Render the orb dimmed with an explicit "no agents granted" affordance. **Do not hide it** — an unprovisioned brand is exactly what an operator needs to see |
| Clients nest under a platform | One level only. `parent_id` non-null → render as a sub-orb attached to its parent satellite, never at top level |

**Layout composition.** Reuse `buildLayout` per satellite with its own seed,
derived from the context slug so a brand's internal arrangement is stable across
reloads and independent of every other brand. Satellite orb positions come from a
second ring pass over contexts sorted by `(kind, sort_order, slug)`.

**Implementation note (2026-08-09):** all four consequences above are handled exactly as
specified — verified by reading the built code back, not just the commit message. One
deliberate simplification: the outer satellite ring uses deterministic angular placement
(evenly spaced by sorted index, with per-satellite seeded jitter) rather than `buildLayout`'s
full AABB collision-relaxation pass. With one real satellite live today (`novizio`) collision
can't occur; if the brand count grows enough for satellite orbs to visually overlap, port the
same relaxation loop used for department cards. Each satellite's *own* department ring (what
you see after clicking in) does reuse the full `buildLayout` function, seeded from
`seedFromSlug(context.slug)`, exactly as specified. Grant edges (satellite → core, and child →
parent for nested clients) render as thin dashed violet-tinted lines, visually distinct from
department spokes and from run edges (§2.4) — static membership, never animated.

**Scope switching `[built 2026-08-09]`.** The tabs now come from a live fetch of contexts
(**Q2**, via `useWorkspace()` → `/api/ventures`) instead of the four hardcoded pairs this
section used to describe. Picking a non-core tab both sets `scope` to that context's
`context_path` (§6.1 — not the bare slug) and opens that brand's L3 ring; picking YVON returns
to the universe view (core ring + every satellite at once). Clicking a satellite orb directly
does the same thing. A new brand now appears in the switcher without a deploy — it only
requires a `ventures` row, per §4.3.

### 2.4 Edge semantics `[built 2026-08-09]`

Two edge kinds, visually distinct, never conflated:

| | **Grant edge** | **Run edge** |
|---|---|---|
| Means | this brand may use this agent | this agent is executing for this brand *now* |
| Source | `venture_agents.enabled` | `events` |
| Lifetime | until revoked | one run |
| Render | thin, static, low opacity | bright, animated, decays |

An agent lit toward four brands at once is **one definition in four concurrent
executions** — not four agents. Grant edges are the structure; run edges are the
weather.

### 2.5 Layout invariants

These are correctness requirements, not preferences:

1. **Positions are computed once per structure** in `useMemo`, keyed on the
   structure object — never on a status change. A status update must never
   reshuffle a node.
2. **Positions derive from sorted stable ids**, never array index, so adding an
   agent inserts rather than reorders.
3. **Status changes may only alter colour, glow and opacity** — never geometry.
4. `DECAY_MS = 12_000`. `run.completed` keeps `active` and the caller schedules
   the fade, so the map reads as *recent work* rather than a binary lamp.
5. Satellite seeds derive from the context slug, so one brand's changes never
   perturb another's layout.

---

## 3 · Query catalog

Grouped by the view each query feeds. `sb` is the browser Supabase client
(`@/lib/supabase-browser`), anon key + RLS.

### Q1 — Org structure (L1, L2)

```ts
const s: Structure = await fetch('/structure.json').then(r => r.json())
setDepartments(s.departments)
```

Static file, served by Vercel's CDN. No auth, no round trip to Postgres.

### Q2 — Contexts for the scope switcher and satellites (L3)

```ts
const { data: contexts } = await sb
  .from('ventures')
  .select('slug, name, color, kind, status, tier, context_path, parent_id, sort_order')
  .neq('status', 'archived')
  .order('kind').order('sort_order', { nullsFirst: false }).order('slug')
```

SQL equivalent, with parent slug resolved:

```sql
SELECT v.slug, v.name, v.color, v.kind, v.status, v.tier,
       v.context_path, p.slug AS parent_slug
FROM   ventures v
LEFT   JOIN ventures p ON p.id = v.parent_id
WHERE  v.status <> 'archived'
ORDER  BY v.kind, v.sort_order NULLS LAST, v.slug;
```

### Q3 — Grants, and the active-department derivation (L3)

```ts
const { data: grants } = await sb
  .from('venture_agents')
  .select('venture_slug, agent_id')
  .eq('enabled', true)
```

Derive **client-side** by joining against `structure.json`:

```ts
const deptOf = new Map(
  structure.departments.flatMap(d => d.agents.map(a => [a.id, d.id])))

function ringFor(slug: string) {
  const ids = new Set(grants.filter(g => g.venture_slug === slug).map(g => g.agent_id))
  return structure.departments
    .map(d => ({ ...d, agents: d.agents.filter(a => ids.has(a.id)) }))
    .filter(d => d.agents.length > 0)          // ← the active-department rule
}
```

> **Do not recover the department by string-splitting `agent_id` in SQL.** It
> happens to work today only because no agent directory name contains a hyphen.
> That is an accident, not a contract. Join through `structure.json`.

### Q4 — Live activity subscription (all levels)

Already implemented — `dashboard/lib/events/supabase-source.ts`:

```ts
const unsub = supabaseSource(contextPath).subscribe(e => {
  setStatus(prev => applyEvent(prev, e))
  if (e.kind === 'run.completed')
    schedule(() => setStatus(p => ({ ...p, [e.actor]: 'idle' })), DECAY_MS)
})
```

Underneath: `postgres_changes` INSERT on `public.events`, filtered
`context_id=eq.<path>`. The **browser** holds this socket. Vercel is not in the
path and cannot be — see [§4.5](#45-what-must-never-run-on-vercel).

Omit the argument to watch every context at once (an all-brands view).

### Q5 — Satellite card metric (7-day run volume)

```sql
SELECT actor, count(*) AS runs
FROM   events
WHERE  context_id = $1
  AND  kind = 'run.started'
  AND  ts > now() - interval '7 days'
GROUP  BY actor
ORDER  BY runs DESC;
```

Uses `idx_events_context_ts`. Per-department totals roll up client-side through
the same `deptOf` map as **Q3** — again, no string parsing.

### Q6 — Health check: failures in the last 24h

```sql
SELECT context_id, actor, count(*) AS failures, max(ts) AS last_failure
FROM   events
WHERE  kind = 'run.failed' AND ts > now() - interval '24 hours'
GROUP  BY context_id, actor
ORDER  BY failures DESC;
```

### Q7 — Drift detector: actors that no longer exist *(run in CI)*

```sql
SELECT DISTINCT actor
FROM   events
WHERE  ts > now() - interval '30 days' AND actor <> 'system';
```

Diff the result against `structure.json` ids. **Any actor not in the structure is
a node that will never light.** See [§6.1](#61-the-two-id-contracts).

### Q8 — Trace one workflow across agents

```sql
SELECT ts, source, actor, kind, payload
FROM   events WHERE correlation = $1 ORDER BY ts;
```

### Q9 — Graphify deep layer (on demand only)

```ts
const { data } = await sb.storage.from('graphs')
  .createSignedUrl('graphify/latest.json', 300)
const graph = await fetch(data.signedUrl).then(r => r.json())
```

Never on first paint. 9 MB.

---

## 4 · Rebuild & sync paths

### 4.1 Who writes what, from where

| Artifact | Producer | Runs on | Trigger | Consumer |
|---|---|---|---|---|
| `structure.json` | `build-structure.mjs` | Vercel (`prebuild`) | every deploy | browser |
| `agent-alias.json` | same script | Vercel **and VPS** | deploy / cron | Hermes |
| `ventures`, `venture_agents` | operator, `/api/ventures*` | Supabase | on change | browser |
| `events` rows | `events.py` ← `main.py` | VPS | per run | browser (Realtime) |
| `graphify/latest.json` | Graphify | VPS cron | nightly | browser, on demand |

### 4.2 Structure — build time

`dashboard/package.json` already runs `node ../scripts/build-structure.mjs` as
`prebuild` and as part of `dev`. Every Vercel deploy regenerates it from the repo.

**Gap, now closed pending activation `[2026-08-09]`:** nothing triggers a deploy when only
`Teams/**` changes, and `.github/` had never existed in this repo (the CI referenced by both
retired documents was never built — confirmed by grep before writing this). A workflow now
exists at `.github/workflows/graph-drift.yml` — `structure-check` fails CI if the committed
`structure.json` drifts from `Teams/`, `drift-check` runs Q7 nightly. Not committed by the agent
that wrote it; needs `git add .github/ && git commit && git push` plus
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` as repo secrets before it actually runs.

### 4.3 Contexts — live, no deploy

Brands are Supabase rows. A new brand appears on the next `/brain` load; an
`INSERT` is the entire onboarding step as far as the graph is concerned. This is
why they are not in `structure.json`.

### 4.4 Graphify — VPS cron → Supabase Storage `[delivered 2026-08-09, not yet installed]`

**`graphify-out/.graphify_root` still reads a dead sandbox path** (confirmed unchanged this
session) — the committed graph artifact is stale. The pipeline below is now written but not
running anywhere yet; see `system-harness/graph-brain/ci/install-graphify-cron.md` for why (no SSH/VPS
credentials were available in the sandbox that wrote it) and what one human action activates it.

**Decided path, now built as `system-harness/graph-brain/ci/graphify-cron.sh`:**

```
nightly cron on the VPS
  ├─ git pull
  ├─ graphify extract .                    → graphify-out/graph.json
  ├─ node scripts/build-structure.mjs      → refresh agent-alias.json locally
  └─ upload graph.json → Supabase Storage bucket `graphs` as graphify/latest.json
```

The `graphs` bucket itself is live (`113_graphs_storage_bucket.sql`, applied and verified —
private, `authenticated` read via signed URL per **Q9**, `service_role` write only). The script
is the only piece still waiting on a real VPS shell.

Then **remove `dashboard/public/graph-full.json` (9.1 MB) from git.** A binary
blob that large, rewritten nightly, is committed churn and is served from the CDN
on a page most users never open. Storage + a signed URL (**Q9**) replaces it.
`graph-view.json` (17 KB) may stay in `public/` — it is small and useful on load. Still not done
— deliberately deferred to its own git change, not bundled into this pass.

**The alias map matters more than the graph here.** `agent-alias.json` is
generated into `vps-scripts/yvon-hermes-http/` at build time and read by Hermes at
`/opt/yvon-hermes-http/agent-alias.json`. If the VPS copy is not refreshed when
agents change, `resolve_actor()` falls back to the bare name and **those nodes stop
lighting**. Regenerating it in the same cron is the fix — it is one line and it
closes the highest-probability silent failure in the system. `graphify-cron.sh` step 4/5 does
exactly this `install -D` copy; it's the step the script's own comments flag as the one most
worth double-checking after install.

### 4.5 What must never run on Vercel

- **Agent runs.** Serverless timeouts kill long executions. Hermes stays on the VPS.
- **Realtime subscriptions.** A serverless function cannot hold a socket. The
  browser connects to Supabase directly.
- **Graphify.** A full AST scan of 7,400 nodes will not finish inside a build.
- **Service-role keys.** The dashboard gets anon + RLS. The service key lives only
  in the VPS systemd unit (`SUPABASE_SERVICE_ROLE_KEY`).

Vercel's entire job is: run `prebuild`, serve static assets, serve pages.

---

## 5 · Current state vs remaining work

The section both retired documents lacked, and the reason they misled. Verified
2026-08-04; re-verified and substantially updated 2026-08-09 across two passes (see rows marked
`[built 2026-08-09]` — `venture_agents`, the seven `ventures` columns, the `yvon-os` core row, and
L3 satellite rendering, all built and verified this session — plus the "Delivered, not yet
activated" section below, added in a second pass the same day once the three remaining Missing
items were built as far as this sandbox's access allows).

### Built and working

| Thing | Evidence |
|---|---|
| Structure generation | `scripts/build-structure.mjs` → 7 depts / 46 agents |
| Alias map + collision guard | `vps-scripts/yvon-hermes-http/agent-alias.json`; script throws on duplicate names |
| Event log schema | `dashboard/supabase/migrations/052_events.sql` |
| Event producer | `events.py` (fire-and-forget) + `main.py` (start/completed/failed + correlation) |
| Unknown-actor warning | `resolve_actor()` logs drift instead of failing silently |
| Event consumer seam | `dashboard/lib/events/index.ts` — `RunEvent`, `applyEvent`, `bubbleUp`, `DECAY_MS` |
| Realtime transport | `dashboard/lib/events/supabase-source.ts` |
| L1 + L2 viewer on real data | `dashboard/components/YvonGraph.tsx` → `/brain` |
| Graphify publish scripts | `cli/graph-sync.sh`, `cli/graph-publish.py` |
| `venture_agents` grant table `[built 2026-08-09]` | `dashboard/supabase/migrations/111_venture_agents_and_tier.sql`, `112_context_graph_columns.sql` — 2 ventures × 46 agents = 92 rows, RLS enabled |
| Seven `ventures` columns + `context_path` trigger `[built 2026-08-09]` | `112_context_graph_columns.sql` — trigger verified live via `BEGIN…ROLLBACK` test insert |
| YVON as a `kind='core'` row `[built 2026-08-09]` | `112_context_graph_columns.sql` §3 — `novizio` demoted to `kind='venture'` in the same migration |
| L3 satellite rendering `[built 2026-08-09]` | `dashboard/components/YvonGraph.tsx` — §2.3; `tsc --noEmit` clean, `next build` not runnable in this session's sandbox (missing SWC binary) |
| Scope tabs from live `ventures` `[built 2026-08-09]` | Same file — tabs built from `useWorkspace()`/`/api/ventures`, tab id is `context_path` per §6.1 |

### Partial

| Thing | What's missing |
|---|---|
| Graphify artifacts | Stale, built from a dead sandbox path; 9.1 MB blob still committed (removal deferred — a deliberate, separate git change, see `system-harness/graph-brain/ci/install-graphify-cron.md` §"Once this is running") |
| `guardrails` / `credentials_ref` columns | Schema exists (`112_context_graph_columns.sql`); no runtime reader yet |
| Vercel rebuild on structure change | `prebuild` works; nothing triggers it on `Teams/**` alone |
| L3 satellite outer-ring collision handling | Deterministic angular placement, not `buildLayout`'s AABB relaxation — fine at today's brand count (1), see §2.3 implementation note |

### Delivered, not yet activated `[2026-08-09]`

Written and verified for logic where verification was possible from this session's sandbox
(no SSH/VPS credentials, no network path to `hermes.yvon.in` or GitHub — confirmed live, not
assumed). Each needs one human action to go live:

| Thing | Evidence | What's needed to activate |
|---|---|---|
| `graphs` Storage bucket | `113_graphs_storage_bucket.sql`, applied live — confirmed via `SELECT * FROM storage.buckets`, RLS policies confirmed (`authenticated` SELECT, `service_role` write) | Nothing — this one's actually live, the pipeline just has nothing to upload yet |
| Graphify VPS cron | `system-harness/graph-brain/ci/graphify-cron.sh` + `system-harness/graph-brain/ci/install-graphify-cron.md` | Install on the VPS per the install doc — needs a real shell there |
| `.github/workflows/graph-drift.yml` (structure-check + Q7 drift-check) | File on disk, YAML validated (`python3 -c "import yaml..."`), `system-harness/graph-brain/ci/detect-drift.mjs` dry-run tested against an empty live `events` table (0 actors → correctly reports no drift) | `git add .github/ system-harness/graph-brain/ci/detect-drift.mjs && git commit && git push` — not done by the agent that wrote it, per operator instruction; also needs `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` added as GitHub Actions repo secrets |

### Missing

Nothing left unaddressed from the 2026-08-04 audit — the three rows previously here (Graphify VPS
cron, `.github/` workflow, Q7 drift-detector) all moved to "Delivered, not yet activated" above.

### Repo hygiene found while verifying

- **Duplicate migration number:** `052_events.sql` and `052_training_runs.sql`
  both exist. Ordering between them is undefined. Renumber one before adding more.
- **`tasks.venture_id` is `TEXT`** while `ventures.id` is `UUID` — a pre-existing
  inconsistency. This doc sidesteps it by joining on `slug` / `context_path`, but
  it should be reconciled.
- **`docs/YvonGraph.tsx`** is a 509-line near-duplicate of the live component,
  differing only by containing placeholder departments (Sales, Legal, Customer Ops
  — none of which exist). It is a trap for any future session.

---

## 6 · Graph invariants & failure modes

### 6.1 The two id contracts

**`agent_id = slug(department) + '-' + directory_name`.** Produced by
`build-structure.mjs`, resolved by `resolve_actor()`, matched by the viewer. Three
independent systems agree on this string. Change the slug rule and nodes stop
lighting — with no error anywhere in the browser.

**`context_id = ventures.context_path`.** Written by Hermes from
`req.workspace`, filtered in the Realtime subscription, joined for metrics.

*Detection:* **Q7** in CI (`system-harness/graph-brain/ci/detect-drift.mjs`, wired into
`.github/workflows/graph-drift.yml`'s `drift-check` job — written and dry-run tested this
session, not yet committed/active, see §5), plus the existing `resolve_actor()` warning. A
drifted id is invisible in the UI and obvious in these two places — which is exactly why both
must stay.

### 6.2 Never parse ids to recover structure

Splitting `ai-agents-proto` on the last hyphen works only because no agent
directory contains a hyphen today. Adding one agent named `war-room` breaks every
such query silently. Always join through `structure.json`.

### 6.3 Append-only means append-only

`events` is never `UPDATE`d or `DELETE`d. A mutable `runs` table was considered
and rejected — it loses `context_id`, and two sequential writes to one row is a
lost-update race. Lifecycle is expressed as successive `kind` values.

### 6.4 Layout stability

Positions from sorted stable ids, computed once, frozen against status change.
Violating this makes the map unreadable during activity — nodes move exactly when
you are trying to watch them.

### 6.5 Key separation

Anon key + RLS in the browser; service role only in VPS systemd. `events` RLS
already enforces this: `authenticated` may `SELECT`, only `service_role` may
`INSERT`. `venture_agents` ships with the same policy pair `[built 2026-08-09]`
(`venture_agents_read_authenticated` / `venture_agents_write_service`, migration 111) —
confirmed live, `authenticated` SELECT-only, `service_role` full access.

### 6.6 Telemetry must never break a run

`events.py` runs on a daemon thread and swallows every exception. Any future
emitter must do the same. Observability that can take down execution is worse than
no observability.

### 6.7 Failure modes

| # | Failure | Symptom | Mitigation |
|---|---|---|---|
| 1 | Agent renamed, alias stale on VPS | node never lights | regenerate alias in cron (§4.4); warning in log |
| 2 | Slug rule changed | all nodes dark | Q7 in CI |
| 3 | `context_path` ≠ `req.workspace` | brand shows zero activity | single source: dashboard passes `context_path` |
| 4 | Brand with no grants | empty ring | render dimmed with explicit affordance — never hide |
| 5 | Graphify blob on first paint | slow `/brain` | on-demand signed URL only (**Q9**) |
| 6 | Duplicate migration 052 | undefined apply order | renumber |
| 7 | Supabase env absent locally | no glow | `supabaseSource` already catches and no-ops |

---

# Part II — The System

*Most of Part II moved to `GRAPH-BRAIN-DESIGN.md` §16 onward on 2026-08-09 — that document is
now the technical/system-architecture file (operator decision). Covers: the core principle
(§16), system topology (§17), the four layers — now the canonical execution stack, superseding
this document's former §9 (§18), data architecture (§19), execution model (§20), concurrency &
conflict prevention (§21), memory write-path mechanics (§22), multi-tenancy & isolation
enforcement (§23), deployment topology (§24), system failure modes (§25), scaling path (§26),
and the execution-track build sequence (§27).*

*Two pieces stayed here because they're graph-viewer-specific, not system-execution content:*

- *§16 below — how the `/brain` UI itself renders live activity (scope selector, glow/decay,
  execution-vs-membership links). Extends this document's own §2 (visual model).*
- *§19 below — this document's own build roadmap; its Phase 2 is explicitly this document's
  immediate work, so splitting it apart from the rest of its ordering would break the
  each-step-unblocks-the-next logic. Cross-referenced from `GRAPH-BRAIN-DESIGN.md` §27 instead
  of being duplicated there.*

*Section numbers 7–9, 11–15, 17–18 are intentionally absent below — retained as gaps rather than
renumbering §16/§19, so existing links/anchors into this document don't break.*

---

## 16 · Observability & the dashboard

### 16.1 One application, scoped

```
┌──────────────────────────────────────────────────┐
│  Scope selector:  [YVON]  Brand A  Brand B  …    │
└──────────────────────────────────────────────────┘
                        │
                        ▼
        Same components, filtered by context_id
        ┌─────────────────────────────────┐
        │  Graph        · scoped subtree  │
        │  EventStream  · WHERE context   │
        │  MetricStrip  · aggregated      │
        │  DetailPanel  · selected node   │
        └─────────────────────────────────┘
```

*Why not one dashboard per brand:* separate codebases drift. Features land in
one and not the others; bugs get fixed three times. A scope parameter costs
nothing and guarantees parity.

A platform scope adds one control — a client sub-selector — because it has a
level the others lack. That is `parent_id`
([§1.2](#12-contexts--extending-ventures)) surfacing in the UI.

**Today** `[partial]`: the scope tabs exist but are hardcoded. Replacing them
with [Q2](#q2--contexts-for-the-scope-switcher-and-satellites-l3) is what makes
a new brand appear without a deploy.

### 16.2 What drives the glow

Fed by the event stream, never by polling agents.

```
run.started   ──▶ node enters active state, pulse begins
run.progress  ──▶ pulse continues, activity value refreshed
run.completed ──▶ pulse fades over the decay window
run.failed    ──▶ error ring, coral, persists until acknowledged
```

Activity **decays rather than switching off**, so the map shows *recent* work,
not only the current instant. A department with nothing active but recent
completions reads warmer than a dormant one.

`[built]` as `DECAY_MS = 12_000` in `dashboard/lib/events/index.ts`.
`run.progress` is `[planned]` — Hermes emits start/completed/failed only.

**Bubble-up:** a collapsed department inherits the strongest state of its
children, so hotspots are visible without expanding everything. `[built]` as
`bubbleUp()`.

### 16.3 Execution links, not membership links

An important correction the retired document made to its own earlier visual
model, and it still holds: **agent nodes live in the YVON ring.** A line from an
agent to a brand is a **live execution link** — it appears when that agent is
running for that context and fades after.

The same agent can show links to several contexts at once. That is one
definition in N concurrent executions, and the visualization should say so.

Formalised as the grant-vs-run edge distinction in
[§2.4](#24-edge-semantics): grant edges are membership, run edges are
execution, and they must never be drawn the same way.

---

## 17 · System failure modes

*Moved to `GRAPH-BRAIN-DESIGN.md` §25 on 2026-08-09 (system-wide failure modes + §25.1 staged
rollout). Graph-viewer-specific failure modes remain in this document's own §6.7, unaffected.*

## 18 · Scaling path

*Moved to `GRAPH-BRAIN-DESIGN.md` §26 on 2026-08-09. The one graph-viewer consequence from that
section — the satellite view cannot render every client as an orb past 500+ contexts, mitigated
by the `parent_id` sub-orb model — is retained there with a pointer back to this document's §2.3.*

---

## 19 · Build sequence

Ordered by unblock value — each step makes the next one safe. Items already
done are struck through against [§5](#5--current-state-vs-remaining-work).

**Phase 1 — Foundations**

1. ~~Event log + ingest~~ `[built]` — `052_events.sql` + `events.py`
2. ~~Structure generation + stable ids~~ `[built]` — `build-structure.mjs`
3. **Task table + atomic leasing.** ~50 lines. Immediately makes parallel
   execution safe. Highest value-to-effort ratio in the system.
4. **Worker loop with async slots + LISTEN/NOTIFY.**

**Phase 2 — The context graph** *(complete as of 2026-08-09 — items 5–7 below;
item 8 remains open)*

5. ~~`054_context_graph.sql` — the seven `ventures` columns + `venture_agents`~~ `[built]` —
   landed as `111_venture_agents_and_tier.sql` + `112_context_graph_columns.sql`, not the
   originally-numbered file ([Appendix A](#appendix-a--copy-paste-sql))
6. ~~Scope tabs from `ventures`~~ `[built]` ([Q2](#q2--contexts-for-the-scope-switcher-and-satellites-l3))
7. ~~L3 satellite rendering~~ `[built]` ([§2.3](#23-l3--satellites-built-2026-08-09))
8. ~~Graphify VPS cron~~ `[delivered, not installed]` ([§4.4](#44-graphify--vps-cron--supabase-storage--delivered-2026-08-09-not-yet-installed)) —
   script + Storage bucket done; needs a real VPS shell to install
9. ~~`.github/` CI (structure-check + Q7 drift-check)~~ `[delivered, not committed]` — see §5
   "Delivered, not yet activated"

**Phase 3 — Federation**

9. First adapter on the thinnest platform; learn the pattern on the easy one
10. Second adapter once the pattern is proven
11. Webhooks from both brands → ingest → live cross-brand metrics

**Phase 4 — Multi-tenancy**

12. **Platform adapter with construction-time scoping + RLS.** Do not onboard a
    second client until this is verified with a deliberate cross-tenant test
    **that must fail**.
13. Tier definitions, per-context caps, priority lanes

**Phase 5 — Memory & scale**

14. **Memory-writer with propose/apply and entity resolution.** Build this
    *before* entity duplication appears — cleanup is far more expensive than
    prevention.
15. Version pinning + staged rollout rings
16. Budget caps and cost attribution at the gateway

---

## Appendix A — Copy-paste SQL

`[built 2026-08-09]` Applied, split across two migrations rather than the single `054_...` file
originally proposed here (the numbering had moved on by the time this ran; `venture_agents` +
`tier` landed first as `111_venture_agents_and_tier.sql`, the remaining five `ventures` columns +
trigger + re-centering as `112_context_graph_columns.sql`). The SQL below is the original proposal,
kept for reference — see those two files for what's actually live, including one correction (the
`yvon-os` row needed its `tier` set to `'internal'` explicitly; the bare `INSERT` below leaves it at
the column default, `'free'`, which is wrong for the platform's own row).

```sql
-- 054_context_graph.sql
-- Extends `ventures` into the context graph (YVON-GRAPH.md §1.2) and adds the
-- brand×agent grant table (§1.3). Additive only; no existing column changes.

-- ── 1. Context columns ──────────────────────────────────────────────────────
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS parent_id       UUID REFERENCES ventures(id) ON DELETE RESTRICT;
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS context_path    TEXT;
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS kind            TEXT NOT NULL DEFAULT 'venture';
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'active';
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS tier            TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS guardrails      JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS credentials_ref TEXT;
ALTER TABLE ventures ADD COLUMN IF NOT EXISTS sort_order      INT;

ALTER TABLE ventures DROP CONSTRAINT IF EXISTS ventures_kind_check;
ALTER TABLE ventures ADD  CONSTRAINT ventures_kind_check
  CHECK (kind IN ('core','venture','client'));
ALTER TABLE ventures DROP CONSTRAINT IF EXISTS ventures_status_check;
ALTER TABLE ventures ADD  CONSTRAINT ventures_status_check
  CHECK (status IN ('active','paused','archived'));

-- Nesting is exactly one level: a context with a parent may not itself be one.
CREATE OR REPLACE FUNCTION ventures_depth_guard() RETURNS trigger AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM ventures WHERE id = NEW.parent_id AND parent_id IS NOT NULL)
  THEN RAISE EXCEPTION 'context nesting is limited to one level';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- ── 2. context_path — trigger, not GENERATED (cross-row parent lookup) ──────
CREATE OR REPLACE FUNCTION ventures_set_context_path() RETURNS trigger AS $$
DECLARE parent_slug TEXT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.context_path := NEW.slug;
  ELSE
    SELECT slug INTO parent_slug FROM ventures WHERE id = NEW.parent_id;
    NEW.context_path := parent_slug || '/' || NEW.slug;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ventures_context_path ON ventures;
CREATE TRIGGER trg_ventures_context_path
  BEFORE INSERT OR UPDATE OF slug, parent_id ON ventures
  FOR EACH ROW EXECUTE FUNCTION ventures_set_context_path();

DROP TRIGGER IF EXISTS trg_ventures_depth ON ventures;
CREATE TRIGGER trg_ventures_depth
  BEFORE INSERT OR UPDATE OF parent_id ON ventures
  FOR EACH ROW EXECUTE FUNCTION ventures_depth_guard();

UPDATE ventures SET context_path = slug WHERE context_path IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ventures_context_path_key ON ventures (context_path);
CREATE INDEX        IF NOT EXISTS ventures_parent_idx       ON ventures (parent_id);

-- ── 3. YVON itself as a context, so one query serves centre and satellites ──
INSERT INTO ventures (name, slug, kind, status, color)
VALUES ('YVON', 'yvon-os', 'core', 'active', '#8E7BF0')
ON CONFLICT (slug) DO UPDATE SET kind = 'core';

-- ── 4. Grants ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venture_agents (
  venture_slug TEXT        NOT NULL REFERENCES ventures(slug) ON DELETE CASCADE,
  agent_id     TEXT        NOT NULL,     -- MUST equal a structure.json agent id
  enabled      BOOLEAN     NOT NULL DEFAULT TRUE,
  config       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  granted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by   TEXT,
  PRIMARY KEY (venture_slug, agent_id)
);

CREATE INDEX IF NOT EXISTS venture_agents_enabled_idx
  ON venture_agents (venture_slug) WHERE enabled;

COMMENT ON COLUMN venture_agents.agent_id IS
  'slug(department)-directory_name, produced by scripts/build-structure.mjs. '
  'The contract with structure.json and events.actor — see YVON-GRAPH.md §6.1.';

-- ── 5. RLS — browsers read, only the service role writes ────────────────────
ALTER TABLE venture_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS venture_agents_read ON venture_agents;
CREATE POLICY venture_agents_read
  ON venture_agents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS venture_agents_write ON venture_agents;
CREATE POLICY venture_agents_write
  ON venture_agents FOR ALL TO service_role USING (true) WITH CHECK (true);
```

**Verification after applying:**

```sql
SELECT slug, kind, status, context_path FROM ventures ORDER BY kind, slug;
SELECT venture_slug, count(*) FROM venture_agents WHERE enabled GROUP BY 1;
```

---

## Appendix B — Retired decisions

| Decision | Superseded by | Why |
|---|---|---|
| Mutable `runs` table (brief §3.2) | append-only `events` (`052_events.sql`) | no place for `context_id`; lost-update race on sequential writes |
| Separate `contexts` table | extend `ventures` | `ventures` already carries brand identity and is referenced by `tasks`, `venture_agent_memories` and the `/api/ventures*` routes |
| `context_path` as `GENERATED` column | `BEFORE` trigger | Postgres generated columns cannot reference another row |
| Structure and brands from one static file | split: structure at build, brands live | onboarding a brand must not require a deploy |
| Graphify as the org/brand structure source | `Teams/` tree + Supabase | Graphify is an AST code mapper; it has no brand or grant concept |
| Graphify rebuilt in CI | VPS nightly cron | a 7,400-node scan does not belong in a web build; the VPS already holds a checkout |
| `graph-full.json` committed to `public/` | Supabase Storage + signed URL | 9.1 MB blob, rewritten nightly, unused on first paint |
| "CI builds structure.json" (both retired docs) | — | **`.github/` has never existed in this repo.** Stated as fact in documents written without repo access |

### Files retired by this document

| File | Disposition |
|---|---|
| `docs/YVON-DASHBOARD-BRIEF.md` | Deleted. Investigation tasks answered in §5; build tasks carried into §1–§4. |
| `docs/YVON-Graph ARCHITECTURE.md` | Deleted. Full content carried into Part II, then most of Part
  II moved again into `GRAPH-BRAIN-DESIGN.md` on 2026-08-09 — see the section map below, updated
  to reflect the second move. |
| `docs/YvonGraph.tsx` | Migrated into `dashboard/components/YvonGraph.tsx`. |

**Section map — retired architecture doc → this document → `GRAPH-BRAIN-DESIGN.md` (2026-08-09)**

| Was (retired doc) | Landed here first | Now lives at |
|---|---|---|
| §1 Executive summary | §7 | `GRAPH-BRAIN-DESIGN.md` §16 |
| §2 Core principle (rejected/adopted model, what lives where) | §7.1–§7.4 | `GRAPH-BRAIN-DESIGN.md` §16.1–16.3 |
| §3 System topology | §8 | `GRAPH-BRAIN-DESIGN.md` §17 |
| §4 The four layers | §9 | `GRAPH-BRAIN-DESIGN.md` §18 — now the canonical stack, also supersedes `MASTER.md` Part 5's separate 4-layer description |
| §5 Data architecture (federation, adapters, push, event log) | §10 | `GRAPH-BRAIN-DESIGN.md` §19 |
| §6 Execution model | §11 | `GRAPH-BRAIN-DESIGN.md` §20 |
| §7 Concurrency & conflict prevention | §12 | `GRAPH-BRAIN-DESIGN.md` §21 |
| §8 Memory architecture | §13 | `GRAPH-BRAIN-DESIGN.md` §22 — merged into that doc's existing MemPalace design (§6) rather than kept as a competing description |
| §9 Multi-tenancy & isolation | §14 | `GRAPH-BRAIN-DESIGN.md` §23 — merged into that doc's existing Principles 1/7 |
| §10 Deployment topology | §15 | `GRAPH-BRAIN-DESIGN.md` §24 |
| §11 Repository structure | §15.3 + Appendix D | `GRAPH-BRAIN-DESIGN.md` §24.3; Appendix D stays here |
| §12 Observability & the dashboard | §16, cross-referenced from Part I §2 | **Stayed here** — this document's §16, graph-viewer-specific |
| §13 Failure modes | §17 | `GRAPH-BRAIN-DESIGN.md` §25 (system-wide); graph-specific ones remain this document's §6.7 |
| §14 Scaling path | §18 | `GRAPH-BRAIN-DESIGN.md` §26 |
| §15 Build sequence | §19 | **Stayed here** — this document's §19, its own build roadmap; `GRAPH-BRAIN-DESIGN.md` §27 is the execution-track counterpart, cross-referenced not merged |
| Appendix A Vocabulary | Appendix C | Stays here (shared vocabulary, still used throughout Part I) |
| Appendix B The principle restated | §7.5 | `GRAPH-BRAIN-DESIGN.md` §16.3 |

---

## Appendix C — Vocabulary

| Term | Definition |
|---|---|
| **Agent** | A stateless definition: prompt + skills + tools + policies. One copy exists, in `Teams/`. |
| **Agent id** | `slug(department)-directory_name`. The contract between `structure.json`, `events.actor` and `venture_agents.agent_id`. |
| **Context** | Configuration + data scope for one brand or client. Data, not a process. A row in `ventures`. |
| **Context path** | `slug` or `parent.slug/slug`. The value in `events.context_id`. |
| **Run** | One execution of an agent against a context for a task. |
| **Grant** | A `venture_agents` row — permission for a context to use an agent. |
| **Grant edge** | Static graph edge drawn from a grant. Membership. |
| **Run edge** | Transient graph edge drawn from a live run. Execution. |
| **Adapter** | MCP server translating semantic calls into one brand's storage. |
| **Namespace** | An isolated partition of the memory graph. |
| **Lease** | A time-bounded claim on a task, preventing duplicate execution. |
| **Ring** | A deployment stage in staged rollout (§17.1). |
| **Saga** | Multi-step cross-system write with compensating actions on failure. |
| **Satellite** | A brand rendered as its own orb + ring around the YVON core. |
| **Bubble-up** | Department status = strongest state among its agents. |
| **Decay** | Fade of a completed run's glow over `DECAY_MS`, so the map shows recent work. |

---

## Appendix D — Where the retired docs diverged from the repo

Both retired documents were written without filesystem access and stated planned
design as fact. Everything below was verified on 2026-08-04. The content is
retained in Part II marked `[planned]`; this table exists so nobody mistakes it
for a description of what runs today.

| Claim in the retired docs | Reality |
|---|---|
| "19 departments, 100+ agent definitions" | **7 departments, 46 agents** (§1.1) |
| Repo has `agents/`, `contexts/`, `adapters/`, `runtime/`, `db/` | **None of these directories exist.** Definitions live in `Teams/`; the runtime is `vps-scripts/yvon-hermes-http/` |
| Contexts are YAML files under `contexts/` | Decided as Supabase rows (`GRAPH-BRAIN-DESIGN.md` §23.2, moved from this document's former §14.2). No `contexts/` directory exists |
| LiteLLM gateway on `:4000` routes all model traffic | **No reference to LiteLLM anywhere in the repo** |
| Worker pool, `queue.py`, `scheduler.py`, `memory_writer.py` | **No such modules.** Execution is the inline Hermes path only |
| Task queue with atomic leasing | `store/tasks/*.yaml` records exist; no leasing implementation found |
| Runtime on "Fly.io / ECS" | VPS (Contabo per `vps-scripts/MIGRATE-TO-CONTABO.md`) |
| CI builds `structure.json` on push | **`.github/` has never existed.** `prebuild` covers it on deploy only |
| Dashboard components `RadialMap.tsx`, `EventStream.tsx`, `ContextSwitcher.tsx` | Actual component is `YvonGraph.tsx`; the others do not exist |
| Mutable `runs` table (brief §3.2) | Shipped as append-only `events` (§1.4) |
| Graphify holds the org structure | Graphify is an AST **code** map (§0.1, §1.5) |

**Reading rule:** in Part II, `[built]` claims are verified against the repo.
Anything marked `[planned]` is a design commitment, not a description. If a
future session finds an unmarked claim it cannot verify, treat it as `[planned]`
and add the marker.

---

*Sources: verified against `scripts/build-structure.mjs`, `dashboard/public/structure.json`,
`dashboard/supabase/migrations/001_phase3_tables.sql` and `052_events.sql`,
`dashboard/lib/events/{index,supabase-source}.ts`, `dashboard/components/YvonGraph.tsx`,
`vps-scripts/yvon-hermes-http/{events.py,main.py}`, `cli/graph-sync.sh`,
`src/cie/sources/graphify.ts`, `graphify-out/{graph.json,.graphify_root}`,
`dashboard/package.json`, `dashboard/vercel.json`, `docs/MASTER.md` index.*
