---
name: skill-authoring-standards
agent: meta
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Skills are the fleet's entire substance — plain-text files. (yvon)
triggers:
  - skill authoring standards
allowed-tools:
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: empirical-gardener
provenance:
  source_file: Teams/AI & Agents/meta/custom/skill-authoring-standards/SKILL.md
  source_hash: 0b8c389acdba997f7177ae7f39fe8246955168a8dfa8dc2cf2b2948a394161a5
  generated: 2026-07-29T22:20:50.997Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/meta/custom/skill-authoring-standards/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js meta -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: meta — AI & Agents · skill: skill-authoring-standards"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"meta\",\"skill\":\"skill-authoring-standards\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Any new skill is authored, adopted from a marketplace, or merged.
- anneal prepares a skill edit proposal (the edited file must still comply).
- An audit flags frontmatter, naming, or hardcoding violations.

## Purpose

Skills are the fleet's entire substance — plain-text files. If their format drifts, provenance vanishes, descriptions stop triggering, and the self-annealing loop has nothing reliable to edit. This skill makes every skill file auditable, discoverable, and portable.

## Protocol

AUTHOR (or ADOPT) → LINT (checklist below) → TEST (writing-skills method) → PROPOSE (Rail 3, board) → REGISTER (fleet-registry).

## Boundaries & handoffs

│ "compliant?" (skill file) ► skill-authoring-standards ───┤ violations → route to anneal
│ authoring/adopting ──────► skill-authoring-standards → writing-skills (test) → fleet-governance (propose)

## Output format

Authoring lint verdict: PASS or numbered violations, each citing the rule number above. Machine check available: anneal's `skill_audit.py` covers rules 1 and 5 mechanically; the rest are meta's judgment.

## Voice

Active identity: empirical-gardener — see `identity/empirical-gardener.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"meta\",\"skill\":\"skill-authoring-standards\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
