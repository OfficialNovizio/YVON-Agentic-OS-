---
name: ad-platform-mechanics
agent: rio
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  ad-platform-mechanics carries what every ad platform requires *beyond* strategy: tracking hygiene, auction behavior, creative-format specs, learning-phase rules. (yvon)
triggers:
  - ad platform mechanics
  - platform best practice
  - why is delivery weird
  - set up tracking right
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/rio/custom/ad-platform-mechanics/SKILL.md
  source_hash: 8ea7099f3454e4c620e8e3fc525922082e99a6324554a585c43ddcbcd30d7349
  generated: 2026-07-20T03:20:23.836Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/rio/custom/ad-platform-mechanics/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js rio -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: rio — Brand Studio · skill: ad-platform-mechanics"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rio\",\"skill\":\"ad-platform-mechanics\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/rio/operational/agent/rio-config.md"
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

Triggers: "platform best practice," "why is delivery weird," "set up tracking right," "specs for [platform]," and as the reference layer inside every rio campaign action.

## Purpose

ad-platform-mechanics carries what every ad platform requires *beyond* strategy: tracking hygiene, auction behavior, creative-format specs, learning-phase rules. It splits the knowledge by shelf life, exactly like pulse's hook design: a small set of **durable principles** (below — true across platforms and years) and a **dated playbook per ad platform** (volatile: current specs, auction quirks, policy lines — reviewed on cadence, refreshed from operator observations, kai's data, and eventually the shared research layer).

## Protocol

1. **Setup (once per platform):** run the durable principles as a checklist (tracking verified, policies reviewed with the operator, learning-phase rules noted), then instantiate the playbook from the template — current specs and norms, all dated.
2. **In operation:** campaign actions cite the playbook (formats, refresh cadence, learning-phase windows); anything the playbook doesn't cover gets answered provisionally and *added, dated*.
3. **On cadence:** review the playbook — kai's data and operator observations refresh it; stale entries are re-confirmed or struck. The refresh log is the audit trail.

## Boundaries & handoffs

ad-platform-mechanics    (PLATFORM LAYER — durable principles static; volatile specs

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"rio\",\"skill\":\"ad-platform-mechanics\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
