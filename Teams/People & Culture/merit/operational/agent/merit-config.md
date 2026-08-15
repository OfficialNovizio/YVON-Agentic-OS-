<!--
Operational: agent config for merit (People & Culture / Performance Management) per §7 agent/.

Field derivation rule (§7): every field below traces to a real line in one of merit's 4
skill files. No padding, no copying maslow/grove/hire config shapes — merit has different
concerns (OKR-cycle governance, 9-box + succession thresholds, BSC governance, feedback
delivery defaults) than the other P&C agents.

Per §0.5: unknown values are <FILL_IN>, never invented.
Per §14.7: every <FILL_IN> announces itself in compiled skill preambles.

Provenance table at the bottom maps every field back to the source skill line.
-->

# merit — Agent Config

## Purpose

Operator-configurable surface merit's 4 skills read at runtime. Every field traces to a
specific skill line (see `## Provenance`). Values that are operator-specific (specific
critical-role list, current-cycle objective weights, individual-crisis contact block)
are `<FILL_IN>`. Config debt announces per §14.7.

---

## 1. OKR-Cycle Governance (performance-frame)

```yaml
# From performance-frame § Structure / Protocol; § Instructions Phases 1-5;
# § Principles rules 1-5. This block governs the performance-cycle mechanics.

okr_cycle:
  cadence: quarterly                        # § Principles rule 1 implicit; § Structure / Protocol
  cycle_length_weeks: 13                    # standard quarter

  cascade_source:
    company_okrs_owner: vista (Executive Office / Roadmap Lead)
    no_orphan_individual_okrs: true         # Principle 1 — LOAD-BEARING rule
    action_if_vista_okrs_missing: block_individual_okr_setting_route_to_vista

  individual_okr_shape:
    objectives_per_person_min: 3            # § Instructions Phase 1
    objectives_per_person_max: 5
    key_results_per_objective_min: 2
    key_results_per_objective_max: 4
    each_kr_must_be_measurable: true        # Doerr 2018 discipline; enforced

  ambition_calibration:
    target_achievability: 0.70              # § Instructions Phase 1 — heuristic per §0.6
    calibration_bounds:
      too_easy_signal: ">= 1.0 achievement across multiple cycles"
      too_hard_signal: "< 0.4 achievement (demotivating; likely setup for failure)"
    heuristic_flag: true                    # Doerr 2018 ch.5 guidance; not universal law

  mid_cycle_check:
    timing_relative_to_cycle_start_weeks: 6   # ~mid-quarter
    format: written_15_min_status_per_person
    per_kr_signal: [GREEN, AMBER, RED]         # signal-only, not full analysis
    red_kr_trigger_action: same_cycle_feedback_conversation_via_feedback_methods

  end_of_cycle_review:
    timing_relative_to_cycle_start_weeks: 13
    format: written_evidence_based_per_okr
    draft_shared_hours_before_conversation_min: 24     # Principle 3
    draft_shared_hours_before_conversation_max: 48
    delivered_via: feedback-methods                    # SBI + Radical Candor discipline
    conversation_duration_minutes: [30, 60]

  year_end_synthesis:
    aggregates_quarterly_cycles: 4
    pattern_flag_thresholds:
      consistent_y_across_quarters: 3        # 3+ quarters Y → succession-planning High Perf band candidate
      persistent_partial_across_quarters: 2  # 2+ quarters partial → grove's skill-gap-map
      persistent_n_across_quarters: 3        # 3+ quarters N → workforce-planning + operator + counsel
      high_variance_flag: true               # check external context before individual variance
```

## 2. 9-Box + Succession Thresholds (succession-planning)

