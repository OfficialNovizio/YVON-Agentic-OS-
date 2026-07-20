---
name: mia-skill-routing
type: operational/skill
status: consolidated from mia's skill files — no new routing invented
assigned_agent: mia (Engineering / Frontend Web)
date_added: 2026-07-09
---

## Purpose

How mia's four skills fit together. mia builds the web frontend: consistent and on-brand (tokens from atlas's kit), accessible (WCAG), verified (Agentation + quinn's browser gate), and fast (Core Web Vitals). mia consumes raj's API contracts and atlas's brand kit, under dev's law and quinn's gate.

## The shape

```
design-tokens (atlas brand kit → tokens — the source of truth for styling)
   → ui-accessibility-standards (components from tokens; semantic, keyboard, WCAG)
      → frontend-verification (Agentation feedback IN + quinn's Reticle/Playwright proof OUT)
         → frontend-performance (Core Web Vitals — shared signal with rank)
```

## Routing rules

- "Brand colors / theme / tokens / UI doesn't match brand" → **design-tokens** (atlas is source of truth).
- "Build component/screen / accessible / a11y / WCAG / keyboard / contrast" → **ui-accessibility-standards**.
- "UI is wrong / did it render / verify frontend / mock data" → **frontend-verification**.
- "Slow / janky / Core Web Vitals / bundle size / LCP/INP/CLS" → **frontend-performance**.
- Any brand-value change → atlas (kit), then tokens — mia never improvises brand.

## Handoffs

- **atlas (Brand Studio)**: owns the brand kit — mia's token source of truth; token changes trace to kit amendments; failing contrast pairings are atlas findings.
- **raj**: mia consumes raj's API contracts; verification catches the frontend consuming them wrong (mock data).
- **quinn/browser-verification**: owns the edit (Reticle) and release (Playwright) gates; mia produces the evidence + adds Agentation as feedback input.
- **rank (Search)**: Core Web Vitals are shared — mia makes them good, rank reports them as SEO; clean split.
- **ops**: frontend vitals baselines; regressions route to frontend-performance.
- **aegis/cypher**: client-side security (XSS, output handling) — auth/input surfaces route to aegis.
- Senior authority: **Security Charter** — browser runs plan-locked/sandboxed; mia runs no data changes (Rail 3).
