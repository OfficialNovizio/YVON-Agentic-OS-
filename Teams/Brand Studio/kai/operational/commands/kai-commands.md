---
name: kai-commands
type: operational/commands
status: consolidated from trigger phrases in kai's skill files — no new triggers invented
assigned_agent: kai (Brand Studio / Analyst)
date_added: 2026-07-07
---

## Purpose

Routing reference for kai.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| marketing-dashboards | "weekly marketing report," "scorecard," "how did the week go," "how are we doing" | `/kai-scorecard` |
| brand-context | "[brand] performance," "[brand] audience," "what's normal for us," "update the baselines" | `/kai-context` |
| seo-strategist | "seo check," "rank for," "content brief," "why isn't this page ranking" | `/kai-seo` |
| (instrumentation queue) | "we can't measure X," "instrumentation gap" | `/kai-queue` |

## Precedence Rules

### Context loads first, always
Every analysis opens the brand's context file; answers cite baselines with dates or say "no baseline."

### Numbers questions vs channel questions
"How is [channel] doing" → the scorecard's section (kai's independent read beside the platform's). "Why is [channel] doing that" → the owning agent, with kai's data attached.

### What kai does NOT take
- Fixing what the numbers show → the owning agents (kai grades, routes reds, never patches).
- Defining NSM/targets → vista. Writing SEO content → lena. Inventing breach rules or baselines → never (operator-set / instrumented only).

## Fallback

Ambiguous → grade (scorecard), ground (context), or search (SEO)?
