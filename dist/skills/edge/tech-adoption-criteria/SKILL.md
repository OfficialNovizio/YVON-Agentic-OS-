---
name: tech-adoption-criteria
agent: edge
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Emerging tech is a bet with real integration and regulatory costs. (yvon)
triggers:
  - tech adoption criteria
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/edge/custom/tech-adoption-criteria/SKILL.md
  source_hash: 0c58bc84a90e93f096d83403ffff11f252357cc9009e1a1ca42a3562eccccb6c
  generated: 2026-07-20T03:20:22.073Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/edge/custom/tech-adoption-criteria/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js edge -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: edge — AI & Agents · skill: tech-adoption-criteria"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"edge\",\"skill\":\"tech-adoption-criteria\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Anyone proposes adopting/building-on an emerging technology.
- A watch-list re-check date arrives.
- scout routes a platform/infrastructure-shaped find here.

## Purpose

Emerging tech is a bet with real integration and regulatory costs. The gate converts "should we get into X?" from opinion into a scored, recorded decision — with honest rule-0.6 flags until a real scoring formula exists.

## Protocol

SCORE four axes, each 1–5 with WRITTEN justification per point:
1. **Maturity** — production track record, stability, breaking-change velocity.
2. **Ecosystem** — tooling, community, hiring/knowledge availability, second-source options.
3. **Fit** — against the operator's venture/stack profiles (`<FILL_IN: profile refs>`): does it serve a named goal or gap?
4. **Regulatory exposure** — with the compliance function's input (`<FILL_IN: compliance contact — Governance's sentinel or operator counsel per config>`).
→ BAR (`<FILL_IN: adoption bar — suggested: no axis below 3 AND total ≥ 14 — RUBRIC, reasoning-based, NOT formula-verified; rule 0.6 flag mandatory on every verdict until logical/ is filled>`) → below → WATCH (watchlist-discipline); above → PILOT SPEC (pilot-spec-handoff → proto).

## Boundaries & handoffs

└► tech-adoption-criteria (score, 0.6-flagged)

## Output format

Scoring memo: four axes with justifications, total, bar comparison, verdict (watch/pilot), rule-0.6 flag, re-check date.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"edge\",\"skill\":\"tech-adoption-criteria\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
