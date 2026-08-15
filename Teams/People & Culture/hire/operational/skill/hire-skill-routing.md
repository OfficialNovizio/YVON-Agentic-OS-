<!--
Operational: skill-routing file for hire (People & Culture / Lead) per §7.

Sourced from each skill's `## Boundaries with Other Skills` section — this file
consolidates them into one map. Governs WHICH skill fires and WHEN one hands off
to another. Does NOT govern tone or framing — that is the identity file
(identity/talent-strategist-patty-mccord.md) per §6.1 and §7 opening rule.

Structure/layout per §7 is universal across every agent's skill-routing file;
the actual routes below are unique to hire's specific 5-skill roster.

Machine-readable §14.5 yaml block at the end is what the compiler consumes.
Prose above stays canonical for human readers.
-->

# hire — Skill Routing

## Identity vs Routing (per §7)

hire's identity anchor is `identity/talent-strategist-patty-mccord.md`. It governs
**how** hire thinks and communicates — voice, framing, when to raise a hard conversation,
whether to accept the "we're a family" framing (no). It does NOT govern **which skill
fires** or **when one hands off to another** — that is what this file governs.

The compiler extracts the identity file's `## Core Traits` section into the "Voice"
block of every compiled skill for hire per §14.6. All non-leader P&C agents (maslow,
grove, merit) tone-inherit hire's identity but do not carry identity files of their own,
per §6.1.

Charter and Universal principles (see `operational/principles/hire-principles.md`
when built) remain senior to both identity and routing. Nothing in this file overrides
the YVON Security Charter or the Prime Directive.

## Skill Catalog

| Skill | Location | One-line purpose |
|---|---|---|
| `interview-prep` | `marketplace/` | Generates interview kits (competencies, questions, 1–4 rubric, panel, debrief template) from a scorecard. Anthropic knowledge-work-plugins source. |
| `hiring-kit` | `custom/` | The hiring workflow wrapper: 7 phases (scorecard → post → source → screen → interview → debrief → refs & offer). Owns everything except interview-question generation. |
| `ats-selection` | `custom/` | ATS platform choice (6-platform matrix), pipeline stage design, BARS scorecard calibration, D&I funnel reporting, take-home-test ethics, HRIS handoff. |
| `workforce-planning` | `custom/` | 4-phase SWP (current-state → demand-forecast → gap-analysis → action-plan), org-design (span/layers/reporting), FTE forecast (+ tested Python utility). |
| `payroll-and-eor` | `custom/` | Domestic payroll platform selection, W-2/1099/EOR/PEO classification matrix, international EOR (Deel/Remote/Oyster/Rippling Global), benefits, Carta handoff, compliance hotspots. |

Shared OS layer (inherited, not owned per §13.1): **`verification-before-completion`** —
binds hire on every output, same as every other agent in the fleet.

## Trigger Precedence (which skill fires when phrases overlap)

Highest specificity wins. Ties break in the order listed below.

| Operator says… | Fires | Rationale |
|---|---|---|
| "hire for [role]", "open a role", "job description for" | **hiring-kit** | Owns the full workflow; will call interview-prep at phase 5 as needed |
| "scorecard for [role]" | **hiring-kit** | Scorecard is Phase 1 of the workflow; hiring-kit produces it |
| "interview plan for", "interview questions for", "how should we interview", "scorecard for [rubric only]" | **interview-prep** | Direct hit on interview-prep's triggers; used when a scorecard already exists and only the kit is needed |
| "which ATS should we use", "Ashby vs Greenhouse", "audit our scorecards" (calibration side) | **ats-selection** | Platform / calibration is ats-selection's core |
| "set up hiring pipeline", "pipeline stages", "D&I funnel reporting" | **ats-selection** | Pipeline architecture and reporting |
| "take-home test paid or unpaid", "how long can a take-home be" | **ats-selection** | Take-home ethics section |
| "should we hire for this gap?", "hire vs upskill", "do we need to add a layer" | **workforce-planning** | Validates the req exists BEFORE hiring-kit opens it; may then route on |
| "workforce plan for", "headcount forecast", "FTE forecast", "span of control", "org design", "reorg" | **workforce-planning** | Direct hit |
| "Gusto vs Rippling", "set up payroll", "we hired someone in [country]" | **payroll-and-eor** | Payroll platform + international |
| "W-2 or 1099", "contractor vs employee", "EOR for international hire", "Deel vs Remote" | **payroll-and-eor** | Classification matrix |
| "should we make an offer to [candidate]", "reference check for [candidate]" | **hiring-kit** | Phase 7 of the workflow |
| Ambiguous "hiring" with no other cue | **workforce-planning** first, THEN hiring-kit | Validate req exists before opening it (§workforce-planning Principle 1) |

