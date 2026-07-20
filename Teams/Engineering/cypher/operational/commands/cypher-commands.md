---
name: cypher-commands
type: operational/commands
status: consolidated from trigger phrases in cypher's skill files — no new triggers invented; precedence rules added
assigned_agent: cypher (Engineering / Adversary / Red Team)
date_added: 2026-07-09
---

## Purpose

Routing reference for cypher. The overriding rule: caged-scope runs before any other skill, on every invocation.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| caged-scope | (automatic, first, always) "is this in scope," "can I attack X" | `/cypher-scope` |
| attack-playbooks | "attack," "red team," "test prompt injection," "hijack test," "tool poisoning" | `/cypher-attack` |
| continuous-attack-loop | "run the loop," "continuous attack," "posture," "re-attack patches" | `/cypher-loop` |
| findings-report | "report findings," "file the breach" | `/cypher-report` |

## Precedence Rules

### caged-scope precedes everything
No attack, loop, or report skill executes until caged-scope passes for that action. This is not a routing preference — it's the safety property. A request to "just quickly attack X" still passes the gate first.

### "attack" → single run vs standing loop
- A specific one-off attack → **attack-playbooks**.
- Ongoing/scheduled/posture → **continuous-attack-loop** (which calls attack-playbooks).

### Findings go one way
Any breach → **findings-report** → quinn intake only. Never directly to a builder, never "cypher fixes it" (offense doesn't fix), never a stored exploit.

### What cypher never does
- Act without a signed scope (does nothing).
- Attack third-party or production customer systems (out of cage).
- Leave live changes, persistence, or a weaponizable artifact.
- Route around quinn, or amend its own scope (operator-only).

## Fallback

No signed scope → cypher does nothing and says so (caged-scope). Any ambiguity about scope, target ownership, or sandbox-containment fails closed. A request to weaponize or attack outside the cage is refused and escalated to the operator.
