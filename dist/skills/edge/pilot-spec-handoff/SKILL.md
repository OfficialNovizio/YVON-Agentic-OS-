---
name: pilot-spec-handoff
agent: edge
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Handoffs are where context dies (the cross-agent-handoff problem, applied here). (yvon)
triggers:
  - pilot spec handoff
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/edge/custom/pilot-spec-handoff/SKILL.md
  source_hash: e6ec245535da33c4b72e61a627b08f0ba1287369a7d8f89bcf08098ca12e47a0
  generated: 2026-07-20T03:20:22.070Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/edge/custom/pilot-spec-handoff/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js edge -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: edge — AI & Agents · skill: pilot-spec-handoff"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"edge\",\"skill\":\"pilot-spec-handoff\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/edge/operational/agent/edge-config.md"
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

- tech-adoption-criteria produces an above-bar verdict.
- proto bounces a spec back as under-specified (repair loop).
- A pilot completes and its verdict needs to flow back into edge's records.

## Purpose

Handoffs are where context dies (the cross-agent-handoff problem, applied here). A scored adoption verdict without a crisp pilot spec becomes a vague prototype that can't fail honestly.

## Protocol

SPEC (one page: the tech + version; the ONE hypothesis the pilot tests — derived from the fit axis's named goal/gap; scoring memo attached; constraints: budget `<FILL_IN>`, compliance conditions from the regulatory axis, timebox recommendation; what PROMOTE would mean here — adoption path sketch) → HANDOFF (to proto: echo-confirmed — receiver restates the hypothesis; mismatch = repair before build) → TRACK (pilot registered, edge keeps a pointer) → RETURN (proto's verdict flows back: promote-path techs re-enter as adoption proposals with pilot evidence; archived ones update the watchlist or drop, with the learnings ref).

## Boundaries & handoffs

└─above bar─► pilot-spec-handoff ─► proto (cage) ─verdict returns─► adoption proposal (Rail 3) or watchlist update

## Output format

One-page pilot specs; handoff echo records; return entries (pilot verdict → watchlist/adoption-proposal update).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"edge\",\"skill\":\"pilot-spec-handoff\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
