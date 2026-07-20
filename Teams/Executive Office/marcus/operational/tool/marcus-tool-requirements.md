---
name: marcus-tool-requirements
type: operational/tool
status: derived directly from instructions already present in each skill file — corrected before writing to remove a web-search claim that wasn't actually in the built files
assigned_agent: marcus (Executive Office / Orchestrator)
date_added: 2026-07-02
---

## Purpose

What each of marcus's skills technically needs to function, read directly off their own instructions. This is the technical-requirements layer; `operational/agent/marcus-config.md`'s `tool_permissions` field is the governance layer (what's *allowed*) — this file is what's actually *needed*, so whoever fills in that config can see the gap between the two.

**This file specifies needs — it does not grant them.** Listing "Python/shell execution" here doesn't give marcus that capability. Actual tool/file/execution access is a separate runtime-configuration step, set up wherever marcus actually gets deployed (a Claude Skills-compatible platform's own permission system, or whatever infrastructure a human operator sets up to run this process manually). This table is the checklist for whoever does that configuration, not a functioning permission grant by itself.

## Tool Requirements by Skill

| Skill | Required | Optional | Source line |
|---|---|---|---|
| decision-critic | None (pure reasoning) | Access to a second model (Codex, Gemini, another Claude instance) for cross-checking | "If the operator wants a second opinion and another model is reachable, run the same plan through it" |
| okr-cascade | File write (save markdown output) | File read (if context is supplied as documents) | "Save substantial output as a markdown document... if requested" |
| venture-priority-matrix | Python/shell execution (runs `scripts/priority_matrix.py`); file read/write (JSON input, optional JSON output) | — | Explicit script usage in Instructions phase 4; has a manual-reasoning fallback if Python isn't available |
| strategy-advisor | None (pure reasoning framework) | — | Verbatim marketplace copy — no tool instructions in the source |
| vision-exploration | File write (archive end-state artifacts to a directory) | — | "Archive files under a topic-named directory... Confirm the directory and file names with the user" |

## Notes

- Only decision-critic and venture-priority-matrix have any *optional* tool need beyond standard reasoning/file access — everything else is either pure reasoning (strategy-advisor) or basic file I/O (okr-cascade, vision-exploration).
- No skill currently requires web search. If a future revision of any skill adds research/benchmarking steps (e.g. reintroducing something like brainstorm-okrs's original "use web search to understand industry benchmarks" step, which was not carried into the final okr-cascade merge), this file should be updated to reflect that at the same time.
- venture-priority-matrix's Python requirement is the only hard dependency on an external runtime among marcus's skills — everything else degrades gracefully to reasoning-only.

## How to Apply

When filling in `operational/agent/marcus-config.md`'s `tool_permissions.allowed` list, this table is the floor — at minimum, file read/write and Python/shell execution should be permitted for marcus to run its skills as designed. Anything beyond that (web search, cross-model access, external connectors) is optional and should be a deliberate policy choice, not a default.
