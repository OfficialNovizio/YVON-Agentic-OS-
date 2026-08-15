<!--
Operational: agent config for signal (Comms & PR / Internal Comms) per §7 agent/.

Field derivation rule (§7): every field below traces to a real line in one of signal's
3 skill files. No padding, no copying other config shapes — signal has different concerns
(legal-fence for change-comms, channel-cadence matrix, decision-broadcast structure,
Neutral Zone discipline, searchable-archive).

Per §0.5: unknown values are <FILL_IN>.
Per §14.7: every <FILL_IN> announces itself in compiled skill preambles.
-->

# signal — Agent Config

## Purpose

Operator-configurable surface signal's 3 skills read at runtime. Every field traces to
a specific skill line (see `## Provenance`). Values that are operator-specific
(individual-crisis contacts, employment counsel, archive-system location) are
`<FILL_IN>`.

---

## 1. Legal-Fence Discipline (change-comms — LOAD-BEARING)

```yaml
# From change-comms § Instructions Phase 2; § Principles rule 1 (LOAD-BEARING).
# LOAD-BEARING: employment counsel MUST be involved BEFORE any change-comms drafting.

change_comms_legal_fence:
  required_before_drafting: true            # LOAD-BEARING per Universal Principle 5
  hold_drafting_if_counsel_not_involved: true
  operator_override_allowed: false          # LOAD-BEARING refusal

  triggers_requiring_counsel_involvement:
    layoff_or_rif:
      required_counsel_types: [employment, international-if-applicable]
      required_reviews:
        - WARN Act (US federal + state) notification timing
        - protected-class impact analysis
        - severance-agreement language
        - international jurisdiction requirements (EU works-councils, etc.)
    reorg_with_role_elimination:
      required_counsel_types: [employment]
      required_reviews: [see_layoff_subset]
    merger_or_acquisition:
      required_counsel_types: [employment, securities]
      required_reviews:
        - SEC Regulation FD disclosure timing (public companies)
        - employment-contract implications for affected employees
        - works-council requirements
    major_transition:
      required_counsel_types: [employment, location-specific]
      required_reviews:
        - location-specific employment-law implications
        - constructive-dismissal claim exposure

  counsel_contacts:
    employment_counsel_name: "<FILL_IN>"
    employment_counsel_email: "<FILL_IN>"
    securities_counsel_name: "<FILL_IN>"
    securities_counsel_email: "<FILL_IN>"
    international_counsel_name: "<FILL_IN>"
    international_counsel_email: "<FILL_IN>"
```

## 2. Channel-Cadence Matrix (internal-cadence Phase 1 LOAD-BEARING)

```yaml
# From internal-cadence § Structure/Protocol §1; § Instructions Phase 1;
# § Principles rule 1 (LOAD-BEARING).
# Match message TYPE + URGENCY + SCOPE to CHANNEL + CADENCE BEFORE drafting.

channel_cadence_matrix:
  matrix_lookup_before_drafting: true       # LOAD-BEARING per Principle 1

  message_types:
    company_wide_urgent:
      channel: "Slack #announce + email backup"
      cadence: "same-day"
      matrix_override_operator: "<FILL_IN>"
    company_wide_routine:
      channel: "Weekly newsletter"
      cadence: "weekly"
      format_routes_to: "internal-comms newsletter format (marketplace)"
    team_weekly:
      channel: "Team channel"
      cadence: "weekly"
      format_routes_to: "internal-comms 3P update format (marketplace)"
    monthly_all_hands:
      channel: "Prepared doc + live meeting + Q&A + async recording/summary"
      cadence: "monthly"
      required_artifacts: 4                  # see §3 all_hands
    decisions:
      channel: "Decision broadcast format (internal-cadence Phase 3)"
      cadence: "as-needed"
      format: "WHAT / WHY / WHAT-CHANGES structure"
    casual_operational:
      channel: "Team-channel chat"
      cadence: "no overhead"
      note: "no cadence tracking needed for casual"
    faq:
      channel: "Weekly FAQ digest"
      cadence: "weekly"
      format_routes_to: "internal-comms FAQ format (marketplace)"

  anti_pattern_default_slack:
    forbidden: true                          # per Instructions Phase 1 anti-pattern
    rationale: "Slack works for casual + same-day-urgent + team-level; WRONG channel for decisions, company-wide routine, all-hands content, anything needing to survive scrolling"
```

