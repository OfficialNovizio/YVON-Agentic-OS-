<!--
Custom skill — synthesized from Mehta 2016 + Bhatt/Chinnappa 2018 + TSIA
+ Gainsight practitioner. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Mehta 2016 7th use across Client Success.
-->
---
name: onboarding-playbooks-per-segment
type: custom
status: built from scratch
sources_referenced:
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 7th use across Client Success. Tech-touch / high-touch / enterprise tier segmentation canonical."
  - "Bhatt, Nirav & Chinnappa, Steve (2018). The Customer Success Economy (Wiley)."
  - "TSIA — Customer onboarding benchmark research per segment. Institutional."
  - "Gainsight — segment-specific playbook materials (institutional practitioner)."
fulfills_catalog_entry: onboarding-playbooks-per-segment (custom per §2 routing)
assigned_agent: kickoff (Client Success / Onboarding)
portable: true
date_added: 2026-07-31
tier: 3
description: Segment-specific onboarding playbook detail — tech-touch (self-serve automated) / high-touch (CSM-led structured) / enterprise (dedicated team + custom implementation). Companion to onboarding-journey-design. Trigger on "onboarding playbook for [segment]", "tech-touch onboarding for [product/tier]", "high-touch onboarding cadence", "enterprise onboarding for [customer]", or "onboarding touch-model for [ARR tier]".
triggers:
  - onboarding playbook for
  - tech-touch onboarding for
  - high-touch onboarding cadence
  - enterprise onboarding for
  - onboarding touch-model for
  - segment playbook adaptation for
---

# Onboarding Playbooks Per Segment

## Introduction

Segment-specific onboarding playbook detail for kickoff — companion to
`onboarding-journey-design` (kickoff sibling). Mehta 2016 canonical tier
segmentation applied to onboarding playbook design.

Custom Route D per §8.2.

## Purpose

Prevents five failure modes:

1. **Single-playbook-for-all-segments.** Applying enterprise playbook to
   tech-touch = over-serve + resource-waste. Applying tech-touch playbook to
   enterprise = under-serve + customer frustration + churn risk.
2. **Segment classification unclear.** Without explicit criteria (ARR tier /
   use-case complexity / stakeholder count), segment misclassification
   produces wrong playbook.
3. **Playbook stale.** Onboarding-industry-practices evolve; playbooks not
   updated periodically = drifting from current-best-practice.
4. **Playbook adaptation triggers missed.** Customer segment shifts (SMB to
   mid-market via expansion) or custom requests (enterprise-touch requested
   for a mid-market customer) need adaptation-trigger recognition.
5. **Individual crisis DURING onboarding sprint.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Onboarding playbook for [segment]" / "onboarding touch-model for [ARR tier]"
- "Tech-touch onboarding for [product/tier]" / "high-touch onboarding cadence"
- "Enterprise onboarding for [customer]" / "segment playbook adaptation for [case]"

Do NOT use for:
- Journey structure design → `onboarding-journey-design` (sibling)
- TTFV measurement → `time-to-first-value-optimization` (sibling)
- Enterprise Mutual Success Plan → `kickoff-executive-alignment` (sibling)
- Individual crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
SEGMENT CLASSIFICATION CRITERIA (Mehta 2016 + practitioner)

  TECH-TOUCH (typical <$5-25k ARR)
    - Self-serve product primarily
    - Low use-case complexity
    - Single-stakeholder or small team
    - High customer volume, low per-customer margin
    - Cost-appropriate touch model: automated + digital-only

  HIGH-TOUCH / MID-MARKET ($25-250k ARR typical)
    - Structured product-adoption with human guidance
    - Moderate use-case complexity
    - Multiple stakeholders
    - Moderate customer volume, moderate per-customer margin
    - CSM-led with structured cadence

  ENTERPRISE ($250k+ ARR typical)
    - Custom implementation likely
    - High use-case complexity
    - Multiple stakeholders + executive sponsors
    - Low customer volume, high per-customer margin
    - Dedicated CSM + implementation engineer + PM

  Note: ARR bands illustrative; segment criteria per business.


