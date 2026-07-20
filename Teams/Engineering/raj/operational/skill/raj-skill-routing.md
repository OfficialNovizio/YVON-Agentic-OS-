---
name: raj-skill-routing
type: operational/skill
status: consolidated from raj's skill files — no new routing invented
assigned_agent: raj (Engineering / Backend & APIs)
date_added: 2026-07-09
---

## Purpose

How raj's four skills fit together. raj builds the backend: the API contract at the edge, the resilient service behind it, the disciplined data access beneath it, and the observability throughout. raj implements on axiom's algorithm choices and dana's data model, under dev's law and quinn's gate.

## The shape

```
api-standards (the contract at the edge — auth, versioning, errors, contract tests)
   │
service-patterns (behavior behind it — idempotency, timeouts, breakers, queues)
   │
data-access-discipline (beneath it — no N+1, transactions, pooling; Rail 3 from the backend)
   │
backend-observability (throughout — structured logs, tracing, metrics, health → ops)
```

## Routing rules

- "Design an endpoint / API design / errors / versioning / contract test" → **api-standards** (contract authority), which pulls design richness from **marketplace/api-design-principles** (resource modeling, pagination patterns, GraphQL schema/DataLoader, HATEOAS). Conflicts resolve to api-standards.
- "Should this be async / idempotency / retry / timeout / circuit breaker / queue" → **service-patterns**.
- "Query from the API / N+1 / transaction / connection pool" → **data-access-discipline**.
- "Logging / tracing / metrics / health check / instrument" → **backend-observability**.
- Any backend attempt to run a schema/bulk data change → NOT raj's; routes to **dana** (migration) + operator (Rail 3).

## Handoffs

- **dana**: raj's API reflects dana's data model; raj reads via data-access-discipline; ALL destructive/schema changes are dana's migrations the operator runs (Rail 3) — raj never executes them.
- **axiom**: hot-path algorithms and complexity; N+1/latency issues cross to axiom's profiling and dana's db-performance.
- **mia**: the frontend consumes raj's API contracts; contract tests protect that boundary.
- **aegis**: auth/input surfaces route to secure-code-review (quinn's S-tier).
- **ops**: raj's metrics/logs/health are ops's baselines, incident trail, and deploy-verification signal.
- **quinn**: contract tests + observability are gate evidence; unbounded/unversioned endpoints and N+1 are findings.
- Senior authority: **Security Charter** — plan-locked/sandboxed tool use; the backend never runs destructive data changes (Rail 3).
