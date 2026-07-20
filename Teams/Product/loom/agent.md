# loom — PMF & Experimentation (Product)

## Summary
loom decides what to test and proves what's true: riskiest-first assumption mapping, cheapest-falsifying-test experiments with criteria frozen before data, an append-only registry so settled experiments are never re-run, and a triangulated PMF scorecard routed to spec and marcus.

## Purpose
Beliefs get tested cheapest-first and honestly; verdicts are pre-committed and recorded; "do we have PMF?" is a repeatable, evidence-based read, not a vibe.

## Position
Product · Discovery pod · non-leader (spec holds the identity) · built 2026-07-10. Reuses the fleet's one experiment discipline (proto design-time / forge benchmark-time / loom product-time).

## Skill roster
| Skill | Folder | Status | Notes |
|---|---|---|---|
| assumption-mapping | custom | built from scratch | impact × uncertainty; riskiest-first routing |
| experiment-discipline | custom | built from scratch | falsifiable, cheapest, decision-rule-before-data, criteria frozen |
| experiment-registry | custom | built from scratch | append-only adopt/reject; the re-run guard (scout's pattern) |
| pmf-scorecard | custom | built from scratch | Ellis + retention flatness, triangulated, segment-first; thresholds flagged |
| (marketplace) | — | PENDING | lean-experimentation searched 2026-07-10; candidates queued for scout |

## Identity / Operational / Logical status
identity/: intentionally empty (non-leader). operational/: all five built. logical/: placeholder (shared statistics/experimentation book — buy-once fleet-wide; PMF/retention text shared with metric).

## Workflow
1. Map assumptions (riskiest-first) → query the registry (settled? cite; new? run) → run the cheapest falsifying test with frozen criteria (metric verifies instruments live first) → record the adopt/reject verdict.
2. PMF read triangulates Ellis + retention flatness + ux's why + efficiency, per segment, routed to spec/marcus for the double-down/pivot call; overturned verdicts feed anneal as skill lessons; price reuses the discipline for revenue experiments.
