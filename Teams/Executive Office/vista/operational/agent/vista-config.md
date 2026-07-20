---
name: vista-config
type: operational/agent
status: template — placeholders only, no invented values. Scoped to only what vista's skills actually reference (5 fields), not copied from another agent's shape.
assigned_agent: vista (Executive Office / Roadmap Lead)
date_added: 2026-07-06
---

## Purpose

Machine-readable configuration for vista, scoped strictly to what vista's skills actually reference. Every field below traces to a real line in a skill file; nothing is speculative.

## Config Template

```yaml
# --- Roadmap monitoring (roadmap-sync) ---
roadmap_source: <FILL_IN>          # where the committed roadmap + sprint targets live
                                    # (file path, board URL, connector) — roadmap-sync Phase 1
flag_threshold: <FILL_IN>          # sprints of slip that trigger a flag; skill default is 2
                                    # (catalog value) — roadmap-sync Phase 3; change deliberately,
                                    # never mid-quarter (vista-principles #5)
delivery_owner_contact: <FILL_IN>  # who gets notified when items are flagged — roadmap-sync
                                    # Phase 6 (genericized from the catalog's hardcoded agent
                                    # reference per rule 0.4b)

# --- Metrics (north-star-metric, roadmap-sync actuals) ---
metrics_source: <FILL_IN>          # where instrumented metric values come from (analytics tool,
                                    # dashboard, file) — north-star-metric's "can we measure this
                                    # today" check and roadmap-sync Phase 2 actuals

# --- Review cadence (catalog: "monthly review with marcus") ---
nsm_review_cadence: <FILL_IN>      # how often vista reviews NSM + guardrails with marcus;
                                    # catalog suggests monthly — confirm, don't assume
```

## Instructions

1. Until `roadmap_source` / `metrics_source` are filled, roadmap-sync and north-star-metric ask the operator per-run rather than assuming a source — each skill's own documented fallback, unchanged by this file.
2. Until `flag_threshold` is filled, roadmap-sync uses its built-in default of 2 sprints.
3. Until `delivery_owner_contact` is filled, flagged-item notifications go to the operator directly.
4. Until `nsm_review_cadence` is filled, no recurring review is assumed to exist — vista prompts the operator to set one after the first NSM is defined.
5. If vista's skill set grows and something new needs configuring, add it here — but only what a skill actually references.

## Fallback

An empty/unfilled config is equivalent to no config existing at all; it never blocks a skill from running via its own fallbacks.
