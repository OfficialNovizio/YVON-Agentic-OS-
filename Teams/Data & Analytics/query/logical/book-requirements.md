---
agent: query
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# query · logical / book-requirements

Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `catalog_schema_validator` | B | Kimball — *The Data Warehouse Toolkit* — Internet Archive CDL | Google BigQuery public docs — free |
| 2 | `sql_cost_estimator` | A | Warehouse-specific EXPLAIN docs (BigQuery / Snowflake — free) | Ramakrishnan — *Database Management Systems* — CDL |
| 3 | `lineage_graph_builder` | B | Kimball — *The Data Warehouse Toolkit* (dimensional model) | DataHub / OpenLineage open-standard docs — free |

All Tier A/B.

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| warehouse-catalog | script #1 |
| sql-optimization | script #2 |
| dataset-lineage | script #3 |

## Flag clearance
- Schema-drift detection — reasoning-based; script #1 clears
- Query cost heuristic — arithmetic + warehouse EXPLAIN; script #2 clears
- Lineage completeness — traversal algorithm; script #3 clears
