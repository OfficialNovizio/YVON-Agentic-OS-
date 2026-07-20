# Patch Verification Checklist — aegis/verified-patching

> All four checks pass, or the finding is NOT CLOSED. Credit: the four-check discipline is from anthropics/defending-code-reference-harness /patch (README stage 7). Build/test commands come from the stack-profile + platform-playbooks.

**Finding:** [F-id] · **Class:** [CWE/OWASP] · **Author of fix:** [owning builder]

## The four checks (no partial credit)
- [ ] **1. Builds** — fix compiles/builds clean per stack-profile build command
- [ ] **2. PoC dies** — original proof-of-concept no longer triggers the vulnerability
  - execution-verified finding → re-run PoC in the sandbox (Rail 2); ref: ___
  - static finding → tainted path demonstrably broken by analysis (static-confidence, labeled)
- [ ] **3. Tests pass** — existing suite green (quinn's tiers) AND no test weakened/skipped/deleted to pass (dev integrity §0)
- [ ] **4. Can't re-break** — fresh adversarial attempt at the same CLASS fails
  - cypher re-attack (when built, Rail 4, sandboxed); ref: ___
  - OR aegis self-check (labeled — weaker than independent adversary, rule 0.6)

## Charter
- [ ] Data-touching fix → prepared script, OPERATOR runs it (Rail 3); ref: ___ (never aegis/agent-run)

## Closure (required for CLOSED)
- [ ] quinn regression-map entry written — the class is now a guarded fragile area; RM-ref: ___
- [ ] Finding status → closed in vuln-pipeline findings schema

## If any check ✗
- Finding stays OPEN; failed checks named to the author.
- Interim mitigation possible? [WAF rule / flag / input cap] → risk-accepted-with-mitigation by OPERATOR, logged — never recorded as closed.