## 3. Decision-Broadcast + All-Hands Structure (internal-cadence)

```yaml
# From internal-cadence § Instructions Phases 3 + 4; § Principles rules 2 + 4.

decision_broadcast:
  required_structure_3_parts:               # Principle 2 LOAD-BEARING
    what_changed: "concrete change, 1-2 sentences, no filler"
    why_it_changed: "2-3 sentences honest rationale — no euphemism"
    what_this_changes: "per-audience specific if needed; concrete verbs"
  optional_4th_section:
    q_and_a_anticipated: "3-5 questions with prepared answers; feeds forward to FAQ digest"
  no_corporate_euphemism: true              # Principle 3 LOAD-BEARING

all_hands:
  cadence: monthly                          # standard rhythm
  live_meeting_duration_minutes: [60, 90]

  required_artifacts_4:                     # Phase 4 LOAD-BEARING (Principle 4)
    - prepared_doc                          # pre-shared 24-48 hours in advance
    - live_meeting                          # 60-90 min typical
    - q_and_a                               # live + async
    - async_version                         # recording + summary within 24 hours

  prepared_doc:
    advance_share_hours_min: 24
    advance_share_hours_max: 48
    contents:
      - agenda
      - decisions_since_last_all_hands
      - key_metrics
      - focus_areas_for_coming_month

  q_and_a:
    live_during_meeting: true
    async_submission_hours_before_meeting: [24, 48]
    anonymous_submission_optional: true
    unanswered_live_written_within_hours: 48

  async_version:
    recording_if_privacy_allows: true
    summary_within_hours: 24
    archive_to_searchable_archive: mandatory
```

## 4. Change-Comms Configuration (change-comms)

```yaml
# From change-comms § Structure/Protocol; § Instructions Phases 1-8; § Principles.

change_comms:
  change_qualification:
    major_change_thresholds:
      affected_people_min: 3                # affecting >2-3 people substantially = major
      reorg_reporting_line_change: true
      layoff_or_rif: true
      merger_or_acquisition: true
      major_transition: true                # office relocation, business-model shift, product-line discontinuation
    routine_decision_criteria:
      affected_people_max: 2
      routes_to: internal-cadence decision-broadcast

  frameworks:
    kotter_8_step:                          # organizational-change process
      - "1. Create a sense of urgency"
      - "2. Build a guiding coalition"
      - "3. Form a strategic vision"
      - "4. Enlist a volunteer army"
      - "5. Enable action by removing barriers"
      - "6. Generate short-term wins"
      - "7. Sustain acceleration"
      - "8. Institute change"

    bridges_transition_model:                # individual-psychological transition
      - "Phase 1: ENDING — letting go of the old"
      - "Phase 2: NEUTRAL ZONE — the messy middle"
      - "Phase 3: NEW BEGINNING — embracing the new"

    prosci_adkar:                            # individual-change milestones sequential
      - "A: AWARENESS of the need for change"
      - "D: DESIRE to support the change"
      - "K: KNOWLEDGE of how to change"
      - "A: ABILITY to demonstrate new skills"
      - "R: REINFORCEMENT to sustain the change"

  audience_segmentation:
    mandatory: true                          # Principle 2 LOAD-BEARING
    standard_segments:
      - affected_employees                   # layoff targets, reorged-out roles
      - directly_affected_employees          # retained but role-changed
      - retained_employees                   # not directly affected but same team/function
      - adjacent_teams                       # downstream/upstream affected teams
      - customers_partners                   # external (routes to herald)
      - board_investors                      # material-info (routes to beacon + counsel)

  neutral_zone_comms:                        # Phase 6 LOAD-BEARING (Principle 4)
    non_optional: true                       # skipping = change fails
    minimum_cadence: weekly_written_updates
    forums_required:
      - regular_office_hours_or_qa
      - explicit_acknowledgment_of_difficulty
      - named_point_of_contact_per_affected_group
    productivity_decline_expected_percent: [30, 50]   # per Bridges research

  reinforcement:                             # Phase 7
    duration_weeks_min: 6                    # weeks-to-months, not days
    duration_weeks_max: 26
    reinforce_via:
      - short_term_wins_broadcast            # Kotter step 6
      - institutional_anchoring              # Kotter step 8
      - adkar_reinforcement                  # celebrate new behavior; correct regression
```

