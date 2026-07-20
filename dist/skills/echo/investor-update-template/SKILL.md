---
name: investor-update-template
agent: echo
department: Executive Office
version: 1.0.0
tier: 3
description: |
  Make sending a credible, honest investor update a repeatable, low-friction monthly process rather than a one-off scramble each time — while enforcing a hard "no spin" rule the underlying marketplace skill only partially covers. (yvon)
triggers:
  - investor update template
  - monthly update
  - investor email
  - quarterly update
  - send the investor update
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Executive Office/echo/custom/investor-update-template/SKILL.md
  source_hash: a02b47789436636aac8abc364acc6149d7012f50bd5c50153a0e6b4fbcc15f66
  generated: 2026-07-20T03:20:24.151Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Executive Office/echo/custom/investor-update-template/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js echo -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: echo — Executive Office · skill: investor-update-template"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"echo\",\"skill\":\"investor-update-template\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Executive Office/echo/operational/agent/echo-config.md"
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

Triggers: "monthly update," "investor email," "quarterly update," "send the investor update," or when it's time in the cadence (monthly for early-stage, quarterly for later-stage, per `investor-update-generator`'s own cadence guidance) to produce one.

## Purpose

Make sending a credible, honest investor update a repeatable, low-friction monthly process rather than a one-off scramble each time — while enforcing a hard "no spin" rule the underlying marketplace skill only partially covers.

## Protocol

```
Collect metrics + context
  -> Draft using investor-update-generator's template
    -> Enforce: at least one honest lowlight, minimum (hard rule, not optional)
      -> Validate with investor-update-generator's scoring script
        -> Triple-pass review
          -> Get approval (per agent config)
            -> Send (via whatever channel is configured)
```

## Boundaries & handoffs

- **handoffs**: normal entry for monthly/quarterly updates; uses investor-update-generator internally

## Output format

Same structure as `investor-update-generator`'s template, plus a short pre-send checklist appended:

```
### Pre-Send Checklist
- [ ] At least one honest lowlight included
- [ ] Validator score: [score]/100
- [ ] Accuracy pass complete
- [ ] Tone/spin pass complete
- [ ] Specificity pass complete (asks are actionable)
- [ ] Approval obtained from: [who/what, per config]
- [ ] Sent via: [channel]
```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"echo\",\"skill\":\"investor-update-template\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
