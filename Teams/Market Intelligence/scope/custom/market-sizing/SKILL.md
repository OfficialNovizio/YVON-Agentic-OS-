---
name: market-sizing
type: custom
status: built from scratch
assigned_agent: scope (Market Intelligence / Market Sizing & Landscape — department leader)
portable: true
date_added: 2026-07-29
tier: 3
description: "TAM / SAM / SOM sizing — three-method triangulation (top-down · bottom-up · value-theory). Every number cites source. Confidence bands mandatory. Never a single-point estimate."
triggers:
  - market size
  - TAM
  - SAM
  - SOM
  - market opportunity
  - addressable market
  - size this market
---

# Market Sizing

## Introduction
Built 2026-07-29 as scope's TAM/SAM/SOM sizing skill. Damodaran-inspired discipline of ranges-over-points; three-method triangulation for every sizing.

## Purpose
Produce TAM · SAM · SOM ranges with source-cited inputs and confidence bands. Never a single-point estimate.

## When to Use
- New market entry decision
- Investor deck market slide
- Product prioritisation ("how big is this")

Do NOT use for: competitor analysis (→ `rival/competitor-tracking`) · trend detection (→ `trend/macro-signals`) · primary research (→ `research`).

## Structure / Protocol
```
1. DEFINE      market boundary (product · geography · customer segment)
2. TOP-DOWN    industry report → segment share → your addressable slice
3. BOTTOM-UP   customer count × avg revenue × penetration ceiling
4. VALUE       value-created × capture rate
5. TRIANGULATE reconcile three numbers; report range with confidence
6. RETURN      TAM · SAM · SOM range + method breakdown + citations
```

## Instructions
### Step 5: Triangulate
Three methods should be within one order of magnitude. If they diverge more, one is wrong; investigate before proceeding.

Report shape: `TAM: $A–$B, SAM: $C–$D, SOM: $E–$F. Methods: top-down $X, bottom-up $Y, value $Z. Confidence: high/medium/low based on convergence + source quality.`

## Output Format
Sizing table + method breakdown + citations + confidence.

## Principles
- **Three-method triangulation always** — no single-method sizing ships.
- **Every input cites a source.** No invented industry sizes.
- **Ranges, not points.**
- **Confidence tag mandatory.**
- **When methods diverge > 10×, halt** — one is wrong.
- **Provenance:** `[analyst report + date]` `[public filing]` `[operator input]` `[web search — verify]`.

## Fallback
| Failure | Response |
|---|---|
| No credible industry data | Bottom-up only + explicit "sourcing limited" flag |
| Methods diverge > 10× | Halt; surface divergence for investigation |
| Market boundary ambiguous | Ask; do not guess |

## Boundaries
- `competitor-tracking` (rival) — competitor share informs SOM.
- `macro-signals` (trend) — trends inform SOM growth trajectory.
- `primary-research` (research) — surveys inform bottom-up.
- `felix/unit-economics` (F&T) — SOM × unit-economics = revenue potential.
- `marcus` (Executive Office) — sizing feeds strategy decisions.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| market-sizing | File read (config) · Web fetch (analyst reports) | Analyst-report MCP (if configured) | Steps 2-4 |
