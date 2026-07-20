---
name: roadmap-sync
agent: vista
department: Executive Office
version: 1.0.0
tier: 3
description: |
  Plans drift quietly. A roadmap item that slips one sprint rarely announces itself; by the time it has slipped three, the quarter is unrecoverable. (yvon)
triggers:
  - roadmap sync
  - roadmap drift
  - are we on plan
  - sync the roadmap
  - sprint review vs roadmap
  - what's slipping
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Executive Office/vista/custom/roadmap-sync/SKILL.md
  source_hash: e24e6b22db542c0edb34537051562ce6ae4af17e67f8be8e5d9a0cb522768437
  generated: 2026-07-20T03:20:24.257Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Executive Office/vista/custom/roadmap-sync/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js vista -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: vista — Executive Office · skill: roadmap-sync"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"vista\",\"skill\":\"roadmap-sync\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Executive Office/vista/operational/agent/vista-config.md"
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

Triggers: "roadmap drift," "are we on plan," "sync the roadmap," "sprint review vs roadmap," "what's slipping," or on a recurring cadence (typically once per sprint, after sprint output is known).

Not for: sequencing what goes ON the roadmap (that's `rice-prioritization`), or grading quarter-end outcomes (that's `okr-quality-checker`).

## Purpose

Plans drift quietly. A roadmap item that slips one sprint rarely announces itself; by the time it has slipped three, the quarter is unrecoverable. This skill gives vista a repeatable checkpoint that surfaces slippage early, classifies it consistently, and converts every flagged item into a decision-ready recommendation for marcus — rather than a status report nobody acts on.

## Protocol

```
Establish baseline (committed roadmap + sprint targets — if none exists, stop)
  -> Collect actuals per item (sprint output, status — never assumed)
    -> Compute drift via scripts/roadmap_sync.py (slip = projected − committed sprint)
      -> Classify: on-track (≤0) / watch (1) / flagged (≥2, configurable)
        -> Propose per flagged item: cut / defer / accelerate, with trade-offs
          -> Route: flagged items + recommendations to marcus; delivery-owner notified
```

## Boundaries & handoffs

- **handoffs**: runs only against a committed roadmap; cut/defer/accelerate decisions escalate to marcus

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"vista\",\"skill\":\"roadmap-sync\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
