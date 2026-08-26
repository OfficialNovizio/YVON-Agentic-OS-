---
agent: trend
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# trend · logical / book-requirements

Path 1 all-free.

## Proposed scripts
| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `macro_sensitivity_computer` | A | Damodaran cost-of-capital data | Fed FRED APIs — free institutional |
| 2 | `trend_confidence_scorer` | B/C | Rogers — *Diffusion of Innovations* — CDL | Gartner Hype Cycle methodology (public) |
| 3 | `regulatory_stage_tracker` | B | Congress.gov API docs · Federal Register API — free institutional | EUR-Lex API (EU) — free |

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| macro-signals | script #1 + `fred_series_registry.py` (inherited) |
| emerging-trends | script #2 |
| regulatory-horizon | script #3 |

## Inherited scripts (Shared OS/logical/)
| Script | Source | Purpose |
|---|---|---|
| `fred_series_registry.py` **✅ EXTRACTED touch-2 2026-08-10** | [FRED — St. Louis Fed](https://fred.stlouisfed.org/) — Public Domain: Citation Requested + BEA + BLS | Macro-signal registry — 20 canonical series (GDP, UNRATE, CPIAUCSL, CPILFESL, PCEPI, FEDFUNDS, DGS10, DGS2, T10Y2Y, MORTGAGE30US, M2SL, GFDEGDQ188S, DEXUSEU, DTWEXBGS, INDPRO, PAYEMS, CIVPART, ICSA, GDPC1, A939RX0Q048SBEA) with verbatim titles, units, frequencies, source attributions. Trend uses for horizon scans and macro-sensitivity setup. |
