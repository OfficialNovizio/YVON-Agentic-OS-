---
name: dana-tool-requirements
type: operational/tool
status: specifies needs, does not grant them — grants happen at deployment via config/connectors
assigned_agent: dana (Engineering / Data Architecture)
date_added: 2026-07-09
---

## Purpose

What dana needs, and what happens without each. dana's defining constraint: it authors data changes but never executes them (Rail 3). Every external tool call is plan-locked (Rail 1) and sandboxed (Rail 2).

## Requirements

| Need | Tool / access | Used by | Without it |
|---|---|---|---|
| Schema/data READ access | read scope on the store(s), per charter `read_access_scope` | all skills | Can't design against reality; escalate |
| Query-plan tool | store's EXPLAIN-equivalent | db-performance | Timing + model reasoning only, labeled lower-fidelity |
| Scratch/restore environment | to test down-scripts before up runs | migration-discipline | Production-shaped local copy, labeled debt; down-test never skipped |
| Production-scale sample data | operator-supplied | db-performance | Best-available, labeled; no dev-scale conclusions |
| Append-only record access | migration scripts · schema docs (config paths) | migration-discipline, data-modeling | Can't record; loud degradation |
| HelixDB connector (if adopted) | graph-vector store access | datastore-selection, data-modeling | Playbook is method-only until connected |

## Explicit non-needs / hard prohibition (by design)

- **NO write/execute access to any datastore — ever, not configurable (Rail 3).** dana authors migration scripts; the OPERATOR runs them. This is the department's central data-safety guarantee and dana is where it's authored.
- **No application-code write access** — dana designs the data layer; raj implements the access code.
- **No production execution of anything** — migrations are handed to the operator; monitoring is ops's.

## Notes

- The asymmetry is the point: dana is the agent closest to the data and therefore the most restricted from changing it. Reads inform design; writes are always human-executed.
- New store connectors enter via the stack-profile + config + a store playbook, under a locked plan.

## MCP Marketplace Tools (added 2026-07-14)

| Tool | Source | Purpose | Always-on |
|------|--------|---------|-----------|
| **Firecrawl MCP** | [github.com/mcp/firecrawl](https://github.com/mcp/firecrawl/firecrawl-mcp-server) | Structured web data extraction: scrape documentation sites → structured JSON for data pipelines, extract schemas/protocols from vendor docs, map competitor data models. | ⚠️ On-demand — during data-modeling research phases |
| **Crawl4AI** | [github.com/unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) — Apache 2.0 | RAG pipeline ingestion: crawl documentation → clean Markdown → vector DB. Async crawling for large documentation sites. BM25 noise filtering produces clean LLM input. | ❌ No — Python library. Import in data pipeline scripts; runs as a tool dependency, not a continuous service |
| **Scrapling** | [github.com/D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) — BSD 3-Clause | JS-heavy site data extraction: when target sites require browser rendering (SPAs, dynamic content). Spider API for structured crawl workflows. Pause/resume for long-running extractions. | ❌ No — escalate from Firecrawl only when JS rendering or stealth is needed |

See Engineering/MCP-MARKETPLACE.md for setup and tool selection decision guide.
