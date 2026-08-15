<!--
Operational: commands file for hire (People & Culture / Lead) per §7 commands/.

§7 rule: document structure/layout is universal across every agent's commands file (same
table shape, same sections). Actual triggers, shortcuts, and precedence rules inside are
unique to hire's 5-skill roster.

Trigger content pulled verbatim from each skill's `## When to Use` section — this file
consolidates them, adds slash-style shortcuts as convenience, and states precedence when
triggers overlap.
-->

# hire — Commands

Natural-language triggers, slash shortcuts, and precedence for hire (People & Culture / Lead).
The trigger phrases below come from each skill's `## When to Use` section — this file does
not invent new triggers, it consolidates them.

## Slash Shortcuts

Convenience layer for common single-skill invocations. Slash shortcuts are optional — every
skill also fires on the natural-language triggers in the tables below.

| Shortcut | Fires | One-line purpose |
|---|---|---|
| `/hire-req [role]` | `workforce-planning` → (if req validated) `hiring-kit` Phase 1 | Validate whether a req should exist, then start the scorecard if yes |
| `/hire-scorecard [role]` | `hiring-kit` Phase 1 | Build the role scorecard directly (skip req validation — for roles already validated) |
| `/hire-jd [role]` | `hiring-kit` Phase 2 | Draft the JD from an existing scorecard (blocks if no scorecard) |
| `/hire-interview [role]` | `interview-prep` | Generate the interview kit (competencies + Qs + rubric + panel + debrief template) from a scorecard |
| `/hire-loop [role]` | `hiring-kit` Phases 3–7 (source → screen → interview → debrief → refs → offer) | Run the hiring loop end-to-end |
| `/hire-debrief [candidate]` | `hiring-kit` Phase 6 | Structured debrief with threshold check |
| `/hire-refs [candidate]` | `hiring-kit` Phase 7 (reference part) | Structured reference check on top-2 finalists |
| `/hire-offer [candidate]` | `hiring-kit` Phase 7 (offer part) → `payroll-and-eor` (post-accept classification) | Offer memo + classification handoff |
| `/hire-ats [scenario]` | `ats-selection` | ATS intake (3 questions) → topic routing |
| `/hire-plan [venture or dept]` | `workforce-planning` | Strategic workforce plan (4-phase cycle) |
| `/hire-orgcheck [team]` | `workforce-planning` § Org Design | Span-of-control + layer + reporting-line evaluation |
| `/hire-fte` | `workforce-planning` scripts/workforce_calculator.py | FTE / span / gap / scenario arithmetic |
| `/hire-classify [worker]` | `payroll-and-eor` Topic B | W-2 / 1099 / EOR / PEO classification matrix |
| `/hire-eor [country]` | `payroll-and-eor` Topic C | International EOR platform recommendation |
| `/hire-payroll [context]` | `payroll-and-eor` Topic A | Domestic payroll platform selection |
| `/hire-benefits [team context]` | `payroll-and-eor` Topic D | Benefits stack recommendation |
| `/hire-carta [context]` | `payroll-and-eor` Topic E | Carta-payroll handoff timing |
| `/hire-compliance [scope]` | `payroll-and-eor` Topic F | Multi-state / AB5 / FLSA / PFML / PII audit |

## Multi-Skill Chain Shortcuts

Common flows that touch more than one skill in sequence.

| Chain shortcut | Sequence | Purpose |
|---|---|---|
| `/hire-new-role [role]` | `workforce-planning` (req validate) → `hiring-kit` Phase 1 (scorecard) → `hiring-kit` Phase 2 (JD) → `interview-prep` (kit) | End-to-end setup for a new role, ready for `/hire-loop` |
| `/hire-close-candidate [candidate]` | `hiring-kit` Phase 6 (debrief + threshold check) → `hiring-kit` Phase 7 (refs + offer) → `payroll-and-eor` (post-accept classification + platform onboarding) | Final-stage close for a candidate who cleared phone screen + interview loop |
| `/hire-audit [scope]` | `ats-selection` (scorecard calibration + take-home ethics + D&I funnel) → `payroll-and-eor` (compliance hotspots) | Combined hiring-practice audit |
| `/hire-onboard-international [country + role]` | `workforce-planning` (headcount validation) → `payroll-and-eor` Topic C (EOR-vs-entity) → `hiring-kit` (req + scorecard) → `interview-prep` (kit) | International hire with EOR decision upfront |

