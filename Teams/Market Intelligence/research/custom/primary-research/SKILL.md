---
name: primary-research
type: custom
status: built from scratch
assigned_agent: research (Market Intelligence / Primary Research)
portable: true
date_added: 2026-07-29
tier: 3
description: "Structured primary research — surveys, interviews, discovery calls. Design → recruit → conduct → analyse → synthesise. Never fabricates responses. Every finding traces to a real respondent + verbatim quote where relevant."
triggers:
  - primary research
  - customer interview
  - customer survey
  - discovery calls
  - user research
  - research project
---

# Primary Research

## Purpose
Owned methodology for talking to real humans — customers, prospects, ex-customers, non-customers — to validate hypotheses market intelligence and product raise.

## Structure / Protocol
```
1. DESIGN    hypothesis · sample · method (survey / interview / diary study)
2. RECRUIT   sample size · segment filters · incentive
3. CONDUCT   script · consent · recording per policy
4. ANALYSE   coding · themes · counts (numeric where possible)
5. SYNTHESISE finding + confidence + verbatim quotes
```

## Instructions
### Design
Hypothesis stated explicitly before design. Sample size sufficient for method (per config); confidence-band mandatory for quantitative.

### Recruit
Segment filters ensure sample matches hypothesis. Screener questions.

### Conduct
Consent recorded. Recording per operator's consent + retention policy. No leading questions.

### Analyse
Code responses; count themes (frequency). Never inflates a single respondent into "customers say X".

### Synthesise
Finding · confidence (based on n + agreement) · verbatim quote per theme.

## Output Format
Report: hypothesis · method · sample (n · segment · dates) · findings (with n and quotes) · limitations.

## Principles
- **Real respondents only.** Fabricated responses = fraud.
- **Verbatim quotes preserve wording** — never paraphrase into agreement.
- **n matters.** "Customers say X" from n=1 is dishonest.
- **Consent + retention per operator policy.**
- **Limitations section mandatory** — sample bias, method limits, dates.
- **Provenance:** `[respondent id / anonymised]` `[interview date]` `[survey wave]`.

## Fallback
| Failure | Response |
|---|---|
| Sample too small for hypothesis | Report thin; recommend re-run or additional method |
| Ambiguous responses | Present ambiguity; do not resolve by inference |
| Consent unclear | Halt; do not use response |

## Boundaries
- `qualitative-synthesis` (this agent) — deeper cross-project synthesis.
- `survey-templates` (this agent) — reusable instruments.
- `scope/market-entry-analysis` — primary research validates assumptions.
- `Product/ux` — user research owned there; this is market-side research (different subject).
- `loom` (Product) — experimentation; different modality but adjacent.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| primary-research | File read/write · Survey MCP (Typeform / Qualtrics) | Video-call recording MCP · Transcription MCP | All steps |
