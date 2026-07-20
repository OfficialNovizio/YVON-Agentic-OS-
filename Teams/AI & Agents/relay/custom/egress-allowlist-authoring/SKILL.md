---
name: egress-allowlist-authoring
type: custom
status: built from scratch
fulfills_catalog_entry: none — added by AI & Agents redesign plan §3 (bridges relay's registry to Engineering Rail 2)
assigned_agent: relay (AI & Agents / AI Integration & Tool Registry)
portable: true
date_added: 2026-07-10
---

# Egress Allowlist Authoring

## Introduction
Exports the network view of the tool registry as the **egress allowlist** that Engineering Rail 2 (sandbox every tool call, egress-allowlisted) enforces at runtime. relay authors; the runtime enforces; quinn owns sandbox policy. Authoring ≠ enforcement — same split as dana/Rail 3.

## Purpose
Rail 2 is only as good as its list. An allowlist maintained by hand drifts from the registry; this skill makes the registry the single source and the allowlist a derived artifact.

## When to Use
- Any registry change touching egress domains (new tool, revocation, scope change).
- quinn requests the current allowlist for sandbox policy.
- An egress-denial incident needs a "should this domain be allowed?" answer.

## Structure / Protocol
DERIVE (registry → per-tool domain list) → MINIMIZE (exact hosts over wildcards; no transitive "it might also call...") → VERSION (dated export) → HAND OFF (to quinn/runtime) → RECONCILE (denials vs list).

## Instructions
1. The allowlist is always **derived** from the registry — never edited directly. A domain not traceable to a registered tool's egress field doesn't ship.
2. Exact hostnames over wildcards; a wildcard requires an operator sign-off recorded in the registry history.
3. Tools with egress NONE or unresolved `<FILL_IN>` contribute nothing — they fail closed in the sandbox until the operator resolves them. That is correct behavior, not a bug.
4. Every export is dated and versioned; quinn's sandbox policy names the version it enforces.
5. Egress-denial incidents: if the denied domain IS registry-traceable, the export was stale — re-derive and hand off. If NOT traceable, that's a possible exfiltration attempt or off-plan call: escalate to quinn + aegis, never "just add the domain."

## Output Format
Dated allowlist export: `# egress-allowlist vYYYY-MM-DD` + one domain per line with its source tool in a comment. Reconciliation verdicts: `stale-export / not-traceable (escalated)`.

## Principles
- The registry is upstream, always — fixing the allowlist means fixing the registry.
- Fail closed is the feature: a blocked legitimate call costs minutes; an allowed exfiltration is unbounded.
- Never widen the list to make an incident go away.

## Fallback
Runtime has no allowlist enforcement yet (a known deploy gap — Rail 2 is Hermes-runtime work per PROJECT-HANDOFF §1)? Keep authoring versioned exports anyway; the list must be ready the day enforcement lands, and it documents intent for audits meanwhile.

## Boundaries with Other Skills
- mcp-tool-registry: source of all data here.
- quinn (Engineering): consumes exports, owns sandbox policy and Rail 1–2 enforcement.
- aegis: judges suspicious-domain escalations (its detection classes cover exfil patterns).
