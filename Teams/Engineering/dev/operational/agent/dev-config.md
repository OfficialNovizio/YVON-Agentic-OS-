---
name: dev-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: dev (Engineering / Lead Developer)
date_added: 2026-07-08
---

## Purpose

Machine-readable configuration for dev, the department's law layer.

## Config Template

```yaml
# --- Core documents ---
stack_profile_path: <FILL_IN>        # the per-business stack document (from the template)
adr_ledger_path: <FILL_IN>           # append-only ADR ledger
security_charter_path: <FILL_IN>     # the operator-adopted Security Charter (senior authority)

# --- Delivery ---
definition_of_done_path: <FILL_IN>   # the adopted DoD (from the template)
tech_debt_register_path: <FILL_IN>   # append-only
execution_plans_path: <FILL_IN>      # Rail 1 plan artifacts (append-only once locked; quinn hashes)
branching_model: <FILL_IN>           # per stack-profile; default PR+review+green-gate if unset

# --- Review routing ---
domain_reviewers:                    # who reviews ADRs/PRs by domain
  data: dana
  backend_api: raj
  frontend: mia
  mobile: nova
  security: aegis
  reliability: ops
escalation_contact: <FILL_IN>        # unresolved cross-domain splits + charter questions → operator
```

## Instructions

1. No `stack_profile_path` → build it before non-trivial work; provisional labeling meanwhile.
2. No `security_charter_path` (unadopted) → the department runs in the charter's most-restrictive reading (no external tools, no DB writes, no red-team), stated in every affected output.
3. Domain reviewers are fixed to the department roster; ADRs/PRs touching a domain get that agent's review before logging/merge.

## Fallback

Unfilled config degrades loudly, never silently. The charter's absence is the loudest degradation.
