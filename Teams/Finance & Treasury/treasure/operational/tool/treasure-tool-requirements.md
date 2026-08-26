# treasure · tool requirements

> **States needs, not grants** (§7).

| Skill | Required | Optional | Source line |
|---|---|---|---|
| entity-account-map | File read/write (masked view) | Bank MCP for balance auto-fetch · Secure store for account numbers | All steps |
| fx-exposure | File read (config, ledger, accounts) | Web fetch (rate source) · Rate API MCP | All steps |
| cash-management | File read (config, account map, balances) | Bank MCP for auto-refresh | All steps |

Sensitive data (account numbers, signatory details) — never in plain output; masked view only. Full data lives in secure-store integration configured per operator.

Governance/policy in `treasure-config.md`.
