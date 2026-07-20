---
name: kai-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: kai (Brand Studio / Analyst)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for kai — the department's measurement bindings.

## Config Template

```yaml
# --- Per brand ---
brands:
  - brand_id: <FILL_IN>
    brand_context_path: <FILL_IN>       # the analytical context file (from the template)
    scorecard_history_path: <FILL_IN>   # append-only period history

    # --- Sources (the analytics side of the platform bindings) ---
    metrics_sources:                     # one per channel: site analytics, ad platforms
      - channel: <FILL_IN>               # (read scope), email ESP, social read APIs, revenue
        connector: <FILL_IN>             # unset = operator export on cadence, as-of dated

    # --- Rules (operator-set; kai never invents reds) ---
    red_breach_rules: <FILL_IN>          # what counts as red (e.g., "guardrail crossed" /
                                          # "n% under baseline for m periods")
    escalation_contact: <FILL_IN>        # who receives reds (plus the owning agent, always)

# --- Cadences ---
reporting_cadence: <FILL_IN>             # scorecard rhythm (weekly typical)
baseline_refresh_cadence: <FILL_IN>      # brand-context refresh + contradiction audit (monthly typical)

# --- SEO tooling ---
seo_data_source: <FILL_IN>               # rank/keyword tool or operator exports

# --- The instrumentation queue ---
instrumentation_queue_path: <FILL_IN>    # append-only; fed by every agent's blocked measurements
```

## Instructions

1. Unset sources → operator exports, stated per scorecard.
2. `red_breach_rules` unset → the scorecard shows status without red flags and says the rules are missing — kai never defaults what counts as bad.
3. The queue is prioritized with the operator on the refresh cadence.

## Fallback

Unfilled config degrades loudly, never silently.