## Handoff Map (the flow between hire's own skills)

```
             ┌───────────────────────┐
             │  workforce-planning   │  (Should this req exist? What's the org shape?)
             └──────────┬────────────┘
                        │ req validated
                        ▼
             ┌───────────────────────┐          ┌───────────────────────┐
             │      hiring-kit       │◄────────►│    ats-selection      │
             │  (7-phase workflow)   │          │ (platform + pipeline) │
             └──┬─────────┬──────────┘          └───────────────────────┘
                │         │
        Phase 5 │         │ Phase 7 (post-accept)
                ▼         ▼
   ┌────────────────┐  ┌────────────────────┐
   │ interview-prep │  │  payroll-and-eor   │
   │ (interview kit)│  │ (class + platform) │
   └────────────────┘  └────────────────────┘
```

Every arrow above is a two-way information exchange, not a one-way call — e.g.,
`ats-selection`'s D&I funnel report can retroactively surface a gap in `hiring-kit`'s
Phase 3 sourcing, and the two skills reconcile.

## Cross-Agent Escalation Routing

Escalations LEAVE hire and route to the named target. hire does not resolve any of these
in-scope.

| Trigger | Route to | Notes |
|---|---|---|
| Candidate PII / SSN / payroll-API data exposure question | `veil` (Cybersecurity — data protection) | Per CLAUDE.md §2 |
| ATS integration app-security review (SSO webhook, sourcing-tool wiring) | `aegis` (Engineering — app security) | Per CLAUDE.md §2 |
| SSO / SCIM identity provisioning for payroll platform | `keyring` (Cybersecurity — IAM) | Per CLAUDE.md §2 |
| HR-data schema design (custom tables extending payroll data) | `dana` (Engineering — Data) | Per CLAUDE.md §2 |
| Budget approval on any spend crossing the operator threshold | `board` (Governance — fiduciary-guard skill) | Placeholder until a future Finance agent exists |
| Governance approval for structural reorg or reporting-line change | `board` (Governance — constitution-enforcement + strategic-veto) | Per CLAUDE.md §2 |
| Employment-law question (layoffs, protected-class impact, wage claims) | Operator + employment counsel | No CLO agent in YVON |
| Immigration / visa / work-authorization | Operator + immigration counsel | Outside YVON fleet scope |
| Company-formation before payroll setup | Operator + incorporation counsel | Outside YVON fleet scope |
| Tax-consequence decision (RSU vest timing, multi-state nexus) | Operator + tax counsel | Outside YVON fleet scope |
| Sensitive candidate-demographics data reaching the interview loop | Halt loop + escalate to operator | Aggregate D&I data is fine; individual-level is not |
| Motivation / wellbeing / recognition topics | `maslow` (P&C — Motivation, sibling) | Future — same department, different scope |
| Learning & Development / training design | `grove` (P&C — L&D, sibling) | Future — same department |
| Performance management / OKR / comp cycles | `merit` (P&C — Performance, sibling) | Future — same department |
| People-analytics metrics (turnover, cost-per-hire, engagement) | `Shared OS: people-analytics-metrics` | Future shared skill per §13.6 |

## Boundary Rules

- **hire does not do interview-question generation itself.** That is `interview-prep`. Even if the operator asks for "interview questions for X" while hiring-kit is mid-run, the questions come from interview-prep, not from hire's general reasoning. This preserves the marketplace skill's provenance and lets it update independently.

- **hire does not resolve close-call worker classifications.** Per `payroll-and-eor` Principle 4 and Fallback rules, close-call W-2/1099 or California AB5 branches route to operator + employment counsel. The identity's "just have the direct conversation" default (per identity §Blind Spots point 5) is explicitly overridden by this rule.

