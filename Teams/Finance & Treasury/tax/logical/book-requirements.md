---
agent: tax
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# tax · logical / book-requirements

Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `us_tax_calendar_math` | A/B | IRS Pub 15 (Employer's Tax Guide) — [free irs.gov](https://www.irs.gov/publications/p15) | IRS Pub 334 (Small Business Tax Guide) — [free irs.gov](https://www.irs.gov/publications/p334) |
| 1a | `irs_pub15_2026.py` **✅ EXTRACTED touch-2 2026-08-10** — `Shared OS/logical/irs_pub15_2026.py` (Route A — 2026 SS/Medicare rates verbatim, SS wage base $184,500, supplemental-wages 22%/37%, backup 24%, household/election thresholds; compute_payroll_taxes + supplemental_wage_withholding) | IRS Publication 15 (2026) — [irs.gov/publications/p15](https://www.irs.gov/publications/p15) — public domain | IRS Publication 15-T (2026) — [irs.gov/pub15t](https://www.irs.gov/pub15t) | Payroll-tax calendar backbone: gives tax the deterministic per-paycheck computations needed to build monthly/quarterly/annual filing calendars (Forms 941, 940, W-2). |
| 1b | `irs_pub946_macrs.py` **✅ EXTRACTED touch-2 2026-08-10** — Route A/B MACRS depreciation | IRS Publication 946 — [irs.gov/publications/p946](https://www.irs.gov/publications/p946) — public domain | Pub 946 Appendix A (percentage tables) | Tax-depreciation math for Form 4562: property-class lookup + straight-line for real property + mid-quarter trigger check + Appendix A pointer for accelerated 200%/150% DB tables. |
| 2 | `rd_credit_us_qualifier` | B | IRC §41 statute + IRS Form 6765 instructions — [free irs.gov](https://www.irs.gov/forms-pubs/about-form-6765) | Treas. Reg. §1.41 (US Treasury regulations, public) |
| 3 | `transfer_pricing_arms_length` | B | OECD Transfer Pricing Guidelines for MNEs and Tax Administrations — [free OECD](https://www.oecd.org/tax/transfer-pricing/) | UN Practical Manual on Transfer Pricing — [free UN](https://www.un.org/development/desa/financing/document/un-practical-manual-transfer-pricing-developing-countries) |

All Tier A — free institutional (IRS, US Treasury, OECD, UN).

## Skills → script mapping

| Skill | Imports touch-2 |
|---|---|
| filing-calendar | script #1 (US-specific; UK / CA / EU parallel scripts as jurisdictions declared) |
| tax-optimization-review | script #3 for transfer pricing; general rules from source books |
| rd-credits | script #2 (US IRC §41); UK RDEC / CA SR&ED parallel scripts as jurisdictions declared |

## Flag clearance

- Filing-cadence computation — arithmetic OK; **rule set** grounded touch-2 by script #1
- R&D qualification per activity — reasoning-based; script #2 provides deterministic yes/no per four-part test
- Transfer-pricing arm's-length rate — reasoning-based; grounded touch-2 by script #3

## Still pending

- **Non-US regimes**: UK CTA + HMRC CIRD manual, CA ITA + SR&ED policy, EU jurisdiction-specific — all free official but need per-jurisdiction extraction.
- **State-tax rules** (US) — 50-state variations; extract on demand.
