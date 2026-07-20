---
name: research-repository
type: custom
status: built from scratch
fulfills_catalog_entry: vyon-research-repository (prefix stripped; per-product tagging moved to product profiles)
assigned_agent: ux (Product / UX Research)
portable: true
date_added: 2026-07-10
---

# Research Repository

## Introduction
The reuse-first memory of everything the company has learned about its users: findings tagged by product, persona, and journey stage, linked to the PRDs and decisions they informed. Every new study starts by querying it — the cheapest study is the one already done.

## Purpose
Teams re-run the same interviews because nobody remembered the last round's answer. A queryable repository turns research from a disposable event into a compounding asset, and makes "we already know this" a checkable claim.

## When to Use
- BEFORE any new study (study-design's mandatory first step — query before you run).
- A PRD or opportunity-assessment needs evidence (spec cites repo IDs).
- New findings land (synthesis-discipline files them here) or voice-of-customer verbatims arrive.

## Structure / Protocol
QUERY-FIRST (every research request first searches the repo: is this known? partially? stale?) → verdict: ANSWERED (cite existing finding, no new study) | STALE (re-validate, don't re-discover) | GAP (new study justified — hands to study-design) → FILE (findings tagged: product `<FILL_IN profile>`, persona, journey stage, confidence, date; linked to the PRD/decision IDs that used them) → LINK (bidirectional: a finding knows which decisions cite it; a PRD knows its evidence) → AGE (findings carry a date; old findings about a changed product are flagged stale, not trusted silently).

## Instructions
1. Query before you run — a study request with no repo search is bounced; "we might already know this" is answered, not assumed (the reuse-first gate, ux's cheapest-study rule).
2. Tag for retrieval: a finding nobody can find is a finding that doesn't exist — product/persona/journey tags are mandatory, not optional metadata.
3. Confidence rides every finding (synthesis-discipline's flag): a claim from 3 interviews and a claim from a 400-response survey are not cited the same way.
4. Findings age: date-stamped, and flagged stale when the product/market they describe has moved — staleness is declared, never silently trusted (metric's version-break, research edition).
5. Bidirectional links: the repo records which PRDs/experiments used a finding, so a disproven finding can trace its downstream decisions (annealing input — a shipped miss may trace to a stale finding).

## Output Format
Repo entry: finding · tags (product/persona/journey) · confidence · date · source study ID · cited-by (PRD/experiment IDs). Query result: ANSWERED/STALE/GAP + refs.

## Principles
- Query first — the cheapest study is the one already run.
- Tagged or invisible; confidence-flagged or uncitable.
- Findings age and say so.

## Fallback
Empty repo (new company)? The first studies seed it; query-first still runs (returns GAP honestly) so the discipline is in place from finding #1.

## Boundaries with Other Skills
- study-design consumes GAP verdicts (only real gaps get new studies); synthesis-discipline files findings here with confidence; voice-of-customer-intake feeds it continuously.
- spec cites repo IDs in PRDs (the evidence supply); a shipped miss routes back here to check for a stale-finding cause (anneal).
- Behavioral Science (future): persuasion/bias frameworks are that dept's — ux tags a dependency, doesn't inline pop psychology.
