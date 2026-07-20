---
name: loom-logical-book-requirements
type: logical
status: built — inherits from Shared OS (2026-07-15)
assigned_agent: loom (Product / PMF & Experimentation)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Loom inherits scripts — its core gaps (experiment math, retention math, PMF triangulation) are now covered. This file is the only file in this folder.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Loom Needs It |
|--------|------------|----------|---------------------|
| `experiment_methods.py` | Kohavi et al. A/B papers + OpenStax Statistics | [experimentguide.com](https://experimentguide.com/) / [openstax.org](https://openstax.org/) — FREE | MDE, power, sequential testing, SRM, guardrails — complete experiment math |
| `signal_detection.py` | OpenStax, *Introductory Business Statistics 2e* (2023) | [openstax.org](https://openstax.org/details/books/introductory-business-statistics-2e) — FREE | Significance, CI, metric drift for assumption validation |
| `investor_metrics.py` | Croll & Yoskovitz, *Lean Analytics* (2013) + Skok | Commercial + free | Retention curve analysis, cohort tables — the PMF data layer |
| `decision_analysis.py` | Clemen & Reilly, *Making Hard Decisions* (2012) | [archive.org](https://archive.org/details/makingharddecisi0000clem_u9f9) | Decision trees/Monte Carlo for assumption impact×uncertainty |
| `planning_fallacy.py` | Kahneman, *Thinking, Fast and Slow* (2011) | [archive.org](https://archive.org/) | Calibration for PMF read confidence |
| `pricing_methods.py` | Nagle (2002) + Van Westendorp (1976) | [archive.org](https://archive.org/details/strategytacticso0000nagl) — FREE | Revenue experiment guardrails, WTP validation |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| ellis_disappointment_bar (40% convention) | ✅ Cleared | `signal_detection.py` (CI + sample size for proportions) |
| retention_flatness_criterion | ✅ Cleared | `investor_metrics.py` (cohort trend detection) + `signal_detection.py` (two-sample slope comparison) |
| assumption impact×uncertainty scoring | ✅ Cleared | `decision_analysis.py` (MAUT, sensitivity) + `rice_prioritization.py` (RICE scoring) |
| min_detectable_effect / power defaults | ✅ Cleared | `experiment_methods.py` (mde_to_sample_size, experiment_power, sequential_boundary) |

## Skills → Script Mapping

- **experiment-discipline** → imports `experiment_methods.py` (MDE, power, sequential, SRM, guardrails)
- **pmf-scorecard** → imports `investor_metrics.py` (retention + cohort) + `signal_detection.py` (significance) + `decision_analysis.py` (triangulation)
- **assumption-mapping** → imports `decision_analysis.py` (MAUT) + `rice_prioritization.py` (calibrated scoring)
- **experiment-registry** → imports `experiment_methods.py` (SRM validation for registry integrity)
