<!--
Operational: agent config for maslow (People & Culture / Motivation) per §7 agent/.

Field derivation rule (§7): every field below traces to a real line in one of maslow's 4
skill files. No padding, no copying hire's shape — maslow has fewer external dependencies
than hire, so this config is smaller.

Per §0.5: unknown values are <FILL_IN>, never invented.
Per §14.7: every <FILL_IN> announces itself in the compiled skill's preamble until filled
or marked n/a.

Provenance table at the bottom maps every field back to the source skill line.
-->

# maslow — Agent Config

## Purpose

Operator-configurable surface maslow's 4 skills read at runtime. Values that are truly
operator-specific (individual-crisis escalation contact, minimum-group-size threshold,
tier point values) are `<FILL_IN>`. Config debt announces per §14.7 until filled.

---

## 1. Individual-Crisis Escalation (HARDEST BOUNDARY — fill first)

```yaml
# HARD BOUNDARY per wellbeing-monitoring § Fallback rule 1 and § Principles rule 3.
# Also motivation-map § Principles rule 8; recognition-program § Fallback last rule.
# ANY individual crisis, self-harm, or serious personal distress signal via ANY channel
# triggers this escalation — immediately, no exceptions, no operator overrides.
#
# This is the FIRST field to fill. Every day this is <FILL_IN> is a day maslow cannot
# safely process a crisis signal.

individual_crisis_escalation:
  route_to:
    manager: "<FILL_IN>"                 # the affected person's direct manager
    hr_ops_contact_name: "<FILL_IN>"     # operator or HR ops lead
    hr_ops_contact_email: "<FILL_IN>"
    eap_provider_name: "<FILL_IN>"       # Employee Assistance Program vendor
    eap_provider_url: "<FILL_IN>"        # so the message maslow surfaces has a real link
    eap_provider_phone: "<FILL_IN>"      # 24/7 crisis line, ideally
  emergency_backstop:
    us: "988 (Suicide & Crisis Lifeline, US)"
    international: "<FILL_IN>"           # varies per jurisdiction
  operator_override_allowed: false       # never
  applies_to: [all 4 maslow skills]
```

---

## 2. Pulse & Aggregate-Signal Thresholds

```yaml
# --- motivation-map thresholds ---

motivation_pulse:
  cadence: quarterly                     # Principle 1 — hard rule per motivation-map
  question_count_min: 9                  # 3-4 per SDT need × 3 needs = 9-12
  question_count_max: 12
  questions_per_need_min: 3
  questions_per_need_max: 4
  likert_scale_min: 1
  likert_scale_max: 5
  pulse_window_days_min: 5               # Phase 3 — pulse open window
  pulse_window_days_max: 10
  response_rate_alert_threshold: 0.40    # Fallback rule 1 — below this, the drop IS the finding

  # Score band interpretation (heuristic per §0.6; overridable)
  need_score_bands:
    satisfied_min: 4.0
    stable_range: [3.0, 4.0]
    attention_range: [2.5, 3.0]
    starved_max: 2.5

  # Trend delta thresholds (heuristic per §0.6)
  trend_delta_rising: 0.3                # Δ ≥ +0.3 → rising
  trend_delta_declining: -0.3            # Δ ≤ -0.3 → declining
  # (|Δ| < 0.3 is stable)

  minimum_viable_action_rule: mandatory  # Phase 2 — communicate action from last cycle before new pulse
  interventions_from_menu_only: true     # Principle 4 — no invented interventions

# --- wellbeing-monitoring thresholds ---

wellbeing_pulse:
  cadence: quarterly_or_operator_defined # separate cadence from motivation-map allowed
  question_count_min: 5
  question_count_max: 10
  enps_question_included_every_cycle: true   # Principle 6 — comparable trend line

  burnout_flag_rule:
    RED_conditions:
      - enps_trend: declining
        workload_elevated: true
    AMBER_conditions:
      - enps_trend: declining
        workload_elevated: false
      - enps_trend: stable_or_rising
        workload_elevated: true
    GREEN_conditions:
      - enps_trend: stable_or_rising
        workload_elevated: false

# --- Shared minimum-group-size suppression ---

minimum_group_size:
  # Used by wellbeing-monitoring, recognition-program, motivation-map.
  # Same threshold as future Shared OS: people-analytics-metrics (candidate for §13.6 promotion).
  threshold_default: 5                   # typical HR privacy floor
  threshold_override: "<FILL_IN>"        # set per org privacy policy (5-8 typical)
  suppression_action: [suppress_segmented_figure, roll_up_or_qualitative_report]
  never_publish_below_threshold: true
```

## 3. Recognition Program Config

