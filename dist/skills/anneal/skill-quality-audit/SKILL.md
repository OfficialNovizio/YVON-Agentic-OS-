---
name: skill-quality-audit
agent: anneal
department: AI & Agents
version: 1.1.0
tier: 3
description: |
  Drift is cumulative and invisible until audited. (yvon)
triggers:
  - skill quality audit
allowed-tools:
  - Write
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/anneal/custom/skill-quality-audit/SKILL.md
  source_hash: 23a4a68a0f07910b8303b36d9c4b8c2755bf34805e7f586d6ce0f08963c8e03f
  generated: 2026-07-29T22:20:50.967Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/anneal/custom/skill-quality-audit/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js anneal -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: anneal — AI & Agents · skill: skill-quality-audit"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anneal\",\"skill\":\"skill-quality-audit\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/anneal/operational/agent/anneal-config.md"
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

- Audit cadence fires (`<FILL_IN: suggested quarterly, aligned with relay/meta audits>`).
- A department build or big change lands (post-change sweep).
- Spot-check before any deployment wave.

## Purpose

Drift is cumulative and invisible until audited. A fleet whose substance is plain text needs a linter with a schedule.

## Protocol

SWEEP (`python Shared OS/logical/skill_audit.py <root> [--forbidden words.txt]`) → TRIAGE (each finding: violation class + owning agent) → JUDGE (mechanical findings are candidates, not verdicts — read each in context; provenance frontmatter legitimately contains venture names) → ROUTE (fix proposals via skill-lifecycle; structural issues to meta; false positives recorded so the next audit is smarter) → REPORT (dated audit report, append-only).

## Boundaries & handoffs

audit cadence ─► skill-quality-audit ─findings─► skill-lifecycle (fixes) / meta (structure) / false-positive log

## Output format

Dated audit report: findings table (file, line, class, disposition, route), summary counts, comparison to last audit (drift direction).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"anneal\",\"skill\":\"skill-quality-audit\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
