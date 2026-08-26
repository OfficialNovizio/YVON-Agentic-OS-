# trend · skill routing

> Non-leader.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `macro-signals` | ✅ | "macro trend", "economic outlook", "macro dashboard" |
| `emerging-trends` | ✅ | "emerging trends", "trend spotting", "what's emerging in X" |
| `regulatory-horizon` | ✅ | "regulatory horizon", "draft rules", "upcoming legislation" |

## Cross-agent
- `scope` (MI) — timing input.
- `comply` (Legal & Compliance) — regulatory-horizon feeds obligation register once enacted.
- `felix` (F&T) — rate sensitivity input.
- `meta` (AI & Agents) — AI-specific trends.
- Shared OS: `verification-before-completion`.

## yvon-compile

```yaml
# yvon-compile:
agent: trend
department: "Market Intelligence"
identity_layer: false
skills:
  - name: macro-signals
    entry_point: true
    tier: 3
    handoffs: [{to: felix, dept: "Finance & Treasury"}, {to: verification-before-completion, dept: Shared OS}]
  - name: emerging-trends
    entry_point: true
    tier: 3
    handoffs: [{to: scope, dept: "Market Intelligence"}, {to: meta, dept: "AI & Agents"}, {to: verification-before-completion, dept: Shared OS}]
  - name: regulatory-horizon
    entry_point: true
    tier: 3
    handoffs:
      - {to: comply, dept: "Legal & Compliance", why: pre-enactment → obligation once enacted}
      - {to: scope, dept: "Market Intelligence", why: timing input}
      - {to: board, dept: Governance, why: L3 market-critical}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "macro", winner: macro-signals}
  - {trigger: "emerging", winner: emerging-trends}
  - {trigger: "regulatory horizon", winner: regulatory-horizon}
```
