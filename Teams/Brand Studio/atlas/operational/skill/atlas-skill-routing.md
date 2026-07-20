---
name: atlas-skill-routing
type: operational/skill
status: consolidated from the "Boundaries" sections of atlas's skill files — no new logic invented
assigned_agent: atlas (Brand Studio / Art Director)
date_added: 2026-07-07
---

## Purpose

Atlas's routing map. Triggers: `operational/commands/atlas-commands.md`.

## Where Identity Fits

Atlas has no identity — spark (Creative Director) holds Brand Studio's. Universal-only principles.

## The Lifecycle

Atlas's four skills cover a brand's visual life in order:

```
brand-identity          (CREATE — new business, no identity yet: 5-element system)
      |                  output populates ↓
brand-guidelines        (ENFORCE — audit every asset vs the brand-kit file: PASS / fix list)
      +
multi-brand-system      (SEPARATE — multi-venture operators only: distance + shared-set
      |                  checks; dormant no-op for single brands)
layout-composition      (CRAFT — grid/Gestalt/whitespace/hierarchy decisions the kit
                         doesn't legislate)
```

## Handoff Rules

- **brand-identity → brand-guidelines**: creation output fills `assets/brand-kit-template.md`; from then on the kit is law and brand-identity is only re-run for redesigns (operator sign-off — identity changes post-rollout cost 10×).
- **brand-guidelines ↔ multi-brand-system**: multi-brand audits run both — own-kit compliance and sibling-territory separation. BLEED findings and repeat-violation drift notes route to **spark**.
- **layout-composition ↔ brand-guidelines**: the kit legislates spacing/clear-space; composition craft beyond that (focal points, hierarchy levels, grid choice) is layout-composition's. An audit never fails an asset on unlegislated craft — it may *recommend* via layout-composition.
- **brand-identity ← multi-brand-system**: creating a sibling brand consumes the separation matrix as a constraint and extends it (operator approves the new row).

## Cross-Agent Boundaries

- **lena** owns words (content, tone, voice guides); atlas checks only that text is *set* per the kit. brand-identity's voice sections defer to lena's voice-guide files.
- **pixel** calls brand-guidelines inside its asset-pipeline QA step — pixel produces, atlas judges.
- **spark** consumes atlas's kit as one of its three gate references, plus atlas's drift notes and BLEED findings. Spark judges drift; the operator amends kits/matrix.
- **Behavioral Science (when built)**: visual attention/salience findings (kahneman) may inform kit rules — via operator-approved kit amendments, never ad hoc.

## Precedence

"Is this on brand" → brand-guidelines (+ multi-brand-system if 2+ brands). "Make/design our brand" → brand-identity. "Lay this out / why does this feel off" → layout-composition. Ambiguous → ask whether the need is create, audit, separate, or compose.

## Fallback

No kit and the request is an audit → brand-guidelines' own Phase-1 stop (offer template or brand-identity). Anything else unclear → ask.
