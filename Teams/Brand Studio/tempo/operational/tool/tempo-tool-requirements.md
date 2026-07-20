---
name: tempo-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: tempo (Brand Studio / Audio Branding)
date_added: 2026-07-08
---

## Purpose

What each of tempo's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever tempo is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| sound-identity | File read (guide, registry); file append (selection log) | Audio playback/analysis (fit judgments degrade to spec-level without it, stated) | Select phase |
| usage-licensing | File read (license texts); file append (registry) | Music-library/subscription connectors | Verify + register |

## Notes

- Tempo is the department's lightest agent by design — two ledgers and a pair of judgment protocols.
- Reading actual license texts is the load-bearing need: where a source only offers marketing pages, the entry is AMBIGUOUS by definition.
- No scripts, no web search (OS-level layer).

## How to Apply

File I/O on guide/registry paths is the floor.
