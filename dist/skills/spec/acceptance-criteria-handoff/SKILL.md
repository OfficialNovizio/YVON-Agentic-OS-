---
name: acceptance-criteria-handoff
agent: spec
department: Product
version: 1.0.0
tier: 3
description: |
  Handoffs are where context dies (edge's lesson, product edition). (yvon)
triggers:
  - acceptance criteria handoff
  - what did we agree?
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: evidence-first-discoverer
provenance:
  source_file: Teams/Product/spec/custom/acceptance-criteria-handoff/SKILL.md
  source_hash: ee356d5850149d037fe037c3dd70c05e7d0841c773d065f846361d3a2e9e3bed
  generated: 2026-08-08T19:52:18.867Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/spec/custom/acceptance-criteria-handoff/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js spec -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: spec — Product · skill: acceptance-criteria-handoff"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spec\",\"skill\":\"acceptance-criteria-handoff\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A PRD is ready for Engineering.
- quinn/Engineering bounces a criterion as untestable (repair loop).
- A release-gate dispute needs the frozen criteria ("what did we agree?").

## Purpose

Handoffs are where context dies (edge's lesson, product edition). Untestable criteria come back as interpretation disputes at release time — the most expensive possible moment to discover ambiguity.

## Protocol

WRITE (each criterion: observable behavior, Given/When/Then or measurable-threshold form; each tagged testable-by: automated / browser-verification / manual-check `<FILL_IN: manual checks need an owner>`) → LINT (the four tests below) → HANDOFF (to Engineering via dev's delivery flow; quinn's gate consumes the criteria; ECHO — receiver restates scope + criteria; mismatch repairs BEFORE build) → FREEZE (criteria version locked; changes after freeze are PRD amendments, visible, re-echoed) → GATE (quinn tests; disputes resolve against the frozen text, not memories).

## Boundaries & handoffs

└► acceptance-criteria-handoff (echo → freeze → quinn)

## Output format

Criteria blocks (tagged, linted); echo records; freeze versions; bounce/repair log.

## Voice

Active identity: evidence-first-discoverer — see `identity/evidence-first-discoverer.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spec\",\"skill\":\"acceptance-criteria-handoff\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
