---
name: image-style-guide
agent: pixel
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  The gap between "our imagery is warm, editorial, people-first" (kit language) and a prompt that reliably produces it is where visual drift lives. (yvon)
triggers:
  - image style guide
  - image style
  - on-brand image
  - set up our image templates
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/pixel/custom/image-style-guide/SKILL.md
  source_hash: f91c9ea6841a6b117753c39255ffea9024996814be5991ffab3b055e361863c9
  generated: 2026-07-20T03:20:23.753Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/pixel/custom/image-style-guide/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js pixel -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: pixel — Brand Studio · skill: image-style-guide"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pixel\",\"skill\":\"image-style-guide\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "image style," "on-brand image," "set up our image templates," or automatically inside asset-pipeline Phase 2 (every generation pulls the brand's templates).

## Purpose

The gap between "our imagery is warm, editorial, people-first" (kit language) and a prompt that reliably produces it is where visual drift lives. This skill closes it once per brand: derive the parameters from the kit, get the operator's sign-off on a test set, and freeze them as templates — amended deliberately, never per-deadline.

## Protocol

```
Derive style params from the brand kit's imagery section (+ real reference images if supplied)
  -> Draft the template file: prompt constants, per-use-case templates, reject rules
    -> Test set: generate 3–5 assets, operator reviews → corrections encoded (like lena's voice loop)
      -> Freeze as the brand's image-style file; asset-pipeline consumes it every run
        -> Rejects at QA cite the specific param violated; repeated rejects → template or kit review
```

## Boundaries & handoffs

image-style-guide    (SETUP, once per brand: kit §5 → prompt constants + templates +
"Produce/batch X" → asset-pipeline (full flow). "Better prompt for X" → content-image directly. "Set up / fix our image style" → image-style-guide. Ambiguous → ask whether the need is setup, one prompt, or a production run.

## Output format

Phase 1–2 output the draft/approved template file. In production, this skill's output is the *prompt block* per shot: template used, filled parameters, and the reject rules the QA step will check.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"pixel\",\"skill\":\"image-style-guide\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
