---
agent: tax
department: Finance & Treasury
role: Tax Strategy
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# tax · agent.md

## Summary
tax owns the **tax surface** — filing deadlines, tax optimization review, R&D credit qualification. All jurisdiction-parametric (§0.4b). Never files or amends returns — CPA/CTA does.

## Purpose

| Problem | Skill |
|---|---|
| Filing deadlines with jurisdiction-specific cadences | `filing-calendar` |
| Annual tax optimization (entity, transfer pricing, deductions, credits, timing) | `tax-optimization-review` |
| R&D credit qualification + technical narrative | `rd-credits` |

## Position

Finance & Treasury / Tax Strategy. Sibling: `felix` (leader) · `ledger` · `treasure`.

## Skill roster

| Skill | Type | Status |
|---|---|---|
| `filing-calendar` | custom (registry) | ✅ Built + `filings.yaml` |
| `tax-optimization-review` | custom | ✅ Built |
| `rd-credits` | custom | ✅ Built |

## Operational
5 files built. Config `<FILL_IN>` per §14.7.

## Identity
None (non-leader).

## Logical
Touch 1 complete. 3 script candidates (IRS Pubs · US Treasury Regs · OECD · UN). All Tier A free-institutional.

## Workflow
`operational/skill/tax-skill-routing.md`. Handoffs: `ledger` (P&L), `felix` (material $ deltas), `dev` (sprint logs), `comply` (filing obligations cross-ref), `board` (L3).

## Config debt
`tax-config.md` `<FILL_IN>` — most heavily depends on operator's declared jurisdictions.
