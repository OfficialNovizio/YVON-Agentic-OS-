---
name: behavioural-audit-lit
type: custom
status: built from scratch
assigned_agent: trial (Behavioural Science / Behavioural Experimentation)
portable: true
date_added: 2026-07-29
tier: 3
description: "Literature review before running a new experiment — has this hypothesis been tested? What did prior work find? Prevents re-running settled questions and inherits methodology + effect-size expectations from prior work."
triggers:
  - literature review
  - has this been tested
  - prior work on X
  - what did research find on Y
  - lit review for hypothesis
---

# Behavioural Audit — Literature

## Purpose
Before designing a new experiment, check the literature. Saves cost + inherits methodology + sets effect-size expectations.

## Structure / Protocol
```
1. HYPOTHESIS   as stated for the proposed experiment
2. SEARCH       peer-reviewed database search (Semantic Scholar · Google Scholar)
3. FILTER       relevance + methodology quality + WEIRD-bias check
4. SUMMARISE    prior findings + effect-size + replication status
5. RECOMMEND    proceed / narrow / redesign / skip
```

## Instructions
Replication crisis-aware: single-study effects are weak evidence. Report replication status.

WEIRD-bias check: is the sample generalisable to the target population?

## Output Format
Lit review: hypothesis · N studies found · N high-quality · consensus effect size (range) · replication status · WEIRD-bias flag · recommendation.

## Principles
- **Replication status mandatory** on any effect claim.
- **WEIRD-bias flagged** when applying to non-WEIRD populations.
- **Peer-reviewed only** — no blog posts.
- **Never inflates a single study** into "established finding".
- **Provenance:** DOI + author + year per citation.

## Fallback
| Failure | Response |
|---|---|
| No prior work | Note gap; hypothesis is novel — extra design care needed |
| Contradictory prior findings | Report distribution; do not synthesise into false consensus |

## Boundaries
- `behavioural-experiment-design` (this agent) — pre-experiment input.
- `research/qualitative-synthesis` (MI) — qualitative peer.
- `nudge/nudge-library` (this dept) — patterns overlap; complement.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| behavioural-audit-lit | Web fetch (Semantic Scholar · Google Scholar) · File read/write | Semantic Scholar MCP · JSTOR MCP | All steps |
