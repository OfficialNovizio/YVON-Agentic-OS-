<!--
Custom skill — built from scratch, synthesized from three named published sources (see
`sources_referenced` frontmatter). Body follows §11 required structure + §14.2 exact-heading
compiler contract.

Genericization notes (§0.4a, §0.4b):
- Catalog name `vyon-hiring-kit` → prefix stripped to `hiring-kit`.
- Catalog protocol said "VP-Product-first hiring sequence" (VYON-specific first-hire).
  Replaced with generic "critical-role-first sequencing (founder/leader-named bottleneck role)"
  per §0.4b. Provenance recorded here in comment block only — never in executable body.

Hire-decision threshold (§Principles rule 6) locked to ≥3.0 avg + no competency <2 with
operator-configurable override in `operational/agent/hire-config.md`. Signed off 2026-07-29.
-->
---
name: hiring-kit
type: custom
status: built from scratch
sources_referenced:
  - "Smart, Geoff & Randy Street (2008). Who: The A Method for Hiring. Ballantine Books. Chapters 2 (Scorecard) and 7 (Reference Check / TORC)."
  - "Bock, Laszlo (2015). Work Rules! Insights from Inside Google That Will Transform How You Live and Lead. Twelve. Chapter 4 (Searching for the Best) — structured-interview predictive validity, independent scoring."
  - "Adler, Lou (2007 / later editions). Hire With Your Head: Using Performance-Based Hiring to Build Great Teams. Wiley. Performance profiles = outcomes not duties, throughout."
  - "Schmidt, F. L. & Hunter, J. E. (1998). The validity and utility of selection methods in personnel psychology: Practical and theoretical implications of 85 years of research findings. Psychological Bulletin, 124(2), 262-274. [Cited by Bock ch.4.]"
fulfills_catalog_entry: vyon-hiring-kit
genericization_notes:
  - "`vyon-` prefix stripped per §0.4a."
  - "'VP-Product-first hiring sequence' replaced with 'critical-role-first sequencing' per §0.4b."
assigned_agent: hire (People & Culture / Lead)
portable: true
date_added: 2026-07-29
tier: 3
description: The hiring workflow wrapper for hire. Owns everything except interview-question generation (delegated to interview-prep). Produces the role scorecard before posting, runs the 7-phase loop (scorecard → post → source → screen → interview → debrief → refs & offer), enforces independent-scoring-before-debrief, and gates the hire decision on a threshold rule. Trigger on "hire for", "open a role", "job description", "scorecard for", "hiring loop", "reference check", or "should we make an offer".
triggers:
  - hire for
  - open a role
  - job description
  - scorecard for
  - hiring loop
  - reference check for
  - should we make an offer to
---

# Hiring Kit

## Introduction

This skill packages the *wrapper* around hiring — every phase except the interview-question generation step, which the `interview-prep` marketplace skill owns. It is synthesized from three converging published sources: Smart & Street's *Who: The A Method for Hiring* (2008) for scorecard structure (Mission + Outcomes + Competencies), Bock's *Work Rules!* (2015) for Google's structured-interview research (independent scoring; predictive-validity numbers), and Adler's *Hire With Your Head* for performance-based framing (outcomes not duties). No formulas are invented here; the two numeric anchors used — 0.51 predictive validity for structured interviews, 0.14–0.20 for unstructured — trace directly to Schmidt & Hunter (1998) as cited by Bock ch.4 (Tier B per §8.4 until a hiring-analytics book grounds a script in `Shared OS/logical/`).

## Purpose

Prevents the two failure modes that produce bad hires most often, and does so by owning the parts of the loop that sit around interviewing rather than inside it:

1. **No scorecard before posting.** The role is defined by duties instead of outcomes; interviewers end up optimizing for likeability; any reasonably-fluent candidate "fits" against a vague standard.
2. **Unstructured loop.** Different candidates get different questions; interviewers debrief-before-scoring and cascade around the first strong opinion in the room.

This skill enforces: (a) scorecard-before-posting, (b) same-questions-per-candidate, (c) independent-scoring-before-debrief, (d) reference-check-on-top-two-not-the-single-finalist, and (e) a written threshold rule for the hire decision that the operator can override in config but cannot skip silently.

## When to Use

Trigger phrases:

