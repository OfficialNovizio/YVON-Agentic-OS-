<!--
Operational: skill-routing file for merit (People & Culture / Performance Management)
per §7.

Sourced from each of merit's 4 skills' `## Boundaries with Other Skills` sections.

Structure/layout per §7 is universal across every agent's skill-routing file; the actual
routes below are unique to merit's 4-skill roster.

Per §7 opening rule (non-leader): explicitly notes "no identity layer" and tone-inherits
hire's identity (Patty McCord — talent-strategist-patty-mccord.md).

Machine-readable §14.5 yaml block at the end is what the compiler consumes.

Special note: merit has 4 cross-cutting hard rules that apply across ALL 4 merit skills
(not just the originating skill). These are captured in the yaml `cross_cutting_hard_rules`
section and elevate to Universal Principles in merit-principles.md.
-->

# merit — Skill Routing

## Identity Note (per §7 opening rule)

**No identity layer for merit.** merit is a non-leader agent in the People & Culture
department. Per §6.1, only the department leader (hire) holds identity content; non-leader
agents tone-inherit through department-leader inheritance. The identity anchor governing
merit's voice is hire's `identity/talent-strategist-patty-mccord.md` (Patty McCord —
Netflix Chief Talent Officer 1998–2012).

merit's `identity/` folder is present per §7.0a's folder-structure-universality rule but
contains only a README explaining the intentional emptiness. See `identity/README.md`.

Charter and Universal principles (see `operational/principles/merit-principles.md` when
built) remain senior to routing. merit's principles are **Universal-only** per §7 — no
Identity-Flavored section.

## Skill Catalog

| Skill | Location | One-line purpose |
|---|---|---|
| `feedback-methods` | `custom/` | SBI (Situation-Behavior-Impact) format + Kim Scott's Radical Candor stance. Framework consumer for feedback conversations. Reclassified from marketplace per §4.6 (weak marketplace fit). Does NOT record individual feedback events. |
| `performance-frame` | `custom/` | Individual OKR cascade from vista's company OKRs + quarterly written evidence-based reviews. Delivered via feedback-methods; comp discussions route OUT. Built from catalog + Doerr/Grove/Bock sources. |
| `succession-planning` | `custom/` + `scripts/` | 9-box performance/potential grid + bench-strength scoring + career-lattice framing. Zero-successor critical roles escalate to board + marcus MANDATORY. Includes `succession_planning.py`. Adopted from Anthropic plugin. |
| `hr-strategy-alignment` | `custom/` + `scripts/` | HRBP + Balanced Scorecard 4 perspectives. Aggregation layer above operational P&C skills. Orphan flagging in both directions (objectives without initiatives; initiatives without objectives). Includes `hr_scorecard.py`. Adopted from Anthropic plugin. |

Shared OS layer (inherited, not owned per §13.1): **`verification-before-completion`** —
binds merit like every agent; no output ships without evidence.

## Trigger Precedence (which skill fires when phrases overlap)

Highest specificity wins. Ties break in the order listed.

| Operator says… | Fires | Rationale |
|---|---|---|
| "how do I give this feedback", "SBI feedback", "radical candor", "prepare for a hard conversation" | **feedback-methods** | Delivery framework — direct hit |
| "performance review for", "individual OKR", "quarterly review", "write a performance review" | **performance-frame** | Perf-cycle entry point |
| "9-box grid for", "bench strength for", "succession plan for", "career path for", "career lattice" | **succession-planning** | Succession + career development |
| "HR strategy for", "HR balanced scorecard", "HRBP alignment", "audit our HR initiatives", "sunset which HR program" | **hr-strategy-alignment** | Aggregation / prioritization layer |
| Ambiguous "how do I evaluate this person" | **performance-frame** first (produces content); calls **feedback-methods** for delivery | Content → delivery separation |
| Ambiguous "career path" | **succession-planning** | Owns career-lattice framing |
| "give feedback about performance" | **feedback-methods** for delivery discipline + reference to **performance-frame** for content context | Bidirectional; feedback delivery is feedback-methods scope |
| Compensation discussion introduced into a review conversation | **BLOCK** per performance-frame comp-separation rule; route comp to hire's `payroll-and-eor` | Load-bearing rule; no operator override without written reason |
| 9-box placement being used as comp / PIP / public ranking input | **BLOCK** per succession-planning Principle 3; redirect | Load-bearing rule |
| Any request colliding with **individual crisis signal** | **HARD ESCALATION — no skill fires** | Universal Principle 3 (inherited); load-bearing safety |

