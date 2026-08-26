---
agent: pace
department: Ops & Delivery
type: config
required_by: [custom/sprint-cadence/SKILL.md, custom/velocity-tracking/SKILL.md, custom/delivery-forecast/SKILL.md]
last_updated: 2026-07-29
---

# pace · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |

## Teams + cadence
| Team | Cadence | Timezone | Tracker | Baseline velocity |
|---|---|---|---|---|
| `<FILL_IN>` | `<FILL_IN — 1w / 2w / 3w>` | `<FILL_IN>` | `<FILL_IN — Jira/Linear/Asana>` | `<FILL_IN>` |

## Velocity thresholds
| Field | Value |
|---|---|
| Material-shift variance (% from baseline) | `<FILL_IN — ±25%>` |
| History depth for forecasts | `<FILL_IN — 8 sprints>` |
| Forecast percentiles | `<FILL_IN — 50, 85, 95>` |

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine tracking / cadence | pace |
| L2 | Material shift on any team | `<FILL_IN>` |
| L3 | Systemic shift across all teams · delivery forecast >85% risk to critical date | `Governance/board` |
