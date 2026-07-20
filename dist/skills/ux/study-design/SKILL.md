---
name: study-design
agent: ux
department: Product
version: 1.0.0
tier: 3
description: |
  A study with a leading script and a convenience sample produces confident garbage that then poisons the repository. (yvon)
triggers:
  - study design
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/ux/custom/study-design/SKILL.md
  source_hash: 831ce2b60d2f772f5620a2615bf77c6476b4090a133ecb0de73dcb11a29b77db
  generated: 2026-07-20T03:20:23.476Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/ux/custom/study-design/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js ux -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: ux — Product · skill: study-design"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ux\",\"skill\":\"study-design\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- research-repository returns GAP (a real unknown worth a new study).
- A PRD assumption needs primary evidence and none exists.
- loom needs qualitative input on why an experiment moved (or didn't).

## Purpose

A study with a leading script and a convenience sample produces confident garbage that then poisons the repository. Designing the protocol before running — and matching method to question — is how research earns the right to be cited.

## Protocol

QUESTION (one precise research question — "do users understand the pricing page" not "is the product good") → METHOD MATCH (the question picks the method: generative → interviews/JTBD; evaluative → usability test; magnitude → survey; behavioral → the funnel, metric's turf) → PROTOCOL (script written before recruiting; leading/loaded questions designed out; tasks not opinions where behavior is the question) → SAMPLE (size + recruit criteria matched to the claim's needed confidence; `<FILL_IN: usability suggested ~5/round — reasoning-based until the research-methods source>`; convenience samples labeled as such) → CONSENT (recorded, data-handling stated; sensitive data minimized — Fleet Charter least-privilege, research edition) → RUN → hand raw data to synthesis-discipline.

## Boundaries & handoffs

GAP ─► study-design (protocol/method/sample/consent) ─► run
support/reviews/NPS ─► voice-of-customer-intake (tag, pattern) ─► repo (directional) | GAP flag ─► study-design

## Output format

Study plan: question · method (with match rationale) · protocol/script · sample (size, criteria, limits) · consent plan. Raw data → synthesis-discipline.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"ux\",\"skill\":\"study-design\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
