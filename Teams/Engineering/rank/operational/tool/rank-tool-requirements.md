---
name: rank-tool-requirements
type: operational/tool
status: specifies needs, does not grant them — grants happen at deployment via config/connectors
assigned_agent: rank (Engineering / Technical SEO)
date_added: 2026-07-09
---

## Purpose

What rank needs, and what happens without each. Every external tool call is plan-locked (Rail 1) and sandboxed (Rail 2); rank runs no data changes (Rail 3) and edits no production directly.

## Requirements

| Need | Tool / access | Used by | Without it |
|---|---|---|---|
| claude-seo plugin | AgriciDaniel/claude-seo (MIT) — runtime install, proposed connector §5 | claude-seo-integration | Method-only SEO (siblings), labeled reduced-automation |
| Site read access (crawl the site, read robots/sitemap) | HTTP read of the site | technical-seo-execution, structured-data-geo | Can't audit; escalate |
| Google SEO APIs (optional) | GSC / PageSpeed / CrUX / Indexing / GA4 creds | claude-seo-integration (seo-google) | Free/estimated data only, labeled |
| Plugin extensions (optional) | Firecrawl, DataForSEO, image-gen (separate installers) | claude-seo-integration | Core plugin only |
| Schema validation | Schema.org / Google structured-data tooling | structured-data-geo | Manual validation, labeled |

## Explicit non-needs / prohibitions (by design)

- **No direct production edits** — rank diagnoses and specs; mia/raj implement through dev review + quinn's gate. The plugin analyzes/generates; it never auto-applies to the live site.
- **No SEO strategy or business-facing measurement ownership** — that's kai (boundary skill).
- **No data change execution** (Rail 3).
- **No shipping the plugin's community-promo footer** to operator output.

## Notes

- The claude-seo plugin is treated as a dated tool (its SEO facts — INP, schema deprecations — have dates); verify high-stakes facts against current Google guidance (ops's volatility-split discipline).
- Plugin + Google API creds are proposed connectors surfaced to the operator at deployment (plan §5).

## MCP Marketplace Tools (added 2026-07-14)

rank is the department's heaviest consumer of web-scraping and analysis tools. The SEO domain demands competitive intelligence, SERP monitoring, and content extraction that cannot be done without accessing live web content.

| Tool | Source | Purpose | Always-on |
|------|--------|---------|-----------|
| **Firecrawl MCP** | [github.com/mcp/firecrawl](https://github.com/mcp/firecrawl/firecrawl-mcp-server) | Primary SEO reconnaissance: scrape competitor pages, search for SERP features, map competitor site structure (sitemap + URL discovery), structured data extraction (Schema.org validation), deep_research for competitive landscape analysis. 10+ tools. Free tier available. | ⚠️ On-demand — core tool for technical-seo-execution and structured-data-geo |
| **Crawl4AI** | [github.com/unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) — Apache 2.0 | Content inventory: deep-crawl competitor sites → clean Markdown → content analysis. BFS/DFS strategies for site structure mapping. No API keys needed. | ❌ No — Python tool; use for content audits and site structure analysis |
| **Scrapling** | [github.com/D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) — BSD 3-Clause | Competitor sites with anti-bot protection: bypass Cloudflare Turnstile when competitor sites block standard crawlers. Adaptive element relocator handles site structure changes between crawls. Spider API for continuous monitoring. | ❌ No — escalate only when Firecrawl or Crawl4AI are blocked |
| **Website Cloner** | [github.com/horuz-ai/claude-plugins](https://github.com/horuz-ai/claude-plugins) (website-cloner SKILL) | SERP layout analysis: clone competitor landing pages to test SEO structure, meta tag extraction, heading hierarchy analysis. Pixel-perfect clone for competitive page structure comparison. | ❌ No — expensive pipeline; use /clone-website for targeted competitor analysis |

**Tool selection logic (rank-specific):**
1. Standard competitor page scraping → Firecrawl scrape
2. Full site structure mapping → Crawl4AI deep-crawl or Firecrawl map
3. Competitor blocks crawlers → Scrapling (stealth mode)
4. Visual SERP/landing page analysis → Website Cloner

See Engineering/MCP-MARKETPLACE.md for full setup instructions and the department-wide tool catalog.
