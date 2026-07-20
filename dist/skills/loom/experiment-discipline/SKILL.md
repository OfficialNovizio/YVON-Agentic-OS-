---
name: experiment-discipline
agent: loom
department: Product
version: 1.0.0
tier: 3
description: |
  An experiment whose success bar is set after seeing the data proves whatever the runner wanted — it's theater. (yvon)
triggers:
  - experiment discipline
  - test-first
allowed-tools:
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/loom/custom/experiment-discipline/SKILL.md
  source_hash: 3929aaee34b9312502fde84afed0aa0a10af333778d88a2d7ea852a7c4defd6a
  generated: 2026-07-20T03:20:23.281Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/loom/custom/experiment-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js loom -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: loom — Product · skill: experiment-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"loom\",\"skill\":\"experiment-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Product/loom/operational/agent/loom-config.md"
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

- An assumption from assumption-mapping is risky enough to test (the riskiest-first hand-in).
- spec routes a "test-first" verdict (opportunity-assessment says validate before building).
- price needs a monetization hypothesis tested (revenue experiments, extra blast-radius rules).

## Purpose

An experiment whose success bar is set after seeing the data proves whatever the runner wanted — it's theater. Freezing the criteria and the decision rule before running is what makes an experiment able to change a mind, including the runner's.

## Protocol

HYPOTHESIS (a falsifiable belief: "≥X% of new users will do Y" — not "users will like it") → CHEAPEST FALSIFYING TEST (the smallest test that could prove it WRONG — fake door, prototype, concierge, A/B; expensive builds are the last resort, not the first) → DECISION RULE (pre-set: "if the metric clears T, we do A; if not, we do B" — written before running, no post-hoc bar) → CRITERIA FREEZE (success metric pinned `metric:@vN` via experiment-instrumentation; criteria hashed/locked, echo-confirmed — proto's frozen-eval pattern) → RUN (metric verifies instruments live first; under-powered = flagged before running) → VERDICT (against the frozen rule, honestly) → REGISTRY (adopt/reject recorded, experiment-registry).

## Boundaries & handoffs

experiment-discipline (cheapest falsifying test; decision rule + criteria FROZEN)

## Output format

Experiment card: hypothesis · test type (+ why cheapest) · decision rule (pre-set) · frozen criteria (metric@vN, hash) · power/sample (flagged) · verdict → registry.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"loom\",\"skill\":\"experiment-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
