<!--
Custom skill — built from scratch, synthesized from Mehta 2016 + Bhatt/Chinnappa
2018 + Vaidyanathan/Rabago 2020 + practitioner corpus. Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 found UX/CRO/growth-oriented onboarding
marketplace skills — different scope (growth activation vs Mehta-anchored CS
onboarding lifecycle). §4.6 reclass to custom Route D.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Mehta 2016 5th use across Client Success (ally 4 + this).
-->
---
name: onboarding-journey-design
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 5th use across Client Success."
  - "Bhatt, Nirav & Chinnappa, Steve (2018). The Customer Success Economy (Wiley). §8.9 with ally-1 + ally-2."
  - "Vaidyanathan, Ashvin & Rabago, Ruben (2020). The Customer Success Professional's Handbook (Wiley). §8.9 with ally."
  - "TSIA — Customer onboarding benchmark research. Institutional."
  - "Gainsight — onboarding playbook materials (institutional practitioner)."
fulfills_catalog_entry: onboarding-journey-design (custom per §2 routing)
assigned_agent: kickoff (Client Success / Onboarding)
portable: true
date_added: 2026-07-31
tier: 3
description: Customer onboarding journey design — Mehta-anchored CS onboarding lifecycle from contract signature through first-value milestone. Coordinates upstream from sales handoff, sideways with ally for health-score baseline + lifecycle-value stage-1 handoff. Trigger on "onboarding journey for [customer]", "onboarding milestones for [tier]", "onboarding kickoff for [account]", "post-sale handoff for [customer]", or "onboarding-to-CSM handoff design".
triggers:
  - onboarding journey for
  - onboarding milestones for
  - onboarding kickoff for
  - post-sale handoff for
  - onboarding-to-CSM handoff design
  - customer onboarding lifecycle for
  - sales-to-CS handoff for
---

# Onboarding Journey Design

## Introduction

This skill packages customer onboarding journey design discipline for kickoff
— from contract signature through first-value milestone. Grounded in Mehta
2016 + Bhatt/Chinnappa 2018 + Vaidyanathan/Rabago 2020 + TSIA benchmarks +
Gainsight practitioner corpus.

**Scope distinction:** kickoff owns onboarding journey DESIGN + coordination.
Actual customer-facing onboarding delivery = CSM + Implementation team +
Support. Distinct from `time-to-first-value-optimization` (kickoff sibling —
optimization scope), `onboarding-playbooks-per-segment` (kickoff sibling —
tier-specific playbook detail), and `kickoff-executive-alignment` (kickoff
sibling — mutual-success-plan discipline).

Custom Route D per §8.2 — cited rubric grounded in canonical CS corpus.

## Purpose

Prevents six failure modes:

1. **Onboarding as afterthought.** Onboarding designed as one-time
   handoff-from-sales without lifecycle-view = customer drift + churn risk.
   Onboarding is foundation of full CS lifecycle.
2. **Sales-CS handoff opacity.** Sales-to-CS handoff without structured
   information transfer (customer context / expected outcomes / commercial
   context / stakeholder map) = CSM starts blind. Onboarding delayed.
3. **No milestone-map.** Onboarding without explicit milestone map = time-
   to-first-value drift + no accountability + customer confusion about
   "what's next."
4. **Journey design ignores customer segment.** Enterprise onboarding
   ≠ tech-touch onboarding ≠ SMB onboarding. Segment-agnostic design =
   wrong intensity per segment.
5. **CSM handoff at end unclear.** Onboarding-to-ongoing-CSM transition
   without clean handoff = ownership gap + customer confusion.
6. **Individual crisis DURING onboarding sprint.** HARD BOUNDARY.

kickoff uses this skill as Phase 1 of onboarding workflow.

## When to Use

Trigger on:

- "Onboarding journey for [customer]" / "customer onboarding lifecycle for [tier]"
- "Onboarding milestones for [tier]" / "onboarding kickoff for [account]"
- "Post-sale handoff for [customer]" / "sales-to-CS handoff for [account]"
- "Onboarding-to-CSM handoff design"

Do NOT use for:

