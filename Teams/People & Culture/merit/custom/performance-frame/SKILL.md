<!--
Custom skill — built from catalog's `vyon-performance-frame` entry, genericized per §0.4b,
sourced from named published works on OKRs (Doerr, Grove).

Catalog source: vyon-performance-frame — "Individual OKR alignment + review cadence;
comp benchmarking for future hires." Protocol: (1) Individual OKRs cascade from vista's
company set; (2) Quarterly written review — evidence-based; (3) Comp bands from market
data before each hire.

Genericization strip (§0.4b):
- vyon- prefix stripped per §0.4a → performance-frame
- "vista's company set" → vista (Executive Office / Roadmap Lead) — KEPT as vista is a
  real YVON agent per CLAUDE.md §2 routing table
- "comp benchmarking for future hires" — comp benchmarking is scope-mixed with this skill;
  ROUTED to hire's `payroll-and-eor` for classification/onboarding comp and to future
  `comp-benchmarking` skill for market-band data. This skill covers the OKR + review
  cascade only; comp is downstream.

Route classification per §8.2: Route D (cited rubric — OKR framework + review discipline;
no formula, no script). Judgment flagged per §0.6 until page-cited from Agents/_books/.
-->
---
name: performance-frame
type: custom
status: built from catalog `vyon-performance-frame`, genericized per §0.4b, sourced from named published works
sources_referenced:
  - "Catalog entry: vyon-performance-frame (VYON_Skills_Catalog_Full_v2.html) — protocol structure. Provenance only; content genericized."
  - "Doerr, John (2018). Measure What Matters: How Google, Bono, and the Gates Foundation Rock the World with OKRs. Portfolio. ISBN 978-0525536222. Practitioner-operator per §8.9 — KPCB partner, brought OKRs to Google via Andy Grove."
  - "Grove, Andrew S. (1983, updated 1995). High Output Management. Vintage. ISBN 978-0679762881. Practitioner-operator per §8.9 — Intel CEO; original OKR practice."
  - "Bock, Laszlo (2015). Work Rules! ch.6 — Google's OKR practice at scale. Already cited in hire's hiring-kit; extract-once-use-twice per §8.9."
  - "re:Work (rework.withgoogle.com) — Google's public OKR guide (institutional source, FREE)."
fulfills_catalog_entry: vyon-performance-frame
genericization_notes:
  - "vyon- prefix stripped per §0.4a."
  - "vista (Executive Office / Roadmap Lead) KEPT — real YVON agent."
  - "Comp benchmarking routed OUT to hire's payroll-and-eor + future comp-benchmarking; catalog conflated two scopes."
assigned_agent: merit (People & Culture / Performance Management)
portable: true
date_added: 2026-07-31
tier: 3
description: The individual OKR cascade + quarterly written evidence-based review framework. Individual OKRs cascade from vista's company-level set; each individual objective traces to a specific company objective. Quarterly reviews are written and evidence-based, delivered using SBI + Radical Candor from feedback-methods. Comp discussions route to hire's payroll-and-eor or future comp-benchmarking. Trigger on "performance review for", "individual OKR", "OKR cascade", "quarterly review", "how do I evaluate this person", or "write a performance review".
triggers:
  - performance review for
  - individual OKR
  - OKR cascade
  - quarterly review
  - how do I evaluate this person
  - write a performance review
  - performance cycle
  - review cadence
---

# Performance Frame

## Introduction

This skill packages the individual OKR (Objectives and Key Results) cascade + the quarterly
written evidence-based review discipline into merit's operational entry point for the
performance-cycle. Individual OKRs cascade from vista's (Executive Office / Roadmap Lead)
company-level OKRs; every individual objective traces to a specific company objective.
Reviews are written, evidence-based, and delivered using the SBI + Radical Candor
frameworks from the sibling `feedback-methods` skill.

