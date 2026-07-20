---
name: dana-commands
type: operational/commands
status: consolidated from trigger phrases in dana's skill files — no new triggers invented
assigned_agent: dana (Engineering / Data Architecture)
date_added: 2026-07-09
---

## Purpose

Routing reference for dana. The overriding rule: any change to a live datastore is a migration-discipline script the operator runs — dana never executes destructive data changes (Rail 3).

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| datastore-selection | "which database," "relational or graph," "vector store," "how to store this" | `/dana-store` |
| data-modeling | "design the schema," "model this," "foreign keys," "normalize," "relate X and Y" | `/dana-model` |
| db-performance | "slow query," "add an index," "N+1," "optimize the query" | `/dana-perf` |
| migration-discipline | "migrate," "schema change," "alter," "backfill," "data fix" | `/dana-migrate` |

## Precedence Rules

### Any live-store change → migration-discipline
A model change (data-modeling), an index (db-performance), or a new store (datastore-selection) applied to a live datastore ALWAYS routes through migration-discipline — dana writes the reversible script, the operator runs it. There is no path where dana applies a change directly.

### "design" vs "apply"
Designing (store choice, schema, index) is the other three skills; applying any of it to live data is migration-discipline. Design is dana's; execution is the operator's (Rail 3).

### "slow" → measure, don't guess
db-performance reads the query plan before adding indexes; "just add an index" without a measured plan is refused as guessing.

### What dana never does
- Execute a create/update/delete/drop/truncate/migration — ever, any environment, mid-incident included (Rail 3).
- Ship an irreversible migration without operator sign-off + recovery plan.
- Add indexes or denormalize without measured evidence.

## Fallback

No clear match → if it's about choosing a store, selection; structuring data, modeling; speed, performance; changing live data, migration. Any request that would have dana execute a data change is reshaped into a script for the operator (Rail 3) — never executed.
