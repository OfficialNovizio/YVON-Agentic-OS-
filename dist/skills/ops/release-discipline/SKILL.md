---
name: release-discipline
agent: ops
department: Engineering
version: 1.0.0
tier: 3
description: |
  The operator's stated goal is "maintain everything without breaking stuff" — and production is where breakage becomes real. (yvon)
triggers:
  - release discipline
  - deploy
  - ship it
  - release to production
  - rollback
  - canary
  - is it safe to deploy
allowed-tools:
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/ops/custom/release-discipline/SKILL.md
  source_hash: 4e4ca370b8d3f15d1f399430b062acc0463c8989728db157dcfadcc786443061
  generated: 2026-07-20T03:20:22.803Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/ops/custom/release-discipline/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ops -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ops — Engineering · skill: release-discipline"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ops\",\"skill\":\"release-discipline\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/ops/operational/agent/ops-config.md"
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

Triggers: "deploy," "ship it," "release to production," "rollback," "canary," "is it safe to deploy," post-GATE-PASS handoff from quinn, and any hotfix (which follows the same discipline, faster — never a different one).

## Purpose

The operator's stated goal is "maintain everything without breaking stuff" — and production is where breakage becomes real. Most production disasters aren't bad code; they're bad *shipping*: no rollback, no health check, a migration run mid-deploy by an agent, a Friday-evening push nobody watched. This skill makes shipping boring, reversible, and observed.

## Protocol

```
Release candidate arrives
  -> PRECONDITIONS: quinn GATE PASS (quality) + no open rail violation (security) — both, always
    -> ROLLBACK FIRST: identify the rollback path (previous artifact / migration down-script /
       flag-off) and EXERCISE it in staging — a documented-but-untested rollback fails this step
      -> Rail 3 check: any DB migration in this release → dana's prepared script, OPERATOR runs it,
         sequenced explicitly (expand-migrate-contract; deploy never auto-runs destructive migrations)
        -> DEPLOY per playbook strategy (blue-green / canary / rolling — credited patterns; which one,
           per platform-playbook + change risk)
          -> VERIFY: health checks green · monitoring baselines steady (maintenance-hygiene's numbers)
             · smoke of critical flows
            -> HOLD the watch window (config) → done
            -> Any verify step fails → ROLL BACK NOW, then diagnose (incident-response if user-facing)
```

## Boundaries & handoffs

- "Deploy / ship / rollback / canary" → **release-discipline** (preconditions: quinn GATE PASS + locked plan), which pulls strategy/mechanics from **marketplace/deployment-patterns** (rolling/blue-green/canary trade-offs, Docker, CI/CD stages, probes, readiness checklists — dated snippets bind via platform-playbooks). Conflicts resolve to release-discipline.
- A failed deploy verify → release-discipline rolls back NOW; incident-response only if users were hit.
- **dev**: design flaws from incidents become ADRs; recurrence at a mapped fragility escalates to dev; platform changes are ADRs before playbooks change; "rollback-ready" in dev's DoD is release-discipline's requirement.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ops\",\"skill\":\"release-discipline\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
