---
name: asset-pipeline
agent: pixel
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Production without pipeline discipline produces three failures: assets that drift off-kit under deadline pressure, files nobody can find or trace to their brief, and QA that gets skipped exactly when volume makes it matter most. (yvon)
triggers:
  - asset pipeline
  - produce assets
  - batch images
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/pixel/custom/asset-pipeline/SKILL.md
  source_hash: dce753020944c60743249d756f7750ac7004f787c7dd9fe1c8b8be3e1d03e07d
  generated: 2026-07-20T03:20:23.748Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/pixel/custom/asset-pipeline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js pixel -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: pixel — Brand Studio · skill: asset-pipeline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pixel\",\"skill\":\"asset-pipeline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/pixel/operational/agent/pixel-config.md"
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

Triggers: "produce assets," "batch images," "make the visuals for [campaign]," or any brief arriving from lena/pulse/rio/muse-developed concepts needing visual production.

## Purpose

Production without pipeline discipline produces three failures: assets that drift off-kit under deadline pressure, files nobody can find or trace to their brief, and QA that gets skipped exactly when volume makes it matter most. The pipeline makes each step mechanical so the only creative judgment spent is where it belongs — in the generation itself.

## Protocol

```
Parse the brief into a SHOT LIST (one line per asset: subject, format/ratio, channel, style ref)
  -> Confirm the shot list with the requester before generating (cheap to fix here)
    -> Generate per shot (prompts via image-style-guide templates + content-image craft)
      -> QA each asset vs atlas's brand-guidelines audit (kit rules; auto-reject off-palette/off-style)
        -> Name per the configured convention; deliver to the configured destination
          -> Hand to the requester with the QA trail; spark's gate is downstream as always
```

## Boundaries & handoffs

asset-pipeline       (WORKFLOW, per brief: shot list → confirm → generate → QA vs
"Produce/batch X" → asset-pipeline (full flow). "Better prompt for X" → content-image directly. "Set up / fix our image style" → image-style-guide. Ambiguous → ask whether the need is setup, one prompt, or a production run.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pixel\",\"skill\":\"asset-pipeline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
