<!--
Operational: commands file for merit (People & Culture / Performance Management)
per §7 commands/.

§7 rule: document structure/layout is universal across every agent's commands file
(same table shape, same sections). Actual triggers, shortcuts, and precedence rules
inside are unique to merit's 4-skill roster.

Trigger content pulled verbatim from each skill's `## When to Use` section — this file
consolidates, not invents.
-->

# merit — Commands

Natural-language triggers, slash shortcuts, and precedence for merit (People & Culture /
Performance Management). Triggers come from each skill's `## When to Use` section.

## Slash Shortcuts

Convenience layer for single-skill invocations. Optional — natural-language triggers
fire the same skills.

| Shortcut | Fires | One-line purpose |
|---|---|---|
| `/merit-feedback [context]` | `feedback-methods` full skill | Full SBI + Radical Candor prep for a feedback conversation |
| `/merit-sbi-draft [feedback context]` | `feedback-methods` § Instructions Phase 2 | Draft SBI (Situation-Behavior-Impact) message with anti-pattern checks |
| `/merit-quadrant [recent pattern]` | `feedback-methods` § Instructions Phase 1 | Diagnose current Radical Candor quadrant + recommended shift |
| `/merit-solicit [manager context]` | `feedback-methods` § Instructions Phase 3 | Solicit-upward-first opener for a manager preparing downward feedback |
| `/merit-praise [observation]` | `feedback-methods` § Instructions Phase 6 | Specific SBI-format praise (not vague "great job") |
| `/merit-okr [team or person]` | `performance-frame` § Instructions Phase 1 | Draft 3–5 individual Objectives + 2–4 KRs traceable to vista's company OKRs |
| `/merit-mid-cycle [team]` | `performance-frame` § Instructions Phase 2 | Written 15-min per-person mid-cycle GREEN/AMBER/RED status |
| `/merit-review [person]` | `performance-frame` § Instructions Phase 3 | End-of-cycle written evidence-based review (draft, share 24-48hr before conversation) |
| `/merit-synthesis [person + 4 quarters]` | `performance-frame` § Instructions Phase 4 | Year-end synthesis + pattern-flag routing |
| `/merit-9box [team]` | `succession-planning` § Instructions Phase 3 + `succession_planning.py` | 9-box performance × potential placement for a team |
| `/merit-readiness [candidate + target role]` | `succession-planning` § Instructions Phase 4 | Readiness assessment (Ready Now / 1-2yr / 3-5yr / Not Identified) |
| `/merit-bench [critical role]` | `succession-planning` § Instructions Phase 5 + `succession_planning.py` `bench_strength_score()` + `risk_flag()` | Bench-strength score + risk flag per critical role |
| `/merit-critical-roles [venture / department]` | `succession-planning` § Instructions Phase 1 | Identify critical roles by continuity risk (not seniority) |
| `/merit-development-plan [successor]` | `succession-planning` § Instructions Phase 6 | Stretch experience + grove routing (skill-gap-map + training-program-design) |
| `/merit-lattice [person]` | `succession-planning` § Instructions Phase 7 | Career-lattice options (lateral / cross-venture) before default vertical rung |
| `/merit-scorecard [venture / dept / group]` | `hr-strategy-alignment` full sequence + `hr_scorecard.py` `build_scorecard()` | Build the HR Balanced Scorecard with 4 perspectives |
| `/merit-hrbp [venture / dept]` | `hr-strategy-alignment` § Instructions Phase 2 | HRBP-style discovery pass with a venture/dept lead |
| `/merit-orphans [scorecard]` | `hr-strategy-alignment` § Instructions Phase 4 + `hr_scorecard.py` `flag_orphans()` | Flag orphan objectives (gaps) and orphan initiatives (sunset candidates) |
| `/merit-reweight [venture + cycle]` | `hr-strategy-alignment` § Instructions Phase 5 | Per-cycle re-weight of top strategic objectives |
| `/merit-sunset-script [initiative]` | `hr-strategy-alignment` sunset conversation via `feedback-methods` | Outline sunset conversation for an orphan HR initiative |

## Multi-Skill Chain Shortcuts

Common flows touching more than one skill.

