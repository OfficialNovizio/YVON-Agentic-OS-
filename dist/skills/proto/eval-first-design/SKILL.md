---
name: eval-first-design
agent: proto
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Criteria written after building are rationalizations of whatever got built. (yvon)
triggers:
  - eval first design
  - what did we agree success meant?
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/proto/custom/eval-first-design/SKILL.md
  source_hash: 15b9e22fd4c36ea6e1109b22cf81b95d0cfdfa45f36e6a6145910c2ae4131d44
  generated: 2026-07-20T03:20:22.281Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/proto/custom/eval-first-design/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js proto -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: proto — AI & Agents · skill: eval-first-design"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"proto\",\"skill\":\"eval-first-design\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/proto/operational/agent/proto-config.md"
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

- Before ANY prototype build (agent-prototype-kit requires it).
- Before a tool trial (scout's intake borrows this — criteria-before-trial).
- When a promotion verdict is contested ("what did we agree success meant?").

## Purpose

Criteria written after building are rationalizations of whatever got built. Writing the eval first forces the hypothesis to be falsifiable and makes the expiry verdict mechanical instead of political.

## Protocol

HYPOTHESIS (one, falsifiable) → CRITERIA (3–5, each: what's measured, how, pass bar; at least one criterion must be capable of FAILING the prototype — a rubric that can't fail is decoration) → BASELINE (what does the fleet do WITHOUT this? if nothing is broken, why prototype? — the writing-skills RED discipline applied to agents) → FREEZE (criteria lock when the manifest registers; edits after that are Rail 3 amendments, visible) → SCORE (at expiry: against frozen criteria only).

## Boundaries & handoffs

└► eval-first-design (criteria, frozen) ─► registry entry (meta, state=prototype)

## Output format

The criteria table (manifest section), baseline record, and at expiry a scored table: criterion / measured / bar / PASS-FAIL.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"proto\",\"skill\":\"eval-first-design\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
