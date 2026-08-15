<!--
Operational: agent config for herald (Comms & PR / Lead — PR & Media) per §7 agent/.

Field derivation rule (§7): every field below traces to a real line in one of herald's
4 skill files. No padding, no copying P&C config shapes — herald has different concerns
(CEO sign-off gate + embargo protocol + AVE-refusal-at-code-level + media-training
thresholds + newsjacking timing).

Per §0.5: unknown values are <FILL_IN>, never invented.
Per §14.7: every <FILL_IN> announces itself in compiled skill preambles.

Provenance table at the bottom maps every field back to the source skill line.
-->

# herald — Agent Config

## Purpose

Operator-configurable surface herald's 4 skills read at runtime. Every field traces to
a specific skill line (see `## Provenance`). Values that are operator-specific (CEO +
delegated authority names, embargo enforcement thresholds, individual-crisis contacts)
are `<FILL_IN>`. Config debt announces per §14.7.

---

## 1. CEO Sign-Off Gate + Delegated Authority Matrix (press-kit)

```yaml
# From press-kit § Instructions Phase 6; § Principles rule 4 (LOAD-BEARING).
# No external send without sign-off on the ACTUAL FINAL VERSION.

ceo_signoff:
  required_before_external_send: true          # LOAD-BEARING — Principle 4
  signoff_on_actual_final_version: true         # earlier-draft signoff does NOT carry
  hold_if_no_authority_available: true          # never ship without signoff

delegated_authority_by_material_type:
  # Delegation from CEO per material type; primary CEO always has final override.
  financial_material:                           # funding, layoffs, restructures, restatements
    delegated_to: CFO
    contact_name: "<FILL_IN>"
    contact_email: "<FILL_IN>"
  technical_material:                            # product launches with major architecture claims, security disclosures
    delegated_to: CTO
    contact_name: "<FILL_IN>"
    contact_email: "<FILL_IN>"
  operational_material:                          # major partnerships, capacity changes, ops-scale announcements
    delegated_to: COO
    contact_name: "<FILL_IN>"
    contact_email: "<FILL_IN>"
  material_non_public_info:                      # M&A, regulatory-adjacent, executive departures
    delegated_to: board_plus_securities_counsel  # LOAD-BEARING — never a single delegated authority
    board_contact: "<FILL_IN>"
    securities_counsel_contact: "<FILL_IN>"
  general_communications:                        # non-material releases; PR-standard content
    delegated_to: CEO
    contact_name: "<FILL_IN>"
    contact_email: "<FILL_IN>"
    fallback_delegate: "<FILL_IN>"               # who signs off if CEO unavailable
```

## 2. Embargo Protocol Config (press-kit)

```yaml
# From press-kit § Instructions Phase 7; § Principles rules 6-7 (LOAD-BEARING).

embargo_protocol:
  explicit_date_time_timezone_required: true    # Principle 6 — no ambiguity
  written_acknowledgment_required: true         # reporter silence is NOT agreement
  never_partial_embargo: true                   # Principle 7 LOAD-BEARING — full-story or no embargo
  simultaneous_release_at_lift_time: true       # owned channels + reporters at exact same moment

  default_advance_lead_time_hours: 48           # standard advance-access window; operator-adjustable
  advance_lead_time_max_hours: 168              # 1-week max advance access

  enforcement_plan_for_breaches:
    first_offense:
      - future_exclusion_from_advance_access
      - private_correction_conversation
    second_offense_or_damaging_breach:
      - future_exclusion_permanent
      - public_statement_if_release_damaged
      - escalate_to_publication_editor_if_pattern
    systematic_pattern:
      - escalate_to_publication_editor
      - consider_public_note_in_industry_channels
```

## 3. Media-Training Thresholds (media-training)

