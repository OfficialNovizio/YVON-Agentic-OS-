<!--
Custom skill — COSO + ISO 31000 + Lam + insurance-industry practitioner.
§11 + §14.2. Route D per §8.2.
-->
---
name: risk-treatment-strategies
type: custom
status: built from scratch (§4.6 reclass)
sources_referenced:
  - "COSO ERM (2017) — Response strategies (avoid / accept / mitigate / share)."
  - "ISO 31000:2018 — Risk treatment framework."
  - "Lam, James (2014). Enterprise Risk Management (Wiley). §8.9 4th use."
  - "Insurance-industry practitioner corpus (Marsh + Aon + Willis Towers Watson)."
  - "Risk-transfer instruments practitioner corpus (captives + parametric + traditional insurance)."
fulfills_catalog_entry: risk-treatment-strategies (custom per §2 routing)
assigned_agent: hazard (Risk & ESG / Enterprise Risk)
portable: true
date_added: 2026-07-31
tier: 3
description: Risk treatment strategies — Mitigate / Transfer / Avoid / Accept framework + treatment prioritization + insurance-transfer coordination. LOAD-BEARING treatment-without-operator-and-counsel-signoff-for-material-risks refusal. Trigger on "risk treatment for [risk]", "risk mitigation plan", "insurance transfer for [risk]", "risk acceptance rationale", or "treatment prioritization".
triggers:
  - risk treatment for
  - risk mitigation plan
  - insurance transfer for
  - risk acceptance rationale
  - treatment prioritization
  - risk avoidance for
  - MATA framework
---

# Risk Treatment Strategies

## Introduction

Risk treatment discipline for hazard — COSO ERM + ISO 31000 + Lam + insurance
practitioner + risk-transfer instruments.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Material-risk treatment without operator + counsel sign-off.** Material
   risks (financial / legal / regulatory / reputational thresholds) require
   sign-off. LOAD-BEARING per Principle 1.
2. **Default-to-mitigate.** Every risk mitigated ignoring transfer / avoid /
   accept options = expensive + suboptimal.
3. **Insurance-transfer without policy review.** Insurance = risk transfer
   but requires policy-terms + coverage-limits + exclusions review.
4. **Accept-without-explicit-rationale.** Silent acceptance = drift.
5. **Treatment-without-monitoring.** Treatment implemented without ongoing
   monitoring (coordinate with `risk-monitoring-and-audit`).
6. **Individual crisis DURING treatment crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Risk treatment for [risk]" / "MATA framework"
- "Risk mitigation plan" / "risk avoidance for [category]"
- "Insurance transfer for [risk]" / "risk acceptance rationale"
- "Treatment prioritization"

Do NOT use for:
- Risk identification → `risk-identification-taxonomy` (hazard sibling)
- Risk assessment → `risk-assessment-quantification` (hazard sibling)
- Risk monitoring → `risk-monitoring-and-audit` (hazard sibling)
- Actual insurance procurement → operator + broker + counsel
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
MATA FRAMEWORK (Mitigate / Avoid / Transfer / Accept — COSO)

  MITIGATE — reduce probability or impact via controls
  AVOID — eliminate the activity generating the risk
  TRANSFER — shift risk to third party (insurance / contract / hedge)
  ACCEPT — retain risk (within appetite) with documented rationale


TREATMENT PRIORITIZATION (quantification-informed)

  Priority = f(residual risk after treatment, treatment cost, appetite gap)
  Higher-priority: high-impact risks with cost-effective treatments


INSURANCE-TRANSFER TYPES

  - Traditional insurance (P&C / D&O / cyber / E&O)
  - Captive insurance (self-insurance formalized)
  - Parametric insurance (payout on trigger, not loss verification)
  - Alternative Risk Transfer (ART)

  Coordination: operator + broker + counsel for policy structure.


MATERIAL-RISK SIGN-OFF (LOAD-BEARING)

  Material threshold criteria (per business):
    - Financial impact > X% revenue
    - Legal / regulatory exposure
    - Reputational risk (coordinate beacon crisis-comms)
    - Material NPI (coordinate beacon investor-cadence Reg FD)

  Treatment for material risks requires operator + counsel sign-off.


OPERATIONAL SEQUENCE:

  Phase 1: TREATMENT OPTION IDENTIFICATION (MATA)
  Phase 2: PRIORITIZATION (quantification-informed)
  Phase 3: LOAD-BEARING MATERIAL-RISK SIGN-OFF
  Phase 4: IMPLEMENTATION + HANDOFF TO MONITORING
```

## Instructions

### Phase 1 — Treatment option identification
For each risk: consider all MATA options + document rationale for chosen.

### Phase 2 — Prioritization
Cost-effectiveness + appetite-gap-closure informed by quantification from
`risk-assessment-quantification` sibling.

### Phase 3 — Material-risk sign-off (LOAD-BEARING)
Operator + counsel sign-off for material risks per criteria above.

### Phase 4 — Implementation + monitoring handoff
Implement + handoff to `risk-monitoring-and-audit` sibling.

## Output Format

- MATA options analysis per risk
- Treatment prioritization report
- Material-risk sign-off tracker
- Insurance-transfer coordination brief
- Implementation + monitoring handoff

## Principles

1. **Material-risk treatment requires operator + counsel sign-off** — LOAD-BEARING.
2. **All MATA options considered** — no mitigate-default.
3. **Insurance transfer requires policy review.**
4. **Accept-with-explicit-rationale** — no silent drift.
5. **Treatment monitored post-implementation.**
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Sign-off delayed** — treatment provisional with escalation flag.
- **Insurance-transfer policy issues** — coordinate operator + broker + counsel.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `risk-identification-taxonomy` (hazard sibling) | Identified risks | Upstream |
| `risk-assessment-quantification` (hazard sibling) | Quantification informs prioritization | Upstream |
| `risk-monitoring-and-audit` (hazard sibling) | Post-implementation monitoring | Downstream |
| pilot `risk-appetite-framework` | Treatment vs appetite | Coordination |
| shield 4 skills | BCP / DR / third-party as treatment | Coordination |
| beacon `crisis-comms` + `investor-cadence` | Material-risk comms | Cross-department |
| Operator + broker + counsel | Insurance + material sign-off | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [COSO ERM](https://www.coso.org/enterprise-risk-management)
- [ISO 31000:2018](https://www.iso.org/standard/65694.html)
- [Lam — ERM (Wiley)](https://www.wiley.com/en-us/Enterprise+Risk+Management-p-9781118413616)
- [Marsh McLennan](https://www.marshmclennan.com/)
- [Aon](https://www.aon.com/)
- [Willis Towers Watson](https://www.wtwco.com/)
