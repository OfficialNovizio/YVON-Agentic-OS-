---
name: experiment-registry
agent: loom
department: Product
version: 1.0.0
tier: 3
description: |
  Institutional amnesia makes teams re-run last year's failed pricing test and re-learn the same lesson at full cost. (yvon)
triggers:
  - experiment registry
  - we tested that
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/loom/custom/experiment-registry/SKILL.md
  source_hash: 009758518d122fe2ae9cfe79db8822a015fc6dba7355b1a3d1a3119bb398d5bb
  generated: 2026-07-29T22:20:50.934Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/loom/custom/experiment-registry/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js loom -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: loom — Product · skill: experiment-registry"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"loom\",\"skill\":\"experiment-registry\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- An experiment reaches a verdict (experiment-discipline files it here).
- Before proposing an experiment — query: has this been run? (the re-run guard).
- A decision cites "we tested that" — the registry is where that claim is verified or exposed.

## Purpose

Institutional amnesia makes teams re-run last year's failed pricing test and re-learn the same lesson at full cost. A registry makes experiment history queryable — before proposing a test, check whether it (or a near-twin) already has a verdict.

## Protocol

QUERY-FIRST (a proposed experiment first checks the registry: run before? near-twin? stale-but-relevant?) → verdict: SETTLED (cite the existing result, don't re-run) | STALE (context changed enough to re-test — say why) | NEW → FILE (on verdict: hypothesis, test type, frozen criteria `metric:@vN`, result, ADOPT/REJECT, date, confidence — append-only, scout's pattern) → LINK (which PRDs/features/prices the verdict informed) → SURFACE (settled verdicts are searchable; a re-run proposal without a stated delta from the prior test bounces).

## Boundaries & handoffs

experiment-registry (QUERY: settled? stale? new?) ─settled─► cite verdict, don't re-run
verdict ─► experiment-registry (adopt/reject, append-only)

## Output format

Registry entry: experiment ID · hypothesis · test · frozen criteria (metric@vN) · result · ADOPT/REJECT/INCONCLUSIVE · date · confidence · informed (PRD/price IDs). Query result: SETTLED/STALE/NEW + refs.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"loom\",\"skill\":\"experiment-registry\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
