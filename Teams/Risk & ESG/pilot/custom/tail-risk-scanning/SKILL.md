<!--
Custom skill — synthesized from Taleb + practitioner + institutional. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Taleb corpus 2nd use in pilot.
-->
---
name: tail-risk-scanning
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Taleb, Nassim Nicholas (2007, 2010 expanded). The Black Swan: The Impact of the Highly Improbable. Random House. ISBN 978-0812973815. §8.9 2nd use in pilot."
  - "Taleb, Nassim Nicholas (2012). Antifragile (Random House). §8.9 with pilot-1."
  - "Taleb, Nassim Nicholas (2018). Skin in the Game (Random House). §8.9 3rd use in pilot."
  - "Kahneman, Daniel (2011). Thinking Fast and Slow (FSG). Cognitive biases in risk assessment. ISBN 978-0374533557."
  - "World Economic Forum — Global Risks Report (institutional annual). weforum.org."
  - "Institute of Risk Management (IRM) — practitioner corpus."
fulfills_catalog_entry: tail-risk-scanning (custom per §2 routing)
assigned_agent: pilot (Risk & ESG / Risk Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Tail-risk scanning — Taleb Black Swan discipline + fat-tail distribution recognition + emerging-risk horizon scanning + cognitive bias awareness. LOAD-BEARING Gaussian-tail-assumption + normal-distribution-fallacy refusal. Trigger on "tail risk scan", "black swan analysis for [scenario]", "emerging risk horizon scanning", "fat-tail distribution for [category]", or "extreme scenario planning".
triggers:
  - tail risk scan
  - black swan analysis for
  - emerging risk horizon scanning
  - fat-tail distribution for
  - extreme scenario planning
  - long-tail risk for
  - fragility assessment for
---

# Tail Risk Scanning

## Introduction

Tail-risk scanning discipline for pilot — Taleb Black Swan + Antifragile +
Skin in the Game + Kahneman cognitive biases + WEF Global Risks + IRM
practitioner.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Gaussian-tail assumption for fat-tail phenomena.** Financial /
   operational / cyber / pandemic risks are typically fat-tailed, not
   normal-distributed. LOAD-BEARING per Principle 1 (Taleb discipline).
2. **Normal-distribution fallacy in modeling.** Value-at-Risk (VaR) models
   using normal distribution underestimate tail risk. Coordinate with
   hazard for FAIR/Hubbard methods.
3. **Emerging-risk blindness.** Focus on measured historical risks misses
   emerging risks (regulatory shifts / tech disruption / geopolitical /
   climate / pandemic).
4. **Cognitive-bias ignored** (Kahneman) — availability heuristic +
   recency bias + optimism bias distort risk assessment.
5. **Fragility not measured.** Anti-fragile framing (Taleb 2012): assess
   which exposures break under stress vs which strengthen.
6. **Individual crisis DURING risk-scan crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Tail risk scan" / "black swan analysis for [scenario]"
- "Emerging risk horizon scanning" / "fat-tail distribution for [category]"
- "Extreme scenario planning" / "long-tail risk for [category]"
- "Fragility assessment for [exposure]"

Do NOT use for:
- Risk appetite → `risk-appetite-framework` (pilot sibling)
- Risk committee → `risk-committee-and-reporting` (pilot sibling)
- Crisis scenario planning → `crisis-scenario-planning` (pilot sibling)
- Risk identification (day-to-day) → hazard `risk-identification-taxonomy`
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
TAIL RISK TYPES (Taleb)

  BLACK SWAN — high-impact, unpredictable, rationalized-in-hindsight
  GRAY SWAN — high-impact, predictable but unquantifiable probability
  WHITE SWAN — routine risk, predictable + quantifiable


FAT-TAIL DISTRIBUTIONS

  Financial markets — power-law distributions vs normal
  Cyber-attacks — pareto distribution of impact
  Operational failures — fat-tail loss distribution
  Pandemics — power-law (Ebola vs COVID magnitudes)


COGNITIVE BIASES (Kahneman) affecting risk scan

  - Availability heuristic (recent = more likely-seeming)
  - Recency bias
  - Optimism bias (underestimate personal risk)
  - Anchoring
  - Narrative fallacy (Taleb) — hindsight rationalization


EMERGING RISK HORIZONS (WEF categories + custom)

  - Regulatory (new laws / enforcement priorities)
  - Technology (AI / quantum / new-tech disruption)
  - Geopolitical (conflicts / sanctions / trade regimes)
  - Climate + environmental
  - Pandemic + health
  - Social + labor market
  - Cybersecurity (nation-state / ransomware evolution)


OPERATIONAL SEQUENCE:

  Phase 1: TAIL-RISK CATEGORY IDENTIFICATION
  Phase 2: DISTRIBUTION ASSESSMENT (LOAD-BEARING no-Gaussian-default)
  Phase 3: EMERGING-RISK HORIZON SCAN
  Phase 4: COGNITIVE-BIAS AUDIT
  Phase 5: FRAGILITY ASSESSMENT (Taleb antifragile)
```

## Instructions

### Phase 1 — Tail-risk category identification
Per business + industry: financial / operational / cyber / regulatory /
geopolitical / climate categories.

### Phase 2 — Distribution assessment (LOAD-BEARING)
**Never assume normal distribution for fat-tail phenomena.** Use appropriate
distributions (power-law / pareto / lognormal / historical-based). Coordinate
with hazard `risk-assessment-quantification` for FAIR/Hubbard methods.

### Phase 3 — Emerging-risk horizon scan
Regular horizon scanning per WEF categories + industry-specific. Quarterly
minimum.

### Phase 4 — Cognitive-bias audit
Assessment process reviewed for Kahneman biases; multiple perspectives; devil's
advocate.

### Phase 5 — Fragility assessment (Taleb)
Per exposure: fragile (breaks under stress) / robust (unchanged) / antifragile
(strengthens under stress). Prefer antifragile / robust structures.

## Output Format

- Tail-risk category memo per business
- Distribution assessment with fat-tail recognition
- Emerging-risk horizon scan report
- Cognitive-bias audit findings
- Fragility assessment per major exposure

## Principles

1. **Never Gaussian-tail assumption for fat-tail phenomena** — LOAD-BEARING
   per failure mode 1 (Taleb discipline).
2. **Distribution assessment appropriate to phenomenon.**
3. **Emerging-risk scan quarterly minimum.**
4. **Cognitive-bias audit** in assessment process.
5. **Fragility assessment per exposure** — Taleb antifragile.
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Distribution data insufficient** — use conservative fat-tail assumption
  + explicit flag; do NOT default to Gaussian.
- **Emerging risk category ambiguous** — coordinate with hazard + operator.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `risk-appetite-framework` (pilot sibling) | Tail-risk informs appetite | Coordination |
| `risk-committee-and-reporting` (pilot sibling) | Tail-risk reported to committee | Downstream |
| `crisis-scenario-planning` (pilot sibling) | Tail scenarios | Coordination |
| `risk-assessment-quantification` (hazard) | FAIR/Hubbard fat-tail methods | Coordination |
| warden + veil + bastion (Cybersecurity) | Cyber tail-risk coordination | Cross-department |
| beacon `crisis-comms` (Comms & PR) | Tail-risk-adjacent crisis | Cross-department |
| Operator + board | Emerging-risk board reporting | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Taleb — The Black Swan (Random House)](https://www.penguinrandomhouse.com/books/188478/the-black-swan-second-edition-by-nassim-nicholas-taleb/)
- [Taleb — Antifragile (Random House)](https://www.penguinrandomhouse.com/books/176227/antifragile-by-nassim-nicholas-taleb/)
- [Taleb — Skin in the Game (Random House)](https://www.penguinrandomhouse.com/books/537828/skin-in-the-game-by-nassim-nicholas-taleb/)
- [Kahneman — Thinking Fast and Slow (FSG)](https://us.macmillan.com/books/9780374533557/thinkingfastandslow)
- [WEF Global Risks Report](https://www.weforum.org/reports/global-risks-report-2024/)
- [Institute of Risk Management](https://www.theirm.org/)
