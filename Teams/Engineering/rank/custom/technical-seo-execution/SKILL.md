---
name: technical-seo-execution
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; plan §3 rank owns "technical execution"
marketplace_search: 2026-07-09 — the claude-seo plugin (wrapped in the sibling skill) covers this deeply; this skill is rank's own method so it works WITHOUT the plugin and defines what rank owns vs kai; kept custom
assigned_agent: rank (Engineering / Technical SEO)
portable: true — the technical fundamentals are site-agnostic; framework/host specifics come from the stack-profile
includes: assets/technical-seo-checklist.md
date_added: 2026-07-09
---

## Introduction

technical-seo-execution is rank's core craft: making a site crawlable, indexable, and technically sound so search engines (and AI answer engines) can find, render, and understand it. Crawl directives, canonicalization, sitemaps, redirects, status codes, rendering, mobile, and Core Web Vitals — the mechanical foundation under all SEO. rank owns this execution; kai owns whether it's the right strategy.

## Purpose

The best content ranks nowhere if search engines can't crawl it, index the wrong version, or hit a wall of 404s and redirect chains. Technical SEO is the plumbing — invisible when it works, catastrophic when it doesn't (a `noindex` shipped to production tanks a whole site). rank keeps the plumbing sound so kai's strategy and lena's content can actually rank.

## When to Use

Triggers: "technical SEO," "why isn't this indexed," "crawlability," "canonical," "sitemap," "robots.txt," "redirect," "status codes," "rendering / JS SEO," "mobile SEO," and any technical ranking-foundation issue.

## Structure / Protocol

```
A technical SEO task
  -> CRAWLABILITY: robots.txt correct · no accidental blocks · crawl budget sane · internal linking
  -> INDEXABILITY: canonical tags · no accidental noindex · correct indexation status
  -> SITEMAPS: accurate XML sitemap · submitted · matches indexable reality
  -> STATUS & REDIRECTS: right codes (200/301/404/410) · no redirect chains/loops · fix soft-404s
  -> RENDERING: content renders for crawlers (JS/SSR) — the mia/frontend seam
  -> MOBILE + CWV: mobile-first ready · Core Web Vitals (INP) — shared signal with mia
    -> Findings → implementation via mia (frontend) / raj (server) → dev review → quinn gate
       (rank diagnoses + specs the fix; it doesn't silently edit production)
```

## Instructions

1. **Crawlability before anything.** Confirm robots.txt doesn't accidentally block important paths, internal linking lets crawlers reach content, and crawl budget isn't wasted on junk (faceted URLs, infinite spaces). A blocked path is invisible regardless of quality.
2. **Indexability and the canonical.** Every page has a correct canonical (self or the intended master); no accidental `noindex` on pages that should rank (the classic catastrophe — a staging `noindex` shipped live). Verify actual indexation status, don't assume.
3. **Accurate sitemaps.** The XML sitemap lists indexable URLs (not redirects, not noindexed, not 404s), is submitted, and matches reality — a sitemap full of dead URLs erodes trust with crawlers.
4. **Correct status codes, clean redirects.** 200 for live, 301 for permanent moves, 404/410 for gone; no redirect chains (301→301→301) or loops; fix soft-404s (200 on a "not found" page). These waste crawl budget and confuse indexing.
5. **Rendering — the frontend seam.** Content must be present for crawlers; a client-rendered SPA that shows crawlers an empty shell doesn't rank (the same JS-rendering issue that trips up naive scraping). This is the mia seam — SSR/prerendering/hydration is a joint fix, and rank specs the SEO requirement.
6. **Mobile-first and Core Web Vitals.** The site is judged mobile-first; Core Web Vitals (INP for interactivity, not the retired FID) are a ranking signal shared with mia — rank owns the SEO framing and measurement-of-record with kai, mia owns making them good. rank diagnoses and specs; the builders implement through the normal gate.

## Output Format

```
## Technical SEO: [site/page]
Crawlability: [robots ✓ · reachable ✓ · crawl budget] · Indexability: [canonical ✓ · no stray noindex ✓ · status]
Sitemap: [accurate + submitted ✓] · Status/redirects: [codes ✓ · no chains/loops · soft-404s fixed]
Rendering: [content visible to crawlers ✓ / SSR gap → mia] · Mobile + CWV (INP): [ready / issues → mia]
Findings → implementation: [mia / raj · dev review · quinn gate] (rank specs, doesn't auto-edit)
```

## Principles

- **Crawlability first** — a blocked path is invisible regardless of quality.
- **Guard the canonical and noindex** — a stray noindex tanks a site; verify indexation, don't assume.
- **Sitemaps match indexable reality** — dead-URL sitemaps erode crawler trust.
- **Clean status codes and redirects** — no chains, loops, or soft-404s wasting crawl budget.
- **Rendering is the frontend seam** — crawlers must see content; SSR is a joint mia fix.
- **rank specs, builders implement** — no silent production edits; through review + gate.

## Fallback

- No plugin (claude-seo absent) → this method carries technical SEO fully, labeled reduced-automation; the plugin deepens it when present.
- Rendering/SSR gap needs a framework change → spec the SEO requirement, hand to mia/dev as an architecture question (it may be an ADR).
- Conflicting canonical/strategy signals → confirm the intended master with kai (strategy owner) before setting canonicals.

## Boundaries with Other Skills

- **kai (Brand Studio)**: strategy + measurement; rank executes the technical foundation (seo-ownership-boundary).
- **claude-seo-integration** (sibling): the plugin deepens this; this is rank's method with or without it.
- **structured-data-geo** (sibling): schema + AI-search readiness build on this foundation.
- **mia**: rendering/SSR and Core Web Vitals are joint (shared signal); rank specs the SEO need, mia implements.
- **raj**: server-side redirects, status codes, headers, SSR infrastructure.
- **dev/quinn**: technical SEO changes pass review and the gate; a noindex/robots change is high-risk (a fragile-area regression-map candidate).
