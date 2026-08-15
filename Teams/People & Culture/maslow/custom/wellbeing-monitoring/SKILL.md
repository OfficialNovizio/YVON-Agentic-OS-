<!--
Custom skill — adopted from the Anthropic employee-wellbeing-monitoring plugin, then
genericized per §0.4b and retargeted to real YVON agents.

Source plugin: /var/folders/.../claude-hostloop-plugins/.../skills/employee-wellbeing-monitoring/SKILL.md
Source frontmatter names "Amit Choudhary (for maslow / People & Culture)" as author — this
adoption keeps the maslow assignment (correct target) but strips the VYON wrapping.

Note on the Python script: source SKILL.md references scripts/wellbeing_monitor.py but that
file was NOT included in the packaged plugin. Per §0.5 the script is
IMPLEMENTED-FROM-DESCRIPTION here — the formulas it encodes (eNPS = %promoters (9-10) -
%detractors (0-6); minimum-group-size suppression = boolean threshold check; burnout risk
flag = boolean combination rule over sentiment + workload signals) are documented in the
source SKILL.md prose. Not classified as Shared OS logical yet (§8.0 two-book minimum unmet).

Genericization strip (§0.4b):
- "maslow (People & Culture / CHRO agent)" → maslow (People & Culture / Motivation)
- "VYON" throughout → stripped
- "Hourbour" (example venture) → "example venture" generic
- "CRSO department" → "future Risk & ESG department" (in the current build roster)
- "comply (Legal)" → operator + employment counsel (no CLO agent exists in YVON)
- "Workforce Planning & Org Design" (VYON skill name) → workforce-planning (custom, hire)
- "People Analytics & Metrics" (VYON skill name) → Shared OS: people-analytics-metrics
  (planned per §13.6)
- "Recognition & Rewards Program Design" → recognition-program (custom, maslow — sibling)

All 7 public-source citations from source (Gallup, Udext, AIHR, Spring Health, NCBI,
CalHR, ks-agents.com) preserved verbatim in References.
-->
---
name: wellbeing-monitoring
type: custom
status: adopted from marketplace source, genericized
sources_referenced:
  - "Anthropic knowledge-work-plugins — employee-wellbeing-monitoring plugin (2026-07-02 packaged version). SKILL.md only; referenced scripts/wellbeing_monitor.py not included in package."
  - "Gallup — Five Elements of Wellbeing framework; pulse survey / eNPS best practices."
  - "Udext (2026) — Pulse survey best practices; the 'minimum viable action' rule."
  - "AIHR (2026) — eNPS Ultimate Guide."
  - "Spring Health — Burnout signal domains (intrapersonal / interpersonal / occupational)."
  - "NCBI — Burnout early recognition strategies (peer-reviewed / institutional source per §8.8)."
  - "ISO 45003 — Occupational health and safety management: psychosocial risks. Institutional standard per §8.8 (counts as one source per §8.0)."
  - "CalHR — Five Elements of Wellbeing (institutional source)."
fulfills_catalog_entry: n/a (part of maslow's expanded roster beyond catalog's 2-skill floor per §2)
genericization_notes:
  - "maslow assignment preserved (correct target in this build)."
  - "VYON / Hourbour / CRSO / comply / VYON-skill-names → stripped or retargeted to real YVON agents per CLAUDE.md §2."
assigned_agent: maslow (People & Culture / Motivation)
portable: true
date_added: 2026-07-29
tier: 3
description: Aggregate/cohort-level organizational wellbeing and burnout-risk monitoring. Runs pulse surveys, computes eNPS, interprets workload signals (overtime, absenteeism, EAP utilization), and flags teams for burnout-risk investigation — always at the aggregate level, NEVER as individual mental-health assessment. Trigger on "pulse survey for", "eNPS", "wellbeing check", "burnout signals", "workload trend", "team wellbeing report", or "aggregate wellbeing monitoring".
triggers:
  - pulse survey for
  - eNPS
  - wellbeing check
  - burnout signals
  - workload trend
  - team wellbeing report
  - aggregate wellbeing monitoring
  - psychosocial risk
---

# Wellbeing Monitoring

## Introduction