## 5. Searchable-Archive Discipline (internal-cadence)

```yaml
# From internal-cadence § Structure/Protocol §5; § Instructions Phase 5;
# § Principles rule 6 (LOAD-BEARING).

searchable_archive:
  location: "<FILL_IN>"                     # e.g., company wiki / Notion / Confluence
  search_enabled: mandatory

  entries_required_for:
    - decision_broadcasts
    - all_hands_materials                    # prepared doc + Q&A summary + async recording+summary
    - newsletters
    - structured_faq_digests
    - change_comms_artifacts                 # all 8 change-comms phase artifacts

  per_entry_requirements:
    permanent_link: mandatory                # survives channel-scrolling
    tags:
      - topic
      - affected_audience
      - date
      - author
    cross_references_to_related_prior_entries: mandatory
    contradiction_handling:
      silent_contradiction_forbidden: true   # Principle 6 LOAD-BEARING
      explicit_update_format: "Update from [prior entry link]: previously said X, now Y because Z"

close_the_loop:                              # inherited from maslow pulse-survey pattern
  visible_action_from_previous_cycle_mandatory: true    # Principle 5 LOAD-BEARING
  applies_to:
    - weekly_leadership_notes
    - monthly_all_hands
    - change_comms_neutral_zone_updates
  action_if_no_action_taken:
    - explicitly_name_it: "we heard X; we're not addressing it because Y"
    - or_delay_next_cycle_until_action_can_be_named
```

## 6. Individual-Crisis Escalation (inherited from Universal Principle 3)

```yaml
# HARD BOUNDARY inherited from cross-department precedent.
# Rare in signal context but possible via Q&A submissions, channel monitoring during
# change events, all-hands emotional moments, or one-on-one comms conversations.
# Same pattern as maslow-config §1 + grove-config §7 + merit-config §7 + herald-config §6.

individual_crisis_escalation:
  route_to:
    manager: "<FILL_IN>"                     # affected person's direct manager
    hr_ops_contact_name: "<FILL_IN>"
    hr_ops_contact_email: "<FILL_IN>"
    eap_provider_name: "<FILL_IN>"
    eap_provider_url: "<FILL_IN>"
    eap_provider_phone: "<FILL_IN>"
  emergency_backstop:
    us: "988 (Suicide & Crisis Lifeline, US)"
    international: "<FILL_IN>"
  operator_override_allowed: false           # never
  applies_to: [all 3 signal skills]
  special_context_during_change_events: elevated_probability_during_layoff_or_reorg_conversations
```

## 7. Escalation Contacts (routing to real YVON agents)

```yaml
# Verified against root CLAUDE.md §2 (2026-07-31 build).

escalations:
  structural_design_of_change:
    route_to: workforce-planning
    department: People & Culture
    owner_agent: hire (Lead)
    boundary: signal handles comms; hire's workforce-planning handles structure

  succession_adjacent_change:
    route_to: succession-planning
    department: People & Culture
    owner_agent: merit
    typical_case: executive departure, leadership transition

  individual_1_to_1_delivery_discipline:
    route_to: feedback-methods
    department: People & Culture
    owner_agent: merit
    typical_case: SBI + Radical Candor for individual manager-to-directs conversations accompanying aggregate change

  neutral_zone_wellbeing_monitoring:
    route_to: motivation-map + wellbeing-monitoring
    department: People & Culture
    owner_agent: maslow
    typical_case: aggregate motivation/wellbeing signals during change events

  external_facing_change_comms:
    route_to: press-kit + media-relations
    department: Comms & PR (sibling)
    owner_agent: herald (Lead)
    boundary: signal handles internal; herald handles external; consistency mandatory

  crisis_dimension_of_change:
    route_to: crisis-comms
    department: Comms & PR (sibling)
    owner_agent: beacon
    typical_case: leaked news, hostile press, unexpected market reaction

  material_info_investor_facing:
    route_to: investor-cadence + data-room-discipline
    department: Comms & PR (sibling)
    owner_agent: beacon
    escalate_to: board + operator + securities counsel BEFORE broadcast

  pii_in_q_and_a_or_archive:
    route_to: veil
    department: Cybersecurity
    role: data protection
    verified_in_claude_md: true

  comms_tooling_or_all_hands_production_budget:
    route_to: board
    department: Governance
    via: fiduciary-guard

  protected_class_or_discriminatory_phrasing_or_harassment:
    route_to_primary: operator
    escalate_to: employment counsel (see §1 counsel_contacts)
    LOAD_BEARING: Universal Principle 5 legal fence
```

