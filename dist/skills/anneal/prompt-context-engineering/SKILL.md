---
name: prompt-context-engineering
agent: anneal
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Prompting conventions drift per-agent unless one owner maintains the shared discipline. (yvon)
triggers:
  - prompt context engineering
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/anneal/custom/prompt-context-engineering/SKILL.md
  source_hash: bd06b402394a8b04b75d8f4cfe2253b463620f8f7832edf432a72cd4cd26b2cc
  generated: 2026-07-29T22:20:50.960Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/anneal/custom/prompt-context-engineering/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js anneal -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: anneal — AI & Agents · skill: prompt-context-engineering"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anneal\",\"skill\":\"prompt-context-engineering\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Maintaining/revising the Shared OS prompting-practices skill (via the normal Rail 3 path).
- A lesson (self-annealing intake) traces to a thinking/context failure rather than a method failure.
- An agent's skill needs prompt-shaped guidance reviewed (descriptions, trigger phrasing — with meta).

## Purpose

Prompting conventions drift per-agent unless one owner maintains the shared discipline. Bad context habits (unstated assumptions, truncated work, unmarked confidence) are fleet-wide failure modes, not per-agent quirks.

## Protocol

The shared discipline anneal maintains (current house rules, v2026-07):
1. PRIME — state knowns, assumptions, missing info before working; missing info is requested or `<FILL_IN>`-ed, never invented (rule 0.5).
2. DELIMIT — explicit separators between sub-tasks; one question per escalation.
3. NEVER TRUNCATE — partial work surfaces as `[INCOMPLETE: reason]`, never silently dropped.
4. DISCLOSE CONFIDENCE — every recommendation ends `[CONFIDENCE: H/M/L · basis]`; H requires a source or a formula (rule 0.6 alignment).
5. TOKEN ECONOMY — reference shared skills instead of restating them; dated assets over inline stale facts.

## Boundaries & handoffs

thinking-pattern failure ─► prompt-context-engineering ─► (same proposal path, Shared OS copy)

## Output format

Shared-skill revision proposals; per-skill review findings (rule-numbered, like meta's lint verdicts); the maintained Shared OS `prompting-practices` document itself.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anneal\",\"skill\":\"prompt-context-engineering\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
