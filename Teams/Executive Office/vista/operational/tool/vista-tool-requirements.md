---
name: vista-tool-requirements
type: operational/tool
status: derived directly from instructions already present in each skill file
assigned_agent: vista (Executive Office / Roadmap Lead)
date_added: 2026-07-06
---

## Purpose

What each of vista's skills technically needs to function, read directly off their own instructions. This is the technical layer; governance values live in `operational/agent/vista-config.md`.

**This file specifies needs — it does not grant them.** Listing "Python/shell execution: required" here doesn't give vista that capability. Actual tool/file/execution access is a separate runtime-configuration step, set up wherever vista is deployed (a Claude Skills-compatible platform's permission system, or whatever infrastructure a human operator runs the process with). This table is the checklist for whoever does that configuration, not a functioning permission grant by itself.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| okr-quality-checker | None beyond reading the OKRs under review | — | Pure methodology; verification report is conversational/file output |
| rice-prioritization | File write (saves the ranked report) | Subagent dispatch for parallel scoring (degrades to sequential without it, per SKILL.md comment block) | "Report structure": "save it to rice-prioritization-<slug>-<date>.md"; Stage 2 parallel scorers |
| north-star-metric | Python/shell execution (`scripts/metric_tree_builder.py`, tested 2026-07-06); file read/write (spec JSON in, rendered tree out) | — | "Quick Start": `python scripts/metric_tree_builder.py ...` |
| roadmap-sync | Python/shell execution (`scripts/roadmap_sync.py`, tested 2026-07-06); file read/write (input JSON, drift table) | — | Phase 3: "run `python scripts/roadmap_sync.py <input.json>`" |

## Notes

- No skill requires web search — deferred to the shared OS-level layer, same as marcus and echo.
- Both Python scripts are stdlib-only: no package installation needed at deployment.
- rice-prioritization's subagent dispatch is the one capability that varies by platform; the skill's documented fallback (sequential scoring with the same calibration) means it is optional, not required.

## How to Apply

When configuring vista's runtime permissions, this table is the floor: file read/write and Python/shell execution should be permitted at minimum for vista's skills to run as designed.
