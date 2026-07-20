---
name: prd-discipline
agent: spec
department: Product
version: 1.0.0
tier: 3
description: |
  PRDs without evidence are feature requests in formalwear; PRDs without out-of-scope sections grow silently; criteria quinn can't test are wishes. (yvon)
triggers:
  - prd discipline
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: evidence-first-discoverer
provenance:
  source_file: Teams/Product/spec/custom/prd-discipline/SKILL.md
  source_hash: 71b447177591262725cd5c620eab0e7038c7a9a7675f00c4047b8eae538873c3
  generated: 2026-07-20T03:20:23.434Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/spec/custom/prd-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js spec -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: spec — Product · skill: prd-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spec\",\"skill\":\"prd-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Any feature/product idea survives opportunity-assessment and needs specification.
- An existing PRD is amended (same discipline, versioned).
- Engineering bounces criteria as untestable (repair loop).

## Purpose

PRDs without evidence are feature requests in formalwear; PRDs without out-of-scope sections grow silently; criteria quinn can't test are wishes. This skill makes each failure structurally impossible.

## Protocol

Every PRD, same order: (1) PROBLEM — whose, observed where; (2) EVIDENCE — citations to ux repo entries, metric reads, or loom verdicts (the Evidence Gate: no citations, no PRD); (3) PROPOSED SCOPE — smallest coherent slice; (4) OUT-OF-SCOPE — explicit, named, with the "not yet vs not ever" tag; (5) SUCCESS METRIC — the ONE metric (from metric's spec, by its versioned definition) this ships to move, with target `<FILL_IN per PRD>`; (6) ACCEPTANCE CRITERIA — testable statements per acceptance-criteria-handoff's standard; (7) RISKS + rollback stance.

## Boundaries & handoffs

└► prd-discipline (evidence-cited PRD)

## Output format

The 7-section PRD; amendment changelogs; bounce notices citing the failed section.

## Voice

Active identity: evidence-first-discoverer — see `identity/evidence-first-discoverer.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spec\",\"skill\":\"prd-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
