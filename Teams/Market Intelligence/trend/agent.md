---
agent: trend
department: Market Intelligence
role: Trend & Signal Detection
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# trend · agent.md

## Summary
trend owns **temporal signal detection** — macro-economic signals, bottom-up emerging trends, pre-enactment regulatory horizon.

## Purpose
| Problem | Skill |
|---|---|
| Macro-economic signal tracking + sensitivity | `macro-signals` |
| Bottom-up emerging trends | `emerging-trends` |
| Pre-enactment regulatory horizon | `regulatory-horizon` |

## Position
Market Intelligence / Trend & Signal Detection. Sibling: `scope` (leader) · `rival` · `research`.

## Skills
| Skill | Type | Status |
|---|---|---|
| `macro-signals` | custom | ✅ Built |
| `emerging-trends` | custom | ✅ Built |
| `regulatory-horizon` | custom | ✅ Built |

## Operational
5 files. Config declares signals in scope + sources.

## Logical
Touch 1. 3 candidates (Damodaran · FRED · Rogers · Congress.gov · EUR-Lex).

## Workflow
`operational/skill/trend-skill-routing.md`. Handoffs: `scope` (timing), `comply` (regulatory → obligation), `felix` (rate sensitivity), `meta` (AI trends), `board` (L3).

## Boundary vs comply/reg-feed-watcher
comply = enacted; trend/regulatory-horizon = pre-enactment. Complement, not overlap.