- "hire for [role]" / "open a role" / "we need to hire a [role]"
- "job description for" / "write a JD"
- "scorecard for [role]" / "role scorecard"
- "hiring loop for" / "interview loop for"
- "reference check for [candidate]"
- "should we make an offer to [candidate]"

Do NOT use for:

- Interview question generation, question bank, or scoring rubric → `interview-prep` (marketplace, this agent).
- Which of several open reqs to fill first, or span-of-control checks on the receiving team → `workforce-planning` (custom, this agent).
- ATS platform choice, pipeline stage design, or take-home-test compensation policy → `ats-selection` (custom, this agent).
- Worker classification (W-2 vs 1099 vs EOR vs PEO) or payroll platform onboarding once the offer is accepted → `payroll-and-eor` (custom, this agent).
- Compensation banding, market data, or offer-letter number itself → future `comp-benchmarking` skill (not yet built; block and route to operator until it exists).

## Structure / Protocol

The 7-phase hiring loop this skill owns end-to-end:

```
1. Scorecard        Mission + 5-7 Outcomes + 5-8 Competencies + Comp band + Bottleneck justification.
                    BEFORE posting. Requester sign-off required.
2. Post             JD drafted FROM the scorecard, not the other way around.
                    Verification-before-completion gate: every JD sentence must trace to a scorecard line.
3. Source           Screen against scorecard competencies, not resume keywords.
                    D&I funnel tracking via ats-selection.
4. Screen           30-min structured phone screen. Same 5-7 questions per candidate.
                    Score 1-4 at end of call; >=3.0 advances.
5. Interview loop   Hand scorecard to interview-prep; it generates competency-mapped questions + panel.
                    3-5 interviewers, each owning 2-3 competencies. Include a work-sample task where role permits.
6. Debrief          EVERY interviewer submits scorecard independently BEFORE the group discussion.
                    Compute per-competency average; apply hire-decision rule (Principles 6).
7. Refs & Offer     Structured reference check on TOP-2 finalists (not the single offer-stage candidate).
                    Scorecard = reference-check script. Minimum 2 refs per finalist; >=1 former direct manager.
                    Offer only if threshold match holds AND reference signal is consistent.
                    Post-accept → route to payroll-and-eor for classification + onboarding.
```

## Instructions

### Phase 1 — Scorecard (before anything is posted)

Ask the requester (hiring manager, founder, or department leader) for these five inputs. Do NOT invent them per §0.5.

1. **Mission** — one sentence describing why this seat exists. Not a job title; a purpose.
2. **Outcomes** — 5–7 measurable results the person must deliver in their first 12 months. Each starts with an action verb, contains a number or a dated milestone, and describes a *result* rather than an activity.
   - Bad (activity): "Manage the sales pipeline."
   - Good (outcome): "Grow qualified pipeline from $2M to $8M by month 12."
3. **Competencies** — 5–8 role-critical capabilities (technical + behavioral). Each has: a one-sentence definition, and a 4-level BARS anchor set (level 4 = consistently exceeds; level 3 = meets; level 2 = partially meets; level 1 = does not meet). BARS anchors describe observable behavior, not adjectives.
4. **Comp band** — required. If missing, block advancement and route the requester to `workforce-planning` (headcount plan validation) and to `comp-benchmarking` (market band, when that skill exists). Do NOT post without a band; unbanded posts distort candidate expectations and produce late-stage negotiation failures.
5. **Bottleneck justification** — one line: what is this role's absence bottlenecking *right now*? Used in phase 2 as the "why now" paragraph of the JD, and to defend the req in headcount review. Genericized from catalog's "VP-Product-first" (§0.4b): the requester names the bottleneck; the skill does not guess.

Scorecard is written to a structured template (see Output Format). Requester sign-off + hire lead sign-off are required before phase 2 opens.

### Phase 2 — Post

- Draft the JD *from the scorecard*: Mission → What You'll Own (outcomes verbatim) → What You Bring (competency definitions) → Comp band (state the range publicly where org policy or law requires; several jurisdictions now do).
- Do NOT write a duties list. Duties are the *artifact* of outcomes, not the definition of them (Adler, throughout).
- Pipe the draft JD through `Shared OS/skills/verification-before-completion`: every sentence must trace back to a scorecard line. If a sentence has no scorecard anchor, either strip it or amend the scorecard first.

### Phase 3 — Source

