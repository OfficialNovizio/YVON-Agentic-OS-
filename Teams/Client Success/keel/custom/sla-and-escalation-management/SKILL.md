<!--
Custom skill — synthesized from ITIL + Zendesk + Salesforce practitioner. §11 + §14.2.
Route D per §8.2.
-->
---
name: sla-and-escalation-management
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "ITIL Service Level Management — foundational framework (institutional standard). itil.co.uk."
  - "Zendesk — SLA benchmark research + practitioner materials. zendesk.com."
  - "Salesforce Service Cloud — SLA design materials (institutional practitioner). salesforce.com."
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 14th use."
  - "PagerDuty — Incident Management + escalation practitioner. pagerduty.com."
fulfills_catalog_entry: sla-and-escalation-management (custom per §2 routing)
assigned_agent: keel (Client Success / Support Ops)
portable: true
date_added: 2026-07-31
tier: 3
description: SLA design + escalation management — ITIL Service Level Management + practitioner SLA design. SLA definition per tier + severity + capacity-adjusted commitment + breach handling + root-cause + post-mortem. LOAD-BEARING SLA-without-capacity-check refusal. Trigger on "SLA design for [customer tier]", "SLA definition for [severity]", "SLA breach for [ticket]", "escalation matrix for [tier + severity]", or "SLA capacity check for [team]".
triggers:
  - SLA design for
  - SLA definition for
  - SLA breach for
  - escalation matrix for
  - SLA capacity check for
  - service level objective for
  - SLA reporting for
---

# SLA and Escalation Management

## Introduction

SLA design + escalation management for keel — ITIL Service Level Management
foundational framework + Zendesk / Salesforce / PagerDuty practitioner corpus
+ Mehta 2016 CS-integrated support framing.

