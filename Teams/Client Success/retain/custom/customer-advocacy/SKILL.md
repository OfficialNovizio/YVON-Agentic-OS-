<!--
Custom skill — synthesized from Mehta 2016 + Bill Lee 2012 + IDC/Forrester
advocacy institutional + Influitive practitioner. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Mehta 2016 12th use across Client Success.
-->
---
name: customer-advocacy
type: custom
status: built from scratch
sources_referenced:
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 12th use across Client Success. Advocacy stage of lifecycle."
  - "Lee, Bill (2012). The Hidden Wealth of Customers: Realizing the Untapped Value of Your Most Important Asset. Harvard Business Review Press. ISBN 978-1422183168. Named practitioner. Advocacy-program design."
  - "IDC — Customer Advocacy institutional benchmark research."
  - "Forrester — Customer Reference Program benchmark research (institutional)."
  - "Influitive — practitioner materials on advocacy program design (institutional practitioner). influitive.com."
  - "Gainsight — Advocacy program materials (institutional practitioner)."
fulfills_catalog_entry: customer-advocacy (custom per §2 routing)
assigned_agent: retain (Client Success / Success/Retention/Expansion)
portable: true
date_added: 2026-07-31
tier: 3
description: Customer-advocacy framework — reference-selling + case-study + community + user-conference programs. LOAD-BEARING customer opt-in + sign-off protocol (Universal Principle 2 aggregate-only HARD BOUNDARY at execution surface). Cross-department reference-serving for herald press + beacon investor + sales. Trigger on "customer reference for [use case]", "case study for [customer]", "customer advocacy program for [segment]", "reference program design", "customer community for [product]", "user conference planning", or "advocacy opt-in for [customer]".
triggers:
  - customer reference for
  - case study for
  - customer advocacy program for
  - reference program design
  - customer community for
  - user conference planning
  - advocacy opt-in for
  - reference call for
---

# Customer Advocacy

## Introduction

Customer-advocacy discipline for retain — reference-selling + case-study +
community + user-conference programs. Mehta 2016 lifecycle-advocacy-stage
framing + Bill Lee 2012 practitioner + IDC / Forrester institutional
benchmarks + Influitive + Gainsight practitioner corpus.

**Scope distinction:** retain OWNS advocacy program design + customer opt-in +
sign-off protocol. Herald / beacon / sales EXECUTE reference-serving using
opted-in customers. LOAD-BEARING boundary: customer identity in external
publication requires explicit customer sign-off — Universal Principle 2 HARD
BOUNDARY.

Custom Route D per §8.2.

## Purpose

Prevents seven failure modes:

1. **Customer identity publication without sign-off.** LOAD-BEARING per
   Principle 1 (Universal Principle 2 HARD BOUNDARY at execution surface).
   Customer identity in press / investor / marketing / all-hands = explicit
   customer sign-off required.
2. **Reference-request abuse.** Over-requesting reference calls from same
   customers = advocate burnout + relationship damage. Rate-limit + rotate
   advocates.
3. **Advocacy-timing wrong.** Requesting reference during customer-strain
   period (health YELLOW/RED) = relationship damage.
4. **Case-study inaccuracy.** Case studies with unverified customer claims
   or fabricated outcomes = customer trust damage + credibility risk.
5. **Community-neglect.** User community without discipline (moderation /
   engagement / content) = declining engagement + attrition.
6. **Advocate-only-approach.** Advocacy programs that only serve our sales
   needs, ignoring advocate benefit (learning / networking / recognition) =
   short-lived program.
7. **Individual crisis DURING advocacy conversation.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Customer reference for [use case]" / "reference call for [prospect]"
- "Case study for [customer]" / "advocacy opt-in for [customer]"
- "Customer advocacy program for [segment]" / "reference program design"
- "Customer community for [product]" / "user conference planning"

Do NOT use for:
- Churn / at-risk save-motion → `churn-risk-prediction` (retain sibling)
- Expansion motion → `expansion-motions` (retain sibling)
- Renewal negotiation → `renewal-negotiation` (retain sibling)
- Actual PR / press execution → herald (Comms & PR)
- Actual investor comms execution → beacon (Comms & PR)
- Product-community development beyond CS scope → Product + Community team
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
ADVOCACY PROGRAM COMPONENTS (Mehta + Bill Lee framing)

  REFERENCE-SELLING PROGRAM
    - Prospect reference calls
    - Analyst / press reference conversations
    - Investor reference (aggregate-first; individual only with sign-off)
    - Rate-limit + rotation to avoid advocate burnout

  CASE-STUDY PROGRAM
    - Written case studies with customer sign-off
    - Video testimonials
    - Quantified-outcome case studies (with data-verification)
    - Speaking opportunities (webinar / conference)

  USER COMMUNITY
    - Peer-to-peer engagement platform
    - Moderation + content curation
    - Recognition programs (community MVPs)

  USER CONFERENCE / EVENTS
    - Annual / regional user gatherings
    - Customer-speaker slots
    - Product-roadmap engagement


CUSTOMER OPT-IN + SIGN-OFF PROTOCOL (LOAD-BEARING)

  Every advocacy engagement requires:
    - Explicit customer opt-in per activity type (reference calls / case
      study / press / investor / speaking / community)
    - Written sign-off before publication (case studies / press quotes /
      investor materials)
    - Rate-limit disclosure ("we ask 3-4 references per quarter maximum")
    - Withdrawal option ("you can pause advocacy participation any time")

  Sign-off scope explicit — reference-call sign-off ≠ press-quote sign-off
  ≠ investor-materials sign-off. Each requires separate scope.


