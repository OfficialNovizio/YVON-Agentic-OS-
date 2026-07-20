---
name: raj-tool-requirements
type: operational/tool
status: specifies needs, does not grant them — grants happen at deployment via config/connectors
assigned_agent: raj (Engineering / Backend & APIs)
date_added: 2026-07-09
---

## Purpose

What raj needs, and what happens without each. Every external tool call is plan-locked (Rail 1) and sandboxed (Rail 2); the backend runs no destructive data changes (Rail 3).

## Requirements

| Need | Tool / access | Used by | Without it |
|---|---|---|---|
| Repo read/write for backend code | repo scope (per stack-profile) | all skills | Core; without write, design-only |
| Backend framework + runtime | per stack-profile | service-patterns, api-standards | Method-only guidance |
| Datastore READ access | per dana's `read_access_scope` (Rail 3) | data-access-discipline | Can't build data access; escalate |
| Queue/async infrastructure | per stack-profile | service-patterns | Sync-only, labeled; flag async gaps |
| Telemetry backend | ops connector (Datadog candidate, §5) | backend-observability | stdout logs + metrics endpoint, labeled |
| Contract-test runtime | test framework (quinn's tiers) | api-standards | No gate evidence → not done |

## Explicit non-needs / hard prohibition (by design)

- **NO destructive/schema datastore execution** — reads within scope only; schema + bulk changes are dana's migrations the OPERATOR runs (Rail 3). raj authors none.
- **No production deploy control** — ops ships; raj's code passes quinn's gate first.
- **No secrets in logs or code** — charter + aegis.

## Notes

- raj is a primary builder, so it has genuine code write access — but every change passes dev's review (incl. the integrity checks for agent-authored code), quinn's gate, and aegis for risky surfaces.
- New infra (queue, telemetry) enters via the stack-profile + config, under a locked plan.