This skill gives maslow an aggregate/cohort-level way to track organizational wellbeing
signals — engagement sentiment (via eNPS), workload indicators (overtime trends,
absenteeism rate, EAP utilization), and burnout-risk patterns — so leadership can act on
early-warning signs *before* they become attrition or performance problems. It is
strictly an aggregate/cohort-level monitoring tool. It does NOT diagnose, assess, treat,
or counsel any individual's mental health, and it does not provide counseling. Those are
explicitly out of scope; individual crisis signals escalate immediately per § Fallback.

Adopted from Anthropic's `employee-wellbeing-monitoring` plugin, genericized per §0.4b.
All the source's public research citations (Gallup, Udext, AIHR, Spring Health, NCBI,
ISO 45003, CalHR) are preserved verbatim in References.

## Purpose

Burnout is consistently cited as a top HR risk, and psychosocial-risk management (ISO 45003
and the frameworks emerging from it) is increasingly a board-level accountability item,
not just an HR concern. This skill exists so maslow can surface workload and sentiment
patterns early — at the team/venture level — and route them to the right fix (which is
often an org-design or staffing issue, not a "resilience training" issue) rather than
letting them surface only after someone has already left or burned out.

Complements the two other maslow skills:

- **`motivation-map`** owns the quarterly SDT-need pulse (autonomy / competence /
  relatedness scores). This skill owns the *wellbeing signal* layer that corroborates or
  contradicts the motivation-map read — pulse sentiment + overtime + absence + EAP.
- **`self-determination-theory`** provides the interpretive framing when a wellbeing
  signal traces to need-frustration (usually autonomy or competence starvation).

## When to Use

Trigger on:

- "Pulse survey for [team / venture]" / "run a wellbeing pulse"
- "eNPS" / "compute eNPS for [cohort]" / "eNPS trend"
- "Interpret [these] wellbeing signals" / "workload trend for [team]"
- "Build a wellbeing-monitoring cadence for [venture]"
- "Flag [team] for elevated burnout-risk signals"
- "Aggregate wellbeing report for the Board / operator"
- "Psychosocial risk audit for [cohort]"

Do NOT use for:

- **ANY individual's mental health, wellbeing state, or crisis assessment.** This is the
  hard boundary — cross-scope failure here is the most serious failure mode this skill
  has. Individual crisis signals escalate immediately per § Fallback.
- SDT-need diagnostic (autonomy / competence / relatedness scoring) → `motivation-map`
  owns the SDT pulse; this skill owns the wellbeing/workload signals that corroborate.
- Recognition program design → `recognition-program` (sibling, this agent).
- Compensation/pay-equity questions → `payroll-and-eor` (custom, hire) or future
  `comp-benchmarking`.

## Structure / Protocol

The wellbeing-monitoring cycle:

```
1. Scope + cadence     Which venture/team; 1-2 focused themes per cycle; short (5-10 Qs)
                       format. NOT a sprawling annual engagement survey.
2. Include eNPS        Recurring baseline metric so there's one comparable trend line
                       across cycles. Score = %promoters (9-10) minus %detractors (0-6).
3. Layer workload data Aggregate signals only: overtime hours, absenteeism rate, EAP
                       utilization rate. Team/cohort level, never per-person.
4. Suppress small groups Apply minimum-group-size threshold before ANY segmented figure
                       ships. Shared with the future Shared OS: people-analytics-metrics.
5. Burnout risk flag   Compute per team/venture combining sentiment trend + workload
                       signals. Treat as "worth investigating," NEVER as diagnosis of any
                       individual.
6. Investigate root    Workload-driven pattern usually needs an org-design/staffing fix
                       (route to workforce-planning), NOT a wellness-communications fix.
7. Close the loop      Before the next cycle, communicate at least one concrete action
                       taken from this cycle. Minimum-viable-action rule.
8. HARD BOUNDARY       If any individual signal of crisis or serious distress surfaces
                       via any channel — STOP. Escalate per § Fallback (manager + HR Ops
                       + EAP). Do NOT attempt to counsel, assess, or resolve inside this
                       skill.
```

## Instructions

Step numbers match the Structure / Protocol above.

### Step 1 — Define scope and cadence

