---
name: echo-config
type: operational/agent
status: template — placeholders only, no invented values. Scoped to only what echo's skills actually reference (3 fields), not copied from marcus's larger config shape.
assigned_agent: echo (Executive Office / Investor Relations)
date_added: 2026-07-02
---

## Purpose

Machine-readable configuration for echo, scoped strictly to what echo's skills actually reference. Unlike marcus, echo has no escalation-threshold or tie-break-routing need anywhere in its skills — this file is deliberately smaller, not a copy of marcus's shape.

## Config Template

```yaml
# --- Metrics ---
metrics_source: <FILL_IN>       # where echo pulls company metrics from (dashboard URL, file path, connector
                                 # name, etc.) — referenced by both pitch-narrative (Phase 1) and
                                 # investor-update-template (Phase 1). One shared source, not asked per-run
                                 # once this is filled in.

# --- Update Approval & Delivery ---
approval_contact: <FILL_IN>     # who signs off on an investor update before it sends
                                 # (investor-update-template Phase 6)
send_channel: <FILL_IN>          # how the update actually gets sent — email, a specific tool, etc.
                                  # (investor-update-template Phase 7)
```

## Instructions

1. Until `metrics_source` is filled in, both pitch-narrative and investor-update-template should keep asking the operator per-run rather than assuming a source — that's each skill's own documented fallback behavior, unchanged by this file existing.
2. Until `approval_contact` is filled in, investor-update-template defaults to asking the operator directly before send (its own stated fallback).
3. Until `send_channel` is filled in, investor-update-template produces the final update as a file/draft and hands it to the operator to send manually (its own stated fallback).
4. If echo's skill set grows and something new needs configuring, add it here rather than inventing a new shape — but don't add fields speculatively; only add what a skill actually references.

## Fallback

This file existing doesn't change any skill's own fallback behavior — it just gives the skills something concrete to check first. An empty/unfilled config is equivalent to no config existing at all.
