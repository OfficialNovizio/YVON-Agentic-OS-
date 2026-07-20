---
name: weave-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: weave (Brand Studio / Storytelling)
date_added: 2026-07-07
---

## Purpose

What each of weave's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever weave is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| brand-story-arcs | File read (arc file); file append (chapter registry — append-only, corrections by reference) | — | Phase 1 load; Phase 4 register |
| brand-storytelling | File read (references/guest-insights.md) | — | "Deep Dive" pointer |

## Notes

- Weave is the lightest agent in the department: two files read, one appended. Its leverage is entirely in judgment against written narrative law.
- The chapter registry follows precedent's append-only discipline; in toongine deployment it resolves to graph memory like every ledger in this system.
- No scripts, no web search (OS-level layer).

## How to Apply

File read on arc/reference paths + append on the registry is the floor.
