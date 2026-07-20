---
name: nate-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: nate (Brand Studio / Growth)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for nate.

## Config Template

```yaml
# --- Backlog (experiment-backlog; one per brand) ---
brands:
  - brand_id: <FILL_IN>
    experiment_backlog_path: <FILL_IN>   # from the template; results log append-only

# --- Discipline parameters ---
concurrent_capacity: <FILL_IN>           # max simultaneous tests (1–3 typical); honesty over ambition
significance_threshold: <FILL_IN>        # p-value bar; the sibling skill's 0.05 is the
                                          # conventional default, confirm per business
power_target: <FILL_IN>                  # minimum power before a test may launch (80% conventional)
experiment_spend_line: <FILL_IN>         # spend per experiment above which board's gate applies
```

## Instructions

1. No backlog path → the queue starts with the first intake session; stated.
2. Unset discipline parameters → the sibling skill's conventional values (0.05 / 80%) apply as documented defaults, noted per test until confirmed.
3. `experiment_spend_line` unset → any nontrivial experiment spend routes to the operator by default.

## Fallback

Unfilled config degrades loudly, never silently.
