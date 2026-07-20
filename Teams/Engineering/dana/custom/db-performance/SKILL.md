---
name: db-performance
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: plan §3 lists "db-performance M" (marketplace) — searched and kept custom (below); the discipline binds to axiom's profiling and dana's own modeling
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — DB-performance/query-tuning skills found are engine-specific (Postgres EXPLAIN helpers etc.); the cross-store discipline is kept custom, with engine specifics deferred to the stack-profile / store playbook
assigned_agent: dana (Engineering / Data Architecture)
portable: true — the method (measure, index, tune) is store-agnostic; the syntax comes from the chosen store
includes: (no asset — method skill; benchmarks use axiom's benchmark-record template)
date_added: 2026-07-09
---

## Introduction

db-performance is dana's query-and-storage tuning: finding the slow queries, indexing what's actually queried, killing N+1 patterns, and keeping the datastore fast as data grows — measured, never guessed (axiom's discipline, data edition). It's the empirical layer over data-modeling: the model makes the data correct, this makes accessing it fast.

## Purpose

Databases are where "fast enough in dev" becomes "unusable in production" — the query with no index that table-scans 10M rows, the N+1 that fires a query per result, the missing composite index. These are invisible at dev-scale and fatal at production-scale. Measured tuning catches them before the data does.

## When to Use

Triggers: "slow query," "add an index," "why is the database slow," "N+1," "optimize this query," a query on a growing table, ops monitoring showing DB latency, and any read pattern justifying denormalization (data-modeling).

## Structure / Protocol

```
A query/data-access performance question
  -> MEASURE: the store's query plan (EXPLAIN-equivalent) + real timing at realistic scale
     (never index by guessing — measure what's actually slow, at production-like n)
    -> Diagnose: missing/wrong index · full scan · N+1 · over-fetching · bad join order · lock contention
      -> Fix at the right layer: index (queried columns/paths) · query rewrite · model change ·
         caching (with an invalidation story) · denormalization (data-modeling, with a reason)
        -> MEASURE AGAIN at scale: improved? keep. not? revert. Index changes ship via migration (Rail 3)
          -> Feed ops baselines (maintenance-hygiene) with the real numbers
```

## Instructions

1. **Read the query plan before indexing.** The store's EXPLAIN-equivalent shows what's actually happening — a full scan, a missing index, a bad join order. Adding indexes by guessing creates write-cost and storage for no read benefit (indexes aren't free; they slow writes). Measure first (axiom's rule).
2. **Index what's queried, at realistic scale.** The columns/paths in WHERE, JOIN, ORDER BY — and composite indexes in the order queries use. Test at production-like n; an index that's pointless at 1K rows is decisive at 10M, and vice versa.
3. **Kill N+1 explicitly.** The pattern where fetching N results fires N follow-up queries is the most common ORM-induced DB killer. Batch, join, or eager-load — and it's exactly the kind of thing agent-generated data access introduces silently (dev's review integrity; flag it).
4. **Fix at the right layer.** Slow because of a missing index (add one), a bad query (rewrite), the wrong model (data-modeling change), or genuinely too much data (caching with an invalidation story, or denormalization with a sync story). Don't cache around a missing index.
5. **Index changes are migrations.** Adding/dropping an index on a live store is a migration-discipline script the operator runs (Rail 3) — and on a large table, built concurrently/online to avoid locking (store-specific, per the playbook).
6. **Measure again, feed baselines.** Keep only measured improvements (axiom); revert the rest. The real before/after numbers feed ops's monitoring baselines so "normal" for the database is a dated fact, not folklore.

## Output Format

```
## DB Performance: [query/access] — [store]
Query plan: [scan/index/join finding] · Scale tested: [n]
Diagnosis: [missing index / N+1 / over-fetch / bad join / contention]
Fix: [index / rewrite / model / cache+invalidation / denormalize+sync] · applied via [migration ref if schema/index]
Before → after (at scale): [metric] → KEEP / REVERT · → ops baseline [ref]
```

## Principles

- **Measure the plan before indexing** — guessed indexes cost writes for no read benefit.
- **Index what's queried, at realistic scale** — dev-scale hides the truth both ways.
- **N+1 is the default DB killer** — batch/join/eager-load; agent code introduces it silently.
- **Fix at the right layer** — don't cache around a missing index.
- **Index changes are operator-run migrations** (Rail 3), online on big tables.
- **Keep only measured wins; feed baselines** — real numbers, not folklore.

## Fallback

- No production-scale data → measure on the best available, label the regime gap; don't declare a query fast based on dev-scale (data-modeling's evidence rule).
- Store has no query-plan tool → use timing + the model/complexity reasoning (axiom), labeled lower-fidelity.
- Caching proposed → require an explicit invalidation story; a cache without invalidation is a correctness bug waiting to happen.

## Boundaries with Other Skills

- **data-modeling** (sibling): the model this tunes; denormalization decisions need this skill's measured evidence.
- **migration-discipline** (sibling): index/schema changes ship as operator-run scripts (Rail 3).
- **axiom/performance-profiling**: the same measure-first discipline; a DB-bound hot path found in axiom's profiling routes here, and benchmarks use axiom's record template.
- **ops/maintenance-hygiene**: DB latency baselines live there; regressions route here to diagnose.
- **raj**: N+1 and over-fetching often originate in the API/ORM layer — joint fixes.
