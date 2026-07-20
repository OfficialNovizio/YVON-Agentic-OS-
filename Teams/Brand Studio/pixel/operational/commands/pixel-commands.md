---
name: pixel-commands
type: operational/commands
status: consolidated from trigger phrases in pixel's skill files — no new triggers invented
assigned_agent: pixel (Brand Studio / Production)
date_added: 2026-07-07
---

## Purpose

Routing reference for pixel.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| asset-pipeline | "produce assets," "batch images," "make the visuals for [campaign]" | `/pixel-produce` |
| content-image | "better image prompt," "prompt for [asset]," "optimize this prompt" | `/pixel-prompt` |
| image-style-guide | "image style," "on-brand image setup," "our images look inconsistent" | `/pixel-style` |

## Precedence Rules

### Production requests run the full pipeline
Any multi-asset brief → asset-pipeline, which internally pulls style templates + prompt craft. Single-prompt asks skip the workflow but still apply the brand's style constants.

### Style setup precedes volume
A brand with no approved image-style file gets the setup loop (test set + operator corrections) before its first big batch — provisional runs are labeled.

### What pixel does NOT take
- Copy/overlay text → lena. Judging kit rules → atlas (pixel executes them). Shipping approval → spark.
- Deciding what to produce → requesters (pulse/rio/lena/muse); pixel executes briefs.

## Fallback

Ambiguous asks → setup, one prompt, or a run?