- **Time-to-first-value optimization scope** → `time-to-first-value-optimization`
- **Segment-specific playbook detail** → `onboarding-playbooks-per-segment`
- **Executive mutual-success-plan** → `kickoff-executive-alignment`
- **Post-onboarding CSM ongoing motion** → ally + retain (Client Success siblings)
- **Sales-side execution** → sales team (future Growth & Partnerships)
- **Individual mental-health crisis** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
ONBOARDING JOURNEY (Mehta 2016 canonical lifecycle)

  PHASE 0 — Sales-to-CS Handoff (T-0 contract signature)
    - Customer context + expected outcomes + commercial context
    - Stakeholder map (Miller Heiman)
    - Success criteria as agreed at sales
    - CSM assignment + capacity check

  PHASE 1 — Kickoff (Week 1-2)
    - Kickoff call (executive + operational stakeholders)
    - Mutual Success Plan draft (kickoff sibling `kickoff-executive-alignment`)
    - Onboarding milestone map communicated
    - Technical setup start

  PHASE 2 — Setup / Implementation (Week 2-N — varies by tier)
    - Technical integration (dev / product-integrations)
    - Data migration if applicable
    - User provisioning + permissions
    - Training scheduling

  PHASE 3 — Enablement (Week 4-N — varies)
    - Admin training
    - End-user training
    - Documentation delivery
    - Enablement checkpoints

  PHASE 4 — First-Value (Week 6-N — varies; measured explicitly by
                        `time-to-first-value-optimization` sibling)
    - Customer achieves first business outcome
    - Success criteria met vs sales-agreed
    - Adoption metrics baseline set

  PHASE 5 — Onboarding-to-Ongoing-CSM Handoff (Week 8-16 — varies)
    - Health-score baseline set (coordinate with ally `customer-health-scoring`)
    - Lifecycle-value stage-1 (onboarding) marked complete
    - Handoff to ongoing CSM (may be same person; explicit transition)
    - First QBR scheduled (coordinate with ally `qbr-executive-review-framework`)


SEGMENT-BASED INTENSITY

  TECH-TOUCH ONBOARDING (typically <$5-25k ARR)
    - Self-serve heavy; automated onboarding
    - Email + in-product guidance
    - Optional office hours
    - Time-to-first-value: hours-to-days target

  HIGH-TOUCH / MID-MARKET ONBOARDING ($25-250k ARR)
    - CSM-led with structured cadence
    - Semi-custom implementation
    - Time-to-first-value: days-to-weeks target

  ENTERPRISE ONBOARDING ($250k+ ARR)
    - Dedicated CSM + implementation engineer + project manager
    - Custom implementation + integration
    - Mutual Success Plan formal (via `kickoff-executive-alignment`)
    - Time-to-first-value: weeks-to-months target


ONBOARDING-JOURNEY-DESIGN OPERATIONAL SEQUENCE:

  Phase 1: SALES-TO-CS HANDOFF DESIGN                  (structured info transfer)
  Phase 2: TIER-APPROPRIATE JOURNEY MAP                 (5-phase lifecycle sized per tier)
  Phase 3: MILESTONE MAP                                 (per-phase milestones + owner + timing)
  Phase 4: COORDINATION HANDOFFS                         (dev / Product / Support / training)
  Phase 5: ONBOARDING-TO-ONGOING-CSM HANDOFF DESIGN     (health-baseline + lifecycle-stage-1 close)
