---
name: cypher-tool-requirements
type: operational/tool
status: specifies needs, does not grant them — grants happen at deployment via config/connectors, and cypher's grants are conditional on the signed scope
assigned_agent: cypher (Engineering / Adversary / Red Team)
date_added: 2026-07-09
---

## Purpose

What cypher needs, and what happens without each. cypher's needs are unusual: they are ATTACK capabilities, granted only inside the cage. Every one is conditional on a signed scope + quinn's sandbox; absent either, cypher does nothing.

## Requirements

| Need | Tool / access | Used by | Without it |
|---|---|---|---|
| Operator-signed scope | `red_team_scope_doc` (config) | caged-scope | cypher does NOTHING — the ignition key |
| gVisor-pattern sandbox | **quinn's sandbox** (Rail 2), egress → Claude API only | attack-playbooks, continuous-attack-loop | No attack capability at all; fail closed |
| Attack tooling (in-sandbox) | fuzzers, injection harnesses, request tooling — per attack-class register, sandbox-bound | attack-playbooks | Manual technique execution in-sandbox, depth degraded, still caged |
| Read access to in-scope targets | source/deploys of OUR signed systems only | attack-playbooks, continuous-attack-loop | Can't scope attacks; escalate |
| Threat-intel feeds | OWASP (web + LLM 2025), advisories (read-only, public) | attack-playbooks | Register goes stale; new classes labeled reasoning-based |
| Append-only log access | attack-loop log · findings (config paths) | continuous-attack-loop, findings-report | Can't record coverage/findings → cypher halts reporting-dependent work |
| quinn findings intake | the ONLY output channel | findings-report | cypher HALTS (no other channel exists); does not route around quinn |

## Explicit non-needs / hard prohibitions (by design)

- **No access to third-party or production customer systems** — ever, signed scope or not (Rail 4).
- **No ability to make live changes, persist, or deploy** — findings only.
- **No egress beyond the Claude API in-sandbox** — exfil must fail closed (it's a thing cypher TESTS, never does).
- **No weaponizable artifact output** — PoCs die in the sandbox.
- **No write access to code, data, or config** — cypher attacks and reports; it fixes nothing (that's aegis) and changes nothing.
- **No self-amendment of scope** — operator-only.

## Notes

- cypher is the department's highest-privilege-to-do-harm agent and therefore its most constrained: every capability is caged, sandboxed, findings-only, and operator-gated. The asymmetry is intentional.
- Connector/tool adoption surfaced to the operator at deployment; nothing is granted outside the signed scope + sandbox.

## MCP Marketplace Tools (added 2026-07-14)

| Tool | Source | Purpose | Always-on |
|------|--------|---------|-----------|
| **Browserbase MCP** | [docs.browserbase.com/integrations/mcp](https://docs.browserbase.com/integrations/mcp) | Cloud browser for attack surface reconnaissance — screenshot target sites, execute JS for fingerprinting, observe page structure. Runs in sandboxed browser session. | ⚠️ On-demand — during attack-playbooks execution only |
| **Firecrawl MCP** | [github.com/mcp/firecrawl](https://github.com/mcp/firecrawl/firecrawl-mcp-server) | OSINT reconnaissance: scrape target sites for technology fingerprinting, map URL structures, search for exposed data. Free tier for initial recon. | ⚠️ On-demand — during intelligence gathering phases |
| **Scrapling** | [github.com/D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) — BSD 3-Clause | Adaptive scraping with Cloudflare bypass: when targets block standard scrapers. Stealth mode for protected sites. Spider API for continuous recon. | ❌ No — use Firecrawl first, escalate to Scrapling only when blocked |

See Engineering/MCP-MARKETPLACE.md for setup instructions. All tools run sandboxed per Rail 2. Attack scope stays within signed authorization boundaries.
