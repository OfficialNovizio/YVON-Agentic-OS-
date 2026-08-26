---
agent: ledger
department: Finance & Treasury
type: config
purpose: "CoA convention, categorisation rules, close-cadence, escalation. Read by chart-of-accounts, transaction-categorizer, close-month wrapper."
required_by:
  - custom/chart-of-accounts/SKILL.md
  - custom/transaction-categorizer/SKILL.md
  - marketplace/close-month/SKILL.md
last_updated: 2026-07-29
---

# ledger · config

## Who's using this

| Field | Value |
|---|---|
| Bookkeeper role | `<FILL_IN — controller/CFO/bookkeeper>` |
| Reviewer / approver | `<FILL_IN>` |

## Chart-of-accounts convention

| Field | Value |
|---|---|
| Code format | 5-digit (1XXXX Assets · 2XXXX Liab · 3XXXX Equity · 4XXXX Rev · 5-9XXXX Exp) |
| Standard base (GAAP/IFRS/other) | `<FILL_IN>` |
| Currency | `<FILL_IN — org base currency; FX-flagged transactions per treasure>` |

## Ventures in scope

| Venture | Base currency | Notes |
|---|---|---|
| `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |

## Categorisation rules

Operator-declared vendor → account mappings. Not model-inferred.

| Vendor pattern | Account code | Confidence base |
|---|---|---|
| `<FILL_IN — vendor name regex>` | `<FILL_IN>` | high |
| `<FILL_IN>` | `<FILL_IN>` | high |

## Close cadence + gates

| Field | Value |
|---|---|
| Close cadence | monthly |
| Close deadline (target working day of following month) | `<FILL_IN — e.g., day 10>` |
| Materiality threshold (auto-flag gap ≥ this) | `<FILL_IN — e.g., $500>` |
| Receipt-required threshold | `<FILL_IN — e.g., $75>` |

## Connectors

| Source | Config |
|---|---|
| Primary ledger (QuickBooks / Xero / other) | `<FILL_IN>` |
| Processor 1 | `<FILL_IN — PayPal/Stripe/Square/…>` |
| Processor 2 | `<FILL_IN>` |
| Save-to location | `<FILL_IN — Drive/OneDrive/local>` |

## Escalation matrix

| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine categorisation | ledger itself |
| L2 | Gap ≥ materiality · new-account addition · re-parent | `<FILL_IN>` |
| L3 | Close blocked > 30 days · large uncategorised balance · fraud flag | `Governance/board` (fixed) |

## House style

| Field | Value |
|---|---|
| Close-packet naming | `close-packet-YYYY-MM.xlsx` / `.pdf` |
| Currency notation | `<FILL_IN>` |
| Date format | `<FILL_IN — YYYY-MM-DD>` |

All `<FILL_IN>` announced per §14.7.
