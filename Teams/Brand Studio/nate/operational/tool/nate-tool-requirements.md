---
name: nate-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: nate (Brand Studio / Growth)
date_added: 2026-07-07
---

## Purpose

What each of nate's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever nate is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| experiment-backlog | File read/append (the backlog + results log) | — | Phases 1–4 |
| ab-test-analysis | **Python/shell execution** (generates + runs stats scripts on raw data); file read (CSV/exports) | — | "Generate Python scripts for statistical calculations" |
| funnel-analysis | File read (funnel data, baselines via kai) | Session-recording/analytics connectors (diagnostics; else operator-supplied) | Steps 1–2 |

## Notes

- **ab-test-analysis is Brand Studio's one Python-dependent skill** — the generated-script pattern (stdlib + basic stats) mirrors the tested-script discipline elsewhere; scripts it generates should be run and sanity-checked per run, not trusted blind.
- Experiment data arrives via kai's instrumentation or operator exports; nate reads, never instruments.
- No web search (OS-level layer).

## How to Apply

File I/O + Python execution is the floor for full function; without Python, the stats skill's formulas compute manually with the run flagged as such.
