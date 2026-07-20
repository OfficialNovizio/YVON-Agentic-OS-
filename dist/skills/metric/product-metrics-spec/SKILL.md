---
name: product-metrics-spec
agent: metric
department: Product
version: 1.0.0
tier: 3
description: |
  Two dashboards with two "activation" definitions produce two confident, contradictory decisions. (yvon)
triggers:
  - product metrics spec
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/metric/custom/product-metrics-spec/SKILL.md
  source_hash: 8e55e28a9e1de37ddce31f52ed80d7be540da451643c3ef7152b2504dad2b621
  generated: 2026-07-20T03:20:23.335Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/metric/custom/product-metrics-spec/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js metric -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: metric — Product · skill: product-metrics-spec"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"metric\",\"skill\":\"product-metrics-spec\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A product needs its metric truth established or extended (new events, new definitions).
- Anyone cites a metric in a PRD, report, or experiment (the definition reference point).
- A definition needs changing (→ metrics-governance path).

## Purpose

Two dashboards with two "activation" definitions produce two confident, contradictory decisions. One versioned spec makes every number traceable to a definition and every definition change visible.

## Protocol

TAXONOMY (per product `<FILL_IN: product profile>`: events named `object_action`, each with properties, trigger moment, and owner surface — web/app/api) → DEFINITIONS (activation, retention windows, engagement, NSM — each a precise computable statement over taxonomy events, versioned `vN` with date) → PUBLISH (the spec is a readable file; consumers cite `metric:activation@v3`) → INTERFACE (definitions export in a stated format for the data layer and kai's dashboards — binding to the Data & Analytics dept's pipelines happens when that dept exists; the interface is this file's export, stable regardless).

## Boundaries & handoffs

new/changed definition ─► product-metrics-spec (the truth) ──changes──► metrics-governance (versioned proposal)
outcome read requested (spec) ─► product-metrics-spec definition + funnel read ─► hit/miss evidence to spec/loom

## Output format

The per-product spec file: taxonomy table + versioned definitions block + export interface stanza. Citation format: `metric:<name>@vN`.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"metric\",\"skill\":\"product-metrics-spec\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
