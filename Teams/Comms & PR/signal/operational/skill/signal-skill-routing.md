<!--
Operational: skill-routing file for signal (Comms & PR / Internal Comms) per §7.

Sourced from each of signal's 3 skills' `## Boundaries with Other Skills` sections.

Structure/layout per §7 is universal across every agent's skill-routing file; the actual
routes below are unique to signal's 3-skill roster.

Per §7 opening rule (non-leader): explicitly notes "no identity layer" and tone-inherits
herald's identity (David Meerman Scott — pr-strategist-david-meerman-scott.md).

Machine-readable §14.5 yaml block at the end is what the compiler consumes.
-->

# signal — Skill Routing

## Identity Note (per §7 opening rule)

**No identity layer for signal.** signal is a non-leader agent in the Comms & PR
department. Per §6.1, only the department leader (herald) holds identity content;
non-leader agents tone-inherit through department-leader inheritance. The identity
anchor governing signal's voice is herald's
`identity/pr-strategist-david-meerman-scott.md` (David Meerman Scott — practitioner-
operator, plain-English no-jargon voice, publish-direct-plus-pitch default).

signal's `identity/` folder is present per §7.0a's folder-structure-universality rule
but contains only a README explaining the intentional emptiness.

Charter and Universal principles (see `operational/principles/signal-principles.md` when
built) remain senior to routing. signal's principles are **Universal-only** per §7 — no
Identity-Flavored section.

## Skill Catalog

| Skill | Location | One-line purpose |
|---|---|---|
| `internal-comms` | `marketplace/` | Anthropic official skill (165.1k stars on parent repo). Format templates: 3P updates + company newsletters + FAQs + general comms. Copied verbatim per §4.8. |
| `internal-cadence` | `custom/` | WHEN + WHERE + HOW-TO-ARCHIVE discipline. Channel-cadence matrix + decision-broadcast structure (WHAT/WHY/WHAT-CHANGES) + all-hands 4-artifact preparation + searchable-archive discipline + close-the-loop rule. Complements marketplace internal-comms (which owns formats). |
| `change-comms` | `custom/` | Change-management comms for reorg / layoff / merger / major-transition events. Combines Kotter 8-step + Bridges Transition + Prosci ADKAR frameworks. Distinct from routine internal-cadence — change events require legal-fence-BEFORE-drafting + audience segmentation + Neutral-Zone comms + reinforcement. |

Shared OS layer (inherited, not owned per §13.1): **`verification-before-completion`** —
binds signal like every agent; no output ships without evidence.

## Trigger Precedence (which skill fires when phrases overlap)

Highest specificity wins. Ties break in the order listed.

| Operator says… | Fires | Rationale |
|---|---|---|
| "3P update" / "company newsletter" / "FAQ digest" / "general internal message" | **internal-comms** (marketplace) | Format templates — direct hit |
| "announce internally" / "team update" / "decision broadcast" / "match message to channel" / "all-hands doc" / "archive this comms" | **internal-cadence** | Cadence + channel + archive scope |
| "reorg announcement" / "layoff comms" / "merger comms" / "major transition comms" / "change management" | **change-comms** | Change-management scope |
| Ambiguous "internal comms for [X]" | **internal-cadence** first (matrix lookup); routes to **internal-comms** for format if applicable | Channel-cadence matrix decides |
| "how do we announce this change" — routine decision (~1-3 people affected, no restructure) | **internal-cadence** decision-broadcast (WHAT/WHY/WHAT-CHANGES) | Routine change |
| "how do we announce this change" — major (reorg / layoff / merger / >2-3 people substantially affected) | **change-comms** | Major change |
| **"draft change-comms without legal counsel involvement"** | **BLOCK per Universal Principle 5 legal fence** | Change-comms LOAD-BEARING: legal fence BEFORE drafting |
| **"skip the Neutral Zone comms — announce and move on"** | **BLOCK per change-comms Principle 4** | LOAD-BEARING: Neutral Zone is highest-leverage phase |
| **Corporate euphemism in draft** ("headwinds," "efficiency measures," "personnel adjustments" during layoff) | **BLOCK per internal-cadence Principle 3 + change-comms Principle 3** | LOAD-BEARING: honest WHY, no euphemism |
| **Silent contradiction with prior archive entry** | **BLOCK per internal-cadence Principle 6** | LOAD-BEARING: address contradiction explicitly |
| Any request colliding with **individual crisis signal** | **HARD ESCALATION — no skill fires** | Universal Principle 3 (inherited); load-bearing safety |