```yaml
# From media-training § Structure/Protocol; § Instructions Phases 2-6; § Principles.

message_map:
  messages_max: 3                                # Principle 1 LOAD-BEARING — cognitive-load limit
  proof_points_per_message_min: 2
  proof_points_per_message_max: 3
  each_message_1_sentence: true

  source_discipline:
    proof_points_from_press_kit_canonical: true  # single source of truth
    no_fabrication: true                          # Universal Principle 1 inherited

bridging_drill:
  practice_questions_per_message_min: 5
  practice_questions_per_message_max: 10
  abc_formula: [Acknowledge, Bridge, Communicate]
  never_lie: true                                # Principle 3 LOAD-BEARING
  never_accept_false_premise: true               # bridging is technique, not evasion

on_record_boundaries:
  default_status: on_record                       # SPJ standard + Principle 4 LOAD-BEARING
  status_confirmed_before_interview: mandatory
  no_retroactive_off_record: true                 # once on-record, always usable
  chit_chat_is_on_record: true                    # pre/post interview conversation
  written_comms_default_on_record: true

  status_definitions:
    on_record: "usable + attributable"
    off_record: "not usable in any form; requires explicit reporter agreement BEFORE statement"
    background: "usable, not attributable to spokesperson; requires explicit negotiation"
    deep_background: "usable, not attributable to org; requires explicit negotiation + mutual clarity on definition"

dry_run_rehearsal:
  duration_minutes_min: 30
  duration_minutes_max: 60
  minimum_ratio: 30_min_prep_per_20_min_interview
  recorded_audio_minimum: true
  reviewed_together_afterwards: true

  defer_or_substitute_if_dry_run_reveals_systematic_issues: true
  # weak interview does more damage than delayed/declined one — Principle 6

just_before_briefing:
  timing_minutes_before_interview: [15, 30]
  format: single_page_cheatsheet
  contents:
    - 3 key messages
    - top 5 anticipated questions
    - 3 stats to have ready

post_interview_debrief:
  timing: same_day_typically
  duration_minutes: 30
  feeds_forward_to: press_kit_qa_library
```

## 4. PR-Analytics + Barcelona Configuration (pr-analytics)

```yaml
# From pr-analytics § Structure/Protocol; § Principles.
# LOAD-BEARING AVE refusal baked at code level in pr_analytics.ave_refuse().

barcelona_principles_3_0:                       # 2020 version — anchor
  principle_1: "Setting goals is fundamental to communication and evaluation."
  principle_2: "Measurement and evaluation should identify outputs, outcomes, and potential impact."
  principle_3: "Outcomes and impact should be identified for stakeholders, society, and the org."
  principle_4: "Communication measurement should include both qualitative and quantitative analysis."
  principle_5: "AVE is NOT the value of communication."   # LOAD-BEARING baked at code level
  principle_6: "Holistic communication measurement includes all relevant online and offline channels."
  principle_7: "Communication measurement is based on integrity + transparency to drive learning."

amec_framework_stages:                          # 6-stage evaluation chain
  - INPUTS
  - ACTIVITIES
  - OUTPUTS
  - OUTTAKES
  - OUTCOMES
  - IMPACT

ave_computation:                                # LOAD-BEARING REFUSAL
  allowed: false                                 # baked at code level in pr_analytics.ave_refuse()
  refusal_source: Barcelona Principle 5
  no_workarounds: true                           # NO computation via any method
  operator_override_allowed: false               # legacy stakeholder insistence → educate, don't compute

measurement_defaults:
  goals_stated_before_launch: mandatory          # Principle 1 — no retrofit goals
  metric_without_target_flag: INCOMPLETE          # never scored as green

  outtake_survey_window_days: 30                 # post-campaign typical
  outcomes_measurement_window_days: [30, 90]     # behavior-change signal window
  impact_measurement_window_days: [90, 365]      # revenue / reputation attribution window

  attribution_discipline:
    label_correlated_not_caused: true            # "attributable" ≠ "caused" per §Principles
    overstating_attribution_forbidden: true      # §0.5 applied

  sentiment_methodology:
    human_triage_authoritative: true             # per Principle 4 qualitative + quantitative
    automated_nlp_first_pass_only: true

  channel_coverage:
    online_earned_media: true
    print: true
    broadcast: true
    podcast: true
    trade_press: true
    social: true                                  # herald tracks earned; owned social is Brand Studio scope
```