## 8. External Escalation Lanes (no YVON agent exists)

```yaml
external_escalations:
  individual_crisis:
    see: "§6 individual_crisis_escalation"

  employment_counsel:
    see: "§1 change_comms_legal_fence.counsel_contacts.employment_counsel"

  securities_counsel:
    see: "§1 change_comms_legal_fence.counsel_contacts.securities_counsel"

  international_counsel:
    see: "§1 change_comms_legal_fence.counsel_contacts.international_counsel"
```

## 9. Regulatory Alerts (proactive surface)

```yaml
active_alerts:
  sec_reg_fd_material_info_disclosure_timing:
    fact: "SEC Regulation FD requires simultaneous public disclosure when material information is shared with select analysts/investors. Applies to internal announcements containing material NPI for public companies."
    source: change-comms § When to Use "Do NOT use for"; Universal Principle 5 legal fence
    action: coordinate internal-announcement timing with external-disclosure timing per Reg FD via beacon + operator + securities counsel
    retire_after: n/a
    on_retire: null
    check_frequency: applicable_only_for_public_companies

  warn_act_layoff_notification_timing:
    fact: "US WARN Act (Worker Adjustment and Retraining Notification) requires ~60 days advance notice for qualifying mass layoffs / plant closings. State-specific mini-WARN acts vary."
    source: change-comms § Instructions Phase 2 legal-fence discipline
    action: employment counsel confirms WARN applicability + timing BEFORE any layoff announcement drafts
    retire_after: n/a
    check_frequency: applicable_only_for_us_layoffs_of_qualifying_size

  eu_works_council_consultation_requirements:
    fact: "EU member states (varying) require works-council consultation BEFORE announcing collective redundancies. Failure to consult can invalidate the process + create employer liability."
    source: change-comms § Instructions Phase 2 legal-fence international
    action: international counsel confirms works-council requirements for each EU jurisdiction BEFORE M&A / layoff / major reorg announcement
    retire_after: n/a
    check_frequency: applicable_only_for_eu_operations

  # Compared to hire-config §5 (5 alerts) and herald-config §9 (2 alerts), signal's
  # scope surfaces 3 regulatory alerts — reflects change-comms surface where
  # employment-law-adjacent regulation applies during layoffs / M&A / reorgs.
```

## 10. Tool Permissions (governance layer)

```yaml
# Per §7 agent/: GOVERNANCE layer.

tool_permissions:
  file_read: allowed
  file_write:
    allowed_paths:
      - Teams/Comms & PR/signal/**
      - Teams/Comms & PR/**                  # dept scope for coordination outputs
      - store/tasks/**
    denied_paths:
      - Teams/**/marketplace/**              # marketplace verbatim — signal has 1 (internal-comms Anthropic official)
      - .git/**
      - Teams/Engineering/SECURITY-CHARTER.md

  python_or_shell_execution:
    allowed_scripts: []                      # signal has NO scripts (all Route D)
    self_tests_before_ship: n/a

  web_search:
    allowed: true
    scope: "verify Kotter / Bridges / Prosci / Heath / Minto / Scott / McCord citations; Reg FD / WARN Act regulatory verification"
    denied: "not for close-call legal decisions (route to counsel per §1); not for individual-level searches"

  # LOAD-BEARING REFUSALS at governance level:

  draft_change_comms_without_legal_counsel:
    allowed: false
    rationale: "LOAD-BEARING per Universal Principle 5 + change-comms Principle 1. Employment counsel involved BEFORE drafting for layoff / reorg-with-role-elim / M&A / major transition."

  skip_neutral_zone_comms:
    allowed: false
    rationale: "LOAD-BEARING per change-comms Principle 4 + Phase 6. Skipping = change fails even if structural change succeeds."

  ship_content_with_corporate_euphemism_in_change_or_decision_context:
    allowed: false
    rationale: "LOAD-BEARING per internal-cadence Principle 3 + change-comms Principle 3. Honest WHY; no 'headwinds' / 'efficiency measures' / 'personnel adjustments' during layoff."

  publish_silent_contradiction_with_prior_archive_entry:
    allowed: false
    rationale: "LOAD-BEARING per internal-cadence Principle 6. Explicit 'Update from [prior entry]: previously said X, now Y because Z' required."

  release_material_npi_in_internal_announcement_without_board_plus_counsel:
    allowed: false
    rationale: "LOAD-BEARING per Universal Principle 5 legal fence. For public companies, SEC Reg FD timing coordination via beacon + operator + securities counsel."

  draft_external_facing_change_comms:
    allowed: false
    rationale: "signal owns internal-facing comms; external routes to herald's press-kit + media-relations. Coordination for consistency mandatory but signal does NOT draft external."

  publishing_individual_perf_data_or_9_box_placements:
    allowed: false
    rationale: "Universal Principle 7 aggregate-only inherited from P&C precedent. Individual perf / demographic / feedback / medical data never in signal outputs."

  publishing_segmented_figures_below_min_group_size:
    allowed: false
    rationale: "Universal Principle 4 aggregate-privacy rule inherited from P&C precedent."

  fabricate_statistic_quote_or_case_study:
    allowed: false
    rationale: "Universal Principle 1 + §0.5 (inherited from herald's no-fabrication rule). No invented statistics; no unapproved quotes; no fabricated case studies."
```