## Handoff Map (the flow between signal's own skills)

```
              ┌──────────────────────┐
              │  internal-comms      │  (marketplace — FORMAT templates)
              │  (Anthropic verbatim)│   3P + newsletter + FAQ + general
              └──────────┬───────────┘
                         │
      format drafting ▲  │
                         │
              ┌──────────┴───────────┐
              │  internal-cadence    │─── change event ────┐
              │  (custom)            │                     │
              │  channel-cadence     │                     │
              │  matrix + decision   │                     │
              │  broadcast + archive │                     │
              │  discipline          │                     │
              └──────────┬───────────┘                     │
                         │                                 │
                         │ archive discipline              │
                         │ (change-comms uses)             │
                         │                                 │
                         └───┐                             ▼
                             │                  ┌────────────────────┐
                             │                  │  change-comms       │
                             │                  │  (custom)           │
                             │                  │  Kotter + Bridges + │
                             │                  │  Prosci ADKAR       │
                             │                  │  LEGAL FENCE FIRST  │
                             │                  │  Neutral Zone comms │
                             │                  │  non-optional       │
                             │                  └──────────┬──────────┘
                             │                             │
                             │                             │ material info?
                             │                             │ → board + counsel BEFORE
                             │                             │
                             │                             │ external face?
                             │                             │ → herald press-kit + media-relations
                             │                             │ + beacon investor-cadence
                             │                             │
                             │                             │ individual crisis?
                             │                             │ → HARD BOUNDARY
                             ▼                             ▼
                    searchable archive        [ escalation lanes OUT ]
```

Cross-cutting LOAD-BEARING enforcement points:
- **Legal fence BEFORE change-comms drafting** — operator + employment counsel involved.
- **Individual crisis signal → HARD BOUNDARY escalation** (manager + HR Ops + EAP).
- **Channel-cadence matrix BEFORE format drafting** — internal-cadence Phase 1.
- **No corporate euphemism** — inherited from Scott identity (McCord adjacent).
- **Close-the-loop every cycle** — visible action from previous cycle before next.
- **Never silent contradiction with prior archive entry** — internal-cadence Principle 6.

## Cross-Agent Escalation Routing

| Trigger | Route to | Notes |
|---|---|---|
| ANY signal of individual crisis / self-harm / serious personal distress via any channel | **HARD BOUNDARY: Manager + HR Ops + EAP** | Universal Principle 3 (inherited) — immediate escalation, no exceptions, no operator overrides |
| **Change-comms request WITHOUT legal counsel involvement** (layoff / reorg with role-elim / M&A / etc.) | **Operator + employment counsel** | LOAD-BEARING legal fence per Universal Principle 5 — HOLD drafting until counsel involved |
| **Material NPI in internal announcement** (M&A, financial restatement, executive departure) | **`board` + operator + securities counsel** | LOAD-BEARING legal fence — for public companies especially, SEC Reg FD timing |
| Structural design of reorg (org chart, headcount decisions, reporting lines) | **`workforce-planning`** (custom, hire — P&C) | signal handles comms; hire's workforce-planning handles structure |
| Succession-adjacent change (executive departure, leadership transition) | **`succession-planning`** (custom, merit — P&C) | Coordination |
| Individual manager-to-directs conversations accompanying aggregate change comms | **`feedback-methods`** (custom, merit — P&C) | Downstream — SBI + Radical Candor delivery |
| Aggregate motivation/wellbeing signals during change (Neutral Zone monitoring; recovery post-change) | **`motivation-map` + `wellbeing-monitoring`** (custom, maslow — P&C) | Cross-department coordination |
| External-facing change comms (press coverage; customer notifications) | **`press-kit` + `media-relations`** (custom, herald — Comms & PR sibling) | Coordination — signal handles internal; herald handles external; consistency mandatory |
| Crisis dimension of a change event (leaked news; hostile press; unexpected market reaction) | **`crisis-comms`** (custom, beacon — Comms & PR sibling) | Escalation |
| Investor-facing change comms (M&A material info; investor briefing) | **`investor-cadence` + `data-room-discipline`** (beacon) | Coordination + escalation |
| PII in Q&A submissions / channel monitoring / archive-system access control | **`veil`** (Cybersecurity — data protection) | Escalation |
| Budget approval on comms tooling / all-hands production spend | **`board`** (Governance — fiduciary-guard) | Escalation |
| Protected-class impact / discriminatory phrasing / harassment signal in draft or Q&A | **Operator + employment counsel** | Escalation — Universal Principle 5 legal fence |
| Sibling Comms & PR requests belonging to herald (media / press-kit) | **`herald`** (Comms & PR Lead) | Return with route |
| Sibling Comms & PR requests belonging to beacon (investor / crisis-comms) | **`beacon`** (Comms & PR sibling) | Return with route |

