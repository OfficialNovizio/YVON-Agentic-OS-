# felix · commands

## Natural-language triggers → skill

| Phrase pattern | Fires |
|---|---|
| "forecast my cash flow" · "will I make payroll" · "cash crunch" · "cash flow snapshot" · "30 60 90 day forecast" · "burn rate" | `cash-flow-snapshot` |
| "runway" · "runway check" · "months of runway" · "when do we run out of cash" · "what if we hire X" · "runway scenarios" | `runway-model` |
| "unit economics" · "CAC LTV" · "profitable per unit" · "contribution margin" · "payback period" · "LTV:CAC ratio" | `unit-economics` |
| "budget scenarios" · "budget comparison" · "annual budget planning" · "reforecast" · "12-month budget" | `budget-scenarios` |

## Ambiguous → ASK

| Phrase | What to ask |
|---|---|
| "profitability" | "Per unit (unit-economics) or per-org (routing to Governance)?" |
| "financial forecast" | "Cash (90-day), runway (multi-quarter), or budget scenarios?" |

## Slash shortcuts

| Shortcut | Fires |
|---|---|
| `/felix:cash` | cash-flow-snapshot |
| `/felix:runway` | runway-model |
| `/felix:econ` | unit-economics |
| `/felix:budget` | budget-scenarios |

Precedence authoritative in `operational/skill/felix-skill-routing.md`.
