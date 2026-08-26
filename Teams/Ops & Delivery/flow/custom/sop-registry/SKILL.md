---
name: sop-registry
type: custom
status: built from scratch
assigned_agent: flow (Ops & Delivery / Process Design — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Standard Operating Procedure library. Every SOP: process (from process-mapping) · steps · owner · last-reviewed · version. Retirement records why."
triggers:
  - SOP for X
  - standard operating procedure
  - document this process
  - SOP library
  - register an SOP
  - update SOP
  - which SOP for Y
---

# SOP Registry

## Purpose
Versioned SOP library. Every documented process traces to a `process-mapping` output.

## Structure / Protocol
```
REGISTER  new SOP → derived from process-mapping → owner + review cadence
UPDATE    version bump on process change
REVIEW    per-SOP cadence; owner attests still-accurate
RETIRE    process no longer used; record reason
LOOKUP    by process name / by owner / by dept
```

## Instructions
Fields: `slug`, `process_map_ref`, `owner_agent`, `dept`, `steps` (from map), `version`, `effective_date`, `review_cadence` (annual default), `last_reviewed`.

SOP without an underlying `process-mapping` output = defect. Every SOP references the map.

## Output Format
SOP body + metadata. Registry table.

## Principles
- **Every SOP traces to a process map.**
- **Owner attests review** — never system-inferred still-accurate.
- **Version control** — every change archived.
- **Retirement records reason.**
- **Never delete history.**

## Fallback
| Failure | Response |
|---|---|
| No process map for proposed SOP | Halt; run `process-mapping` first |
| Owner unresponsive to review | Escalate L2 |

## Boundaries
- `process-mapping` (this agent) — source of steps.
- `bottleneck-analysis` (this agent) — triggers SOP update when process changes.
- Other dept agents (any) — owners of specific SOPs.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| sop-registry | File read/write | — | All steps |
