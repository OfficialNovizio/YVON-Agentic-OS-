---
name: landscape-map
type: custom
status: built from scratch
assigned_agent: scope (Market Intelligence / Market Sizing & Landscape — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "Category / competitive-landscape map. Segments players by axes (e.g., enterprise-vs-SMB × platform-vs-point). Consumes competitor data from rival. Refresh quarterly. Never invents players."
triggers:
  - landscape map
  - competitive landscape
  - category map
  - who's in this space
  - who are the players
---

# Landscape Map

## Purpose
Category-level 2D landscape maps. Consumes competitor entries from `rival/competitor-tracking`; positions each on operator-chosen axes.

## When to Use
- Board deck market slide
- Product-strategy prioritisation
- Sales enablement

Do NOT use for: single-competitor deep-dive (→ `rival`) · sizing (→ `market-sizing`).

## Structure / Protocol
```
1. AXES     operator picks 2 axes (segment × delivery-model / price × capability / etc.)
2. PLAYERS  pull active competitors from rival + adjacent-market operator input
3. POSITION each on the map with rationale
4. GAPS     identify empty quadrants + interpret
5. RETURN   map data + rationale + gap analysis
```

## Instructions
Positioning must trace to a real competitor fact (from `rival`); no invented positions.

Gaps: an empty quadrant may signal opportunity or may signal no-one-wants-it. Note interpretation.

## Output Format
2D map data (rendered via `viz`) + player positions + rationale per player + gap analysis.

## Principles
- **Positions traced to real facts** from rival competitor entries.
- **Axes operator-declared** — never invented.
- **Gaps interpreted**, not silently listed as opportunities.
- **Refresh quarterly** — stale landscape is misleading.

## Fallback
| Failure | Response |
|---|---|
| Competitor data thin | Note "sparse map"; do not fabricate positions |
| Axes ambiguous | Ask operator to specify |

## Boundaries
- `rival/competitor-tracking` — supplies players.
- `market-sizing` — market extent context.
- `viz` (D&A) — map rendering.
- `marcus` — landscape consumer.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| landscape-map | File read (rival data · config) | Viz rendering handoff | All steps |
