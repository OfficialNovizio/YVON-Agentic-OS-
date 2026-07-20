---
name: voice-of-customer-intake
agent: ux
department: Product
version: 1.0.0
tier: 3
description: |
  Users tell you what's wrong every day in support tickets and reviews; most of it evaporates unlogged. (yvon)
triggers:
  - voice of customer intake
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/ux/custom/voice-of-customer-intake/SKILL.md
  source_hash: 8d171740cf7b5b4a2f5e81c63d7e01fba15d5d57ee2beb5fdb2326de196f58ad
  generated: 2026-07-20T03:20:23.482Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/ux/custom/voice-of-customer-intake/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ux -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ux — Product · skill: voice-of-customer-intake"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ux\",\"skill\":\"voice-of-customer-intake\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- A voice-of-customer source exists per business (`<FILL_IN: support inbox, review sites, NPS tool, sales notes>`).
- The intake cadence fires (continuous / batched).
- A pattern in the verbatims crosses a noticeable threshold (spike in a complaint → flag).

## Purpose

Users tell you what's wrong every day in support tickets and reviews; most of it evaporates unlogged. This pipeline captures that signal, patterns it, and feeds it into the same repository as formal research — so a recurring complaint becomes visible evidence, not tribal knowledge.

## Protocol

SOURCES (the configured feeds, read-only — support tickets, reviews, NPS, call notes) → INTAKE (verbatims pulled on cadence; PII minimized at ingest — Fleet Charter Rail 2) → TAG (each verbatim: product/persona/journey stage + sentiment + theme, same tags as the repo) → PATTERN (recurring themes counted over time; a spike or a rising theme is a signal, a single angry review is not) → ROUTE (patterned signal → research-repository as directional evidence, confidence-flagged low-but-real; a strong recurring pattern → flagged to spec/loom as a research GAP worth a real study) → BOUNDARY (intake is READ-ONLY on Client Success's pipeline — ux listens to support exhaust, it does not own or answer tickets).

## Boundaries & handoffs

support/reviews/NPS ─► voice-of-customer-intake (tag, pattern) ─► repo (directional) | GAP flag ─► study-design

## Output format

Intake batch: verbatims tagged (product/persona/journey/sentiment/theme) · patterns (theme × count × trend) · routes (repo entries / GAP flags to spec/loom).

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ux\",\"skill\":\"voice-of-customer-intake\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
