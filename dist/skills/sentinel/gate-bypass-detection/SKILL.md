---
name: gate-bypass-detection
agent: sentinel
department: Governance
version: 1.0.0
tier: 3
description: |
  A gate's integrity is measured by what goes around it. (yvon)
triggers:
  - gate bypass detection
  - was this gated
  - bypass check
  - did this go through board
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Governance/sentinel/custom/gate-bypass-detection/SKILL.md
  source_hash: c0697781a546b2adccb8ac721ee0b10ecd51ada62bf11d672cdc534bccb9089a
  generated: 2026-07-20T03:20:24.110Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Governance/sentinel/custom/gate-bypass-detection/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js sentinel -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: sentinel — Governance · skill: gate-bypass-detection"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"sentinel\",\"skill\":\"gate-bypass-detection\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "was this gated," "bypass check," "did this go through board," or on the configured recurring cadence (`bypass_scan_cadence`), typically aligned to sweep or monthly financial close, when executed actions become visible.

Not for: reviewing the *content* of outputs against the constitution (constitution-watch), or ruling on the surfaced decision (board's gate, retroactively).

## Purpose

A gate's integrity is measured by what goes around it. One bypass is an accident; a pattern is a process defect (unclear criteria, inconvenient process, or an intentional workaround) — and all three answers demand different fixes. This skill closes the loop: every qualifying action either has a ruling, gets a retroactive one, or exposes why the gate was avoidable.

## Protocol

```
Load gate criteria (from board's config + documents: spend gate, commitment/veto scope, constitutional articles)
  -> Scan executed actions in scope (spend records, signed commitments, strategic moves)
    -> Match each qualifying action against the decision log: was there a ruling?
      -> Match found → verified, count it
      -> No match → BYPASS: trigger retroactive review at board + root cause
        -> Pattern (repeat actor/type/route) → process-fix proposal to the configured process owner
          -> Log everything per audit-trail-design practices
```

## Boundaries & handoffs

- **constitution-watch → gate-bypass-detection**: a sampled output that looks like an executed ungated decision hands off for the criteria-match test.
- **gate-bypass-detection → constitution-watch**: an action record whose *content* approaches an article hands back for classification.
- **gate-bypass-detection → process owner**: bypass patterns route as process-fix proposals to `process_owner_contact` (operator until set).
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
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"sentinel\",\"skill\":\"gate-bypass-detection\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
