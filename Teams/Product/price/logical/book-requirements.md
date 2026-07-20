---
name: price-logical-book-requirements
type: logical
status: built — 1 dedicated script + inherits from Shared OS (2026-07-15)
assigned_agent: price (Product / Pricing & Packaging)
date_added: 2026-07-10
date_filled: 2026-07-15
---

## Purpose

All logical scripts live in `Shared OS/logical/` (§13.5). Price owns 1 dedicated script for pricing methods and inherits cross-agent scripts. This file is the only file in this folder.

## Price-Specific Scripts (Shared OS/logical/)

| # | Script | Source Book 1 | Book 1 URL | Source Book 2 | Book 2 URL | Route |
|---|--------|--------------|------------|---------------|------------|-------|
| 1 | `pricing_methods.py` | Nagle, *The Strategy and Tactics of Pricing* (3rd Ed., 2002, Routledge) | [archive.org](https://archive.org/details/strategytacticso0000nagl) — FREE | Van Westendorp, *"NSS Price Sensitivity Meter"* (1976) — public domain | Widely documented methodology | B/C |

## Inherited Scripts (Shared OS/logical/ — imported, not copied)

| Script | Source Book | Book URL | Why Price Needs It |
|--------|------------|----------|---------------------|
| `experiment_methods.py` | Kohavi et al. + OpenStax | [experimentguide.com](https://experimentguide.com/) / [openstax.org](https://openstax.org/) | Power analysis, guardrails for revenue experiments |
| `signal_detection.py` | OpenStax Statistics 2e (2023) | [openstax.org](https://openstax.org/) — FREE | WTP survey significance and CI |
| `investor_metrics.py` | Croll & Yoskovitz + Skok | Commercial + free | LTV:CAC, revenue guardrails |
| `capital_budgeting.py` | Brealey & Myers (12th Ed., 2017) | Commercial | NPV/WACC for pricing investment analysis |
| `decision_analysis.py` | Clemen & Reilly (2012) | [archive.org](https://archive.org/) | Conjoint design selection, sensitivity analysis |

## Flag Clearance Summary

| Previously Flagged (0.6) | Status | Script |
|--------------------------|--------|--------|
| wtp_methods (Van Westendorp, conjoint — conventions) | ✅ Cleared | `pricing_methods.py` (van_westendorp, conjoint_part_worth, conjoint_wtp) |
| revenue guardrail thresholds | ✅ Cleared | `pricing_methods.py` (Gabor-Granger optimal price, value_based_pricing_range) + `investor_metrics.py` (LTV:CAC) |
| value-metric selection heuristics | ✅ Cleared | `pricing_methods.py` (value_based_pricing_range) |
| grandfathering-default reasoning | ✅ Cleared | `pricing_methods.py` (Nagle Ch.13 — pricing ethics framework) |

## Skills → Script Mapping

- **pricing-research** → imports `pricing_methods.py` (van_westendorp, conjoint, Gabor-Granger) + `signal_detection.py` (survey significance)
- **packaging-tiers** → imports `pricing_methods.py` (conjoint_part_worth for feature→tier mapping)
- **pricing-experiment-discipline** → imports `experiment_methods.py` (MDE, power, guardrails, SRM) + `pricing_methods.py` (price_elasticity)
- **price-change-governance** → imports `pricing_methods.py` (value_based_pricing_range for fair-pricing check)
