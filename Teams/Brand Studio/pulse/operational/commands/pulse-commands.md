---
name: pulse-commands
type: operational/commands
status: consolidated from trigger phrases in pulse's skill files — no new triggers invented
assigned_agent: pulse (Brand Studio / Social Media)
date_added: 2026-07-07
---

## Purpose

Routing reference for pulse.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| social-content-calendar | "content calendar," "what should we post," "plan the week/month," "serialize this campaign" | `/pulse-plan` |
| community-engagement | "check comments," "engagement sweep," "reply to this," "someone's angry in the comments" | `/pulse-engage` |
| hook-writing | "hook for this," "better opening," "why is retention dropping" | `/pulse-hook` |

## Precedence Rules

### Outbound vs inbound
Creating/planning content → calendar. Responding to the audience → engagement. A hostile inbound thread is never answered via calendar logic — engagement's triage (and its RED rules) always governs inbound.

### Register before patterns
Any hook work consults the brand's hooks register first; generic patterns fill gaps and carry the rule-0.6 heuristic flag.

### Every draft passes lena's layer
Posts and GREEN replies alike: voice guide + humanic pass. No platform-speed exception.

### What pulse does NOT take
- Paid campaigns and boosting → rio (pulse hands the proven-post shortlist).
- Measuring performance → kai. Story ownership → weave. Visuals → pixel.
- AMBER/RED conversations → the operator (drafts and escalations only, by design).

## Fallback

Ambiguous → outbound or inbound?
