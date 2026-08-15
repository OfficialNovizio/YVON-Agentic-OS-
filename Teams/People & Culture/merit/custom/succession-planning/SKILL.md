<!--
Custom skill — adopted from the Anthropic career-pathing-succession-planning plugin,
genericized per §0.4b, reassigned from maslow to merit.

Source plugin: /var/folders/.../claude-hostloop-plugins/.../skills/career-pathing-succession-planning/SKILL.md
Note on the Python script: source SKILL.md references scripts/succession_planning.py but
that file was NOT included in the packaged plugin. Per §0.5 the script is
IMPLEMENTED-FROM-DESCRIPTION here — the source describes 9-box label lookup, bench-strength
scoring weighted by readiness level, and risk-flag classification.

Genericization strip (§0.4b):
- name: career-pathing-succession-planning → succession-planning (trimmed)
- assigned_agent: maslow (CHRO) → merit (P&C / Performance Management)
- VYON / Novizio / Hourbour / "External Platform division" / VYON-skill-names → stripped
- "board/marcus" for escalation → board (Governance) + marcus (Executive Office / Strategy) — both real YVON agents per CLAUDE.md §2
- Example agents "raj", "mia", "dev" → generic role descriptions
- "People Analytics & Metrics" → future Shared OS: people-analytics-metrics
- "Skills Gap Analysis" → grove's skill-gap-map (real YVON skill)
- "Training Program Design" → grove's training-program-design (real YVON skill)
- "Workforce Planning & Org Design" → hire's workforce-planning (real YVON skill)

All 8 public-source citations preserved (Creately, SHRM, Qooper, AIHR x2, LeaderGov,
TalentGuard, Lattice).
-->
---
name: succession-planning
type: custom
status: adopted from marketplace source (Anthropic career-pathing-succession-planning plugin), genericized, reassigned from maslow to merit
sources_referenced:
  - "Anthropic knowledge-work-plugins — career-pathing-succession-planning plugin (2026-07-02 packaged version). SKILL.md only; referenced scripts/succession_planning.py not included in package."
  - "Creately — 9 Box Talent Calibration Framework."
  - "SHRM — Succession Planning: What is a 9-box grid?"
  - "Qooper — The 4 Stages of Succession Planning."
  - "AIHR — Succession Planning: All You Need To Know; Career Lattice."
  - "LeaderGov — Succession Planning Grid Using the 9-Box Grid."
  - "TalentGuard — Career Ladder vs. Lattice."
  - "Lattice — What Is a Career Lattice?"
fulfills_catalog_entry: n/a (part of merit's expanded roster beyond catalog's 2-skill floor per §2)
genericization_notes:
  - "Source-plugin author assignment maslow (CHRO) → merit (P&C / Performance Management) — correct YVON owner."
  - "VYON / Novizio / Hourbour / VYON-skill-names → stripped or retargeted per CLAUDE.md §2."
  - "board/marcus retargets are TO REAL YVON AGENTS (board = Governance; marcus = Executive Office / Strategy)."
assigned_agent: merit (People & Culture / Performance Management)
portable: true
date_added: 2026-07-31
tier: 3
description: The 9-box performance/potential grid + bench-strength scoring per critical role + career-lattice-first framing. Identifies critical roles by continuity risk (not seniority), places people on 9-box using evidence, scores succession bench strength per role, and defaults to career-lattice thinking for development paths. Trigger on "9-box grid for", "bench strength for", "succession plan for", "critical role identification", "career lattice", "who could step in if [role] left", or "career path for".
triggers:
  - 9-box grid for
  - bench strength for
  - succession plan for
  - critical role identification
  - career lattice
  - who could step in if
  - career path for
  - identify successors for
---

# Succession Planning

## Introduction

This skill answers two related questions: **"if this role went vacant tomorrow, are we
covered?"** (succession planning) and **"where can this person credibly grow next?"**
(career pathing). It uses a 9-box grid for performance/potential placement, a bench-strength
score per critical role, and a career-lattice-first framing that treats lateral and
cross-venture moves as legitimate career progression alongside vertical promotion.

Adopted from Anthropic's `career-pathing-succession-planning` plugin, reassigned from
maslow to merit (correct YVON owner), genericized per §0.4b. All 8 public-source citations
preserved.

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

## When to Use

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

## Structure / Protocol

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

## Instructions

### Phase 1 — Identify critical roles

