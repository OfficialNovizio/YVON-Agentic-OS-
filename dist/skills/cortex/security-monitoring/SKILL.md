---
name: security-monitoring
agent: cortex
department: Cybersecurity
version: 1.0.0
tier: 3
description: |
  Security monitoring turns raw alerts into managed incidents. (yvon)
triggers:
  - security monitoring
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Cybersecurity/cortex/custom/security-monitoring/SKILL.md
  source_hash: 19b17934fe0ab58c9bded739ebc4e308f607b9bd1b949c3d51dad95f8830bed2
  generated: 2026-08-08T19:03:21.231Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Cybersecurity/cortex/custom/security-monitoring/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js cortex -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: cortex — Cybersecurity · skill: security-monitoring"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cortex\",\"skill\":\"security-monitoring\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Cybersecurity/cortex/operational/agent/cortex-config.md"
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

- An alert fires in the SIEM.
- A detection rule needs triage queueing.
- An incident's severity needs classification.
- A runbook needs to be executed for a known scenario.
- Post-incident review needs to be conducted.

## Purpose

Security monitoring turns raw alerts into managed incidents. Without a structured triage process, alerts pile up, real incidents get buried in noise, and severity is inconsistent. This skill provides the discipline to triage consistently, classify accurately, and respond systematically.

## Protocol

```
ALERT INGEST (from detection-engineering rules, SIEM, or external feeds)
  → TRIAGE (Elastic workflow: fetch → investigate → classify)
    → CLASSIFY per Incident Commander severity: SEV1 / SEV2 / SEV3 / SEV4
      → ASSIGN runbook (if known scenario) or escalate
        → DOCUMENT in case management (Elastic cases)
          → RESPOND per runbook or escalation path
            → POST-INCIDENT (Incident Commander template: timeline, communication log, lessons)
```

## Boundaries & handoffs

TRIAGE  ──► security-monitoring (severity classification → SEV1-SEV4)

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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cortex\",\"skill\":\"security-monitoring\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