Built from the catalog's `vyon-performance-frame` entry, genericized per §0.4b, and
sourced from named published works on OKRs (Doerr 2018 *Measure What Matters* + Grove
1983 *High Output Management* + Bock 2015 *Work Rules!* ch.6 for Google's application).

**Scope constraint:** this skill covers the OKR + review cascade only. Comp band data,
compensation-change decisions, and comp negotiation route to hire's `payroll-and-eor`
(post-classification) or to a future `comp-benchmarking` skill (market-band data). The
catalog's `vyon-performance-frame` conflated OKR reviews with "comp benchmarking for
future hires" — these are distinct scopes and get routed separately per §0.4b.

## Purpose

Prevents three failure modes that show up most often in workplace performance cycles:

1. **Orphaned individual OKRs.** OKRs set at the individual level without traceability
   back to company objectives produce activity that doesn't add up to progress. If the
   individual OKR can't name the specific company OKR it serves, either the individual
   OKR is misaligned or the company OKR itself is missing — either is a §Fallback case.
2. **Impression-based reviews.** Reviews written from "she seemed engaged" or "he isn't
   really a team player" produce feedback that isn't actionable and often reflects the
   reviewer's biases rather than evidence. Written evidence-based reviews force
   traceability: which OKR? which observed behavior? which measurable outcome?
3. **Comp discussions during the review conversation.** Mixing performance evaluation
   with compensation decisions in the same conversation distorts both. Performance
   discussions happen in the review; comp discussions are a separate structured process
   (routed to `payroll-and-eor` or future `comp-benchmarking`) with different data
   inputs and different escalation paths.

merit uses this skill as the framework whenever a performance-cycle event happens — OKR
setting at the start of a quarter, mid-cycle check, end-of-quarter written review, or
year-end synthesis across quarters.

## When to Use

Trigger on:

- "Performance review for [person / cohort / cycle]" / "write a performance review"
- "Individual OKR" / "OKR cascade" / "set OKRs for [team / role]"
- "Quarterly review" / "review cadence" / "when do we do reviews"
- "How do I evaluate this person" / "what's the review format"
- "Mid-cycle check for [person]" / "year-end synthesis"
- Handoff from `feedback-methods` when a specific review conversation needs delivery
  discipline (SBI + Radical Candor)
- Handoff from `succession-planning` when a 9-box placement needs performance-data input

Do NOT use for:

- **Compensation decisions** → `payroll-and-eor` (custom, hire) OR future `comp-benchmarking`.
  This skill's outputs INFORM comp decisions (via evidence-based review content) but do
  not MAKE them.
- **Team-level engagement / motivation** → `motivation-map` and `wellbeing-monitoring`
  (both custom, maslow — sibling agents). Individual performance is merit's scope; team
  motivation dynamics are maslow's.
- **Succession placement / 9-box grid** → `succession-planning` (custom, merit — sibling).
  This skill provides performance-data INPUT to succession-planning; succession-planning
  places on 9-box.
- **Individual training or upskilling** → grove's `skill-gap-map` + `training-program-design`.
  Performance review may surface a competence gap; grove owns the closer.
- **Individual mental-health signals** → HARD BOUNDARY to manager + HR Ops + EAP per
  Universal Principle 3 inherited from hire.
- **Formal PIP (Performance Improvement Plan) formalization** → operator + employment
  counsel. This skill supports the manager conversation; PIP formalization is
  legal-adjacent.

## Structure / Protocol

The performance-frame cycle:

```
1. OKR CASCADE (start of quarter / cycle)
    vista publishes company-level OKRs → each team/venture derives team OKRs →
    each individual derives 3-5 personal OKRs traceable to a specific company OKR.

    Rule: NO orphan individual OKRs. Every individual O must trace to a company O.

2. MID-CYCLE CHECK (~mid-quarter)
    Written 15-min status update per individual: progress vs each Key Result.
    Signal-only — GREEN/AMBER/RED per KR. Full analysis waits for end-of-cycle.
    Triggers earlier intervention if any KR is RED at mid-cycle.

3. END-OF-CYCLE WRITTEN REVIEW (end of quarter)
    Written evidence-based review. Per each of the person's OKRs:
    - Was the O achieved? (Y / partial / no)
    - Evidence: specific outcomes, artifacts, or measurable results.
    - What worked / what would you do differently? (SBI-format observations)
    - Learnings + growth areas going into next cycle.

    Delivered using SBI + Radical Candor from feedback-methods.

4. YEAR-END SYNTHESIS (across 4 quarters)
    Aggregate the 4 quarterly reviews into a year-view. Pattern flags:
    - Consistent Y across quarters → surface for succession-planning 9-box.
    - Persistent partial or N → surface for skills-gap-map (grove) or,
      if pattern indicates fit mismatch, workforce-planning (hire).

5. COMP HAND-OFF (separate conversation, separate cadence)
    Performance-review CONTENT feeds comp discussion; the comp discussion
    itself happens SEPARATELY, on a different cadence, with `payroll-and-eor`
    or future `comp-benchmarking` owning the market-band data.
    Do NOT mix.
```

## Instructions

### Phase 1 — OKR cascade (start of cycle)

**Confirm vista has published company-level OKRs for the cycle.** If vista's OKRs are not
yet published, do NOT proceed to individual OKR setting per Fallback rule 1 — orphan
individual OKRs are §0.5 violation dressed up as productivity.

For each individual whose OKRs you're setting:

1. **Identify 3–5 personal Objectives** for the cycle. Fewer is better; more than 5
   means the person has too many priorities to actually accomplish any.
2. **Each Objective traces to a specific company Objective.** Write it explicitly:
   "Personal O1: [X] → serves company O2: [Y]." An individual O that doesn't trace back
   is an orphan; either revise the individual O or flag the missing company O to vista.
3. **Each Objective has 2–4 Key Results.** KRs are measurable — "grow [metric] from X to
   Y by [date]" beats "improve [thing]." Doerr's discipline: if a KR isn't measurable,
   it's an activity, not a Key Result.
4. **Ambition calibration** (Doerr 2018 ch.5): aim for ~70% achievability. 100%
   achievability = KRs too easy; below 40% = KRs too hard, demotivating. The 70% target
   is a heuristic per §0.6 flag — not universal, but a useful starting norm.

### Phase 2 — Mid-cycle check

Written, 15-minute update per individual. Format:

- Per each Key Result: **status** (GREEN / AMBER / RED) + one-line rationale.
- Any KR going RED at mid-cycle triggers a mid-cycle conversation using
  `feedback-methods` for delivery — figure out whether the RED signal is a scope problem,
  a capability problem (route to grove's `skill-gap-map` if so), or a resource/environment
  problem (route to hire's `workforce-planning` if structural).
- Signal-only. No full analysis at mid-cycle — that waits for end-of-cycle.

### Phase 3 — End-of-cycle written review

**Written, evidence-based, per-OKR structure.** Per each of the person's OKRs:

- **Was the Objective achieved?** Y / partial / N. Be specific — "partial" means what
  specifically was achieved and what wasn't.
- **Evidence** — specific outcomes, artifacts, or measurable results. "Grew qualified
  pipeline from $2M to $6M (target was $8M — 75% of target)" beats "made progress on
  pipeline."
- **What worked / what would you do differently?** SBI-format observations of specific
  behavior. Uses `feedback-methods` for the SBI + Radical Candor discipline; not a
  generic reflection.
- **Learnings + growth areas going into next cycle** — this feeds Phase 1 of the next
  cycle's OKR setting and feeds `succession-planning` if the pattern suggests a specific
  development need.

Written reviews are drafted by the manager, shared with the person in advance of the
review conversation, and delivered in a scheduled 30–60 minute conversation using
`feedback-methods` for the delivery. The written version is the artifact of record; the
conversation applies the SBI + Radical Candor delivery to it.

### Phase 4 — Year-end synthesis

Aggregate the 4 quarterly written reviews into a year-view. Pattern flags:

- **Consistent Y across quarters** on high-criticality OKRs → the person is a candidate
  for the "High Performance" band on `succession-planning`'s 9-box grid. Route the
  performance-data input to succession-planning.
- **Persistent partial** across quarters → surface as a specific gap for grove's
  `skill-gap-map`. Two-quarter partial usually means a competence gap, not a fit problem;
  three-plus quarter partial is a fit-vs-role question.
- **Persistent N** across quarters → serious fit-vs-role or fit-vs-context question.
  Route to hire's `workforce-planning` for the structural-vs-personnel diagnosis, and
  concurrently to operator + employment counsel if the pattern suggests a PIP-adjacent
  path.
- **High variance** (Y in some quarters, N in others) → check for external context
  variance (team change, scope change, tools change) before assuming individual variance.

### Phase 5 — Comp hand-off (separate)

Written-review content is EVIDENCE, not a comp decision. When the review outputs feed a
comp change, route the comp discussion to:

- **`payroll-and-eor`** (custom, hire) for classification-adjacent comp changes (role
  reclassification, EOR-vs-employee transitions).
- **Future `comp-benchmarking`** for market-band data and comp-band-adjustment decisions.
- **`board`** (via `fiduciary-guard`) for any comp change that crosses spend-approval
  thresholds.

**Never mix comp discussion into the review conversation itself.** The review evaluates
performance; the comp discussion decides pay. Different data, different escalation paths,
different conversation frames.

## Output Format

Each invocation produces one or more of:

- **Individual OKR draft** — 3–5 Objectives with 2–4 Key Results each, per-Objective
  traceability back to a company OKR, ~70% achievability calibration note.
- **Mid-cycle check status** — per-KR GREEN / AMBER / RED with one-line rationale;
  mid-cycle intervention recommendation for any RED.
- **End-of-cycle written review** — per-OKR Y/partial/N + evidence + SBI-observation
  section + growth-area section. Draft that the manager reviews before conversation.
- **Year-end synthesis** — pattern flags across 4 quarters with routing recommendations
  (succession-planning / skill-gap-map / workforce-planning / operator + counsel).
- **Comp hand-off memo** — evidence extract from performance review, routed to the
  appropriate downstream owner (payroll-and-eor / future comp-benchmarking / board).

## Principles

1. **No orphan individual OKRs.** Every individual Objective traces to a specific company
   Objective. If it doesn't, either fix the individual O or flag the missing company O
   to vista — never proceed with an orphan. (Doerr 2018 throughout; Grove 1995 ch.6.)
2. **Reviews are written and evidence-based.** Impression-based reviews get pushed back
   to written-with-evidence per Fallback rule 3. "She seemed engaged" is not evidence;
   "In Q2 she owned the customer-onboarding redesign that reduced time-to-first-value
   from 12d to 5d" is evidence.
3. **Reviews are drafted in advance and delivered live.** The written version is the
   artifact of record; the conversation applies SBI + Radical Candor delivery via
   `feedback-methods`. Do NOT surprise-deliver a written review — share it 24-48 hours
   in advance.
4. **Comp discussions are SEPARATE from review discussions.** Mixing distorts both.
   Different cadence, different data, different owner.
5. **Ambition calibration is ~70% achievability heuristic.** Not a hard rule; use
   context. Consistent 100% achievement across cycles suggests KRs are set too easy;
   consistent <40% suggests too hard or the person is being set up to fail. §0.6 flag —
   heuristic per Doerr 2018 ch.5, not book-cited from `Agents/_books/`.
6. **Mid-cycle RED triggers a mid-cycle conversation, not a mid-cycle write-off.**
   Structural or capability causes get routed to the right owner (grove for capability;
   hire's `workforce-planning` for structural) at mid-cycle, not deferred to end-of-cycle.
7. **Individual mental-health signals during any phase escalate immediately.** Universal
   Principle 3 HARD BOUNDARY inherited from hire. Feedback on work performance is
   in-scope; distress signals about the person's wellbeing route to manager + HR Ops +
   EAP without delay.
8. **§0.6 flag.** OKR framework itself is well-established (Doerr 2018 + Grove 1995 both
   canonical); specific applications (3-5 O count, 2-4 KR count, ~70% achievability, 4
   quarterly cycles, 15-min mid-cycle format) are Tier B (framework-cited, not
   book-page-cited from `Agents/_books/`). Downgrade to Tier A when the books are placed
   and a `Shared OS/logical/okr_framework.md` Route-D asset is built per §8.9.

## Fallback

- **vista has not published company OKRs for the cycle.** Do NOT proceed to individual
  OKR setting. Route to vista for company-OKR publication; individual OKR setting waits.
  Per §0.5 — no orphan individual OKRs.
- **Individual OKR proposal is orphan (no company-O trace).** Push back per Principle 1.
  Either revise the individual O or flag the missing company O to vista.
- **Review request is impression-based** (no evidence, no artifacts, no measurable
  outcomes). Push back per Principle 2. Ask for the specific evidence the assessment
  rests on; if none exists, the review isn't ready.
- **Review draft delivery pattern is surprise** (manager wants to hand-deliver in the
  conversation without advance share). Push back per Principle 3. Share 24-48 hours in
  advance so the person has time to prepare their perspective.
- **Comp discussion introduced into the review conversation.** Push back per Principle 4.
  Route the comp conversation to a separately-scheduled discussion with the appropriate
  owner (`payroll-and-eor` or future `comp-benchmarking`).
- **Mid-cycle RED KR that traces to structural cause** (understaffing, missing tools,
  external dependency broken). Route to `workforce-planning` (custom, hire) for the
  structural fix. Do NOT count the RED against the individual until the structural cause
  is addressed.
- **Individual mental-health signal during any phase.** STOP. Route per Universal
  Principle 3 to manager + HR Ops + EAP. No review processing continues.
- **PIP-adjacent pattern (Persistent N across 3+ quarters).** Route to operator +
  employment counsel per Universal Principle 5. This skill supports the manager
  conversation; PIP formalization is legal-adjacent and outside merit's scope.
- **Discriminatory phrasing surfaces during review drafting.** Decline the specific
  phrasing and escalate to operator + employment counsel per `feedback-methods`
  Fallback rule 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `feedback-methods` (custom, merit — sibling) | Delivery discipline for the end-of-cycle review conversation and any mid-cycle RED intervention | Downstream — performance-frame produces the written review content; feedback-methods delivers it via SBI + Radical Candor |
| `succession-planning` (custom, merit — sibling) | Performance-data input for 9-box grid placement (consistent Y pattern signals High Performance band) | Downstream — performance-frame feeds year-end synthesis into succession-planning |
| `hr-strategy-alignment` (custom, merit — sibling) | Employee perspective of the Balanced Scorecard consumes performance-review aggregate signals (never individual-level) | Cross-cutting when aggregate perf trends feed the scorecard |
| `vista` (Executive Office / Roadmap Lead) | Company-level OKRs that individual OKRs cascade FROM | Upstream — no individual OKR setting without vista's company OKRs published |
| `skill-gap-map` (custom, grove) | Persistent-partial review pattern surfaces a specific competence gap that grove owns the closer for | Downstream — persistent-partial routes to grove |
| `training-program-design` (custom, grove) | Development-plan actions from the growth-areas section of a written review | Downstream via skill-gap-map |
| `workforce-planning` (custom, hire) | Structural cause of a RED KR (understaffing, missing tools, external dep broken); persistent-N pattern that suggests fit-vs-role question | Downstream escalation |
| `payroll-and-eor` (custom, hire) | Classification-adjacent comp changes (role reclass, EOR-vs-employee transitions) | Downstream — separate conversation from the review |
| Future `comp-benchmarking` skill | Market-band data for comp-band-adjustment decisions | Downstream — separate conversation |
| `board` (Governance — fiduciary-guard) | Any comp change that crosses spend-approval thresholds | Downstream — escalation |
| `motivation-map` (custom, maslow) | Team-level engagement / motivation dynamics that provide context for individual performance patterns | Cross-cutting — merit's individual perf ≠ maslow's team motivation, but they inform each other |
| Manager + HR Ops + EAP | Individual mental-health signals during any phase | Escalation only — HARD BOUNDARY per Universal Principle 3 |
| Operator + employment counsel | PIP formalization; discriminatory phrasing concerns; legal-adjacent perf actions | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate on every OKR draft, mid-cycle check, and written review before it ships | Cross-cutting |

## References (public / verifiable)

- [Measure What Matters — John Doerr's book site](https://www.whatmatters.com/)
- [Google re:Work — OKR guide (institutional, FREE)](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)
- [Google re:Work — Goal setting (institutional, FREE)](https://rework.withgoogle.com/en/guides/set-goals-with-okrs#introduction)
- [What Matters — resources on OKRs (Doerr's institution)](https://www.whatmatters.com/resources)
- [Andy Grove — Wikipedia entry with High Output Management overview](https://en.wikipedia.org/wiki/Andrew_Grove)
