---
name: forge-logical-book-requirements
type: logical
status: built — fully covered by Shared OS inheritance (2026-07-15)
assigned_agent: forge (AI & Agents / Quantitative Benchmarking)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Forge is fully covered by inherited scripts — its needs (power analysis, replication counts, multiple comparison correction) are all A/B testing math. This file is the only file in this folder.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Forge Needs It |
|--------|------------|----------|---------------------|
| `experiment_methods.py` | Kohavi et al. A/B papers + OpenStax Statistics | [experimentguide.com](https://experimentguide.com/) / [openstax.org](https://openstax.org/) — FREE | Power analysis for replication counts, MDE, sequential testing for multiple comparisons |
| `signal_detection.py` | OpenStax Statistics 2e (2023) | [openstax.org](https://openstax.org/) — FREE | "No measured difference" significance test, confidence bands for cost-quality frontier |
| `decision_analysis.py` | Clemen & Reilly (2012) | [archive.org](https://archive.org/) | Sensitivity analysis for frontier confidence |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Replication counts from "suggested 5" convention | ✅ Cleared | `experiment_methods.py` (mde_to_sample_size — computes required N per power) |
| Significance thresholds for "no measured difference" | ✅ Cleared | `experiment_methods.py` (two_proportion_test with effect size) |
| Cost-quality frontier confidence bands | ✅ Cleared | `signal_detection.py` (CI computation) + `decision_analysis.py` (sensitivity) |

## Skills → Script Mapping

- **benchmarking-discipline** → imports `experiment_methods.py` (MDE, power, sequential) + `signal_detection.py` (significance)
