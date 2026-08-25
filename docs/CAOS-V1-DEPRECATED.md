---
title: CAOS v1 — the twelve-phase pipeline (DEPRECATED)
status: deprecated 2026-08-22 · superseded by docs/CAOS-V2.md
reason: nine of its twelve phases never executed; the panel rendering them was a catalogue, not a record
---

# CAOS v1 — deprecated

**This document is history, not guidance.** For the live design see
`docs/CAOS-V2.md`. It is preserved because the reasoning was sound and the
gap between the design and the runtime is worth being able to point at.

## What it claimed

Twelve phases, sourced from `MASTER.md` §6.2 and rendered by
`dashboard/app/chat/PipelineHud.tsx`:

01 CLASSIFY · 02 SKILL DISCLOSURE · 03 RESOLVE · 04 HYBRID RETRIEVAL ·
05 FORMULA EXECUTION · 06 CONTEXT OPTIMIZER · 07 HARNESS GATES (×5) ·
— CAOS boundary §3 — 08 STRATEGY ROUTING · 09 GENERATION ·
10 POST-HOC VERIFICATION · 11 FEEDBACK LOOP · 12 FIELD MONITORING

## What actually ran

Queried against the `events` table on 2026-08-22, **all time**:

| Phase | Events, all time |
|---|---|
| 01 Classify | 33 |
| 02 Skill disclosure | 33 |
| 03 Resolve | 33 |
| 04–11 | **0** |
| `tool.call` | **0** |

Three of twelve. `tool.call` had never been recorded once in the database's
entire history.

## Why it failed, precisely

**The nine dead phases were never wired.** `caos-phases.ts` was honest about
this — its `decisionFallback` strings read *"not emitted — hermes-agent phase
hooks are probe-gated"*. But the panel rendered all twelve rows regardless, so
nine-twelfths of it was furniture, and the static Reference text outweighed the
live Decision on every row.

**`tool.call` was a different failure and a subtler one.** The callbacks were
bound to the correct attribute names. `main.py` declared
`on_tool_start(name, args_preview)` — two positional arguments — but
hermes-agent invokes the callback with **three** (`tui_gateway/server.py:5335`
registers it as `lambda tc_id, name, args`). Every invocation raised
`TypeError`; `agent/codex_runtime.py:508` caught and logged it to the VPS log,
where nothing surfaced. Tools ran correctly the entire time and not one event
ever reached the dashboard.

The proof was already in the code: `on_thinking` was declared `*_args` —
variadic — and thinking events always arrived. Same binding, same turn, same
object. The only difference was arity.

## What carried over

| v1 | v2 |
|---|---|
| 01 Classify | Step 2, plus a new Step 1 LINK in front |
| 02 Skill disclosure | folded into Step 4 ASSEMBLE |
| 03 Resolve | folded into Step 4 ASSEMBLE |
| 04 Hybrid retrieval | Step 4, rebuilt as a pgvector query |
| 05 Formula execution | **dropped** — no live path, no demand |
| 06 Context optimizer | Step 5 BUDGET GATE — what it was trying to be |
| 07 Harness gates | Step 5 + Step 7a, honestly scoped |
| 08 Strategy routing | Step 5 — tier already decides the budget |
| 09 Generation | Step 6 WORK LOOP, now instrumented |
| 10 Post-hoc verification | Step 7a VERIFY |
| 11 Feedback loop | Step 7b RECORD → eval signal |
| 12 Field monitoring | out of the per-turn panel entirely |

## The lesson worth keeping

A phase that cannot emit an event is a phase you cannot claim ran. v1's
`decisionFallback` text was scrupulously honest in the source and still
produced a UI that implied twelve phases executed — because the *layout* gave
dead rows the same weight as live ones. Honesty in a comment does not survive
contact with a design that renders everything equally.

`dashboard/app/chat/PipelineHud.tsx` and `dashboard/lib/caos-phases.ts` are
left on disk, unimported, so reverting is a one-line change in `page.tsx`.
This is a route that has been rolled back before.
