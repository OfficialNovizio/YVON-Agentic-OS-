---
name: ecosystem-scanning
agent: scout
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  The ecosystem moves weekly; the fleet shouldn't chase it, but it also shouldn't discover a load-bearing tool a year late. (yvon)
triggers:
  - ecosystem scanning
  - find us an x
allowed-tools:
  - Read
  - WebSearch
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/scout/custom/ecosystem-scanning/SKILL.md
  source_hash: 8ae3e7ce3dac88a40d927a3d6ab27cdaaf64074d910484c9f15c9c2be77a7d02
  generated: 2026-07-20T03:20:22.384Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/scout/custom/ecosystem-scanning/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js scout -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: scout — AI & Agents · skill: ecosystem-scanning"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scout\",\"skill\":\"ecosystem-scanning\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Scan cadence fires (`<FILL_IN: suggested weekly, catalog default>`).
- A named gap needs a targeted sweep ("find us an X").
- A department build begins (pre-build marketplace pass — the playbook's search, standing).

## Purpose

The ecosystem moves weekly; the fleet shouldn't chase it, but it also shouldn't discover a load-bearing tool a year late. A disciplined scan converts noise into a small, gap-matched shortlist.

## Protocol

SOURCES (dated list: assets kept per-scan — currently skillsmp.com, mcpmarket.com, awesomeskill.ai, github topic feeds, MCP registry `<FILL_IN: + operator additions>`) → SWEEP → FILTER (against the gap register: current `PENDING` items from agent.md files, logical-book wants, integration candidates) → SHORTLIST (max `<FILL_IN: suggested 5>` per scan, each with source URL + which gap it matches) → HAND OFF (tools → tool-evaluation-intake; skills → marketplace-skill-scouting).

## Boundaries & handoffs

cadence ─► ecosystem-scanning ─shortlist─► tool-evaluation-intake (tools) / marketplace-skill-scouting (skills) / forge (techniques) / edge (platforms)

## Output format

Dated scan log: sources, counts, shortlist table (item / URL / matched gap / route), zero-result gaps.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scout\",\"skill\":\"ecosystem-scanning\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
