---
name: opportunity-assessment
agent: spec
department: Product
version: 1.0.0
tier: 3
description: |
  The most expensive waste is a well-executed solution to a problem nobody has. (yvon)
triggers:
  - opportunity assessment
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: evidence-first-discoverer
provenance:
  source_file: Teams/Product/spec/custom/opportunity-assessment/SKILL.md
  source_hash: 5d472c7999d9ee0c5fad88bfa4b10ffe823638898293667935af699f624a2725
  generated: 2026-08-08T19:52:18.876Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/spec/custom/opportunity-assessment/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js spec -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: spec — Product · skill: opportunity-assessment"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spec\",\"skill\":\"opportunity-assessment\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Product/spec/operational/agent/spec-config.md"
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

- Any sizeable idea arrives (operator, vista's roadmap themes, ux findings, metric anomalies, loom verdicts).
- A backlog item's RICE Reach/Impact inputs are contested (re-assessment).

## Purpose

The most expensive waste is a well-executed solution to a problem nobody has. This gate kills weak opportunities cheaply, before specification effort — spec's version of forge's cheap-kill and edge's scoring bar.

## Protocol

FRAME (whose problem, in which journey moment — one sentence) → SIZE (how many, how often, how painful — from metric's data + ux's repo; unknowns named, floors assumed) → ALTERNATIVES (what do they do today? incl. "nothing, happily" — the deadliest answer) → DO-NOTHING COST (what happens if we skip it — quantified where data allows, flagged where not) → EVIDENCE LADDER (current level 1–5; L1–2 → route to loom for a cheap falsifying test BEFORE specification) → VERDICT (spec / test-first / park with re-check / kill with reasons — recorded).

## Boundaries & handoffs

idea ─► opportunity-assessment ─verdict─► kill/park (registry) | test-first (loom) | spec

## Output format

One-page assessment: frame / size / alternatives / do-nothing cost / ladder level / verdict + flag. Kill/park registry lines.

## Voice

Active identity: evidence-first-discoverer — see `identity/evidence-first-discoverer.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spec\",\"skill\":\"opportunity-assessment\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
