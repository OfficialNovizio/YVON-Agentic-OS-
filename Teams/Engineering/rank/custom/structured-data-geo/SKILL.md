---
name: structured-data-geo
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; the schema + AI-search-optimization execution rank owns (plan §3 technical execution)
marketplace_search: 2026-07-09 — claude-seo's /seo schema and /seo geo sub-skills cover this deeply (wrapped in claude-seo-integration); this is rank's own method + the department boundary; kept custom. Schema.org + Google structured-data guidelines are the sourced standards
assigned_agent: rank (Engineering / Technical SEO)
portable: true — schema/GEO are standards-based, site-agnostic
includes: (no asset — method skill; uses the plugin's /seo schema + /seo geo when present)
date_added: 2026-07-09
---

## Introduction

structured-data-geo is rank's execution of two connected things: **structured data** (Schema.org markup that tells search engines what a page's content *means*) and **GEO/AEO** (Generative Engine / Answer Engine Optimization — being citable by AI answer engines like Google AI Overviews, ChatGPT, and Perplexity). Both are about machine-understanding of content, and both are increasingly where visibility is won or lost as search shifts from links to answers.

## Purpose

Search is bifurcating: classic blue links plus AI-generated answers that cite sources. Structured data has always helped search engines understand pages; now it also helps AI engines decide what to cite. A page that's technically perfect but semantically opaque gets neither rich results nor AI citations. rank makes content machine-understandable — the execution layer under kai's strategy about what content should exist.

## When to Use

Triggers: "schema markup," "structured data," "rich results," "GEO," "AI Overviews," "get cited by ChatGPT/Perplexity," "AEO," "llms.txt," and any machine-understanding-of-content task.

## Structure / Protocol

```
A structured-data / GEO task
  -> SCHEMA: the right Schema.org types for the content (Article, Product, Organization, LocalBusiness…)
     validated · rendered in output (technical-seo-execution's rendering seam)
     RESPECT current deprecations: HowTo deprecated (Sept 2023); FAQ rich results gov/health only (Aug 2023)
  -> GEO/AEO: content structured for AI citation — clear answers, extractable facts, entity clarity,
     AI-crawler access (llms.txt, not blocking GPTBot/etc. if citation is wanted), brand-mention signals
    -> Findings → mia (implement in markup) / lena+kai (content that's citable is content strategy)
       rank specs the technical markup; content substance is Brand Studio's
```

## Instructions

1. **Right schema types, validated, rendered.** Match Schema.org types to the actual content (Article, Product, Organization, BreadcrumbList, LocalBusiness…), validate against Google's structured-data requirements, and ensure it's in the *rendered* output (a JS-injected schema a crawler never sees is useless — the rendering seam again).
2. **Respect current deprecations.** SEO facts are dated: HowTo schema is deprecated (Sept 2023); FAQ rich results are restricted to government/health (Aug 2023) — an existing FAQPage on a commercial site may still aid AI citation but isn't a Google rich-result win, and new ones aren't recommended for that purpose. Core Web Vitals use INP. Treat these as dated (verify current guidance for high-stakes decisions).
3. **GEO is machine-answerability.** For AI-engine citation: clear, extractable answers near the top; unambiguous entities and facts; content structured so an AI can lift a citable statement. This is where technical markup meets content — rank owns the markup, Brand Studio (lena/kai) owns the substance.
4. **AI-crawler access is a decision.** Whether to allow AI crawlers (GPTBot, PerplexityBot, Google-Extended) is a business choice with a trade-off: blocked = no AI citation, allowed = content used in answers. Surface it (llms.txt, robots directives); the operator/kai decides, rank implements.
5. **rank specs; others substance-and-implement.** rank specifies the schema and the technical GEO requirements; mia implements the markup, and the *content* that earns citations is Brand Studio's (lena's writing, kai's strategy). rank doesn't write the content or set the strategy.
6. **Through the gate.** Schema and GEO markup changes ship through the normal path — mia implements, dev reviews, quinn gates. Malformed schema can cause manual actions, so it's reviewed, not sprayed.

## Output Format

```
## Structured Data / GEO: [page/site]
Schema: [types · validated ✓ · in rendered output ✓ · deprecations respected (HowTo/FAQ)]
GEO/AEO: [extractable answers · entity clarity · AI-crawler access decision → operator/kai]
Boundary: [rank specs markup ✓ · content substance → lena/kai · implementation → mia]
Path: [mia implement · dev review · quinn gate]
```

## Principles

- **Right schema, validated, rendered** — markup a crawler never sees is useless.
- **Respect dated deprecations** — HowTo gone, FAQ restricted, INP not FID; verify high-stakes.
- **GEO is machine-answerability** — extractable answers, clear entities, citability.
- **AI-crawler access is an operator/kai decision** — rank surfaces the trade-off, implements the choice.
- **rank specs markup; Brand Studio owns substance** — clean boundary.
- **Through the gate** — malformed schema risks manual actions; reviewed, not sprayed.

## Fallback

- No plugin → schema/GEO by this method (Schema.org + Google guidelines directly), labeled reduced-automation.
- Uncertain if a schema type earns rich results → check current Google guidance (dated facts change); don't add speculative markup that risks a manual action.
- Content isn't citable enough for GEO → that's a content-strategy gap for lena/kai, not a markup fix; hand it over.

## Boundaries with Other Skills

- **kai (Brand Studio)**: SEO + AI-search strategy and measurement; **lena**: the citable content itself. rank owns the technical markup only.
- **technical-seo-execution** (sibling): rendering (schema must be in output) and the crawlability GEO depends on.
- **claude-seo-integration** (sibling): `/seo schema` and `/seo geo` deepen this when installed.
- **mia**: implements schema markup in components; **aegis**: schema/structured data from user input is an injection surface.
- **dev/quinn**: markup changes pass review and the gate.
