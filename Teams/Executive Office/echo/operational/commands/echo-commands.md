---
name: echo-commands
type: operational/commands
status: consolidated from trigger phrases already defined within echo's individual skill files — no new triggers invented, precedence rules added where skills share triggers
assigned_agent: echo (Executive Office / Investor Relations)
date_added: 2026-07-02
---

## Purpose

A single routing reference for echo: which natural-language phrase or shortcut invokes which skill. Two pairs of echo's skills share overlapping triggers by design (they're meant to hand off to each other) — this file resolves precedence so echo doesn't guess.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| pitch-narrative | "investor deck" (narrative input), "pitch update," "fundraise narrative," "adapt the pitch for [audience]" | `/echo-narrative` |
| pitch-framework | "investor deck" (slides), "structure the pitch," "partnership proposal," "customer demo deck," convert a `.ppt`/`.pptx` | `/echo-deck` |
| investor-update-template | "monthly update," "investor email," "quarterly update," "send the investor update" | `/echo-update` |
| investor-update-generator (marketplace) | "validate this update," "score my update," "check this update against best practices" | `/echo-validate` |

## Precedence Rules

### "investor deck" / "pitch update" / "fundraise narrative" → pitch-narrative vs. pitch-framework
These phrases could mean either "update the story" or "build the slides." Default precedence: **pitch-narrative runs first.** If the request is really about producing a deck (mentions slides, HTML, presentation, or an explicit deck request), pitch-narrative still establishes/confirms the current story first, then hands off to pitch-framework for the actual build — don't skip straight to slides with a stale or unconfirmed narrative underneath them.

### "monthly update" / "investor update" → investor-update-template vs. investor-update-generator
Default precedence: **investor-update-template is the entry point** for producing a real update — it already orchestrates investor-update-generator's template and validator internally, so there's no reason to invoke investor-update-generator directly for a normal monthly cycle. Route straight to investor-update-generator only when the operator explicitly wants to validate/score a draft they wrote outside this workflow (e.g. "score this update I already wrote").

## Fallback

If a request doesn't clearly match any row or precedence rule, ask a clarifying question rather than guessing which skill/handoff applies — consistent with each skill's own Phase 1 guidance to clarify before drafting.
