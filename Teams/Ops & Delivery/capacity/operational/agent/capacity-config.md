---
agent: capacity
department: Ops & Delivery
type: config
required_by: [custom/capacity-model/SKILL.md, custom/capacity-forecast/SKILL.md, custom/build-vs-hire/SKILL.md]
last_updated: 2026-07-29
---

# capacity · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Escalation | `<FILL_IN>` |

## Meeting overhead per role
| Role | Overhead % |
|---|---|
| IC engineer | `<FILL_IN — 15%>` |
| Manager | `<FILL_IN — 40%>` |
| Product | `<FILL_IN — 25%>` |
| Designer | `<FILL_IN — 20%>` |

## Attrition rate
| Field | Value |
|---|---|
| Annual attrition (org-wide) | `<FILL_IN — 15%>` |
| Per-role override | `<FILL_IN — engineering 18%, design 12%, etc.>` |

## Loaded-cost multipliers
| Field | Value |
|---|---|
| Benefits + tax multiplier | `<FILL_IN — 30%>` |
| Onboarding time-to-productivity | `<FILL_IN — 3 months>` |

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine capacity update | capacity |
| L2 | Gap > 1 FTE-month · hire recommendation | `<FILL_IN>` |
| L3 | Gap > 3 FTE-months · roadmap-blocking · hire commitment > $5K/mo | `Governance/board` |