Chains still respect §0.2 one-artifact-at-a-time when a stop-and-review is warranted;
they are convenience routes, not batch approval.

## Natural-Language Triggers (by skill)

Pulled verbatim from each skill's `## When to Use` section.

### `interview-prep` (marketplace)

| Trigger phrase | Notes |
|---|---|
| "interview plan for [role]" | Direct hit |
| "interview questions for [role]" | Direct hit |
| "how should we interview [candidates]" | Direct hit |
| "scorecard for [role]" (rubric-only sense) | See precedence below — if paired with "hire" or "open a role", `hiring-kit` fires instead |
| "preparing to interview candidates" | Direct hit |

### `hiring-kit` (custom)

| Trigger phrase | Notes |
|---|---|
| "hire for [role]" | Owns the workflow |
| "open a role" | Owns the workflow |
| "we need to hire a [role]" | Owns the workflow |
| "job description for" / "write a JD" | Phase 2 |
| "scorecard for [role]" (workflow sense — with hire intent) | Phase 1; wins over `interview-prep` when hire intent present |
| "hiring loop for" / "interview loop for" | Phases 3–7 |
| "reference check for [candidate]" | Phase 7 (reference sub-step) |
| "should we make an offer to [candidate]" | Phase 7 (offer decision) |

### `ats-selection` (custom)

| Trigger phrase | Notes |
|---|---|
| "which ATS should we use?" / "ATS comparison" | Topic A |
| "Ashby vs Greenhouse" / "Rippling vs Workable" / "are we outgrowing Workable?" | Topic A |
| "audit our scorecards" / "our scorecards aren't being used consistently" | Topic C (calibration) |
| "set up our hiring pipeline" / "how many stages should we have?" / "pipeline stage design" | Topic B |
| "D&I funnel reporting" / "EEOC funnel diversity metrics" | Topic D |
| "is our take-home test too long?" / "should we pay for take-home tests?" / "take-home test paid or unpaid" | Topic E |
| "ATS to HRIS handoff" / "ATS to Rippling offer flow" | Topic F (deferred — no HRIS-config skill yet) |
| "calibration session" / "structured interviews" (calibration side) | Topic C — interview generation itself stays with `interview-prep` |

### `workforce-planning` (custom)

| Trigger phrase | Notes |
|---|---|
| "workforce plan for [venture / dept / group]" | Direct hit |
| "headcount forecast" / "FTE forecast" for [growth target / launch] | Direct hit |
| "span of control" / "is our span healthy?" / "do we have too many layers?" | Org-design side |
| "org design" / "reorg" / "change reporting lines" | Org-design side; may route to `board` for governance |
| "hire vs upskill for this gap?" | Action-plan branch |
| "do we need another team lead?" / "add a manager layer?" | Structural gap detection |
| "should we hire for this gap?" | Pre-check before `hiring-kit` opens the req |

### `payroll-and-eor` (custom)

| Trigger phrase | Notes |
|---|---|
| "Gusto vs Rippling — which should we use?" / "Rippling vs Justworks" | Topic A |
| "set up payroll" | Topic A |
| "we just hired our first employee in [country]" / "how do we pay them?" | Topic C (EOR) or Topic B (classification) depending on setup |
| "is [person] a 1099 contractor or W-2 employee?" / "should we reclassify?" | Topic B — routes to counsel on close-calls |
| "we need to hire in Germany / UK / Brazil — EOR or our own entity?" | Topic C |
| "we just closed [round] — do we need Justworks for benefits?" | Topic D |
| "should we set up Carta before or after payroll?" | Topic E |
| "multi-state payroll compliance" | Topic F |
| "we're moving from Gusto to Rippling — what's the process?" | Topic G (migration) |
| "we have N US employees and M international contractors — one platform or split?" | Topic A + B + C combined |

## Precedence Rules (when triggers overlap)

Full precedence lives in `operational/skill/hire-skill-routing.md` § Trigger Precedence.
The load-bearing calls, restated here:

