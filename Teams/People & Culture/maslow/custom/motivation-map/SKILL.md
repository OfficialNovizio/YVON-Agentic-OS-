<!--
Custom skill — built from the catalog's `vyon-motivation-map` entry (protocol + purpose),
genericized per §0.4b, aligned to SDT vocabulary (per user decision 2026-07-29) for clean
coordination with maslow's `self-determination-theory` skill.

Genericization strip (§0.4b):
- name: vyon-motivation-map → motivation-map (§0.4a)
- "founders/early hires" → "any defined cohort" (with founders and early hires as examples)
- "multi-job founder reality" → "high-workload contexts (founder, early hire, on-call, sustained-load role)"
- "private flag to CHRO" → "aggregate risk flag routed to hire lead; individual crisis
  signals escalate per wellbeing-monitoring fallback"

Pulse-axis vocabulary decision (locked 2026-07-29):
- CHOSEN: SDT 3-need vocabulary (autonomy / competence / relatedness)
- REJECTED: catalog's "autonomy, mastery, purpose, security" (Pink + Maslow blend) —
  would produce weaker coordination with self-determination-theory skill.
- REJECTED: 4-axis SDT + Edmondson psychological safety — deferred until an
  Edmondson book is placed in Agents/_books/ per §8.0 two-book rule.
- Original catalog vocabulary preserved in this comment block for provenance.

Route classification per §8.2: mostly Route D (operational rubric — the pulse structure)
with Route B elements (the burnout flag is a rule-based combination of signals). The rules
are simple enough to encode without a script today; a future `Shared OS/logical/`
promotion happens if the rules multiply and need scripted checking.
-->
---
name: motivation-map
type: custom
status: built from catalog (vyon-motivation-map), genericized per §0.4b, aligned to SDT vocabulary
sources_referenced:
  - "Catalog entry: vyon-motivation-map (VYON_Skills_Catalog_Full_v2.html) — purpose, protocol structure. Provenance only; content genericized."
  - "Deci, E. L., Olafsen, A. H., & Ryan, R. M. (2017). Self-Determination Theory in Work Organizations. Annual Review of Organizational Psychology and Organizational Behavior, 4, 19-43. Grounds the 3-need vocabulary and intervention direction. FREE via Corporate Research Forum."
  - "Ryan, R. M. & Deci, E. L. (2000). Self-Determination Theory and the Facilitation of Intrinsic Motivation. American Psychologist, 55(1), 68-78."
  - "Udext (2026) — pulse survey best practices, including the 'minimum viable action' rule (one concrete action from the previous cycle before launching the next)."
  - "Gallup — pulse survey and eNPS best practices (short + frequent + focused on 1-2 themes)."
fulfills_catalog_entry: vyon-motivation-map
genericization_notes:
  - "vyon- prefix stripped per §0.4a."
  - "'founders/early hires' → 'any defined cohort'; 'multi-job founder reality' → 'high-workload contexts' per §0.4b."
  - "'private flag to CHRO' → aggregate flag routed to hire lead (real YVON leader); individual crisis handled via wellbeing-monitoring fallback."
  - "Pulse axes migrated from catalog's 'autonomy, mastery, purpose, security' to SDT's 'autonomy, competence, relatedness' for coordination with self-determination-theory skill."
assigned_agent: maslow (People & Culture / Motivation)
portable: true
date_added: 2026-07-29
tier: 3
description: The operational sibling to self-determination-theory. Runs a quarterly team-level pulse on SDT's 3 needs (autonomy, competence, relatedness), computes an aggregate burnout early-warning flag, and selects an intervention from a menu matched to the diagnosed need gap. Trigger on "run the motivation pulse", "quarterly needs pulse", "team morale check", "burnout check", "motivation trend for [team/venture]", or "map the motivation gap for [cohort]".
triggers:
  - run the motivation pulse
  - quarterly needs pulse
  - team morale check
  - burnout check
  - motivation trend for
  - map the motivation gap for
  - is this team burning out
  - what's happening with engagement on
---

# Motivation Map

## Introduction

This skill is the operational sibling to `self-determination-theory` (also under maslow).
SDT provides the theoretical framework — which need is starved, where motivation sits on
the autonomous↔controlled continuum, what intervention direction matches. Motivation-map
runs the actual cadence: a quarterly team-level pulse on SDT's 3 needs, an aggregate
burnout early-warning flag, and an intervention menu matched to what the diagnostic
surfaces.

