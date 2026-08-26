---
name: framing-analysis
agent: frame
department: Behavioural Science
version: 1.0.0
tier: 3
description: |
  Analyse a message / choice / policy for framing effects — gain vs loss, positive vs negative, active vs passive, temporal frames. Uses prospect-theory + Chip Heath 'Made to Stick' + Lakoff frame semantics. (yvon)
triggers:
  - framing analysis
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Behavioural Science/frame/custom/framing-analysis/SKILL.md
  source_hash: f0d9327bb25d6c5df73d4549f3044808bc6e3b413e7510e927e34d1ec6f13104
  generated: 2026-08-08T17:13:12.639Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Behavioural Science/frame/custom/framing-analysis/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js frame -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: frame — Behavioural Science · skill: framing-analysis"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"frame\",\"skill\":\"framing-analysis\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Behavioural Science/frame/operational/agent/frame-config.md"
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

Use when the request matches: "framing analysis".

## Purpose

Analyse how a message / choice / policy is framed → identify implicit reference points → propose alternative framings + predicted effects.

## Protocol

```
1. INTAKE      message / choice under analysis
2. FRAME       current frame (gain/loss · positive/negative · temporal · active/passive · reference point)
3. ALTERNATIVES 2-4 reframings
4. PREDICT     expected behavioural shift per frame
5. RECOMMEND   frame appropriate to goal + ethics
```

## Boundaries & handoffs

- name: framing-analysis
- {trigger: "reframe", winner: framing-analysis}

## Output format

Frame table (current + alternatives) + predicted effects + recommendation.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"frame\",\"skill\":\"framing-analysis\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
