---
name: capacity-model
type: custom
status: built from scratch
assigned_agent: capacity (Ops & Delivery / Capacity Planning)
portable: true
date_added: 2026-07-29
tier: 3
description: "Per-team + per-agent (AI) capacity model. FTE-months available · committed · in-flight. Feeds pace/delivery-forecast + felix/budget-scenarios. Never counts on unauthorised overtime."
triggers:
  - capacity model
  - team capacity
  - are we over-committed
  - capacity for feature X
  - capacity planning
  - staffing capacity
---

# Capacity Model

## Purpose
Per-team + per-AI-agent capacity — available · committed · in-flight · buffer.

## Structure / Protocol
```
1. INTAKE     team roster + agent roster + PTO calendar
2. AVAILABLE  FTE-months minus PTO minus meetings-overhead
3. COMMITTED  from pace/velocity-tracking + planned commitments
4. GAP        available - committed = buffer (± sign)
5. RETURN     per-team/agent capacity table + over/under-commit flags
```

## Instructions
Meeting overhead per role from config (typically 15-25%).

Never counts on overtime beyond operator-declared sustainable pace.

## Output Format
Per-team table + agent-level table (AI agents) + flags.

## Principles
- **Sustainable pace only.** No overtime assumption.
- **PTO honoured** as unavailable.
- **Meeting overhead subtracted honestly.**
- **Buffer negative = over-committed** = flag.
- **Per-team + per-agent** — never lumped.

## Fallback
| Failure | Response |
|---|---|
| PTO calendar unavailable | Flag partial |
| Roster ambiguous | Ask |

## Boundaries
- `build-vs-hire` (this agent) — gap resolution.
- `capacity-forecast` (this agent) — forward projection.
- `pace/delivery-forecast` — consumes capacity model.
- `felix/budget-scenarios` — hiring cost input.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| capacity-model | File read/write | HR MCP for roster · Calendar MCP for PTO | All steps |