Built from the catalog's `vyon-motivation-map` entry, genericized per §0.4b, and aligned
to SDT's vocabulary (autonomy / competence / relatedness) for clean handoff to the
`self-determination-theory` skill. The catalog's original vocabulary was a Pink + Maslow
blend ("autonomy, mastery, purpose, security"); the migration to SDT vocabulary is
recorded in provenance so the original framing isn't lost.

## Purpose

Prevents two failure modes maslow's other-skills-alone don't catch:

1. **Motivation problems surface too late.** Without a regular pulse, the signal reaches
   maslow only when someone has already resigned, gone into burnout, or a manager escalates
   a team-level conflict. By then the intervention window has closed.
2. **Interventions get chosen by hunch rather than diagnosis.** Without a matched-menu
   approach, "let's try recognition" becomes the default fix regardless of whether the
   underlying starved need is autonomy, competence, or relatedness. That's the classic
   overjustification-effect failure mode SDT's Principle 4 warns against.

This skill runs the quarterly cadence and produces an aggregate diagnostic + intervention
recommendation that routes into the right downstream response — sometimes `recognition-program`,
sometimes `wellbeing-monitoring`, sometimes `workforce-planning` for a structural fix,
sometimes future `grove` or `merit`.

## When to Use

Trigger on:

- "Run the motivation pulse" / "quarterly needs pulse" / "start the motivation cycle"
- "Team morale check" / "burnout check" / "is this team burning out"
- "Motivation trend for [team / venture]" / "what's happening with engagement on [cohort]"
- "Map the motivation gap for [cohort]"
- Auto-cadence — start of every quarter, for each cohort with an established pulse baseline

Do NOT use for:

- Individual-level motivation diagnosis or coaching → aggregate/cohort only; individual
  motivation coaching is out of maslow's scope entirely.
- Individual crisis or distress signals → immediately escalate per `wellbeing-monitoring`
  § Fallback (manager + HR Ops + EAP). Do NOT try to resolve inside motivation-map.
- Comprehensive engagement survey → this is a *pulse* (5–10 questions, focused on the
  3 SDT needs). A sprawling annual engagement survey is a different instrument.
- ATS pipeline health, hiring loop metrics → `ats-selection` D&I funnel or `Shared OS: people-analytics-metrics` (when built).

## Structure / Protocol

The quarterly motivation-map cycle:

```
Phase 1 — Design pulse (once per cohort baseline; re-tuned annually)
    9-12 questions total, split across the 3 SDT needs (3-4 per need).
    Same questions per cycle so trend data is comparable.

Phase 2 — Communicate the "minimum viable action" from the last cycle
    BEFORE launching the new pulse. One visible action taken in response to
    the previous quarter's finding. This is the trust maintenance rule; skipping it
    is the #1 reason pulse response rates degrade over time (Udext research).

Phase 3 — Run the pulse (short window; 5-10 days)
    Voluntary; anonymous; team-level identity only (never individual-attributable).
    Apply minimum-group-size suppression before reporting any segmented figure
    (same threshold as future Shared OS: people-analytics-metrics).

Phase 4 — Score, compute the burnout early-warning flag, diagnose
    Per-need average scores (autonomy, competence, relatedness).
    Trend vs previous cycle (rising, stable, declining).
    Burnout flag = combination rule (see § Instructions Phase 4).
    Route the diagnostic to self-determination-theory for framing.

Phase 5 — Select intervention from the menu; route to owning skill
    Match starved need → intervention direction (SDT's Phase-3 matrix).
    Route to recognition-program / workforce-planning / grove / merit / hire
    per the match. This skill produces the recommendation; the routed-to skill
    designs the actual intervention.

Phase 6 — Measure follow-up
    12-week window (or by next quarterly pulse, whichever is longer).
    Route follow-up read to wellbeing-monitoring and (when built) Shared OS:
    people-analytics-metrics.
```

## Instructions

### Phase 1 — Design the pulse (once per cohort baseline)

For each cohort (team / function / venture), design a 9–12 question pulse split across
the 3 SDT needs. 3–4 questions per need. Use a 1–5 Likert scale (Strongly disagree →
Strongly agree). The same questions get used every cycle so trend data is comparable.

