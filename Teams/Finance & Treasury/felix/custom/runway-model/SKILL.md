---
name: runway-model
type: custom
status: built from scratch
assigned_agent: felix (Finance & Treasury / Finance Lead — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Multi-scenario runway model — current burn · +hire scenario · +marketing push · +revenue lift. Projects months of runway across scenarios; escalates L3 when any scenario shows runway below the floor in felix-config. Reads current cash from cash-flow-snapshot output; reads monthly burn from ledger. Genericised — no hardcoded venture, no hardcoded floor per §0.4b."
triggers:
  - runway check
  - how much runway do we have
  - runway model
  - what if we hire X people
  - what if we spend Y on marketing
  - runway scenarios
  - months of runway
  - when do we run out of cash
---

# Runway Model

## Introduction

Built from scratch on 2026-07-29 as felix's multi-scenario runway model. The `cash-flow-snapshot` marketplace skill produces a 90-day forecast; this skill extends to multi-quarter runway with named scenarios.

Genericised from catalog's `vyon-runway-model`, which hardcoded a specific floor threshold and a specific venture. Here everything (starting cash, monthly burn, floor threshold) comes from config or is passed in.

## Purpose

Given current cash position + monthly burn + scenario adjustments, produce a scenario matrix showing months of runway under each. Escalates to `Governance/board` any scenario where projected runway falls below the operator-set floor.

## When to Use

- "Runway check" · "how much runway do we have" · "months of runway" · "when do we run out of cash"
- Scenario planning: "what if we hire X people" · "what if we spend Y on marketing" · "what if revenue grows Z%"
- Board prep · investor deck cash-runway slide

Do NOT use for:
- Short-horizon (< 90 days) — that's `cash-flow-snapshot`
- Post-hoc actuals — that's `ledger` reconciliation
- Unit-economics analysis — that's `unit-economics` (this agent)

## Structure / Protocol

```
1. INTAKE     current cash + monthly burn (from ledger) + scenario overrides
2. LOAD       floor threshold + escalation contacts from felix-config
3. PROJECT    for each scenario, compute months of runway = cash / adjusted_monthly_burn
4. FLAG       any scenario < floor → surface + auto-escalate L3
5. RETURN     scenario matrix with runway months, month cash runs out, delta vs baseline
```

## Instructions

### Step 1: Intake

Operator supplies (or `ledger` provides on handoff):
- `current_cash` (USD) — actual bank balance today
- `monthly_burn_baseline` (USD) — trailing 3-month average from `ledger`
- Scenarios to model — each with named delta:
  - `baseline` — no change
  - `+hire` — additional N FTE at $X/month loaded cost
  - `+marketing` — additional $Y/month
  - `+revenue` — additional $Z/month inflow
  - custom named scenarios

Never invent burn or cash — ask.

### Step 2: Load config

Read `operational/agent/felix-config.md`:
- `## Runway floor` — minimum months below which L3 escalation fires
- `## Escalation matrix` — L2/L3 approvers

If floor is `<FILL_IN>`, bounce with the two-choice pattern (fill or `[PROVISIONAL]` with tagged output).

### Step 3: Project

For each scenario, compute:
```
adjusted_monthly_burn = monthly_burn_baseline + scenario_burn_delta - scenario_revenue_delta
months_runway = current_cash / adjusted_monthly_burn
cash_out_date = today + (months_runway × 30) days
```

If `adjusted_monthly_burn ≤ 0` (revenue-positive scenario), mark "runway_infinite" — do not compute a false runway.

### Step 4: Flag + escalate

For any scenario where `months_runway < floor_threshold`:
- Surface in output with 🔴 marker
- Auto-add L3 escalation flag with the delta needed to fix

### Step 5: Return

Fixed output shape:

```
Runway model — as of [date]
Current cash: $[X]
Baseline monthly burn: $[Y] (from ledger, trailing 3-month avg)
Floor threshold: [Z] months

| Scenario | Adjusted burn | Runway months | Cash-out date | vs baseline | Flag |
|---|---|---|---|---|---|
| baseline | $[Y] | [M] | [date] | 0 | — |
| +hire (3 FTE @ $12K each) | $[Y+36K] | [M'] | [date'] | [Δ] | 🔴 if < floor |
| +marketing (+$20K/mo) | $[Y+20K] | [M''] | ... | ... | ... |
| +revenue (+$50K/mo) | $[Y-50K] | [M'''] | ... | ... | ... |

L3 escalations: [N] scenarios below floor
```

## Output Format

Table + one-paragraph plain-English summary + L3 escalation list if any.

## Principles

- **No invented burn or cash.** Comes from `ledger` (actual) or operator input. Never model-inferred (§0.5).
- **No invented scenarios.** Only what the operator names or specifies.
- **Below-floor never softens.** If any scenario shows runway below the floor, L3 escalation fires regardless of "unlikelihood" — the point is to flag it, not to filter it.
- **Revenue-positive scenarios say "runway_infinite"**, not a false large number.

## Fallback

| Failure mode | Response |
|---|---|
| Missing current cash | Ask; do not use last-known |
| Missing burn baseline | Route to `ledger` for reconciliation; block until available |
| Floor `<FILL_IN>` | Bounce (Step 2) |
| Scenario with negative adjusted burn | "runway_infinite"; no false number |

## Boundaries with Other Skills

- **`cash-flow-snapshot` (marketplace, this agent)** — short-horizon (90 day) precise forecast; this skill extends to multi-quarter runway using averaged burn.
- **`unit-economics` (custom, this agent)** — different question (per-unit profitability vs whole-org runway); no direct handoff.
- **`budget-scenarios` (custom, this agent)** — related but distinct: budget = allocation across categories; runway = time-to-zero.
- **`ledger` (Finance & Treasury)** — supplies actual burn baseline from reconciled ledger; one-way in.
- **`Governance/board`** — L3 escalation for below-floor scenarios.
- **Shared OS: `verification-before-completion`** — inherited.

## Tool declaration (technical, not permission)

| Skill | Required | Optional | Source line |
|---|---|---|---|
| runway-model | File read (config) | File write (save scenario matrix) | Step 2 config load; scenario matrix output |
