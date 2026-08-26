# anomaly · skill routing

> Non-leader. No identity layer.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `anomaly-detection-rules` | ✅ | "anomaly rule", "set alert on X", "list rules" |
| `alert-routing` | ✅ (mostly auto-triggered) | "route this alert", "alert suppression" |
| `incident-triage-data` | ✅ | "triage this alert", "investigate anomaly", "why did X spike" |

## Cross-agent
- `insight` (D&A) — metric registry.
- `query`/`dataset-lineage` (D&A) — upstream check.
- `dana` (Engineering) — pipeline health.
- `cortex` (Cybersecurity) — security-incident version.
- `board` — L3.
- Shared OS: `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: anomaly
department: "Data & Analytics"
identity_layer: false
skills:
  - name: anomaly-detection-rules
    entry_point: true
    tier: 3
    handoffs:
      - {to: insight, dept: "Data & Analytics", why: metric registry source}
      - {to: verification-before-completion, dept: Shared OS}
  - name: alert-routing
    entry_point: true
    tier: 3
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
  - name: incident-triage-data
    entry_point: true
    tier: 3
    handoffs:
      - {to: dana, dept: Engineering, why: data-quality remediation}
      - {to: query, dept: "Data & Analytics", why: dataset-lineage check}
      - {to: insight, dept: "Data & Analytics", why: deeper analysis if real anomaly}
      - {to: board, dept: Governance, why: L3 critical unresolved}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "anomaly rule", winner: anomaly-detection-rules}
  - {trigger: "triage this alert", winner: incident-triage-data}
  - {trigger: "route this alert", winner: alert-routing}
```