- **hire does not sign off on ATS security integrations.** Even if the platform's security posture looks fine, `aegis` reviews before go-live. Same rule for identity provisioning → `keyring`.

- **hire does not open a req without a scorecard AND a comp band.** Both are Phase 1 gates in `hiring-kit`; the operator cannot ask hiring-kit to "just post it" without them.

- **hire does not surface individual-level demographic data.** Aggregate D&I funnel reporting via `ats-selection` is expected; per-candidate demographic data reaching the interview loop is a hard halt.

- **hire does not defer verification.** Every output routes through `Shared OS: verification-before-completion` before it ships — no exceptions, per §5 discipline and the Prime Directive.

## Charter Note

Per root `CLAUDE.md` and `Teams/Engineering/SECURITY-CHARTER.md`, the Security Charter is
senior to hire's routing. Any hire recommendation that would weaken a Charter rail (e.g., a
payroll platform choice that stores SSNs in a way that violates the Charter's data-protection
rail) blocks and routes to the operator regardless of the operational benefit.

---

```yaml
# yvon-compile:
agent: hire
department: People & Culture
role: Lead
identity: identity/talent-strategist-patty-mccord.md
skills:
  - name: interview-prep
    location: marketplace/interview-prep/SKILL.md
    tier: 2
    handoffs:
      - upstream: hiring-kit
        note: hiring-kit provides the scorecard as input at Phase 5
  - name: hiring-kit
    location: custom/hiring-kit/SKILL.md
    tier: 3
    handoffs:
      - upstream: workforce-planning
        note: pre-check that the req should exist
      - downstream: interview-prep
        note: Phase 5 interview kit generation
      - downstream: ats-selection
        note: Phase 3 (source) and Phase 5 (work-sample decision)
      - downstream: payroll-and-eor
        note: Phase 7 post-accepted-offer classification and onboarding
      - downstream: shared_os/verification-before-completion
        note: evidence gate at Phases 2, 6, 7
  - name: ats-selection
    location: custom/ats-selection/SKILL.md
    tier: 3
    handoffs:
      - upstream: hiring-kit
        note: hiring-kit decides which req; ats-selection decides which platform for it
      - upstream: workforce-planning
        note: headcount + hiring-velocity forecast feeds intake question 2
      - escalate: veil
        note: PII / candidate-data GDPR
      - escalate: aegis
        note: app-security review of ATS integrations
  - name: workforce-planning
    location: custom/workforce-planning/SKILL.md
    tier: 3
    handoffs:
      - downstream: hiring-kit
        note: any "hire" action from the action-plan routes to hiring-kit
      - escalate: board
        note: budget validation (fiduciary-guard) + governance approval of structural change (constitution + strategic-veto)
  - name: payroll-and-eor
    location: custom/payroll-and-eor/SKILL.md
    tier: 3
    handoffs:
      - upstream: hiring-kit
        note: Phase 7 accepted offer → classification and onboarding
      - upstream: workforce-planning
        note: geographic distribution forecast feeds SIZE step
      - escalate: veil
        note: SSN / PII / payroll-API data
      - escalate: keyring
        note: SSO / SCIM identity provisioning
      - escalate: dana
        note: HR data schema design for custom-table extensions
      - escalate: board
        note: spend approval (fiduciary-guard) when EOR/PEO cost crosses threshold
precedence_ordering:
  - trigger_family: hiring_workflow
    winner: hiring-kit
    over: [interview-prep, ats-selection]
    reason: hiring-kit owns the workflow; specific sub-triggers still route to their specialist
  - trigger_family: req_should_exist
    winner: workforce-planning
    over: [hiring-kit]
    reason: validate req exists BEFORE opening it (workforce-planning Principle 1)
  - trigger_family: worker_classification
    winner: payroll-and-eor
    over: [hiring-kit]
    reason: classification is upstream of onboarding; hiring-kit routes to payroll-and-eor post-accept
identity_scope:
  governs: [voice, framing, proactive_surfacing]
  does_not_govern: [which_skill_fires, when_handoff_happens, whether_to_fabricate]
  senior_authorities: [YVON_Security_Charter, Prime_Directive_in_root_CLAUDE.md, Universal_principles_in_hire-principles.md]
```
