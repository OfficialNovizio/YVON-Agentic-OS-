---
agent: viz
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# viz · logical / book-requirements

Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `chart_type_selector` | B | Cleveland — *Elements of Graphing Data* — CDL | Few — *Show Me the Numbers* — CDL |
| 2 | `wcag_contrast` **✅ EXTRACTED touch-2 2026-07-29** — see `Shared OS/logical/wcag_contrast.py` | A | WCAG 2.2 spec — [free W3C](https://www.w3.org/TR/WCAG22/) | Okabe-Ito palette research paper — free |
| 3 | `dashboard_health_scorer` | C | Few — *Information Dashboard Design* — CDL | Google Data Studio / Looker best-practice docs — free |

All Tier A/B. WCAG is direct-free W3C institutional.

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| dashboard-standards | script #1 |
| viz-accessibility | script #2 |
| dashboard-audit | script #3 |

## Flag clearance
- Chart-type-per-data-shape heuristic — reasoning-based; script #1
- Contrast ratio math — arithmetic; script #2 (WCAG source)
- Health score aggregation — hybrid; script #3
