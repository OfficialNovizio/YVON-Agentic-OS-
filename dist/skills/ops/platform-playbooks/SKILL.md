---
name: platform-playbooks
agent: ops
department: Engineering
version: 1.0.0
tier: 3
description: |
  Platform knowledge rots fast — consoles move, CLIs deprecate, pricing changes — and it varies per business. (yvon)
triggers:
  - platform playbooks
  - where are the logs
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/ops/custom/platform-playbooks/SKILL.md
  source_hash: a7539a0668d0941da564f618025da143845d7f0986cac0528566dd02d03209f3
  generated: 2026-07-20T03:20:22.800Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/ops/custom/platform-playbooks/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ops -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ops — Engineering · skill: platform-playbooks"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ops\",\"skill\":\"platform-playbooks\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "how do we deploy on [host]," "where are the logs," "write the playbook for [platform]," any sibling skill reaching a host-specific step, onboarding a new business (toongine binding), a platform migration ADR landing, and a dated playbook crossing its staleness horizon.

## Purpose

Platform knowledge rots fast — consoles move, CLIs deprecate, pricing changes — and it varies per business. Baked into skills, it makes the team serve one stack and go stale silently (the catalog's original defect, plan §1). In dated playbooks, it stays current-or-visibly-old: a playbook dated 14 months ago announces its own unreliability, and the same 11 agents serve any stack by swapping playbooks, not skills.

## Protocol

```
stack-profile names the platforms (host, CI/CD, telemetry, backup service, DNS/CDN…)
  -> ONE PLAYBOOK PER PLATFORM (assets/platform-playbook-template.md), each header carrying:
     as-of DATE · source (vendor docs version / verified-by-doing record ref) · staleness horizon
    -> Sibling skills reference playbooks at their host-specific steps
       (release-discipline: "deploy per playbook §" · hygiene: "backup service mechanics per playbook")
      -> UPDATED BY: verified deploy/incident/hygiene records (ground truth beats docs) ·
         platform changes noticed in use · staleness-horizon review (config cadence)
        -> Platform CHANGES (new host, new CI) are dev ADRs → stack-profile updates → new playbook;
           the old playbook is archived-dated, never edited into fiction
```

## Boundaries & handoffs

- "Deploy / ship / rollback / canary" → **release-discipline** (preconditions: quinn GATE PASS + locked plan), which pulls strategy/mechanics from **marketplace/deployment-patterns** (rolling/blue-green/canary trade-offs, Docker, CI/CD stages, probes, readiness checklists — dated snippets bind via platform-playbooks). Conflicts resolve to release-discipline.
- "How does [platform] do X / write the playbook / where are the logs" → **platform-playbooks**.

## Output format

Playbooks follow `assets/platform-playbook-template.md`. In use, agents cite date + section: "per [host] playbook §Deploy (as of [date])" — the date travels with every citation.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ops\",\"skill\":\"platform-playbooks\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
