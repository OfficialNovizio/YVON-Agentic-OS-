<!--
Operational: commands file for grove (People & Culture / Learning & Development)
per §7 commands/.

§7 rule: document structure/layout is universal across every agent's commands file
(same table shape, same sections). Actual triggers, shortcuts, and precedence rules
inside are unique to grove's 4-skill roster.

Trigger content pulled verbatim from each skill's `## When to Use` section — this file
consolidates, not invents.
-->

# grove — Commands

Natural-language triggers, slash shortcuts, and precedence for grove (People & Culture /
Learning & Development). Triggers come from each skill's `## When to Use` section — this
file consolidates, not invents.

## Slash Shortcuts

Convenience layer for common single-skill invocations. Slash shortcuts are optional; every
skill also fires on the natural-language triggers below.

| Shortcut | Fires | One-line purpose |
|---|---|---|
| `/grove-gap [team]` | `skill-gap-map` full 5-step | End-to-end skills gap analysis for a team |
| `/grove-gap-quick [role]` | `skill-gap-map` Phases 1–4 only | Fast matrix + gap calculation; skip action recommendation for now |
| `/grove-matrix [team]` | `skill-gap-map` § Skills Matrix & Scoring | Build the 1–5 proficiency matrix for a team |
| `/grove-priority [gap list]` | `skill-gap-map` Phases 5–6 + `skill_gap.py` | Compute priority_score (gap × criticality) + rank top-3 to top-5 |
| `/grove-action [gap]` | `skill-gap-map` Phase 7 + `skill_gap.py` `recommend_action()` | Build / Buy / Borrow / Bridge recommendation per top-priority gap |
| `/grove-program [gap or Level-4 result]` | `training-program-design` full sequence | End-to-end program design (ADDIE + 70-20-10 + Kirkpatrick evaluation plan) |
| `/grove-addie [scope]` | `training-program-design` § ADDIE Phases | Design across ADDIE's 5 phases explicitly |
| `/grove-kirkpatrick [program]` | `training-program-design` § Kirkpatrick Levels + `training_program.py` | Backward-design evaluation plan Levels 4→1 |
| `/grove-70-20-10 [program]` | `training-program-design` § 70-20-10 + `training_program.py` `allocation_check()` | Check allocation against target; flag imbalances |
| `/grove-timing [months + level]` | `training-program-design` + `training_program.py` `kirkpatrick_timing_ok()` | Is it the right time to reliably measure Kirkpatrick Level X? |
| `/grove-drivers [program]` | `training-program-design` Phase 4 required-drivers check | Confirm management support / systems / accountability structure before build |
| `/grove-dp [skill]` | `deliberate-practice` § Instructions Phases 1–4 | Component decomposition + feedback loop + difficulty + repetition for a target skill |
| `/grove-dp-framework [context]` | `deliberate-practice` § Purpose brief | Short DP-lens framing when only theory-level input is needed |
| `/grove-enrollment [training + cohort]` | `training-operations` Instructions Step 2 | Define enrollment automation rules for a training program |
| `/grove-audit-trail [record or program]` | `training-operations` Step 3 + `training_ops.py` `validate_audit_trail()` | Validate compliance records against 4 required fields |
| `/grove-expiry [certification list]` | `training-operations` Step 5 + `training_ops.py` `expiry_alert_status()` | Compute renewal-alert bands (EXPIRED / URGENT / ALERT / OK) |
| `/grove-compliance-report [scope]` | `training-operations` Step 6 + `training_ops.py` `rollup_completion_counts()` | Roll up completion / compliance status by department / venture |
| `/grove-access-audit [system]` | `training-operations` Step 7 + Principle 8 | Audit the audit-trail system's current access-control roster; route change recommendations to veil + operator |

## Multi-Skill Chain Shortcuts

Common flows touching more than one skill.

| Chain shortcut | Sequence | Purpose |
|---|---|---|
| `/grove-gap-to-build [scope]` | `skill-gap-map` full (Phases 1–7) → if Phase-7 action = Build → `deliberate-practice` component decomposition + feedback loop → `training-program-design` full sequence with DP output as input to Phase 3 | End-to-end Build action from gap identification through program design |
| `/grove-compliance-rollout [training + cohort]` | `training-operations` Steps 1–8 for a new mandatory training in a new scope: single-system confirm → enrollment automation → 4-field audit-trail capture → retention-period confirm (route to counsel) → expiry alert setup → completion rollup dashboard → access-control setup with veil → escalate-patterns rule active | End-to-end rollout of a new mandatory training with full compliance discipline |
| `/grove-audit-response [scope + time-window]` | `training-operations` Step 3 (validate all records in window) → Step 6 (rollup by group) → Step 4 confirm (retention still valid for the specific regulation) → produce audit-response artifact | Compliance-audit response preparation from the audit-trail system |
| `/grove-new-role-onboarding [role]` | `skill-gap-map` for the role's required capabilities → Build action recommendation → `training-program-design` for onboarding program → `training-operations` enrollment automation triggered by hire-date | Onboarding-scoped chain from hiring-kit's post-accept handoff |
| `/grove-competence-intervention [team]` | Handoff from `motivation-map` Phase-5 competence-need diagnosis → `skill-gap-map` to identify the specific skill → Build action → `deliberate-practice` for practice loop → `training-program-design` for program shell | Competence-need routing from maslow's motivation-map |

