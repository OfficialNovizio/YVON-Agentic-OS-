---
name: model-technique-registry
agent: forge
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Model choice quietly dominates cost and quality. (yvon)
triggers:
  - model technique registry
  - which model/technique for x?
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/forge/custom/model-technique-registry/SKILL.md
  source_hash: d4fe459d71a5e91d4f8b30eb82d05787be844f2706fd90537ed35ab02a0d14e6
  generated: 2026-07-20T03:20:22.121Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/forge/custom/model-technique-registry/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js forge -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: forge — AI & Agents · skill: model-technique-registry"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"forge\",\"skill\":\"model-technique-registry\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Which model/technique for X?" — any routing question.
- A benchmark run (benchmarking-discipline) produces new results.
- A provider releases/changes a model (version event from gauge's llm-ops).

## Purpose

Model choice quietly dominates cost and quality. Without a registry, every routing decision re-litigates from memory; with one, it cites a measured frontier.

## Protocol

RECORD (model/technique, version, per-task-type cost + quality scores, date, benchmark ref) → FRONTIER (cost-quality per task type — dominated options marked) → RECOMMEND (routing rec per task type, confidence-flagged) → HAND OFF (recs are Rail 3 proposals when they change an agent's config; the operator/platform decides — model choice is operator config, never skill-forced).

## Boundaries & handoffs

candidate (edge pilot, scout scan, request) ─► technique-adoption ─► benchmarking-discipline ─► model-technique-registry
version event (gauge llm-ops) ─► model-technique-registry (record) ─► re-benchmark if frontier-relevant

## Output format

Registry table rows (append-only history like every fleet registry); frontier summaries per task type; routing recs as short memos with migration-cost and confidence lines.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"forge\",\"skill\":\"model-technique-registry\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
