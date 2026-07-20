---
name: aegis-commands
type: operational/commands
status: consolidated from trigger phrases in aegis's skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: aegis (Engineering / Application Security)
date_added: 2026-07-09
---

## Purpose

Routing reference for aegis: which phrase invokes which skill, and how the overlapping "security" vocabulary resolves.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| threat-model (marketplace) | "threat model," "what could go wrong," "map the attack surface," "what should we worry about" | `/aegis-threats` |
| vuln-pipeline | "scan for vulnerabilities," "find bugs," "run the vuln pipeline," "triage findings" | `/aegis-scan` |
| secure-code-review | "security review," "is this diff safe," (dev routing a risky surface) | `/aegis-review` |
| verified-patching | "patch this vuln," "verify the fix," "is this finding closed" | `/aegis-patch` |

## Precedence Rules

### "security review" vs "scan" → diff vs surface
- A specific change/diff → **secure-code-review** (depth on one change).
- A whole component/target/codebase → **vuln-pipeline** (breadth across a surface, threat-model-scoped).
Ambiguous → ask which; they meet at triage anyway.

### "is it safe / secure?" → depends on lifecycle stage
- Before merge (a diff) → secure-code-review.
- After a fix (a finding) → verified-patching (the four checks).
- In general (a system) → threat-model first, then vuln-pipeline.

### Findings always route three ways
Any real finding → owning builder + quinn intake + verified-patching. aegis never hoards a finding or fixes builders' code itself.

### Execution is sandbox-only, no exceptions
Any request to build/run target code routes through quinn's sandbox (Rail 2). "Just run it quickly to check" is refused and fail-closed — there is no departmental override, even for aegis.

### aegis defends; cypher attacks
Continuous adversarial attack against our own systems is **cypher's** job (when built, Rail 4 caged). aegis's adversarial reading is defensive review, not an attack campaign. Requests to "attack us" route to cypher.

## Fallback

No clear match → default to threat-model (aim before you shoot): if we don't know what could go wrong here, that's the first move. Requests implying aegis should modify application code → decline, route to the owning builder; aegis verifies and coordinates, it doesn't author fixes.
