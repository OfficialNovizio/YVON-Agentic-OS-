---
name: self-annealing-loop
agent: anneal
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  A lesson that lives only in memory or a report is a lesson the next session forgets. (yvon)
triggers:
  - self annealing loop
  - skill issue
  - x should have caught this
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/anneal/custom/self-annealing-loop/SKILL.md
  source_hash: a9ae2f3211df045c641effb4d8a09c95bcb1aaedb9630ed43397cd07f58f9941
  generated: 2026-07-29T22:20:50.962Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/anneal/custom/self-annealing-loop/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js anneal -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: anneal — AI & Agents · skill: self-annealing-loop"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anneal\",\"skill\":\"self-annealing-loop\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/anneal/operational/agent/anneal-config.md"
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

- Any post-mortem or incident write-up lands (ops' blameless post-mortems, fleet-governance incidents).
- forge closes a diagnosis with a "skill issue" verdict.
- A reflection/lesson entry names a gap ("X should have caught this").
- Quarterly: sweep for lessons that never became edits.

## Purpose

A lesson that lives only in memory or a report is a lesson the next session forgets. The fleet's substance is plain text; learning that doesn't land in the text didn't happen.

## Protocol

CAPTURE (lesson, verbatim source attached) → LOCATE (which skill file SHOULD have prevented this — one primary, or "no skill exists" → gap finding to meta) → DRAFT (minimal edit: the writing-skills discipline — address the specific failure, no speculative extras) → TEST (baseline: show the failure happens under the current text; per meta's writing-skills method) → PROPOSE (Rail 3 → board) → APPLY + VERSION (skill-lifecycle) → VERIFY (gauge re-measures; the same failure re-attempted must now be caught).

## Boundaries & handoffs

lesson/post-mortem/diagnosis ─► self-annealing-loop (locate + draft + baseline)

## Output format

Lessons-ledger entries; minimal-diff proposals per meta's template with baseline evidence attached.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anneal\",\"skill\":\"self-annealing-loop\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
