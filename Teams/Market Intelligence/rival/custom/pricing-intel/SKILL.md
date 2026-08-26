---
name: pricing-intel
type: custom
status: built from scratch
assigned_agent: rival (Market Intelligence / Competitor Intelligence)
portable: true
date_added: 2026-07-29
tier: 3
description: "Structured competitor pricing intelligence — public tier tables, packaging patterns, discount signals. Never sources non-public / obtained-improperly pricing (§0.5 + ethics). Feeds Product/price."
triggers:
  - competitor pricing
  - price comparison
  - pricing intel
  - what does X charge
  - pricing landscape
  - discount patterns
---

# Pricing Intel

## Purpose
Structured pricing intel across tracked competitors — tiers, features per tier, discount cadence signals. Public sources only.

## When to Use
- Competitive pricing landscape (feeds `Product/price`)
- Positioning analysis
- Price-change decision prep

Do NOT use for: our own pricing decisions (→ `Product/price`) · pricing research surveys (→ `Product/price/pricing-research`).

## Structure / Protocol
```
1. INTAKE     competitor + tier scope
2. FETCH      public pricing pages · public filings · listed marketplaces
3. STRUCTURE  tier table (tier · monthly · annual · included features · seat cap)
4. PATTERNS   discount signals (holiday · quarter-end · usage-based tiers)
5. RETURN     comparison table + patterns memo
```

## Instructions
Public sources only. Never scrape rate-limited or gated pages beyond public trial. Never use pricing obtained via NDA / channel partner / secondary source that violates terms.

If a competitor doesn't publish pricing (enterprise "contact sales"), note "not public" — do not infer.

## Output Format
Cross-competitor comparison table + patterns memo.

## Principles
- **Public sources only.** Non-public = out of scope.
- **Never infer from silence** — "not public" is the honest answer.
- **Every price cites source URL + snapshot date.**
- **Discount patterns from observed data**, not model-inferred.

## Fallback
| Failure | Response |
|---|---|
| Competitor pricing private | Note "not public"; do not infer |
| Source URL broken | Halt; require re-verification |

## Boundaries
- `competitor-tracking` (this agent) — profile data.
- `Product/price` — consumer of pricing intel + owns our own pricing.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| pricing-intel | Web fetch (public pricing pages) · File write | — | All steps |