| Chain shortcut | Sequence | Purpose |
|---|---|---|
| `/merit-perf-cycle [team + quarter]` | `performance-frame` Phase 1 (OKR cascade) → Phase 2 (mid-cycle check) → Phase 3 (end-of-cycle written review) → `feedback-methods` (SBI + Radical Candor delivery of the review) → Phase 4 (year-end synthesis if end of Q4) → Phase 5 (comp hand-off routing, separate cadence) | End-to-end quarterly performance cycle for a team |
| `/merit-talent-review [scope]` | `performance-frame` Phase 4 year-end synthesis → `succession-planning` Phase 3 (9-box placement) + Phase 5 (bench-strength per critical role) + Phase 6 (development plans) → board-facing summary | Governance-cycle talent review preparation |
| `/merit-scorecard-refresh [venture]` | `hr-strategy-alignment` Phase 5 per-cycle re-weighting + Phase 4 orphan audit → `feedback-methods` sunset conversation scripts for orphan initiatives → routing memo to marcus + board for cross-venture tradeoffs | End-of-cycle scorecard refresh with sunset action prep |
| `/merit-succession-crisis [critical role]` | `succession-planning` Phase 5 bench-strength check → if score = 0 → **MANDATORY** escalation memo → route to `board` (Governance) + `marcus` (Executive Office / Strategy) | Zero-successor governance escalation chain (LOAD-BEARING per Universal Principle 7) |
| `/merit-onboard-new-manager [person]` | `feedback-methods` framework brief for the new manager + `performance-frame` OKR-setting brief for their team + `succession-planning` career-lattice framing for their reports + reference to `hr-strategy-alignment` for tying team OKRs to venture objectives | Onboarding-scoped chain when a new manager takes on team leadership |

**Chain shortcuts respect §0.2.** Each phase produces its own artifact and gets its own
review moment when the operator requests one. Chains are convenience routes for the
sequence, not approval to batch outputs.

## Natural-Language Triggers (by skill)

Pulled from each skill's `## When to Use`.

### `feedback-methods` (custom)

| Trigger phrase | Notes |
|---|---|
| "how do I give this feedback" / "help me phrase this" / "prepare for a hard conversation" | Direct hit |
| "SBI feedback" / "Situation Behavior Impact" | Direct hit — format-specific |
| "radical candor" / "care personally challenge directly" / "feedback quadrant" | Direct hit — stance-specific |
| "constructive criticism" / "praise this well" / "how do I recognize this specifically" | Direct hit |
| "solicit feedback from my team" / "invite upward feedback" / "how do I get honest input" | Direct hit — solicit-first (Principle 3) |
| "feedback sandwich" | Push back per Fallback rule 5 — sandwich pattern muddies both messages |
| Handoff from `performance-frame` review-conversation preparation | System-triggered |
| Handoff from `succession-planning` development-conversation preparation | System-triggered |
| Handoff from `hiring-kit` (via hire) for SBI-structured rejection feedback | System-triggered |

### `performance-frame` (custom)

| Trigger phrase | Notes |
|---|---|
| "performance review for [person / cohort / cycle]" / "write a performance review" | Direct hit |
| "individual OKR" / "OKR cascade" / "set OKRs for [team / role]" | Direct hit — Phase 1 |
| "quarterly review" / "review cadence" / "when do we do reviews" | Direct hit |
| "how do I evaluate this person" | Direct hit |
| "mid-cycle check for [person]" / "year-end synthesis" | Direct hit — Phases 2/4 |
| "start the performance cycle" | Direct hit — Phase 1 entry |
| "when should we discuss comp for [person]" | Route to `payroll-and-eor` (custom, hire) per Principle 4 (LOAD-BEARING comp-separation) |

### `succession-planning` (custom)

| Trigger phrase | Notes |
|---|---|
| "9-box grid for [team / venture / group]" | Direct hit — Phase 3 |
| "bench strength for [role]" / "who could step in if [role] left" | Direct hit — Phase 5 |
| "succession plan for [role / team]" / "identify successors for [role]" | Direct hit |
| "critical role identification for [venture / department]" | Direct hit — Phase 1 |
| "career lattice" / "career path for [person]" | Direct hit — Phase 7 |
| "prepare succession/talent review for the Board" | Chain via `/merit-talent-review` |
| Handoff from `performance-frame` year-end synthesis | System-triggered |
| "9-box for compensation cycle" / "9-box for PIP list" | Redirect per Principle 3 (LOAD-BEARING) — 9-box is not a comp/PIP input |
| Zero-successor critical role detected | **MANDATORY** escalation to board + marcus per Principle 5 (LOAD-BEARING) |

