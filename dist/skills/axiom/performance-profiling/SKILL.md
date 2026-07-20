---
name: performance-profiling
agent: axiom
department: Engineering
version: 1.0.0
tier: 3
description: |
  Engineers optimize the wrong thing constantly: the clever rewrite of a function that wasn't the bottleneck, the micro-optimization the compiler already did, the "obviously faster" change that's slower. (yvon)
triggers:
  - performance profiling
  - optimize this
  - why is this slow
  - is this change faster
  - profile it
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/axiom/custom/performance-profiling/SKILL.md
  source_hash: c664321ec7b73b773a0a10bacffd6d335471716f7e078950bb4b24b3691b5a5e
  generated: 2026-07-20T03:20:22.503Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/axiom/custom/performance-profiling/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js axiom -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: axiom — Engineering · skill: performance-profiling"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"axiom\",\"skill\":\"performance-profiling\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/axiom/operational/agent/axiom-config.md"
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

Triggers: "optimize this," "why is this slow," "is this change faster," "profile it," a performance complaint, a complexity-analysis that said constants dominate, and ops's monitoring showing a latency regression.

## Purpose

Engineers optimize the wrong thing constantly: the clever rewrite of a function that wasn't the bottleneck, the micro-optimization the compiler already did, the "obviously faster" change that's slower. Profiling replaces intuition with measurement — you optimize what the profile says is hot, and you keep the change only if the numbers improve.

## Protocol

```
A performance question
  -> MEASURE FIRST: profile under a realistic workload → find the actual hot spot
     (never optimize before profiling — intuition about bottlenecks is usually wrong)
    -> Analyze: is it algorithmic (complexity-analysis) or constant-factor (implementation)?
      -> Change ONE thing
        -> MEASURE AGAIN: same workload, same conditions → did it improve, by how much?
          -> Record (assets/benchmark-record-template.md): workload · before · after · delta · conditions
            -> No improvement → REVERT (an unmeasured "optimization" is just risk)
```

## Boundaries & handoffs

- "Optimize / why slow / is this change faster / profile" → **performance-profiling** (measure first).
- Predict vs measure: complexity-analysis predicts, performance-profiling confirms; disagreement → trust the measurement.
- **ops**: latency regressions in monitoring route to performance-profiling; benchmark numbers feed baselines.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"axiom\",\"skill\":\"performance-profiling\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
