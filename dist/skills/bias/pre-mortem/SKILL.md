---
name: pre-mortem
agent: bias
department: Behavioural Science
version: 1.0.0
tier: 3
description: |
  Structured pre-mortem for major decisions — Kahneman/Klein technique. Before commit: 'imagine we're 12 months in, this failed; what did us in?' Produces top failure modes + mitigations to attach to gate. (yvon)
triggers:
  - pre mortem
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Behavioural Science/bias/custom/pre-mortem/SKILL.md
  source_hash: a242a2d904e1aba0d040866c077b8cb5511f2b9a1830c975e8a61fe9cbf39125
  generated: 2026-08-08T17:13:12.701Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Behavioural Science/bias/custom/pre-mortem/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js bias -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: bias — Behavioural Science · skill: pre-mortem"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bias\",\"skill\":\"pre-mortem\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Behavioural Science/bias/operational/agent/bias-config.md"
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

Use when the request matches: "pre mortem".

## Purpose

Kahneman-Klein technique. Before commit to a decision, imagine 12 months later it failed. What did us in? Produces named failure modes + mitigations. Counter to overconfidence bias.

## Protocol

```
1. FRAME      "It's [date + 12 months]. [Decision] failed. Why?"
2. GENERATE   independent failure-mode brainstorm (no groupthink)
3. RANK       likelihood × severity
4. MITIGATE   per top-5: what would prevent + what would detect early
5. ATTACH     to decision gate record
```

## Boundaries & handoffs

- `marcus` (Exec Office) — strategy pre-mortem.
- name: pre-mortem
- {to: marcus, dept: "Executive Office", why: strategy pre-mortem}
- {trigger: "pre-mortem", winner: pre-mortem}

## Output format

Failure-mode table + mitigation plan + attach-to-gate note.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"bias\",\"skill\":\"pre-mortem\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
