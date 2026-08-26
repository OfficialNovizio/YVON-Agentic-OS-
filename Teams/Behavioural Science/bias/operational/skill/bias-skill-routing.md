# bias · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `cognitive-bias-audit` | ✅ | "bias audit", "is this decision biased", "check for bias" |
| `ethics-review` | ✅ | "ethics review", "is this ethical", "dark pattern review" |
| `pre-mortem` | ✅ | "pre-mortem", "imagine this failed", "what could go wrong" |

## Cross-agent
- `nudge` · `frame` · `trial` (BS) — ethics gate consumers.
- `board/risk-assessment-matrix` (Governance) — gate peer.
- `marcus` (Exec Office) — strategy pre-mortem.
- `sentinel` (Governance) — bypass detection peer.
- Shared OS: `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: bias
department: "Behavioural Science"
identity_layer: false
skills:
  - name: cognitive-bias-audit
    entry_point: true
    tier: 3
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
  - name: ethics-review
    entry_point: true
    tier: 3
    handoffs:
      - {to: board, dept: Governance, why: L3 ethics-reject + dark-pattern-high}
      - {to: verification-before-completion, dept: Shared OS}
  - name: pre-mortem
    entry_point: true
    tier: 3
    handoffs:
      - {to: marcus, dept: "Executive Office", why: strategy pre-mortem}
      - {to: board, dept: Governance, why: gate attach}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "bias audit", winner: cognitive-bias-audit}
  - {trigger: "ethics review", winner: ethics-review}
  - {trigger: "pre-mortem", winner: pre-mortem}
```
