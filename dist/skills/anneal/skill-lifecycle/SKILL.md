---
name: skill-lifecycle
agent: anneal
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Skills that nobody maintains rot: stale dates, dead references, superseded methods still triggering. (yvon)
triggers:
  - skill lifecycle
  - what version of x was live when y happened?
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/anneal/custom/skill-lifecycle/SKILL.md
  source_hash: 0670adc08f9606cec04413e61570b16a5ea34eb84653d465a6f0ecdb5a335193
  generated: 2026-07-29T22:20:50.964Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/anneal/custom/skill-lifecycle/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js anneal -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: anneal — AI & Agents · skill: skill-lifecycle"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anneal\",\"skill\":\"skill-lifecycle\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A skill needs revision (from a lesson, audit finding, or routed degradation case).
- A skill is superseded, unused, or wrong → deprecation/retirement question.
- "What version of X was live when Y happened?" (history question).

## Purpose

Skills that nobody maintains rot: stale dates, dead references, superseded methods still triggering. This skill keeps the fleet's substance current without ever changing it silently.

## Protocol

INTAKE (finding/lesson/case) → ASSESS (revise / deprecate / retire / no-action, with reasons) → PROPOSE (Rail 3: change proposal → board) → APPLY (exactly as approved) → VERSION (dated changelog line in the skill's frontmatter history) → NOTIFY (owning agent + gauge for re-measurement).

## Boundaries & handoffs

└► skill-lifecycle (propose → board → apply → version)
Precedence: annealing-loop coordinates; lifecycle executes; the audit only finds. board dormant → everything queues, nothing auto-applies (warning labels only, per skill-lifecycle Fallback).

## Output format

Lifecycle assessments (`revise/deprecate/retire/no-action` + reasoning); proposals per meta's template; changelog lines.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anneal\",\"skill\":\"skill-lifecycle\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
