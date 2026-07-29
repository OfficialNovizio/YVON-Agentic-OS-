# DESIGN.md — YVON dashboard design system

> Extracted from the existing dashboard (the tokens actually in use), not invented.
> This is the source of truth `impeccable detect --no-design-system=false` reads.
> Owned by **atlas** (tokens) with **mia** (implementation). Update via the change rail, not ad hoc.

## Register
product — app UI. Design serves the task; clarity and density beat decoration.

## Color (Tailwind scale, in-use)
- **Ink / structure:** slate-900 (sidebar bg, headings), slate-800 (borders on dark), slate-700/600/500 (body, secondary).
- **Surface:** slate-50 (app bg), white (cards), slate-200/100 (card borders, dividers).
- **Accent:** amber-400 (primary — active nav, highlights), amber-600 (accent text on light).
- **Status:** emerald-400/600 (healthy, passing, success).
- **Rule:** no gray text on colored backgrounds — use a darker shade of the background hue or near-white. (Two current violations flagged for fix.)

## Typography
- Current: Inter — **flagged as overused**; atlas to select a distinctive replacement (`<FILL_IN>`).
- Weights in use: 400–900. Headings extrabold/black, body medium.
- Body line length cap: 65–75ch.

## Components
- Cards: white on slate-50, `border border-slate-200 rounded-xl`. **No card-in-card nesting.**
- Sidebar: fixed dark slate, amber active state with 3px left border.
- Metric cards, tables: dense, small type (11–13px), uppercase micro-labels with tracking.

## Motion
- Subtle transitions only (`transition-colors`, `transition-all`). No bounce/elastic easing.

## Anti-patterns (enforced by `impeccable detect` in CI)
Overused fonts · gray-on-color text · gradient text · card nesting · pure black/gray (always tint) · decorative-only effects.
