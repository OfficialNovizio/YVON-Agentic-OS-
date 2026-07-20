---
name: pulse-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: pulse (Brand Studio / Social Media)
date_added: 2026-07-07
---

## Purpose

What each of pulse's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever pulse is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| social-content-calendar | File read (playbooks, register, arc, voice guide); file write (calendars, packages); file append (register) | **Per-platform publish connectors** (else ready-to-post packages); shared web-search layer for playbook research | Phases 1–4 |
| community-engagement | File read (scope rules); file append (sweep logs) | **Per-platform engage connectors** (else operator exports); scheduled execution for true cadence | Phases 1–3 |
| hook-writing | None beyond conversation | — | Self-contained |

## Notes

- **Pulse is the connector-defined agent**: its ceiling is exactly the per-platform bindings in config (read/publish/engage per platform). Everything degrades gracefully and honestly without them — the method never changes, only the transport (per the 2026-07-07 multi-platform discussion).
- The register and sweep logs are append-only ledgers, system discipline as everywhere; in toongine they resolve to graph memory.
- Playbook refresh via live research awaits the shared OS-level web-search layer; until then operator observations + kai's data are the refresh sources.

## How to Apply

File I/O on playbooks/register/logs is the floor; per-platform connectors are the full capability.
