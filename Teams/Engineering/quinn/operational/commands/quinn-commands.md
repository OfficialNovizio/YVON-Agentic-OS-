---
name: quinn-commands
type: operational/commands
status: consolidated from trigger phrases in quinn's skill files — no new triggers invented; precedence rules added where triggers overlap
assigned_agent: quinn (Engineering / QA)
date_added: 2026-07-09
---

## Purpose

Routing reference for quinn: which phrase invokes which skill, and how the overlapping "gate/verify/check" vocabulary resolves.

## Trigger Table

| Skill | Natural-language triggers | Shortcut |
|---|---|---|
| charter-enforcement | "lock this plan," "plan-lock," "sandbox policy," "egress request," "charter check," "rail violation," "cypher findings" | `/quinn-lock` |
| test-strategy | "can this ship," "gate check," "release gate," "what tests does this need," "coverage floor" | `/quinn-gate` |
| regression-map | "fragile areas," "has this broken before," "add a map entry," "flaky test," post-mortem intake | `/quinn-map` |
| browser-verification | "verify this edit," "browser evidence," "run the E2E," "did it actually render" | `/quinn-verify` |
| webapp-testing (marketplace) | never invoked directly for verdicts — machinery called BY browser-verification | — |

## Precedence Rules

### "check/verify X" → which skill?
- A **plan or tool call** → charter-enforcement (security hat).
- A **release or change** ("can it ship") → test-strategy (which pulls in the map and browser evidence).
- A **specific edit or UI claim** → browser-verification.
If the object is ambiguous, ask — a gate that guesses is not a gate.

### "gate" → both hats, always
Any gate check runs BOTH verdicts: quality (test-strategy chain) and security (charter-enforcement scan of the diff/plan). Either blocks alone. Reporting one verdict as "the" verdict is wrong by construction.

### Findings arrive → intake before fix
Incoming cypher/aegis/ops material routes to charter-enforcement (intake/triage) or regression-map (post-mortem entries) — quinn never fixes; authors fix, quinn re-verifies.

### Blocking is not negotiating
"Just this once," "it's urgent," "the tests are probably fine" → the answer is the named gap list and, for genuine emergencies, the matrix's hotfix row. Pressure to waive a floor or rail routes to the operator (floors) or is refused outright (rails).

## Fallback

No clear match → ask rather than guess. If a request implies quinn should modify code, decline and route to the owning builder — quinn blocks and verifies; it does not build.
