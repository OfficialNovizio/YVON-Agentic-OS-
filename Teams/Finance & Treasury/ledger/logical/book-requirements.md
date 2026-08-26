---
agent: ledger
department: Finance & Treasury
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# ledger · logical / book-requirements

Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `coa_structure_validator` | B | AICPA / IFRS Conceptual Framework — [free at IFRS Foundation](https://www.ifrs.org/) | US GAAP Codification (FASB) — [free at fasb.org](https://asc.fasb.org/) |
| 2 | `transaction_matcher` | A/B | Standard bank-recon literature (published research) | Damodaran on financial-statement analysis — [free NYU](https://pages.stern.nyu.edu/~adamodar/) |
| 3 | `variance_analyzer` | A | GAAP variance-analysis chapters | Managerial accounting open textbooks (OER Commons) |

All Tier A. Sources institutional (AICPA, FASB, IFRS Foundation) + academic (Damodaran, OER).

## Inherited scripts (Shared OS/logical/)

| Script | Source | Purpose |
|---|---|---|
| `irs_pub15_2026.py` **✅ EXTRACTED touch-2 2026-08-10** — Route A payroll-tax computations (SS, Medicare, Additional Medicare, supplemental, backup) | [IRS Pub 15 (2026)](https://www.irs.gov/publications/p15) + [Pub 15-T](https://www.irs.gov/pub15t) — public domain | Payroll journal entries — ledger uses `compute_payroll_taxes()` to book employer liability (SS + Medicare employer share) and employee withholding (SS + Medicare + Additional Medicare employee share) per paycheck. |
| `irs_pub946_macrs.py` **✅ EXTRACTED touch-2 2026-08-10** — Route A/B MACRS: 9 GDS property classes verbatim, 3 conventions (half-year/mid-quarter/mid-month), straight-line depreciation math, mid-quarter trigger check | [IRS Pub 946](https://www.irs.gov/publications/p946) — public domain | Fixed-asset roll-forward — ledger uses `straight_line_depreciation()` for book depr on residential rental (27.5yr) + nonresidential real (39yr), and looks up recovery period per property class for accelerated-method tables in Appendix A. |

## Skills → script mapping

| Skill | Imports touch-2 |
|---|---|
| chart-of-accounts | script #1 |
| transaction-categorizer | script #2 |
| close-month (marketplace) | script #3 (variance analysis for P&L narrative) |

## Flag clearance

- CoA structure validity — reasoning-based; cleared by script #1
- Match confidence (amount ± date window) — arithmetic OK; **rule set** grounded on touch-2 by script #2
- Variance direction interpretation — reasoning-based; cleared by script #3
