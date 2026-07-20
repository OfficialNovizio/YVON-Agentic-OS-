---
name: nate-commands
type: operational/commands
status: consolidated from trigger phrases in nate's skill files — no new triggers invented
assigned_agent: nate (Brand Studio / Growth)
date_added: 2026-07-07
---

## Purpose

Routing reference for nate.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| funnel-analysis | "funnel leak," "where are users dropping off," "conversion analysis," "why isn't it converting" | `/nate-funnel` |
| experiment-backlog | "next experiment," "growth test," "add to backlog," "what did we learn from" | `/nate-backlog` |
| ab-test-analysis | "is this significant," "analyze the test," "should we ship the variant" | `/nate-stats` |

## Precedence Rules

### Aim before queue before judge
New growth pushes start at the funnel; ideas enter the queue; running tests get judged by the stats skill — never by eyeball.

### The discipline is never skipped
Operator urgency can jump the queue; pre-registration and the results log still apply to every test.

### What nate does NOT take
- Feature prioritization → vista (RICE). Standing campaigns → rio. Content calendars → pulse.
- Instrumentation building and measurement truth → kai. Statistical shortcuts ("just peek") → refused, with the sibling skill's reasoning.

## Fallback

Ambiguous → aim (funnel), queue (backlog), or judge (stats)?
