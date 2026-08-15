<!--
Custom skill — Hubbard + FAIR + practitioner. §11 + §14.2. Route D per §8.2.
-->
---
name: risk-assessment-quantification
type: custom
status: built from scratch (§4.6 reclass)
sources_referenced:
  - "Hubbard, Douglas W. (2014, 3rd ed.). How to Measure Anything: Finding the Value of Intangibles in Business. Wiley. ISBN 978-1118539279. Canonical practitioner text on quantification."
  - "FAIR Institute — Factor Analysis of Information Risk methodology (institutional practitioner). fairinstitute.org."
  - "Hubbard, Douglas W. & Seiersen, Richard (2016). How to Measure Anything in Cybersecurity Risk. Wiley."
  - "COSO ERM (2017) + ISO 31000:2018. Institutional standards."
  - "Bayesian methods practitioner corpus (Kahneman + Silver + Efron)."
fulfills_catalog_entry: risk-assessment-quantification (custom per §2 routing)
assigned_agent: hazard (Risk & ESG / Enterprise Risk)
portable: true
date_added: 2026-07-31
tier: 3
description: Risk assessment + quantification — Hubbard "measure anything" + FAIR framework + Bayesian methods + calibrated estimation. LOAD-BEARING qualitative-only-scoring-without-quantification-attempt refusal. Trigger on "risk quantification for [risk]", "FAIR analysis for [risk]", "calibrated estimation for [impact]", "risk scoring", or "Monte Carlo simulation for [risk]".
triggers:
  - risk quantification for
  - FAIR analysis for
  - calibrated estimation for
  - risk scoring
  - Monte Carlo simulation for
  - probability impact for
  - risk assessment for
---

# Risk Assessment and Quantification

## Introduction

Risk quantification discipline for hazard — Hubbard How to Measure Anything +
FAIR framework + Bayesian methods + COSO ERM + ISO 31000.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Qualitative-only scoring without quantification attempt.** "High/Medium/
   Low" without quantification = un-comparable + un-prioritizable. Hubbard:
   "anything can be measured." LOAD-BEARING per Principle 1.
2. **False precision.** Point-estimate probabilities on tail events =
   Taleb-fabrication (coordinate with pilot `tail-risk-scanning`).
3. **Cognitive bias in expert elicitation.** Uncalibrated estimation
   overconfident.
4. **Correlation blindness.** Risks assessed independently miss correlated
   scenarios.
5. **Assessment stale.** Quantification not updated as environment changes.
6. **Individual crisis DURING assessment crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Risk quantification for [risk]" / "risk assessment for [category]"
- "FAIR analysis for [risk]" / "risk scoring"
- "Calibrated estimation for [impact]" / "Monte Carlo simulation for [risk]"
- "Probability impact for [risk]"

Do NOT use for:
- Risk identification → `risk-identification-taxonomy` (hazard sibling)
- Risk treatment → `risk-treatment-strategies` (hazard sibling)
- Risk monitoring → `risk-monitoring-and-audit` (hazard sibling)
- Tail-risk fat-tail analysis → pilot `tail-risk-scanning`
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
QUANTIFICATION METHODS

  CALIBRATED ESTIMATION (Hubbard)
    - 90% confidence interval elicitation
    - Calibration training reduces overconfidence
    - Combine multiple estimators (wisdom of crowds)

  FAIR (Factor Analysis of Information Risk)
    - Loss Event Frequency × Loss Magnitude
    - Decomposed: Threat Event Freq × Vulnerability + Primary/Secondary Loss
    - Best for: cyber + operational risk

  BAYESIAN UPDATING
    - Prior belief + evidence → posterior belief
    - Handles limited data + expert elicitation
    - Coordinate with dana if computational

  MONTE CARLO SIMULATION
    - Distribution-based (not point estimates)
    - Handles correlations
    - Coordinate with dana for implementation


DISTRIBUTIONS (coordinate with pilot on fat-tail)

  - Normal (only where empirically justified)
  - Lognormal (loss magnitudes typical)
  - Power-law (fat-tail — Taleb inherited)
  - Historical-empirical


OPERATIONAL SEQUENCE:

  Phase 1: METHOD SELECTION PER RISK
  Phase 2: LOAD-BEARING QUANTIFICATION ATTEMPT (no qualitative-only default)
  Phase 3: CORRELATION ASSESSMENT
  Phase 4: PERIODIC UPDATE
```

## Instructions

### Phase 1 — Method selection per risk
Match method to risk (FAIR for cyber; Bayesian for limited-data; Monte Carlo
for complex; calibrated estimation for expert-heavy).

### Phase 2 — Quantification attempt (LOAD-BEARING)
**Every risk gets quantification attempt** per Hubbard. Qualitative-only
scoring reserved for genuinely unquantifiable categories with explicit flag.

### Phase 3 — Correlation assessment
Which risks correlate? Cross-scenario impact.

### Phase 4 — Periodic update
Quarterly minimum; ad-hoc for material environment change.

## Output Format

- Method selection per risk category
- Quantified risk assessment per identified risk
- Correlation matrix
- Update cadence

## Principles

1. **Qualitative-only scoring never default** — LOAD-BEARING per failure mode 1.
2. **No false precision on tails** — coordinate with pilot.
3. **Calibrated estimation** for expert elicitation.
4. **Correlation assessment** for scenario planning.
5. **Periodic update.**
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Data insufficient** — Hubbard: use ranges + Bayesian priors + explicit
  uncertainty flags.
- **Correlation data absent** — flag; consider Monte Carlo with sensitivity analysis.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `risk-identification-taxonomy` (hazard sibling) | Identified risks | Upstream |
| `risk-treatment-strategies` (hazard sibling) | Quantified risks → treatment prioritization | Downstream |
| `risk-monitoring-and-audit` (hazard sibling) | Quantification updates | Coordination |
| pilot `tail-risk-scanning` | Fat-tail distribution methods | Coordination |
| pilot `risk-appetite-framework` | Quantified risks vs appetite | Coordination |
| dana (Engineering) | Monte Carlo + statistical implementation | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Hubbard — How to Measure Anything (Wiley)](https://www.wiley.com/en-us/How+to+Measure+Anything-p-9781118539279)
- [FAIR Institute](https://www.fairinstitute.org/)
- [Hubbard & Seiersen — How to Measure Anything in Cybersecurity Risk (Wiley)](https://www.wiley.com/)
- [COSO ERM](https://www.coso.org/enterprise-risk-management)
- [ISO 31000:2018](https://www.iso.org/standard/65694.html)
