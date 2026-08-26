# query · skill routing

> Non-leader. No identity layer.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `warehouse-catalog` | ✅ | "what tables exist", "dataset catalog", "dataset owner", "list datasets" |
| `sql-optimization` | ✅ | "write a query for X", "SQL for Y", "run this query", "explain plan" |
| `dataset-lineage` | ✅ | "lineage for X", "what consumes X", "impact of changing dataset Y" |

## Cross-agent handoffs
- `dana` (Engineering) — pipeline definitions upstream.
- `insight` (D&A) — metric registry + dashboards downstream.
- `viz` (D&A) — chart rendering + lineage-graph.
- `veil` (Cybersecurity) — PII flags in catalog.
- `board` (Governance) — L3.
- Shared OS: `verification-before-completion`.

## yvon-compile block

```yaml
# yvon-compile:
agent: query
department: "Data & Analytics"
identity_layer: false
skills:
  - name: warehouse-catalog
    entry_point: true
    tier: 3
    handoffs:
      - {to: dana, dept: Engineering, why: pipeline definitions upstream}
      - {to: veil, dept: Cybersecurity, why: PII flag routing}
      - {to: verification-before-completion, dept: Shared OS}
  - name: sql-optimization
    entry_point: true
    tier: 3
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
  - name: dataset-lineage
    entry_point: true
    tier: 3
    handoffs:
      - {to: insight, dept: "Data & Analytics", why: downstream metrics/dashboards}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "SQL for X", winner: sql-optimization}
  - {trigger: "dataset catalog", winner: warehouse-catalog}
  - {trigger: "lineage", winner: dataset-lineage}
```
