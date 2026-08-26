---
name: handoff-protocol
type: custom
status: built from scratch
assigned_agent: handoff (Ops & Delivery / Cross-Team Handoffs)
portable: true
date_added: 2026-07-29
tier: 3
description: "Defines the handoff protocol between teams/agents — envelope structure · echo-confirm · context capping · reference to memory. Enforces the discipline that prevents 'silent handoff' failures."
triggers:
  - handoff protocol
  - how to hand off X
  - cross-team handoff
  - handoff review
  - escalation protocol
  - envelope structure
---

# Handoff Protocol

## Purpose
Own the discipline of cross-team / cross-agent handoffs. Structured envelope · echo-confirm · context cap · memory-reference.

## Protocol
```
ENVELOPE  TO · TASK · CONTEXT · BLOCKING
ECHO      Receiver responds: RECEIVED · UNDERSTOOD · ACKNOWLEDGED
CAP       Context > 200 words → summarise + reference to memory location
RECIPIENT never assumes context; every handoff self-contained
```

## When to Use
- Cross-agent handoff design
- Escalation-protocol design
- Retro finding: "handoff was silent" — this is the fix

## Instructions
Every handoff includes:
- **TO:** specific recipient (agent / team / person)
- **TASK:** what the recipient needs to do
- **CONTEXT:** relevant background (capped at 200 words; else reference)
- **BLOCKING:** yes / no; if yes, what depends on this

Echo-confirm returned by recipient within operator-set SLA.

## Output Format
Handoff envelope + echo confirmation log.

## Principles
- **Never silent.** Every handoff has an envelope.
- **Echo-confirmed** within SLA.
- **Context capped** — memory reference for anything longer.
- **Receiver never assumes** — every handoff self-contained.
- **Blocking flag mandatory.**

## Fallback
| Failure | Response |
|---|---|
| No echo within SLA | Escalate to L2 |
| Ambiguous BLOCKING | Assume blocking; verify with sender |

## Boundaries
- `handoff-registry` (this agent) — logged handoffs.
- `dependency-map` (this agent) — cross-team dependency graph.
- Every dept — this skill's protocol is shared standard.
- Shared OS: `verification-before-completion` · `memory-practices` (Shared OS skills).

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| handoff-protocol | File read/write | Team-comm MCP | All steps |
