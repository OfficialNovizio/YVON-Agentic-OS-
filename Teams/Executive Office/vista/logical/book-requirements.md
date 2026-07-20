---
name: vista-logical-book-requirements
type: logical
status: built — 2 dedicated scripts + inherits 7 from Shared OS (2026-07-14)
assigned_agent: vista (Executive Office / Roadmap Lead)
date_added: 2026-07-06
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5) that vista imports. Vista owns 2 scripts specific to roadmap and metrics work and inherits 7 cross-agent scripts from the shared layer. This file is the only file in this folder.

## Vista-Specific Scripts (Shared OS/logical/)

| # | Script | Source | Route | Domain |
|---|--------|--------|-------|--------|
| 1 | `signal_detection.py` | Holmes, Illowsky & Dean, *Introductory Business Statistics* (2nd Ed., 2023, OpenStax, free CC BY) | A | Confidence intervals, two-sample tests, minimum sample size, signal vs noise classification, control charts (Western Electric), chi-square goodness-of-fit |
| 2 | `rice_prioritization.py` | Intercom RICE Framework (McBride, 2014) + Reinersten, *The Principles of Product Development Flow* (2009) + SAFe WSJF | B/C | RICE scoring, WSJF, cost of delay, effort calibration via planning fallacy, batch prioritization, tie-breaking, sensitivity reports |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Why Vista Needs It |
|--------|-------------------|
| `forecasting.py` | Time series for metric projections, naive benchmarks for roadmap estimates |
| `planning_fallacy.py` | De-bias all roadmap delivery estimates, Bayesian blend, premortem on dates |
| `investor_metrics.py` | Cohort analysis tables, metric classification (actionable vs vanity), health dashboard |
| `capital_budgeting.py` | NPV/WACC for roadmap investment decisions |
| `decision_analysis.py` | MAUT for multi-factor roadmap tradeoffs, sensitivity analysis |
| `competitive_strategy.py` | Five forces context for roadmap strategic alignment |
| `pitch_validation.py` | Cross-document consistency — roadmap facts match what echo tells investors |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| roadmap-sync: "projected sprint taken as given" | ✅ Cleared | `planning_fallacy.py` (Bayesian blend + de_bias_estimate) |
| roadmap-sync: "drift calculation without base-rate context" | ✅ Cleared | `planning_fallacy.py` (reference_class_statistics + de_bias_estimate) |
| rice-prioritization: "Effort estimate optimism bias" | ✅ Cleared | `rice_prioritization.py` (calibrate_effort + historical ratios) |
| north-star-metric: "metric movement without signal detection" | ✅ Cleared | `signal_detection.py` (classify_metric_change, CI, two-sample tests) |
| okr-quality-checker: "no statistical grounding for grades" | ✅ Cleared | `signal_detection.py` (classify_metric_change, detect_metric_drift) |
| roadmap-sync: "drift detection without methodology" | ✅ Cleared | `signal_detection.py` (control_limits + Western Electric rules) |
| rice-prioritization: "Impact factor calibration" | ✅ Cleared | `signal_detection.py` (two-sample tests) + `rice_prioritization.py` (sensitivity_report) |

## Still Pending

1. **Full time-series statistics** (KPSS test, ADF test, Box-Jenkins methodology, SARIMA) — the current OpenStax coverage is proportions/means/comparison. A proper time-series textbook (e.g., Hyndman, already extracted as `forecasting.py` but focused on forecasting not hypothesis testing of stationarity) would add formal stationarity tests.

## Skills → Script Mapping

- **roadmap-sync** → imports `planning_fallacy.py` (Bayesian blend for sprint estimates, adjusted slip), `signal_detection.py` (drift detection via control charts)
- **rice-prioritization** → imports `rice_prioritization.py` (full RICE engine), `planning_fallacy.py` (effort calibration), `signal_detection.py` (impact calibration)
- **north-star-metric** → imports `signal_detection.py` (classify_metric_change, CI, sample size), `investor_metrics.py` (cohort analysis)
- **okr-quality-checker** → imports `signal_detection.py` (CI-based grading), `forecasting.py` (naive benchmarks for projection accuracy)
