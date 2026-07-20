---
name: service-patterns
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: service-patterns (VYON_Skills_Catalog_Full_v2.html, raj/Engineering) — genericized per rule 0.4b
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — resilience/microservice-pattern skills found are framework-specific; the pattern discipline is kept custom, bound to ops's reliability and axiom's complexity
assigned_agent: raj (Engineering / Backend & APIs)
portable: true — the patterns are architecture-agnostic; the runtime comes from the stack-profile
includes: (no asset — method skill)
date_added: 2026-07-09
---

## Introduction

service-patterns is how raj makes backend services behave under real conditions: idempotency so retries are safe, timeouts and circuit breakers so one slow dependency doesn't cascade, queues for work that shouldn't block a request, and clear service boundaries so the system stays understandable. It's the reliability half of the backend — the API contract (api-standards) says what a service does; this says how it survives.

## Purpose

Services fail in production in predictable ways: a retried payment charges twice (no idempotency), a slow downstream hangs every thread (no timeout), a traffic spike melts a synchronous pipeline (no queue), a cascading failure takes down everything (no circuit breaker). These patterns are the accumulated answers — dev's "everything fails all the time," applied at the service layer.

## When to Use

Triggers: "design this service," "should this be async," "idempotency," "retry/timeout," "circuit breaker," "queue this," "service boundary," and any operation that mutates state, calls a dependency, or does slow work.

## Structure / Protocol

```
A service/operation to design
  -> MUTATION? → idempotency key so retries are safe (never double-charge/double-write)
  -> CALLS A DEPENDENCY? → timeout (always) + retry-with-backoff (idempotent only) + circuit breaker
  -> SLOW / non-blocking work? → queue + background worker, not a held request
  -> BOUNDARY: one service owns one responsibility; shared state across boundaries is a smell
    -> Failure modes owned (dev's rule): what happens when each dependency is down?
      -> DB access follows data-access-discipline; the edge follows api-standards
```

## Instructions

1. **Idempotency for every mutation.** Any state-changing operation carries an idempotency key so a retry (network blip, client double-tap, ops's deploy retry) doesn't double-apply. The classic failure — a retried request charging twice — is designed out, not hoped away.
2. **Timeout every dependency call; breaker the flaky ones.** No call to a database, API, or service is unbounded — a missing timeout means one slow dependency exhausts the thread/connection pool and cascades. Circuit breakers stop hammering a downed dependency; retries (with backoff) only on idempotent operations.
3. **Async the slow work.** Work that doesn't need to block the response — email, image processing, report generation — goes to a queue with a background worker. A request thread held on slow work is a scaling ceiling and a DoS surface.
4. **One service, one responsibility.** Clear boundaries; a service owning two unrelated things, or two services sharing a mutable store, is where coupling and data bugs breed. Boundaries map to the data model's ownership (dana).
5. **Own every failure mode.** For each dependency, answer "what happens when it's down" — degrade gracefully, queue for later, or fail cleanly with the right error (api-standards' shape). An unowned failure mode is dev's rejected architecture, service edition.
6. **Complexity and cost are real.** Each pattern adds moving parts; apply them where the failure they prevent is real, not everywhere (dev's boring-is-a-feature). A queue for work that's always fast is complexity for nothing.

## Output Format

```
## Service: [name/operation]
Mutation → idempotency: [key strategy / n/a] · Dependency calls → [timeout ✓ · retry(idempotent) · breaker]
Slow work → [sync / queued + worker] · Boundary: [single responsibility ✓]
Failure modes: [dependency down → degrade/queue/fail-clean]
```

## Principles

- **Idempotency for every mutation** — retries must be safe; double-charge is a design failure.
- **Timeout every dependency; breaker the flaky** — an unbounded call cascades.
- **Async the slow work** — held request threads are a scaling ceiling and DoS surface.
- **One service, one responsibility** — shared mutable state across boundaries is a smell.
- **Own every failure mode** — "what when it's down" has an answer, or the design is rejected.
- **Patterns cost moving parts** — apply where the failure is real, not everywhere.

## Fallback

- Early/simple service → start with timeouts + idempotency (the cheap, always-worth-it pair); add queues/breakers when the failure they prevent becomes real, not preemptively.
- Idempotency hard for an operation → make it so (natural keys, dedup) before shipping a retryable mutation; a non-idempotent mutation behind a retry is a bug.
- Existing service missing these → add incrementally, prioritized by which failure has already bitten (ops's incidents point the way).

## Boundaries with Other Skills

- **api-standards** (sibling): the contract at the edge; this is the behavior behind it.
- **data-access-discipline** (sibling): DB calls get timeouts and pooling here; N+1 avoidance there.
- **ops/incident-response**: production failures reveal missing patterns; post-mortems route here; ops's reliability is this skill's downstream.
- **axiom**: the complexity of retry/queue logic and its worst-case behavior.
- **dana**: service boundaries reflect data ownership.
- **cypher**: unbounded work and missing timeouts are DoS surfaces (L10) cypher tests.

## Stack Notes (dated)

- `assets/stack-notes-node-backend-2026-07.md` — Node.js layering/caching/error/rate-limit mechanics. Applies only when stack-profile names Node.js; adopted from marketplace (ECC) 2026-07-10; method conflicts resolve to this skill.
