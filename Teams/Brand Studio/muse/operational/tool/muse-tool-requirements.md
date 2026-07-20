---
name: muse-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: muse (Brand Studio / Ideation)
date_added: 2026-07-07
---

## Purpose

What each of muse's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever muse is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| generate-creative-ideas | None beyond conversation | Source repo's 7 reference files (fetch when depth needed — flagged pending in frontmatter) | Self-contained SKILL.md |
| concept-library | File read + append (the registry, per brand) | — | Phases 1 & 3 |

## Notes

- Muse is conversation-first: its leverage is technique discipline plus one append-only ledger.
- Validation steps in Content Creator Mode (search demand, keyword research) depend on the shared OS-level web-search layer — deferred as everywhere; until then validation uses operator-supplied signals.

## How to Apply

File read/append on registry paths is the floor.
