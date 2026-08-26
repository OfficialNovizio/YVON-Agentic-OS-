---
name: metric-definitions-registry
type: custom
status: built from scratch
assigned_agent: insight (Data & Analytics / BI Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Canonical registry of business metric definitions across departments — one definition per metric name, versioned, cross-referenced to source query and owning agent. Prevents definition drift (revenue-A ≠ revenue-B ≠ revenue-C)."
triggers:
  - metric definition
  - what does revenue mean here
  - register a metric
  - metric drift
  - list our metrics
  - metric catalog
  - who owns this metric
---

# Metric Definitions Registry

## Introduction

Built 2026-07-29 as insight's canonical metric-definitions catalog. Different depts naming the same word differently ("revenue", "customer", "active user") is the biggest source of dashboard drift. This skill enforces one definition per metric name at a time.

## Purpose

Own the state of what each metric means:
- Metric name (unique)
- Plain-language definition
- SQL/query recipe (references `query/warehouse-catalog`)
- Owning agent + dept
- Version + effective date
- Deprecation path when replaced

## When to Use

- "What does revenue mean here" · "metric drift" · "register a metric" · "list our metrics" · "who owns this metric"
- Cross-dept dashboard conflict: two teams show different numbers for the same metric name — this skill resolves via the canonical definition.

Do NOT use for: dashboard build (→ viz) · data pipeline (→ dana/pipe) · ad-hoc analysis (→ `ad-hoc-analysis`).

## Structure / Protocol

```
REGISTER   propose metric → owner + query + definition → append
UPDATE     definition change → bump version → archive prior
DEPRECATE  supersede with new metric → mark retired
LOOKUP     by name → return canonical definition + owner
LIST       by owner / dept / active-only
CONFLICT   two teams disagree → surface canonical + escalate to insight for resolution
```

## Instructions

### Step 1: Register
Fields: `name` (unique), `plain_definition`, `query_ref` (path in warehouse-catalog), `owner_agent`, `owning_dept`, `numerator/denominator` (if ratio), `time_grain`, `filters`.

### Step 2: Update
Definition change → bump version, archive prior row, notify consumers (dashboards using this metric).

### Step 3: Conflict
Two dashboards showing different numbers for same metric name → this skill checks canonical → flags whichever dashboard deviates → routes fix.

## Output Format

Table: name · version · definition · query_ref · owner · active-since.

## Principles

- **One canonical definition per metric name at a time.**
- **Never delete history.** Retired definitions stay for audit.
- **Definitions traced to source query.** No metric without a `query_ref`.
- **Owner is a real agent, not a role.**
- **Provenance on every citation.** `[operator provided]` `[canonical registry]` `[query result]`.

## Fallback

| Failure | Response |
|---|---|
| Name collision on register | Present existing; ask update-or-new |
| Missing query_ref | Halt; require query definition first |
| Cross-dept conflict unresolved | Escalate to insight (leader) |

## Boundaries with Other Skills

- `ad-hoc-analysis` (this agent) — consumes definitions.
- `exec-dashboard` (this agent) — consumes definitions.
- `query/warehouse-catalog` — supplies query recipes.
- `viz` (D&A) — dashboards enforce canonical metric.
- `felix` (F&T), `metric` (Product) — metric owners for their domain.
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration (technical, not permission)

| Skill | Required | Optional | Source line |
|---|---|---|---|
| metric-definitions-registry | File read/write | — | All steps mutate `metrics.yaml` |
