---
name: tax-optimization-review
type: custom
status: built from scratch
assigned_agent: tax (Finance & Treasury / Tax Strategy)
portable: true
date_added: 2026-07-29
tier: 3
description: "Annual tax optimization review — entity structure · transfer pricing · deductions · credits · timing. Identifies opportunities and blockers grounded in operator-declared jurisdictions. Never files or amends returns; produces recommendations for CPA/CTA review."
triggers:
  - tax optimization
  - tax review
  - tax planning
  - are we tax-efficient
  - annual tax review
  - deduction review
---

# Tax Optimization Review

## Purpose

Annual scan across the tax landscape: entity structure, transfer pricing (if multi-entity), deduction opportunities, credits available, timing of income/expenses. Produces recommendations only — never files or amends.

## When to Use

- Annual tax planning cycle
- New market entry (adds jurisdictions to scope)
- Material P&L shift (new revenue source, cost restructure)

Do NOT use for: filing deadlines (`filing-calendar`) or R&D credits specifically (`rd-credits`).

## Structure / Protocol

```
1. INTAKE     current-year P&L + entity structure + jurisdictions
2. CATALOG    tax-config.md regime catalog per jurisdiction
3. ANALYZE    per-category: entity / transfer / deductions / credits / timing
4. FLAG       opportunities (with delta $ if computable) + blockers
5. RECOMMEND  ranked list to CPA/CTA for review
```

## Instructions

### Step 1: Intake

- Current-year P&L (from `ledger`)
- Entity structure (subsidiaries, JVs, per-jurisdiction entities)
- Jurisdictions in scope (from `tax-config.md`)
- Prior-year returns if available

### Step 2: Regime catalog

Read `tax-config.md` per-jurisdiction: applicable regimes (corporate tax rates, sales/VAT/GST, WHT, transfer-pricing rules, R&D credit programs).

### Step 3: Analyze

Per category:
- **Entity** — subsidiary vs branch; check-the-box (US); permanent establishment risk
- **Transfer pricing** (multi-entity) — arm's-length principle; documentation requirement
- **Deductions** — under-claimed common categories (depreciation, home-office, section 179, business meals per current rules)
- **Credits** — R&D (routes to `rd-credits`); investment; jurisdiction-specific
- **Timing** — income deferral / expense acceleration windows

### Step 4: Flag

- 🔴 Blocker (compliance gap, aggressive position risk)
- 🟠 Material opportunity ($ delta > threshold from config)
- 🟡 Small opportunity
- 🟢 Already optimized

### Step 5: Recommend

Ranked list with $ delta (where computable) + which regime supports it + what CPA/CTA needs to confirm.

## Principles

- **Never file or amend returns.** Analytical only.
- **Never invent regimes.** Every category traces to `tax-config.md` catalog with regulator citation.
- **CPA/CTA review is mandatory** on any recommendation acted on.
- **Aggressive positions are 🔴 blockers**, not opportunities.
- **Provenance on every citation.** `[IRS Pub X]` `[HMRC guidance]` `[OECD Model]`.

## Fallback

| Failure | Response |
|---|---|
| Missing P&L | Route to `ledger`; block |
| Jurisdiction not in catalog | Halt; operator declares first |
| Ambiguous position | Flag for CPA/CTA; do not decide |

## Boundaries

- `filing-calendar` — deadlines, not planning.
- `rd-credits` — specialized subset; hand off.
- `ledger` — supplies P&L.
- `felix` — recommendations feed budget-scenarios where materially $ shifts occur.
- Shared OS: `verification-before-completion`.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| tax-optimization-review | File read (config, ledger P&L) | Web fetch (regulator guidance verification) | Steps 1-2 |
