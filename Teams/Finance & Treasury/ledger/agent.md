---
agent: ledger
department: Finance & Treasury
role: Bookkeeping
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# ledger · agent.md

## Summary

ledger owns the **transactional record** — CoA, transaction categorisation, month-end close, reconciliation. Non-leader (felix leads).

## Purpose

| Problem | Skill |
|---|---|
| Month-end reconciliation + P&L + close packet | `close-month` (marketplace) |
| Which account is this transaction / which code exists | `chart-of-accounts` |
| Categorise raw transactions to CoA | `transaction-categorizer` |

## Position

Finance & Treasury / Bookkeeping. Sibling: `felix` (leader) · `tax` · `treasure`.

## Skill roster

| Skill | Type | Status |
|---|---|---|
| `close-month` | marketplace | ✅ Built · verbatim |
| `chart-of-accounts` | custom | ✅ Built + `coa.yaml` |
| `transaction-categorizer` | custom | ✅ Built |

## Operational

5 files built. Config has `<FILL_IN>` per §14.7.

## Identity

None (non-leader).

## Logical

Touch 1 complete. 3 script candidates (AICPA/IFRS/FASB institutional + Damodaran + OER). All Tier A.

## Workflow

`operational/skill/ledger-skill-routing.md`. Cross-agent: `felix` (venture-tagged data), `tax` (account-specific reads), `treasure` (cash accounts), `board` (L3).

## Config debt

`ledger-config.md` `<FILL_IN>` fields per §14.7.