```yaml
# From succession-planning § Structure / Protocol; § Instructions Phases 3-5;
# § Principles rules 2 + 3 + 5; scripts/succession_planning.py.

succession_planning:
  critical_role_identification:
    # Continuity-risk tests per Principle 1 (any Y qualifies as critical).
    thirty_day_disruption_test: true
    external_hire_recovery_test: true
    team_throughput_drop_test_percent: 20   # > 20% drop qualifies as critical
    # Common failure: only C-suite/Council roles treated as critical.
    do_not_limit_to_senior_titles: true

  target_successors_per_critical_role: 2    # min per Principle 2; ideal 2-3
  # Fewer than 2 = live risk (Moderate or worse per risk_flag).
  # Zero = MANDATORY governance escalation (Principle 5).

  readiness_levels:
    - ready_now
    - ready_1_2_years
    - ready_3_5_years
    - not_identified

  readiness_weights:
    ready_now: 3
    ready_1_2_years: 2
    ready_3_5_years: 1
    not_identified: 0

  bench_strength_risk_bands:
    critical: "score == 0"                   # zero successors → MANDATORY escalation
    high_risk: "score == 1"                  # single 3-5yr candidate
    moderate: "2 <= score <= 3"              # e.g., one Ready Now alone, or 1-2yr + 3-5yr
    healthy: "score >= 4"                    # e.g., Ready Now + 1-2yr, or two Ready Now

  nine_box_use_restrictions:
    permitted_use:
      - development_conversation_input
      - succession_placement_input
    forbidden_uses:                          # Principle 3 — LOAD-BEARING
      - compensation_input
      - pip_designation
      - public_ranking
      - permanent_label
    misuse_response: redirect_per_fallback_rule_3

  zero_successor_escalation:
    action: MANDATORY_governance_escalation
    route_to:
      - board (Governance)
      - marcus (Executive Office / Strategy)
    not_discretionary: true                  # Principle 5
    not_just_logged_in_report: true

  career_path_default: lattice_first         # Principle 4; check lateral / cross-venture before ladder
```

## 3. Balanced Scorecard Governance (hr-strategy-alignment)

```yaml
# From hr-strategy-alignment § Structure / Protocol; § Instructions Phases 3-7;
# § Principles rules 1-5; scripts/hr_scorecard.py.

hr_scorecard:
  perspectives:                              # 4 BSC perspectives — fixed reference
    - Financial
    - Employee/Customer
    - Internal Process
    - Learning & Growth

  strategic_objectives:
    top_objectives_per_venture_min: 3        # § Structure / Protocol implementation sequence
    top_objectives_per_venture_max: 5
    weights_sum_to_1: true                   # enforced in scripts/hr_scorecard.py
    per_cycle_reweight_required: true        # Principle 2 — static weights = misapplication
    source_of_objectives:                    # from Phase 1
      - marcus (Executive Office / Strategy)
      - board (Governance) cycle documentation
      - vista (Executive Office / Roadmap Lead) — company OKRs
      - requesting venture/department lead

  orphan_flagging:
    both_directions_required: true           # Principle 1 — LOAD-BEARING
    orphan_objective_response: gap_to_fill_recommend_p_and_c_skill_owner
    orphan_initiative_response: sunset_candidate_recommend_sunset_conversation_via_feedback_methods

  metric_discipline:
    metric_without_target: INCOMPLETE        # Principle 4 — never scored as green
    unmeasured_response: recommend_specific_metric_to_start_tracking
    do_not_fabricate_metric_values: true    # §0.5

  presentation_rule:
    gaps_and_orphans_as_prominently_as_wins: true   # Principle 3 — green-only scorecard not trustworthy

  aggregate_only:
    individual_perf_data_input_forbidden: true      # Principle 6
    consumes_only_aggregate_signals: true
    example_permitted_inputs:
      - retention_rate
      - time_to_hire
      - bench_strength_score
      - engagement_score
      - enps_trend
      - training_completion_rate
    example_forbidden_inputs:
      - individual_perf_score
      - per_person_9_box_placement
      - individual_recognition_history

  routing_out:
    budget_impact: board (via fiduciary-guard)
    strategic_priority_conflicts: marcus + board       # Principle 5
    aligns_and_recommends_never_authorizes: true
```

