# felix · tool requirements

> **States needs, not grants** (§7).

## Aggregate

| Skill | Required | Optional | Source line |
|---|---|---|---|
| cash-flow-snapshot | Web fetch or connector · File write (xlsx) | QuickBooks/PayPal/Stripe/Square MCPs | Marketplace body — connector-first, CSV fallback |
| runway-model | File read (config, ledger data) | File write (scenario export) | Steps 1-2 read; Step 5 export |
| unit-economics | File read (config, ledger, spend data) | File write (per-venture export) | Steps 2, 5 |
| budget-scenarios | File read (config, ledger baseline) | File write (matrix export) | Steps 1, 5 |

## Runtime notes

- **xlsx skill** is required by `cash-flow-snapshot` (Shared OS dependency, not owned here).
- **Connector MCPs** (QB, Stripe, PayPal, Square) are Optional — skill falls back to CSV upload without them.
- **Python execution** not required for felix's current skills.

## Governance/policy layer

Permissions live in `felix-config.md`. This file (technical) is separate per §7.
