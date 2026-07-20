---
name: degradation-diagnosis
agent: forge
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Fixing the wrong layer wastes a cycle and hides the real cause. (yvon)
triggers:
  - degradation diagnosis
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/forge/custom/degradation-diagnosis/SKILL.md
  source_hash: c03a11deb1e15059f3bc7c6f6b368217c59abb81cce974a9627bfce5cb0492ea
  generated: 2026-07-20T03:20:22.117Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/forge/custom/degradation-diagnosis/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js forge -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: forge — AI & Agents · skill: degradation-diagnosis"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"forge\",\"skill\":\"degradation-diagnosis\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/forge/operational/agent/forge-config.md"
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

- gauge's degradation-routing delivers a case (operational or behavioral class).
- A fix was applied but re-measurement failed (case reopened — diagnosis was wrong or partial).

## Purpose

Fixing the wrong layer wastes a cycle and hides the real cause. One skill owns differential diagnosis so cases don't ping-pong.

## Protocol

RECEIVE (evidence bundle — no bundle, send it back) → TIMELINE (what changed near onset: proposal IDs, version events, tool changes from relay's registry, golden-set edits) → HYPOTHESIZE (ranked differential across the five layers below) → TEST (cheapest discriminating test first — often a golden-set re-run pinned to the prior version, or a benchmark comparison) → VERDICT (layer + evidence) → ROUTE.

## Boundaries & handoffs

gauge case ─► degradation-diagnosis ─verdict─► anneal / relay / ops / operator / technique-adoption

## Output format

Diagnosis memo: case ID, timeline, differential table (layer / evidence for / against), discriminating tests run, verdict + confidence, route.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"forge\",\"skill\":\"degradation-diagnosis\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
