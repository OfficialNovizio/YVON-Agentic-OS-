---
name: test-strategy
agent: quinn
department: Engineering
version: 1.0.0
tier: 3
description: |
  Without a strategy, testing is whatever each agent felt like writing — heavy where it's easy, absent where it's needed, slow where it should be fast. (yvon)
triggers:
  - test strategy
  - what tests does this need
  - coverage floor
  - release gate
  - can this ship
  - gate check
  - is the pyramid healthy
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/quinn/custom/test-strategy/SKILL.md
  source_hash: 3dd67fff262910b3334213a0826d58ffab90f6c9554eb5889f32a871eae31bcb
  generated: 2026-07-20T03:20:22.860Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/quinn/custom/test-strategy/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js quinn -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: quinn — Engineering · skill: test-strategy"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"quinn\",\"skill\":\"test-strategy\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/quinn/operational/agent/quinn-config.md"
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

Triggers: "test strategy," "what tests does this need," "coverage floor," "release gate," "can this ship," "gate check," "is the pyramid healthy," and as the required tier-check inside dev's code-review step 3 and definition-of-done.

## Purpose

Without a strategy, testing is whatever each agent felt like writing — heavy where it's easy, absent where it's needed, slow where it should be fast. The pyramid keeps feedback fast (most tests cheap and low), the floors keep coverage honest, and the gate matrix makes "tested enough to ship" a lookup, not a negotiation.

## Protocol

```
A change arrives at the gate
  -> Classify: change type (feature / fix / refactor / config / data-adjacent / security-adjacent)
    -> Look up required tiers in assets/release-gate-matrix.md
      -> Verify: required tiers exist, run green, assert behavior (not just execute)
         + coverage ≥ floors (config) for touched code
         + regression-map check: fragile area touched? → its targeted suite required (sibling skill)
        -> GATE PASS → ops may ship (with its own rollback discipline)
        -> GATE FAIL → named gaps back to the author; no negotiation at the gate
```

## Boundaries & handoffs

-> test-strategy: classify → matrix lookup → tiers green? floors met?
- "Can this ship," tier questions, coverage, gate check → **test-strategy** (it pulls the other two in).
- "Define success criteria first / pass@k / eval this agent's work / EDD / prompt regression" → **marketplace/eval-harness**; its reports are evidence INTO test-strategy's gate, never a verdict; model graders never gate alone; security evals route to aegis.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"quinn\",\"skill\":\"test-strategy\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
