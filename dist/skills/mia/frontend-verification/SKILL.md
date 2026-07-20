---
name: frontend-verification
agent: mia
department: Engineering
version: 1.0.0
tier: 3
description: |
  Frontend is where "done" is most often false: the component that looks built but shows mock data, the button wired to nothing, the state that never updates. (yvon)
triggers:
  - frontend verification
  - the ui is wrong/off
  - did this render
  - verify the frontend
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/mia/custom/frontend-verification/SKILL.md
  source_hash: 5cdd3b23e8500bbfebf34908bc792051f3de0033df7abed3259cb747491c29d3
  generated: 2026-07-20T03:20:22.702Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/mia/custom/frontend-verification/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js mia -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: mia — Engineering · skill: frontend-verification"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"mia\",\"skill\":\"frontend-verification\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/mia/operational/agent/mia-config.md"
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

Triggers: "the UI is wrong/off," UI feedback to act on, "did this render," "verify the frontend," a frontend diff at review (edit gate), any user-facing release (release gate), and mock-data/placeholder suspicion.

## Purpose

Frontend is where "done" is most often false: the component that looks built but shows mock data, the button wired to nothing, the state that never updates. Agentation removes the ambiguity in *what to fix* (precise, component-aware feedback instead of "the thing is off"); quinn's browser-verification removes the doubt in *whether it's fixed* (real rendering, not a claim). Together they make frontend "done" mean done.

## Protocol

```
FEEDBACK IN (Agentation MCP — when connected)
  Human annotates the running UI (click/area/state-freeze) → structured context:
  CSS selector · React component tree · computed styles · the ask
    -> mia acts on precise context, not a vague description → change with a known file:line target
      -> mia can acknowledge / resolve-with-summary / dismiss-with-reason (Agentation's two-way loop)

VERIFICATION OUT (quinn's browser-verification — the gate)
  EDIT GATE (Reticle): element exists · real state (NO mock/fixture data) · expected network calls fire · file:line traces
  RELEASE GATE (Playwright): critical user flows pass in a real browser
    -> PASS → gate evidence · FAIL → specific delta, not "looks off"
    -> Mock data rendering = integrity block (dev §0), escalated
```

## Boundaries & handoffs

→ frontend-verification (Agentation feedback IN + quinn's Reticle/Playwright proof OUT)
- "UI is wrong / did it render / verify frontend / mock data" → **frontend-verification**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"mia\",\"skill\":\"frontend-verification\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
