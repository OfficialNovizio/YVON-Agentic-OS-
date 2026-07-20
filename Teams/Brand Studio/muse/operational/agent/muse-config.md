---
name: muse-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: muse (Brand Studio / Ideation)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for muse.

## Config Template

```yaml
# --- Concept registry (concept-library; one per brand) ---
brands:
  - brand_id: <FILL_IN>
    concept_registry_path: <FILL_IN>   # from assets/concept-registry-template.md; append-only

# --- Cadences & counts ---
reserve_review_cadence: <FILL_IN>      # how often the reserve shelf is reviewed (Phase 3)
candidates_per_run: <FILL_IN>          # generation volume per brief; catalog suggests 10 —
                                        # confirm, don't assume
forward_count: <FILL_IN>               # how many survivors go to spark; catalog suggests 3
```

## Instructions

1. No registry path → generation still runs; the registry starts with the first run's entries (stated in output).
2. Unset counts → the catalog's suggested values (10/3) are used as the skills' documented defaults, noted per run until confirmed.
3. Add fields only when a skill references them.

## Fallback

Unfilled config degrades loudly, never silently.