```yaml
# --- recognition-program thresholds ---

recognition_program:
  # Point tiers — operator defines the tier structure and point values.
  # recognition_program.py's tier_points() function looks up by name from this dict.
  tier_map:
    peer_shout_out: "<FILL_IN>"          # low points, high frequency (Bucketlist tier 1)
    manager_recognition: "<FILL_IN>"     # medium points, tied to specific outcome (tier 2)
    exceptional_impact: "<FILL_IN>"      # high points, cross-team/venture (tier 3)
    # optional tier 4:
    transformative_annual: "<FILL_IN>"   # highest, rare

  # Number of tiers — heuristic 3-5 per Bucketlist guidance
  tier_count_min: 3
  tier_count_max: 5

  fast_pathway_timeliness:
    target_hours: 48                     # Instructions Step 4 — 48hr target; ~24hr optimal per Gallup
    slipped_threshold_multiplier: 2      # median > target × 2 = SLIPPED
    failed_threshold_multiplier: 2       # median > target × 2 = FAILED (per timeliness_status script)

  program_refresh_cadence_months: 12     # Output Format — refresh trigger at ~12 months in

  budget_approval_required_before_publish: true    # Fallback rule 3 — no external commitments without board sign-off
  budget_approval_route: board (via fiduciary-guard)  # placeholder until Finance agent exists
```

## 4. Escalation Contacts (routing to real YVON agents)

```yaml
# Verified against root CLAUDE.md §2 (2026-07-31 build).

escalations:
  structural_cause_from_burnout_or_motivation:
    route_to: workforce-planning
    owner_agent: hire
    department: People & Culture
    via: hire's `workforce-planning` custom skill
    typical_case: workload-driven RED flag traced to span/layer/staffing gap

  compensation_or_pay_equity:
    route_to: payroll-and-eor
    owner_agent: hire
    department: People & Culture
    typical_case: recognition-request masking a comp problem; wellbeing signal traced to pay

  budget_approval:
    route_to: board
    department: Governance
    via: fiduciary-guard skill
    typical_case: recognition-program budget; program-refresh spend
    future_owner: Finance department when built

  pii_survey_or_recognition_platform:
    route_to: veil
    department: Cybersecurity
    verified_in_claude_md: true

  sso_scim_for_recognition_platform:
    route_to: keyring
    department: Cybersecurity
    verified_in_claude_md: true

  aggregate_psychosocial_risk_trends:
    route_to: risk_and_esg_department
    status: future — task #6 in current build roster
    verified_in_claude_md: false          # not yet built
    interim_action: hold and log for future routing

  people_analytics_metrics_requests:
    route_to: shared_os_people_analytics_metrics
    status: future — task #12 (Shared OS shared skill)
    interim_action: hold and log; task #12 will build

  performance_management_adjacent:
    route_to: merit
    department: People & Culture (sibling)
    status: pending
    interim_action: route to operator with note

  learning_development_interventions:
    route_to: grove
    department: People & Culture (sibling)
    status: pending
    interim_action: recommend the direction; note grove-not-yet-built in output
```

## 5. External Escalation Lanes (no YVON agent exists)

```yaml
# These lanes route OUT of the fleet. Operator contact required.

external_escalations:
  individual_crisis:
    # Duplicate of §1 above for structural completeness — the actual contact info
    # lives in §1 which is the hardest-boundary block in this config.
    see: "§1 individual_crisis_escalation"
    do_not_duplicate_contact_data_here: true

  employment_law:
    triggers:
      - protected-class impact signal in an aggregate report
      - harassment signal in a survey free-text response (rare — most such content routes to §1 crisis path first)
      - recognition-program equity finding rising to potential legal exposure
    contact_role_needed: employment counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  recognition_platform_admin_actions:
    triggers:
      - platform configuration
      - permission grants on the recognition platform
      - vendor-side integration changes
    action: route to operator
    rationale: maslow produces the design and audit, not the platform-admin configuration
```

## 6. Time-Sensitive Regulatory Alerts (proactive surface per source skills)

```yaml
active_alerts:
  iso_45003_psychosocial_risk:
    fact: "ISO 45003 (2021) — occupational health and safety management: psychosocial risks. Increasingly board-level accountability. When YVON's Risk & ESG department comes online (task #6), aggregate psychosocial-risk trends route to that dept per governance."
    source: wellbeing-monitoring § Core Concepts — Governance Context
    action: surface proactively whenever a wellbeing report is going to board / operator
    retire_after: n/a
    on_retire: null

  # No other time-sensitive regulatory alerts for maslow scope currently.
  # Compare to hire-config.md § 5 which has 5 alerts (Greenhouse API deprecation, EU
  # Platform Work Directive, Germany €50k, Minnesota PFML, FLSA salary threshold) —
  # maslow's scope generates fewer regulatory alerts than hire's does.
```

## 7. Tool Permissions (governance layer)

