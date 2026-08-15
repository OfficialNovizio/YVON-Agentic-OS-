<!--
Operational: agent config for hire (People & Culture / Lead) per §7 agent/.

Field derivation rule (§7): every field below must trace back to a real line in one of
hire's 5 skill files. If a field doesn't trace back to a skill reference, it does not
belong here — do not pad this file with content copied from another agent's shape.

Per §0.5: unknown values are `<FILL_IN>`, never invented.
Per §14.7: every `<FILL_IN>` announces itself in the compiled skill's preamble on every
invocation until it is filled or marked `n/a` with a one-line reason. Config debt of 0
or explicit `n/a` is the only acceptable steady state.

Provenance table at the bottom maps every field back to the source skill line — audit
this whenever the config or the skills change.
-->

# hire — Agent Config

## Purpose

This file is the operator-configurable surface hire's 5 skills read at runtime. Every value
here traces to a specific skill line (see `## Provenance` at the bottom). Values that are
truly operator-specific (comp bands, spend thresholds, escalation contact names) are
`<FILL_IN>` — the operator sets them; hire does not invent them per §0.5.

Config debt is announced on every invocation until each `<FILL_IN>` is either filled or
marked `n/a` with a one-line reason per §14.7.

---

## 1. Decision Thresholds

```yaml
# --- hiring-kit thresholds ---

hire_decision_threshold:
  # From: hiring-kit § Principles rule 6, § Phase 6.
  # Locked in build discussion 2026-07-29. Operator may override; must record written
  # reason in the offer memo per §0.5.
  avg_across_all_required_competencies: ">= 3.0"
  no_single_required_competency_below: 2
  applies_to: required_competencies_only
  overridable: true
  override_requires_written_reason: true

scorecard_shape:
  # From: hiring-kit § Phase 1 instructions.
  outcomes_min: 5
  outcomes_max: 7
  competencies_min: 5
  competencies_max: 8
  bars_levels: 4   # 1 = does not meet; 2 = partially meets; 3 = meets; 4 = consistently exceeds

phone_screen:
  # From: hiring-kit § Phase 4.
  duration_minutes: 30
  question_count_min: 5
  question_count_max: 7
  advance_threshold: ">= 3.0"

interview_loop:
  # From: hiring-kit § Phase 5.
  interviewer_count_min: 3
  interviewer_count_max: 5
  competencies_per_interviewer_min: 2
  competencies_per_interviewer_max: 3

references:
  # From: hiring-kit § Phase 7.
  min_per_finalist: 2
  required_reference_types:
    - former_direct_manager   # >= 1 required
  finalists_receiving_ref_checks: 2   # top-2, not the single offer-stage candidate
  peer_only_refs_allowed: false

work_sample:
  # From: hiring-kit § Phase 5 and ats-selection § Topic E.
  paid_threshold_hours: 2   # over this, must be paid
  right_to_refuse_alternative_required: true

# --- ats-selection thresholds ---

ats_intake_questions_required: true   # non-negotiable per ats-selection Principle 1
ats_pricing_authoritative: false      # every recommendation names "verify with vendor"

# --- workforce-planning thresholds ---

span_of_control:
  # From: workforce-planning § Org Design — Structural Elements.
  # HEURISTIC not rule per workforce-planning Principle 6.
  target_range_min: 7
  target_range_max: 12
  layers_ic_to_ceo_max: 5
  heuristic_not_rule: true

fte_calculation:
  # From: workforce-planning § Headcount vs FTE and scripts/workforce_calculator.py.
  standard_hours_per_year_default: 2080   # US full-time; override per jurisdiction
  standard_hours_per_year_override: "<FILL_IN>"   # set per venture / jurisdiction
```

## 2. Escalation Contacts (routing to real YVON agents)

```yaml
# All routes below come from hire-skill-routing.md and each skill's Boundaries section.
# Agent names verified against root CLAUDE.md §2 routing table (2026-07-29).

escalations:
  pii_candidate_data_or_ssn:
    route_to: veil
    department: Cybersecurity
    verified_in_claude_md: true

  ats_integration_app_security:
    route_to: aegis
    department: Engineering
    verified_in_claude_md: true

  sso_scim_for_payroll_platform:
    route_to: keyring
    department: Cybersecurity
    verified_in_claude_md: true

  hr_data_schema_design:
    route_to: dana
    department: Engineering
    verified_in_claude_md: true

  budget_approval_over_threshold:
    route_to: board
    department: Governance
    via_skill: fiduciary-guard
    verified_in_claude_md: true

  governance_approval_for_structural_reorg:
    route_to: board
    department: Governance
    via_skills:
      - constitution-enforcement
      - strategic-veto
    verified_in_claude_md: true
```

## 3. External Escalation Lanes (no YVON agent exists)