PER-SEGMENT PLAYBOOK DIMENSIONS

  For each segment, playbook specifies:
    - Touch model (self-serve / CSM-led / dedicated-team)
    - Cadence (async only / weekly / bi-weekly / daily standups)
    - Resource allocation (CSM ratio + supporting roles)
    - Tech stack (in-product guidance / CSM tools / dedicated PM tools)
    - Communication channels (email / video / in-person)
    - Time-to-first-value target (coordinate with time-to-first-value-optimization)
    - Handoff to ongoing CSM protocol
    - Escalation triggers (when to escalate + to whom)


PLAYBOOK OPERATIONAL SEQUENCE:

  Phase 1: SEGMENT CLASSIFICATION                       (criteria per business)
  Phase 2: PER-SEGMENT PLAYBOOK DETAIL                   (touch + cadence + resources + tech + handoff)
  Phase 3: PLAYBOOK ADAPTATION TRIGGERS                   (segment shifts + custom requests)
  Phase 4: PLAYBOOK MAINTENANCE RHYTHM                    (periodic review + industry-practice updates)
```

## Instructions

### Phase 1 — Segment classification

Define segment criteria per business:
- ARR tier (illustrative)
- Use-case complexity
- Stakeholder count
- Customer volume + margin profile

Confirm criteria with operator + CSM leadership.

### Phase 2 — Per-segment playbook detail

For each segment, document:
- Touch model + cadence
- CSM ratio + supporting-role allocation
- Tech stack per segment
- Communication channels
- TTFV target (from `time-to-first-value-optimization` sibling)
- Handoff protocol to ongoing CSM
- Escalation triggers

### Phase 3 — Playbook adaptation triggers

Adaptation-required cases:
- Segment shift (SMB expands to mid-market → move to high-touch playbook)
- Custom request (enterprise-touch requested for mid-market — evaluate
  business-case + cost)
- Product change (major feature launch changes onboarding scope)

Adaptation decision-authority: operator + CSM leadership; kickoff coordinates.

### Phase 4 — Playbook maintenance rhythm

- Quarterly review — playbook effectiveness (TTFV / customer feedback /
  CSM feedback)
- Annual industry-practice refresh — incorporate TSIA benchmark updates +
  practitioner corpus evolution
- Ad-hoc updates per adaptation-trigger

## Output Format

- Segment-classification criteria memo
- Per-segment playbook (touch / cadence / resources / tech / handoff / escalation)
- Adaptation-trigger playbook update
- Playbook-maintenance schedule + review report

## Principles

1. **Segment-specific playbooks** — never single-playbook-for-all.
2. **Explicit segment criteria** — no unclear classification.
3. **Coordination with sibling skills** — TTFV target from sibling; journey
   structure from sibling.
4. **Adaptation triggers monitored** — segment shifts + custom requests +
   product change.
5. **Periodic maintenance** — quarterly + annual refresh + ad-hoc.
6. **No fabrication** — cited sources. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Segment classification contested** for a customer. Route to CSM
  leadership + operator; document criteria-application decision.
- **Custom-touch request** (mid-market customer wants enterprise touch).
  Evaluate business case (expansion potential / strategic-account
  designation); escalate to operator + CSM leadership.
- **Playbook staleness** identified in review. Route update through Phase 2
  refresh + operator approval.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `onboarding-journey-design` (custom, kickoff — sibling) | Journey structure per segment | Coordination |
| `time-to-first-value-optimization` (custom, kickoff — sibling) | TTFV target per segment | Coordination |
| `kickoff-executive-alignment` (custom, kickoff — sibling) | Enterprise-tier Mutual Success Plan | Coordination |
| `customer-health-scoring` (custom, ally — Lead) | Segment definitions align | Coordination |
| `onboarding-playbooks-per-segment` uses ally tier segmentation | ally (Lead) | Upstream inherited |
| CSM leadership + operator | Adaptation decisions | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
- [Bhatt & Chinnappa — The Customer Success Economy (Wiley)](https://www.wiley.com/en-us/The+Customer+Success+Economy-p-9781119572763)
- [TSIA](https://www.tsia.com/)
- [Gainsight — Segmentation resources](https://www.gainsight.com/resources/)
