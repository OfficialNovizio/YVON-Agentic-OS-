---
name: vuln-pipeline
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; wraps Anthropic's defending-code reference harness (plan §5) as a department discipline
marketplace_search: 2026-07-09 — Anthropic's defending-code-reference-harness FOUND (github.com/anthropics/defending-code-reference-harness); its threat-model skill imported verbatim to aegis/marketplace/threat-model. This custom skill is the recon→find→verify→dedupe→triage→route discipline wrapped for THIS department (quinn intake, charter sandbox, ops CVE handoff). The harness's autonomous pipeline (bin/vp-sandboxed) is a proposed connector at deployment, not a hard dep
assigned_agent: aegis (Engineering / Application Security)
portable: true — the pipeline shape is language-agnostic (README §3: recon/find/verify generalize); the C/C++/ASAN reference detector is one instance, ported per stack via the harness /customize skill
includes: assets/findings-schema.md
date_added: 2026-07-09
---

## Introduction

vuln-pipeline is aegis's discovery engine: a threat-model-scoped loop — **recon → find → verify → dedupe → triage → route** — that turns "where are we exposed" (the threat model) into ranked, verified, owner-routed findings. It runs static-first (read/write only, safe unsandboxed, like the harness's Step 1 skills); execution-verified finding (the harness's autonomous pipeline, Step 2+) runs **only** inside the gVisor-pattern sandbox the Security Charter's Rail 2 generalizes from this very harness.

## Purpose

Scanning without a threat model finds noise; a threat model without scanning is a wish. The pipeline joins them: the threat model (imported skill) scopes what to look for, the scan finds candidates, verification kills false positives (the harness's separate-grader-reproduces-the-crash discipline), dedupe collapses repeats, triage ranks against the threat model, and routing sends each real finding to its owner. aegis defends; the caged adversary (cypher) attacks — this is the defensive half.

## When to Use

Triggers: "scan for vulnerabilities," "run the vuln pipeline," "find bugs in [target]," "triage these findings," a new threat model landing, a CVE arriving from ops's maintenance-hygiene, risky-diff referral from dev's review, and scheduled scans (config cadence).

## Structure / Protocol

```
THREAT MODEL (marketplace/threat-model → THREAT_MODEL.md) scopes the run
  -> RECON: partition the attack surface (parallel finders explore different areas, not the same bug)
    -> FIND: detect by the target's signal, PRIORITIZED BY STACK (see assets/detection-classes-web-llm-2026-07.md):
       • Interpreted (Python/JS/TS) = static taint + the web detection classes (injection/IDOR/SSRF/secrets…)
       • LLM/agent code = the LLM detection classes (prompt injection, insecure output, excessive agency, RAG poisoning) — the fleet defends itself
       • Native (C/C++/Rust-unsafe) = ASAN crash via the harness detector — ONLY if the business ships native code
       STATIC mode = read/write only, no execution, safe unsandboxed
       EXECUTION mode = ONLY in gVisor-pattern sandbox, egress → Claude API only (Rail 2) — fail closed
      -> VERIFY: a SEPARATE grader reproduces each finding in a fresh environment;
         only the proof-of-concept crosses over — unreproduced = not a finding
        -> DEDUPE: judge new vs. known vs. better-example-of-known
          -> TRIAGE: rank by threat-model impact×likelihood; drop test/fixture-code bugs
            -> ROUTE: each real finding → owner (dev's domain routing) + quinn intake +
               → verified-patching (sibling) for the fix
```

## Instructions

1. **Aim before you shoot.** No scan without a current threat model scoping it (build/refresh via the imported skill first). An unscoped scan is downgraded to "exploratory," labeled, and its findings carry lower triage confidence.
2. **Static first, always — and stack-appropriate.** Read/write static review runs first and unsandboxed (it never executes target code — the imported threat-model skill's Step 0 preamble governs). Use the detection signals in `assets/detection-classes-web-llm-2026-07.md` for the stack in play: web + LLM classes are the primary detectors for this deployment (agents are Python/JS/TS + LLM); the harness's ASAN detector is native-code-only. Expect more false positives on non-canary targets; that's what verification is for.
3. **Execution only in the sandbox.** Any finding step that builds or runs target code executes ONLY inside the gVisor-pattern sandbox with egress restricted to the Claude API — the charter's Rail 2, which is literally generalized from this harness. Outside the sandbox it fails closed; there is no override in this department (the harness's `--override` is not exposed).
4. **Verification is a separate grader.** A finding isn't real until a fresh environment (that the finder never touched) reproduces it from the proof-of-concept alone. This kills the "the finder convinced itself" failure mode — the security analogue of quinn's evidence-not-claims rule.
5. **Triage against the threat model, not vibes.** Rank by the model's impact×likelihood; exclude bugs in deliberately-vulnerable test/fixture code (the harness's canary lesson); recalibrate severity to this business's assets. Findings map to threat IDs — a finding with no threat is either a threat-model gap (update it) or noise.
6. **Route, don't hoard.** Every real finding goes three places: the owning builder (dev's domain routing), quinn's intake (it's a gate input and a future regression-map entry), and verified-patching for the fix. aegis finds and coordinates the fix; it does not silently sit on findings.
7. **CVE intake from ops.** maintenance-hygiene's above-patch-level CVEs enter here as seeded findings (evidence attached), scoped against the threat model, and triaged like any other — joint work per ops's boundary.

