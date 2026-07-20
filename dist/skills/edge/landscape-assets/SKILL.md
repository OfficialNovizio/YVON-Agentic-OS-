---
name: landscape-assets
agent: edge
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Scoring and watching emerging tech requires domain knowledge that goes stale fast. (yvon)
triggers:
  - landscape assets
allowed-tools:
  - Write
  - Read
  - WebSearch
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/edge/custom/landscape-assets/SKILL.md
  source_hash: 628577c1c1b587f1c1a0224d8f70ca42b26f2302934b6e641f5c992aec66d49d
  generated: 2026-07-20T03:20:22.065Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/edge/custom/landscape-assets/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js edge -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: edge — AI & Agents · skill: landscape-assets"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"edge\",\"skill\":\"landscape-assets\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/edge/operational/agent/edge-config.md"
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

- The operator names a domain that matters (`<FILL_IN: operator domain list — e.g. a payments venture might select open banking; a commerce venture might select agentic checkout standards>`).
- A landscape's re-verify date arrives, or a material event lands (via watchlist/scout).
- Any scoring or watch decision needs domain context.

## Purpose

Scoring and watching emerging tech requires domain knowledge that goes stale fast. Dated, per-domain assets keep that knowledge honest (you can SEE its age) and portable (domains are config, not skill content) — the same three-layer volatility split Brand Studio pioneered: durable method in the skill, volatile knowledge in dated assets.

## Protocol

Each landscape asset (`assets/<domain>-landscape-<YYYY-MM>.md`): SCOPE (what the domain covers, why the operator cares — the named venture goal, referenced from config not restated) → STATE (current standards/frameworks/milestones, each with source + date) → PLAYERS (who moves the domain) → SURFACE (where the operator's stack would touch it — from the stack profile) → DELTAS (what changed since the last dated version) → RE-VERIFY (date, `<FILL_IN: suggested quarterly per catalog>`).

## Boundaries & handoffs

landscape re-verify / operator domain selection ─► landscape-assets (dated versions)

## Output format

Dated per-domain asset files under `assets/`; a one-line index (domain / latest version / re-verify date / status) on edge's report.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"edge\",\"skill\":\"landscape-assets\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