For the scope in question (a venture / department / function / the group), name the
critical roles using the **continuity-risk definition** — not org-chart seniority.
Examples of roles that qualify as critical:

- An IC-owned platform component with no second-person coverage.
- A single-agent-mapped role in the AI Council (if applicable to your org).
- A department-lead role with no natural understudy.
- A customer-facing role with a specific-relationship dependency ("the account manager
  the customer's CFO trusts") if the loss of that relationship would materially disrupt
  revenue.

**Criticality tests:** if this role went vacant tomorrow, would there be measurable
business disruption within 30 days? Would recovery require external hire? Would team
throughput drop by more than 20%? If yes to any → the role is critical.

At an early-stage / small-team org, several individual-contributor and single-owner roles
are effectively single points of failure. Name them; don't only surface C-suite roles.

### Phase 2 — Build the candidate pool per critical role

Who could plausibly step in? Start internal. If internal pool is empty, note that
explicitly — it's a Principle 5 flag. If internal pool has 1 person, that's still thin
by the "target 2-3 successors" rule.

External candidates (people currently outside the org who could be recruited) count only
if there's a live scouting relationship or a specific named person known to be interested;
"we could recruit externally" is not a successor identification.

### Phase 3 — 9-box assessment per candidate

Place each candidate on the 3×3 grid using:

- **Performance data** — from `performance-frame`'s quarterly reviews. Consistent Y
  across recent cycles → High Performance. Persistent partial → Medium. Persistent N →
  Low.
- **Potential judgment** — learning agility (how fast do they close skill gaps?), scope
  of impact so far (have they operated meaningfully above their current job description
  when given the chance?), stated ambition (do they want the growth?). Low / Medium /
  High.

Use `scripts/succession_planning.py`'s `nine_box_label()` for the label lookup. The 9
labels are working taxonomy for the org — not a universal standard.

**Anti-pattern check:** if 9-box is being used to feed comp decisions, PIP designations,
or as a permanent label on the person, redirect per Fallback rule 3 — that misuse
destroys the framework.

### Phase 4 — Readiness assessment per candidate × target role

Readiness is ROLE-SPECIFIC. A candidate may be Ready Now for one critical role and Ready
in 3-5 Years for another. Common readiness levels:

- **Ready Now** — has the competencies for the next-level scope TODAY. Would need only
  organizational onboarding to the new role, not new skill development.
- **Ready in 1-2 Years** — needs specific stretch experience first. Name the specific
  experience (a cross-venture project, a scope-expansion, a specific technical
  challenge).
- **Ready in 3-5 Years** — developing, longer runway. Usually still a strong candidate
  but requires sustained investment.
- **Not Identified** — no current internal candidate meets any of the above.

Discovery signal: if every internal candidate for a critical role is "Ready in 3-5
Years" or "Not Identified," the role is likely to become vacant before a successor
matures. This is a Principle 5 governance risk.

### Phase 5 — Bench-strength scoring per critical role

Use `scripts/succession_planning.py`'s `bench_strength_score()`. Weights per candidate:

- Ready Now = 3
- Ready in 1-2 Years = 2
- Ready in 3-5 Years = 1
- Not Identified = 0

Sum across identified successors → per-role bench-strength score. Risk-flag classification:

- **Healthy** — score ≥ 4 (at least one Ready Now + one 1-2yr, or two Ready Now)
- **Moderate** — score 2-3 (one 1-2yr and one 3-5yr, or one Ready Now alone)
- **High risk** — score 1 (single 3-5yr candidate)
- **Critical** — score 0 (no identified successors) → Principle 5 governance escalation

### Phase 6 — Development path design per successor

For each identified successor, name the specific stretch experience that closes their
gap. Pull the specific skill gap from grove's `skill-gap-map`; route execution to
grove's `training-program-design`.

Rule: the stretch is a REAL work assignment with real stakes, not a training course. A
Ready-in-1-2-Years candidate becomes Ready Now by doing the work that requires the next
level of scope, with a manager (or a `feedback-methods`-informed coach) providing
delivery discipline.

### Phase 7 — Career lattice framing

Default to LATTICE thinking over ladder thinking. When designing a career path for a
specific person:

- **First check for lateral / cross-venture options** — is there a role in another
  venture, another function, or a scope-expansion in the current role that would
  legitimately grow the person's capability set?
- **Then check for vertical rungs** — is there a next-level role that actually exists
  in the org?
- Only if neither exists does the "wait for a promotion that isn't available" pattern
  make sense — and in that case, be honest about the lack of near-term growth path.

At a flat, multi-venture org, lattice framing produces more real options than ladder
framing. TalentGuard / AIHR / Lattice research supports this — lattice orgs report
higher retention among high-performers than ladder-only orgs.

### Phase 8 — Escalate zero-successor critical roles

**Route to `board` (Governance) + `marcus` (Executive Office / Strategy) EXPLICITLY.**
A zero-successor critical role is not a line item in an HR quarterly report — it's a
live continuity risk that governance needs to see and act on. Per Principle 5, this
escalation is mandatory, not discretionary.

## Python Utility

`scripts/succession_planning.py` provides:

- `nine_box_label(performance_level, potential_level)` — dict lookup for the 9-box label.
- `readiness_weight(readiness)` — Ready Now → 3; 1-2yr → 2; 3-5yr → 1; Not Identified → 0.
- `bench_strength_score(candidates)` — sum weights across candidates.
- `risk_flag(score, min_target=2)` — critical / high risk / moderate / healthy classification.
- `NINE_BOX_GRID` — reference dict of the 9 labels.
- `READINESS_LEVELS` — reference list of the 4 readiness levels.

IMPLEMENTED-FROM-DESCRIPTION per §0.5. Self-tests included; run
`python3 succession_planning.py --test`.

NOT a Shared OS/logical/ script yet (§8.0 two-book minimum unmet). Candidate second
sources for graduation: Rothwell, W. J. *Effective Succession Planning* (already cited
in grove's book-requirements) + Charan, Drotter, Noel *The Leadership Pipeline*.

## Output Format

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

## Principles

1. **Criticality = continuity risk, NOT title.** An IC-owned platform component with no
   second-person coverage is critical; a senior title with easy internal substitution
   isn't. Assess accordingly.
2. **Target 2-3 identified successors per critical role.** Fewer is a live risk, not
   just a note. Zero is a governance escalation (Principle 5).
3. **9-box is a conversation input, NEVER a permanent label or a comp input.** Placement
   changes cycle-to-cycle as performance and potential evolve. Feeding 9-box into
   compensation destroys the framework — redirect per Fallback rule 3.
4. **Career-lattice default.** Given a flat, multi-venture structure, lateral and
   cross-venture moves are real progression. Check lattice options BEFORE defaulting to
   ladder / promotion conversation.
5. **Zero-successor critical roles escalate to governance — board + marcus.** Never
   quietly logged as a future to-do. This is Principle 5's load-bearing rule; it's what
   makes the framework operational rather than performative.
6. **Readiness is role-specific.** A candidate may be Ready Now for role A, Ready 3-5yr
   for role B. Do not generalize.
7. **Stretch is a real work assignment with real stakes.** A training course alone does
   not turn a Ready-in-1-2-Years candidate into Ready Now. The stretch is the work; the
   training supports it.
8. **Aggregate-only rule preserved.** merit uses individual performance and potential
   data to build the 9-box and bench-strength views, but the OUTPUTS from this skill
   (development plans, escalations) are structured for governance and manager
   conversations — never as a public ranking or feed into aggregate people-metrics
   published broadly. Per Universal Principle 7 inherited from hire; individual
   demographic data explicitly out of scope.
9. **§0.6 flag.** The 9-box labels (Star / Trusted Professional / etc.) are working
   taxonomy per the source plugin — treated as canonical per the plugin's own citations
   (Creately, SHRM), but not book-cited from `Agents/_books/`. Same Tier B until
   Rothwell + Charan/Drotter/Noel are placed and a `Shared OS/logical/succession_planning.py`
   version is built.

## Fallback

- **No performance/potential data available for a candidate.** Do NOT guess a 9-box
  placement. Gather structured input (recent project outcomes, `performance-frame`
  quarterly reviews, manager and peer input via `feedback-methods` structured
  conversation) before placing them.
- **Critical role with zero identified successors.** Escalate IMMEDIATELY as a
  continuity risk to `board` + `marcus`. Do not quietly log it as a future to-do per
  Principle 5.
- **9-box being used as a performance rating** (e.g., feeding directly into
  compensation, or as a public ranking). Redirect per Principle 3 — this skill's 9-box
  output is for development / succession conversations, not compensation or ranking.
  Route the comp question to `payroll-and-eor` (custom, hire) or future `comp-benchmarking`.
- **No obvious "next rung" for someone's career path.** Use lattice thinking per
  Principle 4 — look for a lateral or cross-venture move that builds a needed skill
  rather than forcing a promotion conversation that isn't available.
- **Persistent-N pattern surfaces during 9-box placement** (candidate consistently Low
  Performance across 3+ cycles). Route to `performance-frame` Fallback + operator +
  employment counsel per Universal Principle 5. Succession planning is not the venue
  for PIP-adjacent decisions.
- **Individual mental-health signal surfaces during placement conversation.** STOP.
  Route per Universal Principle 3 to manager + HR Ops + EAP. Placement conversation
  waits.
- **Request to publish per-person 9-box placements** (e.g., in a broad HR report).
  Decline per Principle 8. 9-box placement is a governance / manager-conversation
  input, not a broad-publication artifact.
- **External-candidate "we could recruit" claim without a named source.** Push back
  per Phase 2 Instructions — that's aspiration, not identification. Route to hire's
  `hiring-kit` if the org actually wants to open a req to build the external pipeline.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `performance-frame` (custom, merit — sibling) | Performance data (Y/partial/N patterns across quarters) feeds 9-box placement | Upstream — performance-frame's year-end synthesis routes into 9-box |
| `feedback-methods` (custom, merit — sibling) | Delivery discipline for succession / career-lattice conversations with individuals | Downstream — succession-planning produces the plan; feedback-methods delivers it |
| `hr-strategy-alignment` (custom, merit — sibling) | Bench-strength weakness on critical roles maps to Learning & Growth perspective on the Balanced Scorecard | Downstream — succession bench data feeds the scorecard |
| `skill-gap-map` (custom, grove) | Specific skill gap the stretch assignment should close | Downstream — succession-planning identifies the gap surface; grove's skill-gap-map computes the specific gap |
| `training-program-design` (custom, grove) | Execution of the development plan via ADDIE + 70-20-10 + Kirkpatrick | Downstream via skill-gap-map |
| `hiring-kit` (custom, hire) | External candidate pool building when internal pool is empty; successor onboarding to new role when Ready Now candidate is placed | Downstream on hiring; downstream on onboarding |
| `payroll-and-eor` (custom, hire) | Classification-adjacent comp changes when a successor moves into a new role | Downstream (separate from performance-review comp routing) |
| `workforce-planning` (custom, hire) | Lattice moves are structural (change reporting lines, headcount allocation across ventures) | Downstream — lattice recommendations route to workforce-planning for the structural change |
| `board` (Governance) + `marcus` (Executive Office / Strategy) | **Zero-successor critical role escalation** per Principle 5 — MANDATORY governance route | Escalation — load-bearing rule |
| `motivation-map` (custom, maslow) | Team-level engagement / motivation context that provides background for a person's stated ambition (a low-potential-marked-person may reflect environment, not the person) | Cross-cutting — context, not decision input |
| Manager + HR Ops + EAP | Individual mental-health signal during placement conversation | Escalation — HARD BOUNDARY per Universal Principle 3 |
| Operator + employment counsel | Persistent-N pattern surfacing during placement; PIP-adjacent path | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate on every 9-box placement, bench-strength score, and escalation before shipping | Cross-cutting |

## References (public / verifiable)

- [9 Box Talent Calibration Framework — Creately](https://creately.com/guides/9-box-talent-review/)
- [Succession Planning: What is a 9-box grid? — SHRM](https://www.shrm.org/topics-tools/tools/hr-answers/succession-planning-9-box-grid)
- [The 4 Stages of Succession Planning — Qooper](https://www.qooper.io/blog/the-4-stages-of-succession-planning)
- [Succession Planning: All You Need To Know — AIHR](https://www.aihr.com/blog/succession-planning/)
- [Succession Planning Grid Using the 9-Box Grid — LeaderGov](https://www.leadergov.com/blog/succession-planning-grid-using-the-9-box-grid)
- [Career Ladder vs. Lattice — TalentGuard](https://www.talentguard.com/blog/career-lattice-a-career-development-strategy-for-your-employees)
- [Career Lattice: How To Shift From Traditional Career Ladders — AIHR](https://www.aihr.com/blog/career-lattice/)
- [What Is a Career Lattice? — Lattice](https://lattice.com/articles/what-is-a-career-lattice)
