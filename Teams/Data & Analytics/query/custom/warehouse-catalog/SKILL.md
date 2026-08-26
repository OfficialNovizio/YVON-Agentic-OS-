---
name: warehouse-catalog
type: custom
status: built from scratch
assigned_agent: query (Data & Analytics / Query & Warehouse)
portable: true
date_added: 2026-07-29
tier: 3
description: "Data-warehouse dataset catalog — tables, views, fields, freshness, source pipeline, owner. Enables insight's canonical metrics + ad-hoc-analysis to reference reliable datasets. Read-only for schema; write only to catalog metadata."
triggers:
  - what tables exist
  - dataset catalog
  - warehouse catalog
  - what fields are in X
  - dataset owner
  - dataset freshness
  - list datasets
---

# Warehouse Catalog

## Introduction
Built 2026-07-29 as query's dataset registry. Every dataset the warehouse serves has an entry here with schema, freshness SLA, source pipeline (owned by `dana`), and dataset owner.

## Purpose
Answer "does this dataset exist / who owns it / when did it last update / what fields does it have" without hitting the warehouse for schema every time.

## When to Use
- Dataset lookup · dataset owner · freshness check · list datasets by domain.
- Before writing a query, verify the dataset is fresh + not deprecated.

Do NOT use for: SQL execution (→ `sql-optimization`) · pipeline definition (→ `dana`) · metric semantics (→ `insight/metric-definitions-registry`).

## Structure / Protocol
```
REGISTER   new dataset → append with schema snapshot
UPDATE     schema change / freshness change / retirement
LOOKUP     by name / by domain / by owner
FRESHNESS  probe pipeline for last-run timestamp; flag stale > SLA
```

## Instructions
### Step 1: Register
Fields: `dataset_name`, `schema` (column list + types), `source_pipeline` (dana pipeline slug), `freshness_sla` (hours), `owner_agent`, `domain` (finance / product / operations / etc.), `pii_flags` (columns containing PII → routes to `privacy` from `veil`).

### Step 2: Update
Schema drift → bump revision, archive prior. Freshness change → update SLA + notify downstream (metric-definitions-registry, dashboards).

### Step 3: Lookup
By name (exact) or domain (fuzzy) or owner. Return active version + freshness status.

### Step 4: Freshness
Probe via pipeline connector if configured; else operator manually attests. Stale > SLA → 🟡 flag; > 2× SLA → 🔴 flag + escalate to `dana`.

## Output Format
Table: dataset · schema · owner · freshness · status.

## Principles
- **Register every dataset before it's queried.** No shadow datasets.
- **Freshness SLA per dataset.** Not a global default.
- **Schema drift bumps revision.** Old queries against retired schemas fail loudly.
- **PII flagged, always.** Downstream skills must know.
- **Never delete history.**

## Fallback
| Failure | Response |
|---|---|
| Dataset not in catalog | Halt; register first |
| Pipeline not connected | Manual attestation only |
| Freshness > SLA | Flag; do not silently query |

## Boundaries with Other Skills
- `sql-optimization` (this agent) — queries reference catalog first.
- `dataset-lineage` (this agent) — reads catalog for lineage tracing.
- `insight` (D&A) — metric registry references catalog datasets.
- `dana` (Engineering) — owns the pipelines that populate datasets.
- `veil` (Cybersecurity) — PII flags routed here.
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration (technical, not permission)
| Skill | Required | Optional | Source line |
|---|---|---|---|
| warehouse-catalog | File read/write | Warehouse MCP for schema/freshness auto-probe | All steps |