Which venture/team is in scope. Focus on 1–2 themes per cycle (e.g., "workload sustainability
+ team support" or "workload + growth path"). Short format: 5–10 questions total. Do NOT
combine wellbeing monitoring with a sprawling annual engagement survey — this is a *pulse*,
not the annual instrument.

### Step 2 — Include eNPS as a recurring baseline metric

**Employee Net Promoter Score** = one recurring question: "how likely are you to recommend
this as a place to work, 0–10." Scoring:

- **Promoters:** responses of 9 or 10.
- **Passives:** responses of 7 or 8.
- **Detractors:** responses of 0 through 6.
- **eNPS = %promoters − %detractors** (as a number between −100 and +100).

Use `scripts/wellbeing_monitor.py` for the arithmetic (see § Python Utility). Keep eNPS
in EVERY cycle so there's one comparable trend line — even when cycle themes rotate.

### Step 3 — Layer in aggregate workload / occupational signals

Where the data exists, layer in:

- **Average overtime hours** per person per week (aggregate, team-level).
- **Absenteeism rate** — unscheduled absence days ÷ scheduled workdays (team-level).
- **EAP utilization rate** — aggregate uptake percentage (from the Employee Assistance
  Program vendor's aggregate report; NEVER individual-level utilization data).

Every one of these is at the team/cohort level. Individual-level workload / absence /
EAP data is NEVER read or reported by this skill — the source SKILL.md is emphatic on
this, and it is enforced here as a hard boundary via Principle 1.

### Step 4 — Apply minimum-group-size suppression

Before reporting any segmented figure (per-team eNPS, per-function overtime average,
etc.), check that the cohort meets the minimum-group-size threshold (typically 5–8 people;
default 5 in `hire-config.md`-adjacent maslow-config when built; explicit `<FILL_IN>` at
build time). If the cohort is below threshold: suppress the segmented figure, roll up
with a larger cohort, or report qualitatively — never publish a per-person-identifiable
figure.

This is the same discipline used by future `Shared OS: people-analytics-metrics` — the
suppression logic is a shared Shared OS candidate when both skills mature.

### Step 5 — Compute the aggregate burnout-risk flag

Per team/venture, using `scripts/wellbeing_monitor.py`:

- **RED (elevated):** eNPS trend declining ≥2 cycles AND workload signal elevated
  (overtime, absenteeism, or EAP utilization above baseline).
- **AMBER (watch):** eNPS trend declining 1 cycle OR workload signal elevated (either
  without the other).
- **GREEN:** eNPS stable or rising AND workload signals within baseline.

Treat every flag as "worth investigating," never as a diagnosis of any individual. The
flag is a routing signal — it says "look here" not "this person is burned out."

### Step 6 — Investigate the actual root cause

A workload-driven pattern usually points to an org-design or staffing issue, not a
wellness-communications issue. **Route to `workforce-planning` (custom, hire) as
supporting evidence for a structural recommendation** rather than treating it as a
standalone wellness fix.

Example (from the source, genericized): a team pulse shows eNPS declining two cycles;
aggregate overtime for the engineering function is trending up. Cross-reference with
`workforce-planning`'s existing finding that this team's manager is at a 9-person span
of control with a recommended team-lead layer pending. The workload signal *corroborates*
that structural recommendation rather than pointing to a new, separate wellness
initiative. Fix the structure; the wellness signal follows.

### Step 7 — Close the loop before the next cycle

Communicate at least one concrete action taken in response to this cycle's findings
BEFORE launching the next pulse. Same minimum-viable-action rule as `motivation-map`
Phase 2. Skipping this is the #1 reason wellbeing-monitoring response rates degrade over
time (Udext).

### Step 8 — HARD BOUNDARY on individual crisis signals

If any individual signal of crisis, self-harm risk, or serious personal distress surfaces
through ANY channel (survey free-text comment, a conversation, a manager's message, a
peer's flag), **STOP IMMEDIATELY**. Do NOT attempt to counsel, assess, or resolve
inside this skill.

- Escalate to the person's **manager + HR Ops** right away.
- Point them to the org's **Employee Assistance Program (EAP)** or appropriate
  professional / emergency resource.
- Log the escalation (without individual-attributable content) for governance visibility.

This is the one hard boundary in this skill — **no exceptions, no operator overrides.**

## Core Concepts (reference)

### Gallup's Five Elements of Wellbeing

- Career · Social · Financial · Physical · Community.

A useful frame for thinking about which dimension a signal or survey question is actually
measuring, so monitoring doesn't collapse into "engagement" alone.

### Pulse Surveys and eNPS

Pulse surveys are short (5–10 questions), frequent, and focused on 1–2 themes rather than
a sprawling annual survey. eNPS gives one comparable trend line over time as the recurring
baseline (Gallup; AIHR; Udext).

### Burnout Signal Domains (for aggregate interpretation, NEVER individual diagnosis)

- **Intrapersonal** — fatigue, concentration, sleep-quality signals — visible in aggregate
  as declining sentiment scores.
- **Interpersonal** — irritability, reduced empathy — visible as team-friction signals
  (not measured directly by this skill; corroborating input only).
- **Occupational** — absenteeism, tardiness, declining performance output, sustained
  overtime — the aggregate signals this skill measures.

(Spring Health; NCBI)

### Governance Context — ISO 45003

Psychosocial-risk frameworks (ISO 45003) and sustainability-reporting trends are pulling
workforce wellbeing into board-level accountability. When YVON's future **Risk & ESG**
department stands up (task #6 in the current build roster), aggregate wellbeing/burnout
trends from this skill should feed that remit — psychosocial risk is increasingly an
enterprise risk category, not solely an HR one. This skill will route aggregate
psychosocial-risk trends to the Risk & ESG lead when that department comes online.

## Python Utility

`scripts/wellbeing_monitor.py` provides the arithmetic for steps 2, 4, and 5:

- `enps(promoters, passives, detractors)` — %promoters − %detractors → eNPS score (int).
- `min_group_size_ok(cohort_size, threshold)` → bool.
- `suppress_if_small(value, cohort_size, threshold)` → returns the value or None.
- `burnout_risk_flag(enps_trend_direction, workload_elevated)` → 'RED' | 'AMBER' | 'GREEN'.

The script is IMPLEMENTED-FROM-DESCRIPTION per §0.5 — the source plugin's SKILL.md
described these functions but did not ship the file. See the script's module docstring for
provenance. It carries self-tests (`python3 wellbeing_monitor.py --test`) and is kept as
an agent-local utility, not a Shared OS logical script, until paired with a second
authenticated book source per §8.0.

## Output Format

Each invocation produces one or more of:

- **Pulse questionnaire** — 5–10 questions, per-cohort, versioned across cycles for trend
  comparability. Includes the eNPS baseline question every cycle.
- **Aggregate response report** — per-cohort eNPS score with trend delta, focused-theme
  question averages, response-rate context, minimum-group-suppression notes.
- **Burnout risk flag** — GREEN / AMBER / RED per cohort, with rationale (eNPS trend +
  workload signal state).
- **Aggregate risk report** — for board / operator visibility: cohort × flag matrix,
  cross-referenced with `workforce-planning`'s open structural findings.
- **Escalation log** (individual crisis signals only) — count and category (never
  individual-attributable), routed to operator + HR Ops for governance visibility.

## Principles

1. **Aggregate / cohort only. Never individual.** This skill monitors organizational
   signals; it does not diagnose, assess, or counsel any individual. Full stop, no
   exceptions, no operator overrides.
2. **Minimum-group-size suppression is non-negotiable.** Segmented figures below the
   threshold get suppressed, rolled up, or reported qualitatively — never published in
   a way that could be traced to individuals.
3. **Any individual crisis signal escalates immediately.** Manager + HR Ops + EAP. Never
   handled inside this skill.
4. **Close the loop every cycle.** One visible action from the previous cycle before the
   next pulse. Skipping this destroys response rates.
5. **Workload-driven risk signals are a staffing / org-design problem first, not a
   communications problem.** Route to `workforce-planning` for the structural fix; do NOT
   default to a resilience-training or wellness-comms response.
6. **eNPS in every cycle.** Even when themes rotate, the eNPS baseline stays so there's
   one comparable trend line.
7. **Signals corroborate, don't diagnose.** A burnout flag is a "look here" signal, not
   a conclusion. The actual investigation happens in the routed-to skill
   (workforce-planning / motivation-map SDT diagnostic / recognition-program).
8. **§0.6 flag.** Burnout-signal thresholds are Tier B (canonical Gallup / AIHR / Udext
   guidance and ISO 45003 institutional standard, cited but not page-cited from a book in
   `Agents/_books/`). Downgrade to Tier A when a workplace-wellbeing book (Christensen &
   Leiter, or Michael Leiter / Christina Maslach's *The Truth About Burnout* 1997 or
   *Burnout: A Multidimensional Perspective*) is paired with an ISO 45003 institutional
   citation per §8.0.

## Fallback

- **Any individual signal of crisis, self-harm risk, or serious personal distress** (in a
  survey comment, a conversation, or any other channel): **STOP IMMEDIATELY.** Do NOT
  attempt to counsel, assess, or resolve. Escalate to the person's manager + HR Ops right
  away, and point them to the org's Employee Assistance Program (EAP) or appropriate
  professional / emergency resource. **This is the one hard boundary in this skill — no
  exceptions, no operator overrides.**
- **Group size below the privacy threshold.** Suppress the segmented figure; roll up with
  a larger cohort or report qualitatively.
- **Declining survey response rates.** Check whether the minimum-viable-action rule
  (Instructions step 7) was followed before adding more surveys or questions. The usual
  cause is a trust gap, not a survey-design gap.
- **Workload / burnout signal traced to understaffing or a structural issue.** Route to
  `workforce-planning` (custom, hire) rather than treating it as a communications or
  "resilience" problem.
- **Request to report on a named individual's wellbeing / mental-health state.** Decline.
  This skill is aggregate/cohort-only, full stop. Route the request to the person's
  manager (if it's a legitimate management concern) or to EAP (if it's a personal health
  concern the person themselves wants support with).
- **RED flag without corroborating structural context.** Route to `workforce-planning`
  anyway for a structural read before defaulting to a wellness-comms response — the
  structural cause may be present but not yet documented.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `motivation-map` (custom, maslow) | The SDT-need pulse scores that motivation-map runs; this skill's workload/absence signals corroborate its RED/AMBER/GREEN flags | Bidirectional — motivation-map calls this skill for wellbeing corroboration; this skill calls motivation-map when a burnout flag needs SDT-framing to explain the "why" |
| `self-determination-theory` (custom, maslow) | Theoretical framing when a wellbeing signal traces to need-frustration | Downstream — via motivation-map |
| `recognition-program` (custom, maslow) | Morale-related interventions where the signal shows relatedness gap AND relational substrate is present | Downstream — via motivation-map's Phase-5 menu |
| `workforce-planning` (custom, hire) | Structural fixes for workload-driven burnout patterns (span, layers, staffing) | Downstream — the primary route for RED-flag / workload-elevated signals |
| `hire` (P&C — Lead) | Universal principle inheritance (aggregate-only, verification-before-completion, Charter senior); autonomy-restoration interventions | Upstream on principles; downstream on autonomy-need interventions |
| Future `Risk & ESG` department lead (CRSO) | Aggregate psychosocial-risk trends per ISO 45003 governance | Downstream — reporting relationship when Risk & ESG dept comes online (task #6) |
| Future `Shared OS: people-analytics-metrics` | Minimum-group-size suppression logic (shared); turnover / tenure / absenteeism data (shared) | Shared logic and shared underlying data |
| Manager + HR Ops + EAP | Individual crisis signals (immediate escalation, no exceptions) | Escalation only — never call-and-return |
| `Shared OS: verification-before-completion` | Evidence gate on every pulse, flag, report before shipping | Cross-cutting |

## References (public / verifiable)

- [Employee Wellbeing 2026: Measure, Improve, Prevent Burnout — ks-agents.com](https://ks-agents.com/blog/employee-wellbeing-measure-improve/)
- [Employee Burnout: Signs, Causes, and What HR Can Do — Spring Health](https://www.springhealth.com/blog/employee-burnout)
- [Seeing burnout coming: early signs and recognition strategies — NCBI](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12689927/)
- [Employee Surveys: Types, Tools and Best Practices — Gallup](https://www.gallup.com/workplace/692474/workplace-employee-surveys.aspx)
- [Employee Pulse Surveys: Benefits and Best Practices — Udext](https://www.udext.com/blog/benefits-best-practices-pulse-survey)
- [Employee Net Promoter Score (eNPS): 2026 Ultimate Guide — AIHR](https://www.aihr.com/blog/employee-net-promoter-score-enps/)
- [Five Elements of Wellbeing — CalHR](https://benefits.calhr.ca.gov/state-supervisors-managers/wellbeing/)
- ISO 45003:2021 — Occupational health and safety management: psychosocial risks (institutional standard; access via ISO or a national standards body).