## 5. Newsjacking Threshold Rules (media-relations)

```yaml
# From media-relations § Instructions Phase 6; § Principles 4 + 8.

newsjacking:
  window_measured_in: hours                      # not days
  typical_publish_deadline_hours: [2, 6]         # POV + owned-content published within this window

  relevance_test_mandatory: true                 # "do we actually have a POV" — LOAD-BEARING
  forced_newsjack_forbidden: true                # opportunism damages credibility

  publish_to_owned_channels_first: true          # then pitch reporters
  follow_up_faster_during_news_cycle: true       # 3-day standard window → 24-hour during live news

context_limits:
  # Per Principle 8 — Scott's framework is context-adaptive
  b2b_tech_saas: fits_framework_cleanly
  consumer_media_lifestyle: adapt_traditional_pr_may_still_dominate
  heavily_regulated_industries: adapt_embargo_and_exclusive_still_dominates
  b2g_government_sales: adapt_relationship_pr_over_content_marketing
  low_web_research_markets: adapt_direct_to_buyer_may_have_limited_value
```

## 6. Individual-Crisis Escalation (inherited from Universal Principle 3)

```yaml
# HARD BOUNDARY inherited from P&C precedent + Universal Principle 3.
# ANY signal of individual crisis / self-harm / serious personal distress via ANY channel
# triggers this escalation — immediately, no exceptions, no operator overrides.
# Rare in Comms & PR context but possible (distressed spokesperson during interview prep;
# crisis-comms conversation surfacing personal distress; press-kit content prep revealing
# personal distress).
#
# Same pattern as maslow-config §1 + grove-config §7 + merit-config §7 — invocation-blocking
# fields.

individual_crisis_escalation:
  route_to:
    manager: "<FILL_IN>"                          # affected person's direct manager
    hr_ops_contact_name: "<FILL_IN>"
    hr_ops_contact_email: "<FILL_IN>"
    eap_provider_name: "<FILL_IN>"
    eap_provider_url: "<FILL_IN>"
    eap_provider_phone: "<FILL_IN>"
  emergency_backstop:
    us: "988 (Suicide & Crisis Lifeline, US)"
    international: "<FILL_IN>"
  operator_override_allowed: false               # never
  applies_to: [all 4 herald skills]
```

## 7. Escalation Contacts (routing to real YVON agents)

```yaml
# Verified against root CLAUDE.md §2 (2026-07-31 build).

escalations:
  ave_request_from_legacy_stakeholder:
    route_to: operator_plus_education_route
    action: refuse_at_code_level_then_educate_on_barcelona_standards
    verified: pr-analytics Principle 5 (LOAD-BEARING)

  material_npi_in_press_release:
    route_to_primary: board
    route_to_secondary: operator_plus_securities_counsel
    departments: [Governance, external]
    action: BLOCK_release_route_before_publish
    verified: press-kit Principle 8 (LOAD-BEARING legal fence)

  correction_or_retraction_after_coverage:
    route_to: crisis-comms
    department: Comms & PR (sibling)
    owner_agent: beacon
    typical_case: post-coverage correction request from reporter or internal

  hostile_topic_interview_offer:
    route_to_primary: crisis-comms (beacon)
    route_to_secondary: media-training (own skill for spokesperson prep)
    coordination_pattern: beacon leads messaging; herald preps spokesperson

  investor_facing_story_boundary:
    route_to: investor-cadence + data-room-discipline
    department: Comms & PR (sibling)
    owner_agent: beacon
    boundary_rule: herald pitches non-material stories only; material info routes to beacon + counsel

  internal_messaging_coordination:
    route_to: signal
    department: Comms & PR (sibling)
    typical_case: internal announcement precedes external coverage by hours

  executive_voice_authoring:
    route_to: echo
    department: Executive Office
    boundary_decision: echo owns pitch materials + board prep; herald hosts them in press-kit

  brand_voice_consistency_check_mandatory:
    route_to: lena
    department: Brand Studio
    role: Copy / storytelling / ideation
    escalate_to: spark (Brand Studio Creative direction) for systemic voice questions
    verified_in_claude_md: true
    mandatory_before_ceo_signoff: true

  visual_brand_assets:
    route_to: pixel
    department: Brand Studio
    role: Visual design
    verified_in_claude_md: true

  seo_digital_pr_link_building:
    route_to_primary: rank
    department: Engineering (Technical SEO)
    coordinate_with: kai (Brand Studio — SEO strategy)
    verified_in_claude_md: true

  pii_in_journalist_databases_or_press_kit_contacts:
    route_to: veil
    department: Cybersecurity
    role: data protection
    verified_in_claude_md: true

  ceo_or_delegated_authority_signoff:
    route_to: see_section_1_delegated_authority_matrix
    mandatory_before_external_send: true

  aggregate_pr_metrics_to_hr_scorecard:
    route_to: hr-strategy-alignment
    department: People & Culture
    owner_agent: merit
    purpose: PR / brand-reputation metrics feed merit's BSC Employee/Customer perspective

  employee_audience_pr_signal:
    route_to: motivation-map + wellbeing-monitoring
    department: People & Culture
    owner_agent: maslow
    typical_case: unsolicited hiring applications spike; employee-engagement signal from external coverage
```