### `hr-strategy-alignment` (custom)

| Trigger phrase | Notes |
|---|---|
| "HR strategy for [venture / department / group]" | Direct hit |
| "HR balanced scorecard" / "HR scorecard" / "BSC" | Direct hit |
| "HRBP alignment" / "HR business partner discovery" | Direct hit — Phase 2 |
| "why should we fund [HR program]" / "justify [HR initiative]" | Direct hit — orphan-flagging output |
| "audit our HR initiatives" / "sunset which HR program" | Direct hit — Phase 4 |
| "prepare CHRO input for the Board/leadership cycle" | Direct hit |
| Handoff from `performance-frame` aggregate cycle output | System-triggered — feeds Employee/Customer perspective |
| Handoff from `succession-planning` bench-strength summary | System-triggered — feeds Learning & Growth perspective |
| "run an engagement survey" without a tied objective | Push back per Principle 1 (LOAD-BEARING) — ask what objective it serves |
| Cross-venture priority conflict surfaces | Route to marcus + board for the strategic call per Principle 5 |

## Precedence Rules (when triggers overlap)

Full precedence in `operational/skill/merit-skill-routing.md § Trigger Precedence`.
Load-bearing calls restated:

| Overlap | Winner | Reason |
|---|---|---|
| Ambiguous "how do I evaluate this person" | `performance-frame` first (produces content); calls `feedback-methods` for delivery | Content → delivery separation |
| Ambiguous "career path" | `succession-planning` | Owns career-lattice framing and 9-box placement |
| "give feedback about performance" | `feedback-methods` for delivery discipline + reference to `performance-frame` for content context | Bidirectional; delivery is feedback-methods scope |
| Compensation discussion introduced into a review conversation | **BLOCK** per `performance-frame` Principle 4 (LOAD-BEARING); route comp to hire's `payroll-and-eor` | No operator override without written reason |
| 9-box being used as comp / PIP / public ranking input | **BLOCK** per `succession-planning` Principle 3 (LOAD-BEARING); redirect | No operator override |
| "generic HR program without a tied business objective" | Push back per `hr-strategy-alignment` Principle 1 (LOAD-BEARING); ask what objective | Prevents generic-perk drift |
| Any request colliding with **individual crisis signal** | **HARD ESCALATION — no skill fires** | Universal Principle 3 (inherited); load-bearing safety rule |

## Not-a-Command (routes to another agent)

Phrases that sound like they might trigger merit but route elsewhere per
`merit-skill-routing.md § Cross-Agent Escalation Routing`.

