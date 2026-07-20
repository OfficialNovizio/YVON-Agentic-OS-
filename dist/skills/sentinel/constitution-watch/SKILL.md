---
name: constitution-watch
agent: sentinel
department: Governance
version: 1.0.0
tier: 3
description: |
  A constitution only enforced at the gate protects only gated decisions. (yvon)
triggers:
  - constitution watch
  - compliance sweep
  - constitution check on recent work
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Governance/sentinel/custom/constitution-watch/SKILL.md
  source_hash: d46194dce991236fa0333bc8d4fe7233580ae671933981aad78b43a8651b32e4
  generated: 2026-07-20T03:20:24.106Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Governance/sentinel/custom/constitution-watch/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js sentinel -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: sentinel — Governance · skill: constitution-watch"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"sentinel\",\"skill\":\"constitution-watch\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Governance/sentinel/operational/agent/sentinel-config.md"
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

Triggers: "compliance sweep," "constitution check on recent work," or — primarily — on the configured recurring cadence (continuous/daily by design; in practice, per `sweep_cadence` in sentinel's config, or the operator's scheduled runs until automation exists).

Not for: ruling on a submitted decision (board's constitution-enforcement), or auditing whether decisions skipped the gate (gate-bypass-detection).

## Purpose

A constitution only enforced at the gate protects only gated decisions. Most of what agents do daily — drafts, recommendations, communications, spend-adjacent actions — never passes through board, and constitutional erosion happens exactly there: each output slightly closer to the line, none reviewed. This skill is the smoke detector: cheap, always on, and loud early rather than precise late.

## Protocol

```
Load the constitution + derive violation patterns (per article, from its operational test)
  -> Sample recent agent outputs/actions per the configured cadence and scope
    -> Classify each sampled item: CLEAR / NEAR-BOUNDARY / VIOLATION
      -> NEAR-BOUNDARY → warn the producing agent's operator context + log
      -> VIOLATION → freeze recommendation + immediate escalation to board & operator
        -> Log everything to the audit trail (per audit-trail-design practices)
```

## Boundaries & handoffs

- **constitution-watch → gate-bypass-detection**: a sampled output that looks like an executed ungated decision hands off for the criteria-match test.
- **gate-bypass-detection → constitution-watch**: an action record whose *content* approaches an article hands back for classification.
- **Both watchers → board**: constitution-watch's VIOLATION classifications and every BYPASS/PARTIAL escalate to board for formal rulings (constitution-enforcement / full retroactive gate). Sentinel classifies and escalates; board rules.
Route by object: designing/reviewing a logging system → audit-trail-design; checking recent work's content → constitution-watch; checking whether decisions were gated → gate-bypass-detection. A general "compliance sweep" runs watch and bypass-scan together, each reporting separately.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"sentinel\",\"skill\":\"constitution-watch\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
