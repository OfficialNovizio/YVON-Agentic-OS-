---
agent: handoff
department: Ops & Delivery
type: config
required_by: [custom/handoff-protocol/SKILL.md, custom/handoff-registry/SKILL.md, custom/dependency-map/SKILL.md]
last_updated: 2026-07-29
---

# handoff · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Escalation | `<FILL_IN>` |

## Handoff SLAs
| Priority | Echo-SLA | Resolution-SLA |
|---|---|---|
| P0 blocking | `<FILL_IN — 1 hour>` | `<FILL_IN — 4 hours>` |
| P1 high | `<FILL_IN — 4 hours>` | `<FILL_IN — 1 day>` |
| P2 normal | `<FILL_IN — 1 day>` | `<FILL_IN — 3 days>` |
| P3 low | `<FILL_IN — 3 days>` | `<FILL_IN — 7 days>` |

## Context cap
| Field | Value |
|---|---|
| Words before summary+reference | `<FILL_IN — 200>` |

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine log / query | handoff |
| L2 | Echo missed on P0/P1 | `<FILL_IN>` |
| L3 | Silent-handoff pattern > 20% for a team · critical-path blocking | `Governance/board` |
