# frame · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `framing-analysis` | ✅ | "framing analysis", "reframe this", "gain vs loss" |
| `narrative-arc` | ✅ | "narrative for X", "board narrative", "change communication" |
| `messaging-testing` | ✅ | "test this framing", "A/B test messaging" |

## Cross-agent
- `nudge` (BS) — behaviour-design overlap.
- `bias` (BS) — ethics gate.
- `lena` · `weave` (Brand Studio) — copy peers.
- `echo` (Exec Office) — investor comms.
- `loom` (Product) — experiment execution.
- Shared OS: `verification-before-completion` · `sample_size.py`.

## yvon-compile

```yaml
# yvon-compile:
agent: frame
department: "Behavioural Science"
identity_layer: false
skills:
  - name: framing-analysis
    entry_point: true
    tier: 3
    handoffs:
      - {to: bias, dept: "Behavioural Science", why: ethics check}
      - {to: verification-before-completion, dept: Shared OS}
  - name: narrative-arc
    entry_point: true
    tier: 3
    handoffs:
      - {to: weave, dept: "Brand Studio", why: storytelling peer}
      - {to: verification-before-completion, dept: Shared OS}
  - name: messaging-testing
    entry_point: true
    tier: 3
    handoffs:
      - {to: loom, dept: Product, why: execution}
      - {to: nudge, dept: "Behavioural Science", why: library outcome update}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "reframe", winner: framing-analysis}
  - {trigger: "narrative", winner: narrative-arc}
  - {trigger: "A/B messaging", winner: messaging-testing}
```
