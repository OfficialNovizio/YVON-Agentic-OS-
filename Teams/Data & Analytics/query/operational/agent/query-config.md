---
agent: query
department: Data & Analytics
type: config
required_by:
  - custom/warehouse-catalog/SKILL.md
  - custom/sql-optimization/SKILL.md
  - custom/dataset-lineage/SKILL.md
last_updated: 2026-07-29
---

# query · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN — analyst / DE>` |
| Escalation | `<FILL_IN>` |

## Warehouse
| Field | Value |
|---|---|
| Warehouse type | `<FILL_IN — Snowflake / BigQuery / Redshift / Postgres / DuckDB>` |
| Connection method | `<FILL_IN — MCP / direct / dbt>` |
| Read-only credential | `<FILL_IN>` |

## Freshness SLAs (default; per-dataset in catalog)
| Domain | Default SLA (hours) |
|---|---|
| Financial | `<FILL_IN — e.g., 24>` |
| Product | `<FILL_IN — e.g., 4>` |
| Operational | `<FILL_IN — e.g., 1>` |

## Query cost thresholds
| Field | Value |
|---|---|
| EXPLAIN-required cost threshold | `<FILL_IN>` |
| Operator-approval threshold | `<FILL_IN>` |

## Escalation matrix
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine lookup / catalog register | query |
| L2 | Schema drift · stale > 2× SLA | `<FILL_IN>` |
| L3 | Warehouse down · systemic drift · mutation attempted from a query | `Governance/board` |

All `<FILL_IN>` per §14.7.
