---
name: pricing-research
agent: price
department: Product
version: 1.0.0
tier: 3
description: |
  Prices get set by cost-plus, competitor-copying, or the founder's gut — none of which is what customers value. (yvon)
triggers:
  - pricing research
allowed-tools:
  - Write
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/price/custom/pricing-research/SKILL.md
  source_hash: c14e6f2dbed5d32c7d85458fe9247edfb954f1d00fe105bf1e3ba998655ad5d6
  generated: 2026-07-20T03:20:23.386Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/price/custom/pricing-research/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js price -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: price — Product · skill: pricing-research"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"price\",\"skill\":\"pricing-research\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A new product/feature needs a price and there's no WTP evidence.
- A pricing hypothesis needs research before a live experiment (loom's cheapest-test, pricing edition).
- packaging-tiers needs value-perception data to design fences.

## Purpose

Prices get set by cost-plus, competitor-copying, or the founder's gut — none of which is what customers value. Pricing research grounds the price in measured willingness-to-pay, so the number is defensible and the value-capture is deliberate, not accidental.

## Protocol

QUESTION (what will a segment pay for what value — per product profile, per persona) → METHOD (van Westendorp for a price range, conjoint for feature-value trade-offs, direct WTP testing — each flagged reasoning-based until the pricing/economics source) → SEGMENT (WTP varies by segment; a blended number hides the real structure — read per persona) → VALUE ANCHOR (price to the value delivered / alternative's cost, not to internal cost — cost sets a floor, value sets the price) → VALIDATE (survey WTP is stated intent, not behavior; the real test is a revenue experiment via pricing-experiment-discipline — research proposes, the experiment confirms) → HANDOFF (WTP structure → packaging-tiers for tier design; → loom for the confirming experiment).

## Boundaries & handoffs

new price / no WTP evidence ─► pricing-research (WTP by segment; value-anchored; flagged methods)

## Output format

Pricing research: segment × WTP range (method + flag) · value anchor (vs alternative) · feature-value trade-offs (conjoint) · confidence · → packaging-tiers + loom experiment.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"price\",\"skill\":\"pricing-research\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
