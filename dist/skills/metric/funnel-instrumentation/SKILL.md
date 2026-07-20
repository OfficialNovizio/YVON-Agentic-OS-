---
name: funnel-instrumentation
agent: metric
department: Product
version: 1.0.0
tier: 3
description: |
  A funnel you haven't instrumented is a story; a funnel without cohorts is a snapshot pretending to be a trend. (yvon)
triggers:
  - funnel instrumentation
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/metric/custom/funnel-instrumentation/SKILL.md
  source_hash: 2fa17bc97f3bdaa7c2e2dd66d9afcbfbe2f7413a87f8f85c8bac032efe1351b4
  generated: 2026-07-20T03:20:23.329Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/metric/custom/funnel-instrumentation/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js metric -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: metric — Product · skill: funnel-instrumentation"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"metric\",\"skill\":\"funnel-instrumentation\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A product's funnel needs mapping or re-mapping (new flows, new stages).
- The cohort-read cadence fires (`<FILL_IN: suggested weekly — catalog default>`).
- A stage's numbers look wrong (instrumentation-gap suspicion).

## Purpose

A funnel you haven't instrumented is a story; a funnel without cohorts is a snapshot pretending to be a trend. This skill turns the AARRR frame into named events, versioned definitions, and a recurring read.

## Protocol

MAP (each AARRR stage → the product's actual journey moments, per product profile) → INSTRUMENT (each stage boundary = a taxonomy event or definition from product-metrics-spec, cited `@vN`; missing events → instrumentation requests, not guesses) → GAP CHECK (stages whose numbers can't be computed are declared MISSING — never interpolated) → COHORT READ (by signup week: stage-to-stage conversion, per cohort, vs trailing cohorts; vanity totals excluded by design — rates and cohorts only) → FLAG (conversion drops beyond `<FILL_IN: threshold — reasoning-based until the stats book lands>` route to spec/loom as evidence).

## Boundaries & handoffs

funnel needs mapping/read ─► funnel-instrumentation (AARRR, cohorts, gaps)

## Output format

Funnel map (stage / journey moment / event@vN); weekly cohort table (cohort × stage conversions); gap list; flags with routing.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"metric\",\"skill\":\"funnel-instrumentation\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
