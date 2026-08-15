# Disaster Recovery Planning

## Introduction

Disaster recovery planning (DR) for shield — NIST 800-34 + ISO 27031 +
SNIA + AWS/Azure/GCP DR practitioner.

Custom Route D per §8.2. §4.6 reclass.

## Sources

- NIST SP 800-34 Rev 1 — Contingency Planning Guide for Federal Information
  Systems. Institutional (FREE at nist.gov).
- ISO/IEC 27031:2011 — ICT readiness for business continuity. Institutional.
- SNIA (Storage Networking Industry Association) — DR practitioner corpus.
- AWS + Azure + GCP DR reference architectures (institutional practitioner).
- Uptime Institute — data-center tier standards.

## Description

DR planning — RTO/RPO business-derived + DR strategy (backup / warm / hot /
active-active) + runbook + testing. LOAD-BEARING DR-without-RTO/RPO-cited-
from-business-requirements refusal.

## Triggers

disaster recovery plan for / DR for [system] / RTO RPO for [system] /
DR runbook / DR testing for / failover design for / DR strategy for

## Purpose

Prevents six failure modes:

1. **DR without RTO/RPO cited from business requirements.** IT-assumed
   RTO/RPO = wrong protection level (over- or under-provisioned).
   LOAD-BEARING per Principle 1 — coordinate with `business-continuity-
   planning` sibling for BIA.
2. **DR without testing.** Untested DR fails at first real event.
3. **Backup ≠ DR.** Backups without recovery-plan documentation + testing
   are not DR.
4. **Single-region single-provider assumption.** Concentration risk.
5. **Runbook stale.** Not updated as systems change.
6. **Individual crisis DURING DR crunch.** HARD BOUNDARY.

## Structure

```
DR STRATEGY TIERS (Uptime Institute + practitioner)

  BACKUP + RESTORE — periodic backup, restore on demand
    - Lowest cost; longest RTO (hours-days)
  PILOT LIGHT — minimum systems running, scale on activation
    - Moderate cost; moderate RTO (hours)
  WARM STANDBY — reduced-capacity running environment
    - Higher cost; shorter RTO (minutes-hour)
  HOT STANDBY / ACTIVE-ACTIVE — full duplicate always running
    - Highest cost; shortest RTO (seconds-minutes)


RTO / RPO DEFINITIONS

  RTO (Recovery Time Objective) — max acceptable downtime after disruption
  RPO (Recovery Point Objective) — max acceptable data loss
  MTPD (Maximum Tolerable Period of Disruption) — absolute ceiling


NIST 800-34 CONTINGENCY PLAN COMPONENTS

  - Contingency Planning Policy Statement
  - Business Impact Analysis (BIA — coordinate BCP sibling)
  - Preventive Controls
  - Contingency Strategies
  - Information System Contingency Plan (ISCP)
  - Plan Testing, Training, and Exercises
  - Plan Maintenance


OPERATIONAL SEQUENCE:

  Phase 1: LOAD-BEARING BUSINESS-DERIVED RTO/RPO
  Phase 2: DR STRATEGY SELECTION per RTO/RPO + cost
  Phase 3: RUNBOOK + FAILOVER DESIGN
  Phase 4: TESTING (LOAD-BEARING per NIST 800-34)
  Phase 5: MAINTENANCE (system-change triggers update)
```

## Instructions

### Phase 1 — Business-derived RTO/RPO (LOAD-BEARING)
Coordinate with `business-continuity-planning` sibling for BIA. **RTO/RPO
per business input, not IT-assumed.**

### Phase 2 — DR strategy selection
Match strategy tier (backup / warm / hot / active-active) to RTO/RPO + cost
+ regulatory requirements.

### Phase 3 — Runbook + failover design
Documented runbook per system; failover procedures; roles + responsibilities.

### Phase 4 — Testing (LOAD-BEARING)
Per NIST 800-34: minimum annual; tabletop + functional + full-scale.
Coordinate with `business-continuity-planning` sibling exercise schedule.

### Phase 5 — Maintenance
System-change triggers runbook update; quarterly review minimum.

## Output Format

- RTO/RPO per system with business sign-off
- DR strategy selection matrix per system
- Runbook + failover procedures
- Testing schedule + results
- Maintenance schedule

## Principles

1. **Never DR without RTO/RPO cited from business requirements** — LOAD-
   BEARING per failure mode 1.
2. **DR tested per NIST 800-34.**
3. **Backup ≠ DR** — distinct discipline.
4. **Concentration-risk assessed** — single-region / single-provider risks
   identified.
5. **Runbook maintained** with system changes.
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **RTO/RPO business input unavailable** — coordinate BCP sibling for BIA;
  do NOT default without business sign-off.
- **Testing deferred pressure** — decline per Principle 2. Escalate.
- **Concentration risk detected** — escalate to operator + pilot committee
  for diversification decision.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries

| Hands off to / from | For | Direction |
|---|---|---|
| `business-continuity-planning` (shield sibling) | BIA drives RTO/RPO | Upstream (LOAD-BEARING) |
| `third-party-risk-management` (shield sibling) | Cloud + vendor DR coordination | Coordination |
| `operational-resilience-testing` (shield sibling) | DR testing integrates with resilience testing | Coordination |
| pilot `crisis-scenario-planning` | DR scenarios | Coordination |
| ops + dev + bastion + veil (Engineering + Cybersecurity) | DR technical execution | Cross-department |
| dana (Engineering) | Data recovery coordination | Cross-department |
| Operator + counsel | Regulatory DR requirements (finance / healthcare) | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [NIST SP 800-34 Rev 1 (FREE)](https://csrc.nist.gov/publications/detail/sp/800-34/rev-1/final)
- [ISO/IEC 27031:2011](https://www.iso.org/standard/44374.html)
- [SNIA](https://www.snia.org/)
- [AWS Disaster Recovery](https://aws.amazon.com/disaster-recovery/)
- [Azure Site Recovery](https://azure.microsoft.com/en-us/products/site-recovery/)
- [Uptime Institute Tier Standard](https://uptimeinstitute.com/tiers)
