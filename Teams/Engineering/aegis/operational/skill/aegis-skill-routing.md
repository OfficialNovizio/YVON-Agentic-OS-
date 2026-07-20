---
name: aegis-skill-routing
type: operational/skill
status: consolidated from aegis's skill files — no new routing invented
assigned_agent: aegis (Engineering / Application Security)
date_added: 2026-07-09
---

## Purpose

How aegis's skills fit together. aegis is the department's **defensive** security agent: it maps what could go wrong, finds where it has, reviews risky changes adversarially, and verifies fixes actually close. cypher (the caged adversary, when built) is the offensive half; aegis defends. aegis coordinates fixes; it does not own the builders' code.

## The shape

```
marketplace/threat-model (the map — what could go wrong, who, what to do)
        │ scopes
        ▼
vuln-pipeline (breadth: recon→find→verify→dedupe→triage→route)  ◄── ops CVE handoff
        │                                                        ◄── cypher findings (via quinn)
secure-code-review (depth: adversarial read of a risky diff)     ◄── dev risky-diff routing
        │
        ▼ findings (shared schema)
verified-patching (four checks: builds · PoC dies · tests pass · can't re-break)
        │
        ▼ CLOSED → quinn regression-map entry (class now guarded)
```

## Routing rules

- "What could go wrong / map the attack surface / threat model" → **marketplace/threat-model** (aegis decides when to build/refresh; the imported skill produces it).
- "Scan / find vulns / triage findings" → **vuln-pipeline** (threat-model-scoped; static first, execution only in sandbox).
- "Security-review this / is this diff safe" (usually from dev's routing) → **secure-code-review**.
- "Patch / verify this fix / is it closed" → **verified-patching** (four checks, or not closed).
- Execution of any target code → ONLY in quinn's sandbox (Rail 2); fail closed outside it — no departmental override.

## Handoffs

- **dev**: risky diffs route in (code-review-standards); findings route to owning builders; new dependency risk flagged; aegis never edits builders' code, it coordinates.
- **quinn**: aegis's S-tier verdicts feed the release gate; the sandbox is quinn's; every closed finding writes a regression-map entry; cypher findings arrive via quinn's intake.
- **cypher** (adversary, when built): runs verified-patching's check 4 independently (Rail 4, caged); its re-attacks are the trustworthy version of "can't re-break." Until built, aegis self-checks, labeled.
- **ops**: CVE handoff from maintenance-hygiene (above patch-level = joint); data-touching fixes are ops-sequenced, operator-run (Rail 3).
- **AI & Agents dept (future)**: LLM-specific attack classes (prompt injection, tool poisoning) overlap; coordinate at that build (plan §6).
- Senior authority: **Security Charter** — aegis enforces Rails 2 (sandbox) and 3 (no agent data writes) on itself; only the operator amends.
