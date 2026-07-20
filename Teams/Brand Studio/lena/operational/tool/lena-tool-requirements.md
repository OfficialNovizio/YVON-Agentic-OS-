---
name: lena-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: lena (Brand Studio / Brand Voice)
date_added: 2026-07-07
---

## Purpose

What each of lena's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever lena is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| voice-guides | File read (voice-guide file); file append (override log) | — | Phase 1 load; Phase 4 flag/log |
| copywriting | None beyond conversation | — | "Prerequisites: None" (source's own line) |
| email-marketer | File write (sequence packages) | Email/ESP connector for send + engagement metrics readback | Output format; deliverability diagnostics need real metrics |
| humanic-writing | File read (voice guide, assets: tells catalog + archetypes) | — | Phase 1 sources |

## Notes

- Lena is deliberately light: no scripts, no Python. Her leverage is text craft against written guides.
- The email connector is the one integration that changes lena's ceiling — without it she designs sequences; with it (plus kai's metrics) deliverability diagnostics use real engagement data instead of operator-reported symptoms.
- No web search — OS-level layer, as everywhere.

## How to Apply

File read on guide/asset paths + file write for packages is the floor.
