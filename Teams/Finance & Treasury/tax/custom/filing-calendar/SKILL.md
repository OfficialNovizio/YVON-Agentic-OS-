---
name: filing-calendar
type: custom
status: built from scratch
assigned_agent: tax (Finance & Treasury / Tax Strategy)
portable: true
date_added: 2026-07-29
tier: 3
description: "Jurisdiction-parametric tax-filing deadline registry — income, sales/VAT/GST, payroll, information returns, franchise, property, industry-specific. Alert tiers per config. Overdue never auto-defers. Genericised per §0.4b — no hardcoded jurisdiction, no hardcoded regime."
triggers:
  - tax deadlines
  - upcoming filings
  - filing calendar
  - when's the next filing due
  - add tax filing
  - register a filing obligation
  - retire filing
  - what filings do we have
---

# Filing Calendar

## Purpose

Registry of tax-filing obligations by (venture × jurisdiction × filing_type). Alerts on approaching deadlines; auto-escalates overdue.

## When to Use

- "Tax deadlines" · "upcoming filings" · "filing calendar" · "when's the next filing due"
- "Add / retire filing" · "register a filing obligation"
- Quarterly filing review

Do NOT use for: tax OPTIMIZATION (that's `tax-optimization-review`) or R&D credit computation (`rd-credits`).

## Structure / Protocol

```
REGISTER    operator supplies obligation → append to filings.yaml
UPDATE      cadence change / entity change / retire → append revision
LOOKUP      by jurisdiction / venture / next-due
CALENDAR    horizon view with alert tiers per config
ATTEST      confirm filing done + evidence
```

## Instructions

### Step 1: Register

Operator supplies (never invent):
- `slug` — kebab-case
- `filing_type` — income / sales-VAT-GST / payroll / info-return / franchise / property / industry-specific
- `jurisdiction` — jurisdiction code
- `venture_scope` — venture or org-wide
- `cadence` — annual / quarterly / monthly / on-trigger
- `next_due` — YYYY-MM-DD
- `owner` — internal accountable
- `filing_body` — regulator (e.g., "IRS", "CRA", "HMRC", "GST Council")
- `source_url` — link to filing form/guidance
- `estimated_time` — days to prepare (for lead-time calc)

### Step 2: Alert bucketing

Read `tax-config.md` alert tiers. Default: 🔴 overdue · 🟠 ≤7d · 🟡 ≤30d · 🟢 ≤90d.

### Step 3: Overdue → L3

Any filing past `next_due` auto-escalates L3 to `Governance/board`. Late filings carry penalties + interest — treat as substantive event.

### Step 4: Attest

Filing done → attestor supplies date + confirmation number + copy of filed return.

## Output Format

Calendar table (nearest first) with tier colours; per-filing lookup returns full record.

## Principles

- **No invented filings.** Every row traces to real regulator + form.
- **No hardcoded jurisdiction.** Every filing has explicit `jurisdiction` field.
- **Overdue never defers.** Auto-escalate.
- **Attestation signed.** Never system-inferred.
- **Never delete history.**

## Fallback

| Failure | Response |
|---|---|
| Missing field on register | Ask |
| Overdue | L3 escalate |
| Regulator changes form / cadence | Update via revision; keep prior |

## Boundaries

- `tax-optimization-review` (this agent) — analytical; calendar is state.
- `ledger` (F&T) — tax accounts feed liability numbers.
- `comply/obligation-register` (Legal & Compliance) — filing obligations may cross-ref regulatory regimes.
- `board` (Governance) — L3.
- Shared OS: `verification-before-completion` — inherited.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| filing-calendar | File read/write | Web fetch (verify form URLs) | All steps |
