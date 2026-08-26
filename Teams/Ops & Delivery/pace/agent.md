---
agent: pace
department: Ops & Delivery
role: Sprint Cadence & Velocity
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# pace · agent.md

## Summary
pace owns **sprint cadence + velocity + delivery forecasting**. Per-team, non-comparative.

## Purpose
| Problem | Skill |
|---|---|
| Sprint / cycle cadence per team | `sprint-cadence` |
| Velocity + cycle time trends per team | `velocity-tracking` |
| Monte-Carlo delivery-date forecast (P50/85/95) | `delivery-forecast` |

## Position
Ops & Delivery / Sprint Cadence & Velocity. Sibling: `flow` (leader) · `capacity` · `handoff`.

## Skills
| Skill | Type | Status |
|---|---|---|
| `sprint-cadence` | custom | ✅ Built |
| `velocity-tracking` | custom | ✅ Built |
| `delivery-forecast` | custom | ✅ Built |

## Operational
5 files.

## Logical
Touch 1. 3 candidates (Vacanti · Anderson · Reinertsen · Scrum Guide · SAFe/LeSS abstracts).

## Workflow
`operational/skill/pace-skill-routing.md`. Handoffs: `flow` (retro + systemic root cause), `capacity` (forecast constraints), `anomaly` (shift triage), `viz` (charts).
