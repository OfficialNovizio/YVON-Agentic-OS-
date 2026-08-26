---
agent: insight
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# insight · logical / book-requirements

Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `tukey_eda_summary` | A | Tukey — *Exploratory Data Analysis* (1977) — Internet Archive CDL | NIST/SEMATECH e-Handbook of Statistical Methods — [free NIST](https://www.itl.nist.gov/div898/handbook/) |
| 2 | `metric_registry_validator` | B | Kimball — *The Data Warehouse Toolkit* (dimensional modeling reference) — CDL | Wikipedia data-warehouse concepts (cross-check only) |
| 3 | `dashboard_widget_composer` | B/C | Few — *Show Me the Numbers* (dashboard design principles) — CDL | Tufte's *Visual Display of Quantitative Information* — CDL |

All Tier A/B. NIST Handbook is direct-free institutional.

## Skills → script mapping

| Skill | Imports touch-2 |
|---|---|
| ad-hoc-analysis | script #1 |
| metric-definitions-registry | script #2 |
| exec-dashboard | script #3 (with viz agent) |

## Flag clearance

- EDA 5-number summary + boxplot rules — reasoning-based; cleared by #1
- Metric-name uniqueness + query-ref validation — deterministic in principle; grounded touch-2 by #2
- Widget layout heuristics — reasoning-based; cleared by #3

## Inherited scripts (Shared OS/logical/)

| Script | Source | Purpose |
|---|---|---|
| `fred_series_registry.py` **✅ EXTRACTED touch-2 2026-08-10** | [FRED — St. Louis Fed](https://fred.stlouisfed.org/) — Public Domain: Citation Requested | Metric-registry cross-reference — when insight builds a company KPI registry with macro comparators, it uses FRED IDs as the canonical external reference (e.g., internal `revenue_growth` benchmarked against `CPIAUCSL`-adjusted GDP). |

## Still pending

- Tufte's second and third books (paywalled).
- Cleveland's *Visualising Data* (paywalled).
