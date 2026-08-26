# pace · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `sprint-cadence` | ✅ | "sprint cadence", "sprint planning", "cadence setup" |
| `velocity-tracking` | ✅ | "team velocity", "cycle time", "throughput trend" |
| `delivery-forecast` | ✅ | "when will we ship", "delivery forecast", "Monte Carlo forecast" |

## Cross-agent
- `flow` (Ops) — bottleneck routing.
- `capacity` (Ops) — capacity input to forecast.
- `handoff` (Ops) — cross-team dependencies affect forecast.
- `anomaly` (D&A) — shift routing.
- `viz` (D&A) — chart rendering.
- Shared OS: `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: pace
department: "Ops & Delivery"
identity_layer: false
skills:
  - name: sprint-cadence
    entry_point: true
    tier: 3
    handoffs:
      - {to: flow, dept: "Ops & Delivery", why: retro items → bottleneck}
      - {to: verification-before-completion, dept: Shared OS}
  - name: velocity-tracking
    entry_point: true
    tier: 3
    handoffs:
      - {to: anomaly, dept: "Data & Analytics", why: shift triage}
      - {to: flow, dept: "Ops & Delivery", why: systemic root cause}
      - {to: verification-before-completion, dept: Shared OS}
  - name: delivery-forecast
    entry_point: true
    tier: 3
    handoffs:
      - {to: capacity, dept: "Ops & Delivery", why: capacity constraints}
      - {to: viz, dept: "Data & Analytics", why: histogram}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "sprint cadence", winner: sprint-cadence}
  - {trigger: "cycle time", winner: velocity-tracking}
  - {trigger: "when will we ship", winner: delivery-forecast}
```
