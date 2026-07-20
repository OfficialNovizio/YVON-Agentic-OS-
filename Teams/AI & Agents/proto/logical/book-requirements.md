---
name: proto-logical-book-requirements
type: logical
status: built — fully covered by Shared OS inheritance (2026-07-15)
assigned_agent: proto (AI & Agents / Prototype Lab)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Proto is fully covered by inherited scripts — its needs (experiment methodology, minimum-evidence thresholds, portfolio math) are A/B testing + decision-analysis math. This file is the only file in this folder.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Proto Needs It |
|--------|------------|----------|---------------------|
| `experiment_methods.py` | Kohavi et al. A/B papers + OpenStax Statistics | [experimentguide.com](https://experimentguide.com/) / [openstax.org](https://openstax.org/) — FREE | Prototype lifetime as function of hypothesis class, MDE for evidence thresholds, sequential testing for PROMOTE |
| `decision_analysis.py` | Clemen & Reilly (2012) | [archive.org](https://archive.org/details/makingharddecisi0000clem_u9f9) | Decision gates: promote/demote/kill, EVPI for "should we test this?" |
| `fleet_measurement.py` | DeMarco (1982) + CETIC | [archive.org](https://archive.org/) — FREE | Promotion readiness gates (5-gate model), prototype lifetime enforcement |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Prototype lifetime as function of hypothesis class | ✅ Cleared | `experiment_methods.py` (experiment_duration_days) + `fleet_measurement.py` (promotion_readiness lifetime gate) |
| Minimum-evidence thresholds for PROMOTE | ✅ Cleared | `experiment_methods.py` (MDE, power analysis) |
| Portfolio math (how many concurrent prototypes) | ✅ Cleared | `decision_analysis.py` (Monte Carlo simulation for portfolio capacity) |

## Skills → Script Mapping

- **prototype-design** → imports `experiment_methods.py` (sample size, duration) + `fleet_measurement.py` (promotion_readiness)
- **experiment-verdict** → imports `decision_analysis.py` (EVPI) + `experiment_methods.py` (sequential testing)
