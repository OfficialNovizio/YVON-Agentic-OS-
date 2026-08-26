# Finance & Treasury — Department Workflow

## Summary

Owns the organisation's **money surface**. Cash + runway + unit economics + budget (felix, leader). Books + reconciliation (ledger). Tax analysis + filing prep (tax; never files). Banking + FX + cash management (treasure; never executes). Genericised per §0.4b — no hardcoded venture, no hardcoded jurisdiction, no invented thresholds.

## Working structure

**Department leader: `felix`** (Damodaran identity — public-domain NYU corpus). Multi-agent requests route through felix; identity-flavoured principles carried by felix's principles file. Non-leader agents (`ledger`, `tax`, `treasure`) have universal-only principles per §6.1.

## Working tree

```
Teams/Finance & Treasury/
├── README.md
├── DEPARTMENT-WORKFLOW.md
├── felix/         (4 skills: 1 marketplace + 3 custom + Damodaran identity)
├── ledger/        (3 skills: 1 marketplace + 2 custom)
├── tax/           (3 skills: all custom, jurisdiction-parametric)
└── treasure/      (3 skills: all custom, analytical only — never executes)
```

**14 skills total.** 2 marketplace (both portable per playbook §4.8 — no wrappers needed, unlike L&C's plugin-config-bound skills).

## Marketplace sources adopted

| Agent | Skill | Source |
|---|---|---|
| felix | `cash-flow-snapshot` | [anthropics/knowledge-work-plugins · small-business](https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business/skills/cash-flow-snapshot) |
| ledger | `close-month` | [anthropics/knowledge-work-plugins · small-business](https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business/skills/close-month) |

Method-only skills — no plugin-config path, no wrapper needed.

## Working instructions

### Routing rules within the department

1. **felix routes multi-skill requests.** A "what does our finance picture look like" question fans out: cash-flow-snapshot (90-day precise) + runway-model (multi-quarter) + unit-economics (per-venture) + budget-scenarios (allocation).

2. **State flows one-way through ledger.** `ledger` is the source of truth for actuals; `felix`, `tax`, `treasure` all consume ledger-tagged data. `ledger` never invents reads — it reconciles from connectors + operator input.

3. **Never executes.** tax never files. treasure never transfers or hedges. felix never approves. Every action requires operator + relevant external (CPA/CTA for tax, CFO for treasure, board for felix).

### Escalation ladder (uniform across dept)

L3 fixed to `Governance/board`. Always-L3 triggers:

- **felix**: runway below floor · LTV:CAC below threshold · scenario burn-increase > max
- **ledger**: close blocked > 30 days · fraud flag · large uncategorised balance
- **tax**: overdue filing · aggressive position · audit inquiry
- **treasure**: material FX exposure > threshold · below-buffer · signatory anomaly

### Boundaries with adjacent departments

| Case | We do | They do |
|---|---|---|
| Product metrics vs financial metrics | Financial (unit econ, revenue, margin) | `Product/metric` (funnel, activation, retention) |
| Data pipelines feeding financial data | Consume the output | `Engineering/dana` (pipeline + schema) |
| BI dashboards | Consume + interpret | `Engineering/dana` or new `Data & Analytics` dept |
| Strategic capital allocation | Frame the numbers + scenarios | `Executive Office/marcus` decides |
| Fiduciary risk acceptance | Surface the exposure | `Governance/board` decides |
| Contract-related payment terms | Cash-forecast implications | `Legal & Compliance/scribe` owns the contract |
| Regulatory tax obligations | tax handles filings | `Legal & Compliance/comply` handles regulatory register |

### Configuration pattern

Every agent has `operational/agent/<agent>-config.md` with `<FILL_IN>` fields. Jurisdictions declared per agent (not dept-shared) so an agent stays functional even if a dept-level config were missing. Deliberate redundancy per §0.5.

### Logical grounding

Each agent has `logical/book-requirements.md` recording Path-1 (all-free) candidates for touch-2:
- **felix**: Damodaran (NYU) · Buffett letters · UNIDROIT
- **ledger**: AICPA · FASB · IFRS Foundation · Damodaran
- **tax**: IRS Pubs · US Treasury Regs · OECD · UN transfer-pricing manual
- **treasure**: Fed payment systems · ECB · Damodaran · Brealey & Myers

All Tier A candidates. Nothing extracted yet — touch-2 pending.

Cross-agent script candidates (for `Shared OS/logical/` migration on second consumer per §13.5):
- `capital_budgeting_math` (felix + budget-scenarios + treasure/cash-buffer-optimizer)
- `fx_rate_math` (treasure + potential Market Intelligence / global expansion when built)

### Verification discipline

Every deliverable through `Shared OS/verification-before-completion` before returning (§13.1).

## Fleet-level notes

- **Fleet count contribution**: +4 (from 50 post-L&C to 54).
- **CLAUDE.md §2 rail**: all 4 agents routed after ship.
- **Toon coverage**: every `.md` twinned (§0.8) after final toonify pass.

## What this department does not do

- **Doesn't file** taxes, **doesn't execute** transfers, **doesn't approve** capital calls.
- **Doesn't invent** financial data, thresholds, or regime parameters.
- **Doesn't own** product-metric definitions (that's `Product/metric`) or data pipelines (that's `Engineering/dana`).
- **Doesn't decide** strategic allocation (marcus) or accept fiduciary risk (board).
