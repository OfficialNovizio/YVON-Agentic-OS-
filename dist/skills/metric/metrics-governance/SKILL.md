---
name: metrics-governance
agent: metric
department: Product
version: 1.0.0
tier: 3
description: |
  A silently-redefined "activation" makes every dashboard, PRD, and past decision quietly wrong — and nobody notices until two numbers that should match don't. (yvon)
triggers:
  - metrics governance
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/metric/custom/metrics-governance/SKILL.md
  source_hash: 9bb4fda1956c4eb616b9fe4f69bbf521cec8c4c733423bc0a48784c4f714e5df
  generated: 2026-07-20T03:20:23.332Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/metric/custom/metrics-governance/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js metric -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: metric — Product · skill: metrics-governance"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"metric\",\"skill\":\"metrics-governance\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A definition needs changing (product-metrics-spec routes all changes here).
- A new consumer (dashboard, dept, the future Data & Analytics layer) needs the definition export.
- An audit: are all live citations pinned to versions that still exist?

## Purpose

A silently-redefined "activation" makes every dashboard, PRD, and past decision quietly wrong — and nobody notices until two numbers that should match don't. Governance makes definition changes visible, versioned, and impact-assessed, and keeps every downstream consumer reading from one export.

## Protocol

PROPOSE (the change: old `vN` → new `vN+1`, the exact definition diff, the reason) → IMPACT (what trends break at the changeover, which PRDs/experiments/dashboards cite `vN`, whether a backfill is possible) → VERSION (new version added; old version stays readable — never edited away, so historical numbers stay interpretable) → SYNC INTERFACE (definitions export in the stated format; the data layer / river binding is deferred to that dept, the interface stable regardless) → FLEET NOTE (a definition change is a skill-adjacent change to shared truth — material changes route through anneal → board per Fleet Charter Rail 3; routine version bumps are logged, not board-gated).

## Boundaries & handoffs

Precedence: definition changes → metrics-governance (never edited in the spec directly); an experiment without verified-live instruments is BLOCKED before any read; MISSING beats interpolated everywhere.

## Output format

Change proposal: diff · impact (broken trends, cited-by list, backfill?) · new version · export stanza · board-route flag (material) or log entry (routine).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"metric\",\"skill\":\"metrics-governance\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
