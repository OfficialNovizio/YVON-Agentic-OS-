---
name: brand-separation-matrix
type: operational/agent
status: operator-approved 2026-08-30 (multi-brand-system Phase 1 input)
assigned_agent: atlas (Brand Studio / Art Director)
consumed_by: multi-brand-system Phase 2/3; mia's design-tokens (rendering side)
date_added: 2026-08-30
---

## Purpose

The operator-approved separation matrix `multi-brand-system` Phase 1 requires before it
will run. Without this file that skill stops and asks — it never infers separation rules
from the kits alone. Recorded here so venture visuals trace to an approved rule rather
than to a builder's improvisation.

Genericized per playbook §0.4: this file names **element classes and derivation rules**,
never individual venture names or their palettes. Per-venture values resolve at runtime
from that venture's own record, so a venture added later is covered with no edit here.

## Matrix

| Element class | Rule | Resolves from |
|---|---|---|
| Primary palette | **exclusive** per venture | that venture's own stored brand color |
| Card silhouette | **exclusive** per venture | deterministic pick from the approved silhouette set (below), keyed on venture identity |
| Glow / aura intensity | **exclusive** per venture | deterministic pick from the approved intensity range (below), keyed on venture identity |
| Layout structure | shared | the common structural system (branch/trunk/leaf geometry) |
| Type family + type scale | shared | the common set |
| Spacing / card dimensions | shared | the common set |
| Core mark (YVON hub) | shared | parent mark — the core's own palette, never a venture's |

## Approved silhouette set

The **set** is the approved common property; *which* member a given venture draws is
exclusive to that venture and stable across sessions (derived from its identity, never
random per render, so a venture's look never changes underneath the operator).

| # | Corner radius | Border weight |
|---|---|---|
| 1 | 18 | 1.6 |
| 2 | 6  | 1.2 |
| 3 | 12 | 2.0 |
| 4 | 22 | 1.0 |

## Approved glow intensity range

`0.28 – 0.64` opacity on the venture's own hub halo, in 5 discrete steps, derived the same
deterministic way. Range floor keeps every venture visible; ceiling keeps a venture from
out-glowing the core mark.

## Distance rule

A venture's exclusive elements (its palette above all) must appear **throughout** its own
subtree — card borders, numerals, sparkline fills, its branch lines, and its hub halo. A
venture rendering in another venture's palette, or in the core's violet, is a BLEED
finding. Equally: the core hub never borrows a venture's palette.

## Known gap

Silhouette and glow currently derive from venture identity rather than from a designed
per-venture brand kit, because no venture kit files exist yet (`brands[].brand_kit_path`
is `<FILL_IN>` in atlas-config). This is a documented derivation, not a designed value —
when real venture kits land, those kits become the source and this derivation retires.
Flagged so it is never mistaken for an art-directed decision.
