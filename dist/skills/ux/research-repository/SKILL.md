---
name: research-repository
agent: ux
department: Product
version: 1.0.0
tier: 3
description: |
  Teams re-run the same interviews because nobody remembered the last round's answer. (yvon)
triggers:
  - research repository
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/ux/custom/research-repository/SKILL.md
  source_hash: 13f354ffe6f962b30df224cea1e5ae3c9bb34ac0bc97a6c6e54b59da1d04106c
  generated: 2026-07-20T03:20:23.471Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/ux/custom/research-repository/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ux -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ux — Product · skill: research-repository"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ux\",\"skill\":\"research-repository\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Product/ux/operational/agent/ux-config.md"
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

- BEFORE any new study (study-design's mandatory first step — query before you run).
- A PRD or opportunity-assessment needs evidence (spec cites repo IDs).
- New findings land (synthesis-discipline files them here) or voice-of-customer verbatims arrive.

## Purpose

Teams re-run the same interviews because nobody remembered the last round's answer. A queryable repository turns research from a disposable event into a compounding asset, and makes "we already know this" a checkable claim.

## Protocol

QUERY-FIRST (every research request first searches the repo: is this known? partially? stale?) → verdict: ANSWERED (cite existing finding, no new study) | STALE (re-validate, don't re-discover) | GAP (new study justified — hands to study-design) → FILE (findings tagged: product `<FILL_IN profile>`, persona, journey stage, confidence, date; linked to the PRD/decision IDs that used them) → LINK (bidirectional: a finding knows which decisions cite it; a PRD knows its evidence) → AGE (findings carry a date; old findings about a changed product are flagged stale, not trusted silently).

## Boundaries & handoffs

research request ─► research-repository (QUERY FIRST) ─verdict─► ANSWERED (cite, no study) | STALE (re-validate) | GAP
research-repository (tagged, cited-by)

## Output format

Repo entry: finding · tags (product/persona/journey) · confidence · date · source study ID · cited-by (PRD/experiment IDs). Query result: ANSWERED/STALE/GAP + refs.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ux\",\"skill\":\"research-repository\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