```yaml
# These lanes route out of the fleet. Operator contact required.
# Do NOT list a placeholder agent name for any of these — no CLO / immigration
# / tax / incorporation / Finance agent exists in YVON yet.

external_escalations:
  employment_law:
    triggers:
      - layoff or reduction-in-force
      - protected-class impact analysis
      - wage claim
      - close-call California AB5 classification
      - close-call W-2 vs 1099 determination
    contact_role_needed: employment counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  immigration_and_work_authorization:
    triggers:
      - visa strategy
      - work-authorization question
      - cross-border employee transfer
    contact_role_needed: immigration counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  tax_counsel:
    triggers:
      - RSU vest timing / Carta-payroll integration
      - multi-state payroll-tax nexus
      - cross-border compensation
    contact_role_needed: tax counsel / CPA (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  incorporation_counsel:
    triggers:
      - company formation before payroll setup
      - entity restructure
      - foreign-entity setup vs EOR decision (Topic C tipping point)
    contact_role_needed: incorporation counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  sensitive_candidate_demographic_data_in_loop:
    triggers:
      - individual-level demographic data reaching interview loop (aggregate is fine)
    action: halt loop; escalate to operator immediately
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"
```

## 4. Future YVON Assets (placeholders — routes pending)

```yaml
# Named in one or more skill's Boundaries table as "future" or "not yet built".
# Each entry names the missing asset, which skill(s) need it, and what hire does
# in the meantime.

pending_yvon_assets:
  finance_department_or_agent:
    needed_by: [payroll-and-eor, workforce-planning]
    current_workaround: "Route budget approvals to board (fiduciary-guard) as interim owner."
    hire_action_until_built: "Announce the placeholder in every invocation that would have routed to Finance."

  comp_benchmarking_skill:
    needed_by: [hiring-kit § Phase 1, payroll-and-eor § Topic D]
    current_workaround: "Block phase advancement in hiring-kit until operator supplies comp band from external market data."
    hire_action_until_built: "Explicit block on Phase 1 comp-band field with named `<FILL_IN>` route."

  clo_or_legal_agent:
    needed_by: [payroll-and-eor, workforce-planning, ats-selection]
    current_workaround: "External employment counsel escalation lane (see §3)."
    hire_action_until_built: "Route all employment-law questions to operator with counsel-required note."

  hris_config_skill:
    needed_by: [ats-selection § Topic F]
    current_workaround: "Note ATS-to-HRIS handoff as deferred; if Rippling, recommend Rippling Recruiting shortcut."
    hire_action_until_built: "Route non-Rippling HRIS handoff questions to operator."

  merit_agent_when_built:
    needed_by: [hiring-kit rejection feedback, workforce-planning individual-perf inputs]
    current_workaround: "Use feedback-methods marketplace skill (planned under merit) via direct citation."
    hire_action_until_built: "Note in output that merit-owned feedback-methods will handle rejection feedback once merit ships."

  maslow_agent_when_built:
    needed_by: [hiring-kit motivation-side considerations]
    current_workaround: "Identity's principle 'you don't motivate; you hire people who are already motivated' handles the framing."
    hire_action_until_built: "No blocking dependency; note downstream coordination in output when relevant."

  grove_agent_when_built:
    needed_by: [workforce-planning action-plan 'upskill' actions]
    current_workaround: "Recommend the upskill action with a note that grove will own the training-program design once built."
    hire_action_until_built: "No blocking dependency."

  shared_os_people_analytics_metrics:
    needed_by: [hiring-kit § Boundaries reporting layer, ats-selection § Topic D quarterly funnel report]
    current_workaround: "Skills reference the metric names (time-to-fill, cost-per-hire, first-year attrition) but do not compute them yet."
    hire_action_until_built: "Blocking-soft: reporting-layer outputs are labeled 'metric-shape only; values pending shared skill.'"
```

## 5. Time-Sensitive Regulatory Alerts

