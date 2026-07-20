---
name: tool-evaluation-intake
agent: scout
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Every tool is attack surface (tool poisoning and excessive agency live exactly here). (yvon)
triggers:
  - tool evaluation intake
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/scout/custom/tool-evaluation-intake/SKILL.md
  source_hash: 25065f854a1471e61fa56ecfb99ef5ab7eda57b3f13515f8d1b5059e64673a2b
  generated: 2026-07-20T03:20:22.391Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/scout/custom/tool-evaluation-intake/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js scout -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: scout — AI & Agents · skill: tool-evaluation-intake"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scout\",\"skill\":\"tool-evaluation-intake\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- ecosystem-scanning shortlists a tool, or an agent requests one directly.
- A trial period expires (verdict due).
- A previously rejected tool re-surfaces with new information.

## Purpose

Every tool is attack surface (tool poisoning and excessive agency live exactly here). Intake makes adoption deliberate: screened, trialed, and recorded — either way.

## Protocol

SCREEN (security: against aegis's shared detection-classes asset + supply-chain sanity — source reputation, maintenance, permissions requested; cost: vs `<FILL_IN: budget threshold — escalation per config>`; overlap: vs relay's registry — a duplicate needs a reason the incumbent fails) → CRITERIA (success criteria written BEFORE the trial; eval-first, same discipline as proto) → TRIAL (sandboxed — Engineering Rail 2; registered `trial` with relay; duration per relay's trial period) → VERDICT (adopt → relay registers active + grants flow; reject → registry entry with reasons) → RECORD (adopt-reject-registry, either way).

## Boundaries & handoffs

cadence ─► ecosystem-scanning ─shortlist─► tool-evaluation-intake (tools) / marketplace-skill-scouting (skills) / forge (techniques) / edge (platforms)

## Output format

Intake report per candidate: screen results, criteria, trial evidence, verdict + reasons, registry refs.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scout\",\"skill\":\"tool-evaluation-intake\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