## 4. Feedback Delivery Defaults (feedback-methods)

```yaml
# From feedback-methods § Structure / Protocol; § Instructions Phases 1-6;
# § Principles rules 1-8.

feedback_methods:
  sbi_format:
    situation_specific: true                  # Instructions Phase 2 — no vague "recent meeting"
    behavior_observable_only: true            # no mind-reading, no personality attribution
    impact_factual: true                      # observable consequence, not interpretation

  sbi_anti_patterns_flag:                    # Instructions Phase 2 anti-pattern check
    - "you always..." → not observation, summary
    - "you seemed..." → interpretation, not behavior
    - "you're..." → personality label, not action

  radical_candor_quadrants:                  # Scott 2017 — fixed reference
    care_high_challenge_high: RADICAL_CANDOR  # the goal
    care_high_challenge_low: RUINOUS_EMPATHY  # nice but useless
    care_low_challenge_high: OBNOXIOUS_AGGRESSION
    care_low_challenge_low: MANIPULATIVE_INSINCERITY

  order_of_operations:                       # Scott 2017 — solicit → praise → criticize
    solicit_first: true                       # Principle 3 — LOAD-BEARING
    then_specific_praise: true
    then_specific_criticism: true

  delivery_discipline:
    deliver_then_pause: true                  # Principle 4 — no softening, no sandwich
    feedback_sandwich_forbidden: true         # Fallback rule 5 — push back on the pattern
    surprise_delivery_forbidden: true         # performance-frame Principle 3 — 24-48hr advance share

  recording_scope:
    record_individual_feedback_events: false  # Principle 5 — LOAD-BEARING
    build_per_person_feedback_ledger: false
    provides_framework_not_surveillance: true
```

## 5. Aggregate-Only Discipline

```yaml
# Universal Principle 7 aggregate-only inherited from hire. Merit is the P&C agent that
# most-frequently touches individual data (performance-frame's OKR + review; succession-
# planning's 9-box placement) but NEVER surfaces individually-identifiable data broadly.
# Unlike grove's training-operations aggregate-only inversion, merit has NO inversion —
# all merit outputs respect aggregate-only at the publication surface.

aggregate_only:
  internal_use_of_individual_data:
    performance_frame: allowed_manager_and_direct_report_only
    succession_planning: allowed_governance_and_manager_only
    feedback_methods: does_not_record_events
    hr_strategy_alignment: aggregate_only_never_individual

  publication_surface:
    per_person_9_box_placement_broadly: forbidden           # succession-planning Principle 8
    individual_perf_score_broadly: forbidden                # performance-frame Principle 5 inheritance
    aggregate_pattern_flags_permitted: true

  minimum_group_size:
    threshold_default: 5                                    # shared with maslow / grove pattern
    threshold_override: "<FILL_IN>"
    applies_to_all_publication_surfaces: true
```

## 6. Escalation Contacts (routing to real YVON agents)