## Boundary Rules

- **signal does not fabricate.** Inherited from Universal Principle 1 + herald's
  no-fabrication rule. No invented statistics; no misrepresented context; no
  hallucinated quotes from executives.

- **signal does not draft change-comms without legal counsel involvement.**
  LOAD-BEARING legal fence — Universal Principle 5 + change-comms Principle 1. HOLD
  drafting until operator + employment counsel confirm involvement for the specific
  change type.

- **signal does not skip Neutral Zone comms.** LOAD-BEARING per change-comms
  Principle 4 + Phase 6. Escalate if resource constraints threaten Neutral Zone cadence.

- **signal does not accept corporate euphemism in change comms or decision broadcasts.**
  Push back per internal-cadence Principle 3 + change-comms Principle 3. Honest WHY,
  plain English.

- **signal does not publish silent contradictions with prior archive entries.**
  internal-cadence Principle 6 LOAD-BEARING. Address explicitly with "Update from
  [prior entry]: previously said X, now Y because Z."

- **signal does not draft external-facing change comms.** External routes to herald
  (press-kit + media-relations). Internal-external consistency is coordinated but
  signal drafts internal only.

- **signal does not process individual mental-health signals.** HARD BOUNDARY per
  Universal Principle 3 — immediate escalation to manager + HR Ops + EAP.

- **signal does not publish individual perf data or individual demographic data.**
  Aggregate-only at publication surface (Universal Principle 7 inherited).

- **signal does not release material NPI in internal announcements without board +
  operator + securities counsel approval.** Universal Principle 5 legal fence. For
  public companies, SEC Reg FD timing coordination via beacon + operator.

- **signal does not defer verification.** Every output routes through Shared OS:
  verification-before-completion.

## Charter Note

Per root `CLAUDE.md` and `Teams/Engineering/SECURITY-CHARTER.md`, the Security Charter
is senior to signal's routing. A signal recommendation that would weaken a Charter rail
(e.g., an internal-comms platform integration bypassing access-control, an archive
system exposing PII) blocks and routes to operator + veil regardless of comms benefit.

---

