---
name: community-engagement
agent: pulse
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Two failure modes. *Silence*: comments and DMs pile up unanswered, the algorithm reads the account as dead, and warm leads cool. (yvon)
triggers:
  - community engagement
  - check comments/dms
  - engagement sweep
  - reply to this
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/pulse/custom/community-engagement/SKILL.md
  source_hash: a2533c983de3f8a95ceddc847480ed13fa30ff957abe0b139b4e235524db3f2c
  generated: 2026-07-20T03:20:23.793Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/pulse/custom/community-engagement/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js pulse -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: pulse — Brand Studio · skill: community-engagement"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pulse\",\"skill\":\"community-engagement\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/pulse/operational/agent/pulse-config.md"
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

Triggers: "check comments/DMs," "engagement sweep," "reply to this," or on the configured engagement cadence per platform.

## Purpose

Two failure modes. *Silence*: comments and DMs pile up unanswered, the algorithm reads the account as dead, and warm leads cool. *Autopilot*: an agent answers things it shouldn't — a refund dispute, a medical question, a troll baiting the brand — and the screenshot outlives the apology. This skill makes engagement systematic in the safe zone and human in the risky one, with the line written down.

## Protocol

```
Sweep per platform (cadence + scope from config)
  -> Triage each item:
       GREEN  (in reply scope) → draft reply in lena's voice → send/queue per config
       AMBER  (named sensitive classes) → draft FOR OPERATOR, never auto-send
       RED    (escalation triggers) → no reply; escalate immediately with context
  -> Log the sweep (counts, replies, escalations) · patterns → weekly note
```

## Boundaries & handoffs

community-engagement      (CONVERSE: sweep → GREEN reply / AMBER draft-only /

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pulse\",\"skill\":\"community-engagement\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
