<!--
Operational: agent config for grove (People & Culture / Learning & Development) per §7 agent/.

Field derivation rule (§7): every field below traces to a real line in one of grove's 4
skill files. No padding, no copying maslow's shape — grove has different concerns
(compliance-audit-trail governance, skill-gap-map thresholds, ADDIE/Kirkpatrick timing)
than maslow does.

Per §0.5: unknown values are <FILL_IN>, never invented.
Per §14.7: every <FILL_IN> announces itself in compiled skill preambles until filled or
marked n/a.

Provenance table at the bottom maps every field back to the source skill line.
-->

# grove — Agent Config

## Purpose

Operator-configurable surface grove's 4 skills read at runtime. Every field traces to a
specific skill line (see `## Provenance`). Values that are operator-specific
(minimum access-role list for the audit-trail system, retention periods per
jurisdiction/regulation) are `<FILL_IN>`. Config debt announces per §14.7 until filled.

---

## 1. Compliance-Audit-Trail Governance (training-operations)

```yaml
# From training-operations § Instructions Step 7; § Principles rule 8; § Fallback rules 3+6.
# THIS BLOCK IS LOAD-BEARING for the audit-trail integrity rules — populate before running
# any compliance-training rollout for a new jurisdiction or new training type.

compliance_audit_trail:
  required_fields:
    - person                # employee ID or full name
    - course_code           # course / regulation code
    - timestamp             # completion date/time
    - attestation           # signed acknowledgement or scored assessment
  # Hard rule: all 4 fields required for a record to count as compliant. Enforced by
  # training-operations Principle 2 and scripts/training_ops.py validate_audit_trail().
  incomplete_record_action: escalate_to_operator_for_reconciliation
  never_count_incomplete_as_compliant: true

  immutability:
    edit_or_delete_existing_entry: forbidden      # cross-cutting hard rule per skill-routing yaml
    correction_pattern: append_new_entry_only     # never overwrite
    applies_to: [training-operations, all_other_grove_skills_via_cross_cutting_rule]

  access_control:
    governance_owner: veil (Cybersecurity — data protection) + operator
    grove_role: maintains_records_only            # NOT the access-control decision-maker
    default_read_access_roles: "<FILL_IN>"        # named list; small, periodically re-audited
    default_manage_access_roles: "<FILL_IN>"
    default_configure_access_roles: "<FILL_IN>"
    change_direction_expected: tightening         # broadening requires veil + operator countersign
    broadening_request_response: escalate_to_veil_plus_operator_with_documented_rationale

  privacy_model_inversion:
    # LOAD-BEARING per training-operations Principle 3 — the ONE P&C skill where records
    # are individually identifiable BY LEGAL NECESSITY. Aggregate-only rule from
    # hire Universal Principle 7 does NOT apply to training-operations' compliance records.
    aggregate_only_applies: false                 # ONLY for training-operations compliance records
    aggregate_only_still_applies_to_other_grove_skills: true
    privacy_protection_via: access_control        # not anonymization / not aggregation
    documentation_ref: training-operations § Privacy Model — Access Control, Not Anonymization

  retention_periods:
    # NEVER a blanket default — jurisdiction- and regulation-specific.
    # Populate per training type per jurisdiction; route unknown to operator + employment
    # counsel per Universal Principle 5.
    default_action_on_unknown: escalate_to_operator_plus_employment_counsel
    example_reference_only:
      osha_general_training: "~5 years from January 1 following completion year (US baseline; VERIFY per specific OSHA training type)"
    populated_entries: "<FILL_IN>"                # dict of training_type × jurisdiction → retention_period_years

  expiry_alerts:
    default_lead_time_days: 90                    # per training-operations § Core Concepts § Proactive Expiry Management
    lead_time_override: "<FILL_IN>"               # operator-adjustable per training type
    band_thresholds:
      expired: "days_until < 0"
      urgent: "0 <= days_until <= 30"
      alert: "30 < days_until <= lead_time_days"
      ok: "days_until > lead_time_days"
    # Enforced in scripts/training_ops.py expiry_alert_status(). lead_time_days must be
    # > 30 to prevent ALERT band collapse.
```

## 2. Skill-Gap-Map Thresholds

