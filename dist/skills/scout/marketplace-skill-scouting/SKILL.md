---
name: marketplace-skill-scouting
agent: scout
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Real, sourced skills are cheaper to verify than custom builds — but only if someone actually searches well. (yvon)
triggers:
  - marketplace skill scouting
  - is there a real skill for x?
allowed-tools:
  - Read
  - WebSearch
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/scout/custom/marketplace-skill-scouting/SKILL.md
  source_hash: 5d11d6cd72f92d4177a4be5df8562674747415933e5e944052b2de889484c8b3
  generated: 2026-07-20T03:20:22.388Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/scout/custom/marketplace-skill-scouting/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js scout -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: scout — AI & Agents · skill: marketplace-skill-scouting"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scout\",\"skill\":\"marketplace-skill-scouting\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/scout/operational/agent/scout-config.md"
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

- A department/agent build starts (pre-build pass — playbook §3).
- A custom skill's frontmatter carries a queued marketplace candidate (`PENDING` notes — e.g. gauge's llm-ops-basics, relay's integration-patterns).
- Any "is there a real skill for X?" question.

## Purpose

Real, sourced skills are cheaper to verify than custom builds — but only if someone actually searches well. This skill is that search, done the same way every time.

## Protocol

PURPOSE (restate the need as a problem, not the catalog's aspirational name — playbook 4.1) → SEARCH (skillsmp.com, mcpmarket.com, awesomeskill.ai, github `<FILL_IN: + operator sources>`) → COMPARE (candidates honestly: coverage, source reputation, maintenance, licence, fit vs our house standards) → PRESENT (each: what it is, why it fits vs alternatives, source URL — playbook 4.3) → STOP (no copying before explicit approval — playbook 4.4) → after approval: verbatim copy w/ provenance frontmatter (meta's skill-authoring-standards governs format; merges become custom per playbook 4.6).

## Boundaries & handoffs

build starts / PENDING note ─► marketplace-skill-scouting ─► present → STOP → operator approval → meta's standards

## Output format

Candidate presentations (what/why/URL per candidate, compared); empty-result findings; adoption paperwork per meta's standards after approval.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scout\",\"skill\":\"marketplace-skill-scouting\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
