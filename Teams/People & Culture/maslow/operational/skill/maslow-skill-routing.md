<!--
Operational: skill-routing file for maslow (People & Culture / Motivation) per §7.

Sourced from each of maslow's 4 skills' `## Boundaries with Other Skills` sections —
this file consolidates them into one map.

Structure/layout per §7 is universal across every agent's skill-routing file; the actual
routes below are unique to maslow's 4-skill roster.

Per §7 opening rule: for non-leader agents, this file explicitly notes "no identity layer"
(unlike hire's skill-routing which points to an identity file). maslow inherits hire's
identity (Patty McCord — talent-strategist-patty-mccord.md) via department-leader
inheritance per §6.1 — it does not hold its own identity file.

Machine-readable §14.5 yaml block at the end is what the compiler consumes.
-->

# maslow — Skill Routing

## Identity Note (per §7 opening rule)

**No identity layer for maslow.** maslow is a non-leader agent in the People & Culture
department. Per §6.1, only the department leader (hire) holds identity content; non-leader
agents tone-inherit through department-leader inheritance. The identity anchor governing
maslow's voice is hire's `identity/talent-strategist-patty-mccord.md` (Patty McCord —
Netflix Chief Talent Officer 1998–2012).

maslow's `identity/` folder is present per §7.0a's folder-structure-universality rule but
contains only a README explaining the intentional emptiness. See `identity/README.md`.

Charter and Universal principles (see `operational/principles/maslow-principles.md` when
built) remain senior to routing. maslow's principles are **Universal-only** per §7 — no
Identity-Flavored section, since non-leaders have no identity of their own.

## Skill Catalog

| Skill | Location | One-line purpose |
|---|---|---|
| `self-determination-theory` | `custom/` | Theoretical framework — Deci & Ryan's 3-need (autonomy/competence/relatedness) diagnostic + autonomous-vs-controlled motivation continuum. Provides framing for motivation-map's operational cadence. |
| `motivation-map` | `custom/` | Operational sibling to SDT — runs the quarterly SDT-need pulse, computes aggregate burnout early-warning flag, selects interventions from a matched menu. |
| `wellbeing-monitoring` | `custom/` + `scripts/` | Aggregate wellbeing/burnout-signal monitoring — eNPS + workload signals (overtime/absence/EAP). Includes tested Python utility (`wellbeing_monitor.py`). |
| `recognition-program` | `custom/` + `scripts/` | Structured recognition/rewards program design + monitoring — categories, point tiers, fast peer + manager pathway, equity monitoring. Includes tested Python utility (`recognition_program.py`). |

Shared OS layer (inherited, not owned per §13.1): **`verification-before-completion`** —
binds maslow like every agent; no output ships without evidence.

## Trigger Precedence (which skill fires when phrases overlap)

Highest specificity wins. Ties break in the order listed below.

| Operator says… | Fires | Rationale |
|---|---|---|
| "motivation theory", "autonomy competence relatedness", "intrinsic vs extrinsic", "SDT" | **self-determination-theory** | Direct hit — theory framework |
| "run the motivation pulse", "quarterly needs pulse", "map the motivation gap" | **motivation-map** | Operational cadence — owns the pulse |
| "why is this team demotivated", "team morale check", "burnout check" | **motivation-map** first, calls SDT for framing | Ambiguous — motivation-map owns the diagnostic entry, SDT provides theory |
| "pulse survey for", "eNPS", "wellbeing check", "workload trend", "aggregate wellbeing monitoring" | **wellbeing-monitoring** | Wellbeing/signals scope — distinct from motivation-map's SDT-need pulse |
| "psychosocial risk", "ISO 45003" | **wellbeing-monitoring** | Governance framing owned by wellbeing-monitoring |
| "design a recognition program", "employee recognition", "peer-to-peer recognition", "rewards program", "recognition equity audit" | **recognition-program** | Direct hit |
| "burnout" ambiguous (motivation vs wellbeing) | **wellbeing-monitoring** for signals; **motivation-map** if the request is about the SDT-need cause of the burnout | Wellbeing owns aggregate signals; motivation-map owns the SDT-need cause |
| "recognition program for morale" (no diagnosis attached) | **motivation-map** first (Phase 5 diagnosis), then routes to recognition-program only if diagnosis = relatedness starved + substrate present | Overjustification-effect rule from SDT Principle 4 — enforced by requiring diagnosis before recognition |

## Handoff Map (the flow between maslow's own skills)

```
                    ┌──────────────────────────────┐
                    │  self-determination-theory   │  (theoretical framing)
                    │       (custom / maslow)      │
                    └──────────────┬───────────────┘
                                   │ theory input
                                   ▼
                    ┌──────────────────────────────┐
                    │        motivation-map        │  (quarterly SDT pulse +
                    │       (custom / maslow)      │   burnout flag + intervention
                    └──┬────────────┬────────────┬─┘   menu selection)
                       │            │            │
                       │            │            │ Phase 5 route ONLY if:
                       │            │            │  diagnosis = relatedness starved
                       │            │            │  AND substrate present
                       │            │            ▼
        Bidirectional  │            │  ┌───────────────────┐
        corroboration  │            │  │ recognition-program│
                       │            │  │  (custom / maslow) │
                       ▼            │  └───────────────────┘
     ┌─────────────────────┐        │
     │ wellbeing-monitoring│◄───────┘
     │  (custom / maslow)  │  (Bidirectional: motivation-map calls for
     │  + wellbeing_monitor│   workload/absence corroboration;
     │        .py utility) │   wellbeing-monitoring calls motivation-map
     └──────────┬──────────┘   for SDT framing of a burnout flag)
                │
                │ HARD BOUNDARY:
                │ ANY individual crisis signal → immediate escalation to
                │ manager + HR Ops + EAP. NEVER handled inside maslow.
                ▼
     [ external emergency / manager / HR Ops / EAP escalation lane ]
```

Every arrow above is a two-way information exchange (except the hard-boundary escalation,
which is one-way OUT). The overjustification-effect rule (SDT Principle 4, echoed in
motivation-map Principle 6) is enforced at the motivation-map → recognition-program
handoff: recognition never fires as a fix for autonomy- or competence-starvation.

## Cross-Agent Escalation Routing

Escalations LEAVE maslow and route to the named target. maslow does not resolve any of
these in-scope.

| Trigger | Route to | Notes |
|---|---|---|
| ANY individual crisis, self-harm, or serious personal distress signal via any channel | **Manager + HR Ops + EAP** | HARD BOUNDARY — immediate, no exceptions, no operator overrides. See wellbeing-monitoring Fallback rule 1 and Principle 3. |
| Individual mental-health assessment or diagnosis request | **Operator + external professional** | maslow is aggregate-only across all 4 skills; individual mental-health work is fully out of scope. |
| Structural cause traced from a burnout / motivation signal (span too wide, missing layer, understaffed team) | **`workforce-planning`** (custom, hire) | Downstream structural fix — the primary route for workload-driven RED flags |
| Compensation, pay-equity, benefits questions | **`payroll-and-eor`** (custom, hire) OR future `comp-benchmarking` | Recognition never fixes a comp problem — hard route |
| Employment-law questions (protected-class impact on a wellbeing report, harassment signal in a survey comment) | **Operator + employment counsel** | Legal fence — no CLO agent in YVON |
| Budget approval on any recognition-program cost or program-refresh spend | **`board`** (Governance — `fiduciary-guard` skill) | Placeholder until a future Finance agent exists |
| Individual perf-review adjacent motivation questions | **Future `merit` agent** (P&C — Performance) | Currently: route to operator |
| Learning & Development interventions (competence-starvation cases) | **Future `grove` agent** (P&C — L&D) | Currently: recommend the direction; note grove-not-yet-built in output |
| Aggregate psychosocial-risk trends per ISO 45003 governance | **Future Risk & ESG department lead** (CRSO) | Task #6 in current build roster; currently: hold and log for future routing |
| PII exposure in survey / recognition-platform integrations | **`veil`** (Cybersecurity — data protection) | Per CLAUDE.md §2 |
| SSO / SCIM provisioning for recognition platform | **`keyring`** (Cybersecurity — IAM) | Per CLAUDE.md §2 |
| Recognition-platform / survey-platform admin actions (configuration, permission grants) | **Operator** | maslow produces the design and audit, not the platform-admin configuration |
| Aggregate people-metrics that don't fit motivation/wellbeing/recognition | **Future `Shared OS: people-analytics-metrics`** (planned per §13.6, task #12) | Currently: hold and log; task #12 will build |

## Boundary Rules

- **maslow does not assess, diagnose, or counsel any individual.** All 4 skills operate at
  the aggregate/cohort level, always. This is inherited across every skill via Universal
  Principle 7 (aggregate-only for people data) and reinforced hard in wellbeing-monitoring
  Principle 3 and motivation-map Principle 8.

- **maslow never ships recognition as a comp fix or a burnout fix.** Recognition-program's
  Principle 5 blocks this; motivation-map's overjustification-effect rule (Principle 6)
  routes recognition only when the diagnosis actually points to relatedness starvation
  with the substrate present.

- **maslow's individual-crisis escalation is a hard STOP.** Any individual crisis signal
  reaching any of the 4 skills triggers the wellbeing-monitoring Fallback: manager + HR
  Ops + EAP, immediately, no exceptions. No skill continues processing after this
  escalation triggers.

- **maslow's pulse questions and program designs never leak identifiable individual data.**
  Minimum-group-size suppression applies to any segmented figure across all 4 skills.

- **maslow does not resolve structural burnout.** A workload-driven pattern routes to
  `workforce-planning` (custom, hire) — maslow provides the aggregate signal, hire's
  workforce-planning provides the structural fix.

- **maslow does not defer verification.** Every output routes through Shared OS:
  verification-before-completion before shipping — same as every agent.

## Charter Note

Per root `CLAUDE.md` and `Teams/Engineering/SECURITY-CHARTER.md`, the Security Charter is
senior to maslow's routing. Any maslow recommendation that would weaken a Charter rail
(e.g., a recognition-platform integration that exposes SSNs) blocks and routes to the
operator regardless of the wellbeing benefit.

---

```yaml
# yvon-compile:
agent: maslow
department: People & Culture
role: Motivation (non-leader)
identity: null   # non-leader per §6.1; tone-inherits hire's identity via department-leader inheritance
identity_inherited_from: hire
skills:
  - name: self-determination-theory
    location: custom/self-determination-theory/SKILL.md
    tier: 2
    handoffs:
      - downstream: motivation-map
        note: motivation-map calls SDT skill for theoretical framing of pulse diagnostics
      - downstream: wellbeing-monitoring
        note: SDT lens when a burnout pattern points to need-frustration
      - downstream: recognition-program
        note: SDT diagnostic tells recognition-program which need a program category satisfies
  - name: motivation-map
    location: custom/motivation-map/SKILL.md
    tier: 3
    handoffs:
      - upstream: self-determination-theory
        note: theoretical framing during Phase 4 diagnosis
      - bidirectional: wellbeing-monitoring
        note: wellbeing signals corroborate; motivation-map's flag calls wellbeing for workload check
      - downstream: recognition-program
        note: Phase 5 route ONLY when relatedness starved AND substrate present (overjustification-effect rule)
      - downstream: workforce-planning
        note: structural cause routing when starved need traces to org-design/staffing
      - escalate: hire
        note: aggregate risk flag routed to hire lead
  - name: wellbeing-monitoring
    location: custom/wellbeing-monitoring/SKILL.md
    tier: 3
    handoffs:
      - bidirectional: motivation-map
        note: workload signal corroboration; SDT framing for burnout flags
      - downstream: workforce-planning
        note: primary route for RED-flag / workload-elevated signals
      - downstream: recognition-program
        note: morale findings that suggest a relational-gap fix
      - escalate: risk_and_esg_future
        note: aggregate psychosocial-risk trends per ISO 45003 governance when Risk & ESG dept comes online
      - hard_boundary: manager_hr_ops_eap
        note: ANY individual crisis signal → immediate escalation, no exceptions
  - name: recognition-program
    location: custom/recognition-program/SKILL.md
    tier: 3
    handoffs:
      - upstream: motivation-map
        note: fires only when Phase 5 diagnosis routes here per overjustification-effect rule
      - upstream: self-determination-theory
        note: overjustification-effect rule (Principle 4) governs when recognition fires
      - bidirectional: wellbeing-monitoring
        note: morale-refresh signals in; individual-crisis-in-comment escalates out
      - escalate: board
        note: budget approval via fiduciary-guard (placeholder until Finance agent)
      - escalate: merit_future
        note: hr-strategy-alignment scorecard feed-back when merit exists
precedence_ordering:
  - trigger_family: motivation_diagnostic
    winner: motivation-map
    over: [self-determination-theory]
    reason: motivation-map owns the operational entry and calls SDT for framing
  - trigger_family: burnout_signal
    winner: wellbeing-monitoring
    over: [motivation-map]
    reason: wellbeing owns aggregate signals; motivation-map owns SDT-need cause of the signal
  - trigger_family: recognition_request
    winner: motivation-map
    over: [recognition-program]
    reason: motivation-map's Phase 5 diagnosis gates recognition-program firing (overjustification-effect rule)
  - trigger_family: individual_crisis_signal
    winner: hard_escalation_to_eap
    over: [ALL 4 SKILLS]
    reason: HARD BOUNDARY — no skill continues processing; immediate escalation to manager + HR Ops + EAP
identity_scope:
  governs: null   # no identity file for maslow — tone-inherited from hire per §6.1
  tone_inherited_from: hire (identity/talent-strategist-patty-mccord.md)
  senior_authorities: [YVON_Security_Charter, Prime_Directive_in_root_CLAUDE.md, Universal_principles_in_maslow-principles.md]
non_leader_principles_scope: Universal-only per §7 leader-vs-non-leader rule
```
