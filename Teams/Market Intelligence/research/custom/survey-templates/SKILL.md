---
name: survey-templates
type: custom
status: built from scratch
assigned_agent: research (Market Intelligence / Primary Research)
portable: true
date_added: 2026-07-29
tier: 3
description: "Reusable survey instrument library — NPS, JTBD, Van Westendorp PSM (routes to Product/price), price sensitivity, feature-priority. Instrument version-controlled with methodology citation."
triggers:
  - survey template
  - NPS survey
  - JTBD interview guide
  - reusable survey
  - instrument library
  - what survey to use for X
---

# Survey Templates

## Purpose
Library of validated survey / interview instruments — reusable across projects, methodologically grounded, version-controlled.

## Templates
- **NPS** — Net Promoter Score standard 0-10 + open-text follow-up
- **JTBD interview guide** — Christensen/Ulwick-style forces-of-progress
- **Van Westendorp PSM** — 4 price questions (routes to `Product/price/pricing-research`)
- **Feature priority (MaxDiff)** — best-worst scaling
- **Kano** — feature satisfaction categorisation
- **Custom** — operator-authored (methodology cited)

## When to Use
- Selecting instrument for a new study (`primary-research` step 1)
- Version-bumping an existing template
- Adding new methodology

## Structure / Protocol
```
LOOKUP   by name → return template + methodology citation + version
REGISTER new template with methodology source
UPDATE   version bump on methodology or wording change
RETIRE   deprecated methodology
```

## Instructions
Every template cites its methodology source (paper / book / standard). "Homegrown" templates without source are marked `[operator-authored, no external methodology]`.

## Output Format
Template body + methodology citation + version + last-validated date.

## Principles
- **Methodology citation mandatory** or explicit "operator-authored".
- **Version control** — every change archived.
- **Retirement records reason** (methodology superseded / instrument invalid).
- **Never delete history.**

## Fallback
| Failure | Response |
|---|---|
| No template for request | Register new with methodology; do not invent |

## Boundaries
- `primary-research` (this agent) — consumer.
- `Product/price/pricing-research` (Product) — Van Westendorp version there.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| survey-templates | File read/write | Survey MCP for direct deployment | All steps |
