---
name: capacity-forecast
agent: capacity
department: Ops & Delivery
version: 1.0.0
tier: 3
description: |
  Forward-looking capacity forecast — 3/6/12 month horizon. Projects capacity gap given committed roadmap + attrition rate. Never assumes 100% retention. (yvon)
triggers:
  - capacity forecast
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Ops & Delivery/capacity/custom/capacity-forecast/SKILL.md
  source_hash: 1b3be0cd16b03958f08ac86097bdbd694c143bb7957b7813aaf24884bf2ce59a
  generated: 2026-08-08T17:03:37.366Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Ops & Delivery/capacity/custom/capacity-forecast/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js capacity -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: capacity — Ops & Delivery · skill: capacity-forecast"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"capacity\",\"skill\":\"capacity-forecast\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Ops & Delivery/capacity/operational/agent/capacity-config.md"
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

Use when the request matches: "capacity forecast".

## Purpose

Forward capacity projection over 3/6/12 months. Committed roadmap vs projected capacity minus attrition = gap.

## Protocol

```
1. HORIZON    3 / 6 / 12 month projection
2. BASELINE   current capacity from capacity-model
3. ATTRITION  apply operator-set attrition rate to team-months
4. ROADMAP    committed work from vista (roadmap) + spec (PRDs)
5. GAP        capacity - roadmap-demand = gap per horizon
6. RETURN     forecast + gap severity + hiring recommendation
```

## Boundaries & handoffs

- name: capacity-forecast
- {trigger: "hiring needs", winner: capacity-forecast}

## Output format

Timeline chart + gap table + hiring/build-vs-buy recommendation.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"capacity\",\"skill\":\"capacity-forecast\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
