---
name: backlog-rules
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-backlog-rules (prefix stripped; NSM link + thresholds moved to product profile config)
assigned_agent: spec (Product / Product Manager, department leader)
portable: true
date_added: 2026-07-10
---

# Backlog Rules

## Introduction
Backlog hygiene as law: an evidence-gated intake, RICE-scored prioritization (math in `scripts/rice.py`, rubric honestly flagged), age-out, and a published next-view. The backlog is a decision record, not a wish list.

## Purpose
Backlogs rot two ways: unvetted entries (no evidence) and immortal entries (no age-out). Both make prioritization theater. This skill keeps the list short, cited, and honestly ranked.

## When to Use
- Any item wants in (intake gate).
- Prioritization cadence fires (`<FILL_IN: suggested per sprint/cycle>`).
- An item ages past the limit or its evidence is superseded.

## Structure / Protocol
INTAKE (evidence citation + link to the product's north-star metric per profile `<FILL_IN: NSM per product>` — no citation, bounced with the reason) → SCORE (`python scripts/rice.py items.json`: Reach × Impact × Confidence ÷ Effort; **RICE is a rubric — every ranking carries `[reasoning-based, not formula-verified]` until logical/ grounds the weights**) → RANK (score orders the list; operator/vista strategic overrides are recorded as overrides, not re-scored) → AGE-OUT (unranked or untouched > `<FILL_IN: suggested 90 days — catalog default>` → archived with reason; re-entry needs fresh evidence, scout's re-open pattern) → PUBLISH (next-`<FILL_IN: suggested 3>`-cycles view, visible to Engineering + vista).

## Instructions
1. Intake bounces are kind but cited: which gate failed (no evidence / no NSM link / duplicate of item X).
2. RICE inputs are estimates and say so: Reach from metric's data where possible (cited), Impact/Confidence as flagged judgment, Effort from Engineering's estimate (never spec's).
3. Confidence caps at the evidence ladder: opinion-level evidence (L1–2) caps Confidence at `<FILL_IN: suggested 50%>` — the script enforces this coupling.
4. Archived ≠ deleted: age-outs keep their record and reason (append-only, house pattern).
5. The published view is a commitment surface: changes to it mid-cycle are recorded with reasons (silent reshuffles are how trust in the backlog dies).

## Output Format
Ranked backlog (item / evidence ref / NSM link / RICE inputs+score / flag); bounce notices; age-out log; the published next-view.

## Principles
- Cite or bounce; rank or archive; publish and stand behind it.
- Effort is Engineering's number; Confidence is capped by evidence, not optimism.
- Overrides are legitimate AND visible — strategy may outrank scores, silently never.

## Fallback
No NSM defined yet for a product (profile gap)? Intake still requires evidence; NSM-link is waived with a named gap flag, and the profile gap goes on spec's report to the operator.

## Boundaries with Other Skills
- prd-discipline picks up what ranks; opportunity-assessment feeds big items in; vista consumes the published view for roadmap.
- rice.py math per rule 0.6; weights are the logical layer's future job.
