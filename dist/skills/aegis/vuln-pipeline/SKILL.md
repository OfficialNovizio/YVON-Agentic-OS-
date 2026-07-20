---
name: vuln-pipeline
agent: aegis
department: Engineering
version: 1.0.0
tier: 3
description: |
  Scanning without a threat model finds noise; a threat model without scanning is a wish. (yvon)
triggers:
  - vuln pipeline
  - scan for vulnerabilities
  - run the vuln pipeline
  - triage these findings
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/aegis/custom/vuln-pipeline/SKILL.md
  source_hash: e09c68eb8e8579badc7159e1bac8e56cf29d7968ec82afbab6019f6692c06b51
  generated: 2026-07-20T03:20:22.446Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/aegis/custom/vuln-pipeline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js aegis -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: aegis — Engineering · skill: vuln-pipeline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"aegis\",\"skill\":\"vuln-pipeline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/aegis/operational/agent/aegis-config.md"
if [ -f "$_CFG" ]; then
  _FILLS=$(grep -c "<FILL_IN>" "$_CFG" 2>/dev/null || echo 0)
  echo "CONFIG: $_CFG"
  echo "CONFIG_UNFILLED_FIELDS: $_FILLS"
  if [ "$_FILLS" -gt 0 ]; then
    echo "⚠️ DEGRADE LOUDLY: $_FILLS config fields are <FILL_IN>. Ask the operator before relying on any of them — do NOT improvise values."
    grep -n "<FILL_IN>" "$_CFG" 2>/dev/null | head -10 || true
  fi
else
  echo "⚠️ CONFIG MISSING: $_CFG — every config-dependent decision must be asked, not assumed."
fi
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Triggers: "scan for vulnerabilities," "run the vuln pipeline," "find bugs in [target]," "triage these findings," a new threat model landing, a CVE arriving from ops's maintenance-hygiene, risky-diff referral from dev's review, and scheduled scans (config cadence).

## Purpose

Scanning without a threat model finds noise; a threat model without scanning is a wish. The pipeline joins them: the threat model (imported skill) scopes what to look for, the scan finds candidates, verification kills false positives (the harness's separate-grader-reproduces-the-crash discipline), dedupe collapses repeats, triage ranks against the threat model, and routing sends each real finding to its owner. aegis defends; the caged adversary (cypher) attacks — this is the defensive half.

## Protocol

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

## Boundaries & handoffs

vuln-pipeline (breadth: recon→find→verify→dedupe→triage→route)  ◄── ops CVE handoff
- "Scan / find vulns / triage findings" → **vuln-pipeline** (threat-model-scoped; static first, execution only in sandbox).

## Output format

Findings follow `assets/findings-schema.md` (adapted from the harness's VULN-FINDINGS/TRIAGE shape). Summary to the user:
```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"aegis\",\"skill\":\"vuln-pipeline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
