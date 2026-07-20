---
name: infra-vuln-management
agent: bastion
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  Unpatched infrastructure is the most common initial access vector in real breaches. (yvon)
triggers:
  - infra vuln management
  - are we vulnerable to x
  - what's our patch status
  - cve-202x-xxxx
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/bastion/custom/infra-vuln-management/SKILL.md
  source_hash: 4987a6e8b095b5b6c9dde3f94742239254a7b7a3ff979a933e9dae63a494100d
  generated: 2026-07-20T03:20:23.010Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/bastion/custom/infra-vuln-management/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js bastion -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: bastion — Cybersecurity · skill: infra-vuln-management"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bastion\",\"skill\":\"infra-vuln-management\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A new CVE is published affecting the infrastructure stack.
- Schedule-driven vulnerability scan.
- "Are we vulnerable to X," "what's our patch status," "CVE-202X-XXXX."
- Patch compliance reporting.

## Purpose

Unpatched infrastructure is the most common initial access vector in real breaches. A structured vulnerability management program — with defined scan cadences, severity thresholds, patch SLAs, and exception processes — turns "we need to patch" from a fire drill into a routine.

## Protocol

```
SCAN (on cadence: OS packages, cloud infra services, container base images, network appliances)
  → IDENTIFY (CVE · affected asset · severity per CVSS or vendor)
    → CLASSIFY (critical/high/medium/low per CVSS + business context)
      → PRIORITIZE (severity × exploitability × asset criticality)
        → TREAT (patch → ops/operator / mitigate → compensating control / accept → warden exception)
          → TRACK (finding status: open / patched / exception-approved / false-positive)
            → REPORT (patch compliance, SLA adherence, trends)
```

## Boundaries & handoffs

CVE / patch cycle ─► infra-vuln-management (OS/cloud/infra CVE scan, patch SLA, exception routing)

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bastion\",\"skill\":\"infra-vuln-management\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
