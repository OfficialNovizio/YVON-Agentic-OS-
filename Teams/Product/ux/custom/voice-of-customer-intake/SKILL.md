---
name: voice-of-customer-intake
type: custom
status: built from scratch
fulfills_catalog_entry: none — new; the standing qualitative pipeline (redesign §3), Client Success boundary stated
assigned_agent: ux (Product / UX Research)
portable: true
date_added: 2026-07-10
---

# Voice-of-Customer Intake

## Introduction
The standing pipeline that turns everyday customer exhaust — support tickets, reviews, NPS verbatims, sales-call notes — into tagged, searchable signal in the research repository. Continuous listening between studies, so the product hears its users without waiting for the next research round.

## Purpose
Users tell you what's wrong every day in support tickets and reviews; most of it evaporates unlogged. This pipeline captures that signal, patterns it, and feeds it into the same repository as formal research — so a recurring complaint becomes visible evidence, not tribal knowledge.

## When to Use
- A voice-of-customer source exists per business (`<FILL_IN: support inbox, review sites, NPS tool, sales notes>`).
- The intake cadence fires (continuous / batched).
- A pattern in the verbatims crosses a noticeable threshold (spike in a complaint → flag).

## Structure / Protocol
SOURCES (the configured feeds, read-only — support tickets, reviews, NPS, call notes) → INTAKE (verbatims pulled on cadence; PII minimized at ingest — Fleet Charter Rail 2) → TAG (each verbatim: product/persona/journey stage + sentiment + theme, same tags as the repo) → PATTERN (recurring themes counted over time; a spike or a rising theme is a signal, a single angry review is not) → ROUTE (patterned signal → research-repository as directional evidence, confidence-flagged low-but-real; a strong recurring pattern → flagged to spec/loom as a research GAP worth a real study) → BOUNDARY (intake is READ-ONLY on Client Success's pipeline — ux listens to support exhaust, it does not own or answer tickets).

## Instructions
1. Read-only on the support relationship: Client Success (future) owns tickets and customers; ux consumes the exhaust as signal. Intake never replies, never manages a case — it listens (the stated boundary, bound tighter when that dept exists).
2. Verbatims are directional by default: one review is a hypothesis; the value is the PATTERN over many — counts and trends, not cherry-picked quotes (funnel-instrumentation's rates-over-totals, qualitative edition).
3. PII minimized at ingest: the least customer-identifying data that preserves the signal (Rail 2 least-privilege); sensitive verbatims handled with extra care.
4. Patterns become evidence, strong patterns become studies: a rising theme routes to the repo as low-confidence-but-real; a loud, consistent one is a GAP flag to study-design — intake feeds research, it doesn't replace it.
5. Sentiment isn't a verdict: a spike in complaints is a signal to investigate, routed to spec/loom, never a product decision ux makes.

## Output Format
Intake batch: verbatims tagged (product/persona/journey/sentiment/theme) · patterns (theme × count × trend) · routes (repo entries / GAP flags to spec/loom).

## Principles
- Listen, don't answer — read-only on Client Success's pipeline.
- Patterns over quotes; counts over anecdotes.
- Minimize PII; a spike is a signal, not a verdict.

## Fallback
No configured sources yet? Intake idles honestly (declares "no feeds configured") rather than pretending signal — the same honest-empty pattern as the rest of the fleet; wire sources per business to activate.

## Boundaries with Other Skills
- research-repository receives tagged verbatims + patterns; study-design receives GAP flags from strong patterns; synthesis-discipline's confidence rules apply (verbatims are directional).
- Client Success (future): owns the support relationship and tickets; ux intake is read-only on their exhaust — the boundary is stated now, bound when that dept builds.
- spec/loom: strong patterns route as evidence/GAPs; kai (Brand Studio) owns review-site reputation management — ux reads reviews for product signal, kai owns the response.
