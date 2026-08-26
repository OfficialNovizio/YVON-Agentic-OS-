# tax · skill routing

> Non-leader. No identity layer.

## Skill map

| Skill | Entry? | Triggers |
|---|---|---|
| `filing-calendar` | ✅ | "tax deadlines", "filing calendar", "when's next due", "add filing" |
| `tax-optimization-review` | ✅ | "tax optimization", "tax review", "annual tax review" |
| `rd-credits` | ✅ | "R&D credits", "SR&ED", "IRC 41", "qualify R&D" |

## Cross-agent handoffs

- `ledger` (F&T) — P&L + payroll allocation for optimization + R&D quantification.
- `felix` (F&T) — material optimization deltas feed budget scenarios.
- `dev` (Engineering) — sprint logs / commits for R&D qualification.
- `comply/obligation-register` (Legal & Compliance) — filing obligations may cross-ref regulatory obligations.
- `board` (Governance) — L3 per config.
- Shared OS: `verification-before-completion`.

## yvon-compile block

```yaml
# yvon-compile:
agent: tax
department: "Finance & Treasury"
identity_layer: false
skills:
  - name: filing-calendar
    entry_point: true
    tier: 3
    handoffs:
      - {to: board, dept: Governance, why: overdue filings L3-escalate}
      - {to: comply, dept: "Legal & Compliance", why: filing obligations may cross-ref regulatory obligations}
      - {to: verification-before-completion, dept: Shared OS}
  - name: tax-optimization-review
    entry_point: true
    tier: 3
    handoffs:
      - {to: ledger, dept: "Finance & Treasury", why: P&L input}
      - {to: felix, dept: "Finance & Treasury", why: material $ deltas → budget scenarios}
      - {to: rd-credits, dept: "Finance & Treasury", why: R&D subset hand-off}
      - {to: verification-before-completion, dept: Shared OS}
  - name: rd-credits
    entry_point: true
    tier: 3
    handoffs:
      - {to: dev, dept: Engineering, why: sprint logs + commits for qualification}
      - {to: ledger, dept: "Finance & Treasury", why: payroll allocation + filing prep}
      - {to: board, dept: Governance, why: aggressive positions L3}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "tax deadlines", winner: filing-calendar}
  - {trigger: "R&D credits", winner: rd-credits}
  - {trigger: "tax optimization", winner: tax-optimization-review}
  - {trigger: "tax review", winner: tax-optimization-review}
```
