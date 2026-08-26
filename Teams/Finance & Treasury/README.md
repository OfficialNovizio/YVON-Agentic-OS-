# Finance & Treasury Department

**4 agents · all built** — Financial narrative, transactional record, tax, banking + FX. Owns the organisation's money surface.

| Agent | Role | Status |
|-------|------|--------|
| **felix** | Finance Lead (department leader) — cash forecast, runway model, unit economics, budget scenarios | ✅ Built · Damodaran persona |
| **ledger** | Bookkeeping — CoA, month-end close, transaction categorisation, reconciliation | ✅ Built |
| **tax** | Tax Strategy — filing calendar, tax optimization, R&D credits | ✅ Built |
| **treasure** | Treasury — entity-account map, FX exposure, cash management | ✅ Built |

**Department doc:** [DEPARTMENT-WORKFLOW.md](DEPARTMENT-WORKFLOW.md)

## Boundaries with existing departments

| Concern | Owned by | Not owned by |
|---|---|---|
| Financial narrative, cash + runway + unit economics + budget | **Finance & Treasury** (this dept) | — |
| GL entries + reconciliation | this dept (ledger) | — |
| Tax analysis + filing prep (never filing itself) | this dept (tax) | CPA / CTA files |
| Bank accounts + FX (never executes transfers) | this dept (treasure) | Operator + CFO execute |
| Product analytics · metrics governance | `Product/metric` | this dept |
| Data pipelines · privacy engineering · BI | `Engineering/dana` | this dept |
| Strategic priorities · resource allocation calls | `Executive Office/marcus` | this dept surfaces, marcus decides |
| Fiduciary veto · risk acceptance | `Governance/board` | this dept surfaces, board decides |

## Genericisation applied

| Catalog original | Built as | Reason |
|---|---|---|
| `vyon-runway-model` (single-venture) | `runway-model` — multi-scenario, jurisdiction-neutral | §0.4b |
| `vyon-unit-economics` | `unit-economics` — venture-dimensional | §0.4b |
| `vyon-chart-of-accounts` (one venture) | `chart-of-accounts` — venture-tagged | §0.4b |
| `vyon-cra-calendar` (single-country regulator) | `filing-calendar` — jurisdiction-parametric | §0.4b |
| `vyon-rd-credits` (US-only) | `rd-credits` — regime-parametric (US IRC §41 / UK RDEC / CA SR&ED / others) | §0.4b |
| `>$5K` and `<8mo runway` thresholds | `<FILL_IN>` in agent configs | §0.5 |

## Skills roster (14 total)

**2 marketplace** + **12 custom** across 4 agents. No wrappers needed (marketplace skills are portable — method-only, no plugin-config path).

| Agent | Marketplace | Custom |
|-------|-------------|--------|
| felix | `cash-flow-snapshot` | `runway-model` · `unit-economics` · `budget-scenarios` |
| ledger | `close-month` | `chart-of-accounts` · `transaction-categorizer` |
| tax | (none) | `filing-calendar` · `tax-optimization-review` · `rd-credits` |
| treasure | (none) | `entity-account-map` · `fx-exposure` · `cash-management` |

Marketplace sources: [anthropics/knowledge-work-plugins · small-business](https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business/skills).

## Fleet contribution

+4 agents, from 50 (post-L&C) to 54.
