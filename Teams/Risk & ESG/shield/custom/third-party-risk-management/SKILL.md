# Third-Party Risk Management

## Introduction

Third-party risk management (TPRM) for shield — SIG (Shared Assessments
Standardized Information Gathering) + ISO 27036 + NIST 800-161 + OCC
2013-29 + practitioner.

Custom Route D per §8.2. §4.6 reclass.

## Sources

- SIG (Standardized Information Gathering) Questionnaire — Shared
  Assessments Program industry standard.
- ISO/IEC 27036 series — Information security for supplier relationships.
- NIST SP 800-161 — Supply Chain Risk Management (institutional, FREE).
- OCC Bulletin 2013-29 + subsequent guidance — bank third-party risk
  regulation (institutional).
- Bird & Bird + Baker McKenzie — data-processing agreement practitioner
  (§8.9 with canopy).

## Description

TPRM framework — vendor tiering + due diligence + contract terms + ongoing
monitoring + exit management. LOAD-BEARING third-party-engagement-without-
security-and-compliance-review refusal.

## Triggers

third-party risk assessment for / vendor due diligence for / TPRM framework /
SIG questionnaire for / vendor tiering / supplier risk assessment /
data-processing agreement for [vendor]

## Purpose

Prevents seven failure modes:

1. **Third-party engagement without security + compliance review.** Vendors
   inherit our data / process / regulatory obligations. LOAD-BEARING per
   Principle 1.
2. **Undifferentiated vendor tiering.** Same DD for critical + non-critical
   vendors = wasted or insufficient effort.
3. **Contract terms without appropriate risk allocation** — insurance +
   indemnification + audit rights + data-protection terms.
4. **Ongoing monitoring absent.** DD at onboarding without ongoing
   monitoring = point-in-time assurance only.
5. **Fourth-party risk ignored.** Vendors have their own vendors (Nth-party).
6. **Exit management undefined.** Vendor exit without data return +
   destruction + service continuity = future disruption.
7. **Individual crisis DURING vendor crunch.** HARD BOUNDARY.

## Structure

```
VENDOR TIERING (SIG + OCC + practitioner)

  CRITICAL — material impact if failed (revenue / customer / regulatory)
    - Enhanced due diligence
    - Onsite assessment for higher-risk
    - Continuous monitoring
    - Business continuity + exit plans mandatory

  HIGH — significant impact
    - Standard SIG questionnaire
    - Annual reassessment
    - Contract review

  MEDIUM — moderate impact
    - Streamlined SIG (SIG Lite)
    - Biennial reassessment

  LOW — minimal impact
    - Basic assessment
    - Vendor self-attestation


DUE DILIGENCE DOMAINS (SIG framework)

  - Information security
  - Data protection (coordinate canopy data-residency + counsel)
  - Business continuity (coordinate BCP sibling)
  - Financial stability
  - Regulatory compliance
  - Reputation + ethics
  - Insurance coverage
  - Fourth-party risk


CONTRACT TERMS (LOAD-BEARING counsel-scoped)

  - Data-processing agreement (GDPR Article 28 + equivalents)
  - Right to audit
  - Security requirements + attestations (SOC 2 / ISO 27001)
  - Incident notification timelines
  - Insurance requirements + indemnification
  - Termination rights + exit provisions
  - Data return + destruction on termination


ONGOING MONITORING

  - Continuous monitoring tools (BitSight / SecurityScorecard / RiskRecon)
  - Annual reassessment
  - Certification-renewal tracking (SOC 2 / ISO 27001 expiration)
  - Incident + breach notification
  - Financial-health monitoring


OPERATIONAL SEQUENCE:

  Phase 1: VENDOR TIERING
  Phase 2: DUE DILIGENCE per tier
  Phase 3: LOAD-BEARING SECURITY + COMPLIANCE REVIEW + CONTRACT TERMS
  Phase 4: ONGOING MONITORING
  Phase 5: EXIT MANAGEMENT
```

## Instructions

### Phase 1 — Vendor tiering
Per business need + regulatory context.

### Phase 2 — Due diligence per tier
SIG or SIG Lite per tier; domain coverage.

### Phase 3 — Security + compliance review + contract terms (LOAD-BEARING)
Coordinate with:
- **warden + veil + bastion** (Cybersecurity) for security review
- **canopy `data-residency-mapping`** + counsel for data-processing agreement
- **operator + counsel** for contract terms

**No third-party engagement without security + compliance review.**

### Phase 4 — Ongoing monitoring
Continuous monitoring + annual reassessment + certification tracking.

### Phase 5 — Exit management
Data return + destruction protocol; service continuity plan.

## Output Format

- Vendor tiering matrix
- Due diligence per tier
- Contract-term brief for counsel
- Ongoing monitoring framework
- Exit management protocol

## Principles

1. **Never third-party engagement without security + compliance review** —
   LOAD-BEARING per failure mode 1.
2. **Vendor tiering differentiates DD effort.**
3. **Contract terms counsel-scoped** — data-processing + audit rights +
   insurance + exit.
4. **Ongoing monitoring** post-engagement.
5. **Fourth-party risk assessed** for critical vendors.
6. **Exit management defined at onboarding.**
7. **No fabrication** — cited sources. Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Vendor-
   specific due-diligence details stay in vendor-management tools.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Vendor onboarding pressure without security + compliance review** —
  decline per Principle 1. Escalate to operator + counsel + warden.
- **Critical vendor certification expired** — escalate for renewal or
  vendor-switch decision.
- **Fourth-party issue** — coordinate with vendor for remediation or
  vendor-switch.
- **Vendor incident** — activate contract-notified incident response.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries

| Hands off to / from | For | Direction |
|---|---|---|
| `business-continuity-planning` (shield sibling) | Supply-chain continuity | Coordination |
| `disaster-recovery-planning` (shield sibling) | Cloud + vendor DR coordination | Coordination |
| `operational-resilience-testing` (shield sibling) | Vendor testing integrates with resilience testing | Coordination |
| warden + veil + bastion (Cybersecurity) | Security review + technical assessment | Cross-department (LOAD-BEARING) |
| canopy `data-residency-mapping` | Data-processing agreement + jurisdiction compliance | Cross-department |
| hazard `risk-treatment-strategies` | Vendor as risk-treatment (transfer) | Coordination |
| pilot `risk-committee-and-reporting` | Vendor risk reported to committee | Upstream |
| operator + procurement + counsel | Contract execution | Escalation |
| bond `partner-selection-and-tiering` (Growth & Partnerships) | Partner-vendor overlap | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [SIG Shared Assessments](https://sharedassessments.org/)
- [ISO/IEC 27036](https://www.iso.org/standard/59648.html)
- [NIST SP 800-161 (FREE)](https://csrc.nist.gov/publications/detail/sp/800-161/final)
- [OCC Bulletin 2013-29](https://www.occ.treas.gov/news-issuances/bulletins/2013/bulletin-2013-29.html)
- [BitSight](https://www.bitsight.com/)
- [SecurityScorecard](https://securityscorecard.com/)