## 11. Model Routing

```yaml
model_routing:
  default_model: "<FILL_IN>"
  fallback_model: "<FILL_IN>"
  temperature_for_format_routing: 0.2        # deterministic matrix lookup
  temperature_for_decision_broadcast: 0.3    # consistency + honesty matter
  temperature_for_all_hands_prep_doc: 0.4    # some voice latitude
  temperature_for_change_comms_narrative: 0.3  # honest WHY, no euphemism drift
  temperature_for_neutral_zone_updates: 0.4  # empathetic voice within honest frame
```

## 12. Runtime Behavior Defaults

```yaml
runtime_defaults:
  identity_governs_voice: true               # tone inherited from herald (Scott)
  identity_can_override_method: false
  charter_senior_to_identity: true
  charter_senior_to_config: true
  universal_principles_senior_to_identity_flavored: true
  barcelona_principles_3_0_senior_to_identity: true   # inherited from herald pr-analytics.ave_refuse

  # signal-specific defaults:
  legal_fence_before_change_comms_drafting: true      # LOAD-BEARING
  neutral_zone_comms_non_optional: true               # LOAD-BEARING
  channel_cadence_matrix_before_drafting: true        # LOAD-BEARING
  no_corporate_euphemism_in_change_or_decision_content: true  # LOAD-BEARING (McCord/Scott inheritance)
  never_silent_contradiction_with_prior_archive: true # LOAD-BEARING
  close_the_loop_every_cycle: true                    # LOAD-BEARING (inherited from maslow pulse-survey)
  aggregate_only_at_publication_surface: true         # inherited from P&C

  verification_before_completion:
    required_on_every_output: true
    exempt_operators: []

  fill_in_debt_announcement:
    on_every_invocation: true
    format: "one line per unfilled field, in compiled skill preamble"
    critical_fields_blocking_invocation:
      - individual_crisis contact fields (per §6)
      - employment_counsel_name and email (per §1) — blocks change-comms drafting
      - securities_counsel_name and email (per §1) — blocks material-NPI change comms
      - searchable_archive location (per §5) — blocks archive entries
```

---

## Provenance

Every field above traces to a real line in one of signal's 3 skill files.

