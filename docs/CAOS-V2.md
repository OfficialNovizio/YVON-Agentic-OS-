---
title: CAOS v2 — the canonical pipeline spec
status: implemented (panel + reducer shipped 2026-08-22); budget gate and ledger not yet built
supersedes: docs/CAOS-V1-DEPRECATED.md
related: dashboard/lib/caos-v2.ts · dashboard/app/chat/CaosPanel.tsx · docs/YVON-CHAT.md
---

# CAOS v2

**Seven steps in three stages.** v1 described twelve phases and ran three; the
evidence is in `docs/CAOS-V1-DEPRECATED.md`. Everything here either has real
data or says plainly that it does not.

## Why three stages

They exist because the cost profiles genuinely differ, and that difference is
the whole mental model:

| Stage | What it is | Cost |
|---|---|---|
| **PREPARE** | link → classify → route → assemble → budget → envelope | local, deterministic, **no model call**. Target <250ms |
| **EXECUTE** | the tool loop | the **only** stage that spends money |
| **SETTLE** | verify → record | durable, milliseconds |

**PREPARE never calls a language model.** That single rule is what makes a
100–500ms CAOS achievable, and it is why `analyzeBuild()`'s mid-turn model call
has to move off the critical path.

## The steps

**1 · LINK** — is this a new frame or a continuation? A continuation inherits
the previous frame wholesale and the agent is **locked**, so follow-ups cannot
be re-routed. This is the fix for the "a random Brand Studio agent answered"
class of bug: every message used to be routed from scratch, so `not working`
matched no keywords and fell to `meta`, while a stray "design" could pull an
infrastructure question into Brand Studio.

**2 · CLASSIFY** — tier (`generic` / `info` / `build`) and relation. Tier sets
the iteration cap: **1 / 4 / 30**. Pure regex, sub-millisecond.

**3 · ROUTE** — scored across agent buckets, highest wins. `routing.ts` returns
`scores: RouteScore[]` so the panel can show *why* — `ops 7 · dana 2 · spark 0`
makes a misroute legible where `→ spark` alone never could.

**4 · ASSEMBLE** — **the only retrieval step.** Every memory the system has is
gathered here: skills, venture memory, repo files, MemPalace drawers, the
venture graph, docs/chunks, conversation history. Gather and choose are
deliberately separate so retrieval never reasons about budgets.

**5 · BUDGET GATE** — a hard per-tier ceiling; candidates fill by priority and
the remainder is **refused**, with the drop list reported. *Not built yet.*

**→ ENVELOPE** — the artifact PREPARE produces: the exact prompt handed to
Hermes. Nothing in v1 ever showed this, which is why "what input did it give
Hermes" had no answer in the UI.

**6 · WORK LOOP** — bounded by the tier cap. Every pass emits `tool.call`,
live since the arity fix of 2026-08-22.

**7a · VERIFY** — claims checked against injected context. *Not built yet*, and
shown as a permanently grey row so the gap is visible rather than hidden.

**7b · RECORD** — the turn ledger row: what was sent, what came back, what it
cost, and the verdict the *next* message sets. This is what makes "not working"
resolve against something concrete instead of relying on a Python process still
being alive. *Not built yet* — `chat_turn_ledger` is Step 2 of the plan.

## Measured baselines (22 Aug 2026)

From `dashboard/_hermes_bench.jsonl`, row `after-meter-fix`:

| | round-trips | est input | per call |
|---|---|---|---|
| info tier, no tools | 1 | 22,406 | 22,406 |
| build tier, 6 tools | 6 | 154,852 | ~25,809 |

**A one-round-trip question with no tools cost 22,406 input tokens.** There is
no loop to blame — that is fixed overhead arriving before CAOS contributes
anything. It reframes the priority: a budget gate that perfectly optimised our
context would still pay it. Growth is ~4k per iteration, and *that* is the part
a budget gate owns.

## Event vocabulary

| Event | Feeds | Status |
|---|---|---|
| `input.analysis` | steps 1–3 | live |
| `skill.disclosure` | step 4 | live |
| `venture.context` | step 4 | live |
| `phase.retrieve` | step 4 | emitted only when retrieval is wired |
| `tool.call` | step 6 | **live since 2026-08-22** |
| `run.completed` / `run.failed` | step 7b | live |
| `usage` on `done` | the cost strip | live |

`usage` carries measured figures — `llmCalls`, `estInputTokens`,
`governorWaitS`, `llmCallsExact`, `firstCallShape`, `poolTurns`. They are named
`est*`/`llm*` deliberately: `tokensReported` still means "the provider told us"
and remains **false**, because the runtime exposes no usage attribute at all
(probe 3: `usage_attr: NOT_IN_SOURCE`).

## The rule that governs the panel

**Never render a measurement you do not have.** A missing figure shows as
*not measured*, never `0` — zero is a claim, absent is the truth. Enforced in
`buildCaosView` by returning `null` rather than defaulting, and asserted in
`tests/caos-v2.test.ts` §1.

## Scope: message vs conversation

**Per message** is one turn and resets each time. **Per conversation** is the
room, where the number that predicts cost is the **recycle countdown** — the
pooled agent recycles at 12 turns or ~240k chars, and every turn before that is
more expensive than the last, because history accumulates.

Conversation *totals* still need the turn ledger: `events` has no `room_id`,
only `context_id` (the workspace slug), so room-level aggregation requires
joining through `chat_messages.correlation`.

## Verification

- `dashboard/tests/caos-v2.test.ts` — 47 assertions on the pure reducer, run
  with `npx tsx`. No browser, no React.
- `dashboard/tests/caos-panel.spec.ts` — the browser gate. **Required**:
  `SESSION-HANDOUT.md` §5.1 records a /chat redesign verified by `tsc` alone and
  rolled back in full, 72 files restored. Type-checking proves shapes compile;
  only opening the page proves it works.
