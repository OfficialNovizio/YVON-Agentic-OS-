---
name: rio-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: rio (Brand Studio / Ads)
date_added: 2026-07-07
---

## Purpose

What each of rio's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever rio is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| ad-thresholds | File read (config, metrics); file append (verdict log) | **Ad-platform connectors** (metrics readback; else operator exports); write access for auto-pause ONLY where granted | Phases 1–4 |
| ad-platform-mechanics | File read/write (playbooks) | Research layer (shared, future) for refresh | Setup + cadence |
| sales-retargeting | None beyond conversation | Source repo's platform-guide reference (pending pointer) | Self-contained |

## Notes

- **Rio's write access is deliberately narrow**: metrics readback is the working mode; campaign *changes* execute via the operator (or auto-pause within its explicit, capped grant). Money-touching actions stay human by default — consistent with the system-wide financial-action posture.
- Verdict logs are append-only, kai-consumable.
- No scripts (threshold comparisons are per-decision trivial; a patrol script is a future 5.2 proposal if campaign count demands it).

## How to Apply

File I/O + metrics readback is the floor; the operator's hands stay on the spend levers.
