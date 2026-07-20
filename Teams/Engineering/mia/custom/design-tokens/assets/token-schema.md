# Design Token Schema — mia/design-tokens — [business name]

> Tokens are semantic names bound to atlas's brand-kit values. Components read tokens only. One token set per theme. Values <FILL_IN> from the kit (rule 0.5 — mia doesn't invent brand values).

## Color
| token | kit source | value (from kit) |
|---|---|---|
| color.action.primary | [kit ref] | <FILL_IN> |
| color.action.secondary | | <FILL_IN> |
| color.text.default / muted / inverse | | <FILL_IN> |
| color.surface.default / raised / sunken | | <FILL_IN> |
| color.status.success / warning / error / info | | <FILL_IN> |

## Typography
| token | kit source | value |
|---|---|---|
| type.heading.xl / lg / md / sm | [kit type scale] | <FILL_IN> |
| type.body.lg / md / sm | | <FILL_IN> |
| type.font.family (sans/serif/mono) | | <FILL_IN> |

## Spacing / layout
| token | value |
|---|---|
| space.0 … space.N (scale) | <FILL_IN> |
| radius.sm / md / lg / full | <FILL_IN> |
| shadow.sm / md / lg | <FILL_IN> |

## Motion (ties to atlas/tempo if present)
| token | value |
|---|---|
| motion.duration.fast / base / slow | <FILL_IN> |
| motion.easing.standard / entrance / exit | <FILL_IN> |

## Themes
| theme | notes |
|---|---|
| default | base token set |
| dark | overrides where they differ |
| white-label / per-business | toongine binds at deployment |

## Rules
- Components reference tokens ONLY; a raw brand value in a component is a finding.
- Every token traces to a kit source; a token change traces to the kit amendment.
- Non-brand one-offs stay OUT of this namespace (local styles).
