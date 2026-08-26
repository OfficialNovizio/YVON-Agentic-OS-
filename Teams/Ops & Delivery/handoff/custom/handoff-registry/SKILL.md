---
name: handoff-registry
type: custom
status: built from scratch
assigned_agent: handoff (Ops & Delivery / Cross-Team Handoffs)
portable: true
date_added: 2026-07-29
tier: 3
description: "Logged registry of cross-team handoffs. Tracks: envelope · echo · resolution time · outcome. Surfaces silent-handoff patterns."
triggers:
  - handoff registry
  - log this handoff
  - handoff history
  - silent handoff patterns
  - handoff SLA report
---

# Handoff Registry

## Purpose
Every cross-team / cross-agent handoff logged. Enables pattern detection (which handoffs go silent · which teams under-echo · which categories have longest resolution).

## Structure / Protocol
```
LOG    envelope + echo + resolution
QUERY  by sender / receiver / status / category
PATTERN weekly report: silent-rate · avg resolution · echo-SLA compliance
```

## Instructions
Every handoff gets a slug + envelope + echo status + resolution timestamp.

Weekly pattern report: silent-handoff rate · avg resolution time · echo-SLA compliance per team.

## Output Format
Registry table + pattern report.

## Principles
- **Every handoff logged.**
- **Silent handoffs surfaced** as patterns, not blamed individually.
- **Never delete history.**
- **Pattern reports feed `flow`** for process fixes.

## Boundaries
- `handoff-protocol` (this agent) — protocol source.
- `dependency-map` (this agent) — depends-on graph.
- `flow` (Ops) — process-level fix consumer.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| handoff-registry | File read/write | Team-comm MCP for auto-log | All steps |