**Autonomy questions (3–4):**
- "I have meaningful choice about *how* I do my work."
- "The reason we're doing my current work is clear to me and I value it."
- "I have the discretion I need to make decisions in my role."
- Optional: "Approvals and processes in my role feel appropriate, not excessive."

**Competence questions (3–4):**
- "I know whether I'm improving in my role — the feedback loop works."
- "My current work stretches my skills without being crushing."
- "I have the tools and resources to do my work well."
- Optional: "I've grown as a professional in the last quarter."

**Relatedness questions (3–4):**
- "I feel connected to and supported by my team."
- "I feel seen and valued by my manager and peers."
- "I trust the people I work with."
- Optional: "I feel like I'm part of something worthwhile with this team."

Question wording gets tuned to the cohort's context but the SDT-need mapping is fixed.
Design happens once at baseline; the pulse is stable after that.

### Phase 2 — Communicate the "minimum viable action" from the last cycle

**BEFORE launching a new pulse**, communicate to the cohort at least one concrete action
taken in response to the previous cycle's findings. This is a hard rule — skipping it is
the #1 reason pulse response rates degrade (Udext research). The action doesn't have to be
large; it has to be visible and traceable back to the previous cycle's data.

Examples of minimum-viable actions:
- "Last quarter's pulse showed low autonomy in engineering. We removed the mandatory
  design-doc approval for changes under X impact — the team now decides."
- "Last quarter's pulse showed declining relatedness in marketing. Manager 1:1 cadence
  moved from monthly to bi-weekly."

If NO action was taken in response to the previous cycle, do not launch a new pulse until
one is. Running a pulse whose predecessor produced no visible response is worse than
running no pulse — it teaches the cohort that the survey doesn't matter.

### Phase 3 — Run the pulse

- **Window:** 5–10 days. Longer erodes response rates; shorter under-samples.
- **Voluntary:** never mandatory. Mandatory participation destroys the data validity.
- **Anonymous at the individual level:** never per-person-attributable in reporting.
  Team-level identity only.
- **Minimum-group-size suppression:** if the cohort is smaller than the privacy threshold
  (matches future `Shared OS: people-analytics-metrics` — currently placeholder), do NOT
  report the segmented figure; roll it up with a larger group or report qualitatively.
- **Response-rate signal:** if response rate falls below ~40% for a cohort with prior
  higher rates, the drop itself is the finding (usually a trust gap, not a survey-design
  gap — recheck Phase 2 was honored).

### Phase 4 — Score, flag burnout risk, diagnose

**Compute per-need aggregate scores:**
- Average the Likert responses within each need category (autonomy / competence / relatedness).
- Score range: 1.0–5.0. Rough interpretation bands: 4.0+ satisfied; 3.0–4.0 stable;
  2.5–3.0 attention warranted; below 2.5 starved.
- **Threshold labels are heuristics, not rules — flag as such per §0.6.**

**Compute trend vs previous cycle:**
- Δ per need = current cycle avg − previous cycle avg.
- Trend labels: rising (Δ ≥ +0.3), stable (|Δ| < 0.3), declining (Δ ≤ −0.3).
- The 0.3 threshold is heuristic (about a half-point on a 5-point scale) — subject to
  operator override in `operational/agent/maslow-config.md` when built.

**Compute the aggregate burnout early-warning flag:**
- **RED (elevated):** any need scoring below 2.5 AND trending declining, OR two needs
  declining simultaneously, OR corroborating workload signal from `wellbeing-monitoring`
  (elevated overtime, absenteeism, EAP utilization).
- **AMBER (watch):** any need scoring 2.5–3.0 AND trending declining, OR one need
  declining without workload corroboration.
- **GREEN:** all needs ≥3.0 with stable-or-rising trends and no workload flag.

**Route the diagnostic to `self-determination-theory`** for the theoretical framing (which
need starved? autonomous vs controlled motivation? what intervention direction matches?).
Do NOT re-implement SDT's Phase-1/2/3 logic here — call it.

### Phase 5 — Select intervention from the menu; route to owning skill

Match the starved need (from Phase 4 diagnostic + SDT framing) to an intervention
direction, then route to the owning skill. The menu:

