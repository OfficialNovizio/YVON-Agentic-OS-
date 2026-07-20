---
name: pricing-research
type: custom
status: built from scratch
fulfills_catalog_entry: none — new agent (price); the monetization gap the catalog left (redesign §1.2, §3)
assigned_agent: price (Product / Pricing & Packaging)
portable: true
includes: scripts/van_westendorp.py (tested 2026-07-10, 12/12 self-tests pass — computes OPP/IPP/PMC/PME + Range of Acceptable Prices from PSM survey data; stdlib-only, no network/writes)
date_added: 2026-07-10
---

# Pricing Research

## Introduction
Finding what customers will actually pay: willingness-to-pay research via structured methods (van Westendorp price-sensitivity, conjoint/trade-off analysis, direct testing) — treated as flagged rubrics until the pricing source lands, and always validated by a real revenue experiment before a price is set.

## Purpose
Prices get set by cost-plus, competitor-copying, or the founder's gut — none of which is what customers value. Pricing research grounds the price in measured willingness-to-pay, so the number is defensible and the value-capture is deliberate, not accidental.

## When to Use
- A new product/feature needs a price and there's no WTP evidence.
- A pricing hypothesis needs research before a live experiment (loom's cheapest-test, pricing edition).
- packaging-tiers needs value-perception data to design fences.

## Structure / Protocol
QUESTION (what will a segment pay for what value — per product profile, per persona) → METHOD (van Westendorp for a price range, conjoint for feature-value trade-offs, direct WTP testing — each flagged reasoning-based until the pricing/economics source) → SEGMENT (WTP varies by segment; a blended number hides the real structure — read per persona) → VALUE ANCHOR (price to the value delivered / alternative's cost, not to internal cost — cost sets a floor, value sets the price) → VALIDATE (survey WTP is stated intent, not behavior; the real test is a revenue experiment via pricing-experiment-discipline — research proposes, the experiment confirms) → HANDOFF (WTP structure → packaging-tiers for tier design; → loom for the confirming experiment).

## Instructions
1. Value over cost — cost-plus leaves money on the table or prices above value; research anchors on what the outcome is worth to the customer and what the alternative costs.
2. Methods are flagged rubrics — van Westendorp and conjoint are conventions carried with the rule-0.6 flag until the pricing/economics source; a research output states its method and its flag. **Van Westendorp is computed, not eyeballed:** `scripts/van_westendorp.py` turns the four PSM survey prices into the decision points (OPP/IPP/PMC/PME) and the Range of Acceptable Prices — the curve-intersection math is well-defined and doesn't wait on the pricing book; only the survey design and interpretation stay price's judgment.
3. Segment WTP, never blend — different personas pay differently; a single blended price is usually wrong for everyone. The segmentation is the finding.
4. Stated WTP ≠ paid WTP — surveys measure intent, which overstates; every research-derived price is a hypothesis for a revenue experiment, never a price set on survey data alone.
5. Feed both directions — WTP structure informs packaging-tiers (where the fences go) and is confirmed by loom's revenue experiment before anything ships.

## Output Format
Pricing research: segment × WTP range (method + flag) · value anchor (vs alternative) · feature-value trade-offs (conjoint) · confidence · → packaging-tiers + loom experiment.

## Principles
- Price to value, not cost — cost is the floor, value is the price.
- Segment WTP; a blended number hides the structure.
- Stated intent ≠ behavior — surveys propose, revenue experiments confirm.
- Methods flagged rubric until the pricing source lands.

## Fallback
No research budget / access? Use competitor benchmarking + value-based reasoning, labeled weaker than measured WTP, and prioritize a live pricing experiment (behavior beats a guess) — never a confident price on no evidence.

## Boundaries with Other Skills
- packaging-tiers consumes WTP structure for tier/fence design; pricing-experiment-discipline (with loom) confirms research with behavior.
- felix/Finance (future): price sets the price from WTP; finance owns margin/unit-economics/treasury math — boundary stated now, bound later.
- ux: qualitative value perception can come from ux's research; price owns the WTP-to-price translation.
- Behavioral Science (future): price-framing/anchoring psychology is that dept's — price flags the dependency, doesn't inline it.
