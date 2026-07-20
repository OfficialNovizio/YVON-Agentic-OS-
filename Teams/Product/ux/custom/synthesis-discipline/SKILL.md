---
name: synthesis-discipline
type: custom
status: built from scratch
fulfills_catalog_entry: none — new; the findings-to-claims rigor (redesign §3), the anti-vibes rule
assigned_agent: ux (Product / UX Research)
portable: true
date_added: 2026-07-10
---

# Synthesis Discipline

## Introduction
Turning raw research data into claims that carry their confidence — traceable to evidence, never to vibes. A synthesized finding says what it knows, how strongly, and from what; "users seem frustrated" without a trace is not a finding.

## Purpose
Synthesis is where good data becomes bad conclusions: the researcher's prior gets read into three ambiguous quotes and shipped as certainty. Disciplined synthesis makes every claim traceable to the data and honestly weighted, so PRDs cite evidence, not the researcher's hunch.

## When to Use
- study-design hands over raw data (interviews, test sessions, survey results).
- Voice-of-customer verbatims need pattern extraction.
- A claim about users is about to enter a PRD or the repository (the confidence gate).

## Structure / Protocol
EVIDENCE FIRST (claims are built up from the data, not the data mined for a pre-held claim — confirmation bias is the enemy) → PATTERN (recurring signals across sources, with counts; a one-person quote is a hypothesis, not a finding) → CLAIM + CONFIDENCE (each claim tagged: strong / moderate / directional, keyed to sample size, consistency, and method — the flag rides the claim everywhere it's cited) → TRACE (every claim links to its supporting data — quotes, session refs, response counts) → DISCONFIRMING (actively note what contradicted the claim; a synthesis with zero counter-evidence is suspect) → FILE (confidence-flagged claims → research-repository, tagged).

## Instructions
1. Build up, don't mine down — start from what the data says, not from the conclusion you expected; the expected-answer-found is the finding to distrust most.
2. Counts matter: "several users" is a number — say it. A pattern is a pattern across sources; one vivid quote is a hypothesis for the next study.
3. Confidence is explicit and calibrated: strong (large/consistent/right-method), moderate, or directional — and the flag travels with the claim into PRDs and the repo (spec's Confidence cap reads it).
4. Trace or it's a vibe: every claim carries its evidence links; an untraceable claim is deleted, not softened.
5. Seek disconfirming evidence: note what didn't fit; a too-clean finding usually means the counter-signal was ignored (the anti-confirmation-bias rule, house discipline).

## Output Format
Synthesis: claim · confidence (strong/moderate/directional + why) · supporting evidence (quotes/counts/refs) · disconfirming notes → repository entry.

## Principles
- Evidence up, not conclusion down — distrust the expected answer.
- Confidence is calibrated and travels with the claim.
- Trace or delete; note what didn't fit.

## Fallback
Data too thin for any confident claim? "Inconclusive — directional signal only, needs N more" is a valid, honest output — better than a manufactured finding (gauge's honest-missing, synthesis edition).

## Boundaries with Other Skills
- study-design supplies raw data; research-repository stores the confidence-flagged claims; spec's evidence-ladder caps Confidence using these flags.
- loom consumes synthesis to check whether an experiment's assumption held; a shipped miss traced to over-confident synthesis is an annealing lesson (this skill's text updates).
- Behavioral Science (future) owns bias/persuasion theory; ux applies anti-bias *method* here, doesn't inline the theory.