| Starved need | Intervention direction | Route to (primary) | Route to (secondary) |
|---|---|---|---|
| Autonomy | Restore *how*-level choice; audit for micromanagement / approval theater; provide task rationale | `hire` (Identity anchor — adult-presumption principle); future `merit` (autonomy in perf mgmt) | `workforce-planning` if structural cause (span too wide, layer too thin producing manager-panic-approval-culture) |
| Competence | Add scaffolding + timely feedback; adjust difficulty; visible progress | Future `grove` (L&D — training design); future `merit` (feedback methods) | `workforce-planning` if the person is stuck in a role that has outgrown them or hasn't grown into them |
| Relatedness | Rebuild relational scaffolding first (1:1 cadence, team rituals, manager consistency); recognition on top only after substrate is present | `recognition-program` (custom, maslow — peer-to-peer emphasis) | `hire` if the relational break was a hiring/loop misfit; future `merit` if manager quality is the root |

For RED-flag cohorts, the intervention recommendation ships alongside a route to
`wellbeing-monitoring` for a fuller aggregate workload/burnout read within 30 days.

**Never default to "add a recognition program" for an autonomy or competence starved-need
diagnosis.** That is the overjustification-effect failure the SDT skill's Principle 4
exists to prevent. Route recognition only when the diagnosis actually points there.

### Phase 6 — Measure follow-up

12-week window (or by the next quarterly pulse, whichever comes later — no faster than the
intervention has had a chance to land):

- **Route follow-up read to `wellbeing-monitoring`** for corroborating workload/absence/EAP
  signals.
- **Route the next-quarter pulse** to Phase 1 of the next cycle — the previous cycle's
  intervention becomes Phase 2's "minimum viable action" to communicate.
- **If the follow-up shows no improvement**, do NOT double down on the same intervention
  reflexively. Re-run Phase 4 diagnosis — the starved need may have shifted, the
  intervention may have been the wrong direction, or the root cause may be structural
  (route to `workforce-planning`).

## Output Format

Each invocation produces one or more of:

- **Pulse questionnaire** — 9–12 questions, per-cohort, versioned so subsequent cycles use
  the same wording.
- **Aggregate response report** — per-cohort, per-need averages, trend deltas from previous
  cycle, response-rate context, minimum-group-suppression notes where applicable.
- **Burnout early-warning flag** — GREEN / AMBER / RED per cohort with rationale, plus
  corroborating signals from `wellbeing-monitoring` if available.
- **Intervention memo** — starved need → SDT-derived intervention direction → routed-to
  skill → 90-day follow-up plan.
- **Follow-up read** — pulse trend change since last cycle, whether the intervention landed,
  next-cycle recommendation.

## Principles

1. **Quarterly cadence.** Pulse runs quarterly. More often burns out response rates; less
   often misses the intervention window. Cadence is a hard rule; exceptions require written
   operator reason.
2. **Aggregate/cohort only.** Same rule inherited across all maslow skills: never
   individual-attributable. Minimum-group-size suppression applies before any segmented
   figure ships.
3. **SDT-aligned vocabulary.** Autonomy / competence / relatedness — matches the sibling
   `self-determination-theory` skill exactly. Do NOT drift to alternative vocabularies
   ("mastery, purpose, security") in output — the drift breaks the SDT handoff.
4. **Interventions from the menu, not invented.** The Phase-5 menu is the routing surface.
   New intervention directions get added to the menu (an operator or department decision),
   never invented per invocation.
5. **Minimum viable action rule.** Before every pulse, communicate one visible action from
   the previous cycle. Skipping it destroys the response rate — running a pulse whose
   predecessor produced no response is worse than running no pulse.
6. **Never add rewards to a need-frustration problem.** Overjustification-effect rule from
   `self-determination-theory` Principle 4 — enforced here at the intervention-selection
   step by routing recognition ONLY when the diagnosis points to relatedness (and the
   relational substrate is already present).
7. **Threshold labels are heuristics.** Score bands (4.0+ satisfied, below 2.5 starved)
   and trend deltas (±0.3) are heuristics, not rules. §0.6 flag persists until an
   SDT-workplace-application book (Deci, Olafsen, Ryan 2017 or Gagné & Deci 2005 in a
   book-cited form) grounds specific thresholds.