```yaml
# Verified against root CLAUDE.md §2 (2026-07-31 build).

escalations:
  company_okrs_source:
    route_to: vista
    department: Executive Office
    role: Roadmap Lead
    verified_in_claude_md: true

  zero_successor_critical_role_MANDATORY:
    # LOAD-BEARING — succession-planning Principle 5.
    route_to_primary: board
    route_to_secondary: marcus
    departments: [Governance, Executive Office]
    not_discretionary: true

  cross_venture_strategic_priority_conflict:
    route_to: marcus
    escalate_to: board
    departments: [Executive Office, Governance]
    verified_in_claude_md: true

  strategic_objectives_source:
    route_to: marcus
    department: Executive Office
    role: Strategy
    verified_in_claude_md: true

  budget_approval:
    route_to: board
    department: Governance
    via: fiduciary-guard skill
    future_owner: Finance department when built

  compensation_change_from_review:
    route_to: payroll-and-eor
    department: People & Culture
    owner_agent: hire (Lead)
    do_not_mix_into_review_conversation: true              # LOAD-BEARING per performance-frame Principle 4

  external_candidate_pool:
    route_to: hiring-kit
    department: People & Culture
    owner_agent: hire (Lead)

  successor_onboarding:
    route_to: hiring-kit
    department: People & Culture
    owner_agent: hire (Lead)

  persistent_partial_pattern:
    route_to: skill-gap-map
    department: People & Culture
    owner_agent: grove
    trigger: 2+ quarters partial from performance-frame year-end synthesis

  persistent_n_pattern:
    route_to: workforce-planning
    department: People & Culture
    owner_agent: hire (Lead)
    also_route_to: operator_plus_employment_counsel
    trigger: 3+ quarters N from performance-frame year-end synthesis
    context: PIP-adjacent path

  structural_red_kr_cause:
    route_to: workforce-planning
    department: People & Culture
    owner_agent: hire (Lead)
    trigger: mid-cycle RED KR traces to understaffing / missing tools / structural cause

  lattice_move_structural_change:
    route_to: workforce-planning
    department: People & Culture
    owner_agent: hire (Lead)
    trigger: succession-planning Phase 7 lattice recommendation

  development_plan_execution:
    route_to_primary: skill-gap-map
    route_to_secondary: training-program-design
    department: People & Culture
    owner_agent: grove
    trigger: succession-planning Phase 6 stretch experience

  pii_in_perf_data:
    route_to: veil
    department: Cybersecurity
    verified_in_claude_md: true

  motivation_wellbeing_recognition:
    route_to: maslow
    department: People & Culture (sibling)

  hiring_workforce_payroll:
    route_to: hire
    department: People & Culture
    role: Lead

  learning_development_gap_analysis:
    route_to: grove
    department: People & Culture (sibling)

  aggregate_people_analytics_metrics:
    route_to: shared_os_people_analytics_metrics
    status: future — task #12
    interim: hold_and_log

  ats_di_funnel_reporting:
    route_to: ats-selection
    department: People & Culture
    owner_agent: hire (Lead)
    context: feeds Internal Process perspective on hr-strategy-alignment scorecard
```

## 7. External Escalation Lanes (no YVON agent exists)

```yaml
external_escalations:
  individual_crisis:
    # Inherited from Universal Principle 3 across all P&C. Rare in merit context but
    # possible via performance-conversation surfacing distress, or succession-conversation
    # touching a personal issue, or feedback-preparation revealing operator distress.
    triggers:
      - any signal of individual crisis / self-harm / serious personal distress via ANY
        channel during merit skill work
    action: immediate_stop_and_escalate_per_wellbeing_monitoring_fallback
    route_to:
      manager: <affected person's direct manager>
      hr_ops_contact_name: "<FILL_IN>"
      hr_ops_contact_email: "<FILL_IN>"
      eap_provider_name: "<FILL_IN>"
      eap_provider_url: "<FILL_IN>"
      eap_provider_phone: "<FILL_IN>"
    operator_override_allowed: false

  employment_counsel_pip_and_discrimination:
    triggers:
      - PIP formalization from persistent-N pattern
      - discriminatory phrasing surfacing during feedback drafting or review drafting
      - harassment signal in a review comment or performance conversation
      - protected-class impact concern surfacing during 9-box or perf-cycle work
    contact_role_needed: employment counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  strategic_priority_conflicts_across_ventures:
    # Also has a marcus + board route in §6 escalations — external counsel isn't the primary
    # route here, but named for completeness if a strategic conflict touches legal exposure.
    contact_role_needed: strategic-counsel escalation only when marcus + board request it
    operator_contact_name: "<FILL_IN>"
```

## 8. Time-Sensitive Alerts (proactive surface)

