---
agent: trial
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# trial · logical / book-requirements

Path 1 all-free.

## Proposed scripts
| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `experiment_design_selector` | B | Shadish, Cook & Campbell — *Experimental and Quasi-Experimental Designs* — CDL | Angrist & Pischke — *Mostly Harmless Econometrics* (natural exp) — free companion site |
| 2 | `adverse_event_monitor` | A/B | FDA IND monitoring standards summary · free | Cochrane clinical-trial review methodology · free |
| 3 | `literature_effect_size_synthesiser` | B/C | Cochrane Handbook for Systematic Reviews · free | ManyLabs replication project public data · free |

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| behavioural-experiment-design | script #1 + `sample_size.py` (Shared OS) |
| field-experiments | script #2 |
| behavioural-audit-lit | script #3 |
