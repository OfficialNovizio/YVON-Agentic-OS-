# ADR-001: Episodic/semantic memory backend — MemPalace, staged install (replaces turbovec)

**Status:** accepted · **Date:** 2026-08-09 · **Deciders:** operator + dev (leader), dana (data
domain) · **Supersedes:** — (first ADR in this ledger)

## Context

`graph-brain/GRAPH-BRAIN-DESIGN.md` scopes a two-engine graph-brain: **graphify** (deterministic structural
graph — built, real, verified) and an **episodic/semantic engine** for conversational/business
memory (wings=brands/clients, rooms=depts, drawers=verbatim content, temporal KG with
invalidate/timeline). Before today, the episodic slot named **turbovec** (VPS venv, MIT, fuzzy
vector recall via TurboQuant) — installed on the VPS (`/opt/yvon-tools/venvs/turbovec`,
confirmed present) but **never actually called by any pipeline code**: a full repo audit today
(`grep -ri "turbovec"` across `.py/.ts/.js`) found zero imports/calls anywhere in `src/` or
`rag/` — it was a registered, installed, but unwired dependency.

Separately, `docs/MASTER.md` §6.2/§6.3 (the canonical CAOS pipeline) treats an episodic memory
engine called "MemPalace" as if it were a live pipeline stage (episodic RETRIEVE pulls,
agent-diary writes, temporal-KG invalidation feeding Gate 3) — but a repo-wide audit found **zero
MemPalace code anywhere**, contradicting the "canonical pipeline `[built]`" framing. This was the
single largest built-vs-documented gap found in today's pipeline audit.

Constraints already fixed by prior decisions this session (not reopened here):
- **Nothing local** — episodic storage must live in a real DB, never a local/flat-file index
  (operator decision 2026-08-09, Issue 3).
- **Tiered isolation** — Tier 1/2 (Master + owned brands) share one pgvector/qdrant instance,
  namespace-isolated; Tier 3 (client/tenant) gets schema-per-tenant in the same Postgres instance
  (Issue 6).
- **belongs_to / last_worked_by auto-stamp** — any node an agent produces or last touches is
  tagged at write time (Issue 3).

## Options considered

1. **Keep turbovec, wire it in.** It's already installed on the VPS. Cons: no server mode, no
   native namespace isolation (isolation was "search-time allowlist," not a DB-native boundary —
   weaker than the Tier 3 schema-per-tenant requirement already decided), no temporal KG, no MCP
   surface, would need custom code written from scratch to actually integrate it into CLASSIFY/
   RETRIEVE — effectively a full build either way, on a narrower feature set.
2. **Build a custom episodic store from scratch**, per the worker-pool/leasing pattern
   `graph-brain/GRAPH-BRAIN-DESIGN.md` §20–21 already scoped for a related problem. Cons: multi-week build,
   duplicates work an actively-maintained open-source project already does, no independent
   benchmark to validate against.
3. **Adopt MemPalace** (github.com/MemPalace/mempalace, MIT, 58k★, PyPI `mempalace`, v3.6.0 at
   evaluation). Wings/rooms/drawers and a temporal entity-relationship graph
   (add/query/invalidate/timeline) are native, first-class concepts — not something to build on
   top, matching `graph-brain/GRAPH-BRAIN-DESIGN.md`'s existing vocabulary almost exactly. Pluggable backend
   contract with `pgvector` as a first-class option (`mempalace[pgvector]`, via `psycopg`), one
   table per `namespace + palace + collection` — a direct match for the already-decided tiered
   isolation model. Independently benchmarked (96.6% R@5 raw on LongMemEval, no LLM/API key
   required for the core path). Ships a 44-tool MCP server and a `serve` mode for shared
   multi-client access. Verified by installing it in a sandbox this session: installs cleanly,
   CLI works, `pgvector` extra resolves.

## Decision

**Option 3 — adopt MemPalace**, staged in two phases rather than installed all at once:

- **Phase 1 (now, built 2026-08-09).** Claude Code sessions only. No resident service, no VPS
  install. Each session installs its own ephemeral copy (`pip install mempalace[pgvector]`),
  backend `pgvector` pointed at the existing Supabase Postgres project (`cjjllgexiecesgwenpph`;
  `vector` extension enabled this session via migration `enable_pgvector_extension`). Reasoning:
  the only current consumer of episodic memory is agent dev work done through Claude Code, whose
  sandbox is wiped between sessions anyway — a resident service has no consumer to justify it yet.
- **Phase 2 (planned, not installed).** VPS-resident `mempalace serve` — a single shared palace
  reachable by the dashboard backend, Hermes, and any Claude Code session over HTTP MCP. Deferred
  until `MASTER-PLAN.md` P9 (the chat system is actually live and has concurrent multi-consumer
  need) — building the service before there's a real consumer would be premature infrastructure.
  Scaffold only, for now: `vps-scripts/mempalace-serve-install.md`.

turbovec is **removed**, not deprecated-in-place: uninstalled from `vps-scripts/install-tools.sh`
(no longer provisioned on future VPS rebuilds), removed from `shared-tool-registry.md`. The
existing VPS venv may still physically exist until ops tears it down — harmless, since nothing
calls it.

## Consequences

- **Positive:** episodic memory finally has a real, installed, independently-benchmarked
  implementation instead of a documented-but-nonexistent pipeline stage; the wing/room/drawer +
  temporal-KG vocabulary in `graph-brain/GRAPH-BRAIN-DESIGN.md` now maps onto real code instead of prose;
  isolation model (namespace-per-wing) is DB-native, satisfying the Tier 3 requirement turbovec
  couldn't; zero cost until Phase 2 is actually needed.
- **Negative / costs:** Phase 1 re-installs per Claude Code session (~10s, minor); Phase 2 (the
  actual pipeline wiring — CLASSIFY/RETRIEVE calling MemPalace, not just having it installed) is
  still fully ahead of us, tracked at `MASTER-PLAN.md` P9; pgvector now carries the episodic
  vector load on the shared Supabase Postgres instance rather than a dedicated store — accepted
  as part of Issue 6's already-made tiered-isolation call, not reopened here.
- **Follow-ups:** `MASTER.md` §6.2/§6.3's canonical-pipeline claims about MemPalace need a status
  correction (done, same edit as this ADR) so the doc stops implying it's wired into CLASSIFY/
  RETRIEVE today — installation and pipeline-wiring are two different milestones, and only the
  first is done. Phase 2 build is a `MASTER-PLAN.md` P9 item, not implied-done by this ADR.

## Domain review

Reviewed in this session by the operator directly, with dev (leader) and dana (data domain)
reasoning applied per their configs — not a separate live dana agent invocation. Flagged
per rule 0.6: domain judgment, not formula-verified. No dissent recorded.

## Charter check

No Security Charter rail touched. The Supabase migration (`CREATE EXTENSION IF NOT EXISTS
vector`) is additive and reversible, not a destructive DB op (Rail 3 concern is
create/update/delete/migrate of *data*; this is a schema-level extension enable with no data
impact). No new external egress — the Supabase project was already an approved, connected
resource. Phase 2's VPS install is explicitly deferred, so no new agent write-path is introduced
by this ADR; when Phase 2 is built, it goes through the same review this ADR itself went through,
plus quinn's gate.
