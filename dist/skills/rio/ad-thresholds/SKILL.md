---
name: ad-thresholds
agent: rio
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Paid ads fail through unattended arithmetic: a campaign three days under its ROAS floor bleeding quietly, a winner starved because nobody scaled it, a "small" daily raise compounding past what anyone approved. (yvon)
triggers:
  - ad thresholds
  - scale this ad
  - kill threshold
  - how are the campaigns doing against the rules
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/rio/custom/ad-thresholds/SKILL.md
  source_hash: 1899b3294a39f31105636003daa89e957040636cc54384dee01cbe4b53b681e5
  generated: 2026-07-20T03:20:23.842Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/rio/custom/ad-thresholds/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js rio -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: rio — Brand Studio · skill: ad-thresholds"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rio\",\"skill\":\"ad-thresholds\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/rio/operational/agent/rio-config.md"
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

Triggers: "scale this ad," "kill threshold," "how are the campaigns doing against the rules," or on the configured check cadence (typically daily while campaigns run).

## Purpose

Paid ads fail through unattended arithmetic: a campaign three days under its ROAS floor bleeding quietly, a winner starved because nobody scaled it, a "small" daily raise compounding past what anyone approved. The guardrails make each of those a triggered event instead of a month-end discovery — at whatever thresholds fit the business (a $20/day local shop and a $2K/day venture run the same engine).

## Protocol

```
Load the rules (config: caps, floors, kill/scale criteria, escalation lines — never defaulted)
  -> Pull current campaign metrics (ad-platform connector or operator export; as-of dated)
    -> Check each campaign against each applicable rule
      -> Verdicts: WITHIN RULES / KILL-recommend (criteria met, numbers shown)
         / SCALE-recommend (criteria met; increment per config) / ESCALATE
         (spend-change or total-spend lines → operator, and board's fiduciary gate
          where its approval-gate applies)
        -> Log every verdict + the operator's call; attribution caveats attached
```

## Boundaries & handoffs

ad-thresholds            (GUARDRAILS — daily patrol vs config rules: KILL/SCALE/ESCALATE

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rio\",\"skill\":\"ad-thresholds\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