```yaml
# Per §7 agent/: GOVERNANCE layer for tool access — what maslow is ALLOWED to do at
# runtime. Technical needs (which skill needs file-write vs script-execution) live in
# operational/tool/maslow-tool-requirements.md.

tool_permissions:
  file_read: allowed
  file_write:
    allowed_paths:
      - Teams/People & Culture/maslow/**   # own agent scope
      - Teams/People & Culture/**          # dept scope for coordination outputs
      - store/tasks/**                     # task specs when maslow runs a work item
    denied_paths:
      - Teams/**/marketplace/**            # marketplace skills are verbatim — but maslow has none
      - .git/**
      - Teams/Engineering/SECURITY-CHARTER.md   # Charter is operator-amended only

  python_or_shell_execution:
    allowed_scripts:
      - Teams/People & Culture/maslow/custom/wellbeing-monitoring/scripts/wellbeing_monitor.py
      - Teams/People & Culture/maslow/custom/recognition-program/scripts/recognition_program.py
      - Shared OS/logical/**               # any future logical script maslow's skills grow to import
    self_tests_before_ship: required        # per §5.2 discipline

  web_search:
    allowed: true
    scope: "verify research citations, verify ISO 45003 governance updates, verify SDT paper citations"
    denied: "not for individual-level searches or anything that could produce individually-identifiable information about an employee"

  reading_individual_employee_perf_data:
    allowed: false
    rationale: "wellbeing-monitoring Principle 1, motivation-map Principle 8, recognition-program Principle 6 — aggregate-only, no exceptions. Individual perf data belongs to merit (when built)."

  reading_individual_wellbeing_or_health_data:
    allowed: false
    rationale: "wellbeing-monitoring Principle 1 — HARD BOUNDARY. Individual mental-health work is fully out of scope; any signal escapes to §1 individual_crisis_escalation."

  reading_individual_demographic_data:
    allowed: false
    rationale: "Universal Principle 7 (aggregate-only for people data) inherited from hire; ats-selection Topic D discipline extends here."

  reading_individual_recognition_preferences_or_history:
    allowed: false
    rationale: "recognition-program Instructions Step 6 — aggregate preference pattern at team level only; individual preference never surfaces identifiably."

  writing_to_recognition_or_survey_platform_apis:
    allowed: false
    rationale: "maslow produces the design and the audit, not the click-through configuration. Route to operator per §5 external_escalations."

  publishing_segmented_figures_below_min_group_size:
    allowed: false
    rationale: "wellbeing-monitoring Principle 2, motivation-map Instructions Step 4, recognition-program Principle 4 — hard rule inherited across all 3 quantitative skills."
```

## 8. Model Routing

```yaml
model_routing:
  default_model: "<FILL_IN>"              # operator picks (e.g., claude-sonnet-4-5 for advisory)
  fallback_model: "<FILL_IN>"
  temperature_for_pulse_question_generation: 0.3   # low-medium; consistency matters for trend comparability
  temperature_for_intervention_memo: 0.4           # slight latitude within McCord voice
  temperature_for_crisis_escalation_message: 0.1   # extremely low; the message follows a strict escalation template
```

## 9. Runtime Behavior Defaults

```yaml
runtime_defaults:
  identity_governs_voice: true             # tone inherited from hire's identity anchor
  identity_can_override_method: false      # never
  charter_senior_to_identity: true
  charter_senior_to_config: true
  universal_principles_senior_to_identity_flavored: true

  # maslow-specific defaults:
  aggregate_only_across_all_4_skills: true
  overjustification_effect_rule_enforced: true   # motivation-map Principle 6 → recognition never fires for autonomy/competence starvation
  minimum_viable_action_rule_enforced: true      # motivation-map Phase 2 + wellbeing-monitoring Step 7

  verification_before_completion:
    required_on_every_output: true
    exempt_operators: []                   # no exemptions

  fill_in_debt_announcement:
    on_every_invocation: true
    format: "one line per unfilled field, in the compiled skill's preamble"
    escalation: "§1 individual_crisis_escalation fields left <FILL_IN> block ANY skill invocation until filled"
```

---

## Provenance

Every field above traces back to a real line in one of maslow's 4 skill files.
Audit whenever config or skills change.

