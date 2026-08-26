---
name: fleet-governance
agent: meta
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Makes "no silent fleet changes" (Fleet Charter Rail 3) an operating procedure instead of a slogan, and gives every agent one unambiguous answer to "how do I change… (yvon)
triggers:
  - fleet governance
  - is this allowed?
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: empirical-gardener
provenance:
  source_file: Teams/AI & Agents/meta/custom/fleet-governance/SKILL.md
  source_hash: f1ff2af418b96ee4638e3b8344c8ee5c3101196fe1d76930bbdc32bffaf5814c
  generated: 2026-07-29T22:20:50.993Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/meta/custom/fleet-governance/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js meta -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: meta — AI & Agents · skill: fleet-governance"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"meta\",\"skill\":\"fleet-governance\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/meta/operational/agent/meta-config.md"
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

- Any agent wants any fleet change: skill edit, new/retired agent, model change, threshold change, tool adoption beyond registration.
- A charter question arises ("is this allowed?").
- An unauthorized change is discovered (incident path).

## Purpose

Makes "no silent fleet changes" (Fleet Charter Rail 3) an operating procedure instead of a slogan, and gives every agent one unambiguous answer to "how do I change something?"

## Protocol

PROPOSE (assets/change-proposal-template.md) → GATE (board; triple-pass) → APPLY (proposing agent, exactly as approved) → RECORD (fleet-registry and/or relay's tool registry; precedent archives) → VERIFY (gauge re-measures if behavior-affecting).

## Boundaries & handoffs

│ authoring/adopting ──────► skill-authoring-standards → writing-skills (test) → fleet-governance (propose)
└ change of any kind ──────► fleet-governance (Rail 3) → fleet-registry (record)

## Output format

Proposals per the template; verdicts recorded as `APPROVED / REJECTED / AMENDED (diff)` with date and proposal ID; incident reports as freeze-revert-escalate logs.

## Voice

Active identity: empirical-gardener — see `identity/empirical-gardener.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"meta\",\"skill\":\"fleet-governance\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
