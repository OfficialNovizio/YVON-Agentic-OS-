---
name: usage-licensing
agent: tempo
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Music misuse is the copyright strike small businesses walk into blind: a "royalty-free" track whose license excludes paid ads, a subscription that lapsed while old videos stay live, a platform's… (yvon)
triggers:
  - usage licensing
  - can we use this track
  - license check
  - add to the registry
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/tempo/custom/usage-licensing/SKILL.md
  source_hash: b700b7bb0304ea620265f0614d184fae5f205fc5609f6040451ee333d3f27230
  generated: 2026-07-20T03:20:23.924Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/tempo/custom/usage-licensing/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js tempo -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: tempo — Brand Studio · skill: usage-licensing"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"tempo\",\"skill\":\"usage-licensing\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/tempo/operational/agent/tempo-config.md"
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

Triggers: "can we use this track," "license check," "add to the registry," subscription renewals/lapses — and as sound-identity's gate on every selection.

## Purpose

Music misuse is the copyright strike small businesses walk into blind: a "royalty-free" track whose license excludes paid ads, a subscription that lapsed while old videos stay live, a platform's content-ID matching a track someone grabbed years ago. The registry makes every audio asset's rights status a documented fact with an expiry date, not a memory.

## Protocol

```
Acquisition or use request
  -> VERIFY the license against the actual use: source · license type · permitted uses
     (org/paid ads/monetized platforms) · territory · duration/expiry · attribution required
    -> Clear fit → REGISTER (append-only) → usable by sound-identity
    -> Ambiguous terms → OPERATOR (and counsel) with the specific clause quoted — never
       hopeful interpretation
    -> New cost → the spend path (operator; board's gate where its scope applies)
  -> MAINTAIN: expiry sweep on cadence — lapsed licenses flag every live asset using them
```

## Boundaries & handoffs

usage-licensing   (RIGHTS — verify against the actual use, register, sweep expiries;

## Output format

Per check: `[track] · [use requested] → CLEARED (clause quoted, registry ID) / AMBIGUOUS → operator (clause quoted) / NOT PERMITTED (clause quoted)`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"tempo\",\"skill\":\"usage-licensing\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
