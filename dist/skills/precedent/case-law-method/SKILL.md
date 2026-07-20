---
name: case-law-method
agent: precedent
department: Governance
version: 1.0.0
tier: 3
description: |
  Without a method, precedent retrieval produces two failure modes: rulings get applied because they're superficially similar ("we approved a spend like this before" — on different facts), or ignored… (yvon)
triggers:
  - case law method
  - apply precedent
  - how does the past ruling bear on this
  - are these cases the same
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Governance/precedent/custom/case-law-method/SKILL.md
  source_hash: edf2abe650dd064d3d1856e9a83ae218d6d4d0ac8117b2a9e2418f1b0f6a7ac2
  generated: 2026-07-20T03:20:24.058Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Governance/precedent/custom/case-law-method/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js precedent -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: precedent — Governance · skill: case-law-method"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"precedent\",\"skill\":\"case-law-method\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "apply precedent," "how does the past ruling bear on this," "are these cases the same," or whenever `ruling-log` has surfaced precedents for a live gate review and board needs to know what they require.

## Purpose

Without a method, precedent retrieval produces two failure modes: rulings get applied because they're superficially similar ("we approved a spend like this before" — on different facts), or ignored because nobody articulates why they don't bind. This skill forces the middle path: every relevant precedent is either applied with its rule stated, or distinguished with the material difference named. Consistency where cases match; documented reasons where they don't.

## Protocol

```
Extract the ratio from the prior ruling (the rule that decided it, not the commentary)
  -> Identify the prior case's material facts (the facts the ratio depended on)
    -> Compare the new case's facts: same in the ways that mattered?
      -> APPLY (facts match → same ruling follows, rule quoted)
         or DISTINGUISH (material difference named → precedent doesn't control)
        -> Either way: explicit, written, logged
```

## Boundaries & handoffs

- **ruling-log → case-law-method**: retrieval hands raw precedents; the method turns them into APPLY/DISTINGUISH conclusions. Retrieval never implies application.
- **case-law-method → consistency-check**: an APPLY that board wants to depart from is exactly an overrule — it must go through consistency-check's protocol, never resolved inside case-law-method.
A live review runs the pipeline in order. Standalone questions route by verb: *find/what happened* → ruling-log; *does it apply* → case-law-method; *is this consistent / can we rule differently* → consistency-check.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"precedent\",\"skill\":\"case-law-method\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
