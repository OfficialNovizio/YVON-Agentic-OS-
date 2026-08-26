---
agent: treasure
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# treasure · logical / book-requirements

Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `payment_rails_selector` | B | Federal Reserve Payment System publications — [free federalreserve.gov](https://www.federalreserve.gov/paymentsystems.htm) | ECB payment systems + SWIFT documentation — free |
| 2 | `fx_exposure_computer` | A | Damodaran on currency risk (free NYU corpus) | ECB reference rate methodology — [free](https://www.ecb.europa.eu/stats/exchange/eurofxref/) |
| 3 | `cash_buffer_optimizer` | A/C | Damodaran on optimal cash holdings + Miller-Orr model | Brealey & Myers cash-management chapters (older editions Internet Archive) |

All Tier A. Institutional (Fed, ECB) + academic (Damodaran, Brealey & Myers).

## Skills → script mapping

| Skill | Imports touch-2 |
|---|---|
| entity-account-map | script #1 (rail selection per jurisdiction) |
| fx-exposure | script #2 |
| cash-management | script #3 |

## Flag clearance

- Rail-selection recommendation — reasoning-based; grounded touch-2 by #1
- FX-rate application + net exposure math — arithmetic OK; **rates from configured source** (Tier B if source declared)
- Buffer optimization → Miller-Orr → operator-supplied variance inputs; script computes deterministic optimum
