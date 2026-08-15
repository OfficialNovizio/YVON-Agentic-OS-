<!--
Custom skill — COSO + IIA + ISO 31000 + practitioner. §11 + §14.2. Route D per §8.2.
-->
---
name: risk-monitoring-and-audit
type: custom
status: built from scratch (§4.6 reclass)
sources_referenced:
  - "COSO Internal Control—Integrated Framework (2013) + COSO ERM (2017)."
  - "IIA — International Standards for the Professional Practice of Internal Auditing (institutional)."
  - "ISO 31000:2018 — Risk monitoring guidelines."
  - "Lam, James (2014). Enterprise Risk Management (Wiley). §8.9 5th use."
  - "IIA + AICPA — audit-trail integrity practitioner corpus."
fulfills_catalog_entry: risk-monitoring-and-audit (custom per §2 routing)
assigned_agent: hazard (Risk & ESG / Enterprise Risk)
portable: true
date_added: 2026-07-31
tier: 3
description: Risk monitoring + audit framework — KRI monitoring + control testing + audit-trail integrity + coordination with warden + precedent + sentinel (Governance). LOAD-BEARING audit-trail-deletion-edit refusal (inherited from grove pattern). Trigger on "risk monitoring for [risk]", "KRI monitoring dashboard", "control testing plan", "audit trail for [decision]", or "internal audit coordination".
triggers:
  - risk monitoring for
  - KRI monitoring dashboard
  - control testing plan
  - audit trail for
  - internal audit coordination
  - control effectiveness testing
---

# Risk Monitoring and Audit

## Introduction

Risk monitoring + audit discipline for hazard — COSO Internal Control + IIA
Standards + ISO 31000 + Lam + AICPA audit-trail practitioner.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Audit-trail deletion / edit.** Silent deletion / modification of audit
   records = compliance failure + fraud risk. LOAD-BEARING per Principle 1
   (inherited from grove `training-operations` audit-trail pattern).
2. **KRI monitoring gaps.** KRIs defined without ongoing monitoring = paper-
   compliance.
3. **Control-testing absent.** Controls assumed effective without testing =
   false assurance.
4. **Monitoring without escalation.** KRI breaches without escalation
   protocol = drift.
5. **Three-lines-model overlap** with internal audit.
6. **Individual crisis DURING monitoring-crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Risk monitoring for [risk]" / "KRI monitoring dashboard"
- "Control testing plan" / "control effectiveness testing"
- "Audit trail for [decision]" / "internal audit coordination"

Do NOT use for:
- Risk identification → `risk-identification-taxonomy` (hazard sibling)
- Risk assessment → `risk-assessment-quantification` (hazard sibling)
- Risk treatment → `risk-treatment-strategies` (hazard sibling)
- Internal audit execution → sentinel (Governance)
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
MONITORING COMPONENTS

  - KRI monitoring (from pilot `risk-committee-and-reporting` framework)
  - Control effectiveness testing (design + operating)
  - Incident tracking + root-cause
  - Trend analysis
  - Escalation triggers (per KRI threshold)


AUDIT TRAIL INTEGRITY (LOAD-BEARING)

  Every risk decision + treatment + monitoring event logged:
    - Immutable log (append-only)
    - Actor + timestamp + rationale
    - Never silent deletion / edit
    - Retention per operator + counsel + regulatory requirement


THREE-LINES MODEL COORDINATION (IIA)

  Line 1: Business owns controls
  Line 2: Risk function (hazard) monitors + tests
  Line 3: Internal audit (sentinel — Governance) provides independent assurance

  Coordination protocol: hazard shares monitoring results with sentinel;
  sentinel performs independent audit periodically.


OPERATIONAL SEQUENCE:

  Phase 1: MONITORING DESIGN + KRI THRESHOLDS
  Phase 2: CONTROL TESTING SCHEDULE
  Phase 3: LOAD-BEARING AUDIT-TRAIL INTEGRITY
  Phase 4: THREE-LINES COORDINATION WITH SENTINEL
  Phase 5: ESCALATION PROTOCOL EXECUTION
```

## Instructions

### Phase 1 — Monitoring design + KRI thresholds
Per KRI: threshold + monitoring frequency + escalation trigger.

### Phase 2 — Control testing schedule
Design + operating effectiveness testing per control-frequency schedule.

### Phase 3 — Audit-trail integrity (LOAD-BEARING)
Immutable append-only log for all risk decisions. **Never deletion / edit.**

### Phase 4 — Three-lines coordination
Share monitoring with sentinel (Governance); sentinel provides independent
audit.

### Phase 5 — Escalation protocol execution
Per KRI breach: escalation to hazard leadership + pilot committee.

## Output Format

- Monitoring design per KRI
- Control testing schedule + results
- Audit-trail integrity policy
- Three-lines coordination brief with sentinel
- Escalation protocol + tracker

## Principles

1. **Audit-trail deletion / edit NEVER acceptable** — LOAD-BEARING per failure mode 1.
2. **KRI monitoring continuous.**
3. **Control testing scheduled.**
4. **Escalation protocol enforced.**
5. **Three-lines coordination with sentinel.**
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Audit-trail integrity issue** — immediate escalation to sentinel + operator + counsel.
- **KRI breach detected** — execute escalation protocol.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `risk-identification-taxonomy` + `risk-assessment-quantification` + `risk-treatment-strategies` (hazard siblings) | Data source | Upstream |
| pilot `risk-committee-and-reporting` | KRI framework | Upstream |
| pilot `risk-appetite-framework` | Breach = appetite exceedance | Coordination |
| sentinel (Governance internal audit) | Three-lines coordination | Cross-department (LOAD-BEARING coordination) |
| warden (Cybersecurity GRC) | Overlap on GRC framework | Coordination |
| precedent (Governance) | Prior-decision precedent | Coordination |
| board + operator | Escalation | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [COSO Internal Control 2013 + ERM 2017](https://www.coso.org/)
- [IIA Standards](https://www.theiia.org/en/standards/)
- [ISO 31000:2018](https://www.iso.org/standard/65694.html)
- [Lam — ERM (Wiley)](https://www.wiley.com/en-us/Enterprise+Risk+Management-p-9781118413616)
- [AICPA](https://us.aicpa.org/)
