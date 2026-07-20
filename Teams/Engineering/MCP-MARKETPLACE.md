---
name: engineering-mcp-marketplace
type: department/mcp-reference
status: 7 MCP tools mapped to 9 of 11 agents (2026-07-14)
department: Engineering
---

## Purpose

Reference for every MCP marketplace tool integrated into the Engineering department. Each tool entry includes: what it does, which agents use it, setup requirements, and the integration rationale. All tools run under the Security Charter (Rail 1 plan-lock, Rail 2 sandbox+egress).

---

## Tool Inventory

### 1. Ponytail — Minimal Code Generation

| Detail | Value |
|--------|-------|
| **Source** | [github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) |
| **License** | MIT |
| **What it does** | Forces AI coding agents to write the absolute minimum code needed. Climb a decision ladder (YAGNI → reuse → stdlib → platform → deps → one-liner → only then code) before generating anything. |
| **Measured impact** | 54% less code, 20% cheaper, 27% faster, 100% safety |
| **Key commands** | /ponytail lite\|full\|ultra\|off, /ponytail-review, /ponytail-audit, /ponytail-debt |
| **Assigned agents** | dev, axiom |
| **Why these agents** | dev's principle "boring beats novel" directly aligns with ponytail's philosophy. axiom's algorithm design needs to avoid over-engineering — ponytail ensures "use stdlib sort" beats "implement custom quicksort." |
| **Always-on** | ✅ Yes — ponytail runs on every code review and code generation pass |
| **Setup** | Install as Claude Code plugin: `npx ponytail` or add to .claude/skills/ |

### 2. Browserbase MCP — Cloud Browser Automation

