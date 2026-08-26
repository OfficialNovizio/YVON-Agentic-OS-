---
name: chart-of-accounts
type: custom
status: built from scratch
assigned_agent: ledger (Finance & Treasury / Bookkeeping)
portable: true
date_added: 2026-07-29
tier: 3
description: "Standard chart of accounts with venture-tagging structure. Register / update / retire account nodes. Enforces one-active-code-per-venture-per-purpose. Cross-references venture list from felix-config. Genericised per §0.4b — no hardcoded venture, no hardcoded currency."
triggers:
  - what's the account code for X
  - CoA lookup
  - chart of accounts
  - add account
  - retire account
  - which account for [transaction type]
  - list accounts
---

# Chart of Accounts

## Introduction

Built from scratch on 2026-07-29 as ledger's canonical chart-of-accounts (CoA). Every transaction categorised by `transaction-categorizer` maps to an active CoA entry here.

Genericised from catalog's `vyon-chart-of-accounts` (single-venture hardcoded). Here `venture_tag` is dimensional.

## Purpose

Own the CoA state:
- Account nodes (5-level hierarchy: Assets / Liabilities / Equity / Revenue / Expenses)
- Per-account: code · name · type · normal balance · parent · active status
- Venture-tagging structure — each account can be venture-scoped or org-wide
- Retirement history (retired accounts stay for audit)

State at `coa.yaml`.

## When to Use

- "What's the account code for X" · "which account for [txn]" · "CoA lookup"
- "Add account" · "retire account" · "restructure accounts"
- "List accounts" · "chart of accounts"

Do NOT use for:
- Actual transaction categorisation — `transaction-categorizer` (this agent)
- P&L reporting — that comes from `close-month` marketplace skill after categorisation

## Structure / Protocol

```
LOOKUP        by code / name / venture / type → return active node
ADD           new account → validate uniqueness → append
UPDATE        rename / re-parent → bump revision → keep prior row
RETIRE        no longer used → mark retired; keep row + history
LIST          by type / venture / active-only
```

## Instructions

### Step 1: Lookup

Match by exact code OR by name (fuzzy) OR by (transaction_type, venture) tuple. Return active node + parent path. If ambiguous, present all matches; do not guess.

### Step 2: Add

Operator supplies:
- `code` (5-digit convention: 1XXXX Assets / 2XXXX Liab / 3XXXX Equity / 4XXXX Rev / 5-9XXXX Exp)
- `name`
- `type` (asset/liability/equity/revenue/expense)
- `normal_balance` (debit/credit)
- `parent_code`
- `venture_tag` (venture slug or `org-wide`)

Validate: code unique per venture_tag; type consistent with code range; normal_balance matches type.

### Step 3: Update

Rename or re-parent only. Do not change code or type — retire and re-add if either changes. Bump revision; archive prior row.

### Step 4: Retire

Mark `status=retired`. Keep row + all history. Attempts to add a transaction to a retired account are rejected with the retirement reason.

### Step 5: List

By type / venture / active-only / by parent. Return sorted table.

## Output Format

Table with account code / name / type / normal balance / parent / venture / status.

## Principles

- **No invented codes.** Codes follow the 5-digit convention operator-declared in `ledger-config.md`; operator supplies each specific code (§0.5).
- **One active code per (name, venture, type) tuple.**
- **Never delete history.** Retired accounts stay.
- **Reject transactions to retired accounts.** Referential integrity is a first-class check.

## Fallback

| Failure mode | Response |
|---|---|
| Code collision | Present existing; ask if update or new |
| Ambiguous lookup | Present all matches; ask |
| Missing field on add | Ask; never invent |

## Boundaries

- `transaction-categorizer` (this agent) — consumes CoA for account assignment; one-way in.
- `close-month` (marketplace) — reconciliation output rolls up by account.
- `felix` (F&T) — unit-economics reads venture-tagged revenue + variable costs; CoA venture-tags enable that.
- `tax` (F&T) — tax computations reference specific accounts (revenue, deductible expense).
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| chart-of-accounts | File read/write | — | All steps mutate/read `coa.yaml` |
