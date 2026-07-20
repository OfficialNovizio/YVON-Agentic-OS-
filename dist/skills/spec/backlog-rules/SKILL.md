---
name: backlog-rules
agent: spec
department: Product
version: 1.0.0
tier: 3
description: |
  Backlogs rot two ways: unvetted entries (no evidence) and immortal entries (no age-out). (yvon)
triggers:
  - backlog rules
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: evidence-first-discoverer
provenance:
  source_file: Teams/Product/spec/custom/backlog-rules/SKILL.md
  source_hash: b942c3a6b7c844c6def66a498add110eafed63b7e289138a8a119a23b6abdb94
  generated: 2026-07-20T03:20:23.427Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/spec/custom/backlog-rules/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js spec -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: spec — Product · skill: backlog-rules"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spec\",\"skill\":\"backlog-rules\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Any item wants in (intake gate).
- Prioritization cadence fires (`<FILL_IN: suggested per sprint/cycle>`).
- An item ages past the limit or its evidence is superseded.

## Purpose

Backlogs rot two ways: unvetted entries (no evidence) and immortal entries (no age-out). Both make prioritization theater. This skill keeps the list short, cited, and honestly ranked.

## Protocol

INTAKE (evidence citation + link to the product's north-star metric per profile `<FILL_IN: NSM per product>` — no citation, bounced with the reason) → SCORE (`python scripts/rice.py items.json`: Reach × Impact × Confidence ÷ Effort; **RICE is a rubric — every ranking carries `[reasoning-based, not formula-verified]` until logical/ grounds the weights**) → RANK (score orders the list; operator/vista strategic overrides are recorded as overrides, not re-scored) → AGE-OUT (unranked or untouched > `<FILL_IN: suggested 90 days — catalog default>` → archived with reason; re-entry needs fresh evidence, scout's re-open pattern) → PUBLISH (next-`<FILL_IN: suggested 3>`-cycles view, visible to Engineering + vista).

## Boundaries & handoffs

└► backlog-rules (rank, publish)

## Output format

Ranked backlog (item / evidence ref / NSM link / RICE inputs+score / flag); bounce notices; age-out log; the published next-view.

## Voice

Active identity: evidence-first-discoverer — see `identity/evidence-first-discoverer.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spec\",\"skill\":\"backlog-rules\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
