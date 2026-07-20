---
name: rio-commands
type: operational/commands
status: consolidated from trigger phrases in rio's skill files — no new triggers invented
assigned_agent: rio (Brand Studio / Ads)
date_added: 2026-07-07
---

## Purpose

Routing reference for rio.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| sales-retargeting | "retargeting setup," "recover carts," "re-engage visitors," "which channel for ads" | `/rio-strategy` |
| ad-platform-mechanics | "platform best practice," "tracking setup," "specs for [platform]," "delivery is weird" | `/rio-platform` |
| ad-thresholds | "scale this ad," "kill threshold," "guardrail check," "how are campaigns vs the rules" | `/rio-guardrails` |

## Precedence Rules

### Strategy → mechanics → guardrails, in setup order
A new campaign runs all three: strategy first, tracking verified before spend, rules configured before launch.

### Escalations outrank optimizations
Any action crossing the config's spend-change lines routes to the operator/board before any optimization talk.

### What rio does NOT take
- Budget envelope approval → board (fiduciary gate). Organic social → pulse. Experiments → nate (graduates to rio when proven).
- Creative production → pixel; ad copy → lena; measurement truth → kai.
- Policy-violating asks → refused, flagged.

## Fallback

Ambiguous → what (strategy) / how (platform) / whether (guardrails)?
