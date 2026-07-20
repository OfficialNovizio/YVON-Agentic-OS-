---
name: eval-first-design
type: custom
status: built from scratch
sources_referenced:
  - Engineering/quinn/marketplace/eval-harness (ECC) — pattern reused: evals are evidence into a gate, never a verdict by themselves
fulfills_catalog_entry: vyon-agent-prototype-kit protocol step 2 ("define success eval before building"), expanded to its own skill
assigned_agent: proto (AI & Agents / Prototyping)
portable: true
date_added: 2026-07-10
---

# Eval-First Design

## Introduction
Success criteria are written before the thing exists — for prototypes, and as the house discipline for any new capability. Reuses quinn's eval-harness pattern (evidence-into-gate) at design time instead of release time.

## Purpose
Criteria written after building are rationalizations of whatever got built. Writing the eval first forces the hypothesis to be falsifiable and makes the expiry verdict mechanical instead of political.

## When to Use
- Before ANY prototype build (agent-prototype-kit requires it).
- Before a tool trial (scout's intake borrows this — criteria-before-trial).
- When a promotion verdict is contested ("what did we agree success meant?").

## Structure / Protocol
HYPOTHESIS (one, falsifiable) → CRITERIA (3–5, each: what's measured, how, pass bar; at least one criterion must be capable of FAILING the prototype — a rubric that can't fail is decoration) → BASELINE (what does the fleet do WITHOUT this? if nothing is broken, why prototype? — the writing-skills RED discipline applied to agents) → FREEZE (criteria lock when the manifest registers; edits after that are Rail 3 amendments, visible) → SCORE (at expiry: against frozen criteria only).

## Instructions
1. Pass bars are numbers or observable behaviors, never adjectives ("faster than the incumbent on tasks A/B by ≥X%" not "noticeably better"). Unknown right values → `<FILL_IN>` set with the operator at manifest time, never invented (rule 0.5).
2. The baseline step is mandatory and honest: run/document the incumbent's behavior on the same tasks first. No baseline, no comparison, no verdict.
3. Criteria count is capped (3–5): ten criteria means the hypothesis isn't one hypothesis.
4. Post-freeze edits: allowed only via a visible amendment (Rail 3 path), and the verdict must report against BOTH versions if criteria changed mid-flight.
5. Scoring at expiry is mechanical where possible (rule 0.6: numbers through the stated measurement, not impressions); qualitative criteria get blind review (forge's blind-scoring discipline borrowed).

## Output Format
The criteria table (manifest section), baseline record, and at expiry a scored table: criterion / measured / bar / PASS-FAIL.

## Principles
- If it can't fail, it isn't an eval.
- Baseline before build — the incumbent's behavior is the RED phase.
- Frozen means frozen; amendments are visible or they're cheating.

## Fallback
A hypothesis that resists measurable criteria ("agents feel more coherent")? It's not prototype-ready — route it back as a research question with what WOULD make it falsifiable. Parking is honest; fuzzy criteria are not.

## Boundaries with Other Skills
- agent-prototype-kit embeds this; promote-or-archive-verdict consumes the frozen criteria.
- quinn's eval-harness: same pattern at release gates; gauge's golden set: same pattern in production. Design-time / release-time / run-time — three uses, one discipline.
