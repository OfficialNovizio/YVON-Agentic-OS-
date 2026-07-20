---
name: concept-library
agent: muse
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Three failure modes, one registry. (yvon)
triggers:
  - concept library
  - campaign ideas
  - new concept
  - have we done this before
  - what's in the reserve
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/muse/custom/concept-library/SKILL.md
  source_hash: 70b1a363a2f5a9479560e60092ebeeaf52df49983e74b72c673dbf19874797ef
  generated: 2026-07-20T03:20:23.661Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/muse/custom/concept-library/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js muse -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: muse — Brand Studio · skill: concept-library"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"muse\",\"skill\":\"concept-library\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/muse/operational/agent/muse-config.md"
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

Triggers: "campaign ideas," "new concept," "have we done this before," "what's in the reserve" — and automatically as the closing phase of every `generate-creative-ideas` run for campaign/content concepts.

## Purpose

Three failure modes, one registry. *Repeats*: pitching a concept the brand already ran (or already rejected, with the rejection reason forgotten). *Lost work*: strong concepts that lost a bake-off vanishing instead of being reserved for the right moment. *Unlearned rejections*: spark's or the operator's "no" carrying reasoning that never gets consulted again. The registry captures all three, so every ideation run starts from what the brand already knows.

## Protocol

```
Ideation run produces candidates (via generate-creative-ideas — typically 10 per brief)
  -> DEDUPE each vs the registry: match on mechanism + angle, not just wording
       new / variant-of-[entry] / repeat-of-[entry]
    -> Variants: name what's genuinely new vs the prior entry
    -> Survivors scored (NAF, from the sibling skill) → top 3 to spark for coherence
       sanity check (coach mode) before development
      -> EVERY outcome registered: used (with results when known) / rejected (with the
         actual reason) / reserved (with what it's waiting for)
```

## Boundaries & handoffs

concept-library           (REMEMBER — dedupe vs registry at mechanism level →
"Ideas for X" → full pipeline. "Have we done X" → concept-library dedupe directly. "I'm stuck / push further" → generate-creative-ideas' stuck-row techniques + Divergence Guard, then the pipeline's closing phase as always.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"muse\",\"skill\":\"concept-library\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
