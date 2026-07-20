---
name: assumption-mapping
agent: loom
department: Product
version: 1.0.0
tier: 3
description: |
  Teams test what's easy or what they're curious about, not what's dangerous. (yvon)
triggers:
  - assumption mapping
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/loom/custom/assumption-mapping/SKILL.md
  source_hash: e2a17b2edd229537f6500192765d77675ebea96b4e544073105a34af4d5bea5a
  generated: 2026-07-20T03:20:23.277Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/loom/custom/assumption-mapping/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js loom -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: loom — Product · skill: assumption-mapping"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"loom\",\"skill\":\"assumption-mapping\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A PRD, opportunity, or PMF plan rests on unvalidated beliefs (spec/loom).
- Before experiment-discipline runs — mapping decides which hypothesis it tests.
- A shipped miss: which assumption was wrong? (annealing input).

## Purpose

Teams test what's easy or what they're curious about, not what's dangerous. Mapping assumptions by risk aims the limited experiment budget at the belief whose falseness would sink the plan — the leap-of-faith assumption, first.

## Protocol

SURFACE (list the beliefs the plan needs to be true: desirability — will they want it; viability — will it pay; feasibility — can we build it; usability — can they use it) → SCORE (each: impact-if-wrong × uncertainty — both flagged reasoning-based until the decision-analysis source) → RANK (riskiest-first: high-impact + high-uncertainty is the leap-of-faith assumption) → ROUTE (top assumption → experiment-discipline for the cheapest falsifying test; known-enough assumptions → cite existing evidence, don't re-test; feasibility → Engineering, not a user experiment) → RECORD (the map, so a later miss can point to which assumption failed).

## Boundaries & handoffs

a plan rests on beliefs ─► assumption-mapping (surface, score, rank riskiest-first)

## Output format

Assumption map: belief · category (desirability/viability/feasibility/usability) · impact-if-wrong · uncertainty · rank · route (experiment / cite-evidence / Engineering / price).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"loom\",\"skill\":\"assumption-mapping\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