```yaml
# These are alerts hire MUST surface proactively per ats-selection Principle 3 and
# payroll-and-eor Principle 7 whenever the geography/topic touches them, until the
# retire_after date passes.

active_alerts:
  greenhouse_harvest_api_v1_v2_deprecation:
    fact: "Greenhouse Harvest API v1/v2 unavailable after 2026-08-31."
    source: ats-selection § Topic A
    action: "Surface proactively whenever the user mentions Greenhouse integrations."
    retire_after: 2026-08-31
    on_retire: remove_from_active_alerts

  eu_platform_work_directive:
    fact: "EU Platform Work Directive transposition deadline 2026-12-02. Any team with EU-based platform/gig-style workers must review classification before this date."
    source: payroll-and-eor § Topic C
    action: "Surface proactively whenever EU workers or platform-style employment come up."
    retire_after: 2026-12-02
    on_retire: convert_to_historical_note_and_update_classification_matrix

  germany_misclassification_penalty:
    fact: "Germany €50,000 penalty per Scheinselbständigkeit misclassification (2025)."
    source: payroll-and-eor § Topic C
    action: "Surface proactively whenever German 1099-equivalent classification comes up."
    retire_after: n/a   # ongoing regulatory environment; no retire date
    on_retire: null

  minnesota_pfml_2026:
    fact: "Minnesota Paid Family and Medical Leave launching 2026."
    source: payroll-and-eor § Topic F
    action: "Surface proactively for any Minnesota hire or multi-state payroll setup touching Minnesota."
    retire_after: 2027-01-01   # once launched, converts to compliance-check
    on_retire: convert_to_active_compliance_check

  flsa_salary_threshold:
    fact: "FLSA salary threshold $35,568 (as restored after 2024 court ruling)."
    source: payroll-and-eor § Topic F
    action: "Verify at dol.gov after any federal court ruling or DOL rulemaking; the number has moved twice between 2023-2025."
    retire_after: n/a
    on_retire: null
    check_frequency: "quarterly, or on notice of DOL rulemaking"
```

## 6. Tool Permissions (governance layer)

```yaml
# Per §7 agent/: this is the GOVERNANCE layer for tool access — what hire is
# ALLOWED to do at runtime. Technical needs (which skill needs file-write vs
# script-execution) live in operational/tool/hire-tool-requirements.md.

tool_permissions:
  file_read: allowed
  file_write:
    allowed_paths:
      - Teams/People & Culture/hire/**   # own agent scope
      - Teams/People & Culture/**        # dept scope for coordination outputs
      - store/tasks/**                   # task specs when hire runs a work item
    denied_paths:
      - Teams/**/marketplace/**          # marketplace skills are verbatim, never edited (§4.8)
      - .git/**                          # obvious
      - Teams/Engineering/SECURITY-CHARTER.md  # Charter is operator-amended only

  python_or_shell_execution:
    allowed_scripts:
      - Teams/People & Culture/hire/custom/workforce-planning/scripts/workforce_calculator.py
      - Shared OS/logical/**              # any future logical script, if hire's skills grow to import them
    self_tests_before_ship: required     # per §5.2 discipline for any script hire calls

  web_search:
    allowed: true
    scope: "verify vendor pricing, verify regulatory dates, verify published book citations"
    denied: "not for close-call classification decisions (route to counsel per external_escalations)"

  ats_platform_admin_actions:
    allowed: false
    rationale: "hire produces the decision and the audit, not the click-through configuration (ats-selection § When to Use). Route to operator."

  payroll_platform_admin_actions:
    allowed: false
    rationale: "hire produces the classification decision and the platform recommendation, not the platform setup. Route to operator."

  reading_individual_employee_perf_data:
    allowed: false
    rationale: "workforce-planning Principle 5 — this skill operates at role/function level, not individual. Individual perf data is merit's scope, not hire's."

  reading_individual_candidate_demographic_data:
    allowed: false
    rationale: "ats-selection § Topic D — aggregate D&I reporting only; individual-level demographic data never enters the interview loop."
```

## 7. Model Routing

```yaml
# Per §7 agent/: model routing. This binds compiler tier-3+ preambles.
# hire's skills are all tier 2 or 3 per §14.3 defaults; no tier-4 build/exec skills.

model_routing:
  default_model: "<FILL_IN>"           # operator picks (e.g., claude-sonnet-4-5 for advisory; claude-opus-4 for hard decisions)
  fast_model_for_screens: "<FILL_IN>"  # optional: separate faster model for high-volume phone-screen scoring; hire's default fine if not set
  fallback_model: "<FILL_IN>"
  temperature_for_scorecard_generation: 0.2   # low creativity; consistency is the point
  temperature_for_JD_drafting: 0.4            # slightly higher; some voice latitude within the identity's frame
  temperature_for_reference_check_script: 0.2 # low; script consistency
```

## 8. Runtime Behavior Defaults

```yaml
# Defaults for behaviors the identity and skills don't fully specify.

runtime_defaults:
  identity_governs_voice: true    # per operational/skill/hire-skill-routing.md § Identity vs Routing
  identity_can_override_method: false   # never — identity governs how, not which/whether
  charter_senior_to_identity: true
  charter_senior_to_config: true
  universal_principles_senior_to_identity_flavored: true

  verification_before_completion:
    required_on_every_output: true   # per Prime Directive and Shared OS layer
    exempt_operators: []             # no exemptions

  fill_in_debt_announcement:
    on_every_invocation: true        # per §14.7
    format: "one line per unfilled field, in the compiled skill's preamble"
```

---

## Provenance

