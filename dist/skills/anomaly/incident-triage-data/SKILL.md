---
name: incident-triage-data
agent: anomaly
department: Data & Analytics
version: 1.0.0
tier: 3
description: |
  Investigates a fired data-anomaly alert. Descriptive-first Tukey EDA on the affected metric window · upstream dataset check via query/dataset-lineage · pipeline-health cross-check via dana · triage verdict + assignee. Distinct from cortex (security) and warden (system risk). (yvon)
triggers:
  - incident triage data
  - why did x spike
  - is this real
  - triage this alert
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Data & Analytics/anomaly/custom/incident-triage-data/SKILL.md
  source_hash: 70abee66d379b8a4957863389749366e74093425547122e1b5f34394e9090720
  generated: 2026-08-08T16:41:44.177Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Data & Analytics/anomaly/custom/incident-triage-data/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js anomaly -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: anomaly — Data & Analytics · skill: incident-triage-data"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anomaly\",\"skill\":\"incident-triage-data\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Data & Analytics/anomaly/operational/agent/anomaly-config.md"
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

- Alert fires and needs investigation before routing further.
- Manual: "why did X spike" · "is this real" · "triage this alert".

## Purpose

Given a fired alert, run structured investigation → verdict → assignee.

Verdicts: **real anomaly** (assign) · **false positive** (tune rule) · **known event** (annotate + suppress this instance) · **data-quality issue** (route to `dana`).

## Protocol

```
1. CONTEXT   pull alert + rule + metric + affected window
2. DESCRIBE  Tukey 5-number summary on window + wider baseline
3. UPSTREAM  dataset-lineage → check pipeline health via dana
4. KNOWN     check known-events log (deploys, campaigns, holidays)
5. VERDICT   real / false-positive / known / data-quality
6. HANDOFF   per verdict
```

## Boundaries & handoffs

- name: incident-triage-data
- {trigger: "triage this alert", winner: incident-triage-data}

## Output format

Investigation memo: alert · context · descriptive stats · upstream check · known-events check · verdict · assignee + rationale.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anomaly\",\"skill\":\"incident-triage-data\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