8. **Individual crisis signals escalate immediately.** If any individual distress signal
   surfaces via any channel during the pulse, motivation-map STOPS and routes per
   `wellbeing-monitoring` § Fallback (manager + HR Ops + EAP). No exceptions.

## Fallback

- **Response rate below ~40%.** The drop is the finding, not a data problem. Do NOT
  average what came in; report the response-rate collapse to hire lead with a specific ask
  about whether the minimum-viable-action rule (Phase 2) was honored last cycle.
- **Cohort smaller than privacy threshold.** Roll up with a larger cohort or report
  qualitatively — never publish per-need averages that could be traced back to individuals.
- **No previous-cycle baseline.** Report current-cycle absolute values only; skip trend
  labels. Note the missing baseline explicitly.
- **RED flag without corroborating workload signal.** Do not treat as false alarm — the
  sentiment signal alone is sufficient to trigger a Phase-5 intervention recommendation.
  Note the missing corroboration and route to `wellbeing-monitoring` for a workload/absence
  read within 30 days.
- **Individual crisis signal in a free-text response.** Stop. Do NOT continue processing
  the pulse. Route per `wellbeing-monitoring` § Fallback immediately (manager + HR Ops + EAP).
- **Intervention already tried last cycle and no change.** Do not double down. Re-run Phase 4
  diagnosis — the diagnostic may have been wrong, the root cause may be structural (route
  to `workforce-planning`), or the intervention direction may have been the wrong branch
  of the SDT menu.
- **Cohort requests moving to sprawling annual survey format.** Push back — that's a
  different instrument. This skill is a *pulse* (short, frequent, focused). A separate
  discussion is required to introduce a full annual engagement survey.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `self-determination-theory` (custom, maslow) | Theoretical framing of the diagnostic + intervention direction | Sibling — motivation-map calls SDT skill for framing; SDT returns direction |
| `wellbeing-monitoring` (custom, maslow) | Aggregate workload/absence/EAP signals that corroborate a burnout flag; individual crisis signals escalate OUT | Bidirectional — motivation-map pulse feeds wellbeing view; wellbeing signals corroborate motivation-map flags |
| `recognition-program` (custom, maslow) | Intervention when Axis 1 diagnosis = relatedness AND substrate is already present | Downstream on Phase 5 route |
| `hire` (P&C — Lead) | Universal principle inheritance (aggregate-only, verification-before-completion, Charter senior); autonomy-intervention routing for identity-anchor's adult-presumption principle | Upstream on principle inheritance; downstream on autonomy interventions |
| Future `grove` (P&C — L&D) | Competence-intervention design (training programs, feedback scaffolding) | Downstream on Phase 5 competence route |
| Future `merit` (P&C — Performance) | Autonomy-in-performance-management + manager-quality interventions | Downstream on Phase 5 autonomy and relatedness routes |
| `workforce-planning` (custom, hire) | Structural-cause interventions (span too wide, missing team-lead layer, role misfit) | Downstream on Phase 5 when the starved need traces to a structural cause |
| Future `Shared OS: people-analytics-metrics` | Minimum-group-size privacy threshold; turnover / engagement corroboration for follow-up | Shared logic (privacy threshold); downstream for follow-up measurement |
| `Shared OS: verification-before-completion` | Evidence gate on every pulse, flag, intervention memo before shipping | Cross-cutting |

## References (public / verifiable)

- [Deci, Olafsen, & Ryan (2017) — Self-Determination Theory in Work Organizations (PDF, FREE)](https://www.crforum.co.uk/wp-content/uploads/2025/02/Deci-Olafsen-Ryan-Self-determination-Theory-in-Work-Organizations-The-State-of-a-Science.pdf)
- [Gagné & Deci (2005) — Self-Determination Theory and Work Motivation (PDF, FREE)](https://selfdeterminationtheory.org/SDT/documents/2005_GagneDeci_JOB_SDTtheory.pdf)
- [Employee Pulse Surveys: Benefits and Best Practices — Udext](https://www.udext.com/blog/benefits-best-practices-pulse-survey) — source of the "minimum viable action" rule
- [Gallup — Employee Surveys: Types, Tools and Best Practices](https://www.gallup.com/workplace/692474/workplace-employee-surveys.aspx)
- [Employee Net Promoter Score (eNPS): 2026 Ultimate Guide — AIHR](https://www.aihr.com/blog/employee-net-promoter-score-enps/)
