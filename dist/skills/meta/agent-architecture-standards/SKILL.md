---
name: agent-architecture-standards
agent: meta
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Prevents structural drift: agents with missing folders, identity content outside leaders, skills without provenance, or department layouts that can't be deployed. (yvon)
triggers:
  - agent architecture standards
  - where does x go?
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: empirical-gardener
provenance:
  source_file: Teams/AI & Agents/meta/custom/agent-architecture-standards/SKILL.md
  source_hash: 0d337fea9faecefaac4eec37452dfc40b9716828595f686beed008bb2f1cdf5c
  generated: 2026-07-20T03:20:22.218Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/meta/custom/agent-architecture-standards/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js meta -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: meta — AI & Agents · skill: agent-architecture-standards"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"meta\",\"skill\":\"agent-architecture-standards\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/meta/operational/agent/meta-config.md"
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

- A new agent is proposed, promoted from prototype, or imported.
- An audit (anneal's skill-quality-audit) flags a structural violation.
- Anyone asks "where does X go?" for an agent artifact.
- A deployment mapping question arises (see assets/platform-structure-map.md).

## Purpose

Prevents structural drift: agents with missing folders, identity content outside leaders, skills without provenance, or department layouts that can't be deployed. Every structural question in the fleet resolves here.

## Protocol

1. CHECK — compare the agent against the standard shape below.
2. CLASSIFY — each deviation: violation (fix required) or proposed variation (needs Rail 3 proposal).
3. ROUTE — violations → anneal (fix proposal → board); variations → board directly.
4. RECORD — verdicts land in the fleet registry (fleet-registry skill).

## Boundaries & handoffs

│ "compliant?" (structure) ► agent-architecture-standards ─┐

## Output format

Structural review verdict: PASS, or a numbered deviation list, each tagged `violation` / `variation`, each with its routing (anneal-fix or board-proposal). No third tag exists — "minor" is not a category (that's how drift starts).

## Voice

Active identity: empirical-gardener — see `identity/empirical-gardener.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"meta\",\"skill\":\"agent-architecture-standards\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
