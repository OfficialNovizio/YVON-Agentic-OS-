---
name: fleet-governance
type: custom
status: built from scratch
fulfills_catalog_entry: none — added by AI & Agents redesign plan §2/§3 (department law + change flow had no owner)
assigned_agent: meta (AI & Agents / Fleet Architect, department leader)
portable: true
date_added: 2026-07-10
---

# Fleet Governance

## Introduction
How the fleet changes lawfully. Owns the Fleet Charter (as its custodian, not its author — the charter is operator law) and runs the board-gated change flow the operator locked in 2026-07-10: NO fleet change without a written proposal and a board verdict.

## Purpose
Makes "no silent fleet changes" (Fleet Charter Rail 3) an operating procedure instead of a slogan, and gives every agent one unambiguous answer to "how do I change something?"

## When to Use
- Any agent wants any fleet change: skill edit, new/retired agent, model change, threshold change, tool adoption beyond registration.
- A charter question arises ("is this allowed?").
- An unauthorized change is discovered (incident path).

## Structure / Protocol
PROPOSE (assets/change-proposal-template.md) → GATE (board; triple-pass) → APPLY (proposing agent, exactly as approved) → RECORD (fleet-registry and/or relay's tool registry; precedent archives) → VERIFY (gauge re-measures if behavior-affecting).

## Instructions
1. Every proposal uses the template: what/why(evidence)/exact diff or spec/risk/rollback. No proposal, no change — regardless of size. There is no "trivial change" tier (operator decision 2026-07-10).
2. Routing: all fleet changes → board. Spend or cross-department impact escalates per the escalating agent's own config thresholds (`<FILL_IN>` per business).
3. Charter questions: answer from the Fleet Charter text; ambiguity resolves most-restrictive, and meta drafts a charter amendment proposal for the operator (agents never amend the charter themselves).
4. Incident path (unauthorized change found): freeze the artifact, revert to last approved version, escalate to operator, registry records `unauthorized-change`. Blameless write-up feeds anneal (a lesson) — mirror of ops' post-mortem discipline.
5. While board is dormant (Governance docs missing): proposals QUEUE, they do not auto-approve. The queue is visible in the registry history. Urgent operator-approved changes may bypass board only with the operator's explicit written sign-off recorded in the proposal.

## Output Format
Proposals per the template; verdicts recorded as `APPROVED / REJECTED / AMENDED (diff)` with date and proposal ID; incident reports as freeze-revert-escalate logs.

## Principles
- The gate is the feature: slow-and-recorded beats fast-and-silent everywhere in this fleet.
- meta custodians the charter but is bound by it identically — no self-exemption.
- Queue honestly: a dormant board blocks changes; it does not excuse them.

## Fallback
No board and no operator reachable and the fleet is actively degrading? The only permitted unilateral action is REVERT to the last approved state (rollback is always pre-approved). Never a forward fix.

## Boundaries with Other Skills
- Fleet Charter (operator law) is senior to this skill — this skill executes it.
- anneal's self-annealing-loop produces most proposals; this skill routes and records them.
- fleet-registry records outcomes; precedent (Governance) archives the documents.
- Engineering's delivery-governance handles code-change governance; this skill handles fleet-structure changes — a change that is both (e.g. a skill edit that ships code) satisfies both.
