# nudge · skill routing

> Behavioural Science leader. Identity: Simon + Fogg MAP.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `behaviour-design` | ✅ | "design a nudge", "increase X behaviour", "MAP grid" |
| `nudge-library` | ✅ | "what nudge for X", "nudge patterns", "anchoring" |
| `behavioural-audit` | ✅ | "audit this flow", "dark pattern check", "friction audit" |

## Cross-agent
- `frame` (BS) — framing complement.
- `trial` (BS) — behavioural experimentation.
- `bias` (BS) — ethics review.
- `Product/loom` — experimentation execution.
- `Product/ux` — UX peer.
- `board` — L3.
- Shared OS: `verification-before-completion`.

## Identity layer
Leader — Simon + Fogg (`identity/fogg-simon-map.md`).

## yvon-compile

```yaml
# yvon-compile:
agent: nudge
department: "Behavioural Science"
identity_layer: true
skills:
  - name: behaviour-design
    entry_point: true
    tier: 3
    handoffs:
      - {to: bias, dept: "Behavioural Science", why: ethics review}
      - {to: loom, dept: Product, why: experimentation execution}
      - {to: verification-before-completion, dept: Shared OS}
  - name: nudge-library
    entry_point: true
    tier: 3
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
  - name: behavioural-audit
    entry_point: true
    tier: 3
    handoffs:
      - {to: bias, dept: "Behavioural Science", why: ethics review}
      - {to: board, dept: Governance, why: L3 systemic dark-pattern}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "design a nudge", winner: behaviour-design}
  - {trigger: "audit this flow", winner: behavioural-audit}
  - {trigger: "nudge library", winner: nudge-library}
```
