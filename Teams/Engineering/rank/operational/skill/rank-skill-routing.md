---
name: rank-skill-routing
type: operational/skill
status: consolidated from rank's skill files — no new routing invented
assigned_agent: rank (Engineering / Technical SEO)
date_added: 2026-07-09
---

## Purpose

How rank's four skills fit together. rank owns the **technical execution** of SEO — crawlability, indexability, schema, GEO markup, rendering — driving the claude-seo plugin where useful. It does NOT own SEO strategy or measurement; that's kai (Brand Studio). The boundary is checked at every task intake.

## The shape

```
seo-ownership-boundary (FIRST — is this rank's or kai's?)
   │ rank's (technical execution)
   ▼
technical-seo-execution (crawl/index/canonical/sitemap/redirects/rendering — the foundation)
   ├─ structured-data-geo (schema + AI-search citability — machine-understanding)
   └─ claude-seo-integration (the plugin — deepens both; runtime-installed)
        │
findings → mia (frontend) / raj (server) → dev review → quinn gate (rank specs, doesn't auto-edit)
```

## Routing rules

- Any SEO task → **seo-ownership-boundary** first (rank vs kai). Strategy → hand to kai with a brief.
- "Crawl / index / canonical / sitemap / redirect / rendering" → **technical-seo-execution**.
- "Schema / structured data / GEO / AI Overviews / citability" → **structured-data-geo**.
- "Run the SEO tools / full audit / plugin command" → **claude-seo-integration**.
- Core Web Vitals → shared: mia builds, rank frames technically, kai measures (boundary skill names the split).

## Handoffs

- **kai (Brand Studio)**: owns SEO strategy + measurement (scorecard §6); rank owns technical execution — the clean split the plan mandates (§6, no double-ownership).
- **mia**: implements frontend SEO fixes (schema markup, rendering/SSR, Core Web Vitals — shared signal).
- **raj**: server-side (redirects, status codes, headers, SSR infrastructure).
- **lena (Brand Studio)**: the citable content substance behind GEO; rank owns markup only.
- **dev/quinn**: SEO changes pass review + gate; robots/noindex/canonical changes are high-risk (regression-map candidates); the plugin never auto-edits production.
- **ops**: the claude-seo plugin is treated as a dated tool (SEO facts have dates — volatility split).
- Senior authority: **Security Charter** — plugin runs plan-locked/sandboxed; rank runs no data changes and edits no production directly.