| Config field | Source skill line |
|---|---|
| `individual_crisis_escalation` (all fields) | wellbeing-monitoring § Fallback rule 1; § Principles rule 3; motivation-map § Principles rule 8; recognition-program § Fallback last rule; skill-routing § HARD BOUNDARY row |
| `motivation_pulse.cadence` (quarterly) | motivation-map § Principles rule 1 |
| `motivation_pulse.question_count_min/max` (9-12) | motivation-map § Instructions Phase 1 |
| `motivation_pulse.questions_per_need_min/max` (3-4) | motivation-map § Instructions Phase 1 |
| `motivation_pulse.likert_scale` (1-5) | motivation-map § Instructions Phase 1 |
| `motivation_pulse.pulse_window_days_min/max` (5-10) | motivation-map § Instructions Phase 3 |
| `motivation_pulse.response_rate_alert_threshold` (0.40) | motivation-map § Fallback rule 1 |
| `motivation_pulse.need_score_bands` (4.0+ / 3.0-4.0 / 2.5-3.0 / <2.5) | motivation-map § Instructions Phase 4 (heuristic per §0.6) |
| `motivation_pulse.trend_delta_rising/declining` (±0.3) | motivation-map § Instructions Phase 4 (heuristic per §0.6) |
| `motivation_pulse.minimum_viable_action_rule` (mandatory) | motivation-map § Instructions Phase 2; § Principles rule 5 |
| `motivation_pulse.interventions_from_menu_only` | motivation-map § Principles rule 4 |
| `wellbeing_pulse.enps_question_included_every_cycle` | wellbeing-monitoring § Principles rule 6 |
| `wellbeing_pulse.burnout_flag_rule` (RED/AMBER/GREEN) | wellbeing-monitoring § Instructions Step 5; wellbeing_monitor.py burnout_risk_flag() |
| `minimum_group_size.threshold_default` (5) | wellbeing-monitoring § Instructions Step 4; recognition-program § Instructions Step 7; motivation-map § Instructions Step 4 (shared logic across 3 skills) |
| `recognition_program.tier_map` | recognition-program § Instructions Step 3; recognition_program.py tier_points() |
| `recognition_program.tier_count_min/max` (3-5) | recognition-program § Instructions Step 3 (Bucketlist heuristic) |
| `recognition_program.fast_pathway_timeliness.target_hours` (48) | recognition-program § Instructions Step 4; recognition_program.py timeliness_status() default |
| `recognition_program.program_refresh_cadence_months` (12) | recognition-program § Output Format |
| `recognition_program.budget_approval_required_before_publish` | recognition-program § Fallback rule 3 |
| `escalations.structural_cause_from_burnout_or_motivation` (workforce-planning) | motivation-map § Instructions Phase 5 matrix; wellbeing-monitoring § Instructions Step 6 |
| `escalations.compensation_or_pay_equity` (payroll-and-eor) | recognition-program § When to Use "Do NOT use for"; § Fallback rule 1 |
| `escalations.budget_approval` (board) | recognition-program § Fallback rule 3; § Instructions Step 3 |
| `escalations.pii_survey_or_recognition_platform` (veil) | maslow-skill-routing § Cross-Agent Escalation Routing |
| `escalations.sso_scim_for_recognition_platform` (keyring) | maslow-skill-routing § Cross-Agent Escalation Routing |
| `escalations.aggregate_psychosocial_risk_trends` (future Risk & ESG) | wellbeing-monitoring § Core Concepts — Governance Context |
| `active_alerts.iso_45003_psychosocial_risk` | wellbeing-monitoring § Core Concepts — Governance Context |
| `tool_permissions.python_or_shell_execution` (2 scripts) | wellbeing-monitoring § Python Utility; recognition-program § Instructions Step 7 |
| `tool_permissions.reading_individual_*` (all denied) | wellbeing-monitoring Principle 1; motivation-map Principle 8; recognition-program Principle 6; Universal Principle 7 (inherited from hire) |
| `runtime_defaults.overjustification_effect_rule_enforced` | motivation-map § Principles rule 6; SDT skill § Principles rule 4 |
| `runtime_defaults.minimum_viable_action_rule_enforced` | motivation-map § Instructions Phase 2; wellbeing-monitoring § Instructions Step 7 |

## Debt Summary

Fields still `<FILL_IN>` as of this build (2026-07-31):

**§1 CRITICAL (blocks skill invocation until filled):**
- `individual_crisis_escalation.route_to.manager` — needs to resolve per-affected-person at runtime; template placeholder here.
- `individual_crisis_escalation.route_to.hr_ops_contact_name`
- `individual_crisis_escalation.route_to.hr_ops_contact_email`
- `individual_crisis_escalation.route_to.eap_provider_name`
- `individual_crisis_escalation.route_to.eap_provider_url`
- `individual_crisis_escalation.route_to.eap_provider_phone`
- `individual_crisis_escalation.emergency_backstop.international`

**Standard (loud per §14.7 but non-blocking):**
- `minimum_group_size.threshold_override` — operator-policy field; default 5 works until overridden.
- `recognition_program.tier_map` (all 4 tier point values) — operator sets when launching the first program.
- `external_escalations.employment_law.operator_contact_name` and `.operator_contact_email`.
- `model_routing.default_model` and `fallback_model`.

Per §14.7 each debt announces itself in every compiled skill invocation until filled or
marked `n/a` with a written reason. Per §1 rule, the crisis-escalation fields carry
special weight — they block invocation entirely until filled, not just announce.
