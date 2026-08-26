---
name: transaction-categorizer
type: custom
status: built from scratch
assigned_agent: ledger (Finance & Treasury / Bookkeeping)
portable: true
date_added: 2026-07-29
tier: 3
description: "Categorises transactions to CoA accounts with venture tagging. Operator confirms every categorisation flagged low-confidence. Never auto-categorises. Feeds close-month reconciliation with categorised state."
triggers:
  - categorise this transaction
  - what account for this
  - bulk categorise
  - fix uncategorised transactions
  - re-categorise
---

# Transaction Categorizer

## Introduction

Built from scratch 2026-07-29. Sits between raw transactions (from `close-month`'s reconciliation gap detection) and finalised categorisation. Never auto-assigns without operator confirmation for low-confidence matches.

## Purpose

Given a transaction (from QB, processor, or CSV), propose the CoA account + venture tag + confidence level. Operator confirms/rejects each low-confidence proposal before it's written back to the ledger.

## When to Use

- "Categorise this transaction" / "what account for this"
- "Bulk categorise" (routes uncategorised entries from `close-month` output)
- "Re-categorise" (a previously miscategorised entry)

## Structure / Protocol

```
1. INTAKE     transaction (date, amount, vendor/description, source)
2. LOOKUP     CoA candidates by vendor-history + description keywords
3. CONFIDENCE tag each candidate high/medium/low
4. PROPOSE    high → auto-suggest; med/low → present for operator choice
5. CONFIRM    operator confirms or overrides
6. WRITE      write categorisation back to source (QB / CSV) + venture tag
```

## Instructions

### Step 1: Intake

Transaction fields required: date, amount, vendor/description, source (QB / processor / CSV). If a source doesn't provide vendor, ask; do not guess.

### Step 2: Lookup CoA candidates

Match by:
- **Vendor history** — if this vendor has been categorised before (from operator-confirmed history), use that account with `high` confidence.
- **Description keywords** — rule-based mapping in `categorization-rules.yaml` (operator-declared, not model-inferred).
- **Amount range + venture context** — for large / unusual amounts, propose the top 3 candidates and ask.

### Step 3: Confidence

- `high` — vendor previously categorised same way > 3 times
- `medium` — description-rule match, vendor new
- `low` — no rule match; model reasoning only (§0.6 flag)

### Step 4: Propose

- `high` → auto-suggest with 1-click confirm; still requires operator confirmation on first-time-this-session categorisation.
- `medium`/`low` → present with candidates; operator picks or overrides.

### Step 5: Confirm

Every categorisation is confirmed by operator. Never write without a real signed acceptance.

### Step 6: Write

Update source (QB via MCP if configured; CSV local; ledger yaml). Also write to `vendor-history.yaml` so next time this vendor auto-categorises.

## Output Format

Per-transaction: proposed account + confidence + reason. Bulk mode: table.

## Principles

- **Never auto-categorise without confirmation.** Even `high` confidence needs a first-in-session sign-off (§0.7).
- **Operator overrides always win.** Overrides update vendor-history so learning is captured.
- **No invented rules.** `categorization-rules.yaml` is operator-declared; never model-inferred.
- **Low-confidence never masquerades as high.** Confidence tag is honest.

## Fallback

| Failure mode | Response |
|---|---|
| No rule + no vendor history | Present as `low`; ask operator |
| Ambiguous multi-account match | Present all; ask |
| Amount inconsistent with account normal balance | Flag; ask operator to confirm |

## Boundaries

- `chart-of-accounts` (this agent) — supplies valid account codes.
- `close-month` (marketplace) — feeds uncategorised entries into this skill.
- `felix` (F&T) — reads categorised venture-tagged data.
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| transaction-categorizer | File read/write | QuickBooks MCP · Stripe/PayPal MCPs | Steps 2, 6 |
