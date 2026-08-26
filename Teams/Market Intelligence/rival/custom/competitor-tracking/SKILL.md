---
name: competitor-tracking
type: custom
status: built from scratch
assigned_agent: rival (Market Intelligence / Competitor Intelligence)
portable: true
date_added: 2026-07-29
tier: 3
description: "Competitor registry — profile · funding · positioning · offering · pricing · recent moves. Refreshed per-competitor cadence. Every fact cites a public source; no rumour, no unverified."
triggers:
  - track competitor X
  - competitor profile
  - who is X
  - competitor list
  - competitor update
  - competitor moves
  - register competitor
---

# Competitor Tracking

## Purpose
Registry of tracked competitors. Every entry: profile · funding · positioning · offering summary · pricing (public tiers only) · recent moves (last 6 months).

## When to Use
- Register / update / retire a competitor entry
- Competitor lookup · list
- Feed `scope/landscape-map` with player positions

Do NOT use for: pricing intelligence deep-dive (→ `pricing-intel`) · trend detection (→ `trend`) · sizing (→ `scope`).

## Structure / Protocol
```
REGISTER  slug · name · category · funding stage · HQ · known offering · public pricing
UPDATE    quarterly or on-signal (funding round · pricing change · product launch · exec change)
LOOKUP    by slug / by category
LIST      by category · by stage · by geography
RETIRE    exited / acquired (record acquirer)
```

## Instructions
Every field cites a public source (website URL · press release · SEC filing · Crunchbase). No unverified rumour. `[rumoured — needs verification]` tag if included.

## Output Format
Profile card + last-updated + change log.

## Principles
- **Every fact cited to public source.**
- **No unverified rumour** ships without `[rumoured]` tag.
- **Retirement records acquirer** (or "exited market" reason).
- **Never delete entry history.**

## Fallback
| Failure | Response |
|---|---|
| Public source not available | `[operator input]` tag + escalate for verification |
| Competitor pricing not published | Note "pricing not public"; do not infer |

## Boundaries
- `pricing-intel` (this agent) — deeper pricing analysis.
- `scope/landscape-map` — consumes player positions.
- `trend/macro-signals` — surfaces trend-implicated competitor moves.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| competitor-tracking | File read/write · Web fetch (public source verification) | News API MCP · Crunchbase MCP | All steps |
