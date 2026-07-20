---
name: mcp-tool-registry
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-mcp-registry (prefix stripped; venture refs genericized; agent renamed nova→relay for collision)
assigned_agent: relay (AI & Agents / AI Integration & Tool Registry)
portable: true
date_added: 2026-07-10
---

# MCP & Tool Registry

## Introduction
The canonical record of every capability any agent can call: MCP servers, connectors, APIs, scripts with external effect. Fleet Charter Rail 1 made this registry law: **no unregistered capability, ever.** Registry document: `assets/tool-registry.md`; mechanical check: `scripts/registry_lint.py`.

## Purpose
Tool access is where prompt-injection and excessive-agency risk becomes real damage. A complete registry is what makes plan-lock (Engineering Rail 1) checkable and the egress allowlist (Rail 2) authorable.

## When to Use
- Any agent wants a new tool/MCP/connector — BEFORE first use.
- scout's tool-evaluation-intake produces an adopt verdict.
- Access questions ("who can call X?"), audits, deregistrations.

## Structure / Protocol
REQUEST → SCREEN (security review per aegis's detection-classes asset — shared reference, aegis owns it) → REGISTER (entry per template) → GRANT (least-privilege-grants skill) → LINT (`registry_lint.py`) → AUDIT (cadence).

## Instructions
1. Entry fields (all required — lint enforces): tool name, kind (MCP/API/script/connector), source/URL, auth method, owner (an agent or the operator), scopes, per-agent access map, egress domains, date, status (`active/trial/revoked`).
2. Append-only: revocation is a new `revoked` entry, never a deletion.
3. Trial status (from scout's sandbox trials) auto-expires: `<FILL_IN: trial period, suggested 30 days>` — expiry without an adopt verdict = revoked.
4. Egress domains recorded per tool feed the egress-allowlist-authoring skill — a tool with no declared egress gets NONE.
5. Run `python scripts/registry_lint.py assets/tool-registry.md` after every change; a failing registry blocks the change from being reported complete (verification-before-completion applies).
6. Registration records capability; it never grants it — grants are the runtime/operator's (same authoring-vs-enforcement split as dana/Rail 3).

## Output Format
Registry entries as template rows; lint output: `OK` or per-entry violations; audit reports: grants confirmed / revoked-by-default list.

## Principles
- Unregistered = off-plan = halt (Fleet Charter Rail 1).
- The registry describes; the runtime enforces; the operator owns.
- Append-only history — who had access WHEN must always be answerable.

## Fallback
Tool's egress needs unknown? Register with egress NONE and trial status — it fails closed in the sandbox until someone declares domains. Owner unknown? Not registrable; find an owner first.

## Boundaries with Other Skills
- scout's tool-evaluation-intake feeds this registry; this skill never evaluates.
- least-privilege-grants decides WHO gets access; this skill records it.
- egress-allowlist-authoring exports the network view of this registry.
- meta's fleet-registry is the agent roster; this is the capability roster.
