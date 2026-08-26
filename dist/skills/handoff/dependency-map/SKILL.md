---
name: dependency-map
agent: handoff
department: Ops & Delivery
version: 1.0.0
tier: 3
description: |
  Cross-team dependency graph. Static (org-chart of who-needs-whom for what) + dynamic (in-flight handoffs). Feeds pace/delivery-forecast + capacity/capacity-forecast. (yvon)
triggers:
  - dependency map
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Ops & Delivery/handoff/custom/dependency-map/SKILL.md
  source_hash: 75d0c37a11add79f4643c0f18df1042b8cccbb76e8b74797f0c539f70672442c
  generated: 2026-08-08T17:03:37.391Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Ops & Delivery/handoff/custom/dependency-map/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js handoff -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: handoff — Ops & Delivery · skill: dependency-map"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"handoff\",\"skill\":\"dependency-map\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Ops & Delivery/handoff/operational/agent/handoff-config.md"
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

Use when the request matches: "dependency map".

## Purpose

Static + dynamic cross-team dependency map. Static = "team A regularly needs team B for X". Dynamic = specific in-flight handoffs.

## Protocol

```
1. STATIC    register recurring dependencies
2. DYNAMIC   overlay from handoff-registry active handoffs
3. CRITICAL  identify critical path across teams
4. RETURN    graph + critical-path list
```

## Boundaries & handoffs

- name: dependency-map
- {trigger: "dependency", winner: dependency-map}

## Output format

Graph (via viz) + critical-path list + bottleneck teams.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"handoff\",\"skill\":\"dependency-map\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
