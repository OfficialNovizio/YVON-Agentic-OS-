---
name: dsa-design-records
agent: axiom
department: Engineering
version: 1.0.0
tier: 3
description: |
  Algorithmic choices rot into folklore faster than architectural ones because they're "just code" — someone swaps a structure for a "simpler" one and reintroduces the O(n²) the original avoided. (yvon)
triggers:
  - dsa design records
  - which data structure
  - what algorithm
  - why is this a heap/trie/b-tree
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/axiom/custom/dsa-design-records/SKILL.md
  source_hash: 1bbf84768db9c18f9a896f196a8ab5c4cb9da67b62e95c297def959ce9ce50e3
  generated: 2026-07-20T03:20:22.499Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/axiom/custom/dsa-design-records/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js axiom -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: axiom — Engineering · skill: dsa-design-records"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"axiom\",\"skill\":\"dsa-design-records\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "which data structure," "what algorithm," "why is this a heap/trie/B-tree," a hot-path structure choice, a choice with non-obvious complexity trade-offs, and before any structure/algorithm expensive to change later.

## Purpose

Algorithmic choices rot into folklore faster than architectural ones because they're "just code" — someone swaps a structure for a "simpler" one and reintroduces the O(n²) the original avoided. A design record carries the complexity reasoning forward, so a change has to answer the original constraints, not just look cleaner.

## Protocol

```
A load-bearing DSA choice arises
  -> Draft the record (assets/dsa-record-template.md):
     the operations that matter (with frequencies) · options considered (2+) ·
     complexity per operation (time + space, worst + amortized) · the decision · the trade-offs kept
    -> Complexity claims carry their reasoning (why O(log n), not just "it's O(log n)")
      -> Review with the consumer (raj for backend hot paths, dana for storage structures)
        -> Log (append-only, like ADRs); a reversal is a new record citing the old
```

## Boundaries & handoffs

- "Which structure / what algorithm / why this" → **dsa-design-records**.
- **dev**: dsa-design-records is architecture-decisions' algorithm-layer child; system-wide choices escalate to a full ADR; algorithm-heavy diffs route to algorithm-review (like security → aegis).

## Output format

The record per `assets/dsa-record-template.md` + its ledger entry. Complexity stated as time/space, worst/amortized, with the invariant that justifies it.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"axiom\",\"skill\":\"dsa-design-records\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
