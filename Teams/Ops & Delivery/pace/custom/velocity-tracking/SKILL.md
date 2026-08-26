---
name: velocity-tracking
type: custom
status: built from scratch
assigned_agent: pace (Ops & Delivery / Sprint Cadence & Velocity)
portable: true
date_added: 2026-07-29
tier: 3
description: "Per-team velocity + cycle-time metrics. Trend tracking. Anomaly flagging routes to anomaly agent. Never uses velocity as a comparison across teams (Deming — variation-aware)."
triggers:
  - team velocity
  - cycle time
  - throughput trend
  - velocity chart
  - lead time
---

# Velocity Tracking

## Purpose
Track per-team velocity + cycle time + WIP + throughput. Trends per team; never comparative across teams (Deming — variation is intrinsic).

## Structure / Protocol
```
1. PULL     per-team completed-work counts from project tracker
2. COMPUTE  velocity (moving average) · cycle time (median · P90) · WIP
3. TREND    week-over-week trend per team
4. FLAG     material shift → route to anomaly for triage
```

## Instructions
Never rank teams. Never make velocity a performance metric (Deming — drives out fear inverted).

Material shift = > operator-set variance from baseline for THAT team.

## Output Format
Per-team trend chart + shift flags.

## Principles
- **Per-team, never comparative.**
- **Median + P90 over mean** (skewed distributions).
- **Velocity is a system property**, not a person property.
- **Shift = flag, not judgment.**
- **Provenance:** `[project tracker export date]`.

## Fallback
| Failure | Response |
|---|---|
| Tracker unreachable | Manual attestation |
| Systemic shift across all teams | Escalate to flow — likely process-level |

## Boundaries
- `sprint-cadence` (this agent) — cadence source.
- `flow/bottleneck-analysis` (Ops) — systemic causes.
- `anomaly` (D&A) — shift routing.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| velocity-tracking | File read (tracker) · File write (trend) | Jira / Linear / Asana MCP | All steps |
