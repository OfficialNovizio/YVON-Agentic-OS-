---
name: data-access-discipline
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; the raj↔dana bridge, and where Rail 3 meets the backend
marketplace_search: 2026-07-09 — ORM/data-access skills found are framework tutorials; the discipline (no N+1, Rail 3 respect, pooling, transactions) is kept custom, bound to dana's authority and quinn's charter
assigned_agent: raj (Engineering / Backend & APIs)
portable: true — the discipline is store-agnostic; the client/ORM comes from the stack-profile
includes: (no asset — method skill)
date_added: 2026-07-09
---

## Introduction

data-access-discipline is how raj's backend talks to dana's datastores: efficiently (no N+1, right-sized queries, connection pooling), correctly (transactions with proper boundaries), and within the charter (reads per grant; every write/destructive change is dana's migration script the operator runs — Rail 3, from the backend side). It's the seam between the service layer and the data layer, and seams are where bugs live.

## Purpose

The backend is where data-access sins are committed: the ORM that fires N+1 queries, the missing transaction that leaves half-written state, the connection leak that exhausts the pool, and — the charter-critical one — application code that runs a destructive data change directly instead of routing it through dana and the operator. This skill keeps that seam clean.

## When to Use

Triggers: "query the database from the API," "why is this endpoint slow" (DB-bound), "transaction," "N+1," "connection pool," and any backend code that reads or (attempts to) write data.

## Structure / Protocol

```
Backend code accessing data
  -> READS: right-sized (select what's used), no N+1 (batch/join/eager-load), paginated at the edge
  -> TRANSACTIONS: correct boundaries (all-or-nothing where needed), no long-held locks
  -> POOLING: connections pooled, released, never leaked; timeouts (service-patterns)
  -> WRITES / destructive changes: NOT executed by the backend directly.
     Schema/data changes → dana authors a migration → OPERATOR runs it (Rail 3).
     Row-level app writes within granted scope follow the store's transactional API — but
     create/update/delete/drop/truncate at scale or schema changes are ALWAYS dana+operator.
    -> Access reflects dana's model; performance issues → dana/db-performance
```

## Instructions

1. **No N+1, ever knowingly.** Fetching a list and then querying per item is the default ORM trap and a top backend performance killer (dana/db-performance's concern, raj's origin). Batch, join, or eager-load; an N+1 in a diff is a review finding (it's the kind of thing agent-generated data access introduces silently — dev's integrity check).
2. **Right-size reads.** Select the columns/fields actually used, not `SELECT *` then discard; paginate at the API edge (api-standards). Over-fetching is bandwidth, memory, and latency for nothing.
3. **Transactions with real boundaries.** Operations that must be atomic are in one transaction (all-or-nothing); transactions are short (no long-held locks that block others — service-patterns' cascade risk). A multi-step mutation without a transaction is a half-written-state bug.
4. **Pool and release connections.** Connections come from a pool, are released promptly, and never leak; a leaked connection pool is a slow-motion outage. Pair with service-patterns' timeouts.
5. **Charter line: the backend doesn't do destructive data changes.** Reads within the granted scope, fine. But schema changes and scaled create/update/delete/drop/truncate are NOT run by application code — they're dana's migration scripts the operator executes (Rail 3). A handler that drops or mass-mutates data is a top-severity charter breach, caught at review. This is the backend-side enforcement of dana's authoring rule.
6. **The access reflects dana's model.** Queries respect the schema's constraints and relationships; fighting the model in the query layer means the model or the query is wrong (route to dana).

## Output Format

```
## Data Access: [endpoint/operation]
Reads: [right-sized ✓ · no N+1 ✓ · paginated ✓] · Transactions: [boundaries correct ✓]
Pooling: [pooled + released ✓]
Charter: [reads in scope ✓ · NO backend-executed destructive change ✓ — schema/bulk = dana+operator (Rail 3)]
Model fit: [respects dana schema ✓ / mismatch → dana]
```

## Principles

- **No knowing N+1** — batch/join/eager-load; an N+1 in a diff is a finding.
- **Right-size reads** — select what's used; over-fetch is waste.
- **Transactions with real, short boundaries** — atomic where needed, no long locks.
- **Pool and release; never leak** — a leaked pool is a slow outage.
- **The backend never runs destructive data changes** — schema/bulk = dana authors, operator runs (Rail 3).
- **Access reflects the model** — fighting the schema means model or query is wrong.

## Fallback

- ORM makes N+1 the easy path → configure eager-loading explicitly; if the ORM hides query behavior, log/inspect the actual queries (dana's query-plan discipline) rather than trust it.
- A genuine bulk backend write seems needed → it's a dana migration (Rail 3), not backend code; reshape it. "The app needs to update a million rows" is a migration, not a request handler.
- Transaction spans services → don't (distributed transactions are a smell); use idempotency + sagas/compensation (service-patterns) instead.

## Boundaries with Other Skills

- **dana**: owns the stores and authors all migrations; this is the backend's disciplined, read-mostly access to them, and the enforcement point for Rail 3 on the backend side.
- **dana/db-performance**: N+1 and slow queries are joint — origin often here, diagnosis there.
- **service-patterns** (sibling): timeouts and pooling on DB calls.
- **api-standards** (sibling): pagination at the edge bounds what this fetches.
- **quinn/charter-enforcement**: a backend-executed destructive op is a Rail 3 breach caught at the gate.
- **aegis**: injection surfaces in query construction route to secure-code-review.
