---
name: contract-library
agent: scribe
department: Legal & Compliance
version: 1.0.0
tier: 3
description: |
  Owns scribe's contract-template library — register, classify, version, publish, retire. Feeds contract-review-routing with the standard to compare against. Classification uses the SMB 8-category risk taxonomy. (yvon)
triggers:
  - contract library
  - register this template
  - add this template
  - publish a new template
  - version bump this template
  - retire this template
  - what templates do we have
  - show me the contract library
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/scribe/custom/contract-library/SKILL.md
  source_hash: 04c4cc25bab33fa50d109c29d3b5883e97b971c9f74a0b310641a248c3a63624
  generated: 2026-07-29T22:02:08.730Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/scribe/custom/contract-library/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js scribe -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: scribe — Legal & Compliance · skill: contract-library"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scribe\",\"skill\":\"contract-library\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Legal & Compliance/scribe/operational/agent/scribe-config.md"
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

- Operator says "register this template", "add this template", "publish a new template", "version bump this template", "retire this template".
- Operator asks "what templates do we have", "show me the contract library", "find the MSA template", "list templates".
- Any request that would insert, update, or remove a row in the template index.

Do NOT use for:

- *Reviewing* an incoming contract — that's `contract-review-routing`.
- *Extracting* obligations from a signed contract — that's `obligation-extraction`.
- *Drafting* a new template from scratch. Templates must be operator-supplied per playbook §0.5 (no invented drafting).

## Purpose

Own the state around scribe's contract templates:

- Which templates exist (template file + short slug).
- What each template is at right now (version, effective date).
- Which side it's meant for (sales / purchasing / mutual).
- Which jurisdiction it's calibrated for.
- Which clauses map to which of the 8 risk categories.
- What can be edited by whom without triggering escalation (F / G / E marks per clause).
- Publication protocol for adding a new template.
- Retirement protocol for deprecating one.

Physical templates live at `scribe/custom/contract-library/templates/`. Library state lives at `scribe/custom/contract-library/index.md`.

## Protocol

```
REGISTER      operator supplies .docx + fields → validate → classify → index (draft)
CLASSIFY      map each clause to SMB 8-category taxonomy
BOUND         mark each clause F / G / E (edit boundary)
VERSION       operator supplies new revision + reason → bump version → archive old row
PUBLISH       mark row active; retire prior active row for same slug+side+jurisdiction
RETIRE        mark row retired; keep row + file for audit
RETRIEVE      lookup by slug or (type, side, jurisdiction) → return path + metadata
```

## Boundaries & handoffs

- name: contract-library
- to: contract-library

## Output format

- **Register / version / publish / retire** → confirmation line + the resulting `index.md` row shown to the operator.
- **Retrieve** → template path, version, effective_date, side, jurisdiction, classification map, edit-boundary marks. In that order.
- **List / show library** → `index.md` rendered as a table, active rows first, archived and retired at the bottom.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"scribe\",\"skill\":\"contract-library\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
