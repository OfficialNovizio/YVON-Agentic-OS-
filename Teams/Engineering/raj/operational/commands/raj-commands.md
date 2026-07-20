---
name: raj-commands
type: operational/commands
status: consolidated from trigger phrases in raj's skill files — no new triggers invented
assigned_agent: raj (Engineering / Backend & APIs)
date_added: 2026-07-09
---

## Purpose

Routing reference for raj: which phrase invokes which skill, and how overlapping backend vocabulary resolves.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| api-standards | "design endpoint," "API design," "error shape," "version," "contract test" | `/raj-api` |
| service-patterns | "async," "idempotency," "retry/timeout," "circuit breaker," "queue," "service boundary" | `/raj-service` |
| data-access-discipline | "query from API," "N+1," "transaction," "connection pool" | `/raj-data` |
| backend-observability | "logging," "tracing," "metrics," "health check," "instrument" | `/raj-observe` |

## Precedence Rules

### "slow endpoint" → which layer?
- DB-bound (N+1, slow query) → **data-access-discipline** (then dana/db-performance).
- Dependency-bound (slow downstream) → **service-patterns** (timeout/breaker).
- Unknown → **backend-observability** first (trace it), then the right layer.

### "the API needs to change data in bulk / alter schema"
NOT raj. Routes to **dana** (migration-discipline) → operator runs it (Rail 3). raj's backend never executes destructive/schema changes; reshape the request into a migration.

### Observability is build-time, not incident-time
"Add logging so we can debug this incident" → the logging should already exist; add it now AND note it as a done-definition gap, not a one-off.

### What raj never does
- Execute a schema change or bulk destructive data operation (Rail 3 → dana + operator).
- Ship an unversioned breaking change or an unbounded list endpoint.
- Log secrets or PII.

## Fallback

No clear match → if it's the contract, api-standards; behavior, service-patterns; data, data-access; visibility, observability. Any backend request implying a destructive/schema data change is reshaped into a dana migration for the operator (Rail 3).