| Trigger phrase | Route to | Rationale |
|---|---|---|
| **ANY signal of individual crisis / self-harm / serious distress** (rare in merit context but possible via performance conversation touching distress) | **HARD BOUNDARY: Manager + HR Ops + EAP** | Universal Principle 3 — immediate escalation, no exceptions, no operator override |
| "assess this individual's mental health" / "how is [person] doing" | **Operator + external professional** | Aggregate-only at publication surface; mental-health assessment out of merit's scope |
| "record this feedback event to a log" / "track who-gave-whom-what-feedback" | **REFUSAL** — Universal Principle 8 (LOAD-BEARING) | merit teaches framework, not surveillance |
| "hire externally for [role]" / "open a req" (Buy action from succession-planning) | **`hiring-kit`** (custom, hire) | Downstream — succession-planning identifies need; hiring-kit runs the workflow |
| "successor onboarding" | **`hiring-kit`** (custom, hire) | Downstream — successor placement into new role |
| "contractor for [role]" (Borrow action) | **`payroll-and-eor`** (custom, hire) | Downstream — W-2/1099/EOR classification |
| "compensation for [role]" / "pay-equity audit" / "comp band review" | **`payroll-and-eor`** (custom, hire) OR future `comp-benchmarking` | Comp scope; performance-review outputs INFORM comp but do not MAKE comp decisions |
| "training program for [gap]" / "close [gap]" (Build action) | **`skill-gap-map` + `training-program-design`** (custom, grove) | Development-execution scope; merit surfaces the gap surface |
| "compliance training records" / "certification expiry" | **`training-operations`** (custom, grove) | Training-ops scope |
| "team morale check" / "burnout signals" / "recognition program" | **`maslow`** (P&C sibling) | Motivation / wellbeing / recognition scope |
| "L&D program design" / "deliberate practice for [skill]" | **`grove`** (P&C sibling) | L&D scope |
| "hiring loop for [role]" / "candidate scoring" | **`hiring-kit`** (custom, hire) | Hiring workflow — hire's scope |
| "which ATS should we use" | **`ats-selection`** (custom, hire) | ATS decision — hire's scope |
| "structural reorg" / "change reporting lines" | **`workforce-planning`** (custom, hire) | Structural change — hire's scope |
| "approve this HR budget" | **`board`** (Governance — fiduciary-guard) | Budget-approval gate; merit produces cost, board approves |
| "cross-venture strategic tradeoff" | **`marcus` (Executive Office / Strategy) + `board`** | Strategic priority — merit surfaces, they decide |
| "company OKRs for this cycle" | **`vista`** (Executive Office / Roadmap Lead) | Company OKR ownership — upstream of individual cascade |
| "time-to-fill" / "cost-per-hire" / "voluntary turnover" / "engagement metrics" | **Future `Shared OS: people-analytics-metrics`** (task #12) | Shared skill — merit references it via scorecard but doesn't own |
| "PII / GDPR question in performance data" | **`veil`** (Cybersecurity — data protection) | Data-protection scope |
| "PIP formalization for [person]" / "wage claim" / "protected-class impact" | **Operator + employment counsel** | Legal fence — merit's persistent-N pattern SURFACES the PIP-candidate, doesn't formalize |
| "harassment signal in a review comment" | **Operator + employment counsel** | Legal fence — BUT if the same content contains individual crisis, HARD BOUNDARY escalation fires first |

## Interaction Notes

- **Slash shortcuts are optional.** merit fires on natural-language triggers too.
- **Chain shortcuts respect §0.2.** Each phase artifact gets its own review moment.
- **Every command runs through Universal Principle 11** (verification-before-completion)
  before its output ships.
- **Every command routes through Universal Principle 3 first.** If an individual crisis
  signal is present anywhere in the context, no merit skill fires — the escalation lane
  takes over immediately.
- **Comp discussion in a review conversation is BLOCKED.** Not a discretionary block —
  Universal Principle 5 (LOAD-BEARING). Route to a separately-scheduled conversation
  with `payroll-and-eor` or future `comp-benchmarking` ownership.
- **9-box used as comp / PIP / ranking is BLOCKED.** Not a discretionary block —
  Universal Principle 6 (LOAD-BEARING). Redirect per succession-planning Fallback rule 3.
- **Zero-successor critical role escalates MANDATORILY to board + marcus.** Not a
  discretionary escalation — Universal Principle 7 (LOAD-BEARING). Not "log it in the
  HR quarterly report and revisit later."
- **Recording individual feedback events is REFUSED.** Not a discretionary refusal —
  Universal Principle 8 (LOAD-BEARING). merit teaches the framework, not surveillance.
- **Orphan HR initiatives get flagged as sunset candidates in the scorecard.** Not
  discretionary suppression — Universal Principle 9 (LOAD-BEARING). Gaps and sunset
  candidates present as prominently as wins.
- **Charter-conflict routes to operator + veil.** Any command that would produce a
  Charter-conflicting output blocks and escalates.
- **`merit-config.md § 7` individual-crisis contact `<FILL_IN>`s block work that could
  surface crisis.** Same pattern as maslow-config §1 + grove-config §7 — safety
  infrastructure, not process debt.

## Meta

- Compiled per §14.2 into the tier-2+ preamble of each of merit's 4 skills as the trigger
  table.
- Structure matches §7 universal layout; triggers / shortcuts / precedence are merit-specific.
- Peer P&C agents (hire live; maslow live; grove live; merit = this file) all have their
  own commands files with the same layout.
