# capacity · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `capacity-model` | ✅ | "capacity model", "team capacity", "are we over-committed" |
| `capacity-forecast` | ✅ | "capacity forecast", "can we deliver the roadmap", "hiring needs" |
| `build-vs-hire` | ✅ | "build vs hire", "should we hire for X", "automate vs hire" |

## Cross-agent
- `pace/delivery-forecast` (Ops) — consumer.
- `flow` (Ops) — process gains change capacity.
- `handoff` (Ops) — dependencies affect capacity.
- `vista` (Exec) + `spec` (Product) — roadmap demand.
- `meta` (AI & Agents) — agent-buildability.
- `felix` (F&T) — cost model.
- `marcus` + `board` — decisions.
- Shared OS: `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: capacity
department: "Ops & Delivery"
identity_layer: false
skills:
  - {name: capacity-model, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
  - name: capacity-forecast
    entry_point: true
    tier: 3
    handoffs:
      - {to: vista, dept: "Executive Office", why: roadmap demand}
      - {to: spec, dept: Product, why: PRD scope}
      - {to: felix, dept: "Finance & Treasury", why: cost model}
      - {to: verification-before-completion, dept: Shared OS}
  - name: build-vs-hire
    entry_point: true
    tier: 3
    handoffs:
      - {to: meta, dept: "AI & Agents", why: buildability assessment}
      - {to: felix, dept: "Finance & Treasury", why: loaded cost}
      - {to: marcus, dept: "Executive Office", why: strategic decision}
      - {to: board, dept: Governance, why: commitment > $5K/mo}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "capacity", winner: capacity-model}
  - {trigger: "hiring needs", winner: capacity-forecast}
  - {trigger: "build vs hire", winner: build-vs-hire}
```
