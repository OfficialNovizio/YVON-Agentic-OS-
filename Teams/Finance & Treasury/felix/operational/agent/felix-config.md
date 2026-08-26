---
agent: felix
department: Finance & Treasury
type: config
purpose: "Runway floor, unit-economics thresholds, industry benchmarks, escalation matrix, review cadence. Read by runway-model, unit-economics, budget-scenarios."
required_by:
  - custom/runway-model/SKILL.md
  - custom/unit-economics/SKILL.md
  - custom/budget-scenarios/SKILL.md
last_updated: 2026-07-29
---

# felix · config

## Who's using this

| Field | Value |
|---|---|
| Role of operator | `<FILL_IN — CFO / controller / founder>` |
| Board escalation contact | `<FILL_IN>` |

## Ventures in scope

| Venture | Currency | Sector benchmark (Damodaran industry code) | Notes |
|---|---|---|---|
| `<FILL_IN>` | `<FILL_IN — USD/EUR/…>` | `<FILL_IN — e.g., "Software (System & Application)">` | `<FILL_IN>` |

## Runway floor

| Field | Value |
|---|---|
| Minimum months runway (below → L3 escalate) | `<FILL_IN — e.g., 12>` |
| Max scenario burn increase (above → flag before run) | `<FILL_IN — e.g., $50K/mo>` |

## Unit economics thresholds

| Metric | Minimum |
|---|---|
| LTV:CAC ratio | `<FILL_IN — commonly 3:1>` |
| Payback period (months) | `<FILL_IN — commonly 12>` |
| Gross margin % floor | `<FILL_IN>` |

## Data sources

| Source | Config | Notes |
|---|---|---|
| Ledger (per-venture revenue + variable costs) | `<FILL_IN — ledger path or MCP>` | Required for unit-economics |
| Channel spend | `<FILL_IN — rio + pulse configs>` | Required for CAC |
| Cash forecast source | `<FILL_IN — QB/Stripe/PayPal/Square/CSV>` | Required for cash-flow-snapshot |
| Industry benchmarks | Damodaran industry data | Free at pages.stern.nyu.edu/~adamodar/ |

## Escalation matrix

| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine forecast / retrieval | felix itself |
| L2 | Runway 12-18 months · unit-econ 🟠 · budget delta > `<FILL_IN>` | `<FILL_IN — CEO or role>` |
| L3 | Runway < floor · LTV:CAC 🔴 · scenario burn-increase > max | `Governance/board` (fixed) |

## Review cadence

| Cycle | Cadence |
|---|---|
| Cash forecast | `<FILL_IN — weekly recommended>` |
| Runway model | `<FILL_IN — monthly>` |
| Unit economics | `<FILL_IN — monthly>` |
| Budget scenarios | `<FILL_IN — quarterly>` |

## House style

| Field | Value |
|---|---|
| Currency notation | `<FILL_IN>` |
| Rounding | `<FILL_IN>` |
| Confidence-band notation | `<FILL_IN — e.g., ±%>` |

All `<FILL_IN>` announced per §14.7.
