<!--
Operational: skill-routing file for grove (People & Culture / Learning & Development)
per §7.

Sourced from each of grove's 4 skills' `## Boundaries with Other Skills` sections.

Structure/layout per §7 is universal across every agent's skill-routing file; the actual
routes below are unique to grove's 4-skill roster.

Per §7 opening rule (non-leader): explicitly notes "no identity layer" and tone-inherits
hire's identity (Patty McCord — talent-strategist-patty-mccord.md).

Machine-readable §14.5 yaml block at the end is what the compiler consumes.

Special note on grove's compliance-audit-trail immutability rule: this is a HARD RULE that
cuts across grove's skills, not just training-operations. Any grove skill that would
touch an audit-trail entry (via reporting, rollup, or extraction) must respect the
immutability rule — corrections appended as new entries only, no edits or deletes.
Enforced in the skill-routing yaml block via a cross-cutting_hard_rules entry.
-->

# grove — Skill Routing

## Identity Note (per §7 opening rule)

**No identity layer for grove.** grove is a non-leader agent in the People & Culture
department. Per §6.1, only the department leader (hire) holds identity content; non-leader
agents tone-inherit through department-leader inheritance. The identity anchor governing
grove's voice is hire's `identity/talent-strategist-patty-mccord.md` (Patty McCord —
Netflix Chief Talent Officer 1998–2012).

grove's `identity/` folder is present per §7.0a's folder-structure-universality rule but
contains only a README explaining the intentional emptiness. See `identity/README.md`.

Charter and Universal principles (see `operational/principles/grove-principles.md` when
built) remain senior to routing. grove's principles are **Universal-only** per §7 — no
Identity-Flavored section.

## Skill Catalog

| Skill | Location | One-line purpose |
|---|---|---|
| `deliberate-practice` | `custom/` | Ericsson's 5-condition DP framework as mechanism-level grounding for the 70% and 20% pieces of a training program. Reclassified from marketplace per §4.6 (no marketplace fit at grove's scope). |
| `skill-gap-map` | `custom/` + `scripts/` | 5-step SGA framework — build 1-5 proficiency matrix, calculate priority (gap × criticality), route each top-priority gap to Build / Buy / Borrow / Bridge. Merged from catalog `vyon-skill-gap-map` + Anthropic `skills-gap-analysis` plugin. Includes `skill_gap.py`. |
| `training-program-design` | `custom/` + `scripts/` | ADDIE + 70-20-10 + Kirkpatrick 4-levels + Required Drivers. Backward-designed from Level 4 business result. Includes `training_program.py`. Adopted from Anthropic plugin. |
| `training-operations` | `custom/` + `scripts/` | Logistics + compliance-record-keeping layer — LMS enrollment automation, 4-required-fields audit trail, expiry alerts, completion reporting. **Individually-identifiable records by legal necessity — inverts every other P&C skill's aggregate-only rule.** Includes `training_ops.py`. Adopted from Anthropic plugin. |

Shared OS layer (inherited, not owned per §13.1): **`verification-before-completion`** —
binds grove like every agent; no output ships without evidence.

## Trigger Precedence (which skill fires when phrases overlap)

Highest specificity wins. Ties break in the order listed.

| Operator says… | Fires | Rationale |
|---|---|---|
| "deliberate practice", "Ericsson framework", "component-skill decomposition", "how do people actually learn this" | **deliberate-practice** | Mechanism-level framework |
| "skills matrix for", "skills gap analysis", "capability assessment", "hire vs upskill", "build buy borrow bridge" | **skill-gap-map** | Analytical entry point — owns the 5-step SGA framework |
| "design a training program for", "training program for", "ADDIE", "Kirkpatrick evaluation", "70-20-10 design", "did that training program work" | **training-program-design** | Program design + evaluation — content/framework side |
| "enrollment automation", "compliance audit trail", "certification expiry", "training compliance report", "LMS setup for" | **training-operations** | Logistics + compliance side — distinct scope |
| Ambiguous "training" without other context | Push back: clarify content-design (training-program-design) vs logistics (training-operations) | Clean scope separation matters — the two skills operate on different data models (aggregate vs individually-identifiable) |
| "practice" ambiguous (mechanism vs program) | **deliberate-practice** for mechanism-level design; **training-program-design** for the program shell that consumes it | Bidirectional; DP is often called during Phase 3 of program design |
| "audit training records" / "check if X completed [mandatory training]" | **training-operations** | Compliance side always; never other grove skills |
| Ambiguous "L&D" | **skill-gap-map** first (validate the gap exists), then routes to build/buy/borrow/bridge — often to training-program-design if Build | skill-gap-map is grove's analytical entry point |

