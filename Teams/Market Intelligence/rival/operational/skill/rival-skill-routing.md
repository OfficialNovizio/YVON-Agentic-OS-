# rival · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `competitor-tracking` | ✅ | "track competitor X", "competitor profile", "competitor list" |
| `pricing-intel` | ✅ | "competitor pricing", "what does X charge", "pricing landscape" |
| `feature-comparison` | ✅ | "feature comparison", "us vs competitor", "who has feature X" |

## Cross-agent
- `scope` (MI) — landscape + entry-analysis consume this data.
- `Product/price` — pricing consumer.
- `Product/spec` + `dev` — feature-truth source.
- `viz` (D&A) — matrix rendering.
- `board` — L3.
- Shared OS: `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: rival
department: "Market Intelligence"
identity_layer: false
skills:
  - {name: competitor-tracking, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
  - name: pricing-intel
    entry_point: true
    tier: 3
    handoffs:
      - {to: price, dept: Product, why: pricing consumer}
      - {to: verification-before-completion, dept: Shared OS}
  - name: feature-comparison
    entry_point: true
    tier: 3
    handoffs:
      - {to: spec, dept: Product, why: our feature-truth}
      - {to: dev, dept: Engineering, why: technical feature verification}
      - {to: viz, dept: "Data & Analytics", why: matrix rendering}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "competitor pricing", winner: pricing-intel}
  - {trigger: "competitor profile", winner: competitor-tracking}
  - {trigger: "feature comparison", winner: feature-comparison}
```
