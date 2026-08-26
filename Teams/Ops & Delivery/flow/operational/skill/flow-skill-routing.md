# flow · skill routing

> Ops & Delivery leader. Identity: Deming.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `process-mapping` | ✅ | "map this process", "SIPOC", "value stream map" |
| `bottleneck-analysis` | ✅ | "bottleneck", "why is X slow", "theory of constraints" |
| `sop-registry` | ✅ | "SOP for X", "document this process", "register SOP" |

## Cross-agent
- `pace` (Ops) — cycle-time trending.
- `capacity` (Ops) — capacity implications.
- `handoff` (Ops) — cross-team handoff design.
- `viz` (D&A) — Sankey / value-stream rendering.
- `felix` (F&T) — elevate cost.
- `board` — L3.
- Shared OS: `verification-before-completion`.

## Identity layer
Leader. Deming `identity/deming-process.md`.

## yvon-compile

```yaml
# yvon-compile:
agent: flow
department: "Ops & Delivery"
identity_layer: true
skills:
  - name: process-mapping
    entry_point: true
    tier: 3
    handoffs:
      - {to: viz, dept: "Data & Analytics", why: Sankey rendering}
      - {to: verification-before-completion, dept: Shared OS}
  - name: bottleneck-analysis
    entry_point: true
    tier: 3
    handoffs:
      - {to: felix, dept: "Finance & Treasury", why: elevate cost}
      - {to: marcus, dept: "Executive Office", why: external-constraint strategy}
      - {to: verification-before-completion, dept: Shared OS}
  - name: sop-registry
    entry_point: true
    tier: 3
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
precedence:
  - {trigger: "process map", winner: process-mapping}
  - {trigger: "bottleneck", winner: bottleneck-analysis}
  - {trigger: "SOP", winner: sop-registry}
```
