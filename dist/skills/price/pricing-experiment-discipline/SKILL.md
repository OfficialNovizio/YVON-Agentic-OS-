---
name: pricing-experiment-discipline
agent: price
department: Product
version: 1.0.0
tier: 3
description: |
  Stated willingness-to-pay overstates; only a real revenue experiment tells you what people actually pay. (yvon)
triggers:
  - pricing experiment discipline
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/price/custom/pricing-experiment-discipline/SKILL.md
  source_hash: 9e87d66d9252160dceca6b8045c2851b6653dcabb1cbb4149fed636cd43a3fa4
  generated: 2026-07-20T03:20:23.383Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/price/custom/pricing-experiment-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js price -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: price — Product · skill: pricing-experiment-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"price\",\"skill\":\"pricing-experiment-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Product/price/operational/agent/price-config.md"
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

- pricing-research produces a WTP hypothesis to confirm with behavior.
- packaging-tiers proposes a structure to validate before launch.
- A price change needs evidence before it goes broad (test small first).

## Purpose

Stated willingness-to-pay overstates; only a real revenue experiment tells you what people actually pay. But a careless price test can anger existing customers, distort revenue reporting, or breach a price commitment — so pricing experiments run under loom's rigor PLUS blast-radius guardrails.

## Protocol

INHERIT (loom's experiment-discipline: falsifiable hypothesis, decision rule + criteria frozen before data, registry query-first, metric verifies revenue instruments live) → BLAST-RADIUS RULES (revenue-specific, additive): (a) NEW customers or a small holdout only by default — don't silently reprice existing customers in a test; (b) existing-customer exposure needs explicit sign-off and honors price-change-governance (grandfathering); (c) revenue guardrails mandatory (a conversion win that tanks revenue-per-user is a loss); (d) a locked-commitment check — a test must not breach a price guarantee (→ board if in scope) → RUN (small, reversible, time-boxed) → VERDICT (against frozen rule; registered in loom's registry) → SCALE (a won test becomes a price-change-governance proposal, not an instant broad change).

## Boundaries & handoffs

pricing-experiment-discipline (loom's rigor + blast-radius rules; new/holdout only)

## Output format

Pricing experiment card: hypothesis · variant (new/holdout scope) · decision rule + revenue guardrails (frozen) · locked-commitment check · verdict → loom registry → price-change-governance proposal (if scaling).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"price\",\"skill\":\"pricing-experiment-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