## 8. External Escalation Lanes (no YVON agent exists)

```yaml
external_escalations:
  individual_crisis:
    see: "§6 individual_crisis_escalation"

  securities_counsel:
    triggers:
      - material non-public info in any comms channel
      - SEC-adjacent disclosure questions
      - executive-departure comms
      - M&A / restructure comms
    contact_role_needed: securities counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  employment_counsel:
    triggers:
      - protected-class impact in coverage or pitch
      - discriminatory phrasing in draft content
      - harassment signal in reporter conversation or internal comms
      - libel / defamation exposure in pitch
    contact_role_needed: employment counsel (external)
    operator_contact_name: "<FILL_IN>"
    operator_contact_email: "<FILL_IN>"

  reporter_publication_editor_escalation:
    triggers:
      - systematic embargo breach by a reporter
      - repeated off-record breach
      - libel / defamation in published coverage
    contact_role_needed: publication editor
    action: herald contacts editor directly for pattern breaches; may involve counsel for legal exposure
```

## 9. Regulatory Alerts (proactive surface)

```yaml
active_alerts:
  barcelona_principles_3_0_ave_deprecation:
    fact: "AVE (Advertising Value Equivalency) rejected by Barcelona Principle 5 since 2010; reaffirmed 2015; reaffirmed 2020. Baked at code level in pr_analytics.ave_refuse()."
    source: pr-analytics § Principles rule 5
    action: surface proactively whenever a stakeholder mentions AVE; refuse computation; educate
    retire_after: n/a
    on_retire: null

  sec_regulation_fd_disclosure_timing:
    fact: "SEC Regulation FD (Fair Disclosure) requires simultaneous public disclosure when material information is shared with select analysts / investors. Applies to embargo protocol design for public companies."
    source: press-kit § Principles rule 8 + Universal Principle 5 legal fence
    action: for publicly-traded orgs, coordinate embargo timing with securities counsel to ensure Reg FD compliance
    retire_after: n/a
    on_retire: null
    check_frequency: applicable_only_for_public_companies

  # Comms & PR scope generates fewer standing regulatory alerts than hire's (5) or
  # merit's (0) — most PR-adjacent regulation is contextual (SEC Reg FD only for public
  # cos; libel/defamation only in specific coverage; SPJ standards for reporter conduct
  # not legal rules per se).
```

## 10. Tool Permissions (governance layer)

