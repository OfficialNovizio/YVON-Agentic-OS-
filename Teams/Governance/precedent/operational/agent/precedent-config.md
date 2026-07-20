---
name: precedent-config
type: operational/agent
status: template — placeholders only, no invented values. Scoped to what precedent's skills actually reference (2 fields).
assigned_agent: precedent (Governance / Institutional Memory)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for precedent — deliberately tiny: precedent mostly consumes board's config rather than duplicating it.

## Config Template

```yaml
# --- Shared with board (single source of truth: board-config.md) ---
decision_log_destination: <SEE board-config>   # precedent reads/appends the SAME log board
                                                # writes to — set it once in board-config;
                                                # this line is a pointer, not a second value.

# --- Precedent's own fields ---
retrieval_top_n: <FILL_IN>       # how many similar precedents to surface per gate request;
                                  # skill default is 3 (catalog protocol) until set
                                  # (ruling-log Phase 4)
index_threshold: <FILL_IN>       # log size (record count) at which precedent proposes building
                                  # a one-line-per-ruling index for retrieval at scale
                                  # (ruling-log fallback; the blueprint's INDEX.md pattern)
```

## Instructions

1. `decision_log_destination` is **board's field** — never set it separately here; a forked log is a forked memory.
2. Until `retrieval_top_n` is set, ruling-log uses its built-in 3.
3. Until `index_threshold` is set, precedent raises the index proposal when retrieval visibly degrades, as a judgment call flagged to the operator.
4. Add fields only when a skill actually references them.

## Fallback

An unfilled config never blocks: skills use their documented defaults and deliver to the operator directly where destinations are missing.
