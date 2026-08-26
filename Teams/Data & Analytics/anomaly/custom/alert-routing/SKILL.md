---
name: alert-routing
type: custom
status: built from scratch
assigned_agent: anomaly (Data & Analytics / Anomaly Detection)
portable: true
date_added: 2026-07-29
tier: 3
description: "Routes fired anomaly alerts to the right destination (agent · human · channel · scheduled task). Enforces cooldowns. Suppresses duplicates. Never re-fires an unresolved alert."
triggers:
  - alert routing
  - route this alert
  - who handles X alerts
  - alert suppression
  - alert cooldown check
---

# Alert Routing

## Purpose
When `anomaly-detection-rules` fires, route the alert. Enforce cooldowns, suppress duplicates, ensure ownership.

## When to Use
- Automatic on rule fire.
- Manual: "route this alert" · "who handles X alerts" · "alert suppression override".

## Structure / Protocol
```
1. RECEIVE  fired rule + metric value + context
2. LOOKUP   destination (from rule.route_to)
3. COOLDOWN check last-fired for this rule; suppress if inside cooldown
4. DEDUPE   suppress if identical alert unresolved
5. ROUTE    to agent handoff / human notification / channel
6. LOG      to alert-log for post-hoc review
```

## Instructions
Destination types: agent handoff (via routing) · Slack/Teams channel · email · scheduled task creation · noop (log-only for tuning).

Cooldown: from rule config; typically 15m for warning, 5m for critical.

Dedupe: identical (rule + metric + severity) → suppress; count in log.

## Output Format
Route confirmation + destination + suppression reason (if any).

## Principles
- **Cooldown enforced.** Never alert-fatigue.
- **Never re-fire unresolved.** Same rule + open incident = suppress.
- **Every fire logged** even if suppressed.
- **Never guess destination.** If rule missing route_to, halt + surface.

## Fallback
| Failure | Response |
|---|---|
| Destination unreachable | Fall back to log-only + flag to `anomaly` |
| Rule with no route_to | Halt; require configuration first |

## Boundaries
- `anomaly-detection-rules` (this agent) — supplies fires.
- `incident-triage-data` (this agent) — receives routed alerts for investigation.
- Cross-agent: whichever agent handles the domain (felix / metric / warden / etc.).
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| alert-routing | File read/write (alert-log) | Slack MCP · Email MCP · scheduled-task API | All steps |
