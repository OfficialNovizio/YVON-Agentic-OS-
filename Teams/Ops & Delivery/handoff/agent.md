---
agent: handoff
department: Ops & Delivery
role: Cross-Team Handoffs
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# handoff · agent.md

## Summary
handoff owns **cross-team + cross-agent handoff discipline** — protocol, registry, dependency map.

## Purpose
| Problem | Skill |
|---|---|
| How to structure a handoff (envelope · echo · context cap) | `handoff-protocol` |
| Registry of logged handoffs + patterns | `handoff-registry` |
| Cross-team dependency graph + critical path | `dependency-map` |

## Position
Ops & Delivery / Cross-Team Handoffs. Sibling: `flow` (leader) · `pace` · `capacity`.

## Skills
| Skill | Type | Status |
|---|---|---|
| `handoff-protocol` | custom | ✅ Built |
| `handoff-registry` | custom | ✅ Built |
| `dependency-map` | custom | ✅ Built |

## Operational
5 files.

## Logical
Touch 1. 3 candidates (Google SRE · Team Topologies · CLRS · Reinertsen).

## Workflow
`operational/skill/handoff-skill-routing.md`. Every dept consumes the handoff protocol. Handoffs: `flow` (process fixes), `pace` + `capacity` (forecast consumers), `viz` (graph rendering).
