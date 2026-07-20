---
name: maintenance-hygiene
agent: ops
department: Engineering
version: 1.0.0
tier: 3
description: |
  Systems don't only break when changed — they rot in place. (yvon)
triggers:
  - maintenance hygiene
  - maintenance
  - update dependencies
  - are backups working
  - what's our baseline
  - cert expiry
  - patch this cve
  - what does normal look like
allowed-tools: []
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/ops/custom/maintenance-hygiene/SKILL.md
  source_hash: 5e3511de163cb9ae4eb579e3ffcf92e991cc9c0c29147fac78028dc2d0089b53
  generated: 2026-07-20T03:20:22.796Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/ops/custom/maintenance-hygiene/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ops -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ops — Engineering · skill: maintenance-hygiene"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ops\",\"skill\":\"maintenance-hygiene\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "maintenance," "update dependencies," "are backups working," "what's our baseline," "cert expiry," "patch this CVE," scheduled cadence runs (config), post-incident baseline updates, and quinn/dev asking "what does normal look like" during verification.

## Purpose

Systems don't only break when changed — they rot in place. Dependencies accrue CVEs, backups silently stop working, certs expire on a Sunday, "normal" drifts until nobody knows what healthy looks like. Every one of those is a fully preventable incident. Hygiene converts them from surprises into calendar entries.

## Protocol

```
THE REGISTER (assets/maintenance-register-template.md — one document, four sections)

1 DEPENDENCIES & PATCHES
  cadence per config → inventory drift vs stack-profile → security patches by CVE severity
  → every update ships through the NORMAL pipeline: quinn's gate + release-discipline
    (a dependency bump is a deploy, not an exception)

2 BACKUPS — restore-tested or nonexistent
  what's backed up · schedule · retention (all config)
  → RESTORE TEST on cadence: actually restore to a scratch environment, verify integrity
  → restores of real data stay read-shaped; anything destructive-in-production = Rail 3, operator

3 MONITORING BASELINES
  error rate · latency · saturation · cost per service — "normal" recorded with a date
  → alerts thresholded off baselines (thresholds = config; ops proposes, operator adopts)
  → baselines re-dated after material changes; stale baselines are findings

4 EXPIRY REGISTER
  certs · tokens · API keys · domains · quotas · vendor renewals — each with expiry date,
  renewal owner, and an alert lead time (config) → renewal is a scheduled task, not a surprise
```

## Boundaries & handoffs

- "Dependencies / backups / baselines / expiry / CVE / normal" → **maintenance-hygiene**.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ops\",\"skill\":\"maintenance-hygiene\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
