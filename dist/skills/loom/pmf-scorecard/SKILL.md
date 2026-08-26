---
name: pmf-scorecard
agent: loom
department: Product
version: 1.0.0
tier: 3
description: |
  "Do we have PMF?" gets answered by vibes or a single vanity metric. (yvon)
triggers:
  - pmf scorecard
  - is this working — do we double down or pivot?
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/Product/loom/custom/pmf-scorecard/SKILL.md
  source_hash: 824f7b7c8474673159f6812b492d57be72e69a6ec1fe890b0cb9a853c4b09ee5
  generated: 2026-07-29T22:20:50.936Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Product/loom/custom/pmf-scorecard/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js loom -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: loom — Product · skill: pmf-scorecard"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"loom\",\"skill\":\"pmf-scorecard\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Product/loom/operational/agent/loom-config.md"
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

- A product needs its PMF assessed or re-assessed (cadence, or a major change).
- marcus/spec ask "is this working — do we double down or pivot?"
- Retention or the Ellis signal shifts materially (a re-read trigger).

## Purpose

"Do we have PMF?" gets answered by vibes or a single vanity metric. This scorecard makes it a repeatable, evidence-based read with explicit thresholds (flagged as rubric, not law) — so the PMF call is defensible and its trend is trackable.

## Protocol

ELLIS SURVEY (the "how would you feel if you could no longer use this" question to activated users; the `<FILL_IN: 40% "very disappointed" bar — reasoning-based until the PMF/statistics source>` is a signal, not a verdict) → RETENTION CURVE (does the retention curve FLATTEN — a cohort that stops churning — or decay to zero? flatness is the strongest PMF signal; flatness judgment flagged 0.6) → TRIANGULATE (Ellis + retention + qualitative why from ux + growth efficiency; no single metric decides) → SEGMENT (PMF is often in a segment before the whole — read per persona, per product profile; a strong niche fit beats weak broad appeal) → VERDICT (strong / emerging / absent, with confidence and the evidence, routed to spec + marcus) → REGISTRY (the read is recorded over time; PMF is a trend, not a snapshot).

## Boundaries & handoffs

"do we have PMF?" ─► pmf-scorecard (Ellis + retention flatness + qualitative, triangulated) ─► spec/marcus + registry

## Output format

PMF scorecard: Ellis result (+ flag) · retention-curve read (flatness, + flag) · qualitative why (ux) · efficiency signal · per-segment breakdown · verdict (strong/emerging/absent + confidence) → spec/marcus → registry.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"loom\",\"skill\":\"pmf-scorecard\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
