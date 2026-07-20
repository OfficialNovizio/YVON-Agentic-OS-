---
name: delivery-governance
type: custom
status: built 2026-07-08; redesigned 2026-07-09 (Fable pass — Rail 1 execution-plan artifact defined; dev's law layer now specifies the document quinn freezes and hashes)
based_on_catalog_entry: none — new; consolidates the "definition of done / merge criteria / branching discipline" that the catalog left implicit
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — searched "definition of done," "delivery governance"; nothing fit, kept custom
assigned_agent: dev (Engineering / Lead Developer)
portable: true — the governance shape is stack-agnostic; specifics reference the stack-profile
includes: assets/definition-of-done.md · assets/execution-plan-template.md
date_added: 2026-07-08
---

## Introduction

delivery-governance defines what "done" and "mergeable" actually mean here — the definition of done, the branching/merge discipline, the tech-debt register, and the **execution-plan artifact** (the document Rail 1's plan-lock operates on) — so that "finished" is a checkable state, not an agent's optimistic claim. It is the process backbone the whole safety spine hangs on: a change is not done until it has passed review, quinn's gate, aegis (if risky), and shipped rollback-first via ops.

## Purpose

The operator's core fear — things breaking — is often a "done" that wasn't. An agent says "feature complete," and the app is full of mock data and half-built flows (the exact problem Reticle exists to catch). A written, enforced definition of done makes "complete" mean complete: reviewed, tested, gated, secured, shipped safely, documented.

## When to Use

Triggers: "is this done," "can we merge," "definition of done," "log this tech debt," "what's our branching model," or as the closing check on any change.

## Structure / Protocol

```
A change claims "done"
  -> Run the Definition of Done (assets/definition-of-done.md): review ✓ · tests ✓ · quinn's gate ✓
     · aegis (if risky) ✓ · charter-clean ✓ · docs/ADR ✓ · ops-shippable (rollback ready) ✓
    -> Any unchecked box → NOT DONE, named
      -> Merge discipline: the branching/merge rules from the stack-profile
        -> Known-but-unfixed issues → the tech-debt register (not silently shipped)
```

## Instructions

1. **Definition of Done is a gate, not a vibe.** Every box in `assets/definition-of-done.md` is checkable; "done" requires all of them. A claim of done with unchecked boxes is returned with the specific gaps.
2. **Branching/merge discipline** per the stack-profile (trunk-based, PR-based, whatever the business runs) — enforced consistently so history stays clean and revertable.
3. **Tech-debt register.** Anything knowingly shipped incomplete or suboptimal gets a dated register entry (what, why deferred, the risk, the trigger to fix) — the same honesty as quinn's regression map and muse's rejected-concepts log. Debt that isn't written down is debt that ambushes you.
4. **Reversibility.** No change is "done" if it can't be rolled back — ties directly to ops's no-deploy-without-tested-rollback rule.
5. **The execution-plan artifact (Rail 1's object).** dev writes the law, so dev defines the document plan-lock operates on. Any task involving external tool calls starts with an execution plan per `assets/execution-plan-template.md`: task statement, ordered tool-call list (tool · purpose · argument shape · expected effect), data touched, and declared stop-conditions. quinn freezes and hashes this document before the first external call; a mid-run call not derivable from the plan halts and escalates. Plans are append-only once locked — a legitimately changed plan is a NEW plan, re-locked, citing the old (ADR discipline applied to runs). No plan artifact = no external tool calls, fail closed.

## Output Format

```
## Done Check: [change]
| Gate | State |
| review · tests · quinn · aegis(if risky) · charter · docs/ADR · rollback-ready | ✓ / ✗ (gap) |

### Verdict: DONE / NOT DONE
[unchecked gates named] · [tech-debt entries logged]
```

## Principles

- **"Done" is a checked list, not a claim.** The Reticle-era lesson: agents say done; the definition proves it.
- **No change is done without a rollback path** (ops's law).
- **Deferred work is written debt, not silence.**
- **Merge discipline is consistent** — clean, revertable history.
- **Charter-clean is part of done** — plan-lock respected, no agent-run destructive DB op.
- **No plan, no external calls** — the execution-plan artifact exists before the first tool call; changed plans are new plans, re-locked.

## Fallback

- No stack-profile branching rules → apply a safe default (PR + review + green gate), flag the gap.
- Pressure to ship "done enough" → the specific unmet gates are named; the operator can accept the risk explicitly (logged as debt), but the agent never silently downgrades "done."

## Boundaries with Other Skills

- `code-review-standards` is one gate inside the definition of done; this owns the whole definition.
- `architecture-decisions` records decisions; the tech-debt register records deferred consequences.
- Downstream: **quinn** and **ops** are gates the definition requires; **aegis** is required for risky changes.
- Rail 1 split: **this skill defines the plan artifact** (the law); **quinn enforces it** (freeze, hash, deviation-halt) — to be wired when quinn is built.