```yaml
# From skill-gap-map § Skills Matrix & Scoring; § Instructions Phases 2, 5, 6, 7;
# scripts/skill_gap.py.

skill_gap_map:
  proficiency_scale:
    # Fixed 1-5 scale with observable behavioral anchors. Reference only — script
    # enforces the scale bounds.
    1: {label: "Novice",     definition: "Aware; no applied experience"}
    2: {label: "Developing", definition: "Can perform with guidance"}
    3: {label: "Proficient", definition: "Can perform independently in standard situations"}
    4: {label: "Advanced",   definition: "Handles complex situations; can guide others"}
    5: {label: "Expert",     definition: "Recognized authority; sets standards; trains others"}

  taxonomy_scoping:
    skills_per_role_or_team_min: 5
    skills_per_role_or_team_max: 15
    # More = drift from business driver per skill-gap-map Purpose failure mode 1.
    unscoped_inventory_response: push_back_and_rescope_to_business_driver

  criticality_bounds:
    min: 0.0
    max: 1.0
    reference_bands:
      directly_gates_business_driver: 1.0
      supportive_but_not_essential: ~0.5
      nice_to_have: ~0.1
    # Criticality comes from requester + business driver, NOT from grove guessing.
    do_not_guess: true

  rater_discrepancy_threshold: 1        # levels; discrepancy > 1 → surface for reconciliation
  never_silently_average: true          # per Principle 3

  top_priority_gaps_targets:
    min: 3
    max: 5
    # Longer lists usually produce no action; short lists drive real work.

  action_routing_thresholds:
    # From scripts/skill_gap.py recommend_action() decision tree.
    bridge_check_first: true            # per skill-gap-map Principle 4 — Bridge is often underused
    build_condition: "internally_buildable AND time_available_months >= time_to_build_months"
    borrow_condition: "time_available_months < 6 AND not internally_buildable_in_window"
    buy_default: "everything else"
```

## 3. Training-Program-Design Thresholds

```yaml
# From training-program-design § Core Concepts + § Instructions; scripts/training_program.py.

training_program_design:
  kirkpatrick_timing_targets:
    # From training-program-design § Core Concepts § Timing Matters and
    # scripts/training_program.py LEVEL_TIMING_TARGETS.
    reaction_measurement_delay_months_min: 0        # immediate
    learning_measurement_delay_months_min: 0        # immediate
    behavior_measurement_delay_months_min: 3        # earlier is unreliable per HRDQ
    results_measurement_delay_months_min: 3         # ideally 3-6+ months
    behavior_ideal_window_months: [3, 6]
    results_ideal_window_months: [3, 6]

  70_20_10_target:
    # Heuristic per §0.6; scripts/training_program.py allocation_check flags imbalances.
    on_the_job_target_pct: 70
    social_target_pct: 20
    formal_target_pct: 10
    formal_upper_flag: 20        # if formal > 20% → flag (70-20-10 probably violated)
    on_job_lower_flag: 50        # if on-the-job < 50% → flag (practice piece under-designed)
    social_lower_flag: 5         # if social < 5% → flag (mentoring piece missing)

  evaluation_survey:
    max_questions: 3             # per HRDQ short-survey guidance
    format:
      - "one scaled self-rating"
      - "one yes/no behavioral check"
      - "one open-ended"
    long_survey_response: push_back_to_3_question_design

  required_drivers_check_required: true          # Phase 4 mandatory
  # No program builds without confirming: management support, workplace systems,
  # accountability structure. Missing drivers → escalate to accountable manager per
  # Fallback rule 4.

  level_4_business_result_required: true         # per Fallback rule 1
  no_program_without_level_4_result: true
```

## 4. Deliberate-Practice Defaults

```yaml
# From deliberate-practice § Structure / Protocol + § Instructions.

deliberate_practice:
  component_decomposition:
    components_per_skill_min: 3
    components_per_skill_max: 7        # heuristic — Instructions Phase 1

  feedback_loop:
    latency_target: as_short_as_possible
    delayed_feedback_flag_threshold_weeks: 2      # per Principle 4 — delayed by weeks = failure mode
    structured_rubric_required: true

  difficulty_calibration:
    comfort_zone_plus_one_success_rate_target: 0.5   # heuristic — Instructions Phase 3
    # Higher = too easy, no growth; lower = frustration, abandonment.

  repetition_schedule:
    attempts_per_component_per_week_min: 3
    attempts_per_component_per_week_max: 5
    # Less than 3/week = skill decays between practices.

  difficulty_ratchet_trigger_success_rate: 0.9       # step up when practitioner hits ~90% success

  no_specific_hour_count_authority: true             # Principle 3 — never quote "10,000 hours"
  time_to_mastery_estimates: directional_only
```

