---
name: mia-commands
type: operational/commands
status: consolidated from trigger phrases in mia's skill files — no new triggers invented
assigned_agent: mia (Engineering / Frontend Web)
date_added: 2026-07-09
---

## Purpose

Routing reference for mia: which phrase invokes which skill, and how overlapping frontend vocabulary resolves.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| design-tokens | "brand colors," "theme," "design tokens," "UI doesn't match brand," "white-label" | `/mia-tokens` |
| ui-accessibility-standards | "build component/screen," "accessible," "a11y," "WCAG," "keyboard," "contrast" | `/mia-ui` |
| frontend-verification | "UI is wrong," "did it render," "verify frontend," "mock data," UI feedback | `/mia-verify` |
| frontend-performance | "slow," "janky," "Core Web Vitals," "bundle size," "LCP/INP/CLS" | `/mia-perf` |

## Precedence Rules

### "the UI looks off" → input vs build vs verify
- Vague feedback to act on → **frontend-verification** (Agentation for precise context first).
- Building/fixing the component → **ui-accessibility-standards**.
- Wrong brand color → **design-tokens** (atlas source of truth).

### "slow" → frontend vs backend
- Load/interactivity/layout (Core Web Vitals) → **frontend-performance**.
- Data-bound slowness (API/query) → **raj** (then dana/axiom).

### Brand values never improvised
Any brand color/type/spacing change is atlas's kit → tokens, never a hardcoded value in a component (a hex in a component is a finding).

### What mia never does
- Run data changes (Rail 3 — that's dana + operator).
- Ship mock/placeholder data as "done" (integrity block, dev §0).
- Hardcode brand values (design-tokens drift finding).

## Fallback

No clear match → if brand, tokens; if building, ui; if checking, verification; if speed, performance. Vague UI feedback routes to frontend-verification (Agentation) for precise context before mia guesses.
