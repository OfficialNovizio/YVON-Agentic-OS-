# PRODUCT.md — YVON Master Control Plane (dashboard)

**Register:** product (app UI / dashboard — design SERVES the product, not the product itself)
**Platform:** web (Next.js 14, App Router, Tailwind)
**Audience:** operators of the YVON agent fleet — internal, technical, high-frequency use.
**Job:** monitor and drive 46 agents across 7 departments — brands, agents, pipeline monitor, analytics, task dispatch.
**Voice:** precise, dense, calm. Control-plane, not marketing. Information-first.
**Anti-references:** generic SaaS starter dashboards; purple→blue gradients; card-in-card nesting; decorative gradient text.

> Seeded 2026-07-20 from the existing dashboard by atlas + mia. `<FILL_IN>` fields need an operator decision.

## Brand / product lane
Internal tool. Identity is inherited from the YVON control-plane aesthetic already in code (dark slate sidebar, amber accent, emerald for healthy/pass states).

## Known design debt (from `impeccable detect`, 2026-07-20)
- Body font is Inter — an overused-font tell. Replacement: `<FILL_IN>` (atlas to choose a distinctive face).
- Gradient text on the sidebar wordmark — decorative AI tell, to be flattened to solid.
- Two gray-on-colored-background instances (add-brand, tasks) to fix.
