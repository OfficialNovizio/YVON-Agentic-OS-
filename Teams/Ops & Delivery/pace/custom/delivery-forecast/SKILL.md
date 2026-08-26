---
name: delivery-forecast
type: custom
status: built from scratch
assigned_agent: pace (Ops & Delivery / Sprint Cadence & Velocity)
portable: true
date_added: 2026-07-29
tier: 3
description: "Monte-Carlo probabilistic delivery-date forecast. Uses velocity history + WIP. Returns date range at 50 / 85 / 95 percentiles. Never a single point."
triggers:
  - when will we ship
  - delivery forecast
  - probability of shipping by date X
  - Monte Carlo forecast
  - date range for feature Y
---

# Delivery Forecast

## Purpose
Probabilistic delivery-date forecast via Monte Carlo simulation of velocity + WIP + backlog.

## Structure / Protocol
```
1. INTAKE     backlog scope (story count · size) + team
2. HISTORY    velocity + cycle-time distribution from velocity-tracking
3. SIMULATE   1000+ Monte Carlo runs of remaining backlog through team throughput
4. RETURN     P50 · P85 · P95 delivery dates + confidence context
```

## Instructions
Never a single date. Always P50 / P85 / P95 (or per-config percentile).

## Output Format
Date range + P-values + histogram (via viz) + assumptions.

## Principles
- **Ranges, not points.**
- **Every forecast cites history depth** (last N sprints used).
- **Assumptions listed** (no team change · no scope creep · no dependency slip).
- **Never a promise** — a forecast is a distribution.

## Fallback
| Failure | Response |
|---|---|
| Insufficient history | Report thin; recommend baseline sprints first |
| Scope unclear | Ask; do not assume |

## Boundaries
- `velocity-tracking` (this agent) — history source.
- `sprint-cadence` (this agent) — cadence input.
- `capacity` (Ops) — capacity constraints input.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| delivery-forecast | File read (velocity data) · Python execution (Monte Carlo) | Statistical library | All steps |