- Screen inbound candidates against scorecard competencies, not resume keywords or brand-name credentials.
- Track voluntary self-ID demographics via the D&I funnel reporting rules in `ats-selection`. Aggregate reporting only; individual-level demographic data never enters the interview loop.

### Phase 4 — Structured phone screen

- 30 minutes. Same 5–7 questions per candidate. Standardize the intro (60 seconds) and close (60 seconds).
- Score against the scorecard 1–4 scale at the end of the call, before any next-step decision is written down.
- ≥3.0 advances to phase 5. <3.0 rejects, with SBI-structured feedback delivered via `feedback-methods` (marketplace, under merit).

### Phase 5 — Interview loop

- Hand the scorecard to `interview-prep`; it generates the competency-mapped question bank, panel assignment (who interviews for what), and 1–4 rubric.
- 3–5 interviewers per candidate; each interviewer owns 2–3 competencies. Overlap is fine on 1 competency for cross-check; full overlap defeats the panel-diversity property.
- Include one **work-sample task** where the role permits it (Google research: work samples have among the highest predictive validity of any selection method, per Schmidt & Hunter 1998 as cited by Bock ch.4).
- Any work sample expected to take **more than 2 hours must be paid**, per the take-home-test ethics rule inherited from `ats-selection`. Unpaid extended assessments produce measurable candidate drop-off (roughly 59% of candidates skip postings with lengthy unpaid take-homes per public ATS-vendor data) and carry equity risk.

### Phase 6 — Debrief (structured, gated)

- **Every interviewer submits their scorecard independently BEFORE the group debrief starts.** This is a hard gate, not a suggestion — see Principles 4. Loud-voice-first debriefs discard the independent-scoring bias-reduction property that structured hiring depends on (Bock ch.4).
- Compute a per-competency average across interviewers.
- Apply the **hire-decision rule** (Principles 6, operator-overridable in `operational/agent/hire-config.md`):
  - Average across all required competencies **≥ 3.0**, AND
  - No single required competency scores **< 2**.
- Both met → advance to phase 7. Either failed → reject, with SBI-structured feedback via `feedback-methods`. Silently overriding either condition is a §0.5 violation; if an operator wants to override, they must record the written reason in the offer memo.

### Phase 7 — References and offer

- Structured reference check on the **top-2 finalists**, not the single offer-stage candidate. Reference calls made after a verbal offer collect confirmation, not information (Smart & Street ch.7, the TORC pattern — Threat of Reference Check).
- The scorecard itself is the reference-check script: for each outcome, ask "Have they delivered this kind of result before? Under what conditions? What would you do differently if they worked for you again?"
- Minimum 2 references per finalist; **at least 1 must be a former direct manager**. Peer-only reference sets consistently miss performance patterns.
- Make an offer only if (a) the phase-6 threshold match holds AND (b) reference signal is consistent with the scorecard read. Contradictory reference signal (e.g., strong on outcome X in interviews, refs say the opposite) is a hard block on the offer until reconciled.
- On acceptance, route to `payroll-and-eor` for worker classification (W-2 vs 1099 vs EOR vs PEO) and payroll-platform onboarding.

## Output Format

Each invocation produces one or more of these artifacts, depending on which phase was triggered:

- **Scorecard** — Markdown template (or `.docx` via the docx skill on request):
  - Header: role title, requester name, hire-lead name, date
  - Mission (1 sentence)
  - Outcomes (5–7, numbered, each with metric or milestone)
  - Competencies (5–8, each with definition + 4-level BARS anchors)
  - Comp band (min, mid, max) + band source (market-data or internal)
  - Bottleneck justification (1 line)
  - Sign-off block (requester + hire lead)
- **Hiring-loop timeline** — table of phases 1–7 with target dates and owners.
- **Debrief matrix** — candidate × competency table:
  - Rows: competencies (verbatim from scorecard)
  - Columns: interviewers + Average + Decision
  - Footer: threshold check (avg ≥ 3.0 pass/fail; no-competency-below-2 pass/fail); overall decision.
- **Reference-check script** — outcome-mapped questions + reference-response log per reference call.
- **Offer memo** — scorecard-match summary + reference summary + threshold check + comp offer + start date + any operator-noted overrides with written reason.

## Principles

