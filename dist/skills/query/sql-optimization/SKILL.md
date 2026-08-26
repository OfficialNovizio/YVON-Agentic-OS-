---
name: sql-optimization
agent: query
department: Data & Analytics
version: 1.0.0
tier: 3
description: |
  Query authorship + review + execution against the warehouse. Enforces catalog-registered datasets only. EXPLAIN + cost estimate before execution on any expected-large query. Never mutates data (analytical only). (yvon)
triggers:
  - sql optimization
  - write a query for x
  - sql for y
  - run this query
  - optimize this sql
  - explain plan
allowed-tools:
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Data & Analytics/query/custom/sql-optimization/SKILL.md
  source_hash: b154e98a6601898e215039f1a5b8fdbf42029b6d5414f9ceecd03b66a37a2a25
  generated: 2026-08-08T16:41:44.118Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Data & Analytics/query/custom/sql-optimization/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js query -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: query — Data & Analytics · skill: sql-optimization"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"query\",\"skill\":\"sql-optimization\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "Write a query for X" · "SQL for Y" · "run this query" · "optimize this SQL" · "explain plan"

Do NOT use for: pipeline definition (→ `dana`) · dataset catalog (→ `warehouse-catalog`) · analytical narrative (→ `insight`).

## Purpose

Write, review, optimize, and execute SQL against the warehouse. Every query references catalog-registered datasets only; large queries surface EXPLAIN + cost estimate before execution.

## Protocol

```
1. VALIDATE   confirm datasets referenced exist in catalog + fresh
2. AUTHOR     write SQL against catalog schema
3. EXPLAIN    if expected-large (per config threshold) → EXPLAIN + cost estimate
4. APPROVE    if cost > threshold → operator approval before execution
5. EXECUTE    run against warehouse (read-only)
6. RETURN     dataset + query text + cost + execution time
```

## Boundaries & handoffs

- name: sql-optimization
- {trigger: "SQL for X", winner: sql-optimization}

## Output format

Dataset + query + cost.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"query\",\"skill\":\"sql-optimization\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
