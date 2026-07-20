---
name: quinn-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: quinn (Engineering / QA)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for quinn, the gate and charter control point.

## Config Template

```yaml
# --- Charter (senior authority) ---
security_charter_path: <FILL_IN>       # operator-adopted version; unadopted → most-restrictive mode
plan_lock_log: <FILL_IN>               # Rail 1 append-only ledger (asset template)
hash_algorithm: sha256                 # default; per charter-enforcement instruction 2
sandbox_policy: <FILL_IN>              # Rail 2 (charter config)
egress_allowlist: <FILL_IN>            # Rail 2 — operator-approved destinations only
escalation_contact: <FILL_IN>          # rail violations + halt disputes → operator

# --- Gate (quality) ---
release_gate_matrix_path: <FILL_IN>    # adopted matrix (from template; changes are ADRs)
coverage_floors: <FILL_IN>             # per-tier minimums — operator-set, never invented
critical_flows: <FILL_IN>              # E2E-mandatory user journeys — operator-set
hotfix_completion_window: <FILL_IN>    # hours to complete deferred tiers post-ship
pyramid_ratio: "70/20/10"              # marketplace-sourced default; operator-overridable

# --- Registries ---
regression_map_path: <FILL_IN>         # append-only (asset template)
flaky_register_path: <FILL_IN>         # may live inside the regression map file

# --- Connectors (proposed at deployment; degrade loudly if absent) ---
reticle_mcp: <FILL_IN>                 # edit gate — github.com/reticlehq/reticle
playwright_available: <FILL_IN>        # release gate — via marketplace/webapp-testing machinery

# --- Department wiring ---
gate_dispute_route: dev                # matrix arguments are dev's, as ADRs
postmortem_source: ops                 # when ops is built
findings_sources: [cypher, aegis]     # when built; intake via charter-enforcement
```

## Instructions

1. No `security_charter_path` → most-restrictive mode department-wide: quinn issues no plan-locks (so no agent makes external calls), no DB writes, no red-team; every affected output states this.
2. No `plan_lock_log` → same effect as unadopted charter for Rail 1: no locks can be recorded, no external calls proceed.
3. Unset `coverage_floors` / `critical_flows` → gate runs on tier-presence + assertions only, loudly labeled; quinn recommends values to the operator (labeled reasoning-based) but never enforces invented numbers.
4. Absent connectors → browser gates degrade to labeled manual checklists (browser-verification fallback); the E tier reports UNMET, never silently passes.

## Fallback

Unfilled config degrades loudly, never silently. The charter's absence is the loudest degradation — it stops the whole department's external tool use, by design.