## Handoff Map (the flow between merit's own skills)

```
                                       ┌───────────────────────┐
                                       │ hr-strategy-alignment │
                                       │  (aggregation layer)  │
                                       │  + hr_scorecard.py    │
                                       └───────┬───────────────┘
                                               │
                       aggregate signals feed  │
                       from all merit skills   │
                                               │
     ┌───────────────────┐                     │
     │  feedback-methods │◄──── delivery ─────┤
     │  (SBI + Radical   │       discipline    │
     │   Candor)         │                     │
     └─────────┬─────────┘                     │
               │                               │
               │ delivery                      │
               │ discipline                    │
               ▼                               │
     ┌───────────────────┐                     │
     │ performance-frame │─── year-end ────────┤
     │  (OKR cascade +   │    synthesis        │
     │   quarterly       │                     │
     │   reviews)        │                     │
     └─────────┬─────────┘                     │
               │                               │
               │ Y-pattern                     │
               ▼                               │
     ┌───────────────────┐                     │
     │succession-planning│─────────────────────┘
     │  (9-box + bench   │  bench strength
     │   + career lattice│  feeds Learning &
     │   + succession_   │  Growth perspective
     │   planning.py)    │
     └───────────────────┘
              │
              │ ZERO-SUCCESSOR CRITICAL ROLE
              │ (MANDATORY governance escalation)
              ▼
     [ board (Governance) + marcus (Executive Office / Strategy) ]
```

Every arrow is a two-way information exchange (except escalations which are one-way OUT).
The four cross-cutting hard rules apply across ALL merit skills:

- No-orphan-OKR (originating in `performance-frame`, inherited by all merit skills that
  consume perf data).
- Comp-separation (originating in `performance-frame`, enforced whenever comp discussion
  surfaces in a review or succession context).
- 9-box-NOT-comp-input (originating in `succession-planning`, enforced by all merit
  skills that reference 9-box data).
- No-observation-of-individual-feedback-events (originating in `feedback-methods`,
  inherited by all merit skills — merit teaches feedback frameworks; does not build a
  feedback-event ledger).

## Cross-Agent Escalation Routing

Escalations LEAVE merit and route to the named target. merit does not resolve any of
these in-scope.

