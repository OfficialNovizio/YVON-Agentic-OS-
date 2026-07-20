---
name: prompt-context-engineering
type: custom
status: built from scratch
fulfills_catalog_entry: prompting-practices (Tier-1 OS skill, owner CAIO — content ownership lands here; the skill itself ships in the Shared OS layer for all agents)
assigned_agent: anneal (AI & Agents / Skill Lifecycle & Annealing)
portable: true
date_added: 2026-07-10
---

# Prompt & Context Engineering

## Introduction
Ownership of HOW fleet agents structure their thinking and context: internal prompt discipline, context priming, token economy, confidence disclosure. The Tier-1 `prompting-practices` catalog entry finally has an owner — the shared skill's CONTENT is maintained here; the shared copy every agent inherits lives in the Shared OS layer.

## Purpose
Prompting conventions drift per-agent unless one owner maintains the shared discipline. Bad context habits (unstated assumptions, truncated work, unmarked confidence) are fleet-wide failure modes, not per-agent quirks.

## When to Use
- Maintaining/revising the Shared OS prompting-practices skill (via the normal Rail 3 path).
- A lesson (self-annealing intake) traces to a thinking/context failure rather than a method failure.
- An agent's skill needs prompt-shaped guidance reviewed (descriptions, trigger phrasing — with meta).

## Structure / Protocol
The shared discipline anneal maintains (current house rules, v2026-07):
1. PRIME — state knowns, assumptions, missing info before working; missing info is requested or `<FILL_IN>`-ed, never invented (rule 0.5).
2. DELIMIT — explicit separators between sub-tasks; one question per escalation.
3. NEVER TRUNCATE — partial work surfaces as `[INCOMPLETE: reason]`, never silently dropped.
4. DISCLOSE CONFIDENCE — every recommendation ends `[CONFIDENCE: H/M/L · basis]`; H requires a source or a formula (rule 0.6 alignment).
5. TOKEN ECONOMY — reference shared skills instead of restating them; dated assets over inline stale facts.

## Instructions
- Revisions to the shared discipline follow the full annealing path: lesson → baseline → minimal diff → proposal → board → apply to the Shared OS copy → version.
- Reviews of individual skills' prompt-shaped text (descriptions, trigger tables) apply meta's writing-skills SDO rules; findings route as normal lifecycle intake.
- Fleet-wide prompt conventions never fork per-agent: an agent needing an exception gets it as a documented conditional in the shared skill, not a local copy (local copies are how drift starts — audit flags them).

## Output Format
Shared-skill revision proposals; per-skill review findings (rule-numbered, like meta's lint verdicts); the maintained Shared OS `prompting-practices` document itself.

## Principles
- One shared discipline, zero local forks.
- Confidence disclosure is not optional politeness — it's the anti-hallucination rail in text form.
- Prompting guidance obeys the same iron law as any skill: no edit without a demonstrated baseline failure.

## Fallback
The Shared OS layer doesn't have prompting-practices built yet (current state — it's on the pending list): this skill's Protocol section above IS the interim content; building the shared copy is a queued proposal, flagged in the department's pending items.

## Boundaries with Other Skills
- meta's skill-authoring-standards governs skill FILES; this governs agents' THINKING patterns — descriptions/triggers are the shared border, reviewed jointly.
- Shared OS layer distributes; anneal maintains content.
- self-annealing-loop is the intake and change mechanism for everything here.