## Handoff Map (the flow between grove's own skills)

```
                    ┌──────────────────────────┐
                    │   deliberate-practice    │  (mechanism-level framework)
                    │      (custom / grove)    │
                    └────────────┬─────────────┘
                                 │ mechanism input
                                 ▼
                    ┌──────────────────────────┐
                    │  skill-gap-map           │──────────────┐
                    │  (custom / grove +       │  Build       │
                    │   skill_gap.py)          │  action      │
                    └──┬───────────────────────┘              ▼
                       │                          ┌──────────────────────────┐
                       │                          │  training-program-design │
                       │                          │  (custom / grove +       │
                       │  Buy / Borrow / Bridge   │   training_program.py)   │
                       │  route to hire's skills  └────────────┬─────────────┘
                       ▼                                       │ program shell
      ┌─────────────────────────────┐                          ▼
      │  hire's hiring-kit          │        ┌────────────────────────────────┐
      │  hire's payroll-and-eor     │        │      training-operations       │
      │  hire's workforce-planning  │        │  (custom / grove +             │
      └─────────────────────────────┘        │   training_ops.py)             │
                                             │  ── AGGREGATE-ONLY INVERSION ──│
                                             │  Individually-identifiable     │
                                             │  by legal necessity.           │
                                             │  Privacy = access control.     │
                                             └────────────────────────────────┘
```

Every arrow above is a two-way information exchange. The **aggregate-only inversion** in
`training-operations` is called out visually in the diagram because it's the one place in
all of P&C where records must stay individually identifiable — every other grove/maslow/merit
skill enforces aggregate-only per hire's Universal Principle 7.

## Cross-Agent Escalation Routing

Escalations LEAVE grove and route to the named target. grove does not resolve any of these
in-scope.

