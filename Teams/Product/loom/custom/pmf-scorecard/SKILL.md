---
name: pmf-scorecard
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-pmf-scorecard (prefix stripped; Ellis bar + retention-flatness kept as 0.6-flagged rubric)
assigned_agent: loom (Product / PMF & Experimentation)
portable: true
date_added: 2026-07-10
---

# PMF Scorecard

## Introduction
A read on whether the product has product-market fit, triangulated across the Ellis "how disappointed if you couldn't use this" survey and retention-curve flatness — with an honest verdict routed to spec and marcus. Not a single magic number; a flagged, triangulated judgment.

## Purpose
"Do we have PMF?" gets answered by vibes or a single vanity metric. This scorecard makes it a repeatable, evidence-based read with explicit thresholds (flagged as rubric, not law) — so the PMF call is defensible and its trend is trackable.

## When to Use
- A product needs its PMF assessed or re-assessed (cadence, or a major change).
- marcus/spec ask "is this working — do we double down or pivot?"
- Retention or the Ellis signal shifts materially (a re-read trigger).

## Structure / Protocol
ELLIS SURVEY (the "how would you feel if you could no longer use this" question to activated users; the `<FILL_IN: 40% "very disappointed" bar — reasoning-based until the PMF/statistics source>` is a signal, not a verdict) → RETENTION CURVE (does the retention curve FLATTEN — a cohort that stops churning — or decay to zero? flatness is the strongest PMF signal; flatness judgment flagged 0.6) → TRIANGULATE (Ellis + retention + qualitative why from ux + growth efficiency; no single metric decides) → SEGMENT (PMF is often in a segment before the whole — read per persona, per product profile; a strong niche fit beats weak broad appeal) → VERDICT (strong / emerging / absent, with confidence and the evidence, routed to spec + marcus) → REGISTRY (the read is recorded over time; PMF is a trend, not a snapshot).

## Instructions
1. Triangulate, never single-metric — Ellis alone is gameable, retention alone lacks the why; the verdict is the convergence of survey + retention + qualitative + efficiency.
2. Retention flatness is the anchor — a flattening curve (users who stick) is the hardest PMF signal to fake; a curve decaying to zero is absent PMF whatever the survey says.
3. Thresholds are flagged rubric: the 40% Ellis bar and "flat enough" are conventions, carried with the rule-0.6 flag until the PMF/stats source lands — a verdict states its thresholds and their flag.
4. Segment before verdict: nascent PMF lives in a beachhead segment; a per-segment read finds it where an aggregate read hides it (kills the "no PMF" false-negative on a real niche).
5. Verdict routes up, doesn't decide: strong→double-down, emerging→invest-to-strengthen, absent→pivot-or-persevere are marcus's/spec's calls; loom supplies the read and its confidence.

## Output Format
PMF scorecard: Ellis result (+ flag) · retention-curve read (flatness, + flag) · qualitative why (ux) · efficiency signal · per-segment breakdown · verdict (strong/emerging/absent + confidence) → spec/marcus → registry.

## Principles
- Triangulate — no single metric is PMF; retention flatness anchors.
- Thresholds are flagged rubric, stated with the verdict.
- Segment first; PMF hides in the beachhead.
- Read routes up; the double-down/pivot call is the leader's.

## Fallback
Too early / too little data for a real read? "Pre-PMF, insufficient signal — here's what to watch" is the honest verdict, never a manufactured PMF claim to look further along (gauge's honest-missing, PMF edition).

## Boundaries with Other Skills
- metric supplies retention definitions + curves (versioned); ux supplies the qualitative why; experiment-registry records the trend.
- marcus (Executive Office) owns the double-down/pivot decision; vista owns the roadmap that follows; loom supplies the evidence, not the verdict.
- price: monetization is part of viability — a product people love but won't pay for is a PMF-adjacent read shared with price.