```yaml
# Per §7 agent/: GOVERNANCE layer — what herald is ALLOWED to do at runtime.
# Technical needs live in operational/tool/herald-tool-requirements.md.

tool_permissions:
  file_read: allowed
  file_write:
    allowed_paths:
      - Teams/Comms & PR/herald/**
      - Teams/Comms & PR/**                       # dept scope for coordination outputs
      - store/tasks/**
    denied_paths:
      - Teams/**/marketplace/**                   # marketplace verbatim — but herald has zero marketplace skills anyway
      - .git/**
      - Teams/Engineering/SECURITY-CHARTER.md     # operator-amended only

  python_or_shell_execution:
    allowed_scripts:
      - Teams/Comms & PR/herald/custom/pr-analytics/scripts/pr_analytics.py
      - Shared OS/logical/**                      # any future logical script
    self_tests_before_ship: required

  web_search:
    allowed: true
    scope: "verify research citations (Scott, Walker, AMEC, Barcelona); reporter research + recent coverage lookup for media-relations Phase 2; market research for reporter beat verification"
    denied: "not for close-call material-info decisions (route to board + counsel); not for legacy stakeholder AVE debates (refusal is code-level, not a search-based justification)"

  ave_computation_by_any_method:
    allowed: false
    rationale: "LOAD-BEARING REFUSAL per Barcelona Principle 5. Baked at code level in pr_analytics.ave_refuse(). No workarounds — no manual math, no spreadsheet formula, no derived metric that reconstructs AVE. If legacy stakeholder insists, route to operator + educate."

  external_send_without_ceo_signoff:
    allowed: false
    rationale: "press-kit Principle 4 LOAD-BEARING. Signoff on ACTUAL FINAL VERSION required. Delegated authority per material type. If no authority available, HOLD."

  release_material_npi_without_board_plus_counsel:
    allowed: false
    rationale: "press-kit Principle 8 LOAD-BEARING legal fence. Material non-public info requires board + operator + securities counsel BEFORE release."

  partial_embargo:
    allowed: false
    rationale: "press-kit Principle 7 LOAD-BEARING. Full-story embargo or no embargo. Partial embargoes get accidentally broken and burn relationships."

  force_newsjack_when_relevance_test_fails:
    allowed: false
    rationale: "media-relations Phase 6 + Principle 4 LOAD-BEARING. Forced newsjacks damage credibility."

  blast_pitch:
    allowed: false
    rationale: "media-relations Principle 2 LOAD-BEARING. Single-source per reporter; no cosmetically-personalized-same-pitch to N reporters."

  retroactive_off_record_acceptance:
    allowed: false
    rationale: "media-training Principle 4 + SPJ standard LOAD-BEARING. On-record status confirmed BEFORE interview; unclear defaults to on-record."

  push_distressed_spokesperson_into_interview:
    allowed: false
    rationale: "media-training Principle 8 + Universal Principle 3 (individual crisis HARD BOUNDARY). Defer or substitute if dry-run reveals systematic issues or spokesperson surfaces distress."

  fabricate_statistic_or_quote:
    allowed: false
    rationale: "Universal Principle 1 (inherited) + §0.5 + press-kit Principle 2 + media-training Principle 3. No invented statistics; no misrepresented product features; no quotes not-actually-approved."

  publishing_individual_perf_data_or_9box:
    allowed: false
    rationale: "Aggregate-only rule inherited from Universal Principle 7 (from P&C precedent). Individual perf / demographic / feedback / medical data never publish identifiably through herald outputs."

  publishing_segmented_figures_below_min_group_size:
    allowed: false
    rationale: "Universal Principle 4 aggregate-privacy rule inherited from P&C precedent."
```

## 11. Model Routing

```yaml
model_routing:
  default_model: "<FILL_IN>"                     # operator picks
  fallback_model: "<FILL_IN>"
  temperature_for_pitch_draft: 0.5               # some voice latitude within Scott identity
  temperature_for_press_release_draft: 0.3       # consistency + fact-precision matter
  temperature_for_message_map: 0.3               # message discipline
  temperature_for_bridging_drill: 0.5            # some fluency latitude
  temperature_for_scorecard_analysis: 0.2        # analytical
  temperature_for_ceo_signoff_summary: 0.2       # precision required
  temperature_for_crisis_holding_statement_template: 0.2  # strict template discipline (though beacon owns crisis-comms itself)
```

## 12. Runtime Behavior Defaults

