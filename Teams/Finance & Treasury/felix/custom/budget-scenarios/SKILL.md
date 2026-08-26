---
name: budget-scenarios
type: custom
status: built from scratch
assigned_agent: felix (Finance & Treasury / Finance Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Compare 2–4 named budget scenarios side-by-side over a 12-month horizon. Each scenario shows opex/capex/headcount/marketing/reserve allocations. Runs the runway-model against each and surfaces the runway impact. Genericised — no hardcoded categories, no hardcoded totals."
triggers:
  - budget scenarios
  - budget comparison
  - what if we spend more on marketing
  - budget rebalance
  - annual budget planning
  - 12-month budget
  - reforecast budget
---

# Budget Scenarios

## Introduction

Built from scratch on 2026-07-29 as felix's scenario-comparison tool. Different from `runway-model` (time-to-zero focus) — this skill focuses on category-level allocation across a fixed horizon.

## Purpose

Compare 2–4 named budget scenarios side-by-side over 12 months. Each scenario names allocations per category (opex breakdown, headcount, marketing, capex, reserves). Feeds runway-impact per scenario. Highlights delta from baseline.

## When to Use

- "Budget scenarios" · "budget comparison" · "annual budget planning" · "reforecast budget"
- "What if we spend more on marketing" (multi-category — different from runway's simpler scenario)
- Quarterly reforecast · investor budget presentation

Do NOT use for:
- Simple runway question — `runway-model`
- Cash forecasting — `cash-flow-snapshot`
- Per-transaction categorization — `ledger`

## Structure / Protocol

```
1. INTAKE     baseline budget (12-month, category-level) from ledger or operator
2. SCENARIOS  operator names 1-3 alternative scenarios with per-category deltas
3. VALIDATE   totals reconcile; no negative allocations
4. RUN        for each scenario, project category-level monthly spend + roll to runway
5. RETURN     side-by-side matrix + runway impact + escalation on any below-floor
```

## Instructions

### Step 1: Intake baseline

- Read baseline 12-month budget from `ledger` (if reforecast) or operator supplies (if first-time).
- Baseline structure: per-category monthly amounts × 12 months.
- Standard categories: `payroll` · `contractor` · `office` · `saas_tools` · `marketing` · `professional_services` · `travel` · `capex` · `other`. Add or remove per operator.

If baseline missing or partial, ask; do not infer historical patterns.

### Step 2: Name scenarios

Operator supplies 1–3 alternative scenarios with per-category deltas. Each scenario has a name + delta list. Examples:
- "+aggressive_marketing" — +$40K/mo marketing, -$0 elsewhere
- "-headcount_freeze" — hold payroll flat at current level (no new hires)
- "+capex_expansion" — +$200K capex Q3, absorb elsewhere or accept burn increase

### Step 3: Validate

- Every scenario must reconcile — sum of all category deltas → net delta shown.
- No category can go negative (spending less than $0 is not a real scenario).
- If a scenario implies net burn increase above `felix-config.md`'s max-scenario-burn-increase, flag before running.

### Step 4: Run

For each scenario:
- Compute monthly category totals for 12 months.
- Compute monthly burn per scenario.
- Feed each into `runway-model` (Step 3) to get runway projection.
- Compute cumulative reserve remaining at each month.

### Step 5: Return

Fixed output:

```
Budget Scenarios — 12-month horizon starting [month]

| Category | Baseline | +aggressive_marketing | -headcount_freeze | +capex_expansion |
|---|---|---|---|---|
| Payroll | $X/mo | $X | $X (frozen) | $X |
| Marketing | $Y | $Y+40K | $Y | $Y |
| ... | ... | ... | ... | ... |
| **Total /mo** | **$T** | $T+40K | $T-Δ | $T |

Runway impact:
| Scenario | Months runway | Cash-out date | Flag |
|---|---|---|---|
| baseline | M | date | — |
| +aggressive_marketing | M' | date' | 🔴 if < floor |
| ... | ... | ... | ... |

L3 escalations: [count]
```

## Output Format

Category matrix + runway table + one-paragraph interpretation.

## Principles

- **No invented allocations.** Baseline from ledger or operator; scenario deltas from operator.
- **Scenarios must reconcile.** Sum of deltas = net budget change. No hand-wave "we'll figure it out" categories.
- **Runway impact is a first-class output**, not a footnote.
- **Below-floor scenarios auto-escalate**, same as runway-model.

## Fallback

| Failure mode | Response |
|---|---|
| Missing baseline | Ask or route to `ledger` |
| Scenario doesn't reconcile | Flag the imbalance; ask operator to fix |
| Scenario category goes negative | Reject |
| Runway below floor | Escalate L3 |

## Boundaries

- **`runway-model` (custom, this agent)** — this skill uses it (one-way in).
- **`cash-flow-snapshot` (marketplace, this agent)** — different horizon; not consumed here.
- **`unit-economics` (custom, this agent)** — different question.
- **`ledger` (Finance & Treasury)** — supplies baseline.
- **`Governance/board`** — L3 for below-floor scenarios.
- **Shared OS: `verification-before-completion`** — inherited.

## Tool declaration

| Skill | Required | Optional | Source line |
|---|---|---|---|
| budget-scenarios | File read (config, ledger baseline) | File write (scenario matrix export) | Step 1 baseline; Step 5 output |
