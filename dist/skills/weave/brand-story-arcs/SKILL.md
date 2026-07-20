---
name: brand-story-arcs
agent: weave
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Two business problems, one mechanism. (yvon)
triggers:
  - brand story arcs
  - campaign story
  - narrative angle
  - what's the story here
  - does this fit our story
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/weave/custom/brand-story-arcs/SKILL.md
  source_hash: bdeda72080999924440b69efc4e240ada039b14c868e8a1610cfcc9085f623e1
  generated: 2026-07-20T03:20:23.958Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/weave/custom/brand-story-arcs/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js weave -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: weave — Brand Studio · skill: brand-story-arcs"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"weave\",\"skill\":\"brand-story-arcs\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/weave/operational/agent/weave-config.md"
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

Triggers: "campaign story," "narrative angle," "what's the story here," "does this fit our story," creating or revising a brand's arc, or automatically whenever muse's concepts, lena's campaigns, or pulse's content series need narrative positioning — and as spark's third gate reference (arc fit).

Not for: individual story *craft* (hooks, five-second moments, dinner-test delivery — that's the sibling `brand-storytelling` skill), or wording (lena).

## Purpose

Two business problems, one mechanism. First, *memory*: audiences forget disconnected campaigns but remember stories that continue — a chapter inherits all the meaning of the chapters before it, which is compounding attention instead of rented attention. Second, *coherence at volume*: when pulse posts daily and pixel produces in batches, the only way the output stays one brand instead of a content mill is a story spine everything maps back to. For a small business this is the difference between "that company that posts stuff" and "that story I'm following."

## Protocol

```
Load the brand's arc (configured path)
  -> If none exists: STOP — build it via assets/story-arc-template.md from the operator's
     real history and positioning (never invent a founding story or fabricate stakes)
    -> For any campaign/content: position it as a chapter
       — which arc element does it advance? (world-change / villain / hero's struggle /
         guide's proof / promised-land glimpse)
       — ARC-FIT test: could this chapter only belong to THIS brand's story?
    -> Continuity check vs the chapter registry
       — contradicts a told chapter? repeats one? breaks canon facts?
        -> Verdict: ON-ARC (chapter registered) / OFF-ARC (named conflict + the on-arc
           alternative) / ARC GAP (the arc doesn't cover this — operator amends, not weave)
```

## Boundaries & handoffs

- **muse → brand-story-arcs**: surviving concepts arrive for chapter positioning; OFF-ARC verdicts return with the on-arc alternative (muse's library records both).
- **brand-story-arcs → brand-storytelling → lena**: approved chapter → craft treatment (hook, moment, stakes) → lena's voice + humanic pass. Weave never wordsmiths final copy.
"Does this fit our story / what's the story here" → brand-story-arcs. "Make this story better / hook / structure" → brand-storytelling (after arc check if it's campaign-bound). "Build our story" → arc creation loop. Ambiguous → ask whether the need is positioning (architecture) or telling (craft).
No arc → brand-story-arcs' Phase-1 stop (build from real history, or labeled pre-arc content). Craft questions with no campaign attached run brand-storytelling standalone.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"weave\",\"skill\":\"brand-story-arcs\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
