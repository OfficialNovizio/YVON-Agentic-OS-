---
title: Graph Memory for Live Brands — Structural Sync + MemPalace Phase 2
owner: spec (Product / Product Manager) — drafted via session audit, 2026-08-11
status: v2 — Work item B shipped (code-complete), Work item A blocked on VPS access
discipline: Teams/Product/spec/custom/prd-discipline (7-section house standard)
---

# PRD — Graph Memory for Live Brands (Structural Sync + MemPalace Phase 2)

## 0. ROLLOUT STATUS (2026-08-11)

**Work item B — MemPalace Phase 2 — shipped, code-complete.**

- `dashboard/supabase/migrations/114_mempalace_drawers.sql` applied live against
  `cjjllgexiecesgwenpph` (verified via `information_schema.columns`). RLS enabled, confirmed still
  enabled via a fresh `get_advisors(security)` pass (not in the RLS-disabled list alongside the
  52 pre-existing tables flagged in §2 — that list is unchanged by this rollout, out of scope).
- `dashboard/app/api/chat/stream/route.ts` wired: agent reply insert now captures
  `agentMessageId`; a post-reply block gated on `turnRelation === 'venture' && workspace !==
  'yvon-os'` (identical strictness to RESOLVE's own gate, per acceptance criteria) upserts one
  drawer row per `(source_message_id, role)` into `mempalace_drawers`, `content` verbatim
  (`turnContent`/`replyContent`, never summarized), `wing` = the real venture slug from
  `activeWorkspace()` (`lib/workspaces.ts` — no hardcoded sub-brands). Idempotency comes from the
  migration's own `UNIQUE (source_message_id, role)` constraint plus
  `upsert(..., { onConflict: 'source_message_id,role', ignoreDuplicates: true })` — a retried
  write is a no-op, not a duplicate row.
- `dashboard/app/chat/page.tsx` wired to receive the new `kind: 'mempalace.drawer'` SSE event and
  render it as a RESOLVE-phase HUD line (`wing` + row count).
- `npx tsc --noEmit -p tsconfig.json` — zero errors, full file.
- Verified against acceptance criteria (§6) by direct code trace, not a live triggered turn: the
  venture-relation gate is provably identical to RESOLVE's, the idempotency mechanism is provably
  a DB-level constraint (not app logic that could drift), and `select count(*) from
  mempalace_drawers` is still **0** — confirming no test/spurious rows, but also meaning **the
  "real chat turn produces a real row within 60 seconds" criterion has not been exercised
  live yet**. That requires an authenticated browser session (the route reads
  `supabaseServer()`'s session cookie, not a service-role key, by design — see §7) which this
  sandbox cannot originate. This is the natural next step once you connect and send a real
  venture-scoped message, per your own plan to "check resolve again" together.

**Work item A — graphify nightly cron — still blocked, unchanged.**

No VPS/SSH access from this environment, as flagged in §2/§3 at draft time. Handoff doc is
`system-harness/graph-brain/ci/install-graphify-cron.md` — five documented steps, plus the doc's
own flagged highest-risk check (fresh `agent-alias.json` mtime). Nothing in this rollout changes
that status; it remains entirely on you (or whoever has VPS shell) to execute.

## 1. PROBLEM

Two independent memory/graph systems are documented as serving your brands and sub-brands
(Novizio, yvon-os, and any future tenant) — a structural code graph (graphify) and an
episodic/semantic brand memory (MemPalace, "Wings = brand/client graphs"). Neither one actually
delivers anything to a live brand today. The dashboard, `/brain` graph viewer, and any agent
answering a question about "what happened for Novizio" have zero real data to draw on — not
stale data, no data.

This was surfaced by direct questioning during this session ("how are we managing graph builds,
MemPalace builds when projects are live... how frequently do they build and change") — the honest
answer turned out to be "never," not "infrequently," which is a materially different problem than
what the architecture docs imply.

## 2. EVIDENCE

Direct verification, this session (2026-08-11), against the live Supabase project
`yvon-agentic-os` (`cjjllgexiecesgwenpph`) via the Supabase MCP connection — not opinion, not a
docs re-read:

- `select count(*) from public.venture_agent_memories` → **0**
- `select count(*) from public.venture_documents` → **0**
- `select count(*) from public.agent_memory` → **0**
- `select count(*) from public.agent_session_memory` → **0**
- `select * from storage.objects where bucket_id='graphs' and name='graphify/latest.json'` →
  **zero rows** (the nightly structural-graph upload has never run once)
- `select slug, name, description from public.ventures` → exactly 2 rows: `novizio` (description
  `null`), `yvon-os` (description `''`) — confirms the current real tenant count this PRD scopes
  against
- `public.venture_agents` → 92 rows, but this is access-grant bookkeeping (which agent may touch
  which venture, per `GRAPH-BRAIN-DESIGN.md` §16.3/§23.3), not memory content — cited here only to
  show the isolation *scaffolding* exists even though the *content* doesn't

Documentation corroborates why, honestly, in its own words:

- `docs/MASTER.md` PART 0 §6: "Episodic/semantic memory — MemPalace [Phase 1 built 2026-08-09 —
  Claude Code sessions only, pgvector backend; **Phase 2 (VPS-resident serve) planned, deferred
  until the chat system is live**]" — Phase 1 captures agent development sessions, not your
  product's chat traffic.
- `docs/MASTER.md` PART 0 §6: "Graph memory tiers `[planned]`" — Tier 1 Master / Tier 2 brand /
  Tier 3 tenant pgvector/qdrant namespace isolation has no infrastructure at all yet.
  Deliberately **not** part of this PRD's scope — see §4.
- `system-harness/graph-brain/ci/install-graphify-cron.md`, opening line: "Not installed by this
  session — no SSH/VPS credentials were available... This doc is the handoff: run these steps the
  next time someone has a real shell on the VPS." The nightly sync script
  (`graphify-cron.sh`) already exists and is written to run `OnCalendar=*-*-* 03:30:00` — it has
  simply never been executed against production.

Evidence type: system audit (direct DB/storage verification + source inspection), not user
research. There is no validation-ladder citation here because this isn't a user-demand claim —
it's an infrastructure-completeness gap, evidenced empirically rather than through opinion or
survey data.

## 3. PROPOSED SCOPE

Two work items, sequenced smallest-first, both required to close the gap in §1 for the two
tenants that exist today:

**Work item A — Install the graphify nightly cron (deployment only, zero new code).**
`system-harness/graph-brain/ci/graphify-cron.sh` and its systemd unit/timer already exist and are
already documented step-by-step in `install-graphify-cron.md`. This item is: get VPS shell
access, follow the five documented steps, confirm via the doc's own verification query
(`storage.objects` for `graphify/latest.json`) that it actually ran, and confirm
`/opt/yvon-hermes-http/agent-alias.json` has a fresh mtime (the doc's own flagged
highest-probability silent-failure point).

**Work item B — MemPalace Phase 2: wire live chat turns into wings/rooms/drawers.**
Extend the auto-save hook design (`GRAPH-BRAIN-DESIGN.md` §6) so a real chat turn against a
venture-scoped conversation (`analysis.relation === 'venture'`, the same gate `RESOLVE` already
uses — see `dashboard/lib/context-resolver.ts`) writes a verbatim drawer for that turn into the
venture's wing, using the two ventures that exist today (`novizio`, `yvon-os`) as the initial
wings. Backend per the design doc's own resolved decision: pgvector on the existing Supabase
Postgres, not qdrant, not local/flat-file (ruled out explicitly for isolation reasons).

## 4. OUT-OF-SCOPE

- **Graph memory tiers (Tier 1 Master / Tier 2 brand / Tier 3 tenant, pgvector/qdrant namespace +
  schema-per-tenant isolation)** — not yet. This is a distinct, larger workstream
  (`docs/MASTER.md` tags it `[planned]` separately from MemPalace itself) and needs its own PRD
  once B has real data flowing to design isolation boundaries against. Building tier isolation for
  zero rows of content is premature.
- **Backfilling historical chat as memory** — not ever, unless explicitly requested later. This
  PRD only covers new turns going forward once B ships; retroactively mining the 8 existing
  `chat.general`/`chat.conversation` event rows is a separate, small, explicit decision.
- **Fixing Hermes's own `phase.classify`/`phase.resolve`/`tool.call` event emission** — not yet,
  even though this session also found those are silently not reaching the `events` table (likely
  missing `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` on the VPS wrapper). Related, but a separate
  bug in a separate system (Hermes's wrapper config, not the graph/memory build pipeline) — name
  it here so it isn't silently folded in, but it needs its own fix, not this PRD.
- **The `/brain` graph viewer's node/glow UI** — already built and already correctly wired to read
  from the `events` table live; nothing to change there. This PRD is about there being real rows
  for it to read, not the viewer itself.

## 5. SUCCESS METRIC

No existing versioned metric in `Teams/Product/metric/custom/product-metrics-spec` covers graph/
memory freshness — checked, none found. Per the discipline's own rule ("a PRD inventing its own
metric is a metrics-governance violation"), this is flagged rather than fabricated:

**Proposed candidate, pending metric's sign-off:** `graph_memory_freshness` — for Work item A,
`storage.objects.updated_at` for `graphify/latest.json` age ≤ 24h, measured daily. For Work item
B, `count(venture_agent_memories or equivalent drawer table) WHERE venture_id = <slug> AND
created_at > now() - interval '7 days'` > 0 for every venture with ≥1 venture-relation chat turn
in that window.

Target: `<FILL_IN per PRD>` — needs metric's versioned definition before this PRD can leave draft.

## 6. ACCEPTANCE CRITERIA

**Work item A**
- `select updated_at from storage.objects where bucket_id='graphs' and name='graphify/latest.json'`
  returns a row with `updated_at` within the last 24 hours, verified on two consecutive days
  (proves the timer re-fires, not just a manual one-off run).
- `systemctl list-timers graphify-cron.timer` on the VPS shows an active, enabled timer.
- `journalctl -u graphify-cron.service` shows all five steps (`[1/5]`…`[5/5]`) completing with a
  final `Done.` line, with no errors, for the two most recent runs.

**Work item B**
- Sending a venture-relation message (same detection `pipelines/input-analysis/classify.ts`
  already does) against `novizio` results in a new row in the drawer-equivalent table within 60
  seconds of the turn completing, scoped to `wing = novizio`.
- A general-relation message (`yvon-os`, or any message that fails the venture-relation check)
  produces **no** drawer write — the gate must be as strict as `RESOLVE`'s existing
  `relation === 'venture'` check, not looser.
- Re-running the same test message twice does not duplicate the drawer (idempotent sweep, per
  `GRAPH-BRAIN-DESIGN.md`'s own "mempalace sweep — one verbatim drawer per message, idempotent").
- A follow-up query against the wing (via whatever MemPalace's query interface is once B ships)
  retrieves the drawer content verbatim, not summarized.

## 7. RISKS + ROLLBACK STANCE

- **Work item A risk: silent misconfiguration.** The install doc itself flags a stale
  `agent-alias.json` mtime as "the highest-probability silent failure in the system" — an agent's
  events would stop mapping to graph nodes with no error surfaced anywhere. Mitigation: the
  acceptance criteria above explicitly check this on every verification pass, not just at install
  time.
- **Work item A rollback:** trivial — `systemctl disable --now graphify-cron.timer`. No data
  written by this job is destructive; worst case is stale/absent Storage objects, the exact
  current state.
- **Work item B risk: cost and volume.** Every venture-relation turn now writes to Postgres
  (pgvector). At 2 ventures and current chat volume (32 messages total, per this session's
  count) this is negligible; needs re-evaluation before onboarding real AgentX tenant volume.
- **Work item B risk: isolation false confidence.** Because Tier isolation (§4, out-of-scope) 
  isn't built yet, B's wings live in the same pgvector instance/namespace scheme already used for
  Tier 1/2 per the design doc — acceptable for the two owned brands today, but this PRD's
  acceptance criteria do **not** claim tenant-grade isolation. Do not onboard a paying external
  tenant's data into this system before the Tier-3 schema-per-tenant PRD ships.
- **Work item B rollback:** disable the auto-save hook (single feature flag); existing drawers
  stay in Postgres (append-only, matches the `events` table's own "never UPDATE or DELETE"
  convention) — no data loss on rollback, just no new writes.
