---
name: funnel-analysis
agent: nate
department: Brand Studio
version: 1.1.0
tier: 2
description: |
  You are analyzing a conversion funnel to identify where users drop off, why they drop off, and what actions would most improve overall conversion. (yvon)
triggers:
  - funnel analysis
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/nate/marketplace/funnel-analysis/SKILL.md
  source_hash: b9631182e875b22e69381800aa1a053449fb710a06243e6edcaf5b051f7923ca
  generated: 2026-07-20T03:20:23.712Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/nate/marketplace/funnel-analysis/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js nate -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: nate — Brand Studio · skill: funnel-analysis"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nate\",\"skill\":\"funnel-analysis\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "funnel analysis".

## Purpose

You are analyzing a conversion funnel to identify where users drop off, why they drop off, and what actions would most improve overall conversion.

## Protocol

# Funnel Analysis

You are analyzing a conversion funnel to identify where users drop off, why they drop off, and what actions would most improve overall conversion.

Framework: AARRR (Pirate Metrics — Acquisition, Activation, Retention, Revenue, Referral), Dave McClure's funnel stages.

## Step 1 — Load Context

Read `memory/user-profile.md` for product stage and business model. Read `context/company/analytics-baseline.md` for existing conversion benchmarks.

## Step 2 — Funnel Data Input

Ask the user to provide the funnel data. Accept in any format:
- Step names and conversion rates at each step
- Raw numbers (absolute users at each step)
- A description of the funnel steps and approximate drop-off

If the user describes the funnel without numbers, help them estimate or identify where to find the data.

## Step 3 — Calculate Key Metrics

From the funnel data, calculate:
- **Step-by-step conversion rate:** Users at step N ÷ users at step N-1
- **Overall funnel conversion:** Users at the final step ÷ users at the first step
- **Absolute drop-off:** Users lost at each step (in absolute numbers, not just %)
- **Revenue impact of each step:** Absolute drop-off × revenue per converted user = value of fixing this step

## Step 4 — Identify the Biggest Opportunity

Find the step with the highest combination of:
1. Large absolute drop-off (many users lost here)
2. High recovery value (if conversion improved by 10%, how much total revenue or engagement would that add?)
3. Actionability (is there a known reason for the drop? Is there a plausible fix?)

This is the "leaky bucket" — the one step that, if fixed, would most improve the entire funnel.

## Step 5 — Diagnose Each Major Drop

For each step with > 20% drop-off:

**What happens at this step?** (What does the user have to do?)
**Why do users drop here?** (Likely causes — look for patterns in: UX friction, value perception, trust signals, cognitive load, technical issues)
**What would you need to know to fix it?** (Qualitative insight from interviews? Quantitative data from heatmaps or session recordings? An A/B test?)

**Common funnel drop diagnoses:**

| Drop Location | Likely Cause | Diagnostic |
|---|---|---|
| Landing page → signup | Value prop unclear; sign-up friction | Session recording; copy test |
| Signup → first action | Onboarding too long; time to value too slow | Time to first action analysis; session replay |
| First action → second action | Not seeing value from first action | Interview: "what did you expect to happen?" |
| Free → paid | Paywall too early; wrong trigger; poor value communication | Behavioral analysis before upgrade prompt |
| Paid → renewal | Product not becoming habit; poor ongoing value | Cohort analysis; engagement depth |

## Step 6 — Prioritization Matrix

For each major drop:
- Volume of impact (absolute users × value per conversion)
- Effort to fix (quick UX fix vs. major engineering)
- Confidence that the fix will work (high evidence vs. hypothesis)

Recommend the top 1–2 improvements to try in the next sprint.

## Step 7 — Output

Produce:
- Funnel visualization (text table with step names, conversion rates, absolute drop-off)
- Revenue/engagement impact per step (if baseline data is available)
- Diagnosis for each major drop with most likely cause
- Prioritized fix recommendations
- Recommended experiments (one per top-priority step)

## Boundaries & handoffs

- **funnel-analysis → backlog**: every recommended experiment enters intake with a falsifiable hypothesis; the biggest leak is the standing first candidate.

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nate\",\"skill\":\"funnel-analysis\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
