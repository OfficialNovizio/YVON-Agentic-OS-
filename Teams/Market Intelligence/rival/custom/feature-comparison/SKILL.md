---
name: feature-comparison
type: custom
status: built from scratch
assigned_agent: rival (Market Intelligence / Competitor Intelligence)
portable: true
date_added: 2026-07-29
tier: 3
description: "Feature-by-feature comparison matrix — us vs 2-5 competitors. Sources: public docs · demos · reviews. Never inflates our column; never invents theirs. Feeds sales enablement + product prioritisation."
triggers:
  - feature comparison
  - us vs competitor
  - competitive matrix
  - who has feature X
  - feature gap
  - competitive feature analysis
---

# Feature Comparison

## Purpose
Structured feature matrix. Rows: features (operator-declared list). Columns: us + 2-5 competitors. Cells: yes / no / partial / unknown with citation.

## When to Use
- Sales enablement (compete deck)
- Product prioritisation (gap analysis)
- Positioning

Do NOT use for: pricing comparison (→ `pricing-intel`) · overall category positioning (→ `scope/landscape-map`).

## Structure / Protocol
```
1. FEATURES  operator supplies feature list (or last-review list)
2. COMPETITORS operator selects from competitor-tracking
3. RESEARCH  per (feature × competitor): public docs / demo videos / review sites
4. FILL      yes / no / partial / unknown with source citation
5. GAP       our-no + all-others-yes → gap flag
6. RETURN    matrix + gap summary
```

## Instructions
- **Our column** filled from `dev` / `mia` / `raj` etc. product owners; never marketing spin.
- **Their columns** filled from public sources only.
- **"Unknown"** is honest — never a false yes/no.

## Output Format
Matrix (rendered via viz) + gap summary + citations.

## Principles
- **Never inflates our column.** Product owners fill; not marketing.
- **Never invents theirs.** Public docs only.
- **"Unknown" over guessing.**
- **Every cell cites source.**

## Fallback
| Failure | Response |
|---|---|
| Feature not public for competitor | "Unknown"; do not infer |
| Our feature state ambiguous | Ask product owner; do not spin |

## Boundaries
- `competitor-tracking` (this agent) — competitor list source.
- `pricing-intel` — separate pricing dimension.
- `Product/spec` + `dev` — supplies our-feature truth.
- `viz` (D&A) — matrix rendering.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| feature-comparison | File read/write · Web fetch (public docs) | Video review MCP · review-aggregator MCP | All steps |
