---
name: rd-credits
type: custom
status: built from scratch
assigned_agent: tax (Finance & Treasury / Tax Strategy)
portable: true
date_added: 2026-07-29
tier: 3
description: "R&D tax-credit qualification + narrative preparation. Jurisdiction-parametric — supports US IRC §41, UK R&D relief, EU country schemes, CA SR&ED. Tags qualifying dev activity from engineering sprint logs; drafts technical narratives; hands filing to ledger + CPA."
triggers:
  - R&D credits
  - SR&ED
  - research and development credit
  - IRC 41
  - qualify R&D activity
  - R&D narrative
  - tag qualifying dev work
---

# R&D Credits

## Purpose

Identify qualifying R&D activity across ventures, compile the technical narrative regulators require, quantify eligible spend, hand off to CPA/CTA for filing.

Regime support (per operator declaration in `tax-config.md`):
- **US IRC §41** (federal + state variants)
- **UK R&D tax relief** (SME + RDEC)
- **Canada SR&ED**
- **Other jurisdiction-specific schemes** as operator declares

## When to Use

- Annual R&D credit review
- New venture with substantive engineering — check eligibility
- Regulator inquiry / audit response prep

## Structure / Protocol

```
1. INTAKE     jurisdiction + venture(s) + period + eng sprint logs
2. QUALIFY    four-part test (or jurisdiction-equivalent) per activity
3. QUANTIFY   qualifying wages + supplies + contract research
4. NARRATE    technical narrative per activity (regulator-format)
5. HANDOFF    package to CPA + ledger for filing
```

## Instructions

### Step 1: Intake

- Jurisdictions in scope (`tax-config.md`)
- Ventures (from `felix-config`)
- Period (typically fiscal year)
- Engineering sprint logs / commit history (from `dev`)
- Payroll allocation by activity (from `ledger`)

### Step 2: Qualify

Per activity, apply jurisdiction's qualification test. **US IRC §41 four-part**:
1. Permitted purpose (new/improved function, performance, reliability, quality)
2. Technological in nature (physical/biological/computer science)
3. Elimination of uncertainty (capability, method, appropriate design)
4. Process of experimentation (evaluation of alternatives)

For **UK R&D relief**: seeking to achieve advance in science/technology + resolving scientific/technological uncertainty.

For **SR&ED**: scientific/technological advancement + scientific/technological uncertainty + systematic investigation.

Flag per activity: qualifies / doesn't / mixed.

### Step 3: Quantify

Per qualifying activity:
- Wages (from payroll allocation)
- Supplies (from ledger)
- Contract research (60-65% per US or per-jurisdiction rate)
- Compute total qualifying spend

### Step 4: Narrate

Technical narrative per activity, regulator-format:
- Business component being developed
- Uncertainty being resolved
- Alternatives evaluated
- Metrics / outcomes

Narrative discipline: what was tried, what failed, what worked — regulator reviews for "process of experimentation" evidence.

### Step 5: Handoff

Package: qualification memo + quantification workbook + narratives + supporting docs (sprint logs, commits, payroll allocation).

Hand to `ledger` for filing prep + CPA/CTA for review. Never file the credit claim from this skill.

## Principles

- **Never file the claim.** CPA/CTA files.
- **Never invent qualifying activity.** Only what sprint logs + engineering confirm.
- **Regime-parametric.** US framework doesn't apply silently to UK / CA / EU.
- **Narrative from real dev work.** Fabricated narratives are fraud — this skill flags rather than invents when logs are thin.
- **Provenance on every claim.** `[IRS Pub XXXX]` `[HMRC CIRD]` `[CRA SR&ED policy]`.

## Fallback

| Failure | Response |
|---|---|
| Missing sprint logs | Route to `dev`; block |
| Ambiguous qualification | Flag for CPA; do not decide |
| Regime not in config | Halt; operator declares first |

## Boundaries

- `tax-optimization-review` — R&D is a subset; general tax planning handles other credits.
- `filing-calendar` — R&D credit filings become entries in the calendar.
- `dev` (Engineering) — supplies sprint logs / commits / activity attribution.
- `ledger` — payroll allocation + filing prep.
- `board` — L3 for aggressive positions.
- Shared OS: `verification-before-completion`.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| rd-credits | File read (logs, config, ledger) · File write (narrative pack) | Web fetch (regulator guidance) | Steps 1, 4-5 |
