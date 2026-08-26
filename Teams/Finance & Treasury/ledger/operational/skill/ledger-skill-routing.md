# ledger · skill routing

> Non-leader (felix leads). No identity layer.

## Skill map

| Skill | Entry? | Triggers |
|---|---|---|
| `close-month` (marketplace) | ✅ | "close the month", "reconcile the month", "close packet" |
| `chart-of-accounts` | ✅ | "CoA lookup", "add account", "which account for X" |
| `transaction-categorizer` | ✅ | "categorise this", "bulk categorise", "fix uncategorised" |

## Precedence

| Ambiguous | Wins |
|---|---|
| "reconcile" | `close-month` (bigger scope) |
| "which account" | `chart-of-accounts` (lookup) or `transaction-categorizer` (with a transaction context) — ASK |

## Cross-agent handoffs

- `felix` (F&T) — supplies venture-tagged financial data for unit-economics.
- `tax` (F&T) — reads specific account categories for tax computations.
- `treasure` (F&T) — cash accounts, FX-flagged accounts.
- `board` (Governance) — L3 for blocked closes / fraud flags.
- Shared OS: `verification-before-completion` — inherited.

## yvon-compile block

```yaml
# yvon-compile:
agent: ledger
department: "Finance & Treasury"
identity_layer: false
skills:
  - name: close-month
    entry_point: true
    tier: 3
    handoffs:
      - {to: transaction-categorizer, dept: "Finance & Treasury", why: uncategorised entries need routing}
      - {to: verification-before-completion, dept: Shared OS}
  - name: chart-of-accounts
    entry_point: true
    tier: 3
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
  - name: transaction-categorizer
    entry_point: true
    tier: 3
    handoffs:
      - {to: chart-of-accounts, dept: "Finance & Treasury", why: valid account lookup}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "reconcile", winner: close-month}
  - {trigger: "close the books", winner: close-month}
  - {trigger: "add account", winner: chart-of-accounts}
  - {trigger: "categorise this", winner: transaction-categorizer}
```
