# Business Continuity Planning

## Introduction

Business continuity planning (BCP) for shield — ISO 22301 + ISO 22317
Business Impact Analysis + DRI International + practitioner.

Custom Route D per §8.2. §4.6 reclass.

## Sources

- ISO 22301:2019 — Security and resilience — Business continuity management
  systems (institutional standard).
- ISO 22317:2015 — Business impact analysis (institutional standard).
- ISO 22318:2015 — Supply chain continuity (institutional).
- DRI International — practitioner corpus + BCP certification (Certified
  Business Continuity Professional).
- BCI (Business Continuity Institute) — practitioner corpus + Good Practice
  Guidelines.

## Description

BCP framework — Business Impact Analysis (BIA) + continuity strategy +
plan design + exercise + maintenance. LOAD-BEARING BCP-without-tested-
exercise refusal.

## Triggers

business continuity plan for / BCP for [operation] / business impact analysis
for / BCP exercise for / recovery-time objective for / BCP maintenance /
continuity strategy for

## Purpose

Prevents six failure modes:

1. **BCP without tested exercise.** Untested BCPs fail at first real event.
   ISO 22301 clause 8.5 requires exercise. LOAD-BEARING per Principle 1.
2. **BIA absent.** Continuity strategy without Business Impact Analysis =
   guesswork on priorities.
3. **RTO/RPO not business-derived.** Recovery objectives assumed by IT
   without business input = wrong protection.
4. **Supply-chain continuity ignored** (ISO 22318). BCP scope limited to
   own operations misses third-party dependencies.
5. **BCP stale.** Not maintained as business changes.
6. **Individual crisis DURING BCP crunch.** HARD BOUNDARY.

## Structure

```
ISO 22301 PLAN-DO-CHECK-ACT

  PLAN — context + leadership + planning
    - BIA (ISO 22317)
    - Risk assessment (coordinate hazard)
    - Continuity strategy

  DO — implementation + operation
    - BCP documentation
    - Communications
    - Awareness + training (coordinate grove)

  CHECK — performance evaluation
    - Exercise (LOAD-BEARING)
    - Internal audit
    - Management review

  ACT — improvement
    - Corrective action from exercise + real events


BUSINESS IMPACT ANALYSIS (ISO 22317)

  Per process / product / service:
    - Impact over time if disrupted
    - Recovery Time Objective (RTO) — max acceptable downtime
    - Recovery Point Objective (RPO) — max acceptable data loss
    - Minimum Business Continuity Objective (MBCO)
    - Resource requirements for recovery
    - Dependencies (upstream + downstream)


CONTINUITY STRATEGY OPTIONS

  - Prevention (avoid disruption)
  - Preparation (redundancy + backup)
  - Response (activated when disruption occurs)
  - Recovery (return to normal operations)
  - Resumption (of full pre-disruption state)


EXERCISE TYPES (ISO 22301 clause 8.5)

  - Tabletop (discussion-based)
  - Walkthrough (step-by-step review)
  - Simulation (functional exercise)
  - Full-scale (real activation)

  Frequency: annual minimum; more frequent for high-priority processes.


OPERATIONAL SEQUENCE:

  Phase 1: BUSINESS IMPACT ANALYSIS (BIA)
  Phase 2: CONTINUITY STRATEGY DESIGN
  Phase 3: BCP DOCUMENTATION + AWARENESS
  Phase 4: LOAD-BEARING EXERCISE (annual minimum)
  Phase 5: MAINTENANCE + IMPROVEMENT
```

## Instructions

### Phase 1 — Business Impact Analysis
Per process / product / service: impact + RTO + RPO + MBCO + resources +
dependencies. Business-derived, not IT-assumed.

### Phase 2 — Continuity strategy design
Prevention / preparation / response / recovery / resumption options per
BIA priorities.

### Phase 3 — BCP documentation + awareness
Documented plans; awareness training coordinated with grove.

### Phase 4 — Exercise (LOAD-BEARING per ISO 22301)
Minimum annual; tabletop / walkthrough / simulation / full-scale mix per
priority. AAR + corrective action tracked.

### Phase 5 — Maintenance + improvement
Business-change triggers plan update; annual review minimum.

## Output Format

- BIA report per process
- Continuity strategy per priority
- BCP documentation
- Exercise schedule + AAR + corrective actions
- Maintenance schedule

## Principles

1. **Never BCP without tested exercise** — LOAD-BEARING per failure mode 1
   + ISO 22301 clause 8.5.
2. **BIA-derived RTO/RPO** — business, not IT-assumed.
3. **Supply-chain continuity** (ISO 22318) — coordinate with `third-party-
   risk-management` sibling.
4. **Annual maintenance minimum.**
5. **No fabrication** — cited sources. Universal Principle 1.
6. **Aggregate-only at publication surface** — Universal Principle 2.
7. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
8. **§0.6 flag.** Sources Tier B.

## Fallback

- **Exercise deferred pressure** — decline per Principle 1. Escalate to
  operator + pilot committee.
- **BIA data insufficient** — coordinate with process owners for BIA
  refresh; do NOT default RTO/RPO without business input.
- **Supply-chain dependency issue** — coordinate with `third-party-risk-
  management` sibling.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries

| Hands off to / from | For | Direction |
|---|---|---|
| `disaster-recovery-planning` (shield sibling) | IT DR is subset of BCP | Coordination |
| `third-party-risk-management` (shield sibling) | Supply-chain continuity | Coordination |
| `operational-resilience-testing` (shield sibling) | BCP exercise integrates with resilience testing | Coordination |
| pilot `crisis-scenario-planning` | Scenario planning informs BCP scenarios | Coordination |
| pilot `risk-committee-and-reporting` | BCP status reported to committee | Downstream |
| hazard `risk-treatment-strategies` | BCP as mitigation | Coordination |
| ops + dev (Engineering) | Operational execution | Cross-department |
| grove (P&C) | BCP awareness training | Cross-department |
| beacon `crisis-comms` (Comms & PR) | BCP activation comms | Cross-department |
| Operator + counsel | Regulatory BCP requirements | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [ISO 22301:2019](https://www.iso.org/standard/75106.html)
- [ISO 22317:2015 BIA](https://www.iso.org/standard/50054.html)
- [ISO 22318:2015 Supply Chain](https://www.iso.org/standard/65336.html)
- [DRI International](https://drii.org/)
- [BCI Good Practice Guidelines](https://www.thebci.org/)