```yaml
runtime_defaults:
  identity_governs_voice: true                   # herald is leader; McCord-style-adjacent Scott anchor governs voice
  identity_can_override_method: false
  charter_senior_to_identity: true
  charter_senior_to_config: true
  universal_principles_senior_to_identity_flavored: true
  barcelona_principles_3_0_senior_to_identity: true    # AVE refusal baked at code level — Scott himself couldn't override

  # herald-specific defaults:
  ave_refusal_at_code_level: true                # pr_analytics.ave_refuse() always raises
  ceo_signoff_before_external_send: true         # press-kit Principle 4
  material_npi_routes_to_board_plus_counsel: true # press-kit Principle 8
  no_partial_embargo: true                        # press-kit Principle 7
  no_forced_newsjacks: true                       # media-relations Phase 6 relevance-test
  no_blast_pitching: true                         # media-relations Principle 2
  three_messages_max_for_interviews: true         # media-training Principle 1
  on_record_default_status_confirmed_before_interview: true  # media-training Principle 4
  never_push_distressed_spokesperson: true        # media-training Principle 8
  aggregate_only_at_publication_surface: true     # inherited from P&C
  publish_direct_plus_pitch_default_posture: true # Scott identity anchor default

  verification_before_completion:
    required_on_every_output: true
    exempt_operators: []

  fill_in_debt_announcement:
    on_every_invocation: true
    format: "one line per unfilled field, in compiled skill preamble"
    critical_fields_blocking_invocation:
      - individual_crisis contact fields (per §6)
      - ceo_signoff.contact_name and .contact_email (per §1) — blocks any external send
      - delegated_authority_by_material_type.material_non_public_info.securities_counsel_contact — blocks material NPI processing
```

---

## Provenance

Every field above traces to a real line in one of herald's 4 skill files.

