---
name: bottleneck-analysis
type: custom
status: built from scratch
assigned_agent: flow (Ops & Delivery / Process Design — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Deep-dive on a bottleneck surfaced by process-mapping. Theory-of-constraints discipline: identify · exploit · subordinate · elevate · repeat. Never optimises a non-bottleneck."
triggers:
  - bottleneck analysis
  - why is X slow
  - constraint analysis
  - theory of constraints
  - remove the bottleneck
  - elevate the constraint
---

# Bottleneck Analysis

## Purpose
Goldratt-style theory-of-constraints on a bottleneck surfaced from `process-mapping`. Never optimise anything but the constraint.

## Structure / Protocol
```
1. IDENTIFY   confirm the bottleneck (cycle time + queue depth + variance)
2. EXPLOIT    make constraint work at max — remove waste at THIS step first
3. SUBORDINATE align all other steps to the constraint's pace
4. ELEVATE    invest to increase capacity of the constraint (only if 2+3 exhausted)
5. REPEAT     re-run process-mapping; the constraint has probably moved
```

## Instructions
Never propose optimising step X if step Y is the bottleneck (Goldratt). Local optimisation elsewhere is waste.

Exploit before elevate — most bottlenecks have unclaimed capacity through better sequencing / smaller batch / less rework.

## Output Format
Constraint memo: identify · exploit-plan · subordinate-plan · elevate-plan (with cost estimate for elevate) · re-map schedule.

## Principles
- **Constraint-first, always** (Goldratt).
- **Exploit before elevate.**
- **Local optimisation of non-constraint is waste.**
- **Re-map after change** — constraint moves.
- **Never conflates "slow step" with "bottleneck"** — bottleneck is the throughput-limiting step.

## Fallback
| Failure | Response |
|---|---|
| Ambiguous constraint | Return to `process-mapping`; more data needed |
| Constraint external (supplier / market) | Elevate options limited; surface for `marcus` strategy discussion |

## Boundaries
- `process-mapping` (this agent) — supplies bottleneck.
- `sop-registry` (this agent) — SOP update if process changes.
- `pace` + `capacity` (Ops) — throughput consumers.
- `felix` (F&T) — elevate cost feeds runway.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| bottleneck-analysis | File read (process map) · File write (memo) | — | All steps |
