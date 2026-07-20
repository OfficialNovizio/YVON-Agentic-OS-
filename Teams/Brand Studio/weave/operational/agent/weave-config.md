---
name: weave-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: weave (Brand Studio / Storytelling)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for weave; toongine binds per business.

## Config Template

```yaml
# --- Story arcs (brand-story-arcs Phase 1; one entry per brand) ---
brands:
  - brand_id: <FILL_IN>
    story_arc_path: <FILL_IN>          # the filled-in arc file (from assets/story-arc-template.md,
                                        # built from the operator's REAL history)
    chapter_registry_path: <FILL_IN>   # the continuity ledger (from assets/chapter-registry-template.md);
                                        # append-only

# --- Amendment routing ---
arc_amendment_approver: <FILL_IN>      # who adopts arc amendments (operator; via spark's review) —
                                        # brand-story-arcs Phase 4 ARC GAP
```

## Instructions

1. No `story_arc_path` → brand-story-arcs stops; content ships only as labeled "pre-arc," and the arc-creation loop starts with the operator's real history.
2. No `chapter_registry_path` → continuity checks are impossible; weave starts the ledger with the first ON-ARC chapter and reconstructs prior campaigns as labeled reconstructions.
3. `arc_amendment_approver` unset → amendments route to the operator directly.
4. Add fields only when a skill references them.

## Fallback

Unfilled config degrades loudly, never silently.
