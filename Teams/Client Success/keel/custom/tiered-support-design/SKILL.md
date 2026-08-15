<!--
Custom skill — synthesized from Zendesk + Salesforce + Intercom institutional +
Mehta 2016 + ITIL Service Management. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Mehta 2016 13th use across Client Success.
-->
---
name: tiered-support-design
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Zendesk — Customer Service benchmark reports + tiered-support framework (institutional practitioner). zendesk.com."
  - "Salesforce Service Cloud — customer service architecture materials (institutional practitioner). salesforce.com."
  - "Intercom — modern support-ops practitioner corpus. intercom.com."
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 13th use across Client Success. Support-tier framing."
  - "ITIL Service Management — Service Support foundational framework (institutional standard). itil.co.uk."
fulfills_catalog_entry: tiered-support-design (custom per §2 routing)
assigned_agent: keel (Client Success / Support Ops)
portable: true
date_added: 2026-07-31
tier: 3
description: Tiered support architecture design — T1 / T2 / T3 escalation + routing rules + team-role definitions + capacity planning. Zendesk / Salesforce / Intercom / Mehta + ITIL. Trigger on "tiered support design for [org]", "T1/T2/T3 escalation for [product]", "support-team architecture", "escalation routing rules", "support capacity planning for [tier]", or "specialist team design for [product complexity]".
triggers:
  - tiered support design for
  - T1 T2 T3 escalation for
  - support-team architecture
  - escalation routing rules
  - support capacity planning for
  - specialist team design for
  - support tier design
---

# Tiered Support Design

## Introduction

Tiered support architecture design for keel — T1 / T2 / T3 escalation +
routing rules + team-role definitions + capacity planning. Zendesk +
Salesforce + Intercom practitioner corpus + Mehta 2016 CS-integrated
support framing + ITIL Service Management foundational framework.

**Scope distinction:** keel OWNS support ops DESIGN. Actual support delivery
= support agents + operator. Distinct from `sla-and-escalation-management`
(sibling — SLA specifics), `support-analytics` (sibling — CSAT/NPS/CES
measurement), `knowledge-base-and-self-service` (sibling — KB).

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Flat support (no tiering).** All-tickets-to-generalist = expensive +
   slow complex-issue resolution + T1-agent burnout on complex issues.
2. **Wrong-tier routing.** T1 issues to T3 = wasted specialist time; T3
   issues stuck at T1 = customer frustration + slow resolution.
3. **Unclear tier definitions.** "Complex enough for T2" without objective
   criteria = inconsistent routing.
4. **Capacity mismatch per tier.** Under-staffed T1 = long queue times;
   under-staffed T2/T3 = escalation backlog. Capacity per tier requires
   ticket-volume-per-tier data + staffing model.
5. **No connection to CS motion.** Support-only-design ignores CS
   coordination (ally health-scoring input from support signals + retain
   churn signals + kickoff support-team-introduction).
6. **Individual crisis DURING support-crunch.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Tiered support design for [org]" / "T1 T2 T3 escalation for [product]"
- "Support-team architecture" / "escalation routing rules"
- "Support capacity planning for [tier]" / "specialist team design for [product complexity]"
- "Support tier design"

Do NOT use for:
- SLA specifics → `sla-and-escalation-management` (sibling)
- Metrics measurement → `support-analytics` (sibling)
- Knowledge base → `knowledge-base-and-self-service` (sibling)
- Actual support delivery → support agents + operator
- Support-platform selection → operator + IT (with keel coordination)
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
CANONICAL TIER DEFINITIONS (Zendesk + Salesforce + Intercom)

  T1 — FIRST-LINE / GENERALIST
    - Handle common issues + known solutions (KB-driven)
    - Route unclear cases to T2
    - Typical resolution: minutes to hours
    - Skills: product basics + strong customer-communication
    - Volume: highest ticket volume

  T2 — INTERMEDIATE / SPECIALIST
    - Handle complex product issues + integrations + edge cases
    - Escalate to T3 or engineering for bugs / product-limits
    - Typical resolution: hours to days
    - Skills: deep product knowledge + technical debugging
    - Volume: 15-30% of T1 volume typical

  T3 — SENIOR / ENGINEERING-ADJACENT
    - Handle deepest issues + product bugs + urgent incidents
    - Coordinate with engineering for product fixes
    - Typical resolution: hours to weeks (depending on complexity)
    - Skills: engineering background + product-code familiarity
    - Volume: 5-15% of T1 volume typical


ROUTING RULES

  Tier-appropriate assignment:
    - T1 default queue for new tickets
    - T2 escalation triggered by KB-gap OR complexity threshold OR customer
      complaint OR T1-agent flag
    - T3 escalation triggered by bug-suspected OR urgent-incident OR T2-agent
      flag OR customer-executive-escalation

  Priority + tier interaction:
    - P0 (outage) → T3 immediately, regardless of complexity
    - P1 (major impact) → T2 minimum
    - P2/P3 → T1 default, escalate on complexity


