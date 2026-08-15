---
name: succession-planning
agent: merit
department: People & Culture
version: 1.0.0
tier: 3
description: |
  Prevents three failure modes that show up when succession is treated as an annual HR exercise rather than active governance: 1. (yvon)
triggers:
  - succession planning
  - career lattice
  - prepare succession/talent review for the board
  - prepare for board's governance cycle
allowed-tools:
  - Read
  - Write
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: README
provenance:
  source_file: Teams/People & Culture/merit/custom/succession-planning/SKILL.md
  source_hash: 9ec64b09c21c74b2090340a91a3449582caf0891cd2d322e0034b14b563ef9e3
  generated: 2026-08-01T23:27:45.252Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/People & Culture/merit/custom/succession-planning/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js merit -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: merit — People & Culture · skill: succession-planning"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"merit\",\"skill\":\"succession-planning\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- "9-box grid for [team / venture / group]"
- "Bench strength for [role]" / "who could step in if [role] left"
- "Succession plan for [role / team]" / "identify successors for [role]"
- "Critical role identification for [venture / department]"
- "Career lattice" / "career path for [person]"
- "Prepare succession/talent review for the Board" / "prepare for board's governance cycle"
- Handoff from `performance-frame`'s year-end synthesis (consistent Y across quarters →
  9-box High Performance band candidate)
- Handoff from `hr-strategy-alignment` when a critical-role bench-strength weakness maps
  to a Learning & Growth perspective gap on the scorecard

Do NOT use for:

- **Compensation decisions.** 9-box placement is a development-conversation input, NOT
  a comp-band input. Route comp discussions to `payroll-and-eor` (custom, hire) or future
  `comp-benchmarking`. This skill's Principle 3 enforces the separation.
- **Standalone performance rating.** Performance data feeds 9-box; but 9-box is not a
  performance rating in itself and doesn't replace `performance-frame`'s quarterly
  written reviews.
- **Individual PIP formalization** → operator + employment counsel. Persistent-N pattern
  from `performance-frame` may surface a candidate for PIP, but PIP is legal-adjacent
  and outside merit's scope.
- **Individual coaching plans** → route to the accountable manager or an external coach.
  merit designs the development path structure; individual coaching execution is
  manager-level.

## Purpose

Prevents three failure modes that show up when succession is treated as an annual HR
exercise rather than active governance:

1. **Zero-successor critical roles discovered too late.** A role becomes vacant (departure,
   illness, promotion) and there's no one identified who could step in. The lag from that
   moment to a viable successor is measured in months, not weeks. This skill's
   bench-strength scoring surfaces zero-successor critical roles as governance risks
   BEFORE the vacancy happens.
2. **9-box used as a performance rating.** 9-box placement drifts into "the boss's rating
   of me" and starts feeding compensation and PIP decisions. That misuse destroys the
   framework — placement conversations become defensive, and the 9-box loses the
   development-conversation function it exists for. This skill enforces separation.
3. **Career ladder reflex.** "Where can [person] go next?" defaults to a promotion
   conversation that may not have a real vertical rung available in a small team.
   Career-lattice framing surfaces the real options — a cross-venture move, an IC-to-lead
   transition, a scope-expansion in the current role — that produce genuine growth
   without requiring a vertical rung that doesn't exist.

merit uses this skill for succession reviews, talent-review preparation for the Board via
`board`, and career-conversation preparation for the operator or a direct manager.

## Protocol

The succession-planning cycle:

```
1. IDENTIFY CRITICAL ROLES
    Criticality = business-continuity risk, NOT seniority alone. Any role whose
    sudden vacancy would meaningfully disrupt a venture or the org, regardless
    of level. Common failure: only C-suite/Council roles get treated as critical
    — but an IC-owned platform component with no second-person coverage is also
    critical.

2. BUILD CANDIDATE POOL (per critical role)
    Who could plausibly step in — internally first, externally if the internal
    pool is empty. Small teams commonly have thin internal pools; that's a
    finding, not a normal state.

3. 9-BOX ASSESSMENT (per candidate)
    Performance (past/current) × Potential (future capacity) on 3-level scales
    (low/medium/high). 9-box PLACEMENT is a development-conversation input,
    NOT a permanent label and NOT a comp input.

    | | Low Potential | Medium Potential | High Potential |
    |---|---|---|---|
    | High Performance   | Trusted Professional | High Performer | Star / Future Leader |
    | Medium Performance | Inconsistent Player  | Core Player    | High Potential       |
    | Low Performance    | Risk                 | Inconsistent   | Enigma               |

4. READINESS ASSESSMENT (per candidate × target role)
    Readiness is role-specific, not a general trait.
    - Ready Now                — mastered current scope, competencies for next level today
    - Ready in 1-2 Years       — needs specific stretch experience first
    - Ready in 3-5 Years       — developing, longer runway
    - Not Identified

5. BENCH-STRENGTH SCORING (per critical role)
    scripts/succession_planning.py weights by readiness (Ready Now = 3;
    1-2yr = 2; 3-5yr = 1; Not Identified = 0). Sum across candidates → bench-strength score.
    Risk flag: critical / high risk / moderate / healthy.

    Target: 2-3 identified successors per critical role across readiness levels.
    Zero-successor critical role = governance risk (see Principle 5).

6. DEVELOPMENT PATH DESIGN (per successor)
    What stretch experience closes the specific gap? Pull the gap from grove's
    skill-gap-map; route execution to grove's training-program-design.

7. LATTICE FRAMING (default over ladder)
    Career-lattice-first: check for lateral and cross-venture options BEFORE
    defaulting to a vertical promotion conversation that may not be available.

8. ESCALATE ZERO-SUCCESSOR CRITICAL ROLES
    Route to board (Governance) + marcus (Executive Office / Strategy)
    EXPLICITLY as a continuity risk, not as a line item in an HR report.
```

## Boundaries & handoffs

- 9-box-NOT-comp-input (originating in `succession-planning`, enforced by all merit
| Development-plan execution for succession-planning stretch | **`skill-gap-map`** + **`training-program-design`** (custom, grove) | succession-planning Phase 6 → grove |
- **merit does not let 9-box become a comp / PIP / ranking input.** succession-planning
- **merit does not quietly log zero-successor critical roles.** succession-planning
- downstream: succession-planning
- downstream: succession-planning
- name: succession-planning
- upstream: succession-planning

## Output format

Each invocation produces one or more of:

- **Critical roles list** — with continuity-risk rationale per role (not just title).
- **Candidate pool per critical role** — internal-first; external if internal empty (with
  named source, not "we could recruit").
- **9-box grid** — team × 3×3 with per-cell label + performance/potential rationale.
- **Readiness assessment** — per candidate × target role: Ready Now / 1-2yr / 3-5yr /
  Not Identified with specific-experience rationale.
- **Bench-strength scoring memo** — per critical role: score + risk flag + zero-successor
  escalation trigger if applicable.
- **Development path per successor** — stretch experience + grove routing (skill-gap-map +
  training-program-design) + follow-up milestone.
- **Career-lattice recommendation** — per person: lattice options considered + rationale
  for chosen path.
- **Zero-successor escalation memo** — routed to board + marcus per Principle 5.

## Voice

Active identity: README — see `identity/README.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"merit\",\"skill\":\"succession-planning\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
