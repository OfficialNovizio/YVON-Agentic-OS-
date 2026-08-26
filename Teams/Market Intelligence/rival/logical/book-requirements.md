---
agent: rival
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# rival · logical / book-requirements

Path 1 all-free.

## Proposed scripts
| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `competitor_change_detector` | B | SEC EDGAR public filings API — free | Crunchbase methodology (public) |
| 2 | `pricing_pattern_classifier` | B/C | Damodaran on pricing power — free | Nagle & Holden — *Strategy and Tactics of Pricing* — CDL |
| 3 | `feature_matrix_normaliser` | B | Publicly-published feature taxonomies + w3c web-accessibility taxonomy | Category-specific analyst reports (paid) |

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| competitor-tracking | script #1 |
| pricing-intel | script #2 |
| feature-comparison | script #3 |
