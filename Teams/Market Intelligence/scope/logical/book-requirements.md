---
agent: scope
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# scope · logical / book-requirements

Path 1 all-free.

## Proposed scripts

| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `market_sizing_triangulator` | A/C | Damodaran industry datasets — [free NYU](https://pages.stern.nyu.edu/~adamodar/) | US Census + BEA industry data — free |
| 2 | `porter_forces_scorer` | B | Porter — *Competitive Strategy* (1980) — CDL | HBR "How Competitive Forces Shape Strategy" (1979) — some free at HBR |
| 3 | `drucker-strategy-questions.md` (D per §8.9) | D | Drucker — *The Practice of Management* — CDL | Drucker Institute free articles + WSJ column archive |

Tier A/B. Damodaran + Census + BEA are direct-free institutional.

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| market-sizing | script #1 |
| market-entry-analysis | script #2 + `.md` #3 |
| landscape-map | (uses inputs from rival) |

## Inherited scripts (Shared OS/logical/)
| Script | Source | Purpose |
|---|---|---|
| `fred_series_registry.py` **✅ EXTRACTED touch-2 2026-08-10** | [FRED — St. Louis Fed](https://fred.stlouisfed.org/) — Public Domain: Citation Requested | Macro-context for TAM sizing — canonical series IDs (GDP, INDPRO, PAYEMS) with verbatim units so scope can cite the exact FRED series it triangulates from. |

## Still pending
- Christensen (Innovator's Dilemma) — paywalled; would supplement Drucker on disruption dynamics.
- Thiel (Zero to One) — paywalled; monopoly framework supplement.
- Blank / Ries (Lean Startup) — paywalled.
