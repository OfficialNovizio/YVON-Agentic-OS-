# trial · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `behavioural-experiment-design` | ✅ | "experiment design", "RCT design", "test this hypothesis" |
| `field-experiments` | ✅ | "deploy the experiment", "run this field trial" |
| `behavioural-audit-lit` | ✅ | "literature review", "has this been tested", "prior work on X" |

## Cross-agent
- `nudge` (BS) — design consumer.
- `frame` (BS) — messaging experiments.
- `bias` (BS) — ethics gate.
- `loom` (Product) — online-experiment execution.
- `research` (MI) — field recruitment.
- `insight` (D&A) — post-hoc analysis.
- Shared OS: `sample_size.py` · `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: trial
department: "Behavioural Science"
identity_layer: false
skills:
  - name: behavioural-experiment-design
    entry_point: true
    tier: 3
    handoffs:
      - {to: loom, dept: Product, why: online execution}
      - {to: research, dept: "Market Intelligence", why: field recruitment}
      - {to: bias, dept: "Behavioural Science", why: ethics gate}
      - {to: verification-before-completion, dept: Shared OS}
  - name: field-experiments
    entry_point: true
    tier: 3
    handoffs:
      - {to: bias, dept: "Behavioural Science", why: ethics review + adverse-event escalation}
      - {to: insight, dept: "Data & Analytics", why: post-hoc analysis}
      - {to: board, dept: Governance, why: adverse-event stopping-rule triggered}
      - {to: verification-before-completion, dept: Shared OS}
  - name: behavioural-audit-lit
    entry_point: true
    tier: 3
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
precedence:
  - {trigger: "experiment design", winner: behavioural-experiment-design}
  - {trigger: "field trial", winner: field-experiments}
  - {trigger: "literature review", winner: behavioural-audit-lit}
```
