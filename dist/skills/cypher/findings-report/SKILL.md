---
name: findings-report
agent: cypher
department: Engineering
version: 1.0.0
tier: 3
description: |
  An uncaged red team's output is compromise; a caged one's output is knowledge. (yvon)
triggers:
  - findings report
  - report cypher's findings
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/cypher/custom/findings-report/SKILL.md
  source_hash: 5e51b0eabfaee38abb49fa4148d79d034d7198c19ff9d5aab069b125e9453e34
  generated: 2026-07-20T03:20:22.551Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/cypher/custom/findings-report/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js cypher -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: cypher — Engineering · skill: findings-report"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cypher\",\"skill\":\"findings-report\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/cypher/operational/agent/cypher-config.md"
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

Triggers: any breach from attack-playbooks or continuous-attack-loop, a rail that bent under attack, a reopened patch (re-attack succeeded), and "report cypher's findings."

## Purpose

An uncaged red team's output is compromise; a caged one's output is knowledge. This skill is where the cage's "findings only" rule becomes concrete: a reproducible, severity-rated, exploitability-analyzed report that tells aegis exactly what to fix and tells quinn exactly what to guard. It's also the accountability trail — every cypher action ends in a report or it didn't happen.

## Protocol

```
Breach observed in-sandbox (caged-scope guaranteed the whole run)
  -> Reproduce in a fresh sandbox instance (offense's separate-verification; unreproduced = no finding)
    -> Write the structured finding (assets/redteam-finding-template.md):
       target · attack class · reproduction (in-sandbox only) · what it yields · severity ·
       affected asset (aegis's threat model) · rail implicated (if any)
      -> ROUTE to quinn intake (the ONLY channel) → aegis (fix) → verified-patching → regression-map
        -> NO exploit artifact leaves the sandbox; the report is prose + sandbox-bound repro, not a weapon
```

## Boundaries & handoffs

findings-report → quinn intake (ONLY channel) → aegis (fix) → verified-patching → regression-map
- "Report / file the finding" → **findings-report** (the only output).

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"cypher\",\"skill\":\"findings-report\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