```yaml
active_alerts:
  # merit's scope generates the FEWEST regulatory alerts of any P&C agent —
  # performance / succession / feedback / strategy-alignment aren't regulation-heavy
  # by default. Compare to hire (5 alerts), grove (1), maslow (1).

  # No standing time-sensitive regulatory alerts for merit today.
  # Alerts would emerge if:
  #   - a jurisdiction introduces mandatory performance-review documentation requirements
  #   - pay-transparency laws require merit's aggregate outputs feed into public reporting
  #   - discrimination-testing requirements emerge for 9-box or perf-review outputs
  # In any of those cases, add the alert here and route via operator + employment counsel.
  standing_alerts: []
```

## 9. Tool Permissions (governance layer)

```yaml
# Per §7 agent/: GOVERNANCE layer — what merit is ALLOWED to do at runtime.
# Technical needs live in operational/tool/merit-tool-requirements.md.

tool_permissions:
  file_read: allowed
  file_write:
    allowed_paths:
      - Teams/People & Culture/merit/**
      - Teams/People & Culture/**             # dept scope for coordination outputs
      - store/tasks/**
    denied_paths:
      - Teams/**/marketplace/**               # marketplace verbatim — but merit has zero marketplace skills anyway
      - .git/**
      - Teams/Engineering/SECURITY-CHARTER.md # operator-amended only

  python_or_shell_execution:
    allowed_scripts:
      - Teams/People & Culture/merit/custom/succession-planning/scripts/succession_planning.py
      - Teams/People & Culture/merit/custom/hr-strategy-alignment/scripts/hr_scorecard.py
      - Shared OS/logical/**                  # any future logical script
    self_tests_before_ship: required          # per §5.2

  web_search:
    allowed: true
    scope: "verify research citations (Doerr, Grove, Bock, Scott, Weitzel, Kaplan & Norton, Kirkpatrick)"
    denied: "not for individual-level searches; not for close-call performance decisions (route to operator + employment counsel)"

  publishing_individual_9box_placements_broadly:
    allowed: false
    rationale: "succession-planning Principle 8 — governance and manager-conversation surface only; public ranking is misuse of framework."

  publishing_individual_perf_scores_broadly:
    allowed: false
    rationale: "performance-frame Principle 5 inheritance; individual perf data belongs to manager-and-direct-report only."

  recording_individual_feedback_events:
    allowed: false
    rationale: "feedback-methods Principle 5 — LOAD-BEARING. Merit teaches the framework; does not build per-person feedback ledger."

  mixing_comp_discussion_into_review_conversation:
    allowed: false
    rationale: "performance-frame Principle 4 — LOAD-BEARING. Comp routes to payroll-and-eor or future comp-benchmarking on separate cadence."

  using_9box_as_comp_pip_or_ranking_input:
    allowed: false
    rationale: "succession-planning Principle 3 — LOAD-BEARING. 9-box is a development-conversation input; misuse destroys framework."

  fabricating_business_objectives_for_scorecard:
    allowed: false
    rationale: "hr-strategy-alignment Fallback rule 1 — no fabrication. Objectives come from marcus / vista / board / requester. Missing objectives = scorecard incomplete."

  fabricating_metric_values:
    allowed: false
    rationale: "hr-strategy-alignment Principle 4 + §0.5. Missing metric = INCOMPLETE, never guess."

  silently_picking_venture_priorities:
    allowed: false
    rationale: "hr-strategy-alignment Principle 5 — cross-venture tradeoffs route to marcus + board for the call."

  publishing_segmented_figures_below_min_group_size:
    allowed: false
    rationale: "Universal Principle 4 aggregate-privacy rule applies to hr-strategy-alignment scorecard aggregates."

  reading_individual_demographic_data:
    allowed: false
    rationale: "Universal Principle 2 aggregate-only rule; demographic data not permitted for 9-box or perf-cycle work."
```

## 10. Model Routing

