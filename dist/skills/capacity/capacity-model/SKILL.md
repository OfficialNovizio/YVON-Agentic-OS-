---
name: capacity-model
agent: capacity
department: Ops & Delivery
version: 1.0.0
tier: 3
description: |
  Per-team + per-agent (AI) capacity model. FTE-months available · committed · in-flight. Feeds pace/delivery-forecast + felix/budget-scenarios. Never counts on unauthorised overtime. (yvon)
triggers:
  - capacity model
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Ops & Delivery/capacity/custom/capacity-model/SKILL.md
  source_hash: 894fdf7bcd6bd9cad78414160cc3c9ad1d87b3210550071d5762d7d6dd7363b2
  generated: 2026-08-08T17:03:37.368Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Ops & Delivery/capacity/custom/capacity-model/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js capacity -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: capacity — Ops & Delivery · skill: capacity-model"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"capacity\",\"skill\":\"capacity-model\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Use when the request matches: "capacity model".

## Purpose

Per-team + per-AI-agent capacity — available · committed · in-flight · buffer.

## Protocol

```
1. INTAKE     team roster + agent roster + PTO calendar
2. AVAILABLE  FTE-months minus PTO minus meetings-overhead
3. COMMITTED  from pace/velocity-tracking + planned commitments
4. GAP        available - committed = buffer (± sign)
5. RETURN     per-team/agent capacity table + over/under-commit flags
```

## Boundaries & handoffs

- {name: capacity-model, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
- {trigger: "capacity", winner: capacity-model}

## Output format

Per-team table + agent-level table (AI agents) + flags.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"capacity\",\"skill\":\"capacity-model\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
