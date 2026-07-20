---
name: ops-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: ops (Engineering / DevOps & Reliability)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for ops, the production owner.

## Config Template

```yaml
# --- Charter (senior authority) ---
security_charter_path: <FILL_IN>      # unadopted → most-restrictive mode (no deploys via external tools)
escalation_contact: <FILL_IN>         # incidents, failed restores, unpatched criticals → operator

# --- Release ---
deploy_watch_window: <FILL_IN>        # post-verify hold before a deploy is "done"
deploy_windows: <FILL_IN>             # optional: allowed deploy times ("someone watching")
critical_flows: <FILL_IN>             # smoke targets — SHARED with quinn's config; one source of truth

# --- Incidents ---
severity_definitions: <FILL_IN>       # P0–P3 meanings + response/comms targets per level
comms_cadence: <FILL_IN>              # update interval per severity
postmortem_deadline_days: <FILL_IN>   # resolution → post-mortem due
postmortem_stall_escalation_days: <FILL_IN>  # unwritten post-mortem → escalate to dev

# --- Hygiene ---
maintenance_cadences:                 # per register section
  dependencies: <FILL_IN>
  restore_tests: <FILL_IN>
  baselines: <FILL_IN>
  expiry_review: <FILL_IN>
backup_coverage: <FILL_IN>            # what must be backed up
backup_retention: <FILL_IN>
expiry_alert_lead: <FILL_IN>          # how far ahead expiries alert
alert_thresholds: <FILL_IN>           # operator-adopted; ops proposes, never invents

# --- Playbooks ---
playbooks_path: <FILL_IN>             # per-platform dated documents (template)
staleness_review_cadence: <FILL_IN>   # horizon checks

# --- Registers ---
maintenance_register_path: <FILL_IN>  # dated entries + logged skips
deploy_records_path: <FILL_IN>        # append-only; ground truth that re-dates playbooks
incident_log_path: <FILL_IN>          # append-only

# --- Connectors (proposed at deployment; degrade loudly if absent) ---
ci_cd_connector: <FILL_IN>            # plan §5 candidate: Harness.io
telemetry_connector: <FILL_IN>        # plan §5 candidate: Datadog

# --- Department wiring ---
gate_source: quinn                    # GATE PASS precedes every ship
postmortem_feeds: [quinn.regression-map, dev.adr-ledger, maintenance-register]
migration_author: dana                # when built; OPERATOR executes (Rail 3)
```

## Instructions

1. No `security_charter_path` → most-restrictive mode: no external-tool deploys, manual-operator-driven shipping only, stated in every affected output.
2. Unset `severity_definitions` → the P0–P3 convention descriptions apply, loudly labeled provisional; propose real definitions after the first classification need, not during it.
3. Unset cadences/thresholds → one initial register-establishing run, then proposals to the operator (labeled reasoning-based) — nothing scheduled or enforced silently.
4. `critical_flows` must resolve to the same source quinn reads — a divergence between "what quinn gates" and "what ops smokes" is a config finding.
5. Absent connectors → detection is human-report-driven and mechanics are manual-per-playbook; both stated loudly (incident-response logs it as a contributing factor every time).

## Fallback

Unfilled config degrades loudly, never silently. The charter's absence stops external-tool deploys entirely — by design, the safety net doesn't operate uninsured.
