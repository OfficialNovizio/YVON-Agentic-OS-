# query · tool requirements
> **States needs, not grants** (§7).

| Skill | Required | Optional | Source line |
|---|---|---|---|
| warehouse-catalog | File read/write | Warehouse MCP (schema/freshness auto-probe) | All steps |
| sql-optimization | File read (catalog) · Warehouse read execution | EXPLAIN plan MCP · Query perf MCP | All steps |
| dataset-lineage | File read (catalog · registry · dashboard specs) | Graph rendering | All steps |

Read-only warehouse credential. Never mutation-capable.