Every field above must trace back to a real line in one of hire's 5 skill files.
Audit whenever config or skills change.

| Config field | Source skill line |
|---|---|
| `hire_decision_threshold` | hiring-kit § Principles rule 6; hiring-kit § Phase 6 hire-decision rule |
| `scorecard_shape` | hiring-kit § Phase 1 instructions (outcomes 5-7; competencies 5-8; BARS 4 levels) |
| `phone_screen` | hiring-kit § Phase 4 (30 min; 5-7 Qs; ≥3.0 advances) |
| `interview_loop` | hiring-kit § Phase 5 (3-5 interviewers; 2-3 competencies each) |
| `references` | hiring-kit § Phase 7 (top-2; min 2 refs; ≥1 former direct manager; peer-only not allowed) |
| `work_sample` | hiring-kit § Phase 5 principle 7; ats-selection § Topic E (2-hour paid threshold, right-to-refuse) |
| `ats_intake_questions_required` | ats-selection § Principle 1 and § Fallback rule 1 |
| `ats_pricing_authoritative` | ats-selection § Principle 5 (always "verify with vendor") |
| `span_of_control` (7-12 heuristic; ≤5 layers) | workforce-planning § Org Design — Structural Elements; § Principles rule 6 |
| `fte_calculation` (2080 default) | workforce-planning § Python Utility docstring; scripts/workforce_calculator.py |
| `escalations.pii_candidate_data_or_ssn` (veil) | hire-skill-routing.md § Cross-Agent Escalation Routing; ats-selection § Fallback; payroll-and-eor § Principle 6 |
| `escalations.ats_integration_app_security` (aegis) | ats-selection § Fallback; hire-skill-routing.md |
| `escalations.sso_scim_for_payroll_platform` (keyring) | payroll-and-eor § When to Use "Do NOT use for" and § Boundaries |
| `escalations.hr_data_schema_design` (dana) | payroll-and-eor § When to Use "Do NOT use for" and § Boundaries |
| `escalations.budget_approval_over_threshold` (board / fiduciary-guard) | workforce-planning § Instructions step 6; payroll-and-eor § Boundaries |
| `escalations.governance_approval_for_structural_reorg` (board / constitution + strategic-veto) | workforce-planning § Instructions step 7; § Boundaries |
| `external_escalations.employment_law` | payroll-and-eor § Fallback (close-call classification); workforce-planning § Fallback (restructuring); ats-selection § Fallback |
| `external_escalations.immigration_and_work_authorization` | payroll-and-eor § When to Use "Do NOT use for"; § Fallback |
| `external_escalations.tax_counsel` | payroll-and-eor § Fallback (RSU vest, multi-state nexus); § Topic E (Carta handoff) |
| `external_escalations.incorporation_counsel` | payroll-and-eor § Fallback (company formation) |
| `external_escalations.sensitive_candidate_demographic_data_in_loop` | hiring-kit § Fallback; ats-selection § Topic D |
| `pending_yvon_assets.*` | Each row cites the skill's § Boundaries table which names the asset as "future" or "not yet built" |
| `active_alerts.greenhouse_harvest_api_v1_v2_deprecation` | ats-selection § Topic A (time-sensitive fact) |
| `active_alerts.eu_platform_work_directive` | payroll-and-eor § Topic C |
| `active_alerts.germany_misclassification_penalty` | payroll-and-eor § Topic C |
| `active_alerts.minnesota_pfml_2026` | payroll-and-eor § Topic F |
| `active_alerts.flsa_salary_threshold` | payroll-and-eor § Topic F |
| `tool_permissions.*` | Derived from what each skill's § Output Format writes (file_write scope) and § Python Utility executes (workforce_calculator.py); denied paths derive from §4.8 marketplace rule and Charter senior-authority rule |
| `runtime_defaults.*` | Prime Directive (root CLAUDE.md §1); hire-skill-routing.md § Identity vs Routing; §14.7 (debt announcement) |

## Debt Summary

Fields still `<FILL_IN>` as of this build (2026-07-29):

- `fte_calculation.standard_hours_per_year_override` — waiting on venture/jurisdiction context.
- `external_escalations.employment_law.operator_contact_name` and `.operator_contact_email` — waiting on operator.
- `external_escalations.immigration_and_work_authorization.*` — waiting on operator.
- `external_escalations.tax_counsel.*` — waiting on operator.
- `external_escalations.incorporation_counsel.*` — waiting on operator.
- `external_escalations.sensitive_candidate_demographic_data_in_loop.*` — waiting on operator.
- `model_routing.default_model`, `fast_model_for_screens`, `fallback_model` — waiting on operator model-selection policy.

Per §14.7 each of these debts announces itself in every compiled skill invocation until
filled or marked `n/a` with a one-line reason.
