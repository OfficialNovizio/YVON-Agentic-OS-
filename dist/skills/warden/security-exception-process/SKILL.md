---
name: security-exception-process
agent: warden
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  Real businesses need exceptions — a legacy system that can't do MFA yet, a vendor without a DPA during a pilot. (yvon)
triggers:
  - security exception process
  - can we get an exception for x
  - waiver
  - we can't meet control y yet
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: risk-owning-ciso
provenance:
  source_file: Teams/Cybersecurity/warden/custom/security-exception-process/SKILL.md
  source_hash: d90e71c8f46296b5abf23789440c548dd2bc2e6c2d2cdd091a23bbdabd3b6ade
  generated: 2026-08-08T19:52:18.905Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/warden/custom/security-exception-process/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js warden -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: warden — Cybersecurity · skill: security-exception-process"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"security-exception-process\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Cybersecurity/warden/operational/agent/warden-config.md"
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

- Something needs to violate a security policy temporarily.
- "Can we get an exception for X," "waiver," "we can't meet control Y yet."
- Exception review/expiry cadence.

## Purpose

Real businesses need exceptions — a legacy system that can't do MFA yet, a vendor without a DPA during a pilot. The danger isn't the exception; it's the *permanent, forgotten* exception that quietly becomes the breach. This process makes exceptions safe: bounded, mitigated, owned, and self-expiring.

## Protocol

REQUEST (what policy/control is being excepted, why, for how long) → COMPENSATING CONTROL (what reduces the risk meanwhile — a partial mitigation is required; "just ignore the control" is denied) → RISK + OWNER (the residual risk → warden's risk-register; a named owner accountable) → APPROVE (time-boxed; high-risk exceptions route to board like any risk acceptance) → EXPIRY (a hard expiry date; at expiry the exception is closed or explicitly renewed — never silently extended; **fail-closed** — an expired exception reverts to the policy) → TRACK (append-only register; the count of open exceptions is itself a risk signal).

## Boundaries & handoffs

policy violation needed ─► security-exception-process (time-boxed + compensating control + fail-closed expiry)

## Output format

```

## Voice

Active identity: risk-owning-ciso — see `identity/risk-owning-ciso.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"warden\",\"skill\":\"security-exception-process\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
