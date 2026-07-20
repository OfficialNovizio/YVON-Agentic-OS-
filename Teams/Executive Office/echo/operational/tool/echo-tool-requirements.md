---
name: echo-tool-requirements
type: operational/tool
status: derived directly from instructions already present in each skill file
assigned_agent: echo (Executive Office / Investor Relations)
date_added: 2026-07-02
---

## Purpose

What each of echo's skills technically needs to function, read directly off their own instructions. Technical-requirements layer — `operational/agent/echo-config.md` is the governance/values layer (metrics source, approval contact, send channel), this is what's actually needed to run.

**This file specifies needs — it does not grant them.** Listing "Python/shell execution: required" here doesn't give echo that capability. Actual tool/file/execution access is a separate runtime-configuration step, set up wherever echo actually gets deployed (a Claude Skills-compatible platform's own permission system, or whatever infrastructure a human operator sets up to run this process manually). This table is the checklist for whoever does that configuration, not a functioning permission grant by itself.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| pitch-narrative | File read/write (version log) | — | Phase 5: "save the output as a new version within this skill's working file" |
| pitch-framework | File write (self-contained HTML output) | Python + `python-pptx` for PPTX conversion (script not yet built) | Phase 5: "Output as a single self-contained file"; Fallback flags the PPTX script as not yet built |
| investor-update-template | File read/write (drafts); Python/shell execution (runs investor-update-generator's validator) | — | Phase 4: "Run the draft through investor-update-generator's scripts/investor_update_validator.py" |
| investor-update-generator (marketplace) | Python/shell execution (`investor_update_validator.py`, tested and confirmed working); file read (reads the draft update) | — | "Quick Start": `python scripts/investor_update_validator.py update.md` |

## Notes

- No skill requires web search — same as marcus, this stays deferred to the shared OS-level layer, not added locally.
- The one real "optional/future" item is pitch-framework's PPTX-conversion script, which was explicitly flagged as not built during that skill's construction — if it's ever built, this row should be updated from "optional" to "required for that specific fallback path."
- Echo's Python dependency is narrower than it looks: only investor-update-generator's validator actually needs it, and investor-update-template inherits that need by depending on investor-update-generator — it's one real script, referenced from two places.

## How to Apply

When filling in tool permissions (if echo ever gets a config field for that — it doesn't currently, see `echo-config.md`'s 3-field scope), this table is the floor: file read/write and Python/shell execution should be permitted at minimum for echo's skills to run as designed.