## 5. Minimum-Group-Size Suppression

```yaml
# Shared with maslow's wellbeing-monitoring / recognition-program and future
# Shared OS: people-analytics-metrics. Consolidation to Shared OS/logical/ is the
# eventual §13.5 promotion path.
# NOTE: does NOT apply to training-operations compliance records (privacy inversion — see §1).

minimum_group_size:
  threshold_default: 5                             # typical HR privacy floor
  threshold_override: "<FILL_IN>"                  # operator per org privacy policy (5-8 typical)
  suppression_action: [suppress_segmented_figure, roll_up_or_qualitative_report]
  applies_to:
    - skill-gap-map (per-team rollups)
    - training-program-design (participation and completion rollups)
    - training-operations (rollup by group — records themselves stay identifiable per §1)
  does_not_apply_to:
    - training-operations compliance audit-trail records (privacy inversion per §1)
```

## 6. Escalation Contacts (routing to real YVON agents)

```yaml
# Verified against root CLAUDE.md §2 (2026-07-31 build).

escalations:
  audit_trail_access_governance:
    route_to: veil
    department: Cybersecurity
    role: data protection
    verified_in_claude_md: true

  audit_trail_pii_and_gdpr:
    route_to: veil
    department: Cybersecurity
    verified_in_claude_md: true

  sso_scim_for_lms_or_audit_trail_system:
    route_to: keyring
    department: Cybersecurity
    verified_in_claude_md: true

  budget_approval:
    route_to: board
    department: Governance
    via: fiduciary-guard skill
    verified_in_claude_md: true
    future_owner: Finance department when built

  buy_action_from_skill_gap_map:
    route_to: hiring-kit
    department: People & Culture
    owner_agent: hire (Lead)
    verified_in_claude_md: true

  borrow_action_from_skill_gap_map:
    route_to: payroll-and-eor
    department: People & Culture
    owner_agent: hire (Lead)
    verified_in_claude_md: true

  bridge_action_from_skill_gap_map:
    route_to: workforce-planning
    department: People & Culture
    owner_agent: hire (Lead)
    verified_in_claude_md: true

  structural_required_drivers_gap:
    route_to: workforce-planning
    department: People & Culture
    owner_agent: hire (Lead)
    typical_case: training-program-design Phase 4 required-drivers check finds structural cause

  compensation_side_masquerade:
    route_to: payroll-and-eor
    department: People & Culture
    owner_agent: hire (Lead)
    typical_case: training request that's actually a comp problem

  motivation_wellbeing_recognition_adjacent:
    route_to: maslow
    department: People & Culture
    sibling_agent: true

  hiring_workforce_payroll_adjacent:
    route_to: hire
    department: People & Culture
    role: Lead

  performance_management_adjacent:
    route_to: merit
    status: pending
    interim: route_to_operator_with_note

  aggregate_people_metrics:
    route_to: shared_os_people_analytics_metrics
    status: future — task #12 (Shared OS)
    interim: hold_and_log

  cross_jurisdiction_retention_rules:
    route_to: global_expansion_department
    status: future — task #3
    interim: route_to_operator_plus_employment_counsel

  aggregate_psychosocial_risk_in_compliance_training_context:
    route_to: risk_and_esg_department
    status: future — task #6
    interim: hold_and_log
```

## 7. External Escalation Lanes (no YVON agent exists)

