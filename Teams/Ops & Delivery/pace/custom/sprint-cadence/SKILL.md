---
name: sprint-cadence
type: custom
status: built from scratch
assigned_agent: pace (Ops & Delivery / Sprint Cadence & Velocity)
portable: true
date_added: 2026-07-29
tier: 3
description: "Owns sprint / cycle cadence across teams. Cadence per team from config (weekly / two-week / monthly). Retro items feed process-mapping / bottleneck-analysis."
triggers:
  - sprint cadence
  - sprint planning
  - retro items
  - cadence setup
  - team cadence
---

# Sprint Cadence

## Purpose
Own cadence rituals across teams — planning · standup · review · retro. Cadence per team.

## Structure / Protocol
```
1. CONFIG   per-team cadence + timezone + participants
2. SCHEDULE next-cycle events; surface conflicts
3. RETRO    collect retro items; tag as process / people / tools
4. ROUTE    process retro items → flow (process-mapping / bottleneck)
```

## Instructions
Retro items with "root-cause-unclear" → flag for `flow/bottleneck-analysis`.

## Output Format
Cadence calendar per team + retro-item log.

## Principles
- **Cadence per team from config.** Never enforced universally.
- **Retro items tracked**, never discarded.
- **Process-tagged items route to flow.**
- **Verification-before-completion inherited.**

## Fallback
| Failure | Response |
|---|---|
| Cadence conflict | Surface; ask operator |

## Boundaries
- `velocity-tracking` (this agent) — cycle-time trending.
- `flow` (Ops) — process root-cause fix.
- `capacity` (Ops) — capacity input.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| sprint-cadence | File read/write | Calendar MCP | All steps |
