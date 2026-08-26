# felix · skill routing

> Governs **which** skill fires **when**. felix IS the Finance & Treasury department leader (§6.1), identity layer via `identity/damodaran-valuation.md`. Prose canonical; `# yvon-compile:` yaml is the compile contract (§14.5).

## Skill map

| Skill | Role | Entry point? | Typical triggers |
|---|---|---|---|
| `cash-flow-snapshot` (marketplace) | 30/60/90-day cash forecast + risk flags | ✅ yes | "forecast cash", "will I make payroll", "cash crunch" |
| `runway-model` (custom) | Multi-scenario runway (months to zero) | ✅ yes | "runway", "months of runway", "what if we hire X" |
| `unit-economics` (custom) | CAC / LTV / CM / payback per venture | ✅ yes | "unit economics", "CAC LTV", "profitable per unit" |
| `budget-scenarios` (custom) | 2-4 scenario side-by-side budget matrix | ✅ yes | "budget scenarios", "annual budget", "reforecast" |

All 4 are entry points; no wrapper needed (marketplace skill is portable).

## Precedence rules

| Ambiguous | Wins | Why |
|---|---|---|
| "cash forecast" (short horizon) | `cash-flow-snapshot` | 90-day precise |
| "runway" | `runway-model` | Multi-quarter time-to-zero |
| "budget" | `budget-scenarios` | Category-level allocation |
| "profitability" | ASK — per-unit (`unit-economics`) or per-org (elsewhere)? | Silent picks are defects |

## Cross-agent handoffs

| To | From | Trigger |
|---|---|---|
| `ledger` (F&T) | all 4 skills | Actual revenue / burn / variable costs |
| `tax` (F&T) | `runway-model`, `budget-scenarios` | Tax liability affects burn |
| `treasure` (F&T) | `cash-flow-snapshot`, `runway-model` | Current cash position |
| `Executive Office/marcus` | `unit-economics`, `budget-scenarios` | Strategic priorities driving allocation |
| `Governance/board` | all 4 | L3 escalation per config |
| Shared OS: `verification-before-completion` | all 4 | Every deliverable |

## Identity layer

felix leads; identity persona = Aswath Damodaran (`identity/damodaran-valuation.md`). Voice = numerate storytelling, sources for every number, ranges over points.

## yvon-compile block

```yaml
# yvon-compile:
agent: felix
department: "Finance & Treasury"
identity_layer: true
skills:
  - name: cash-flow-snapshot
    entry_point: true
    tier: 2
    handoffs: [{to: verification-before-completion, dept: Shared OS}]
  - name: runway-model
    entry_point: true
    tier: 3
    handoffs:
      - {to: ledger, dept: "Finance & Treasury", why: actual burn baseline}
      - {to: board, dept: Governance, why: L3 below-floor escalation}
      - {to: verification-before-completion, dept: Shared OS}
  - name: unit-economics
    entry_point: true
    tier: 3
    handoffs:
      - {to: ledger, dept: "Finance & Treasury", why: per-venture revenue + costs}
      - {to: rio, dept: "Brand Studio", why: acquisition spend for CAC}
      - {to: pulse, dept: "Brand Studio", why: social spend for CAC}
      - {to: verification-before-completion, dept: Shared OS}
  - name: budget-scenarios
    entry_point: true
    tier: 3
    handoffs:
      - {to: ledger, dept: "Finance & Treasury", why: baseline}
      - {to: board, dept: Governance, why: L3 below-floor}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "cash forecast", winner: cash-flow-snapshot}
  - {trigger: "runway", winner: runway-model}
  - {trigger: "budget scenarios", winner: budget-scenarios}
  - {trigger: "unit economics", winner: unit-economics}
  - {trigger: "profitability", winner: null}
```
