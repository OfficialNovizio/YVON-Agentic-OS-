---
name: verified-patching
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; makes the defending-code harness's four-part patch verification a department law (plan §3 "verified-patching (fix builds + PoC dies + tests pass + adversary can't re-break)")
marketplace_search: 2026-07-09 — the harness's /patch skill defines the four-check verification (README Step 2, stage 7); adopted as this skill's core discipline with credit. Kept custom because the "adversary can't re-break" check binds to cypher (Rail 4) and closure binds to quinn's regression map — department-specific
assigned_agent: aegis (Engineering / Application Security)
portable: true — the four checks are stack-agnostic; build/test commands come from the stack-profile and platform-playbooks
includes: assets/patch-verification-checklist.md
date_added: 2026-07-09
---

## Introduction

verified-patching is how a security finding actually closes: not when a fix is written, but when four independent checks all pass — **the fix builds, the original proof-of-concept no longer works, the target's tests still pass, and a fresh adversary can't find a way around it.** This is the defending-code harness's patch-verification discipline (README stage 7) made law, with the fourth check wired to cypher's re-attack (when built) and closure wired to quinn's regression map.

## Purpose

A patch that stops the specific PoC but leaves the vulnerability class open is theater — the attacker adjusts the input and re-breaks it. A patch that fixes the bug but breaks a test or the build is a new incident. The four checks close all four gaps: the fix works, the exploit dies, nothing regresses, and the *class* (not just the instance) is closed. Only then is the finding closed and the fragility mapped.

## When to Use

Triggers: a routed finding from vuln-pipeline or secure-code-review, "patch this vulnerability," "verify this security fix," "is this finding closed," CVE remediation from ops, and any fix claiming to close a security finding.

## Structure / Protocol

```
A finding needs a fix (from vuln-pipeline / secure-code-review / ops CVE)
  -> Fix authored (by the owning builder; aegis coordinates, doesn't own their code)
    -> FOUR-CHECK VERIFICATION (all four, or NOT CLOSED):
       1. BUILDS — the fix compiles/builds clean (per stack-profile build)
       2. POC DIES — the original proof-of-concept no longer triggers the vulnerability
          (re-run in the sandbox for execution-verified findings — Rail 2)
       3. TESTS PASS — the target's existing suite still green (quinn's tiers; no test weakened
          to accommodate the fix — dev's integrity block)
       4. CAN'T RE-BREAK — a fresh adversary attempt against the same class fails
          (cypher re-attacks when built; until then, aegis's own adversarial re-review, labeled)
      -> ALL FOUR ✓ → finding CLOSED → quinn regression-map entry (the class is now guarded)
      -> ANY ✗ → NOT CLOSED, named; back to the author; the finding stays open
        -> Data-touching fix? → prepared script, OPERATOR runs it (Rail 3), never aegis
```

## Instructions

1. **Four checks, no partial credit.** A finding is closed only when all four pass. "PoC dies" alone is the most common false close — it fixes the instance and leaves the class. Name which checks failed; the finding stays open until all four are green.
2. **PoC dies, verified where the finding lived.** For execution-verified findings, re-run the original PoC in the sandbox (Rail 2) and confirm it no longer triggers. For static findings, demonstrate the tainted path is now broken by analysis, labeled as static-confidence.
3. **Tests pass, honestly.** The existing suite stays green — and no test was weakened, skipped, or deleted to make the fix pass (dev's integrity block §0, quinn's flaky rule). A fix that needs the tests changed to pass is two changes; the test change gets its own scrutiny.
4. **Can't re-break is the class check.** The fourth check is what separates a real fix from theater: a fresh adversarial attempt against the same vulnerability class — different inputs, adjacent paths — must fail. cypher runs this when built (Rail 4, in-scope, sandboxed); until then aegis performs it as adversarial re-review, explicitly labeled as self-check (weaker than an independent adversary, flagged per rule 0.6).
5. **aegis coordinates; the owner authors; the operator runs data changes.** aegis verifies fixes, it doesn't own the builders' code — the owning agent writes the fix, aegis runs the four checks. Any fix that mutates data is a prepared script the operator executes (Rail 3), even for security.
6. **Closure feeds the map.** A closed finding becomes a quinn regression-map entry — the class is now a guarded fragile area, so a future recurrence is caught by the gate. A "closed" finding with no map entry isn't closed (quinn's no-guard-no-pass, security edition).

## Output Format

```
## Patch Verification: [finding F-id] — [class]
1. Builds: ✓/✗ · 2. PoC dies: ✓/✗ [sandbox re-run ref] · 3. Tests pass: ✓/✗ [no tests weakened ✓] ·
4. Can't re-break: ✓/✗ [cypher ref / aegis self-check — labeled]
Data change: [none / operator-run script ref (Rail 3)]

### Verdict: CLOSED / NOT CLOSED (checks failed named)
Regression-map entry: [RM-ref] (required for CLOSED)
```

## Principles

- **Four checks or not closed** — fixing the PoC without closing the class is theater.
- **PoC dies, verified in the sandbox** where execution-verified findings lived (Rail 2).
- **Tests stay green honestly** — no test weakened to pass a fix (integrity block).
- **"Can't re-break" is the class check** — an adversary's fresh attempt must fail; independent (cypher) beats self-check.
- **aegis verifies; owners author; operator runs data changes** (Rail 3).
- **No closure without a regression-map entry** — the class becomes guarded, or it isn't closed.

## Fallback

- No sandbox → check 2 (PoC dies) for execution findings can't be run → finding cannot be closed at full confidence; static-confidence partial close, labeled, with sandbox verification flagged as pending.
- cypher not built yet → check 4 is aegis's own adversarial re-review, explicitly labeled as self-check and weaker than independent; the finding's closure carries that caveat until cypher re-attacks.
- Fix can't pass all four (e.g., proper fix needs a larger refactor) → finding stays open; a documented interim mitigation (WAF rule, feature flag, input cap) may reduce severity, logged as risk-accepted-with-mitigation by the operator, never as closed.
- Author disputes a failed check → the check's evidence stands; re-run to confirm, but a red check is not waived by argument.

## Boundaries with Other Skills

- **vuln-pipeline / secure-code-review** (siblings) produce the findings this closes; shared findings schema.
- **cypher** (adversary, when built): runs check 4 independently (Rail 4, caged); its re-attack failing is what makes a close trustworthy.
- **quinn/regression-map**: every closure writes an entry — the class becomes a guarded fragile area; **quinn/test-strategy**: check 3 is quinn's suite.
- **dev/code-review-standards**: the no-weakened-tests integrity rule is shared; fixes still pass dev's normal review.
- **ops**: CVE fixes flow from maintenance-hygiene; data-touching fixes are ops-sequenced, operator-run (Rail 3).
