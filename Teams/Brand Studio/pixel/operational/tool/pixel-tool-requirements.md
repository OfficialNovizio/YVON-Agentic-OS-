---
name: pixel-tool-requirements
type: operational/tool
status: derived directly from instructions in each skill file
assigned_agent: pixel (Brand Studio / Production)
date_added: 2026-07-07
---

## Purpose

What each of pixel's skills technically needs.

**This file specifies needs — it does not grant them.** Actual access is a separate runtime-configuration step wherever pixel is deployed; this table is the checklist for whoever configures it.

## Tool Requirements by Skill

| Skill | Required | Optional / Future | Source line |
|---|---|---|---|
| asset-pipeline | File read (style file, kit); file write (assets, manifests); **image viewing** (QA step) | **Image generation connector** (the ceiling-changer: without it, prompts are the deliverable) | Phases 2–4 |
| image-style-guide | File read (kit §5, references); file write (the style file) | Image generation for the test set (else operator supplies test outputs) | Phases 1–2 |
| content-image | None beyond conversation | Source repo's style-library/ + model-specifics.md (pending pointers) | Self-contained |

## Notes

- **Pixel is the department's generation-hungry agent** — the `generation_connector` config is where toongine binds DALL-E/Flux/SD/whatever per business. Everything degrades gracefully to prompts-as-deliverable without it.
- Image viewing is required for honest QA — same caveat as atlas/spark: without it, QA is spec-level and says so.
- No scripts, no web search (OS-level layer).

## How to Apply

File I/O + image viewing is the floor; a generation connector is the full capability.