ITIL SERVICE SUPPORT FRAMEWORK (foundational)

  Service Desk (T1) → Incident Management → Problem Management → Change
  Management → Release Management

  Support tier design aligns with ITIL: T1 handles Incidents; T2/T3 handle
  Problems + coordinate Change/Release with product/engineering.


TIERED-SUPPORT OPERATIONAL SEQUENCE:

  Phase 1: TIER DEFINITIONS + CRITERIA                (per org / product complexity)
  Phase 2: ROUTING RULES                                (tier + priority interaction)
  Phase 3: TEAM ROLE + CAPACITY DESIGN                 (skills + staffing per tier)
  Phase 4: CS-COORDINATION INTEGRATION                  (health-signal + churn-signal + onboarding intros)
```

## Instructions

### Phase 1 — Tier definitions + criteria

Adapt canonical T1/T2/T3 per org's:
- Product complexity
- Customer base tier mix (tech-touch / high-touch / enterprise)
- Volume expectations
- Explicit objective criteria for tier assignment (not subjective)

### Phase 2 — Routing rules

Design routing per:
- Tier + priority interaction (P0 always T3; complex tickets escalate)
- Customer-tier consideration (enterprise customers may get accelerated
  routing)
- Escalation triggers (KB-gap / complexity / customer complaint / agent flag)

### Phase 3 — Team role + capacity design

Per tier:
- Skills profile (product + technical + communication)
- Hiring guidance (coordinate with hire)
- Staffing model (agents per ticket volume + shift coverage)
- Career-path from T1 → T2 → T3 (coordinate with grove / merit — P&C)

### Phase 4 — CS-coordination integration

- Support-signal feeds ally `customer-health-scoring` support dimension
- Support escalation feeds retain `churn-risk-prediction` signal
- Onboarding-stage support-team introduction coordinated with kickoff
  `onboarding-journey-design` Phase 4
- Enterprise-tier dedicated support coordination

## Output Format

- Tier-definition memo per org / product
- Routing-rules matrix (tier × priority × customer-tier)
- Team-role + capacity model per tier
- Career-path guidance for support team (coordinate with grove + merit)
- CS-coordination integration brief (ally / retain / kickoff)

## Principles

1. **Tiered support design mandatory** — no flat all-generalist model at
   scale.
2. **Explicit objective tier criteria** — no subjective routing.
3. **Priority + tier interaction** — P0 always T3; not just complexity-based.
4. **Capacity design data-driven** — ticket-volume-per-tier + staffing model.
5. **CS-coordination integration** — support signals feed ally + retain +
   kickoff.
6. **Career-path across tiers** — coordinate with grove + merit for T1→T2→T3
   growth.
7. **No fabrication** — cited institutional + practitioner sources. Universal
   Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   support-agent performance data NEVER surfaced externally without
   employee-level agreement + HR coordination.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Product-complexity insufficient for 3-tier model** (small product /
  small support volume). Consider 2-tier T1/T2 or T1-only with engineering-
  escalation.
- **Enterprise-tier customer requires dedicated support**. Coordinate with
  ally + operator for named-CSM + named-support-engineer assignment.
- **Support-tool platform selection** required. Route to operator + IT +
  ally `cs-tech-stack-selection` for platform decision.
- **Support-team staffing constrained** — escalate to CSM leadership +
  operator; may require phased hiring or contractor coverage.
- **Individual crisis signal during support-design conversation.** STOP.
  Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `sla-and-escalation-management` (custom, keel — sibling) | SLA specifics per tier | Coordination |
| `support-analytics` (custom, keel — sibling) | Tier-specific metrics | Coordination |
| `knowledge-base-and-self-service` (custom, keel — sibling) | KB drives T1 resolution | Coordination |
| `customer-health-scoring` (custom, ally — Lead) | Support-signal feeds health-score | Downstream |
| `churn-risk-prediction` (custom, retain — sibling agent) | Support escalation feeds churn signal | Downstream |
| `onboarding-journey-design` (custom, kickoff — sibling agent) | Support-team introduction during onboarding | Coordination |
| `cs-tech-stack-selection` (custom, ally — Lead) | Support-platform decision coordination | Coordination |
| grove + merit (P&C) | Support-team career-path (T1 → T2 → T3) | Cross-department |
| hire (P&C Lead) | Support-team hiring | Cross-department |
| Product / dev / engineering | T3 coordination with engineering for bugs / product fixes | Cross-department |
| Operator + IT | Support-platform selection + capacity decisions | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Zendesk — Customer Service benchmarks](https://www.zendesk.com/customer-service/)
- [Salesforce Service Cloud](https://www.salesforce.com/products/service-cloud/)
- [Intercom — Support operations](https://www.intercom.com/)
- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
- [ITIL Foundation Framework](https://www.axelos.com/certifications/itil-service-management)
