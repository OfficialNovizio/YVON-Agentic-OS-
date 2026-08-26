---
agent: pace
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# pace · logical / book-requirements

Path 1 all-free.

## Proposed scripts
| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `velocity_variance_computer` | A | Vacanti — *Actionable Agile Metrics for Predictability* — CDL | Anderson — *Kanban* — CDL |
| 2 | `monte_carlo_delivery` | A | Vacanti — *When Will It Be Done?* — CDL | Reinertsen — *Principles of Product Development Flow* — CDL |
| 3 | `cadence_conflict_detector` | B | Scrum Guide 2020 — free | SAFe / LeSS scaled-cadence documentation — free abstracts |

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| velocity-tracking | script #1 |
| delivery-forecast | script #2 |
| sprint-cadence | script #3 |
| sprint-retros | `sre_postmortem_culture.py` (inherited) |

## Inherited scripts (Shared OS/logical/)
| Script | Source | Purpose |
|---|---|---|
| `sre_postmortem_culture.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.15](https://sre.google/sre-book/postmortem-culture/) — CC BY-NC-ND 4.0 + [SRE Workbook Ch.10](https://sre.google/workbook/postmortem-culture/) | Sprint-retro / delivery-incident grading — scores whether a retro doc meets Google's 5 review criteria and whether an incident meets postmortem-trigger threshold. |
