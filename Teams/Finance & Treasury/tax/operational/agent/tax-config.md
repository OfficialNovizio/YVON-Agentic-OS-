---
agent: tax
department: Finance & Treasury
type: config
purpose: "Jurisdiction catalog, regime catalog per jurisdiction, alert thresholds, escalation, CPA/CTA panel. Read by all 3 custom skills."
required_by:
  - custom/filing-calendar/SKILL.md
  - custom/tax-optimization-review/SKILL.md
  - custom/rd-credits/SKILL.md
last_updated: 2026-07-29
---

# tax · config

## Who's using this

| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Primary CPA/CTA | `<FILL_IN — firm + partner>` |

## Jurisdictions in scope

| Jurisdiction | Entity type | Tax year end | Notes |
|---|---|---|---|
| `<FILL_IN>` | `<FILL_IN — LLC/C-corp/Ltd/GmbH/…>` | `<FILL_IN>` | `<FILL_IN>` |

## Regime catalog per jurisdiction

| Jurisdiction | Regime | Rate / rule | Source citation |
|---|---|---|---|
| `<FILL_IN>` | Corporate income tax | `<FILL_IN>` | `<FILL_IN — regulator + section>` |
| `<FILL_IN>` | Sales/VAT/GST | `<FILL_IN>` | `<FILL_IN>` |
| `<FILL_IN>` | Payroll | `<FILL_IN>` | `<FILL_IN>` |
| `<FILL_IN>` | R&D scheme | `<FILL_IN — US IRC §41 / UK RDEC / CA SR&ED / …>` | `<FILL_IN>` |
| `<FILL_IN>` | Transfer pricing | `<FILL_IN — OECD Model / local variant>` | `<FILL_IN>` |

## Alert thresholds

| Tier | Days-to-due |
|---|---|
| 🔴 Overdue | past 0 |
| 🟠 Critical | ≤ 7 |
| 🟡 Warning | ≤ 30 |
| 🟢 Informational | ≤ 90 |

## Escalation matrix

| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine filing / update | tax itself |
| L2 | New jurisdiction · new regime · material optimization opp (> `<FILL_IN>`) | `<FILL_IN — CFO/felix or role>` |
| L3 | Overdue filing · aggressive position · audit inquiry · penalty risk > `<FILL_IN>` | `Governance/board` (fixed) |

## CPA/CTA panel

| Practice area | Firm | Rate |
|---|---|---|
| Federal / general | `<FILL_IN>` | `<FILL_IN>` |
| State / local | `<FILL_IN>` | `<FILL_IN>` |
| International / transfer pricing | `<FILL_IN>` | `<FILL_IN>` |
| R&D specialty | `<FILL_IN>` | `<FILL_IN>` |

## House style

| Field | Value |
|---|---|
| Currency / rounding | `<FILL_IN>` |
| Working paper naming | `<FILL_IN>` |

All `<FILL_IN>` announced per §14.7.
