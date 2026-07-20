---
name: ruling-log
agent: precedent
department: Governance
version: 1.0.0
tier: 3
description: |
  Board's rulings are only as valuable as their retrievability. (yvon)
triggers:
  - ruling log
  - log this ruling
  - record the decision
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Governance/precedent/custom/ruling-log/SKILL.md
  source_hash: d509a9a77e5df05c892972f32c69ae1159a3379a4862147cdee025d00405cae1
  generated: 2026-07-20T03:20:24.066Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Governance/precedent/custom/ruling-log/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js precedent -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: precedent — Governance · skill: ruling-log"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"precedent\",\"skill\":\"ruling-log\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Governance/precedent/operational/agent/precedent-config.md"
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

Triggers: "log this ruling," "record the decision," "past rulings on [topic]," or automatically whenever board completes a gate review (board's skills already log; this skill owns the schema and the retrieval).

## Purpose

Board's rulings are only as valuable as their retrievability. An unlogged ruling gets re-litigated; an untagged one can't be found; one recorded without rationale can't be applied to the next case. This skill makes every ruling a durable, findable, reasoned record — the difference between a governance function and a series of one-off opinions.

## Protocol

```
Capture the ruling in the standard schema (assets/ruling-schema.md)
  -> Tag: article/commitment cited + topic(s) + venture/scope
    -> Append to the configured decision log (never overwrite)
      -> On any new gate request: surface the top 3 most similar precedents
```

## Boundaries & handoffs

- **ruling-log → case-law-method**: retrieval hands raw precedents; the method turns them into APPLY/DISTINGUISH conclusions. Retrieval never implies application.
- **consistency-check → ruling-log**: every conflict resolution (distinction or overrule justification) lands in the final record; overruled rulings get cross-marked, both directions.
A live review runs the pipeline in order. Standalone questions route by verb: *find/what happened* → ruling-log; *does it apply* → case-law-method; *is this consistent / can we rule differently* → consistency-check.

## Output format

For capture: the completed schema record (see assets). For retrieval:

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"precedent\",\"skill\":\"ruling-log\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