```yaml
model_routing:
  default_model: "<FILL_IN>"
  fallback_model: "<FILL_IN>"
  temperature_for_okr_draft: 0.4                 # some latitude within McCord voice
  temperature_for_written_review_draft: 0.3      # evidence-based; consistency matters
  temperature_for_feedback_script: 0.3           # delivery discipline
  temperature_for_scorecard_analysis: 0.2        # analytical; low creativity
  temperature_for_9box_placement_rationale: 0.3  # evidence-based analysis
  temperature_for_sunset_conversation_script: 0.4  # diplomatic delivery latitude
```

## 11. Runtime Behavior Defaults

```yaml
runtime_defaults:
  identity_governs_voice: true                   # tone inherited from hire
  identity_can_override_method: false
  charter_senior_to_identity: true
  charter_senior_to_config: true
  universal_principles_senior_to_identity_flavored: true

  # merit-specific defaults:
  no_orphan_okr_rule_enforced: true              # performance-frame Principle 1
  comp_separation_from_review_rule_enforced: true # performance-frame Principle 4
  nine_box_not_comp_or_pip_or_ranking_enforced: true  # succession-planning Principle 3
  zero_successor_MANDATORY_escalation: true      # succession-planning Principle 5
  no_observation_of_individual_feedback_events: true  # feedback-methods Principle 5
  orphan_flagging_both_directions: true          # hr-strategy-alignment Principle 1
  aggregate_only_at_publication_surface: true    # universal for merit — no aggregate-only inversion (unlike grove)

  verification_before_completion:
    required_on_every_output: true
    exempt_operators: []

  fill_in_debt_announcement:
    on_every_invocation: true
    format: "one line per unfilled field, in compiled skill preamble"
    critical_fields_blocking_invocation:
      - individual_crisis contact fields (per external_escalations)
```

---

## Provenance

Every field above traces to a real line in one of merit's 4 skill files.

