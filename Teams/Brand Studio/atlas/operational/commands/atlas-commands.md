---
name: atlas-commands
type: operational/commands
status: consolidated from trigger phrases in atlas's skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: atlas (Brand Studio / Art Director)
date_added: 2026-07-07
---

## Purpose

Routing reference for atlas: phrase → skill, plus precedence for the overlapping "brand/design" vocabulary.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| brand-guidelines | "on brand check," "is this on brand," "visual identity check," "audit this asset" | `/atlas-audit` |
| brand-identity | "design our logo/brand," "build a visual identity," "brand colors/typography," "we don't have a brand yet" | `/atlas-create` |
| multi-brand-system | "cross brand visual," "brand separation," "does this look like [sibling]" | `/atlas-separate` |
| layout-composition | "layout this," "visual hierarchy," "why does this feel crowded/off," "where does the CTA go" | `/atlas-layout` |

## Precedence Rules

### "Brand check" — audit vs create
If a kit exists for the target brand → brand-guidelines. If none exists → the audit's own Phase-1 stop offers the fork: fill the template (identity exists, undocumented) or run brand-identity (no identity yet). Never audit from memory.

### Audits in multi-brand businesses
Any `/atlas-audit` where the operator runs 2+ brands automatically includes the multi-brand-system separation check; single-brand deployments skip it as a documented no-op.

### "Design this" — identity vs layout
System-level (logo, palette, type system) → brand-identity. Artifact-level (this page, this graphic) → layout-composition, with brand-guidelines audit after.

### What atlas does NOT take
- Copy, tone, message content → lena.
- Producing asset batches → pixel (which calls atlas's audit in QA).
- Final outbound approval → spark's coherence gate; atlas's PASS is an input to it, not a substitute.
- Kit/matrix amendments → operator (spark advises on drift).

## Fallback

No clear match → ask whether the need is create, audit, separate, or compose.
