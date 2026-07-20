---
name: edge-logical-book-requirements
type: logical
status: built — fully covered by Shared OS inheritance (2026-07-15)
assigned_agent: edge (AI & Agents / Technology Adoption)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Edge is fully covered by inherited scripts — its needs (weighted axis scoring, readiness levels, expected-value for pilots) are decision-analysis math. This file is the only file in this folder.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Edge Needs It |
|--------|------------|----------|---------------------|
| `decision_analysis.py` | Clemen & Reilly (2012) | [archive.org](https://archive.org/details/makingharddecisi0000clem_u9f9) | MAUT (weighted axis scoring with justified weights), swing weighting for technology evaluation, expected-value framing for pilot budgets, sensitivity analysis |
| `rice_prioritization.py` | Intercom RICE + Reinersten WSJF + SAFe | Canonical Tier B | Prioritization for adoption queue, tie-breaking |
| `fleet_measurement.py` | DeMarco (1982) + CETIC | [archive.org](https://archive.org/) — FREE | Promotion readiness as adoption readiness (same 5-gate model) |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Weighted axis scoring with justified weights (1-5 rubric → computed) | ✅ Cleared | `decision_analysis.py` (MAUT — additive scoring with swing weighting for weight justification) |
| Readiness levels instead of ad-hoc maturity scores | ✅ Cleared | `fleet_measurement.py` (promotion_readiness — 5-gate model applied as adoption-readiness check) |
| Expected-value framing for pilot budgets | ✅ Cleared | `decision_analysis.py` (expected_value, EVPI for "should we trial this technology?") |

## Skills → Script Mapping

- **adoption-bar** → imports `decision_analysis.py` (MAUT with weighted axes) + `fleet_measurement.py` (promotion_readiness as adoption readiness)
- **pilot-evaluation** → imports `decision_analysis.py` (EVPI, sensitivity analysis)
