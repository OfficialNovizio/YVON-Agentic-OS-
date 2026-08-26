---
agent: anomaly
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# anomaly · logical / book-requirements

Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `outlier_detection` **✅ EXTRACTED touch-2 2026-07-29** — `Shared OS/logical/outlier_detection.py` (Route A/B — Z / modified-Z / MAD, NIST 3.5 threshold, swamping+masking warnings) | A | NIST/SEMATECH e-Handbook §1.3.5.17 — [free NIST](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h.htm) | Iglewicz & Hoaglin (1993) — cited by NIST for modified-Z 3.5 threshold |
| 2 | `sre_alerting_principles` **✅ EXTRACTED touch-2 2026-07-29** — `Shared OS/logical/sre_alerting_principles.py` (Route B — 5-question SRE quality classifier · golden-signals coverage audit · page-philosophy checks) | B | Google SRE Book Ch. 6 — [free CC BY-NC-ND](https://sre.google/sre-book/monitoring-distributed-systems/) | Google SRE Workbook Ch. 5 — [free](https://sre.google/workbook/alerting-on-slos/) |
| 3 | `triage_decision_tree` (pending) | B | Google SRE Book (incident response) | AWS Well-Architected Reliability Pillar — free |

All Tier A/B.

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| anomaly-detection-rules | script #1 |
| alert-routing | script #2 |
| incident-triage-data | script #3 |

## Cross-agent script candidate
`anomaly_statistical_tests` likely used by `felix/cash-flow-snapshot` (variance calc), `metric` (Product), `gauge` (AI & Agents) — promotion to `Shared OS/logical/` on second consumer per §13.5.
