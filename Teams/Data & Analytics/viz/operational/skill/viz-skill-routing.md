# viz · skill routing

> Non-leader. No identity layer.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `dashboard-standards` | ✅ | "chart type for X", "colour palette", "dashboard standard" |
| `viz-accessibility` | ✅ | "a11y", "WCAG check", "accessibility audit" |
| `dashboard-audit` | ✅ | "portfolio audit", "stale dashboards", "dashboard cleanup" |

## Cross-agent
- `insight` (D&A) — dashboards consume viz standards.
- `pixel` (Brand Studio) — general accessibility peer.
- `board` (Governance) — L3.
- Shared OS: `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: viz
department: "Data & Analytics"
identity_layer: false
skills:
  - {name: dashboard-standards, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
  - {name: viz-accessibility, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
  - name: dashboard-audit
    entry_point: true
    tier: 3
    handoffs:
      - {to: insight, dept: "Data & Analytics", why: metric drift routes here}
      - {to: board, dept: Governance, why: L3 systemic non-compliance}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "chart type", winner: dashboard-standards}
  - {trigger: "a11y", winner: viz-accessibility}
  - {trigger: "portfolio audit", winner: dashboard-audit}
```
