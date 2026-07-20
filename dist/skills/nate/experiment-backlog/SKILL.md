---
name: experiment-backlog
agent: nate
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Growth work fails as scattered enthusiasm: ten half-run tests, no pre-registered metrics, wins nobody operationalized, and losses re-attempted quarterly. (yvon)
triggers:
  - experiment backlog
  - next experiment
  - growth test
  - add to the backlog
  - what should we test
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/nate/custom/experiment-backlog/SKILL.md
  source_hash: 75c31627ccf65c83a53e722a9ade144c539825d3fe72947a58fb1708b2173ac7
  generated: 2026-07-20T03:20:23.704Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/nate/custom/experiment-backlog/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js nate -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: nate — Brand Studio · skill: experiment-backlog"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nate\",\"skill\":\"experiment-backlog\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/nate/operational/agent/nate-config.md"
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

Triggers: "next experiment," "growth test," "add to the backlog," "what should we test," "what did we learn from [test]."

## Purpose

Growth work fails as scattered enthusiasm: ten half-run tests, no pre-registered metrics, wins nobody operationalized, and losses re-attempted quarterly. The backlog makes it a system: everything proposed gets scored, the top item runs properly (the sibling ab-test-analysis skill enforces the stats), and every result compounds.

## Protocol

```
Intake (ideas from muse, funnel-analysis' recommended experiments, rio/pulse/kai observations,
        the operator) → each becomes a backlog entry: hypothesis + metric + ICE score
  -> Prioritize: ICE descending; capacity honest (1–3 concurrent max; non-overlapping audiences)
    -> Run the top item: PRE-REGISTER metric + MDE + duration (ab-test-analysis' discipline)
       — no peeking, no mid-test goal-moving
      -> Analyze via ab-test-analysis → ship / extend / stop / investigate
        -> LOG: result, lesson, decision — then GRADUATE wins to their owning agent
           and archive losses with cause
```

## Boundaries & handoffs

experiment-backlog     (QUEUE — ICE-scored, capacity-honest, pre-registered; the discipline)

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nate\",\"skill\":\"experiment-backlog\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