## Output Format

Findings follow `assets/findings-schema.md` (adapted from the harness's VULN-FINDINGS/TRIAGE shape). Summary to the user:
```
## Vuln Pipeline: [target] — scoped by [THREAT_MODEL.md ref]
Mode: static / execution(sandboxed) · Recon partitions: [n]
Findings: [n raw → n verified → n unique] · Dropped: [fixture/false-positive counts]
Top by threat-model rank: [id · threat-id · severity · owner]
Routed: → quinn intake [ref] · → verified-patching [refs] · → owners [list]
```

## Principles

- **Aim before you shoot** — threat-model-scoped scans, or explicitly-labeled exploratory ones.
- **Static first; execution only in the sandbox, fail closed** — Rail 2 has no departmental override.
- **A separate grader verifies** — the finder doesn't get to grade its own crash.
- **Triage against the threat model** — impact×likelihood on this business's assets, not raw counts.
- **Every finding is routed** — owner + quinn intake + patch; aegis never hoards findings.
- **False positives are expected and killed by verification** — noise upstream is fine; unverified findings shipping downstream is not.

## Fallback

- No sandbox available → execution-mode finding is DISABLED (fail closed); static-only runs proceed, labeled, with a note that execution-verification is unavailable. Never run target code unsandboxed to "just check."
- Harness not connected (autonomous pipeline absent) → the interactive skills' discipline still applies manually (scope → static review → verify by careful re-analysis → triage → route); depth degrades loudly, method holds.
- Stack not yet ported (reference detector is C/C++) → static review + threat-model reasoning carry the run; the /customize port to the business's language/vuln-class is a flagged task.
- Finding disputed as false positive → re-verify in a fresh environment; the verification verdict stands over opinion.

## Boundaries with Other Skills

- **assets/detection-classes-web-llm-2026-07.md** — the concrete find-layer for interpreted + LLM stacks (web OWASP Top 10 + LLM OWASP Top 10 2025), with Python/JS/TS signals. This is aegis's real discovery teeth on the actual stack; the harness pipeline is the native-code path.
- **marketplace/threat-model** (imported) scopes every run; this skill consumes THREAT_MODEL.md and never re-implements threat modeling.
- **secure-code-review** (sibling) is the human-paced deep read of a specific risky diff; this is the breadth scan across a surface. They meet at triage.
- **verified-patching** (sibling) takes routed findings and produces verified fixes; a finding is closed only there.
- **cypher** (adversary, when built): cypher attacks continuously and files findings to quinn; aegis's pipeline is defensive discovery. Overlap (both find bugs) is deliberate redundancy; cypher's Rail 4 cage is cypher's concern, not this skill's.
- **quinn/charter-enforcement**: owns the sandbox this skill's execution mode requires; findings enter quinn's intake and become regression-map entries on close.
- **ops/maintenance-hygiene**: CVE handoff source; joint on above-patch-level severity.