**Chain shortcuts respect §0.2.** Each phase produces its own artifact and gets its own
review moment when the operator requests one. Chains are convenience routes for the
sequence, not approval to batch outputs.

## Natural-Language Triggers (by skill)

Pulled from each skill's `## When to Use`.

### `deliberate-practice` (custom)

| Trigger phrase | Notes |
|---|---|
| "deliberate practice" / "Ericsson framework" / "component-skill decomposition" | Direct hit — mechanism-level framework |
| "how do people actually learn this" / "why isn't the training working" | Direct hit — mechanism diagnostic |
| "design a real practice loop" / "design a feedback loop for [skill]" | Direct hit |
| "comfort zone plus one" / "the practice isn't stretching them" | Direct hit — difficulty calibration |
| "10,000 hours" | Push back per Principle 3 — no specific hour count quoted as authority |
| Handoff from `training-program-design` Phase 3 (mechanism-level design for 70% and 20%) | System-triggered |
| Handoff from `motivation-map` Phase 5 (competence-need intervention) | System-triggered — via `skill-gap-map` typically |

### `skill-gap-map` (custom)

| Trigger phrase | Notes |
|---|---|
| "skills matrix for [team / role / venture]" | Direct hit |
| "skills gap analysis" / "capability assessment for [team]" | Direct hit |
| "what skills does this team need" / "how big is the [X] skill gap" | Direct hit |
| "hire vs upskill" / "build buy borrow bridge" | Direct hit — the 4-way routing |
| "prioritize which skill gap to address first" | Direct hit — Phase 5-6 |
| "business case for this new role / this training investment" | Direct hit — feeds decision with gap data |
| "catalog every skill in the org" | Push back per Fallback rule 3 (unscoped inventory) |

### `training-program-design` (custom)

| Trigger phrase | Notes |
|---|---|
| "design a training program to close [gap]" | Direct hit — Build action from skill-gap-map |
| "training program for [role / competency]" | Direct hit |
| "build a development plan / stretch assignment structure for [succession candidate]" | Direct hit — from future merit |
| "design an evaluation plan for [program]" | Direct hit — Kirkpatrick backward design |
| "did [program] actually work" / "evaluate training effectiveness" | Direct hit — Kirkpatrick 4-levels evaluation |
| "ADDIE" / "70-20-10 design" / "Kirkpatrick evaluation" | Direct hit — framework-specific |
| "just build me a course" | Push back per Fallback rule 5 (10%-only pattern violates 70-20-10) |
| "measure behavior change 2 weeks after training" | Push back per Fallback rule 2 (too-early, unreliable) |

### `training-operations` (custom)

| Trigger phrase | Notes |
|---|---|
| "enrollment automation" for a training program | Direct hit — Step 2 |
| "compliance audit trail" (build, audit, investigate) | Direct hit — Steps 3+8 |
| "certification expiry" / "renewal alerts" | Direct hit — Step 5 |
| "training compliance report" for a department / venture | Direct hit — Step 6 |
| "audit training records" ahead of a regulatory request | Direct hit — Step 3 validation |
| "LMS setup for [scope]" | Direct hit — Step 1 (system-of-record) |
| "edit this audit-trail entry" / "delete this record" | **HARD REFUSAL** per Principle 6 — corrections appended as new entries only |
| "broaden read access to the audit-trail system" | Escalate per Fallback rule 6 — veil + operator countersign required |
| Handoff from `hiring-kit` (new-hire enrollment trigger) | System-triggered |
| Handoff from `payroll-and-eor` (worker classification determines training rules) | System-triggered |

## Precedence Rules (when triggers overlap)

Full precedence in `operational/skill/grove-skill-routing.md § Trigger Precedence`. Load-bearing
calls restated:

| Overlap | Winner | Reason |
|---|---|---|
| Ambiguous "training" without other context | Push back — clarify content-design (training-program-design) vs logistics (training-operations) | Different data models: aggregate vs individually-identifiable |
| Ambiguous "L&D" | `skill-gap-map` first (validate the gap exists), THEN routes to build/buy/borrow/bridge | skill-gap-map is grove's analytical entry point |
| Ambiguous "practice" | `deliberate-practice` for mechanism-level; `training-program-design` for program shell that consumes it | Bidirectional |
| "audit training records" / "check if X completed [training]" | `training-operations` always | Compliance-scope is exclusive to training-operations |
| Any request colliding with **individual crisis signal** in context | **HARD ESCALATION — no skill fires** | Universal Principle 3 (inherited); load-bearing safety rule |
| Any request to **edit / delete existing audit-trail entry** | **HARD REFUSAL** — Universal Principle 4 | Cross-cutting audit-trail immutability rule; no operator override |
| Any request to broaden audit-trail access without countersign | Escalate to veil + operator | Universal Principle 5 — access-control direction always tightening |
| Compensation / workload-driven signal masquerading as training request | Push back per Universal Principle 7 — route structural-first | training-program-design Fallback rule 4; skill-gap-map Fallback rule 5 |