```yaml
external_escalations:
  individual_crisis:
    # Inherited from Universal Principle 3 (from hire) — even inside grove's
    # compliance-training scope, individual crisis is HARD BOUNDARY.
    triggers:
      - any signal of individual crisis / self-harm / serious personal distress via ANY
        channel (compliance conversation, training discussion, individual completion issue
        traced to distress)
    action: immediate_stop_and_escalate_per_wellbeing_monitoring_fallback
    route_to:
      manager: <affected person's direct manager>
      hr_ops_contact_name: "<FILL_IN>"
      hr_ops_contact_email: "<FILL_IN>"
      eap_provider_name: "<FILL_IN>"
      eap_provider_url: "<FILL_IN>"
      eap_provider_phone: "<FILL_IN>"
    operator_override_allowed: false

  employment_and_regulatory_counsel:
    triggers:
      - retention-period confirmation per regulation / jurisdiction
      - regulatory-exposure gap in skill-gap-map (e.g., compliance-specialist need in a regulated venture)
      - protected-class impact signal in a training completion rollup
      - questions about mandatory-training legal-completion requirements
    contact_role_needed: employment counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  tax_and_audit_counsel:
    triggers:
      - LMS / audit-trail-system spend that crosses tax thresholds
      - audit response for regulatory training records
    contact_role_needed: tax / audit counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  immigration_counsel:
    triggers:
      - cross-border training completion (visa-holder participation)
    contact_role_needed: immigration counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  lms_or_audit_trail_platform_admin_actions:
    triggers:
      - platform configuration change
      - permission grants
      - vendor-side integration change
    action: route_to_operator
    rationale: grove produces the design and audit, not the click-through configuration
```

## 8. Regulatory Alerts (proactive surface)

```yaml
active_alerts:
  cross_jurisdiction_retention_variance:
    fact: "Retention periods vary substantially by regulation and jurisdiction. OSHA general training ~5yr US baseline is one example only. Multi-jurisdiction footprint (which will surface as the Global Expansion department comes online per task #3) means retention often varies across the same training type by location."
    source: training-operations § Core Concepts § Retention & Immutability
    action: surface proactively whenever a compliance-training scope crosses jurisdictions or introduces a new training type
    retire_after: n/a
    on_retire: null

  # Compared to hire-config §5 (5 alerts) and maslow-config §6 (1 alert), grove's scope
  # generates fewer regulatory alerts because grove is the L&D-execution layer, not the
  # direct compliance-decision layer. The compliance surface expands significantly when
  # Global Expansion department (task #3) and Risk & ESG department (task #6) come online.
```

## 9. Tool Permissions (governance layer)

```yaml
# Per §7 agent/: GOVERNANCE layer — what grove is ALLOWED to do at runtime.
# Technical needs live in operational/tool/grove-tool-requirements.md.

tool_permissions:
  file_read: allowed
  file_write:
    allowed_paths:
      - Teams/People & Culture/grove/**
      - Teams/People & Culture/**             # dept scope for coordination outputs
      - store/tasks/**
    denied_paths:
      - Teams/**/marketplace/**               # marketplace verbatim — but grove has zero marketplace skills anyway
      - .git/**
      - Teams/Engineering/SECURITY-CHARTER.md # operator-amended only

  python_or_shell_execution:
    allowed_scripts:
      - Teams/People & Culture/grove/custom/skill-gap-map/scripts/skill_gap.py
      - Teams/People & Culture/grove/custom/training-program-design/scripts/training_program.py
      - Teams/People & Culture/grove/custom/training-operations/scripts/training_ops.py
      - Shared OS/logical/**                  # any future logical script
    self_tests_before_ship: required          # per §5.2

  web_search:
    allowed: true
    scope: "verify research citations, verify LMS-vendor and compliance-vendor content, verify retention-period authoritative sources"
    denied: "not for individual-level searches; not for close-call retention decisions (route to employment counsel)"

  audit_trail_entry_edit_or_delete:
    allowed: false
    rationale: "HARD REFUSAL per training-operations Principle 6 and cross-cutting hard rule in grove-skill-routing.md. Corrections appended as new entries only. Cross-skill: applies to ALL grove skills, not just training-operations."

  broadening_audit_trail_access_without_countersign:
    allowed: false
    rationale: "training-operations Fallback rule 6 — access-control direction should always be tightening. Broadening requires veil + operator countersign with documented rationale."

  reading_individual_employee_perf_data:
    allowed: false
    rationale: "Universal Principle 7 (aggregate-only inherited from hire); skill-gap-map Principle 5; training-program-design Principle 6. Individual perf data belongs to future merit."

  reading_individual_compliance_audit_trail:
    allowed: true                             # EXCEPTION — the aggregate-only inversion in §1
    rationale: "training-operations Principle 3 — individually-identifiable records by legal necessity. Access is via least-privilege IAM (§1 access_control block); grove maintains records, veil governs access."
    scope_boundary: training-operations only
    other_grove_skills_stay_aggregate_only: true

  reading_individual_demographic_data:
    allowed: false
    rationale: "Universal Principle 7 aggregate-only rule applies; demographic data is not part of the 4 required audit-trail fields."

  lms_or_audit_trail_platform_admin_actions:
    allowed: false
    rationale: "grove produces the design and audit, not the click-through configuration. Route to operator per §7 external_escalations."

  publishing_segmented_figures_below_min_group_size:
    allowed: false
    rationale: "Universal Principle 4 aggregate-privacy rule applies to skill-gap-map / training-program-design rollups. training-operations compliance records are exempt per §1 privacy inversion."
```

