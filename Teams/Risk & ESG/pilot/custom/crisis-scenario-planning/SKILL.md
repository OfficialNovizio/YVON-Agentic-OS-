<!--
Custom skill — synthesized from Taleb + Fink 1986 + Hopkins + Perrow + practitioner. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Taleb corpus 4th use in pilot + Fink 2nd use across fleet (beacon crisis-comms + this).
-->
---
name: crisis-scenario-planning
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Taleb, Nassim Nicholas (2007 + 2012 + 2018). Black Swan + Antifragile + Skin in the Game. §8.9 4th use in pilot."
  - "Fink, Steven (1986/2013). Crisis Communications (McGraw-Hill). §8.9 2nd use across fleet (beacon crisis-comms + this)."
  - "Hopkins, Andrew (2008). Failure to Learn: The BP Texas City Refinery Disaster. CCH Australia. Named practitioner-academic."
  - "Perrow, Charles (1984). Normal Accidents: Living with High-Risk Technologies. Basic Books. Named academic."
  - "Shell Scenario Planning practitioner corpus (institutional)."
fulfills_catalog_entry: crisis-scenario-planning (custom per §2 routing)
assigned_agent: pilot (Risk & ESG / Risk Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Crisis scenario planning — Taleb antifragile scenarios + Fink 5-stage crisis lifecycle (inherited from beacon) + Hopkins failure-to-learn + Perrow normal accidents + Shell scenario methodology. LOAD-BEARING scenario-planning-with-fabricated-probabilities refusal. Trigger on "crisis scenario for [event]", "scenario planning for [risk]", "tabletop exercise for [crisis]", "worst-case scenario for [category]", or "black swan scenario for [operation]".
triggers:
  - crisis scenario for
  - scenario planning for
  - tabletop exercise for
  - worst-case scenario for
  - black swan scenario for
  - what-if scenario for
  - scenario analysis for
---

# Crisis Scenario Planning

## Introduction

Crisis scenario planning discipline for pilot — Taleb Black Swan / Antifragile
+ Fink 5-stage lifecycle (inherited from beacon `crisis-comms`) + Hopkins
Failure to Learn + Perrow Normal Accidents + Shell scenario methodology.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Scenario planning with fabricated probabilities.** Attaching precise
   probabilities to tail scenarios = false precision (Taleb Black Swan
   discipline). LOAD-BEARING per Principle 1.
2. **Scenario planning as forecast.** Scenarios ≠ predictions; scenarios
   explore possibilities to test resilience.
3. **Optimistic-only scenarios.** Failure to include worst-case = incomplete
   planning.
4. **Failure-to-learn** (Hopkins) — repeated crisis patterns from same root
   causes not addressed.
5. **Normal-accident blindness** (Perrow) — complex-tightly-coupled systems
   have inevitable accidents; planning must include.
6. **Individual crisis DURING scenario-planning crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Crisis scenario for [event]" / "scenario planning for [risk]"
- "Tabletop exercise for [crisis]" / "worst-case scenario for [category]"
- "Black swan scenario for [operation]" / "what-if scenario for [risk]"
- "Scenario analysis for [strategic decision]"

Do NOT use for:
- Risk appetite → `risk-appetite-framework` (pilot sibling)
- Tail-risk scan → `tail-risk-scanning` (pilot sibling)
- Risk committee reporting → `risk-committee-and-reporting` (pilot sibling)
- Crisis communications execution → beacon `crisis-comms` (Comms & PR)
- BCP / DR execution → shield siblings
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
SCENARIO METHODOLOGY (Shell + practitioner)

  1. DRIVING FORCE IDENTIFICATION — key uncertainty variables
  2. SCENARIO CONSTRUCTION — 3-5 scenarios spanning outcome range
  3. NARRATIVE DEVELOPMENT — plausible storyline per scenario
  4. IMPLICATIONS ANALYSIS — organizational impact per scenario
  5. STRATEGY / RESPONSE PLANNING — antifragile options


TABLETOP EXERCISE FORMAT (Fink + practitioner)

  - Pre-brief participants (scope + rules)
  - Scenario walkthrough with injections
  - Cross-functional participation (operator + relevant leads)
  - After-Action Review (AAR)
  - Documented findings + corrective actions


CRISIS TYPES (per Fink 1986 + industry practitioner)

  - Financial crisis (liquidity / earnings / restatement)
  - Cyber incident / breach
  - Product failure / recall
  - Regulatory action
  - Litigation
  - Executive misconduct
  - Natural disaster
  - Pandemic / health
  - Geopolitical (sanctions / conflict)
  - Reputation crisis (viral negative event)
  - Supply chain disruption


ANTIFRAGILE OPTION DESIGN (Taleb)

  Per scenario, options prefer:
    - Convex-payoff (small downside, large upside if scenario materializes
      differently than expected)
    - Optionality (flexibility to adapt)
    - Redundancy (backup capacity)
    - AVOID: fragile responses (single-point-of-failure, over-optimization)


OPERATIONAL SEQUENCE:

  Phase 1: DRIVING-FORCE + KEY-UNCERTAINTY IDENTIFICATION
  Phase 2: SCENARIO CONSTRUCTION (3-5 scenarios)
  Phase 3: NARRATIVE + IMPLICATIONS PER SCENARIO
  Phase 4: TABLETOP EXERCISE + AFTER-ACTION REVIEW
  Phase 5: ANTIFRAGILE RESPONSE OPTION DESIGN
```

## Instructions

### Phase 1 — Driving-force + key-uncertainty identification
Per business + industry: identify 2-3 highest-impact uncertainty variables.

### Phase 2 — Scenario construction (3-5 scenarios)
Span outcome range (positive / neutral / negative / worst-case + wild card
if applicable).

### Phase 3 — Narrative + implications per scenario
Plausible storyline; organizational impact analysis; **no fabricated
probabilities per Principle 1**.

### Phase 4 — Tabletop exercise + AAR
Cross-functional exercise per scenario; documented AAR + corrective actions.

### Phase 5 — Antifragile response option design (Taleb)
Prefer convex + optional + redundant responses; avoid fragile
single-point-of-failure.

## Output Format

- Driving-force + uncertainty analysis
- 3-5 scenario narratives with implications
- Tabletop exercise design + AAR template
- Antifragile response options per scenario
- Corrective action tracker

## Principles

1. **Never scenario planning with fabricated probabilities** — LOAD-BEARING
   per failure mode 1 (Taleb discipline).
2. **Scenarios are exploratory, not predictions.**
3. **Worst-case scenario mandatory** — no optimistic-only planning.
4. **Failure-to-learn discipline** — root-cause corrective action tracked.
5. **Normal-accident awareness** (Perrow) — complex-coupled systems require
   inevitability planning.
6. **Antifragile options preferred** — Taleb discipline.
7. **No fabrication** — cited sources. Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Scenario
   details containing material-nonpublic-info handled per operator + counsel
   + Reg FD.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Probability quantification pressure** for tail scenarios — decline per
  Principle 1. Provide qualitative likelihood ranges with explicit
  uncertainty flags.
- **Optimistic-only scenario pressure** from operator — decline per
  Principle 3. Include worst-case.
- **AAR corrective actions not implemented** — escalate to operator +
  risk committee (per `risk-committee-and-reporting`).
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `risk-appetite-framework` (pilot sibling) | Scenarios test appetite | Coordination |
| `tail-risk-scanning` (pilot sibling) | Tail scenarios | Upstream |
| `risk-committee-and-reporting` (pilot sibling) | Scenario findings reported | Downstream |
| `risk-assessment-quantification` (hazard) | Scenario impact quantification | Coordination |
| `business-continuity-planning` + `disaster-recovery-planning` (shield) | Scenario response coordination | Coordination |
| `crisis-comms` (beacon — Comms & PR) | Crisis-response execution | Cross-department |
| warden + veil + bastion (Cybersecurity) | Cyber-scenario coordination | Cross-department |
| Operator + board | Scenario approval + AAR review | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Taleb — The Black Swan / Antifragile / Skin in the Game (Random House)](https://www.penguinrandomhouse.com/)
- [Fink, Steven — Crisis Communications (McGraw-Hill)](https://www.mhprofessional.com/9780071799225-usa-crisis-communications-the-definitive-guide-to-managing-the-message)
- [Hopkins, Andrew — Failure to Learn (CCH Australia)](https://www.wolterskluwer.com/)
- [Perrow — Normal Accidents (Basic Books)](https://press.princeton.edu/books/paperback/9780691004129/normal-accidents)
- [Shell — Scenario Planning](https://www.shell.com/energy-and-innovation/the-energy-future/scenarios.html)
