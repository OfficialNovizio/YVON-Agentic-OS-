---
name: packaging-tiers
type: custom
status: built from scratch
fulfills_catalog_entry: none — new agent (price); packaging/tiers (redesign §3)
assigned_agent: price (Product / Pricing & Packaging)
portable: true
date_added: 2026-07-10
---

# Packaging & Tiers

## Introduction
How the product is divided into what-you-get-for-what-you-pay: feature-to-tier mapping, the fences that separate tiers (the value metric that scales price), and the good/better/best structure — designed from willingness-to-pay, per product profile.

## Purpose
Packaging captures (or leaks) more value than the price number itself: the same product in the wrong tiers under-monetizes power users and scares off small ones. Deliberate tier design aligns what each segment pays with what they value.

## When to Use
- A product needs its tier structure designed or restructured.
- pricing-research surfaces distinct WTP segments (the raw material for tiers).
- A feature needs a tier assignment (which plan is it in, and why).

## Structure / Protocol
VALUE METRIC (the fence that scales price with value — seats, usage, outcomes; the single axis a customer grows along; picked so paying more tracks getting more) → SEGMENT-TO-TIER (pricing-research's WTP segments map to good/better/best; each tier targets a segment's value + WTP) → FEATURE MAP (each feature → the lowest tier that still captures its value; differentiators gate higher tiers, table-stakes sit in the base — don't fence what everyone needs) → FENCE DESIGN (the tier boundaries are meaningful value jumps, not arbitrary feature-withholding customers resent) → PER-PRODUCT CONFIG (tiers live in the product profile `<FILL_IN>`, not hardcoded) → VALIDATE (structure → loom revenue experiment before launch).

## Instructions
1. Pick one value metric — the axis price scales on (seats/usage/outcome) should be the axis value scales on, so paying more always tracks getting more; a mismatched metric punishes your best customers.
2. Don't fence table stakes — features every user needs belong in the base tier; withholding them to force upgrades breeds resentment and churn, not revenue (the anti-dark-pattern rule).
3. Differentiators gate up — features that power users value and casual users don't are the natural tier boundaries; map each feature to the lowest tier that still captures its value.
4. Tiers target segments — good/better/best each aim at a WTP segment from pricing-research; a tier nobody is the target for is dead weight.
5. Config, not hardcode — the tier structure and feature map live in the product profile (rule 0.4b); toongine binds a business's packaging at deployment.

## Output Format
Packaging spec: value metric · tier structure (good/better/best × target segment × price) · feature-to-tier map · fence rationale · → loom experiment before launch.

## Principles
- One value metric — price scales with value, always.
- Don't fence table stakes — resentment isn't revenue.
- Differentiators gate up; tiers target real segments.
- Config per product, not hardcoded.

## Fallback
No WTP segmentation yet? Start with a simple good/better/best on the clearest value metric, labeled provisional, and let a pricing experiment (loom) refine the fences — a simple honest structure beats an elaborate unvalidated one.

## Boundaries with Other Skills
- pricing-research supplies WTP segments + value structure; pricing-experiment-discipline validates the packaging with behavior; price-change-governance handles re-packaging of existing customers (grandfathering).
- spec: which features exist is spec's PRD; which tier they land in is price's — co-owned at the feature/tier seam.
- mia (Engineering): the pricing page implements the packaging; price specs, mia builds through the gate.
