---
name: investor-update-generator
agent: echo
department: Executive Office
version: 1.0.0
tier: 2
description: |
  Validates a draft investor update against a rubric of what makes updates work — cadence, metrics selection, ask formulation — with a tested validator script (yvon)
triggers:
  - investor update
  - validate update
  - check my update
  - investor email
allowed-tools:
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Executive Office/echo/marketplace/investor-update-generator/SKILL.md
  source_hash: d0e533b3a906e1356adda3d212b833c063c39976cfd1a7d01dfb8af9ea2a9ac2
  generated: 2026-07-20T03:20:24.163Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Executive Office/echo/marketplace/investor-update-generator/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js echo -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: echo — Executive Office · skill: investor-update-generator"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"echo\",\"skill\":\"investor-update-generator\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "investor update", "validate update", "check my update", "investor email".

## Purpose

Validate a draft monthly investor update against a rubric of what makes them work — and provide a starting template if you don't have one yet.

## Investor Update Generator

Validate a draft monthly investor update against a rubric of what makes them work — and provide a starting template if you don't have one yet.

---

### Keywords

investor update, monthly update, founder update, investor communication, fundraise, lead investor, board, KPIs, asks

---

### Clarify First

Before generating the update, confirm these inputs. If any is unknown or vague, ASK — do not assume:

- [ ] **Stage & cadence** — early-stage monthly vs later-stage quarterly changes which sections the rubric expects
- [ ] **This period's metrics** — the same defined set every month; re-defining metrics signals dishonest reporting
- [ ] **Specific asks** — what you need from investors (intros, hires, advice); the highest-leverage section
- [ ] **Bad news / risks** — strong updates lead with these, so they must be surfaced, not buried

Stop rule: ask only the 2-3 that most change the output. If the user says "just draft it," proceed and list your assumptions at the top of the artifact.

---

### Quick Start

1. Draft your update as `update.md`
2. Run: `python scripts/investor_update_validator.py update.md`
3. Address any missing sections; aim for the rubric score > 80

OR start from scratch with `assets/investor_update_template.md`.

---

### Core Workflows

#### Workflow 1: Monthly Update Production

1. First of month: pull metrics dashboard, last update, current asks
2. Draft against `assets/investor_update_template.md`
3. Validate: `python scripts/investor_update_validator.py update.md`
4. Send within 5 business days of month-end

**Time Estimate:** 1-2 hours/month.

#### Workflow 2: Update Cadence Establishment

1. Read `references/what_makes_good_updates.md`
2. Decide cadence: monthly is standard for early-stage; quarterly for later-stage
3. Pick distribution: investors only, or extended (advisors, helpful operators)
4. Commit publicly — once you start, don't skip months

**Time Estimate:** 1 week to set up; recurring monthly thereafter.

---

### Tools

#### investor_update_validator.py

Scans an update markdown file for the structural sections of a strong update and scores it.

```bash
python scripts/investor_update_validator.py update.md
python scripts/investor_update_validator.py update.md --json
```

---

### Reference Guides

- **`references/what_makes_good_updates.md`** — What separates good investor updates from bad

---

### Templates

- **`assets/investor_update_template.md`** — Monthly update template

---

### Best Practices

- **Send the bad news first.** Investors notice when they only hear the good.
- **Asks specific.** "Help with sales" is too vague; "Intros to VPs of Engineering at SaaS companies 100-1000 employees in NA" is actionable.
- **Cadence > perfection.** A consistent OK update beats a perfect annual one.
- **Same metrics every month.** Defining and re-defining metrics signals dishonest reporting.
- **One page (or one screen).** Past two screens, attention drops.

## Boundaries & handoffs

- **handoffs**: direct use only to validate drafts written outside the template workflow; must stay factually consistent with pitch-narrative

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"echo\",\"skill\":\"investor-update-generator\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