| Config field | Source skill line |
|---|---|
| `okr_cycle.cadence` (quarterly) | performance-frame § Structure / Protocol; § Principles rule 1 implicit |
| `okr_cycle.cascade_source.no_orphan_individual_okrs` | performance-frame Principle 1 + Fallback rule 1 (LOAD-BEARING) |
| `okr_cycle.individual_okr_shape` (3-5 O; 2-4 KR) | performance-frame § Instructions Phase 1 |
| `okr_cycle.ambition_calibration.target_achievability` (0.70) | performance-frame § Instructions Phase 1 (Doerr 2018 ch.5 heuristic) |
| `okr_cycle.mid_cycle_check` (6 weeks; GREEN/AMBER/RED signal) | performance-frame § Instructions Phase 2 |
| `okr_cycle.end_of_cycle_review.draft_shared_hours_before` (24-48) | performance-frame § Instructions Phase 3; § Principles rule 3 |
| `okr_cycle.year_end_synthesis.pattern_flag_thresholds` | performance-frame § Instructions Phase 4 |
| `succession_planning.critical_role_identification.*` | succession-planning § Instructions Phase 1 (continuity-risk tests) |
| `succession_planning.target_successors_per_critical_role` (2) | succession-planning Principle 2 |
| `succession_planning.readiness_weights` (3/2/1/0) | succession-planning § Instructions Phase 5; scripts/succession_planning.py |
| `succession_planning.bench_strength_risk_bands` | scripts/succession_planning.py risk_flag() |
| `succession_planning.nine_box_use_restrictions` (Principle 3 forbidden uses) | succession-planning Principle 3 (LOAD-BEARING) |
| `succession_planning.zero_successor_escalation.route_to` (board + marcus) | succession-planning Principle 5 + Phase 8 (MANDATORY) |
| `succession_planning.career_path_default` (lattice-first) | succession-planning Principle 4 |
| `hr_scorecard.perspectives` (4 BSC) | hr-strategy-alignment § Structure / Protocol; scripts/hr_scorecard.py BSC_PERSPECTIVES |
| `hr_scorecard.strategic_objectives.top_objectives_per_venture_min/max` (3-5) | hr-strategy-alignment § Structure / Protocol implementation sequence |
| `hr_scorecard.strategic_objectives.weights_sum_to_1` | hr-strategy-alignment § Instructions Phase 5; scripts/hr_scorecard.py build_scorecard() validation |
| `hr_scorecard.orphan_flagging.both_directions_required` | hr-strategy-alignment Principle 1 + Phase 4 (LOAD-BEARING) |
| `hr_scorecard.metric_discipline.metric_without_target: INCOMPLETE` | hr-strategy-alignment Principle 4; scripts/hr_scorecard.py progress() returns None |
| `hr_scorecard.aggregate_only.individual_perf_data_input_forbidden` | hr-strategy-alignment Principle 6 |
| `hr_scorecard.routing_out.strategic_priority_conflicts` (marcus + board) | hr-strategy-alignment Principle 5 |
| `feedback_methods.sbi_anti_patterns_flag` | feedback-methods § Instructions Phase 2 anti-pattern check |
| `feedback_methods.radical_candor_quadrants` | feedback-methods § Structure / Protocol; Scott 2017 |
| `feedback_methods.order_of_operations.solicit_first` | feedback-methods Principle 3 (LOAD-BEARING) |
| `feedback_methods.delivery_discipline.deliver_then_pause` | feedback-methods Principle 4 |
| `feedback_methods.recording_scope.record_individual_feedback_events: false` | feedback-methods Principle 5 (LOAD-BEARING) |
| `aggregate_only.publication_surface.per_person_9_box_placement_broadly: forbidden` | succession-planning Principle 8 |
| `aggregate_only.minimum_group_size.threshold_default` (5) | shared discipline across maslow / grove / merit |
| `escalations.zero_successor_critical_role_MANDATORY` (board + marcus) | succession-planning Principle 5 + Phase 8 |
| `escalations.compensation_change_from_review.do_not_mix_into_review_conversation` | performance-frame Principle 4 |
| `tool_permissions.publishing_individual_9box_placements_broadly` (denied) | succession-planning Principle 8 |
| `tool_permissions.recording_individual_feedback_events` (denied) | feedback-methods Principle 5 |
| `tool_permissions.mixing_comp_discussion_into_review_conversation` (denied) | performance-frame Principle 4 |
| `tool_permissions.using_9box_as_comp_pip_or_ranking_input` (denied) | succession-planning Principle 3 |
| `tool_permissions.fabricating_*` (denied) | Universal §0.5 rule; hr-strategy-alignment Principle 1 |
| `runtime_defaults.zero_successor_MANDATORY_escalation` | succession-planning Principle 5 |
| `runtime_defaults.aggregate_only_at_publication_surface` (universal for merit) | Contrasts explicitly with grove's aggregate-only inversion for training-operations |

## Debt Summary

Fields still `<FILL_IN>` as of this build (2026-07-31):

**CRITICAL (blocks invocation until filled):**
- `external_escalations.individual_crisis` contact fields (per Universal Principle 3 inherited — same pattern as maslow's §1 and grove's §7).

**Standard (loud per §14.7 but non-blocking):**
- `aggregate_only.minimum_group_size.threshold_override` — default 5 works.
- `external_escalations.employment_counsel_pip_and_discrimination.operator_contact_*` — needed before first persistent-N pattern surfaces or before first review draft with sensitive content.
- `external_escalations.strategic_priority_conflicts_across_ventures.operator_contact_name` — needed only when marcus + board request external counsel involvement.
- `model_routing.default_model` and `fallback_model` — operator model-selection policy.

Per §14.7 each debt announces on every compiled skill invocation until filled or marked
`n/a`. Individual-crisis contact fields carry the same invocation-blocking weight as
maslow's §1 pattern.
