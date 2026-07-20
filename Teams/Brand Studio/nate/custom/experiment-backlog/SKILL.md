---
name: experiment-backlog
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 Brand Studio v3 build)
based_on_catalog_entry: vyon-experiment-backlog (VYON_Skills_Catalog_Full_v2.html, nate/Brand Studio) — renamed experiment-backlog, genericized per rule 0.4b; the original's "feed wins to compound" (an unbuilt agent) becomes the results log + graduation protocol
assigned_agent: nate (Brand Studio / Growth)
portable: true — the backlog is per-business; ICE is the method, the queue is the content
includes: assets/experiment-backlog-template.md
date_added: 2026-07-07
---

## Introduction

experiment-backlog is nate's operating system: one prioritized queue of growth experiments per brand, ICE-scored (Impact × Confidence × Ease), run **one-or-few at a time** with pre-registered success metrics, and closed with a results log that never loses a lesson. Wins graduate — to rio as standing campaigns, to pulse's playbooks, to lena's copy patterns, wherever the win lives; losses get their cause recorded so they aren't re-run by amnesia (muse's registry discipline, applied to experiments).

## Purpose

Growth work fails as scattered enthusiasm: ten half-run tests, no pre-registered metrics, wins nobody operationalized, and losses re-attempted quarterly. The backlog makes it a system: everything proposed gets scored, the top item runs properly (the sibling ab-test-analysis skill enforces the stats), and every result compounds.

## When to Use

Triggers: "next experiment," "growth test," "add to the backlog," "what should we test," "what did we learn from [test]."

## Structure / Protocol

```
Intake (ideas from muse, funnel-analysis' recommended experiments, rio/pulse/kai observations,
        the operator) → each becomes a backlog entry: hypothesis + metric + ICE score
  -> Prioritize: ICE descending; capacity honest (1–3 concurrent max; non-overlapping audiences)
    -> Run the top item: PRE-REGISTER metric + MDE + duration (ab-test-analysis' discipline)
       — no peeking, no mid-test goal-moving
      -> Analyze via ab-test-analysis → ship / extend / stop / investigate
        -> LOG: result, lesson, decision — then GRADUATE wins to their owning agent
           and archive losses with cause
```

## Instructions

### Phase 1 — Intake and Score

Every idea enters as a structured entry: **hypothesis** ("we believe [change] will move [metric] because [reasoning]"), the **one primary metric** (+ guardrails), and **ICE 1–10 each** — Impact (if it works, how much does the needle move), Confidence (what evidence says it might — flagged as a judgment rubric per rule 0.6), Ease (effort to run a *valid* test, not a sloppy one). Ideas without a falsifiable hypothesis go back for sharpening, not into the queue.

### Phase 2 — Prioritize Honestly

ICE descending, then two reality checks: **capacity** (running everything at once tests nothing — 1–3 concurrent, non-overlapping audiences/surfaces so results don't contaminate) and **dependency** (a test needing instrumentation kai doesn't have yet gets blocked-status, not silently skipped).

### Phase 3 — Run with Pre-Registration

Before launch, the entry locks: primary metric, minimum detectable effect, sample/duration plan (the sibling skill's math), and the decision rule ("if X, we ship; if Y, we stop"). Mid-test changes are a new experiment, not an edit — the discipline that makes results mean something.

### Phase 4 — Close and Compound

Every completed test gets: the ab-test-analysis verdict, the **lesson in one honest line** (including "our hypothesis was wrong because…"), and the decision. Then the graduation protocol: shipped product/site wins → the owning surface; channel wins → rio (standing campaign); content/hook wins → pulse's register; copy wins → lena. Losses archive with cause; a re-proposal of an archived loss must say what changed.

## Output Format

```
## Backlog: [brand] — [date]

| # | Hypothesis (one line) | Metric | I | C | E | ICE | Status |
|---|---|---|---|---|---|---|---|
[running / queued / blocked / done→ref]

### Running now: [entries + pre-registration refs]
### Recently closed: [verdict + lesson + graduated-to]
```

## Principles

- **No falsifiable hypothesis, no entry.**
- **Pre-register or it didn't count.** Metric, MDE, duration, decision rule — locked before launch; no peeking (sibling skill's law).
- **Few tests, run properly.** Capacity honesty beats activity theater.
- **Every result compounds.** Wins graduate to owners; losses archive with cause; amnesia re-runs are caught at intake.
- **ICE is a rubric** (rule 0.6) — consistent prioritization, not measurement; the test itself is the measurement.
- **Guardrails ride every test** — a primary-metric win that degrades revenue/experience isn't a win (sibling skill's table governs).

## Fallback

- Empty backlog → intake session: funnel-analysis' biggest leak is the standing first candidate.
- No instrumentation for a metric → blocked status + the instrumentation need routed to kai; never run unmeasurable tests.
- Operator wants to skip the queue ("just try this now") → run it, but it still gets an entry, pre-registration, and a logged result — urgency skips the queue, never the discipline.

## Boundaries with Other Skills

- `ab-test-analysis` (sibling) owns the statistics; `funnel-analysis` (sibling) finds where to aim. This skill owns the queue, the discipline, and the compounding.
- **muse** generates candidate ideas; **kai** supplies data/instrumentation and receives results into the scorecard; **rio/pulse/lena** receive graduates; **vista's rice-prioritization** ranks roadmap features (different altitude — features vs experiments); **board** gates any experiment whose spend crosses the envelope.
