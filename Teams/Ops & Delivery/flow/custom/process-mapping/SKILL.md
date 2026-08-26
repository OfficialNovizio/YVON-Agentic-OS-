---
name: process-mapping
type: custom
status: built from scratch
assigned_agent: flow (Ops & Delivery / Process Design — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Map any recurring process — steps, owners, inputs, outputs, cycle time, wait time. Uses Deming's SIPOC + value-stream discipline. Never invents steps."
triggers:
  - map this process
  - process map
  - SIPOC
  - value stream map
  - workflow map
  - how do we currently do X
---

# Process Mapping

## Purpose
Structured mapping of any recurring process using SIPOC (Supplier · Input · Process · Output · Customer) + value-stream (activity vs wait time).

## Structure / Protocol
```
1. SCOPE      process name + start / end
2. SIPOC      suppliers · inputs · process-steps · outputs · customers
3. STEPS      per step: who · time-active · time-waiting · rework rate
4. FLOW       Sankey / value-stream diagram (routes to viz)
5. RETURN     map + bottleneck flags + Deming waste categories
```

## Instructions
Steps come from actual observation / operator description. No inventing.

Deming waste categories (per each step): transportation · inventory · motion · waiting · overproduction · overprocessing · defects · underused talent.

Bottleneck = step with highest cycle time OR rework rate OR wait-before ratio.

## Output Format
SIPOC table + step table + bottleneck flags + waste tags per step.

## Principles
- **Only real observed steps.** No idealised process.
- **Wait time is a first-class field.**
- **Waste categorisation per step.**
- **Bottleneck named**, not vaguely referenced.
- **Provenance:** `[observed]` `[operator description]` `[log data]`.

## Fallback
| Failure | Response |
|---|---|
| Process unclear | Ask for walkthrough; do not guess |
| No timing data | Flag qualitative-only map |

## Boundaries
- `bottleneck-analysis` (this agent) — deep-dive on flagged bottleneck.
- `sop-registry` (this agent) — mapped process → documented SOP.
- `pace` (Ops) — cycle time trending.
- `capacity` (Ops) — capacity implications of map.
- `viz` (D&A) — Sankey / value-stream rendering.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| process-mapping | File read/write | Viz rendering handoff · Process-mining MCP | All steps |
