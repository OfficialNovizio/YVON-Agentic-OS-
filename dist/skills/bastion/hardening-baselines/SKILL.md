---
name: hardening-baselines
agent: bastion
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  Defaults are convenient, not secure — a default OS install, an unhardened container image, a laptop with no disk encryption. (yvon)
triggers:
  - hardening baselines
  - harden this
  - config baseline
  - is this box secure
  - cis benchmark
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/bastion/custom/hardening-baselines/SKILL.md
  source_hash: c2df8374230ddaa65ec3a75b72a3ac436592b53ffe3a74d514444a0af000d57e
  generated: 2026-07-20T03:20:23.006Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/bastion/custom/hardening-baselines/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js bastion -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: bastion — Cybersecurity · skill: hardening-baselines"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bastion\",\"skill\":\"hardening-baselines\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Cybersecurity/bastion/operational/agent/bastion-config.md"
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

- Provisioning a new server/service/endpoint/image.
- "Harden this," "config baseline," "is this box secure," "CIS benchmark."
- Baseline compliance scan on cadence; after config changes.

## Purpose

Defaults are convenient, not secure — a default OS install, an unhardened container image, a laptop with no disk encryption. A defined baseline turns "is this configured securely" into a measurable check, and closes the drift between "how it should be set up" and "how it actually is."

## Protocol

DEFINE (the baseline per platform, from CIS Benchmarks: OS, cloud service, container, endpoint — dated, because platforms change) → MEASURE (actual config vs baseline → deviations) → PRIORITIZE (deviations by exploitability × exposure) → SPEC (bastion writes the hardening; operator/ops applies — via IaC where possible so it's repeatable, not manual) → ENDPOINTS (laptops: disk encryption, screen lock, patch level, EDR — the human-device attack surface) → RE-MEASURE (drift: config that reverts to insecure is a finding + a process gap).

## Boundaries & handoffs

hardening baseline check ─► hardening-baselines (CIS-style config baselines: OS, cloud, endpoints, containers)

## Output format

```

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bastion\",\"skill\":\"hardening-baselines\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