| Config field | Source skill line |
|---|---|
| `change_comms_legal_fence.required_before_drafting` | change-comms Principle 1 (LOAD-BEARING); Universal Principle 5 legal fence |
| `change_comms_legal_fence.triggers_requiring_counsel_involvement` | change-comms § Instructions Phase 2 |
| `channel_cadence_matrix.matrix_lookup_before_drafting` | internal-cadence Principle 1 (LOAD-BEARING); § Instructions Phase 1 |
| `channel_cadence_matrix.message_types` | internal-cadence § Structure/Protocol §1 |
| `channel_cadence_matrix.anti_pattern_default_slack.forbidden` | internal-cadence § Instructions Phase 1 anti-pattern |
| `decision_broadcast.required_structure_3_parts` | internal-cadence § Structure/Protocol §3; § Principles rule 2 |
| `decision_broadcast.no_corporate_euphemism` | internal-cadence § Principles rule 3 (LOAD-BEARING) |
| `all_hands.required_artifacts_4` | internal-cadence § Structure/Protocol §4; § Principles rule 4 (LOAD-BEARING) |
| `all_hands.prepared_doc.advance_share_hours_min/max` (24-48) | internal-cadence § Instructions Phase 4 |
| `change_comms.change_qualification.major_change_thresholds` | change-comms § When to Use + § Instructions Phase 1 |
| `change_comms.frameworks.kotter_8_step / bridges_transition_model / prosci_adkar` | change-comms § Structure/Protocol |
| `change_comms.audience_segmentation.mandatory` | change-comms Principle 2 (LOAD-BEARING); § Instructions Phase 3 |
| `change_comms.neutral_zone_comms.non_optional` | change-comms Principle 4 (LOAD-BEARING); § Instructions Phase 6 |
| `change_comms.reinforcement.duration_weeks_min/max` (6-26) | change-comms § Instructions Phase 7; § Principles rule 5 |
| `searchable_archive.entries_required_for` | internal-cadence § Structure/Protocol §5 |
| `searchable_archive.per_entry_requirements` | internal-cadence § Instructions Phase 5 |
| `searchable_archive.per_entry_requirements.contradiction_handling.silent_contradiction_forbidden` | internal-cadence Principle 6 (LOAD-BEARING) |
| `close_the_loop.visible_action_from_previous_cycle_mandatory` | internal-cadence Principle 5 (LOAD-BEARING); § Instructions Phase 6 |
| `individual_crisis_escalation` | Universal Principle 3 (inherited across departments) |
| `escalations.*` | signal-skill-routing.md § Cross-Agent Escalation Routing |
| `active_alerts.sec_reg_fd_material_info_disclosure_timing` | change-comms § When to Use; Universal Principle 5 |
| `active_alerts.warn_act_layoff_notification_timing` | change-comms § Instructions Phase 2 legal-fence |
| `active_alerts.eu_works_council_consultation_requirements` | change-comms § Instructions Phase 2 international |
| `tool_permissions.draft_change_comms_without_legal_counsel: false` | change-comms Principle 1 (LOAD-BEARING) |
| `tool_permissions.skip_neutral_zone_comms: false` | change-comms Principle 4 (LOAD-BEARING) |
| `tool_permissions.ship_content_with_corporate_euphemism_*: false` | internal-cadence Principle 3 + change-comms Principle 3 (LOAD-BEARING) |
| `tool_permissions.publish_silent_contradiction_*: false` | internal-cadence Principle 6 (LOAD-BEARING) |
| `tool_permissions.release_material_npi_*: false` | Universal Principle 5 legal fence |
| `tool_permissions.draft_external_facing_change_comms: false` | change-comms § When to Use "Do NOT use for" |
| `tool_permissions.fabricate_*: false` | Universal Principle 1 + herald's no-fabrication rule inherited |
| `runtime_defaults.*_load_bearing` | Inherited from herald principles + signal-specific load-bearing rules across 3 skills |

## Debt Summary

Fields still `<FILL_IN>` as of this build (2026-07-31):

**CRITICAL (blocks specific work until filled):**
- `individual_crisis_escalation` contact fields (§6) — blocks any signal work that could plausibly surface individual crisis.
- `change_comms_legal_fence.counsel_contacts.employment_counsel_name/email` (§1) — blocks change-comms drafting for layoff / reorg-with-role-elim.
- `change_comms_legal_fence.counsel_contacts.securities_counsel_name/email` (§1) — blocks material-NPI change comms.
- `searchable_archive.location` (§5) — blocks archive entries.

**Standard (loud per §14.7 but non-blocking):**
- `change_comms_legal_fence.counsel_contacts.international_counsel_name/email` — needed only for international-scope changes.
- `channel_cadence_matrix.message_types.company_wide_urgent.matrix_override_operator` — default works.
- `model_routing.default_model` + `fallback_model` — operator model-selection policy.

Per §14.7 each debt announces on every compiled skill invocation until filled or marked
`n/a`. Individual-crisis + employment-counsel + securities-counsel + archive-location
fields carry invocation-blocking weight for the specific work they gate.
