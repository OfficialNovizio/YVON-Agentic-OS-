---
name: dependency-map
type: custom
status: built from scratch
assigned_agent: handoff (Ops & Delivery / Cross-Team Handoffs)
portable: true
date_added: 2026-07-29
tier: 3
description: "Cross-team dependency graph. Static (org-chart of who-needs-whom for what) + dynamic (in-flight handoffs). Feeds pace/delivery-forecast + capacity/capacity-forecast."
triggers:
  - dependency map
  - who depends on X
  - who does X depend on
  - dependency graph
  - critical path
  - cross-team dependencies
---

# Dependency Map

## Purpose
Static + dynamic cross-team dependency map. Static = "team A regularly needs team B for X". Dynamic = specific in-flight handoffs.

## Structure / Protocol
```
1. STATIC    register recurring dependencies
2. DYNAMIC   overlay from handoff-registry active handoffs
3. CRITICAL  identify critical path across teams
4. RETURN    graph + critical-path list
```

## Output Format
Graph (via viz) + critical-path list + bottleneck teams.

## Principles
- **Static + dynamic layered honestly.**
- **Critical path = longest chain of dependencies**, not the busiest team.
- **Feeds delivery + capacity forecasts.**
- **Never blames a team** — surfaces structural bottleneck.

## Boundaries
- `handoff-protocol` + `handoff-registry` (this agent).
- `pace/delivery-forecast` + `capacity/capacity-forecast` — consumers.
- `flow/bottleneck-analysis` — cross-team version of same concept.
- `viz` — graph rendering.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| dependency-map | File read/write | Viz graph rendering | All steps |
