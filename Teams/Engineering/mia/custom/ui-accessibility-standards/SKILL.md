---
name: ui-accessibility-standards
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: plan §3 "ui-standards + accessibility M (ui-ux-pro-max candidate)" — searched, kept custom (below)
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — UI/UX skills found (ui-ux-pro-max noted as a candidate in the plan) are framework component libraries; the standards+a11y discipline is kept custom, bound to design-tokens and WCAG. WCAG is the sourced accessibility standard
assigned_agent: mia (Engineering / Frontend Web)
portable: true — the standards are framework-agnostic; the component library comes from the stack-profile
includes: assets/a11y-checklist.md
date_added: 2026-07-09
---

## Introduction

ui-accessibility-standards is how mia builds interfaces that are consistent, usable, and accessible: components built from design tokens, semantic HTML, keyboard operability, and WCAG-conformant contrast/labels/focus — so the product works for everyone and looks like one product, not a patchwork. Accessibility is not a later pass; it's how components are built.

## Purpose

Two failure modes this prevents: inconsistency (every screen a slightly different button, spacing, interaction) and inaccessibility (unusable by keyboard, invisible to screen readers, failing contrast — excluding users and, increasingly, failing legal requirements). Both come from building screens ad hoc instead of from a component system with accessibility baked in.

## When to Use

Triggers: "build this component/screen," "is this accessible," "a11y," "WCAG," "keyboard navigation," "contrast," "the UI is inconsistent," and any user-facing interface work.

## Structure / Protocol

```
A UI to build
  -> COMPONENTS from the system: reuse before creating; new components enter the library, tokens-based
  -> SEMANTIC HTML: the right element (button is a <button>), not a div with a click handler
  -> KEYBOARD: everything operable without a mouse; visible focus; logical tab order
  -> SCREEN READERS: labels, roles, alt text, ARIA only where semantics fall short
  -> CONTRAST + sizing: WCAG AA minimum (tokens should already encode compliant colors)
    -> Verify in a real browser (frontend-verification: Agentation + quinn's Reticle/Playwright)
```

## Instructions

1. **Build from the component system.** Reuse an existing component before creating one; a genuinely new component enters the shared library, built from design tokens. Ad hoc one-off components are how consistency dies (and how agent-generated UI sprawls — dev's integrity concern).
2. **Semantic HTML first.** The correct element carries accessibility for free — a `<button>` is focusable, keyboard-activatable, and announced as a button; a `<div onclick>` is none of those and has to reimplement all of it (usually incompletely). ARIA is a patch for where semantics genuinely fall short, not a substitute for them.
3. **Keyboard-operable, always.** Every interaction works without a mouse: focusable controls, visible focus indicators, logical tab order, no keyboard traps. This is both an accessibility requirement and a correctness one (many bugs hide in mouse-only paths).
4. **Screen-reader support.** Meaningful labels, correct roles, alt text for informative images (empty alt for decorative), form fields associated with labels. Test with the accessibility tree, not just the visual.
5. **WCAG AA contrast and sizing.** Text meets AA contrast (design-tokens should already encode compliant color pairings — if a token pairing fails contrast, that's a kit/token finding for atlas). Touch targets adequately sized; text resizable.
6. **Verify in a real browser.** Accessibility and consistency claims are checked with real rendering (frontend-verification's Agentation loop + quinn's Reticle/Playwright), not asserted — "it's accessible" without a check is the "agents say done" problem, a11y edition.

## Output Format

```
## UI: [component/screen]
Components: [reused / new → library, tokens-based] · Semantic HTML: [correct elements ✓]
Keyboard: [operable ✓ · visible focus ✓ · logical order ✓] · Screen reader: [labels/roles/alt ✓]
Contrast/sizing: [WCAG AA ✓ / token pairing fails → atlas finding]
Verified in browser: [frontend-verification ref]
```

## Principles

- **Build from the component system** — reuse first; new components join the library, tokens-based.
- **Semantic HTML first** — the right element gives accessibility for free; ARIA patches, never substitutes.
- **Keyboard-operable always** — no mouse-only paths; visible focus; no traps.
- **Screen-reader support is built in** — labels, roles, alt; test the accessibility tree.
- **WCAG AA contrast/sizing** — token pairings encode it; a failing pairing is an atlas finding.
- **Verified in a real browser** — accessibility is checked, not claimed.

## Fallback

- No component library yet → start one with the first components (tokens-based, accessible); don't build screens of one-offs that a library later has to reconcile.
- Component library from the stack lacks accessibility → wrap/fix at adoption and flag upstream; don't inherit inaccessibility silently.
- Design mockup fails contrast → flag to atlas (the token/kit source), don't ship the failing pairing to "match the design"; the design has the bug.

## Boundaries with Other Skills

- **design-tokens** (sibling): components are built from tokens; contrast compliance lives in the token pairings (atlas).
- **frontend-verification** (sibling): the real-browser check for accessibility and consistency (Agentation + Reticle/Playwright).
- **frontend-performance** (sibling): accessible and fast aren't in tension; both are how the UI is built.
- **atlas / lena (Brand Studio)**: visual and voice consistency; a contrast-failing brand pairing is atlas's to resolve.
- **raj**: components consume raj's API contracts; loading/error/empty states are part of accessible UI.
- **quinn**: browser-verified accessibility is gate evidence.
