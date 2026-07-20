# Technical SEO Checklist — rank/technical-seo-execution

> rank diagnoses and specs; builders (mia/raj) implement through dev review + quinn gate. The claude-seo plugin deepens this when installed. SEO facts are dated (treat as a playbook) — verify high-stakes items against current Google guidance.

## Crawlability
- [ ] robots.txt correct — no accidental blocks of important paths
- [ ] Important content reachable via internal links
- [ ] Crawl budget not wasted (faceted/infinite URL spaces controlled)

## Indexability
- [ ] Correct canonical on every page (self or intended master)
- [ ] No accidental noindex on pages that should rank (verify — staging noindex shipped live is the classic disaster)
- [ ] Actual indexation status checked, not assumed

## Sitemaps
- [ ] XML sitemap lists only indexable URLs (no redirects/noindex/404s)
- [ ] Submitted; matches indexable reality

## Status codes & redirects
- [ ] 200 live · 301 permanent · 404/410 gone — correct
- [ ] No redirect chains or loops
- [ ] Soft-404s fixed (no 200 on not-found)

## Rendering (mia seam)
- [ ] Content visible to crawlers (SSR/prerender/hydration) — not an empty JS shell
- [ ] Structured data present in rendered output (→ structured-data-geo)

## Mobile & Core Web Vitals (shared with mia)
- [ ] Mobile-first ready
- [ ] Core Web Vitals: LCP · INP (not FID) · CLS — issues → mia (shared signal)

## Path
- [ ] Findings routed: mia (frontend) / raj (server) · dev review · quinn gate
- [ ] High-risk change (robots/noindex/canonical) flagged as regression-map candidate
