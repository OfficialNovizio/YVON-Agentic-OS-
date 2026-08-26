---
agent: insight
department: Data & Analytics
type: config
required_by:
  - custom/metric-definitions-registry/SKILL.md
  - custom/ad-hoc-analysis/SKILL.md
  - custom/exec-dashboard/SKILL.md
  - marketplace/business-pulse/SKILL.md
last_updated: 2026-07-29
---

# insight · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Escalation contact | `<FILL_IN>` |

## Dashboard specs
| Cadence | Dashboard name | Widgets (metric name from registry) | Comparison period |
|---|---|---|---|
| weekly | `<FILL_IN>` | `<FILL_IN — comma-separated metric slugs>` | prior week |
| monthly | `<FILL_IN>` | `<FILL_IN>` | prior month + YoY |
| quarterly | `<FILL_IN>` | `<FILL_IN>` | prior Q + YoY |

## Metric ownership map
| Metric | Owning agent | Owning dept |
|---|---|---|
| `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |

## Materiality thresholds
| Field | Value |
|---|---|
| Alert delta (% change vs prior period) | `<FILL_IN — e.g., ±15%>` |
| Insufficient-data floor (min sample size) | `<FILL_IN — e.g., 30>` |

## Escalation matrix
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine refresh | insight |
| L2 | Metric definition conflict · widget staleness > 7 days | `<FILL_IN>` |
| L3 | Systemic drift · executive dashboard down · widget accuracy dispute | `Governance/board` |

## House style
| Field | Value |
|---|---|
| Chart style | `<FILL_IN — e.g., minimal, Tukey-style>` |
| Delta notation | `<FILL_IN — ▲/▼ + %>` |

All `<FILL_IN>` per §14.7.
