---
name: metric-logical-book-requirements
type: logical
status: built — inherits from Shared OS (2026-07-15)
assigned_agent: metric (Product / Product Analytics)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Metric inherits scripts — its core gaps (experiment power, MDE, significance) are now covered. This file is the only file in this folder.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Metric Needs It |
|--------|------------|----------|---------------------|
| `experiment_methods.py` | Kohavi et al. A/B papers + OpenStax Statistics | [experimentguide.com](https://experimentguide.com/) / [openstax.org](https://openstax.org/) — FREE | Power analysis, MDE, sequential testing — core experiment math |
| `signal_detection.py` | OpenStax, *Introductory Business Statistics 2e* (2023) | [openstax.org](https://openstax.org/details/books/introductory-business-statistics-2e) — FREE | CI computation, hypothesis testing, metric drift detection |
| `investor_metrics.py` | Croll & Yoskovitz, *Lean Analytics* (2013) + Skok SaaS Metrics 2.0 | Commercial + free | NRR, GRR, cohort tables, retention analysis |
| `planning_fallacy.py` | Kahneman, *Thinking, Fast and Slow* (2011) | [archive.org](https://archive.org/) | Calibration for conversion-drop thresholds |
| `forecasting.py` | Hyndman & Athanasopoulos, *FPP3* (2021) | [oTexts.com](https://OTexts.com/fpp3/) — FREE | Time-series trend detection for metric dashboards |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| conversion_drop_flag_threshold | ✅ Cleared | `signal_detection.py` (two-sample tests) + `experiment_methods.py` (MDE calibration) |
| power/significance defaults | ✅ Cleared | `experiment_methods.py` (mde_to_sample_size, experiment_power) |
| cohort-read cadence | ✅ Cleared | `investor_metrics.py` (cohort_table trend detection) |
| retention-window choices | ✅ Cleared | `investor_metrics.py` (NRR, GRR, cohort analysis) |

## Skills → Script Mapping

- **funnel-instrumentation** → imports `signal_detection.py` (funnel conversion significance) + `investor_metrics.py` (cohort analysis)
- **experiment-instrumentation** → imports `experiment_methods.py` (MDE, power, SRM, sequential) + `signal_detection.py` (two-sample comparison)
- **product-metrics-spec** → imports `investor_metrics.py` (metric definitions + cohort tables)
- **metrics-governance** → imports `signal_detection.py` (variance flags) + `planning_fallacy.py` (threshold calibration)
