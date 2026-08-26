---
name: risk-assessment-matrix
agent: board
department: Governance
version: 1.0.0
tier: 3
description: |
  Give board a consistent, auditable way to answer "how risky is this decision, and is that risk handled?" — the same scales, the same gate, every time. (yvon)
triggers:
  - risk assessment matrix
  - risk score this
  - risk assessment
  - how risky is this
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: principled-gatekeeper-charlie-munger
provenance:
  source_file: Teams/Governance/board/custom/risk-assessment-matrix/SKILL.md
  source_hash: c9fb8755d50b004cb6e9e1c21ebd9ad22f9fbe6db03a76cfeaf8a9a38a675798
  generated: 2026-08-08T19:52:18.945Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Governance/board/custom/risk-assessment-matrix/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js board -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: board — Governance · skill: risk-assessment-matrix"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"board\",\"skill\":\"risk-assessment-matrix\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Governance/board/operational/agent/board-config.md"
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

Triggers: "risk score this," "risk assessment," "how risky is this," or automatically in board's gate sequence for decisions that survived constitution-enforcement and strategic-veto.

Not for: generating the failure scenarios themselves when the decision is large and assumptions are untested — that's `pre-mortem`'s job, and its output is this skill's best input. Not for enterprise risk management across the whole business (a future Risk-department concern); this scores the risks of *one decision under review*.

## Purpose

Give board a consistent, auditable way to answer "how risky is this decision, and is that risk handled?" — the same scales, the same gate, every time. The point of the ≥12 gate is that high risks don't block decisions; *unmitigated* high risks do. A risk with a named owner and a credible mitigation plan passes; the same risk hand-waved does not.

## Protocol

```
Collect risks for the decision (from pre-mortem output, the proposer, and board's own review)
  -> Score each: Probability 1–5 × Impact 1–5 (anchored scales below, never invented data)
    -> Run scripts/risk_matrix.py: compute P×I, apply the mitigation gate (default ≥12)
      -> For each gated risk: require mitigation plan + owner before PASS
        -> Rule: PASS / PASS WITH MITIGATIONS / HOLD (gated risk unmitigated)
          -> Log all risks + ruling to the configured risk register
```

## Boundaries & handoffs

- **pre-mortem → risk-assessment-matrix**: pre-mortem generates and triages failure scenarios; its CRITICAL items enter the matrix as rows to be scored and gated. For routine decisions, the matrix alone suffices; for major commitments, run pre-mortem first.
- **risk-assessment-matrix → risk register**: all scored risks log to the configured register — the future Risk department's input.

## Output format

```

## Voice

Active identity: principled-gatekeeper-charlie-munger — see `identity/principled-gatekeeper-charlie-munger.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"board\",\"skill\":\"risk-assessment-matrix\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
