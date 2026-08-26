---
name: dashboard-standards
type: custom
status: built from scratch
assigned_agent: viz (Data & Analytics / Visualisation)
portable: true
date_added: 2026-07-29
tier: 3
description: "Dashboard authoring standards — chart types by data shape, colour palette, layout grid, delta notation, accessibility floor. Enforced on every dashboard produced by exec-dashboard + ad-hoc-analysis + business-pulse."
triggers:
  - dashboard standard
  - viz standard
  - chart type for X
  - colour palette
  - dashboard review
  - which chart for this data
---

# Dashboard Standards

## Introduction
Built 2026-07-29 as viz's authoring-standard skill. Every dashboard produced downstream (`exec-dashboard`, `ad-hoc-analysis`, `business-pulse` rendering) conforms to the standards here.

## Purpose
Own the canonical dashboard style guide: chart type by data shape (Cleveland/Few discipline), colour palette (WCAG-compliant), layout grid, delta notation, accessibility floor.

## When to Use
- "Dashboard standard" · "chart type for X" · "colour palette" · "which chart for this data"
- Before building any dashboard; ambiguous "make me a chart" → route here first for shape decision.

Do NOT use for: dashboard build (→ `exec-dashboard`) · viz accessibility deep-audit (→ `viz-accessibility`) · dashboard portfolio audit (→ `dashboard-audit`).

## Structure / Protocol
```
LOOKUP    data shape (categorical / ordinal / continuous / time-series / geo / relational) → chart type recommendation
PALETTE   return WCAG-compliant palette (colour-blind-safe)
LAYOUT    return grid template (1-widget / 2-widget / 4-widget / detail)
DELTA     return delta notation rules
REVIEW    audit a proposed dashboard against the standard
```

## Instructions
### Chart type by data shape
- **Categorical, ≤ 5 categories** → horizontal bar (not pie).
- **Categorical, > 5** → sorted horizontal bar or stripe (never pie).
- **Ordinal** → ordered bar.
- **Continuous, univariate** → histogram + boxplot (Tukey).
- **Continuous, bivariate** → scatter with 45° reference if comparison.
- **Time-series** → line (never bar for time).
- **Time-series comparison** → small multiples > overlaid lines when > 3 series.
- **Geo** → choropleth for area; symbol map for point.
- **Relational** → node-link if small; adjacency matrix if dense.

### Palette
Sequential (viridis or cividis for colour-blind safety); diverging (RdBu with grey neutral); categorical (max 6, Okabe-Ito palette). No red-green pairs (WCAG).

### Layout
1-widget = full width. 2-widget = 50/50 or 66/33. 4-widget = 2×2 grid. Details always below summary.

### Delta notation
▲ / ▼ with % (e.g., "▲ 12%"). Absolute + delta both shown, delta second.

### Review mode
Audit an existing dashboard: chart mismatch to data shape · non-compliant colour · missing delta · layout violation. Return list of fixes.

## Output Format
Recommendation table or audit-findings list.

## Principles
- **Chart type follows data shape, not preference.**
- **Colour is meaning; never decoration.**
- **Every value has a delta.** Absolute-only is a defect.
- **WCAG floor is non-negotiable.**
- **Small multiples > overlaid** for > 3 series.

## Fallback
| Failure | Response |
|---|---|
| Data shape unclear | Ask; do not guess |
| Standard doesn't cover this shape | Flag as extension needed; do not silently invent |

## Boundaries
- `viz-accessibility` (this agent) — deep WCAG + screen-reader audit.
- `dashboard-audit` (this agent) — portfolio-level review.
- `exec-dashboard` · `ad-hoc-analysis` · `business-pulse` — consume standards.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| dashboard-standards | File read (standards YAML) | Chart-rendering library | All steps |
