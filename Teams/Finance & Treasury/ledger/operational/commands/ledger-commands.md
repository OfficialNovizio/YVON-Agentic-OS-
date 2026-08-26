# ledger · commands

| Phrase | Fires |
|---|---|
| "close the month" · "month-end close" · "reconcile the month" · "close packet" | `close-month` |
| "CoA lookup" · "what's the account code for X" · "add account" · "retire account" · "list accounts" | `chart-of-accounts` |
| "categorise this transaction" · "bulk categorise" · "fix uncategorised" · "re-categorise" | `transaction-categorizer` |

## Ambiguous → ASK

| Phrase | Ask |
|---|---|
| "which account" | Standalone lookup (chart-of-accounts) or transaction context (transaction-categorizer)? |
| "reconcile" | Month-level (close-month) or single-txn (categorizer)? |

## Slash

| Shortcut | Fires |
|---|---|
| `/ledger:close` | close-month |
| `/ledger:coa` | chart-of-accounts |
| `/ledger:cat` | transaction-categorizer |
