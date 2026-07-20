---
name: benchmarking-discipline
agent: forge
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Un-disciplined benchmarks (cherry-picked tasks, scorer knows the candidate, single runs) produce confident nonsense that then drives routing. (yvon)
triggers:
  - benchmarking discipline
  - would the alternative do better?
allowed-tools:
  - Write
  - Agent
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/forge/custom/benchmarking-discipline/SKILL.md
  source_hash: 02f137ab407de81bf5ee8973b5198216a3d036c1183d2a5fc86e94f24b7a84ee
  generated: 2026-07-20T03:20:22.112Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/forge/custom/benchmarking-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js forge -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: forge — AI & Agents · skill: benchmarking-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"forge\",\"skill\":\"benchmarking-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A new model/technique candidate needs numbers (from technique-adoption or edge's pilots).
- A degradation diagnosis needs a "would the alternative do better?" comparison.
- Periodic re-benchmark of incumbents (`<FILL_IN: cadence, suggested per provider release cycle>`).

## Purpose

Un-disciplined benchmarks (cherry-picked tasks, scorer knows the candidate, single runs) produce confident nonsense that then drives routing. The discipline is the product.

## Protocol

SET (use the operator's golden task set — same set gauge uses; never a bespoke set per benchmark) → RUN (all candidates on identical inputs, configs recorded) → SCORE BLIND (scorer — human or rubric — must not know which output came from which candidate) → REPLICATE (≥ `<FILL_IN: suggested 5>` runs per task where variance matters; single samples lie) → COST (full cost per task: tokens, latency, retries) → FRONTIER (registry update).

## Boundaries & handoffs

candidate (edge pilot, scout scan, request) ─► technique-adoption ─► benchmarking-discipline ─► model-technique-registry

## Output format

Benchmark report: setup block (reproducibility), per-task-type score tables with variance, cost table, frontier delta, verdict (`adopt-candidate / no-difference / incumbent-wins`), confidence flag.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"forge\",\"skill\":\"benchmarking-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