| Detail | Value |
|--------|-------|
| **Source** | [docs.browserbase.com/integrations/mcp](https://docs.browserbase.com/integrations/mcp) |
| **License** | Browserbase Cloud (free tier available) |
| **What it does** | Gives AI agents a real cloud-hosted browser they can control via natural language. 6 tools: start, navigate, act, observe, extract, end. Session recording, replay, screenshots, JS execution. |
| **Assigned agents** | mia, nova, cypher, aegis, quinn |
| **What each uses it for** | mia — visual regression testing, cross-browser UI verification. nova — mobile web testing, app store screenshot automation. cypher — attack surface reconnaissance, browser-based attack simulation. aegis — security surface testing: CSP, CORS, cookie flags. quinn — end-to-end test execution, visual comparison in QA pipeline |
| **Always-on** | ⚠️ On-demand — expensive to run continuous browser sessions; activate during QA/security/testing phases |
| **Setup** | MCP server: `@browserbasehq/mcp` (npm). Requires Browserbase API key. |

### 3. Firecrawl MCP — Web Scraping & Search

| Detail | Value |
|--------|-------|
| **Source** | [github.com/mcp/firecrawl](https://github.com/mcp/firecrawl/firecrawl-mcp-server) |
| **License** | Free tier available (rate-limited); API key for full access |
| **What it does** | 10+ MCP tools: scrape (single page), search (web-wide), map (discover URLs), crawl (batch), extract (structured JSON), agent (multi-source research), interact (browser automation), deep_research, parse (PDFs), generate_llmstxt |
| **Assigned agents** | rank, cypher, dana |
| **What each uses it for** | rank — competitor SEO analysis, SERP monitoring, structured data extraction from target sites. cypher — open-source intelligence, attack surface discovery, technology fingerprinting. dana — data ingestion pipeline, competitor data extraction, structured web data for RAG |
| **Always-on** | ⚠️ On-demand — free tier rate-limited; activate during research/intelligence phases |
| **Setup** | Remote: `https://mcp.firecrawl.dev/v2/mcp` (free tier) or with API key. Local: `npx -y firecrawl-mcp` |

### 4. Website Cloner — Multi-Agent Site Reconstruction

| Detail | Value |
|--------|-------|
| **Source** | [github.com/horuz-ai/claude-plugins](https://github.com/horuz-ai/claude-plugins) (website-cloner SKILL) |
| **License** | Skill plugin (varies) |
| **What it does** | 4-agent cloning pipeline: screenshotter → extractor → cloner → QA reviewer. Produces React+Tailwind component from any URL with pixel-perfect fidelity. Iterative QA loop up to 5 cycles. |
| **Assigned agents** | mia, rank |
| **What each uses it for** | mia — competitive design analysis, rapid prototyping from reference sites, design system extraction. rank — competitor page structure analysis, SERP layout cloning for testing, landing page A/B variant generation |
| **Always-on** | ❌ No — expensive multi-agent pipeline; use explicitly via /clone-website command |
| **Setup** | Requires: Playwright MCP configured, 4 sub-agents created in Claude Code, slash command copied to .claude/commands/ |

### 5. Crawl4AI — LLM-Friendly Web Crawler

| Detail | Value |
|--------|-------|
| **Source** | [github.com/unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) |
| **License** | Apache 2.0 (open source) |
| **What it does** | Converts any web page to clean, LLM-ready Markdown. Async crawling, multi-browser (Chromium/Firefox/WebKit), structured extraction via LLM, stealth mode, BFS/DFS deep crawling, caching. |
| **Assigned agents** | dana, rank |
| **What each uses it for** | dana — RAG pipeline ingestion: crawl documentation sites → clean Markdown → vector DB. rank — crawl competitor sites for content analysis, generate clean content inventories |
| **Always-on** | ❌ No — Python library, not an MCP server. Use via `crwl` CLI or import as Python module in data pipelines |
| **Setup** | `pip install crawl4ai` or Docker: `docker pull unclecode/crawl4ai` |

### 6. Scrapling — Adaptive Scraping with Anti-Bot

| Detail | Value |
|--------|-------|
| **Source** | [github.com/D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) |
| **License** | BSD 3-Clause |
| **What it does** | Adaptive scraping framework: auto-relocates elements when site structure changes, bypasses Cloudflare Turnstile, Spider API (like Scrapy), stealth/dynamic/HTTP fetcher modes, pause/resume crawling, proxy rotation, built-in MCP server. 68k+ stars. |
| **Assigned agents** | cypher, rank, dana |
| **What each uses it for** | cypher — reconnaissance against protected targets, Cloudflare-protected site analysis. rank — competitive SEO crawling where sites block standard crawlers. dana — data extraction from modern JS-heavy sites that need browser rendering |
| **Always-on** | ❌ No — Python library + MCP server. Use via Python import or `scrapling` CLI |
| **Setup** | `pip install scrapling[all]` or Docker. MCP server mode: `scrapling mcp` |

### 7. awesome-design-md — AI-Ready Design Systems

| Detail | Value |
|--------|-------|
| **Source** | [github.com/VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) |
| **License** | MIT |
| **What it does** | Curated collection of 70+ DESIGN.md files extracted from real-world brand design systems (Apple, Stripe, Linear, Vercel, Nike, SpaceX, etc.). Each DESIGN.md contains: color palette, typography, spacing, components, layout rules. |
| **Assigned agents** | mia |
| **What it uses it for** | UI generation with brand-consistent design tokens. When building a new UI component, mia references relevant DESIGN.md files to ensure visual coherence — not generic AI-looking output. Also bridges with Brand Studio/atlas. |
| **Always-on** | ⚠️ Reference — mia pulls DESIGN.md when building UI, not a runtime tool |
| **Setup** | Copy relevant DESIGN.md into project root. Reference: `@./DESIGN.md` in agent prompt |

---

## Agent Coverage Map

| Agent | Tools | Primary Use |
|-------|-------|-------------|
| **dev** | Ponytail | Code review over-engineering detection, minimal-code principle enforcement |
| **ops** | — | (No MCP tools assigned — ops monitors tools, doesn't run them in prod) |
| **cypher** | Browserbase, Firecrawl, Scrapling | Reconnaissance, attack surface discovery, stealth scraping |
| **aegis** | Browserbase | Security surface testing (CSP, CORS, cookies), visual regression |
| **axiom** | Ponytail | Algorithm simplicity enforcement, "use stdlib first" before custom implementation |
| **rank** | Firecrawl, Crawl4AI, Scrapling, Website Cloner | SEO competitive analysis, content extraction, SERP monitoring |
| **quinn** | Browserbase | Browser-based E2E testing, visual regression, screenshot comparison |
| **dana** | Firecrawl, Crawl4AI, Scrapling | Data ingestion pipelines, RAG content extraction, structured web data |
| **raj** | — | (No MCP tools — API design doesn't need web scraping/browser automation) |
| **mia** | Browserbase, Website Cloner, awesome-design-md | UI testing, design extraction, brand-consistent UI generation |
| **nova** | Browserbase | Mobile web testing via cloud browsers, app store screenshot automation |

---

## Setup Priority

| Priority | Tool | Reason |
|----------|------|--------|
| **P0** | Ponytail | Zero setup cost (skill install), directly impacts code quality for 2 core agents (dev, axiom). 54% less code immediately. |
| **P1** | Firecrawl MCP | Free tier available, covers rank+cypher+dana. Single most-used scraping tool across agents. |
| **P1** | Browserbase MCP | Used by 5 agents across testing, security, and QA. Cloud browser is the foundation for multiple workflows. |
| **P2** | Crawl4AI | Open source, no API keys. Complements Firecrawl for dana/rank RAG pipelines. |
| **P2** | awesome-design-md | Zero setup (copy DESIGN.md). Immediately improves mia's UI output quality. |
| **P3** | Scrapling | Advanced tool — only needed when sites block standard scrapers. Firecrawl covers most use cases first. |
| **P3** | Website Cloner | Complex multi-agent pipeline. High value for mia/rank but requires Playwright MCP + 4 sub-agents setup. |
