---
name: book-requirements
type: logical (placeholder — awaiting operator-supplied source books per rule 0.6)
assigned_agent: ops (Engineering / DevOps & Reliability)
date_added: 2026-07-09
---

## Purpose

The logical layer grounds ops's judgments in real, citable sources. Until the operator supplies books, ops's rubrics are flagged **reasoning-based, not formula-verified** (rule 0.6).

## Candidate sources (operator to supply; suggestions, not purchases ops made)

1. **An SRE text** — grounds severity classification, error budgets, toil reduction, blameless post-mortem method, and design-for-failure. **Shared candidate with dev** (dev's logical/book-requirements.md names the same need) — one book, two agents, extract once.
2. **The shared statistics source** (cross-department want: vista/sentinel/nate/kai/rio/quinn) — grounds alert-threshold recommendations (false-positive/negative trade-offs) and baseline drift detection with math instead of convention. **OS-level shared build.**
3. **A release/continuous-delivery text** — grounds deploy-strategy selection (blue-green vs canary vs rolling by risk class) and pipeline discipline beyond the marketplace-credited patterns.

## Currently flagged as reasoning-based (rule 0.6)

- P0–P3 severity descriptions (industry convention, credited to marketplace SRE skills — not derived).
- Any cadence, threshold, or retention recommendation ops proposes when config is unset.
- Deploy-strategy-by-risk guidance (patterns credited; the risk mapping is reasoning).
- Watch-window duration recommendations.

## Extraction protocol (when books arrive)

Formulas/thresholds extracted with page-level citations into this folder; affected skills updated to cite them; reasoning-based flags removed only where a citation replaces them. Coordinate the SRE text's extraction with dev so both agents cite one source.
