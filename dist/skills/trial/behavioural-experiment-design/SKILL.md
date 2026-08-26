---
name: behavioural-experiment-design
agent: trial
department: Behavioural Science
version: 1.0.0
tier: 3
description: |
  Designs behavioural experiments — RCT · quasi-experiment · pre-post · natural. Selects design based on ethical + practical constraints. Hands to Product/loom for online / to research for field. (yvon)
triggers:
  - behavioural experiment design
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Behavioural Science/trial/custom/behavioural-experiment-design/SKILL.md
  source_hash: accb28c18f4a3a1317fc85291676fbf50e4f54070a08955b51625f1d35308d7e
  generated: 2026-08-08T17:13:12.673Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Behavioural Science/trial/custom/behavioural-experiment-design/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js trial -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: trial — Behavioural Science · skill: behavioural-experiment-design"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"trial\",\"skill\":\"behavioural-experiment-design\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Behavioural Science/trial/operational/agent/trial-config.md"
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

Use when the request matches: "behavioural experiment design".

## Purpose

Design the right experiment for a behavioural hypothesis. RCT is gold-standard but not always feasible/ethical; this skill picks method + designs test.

## Protocol

```
1. HYPOTHESIS   what causal claim
2. CONSTRAINTS  ethical + practical (can we randomise?)
3. METHOD       RCT · matched · pre-post · natural · A/B
4. DESIGN       arms · sample · duration · metrics · analysis plan
5. SANITY       sample size via Shared OS/logical/sample_size.py
6. HANDOFF      loom (online) or research (field)
```

## Boundaries & handoffs

- name: behavioural-experiment-design
- {trigger: "experiment design", winner: behavioural-experiment-design}

## Output format

Design doc + pre-registration.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"trial\",\"skill\":\"behavioural-experiment-design\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
