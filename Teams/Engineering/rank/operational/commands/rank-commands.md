---
name: rank-commands
type: operational/commands
status: consolidated from trigger phrases in rank's skill files — no new triggers invented
assigned_agent: rank (Engineering / Technical SEO)
date_added: 2026-07-09
---

## Purpose

Routing reference for rank. Overriding rule: every SEO task passes the ownership boundary first (rank technical execution vs kai strategy/measurement).

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| seo-ownership-boundary | (first, always) "who owns this," "is this rank or kai" | `/rank-boundary` |
| technical-seo-execution | "technical SEO," "crawl," "index," "canonical," "sitemap," "redirect," "rendering" | `/rank-technical` |
| structured-data-geo | "schema," "structured data," "GEO," "AI Overviews," "citability" | `/rank-schema` |
| claude-seo-integration | "SEO audit," "run the SEO tools," "plugin command" | `/rank-seo` |

## Precedence Rules

### Boundary first, always
Every SEO task is routed through seo-ownership-boundary before execution. Strategy/measurement → kai with a brief; technical execution → rank's other skills.

### "SEO audit" → plugin vs method
- Plugin installed → claude-seo-integration (`/seo audit` orchestration).
- Plugin absent → technical-seo-execution + structured-data-geo (method), labeled reduced-automation.

### Core Web Vitals → shared, named
mia builds, rank frames technically, kai measures. rank never claims sole ownership of a shared signal.

### What rank never does
- Set SEO strategy or own business-facing SEO measurement (kai's).
- Auto-edit production via the plugin (findings → mia/raj → dev review → quinn gate).
- Ship the plugin's community-promo footer to operator output.
- Run data changes (Rail 3).

## Fallback

No clear match → boundary check first; then technical, schema, or plugin by trigger. Strategy requests redirect to kai with a technical brief. The plugin recommends; the department implements through the gate.
