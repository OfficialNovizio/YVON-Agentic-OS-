---
name: feedback-methods
agent: merit
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Prevents the four failure modes that show up most often in workplace feedback: 1. (yvon)
triggers:
  - feedback methods
  - how do i give this feedback
  - help me phrase this
  - prepare for a hard conversation
  - sbi feedback
  - situation behavior impact
  - radical candor
  - care personally challenge directly
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/merit/custom/feedback-methods/SKILL.md
  source_hash: 25f4cb29eca60439941737d91d65dc1643ac07872a895d71e0d0434af59530b3
  generated: 2026-08-01T23:27:45.224Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/merit/custom/feedback-methods/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js merit -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: merit — People & Culture · skill: feedback-methods"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"merit\",\"skill\":\"feedback-methods\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/People & Culture/merit/operational/agent/merit-config.md"
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

Trigger on:

- "How do I give this feedback" / "help me phrase this" / "prepare for a hard conversation"
- "SBI feedback" / "Situation Behavior Impact"
- "Radical candor" / "care personally challenge directly" / "feedback quadrant"
- "Constructive criticism" / "praise this well" / "how do I recognize this specifically"
- "Solicit feedback from my team" / "invite upward feedback" / "how do I get honest input"
- Handoff from `performance-frame` quarterly review preparation
- Handoff from `succession-planning` development-conversation preparation
- Handoff from `hiring-kit` (via hire) for SBI-structured rejection feedback to candidates

Do NOT use for:

- **Recording individual feedback events or tracking per-person feedback content.** Merit
  does not maintain a feedback log per person — that would violate Universal Principle 7.
  Feedback conversations happen between individuals; merit provides the framework, not
  the ledger.
- **Individual mental-health assessment** → HARD BOUNDARY to manager + HR Ops + EAP per
  Universal Principle 3. Feedback about a work performance concern is in-scope; a
  wellbeing concern needing professional support routes out immediately.
- **Compensation decisions** (this skill informs the delivery of comp conversations, but
  the comp band itself is `payroll-and-eor` (custom, hire) or future `comp-benchmarking`).
- **Legal action or PIP formalization** → operator + employment counsel. This skill
  supports the manager conversation; legal formalization is a separate escalation.

## Purpose

Prevents the four failure modes that show up most often in workplace feedback:

1. **Vague evaluations** — "great job" or "you need to be more strategic" without specifics.
   SBI's Situation-Behavior-Impact structure forces concrete evidence.
2. **Ruinous Empathy** — Scott's term for caring about someone so much you don't tell them
   the truth about their performance. Feels kind; actually harmful. The Radical Candor
   framework's Care Personally × Challenge Directly grid names it explicitly.
3. **Obnoxious Aggression** — the opposite: challenging without caring. Also common;
   equally harmful. Same grid names it.
4. **One-way feedback culture** — leaders give, never solicit. Scott's rule: **solicit
   feedback BEFORE you give it.** Leaders who don't solicit don't get honest feedback
   given to them either.

merit uses this skill as the framework consumer whenever a specific feedback conversation
is being prepared — whether by the operator directly, or as part of `performance-frame`'s
quarterly review cycle, or as the delivery mechanism for `succession-planning`'s
development-plan conversations.

## Protocol

Two complementary frameworks used together:

```
FRAMEWORK 1: SBI (Situation-Behavior-Impact) — the FORMAT of the message
    Situation:  "In the customer meeting last Tuesday..."
    Behavior:   "you interrupted the customer three times when they were describing
                 their pain point..."
    Impact:     "and we walked out without a clear read on their actual priority. I
                 had to spend the next 30 min on the phone with them to reconstruct it."

    Rules: NO mind-reading ("you seemed nervous" — wrong; that's your interpretation).
           NO personality attribution ("you're a bad listener" — wrong; that's a label,
             not a behavior).
           JUST the observable Situation + observable Behavior + factual Impact.

FRAMEWORK 2: Radical Candor — the STANCE
    Two dimensions:
      Y-axis: Care Personally  (about the person as a whole human, not just their output)
      X-axis: Challenge Directly (say the hard thing, kindly, clearly, specifically)

    Four quadrants (Scott):
      + Care, + Challenge  = RADICAL CANDOR       (the goal)
      + Care, - Challenge  = RUINOUS EMPATHY      (nice, useless, harmful)
      - Care, + Challenge  = OBNOXIOUS AGGRESSION (harsh, effective short-term, corrosive)
      - Care, - Challenge  = MANIPULATIVE INSINCERITY (toxic; passive-aggressive)

    Order of operations (Scott):
      1. SOLICIT feedback first (from your team, upward). Leaders who don't solicit
         don't get honest feedback given to them.
      2. GIVE specific praise (SBI format for what worked).
      3. GIVE specific criticism (SBI format for what didn't work — kind AND clear).

Combined: use SBI FORMAT to deliver a message from the RADICAL CANDOR STANCE.
```

## Boundaries & handoffs

| Ambiguous "how do I evaluate this person" | **performance-frame** first (produces content); calls **feedback-methods** for delivery | Content → delivery separation |
- No-observation-of-individual-feedback-events (originating in `feedback-methods`,
- **merit does not observe or record individual feedback events.** feedback-methods
- name: feedback-methods
- downstream: feedback-methods
- downstream: feedback-methods
- downstream: feedback-methods

## Output format

Each invocation produces one or more of:

- **SBI feedback script** — for a specific conversation the operator is preparing for.
  Includes the Situation / Behavior / Impact draft with anti-pattern checks applied.
- **Feedback quadrant diagnostic** — Scott's grid applied to the operator's recent
  feedback pattern with this person. Names the current quadrant and the shift needed.
- **Solicit-first script** — for managers preparing to give downward feedback; a
  brief 1-2 sentence solicit-upward opener.
- **Delivery-and-pause plan** — the moment-by-moment structure: SBI → pause → invite
  their read → confirm next action. With explicit anti-patterns to avoid.
- **Praise-with-specificity draft** — for reinforcing observed positive behavior in the
  same SBI structure.

Never a persistent record of the feedback event itself — that would violate scope per
Purpose failure mode extension.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"merit\",\"skill\":\"feedback-methods\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
