---
name: entity-account-map
type: custom
status: built from scratch
assigned_agent: treasure (Finance & Treasury / Treasury)
portable: true
date_added: 2026-07-29
tier: 3
description: "Registry mapping (entity × jurisdiction) → bank accounts + signatories + payment rails. New jurisdiction entry → setup checklist. Genericised per §0.4b — no hardcoded jurisdiction, no hardcoded bank."
triggers:
  - which account to use
  - which bank
  - payment rails for X
  - signatory map
  - new entity account setup
  - entity account map
  - account setup checklist
---

# Entity Account Map

## Purpose

Registry of banking + payment infrastructure per (entity × jurisdiction). Answers "which account do we use for X" and "what's the setup checklist for a new jurisdiction."

## Structure / Protocol

```
REGISTER  new entity/jurisdiction account → append
UPDATE    signatory change / new rail / close → append revision
LOOKUP    by entity + jurisdiction → return account list
CHECKLIST new-jurisdiction setup guidance
AUDIT     quarterly signatory audit
```

## Instructions

Register fields: entity, jurisdiction, bank, account_number (masked in output — full only in encrypted store), currency, purpose (operating/reserve/payroll/tax-holding), signatories, payment_rails_supported, opened_date, KYC_status.

New-jurisdiction setup checklist: required entity documentation · bank options · KYC/KYB timeline · minimum-balance requirements · payment rails available (ACH · SEPA · Faster Payments · SWIFT · Wire · local variants).

Quarterly audit: confirm signatories still authorised, no stale accounts, currency exposure aligned with treasure/fx-exposure.

## Principles

- **Account numbers masked in output**, full detail in secure store only (routes to `warden` for control).
- **Signatory changes require dual-authorisation** — never single-key change.
- **Never invent bank options** — operator supplies bank shortlist per jurisdiction.
- **Provenance every field** — `[bank statement]` `[KYB completion doc]` `[operator input]`.

## Boundaries

- `cash-management` (this agent) — reads account list for cash-position aggregation.
- `fx-exposure` (this agent) — reads per-currency account balances.
- `warden` (Cybersecurity) — signatory + account credential protection.
- `comply/regulated-activity-readiness` (Legal & Compliance) — new-jurisdiction entry gates.
- `board` — L3 for material signatory changes.
- Shared OS: `verification-before-completion`.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| entity-account-map | File read/write (masked view) · Secure store integration for account numbers | Bank MCP for balance auto-fetch | All steps |
