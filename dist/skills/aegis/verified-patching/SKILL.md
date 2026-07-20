---
name: verified-patching
agent: aegis
department: Engineering
version: 1.0.0
tier: 3
description: |
  A patch that stops the specific PoC but leaves the vulnerability class open is theater — the attacker adjusts the input and re-breaks it. (yvon)
triggers:
  - verified patching
  - patch this vulnerability
  - verify this security fix
  - is this finding closed
allowed-tools:
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/aegis/custom/verified-patching/SKILL.md
  source_hash: 0a6c68ec1837fe85d8216cf6b1bd2ae4f66d00cb4a3466f942d4e20f17e8a7f5
  generated: 2026-07-20T03:20:22.442Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/aegis/custom/verified-patching/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js aegis -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: aegis — Engineering · skill: verified-patching"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"aegis\",\"skill\":\"verified-patching\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: a routed finding from vuln-pipeline or secure-code-review, "patch this vulnerability," "verify this security fix," "is this finding closed," CVE remediation from ops, and any fix claiming to close a security finding.

## Purpose

A patch that stops the specific PoC but leaves the vulnerability class open is theater — the attacker adjusts the input and re-breaks it. A patch that fixes the bug but breaks a test or the build is a new incident. The four checks close all four gaps: the fix works, the exploit dies, nothing regresses, and the *class* (not just the instance) is closed. Only then is the finding closed and the fragility mapped.

## Protocol

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

## Boundaries & handoffs

- "Patch / verify this fix / is it closed" → **verified-patching** (four checks, or not closed).
- **cypher** (adversary, when built): runs verified-patching's check 4 independently (Rail 4, caged); its re-attacks are the trustworthy version of "can't re-break." Until built, aegis self-checks, labeled.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"aegis\",\"skill\":\"verified-patching\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