ADVOCATE BENEFIT (Bill Lee 2012 discipline)

  Advocacy programs sustainable only if advocate benefits:
    - Learning (peer network + practitioner insights)
    - Recognition (public + within customer org)
    - Networking (community + speaking opportunities)
    - Product influence (roadmap engagement)

  Serve-our-needs-only programs = short-lived.


ADVOCACY OPERATIONAL SEQUENCE:

  Phase 1: ADVOCACY PROGRAM DESIGN                     (reference / case-study / community / conference structure)
  Phase 2: CUSTOMER OPT-IN + SIGN-OFF PROTOCOL (LOAD-BEARING) (per activity type)
  Phase 3: ADVOCACY PIPELINE MANAGEMENT                 (advocate roster + rate-limit + rotation + health-gate)
  Phase 4: CROSS-DEPARTMENT REFERENCE-SERVING            (herald / beacon / sales requests processed)
```

## Instructions

### Phase 1 — Advocacy program design

Design programs across 4 components (Structure/Protocol above):
- Reference-selling program
- Case-study program
- User community
- User conference / events

Per business needs + customer-base characteristics.

### Phase 2 — Customer opt-in + sign-off protocol (LOAD-BEARING)

**No customer identity in external publication without explicit sign-off.**
LOAD-BEARING per Principle 1.

Protocol:
- Explicit per-activity-type opt-in (reference / case study / press /
  investor / speaking)
- Written sign-off before publication (case studies / press quotes /
  investor materials)
- Sign-off scope explicit per activity type
- Rate-limit disclosure
- Withdrawal option

### Phase 3 — Advocacy pipeline management

- Advocate roster (opted-in customers per activity type)
- Rate-limit tracking (X references per quarter per advocate maximum)
- Rotation to prevent burnout
- **Health-gate** — do NOT request advocacy from YELLOW / RED health customers;
  coordinate with `churn-risk-prediction` for exclusion
- Advocate-benefit delivery (learning / recognition / networking)

### Phase 4 — Cross-department reference-serving

Process requests from:
- **herald** (Comms & PR) `press-kit` + `media-relations` — press reference
  requests
- **beacon** (Comms & PR) `investor-cadence` + `data-room-discipline` —
  investor reference requests
- **Sales** / future Growth & Partnerships — prospect reference requests

Per request:
- Match to opted-in advocate roster
- Verify rate-limit + health-gate
- Facilitate reference activity
- Track advocate participation
- Coordinate advocate-benefit follow-up

## Output Format

- Advocacy program design memo per component
- Customer opt-in + sign-off protocol templates
- Advocate roster + pipeline management dashboard
- Cross-department reference-serving process
- Case-study library (with sign-offs verified)
- Cross-agent handoff briefs to herald / beacon / sales

## Principles

1. **Never customer identity in external publication without explicit sign-off**
   — LOAD-BEARING per Purpose failure mode 1. Universal Principle 2 HARD
   BOUNDARY at execution surface.
2. **Rate-limit + rotation to prevent advocate burnout.**
3. **Health-gate advocacy requests** — no YELLOW / RED customers.
4. **Case-study data-verification** — no fabricated outcomes.
5. **Advocate benefit delivery** — sustainable programs require advocate value.
6. **Sign-off scope explicit per activity type.**
7. **No fabrication** — cited sources + verified customer outcomes.
   Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2 (this
   skill enforces at execution surface — LOAD-BEARING).
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Sign-off unavailable for advocate publication request.** Decline
  publication per Principle 1 — LOAD-BEARING. Coordinate with requester for
  alternative advocate OR request re-scoping.
- **Rate-limit exceeded on desired advocate.** Rotate to alternative advocate
  from roster.
- **Health-gate fails** — advocate customer at YELLOW/RED. Exclude from
  request; coordinate with `churn-risk-prediction` + retain leadership.
- **Case-study data-verification fails.** Reject case study; coordinate with
  customer + CSM for accurate data + re-verify before publication.
- **Advocate burnout signal detected** (declining participation / negative
  feedback). Coordinate with CSM for relationship-repair; pause advocacy
  requests to customer.
- **Sensitive-topic reference** (competitor comparison / political / religious)
  — additional sign-off + counsel-review coordination.
- **Advocate withdrawal request** — respect immediately + document; do NOT
  push back.
- **Individual crisis signal during advocacy conversation.** STOP. Route per
  Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `customer-health-scoring` (custom, ally — Lead) | Health-gate verification for advocacy requests | Upstream |
| `customer-lifecycle-value-mapping` (custom, ally — Lead) | Advocacy stage identification | Coordination |
| `churn-risk-prediction` (custom, retain — sibling) | Health-YELLOW/RED exclusion coordination | Coordination |
| `renewal-negotiation` (custom, retain — sibling) | Advocacy engagement + multi-year renewal coordination | Coordination |
| `expansion-motions` (custom, retain — sibling) | Advocate-customer expansion opportunities | Coordination |
| `press-kit` + `media-relations` (custom, herald — Comms & PR) | Press reference requests processing | Downstream |
| `investor-cadence` + `data-room-discipline` (custom, beacon — Comms & PR) | Investor reference requests processing | Downstream |
| Sales / future Growth & Partnerships | Prospect reference requests processing | Downstream |
| Product | User community / conference product-roadmap engagement | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
- [Lee, Bill — The Hidden Wealth of Customers (HBR Press)](https://store.hbr.org/product/the-hidden-wealth-of-customers-realizing-the-untapped-value-of-your-most-important-asset/12147)
- [IDC — Customer Advocacy research](https://www.idc.com/)
- [Forrester — Reference Program benchmarks](https://www.forrester.com/)
- [Influitive](https://influitive.com/)
- [Gainsight — Advocacy resources](https://www.gainsight.com/resources/)
