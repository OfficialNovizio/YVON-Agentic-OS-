---
name: least-privilege-grants
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-mcp-registry protocol step 2 ("least-privilege default; security review"), expanded to a full skill
assigned_agent: relay (AI & Agents / AI Integration & Tool Registry)
portable: true
date_added: 2026-07-10
---

# Least-Privilege Grants

## Introduction
The decision method for WHO gets access to WHAT, and the audit that keeps grants honest. Fleet Charter Rail 2 as an operating procedure.

## Purpose
Grants accumulate; nobody ever asks to lose access. Excessive agency (OWASP LLM Top 10) is exactly stale, over-broad grants — this skill makes minimal access the default and shrinkage automatic.

## When to Use
- A registered tool needs its access map decided (new tool or new requesting agent).
- The audit cadence fires.
- An incident implicates a grant (revoke-first path).

## Structure / Protocol
REQUEST → JUSTIFY (which skill line needs it — cite the file) → SCOPE (narrowest workable: read < write, one scope < all) → GRANT (registry entry) → AUDIT (cadence) → SHRINK (revoke-by-default).

## Instructions
1. A grant requires a **skill-line citation**: the requesting agent names the SKILL.md line that needs the capability. No citation, no grant — "might need it" is not a justification.
2. Default scope ladder: deny → read-only → scoped write → broad. Start at the lowest rung that satisfies the cited line. Broad requires operator sign-off.
3. Nothing inherits: not by department, not by similarity to another agent, not by leader status.
4. Audit (cadence `<FILL_IN: suggested quarterly>`, shared with fleet-registry reconcile): every grant re-justified from its citation. Unjustifiable → revoked immediately, appeal after (revoke-then-appeal).
5. Incident path: a grant implicated in an incident is suspended first, investigated second.
6. Destructive DB operations are NEVER grantable to any agent — Engineering Rail 3 is senior and not configurable.

## Output Format
Grant decisions: `GRANTED (scope, citation) / DENIED (reason) / ESCALATED (operator)`. Audit report: confirmed / revoked / escalated lists with citations.

## Principles
- Access is a loan against a cited need, not a property right.
- The audit's job is shrinkage — an audit that only ever confirms is broken.
- When in doubt, deny and escalate: a blocked agent is recoverable, an exfiltrated secret is not.

## Fallback
Requesting agent's skill file is ambiguous about the need? Deny, and route the ambiguity to anneal as a skill-clarity fix proposal — the skill text is the bug.

## Boundaries with Other Skills
- mcp-tool-registry records what this skill decides.
- aegis owns security review method (shared detection-classes asset referenced, never duplicated).
- Operator/runtime enforce; this skill only authors decisions.
