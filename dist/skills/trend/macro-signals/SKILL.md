---
name: macro-signals
agent: trend
department: Market Intelligence
version: 1.0.0
tier: 3
description: |
  Macro-economic + industry-macro signal tracking. GDP · inflation · rates · sector index · sentiment. Every signal cites source; correlations flagged, causation never claimed. (yvon)
triggers:
  - macro signals
  - what's the macro environment doing?
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Market Intelligence/trend/custom/macro-signals/SKILL.md
  source_hash: 7c77537974c1fb8618043b1b9429f73b80125640ca8c0220a34704833c688b62
  generated: 2026-08-08T16:51:52.787Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Market Intelligence/trend/custom/macro-signals/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js trend -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: trend — Market Intelligence · skill: macro-signals"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"trend\",\"skill\":\"macro-signals\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Market Intelligence/trend/operational/agent/trend-config.md"
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

- Quarterly / annual planning
- Board deck macro slide
- "What's the macro environment doing?"

## Purpose

Track macro-economic + industry-macro signals relevant to the organisation's markets. GDP · inflation · interest rates · sector index · consumer / business sentiment. Highlight when a signal materially shifts.

## Protocol

```
1. CONFIG    signals in scope + source per signal
2. PULL      from public sources (Fed / BLS / ECB / OECD / etc.)
3. DELTA     current vs prior period; sensitivity of our metrics to each signal
4. FLAG      material shifts (per config threshold)
5. RETURN    signal dashboard + top-3 flags
```

## Boundaries & handoffs

- name: macro-signals
- {trigger: "macro", winner: macro-signals}

## Output format

Signal table + delta column + flags.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"trend\",\"skill\":\"macro-signals\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