**Scope distinction:** keel OWNS SLA design + escalation-matrix design +
breach post-mortem discipline. Actual SLA execution + breach response =
support agents + operator.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **SLA commitment without capacity-check.** Over-promising SLA (e.g., "24/7
   1-hour response") without headcount + coverage capacity = predictable
   breach + customer trust damage. LOAD-BEARING per Principle 1.
2. **Undifferentiated SLA per tier/severity.** Same SLA for P0-outage and
   P3-question = wrong resource allocation.
3. **Escalation matrix unclear.** Ambiguous "when to escalate" = inconsistent
   agent decisions.
4. **Breach without post-mortem.** SLA breaches without root-cause + corrective
   action = recurring breaches.
5. **SLA-only reporting without SLO context.** SLA (external commercial
   commitment) vs SLO (internal target) distinction matters for
   management + capacity planning.
6. **Individual crisis DURING breach crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "SLA design for [customer tier]" / "SLA definition for [severity]"
- "SLA breach for [ticket]" / "escalation matrix for [tier + severity]"
- "SLA capacity check for [team]" / "service level objective for [operation]"
- "SLA reporting for [period]"

Do NOT use for:
- Tiered support architecture → `tiered-support-design` (sibling)
- CSAT/NPS/CES metrics → `support-analytics` (sibling)
- Knowledge base → `knowledge-base-and-self-service` (sibling)
- Actual SLA execution → support agents + operator
- Product-side reliability (SRE) → dev / ops (Engineering)
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
ITIL SLM FRAMEWORK

  SLA (Service Level Agreement) — external commercial commitment
  SLO (Service Level Objective) — internal target (typically stricter than SLA)
  SLI (Service Level Indicator) — measurement metric

  Design principle: SLO stricter than SLA to provide safety margin.


SLA DIMENSIONS PER TIER + SEVERITY

  Typical framework:
    Customer tier × Severity × SLA-metric

    Response time — time from ticket-open to first-response
    Resolution time — time from ticket-open to resolution
    Availability — uptime commitment
    Data-response — for privacy / security requests per applicable regulation

  Severity levels (typical):
    P0 — outage / critical impact affecting business operations
    P1 — major functionality broken affecting many users
    P2 — significant issue affecting some users
    P3 — question / minor issue / feature request

  Customer tier × severity matrix determines specific SLA.


CAPACITY-CHECK DISCIPLINE (LOAD-BEARING)

  Before committing SLA to customer:
    - Ticket volume forecast (per tier + severity)
    - Team capacity (headcount + shift coverage + skill mix)
    - Buffer for spikes (typically 20-40%)
    - Coordination with tiered-support-design capacity model

  SLA commitment WITHOUT capacity-check = LOAD-BEARING violation.


ESCALATION MATRIX

  Time-based escalation (SLA-clock-driven):
    - X% of SLA elapsed → automatic alert to team lead
    - Y% of SLA elapsed → escalation to management
    - SLA breach → escalation to operator + potentially customer executive

  Severity-based escalation (independent of clock):
    - P0 → immediate escalation to operator + potentially exec-team
    - P1 → escalation to management within N hours
    - Customer executive escalation → route to operator + retain (customer-relationship risk)


SLA OPERATIONAL SEQUENCE:

  Phase 1: SLA DEFINITION PER TIER + SEVERITY           (customer × severity × metric)
  Phase 2: CAPACITY-CHECK DISCIPLINE (LOAD-BEARING)      (forecast + team capacity + buffer)
  Phase 3: ESCALATION MATRIX DESIGN                       (time-based + severity-based)
  Phase 4: BREACH HANDLING + ROOT-CAUSE + POST-MORTEM    (recurring-breach prevention)
```

## Instructions

### Phase 1 — SLA definition per tier + severity

- Customer tier × severity matrix
- Metrics per cell (response / resolution / availability / data-response)
- SLO (internal) stricter than SLA (external)

### Phase 2 — Capacity-check discipline (LOAD-BEARING)

**No SLA commitment without capacity check.**
- Ticket volume forecast
- Team capacity (from `tiered-support-design` sibling)
- Buffer (20-40% for spikes)
- Sign-off from CSM leadership + operator

### Phase 3 — Escalation matrix design

- Time-based (X% / Y% of SLA elapsed triggers)
- Severity-based (P0 immediate; P1 within N hours)
- Customer-executive-escalation routing (operator + retain coordination)

### Phase 4 — Breach handling + root-cause + post-mortem

- Every breach → root-cause analysis
- Post-mortem for pattern breaches
- Corrective action + feedback loop to SLA design (may require SLA
  adjustment OR capacity increase OR process change)

## Output Format

- SLA matrix per tier × severity × metric
- Capacity-check report per SLA commitment
- Escalation matrix design
- Breach post-mortem template + tracker
- SLA + SLO reporting cadence

## Principles

1. **Never SLA commitment without capacity-check** — LOAD-BEARING per Purpose
   failure mode 1.
2. **SLA per tier × severity** — not undifferentiated.
3. **SLO stricter than SLA** — internal safety margin.
4. **Escalation matrix explicit** — time-based + severity-based clear.
5. **Every breach → root-cause + post-mortem** — recurring-breach prevention.
6. **Distinguish SLA / SLO / SLI** — ITIL discipline.
7. **No fabrication** — cited institutional + practitioner sources. Universal
   Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   agent SLA-adherence data handled per HR discipline.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **SLA commitment pressure without capacity** — decline per Principle 1.
  Escalate to operator + CSM leadership for capacity resolution OR SLA
  adjustment.
- **Recurring breach pattern** — escalate to CSM leadership + operator +
  potentially product/engineering for underlying issue.
- **Enterprise-tier custom SLA request** — coordinate with operator + counsel
  + `tiered-support-design` for capacity + `renewal-negotiation` for commercial
  context.
- **Customer executive escalation** — coordinate with retain +  operator +
  potentially beacon `crisis-comms` if reputation-adjacent.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `tiered-support-design` (custom, keel — sibling) | Capacity model input | Upstream |
| `support-analytics` (custom, keel — sibling) | SLA-adherence measurement | Coordination |
| `knowledge-base-and-self-service` (custom, keel — sibling) | KB reduces ticket volume + supports SLA | Coordination |
| `churn-risk-prediction` (custom, retain — sibling agent) | Recurring breach patterns feed churn signal | Downstream |
| `renewal-negotiation` (custom, retain — sibling agent) | Enterprise custom SLA at renewal | Coordination |
| `crisis-comms` (custom, beacon — Comms & PR) | Reputation-adjacent SLA breach | Escalation |
| dev / ops (Engineering) | Product-side reliability (SRE / SLO / SLI) | Cross-department |
| Operator + CSM leadership | Capacity + custom SLA decisions | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [ITIL Service Management](https://www.axelos.com/certifications/itil-service-management)
- [Zendesk — Support benchmarks](https://www.zendesk.com/)
- [Salesforce Service Cloud](https://www.salesforce.com/products/service-cloud/)
- [PagerDuty — Incident Management](https://www.pagerduty.com/)
- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