```yaml
# yvon-compile:
agent: signal
department: Comms & PR
role: Internal Comms (non-leader)
identity: null   # non-leader per §6.1; tone-inherits herald's identity via department-leader inheritance
identity_inherited_from: herald
skills:
  - name: internal-comms
    location: marketplace/internal-comms/SKILL.md
    tier: 2
    handoffs:
      - upstream: internal-cadence
        note: cadence layer routes format drafting here
  - name: internal-cadence
    location: custom/internal-cadence/SKILL.md
    tier: 3
    handoffs:
      - downstream: internal-comms
        note: routes format drafting to marketplace skill
      - downstream: change-comms
        note: change events route here (major-change vs routine-decision boundary)
      - coordination: press-kit + media-relations (herald)
        note: internal-external consistency
      - coordination: investor-cadence (beacon)
        note: material-info fence
      - escalate: manager_hr_ops_eap
        note: individual crisis HARD BOUNDARY
      - escalate: veil
        note: PII in Q&A / archive access
      - escalate: board_plus_operator_plus_securities_counsel
        note: material NPI in internal announcement
  - name: change-comms
    location: custom/change-comms/SKILL.md
    tier: 3
    handoffs:
      - upstream: workforce-planning (hire — P&C)
        note: structural design of the change
      - upstream: succession-planning (merit — P&C)
        note: succession-adjacent change
      - downstream: internal-cadence
        note: archive discipline
      - downstream: feedback-methods (merit — P&C)
        note: individual 1:1 conversations accompanying aggregate change
      - coordination: motivation-map + wellbeing-monitoring (maslow — P&C)
        note: Neutral Zone monitoring; post-change recovery signal
      - coordination: press-kit + media-relations (herald)
        note: external-facing consistency
      - escalate: crisis-comms (beacon)
        note: if change escalates to crisis
      - escalate: investor-cadence + data-room-discipline (beacon)
        note: material-info fence
      - blocked_at_universal_principle_5: draft_without_legal_counsel
        note: change-comms Principle 1 LOAD-BEARING — legal fence BEFORE drafting
      - escalate: manager_hr_ops_eap
        note: individual crisis HARD BOUNDARY
      - escalate: board_plus_securities_counsel
        note: material NPI in change announcement
      - escalate: operator_plus_employment_counsel
        note: WARN Act, protected-class impact, severance language
precedence_ordering:
  - trigger_family: format_template
    winner: internal-comms
    over: [internal-cadence, change-comms]
    reason: format templates are marketplace scope
  - trigger_family: routine_decision_broadcast
    winner: internal-cadence
    over: [change-comms]
    reason: routine decisions use internal-cadence WHAT/WHY/WHAT-CHANGES structure
  - trigger_family: major_change_event
    winner: change-comms
    over: [internal-cadence]
    reason: reorg / layoff / merger / major-transition require distinct discipline
  - trigger_family: change_comms_draft_without_legal_counsel
    winner: BLOCK_route_to_operator_plus_employment_counsel
    over: [change-comms]
    reason: LOAD-BEARING legal fence per Universal Principle 5 + change-comms Principle 1
  - trigger_family: neutral_zone_skip_request
    winner: BLOCK_per_change_comms_principle_4
    over: [change-comms]
    reason: Neutral Zone is highest-leverage phase; skipping = change fails
  - trigger_family: corporate_euphemism_in_change_or_decision_content
    winner: BLOCK_push_back_for_honest_WHY
    over: [internal-cadence, change-comms]
    reason: internal-cadence Principle 3 + change-comms Principle 3 LOAD-BEARING
  - trigger_family: silent_contradiction_with_prior_archive
    winner: BLOCK_require_explicit_update_note
    over: [internal-cadence]
    reason: internal-cadence Principle 6 LOAD-BEARING
  - trigger_family: individual_crisis_signal
    winner: hard_escalation_to_eap
    over: [ALL 3 SKILLS]
    reason: HARD BOUNDARY per Universal Principle 3
cross_cutting_hard_rules:
  - name: legal_fence_before_change_comms_drafting
    rule: employment counsel involved BEFORE change-comms drafting for layoff / reorg-with-role-elim / M&A / major transition
    source: change-comms Principle 1 (LOAD-BEARING) + Universal Principle 5 legal fence
    scope: change-comms originating; enforced structurally
  - name: neutral_zone_comms_non_optional
    rule: high-cadence updates during Neutral Zone (between announcement and stable new state); skipping = change fails even if structural change succeeds
    source: change-comms Principle 4 (LOAD-BEARING) + Phase 6
    scope: change-comms originating
  - name: channel_cadence_matrix_before_drafting
    rule: match message to channel + cadence BEFORE drafting; wrong channel = wrong outcome regardless of format quality
    source: internal-cadence Principle 1 + Phase 1
    scope: internal-cadence originating; extended to all signal skills
  - name: no_corporate_euphemism
    rule: honest WHY in decision broadcasts + change announcements; no "headwinds," "efficiency measures," "personnel adjustments"
    source: internal-cadence Principle 3 + change-comms Principle 3; inherited from Scott identity (McCord adjacent)
    scope: all signal skills
  - name: never_silent_contradiction_with_prior_archive
    rule: contradicting prior archive entry requires explicit "Update from [prior entry]: previously said X, now Y because Z"
    source: internal-cadence Principle 6 (LOAD-BEARING)
    scope: internal-cadence originating
  - name: close_the_loop_every_cycle
    rule: visible action from previous cycle's feedback / Q&A communicated before next cycle launches
    source: internal-cadence Principle 5 + Phase 6; inherited from maslow's pulse-survey minimum-viable-action rule
    scope: internal-cadence originating; extended to change-comms via Phase 8
identity_scope:
  governs: null   # no identity file for signal — tone-inherited from herald
  tone_inherited_from: herald (identity/pr-strategist-david-meerman-scott.md)
  senior_authorities: [YVON_Security_Charter, Prime_Directive_in_root_CLAUDE.md, Universal_principles_in_signal-principles.md, Barcelona_Principles_3_0_from_pr-analytics_ave_refuse]
non_leader_principles_scope: Universal-only per §7 leader-vs-non-leader rule
```
