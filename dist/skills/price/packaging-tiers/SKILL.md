---
name: packaging-tiers
agent: price
department: Product
version: 1.0.0
tier: 3
description: |
  Packaging captures (or leaks) more value than the price number itself: the same product in the wrong tiers under-monetizes power users and scares off small ones. (yvon)
triggers:
  - packaging tiers
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/price/custom/packaging-tiers/SKILL.md
  source_hash: 7e7f8b72736e8b5d81bdd9ffcc73affed532cf4cca735b5c43d1ddda294c9c1d
  generated: 2026-07-20T03:20:23.376Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/price/custom/packaging-tiers/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js price -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: price — Product · skill: packaging-tiers"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"price\",\"skill\":\"packaging-tiers\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A product needs its tier structure designed or restructured.
- pricing-research surfaces distinct WTP segments (the raw material for tiers).
- A feature needs a tier assignment (which plan is it in, and why).

## Purpose

Packaging captures (or leaks) more value than the price number itself: the same product in the wrong tiers under-monetizes power users and scares off small ones. Deliberate tier design aligns what each segment pays with what they value.

## Protocol

VALUE METRIC (the fence that scales price with value — seats, usage, outcomes; the single axis a customer grows along; picked so paying more tracks getting more) → SEGMENT-TO-TIER (pricing-research's WTP segments map to good/better/best; each tier targets a segment's value + WTP) → FEATURE MAP (each feature → the lowest tier that still captures its value; differentiators gate higher tiers, table-stakes sit in the base — don't fence what everyone needs) → FENCE DESIGN (the tier boundaries are meaningful value jumps, not arbitrary feature-withholding customers resent) → PER-PRODUCT CONFIG (tiers live in the product profile `<FILL_IN>`, not hardcoded) → VALIDATE (structure → loom revenue experiment before launch).

## Boundaries & handoffs

packaging-tiers (value metric; good/better/best; feature→tier; fences)

## Output format

Packaging spec: value metric · tier structure (good/better/best × target segment × price) · feature-to-tier map · fence rationale · → loom experiment before launch.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"price\",\"skill\":\"packaging-tiers\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
