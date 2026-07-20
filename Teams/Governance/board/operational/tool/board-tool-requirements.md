---
name: board-tool-requirements
type: operational/tool
status: derived directly from instructions already present in each skill file
assigned_agent: board (Governance / Governance Gate)
date_added: 2026-07-06
---

## Purpose

What each of board's skills technically needs to function, read off their own instructions. Governance values live in `operational/agent/board-config.md`; this is the technical layer.

**This file specifies needs — it does not grant them.** Listing "Python/shell execution: required" doesn't give board that capability. Actual tool/file/execution access is a separate runtime-configuration step, set up wherever board is deployed (a Claude Skills-compatible platform's permission system, or whatever infrastructure a human operator runs the process with). This table is the checklist for whoever does that configuration, not a functioning permission grant by itself.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| constitution-enforcement | File read (constitution at `constitution_path`); file write/append (decision log) | — | Phase 1 "Read the constitution from the path in board's config"; Phase 6 logging |
| strategic-veto | File read (commitments at `locked_commitments_path`); file write/append (decision log) | — | Phase 1 load; Phase 5 logging |
| fiduciary-guard | Python/shell execution (`scripts/fiduciary_check.py`, tested 2026-07-06); file read (input JSON, financials source); file write/append (decision log) | Connector to a live financials source (until then, operator supplies cash/burn per run) | Phase 3 "run scripts/fiduciary_check.py"; Phase 2 financials |
| risk-assessment-matrix | Python/shell execution (`scripts/risk_matrix.py`, tested 2026-07-06); file read/write (input JSON, risk register) | — | Instructions step 3; step 6 register logging |
| pre-mortem (marketplace) | None beyond conversation; file write if the session output is saved | — | Facilitation/templates are conversational |

## Notes

- Both scripts are stdlib-only — no package installation at deployment.
- No skill requires web search — deferred to the shared OS-level layer, consistent with all agents so far.
- The heaviest recurring dependency is *file read of operator-authored documents* (constitution, commitments) — those documents existing is a content prerequisite, not a tool grant; see board-config Instructions 1.

## How to Apply

When configuring board's runtime permissions: file read/write and Python/shell execution are the floor for board's skills to run as designed.
