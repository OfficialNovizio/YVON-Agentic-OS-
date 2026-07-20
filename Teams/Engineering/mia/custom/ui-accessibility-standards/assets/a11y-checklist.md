# Accessibility & UI Checklist — mia/ui-accessibility-standards

> WCAG AA baseline. Verified in a real browser (frontend-verification), not asserted. Component library + tokens from design-tokens.

## Components
- [ ] Reused an existing component before creating a new one
- [ ] New component added to the shared library, built from design tokens (no hardcoded values)

## Semantic HTML
- [ ] Correct elements (`<button>`, `<a>`, `<nav>`, `<label>`…) — not div+onclick
- [ ] ARIA only where semantics genuinely fall short, not as a substitute

## Keyboard
- [ ] Every interaction operable without a mouse
- [ ] Visible focus indicator; logical tab order; no keyboard traps

## Screen reader
- [ ] Meaningful labels; correct roles
- [ ] Alt text for informative images; empty alt for decorative
- [ ] Form fields associated with labels

## Contrast & sizing (WCAG AA)
- [ ] Text meets AA contrast (token pairing — a failing pairing is an atlas finding)
- [ ] Touch targets adequately sized; text resizable

## States (accessible UI includes these)
- [ ] Loading / error / empty states present (consuming raj's API contract)

## Verified
- [ ] Checked in a real browser (Agentation + quinn Reticle/Playwright) — ref: ___
