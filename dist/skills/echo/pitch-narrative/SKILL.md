---
name: pitch-narrative
agent: echo
department: Executive Office
version: 1.0.0
tier: 3
description: |
  Prevent the pitch story from drifting or being reinvented from scratch every time a new pitch is needed. (yvon)
triggers:
  - pitch narrative
  - investor deck
  - pitch update
  - fundraise narrative
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Executive Office/echo/custom/pitch-narrative/SKILL.md
  source_hash: b17bf91f55ea1a7d71bcc7986afb6fc5179f96f1adf261f55b318ac824b34ef8
  generated: 2026-07-20T03:20:24.159Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Executive Office/echo/custom/pitch-narrative/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js echo -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: echo — Executive Office · skill: pitch-narrative"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"echo\",\"skill\":\"pitch-narrative\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "investor deck" (narrative input for pitch-framework), "pitch update," "fundraise narrative," "adapt the pitch for [audience]," or any time the underlying business story needs to be restated for a new context.

## Purpose

Prevent the pitch story from drifting or being reinvented from scratch every time a new pitch is needed. Give echo a consistent process for adapting one underlying narrative to whichever pitch type and audience is in front of it, while keeping a record of what changed and why.

## Protocol

```
Establish or load the business profile (never assumed)
  -> Determine pitch type (investor / partnership / customer-facing)
    -> Determine audience tier within that type
      -> Adapt narrative depth and framing accordingly
        -> Version the output; log what changed from the last version
```

## Boundaries & handoffs

- **handoffs**: pitch-framework pulls the current narrative from here; run first if stale or missing

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"echo\",\"skill\":\"pitch-narrative\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
