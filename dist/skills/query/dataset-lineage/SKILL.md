---
name: dataset-lineage
agent: query
department: Data & Analytics
version: 1.0.0
tier: 3
description: |
  Trace dataset lineage — source pipelines (dana) → warehouse datasets (catalog) → downstream consumers (metrics registry + dashboards + reports). When a source changes, surface every downstream impact. (yvon)
triggers:
  - dataset lineage
  - why did this dashboard number change
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Data & Analytics/query/custom/dataset-lineage/SKILL.md
  source_hash: 8e0afc5f1da9202c3db9d12761ccf5b6e500011ac79fdc11c6992ffbcd969d30
  generated: 2026-08-08T16:41:44.115Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Data & Analytics/query/custom/dataset-lineage/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js query -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: query — Data & Analytics · skill: dataset-lineage"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"query\",\"skill\":\"dataset-lineage\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Data & Analytics/query/operational/agent/query-config.md"
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

- Impact analysis before schema change / pipeline change / dataset retirement.
- Debug: "why did this dashboard number change" → lineage points to upstream shift.

Do NOT use for: dataset registration (→ `warehouse-catalog`) · query execution (→ `sql-optimization`).

## Purpose

Given a dataset, return upstream (source pipeline + upstream datasets) and downstream (metrics + dashboards + reports + saved queries consuming it).

## Protocol

```
1. INPUT     dataset name or metric slug or dashboard name
2. UPSTREAM  walk backward: catalog → pipeline → source
3. DOWNSTREAM walk forward: catalog → metrics → dashboards → reports
4. RETURN    lineage tree with dependency count + change-impact summary
```

## Boundaries & handoffs

- name: dataset-lineage
- {trigger: "lineage", winner: dataset-lineage}

## Output format

Lineage tree (indented text or graph if `viz` available) + impact summary.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"query\",\"skill\":\"dataset-lineage\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
