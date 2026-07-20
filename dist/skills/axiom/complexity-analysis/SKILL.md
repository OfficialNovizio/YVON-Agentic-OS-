---
name: complexity-analysis
agent: axiom
department: Engineering
version: 1.0.0
tier: 3
description: |
  "It's fast enough" is where scaling problems hide. (yvon)
triggers:
  - complexity analysis
  - what's the complexity
  - will this scale
  - is this o(n²)
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/axiom/custom/complexity-analysis/SKILL.md
  source_hash: ef9f344dba34a74ff111adfab2455ea6e51c4ee73efee4898bc1fb1603d0a1f9
  generated: 2026-07-20T03:20:22.496Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/axiom/custom/complexity-analysis/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js axiom -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: axiom — Engineering · skill: complexity-analysis"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"axiom\",\"skill\":\"complexity-analysis\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "what's the complexity," "will this scale," "is this O(n²)," a nested loop over request-sized data, a recursive call, a review flag on algorithmic cost, and any dsa-design-record needing its bounds.

## Purpose

"It's fast enough" is where scaling problems hide. An O(n²) that's fine at n=100 melts at n=100,000, and nobody noticed because nobody analyzed it. Rigorous complexity analysis makes the scaling behavior explicit before production finds it — and, equally, stops premature optimization of an O(n) that runs on n=10.

## Protocol

```
An algorithm / code path to analyze
  -> Identify the input(s) whose size drives cost (n, and any second dimension m)
    -> Count the dominant operations as a function of n (loops, recursion depth × work, structure ops)
      -> State time: worst / average / amortized (where they differ, all that matter)
         State space: auxiliary + input, incl. recursion stack
        -> Justify each bound with the reasoning (the recurrence, the loop nesting, the invariant)
          -> Reality check: does the asymptotic class actually dominate at THIS system's n?
             (small n → constants win → route to performance-profiling, don't over-optimize)
```

## Boundaries & handoffs

- "What's the complexity / will it scale / is this O(n²)" → **complexity-analysis**.
- Predict vs measure: complexity-analysis predicts, performance-profiling confirms; disagreement → trust the measurement.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"axiom\",\"skill\":\"complexity-analysis\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
