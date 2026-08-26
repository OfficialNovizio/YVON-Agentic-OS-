---
agent: felix
department: Finance & Treasury
type: logical-book-requirements
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# felix · logical / book-requirements

**Touch 1 placeholder** (§8.1). Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `capital_budgeting` | A | Damodaran — Applied Corporate Finance — [free](https://pages.stern.nyu.edu/~adamodar/) | Brealey & Myers — Principles of Corporate Finance — Internet Archive CDL |
| 2 | `runway_scenario_math` | A | Damodaran — DCF spreadsheets | UNIDROIT Principles (jurisdiction-neutral) |
| 3 | `unit_economics_computer` | A/C | Damodaran — Little Book of Valuation | Buffett shareholder letters — [free](https://www.berkshirehathaway.com/letters/letters.html) |
| 4 | `damodaran-industry-benchmarks.md` (Route D per §8.9) | D | Damodaran annual industry datasets | (Standalone institutional dataset — no second source needed at this Tier) |

Tier A candidates all. Sources authenticated per §8.8: Damodaran (NYU Stern), Buffett (Berkshire — well-documented shareholder-communication corpus), UNIDROIT.

Whole-book access §8.10: Damodaran corpus is direct-web at NYU page; Buffett letters direct-web at berkshirehathaway.com; Brealey & Myers older editions via Internet Archive CDL.

## Inherited scripts

`Shared OS/logical/capital_budgeting.py` exists (from prior fleet build) — check for reuse before creating new. If content aligns, felix imports; if felix needs a variant, extend not duplicate.

| Script | Source | Purpose |
|---|---|---|
| `irs_pub15_2026.py` **✅ EXTRACTED touch-2 2026-08-10** — Route A payroll-tax computations | [IRS Pub 15 (2026)](https://www.irs.gov/publications/p15) — public domain | Cash-forecast payroll-tax outflows — felix models the employer-share liability ($6.2% SS up to $184,500 + 1.45% Medicare, no cap) as a fixed % of the wage forecast when projecting cash. |
| `fred_series_registry.py` **✅ EXTRACTED touch-2 2026-08-10** — Route B canonical macro-series registry (20 series across output/labor/inflation/rates/money/fiscal/fx) | [FRED — St. Louis Fed](https://fred.stlouisfed.org/) — Public Domain: Citation Requested + BEA + BLS | Macro-backdrop for runway scenarios — felix pulls FEDFUNDS + T10Y2Y + CPILFESL + UNRATE for scenario modelling; registry gives canonical series IDs to avoid ambiguity (e.g., 'CPI' → CPIAUCSL vs CPILFESL vs PCEPI). |

## Skills → script mapping

| Skill | Imports touch-2 |
|---|---|
| runway-model | script #2 |
| unit-economics | script #3 + `.md` #4 |
| budget-scenarios | script #1 · #2 |
| cash-flow-snapshot | (marketplace — grounded in its own math) |

## Flag clearance (0.6)

All felix judgments below currently reasoning-based:
- Runway floor threshold interpretation
- Below-floor severity ranking
- Unit-economics LTV lifetime assumptions
- Industry-benchmark applicability

Cleared by respective scripts on touch-2.

## Still pending

- Touch-2 extraction itself.
- **Brealey & Myers current edition** (paywalled). Older editions on Internet Archive suffice for Tier A.
- **Munger's *Poor Charlie's Almanack*** if operator adds — Route D practitioner wisdom on capital allocation.
