---
name: adopt-reject-registry
agent: scout
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Rejection reasons evaporate unless recorded; six months later the same tool gets re-trialed on the same flaws. (yvon)
triggers:
  - adopt reject registry
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/scout/custom/adopt-reject-registry/SKILL.md
  source_hash: b7562f340776f0100e1f220fdc313aeb2a38f4c984bf6ccf0f1c0dc7e8f19935
  generated: 2026-07-20T03:20:22.379Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/scout/custom/adopt-reject-registry/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js scout -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: scout — AI & Agents · skill: adopt-reject-registry"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scout\",\"skill\":\"adopt-reject-registry\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/scout/operational/agent/scout-config.md"
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

- Any intake verdict lands (adopt/reject/watch/expired-untested).
- A scan surfaces a repeat candidate (checked here FIRST).
- A watch re-check date arrives.

## Purpose

Rejection reasons evaporate unless recorded; six months later the same tool gets re-trialed on the same flaws. This registry is the "we already know" layer.

## Protocol

RECORD (candidate, version evaluated, verdict, dated reasons, evidence refs, re-check date if watch) → CHECK (every scan cross-references before shortlisting) → RE-OPEN (only with new information: new version, changed maintenance status, changed fleet gap — the delta is stated) → SYNC (adopts mirror to relay's tool registry; this registry keeps the WHY, relay's keeps the WHAT).

## Boundaries & handoffs

▲ checks first: adopt-reject-registry
intake verdict ─► adopt-reject-registry (record) ─adopts─► relay (register + grants)

## Output format

Registry rows (candidate/version/verdict/reasons/evidence/re-check); reconcile reports (traced / orphaned).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scout\",\"skill\":\"adopt-reject-registry\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
