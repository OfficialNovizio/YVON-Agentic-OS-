---
name: aegis-tool-requirements
type: operational/tool
status: specifies needs, does not grant them — grants happen at deployment via config/connectors
assigned_agent: aegis (Engineering / Application Security)
date_added: 2026-07-09
---

## Purpose

What aegis needs to operate at full capability, and what happens without each. Every external tool call aegis makes is plan-locked (Rail 1) and sandboxed (Rail 2) — aegis enforces these on itself.

## Requirements

| Need | Tool / access | Used by | Without it |
|---|---|---|---|
| Static source read (git history, source, advisories) | repo read scope + public advisory DBs (NVD, GHSA) | threat-model, vuln-pipeline, secure-code-review | Core capability; without repo read, aegis can't operate — escalate |
| gVisor-pattern sandbox for executing target code | **quinn's sandbox** (Rail 2); defending-code harness pattern | vuln-pipeline (execution mode), verified-patching (PoC re-run) | Execution-verification disabled; static-confidence only, labeled loudly |
| Autonomous vuln pipeline (recon→find→verify→report→patch) | **defending-code-reference-harness** (github.com/anthropics/…) — proposed connector, plan §5 | vuln-pipeline | Interactive/manual discipline only; depth degrades, method holds |
| Advisory / CVE feeds | NVD, GitHub Security Advisories, project trackers (read-only, public) | vuln-pipeline, threat-model evidence | Manual CVE tracking with ops; joint above patch-level |
| Build + test execution (for patch checks 1 & 3) | per stack-profile build/test, run in sandbox | verified-patching | Checks 1/3 become author-attested + aegis-reviewed, labeled lower-confidence |
| Append-only register access | threat models · findings register (config paths) | all | Affected skill can't record; loud degradation |

## Explicit non-needs (by design)

- **No write access to application code** — aegis coordinates fixes; the owning builder authors them.
- **No destructive database access** — security fixes that touch data are dana-authored prepared scripts the OPERATOR runs (Rail 3).
- **No egress beyond the Claude API in execution sandboxes** — Rail 2; anything else fails closed.
- **No attack capability against production or third-party systems** — that's cypher's caged, in-scope, sandboxed job (Rail 4), not aegis's; aegis is defensive.

## Notes

- The defending-code harness's own safety model (static skills safe unsandboxed; execution refuses to run outside gVisor) matches this department's rails by design — plan §5 chose it for exactly that reason.
- Connector adoption surfaced to the operator at deployment; skills degrade to method-only per their fallbacks.

## MCP Marketplace Tools (added 2026-07-14)

| Tool | Source | Purpose | Always-on |
|------|--------|---------|-----------|
| **Browserbase MCP** | [docs.browserbase.com/integrations/mcp](https://docs.browserbase.com/integrations/mcp) | Security surface testing: verify CSP headers, CORS configuration, cookie flags (HttpOnly/Secure/SameSite), and content security policies in a real browser. Screenshot-based security review. | ⚠️ On-demand — during secure-code-review and threat-modeling phases |

See Engineering/MCP-MARKETPLACE.md for setup.
