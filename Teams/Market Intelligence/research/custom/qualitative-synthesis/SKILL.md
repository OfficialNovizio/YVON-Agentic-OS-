---
name: qualitative-synthesis
type: custom
status: built from scratch
assigned_agent: research (Market Intelligence / Primary Research)
portable: true
date_added: 2026-07-29
tier: 3
description: "Cross-project qualitative synthesis — themes across multiple studies, longitudinal patterns, narrative arcs. Uses grounded-theory coding; every synthesised theme traces to source studies."
triggers:
  - synthesise research
  - meta analysis
  - cross-study themes
  - research library synthesis
  - what have we learned about X
  - longitudinal patterns
---

# Qualitative Synthesis

## Purpose
Look across the research library — surface durable themes, longitudinal shifts, contradictions between studies. Not a single study; the shape of what we know.

## When to Use
- "What have we learned about X" across projects
- Annual research retrospective
- Strategy input from accumulated learning

## Structure / Protocol
```
1. SCOPE      question + candidate studies from library
2. CODE       grounded-theory codes across studies
3. THEMES     recurring · emerging · fading · contradicted
4. LONGITUDINAL time-ordered shifts
5. NARRATIVE   what the accumulated evidence says
6. RETURN     synthesis memo + trace to source studies
```

## Instructions
Every theme cites the studies it came from (with dates + sample size context). Contradictions preserved, not resolved by inference.

## Output Format
Themes table + longitudinal chart + narrative synthesis + source-study references.

## Principles
- **Never resolves contradictions by inference** — preserves them for operator judgment.
- **Every theme cites source studies.**
- **Longitudinal shifts noted** — what was true is not necessarily true now.
- **"Fading theme"** is a first-class output.
- **Sample-size context** on every citation.

## Fallback
| Failure | Response |
|---|---|
| Research library too thin | Report scope-inadequate |
| No cross-study evidence for a hypothesis | Report absence honestly |

## Boundaries
- `primary-research` (this agent) — source studies.
- `survey-templates` (this agent) — instrument reuse.
- `scope/market-entry-analysis` — synthesis feeds strategic decisions.
- `insight/ad-hoc-analysis` (D&A) — quantitative counterpart.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| qualitative-synthesis | File read (research library) · File write (synthesis memo) | Qualitative coding tool | All steps |
