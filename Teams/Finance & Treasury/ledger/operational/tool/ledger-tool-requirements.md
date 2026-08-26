# ledger · tool requirements

> **States needs, not grants** (§7).

| Skill | Required | Optional | Source line |
|---|---|---|---|
| close-month | Read · Web fetch · Bash (per allowed-tools) · File write | QB / Stripe / PayPal / Square MCPs · xlsx skill | Marketplace body — connector-first, CSV fallback |
| chart-of-accounts | File read/write | — | All steps |
| transaction-categorizer | File read/write | QB / processor MCPs | Steps 2, 6 |

Governance/policy live in `ledger-config.md`.
