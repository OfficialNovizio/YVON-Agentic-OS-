---
name: coherence-qa
agent: spark
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Individual agents each enforce their own lane well — atlas catches off-palette, lena catches off-voice, weave catches off-arc. (yvon)
triggers:
  - coherence qa
  - creative review
  - final check
  - gate this
  - ready to ship?
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: idea-guardian-david-ogilvy
provenance:
  source_file: Teams/Brand Studio/spark/custom/coherence-qa/SKILL.md
  source_hash: 3661b2cb377d95f404a8237412d12f916c1eeb25aa294ec61d210cc4be741161
  generated: 2026-07-20T03:20:23.880Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/spark/custom/coherence-qa/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js spark -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: spark — Brand Studio · skill: coherence-qa"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spark\",\"skill\":\"coherence-qa\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/spark/operational/agent/spark-config.md"
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

Triggers: "creative review," "final check," "gate this," "ready to ship?" — and **mandatorily** for every outbound creative from any Brand Studio agent (pixel's batches, pulse's posts and series, lena's campaigns and sequences, rio's ad creatives).

Not for: in-progress craft feedback (that's `art-direction-critique`, spark's other skill — REWORK coaching, not gating), or re-running the definers' full audits (spark consumes their results).

## Purpose

Individual agents each enforce their own lane well — atlas catches off-palette, lena catches off-voice, weave catches off-arc. What none of them see is the *whole*: an asset that passes each lane separately can still be incoherent as a piece (the visual mood fighting the chapter's tension, a punchy voice register on a somber arc beat), and at production volume someone must be the last pair of eyes with authority to stop the ship. That's spark.

## Protocol

```
Receive the asset + its lane results (atlas audit / lena voice check / weave arc verdict —
run any that are missing rather than gating blind)
  -> Check 1 VISUAL: atlas brand-guidelines PASS in hand?
  -> Check 2 VERBAL: lena voice check clean?
  -> Check 3 NARRATIVE: weave ON-ARC verdict + ledger entry?
  -> Check 4 BLEED (multi-brand only): separation clean?
  -> Check 5 BEHAVIORAL (dormant until dept built): review complete?
  -> COHERENCE JUDGMENT: do the lanes agree with each other as one piece?
    -> PASS (ship + log) / FIX LIST (itemized, cited, blocking) 
```

## Boundaries & handoffs

- **All outbound creative → coherence-qa.** Pixel's batches, pulse's posts/series, lena's campaigns/sequences, rio's ad creatives — no exemptions, no partial ships.

## Output format

```

## Voice

Active identity: idea-guardian-david-ogilvy — see `identity/idea-guardian-david-ogilvy.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"spark\",\"skill\":\"coherence-qa\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
