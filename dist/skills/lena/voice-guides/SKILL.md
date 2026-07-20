---
name: voice-guides
agent: lena
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  The blueprint's brand_voice rule says it best: be specific enough that two different models would produce recognizably similar output. (yvon)
triggers:
  - voice guides
  - write in brand voice
  - tone check
  - does this sound like us
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/lena/custom/voice-guides/SKILL.md
  source_hash: d4f14b6458d2bc5378d2b8aabc3e9b242e9512d2be2b037541e066dcc504b8f4
  generated: 2026-07-20T03:20:23.620Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/lena/custom/voice-guides/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js lena -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: lena — Brand Studio · skill: voice-guides"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"lena\",\"skill\":\"voice-guides\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/lena/operational/agent/lena-config.md"
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

Triggers: "write in brand voice," "tone check," "does this sound like us," creating or revising a brand's voice guide, or as the loaded profile whenever lena (or pulse, for social) drafts anything.

## Purpose

The blueprint's brand_voice rule says it best: be specific enough that two different models would produce recognizably similar output. Voice that lives in someone's head produces drift with every draft; voice written as testable rules produces consistency at any volume — which is exactly what AI-assisted content production needs most.

## Protocol

```
Load the voice guide (configured path, per brand)
  -> If none exists: STOP — offer assets/voice-guide-template.md; build it from the
     operator's real samples (never invent a voice)
    -> Draft in the voice (or check a provided draft)
      -> Self-check against banned/required patterns + the guide's examples
        -> Voice-breaking requests → flag to the operator, don't silently comply
```

## Boundaries & handoffs

voice-guides            (load the brand's voice — the foundation; no guide → create it
- **voice-guides → everything**: the loaded guide governs *how* all other skills' output sounds; formula keeps structure, voice wins on wording.
"Write X" → structure skill for X's type, then always humanic-writing. "Fix/humanize X" → humanic-writing directly. "Does this sound like us" → voice-guides check. Ambiguous → ask whether the need is drafting, structuring, sequencing, or humanizing.
No voice guide → voice-guides' creation loop first (or explicitly-labeled voice-neutral draft for emergencies). Everything else: each skill's own clarify-first gate.

## Output format

Draft + a short check block:

```
### Voice check — [brand], guide [version]
Banned patterns: [none found / fixed: …] · Required patterns: [present/na]
Read-aloud: [pass / adjusted: …] · Conflicts flagged: [none / …]
```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"lena\",\"skill\":\"voice-guides\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
