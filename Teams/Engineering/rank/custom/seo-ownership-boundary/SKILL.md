---
name: seo-ownership-boundary
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; plan §3 explicitly "boundary: kai owns SEO strategy+measurement, rank owns technical execution C" and §6 "kai ↔ rank: clean handoff, no double-ownership"
marketplace_search: 2026-07-09 — no marketplace skill defines a cross-department ownership boundary; kept custom (it's a coordination contract specific to this org)
assigned_agent: rank (Engineering / Technical SEO)
portable: true — the boundary shape is generic; the specific peers (kai) are this org's
includes: (no asset — coordination skill)
date_added: 2026-07-09
---

## Introduction

seo-ownership-boundary is the contract that keeps rank and kai from stepping on each other: **kai (Brand Studio analytics) owns SEO strategy and measurement; rank (Engineering) owns technical execution.** SEO is the one area that spans a marketing brain and an engineering craft, so a clean line prevents both the gaps (nobody owns it) and the collisions (both change it) the plan explicitly warns against.

## Purpose

Without an explicit boundary, SEO becomes a turf war or a vacuum: kai sets keyword targets rank ignores, or rank makes canonical decisions that undercut kai's strategy, or a Core Web Vitals number gets reported two different ways. The boundary makes ownership unambiguous, so handoffs are clean and neither the strategy nor the execution falls through.

## When to Use

Triggers: any SEO task at the outset (to route it), "who owns this," "is this rank or kai," a Core Web Vitals question (shared signal), and any moment strategy and execution blur.

## Structure / Protocol

```
An SEO task arrives
  -> STRATEGY / MEASUREMENT (kai): keyword targets · content strategy · what to rank for ·
     traffic/ranking measurement · ROI · reporting to the business · the scorecard §6
  -> TECHNICAL EXECUTION (rank): crawlability · indexability · canonicals · sitemaps · schema ·
     GEO markup · rendering · technical Core Web Vitals fixes · the claude-seo plugin
  -> SHARED SIGNALS (explicit handoff): Core Web Vitals (mia makes good, rank frames as SEO,
     kai measures as outcome) · GEO (rank markup, kai+lena content/strategy)
    -> Route to the owner; cross-boundary tasks get a brief, not a takeover
```

## Instructions

1. **kai owns strategy and measurement.** What keywords to target, what content should exist, what "success" means, and the reporting of rankings/traffic/ROI to the business — kai's, per its scorecard (§6). rank does not set SEO strategy or own the business-facing SEO numbers.
2. **rank owns technical execution.** Making the site crawlable, indexable, fast, and machine-understandable; running the claude-seo plugin's technical commands; specifying schema and GEO markup. kai does not make canonical/robots/rendering decisions.
3. **Shared signals get explicit handoffs.** Core Web Vitals span three agents: mia makes them good (frontend), rank frames them as an SEO requirement and diagnoses technically, kai measures them as a business outcome. GEO spans rank (markup) and kai+lena (content/strategy). Name the split each time; don't let a shared signal become a double-owned or unowned mess.
4. **Cross-boundary tasks get a brief, not a takeover.** When a task lands on the wrong side, hand it over with a clear brief (rank → kai: "here's the technical state, strategy is yours"; kai → rank: "here's the target, execution is yours") — never absorb the other's ownership to "just handle it."
5. **Escalate genuine overlaps.** Where ownership is genuinely ambiguous (a decision that's both strategic and technical), surface it to both agents and, if needed, dev/marcus — don't let rank and kai each assume the other has it (the vacuum) or both act (the collision).
6. **The boundary is bidirectional.** This skill protects kai's ownership as much as rank's — rank citing this to decline strategy work is the same discipline as rank claiming technical execution. Clean boundaries cut both ways.

## Output Format

```
## SEO Ownership: [task]
Owner: [kai — strategy/measurement / rank — technical execution / SHARED]
If shared: [mia (build) · rank (SEO frame + technical) · kai (measure)] — split named
Handoff: [brief to the owner, not a takeover]
Escalation: [none / ambiguous → both + dev/marcus]
```

## Principles

- **kai owns strategy + measurement; rank owns technical execution** — the plan's explicit line.
- **Shared signals get an explicit split** — Core Web Vitals and GEO are named, not assumed.
- **Hand off with a brief, never a takeover** — don't absorb the other's ownership.
- **Escalate genuine overlaps** — avoid both the vacuum and the collision.
- **The boundary is bidirectional** — it protects kai's turf as much as rank's.

## Fallback

- kai not built yet (Brand Studio complete, but confirm) → rank flags that strategy/measurement is kai's when kai exists; interim, rank does technical execution and explicitly marks strategy questions as kai-pending, not rank-owned.
- Task genuinely can't be cleanly split → escalate to both + dev/marcus rather than one side grabbing it.
- Business asks rank for SEO strategy directly → redirect to kai with a technical brief; rank doesn't set strategy even when asked.

## Boundaries with Other Skills

- **kai (Brand Studio)**: the counterpart owner — this skill IS the rank-side of that relationship; kai's scorecard §6 is the strategy/measurement home.
- **claude-seo-integration / technical-seo-execution / structured-data-geo** (siblings): all gated by this boundary at task intake.
- **mia**: the third party in the Core Web Vitals split (build).
- **lena (Brand Studio)**: the content substance behind GEO citability.
- **dev/marcus**: escalation for genuinely ambiguous ownership.