```

## Instructions

### Phase 1 — Sales-to-CS handoff design

Structured handoff protocol at T-0 (contract signature):

- Customer context memo (industry / size / use case / prior evaluation
  process)
- Expected outcomes as agreed at sales
- Commercial context (contract terms / renewal timing / expansion potential)
- Stakeholder map (Miller Heiman — decision-maker / champion / users /
  blockers)
- Success criteria as sales-agreed
- CSM assignment + capacity confirmation

Output: sales-to-CS handoff template + protocol.

### Phase 2 — Tier-appropriate journey map

Size 5-phase lifecycle per customer tier:
- Tech-touch: compressed timelines + self-serve emphasis
- High-touch / mid-market: structured CSM-led cadence
- Enterprise: dedicated team + custom implementation

Time-to-first-value target per tier (coordinate with kickoff sibling
`time-to-first-value-optimization` for measurement discipline).

### Phase 3 — Milestone map

Per-phase milestones with:
- Milestone description
- Owner (customer-side vs our-side)
- Timing target
- Dependency chain
- Evidence for completion

Milestone map shared with customer at kickoff (Phase 1 above).

### Phase 4 — Coordination handoffs

- **dev / product-integrations** — technical integration owner
- **Product** — feature-configuration guidance
- **Support (keel)** — support-team introduced during onboarding
- **Training** — admin + end-user training coordination
- **Sales (post-handoff coordination)** — for expansion opportunity signals

### Phase 5 — Onboarding-to-ongoing-CSM handoff design

Clean transition from onboarding to ongoing CSM motion:
- Health-score baseline set (coordinate with ally `customer-health-scoring`)
- Lifecycle-value stage-1 (onboarding) marked complete + evidence
  (coordinate with ally `customer-lifecycle-value-mapping`)
- Ongoing CSM assigned (may be same person as onboarding CSM; explicit
  transition either way)
- First QBR scheduled (coordinate with ally `qbr-executive-review-framework`)
- Customer explicitly informed of transition + ongoing point of contact

## Output Format

- **Sales-to-CS handoff template + protocol**
- **Tier-appropriate journey map** (5-phase lifecycle sized per tier)
- **Milestone map** with owners + timing + dependencies
- **Coordination handoff briefs** to dev / Product / Support / Training / Sales
- **Onboarding-to-ongoing-CSM handoff design** with health-baseline + lifecycle-stage-1 close
- **Cross-agent handoff briefs** — to kickoff siblings + ally + retain (as applicable)

## Principles

1. **Onboarding designed as foundation of full CS lifecycle** — not one-time
   handoff-from-sales.
2. **Sales-to-CS handoff structured** — customer context / outcomes / commercial /
   stakeholder map / success criteria transferred explicitly.
3. **Explicit milestone map** — per-phase milestones with owners + timing +
   evidence for completion.
4. **Tier-appropriate intensity** — tech-touch / high-touch / enterprise
   sizing per Mehta 2016 discipline.
5. **Clean onboarding-to-ongoing-CSM handoff** — health-baseline + lifecycle-
   stage-1 close + explicit customer-facing transition.
6. **No fabrication** — cited institutional + practitioner sources. Universal
   Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   customer onboarding stories require customer sign-off for external
   publication.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Sales-to-CS handoff information incomplete** at T-0. Escalate to sales
  leadership + operator; block onboarding until handoff info complete.
  Alternative: proceed with reduced-info onboarding but flag risk explicitly
  in customer kickoff.
- **CSM capacity constrained** — cannot take on onboarding at tier-appropriate
  intensity. Escalate to CSM leadership + operator; consider timing shift or
  temporary tier-downgrade with explicit customer communication.
- **Milestone slippage** during onboarding (customer-side or our-side).
  Explicit acknowledgment + revised timeline; no silent slippage.
- **Cross-agent coordination failure** (dev not resourced for integration /
  Support not staffed / Training misaligned). Escalate to operator + relevant
  department leads.
- **Customer-side blocker** (stakeholder change / delay / scope shift).
  Coordinate with sales for commercial context + CSM for continuity plan;
  may require re-scoping.
- **Individual crisis signal during onboarding conversation.** STOP. Route
  per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `time-to-first-value-optimization` (custom, kickoff — sibling) | Time-to-first-value measurement + optimization | Coordination |
| `onboarding-playbooks-per-segment` (custom, kickoff — sibling) | Tier-specific playbook detail | Coordination |
| `kickoff-executive-alignment` (custom, kickoff — sibling) | Mutual Success Plan for enterprise-tier | Coordination |
| `customer-health-scoring` (custom, ally — Lead) | Health-score baseline at handoff | Downstream Phase 5 |
| `customer-lifecycle-value-mapping` (custom, ally — Lead) | Lifecycle-value stage-1 close at handoff | Downstream Phase 5 |
| `qbr-executive-review-framework` (custom, ally — Lead) | First QBR scheduled at handoff | Downstream Phase 5 |
| retain siblings (`churn-risk-prediction` + `expansion-motions` + `renewal-negotiation`) | Ongoing motion post-onboarding | Downstream |
| keel siblings (`tiered-support-design` + `support-analytics`) | Support-team introduction during onboarding | Coordination |
| dev / product-integrations | Technical integration | Cross-department |
| Product | Feature configuration guidance | Cross-department |
| Sales / future Growth & Partnerships | Post-handoff coordination + expansion signals | Cross-department |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References (public / verifiable)

- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
- [Bhatt & Chinnappa — The Customer Success Economy (Wiley)](https://www.wiley.com/en-us/The+Customer+Success+Economy-p-9781119572763)
- [Vaidyanathan & Rabago — CS Professional's Handbook (Wiley)](https://www.wiley.com/en-us/The+Customer+Success+Professional%27s+Handbook-p-9781119624615)
- [TSIA](https://www.tsia.com/)
- [Gainsight — Onboarding resources](https://www.gainsight.com/resources/)
