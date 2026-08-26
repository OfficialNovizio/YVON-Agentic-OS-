---
name: sql-optimization
type: custom
status: built from scratch
assigned_agent: query (Data & Analytics / Query & Warehouse)
portable: true
date_added: 2026-07-29
tier: 3
description: "Query authorship + review + execution against the warehouse. Enforces catalog-registered datasets only. EXPLAIN + cost estimate before execution on any expected-large query. Never mutates data (analytical only)."
triggers:
  - write a query for X
  - SQL for Y
  - run this query
  - optimize this SQL
  - explain plan
  - query performance
  - review this SQL
---

# SQL Optimization

## Introduction
Built 2026-07-29 as query's SQL authorship + execution + optimization skill. Never mutates data — analytical / read only.

## Purpose
Write, review, optimize, and execute SQL against the warehouse. Every query references catalog-registered datasets only; large queries surface EXPLAIN + cost estimate before execution.

## When to Use
- "Write a query for X" · "SQL for Y" · "run this query" · "optimize this SQL" · "explain plan"

Do NOT use for: pipeline definition (→ `dana`) · dataset catalog (→ `warehouse-catalog`) · analytical narrative (→ `insight`).

## Structure / Protocol
```
1. VALIDATE   confirm datasets referenced exist in catalog + fresh
2. AUTHOR     write SQL against catalog schema
3. EXPLAIN    if expected-large (per config threshold) → EXPLAIN + cost estimate
4. APPROVE    if cost > threshold → operator approval before execution
5. EXECUTE    run against warehouse (read-only)
6. RETURN     dataset + query text + cost + execution time
```

## Instructions
### Step 1: Validate
Every FROM/JOIN clause must reference a dataset in `warehouse-catalog`. Reject queries against unknown datasets. Check freshness — halt if stale > SLA.

### Step 2: Author
Prefer explicit column lists over SELECT *. Prefer INNER over cross joins. Comment intent for future readers.

### Step 3: EXPLAIN
For any expected-large query (per `query-config.md` cost threshold), run EXPLAIN → surface cost estimate → operator confirms before execution.

### Step 4: Execute
Read-only. Never INSERT/UPDATE/DELETE/DROP from this skill.

### Step 5: Return
Dataset + query text + actual cost + execution time. Log for `sql-optimization`'s own metrics.

## Output Format
Dataset + query + cost.

## Principles
- **Catalog-only datasets.** No shadow queries.
- **Read-only. Ever.** No mutations.
- **EXPLAIN before large execution.**
- **Explicit columns > SELECT *.**
- **Every query commented.**
- **Provenance:** `[warehouse snapshot Z]`.

## Fallback
| Failure | Response |
|---|---|
| Dataset not in catalog | Halt; register first |
| Cost > threshold | Operator approval required |
| Warehouse timeout | Retry once at reduced scope; else halt |
| Mutation SQL detected in input | Reject |

## Boundaries
- `warehouse-catalog` (this agent) — dataset registry consumed here.
- `dataset-lineage` (this agent) — reads query history for lineage.
- `insight/ad-hoc-analysis` (D&A) — routes queries here.
- `dana` (Engineering) — pipeline writes owned there; this skill reads only.
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| sql-optimization | File read (catalog) · Warehouse read query execution | EXPLAIN plan tooling · Query performance MCP | All steps |
