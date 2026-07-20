---
name: rapid-prototyping-method
agent: proto
department: AI & Agents
version: 1.0.0
tier: 3
description: |
  Prototypes fail two ways: too crude to answer the question, or so polished they become the product prematurely (and then nobody wants to archive them — sunk cost sabotages the verdict). (yvon)
triggers:
  - rapid prototyping method
  - while we're at it, let's also..
allowed-tools:
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/AI & Agents/proto/custom/rapid-prototyping-method/SKILL.md
  source_hash: ea6a25f974cfa2bc729039d420e1569614b5f1cb0a3540512fa2289907e24178
  generated: 2026-07-20T03:20:22.288Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/AI & Agents/proto/custom/rapid-prototyping-method/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js proto -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: proto — AI & Agents · skill: rapid-prototyping-method"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"proto\",\"skill\":\"rapid-prototyping-method\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/AI & Agents/proto/operational/agent/proto-config.md"
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

- Choosing what to actually build after the manifest + criteria exist.
- Mid-prototype scope creep ("while we're at it, let's also...").
- Timebox check-ins.

## Purpose

Prototypes fail two ways: too crude to answer the question, or so polished they become the product prematurely (and then nobody wants to archive them — sunk cost sabotages the verdict). Right-sized fidelity protects both the answer and the verdict.

## Protocol

FIDELITY LADDER (pick the lowest rung that can answer the hypothesis):
1. **Paper** — skill drafts + trace walkthroughs (no execution). Answers: "is the routing/method coherent?"
2. **Wizard-of-Oz** — a human/existing agent plays the missing part. Answers: "is the output valuable?"
3. **Single-skill** — one real skill in the cage, rest stubbed. Answers: "does the core mechanism work?"
4. **Full-shape** — near-complete agent in the cage. Answers: only integration questions; requires justification for why rungs 1–3 couldn't answer.
→ TIMEBOX (per rung: `<FILL_IN: suggested 1–2 days paper, 3–5 single-skill — reasoning-based>`, always inside the manifest expiry) → BUILD (that rung only) → CHECK (can it answer the hypothesis yet? yes → stop building, start measuring) → DECIDE (feed the verdict; don't polish).

## Boundaries & handoffs

└► rapid-prototyping-method (fidelity + timebox, in cage)

## Output format

Fidelity justification (manifest line), rung-labeled build artifacts, timebox log.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"proto\",\"skill\":\"rapid-prototyping-method\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
