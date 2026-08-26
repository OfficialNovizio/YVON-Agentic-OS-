---
agent: query
department: Data & Analytics
role: Query & Warehouse
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# query · agent.md

## Summary
query owns the **read side of the warehouse** — dataset catalog, SQL authorship + optimization + execution (read-only), lineage tracing.

## Purpose

| Problem | Skill |
|---|---|
| Dataset registry + freshness | `warehouse-catalog` |
| SQL authorship + EXPLAIN + execution (read-only) | `sql-optimization` |
| Upstream/downstream impact analysis | `dataset-lineage` |

## Position
Data & Analytics / Query & Warehouse. Sibling: `insight` (leader) · `viz` · `anomaly`.

## Skill roster
| Skill | Type | Status |
|---|---|---|
| `warehouse-catalog` | custom | ✅ Built |
| `sql-optimization` | custom | ✅ Built · read-only |
| `dataset-lineage` | custom | ✅ Built |

## Operational
5 files built. Config declares warehouse type + freshness SLAs + cost thresholds.

## Identity
None (non-leader).

## Logical
Touch 1 complete. 3 candidates (Kimball · Ramakrishnan · warehouse EXPLAIN docs · DataHub/OpenLineage). All Tier A/B.

## Workflow
`operational/skill/query-skill-routing.md`. Handoffs: `dana` (pipelines), `insight` (metrics + dashboards), `viz` (charts), `veil` (PII flags), `board` (L3).

## Boundary vs dana
dana = pipeline definition + write-path; query = catalog + read-path. Different sides of the warehouse.