## 10. Model Routing

```yaml
model_routing:
  default_model: "<FILL_IN>"
  fallback_model: "<FILL_IN>"
  temperature_for_program_design: 0.4                # some latitude within McCord voice
  temperature_for_gap_map_scoring: 0.2               # consistency for cross-cycle comparability
  temperature_for_compliance_report: 0.1             # strict — regulatory language matters
  temperature_for_dp_component_decomposition: 0.4    # generative but bounded
```

## 11. Runtime Behavior Defaults

```yaml
runtime_defaults:
  identity_governs_voice: true                       # tone inherited from hire
  identity_can_override_method: false
  charter_senior_to_identity: true
  charter_senior_to_config: true
  universal_principles_senior_to_identity_flavored: true

  # grove-specific defaults:
  aggregate_only_across_skill_gap_map_and_training_program_design_and_motivation_adjacent_rollups: true
  aggregate_only_inversion_scoped_to_training_operations_only: true
  audit_trail_immutability_cross_cutting: true       # ALL grove skills; not just training-operations
  no_specific_hour_count_quoted_as_authority: true   # deliberate-practice Principle 3
  interventions_from_menu_not_invented: true         # inherited pattern from maslow
  structural_cause_first_before_training: true       # training-program-design Fallback rule 4

  verification_before_completion:
    required_on_every_output: true
    exempt_operators: []

  fill_in_debt_announcement:
    on_every_invocation: true
    format: "one line per unfilled field, in compiled skill preamble"
    critical_fields_blocking_invocation:
      - individual_crisis contact fields (per external_escalations)
      - compliance_audit_trail.access_control default_read_access_roles (per §1)
      - compliance_audit_trail.retention_periods.populated_entries (per §1) — blocks rollout of any new training type until populated
```

---

## Provenance

Every field above traces to a real line in one of grove's 4 skill files.