| Overlap | Winner | Reason |
|---|---|---|
| "scorecard for [role]" with any "hire" or "open a role" intent | `hiring-kit` | Scorecard is Phase 1 of the workflow; `hiring-kit` owns it and calls `interview-prep` at Phase 5 |
| "scorecard for [role]" with no other context (rubric only) | `interview-prep` | Direct hit on `interview-prep`'s triggers |
| Ambiguous "hiring" with no other cue | `workforce-planning` first, then `hiring-kit` | Validate req exists before opening it (Universal Principle 2) |
| "structured interviews" (calibration side) | `ats-selection` Topic C | Interview generation itself stays with `interview-prep` |
| "worker classification" or "W-2 vs 1099" | `payroll-and-eor` Topic B | Not `hiring-kit`; classification is post-accept |
| "should we make an offer" | `hiring-kit` Phase 7 → then `payroll-and-eor` (post-accept) | Two-skill chain, in this order |

## Not-a-Command (routes to another agent)

Phrases that sound like they might trigger hire, but route elsewhere per hire-skill-routing's
Cross-Agent Escalation Routing table.

| Trigger phrase | Route to | Rationale |
|---|---|---|
| "candidate PII exposure" / "GDPR right-to-erasure" / "SSN in payroll API" | **veil** (Cybersecurity — data protection) | Data-protection scope, not hire |
| "app-security review of our ATS integration" / "SSO webhook security" | **aegis** (Engineering — app security) | App-security scope |
| "SSO / SCIM setup for our payroll platform" | **keyring** (Cybersecurity — IAM) | IAM scope |
| "custom HR-data tables in [database]" / "HR data schema" | **dana** (Engineering — Data) | Data-engineering scope |
| "approve this spend" / "budget for this hire" (crossing threshold) | **board** (Governance — fiduciary-guard) | Spend-approval gate; hire produces estimate, board approves |
| "governance approval for this reorg" | **board** (Governance — constitution + strategic-veto) | Structural-change gate |
| "close-call California AB5 classification" / "layoff / RIF" / "wage claim" | **Operator + employment counsel** | Legal fence — no CLO agent in YVON |
| "visa strategy" / "work-authorization for [country]" | **Operator + immigration counsel** | Outside YVON fleet |
| "when does this RSU vest and what withholding" / "multi-state payroll tax nexus" | **Operator + tax counsel** | Outside YVON fleet |
| "company formation before setting up payroll" | **Operator + incorporation counsel** | Outside YVON fleet |
| "team morale" / "burnout risk" / "recognition program" | **maslow** (P&C — Motivation, sibling) | Different scope inside the same department |
| "training program" / "L&D plan" / "learning path for [role]" | **grove** (P&C — L&D, sibling) | Different scope inside the same department |
| "performance review" / "OKR cascade" / "comp cycle" / "9-box" / "succession" | **merit** (P&C — Performance, sibling) | Different scope inside the same department |
| "time-to-fill" / "cost-per-hire" / "first-year attrition" / "engagement metrics" | **Shared OS: people-analytics-metrics** (planned) | Shared skill per §13.6 — not built yet; hire references it but does not own it |
| "interview question generation" (when a scorecard already exists) | `interview-prep` (marketplace, within hire) | Same-agent routing; noted here because operators sometimes phrase it as if outside |

## Interaction Notes

- **Slash shortcuts are optional.** hire fires on natural-language triggers too; the shortcuts
  are for operators who prefer explicit routing.
- **Chain shortcuts don't skip stops.** `/hire-new-role` is convenience for the sequence,
  not blanket approval to batch-write outputs. §0.2 still applies — each phase produces
  its own artifact and each artifact gets its own review moment when the operator asks for
  one.
- **Every command runs through Universal Principle 8** (verification-before-completion)
  before its output ships. No exceptions.
- **Charter-conflict routes to operator.** If any command would produce a Charter-conflicting
  output (e.g., a payroll recommendation that violates the data-protection rail), hire
  blocks and escalates rather than executing.

## Meta

- Compiled per §14.2 into the tier-2+ preamble of each of hire's skills as the trigger table.
- Structure (same section shape as every other agent's commands file) matches the §7
  universal layout; triggers/shortcuts/precedence are hire-specific.
- Non-leader P&C agents (maslow, grove, merit) will get their own commands files with the
  same layout and their own triggers/shortcuts when built.
