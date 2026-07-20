---
name: marketing-dashboards
agent: kai
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  A scorecard that changes shape every week teaches nobody anything; metrics without baselines are decoration; and channel numbers graded by the channels themselves inflate quietly. (yvon)
triggers:
  - marketing dashboards
  - weekly marketing report
  - scorecard
  - how did the week go
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/kai/custom/marketing-dashboards/SKILL.md
  source_hash: a1943baebe6a07f45d679d27861397a5748932e8545253b9b6dca42c4aa7caee
  generated: 2026-07-20T03:20:23.575Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/kai/custom/marketing-dashboards/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js kai -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: kai — Brand Studio · skill: marketing-dashboards"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"kai\",\"skill\":\"marketing-dashboards\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/kai/operational/agent/kai-config.md"
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

Triggers: "weekly marketing report," "scorecard," "how did the week go," or on the configured reporting cadence.

## Purpose

A scorecard that changes shape every week teaches nobody anything; metrics without baselines are decoration; and channel numbers graded by the channels themselves inflate quietly. The fixed-shape, baseline-anchored, reconciled scorecard fixes all three — and its reds are the department's early-warning system, feeding nate's aim, rio's guardrails, and vista's roadmap reality.

## Protocol

```
Pull the period's data (configured sources per channel; operator exports where no connector)
  -> Load brand-context baselines + vista's targets (NSM/guardrails/KRs where set)
    -> Compute the fixed sections; every number = value · vs baseline · vs target
      -> RECONCILE: platform-reported vs kai-independent where both exist; deltas reported
        -> Flag reds (breach rules from config) → escalation contact + the owning agent
          -> Publish; append to the scorecard history (trend integrity)
```

## Boundaries & handoffs

marketing-dashboards    (THE SCORECARD — fixed shape, baseline + target anchored,

## Output format

Per the template: header (period, sources, gaps), the fixed sections, reconciliation lines, reds with routing, one "what changed" paragraph in plain language.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"kai\",\"skill\":\"marketing-dashboards\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
