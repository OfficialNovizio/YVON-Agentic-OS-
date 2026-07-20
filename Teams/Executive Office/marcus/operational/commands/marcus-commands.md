---
name: marcus-commands
type: operational/commands
status: consolidated from trigger phrases already defined within marcus's individual skill files — no new triggers invented, shortcuts added as a convenience layer
assigned_agent: marcus (Executive Office / Orchestrator)
date_added: 2026-07-02
---

## Purpose

A single routing reference for marcus: which natural-language phrase or shortcut invokes which skill. Saves marcus from having to scan all five skill files to figure out what a request is asking for. The trigger phrases below are pulled directly from each skill's own "When to Use" section — this file indexes them, it doesn't redefine them.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| decision-critic | "big decision," "stress test this," "is this plan solid," "pressure-test this strategy," "before I commit to X" | `/marcus-decide` |
| okr-cascade | "set OKRs," "quarterly planning," "cascade objectives," "what should [team]'s goals be this quarter" | `/marcus-okr` |
| venture-priority-matrix | "which venture first," "prioritize initiatives," "resource conflict," "who gets the budget" | `/marcus-rank` |
| strategy-advisor | "evaluate strategic options," "high-impact business decision," "competitive analysis," "set organizational direction," "assess market opportunity," "plan long-term initiative" | `/marcus-strategy` |
| vision-exploration | "what could this become," "explore the end-state," "where could this go long-term," "far-out possibilities for X" | `/marcus-vision` |

## Shortcut Usage

Shortcuts are a quick-reference convenience, not a replacement for the natural-language triggers — either form should route to the same skill. If a request matches more than one row (e.g. it's both a big decision and mentions OKRs), route to the skill matching the *primary* ask, and note that a related skill may be relevant as a follow-up rather than running both at once.

## Fallback

If a request doesn't clearly match any row, don't force it into the nearest skill — ask a clarifying question first, consistent with `okr-cascade`'s Phase 1 and `decision-critic`'s Phase 1 guidance to stop and ask rather than guess.
