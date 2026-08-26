# handoff · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `handoff-protocol` | ✅ | "handoff protocol", "how to hand off X", "escalation protocol" |
| `handoff-registry` | ✅ | "log this handoff", "handoff history", "silent handoff patterns" |
| `dependency-map` | ✅ | "dependency map", "who depends on X", "critical path" |

## Cross-agent
- Every dept — the protocol is shared standard.
- `flow` (Ops) — process-level fixes.
- `pace/delivery-forecast` + `capacity/capacity-forecast` — consumers.
- `viz` — graph rendering.
- Shared OS: `verification-before-completion` · `memory-practices`.

## yvon-compile

```yaml
# yvon-compile:
agent: handoff
department: "Ops & Delivery"
identity_layer: false
skills:
  - {name: handoff-protocol, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
  - name: handoff-registry
    entry_point: true
    tier: 3
    handoffs:
      - {to: flow, dept: "Ops & Delivery", why: pattern → process fix}
      - {to: verification-before-completion, dept: Shared OS}
  - name: dependency-map
    entry_point: true
    tier: 3
    handoffs:
      - {to: viz, dept: "Data & Analytics", why: graph rendering}
      - {to: pace, dept: "Ops & Delivery", why: delivery forecast}
      - {to: capacity, dept: "Ops & Delivery", why: capacity forecast}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "handoff", winner: handoff-protocol}
  - {trigger: "log handoff", winner: handoff-registry}
  - {trigger: "dependency", winner: dependency-map}
```
