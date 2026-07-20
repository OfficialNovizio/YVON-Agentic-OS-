---
name: gauge-logical-book-requirements
type: logical
status: built — fully covered by Shared OS inheritance (2026-07-15)
assigned_agent: gauge (AI & Agents / Quality Benchmarks)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Gauge is fully covered by inherited scripts. This file is the only file in this folder.

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Gauge Needs It |
|--------|------------|----------|---------------------|
| `signal_detection.py` | OpenStax Statistics 2e (2023) | [openstax.org](https://openstax.org/) — FREE | Control charts (Western Electric rules), drift detection replacing fixed ±20% thresholds, noise vs signal classification |
| `experiment_methods.py` | Kohavi et al. + OpenStax | [experimentguide.com](https://experimentguide.com/) | Sample size for golden-set calibration, power analysis for benchmark significance |
| `fleet_measurement.py` | DeMarco (1982) + CETIC | [archive.org](https://archive.org/) — FREE | Fleet health composite for overall quality benchmark |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Control limits instead of fixed ±20% drift | ✅ Cleared | `signal_detection.py` (control_limits, check_western_electric_rules) |
| Distinguishing noise from signal in small task counts | ✅ Cleared | `signal_detection.py` (classify_metric_change — checks sample size, normality, CI overlap, significance) |
| Golden-set sample sizes | ✅ Cleared | `experiment_methods.py` (mde_to_sample_size, experiment_power) |

## Skills → Script Mapping

- **scorecard** → imports `signal_detection.py` (control_limits, detect_metric_drift) + `experiment_methods.py` (MDE)
