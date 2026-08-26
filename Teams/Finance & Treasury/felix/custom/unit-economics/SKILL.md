---
name: unit-economics
type: custom
status: built from scratch
assigned_agent: felix (Finance & Treasury / Finance Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Per-venture unit-economics computation — CAC · LTV · contribution margin · payback period. Cross-references venture revenue from ledger and channel spend from Brand Studio (rio/pulse). Flags any venture with LTV:CAC below the operator-set threshold. Genericised — no hardcoded venture, no hardcoded threshold per §0.4b."
triggers:
  - unit economics
  - CAC LTV
  - is this venture profitable per unit
  - contribution margin
  - payback period
  - LTV:CAC ratio
  - per-customer economics
---

# Unit Economics

## Introduction

Built from scratch on 2026-07-29 as felix's per-venture unit-economics analysis. Framework standard (CAC / LTV / CM / payback); the numbers come from real ledger data.

Genericised from catalog's `vyon-unit-economics` (single venture hardcoded). Here `venture_scope` is dimensional; threshold for LTV:CAC lives in `felix-config.md`.

## Purpose

For each venture (or org-wide aggregate), compute the four core unit-economics metrics from real inputs. Flag any venture where LTV:CAC falls below the operator-set threshold.

## When to Use

- "Unit economics" · "CAC LTV" · "is this venture profitable per unit" · "contribution margin" · "payback period"
- Monthly / quarterly business review prep
- Investor deck unit-economics slide
- New-venture go/no-go grounding

Do NOT use for:
- Cash forecast — `cash-flow-snapshot`
- Runway — `runway-model`
- Pricing decisions — `Product/price`

## Structure / Protocol

```
1. INTAKE     venture_scope (which venture, or org-wide) + period
2. PULL       revenue + variable costs from ledger; acquisition spend from rio/pulse
3. COMPUTE    CAC = spend / new customers; LTV = ARPU × gross_margin × avg_lifetime_months; CM = revenue - variable_costs; payback = CAC / (ARPU × gross_margin)
4. FLAG       LTV:CAC < threshold → flag; payback > threshold → flag
5. RETURN     per-venture table + interpretation
```

## Instructions

### Step 1: Intake

- `venture_scope` — one venture, org-wide, or comparison across ventures
- `period` — trailing month / quarter / TTM
- Ask if unclear.

### Step 2: Pull

- **Revenue + variable costs** from `ledger` (venture-tagged, per period).
- **New customers acquired** from ledger (venture-tagged) or from operator input if not tracked in accounting.
- **Acquisition spend** from Brand Studio channel spend (`rio` for paid ads, `pulse` for social) if configured; else operator input.
- **Average customer lifetime** from operator (or from cohort analysis if available; do not invent).

If any input is missing, ask; do not infer (§0.5).

### Step 3: Compute

```
CAC = acquisition_spend / new_customers_acquired
gross_margin_pct = (revenue - variable_costs) / revenue
ARPU_monthly = revenue / active_customers  # for subscription; adapt for one-time
LTV = ARPU_monthly × gross_margin_pct × avg_lifetime_months
LTV_CAC_ratio = LTV / CAC
CM_dollars = revenue - variable_costs
CM_pct = CM_dollars / revenue
payback_months = CAC / (ARPU_monthly × gross_margin_pct)
```

If any denominator is zero or the input is uncertain, mark the output cell "insufficient_data" — do not compute a false zero.

### Step 4: Flag

Read `felix-config.md`:
- `## Unit economics thresholds` → LTV:CAC minimum, payback maximum

For each venture:
- LTV:CAC < threshold → 🔴 flag with delta needed to reach threshold
- Payback > threshold → 🟠 flag
- Both fine → 🟢 no flag

### Step 5: Return

Per-venture table:

```
Unit Economics — [period]

| Venture | Revenue | Var costs | CM | CM% | CAC | ARPU | GM% | Lifetime | LTV | LTV:CAC | Payback | Flag |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | $X | $Y | $Z | %  | $Q | $R | %  | M mo | $L | R.x | N mo | 🔴/🟠/🟢 |
| B | ... |

Threshold: LTV:CAC ≥ [T from config]; payback ≤ [P from config]

Flagged: [count]
```

## Output Format

Table + one-paragraph interpretation focusing on which vertical/venture drives the aggregate + any flag needing action.

## Principles

- **No invented inputs.** Every input has a source (ledger, rio/pulse, operator). No model-inferred customer counts or lifetimes.
- **"Insufficient_data" is a valid cell.** Never fabricate a false zero (§0.5).
- **Threshold from config, not hardcoded.** LTV:CAC minimum varies by business model; operator sets (§0.4b).
- **Flag with delta.** Don't just say "below threshold" — say how much delta is needed to reach it.

## Fallback

| Failure mode | Response |
|---|---|
| Missing ledger data | Route to `ledger` for reconciliation; block |
| Missing acquisition spend | Ask operator or route to `rio`/`pulse` for spend data |
| Zero customers acquired in period | Mark cells "insufficient_data"; do not divide by zero |
| Threshold `<FILL_IN>` | Bounce or run `[PROVISIONAL]` with defaults tagged |

## Boundaries with Other Skills

- **`runway-model` (custom, this agent)** — different question (time-to-zero vs per-unit); may consume each other's outputs but no direct handoff.
- **`budget-scenarios` (custom, this agent)** — per-category allocation; different granularity.
- **`ledger` (Finance & Treasury)** — supplies revenue + variable costs per venture.
- **`rio`, `pulse` (Brand Studio)** — supply channel spend for CAC.
- **`Product/price`** — pricing decisions may cite unit-economics output but this skill doesn't decide pricing.
- **Shared OS: `verification-before-completion`** — inherited.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| unit-economics | File read (config) | File write (per-venture matrix export) | Step 2 config; Step 5 output |