| Config field | Source skill line |
|---|---|
| `ceo_signoff.required_before_external_send` | press-kit § Instructions Phase 6; § Principles rule 4 (LOAD-BEARING) |
| `ceo_signoff.signoff_on_actual_final_version` | press-kit § Principles rule 4 |
| `delegated_authority_by_material_type` (CFO / CTO / COO / board + counsel) | press-kit § Instructions Phase 6 delegation rules |
| `embargo_protocol.explicit_date_time_timezone_required` | press-kit § Instructions Phase 7; § Principles rule 6 |
| `embargo_protocol.written_acknowledgment_required` | press-kit § Instructions Phase 7 |
| `embargo_protocol.never_partial_embargo` | press-kit § Principles rule 7 (LOAD-BEARING) |
| `embargo_protocol.enforcement_plan_for_breaches` | press-kit § Structure / Protocol §7 + § Fallback embargo breach |
| `message_map.messages_max` (3) | media-training § Principles rule 1 (LOAD-BEARING); § Instructions Phase 2 |
| `message_map.proof_points_per_message_min/max` (2-3) | media-training § Instructions Phase 2 |
| `bridging_drill.abc_formula` | media-training § Instructions Phase 3 |
| `bridging_drill.never_lie` | media-training § Principles rule 3 (LOAD-BEARING) |
| `on_record_boundaries.default_status: on_record` | media-training § Principles rule 4 (LOAD-BEARING); SPJ standard |
| `on_record_boundaries.no_retroactive_off_record` | media-training § Instructions Phase 5 + § Principles rule 4 |
| `on_record_boundaries.chit_chat_is_on_record` | media-training § Instructions Phase 5 |
| `dry_run_rehearsal.duration_minutes_min/max` (30-60) | media-training § Instructions Phase 6 |
| `dry_run_rehearsal.defer_or_substitute_if_dry_run_reveals_systematic_issues` | media-training § Principles rule 6 |
| `barcelona_principles_3_0` (7 principles) | pr-analytics § Structure / Protocol; scripts/pr_analytics.py BARCELONA_PRINCIPLES |
| `amec_framework_stages` (6 stages) | pr-analytics § Structure / Protocol; scripts/pr_analytics.py AMEC_FRAMEWORK_STAGES |
| `ave_computation.allowed: false` (LOAD-BEARING baked at code level) | pr-analytics § Principles rule 5 + scripts/pr_analytics.py ave_refuse() |
| `measurement_defaults.goals_stated_before_launch` | pr-analytics § Instructions Phase 1; § Principles rule 1 |
| `measurement_defaults.attribution_discipline` | pr-analytics § Instructions Phase 4 + § Principles rule 3 |
| `measurement_defaults.sentiment_methodology` | pr-analytics § Instructions Phase 2 + § Principles rule 4 |
| `newsjacking.window_measured_in: hours` | media-relations § Structure/Protocol §6; § Principles rule 4 (LOAD-BEARING) |
| `newsjacking.relevance_test_mandatory` | media-relations § Instructions Phase 6 + § Principles rule 4 |
| `newsjacking.forced_newsjack_forbidden` | media-relations § Principles rule 4 |
| `context_limits` (B2B fit; consumer/regulated/B2G adapt) | media-relations § Principles rule 8 (context bounds) |
| `individual_crisis_escalation` | Universal Principle 3 (inherited from P&C precedent); media-training Principle 8; all-skills Fallback |
| `escalations.ave_request_from_legacy_stakeholder` | pr-analytics Principle 5 (LOAD-BEARING); § Fallback |
| `escalations.material_npi_in_press_release` | press-kit Principle 8 (LOAD-BEARING); Universal Principle 5 legal fence |
| `escalations.brand_voice_consistency_check_mandatory` (lena) | press-kit § Instructions Phase 5 mandatory before CEO signoff |
| `active_alerts.barcelona_principles_3_0_ave_deprecation` | pr-analytics § Principles rule 5 |
| `active_alerts.sec_regulation_fd_disclosure_timing` | press-kit Principle 8 + Universal Principle 5 (public-company applicability) |
| `tool_permissions.ave_computation_by_any_method: false` | pr-analytics Principle 5 (baked at code level) |
| `tool_permissions.external_send_without_ceo_signoff: false` | press-kit Principle 4 |
| `tool_permissions.release_material_npi_without_board_plus_counsel: false` | press-kit Principle 8 |
| `tool_permissions.partial_embargo: false` | press-kit Principle 7 |
| `tool_permissions.force_newsjack_*: false` | media-relations Principle 4 |
| `tool_permissions.blast_pitch: false` | media-relations Principle 2 |
| `tool_permissions.retroactive_off_record_acceptance: false` | media-training Principle 4 |
| `tool_permissions.push_distressed_spokesperson_into_interview: false` | media-training Principle 8 + Universal Principle 3 |
| `tool_permissions.fabricate_statistic_or_quote: false` | Universal Principle 1 + press-kit Principle 2 + media-training Principle 3 |
| `runtime_defaults.publish_direct_plus_pitch_default_posture` | Scott identity anchor Mental Model 1 |
| `runtime_defaults.barcelona_principles_3_0_senior_to_identity` | Scott identity governance frontmatter — Barcelona senior even to identity |

## Debt Summary

Fields still `<FILL_IN>` as of this build (2026-07-31):

**CRITICAL (blocks specific work until filled):**
- `individual_crisis_escalation` contact fields (§6) — blocks any herald work that could plausibly surface individual crisis.
- `ceo_signoff.contact_name` + `contact_email` (§1 general_communications) — blocks any external send.
- `delegated_authority_by_material_type.material_non_public_info.securities_counsel_contact` (§1) — blocks material NPI processing.

**Standard (loud per §14.7 but non-blocking):**
- Other delegated_authority contact fields (§1 CFO / CTO / COO) — needed before first material release requiring that authority.
- `embargo_protocol.default_advance_lead_time_hours` (default 48) — operator-adjustable.
- `external_escalations.securities_counsel + employment_counsel` operator_contact_* — needed before first material NPI or legal-adjacent situation.
- `model_routing.default_model` + `fallback_model` — operator model-selection policy.

Per §14.7 each debt announces on every compiled skill invocation until filled or marked
`n/a`. Individual-crisis + CEO signoff + securities counsel fields carry invocation-blocking
weight for the specific work they gate.
