---
name: experiment-instrumentation
agent: metric
department: Product
version: 1.1.0
tier: 3
description: |
  An experiment measured by an event that never fired produces a confident null result — the worst outcome, because it looks like a real answer. (yvon)
triggers:
  - experiment instrumentation
allowed-tools:
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/metric/custom/experiment-instrumentation/SKILL.md
  source_hash: 03ffbfac687088956c1c04023b12ad94ebca6f18f790c774b4e790aa63cc52fc
  generated: 2026-07-29T22:20:50.896Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/metric/custom/experiment-instrumentation/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js metric -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: metric — Product · skill: experiment-instrumentation"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"metric\",\"skill\":\"experiment-instrumentation\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Product/metric/operational/agent/metric-config.md"
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

- loom freezes an experiment's criteria and needs its measures wired (the hand-in from experiment-discipline).
- A metric an experiment depends on is new or changed (re-verify before reuse).
- An experiment's read looks impossible (instrumentation-gap suspicion mid-run).

## Purpose

An experiment measured by an event that never fired produces a confident null result — the worst outcome, because it looks like a real answer. This skill makes "the instruments work" a precondition of running, not a post-mortem discovery.

## Protocol

DEFINE (the experiment's primary + guardrail metrics are named, each pinned to `metric:<name>@vN` from product-metrics-spec — never a fresh local metric) → INSTRUMENT (missing events become instrumentation requests to Engineering, not assumptions) → VERIFY LIVE (fire a test event / check recent volume — the metric demonstrably emits before the experiment opens; unverified = experiment BLOCKED) → SAMPLE/POWER (minimum detectable effect + sample size stated; the `<FILL_IN: power/significance defaults — reasoning-based until the stats book>` flag rides every calc) → HANDBACK (verified instrument set → loom's registry entry; the experiment may now run).

## Boundaries & handoffs

loom freezes an experiment ─► experiment-instrumentation (verify-live BEFORE run) ─► loom registry

## Output format

Experiment instrument sheet: primary metric@vN · guardrails@vN · verify-live evidence · sample/power (flagged) · BLOCKED/READY verdict → loom registry ref.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"metric\",\"skill\":\"experiment-instrumentation\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
