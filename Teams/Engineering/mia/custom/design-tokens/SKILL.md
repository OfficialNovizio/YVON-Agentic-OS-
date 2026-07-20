---
name: design-tokens
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; plan §3 "design-tokens (atlas bridge — brand kit → tokens)"
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — design-token skills found are format converters (Style Dictionary wrappers); the atlas-bridge discipline (brand kit as source of truth → tokens, traced to kit amendments) is kept custom
assigned_agent: mia (Engineering / Frontend Web)
portable: true — the bridge is brand-agnostic; the actual kit values come from atlas's brand kit per business
includes: assets/token-schema.md
date_added: 2026-07-09
---

## Introduction

design-tokens is the **atlas bridge**: the brand kit that atlas (Brand Studio's visual definer) owns is the single source of truth for the frontend's design tokens — colors, type scale, spacing, radii, shadows, motion. mia translates the kit into tokens the UI consumes, so the brand and the product never drift apart, and a kit change flows to the product through one traceable path instead of scattered hardcoded values.

## Purpose

When designers own a brand kit and engineers hardcode hex values, the two diverge the first week — the "brand blue" in the app is three slightly different blues, none matching the kit. Tokens fix this: the kit defines the values once, tokens carry them into code, and a brand refresh is a kit amendment that propagates, not a hunt through stylesheets.

## When to Use

Triggers: "design tokens," "brand colors in the app," "the UI doesn't match the brand," "update the theme," a brand kit change from atlas, and any UI styling that would otherwise hardcode a brand value.

## Structure / Protocol

```
atlas's BRAND KIT (source of truth — colors, type, spacing, motion, etc.)
  -> Translate to tokens (assets/token-schema.md): semantic names, not raw values
     (token: color.action.primary → kit's brand blue — NOT #1A73E8 sprinkled in components)
    -> Tokens are the ONLY styling source components read; raw hardcoded brand values are a finding
      -> Kit change → token update → propagates everywhere the token is used (one path)
        -> Token change traces to the kit amendment (provenance); drift (UI value not from a token) is flagged
```

## Instructions

1. **The brand kit is the source of truth.** atlas owns it; mia consumes it. mia does not invent brand values or "adjust" them in code — a value that should change is a kit conversation with atlas, then a token update. This is the bridge's direction: kit → tokens → UI, never UI → improvised brand.
2. **Semantic tokens, not raw values.** Tokens name intent (`color.action.primary`, `space.section`, `type.heading.lg`), not raw values, and components reference tokens only. A `#1A73E8` in a component is a finding — it's a brand value that won't follow the kit when it changes.
3. **One change path.** A brand refresh updates the kit → tokens → every consuming component, automatically. No component holds its own copy of a brand value; that's the drift tokens exist to prevent (dev's stack-drift rule, brand edition).
4. **Traceability both ways.** Each token traces to its kit source; a token change traces to the kit amendment that caused it. So "why is the button this blue" has an answer (the kit), and a kit audit can find everywhere a value is used.
5. **Drift is a finding.** A UI value that isn't from a token — a hardcoded color, an off-scale spacing, a one-off font size — is flagged at review (mia's and dev's): either it needs a token (extend the schema) or it's off-brand (fix it). Agent-generated UI code especially tends to hardcode; catch it.
6. **Tokens are theme-able.** The token layer is where theming (light/dark, white-label per business) lives — one token set per theme, same component code. This is also how toongine binds a business's brand at deployment without touching components.

## Output Format

```
## Design Tokens: [scope]
Source: atlas brand kit [ref/version]
Tokens: [semantic name → kit value — colors/type/space/radii/shadow/motion]
Component usage: [tokens only ✓ · hardcoded brand values found: none / list → findings]
Themes: [default / dark / white-label — token sets]
Traceability: [token ↔ kit amendment refs]
```

## Principles

- **The brand kit is the source of truth** — kit → tokens → UI, never improvised brand in code.
- **Semantic tokens, not raw values** — components reference intent; a hex in a component is a finding.
- **One change path** — a kit refresh propagates through tokens; no component holds its own copy.
- **Traceable both ways** — token ↔ kit amendment; "why this blue" has an answer.
- **Drift is a finding** — non-token UI values get flagged (agent code hardcodes; catch it).
- **Tokens carry themes** — light/dark/white-label + toongine's per-business brand binding.

## Fallback

- No brand kit yet (early business) → mia defines provisional tokens with placeholder values, clearly labeled, and flags that atlas's kit is the pending source of truth; the token STRUCTURE is right even before the values are final.
- Kit and code disagree → the kit wins (it's the source of truth); reconcile toward it and flag how the drift happened.
- One-off value genuinely needed (not brand) → it's a local style, not a brand token; keep it out of the token namespace so the brand layer stays clean.

## Boundaries with Other Skills

- **atlas (Brand Studio)**: owns the brand kit — the source of truth this bridges; token changes trace to kit amendments. The cross-department seam the plan names.
- **ui-accessibility-standards** (sibling): consumes tokens for consistent, accessible components.
- **frontend-performance** (sibling): token-driven theming shouldn't bloat the bundle (one token layer, not duplicated styles).
- **pixel (Brand Studio)**: production visual assets align to the same kit.
- **dev/stack-profile**: the CSS/token tooling (Style Dictionary, CSS vars, etc.) is named there; drift is dev's finding-rule applied to brand values.