## Not-a-Command (routes to another agent)

Phrases that sound like they might trigger grove but route elsewhere per
`grove-skill-routing.md § Cross-Agent Escalation Routing`.

| Trigger phrase | Route to | Rationale |
|---|---|---|
| **ANY signal of individual crisis / self-harm / serious distress** (rare in grove context but possible via compliance conversation) | **HARD BOUNDARY: Manager + HR Ops + EAP** | Universal Principle 3 — immediate escalation, no exceptions, no operator override |
| **"Edit this audit-trail entry" / "delete this record"** (rephrased) | **HARD REFUSAL** — corrections appended as new entries only | Universal Principle 4 — cross-cutting hard rule |
| "assess this individual's mental health" / "how is [person] doing" | **Operator + external professional** | Aggregate-only rule (except the training-operations compliance-audit-trail scope, which is not for mental-health assessment) |
| "review [person]'s performance" / "coach [person] through [issue]" | **Future `merit` agent** (P&C sibling); currently → operator | Individual perf out of grove's scope |
| "team morale check" / "burnout signals" / "recognition program" | **`maslow`** (P&C sibling) | Motivation/wellbeing/recognition — maslow's scope |
| "hire externally for [role]" / "open a req" (Buy action) | **`hiring-kit`** (custom, hire) | Downstream from skill-gap-map's Buy action |
| "contractor for [role]" (Borrow action) | **`payroll-and-eor`** (custom, hire) | Downstream — W-2/1099/EOR classification |
| "redeploy [person] to [role]" (Bridge action) | **`workforce-planning`** (custom, hire) | Downstream — structural / headcount move |
| "which ATS should we use" / "ATS platform selection" | **`ats-selection`** (custom, hire) | Not grove's scope |
| "compensation for [role]" / "pay-equity audit" / "comp benchmarking" | **`payroll-and-eor`** (custom, hire) OR future `comp-benchmarking` | Recognition/training never fix a comp problem |
| "approve this training budget" | **`board`** (Governance — fiduciary-guard skill) | Spend-approval gate; grove produces cost, board approves |
| "cross-jurisdiction retention rules for [training]" | **Future Global Expansion department** (task #3); currently → operator + employment counsel | Multi-jurisdiction footprint expands there |
| "aggregate psychosocial-risk trends from compliance training" | **Future Risk & ESG department** (task #6); currently → hold and log | ISO 45003 governance route |
| "time-to-fill" / "cost-per-hire" / "voluntary turnover" / "engagement metrics" | **Future `Shared OS: people-analytics-metrics`** (task #12) | Shared skill — grove references it but doesn't own |
| "PII / GDPR question in the LMS or audit-trail system" | **`veil`** (Cybersecurity — data protection) | Data-protection scope |
| "SSO / SCIM setup for the LMS" | **`keyring`** (Cybersecurity — IAM) | IAM scope |
| "configure the LMS" / "grant permissions" / "vendor integration change" | **Operator** | grove produces the design and audit, not the click-through config |
| "harassment signal in a training completion comment" | **Operator + employment counsel** | Legal fence — BUT if the same content contains individual crisis, HARD BOUNDARY escalation fires first |
| Sibling P&C requests clearly belonging to hire | **`hire`** (P&C Lead) | Return with route |

## Interaction Notes

- **Slash shortcuts are optional.** grove fires on natural-language triggers too.
- **Chain shortcuts respect §0.2.** Each phase artifact gets its own review moment.
- **Every command runs through Universal Principle 11** (verification-before-completion)
  before its output ships.
- **Every command routes through Universal Principle 3 first.** If an individual crisis
  signal is present anywhere in the context, no grove skill fires — the escalation lane
  takes over immediately.
- **Audit-trail edit/delete requests are HARD REFUSED.** Not a discretionary block — the
  refusal is baked into the tool_permissions in `grove-config.md § 9` and enforced across
  every grove skill.
- **Broadening audit-trail access requires countersign.** Not a discretionary block — the
  routing is baked into `grove-config.md § 1 access_control` and requires veil + operator
  documented rationale.
- **Charter-conflict routes to operator + veil.** Any command that would produce a
  Charter-conflicting output (e.g., an LMS integration that would put SSNs in a way that
  violates data-protection rail) blocks and escalates.
- **`grove-config.md § 1` audit-trail governance `<FILL_IN>`s block specific rollout
  work.** Unfilled access-control roster or unpopulated retention-periods blocks the
  affected rollout, not just announces loud per §14.7.

## Meta

- Compiled per §14.2 into the tier-2+ preamble of each of grove's 4 skills as the trigger table.
- Structure (same section shape as every other agent's commands file) matches the §7
  universal layout; triggers/shortcuts/precedence are grove-specific.
- Peer P&C agents (maslow already shipped with own commands file; merit pending) will
  have their own commands files with the same layout and their own triggers/shortcuts.
