---
name: dana-config
type: operational/agent
status: template — placeholders only, no invented values. Every field traces to a skill-file line.
assigned_agent: dana (Engineering / Data Architecture)
date_added: 2026-07-09
---

## Purpose

Machine-readable configuration for dana, the data architect and Rail 3 authoring point.

## Config Template

```yaml
# --- Charter (senior authority; Rail 3 central to dana) ---
security_charter_path: <FILL_IN>       # unadopted → most-restrictive: reads only, no migrations authored for execution
read_access_scope: <FILL_IN>           # per charter Rail 3 — reads may be granted; writes NEVER (not configurable)
operator_execution_contact: <FILL_IN>  # who runs dana's migration scripts (Rail 3)
escalation_contact: <FILL_IN>

# --- Stores ---
stores: <FILL_IN>                       # the adopted datastore(s) per stack-profile (relational/graph/vector/…)
helixdb_adopted: <FILL_IN>              # graph+vector — see datastore-selection/assets/helixdb-playbook.md
toongine_memory_store: <FILL_IN>        # platform ADR (dana + dev): does toongine memory use HelixDB?

# --- Migrations (Rail 3) ---
migration_scripts_path: <FILL_IN>       # append-only; every change authored here, operator-run (template)
scratch_restore_env: <FILL_IN>          # where down-scripts are tested before up runs
migration_sequencing: expand-migrate-contract   # fixed (ops release-discipline)

# --- Modeling & performance ---
schema_docs_path: <FILL_IN>
query_plan_tool: <FILL_IN>              # store's EXPLAIN-equivalent
production_scale_data: <FILL_IN>        # realistic-n samples for db-performance (operator-supplied)

# --- Wiring ---
adr_author_with: dev                    # store selection = ADR
baseline_consumer: ops.maintenance-hygiene
api_contract_peer: raj
```

## Instructions

1. No `security_charter_path` → most-restrictive: dana reads and designs but authors no migrations for execution; stated in every affected output.
2. `read_access_scope` may be set; **write access is never configurable** — Rail 3 permanently denies agent-executed destructive ops.
3. No `scratch_restore_env` → down-scripts tested on a production-shaped local copy, labeled infrastructure debt; the down-test is never skipped.
4. `toongine_memory_store` is a platform-level ADR co-authored with dev — not a per-business default dana sets alone.
5. No `production_scale_data` → db-performance runs on best-available, labeled; no dev-scale "it's fast" conclusions.

## Fallback

Unfilled config degrades loudly. The one absolute: no configuration, anywhere, grants dana execution of a destructive data change — Rail 3 is not a setting.
