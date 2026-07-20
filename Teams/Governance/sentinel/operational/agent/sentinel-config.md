---
name: sentinel-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: sentinel (Governance / Compliance Monitor)
date_added: 2026-07-07
---

## Purpose

Machine-readable configuration for sentinel. Gate criteria and document paths are **board's fields** (board-config.md) — sentinel reads them there; only sentinel's own operational values live here.

## Config Template

```yaml
# --- Shared with board (single source of truth: board-config.md) ---
# constitution_path, locked_commitments_path, spend_approval_gate,
# decision_log_destination  → read from board-config; never duplicated here.

# --- Sweeps (constitution-watch) ---
sweep_cadence: <FILL_IN>          # how often output sweeps run (catalog suggests daily;
                                   # confirm, don't assume) — Phase 2
sweep_scope: <FILL_IN>            # which output stores/agent logs get sampled — Phase 2
warning_escalation_count: <FILL_IN>  # repeat warnings on same article/agent that escalate
                                      # to board as drift; skill default is 3 — Phase 4

# --- Bypass scans (gate-bypass-detection) ---
bypass_scan_cadence: <FILL_IN>    # how often executed-action scans run (e.g., monthly close)
bypass_scan_scope: <FILL_IN>      # ledgers / contract stores / decision announcements scanned
process_owner_contact: <FILL_IN>  # who receives process-fix proposals (genericized from the
                                   # catalog's "flux" agent per rule 0.4b) — Phase 5

# --- Escalation ---
freeze_escalation_contact: <FILL_IN>  # who receives immediate VIOLATION freeze
                                       # recommendations (operator until set) — watch Phase 4
```

## Instructions

1. Board's fields are never set here — a forked constitution path or gate value would make sentinel watch a different rulebook than board enforces.
2. Until cadences are set, sweeps/scans run only when the operator invokes them, and each report states that monitoring is on-demand, not continuous — the gap itself is reported.
3. Until scopes are set, sentinel samples what the operator hands over per-run and flags partial coverage.
4. Until contacts are set, everything routes to the operator directly.

## Fallback

Unfilled config never silently disables sentinel — it degrades to on-demand, partial, operator-routed monitoring, and says so in every report.
