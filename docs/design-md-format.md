# design.md Format — the canonical shape

> Saved 2026-09-08 per the operator's order: "save the format on design.md how
> it should made up". This is the format every YVON reference-build design.md
> follows — the getdesign catalog shape, measured-not-vibed. The single
> composer is `renderDesignMd` in `dashboard/lib/design-session.ts`; this
> document is the spec it implements. Design.md tabs in the dashboard render
> via `DesignMdView` (frontmatter as a header card, body as markdown — never
> raw YAML).

## Contract

1. **Measured, not invented.** Every value traces to captured evidence
   (hydrated DOM + stylesheets from the capture relay). Anything the capture
   couldn't measure is declared in Known Gaps — never guessed, never filled
   from vibes.
2. **Section order is fixed.** The order below is the format. Sections with no
   measured data are OMITTED (not stubbed), and their absence is declared in
   Known Gaps.
3. **Frontmatter is machine block, body is the document.** The YAML
   frontmatter is the machine block (consumed by the PRD generator and the
   builder); the body is the human document rendered by DesignMdView.

## Frontmatter (machine block)

```yaml
---
version: alpha
name: "<site>-design-analysis"
description: "Design-system analysis of <url> … measured … Known Gaps."
colors:          # kebab-case token → measured value
  black: "#000000"
typography:      # role → 5-key object (getdesign shape)
  display:
    fontFamily: …
    fontSize: …
    fontWeight: …
    lineHeight: …
    letterSpacing: …
rounded:         # token → measured radius
  card: "0px"
spacing:         # token → measured spacing (Layout section)
  container: "…"
elevation:       # token → measured box-shadow
  card: "…"
components:      # component name → token-ref object ({colors.x} refs)
  <component>:
    background: "{colors.black}"
---
```

## Body — section order (fixed)

| # | Section | Content | Rendered from |
|---|---------|---------|---------------|
| 1 | `## Overview` | What the site is, probe taxonomy, key characteristics | `reference.url/taxonomy/taxonomyWhy`, `components[]`, `motion[]` |
| 2 | `## Colors` | Palette grouped by role (Brand & Accent / Surface & Background / Text & Rules / Semantic / Other) — each entry: **token label** (`value`): usage + source | `palette[]` |
| 3 | `## Typography` | Font Family (measured face), Hierarchy **table** (role/family/size/weight/line-height/tracking), Principles | `typography[]`, `typographyRoles{}` |
| 4 | `## Layout` | Spacing Scale **table** (token/value: container, gutters, section rhythm) + Layout Grammar facts | `spacing{}`, `layout[]` |
| 5 | `## Elevation` | Shadow **table** (token/shadow) | `elevation{}` |
| # | `## Motion & Interaction` | YVON extension — measured motion behavior + sources (motion is a first-class stage of the pipeline) | `motion[]` |
| 6 | `## Shapes` | Radius Scale **table** (token/value) | `rounded{}` |
| 7 | `## Standard Components` | Named components with measured evidence | `components[]`, `componentTokens{}` |
| 8 | `## Do's and Don'ts` | Do list + Don't list, each derived 1:1 from a measured fact | `dos[]`, `donts[]` |
| 9 | `## Responsive Behavior` | Breakpoints **table** (name/width/key changes + source) | `responsive[]` |
| 10 | `## Iteration Guide` | Numbered build/iteration steps | `iteration[]` |
| 11 | `## Known Gaps + Measurement sources` | What measurement could NOT answer (plus auto-gaps for missing sections), then sources | `gaps[]`, `sources[]` |
| 12 | `## Session Appendix` | YVON pipeline record: capture facts, user intent, motion decision, brand suggestions, build recipe, history | session record |

## Rules

- **Tables over prose.** Hierarchy/radius/spacing/elevation/breakpoints are
  tables — the shape the operator showed (Cohere catalog target).
- **Grouped colors.** Colors group by role, never a flat list.
- **Every fact cites its source.** `- Source: …` lines under facts; table rows
  carry sources where the capture provides them.
- **Known Gaps is part of the format.** Unmeasured sections are declared
  there — the renderer auto-declares radius/layout/elevation gaps when the
  section would otherwise be silently absent.
- **The Session Appendix is YVON's addition.** It carries the pipeline record
  (capture, intent, motion, recipe, history) so the builder turn reads one
  document with the full decision trail.

## Consumers

- **PRD generator** reads the frontmatter machine block.
- **Builder turn** reads the whole document as the design spec ([ACTIVE TASK]
  payload carries `designMd` verbatim).
- **DesignMdView** renders it in the dashboard (frontmatter → header card with
  color swatches; body → formatted markdown).
- **Design-preview panel** links out to the live preview URL stamped in the
  task's workItems produces → `workspaces/<venture>/`.
