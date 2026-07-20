---
name: echo-logical-book-requirements
type: logical
status: built — 3 dedicated scripts + inherits 5 from marcus via Shared OS (2026-07-14)
assigned_agent: echo (Executive Office / Investor Relations)
date_added: 2026-07-06
date_filled: 2026-07-14
---

## Purpose

Logical artifacts are Python scripts in `Shared OS/logical/` (playbook §13.5) that echo imports. Echo owns 3 scripts specific to investor-facing work and inherits 5 cross-agent scripts from the shared layer. This file is the only file in this folder.

## Echo-Specific Scripts (Shared OS/logical/)

| # | Script | Source | Route | Domain |
|---|--------|--------|-------|--------|
| 1 | `venture_valuation.py` | Damodaran, *Narrative and Numbers* (2017) + Sahlman & Scherlis, HBS Note E-95 | A | VC Method, cap table, dilution, option pool, exit waterfall |
| 2 | `investor_metrics.py` | Croll & Yoskovitz, *Lean Analytics* (2013) + Skok, SaaS Metrics 2.0 + Ries, *The Lean Startup* (2011) Ch.7 | A/B | NRR/GRR, LTV:CAC, burn multiple, Rule of 40, cohort analysis, benchmark grading |
| 3 | `pitch_validation.py` | Damodaran, *Narrative and Numbers* (2017) + *The Little Book of Valuation* (2011) | B | Ask sanity, narrative-metric consistency, no-spin enforcement, cross-document consistency |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Why Echo Needs It |
|--------|-------------------|
| `capital_budgeting.py` | DCF/WACC/CAPM cross-check for valuation reasonableness |
| `forecasting.py` | Trend detection on investor metrics over time |
| `planning_fallacy.py` | De-bias forward-looking projections in investor updates |
| `competitive_strategy.py` | Five forces context for industry positioning in pitch narrative |
| `decision_analysis.py` | Probability calibration for pitch confidence claims |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| Pitch deck valuation claims ("the Ask") | ✅ Cleared | `venture_valuation.py` (VC Method, dilution, runway check) |
| Traction metrics in investor updates | ✅ Cleared | `investor_metrics.py` (NRR/GRR, LTV:CAC, burn multiple, cohort) |
| Unit economics (CAC, LTV, churn) | ✅ Cleared | `investor_metrics.py` |
| Period-over-period consistency | ✅ Cleared | `investor_metrics.py` (variance_flag: 15%/25% thresholds) |
| Narrative-numbers disconnect | ✅ Cleared | `pitch_validation.py` (cross-document + narrative-metric checks) |
| No-spin / lack of genuine lowlights | ✅ Cleared | `pitch_validation.py` (no_spin_rule) |

## Still Pending

1. **Full venture capital fund mechanics** (fund structure, carry, waterfall, liquidation preferences) — Feld & Mendelson, *Venture Deals* would be the definitive source. The exit waterfall in `venture_valuation.py` is standard LP + participation + caps but doesn't cover multi-tiered fund structures with GP carry.

## Skills → Script Mapping

- **pitch-narrative** → imports `venture_valuation.py` (Ask sanity), `pitch_validation.py` (narrative checks), `competitive_strategy.py` (industry positioning)
- **pitch-framework** → imports `venture_valuation.py` (financial slides, cap table), `pitch_validation.py` (version integrity, audit)
- **investor-update-template** → imports `investor_metrics.py` (full health dashboard), `planning_fallacy.py` (forward-looking caveats)
- **investor-update-generator** → imports `investor_metrics.py` (metric correctness verification), `planning_fallacy.py` (projection flags)