| Config field | Source skill line |
|---|---|
| `compliance_audit_trail.required_fields` (4) | training-operations § Core Concepts § The Compliance Audit Trail — Four Required Fields; § Principles rule 2; scripts/training_ops.py REQUIRED_AUDIT_FIELDS |
| `compliance_audit_trail.immutability` | training-operations § Principles rule 6; § Fallback rule 5; skill-routing cross_cutting_hard_rules |
| `compliance_audit_trail.access_control` | training-operations § Core Concepts § Privacy Model; § Instructions Step 7; § Principles rule 8 |
| `compliance_audit_trail.privacy_model_inversion` | training-operations Principle 3; skill-routing cross_cutting_hard_rules `aggregate_only_inversion_in_training_operations` |
| `compliance_audit_trail.retention_periods` | training-operations § Core Concepts § Retention & Immutability; § Principles rule 4; § Fallback rule 3 |
| `compliance_audit_trail.expiry_alerts` | training-operations § Core Concepts § Proactive Expiry Management; scripts/training_ops.py expiry_alert_status() |
| `skill_gap_map.proficiency_scale` | skill-gap-map § Skills Matrix & Scoring; scripts/skill_gap.py PROFICIENCY_SCALE |
| `skill_gap_map.taxonomy_scoping` (5-15 skills) | skill-gap-map § Instructions Phase 2 |
| `skill_gap_map.criticality_bounds` (0-1) | skill-gap-map § Instructions Phase 5; scripts/skill_gap.py priority_score() |
| `skill_gap_map.rater_discrepancy_threshold` (>1 surfaces) | skill-gap-map § Principles rule 3; § Instructions Phase 4; § Fallback rule 2 |
| `skill_gap_map.top_priority_gaps_targets` (3-5) | skill-gap-map § Instructions Phase 6 |
| `skill_gap_map.action_routing_thresholds` | skill-gap-map § Build / Buy / Borrow / Bridge; scripts/skill_gap.py recommend_action() |
| `training_program_design.kirkpatrick_timing_targets` | training-program-design § Core Concepts § Timing Matters; scripts/training_program.py LEVEL_TIMING_TARGETS |
| `training_program_design.70_20_10_target` | training-program-design § Core Concepts § 70-20-10; scripts/training_program.py allocation_check_70_20_10() |
| `training_program_design.evaluation_survey.max_questions` (3) | training-program-design § Core Concepts § Short Evaluation Surveys; § Principles rule 3 |
| `training_program_design.required_drivers_check_required` | training-program-design § Instructions Phase 4; § Principles rule 5; § Fallback rule 4 |
| `training_program_design.level_4_business_result_required` | training-program-design § Instructions Phase 1; § Principles rule 1; § Fallback rule 1 |
| `deliberate_practice.component_decomposition` (3-7) | deliberate-practice § Instructions Phase 1 |
| `deliberate_practice.feedback_loop.latency_target` | deliberate-practice § Principles rule 4; § Instructions Phase 2 |
| `deliberate_practice.difficulty_calibration.success_rate_target` (0.5) | deliberate-practice § Instructions Phase 3 |
| `deliberate_practice.repetition_schedule` (3-5/week) | deliberate-practice § Instructions Phase 4 |
| `deliberate_practice.no_specific_hour_count_authority` | deliberate-practice § Principles rule 3 |
| `minimum_group_size` (5 default) | skill-gap-map + training-program-design rollup logic; shared with maslow config |
| `escalations.*` | grove-skill-routing.md § Cross-Agent Escalation Routing |
| `external_escalations.individual_crisis` | Universal Principle 3 (inherited from hire); wellbeing-monitoring Fallback rule 1 |
| `external_escalations.employment_and_regulatory_counsel` | training-operations Fallback rule 3; skill-gap-map Fallback (regulatory-exposure gaps) |
| `active_alerts.cross_jurisdiction_retention_variance` | training-operations § Core Concepts § Retention & Immutability |
| `tool_permissions.audit_trail_entry_edit_or_delete` (denied) | training-operations § Principles rule 6; § Fallback rule 5; cross-cutting hard rule |
| `tool_permissions.reading_individual_compliance_audit_trail` (allowed — EXCEPTION) | training-operations § Principles rule 3; § Core Concepts § Privacy Model — the aggregate-only inversion |
| `runtime_defaults.aggregate_only_inversion_scoped_to_training_operations_only` | training-operations Principle 3 + skill-routing cross_cutting_hard_rules |

## Debt Summary

Fields still `<FILL_IN>` as of this build (2026-07-31):

**CRITICAL (blocks rollout of specific work until filled):**
- `compliance_audit_trail.access_control.default_read_access_roles` — blocks new compliance-training rollout in a new scope until populated.
- `compliance_audit_trail.retention_periods.populated_entries` — blocks new-training-type rollout per jurisdiction until populated (route to operator + employment counsel).
- `external_escalations.individual_crisis` contact fields (inherited from Universal Principle 3) — blocks any grove work that could surface individual crisis (rare but possible in compliance context).

**Standard (loud per §14.7 but non-blocking):**
- `compliance_audit_trail.expiry_alerts.lead_time_override` — 90-day default works until overridden per org policy.
- `minimum_group_size.threshold_override` — default 5 works.
- `external_escalations.employment_and_regulatory_counsel.operator_contact_*` — needed before first compliance-scope work but can start with routing to operator.
- `external_escalations.tax_and_audit_counsel.operator_contact_*` — needed at audit-response time.
- `external_escalations.immigration_counsel.operator_contact_*` — needed only for cross-border training scenarios.
- `model_routing.default_model` and `fallback_model` — operator model-selection policy.

Per §14.7 each debt announces on every compiled skill invocation until filled or marked
`n/a` with a written reason. Per §1 rule, the audit-trail access-control and
retention-periods `<FILL_IN>`s carry additional weight — they block specific rollout work,
not just announce loud.
