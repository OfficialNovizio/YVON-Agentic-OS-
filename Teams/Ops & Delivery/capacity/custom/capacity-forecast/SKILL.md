---
name: capacity-forecast
type: custom
status: built from scratch
assigned_agent: capacity (Ops & Delivery / Capacity Planning)
portable: true
date_added: 2026-07-29
tier: 3
description: "Forward-looking capacity forecast — 3/6/12 month horizon. Projects capacity gap given committed roadmap + attrition rate. Never assumes 100% retention."
triggers:
  - capacity forecast
  - can we deliver the roadmap
  - hiring needs
  - forward capacity
  - attrition-adjusted capacity
---

# Capacity Forecast

## Purpose
Forward capacity projection over 3/6/12 months. Committed roadmap vs projected capacity minus attrition = gap.

## Structure / Protocol
```
1. HORIZON    3 / 6 / 12 month projection
2. BASELINE   current capacity from capacity-model
3. ATTRITION  apply operator-set attrition rate to team-months
4. ROADMAP    committed work from vista (roadmap) + spec (PRDs)
5. GAP        capacity - roadmap-demand = gap per horizon
6. RETURN     forecast + gap severity + hiring recommendation
```

## Instructions
Attrition rate operator-declared per config; industry averages tagged `[reasoning-based]` if operator hasn't set.

Never assumes 100% retention.

## Output Format
Timeline chart + gap table + hiring/build-vs-buy recommendation.

## Principles
- **Attrition rate is real**, not zero.
- **Roadmap demand from vista + spec** — never estimated.
- **Ranges** on gap projection.
- **Gap → build-vs-hire** — this skill flags; build-vs-hire skill resolves.

## Fallback
| Failure | Response |
|---|---|
| Roadmap not committed | Flag scenario-only forecast |
| Attrition rate unknown | Use industry benchmark tagged `[reasoning-based]` |

## Boundaries
- `capacity-model` (this agent) — baseline source.
- `build-vs-hire` (this agent) — gap resolution.
- `vista/roadmap-sync` (Exec Office) — roadmap source.
- `spec` (Product) — PRD scope input.
- `felix/budget-scenarios` — hiring cost model.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| capacity-forecast | File read (capacity model · roadmap · PRDs) · File write (forecast) | — | All steps |