| Trigger | Route to | Notes |
|---|---|---|
| ANY signal of individual crisis, self-harm, serious personal distress (rare in grove context but possible via compliance conversation touching individual distress) | **HARD BOUNDARY: Manager + HR Ops + EAP** | Universal Principle 3 (inherited from hire and enforced in all P&C skills) — immediate escalation, no exceptions, no operator overrides |
| Compliance-audit-trail retention period unclear for a specific regulation/jurisdiction | **Operator + employment counsel** | training-operations Fallback rule 3 — never guess a blanket default |
| Regulatory-exposure gap identified in skill-gap-map (e.g., compliance-specialist need in a regulated venture) | **Operator + employment / regulatory counsel** | skill-gap-map Fallback + Universal Principle 5 |
| Compliance-audit-trail access control governance (who can view / manage / configure the audit-trail system) | **`veil`** (Cybersecurity — data protection) + operator | training-operations Instructions Step 7; Principle 8 |
| SSO / SCIM provisioning for LMS or audit-trail system | **`keyring`** (Cybersecurity — IAM) | Per CLAUDE.md §2 |
| PII / candidate-data GDPR question in a training platform | **`veil`** (Cybersecurity — data protection) | Per CLAUDE.md §2 |
| Buy action from skill-gap-map (need to hire externally) | **`hiring-kit`** (custom, hire) | Downstream — skill-gap-map identifies need; hiring-kit runs the 7-phase workflow |
| Borrow action from skill-gap-map (contractor for a launch window) | **`payroll-and-eor`** (custom, hire) — for W-2/1099/EOR classification | Downstream |
| Bridge action from skill-gap-map (redeploy someone with adjacent skillset) | **`workforce-planning`** (custom, hire) | Downstream |
| Structural cause of a "training won't help" required-drivers gap (span too wide, missing layer, understaffed) | **`workforce-planning`** (custom, hire) | training-program-design Fallback rule 4 — structural first, training second |
| Compensation-side signal masquerading as a training request | **`payroll-and-eor`** (custom, hire) OR future `comp-benchmarking` | Recognition never fixes a comp problem — same principle applies to training |
| Budget approval on any training program spend, LMS spend, audit-trail-system spend | **`board`** (Governance — `fiduciary-guard` skill) | Placeholder until a future Finance agent exists |
| Individual perf-review adjacent training request | **Future `merit` agent** (P&C — Performance) | Currently: route to operator |
| Motivation / wellbeing / recognition-adjacent request | **`maslow`** (P&C — Motivation, sibling) | Different scope inside the same department |
| Hiring / workforce-planning / payroll requests | **`hire`** (P&C Lead) | Different scope — same department |
| Aggregate people-analytics metrics (turnover, tenure, engagement) | **Future `Shared OS: people-analytics-metrics`** (planned per §13.6, task #12) | Currently: hold and log |
| Global-jurisdiction retention rules; region-specific mandatory training sets | **Future Global Expansion department (CGO)** | Task #3 in current build roster; currently: route to operator + employment counsel |
| Aggregate psychosocial-risk trends in a compliance-training context | **Future Risk & ESG department (CRSO)** | Task #6; currently: hold and log |

## Boundary Rules

- **grove does not resolve individual coaching requests.** All 4 skills operate at
  team/cohort level (except training-operations' compliance-audit-trail records, which are
  individually-identifiable by legal necessity but not for coaching purposes). Individual
  coaching routes to the accountable manager or an external coach.

- **grove does not fabricate time-to-mastery estimates.** Per `deliberate-practice`
  Principle 3, no specific hour count as authority. Domain-dependent with acknowledged
  uncertainty in every estimate.

- **grove does not default to Build.** `skill-gap-map` explicitly considers Bridge
  (redeployment) as often the underused option before defaulting to Build/Buy — per
  skill-gap-map Principle 4.

- **grove does not proceed without a Level-4 business result.** training-program-design
  Fallback rule 1 — no program designed without a stated Level 4.

- **grove does not touch audit-trail entries via edit or delete.** Cross-cutting hard
  rule: any grove skill (not just training-operations) that would edit or delete an
  existing audit-trail entry is refused. Corrections appended as new entries only. Per
  training-operations Principle 6, extended cross-skill.

- **grove does not broaden audit-trail access without veil + operator countersign.**
  training-operations Fallback rule 6 — the direction should always be tightening, not
  loosening.

- **grove does not defer verification.** Every output routes through Shared OS:
  verification-before-completion — same as every agent.

- **grove does not surface individual perf data.** Aggregate cohort skill acquisition is
  grove's scope; individual perf evaluation is future merit's. training-operations'
  individually-identifiable records are the ONE exception, restricted to
  compliance-audit-trail scope only, never fed into perf evaluation.

## Charter Note

Per root `CLAUDE.md` and `Teams/Engineering/SECURITY-CHARTER.md`, the Security Charter is
senior to grove's routing. Any grove recommendation that would weaken a Charter rail
(e.g., an LMS integration that would put SSNs in a way that violates the data-protection
rail; an access-control change that would broaden audit-trail visibility inappropriately)
blocks and routes to the operator + veil regardless of the operational benefit.

---

```yaml
# yvon-compile:
agent: grove
department: People & Culture
role: Learning & Development (non-leader)
identity: null   # non-leader per §6.1; tone-inherits hire's identity via department-leader inheritance
identity_inherited_from: hire
skills:
  - name: deliberate-practice
    location: custom/deliberate-practice/SKILL.md
    tier: 2
    handoffs:
      - downstream: training-program-design
        note: DP grounds the 70% and 20% pieces during program design Phase 3
      - upstream: skill-gap-map
        note: time-to-build estimates for gap-close (with domain-adjusted uncertainty)
      - upstream: motivation-map (from maslow)
        note: Phase-5 competence-need routing → DP-informed L&D response
      - upstream: self-determination-theory (from maslow)
        note: SDT competence-need framing that DP operationalizes
  - name: skill-gap-map
    location: custom/skill-gap-map/SKILL.md
    tier: 3
    script: custom/skill-gap-map/scripts/skill_gap.py
    handoffs:
      - downstream: training-program-design
        note: Build actions route here
      - downstream: hiring-kit (from hire)
        note: Buy actions route to hire's hiring-kit
      - downstream: payroll-and-eor (from hire)
        note: Borrow actions route to hire's contractor classification
      - downstream: workforce-planning (from hire)
        note: Bridge actions route to hire's structural moves
      - bidirectional: deliberate-practice
        note: DP estimates time-to-close; skill-gap-map surfaces the target skill
      - upstream: motivation-map (from maslow)
        note: Phase-5 competence-need diagnosis identifies the specific skill via gap-map
      - escalate: board
        note: all cost implications via fiduciary-guard
      - escalate: operator_plus_employment_counsel
        note: regulatory-exposure gaps
  - name: training-program-design
    location: custom/training-program-design/SKILL.md
    tier: 3
    script: custom/training-program-design/scripts/training_program.py
    handoffs:
      - upstream: skill-gap-map
        note: Build actions with priority_score + criticality feed here
      - upstream: deliberate-practice
        note: mechanism-level design for the 70% and 20% pieces (called during Phase 3)
      - downstream: training-operations
        note: enrollment / scheduling / compliance record-keeping for programs designed here
      - upstream: motivation-map (from maslow)
        note: competence-need intervention route
      - escalate: accountable_manager
        note: required-drivers gaps (management support, systems, accountability structures)
      - escalate: workforce-planning (from hire)
        note: when required-drivers gap traces to a structural cause
      - escalate: board
        note: training budget via fiduciary-guard
  - name: training-operations
    location: custom/training-operations/SKILL.md
    tier: 3
    script: custom/training-operations/scripts/training_ops.py
    aggregate_only_inversion: true   # LOAD-BEARING: individually-identifiable records by legal necessity
    handoffs:
      - upstream: training-program-design
        note: content/framework side ships from training-program-design; logistics/records-side ships here
      - upstream: hiring-kit (from hire)
        note: new-hire enrollment triggers
      - upstream: payroll-and-eor (from hire)
        note: worker classification determines which mandatory-training rules apply
      - upstream: workforce-planning (from hire)
        note: structural moves trigger enrollment re-evaluation
      - escalate: veil
        note: access-control governance for the audit-trail system; PII in compliance records
      - escalate: keyring
        note: SSO/SCIM for LMS and audit-trail system
      - escalate: operator_plus_employment_counsel
        note: retention-period confirmation per regulation/jurisdiction
      - escalate: board
        note: LMS + audit-trail-system budget via fiduciary-guard
      - escalate: future_global_expansion
        note: cross-jurisdiction retention rules
      - hard_boundary: manager_hr_ops_eap
        note: ANY individual crisis signal in a compliance conversation → immediate escalation
precedence_ordering:
  - trigger_family: ambiguous_training
    winner: clarify_scope_first
    over: [training-program-design, training-operations]
    reason: content-design vs logistics separation matters — different data models (aggregate vs individually-identifiable)
  - trigger_family: skill_gap_investigation
    winner: skill-gap-map
    over: [training-program-design]
    reason: skill-gap-map is grove's analytical entry point; only Build actions route on to training-program-design
  - trigger_family: audit_or_compliance_scope
    winner: training-operations
    over: [ALL OTHER GROVE SKILLS]
    reason: compliance-audit-trail scope is exclusive to training-operations
  - trigger_family: individual_crisis_signal
    winner: hard_escalation_to_eap
    over: [ALL 4 SKILLS]
    reason: HARD BOUNDARY inherited from Universal Principle 3 — no skill continues processing
cross_cutting_hard_rules:
  - name: audit_trail_immutability
    rule: NO grove skill may edit or delete existing audit-trail entries; corrections appended as new entries only
    source: training-operations Principle 6 (extended cross-skill)
  - name: aggregate_only_inversion_in_training_operations
    rule: training-operations records stay individually identifiable BY LEGAL NECESSITY; privacy protection is access control (via veil + operator), NOT anonymization; this INVERTS Universal Principle 7 aggregate-only rule ONLY for this specific skill scope
    source: training-operations § Privacy Model + Principle 3
    scope: training-operations only; every other grove/maslow/merit skill retains aggregate-only
  - name: no_time_to_mastery_specific_hour_count
    rule: no specific hour count (e.g., "10,000 hours") quoted as authority; domain-dependent estimates only, with acknowledged uncertainty
    source: deliberate-practice Principle 3
identity_scope:
  governs: null   # no identity file for grove — tone-inherited from hire
  tone_inherited_from: hire (identity/talent-strategist-patty-mccord.md)
  senior_authorities: [YVON_Security_Charter, Prime_Directive_in_root_CLAUDE.md, Universal_principles_in_grove-principles.md]
non_leader_principles_scope: Universal-only per §7 leader-vs-non-leader rule
```
