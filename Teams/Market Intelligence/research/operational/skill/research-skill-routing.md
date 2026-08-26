# research · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `primary-research` | ✅ | "primary research", "customer interview", "customer survey", "discovery calls" |
| `qualitative-synthesis` | ✅ | "synthesise research", "cross-study themes", "what have we learned about X" |
| `survey-templates` | ✅ | "survey template", "NPS survey", "reusable survey" |

## Cross-agent
- `scope` (MI) — validation input.
- `Product/ux` — user research peer (different subject: user vs market).
- `Product/loom` — experimentation peer.
- `Product/price/pricing-research` — Van Westendorp version there.
- `insight/ad-hoc-analysis` (D&A) — quantitative counterpart.
- `veil` (Cybersecurity) — PII handling.
- Shared OS: `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: research
department: "Market Intelligence"
identity_layer: false
skills:
  - name: primary-research
    entry_point: true
    tier: 3
    handoffs:
      - {to: veil, dept: Cybersecurity, why: PII handling}
      - {to: scope, dept: "Market Intelligence"}
      - {to: verification-before-completion, dept: Shared OS}
  - name: qualitative-synthesis
    entry_point: true
    tier: 3
    handoffs: [{to: scope, dept: "Market Intelligence"}, {to: verification-before-completion, dept: Shared OS}]
  - name: survey-templates
    entry_point: true
    tier: 3
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
precedence:
  - {trigger: "customer research", winner: primary-research}
  - {trigger: "cross-study synthesis", winner: qualitative-synthesis}
  - {trigger: "which survey", winner: survey-templates}
```
