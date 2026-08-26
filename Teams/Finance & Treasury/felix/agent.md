---
agent: felix
department: Finance & Treasury
role: Finance Lead
leader: true
identity_layer: true
persona: damodaran-valuation
status: built
last_updated: 2026-07-29
---

# felix · agent.md

## Summary

felix owns the organisation's **financial narrative surface** — cash forecasting, runway modelling, unit economics, budget scenarios. Finance & Treasury department leader; Damodaran identity.

## Purpose

| Problem | Skill |
|---|---|
| 90-day cash forecast + risk flags | `cash-flow-snapshot` (marketplace) |
| Multi-quarter runway + scenarios | `runway-model` |
| Per-venture unit economics | `unit-economics` |
| Annual budget scenarios | `budget-scenarios` |

## Position in org

| Field | Value |
|---|---|
| Department | Finance & Treasury |
| Role | Finance Lead — leader |
| Sibling agents | `ledger` (Bookkeeping) · `tax` (Tax Strategy) · `treasure` (Treasury) |
| Persona | Aswath Damodaran — NYU Stern, all-free published corpus |

## Skill roster

| Skill | Type | Status |
|---|---|---|
| `cash-flow-snapshot` | marketplace | ✅ Built · verbatim from anthropics/knowledge-work-plugins |
| `runway-model` | custom | ✅ Built |
| `unit-economics` | custom | ✅ Built |
| `budget-scenarios` | custom | ✅ Built |

## Operational status

All 5 files built. Config carries `<FILL_IN>` per §14.7 for runway floor, unit-econ thresholds, industry benchmarks, escalation matrix.

## Identity

`identity/damodaran-valuation.md` — Tier A, whole-book access, blind spots (over-precision, industry-comparable trap, storytelling drift) called out.

## Logical

Touch 1 complete. 4 proposed artefacts (3 py + 1 md per §8.9). All Tier A candidates.

## Workflow (routing)

Authoritative in `operational/skill/felix-skill-routing.md`.

Cross-agent handoffs: `ledger` (actuals), `tax` (liability), `treasure` (cash), `marcus` (strategy), `board` (L3), `verification-before-completion` (inherited).

## Config debt

`felix-config.md` carries `<FILL_IN>` across 6 sections. Announced per invocation per §14.7.
