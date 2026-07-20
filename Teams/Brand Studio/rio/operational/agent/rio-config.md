---
name: rio-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line; the catalog's old numbers ($1K/day, 3-day floor, +20%) are suggestion shapes only.
assigned_agent: rio (Brand Studio / Ads)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for rio; toongine binds per business.

## Config Template

```yaml
# --- Platforms (one entry per ad platform, per brand) ---
brands:
  - brand_id: <FILL_IN>
    ad_platforms:
      - platform: <FILL_IN>
        connector: <FILL_IN>            # ads API binding; unset = operator exports on cadence
        playbook_path: <FILL_IN>        # dated volatile-layer playbook (from the template)

    # --- Guardrails (ad-thresholds; per brand, optionally per campaign class) ---
    daily_cap: <FILL_IN>
    roas_floor: <FILL_IN>
    floor_breach_window_days: <FILL_IN>  # consecutive days under floor → KILL-recommend
    scale_rule: <FILL_IN>                # win criteria + increment (e.g., "ROAS > 2x floor for
                                          # N days → +X%") — operator-set, never improvised
    spend_change_escalation_line: <FILL_IN>  # single-day change or cumulative crossing this →
                                              # operator + board's gate where its scope applies
    auto_pause_grant: <FILL_IN>          # explicit yes/no + max spend it covers; default NO
    attribution_basis: <FILL_IN>         # which ROAS counts (click-through recommended
                                          # conservative basis; view-through flagged)

# --- Cadences & logs ---
check_cadence: <FILL_IN>                 # guardrail patrol rhythm (daily typical while active)
playbook_review_cadence: <FILL_IN>
verdict_log_destination: <FILL_IN>       # append-only; kai-consumable
```

## Instructions

1. Unset guardrails → NOT CONFIGURED per check + a proposal session; campaigns can run but rio says the patrol is partial.
2. `auto_pause_grant` defaults to NO — kills are recommendations unless explicitly granted, capped.
3. `attribution_basis` unset → platform default used and loudly flagged as self-graded until set.
4. Budget envelopes themselves come from board's process, not this file.

## Fallback

Unfilled config degrades loudly, never silently.