| Trigger | Route to | Notes |
|---|---|---|
| ANY signal of individual crisis / self-harm / serious personal distress via any channel | **HARD BOUNDARY: Manager + HR Ops + EAP** | Universal Principle 3 (inherited) — immediate escalation, no exceptions, no operator overrides |
| **Zero-successor critical role identified in succession-planning** | **MANDATORY: `board` (Governance) + `marcus` (Executive Office / Strategy)** | succession-planning Principle 5 — not a discretionary escalation; not just logged in an HR report; live continuity risk |
| Cross-venture strategic-priority conflicts surfaced in hr-strategy-alignment | **`marcus` (Executive Office / Strategy) + `board` (Governance)** | hr-strategy-alignment Principle 5 — merit surfaces the tradeoff; marcus + board decide |
| Budget approval on any HR program cost or comp change crossing thresholds | **`board` (Governance — `fiduciary-guard` skill)** | Placeholder until Finance agent exists |
| Company-level OKRs missing when individual OKR cascade requested | **`vista` (Executive Office / Roadmap Lead)** | performance-frame Fallback rule 1 — no orphan individual OKRs |
| Compensation-change decision from performance-review outputs | **`payroll-and-eor`** (custom, hire) OR future `comp-benchmarking` | performance-frame Phase 5 — comp is separate from review conversation |
| External-candidate pool building when internal succession pool empty | **`hiring-kit`** (custom, hire) | succession-planning Phase 2 fallback |
| Successor onboarding into new role (Ready-Now candidate placed) | **`hiring-kit`** (custom, hire) | Downstream from succession-planning placement |
| Persistent-partial performance pattern (2+ cycles) → competence gap | **`skill-gap-map`** (custom, grove) | performance-frame year-end synthesis routing |
| Persistent-N performance pattern (3+ cycles) → fit-vs-role question | **`workforce-planning`** (custom, hire) + operator + employment counsel | performance-frame year-end synthesis routing + PIP-adjacent path |
| Structural cause of a RED mid-cycle KR (understaffing, missing tools) | **`workforce-planning`** (custom, hire) | performance-frame Phase 2 |
| Career-lattice recommendation involving reporting-line / structural change | **`workforce-planning`** (custom, hire) | succession-planning Phase 7 |
| Development-plan execution for succession-planning stretch | **`skill-gap-map`** + **`training-program-design`** (custom, grove) | succession-planning Phase 6 → grove |
| Employment-law adjacent (PIP formalization, discriminatory phrasing, harassment signals) | **Operator + employment counsel** | Universal Principle 5 — legal fence; no CLO in YVON |
| PII / GDPR question in performance data | **`veil`** (Cybersecurity — data protection) | Per CLAUDE.md §2 |
| Motivation / wellbeing / recognition-adjacent request | **`maslow`** (P&C sibling) | Different scope inside same department |
| L&D / training / gap analysis request | **`grove`** (P&C sibling) | Different scope inside same department |
| Hiring / workforce-planning / payroll requests | **`hire`** (P&C Lead) | Different scope — same department |
| Aggregate people-analytics metrics (turnover, engagement scores) | **Future `Shared OS: people-analytics-metrics`** (task #12) | Currently: hold and log; supplies numbers for hr-strategy-alignment scorecard |
| ATS / D&I funnel reporting | **`ats-selection`** (custom, hire) | Feeds Internal Process perspective on scorecard |

## Boundary Rules

- **merit does not observe or record individual feedback events.** feedback-methods
  teaches the framework; merit does not build a per-person feedback ledger. Universal
  Principle 7 (aggregate-only) inherited from hire applies at merit's data-holding
  surface.

- **merit does not resolve individual coaching requests.** All 4 skills operate at
  team/cohort level (except performance-frame's individual OKR + review, which is
  between manager and direct report, not stored broadly). Individual coaching routes to
  the accountable manager or an external coach.

- **merit does not proceed with orphan individual OKRs.** performance-frame Principle 1 —
  every individual O traces to a specific vista company O. If vista hasn't published,
  individual OKR setting blocks per Fallback.

- **merit does not mix comp discussion into review conversations.** performance-frame
  Principle 4 — different data, different escalation, different cadence. Comp routes
  OUT to payroll-and-eor or future comp-benchmarking.

- **merit does not let 9-box become a comp / PIP / ranking input.** succession-planning
  Principle 3 — 9-box is a development-conversation input; misuse destroys the framework.

- **merit does not quietly log zero-successor critical roles.** succession-planning
  Principle 5 — MANDATORY escalation to board + marcus as continuity risk, not just an
  HR line item.

- **merit does not publish per-person 9-box placements broadly.** Governance /
  manager-conversation surface only. Public ranking is a misuse per succession-planning
  Principle 8.

- **merit does not invent business objectives for hr-strategy-alignment scorecard.**
  hr-strategy-alignment Fallback rule 1 — no objectives from marcus / vista / requester
  = scorecard incomplete, don't fabricate.

- **merit does not silently pick between conflicting venture priorities.**
  hr-strategy-alignment Principle 5 — cross-venture tradeoffs route to marcus + board
  for the strategic call.

- **merit does not defer verification.** Every output routes through Shared OS:
  verification-before-completion — same as every agent.

## Charter Note

Per root `CLAUDE.md` and `Teams/Engineering/SECURITY-CHARTER.md`, the Security Charter is
senior to merit's routing. Any merit recommendation that would weaken a Charter rail
(e.g., a scorecard entry that would expose SSNs; a succession memo that would expose
individual perf data broadly) blocks and routes to the operator + veil regardless of
operational benefit.

---

```yaml
# yvon-compile:
agent: merit
department: People & Culture
role: Performance Management (non-leader)
identity: null   # non-leader per §6.1; tone-inherits hire's identity via department-leader inheritance
identity_inherited_from: hire
skills:
  - name: feedback-methods
    location: custom/feedback-methods/SKILL.md
    tier: 2
    handoffs:
      - downstream: performance-frame
        note: quarterly-review conversation delivery discipline
      - downstream: succession-planning
        note: development / career conversations delivery discipline
      - downstream: hiring-kit (from hire)
        note: SBI-structured rejection feedback (Phase 4 / Phase 6 rejects)
      - upstream: motivation-map (from maslow)
        note: relatedness intervention conversations
      - upstream: training-program-design (from grove)
        note: formal-instruction content on manager-training programs
      - hard_boundary: manager_hr_ops_eap
        note: individual mental-health signal → immediate escalation
      - escalate: operator_plus_employment_counsel
        note: PIP formalization; discriminatory-phrasing concerns
  - name: performance-frame
    location: custom/performance-frame/SKILL.md
    tier: 3
    handoffs:
      - upstream: vista (Executive Office / Roadmap Lead)
        note: company OKRs — no orphan individual OKR without vista's publication
      - downstream: feedback-methods
        note: review conversation delivery
      - downstream: succession-planning
        note: year-end synthesis (Y-pattern → 9-box High Performance band)
      - downstream: hr-strategy-alignment
        note: aggregate perf-cycle signals feed Employee/Customer perspective
      - downstream: payroll-and-eor (from hire)
        note: classification-adjacent comp changes (separate conversation)
      - downstream: skill-gap-map (from grove)
        note: persistent-partial pattern → competence gap
      - downstream: workforce-planning (from hire)
        note: persistent-N pattern → fit-vs-role question; structural RED cause
      - hard_boundary: manager_hr_ops_eap
        note: individual mental-health signal → immediate escalation
      - escalate: operator_plus_employment_counsel
        note: PIP formalization; discriminatory phrasing
      - escalate: board
        note: comp changes crossing spend-approval thresholds (via fiduciary-guard)
  - name: succession-planning
    location: custom/succession-planning/SKILL.md
    tier: 3
    script: custom/succession-planning/scripts/succession_planning.py
    handoffs:
      - upstream: performance-frame
        note: Y-pattern year-end synthesis → 9-box High Performance placement input
      - downstream: feedback-methods
        note: succession / career conversation delivery
      - downstream: hr-strategy-alignment
        note: bench-strength scores feed Learning & Growth perspective
      - downstream: skill-gap-map (from grove)
        note: specific skill gap for stretch experience
      - downstream: training-program-design (from grove)
        note: development plan execution
      - downstream: hiring-kit (from hire)
        note: external candidate pool building when internal empty; successor onboarding
      - downstream: workforce-planning (from hire)
        note: lattice moves involving reporting-line / structural change
      - downstream: payroll-and-eor (from hire)
        note: classification-adjacent comp changes on new role placement
      - mandatory_governance_escalation: board_plus_marcus
        note: ZERO-SUCCESSOR CRITICAL ROLE — Principle 5 load-bearing rule; MANDATORY not discretionary
      - hard_boundary: manager_hr_ops_eap
        note: individual mental-health signal → immediate escalation
      - escalate: operator_plus_employment_counsel
        note: persistent-N pattern surfacing during placement → PIP-adjacent path
  - name: hr-strategy-alignment
    location: custom/hr-strategy-alignment/SKILL.md
    tier: 3
    script: custom/hr-strategy-alignment/scripts/hr_scorecard.py
    handoffs:
      - upstream: performance-frame
        note: aggregate perf-cycle signals → Employee/Customer perspective
      - upstream: succession-planning
        note: bench-strength scores → Learning & Growth perspective
      - upstream: motivation-map + wellbeing-monitoring + recognition-program (from maslow)
        note: aggregate maslow signals → Employee/Customer perspective
      - upstream: skill-gap-map + training-program-design + training-operations (from grove)
        note: aggregate grove signals → Learning & Growth + Internal Process perspectives
      - upstream: hiring-kit + ats-selection + payroll-and-eor + workforce-planning (from hire)
        note: aggregate hire signals → Financial + Internal Process perspectives
      - upstream: vista
        note: company OKRs inform top strategic objectives in Phase 1
      - upstream: marcus
        note: business objectives; strategic priority tradeoff resolutions
      - downstream: feedback-methods
        note: sunset conversation delivery for orphan initiatives
      - escalate: board
        note: budget approval for HR programs (via fiduciary-guard); strategic commitments approval
      - escalate: marcus_plus_board
        note: cross-venture strategic priority tradeoffs (Principle 5)
      - hard_boundary: manager_hr_ops_eap
        note: individual mental-health signal (rare in strategy scope) → immediate escalation
precedence_ordering:
  - trigger_family: performance_evaluation
    winner: performance-frame
    over: [feedback-methods, succession-planning]
    reason: performance-frame produces the content; feedback-methods delivers; succession-planning consumes patterns downstream
  - trigger_family: career_path_or_succession
    winner: succession-planning
    over: [performance-frame]
    reason: succession-planning owns career-lattice framing and 9-box placement
  - trigger_family: strategy_alignment_or_scorecard
    winner: hr-strategy-alignment
    over: [ALL OTHER MERIT SKILLS]
    reason: aggregation layer is exclusive to hr-strategy-alignment
  - trigger_family: comp_discussion_in_review_context
    winner: block_and_route_to_hire_payroll_and_eor
    over: [performance-frame]
    reason: performance-frame Principle 4 comp-separation — load-bearing rule
  - trigger_family: 9box_as_comp_or_pip_or_ranking
    winner: block_and_redirect
    over: [succession-planning]
    reason: succession-planning Principle 3 — 9-box misuse destroys framework
  - trigger_family: individual_crisis_signal
    winner: hard_escalation_to_eap
    over: [ALL 4 SKILLS]
    reason: HARD BOUNDARY inherited from Universal Principle 3
cross_cutting_hard_rules:
  - name: no_orphan_individual_okr
    rule: Every individual O traces to a specific vista company O; no orphan individual OKRs proceed
    source: performance-frame Principle 1 + Fallback rule 1
    scope: performance-frame originating; inherited by hr-strategy-alignment (perf signals feed BSC only from vista-cascaded OKRs)
  - name: comp_separation
    rule: Compensation discussion never mixed into performance-review conversation; comp routes to payroll-and-eor or future comp-benchmarking on separate cadence
    source: performance-frame Principle 4 + Fallback rule 5
    scope: performance-frame originating; enforced whenever comp surfaces in any merit context
  - name: nine_box_not_comp_or_pip_or_ranking
    rule: 9-box placement is a development-conversation input; never comp input; never PIP designation; never public ranking
    source: succession-planning Principle 3 + Fallback rule 3
    scope: succession-planning originating; enforced across all merit skills that reference 9-box
  - name: zero_successor_critical_role_mandatory_escalation
    rule: Zero-successor critical role → MANDATORY governance escalation to board + marcus; not discretionary; not just logged
    source: succession-planning Principle 5 + Phase 8
    scope: succession-planning originating
  - name: no_observation_of_individual_feedback_events
    rule: feedback-methods teaches the framework; merit does NOT build a per-person feedback ledger or track who-gave-whom-what-feedback
    source: feedback-methods Principle 5
    scope: feedback-methods originating; inherited by all merit skills
  - name: orphan_flagging_both_directions
    rule: hr-strategy-alignment scorecard flags orphan objectives (no mapped HR initiative — gap) AND orphan initiatives (no mapped business objective — sunset candidate); presented as prominently as wins
    source: hr-strategy-alignment Principle 1 + Phase 4
    scope: hr-strategy-alignment originating
identity_scope:
  governs: null   # no identity file for merit — tone-inherited from hire
  tone_inherited_from: hire (identity/talent-strategist-patty-mccord.md)
  senior_authorities: [YVON_Security_Charter, Prime_Directive_in_root_CLAUDE.md, Universal_principles_in_merit-principles.md]
non_leader_principles_scope: Universal-only per §7 leader-vs-non-leader rule
```
