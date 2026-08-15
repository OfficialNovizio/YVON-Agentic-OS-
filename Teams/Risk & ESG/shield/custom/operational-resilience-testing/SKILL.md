# Operational Resilience Testing

## Introduction

Operational resilience testing for shield — Bank of England / PRA / FCA
operational resilience regulations + BCBS PoR (Principles for Operational
Resilience) + practitioner.

Custom Route D per §8.2. §4.6 reclass.

## Sources

- Bank of England / PRA (Prudential Regulation Authority) — Operational
  Resilience policy (SS1/21, PS6/21) 2021.
- FCA — Building operational resilience policy (PS21/3) 2021.
- BCBS (Basel Committee on Banking Supervision) — Principles for
  Operational Resilience 2021.
- DORA (Digital Operational Resilience Act) — EU regulation 2022/2554,
  binding January 2025.
- ISO 22301 + NIST + practitioner corpus.

## Description

Operational resilience testing — important business service identification +
operational impact tolerance + mapping + scenario testing + regulatory
reporting. LOAD-BEARING important-business-service-identification-without-
operational-impact-tolerance-definition refusal.

## Triggers

operational resilience for / important business service identification /
impact tolerance for / severe-but-plausible scenario testing /
DORA compliance / BoE FCA operational resilience / resilience testing plan

## Purpose

Prevents seven failure modes:

1. **Important-business-service identification without operational-impact-
   tolerance definition.** BoE/FCA/BCBS/DORA all require identification +
   tolerance definition together. LOAD-BEARING per Principle 1.
2. **Mapping shallow.** End-to-end dependency mapping (people / process /
   technology / third-party) must be complete.
3. **Scenario testing optimistic-only.** Severe-but-plausible scenarios
   required per regulation.
4. **Tolerance breach without communication + action plan.**
5. **Regulatory reporting stale** — regulator-mandated cadence.
6. **DORA scope missed** for EU + EU-linked orgs.
7. **Individual crisis DURING resilience-testing crunch.** HARD BOUNDARY.

## Structure

```
IMPORTANT BUSINESS SERVICES (IBS)

  Definition (BoE/FCA/BCBS): services whose disruption could cause
    - Harm to consumers
    - Financial stability risk
    - Firm viability threat
    - Market integrity threat

  Identification requires business + operations + risk collaboration.


OPERATIONAL IMPACT TOLERANCE

  Maximum tolerable level of disruption per IBS per severe-but-plausible
  scenario.
  Measured in: time / geography / customers-affected / financial impact.
  Set by board; reviewed annually.


END-TO-END MAPPING

  Per IBS: all resources required to deliver:
    - People (roles + skills)
    - Process (workflows)
    - Technology (systems + data)
    - Facilities (locations)
    - Third-party (vendors / suppliers — coordinate third-party-risk-management sibling)


SEVERE-BUT-PLAUSIBLE SCENARIOS

  Regulatory requirement: test IBS against scenarios that:
    - Could realistically occur
    - Would test tolerance limits
    - Include cyber + physical + third-party + geopolitical

  Coordinate with pilot `crisis-scenario-planning`.


DORA-SPECIFIC (EU 2025+)

  - ICT risk management framework
  - ICT-related incident reporting
  - Digital operational resilience testing (threat-led penetration testing
    for significant firms)
  - Third-party ICT risk management
  - Information sharing


OPERATIONAL SEQUENCE:

  Phase 1: LOAD-BEARING IBS + IMPACT TOLERANCE IDENTIFICATION
  Phase 2: END-TO-END MAPPING
  Phase 3: SEVERE-BUT-PLAUSIBLE SCENARIO TESTING
  Phase 4: TOLERANCE-BREACH COMMUNICATION + ACTION
  Phase 5: REGULATORY REPORTING (BoE/FCA/BCBS/DORA per jurisdiction)
```

## Instructions

### Phase 1 — IBS + impact tolerance identification (LOAD-BEARING)
**Both required together per regulation.** Board approval.

### Phase 2 — End-to-end mapping
People + process + technology + facilities + third-party per IBS.

### Phase 3 — Severe-but-plausible scenario testing
Coordinate pilot for scenarios; coordinate BCP + DR for execution.

### Phase 4 — Tolerance-breach communication + action
Breach detected → board + operator + regulator (per applicable regime) +
action plan.

### Phase 5 — Regulatory reporting
Per applicable regime (BoE/PRA + FCA for UK; BCBS-aligned for banks
globally; DORA for EU 2025+).

## Output Format

- IBS + impact tolerance memo (board approved)
- End-to-end mapping per IBS
- Scenario testing plan + results
- Tolerance-breach communication + action plan
- Regulatory reporting per jurisdiction

## Principles

1. **Never IBS identification without operational impact tolerance
   definition** — LOAD-BEARING per failure mode 1.
2. **End-to-end mapping complete** — people + process + technology +
   facilities + third-party.
3. **Severe-but-plausible scenarios** — not optimistic-only.
4. **Tolerance-breach = communication + action.**
5. **Regulatory reporting on cadence.**
6. **DORA scope assessed** for EU exposure.
7. **No fabrication** — cited sources. Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. IBS +
   scenario details material-non-public in some contexts; coordinate operator
   + counsel + beacon for external disclosure timing.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **IBS identification without impact tolerance pressure** — decline per
  Principle 1. Escalate to operator + board.
- **Scenario testing shows tolerance-breach** — activate communication +
  action plan; escalate to operator + board + regulator (per applicable
  regime).
- **DORA scope confusion** — coordinate with canopy + counsel for
  jurisdiction-specific applicability.
- **Regulatory reporting delay** — escalate to operator + counsel.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries

| Hands off to / from | For | Direction |
|---|---|---|
| `business-continuity-planning` (shield sibling) | BCP execution + BIA coordination | Coordination |
| `disaster-recovery-planning` (shield sibling) | DR as IBS-response | Coordination |
| `third-party-risk-management` (shield sibling) | Third-party mapping | Coordination |
| pilot `crisis-scenario-planning` | Scenario library | Coordination |
| pilot `risk-committee-and-reporting` | Resilience reported to committee | Upstream |
| hazard `risk-monitoring-and-audit` | Tolerance breach monitoring | Coordination |
| warden + veil + bastion (Cybersecurity) | Cyber resilience + DORA technical | Cross-department |
| canopy `data-residency-mapping` + operator + counsel | DORA / BoE / FCA / BCBS jurisdiction compliance | Cross-department |
| beacon `investor-cadence` + `crisis-comms` | Material resilience event investor + crisis comms | Cross-department |
| Operator + regulator | Regulatory reporting | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Bank of England — Operational Resilience SS1/21 + PS6/21](https://www.bankofengland.co.uk/prudential-regulation/publication/2021/march/operational-resilience)
- [FCA — Building Operational Resilience PS21/3](https://www.fca.org.uk/publications/policy-statements/ps21-3-building-operational-resilience)
- [BCBS — Principles for Operational Resilience 2021](https://www.bis.org/bcbs/publ/d516.htm)
- [DORA — EU Regulation 2022/2554](https://eur-lex.europa.eu/eli/reg/2022/2554/oj)
- [ISO 22301:2019](https://www.iso.org/standard/75106.html)
