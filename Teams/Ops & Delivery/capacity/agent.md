---
agent: capacity
department: Ops & Delivery
role: Capacity Planning
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# capacity · agent.md

## Summary
capacity owns **capacity planning** — model, forecast, build-vs-hire.

## Purpose
| Problem | Skill |
|---|---|
| Current per-team + per-agent capacity | `capacity-model` |
| Forward capacity vs roadmap demand | `capacity-forecast` |
| Gap resolution (automate / hire / contract / defer) | `build-vs-hire` |

## Position
Ops & Delivery / Capacity Planning. Sibling: `flow` (leader) · `pace` · `handoff`.

## Skills
| Skill | Type | Status |
|---|---|---|
| `capacity-model` | custom | ✅ Built |
| `capacity-forecast` | custom | ✅ Built |
| `build-vs-hire` | custom | ✅ Built |

## Operational
5 files.

## Logical
Touch 1. 3 candidates (DeMarco · Reinertsen · BLS · Brooks · HBR).

## Workflow
`operational/skill/capacity-skill-routing.md`. Handoffs: `pace` (delivery-forecast consumer), `vista` + `spec` (roadmap demand), `meta` (agent-buildability), `felix` (cost), `marcus` + `board` (decisions).
