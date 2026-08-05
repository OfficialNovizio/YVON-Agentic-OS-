# YVON Graph & System Architecture

**Merged from and superseding:** `docs/YVON-DASHBOARD-BRIEF.md` and
`docs/YVON-Graph ARCHITECTURE.md`. Both were written without repo access; all of
their content is carried here, reconciled against what is actually built.
**Governs:** the `/brain` graph viewer, its data sources, and the system model
behind them.
**Companion:** `docs/MASTER.md` PART 5 (multi-tenant layers), PART 7 (execution).

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
| Understand *why* the system is shaped this way | **Part II**, §7–§9 |
| Work on execution, concurrency, or memory | **Part II**, §11–§13 |
| Onboard a brand or client | **Part II**, §14 |
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

**Part II — The System**

- [7 · The core principle](#7--the-core-principle)
- [8 · System topology](#8--system-topology)
- [9 · The four layers](#9--the-four-layers)
- [10 · Data architecture](#10--data-architecture)
- [11 · Execution model](#11--execution-model)
- [12 · Concurrency & conflict prevention](#12--concurrency--conflict-prevention)
- [13 · Memory architecture](#13--memory-architecture)
- [14 · Multi-tenancy & isolation](#14--multi-tenancy--isolation)
- [15 · Deployment topology](#15--deployment-topology)
- [16 · Observability & the dashboard](#16--observability--the-dashboard)
- [17 · System failure modes](#17--system-failure-modes)
- [18 · Scaling path](#18--scaling-path)
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
| **Size today** | 7,421 nodes / 15,857 links | 7 depts / 46 agents | **does not exist yet** |
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

### 1.2 Contexts — extending `ventures`

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

`credentials_ref` points into the existing vault (`036_app_secrets_vault.sql`).

**YVON itself becomes a row** — `kind='core'`, `slug='yvon-os'`,
`context_path='yvon-os'` — so one query serves the centre and every satellite.

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

## 2 · Visual model → data mapping

Three levels. Level 1 and 2 are built and deployed; level 3 is specified here and
not yet implemented.

Implementation lives in `dashboard/components/YvonGraph.tsx` (533 lines), rendered
by `dashboard/app/brain/page.tsx`.

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

### 2.3 L3 — satellites *(specification — not yet built)*

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

**Scope switching.** The existing tabs are hardcoded
`[["yvon-os","YVON"],["novizio","Novizio"],["hourbour","Hourbour"],["agentx","AgentX"]]`.
These must be replaced by a fetch of contexts (**Q2**) so a new brand appears
without a deploy. `scope` then feeds `supabaseSource(scope)` and must carry the
**`context_path`**, not the bare slug.

### 2.4 Edge semantics

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

**Gap:** nothing triggers a deploy when only `Teams/**` changes. `.github/` does
not exist in this repo — the CI referenced by both retired documents was never
built. Until a workflow exists, adding an agent requires any push that triggers a
Vercel build.

### 4.3 Contexts — live, no deploy

Brands are Supabase rows. A new brand appears on the next `/brain` load; an
`INSERT` is the entire onboarding step as far as the graph is concerned. This is
why they are not in `structure.json`.

### 4.4 Graphify — VPS cron → Supabase Storage

**Current state is broken for automation.** `graphify-out/.graphify_root` reads
`/sessions/sleepy-jolly-ritchie/mnt/Agents` — a dead sandbox path. The graph was
last built inside an ephemeral environment that no longer exists.

**Decided path:** the Hermes VPS already has a checkout, so it rebuilds:

```
nightly cron on the VPS
  ├─ git pull
  ├─ graphify extract .                    → graphify-out/graph.json
  ├─ node scripts/build-structure.mjs      → refresh agent-alias.json locally
  └─ upload graph.json → Supabase Storage bucket `graphs` as graphify/latest.json
```

Then **remove `dashboard/public/graph-full.json` (9.1 MB) from git.** A binary
blob that large, rewritten nightly, is committed churn and is served from the CDN
on a page most users never open. Storage + a signed URL (**Q9**) replaces it.
`graph-view.json` (17 KB) may stay in `public/` — it is small and useful on load.

**The alias map matters more than the graph here.** `agent-alias.json` is
generated into `vps-scripts/yvon-hermes-http/` at build time and read by Hermes at
`/opt/yvon-hermes-http/agent-alias.json`. If the VPS copy is not refreshed when
agents change, `resolve_actor()` falls back to the bare name and **those nodes stop
lighting**. Regenerating it in the same cron is the fix — it is one line and it
closes the highest-probability silent failure in the system.

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
2026-08-04.

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

### Partial

| Thing | What's missing |
|---|---|
| Scope tabs | Four hardcoded pairs; must come from `ventures` (**Q2**) and pass `context_path` |
| Graphify artifacts | Stale, built from a dead sandbox path; 9.1 MB blob committed |
| `ventures` table | Rich brand identity, but none of the seven graph columns |
| Vercel rebuild on structure change | `prebuild` works; nothing triggers it on `Teams/**` alone |

### Missing

| Thing | Section |
|---|---|
| `venture_agents` grant table | [§1.3](#13-grants--venture_agents), Appendix A |
| Seven `ventures` columns + `context_path` trigger | [§1.2](#12-contexts--extending-ventures), Appendix A |
| YVON as a `kind='core'` row | [§1.2](#12-contexts--extending-ventures) |
| L3 satellite rendering | [§2.3](#23-l3--satellites-specification--not-yet-built) |
| Graphify VPS cron + Storage upload | [§4.4](#44-graphify--vps-cron--supabase-storage) |
| Any `.github/` workflow | [§4.2](#42-structure--build-time) |
| Drift-detector check (**Q7**) in CI | [§6.1](#61-the-two-id-contracts) |

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

*Detection:* **Q7** in CI, plus the existing `resolve_actor()` warning. A drifted
id is invisible in the UI and obvious in these two places — which is exactly why
both must stay.

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
`INSERT`. `venture_agents` must ship with the same policy pair — otherwise a
browser session could grant itself agents.

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

*Why the graph is shaped the way it is. Carried from the retired architecture
document, reconciled against the repo. Read Part I for what exists today; read
this for the model it is growing into.*

---

## 7 · The core principle

YVON is the operating core. It holds one library of agent definitions and
executes them against many separate **contexts**. Everything else follows from a
single decision:

> **Agents are definitions, not deployments. Contexts are data, not processes.**

### 7.1 The rejected model — clone teams per brand

The intuitive model treats agents like staff: deploy a copy of the Brand Studio
team into each brand, another into each client.

```
                    YVON Brand Studio
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   brand-a clone       brand-b clone       platform clone
                                                │
                              ┌─────────────────┼─────────────┐
                              ▼                 ▼             ▼
                        client-01 clone   client-02 clone   ... ×100
```

Why it fails:

- **Drift.** 100+ copies diverge. A prompt fix must propagate through three
  levels; some copies get missed. Behaviour stops being reproducible.
- **Update cost is O(n).** Every agent change becomes a fleet-wide migration.
- **Debugging becomes impossible.** "Why did that agent do that?" now requires
  knowing *which copy* ran and *what version* it was on.
- **Onboarding is O(n).** Client #101 requires provisioning a full agent stack.
- **Storage and compute scale with client count** even when clients are idle.

### 7.2 The adopted model — definition + context

```
        ┌─────────────────────────────────────┐
        │   AGENT DEFINITIONS (one copy)      │
        │   46 agents across 7 departments    │
        │   Teams/<Dept>/<agent>/agent.md     │
        └──────────────────┬──────────────────┘
                           │ executed with
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ctx: novizio      ctx: hourbour     ctx: agentx/<client>
   ─────────────     ─────────────     ─────────────────────
   AWS adapter       Supabase adapter  scoped adapter
   novizio memory    hourbour memory   client memory
   novizio guards    hourbour guards   client guards
```

An **agent** is prompt + skills + tool grants + policies + verification rules. It
is stateless and location-independent.
A **context** is data adapter + memory namespace + guardrails + enabled agent
list + tier + credentials reference.
A **run** is `execute(agent_definition, context, task)`.

**This is why the graph looks the way it does.** One agent node lit toward four
brands at once is not four agents — it is one definition in four concurrent
executions. See [§2.4](#24-edge-semantics).

### 7.3 Consequences

| Property | Result |
|---|---|
| Updating an agent | Edit one file. All contexts inherit on next run. |
| Onboarding a client | One row in `ventures` + grant rows. Deploy nothing. |
| Storage per client | One config + one memory namespace (~KB) |
| Compute per client | Zero when idle |
| Scaling | Add workers, not per-client infrastructure |
| Drift risk | Structurally impossible — there is only one copy |

### 7.4 What lives where

| Artifact | Location | Copies | Changes when |
|---|---|---|---|
| Agent definitions | `Teams/` in this repo | 1 | you improve an agent |
| Context config | Supabase `ventures` | 1/brand | a brand's setup changes |
| Grants | Supabase `venture_agents` | 1/pair | a brand gains or loses an agent |
| Run history | Supabase `events` | append-only | every run |
| Brand operational data | that brand's own store | — | never copied to YVON |

### 7.5 The principle, restated

Every non-obvious decision traces back to one line:

> **Agents are definitions, not deployments. Contexts are data, not processes.**

- No clones → no drift → updates are O(1)
- Contexts are rows → onboarding is O(1) → 100 clients cost ~nothing idle
- Isolation lives below the agent → prompts cannot breach it
- Concurrency comes from workers → scaling is one dimension, not per-client
- One dashboard, scoped → no parity drift

When a future decision is unclear, check it against that line. **If a proposal
requires copying an agent, or spinning up a process per context, it is fighting
the architecture.**

---

## 8 · System topology

### 8.1 Full system map

```
┌───────────────────────────────────────────────────────────────────────┐
│                          HOLDING COMPANY                              │
│                        (legal layer — no runtime)                     │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                                YVON                                   │
│                     AI Operating System (core)                        │
│                                                                       │
│   ┌─────────────────┐  ┌──────────────┐  ┌─────────────────────┐      │
│   │ Agent Registry  │  │ Task Queue   │  │  Worker Pool        │      │
│   │ 7 departments   │  │ + leasing    │  │  N workers ×        │      │
│   │ 46 definitions  │  │ + priority   │  │  M async slots      │      │
│   │      [built]    │  │   [planned]  │  │     [planned]       │      │
│   └─────────────────┘  └──────────────┘  └─────────────────────┘      │
│                                                                       │
│   ┌─────────────────┐  ┌──────────────┐  ┌─────────────────────┐      │
│   │ Context Registry│  │ Event Log    │  │  Memory Writer      │      │
│   │ Supabase        │  │ (append-only)│  │  (serialized/ns)    │      │
│   │    [planned]    │  │    [built]   │  │     [planned]       │      │
│   └─────────────────┘  └──────────────┘  └─────────────────────┘      │
│                                                                       │
│   ┌─────────────────────────────────────────────────────────┐         │
│   │  Model gateway — all model traffic         [planned]    │         │
│   └─────────────────────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────────────────┘
          │                      │                      │
          │ adapter              │ adapter              │ adapter
          ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│     BRAND A      │  │     BRAND B      │  │      PLATFORM            │
│   AWS (RDS/S3)   │  │ Vercel+Supabase  │  │  Supabase (multi-tenant) │
└──────────────────┘  └──────────────────┘  └──────────────────────────┘
                                                        │
                                       ┌────────────────┼────────────────┐
                                       ▼                ▼                ▼
                                  client-001       client-002    ...  client-N
                                  (ctx only)       (ctx only)         (ctx only)
```

**Graph mapping:** the YVON box is the centre orb ([§2.1](#21-l1--yvon-overview)).
Each brand is a satellite ([§2.3](#23-l3--satellites-specification--not-yet-built)).
Clients are sub-orbs attached to their platform parent via `parent_id`.

### 8.2 Why YVON is the centre, not the holding company

The holding company is a legal wrapper. It has no runtime, no data, no agents.
Putting it at the centre would make the diagram legally accurate and
operationally useless. YVON is where execution happens, so YVON is the centre.
Brands orbit it because they *consume* it.

### 8.3 Why clients hang off the platform, not off YVON

Clients are **external tenants**. They must never reach YVON-internal
capability, another client's data, or your own brands' data. Routing them
through the platform context gives **one** enforcement point for tenant
isolation instead of scattering that concern system-wide.

Structurally: YVON trusts the platform. The platform trusts nothing.

This is also why [§1.2](#12-contexts--extending-ventures) caps nesting at one
level — depth beyond that multiplies enforcement points.

---

## 9 · The four layers

```
┌─────────────────────────────────────────────────────────┐
│  L4  INTERFACE      Dashboard · API · Chat · Webhooks   │
├─────────────────────────────────────────────────────────┤
│  L3  ORCHESTRATION  Queue · Workers · Routing · Leasing │
├─────────────────────────────────────────────────────────┤
│  L2  CAPABILITY     Agents · Skills · Tools · Protocols │
├─────────────────────────────────────────────────────────┤
│  L1  DATA           Adapters · Memory · Events · Metrics│
└─────────────────────────────────────────────────────────┘
```

**L1 — Data.** Owns all access to state. Nothing above talks to a database
directly. Contains the per-brand adapters, the memory graph, the event log, the
metrics store.
*Why:* if agents can reach databases directly, tenant isolation becomes a
prompt-engineering problem. It must be a code problem.

**L2 — Capability.** Agent definitions, skills taxonomy, tool grants,
verification protocols. Pure logic — no state, no credentials, no knowledge of
where it runs.
*Why:* statelessness is what makes one definition usable across 100 contexts.

**L3 — Orchestration.** Decides *what runs, when, for whom, with what limits.*
Task queue, leasing, priority lanes, concurrency caps, worker pool.
*Why:* this is the only layer that sees total system load, so fairness and rate
limiting belong here and nowhere else.

**L4 — Interface.** Dashboard, API, chat, inbound webhooks. Presentation and
entry only — no business logic.
*Why:* every dashboard scope shares one codebase because they are views over the
same L3/L1 data.

**Where the graph sits:** the viewer is L4. `structure.json` is L2 metadata.
`events` and `ventures` are L1. The graph never touches L3.

---

## 10 · Data architecture

### 10.1 The federation decision

**Rejected: central warehouse** — syncing every brand's data into a YVON master
database. Rejected because it means three sync pipelines to maintain, three
schema-drift surfaces, permanent staleness questions, and full cost paid for
data that never joins. One brand's inventory and another's transaction ledger
share no query.

**Adopted: federate by read-latency need.**

| Data class | Pattern | Lives in | Copied to YVON? |
|---|---|---|---|
| Operational reads | live query via adapter | the brand's own store | No |
| Cross-brand metrics | push on change | YVON metrics store | Yes (small) |
| Agent memory | native | memory graph | N/A — YVON-owned |
| Events | push | YVON event log | Yes (append-only) |

Only metrics and events are copied. Both are small, both additive, neither
requires schema agreement with the source.

**This is why the graph's card metrics are derived from `events`**
([§1.6](#16-derived--never-stored)) rather than queried live from each brand —
the graph must render without reaching into five different clouds.

### 10.2 Adapter pattern `[planned]`

```
        Agent code
             │
             │  brand.get_inventory(sku="…")
             ▼
   ┌─────────────────────┐
   │   <brand>-mcp       │   ← uniform semantic interface
   ├─────────────────────┤
   │ translates to:      │
   │  AWS RDS query      │   ← implementation detail
   └─────────────────────┘
             │
             ▼
        AWS RDS / S3
```

Agents never learn which cloud a brand runs on. They call a semantic method.

*Why this matters:* if a brand migrates from AWS to Supabase next year, you
rewrite one adapter and zero agent definitions. Without the indirection, that
migration touches every agent that ever read that brand's data.

One adapter per brand; the multi-tenant platform adapter **requires a client
scope at construction** — see [§14.1](#141-the-hard-boundary).

### 10.3 Sync direction: push, never poll

```
Brand A (AWS)       ──webhook──┐
                               │
Brand B (Supabase)  ──webhook──┼──▶  YVON /ingest  ──▶ event log
                               │                          │
Platform (Supabase) ──webhook──┘                          ├──▶ metrics ──▶ dashboard
                                                          └──▶ task triggers
```

*Why push:* polling three systems on a timer means constant load for
mostly-nothing, adds latency equal to the poll interval, and still needs an
event log for the dashboard. Push gives you the log for free.

Per platform: Supabase → Database Webhooks or Realtime. AWS → EventBridge rule
or Lambda-on-change → HTTP POST.

**Already true for run events** ([§1.4](#14-events--already-shipped)): Hermes
pushes to the log, the browser subscribes to Realtime. Nothing polls.

### 10.4 Event log

The retired document specified this table; it is now **shipped** as
`052_events.sql`. Full detail in [§1.4](#14-events--already-shipped).

One change from the original spec: `source` values are
`'hermes' | 'claude-code' | 'yvon'` — the runtimes that execute an agent —
rather than brand names. Brand identity lives in `context_id`, so encoding it
twice would allow the two to disagree.

---

## 11 · Execution model

### 11.1 Two paths, chosen by who is waiting

```
                    ┌──────────────────┐
   Request arrives  │  Is a human      │
   ────────────────▶│  waiting on      │
                    │  this right now? │
                    └────────┬─────────┘
             ┌───────────────┴───────────────┐
            YES                              NO
             ▼                                ▼
   ┌───────────────────┐          ┌────────────────────┐
   │  INLINE PATH      │          │  QUEUED PATH       │
   │  run immediately  │          │  enqueue + NOTIFY  │
   │  stream result    │          │  worker claims     │
   │  latency: ~0      │          │  latency: ~ms      │
   └───────────────────┘          └────────────────────┘
```

*Why split:* most "the queue is too slow" complaints are actually "interactive
work shouldn't be queued." Removing the queue loses fairness, retries and
durability. Bypassing it for interactive work keeps both.

**Today** `[partial]`: the inline path exists — Hermes runs a turn and emits
`run.started` / `run.completed`. The queued path is `[planned]`.

### 11.2 Queues are not serial

Worth stating plainly: **a queue with 20 workers runs 20 tasks at the same
instant.** The queue is a shared buffer, not a line. Concurrency comes from
worker count × async slots, not from removing the queue.

### 11.3 Worker anatomy `[planned]`

```
┌──────────────────────────────────────────────────────┐
│  WORKER PROCESS            max_inflight = 15         │
│                                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                  │
│  │run │ │run │ │run │ │idle│ │idle│                  │
│  │ctx:│ │ctx:│ │ctx:│ │    │ │    │                  │
│  │ a  │ │ b  │ │ c  │ │    │ │    │                  │
│  └────┘ └────┘ └────┘ └────┘ └────┘                  │
│                                                      │
│  loop:                                               │
│    wait for NOTIFY or free slot                      │
│    claim task (atomic lease)                         │
│    load context + adapter + memory ns                │
│    load agent definition                             │
│    execute (async, I/O-bound)                        │
│    write results, emit events, release lease         │
└──────────────────────────────────────────────────────┘
```

*Why async slots rather than one task per worker:* agent runs are I/O-bound —
most wall-clock time waits on model responses, not CPU. One process holds 15–20
concurrent runs at negligible cost. 20 workers × 15 slots = 300 simultaneous
runs from modest hardware.

### 11.4 Dispatch latency

Never poll. Push wakeup: Postgres `LISTEN/NOTIFY`, Redis `BLPOP`, or Supabase
Realtime (already in the stack). Reduces dispatch from seconds to milliseconds.

### 11.5 Fan-out within a task

When one logical task needs independent sub-work, run it concurrently inside a
single worker rather than enqueuing children and waiting:

```python
results = await asyncio.gather(
    run_agent("brand-studio-lena", ctx, subtask_a),
    run_agent("product-metric",    ctx, subtask_b),
    run_agent("engineering-raj",   ctx, subtask_c),
)
```

*Why:* avoids queue round-trips for work known-parallel at dispatch time, and
keeps one `correlation` id across all three — which is what makes
[Q8](#q8--trace-one-workflow-across-agents) able to reconstruct the workflow.

### 11.6 Load math — 100 clients is not 100 concurrent runs

```
100 clients × ~8 agent runs/day   =  800 runs/day
800 runs × ~60s average           =  ~13.3 compute-hours/day
13.3 hours ÷ 24 hours             =  ~0.55 average concurrency
```

Even with 20× peak clustering during business hours, peak concurrency lands
around 10–30 — well inside a single worker process.

**The real ceiling is provider rate limits, not architecture.** Which is why all
model traffic should route through one gateway: the single place to enforce
backoff, budgets and failover.

---

## 12 · Concurrency & conflict prevention

Four layers, in order of importance. Layer 1 does most of the work; the rest
catch what leaks through. **All four are `[planned]`.**

### 12.1 Layer 1 — single-writer ownership *(most important)*

For every resource type, **exactly one agent may write it.** Any number may read.

```
Resource                     Writer                Readers
──────────────────────────────────────────────────────────────────
<brand>.inventory            inventory owner       marketing, ops, finance
<brand>.product_copy         content owner         marketing, design
<brand>.user_segments        analytics owner       marketing, growth
<platform>.client_report     reporting owner       all client-facing agents
graph.entities               memory-writer         all agents
```

*Why this dominates:* most conflicts are not race conditions — they are design
errors where two agents were both given authority over the same thing. **No
locking scheme repairs bad ownership boundaries.**

*Diagnostic rule:* if two agents genuinely need to write the same resource, that
is strong evidence they should be one agent, or the resource should be split.

### 12.2 Layer 2 — task leasing

Prevents two workers executing the same task.

```sql
UPDATE tasks
SET    status     = 'claimed',
       worker_id  = $1,
       claimed_at = now(),
       expires_at = now() + interval '5 minutes'
WHERE  id = $2
  AND  status = 'pending'
RETURNING *;
```

Atomic. Empty result means another worker won the race — move on, no error.

**Lease expiry handles crashes.** A worker that dies mid-task leaves an expired
lease; a sweeper returns it to `pending`. Without expiry a crash strands the
task forever.

```
┌─────────┐  claim   ┌─────────┐  complete  ┌───────────┐
│ pending │─────────▶│ claimed │───────────▶│ completed │
└─────────┘          └─────────┘            └───────────┘
     ▲                    │
     │   lease expired    │
     └────────────────────┘
```

### 12.3 Layer 3 — optimistic concurrency

For legitimate sequential writes to the same row by the same owner:

```sql
UPDATE products
SET    price = $1, version = version + 1
WHERE  id = $2 AND version = $3;
-- 0 rows affected → someone else wrote first → re-read and retry
```

Prevents lost updates, holds no locks. **This is the same reasoning that made
`events` append-only** — see [§6.3](#63-append-only-means-append-only).

### 12.4 Layer 4 — per-context concurrency caps

```yaml
limits:
  max_concurrent_per_context: 3
  max_concurrent_per_tier:
    internal:   unlimited
    enterprise: 8
    pro:        3
    free:       1
```

A worker skips a task if that context is at cap. Eliminates noisy-neighbour
structurally rather than by monitoring and reacting. Backed by `ventures.tier`
([§1.2](#12-contexts--extending-ventures)).

### 12.5 Priority lanes

```
priority 0  ·  internal      (YVON and your own brands)
priority 1  ·  enterprise
priority 2  ·  pro
priority 3  ·  free
```

*Why:* your own brands' work must never queue behind a client's bulk batch.
Workers drain lower numbers first, with a small anti-starvation allowance so the
free tier still progresses.

### 12.6 Cross-brand writes: saga, not transaction

Do **not** attempt distributed transactions across heterogeneous clouds.

```
Step 1: write to brand B     ──▶ success
Step 2: write to platform    ──▶ FAILS
Step 3: compensating action  ──▶ undo step 1
```

*Why:* two-phase commit across different cloud platforms is enormous complexity
for a case that will occur rarely at this scale. Sagas are simpler, observable
in the event log, and adequate.

---

## 13 · Memory architecture

### 13.1 One graph per corpus, namespaced

```
memory graph
  ├─ yvon/                    ← internal ops knowledge
  ├─ <brand-a>/               ← brand memory
  ├─ <brand-b>/               ← brand memory
  ├─ <platform>/
  │    ├─ _platform/          ← the platform's own knowledge
  │    ├─ <client-01>/        ← client-isolated
  │    └─ ... ×N
```

*Why namespaces rather than a graph per agent:* agents within a context need
shared knowledge. Per-agent graphs fragment that and force expensive cross-graph
joins. Per-context namespaces give sharing where it helps and isolation where it
matters.

**Partly built:** `venture_agent_memories` already namespaces by
`(venture_slug, agent_id)`, and `store/agent-memory/` exists.

### 13.2 The write bottleneck — and why it exists

Concurrent graph writes are the one place true parallelism causes damage: two
agents create the same entity under slightly different names → duplicate nodes →
poisoned retrieval for every downstream agent.

**Mitigation: propose/apply split.** `[planned]`

```
Agent ──proposes──▶ mutation queue ──▶ memory-writer ──▶ memory graph
                                       (one per namespace)
                                       ├─ entity resolution
                                       ├─ canonical key lookup
                                       └─ serialized apply
```

Agents never write the graph directly. They emit proposed mutations; a dedicated
writer per namespace applies them serially, running entity resolution first.

*Why accept the serialization:* parallel across namespaces preserves system
throughput. Within one namespace, serial writes are cheap and the correctness
gain is large. **A corrupted memory graph degrades every agent that reads it —
the highest blast radius in the system.**

### 13.3 Machine view vs human view

The retrieval graph is the machine view: dense, flat, retrieval-optimised, never
read directly. A human knowledge base (Obsidian or similar) is the human view:
hub notes, curated links, legible.

Do not make one serve both. The failure mode of merging them is a graph that is
neither queryable nor legible.

**Note the third graph:** Graphify ([§1.5](#15-graphify--adjacent-not-part-of-this-graph))
is neither of these — it maps *code*, not knowledge. Three graphs, three jobs.

---

## 14 · Multi-tenancy & isolation

### 14.1 The hard boundary

Client data isolation is the single most consequential guarantee in the system.
A cross-tenant leak is an existential event for a SaaS business.

**Enforcement principle: isolation is enforced *below* the agent, in code, where
a prompt cannot reach it.**

```
        Agent (untrusted — prompt-injectable)
                    │
                    │ calls tool
                    ▼
   ┌────────────────────────────────────┐
   │  platform-mcp(client_id="<client>")│  ← scope bound at construction
   ├────────────────────────────────────┤
   │  every query gains:                │
   │    WHERE client_id = '<client>'    │
   │  no method accepts a client_id arg │
   └────────────────────────────────────┘
                    │
                    ▼
             Supabase + RLS         ← second layer, defence in depth
```

*Why not trust the agent:* an agent's behaviour is shaped by text, and text can
be adversarial. If the agent is *capable* of requesting another tenant's data,
some prompt eventually will. **Remove the capability rather than instructing
against its use.**

Two deliberately redundant layers: adapter scoping (application) and Postgres
RLS (database). Either alone suffices in theory; both together survive one being
wrong. The `events` and `venture_agents` RLS policies
([§6.5](#65-key-separation)) are the second layer, already in place.

### 14.2 Context definition

The retired document specified a client context as a YAML file:

```yaml
# illustrative — the retired file-based shape
context_id:       <platform>/<client>
tier:             pro
priority:         2
enabled_agents:   [brand-studio-lena, brand-studio-pulse, product-metric]
agent_versions:   { brand-studio-lena: v2.1 }
data_adapter:     { type: platform_mcp, scope: <client> }
memory_namespace: graph/<platform>/<client>
guardrails:       [ _shared/client-guardrails.yaml, <client>/brand-voice.yaml ]
limits:           { max_concurrent: 3, monthly_token_cap: 2_000_000 }
```

**This is now Supabase rows, not files** — decided in
[§1.2](#12-contexts--extending-ventures). The mapping:

| YAML field | Now |
|---|---|
| `context_id` | `ventures.context_path` |
| `tier`, `priority` | `ventures.tier` |
| `enabled_agents` | `venture_agents` rows |
| `agent_versions` | `venture_agents.config` |
| `data_adapter` | `ventures.deployment_config` + `credentials_ref` |
| `memory_namespace` | `venture_agent_memories.venture_slug` |
| `guardrails` | `ventures.guardrails` JSONB |
| `limits` | `ventures.guardrails` JSONB |

*Why rows beat files here:* onboarding a client cannot require a git push and a
Vercel deploy. Agent definitions stay in git because they belong under review;
client config does not. See [§0.2](#02-source-transport-cadence).

Onboarding client #101 is one INSERT plus grant rows. Nothing is deployed,
cloned, or provisioned.

### 14.3 Tiers as agent lists

A client's "team" is a list. Upgrading a client is editing that list.

```yaml
tiers:
  brand_only:   [brand-studio-lena, brand-studio-pulse, brand-studio-rio]
  product_only: [product-spec, product-metric]
  full_agentic: [ … ]
```

Expanded into `venture_agents` rows at write time
([§1.3](#13-grants--venture_agents)) so the read path stays flat and auditable.

**This is exactly what the satellite ring renders** — a brand's ring *is* its
tier, made visible ([§2.3](#23-l3--satellites-specification--not-yet-built)).

---

## 15 · Deployment topology

```
┌───────────────────────────────────────────────────────────────┐
│  ALWAYS-ON RUNTIME    (VPS — Hermes today)                    │
│                                                               │
│   hermes-http          memory-writers      scheduler          │
│   [built]              [planned]           [planned]          │
│                                                               │
│   ⚠ NOT Vercel — serverless timeouts kill long agent runs     │
└───────────────────────────────────────────────────────────────┘
              │                    │                   │
              ▼                    ▼                   ▼
┌──────────────────┐   ┌────────────────────┐  ┌───────────────┐
│  Supabase        │   │   Memory graph     │  │ Model gateway │
│  events · tasks  │   │  (namespaced)      │  │  all models   │
│  ventures · …    │   │                    │  │   [planned]   │
└──────────────────┘   └────────────────────┘  └───────────────┘

┌───────────────────────────────────────────────────────────────┐
│  VERCEL         dashboard (scoped) · API · webhook ingest     │
│                 ⚠ web surface only — no agent execution       │
└───────────────────────────────────────────────────────────────┘
```

### 15.1 Why the runtime is not on Vercel

Vercel functions have execution time limits. Agent runs — particularly
multi-step ones with verification passes — routinely exceed them. Long-lived
worker processes with async slot pools also need persistent memory between
tasks, which serverless does not provide.

Vercel is correct for the dashboard, the API surface, and webhook ingest. It is
incorrect for the agent runtime. Operational consequences in
[§4.5](#45-what-must-never-run-on-vercel).

### 15.2 Why all model traffic should route through one gateway `[planned]`

Single choke point for rate-limit handling and backoff, per-context token
budgets and cost attribution, provider failover, model routing by task class,
and unified spend observability.

Without it, rate limiting and cost control must be reimplemented in every agent.

### 15.3 Repository structure

The org chart is the directory tree; there is no separate `agents/` registry.

```
Agents/
├── Teams/<Department>/<agent>/     # L2 — definitions, one copy each
│   ├── agent.md · agent.toon
│   ├── identity/ logical/ operational/ custom/
├── Teams/Shared OS/                # cross-agent skills + logic scripts
├── dashboard/                      # L4 — Next.js, Vercel
│   ├── app/brain/                  #      the graph viewer
│   ├── components/YvonGraph.tsx
│   ├── lib/events/                 #      the live-activity seam
│   └── supabase/migrations/
├── vps-scripts/yvon-hermes-http/   # L3 — the always-on runtime
├── src/ · cli/ · rag/              # CIE, fleet CLI, retrieval pipeline
├── scripts/build-structure.mjs     # org tree → structure.json
├── store/                          # tasks, memory, telemetry
└── docs/
```

*Why one repo:* agent definitions and the runtime that executes them change
together. Splitting them creates version skew between a definition and its
executor.

> The retired document described a different tree (`agents/`, `contexts/`,
> `adapters/`, `runtime/`, `db/`). **None of those directories exist.** See
> Appendix D.

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

Graph-specific failure modes are in [§6.7](#67-failure-modes). These are the
system-wide ones.

| # | Failure | Cause | Mitigation | Blast radius |
|---|---|---|---|---|
| 1 | Cross-tenant data leak | agent given unscoped adapter | scope bound at construction + RLS | **Existential** |
| 2 | Memory graph corruption | concurrent unresolved entity writes | propose/apply queue, entity resolution | **Very high** — degrades all agents |
| 3 | Duplicate task execution | two workers claim same task | atomic conditional claim | Medium — wasted spend |
| 4 | Stranded task | worker crashed mid-run | lease expiry + sweeper | Low |
| 5 | Noisy-neighbour starvation | one context floods the queue | per-context concurrency cap | Medium |
| 6 | Internal work starved | client bulk job ahead in queue | priority lanes, internal = 0 | Medium |
| 7 | Runaway spend | agent loop, no budget | per-context token cap at gateway | High — financial |
| 8 | Rate-limit cascade | all workers retry simultaneously | backoff + jitter at gateway | Medium |
| 9 | Agent regression across all brands | unreviewed definition change | version pinning + staged rollout | High |
| 10 | Adapter schema drift | brand DB changed, adapter didn't | contract tests in CI per adapter | Medium |
| 11 | Lost update | two sequential writes, same row | optimistic version check | Low |
| 12 | Partial cross-brand write | saga step 2 failed | compensating action + event log | Medium |
| 13 | Timeout on long run | runtime on serverless | runtime on always-on host | High |
| 14 | Dashboard shows stale state | polling instead of events | event-driven feed | Low |

**#11 is why `events` is append-only** — a mutable `runs` table with sequential
status writes is failure #11 by construction. See
[Appendix B](#appendix-b--retired-decisions).

### 17.1 Staged rollout — mitigating #9

```
edit definition ──▶ verification protocol ──▶ merge
                                                │
                    ┌───────────────────────────┤
                    ▼                           │
              Brand A (ring 1)                  │  observe 24h
                    ▼                           │
           Brand B + YVON (ring 2)              │  observe 24h
                    ▼                           │
         Enterprise clients (ring 3)            │  observe 48h
                    ▼                           ▼
              All clients (ring 4)
```

Brands function as deployment rings. **Your own brands absorb regression risk
before clients ever see a change** — the correct ordering of risk, since you can
forgive yourself and a client cannot.

`ventures.kind` (`core` / `venture` / `client`) is what makes ring membership
queryable.

---

## 18 · Scaling path

| Clients | Workers | Processes | Notes |
|---|---|---|---|
| 1–20 | 5–10 | 1 | single box — current state |
| 20–100 | 20–40 | 2–3 | add memory-writer separation |
| 100–500 | 60–120 | 4–8 | shard workers by tier |
| 500+ | 150+ | sharded | dedicated enterprise capacity, second queue |

**Scales with client count:** one row, one memory namespace. Negligible.
**Scales with load:** worker count. Add processes.
**Does not scale by adding workers:** provider rate limits, and graph write
throughput per namespace. These are the genuine ceilings — addressed at the
gateway ([§15.2](#152-why-all-model-traffic-should-route-through-one-gateway-planned))
and the memory-writer ([§13.2](#132-the-write-bottleneck--and-why-it-exists))
respectively.

**Graph consequence:** at 500+ contexts the satellite view cannot render every
client as an orb. The `parent_id` sub-orb model
([§2.3](#23-l3--satellites-specification--not-yet-built)) plus
department-level collapse is what keeps it legible.

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

**Phase 2 — The context graph** *(this document's immediate work)*

5. **`054_context_graph.sql`** — the seven `ventures` columns + `venture_agents`
   ([Appendix A](#appendix-a--copy-paste-sql))
6. **Scope tabs from `ventures`** ([Q2](#q2--contexts-for-the-scope-switcher-and-satellites-l3))
7. **L3 satellite rendering** ([§2.3](#23-l3--satellites-specification--not-yet-built))
8. **Graphify VPS cron** ([§4.4](#44-graphify--vps-cron--supabase-storage))

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

Proposed as `dashboard/supabase/migrations/054_context_graph.sql`.
**Not yet applied** — review before running.

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
| `docs/YVON-Graph ARCHITECTURE.md` | Deleted. Full content carried into Part II — see the section map below. |
| `docs/YvonGraph.tsx` | Migrated into `dashboard/components/YvonGraph.tsx`. |

**Section map — retired architecture doc → this document**

| Was | Now |
|---|---|
| §1 Executive summary | §7 |
| §2 Core principle (rejected/adopted model, what lives where) | §7.1–§7.4 |
| §3 System topology | §8 |
| §4 The four layers | §9 |
| §5 Data architecture (federation, adapters, push, event log) | §10 |
| §6 Execution model | §11 |
| §7 Concurrency & conflict prevention | §12 |
| §8 Memory architecture | §13 |
| §9 Multi-tenancy & isolation | §14 |
| §10 Deployment topology | §15 |
| §11 Repository structure | §15.3 + Appendix D |
| §12 Observability & the dashboard | §16, cross-referenced from Part I §2 |
| §13 Failure modes | §17 |
| §14 Scaling path | §18 |
| §15 Build sequence | §19 |
| Appendix A Vocabulary | Appendix C |
| Appendix B The principle restated | §7.5 |

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
| Contexts are YAML files under `contexts/` | Decided as Supabase rows (§14.2). No `contexts/` directory exists |
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
