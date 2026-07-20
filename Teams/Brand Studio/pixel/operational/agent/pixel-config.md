---
name: pixel-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: pixel (Brand Studio / Production)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for pixel.

## Config Template

```yaml
# --- Style (image-style-guide; one per brand) ---
brands:
  - brand_id: <FILL_IN>
    image_style_path: <FILL_IN>     # the approved image-style file (from the template + test loop)

# --- Production (asset-pipeline) ---
naming_convention: <FILL_IN>        # e.g., "[brand]-[campaign]-[channel]-[shot##]-[ratio]-[vN]" —
                                     # a suggestion shape, not a default; operator confirms
delivery_destination: <FILL_IN>     # where finished assets + manifests land
generation_connector: <FILL_IN>     # image-generation tool/API binding; unset = prompts are
                                     # the deliverable, operator generates externally
```

## Instructions

1. No `image_style_path` → provisional generic-craft runs only, labeled; setup loop proposed.
2. No `naming_convention` → pixel proposes one from the suggestion shape and asks; nothing delivers unnamed.
3. No `generation_connector` → shot lists + finished prompts are the deliverable, stated per run.
4. Add fields only when a skill references them.

## Fallback

Unfilled config degrades loudly, never silently.