1. **Scorecard before posting, always.** No req proceeds to phase 2 without an approved scorecard. (Smart & Street ch.2; Adler ch.3.)
2. **Outcomes, not duties.** Every scorecard line describes a result. Every JD line traces to a scorecard line. Duties are downstream artifacts. (Adler, throughout.)
3. **Same questions per candidate.** Structured interviews have ~0.51 predictive validity for job performance; unstructured have 0.14–0.20 (Schmidt & Hunter 1998, cited by Bock ch.4). Deviation from the standard set requires a written reason.
4. **Independent scoring before debrief.** Every interviewer's scorecard is submitted before the group discussion opens. No exceptions; this is what makes structured hiring structured. (Bock ch.4.)
5. **Reference-check the top-2, not the single finalist.** Post-verbal-offer reference calls collect confirmation, not information. (Smart & Street ch.7 — TORC.)
6. **No hire without a threshold match.** Default: avg ≥ 3.0 across all required competencies AND no single required competency < 2. Operator may override in `operational/agent/hire-config.md`; overrides must be written into the offer memo per §0.5.
7. **Paid work samples over 2 hours.** Unpaid extended assessments carry candidate-experience and equity risk. Inherited from `ats-selection` guidance; enforced here at phase 5.
8. **§0.6 flag persists.** The predictive-validity numbers cited (0.51 / 0.14–0.20) are Tier-B per §8.4 (canonical published finding, not formula-derived here). Removed when a hiring-analytics book is placed in `Agents/_books/` and a `Shared OS/logical/hiring_selection.py` script is built; until then, decisions cite these as book-cited reasoning, not computed values.

## Fallback

- **Missing outcomes at phase 1.** Ask the requester before drafting the scorecard. Do NOT infer outcomes from the JD, resume, or prior version of the role. Log the ask; freeze the req until answered.
- **Missing comp band at phase 1.** Block advancement. Route the requester to `workforce-planning` (headcount validation) and to `comp-benchmarking` (market band, once that skill exists). Do NOT post without a band.
- **Only one interviewer available at phase 5.** Escalate — a single-interviewer loop with a debrief-of-one is not structured hiring. Route to hire lead + requester as a process failure; either add a second interviewer or reschedule.
- **Fewer than 2 references available at phase 7.** Note explicitly in the offer memo; do not silently proceed. Route to hire lead for exception decision, with written reason.
- **Requester tries to override the phase-6 threshold without a written reason.** Refuse per §0.5; route to the operator. Silent threshold drops are not a valid override path.
- **Contradictory reference signal at phase 7.** Do not proceed to offer. Reconcile with the requester (was the interview read wrong, or is the reference off?) before either advancing or rejecting. If it cannot be reconciled with evidence, default to reject and record the reason.
- **Sensitive candidate demographics surfacing in the interview loop.** Halt the loop, route to hire lead. Aggregate-level D&I data is expected in reporting; individual demographic detail should never influence a per-candidate decision.

## Boundaries with Other Skills

| Hands off to | For | Direction |
|---|---|---|
| `interview-prep` (marketplace, hire) | Interview kit generation (Qs, rubric, panel assignment, debrief template) from a scorecard | Phase 5 — hiring-kit provides scorecard as input |
| `workforce-planning` (custom, hire) | Whether the req itself should exist right now; span-of-control validation on the receiving team | Pre-phase-1 check when multiple reqs compete for budget |
| `ats-selection` (custom, hire) | Which ATS platform to run the pipeline in; pipeline stage design; D&I funnel reporting; take-home-test compensation policy | Phase 3 (source) and Phase 5 (work-sample decision) |
| `payroll-and-eor` (custom, hire) | Worker classification (W-2 / 1099 / EOR / PEO) and payroll platform onboarding | Phase 7 post-acceptance |
| `feedback-methods` (marketplace, merit) | SBI-structured feedback delivery to unsuccessful candidates | Phase 4 reject and Phase 6 reject |
| `Shared OS: verification-before-completion` | Evidence gate on JD (phase 2), scorecard match (phase 6), reference completeness (phase 7) | Cross-cutting; called at each named phase |
| `Shared OS: people-analytics-metrics` (planned) | Time-to-fill, offer-acceptance rate, first-year attrition reporting | Post-close, reporting layer |
| Future `comp-benchmarking` skill | Market comp band for the comp-band field of the scorecard | Phase 1 pre-check; block until built |
