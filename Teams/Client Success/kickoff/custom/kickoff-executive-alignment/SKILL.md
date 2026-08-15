<!--
Custom skill — synthesized from Miller Heiman + Fisher & Ury 2011 + Keenan
2018 + Winning by Design + Mehta 2016. §11 + §14.2. Route D per §8.2.

Cross-agent §8.9: Miller Heiman 2nd use (ally QBR + this) + Mehta 2016 8th use.
-->
---
name: kickoff-executive-alignment
type: custom
status: built from scratch
sources_referenced:
  - "Miller Heiman Group — Strategic Selling + Conceptual Selling frameworks. Institutional. §8.9 2nd use (ally QBR + this)."
  - "Fisher, Roger & Ury, William (2011, 3rd ed.). Getting to Yes: Negotiating Agreement Without Giving In. Penguin. ISBN 978-0143118756. Canonical negotiation text; BATNA framework."
  - "Keenan, Jim (2018). Gap Selling: Getting the Customer to Yes. A Sales Guy Publishing. ISBN 978-1732796812. Named practitioner. Gap-selling discovery framework."
  - "Winning by Design — SaaS-focused sales+CS methodology (institutional practitioner). winningbydesign.com."
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 8th use across Client Success."
fulfills_catalog_entry: kickoff-executive-alignment (custom per §2 routing)
assigned_agent: kickoff (Client Success / Onboarding)
portable: true
date_added: 2026-07-31
tier: 3
description: Mutual Success Plan (MSP) framework for enterprise-tier kickoff — sales-context handoff (gap-selling discovery) + MSP draft (shared success criteria + measurement + timeline) + executive-stakeholder validation (Miller Heiman) + BATNA-aware alignment (Fisher & Ury) + MSP formalization + close-loop. LOAD-BEARING MSP-skip at enterprise kickoff. Trigger on "Mutual Success Plan for [customer]", "MSP for [enterprise account]", "executive kickoff for [customer]", "shared success criteria for [customer]", or "BATNA for kickoff alignment".
triggers:
  - Mutual Success Plan for
  - MSP for
  - executive kickoff for
  - shared success criteria for
  - BATNA for kickoff alignment
  - gap-selling handoff for
  - stakeholder validation for kickoff
---

# Kickoff Executive Alignment

## Introduction

Mutual Success Plan (MSP) framework for kickoff — enterprise-tier kickoff
discipline. Miller Heiman stakeholder-mapping + Fisher & Ury BATNA discipline
+ Keenan Gap Selling handoff-from-sales + Winning by Design SaaS methodology
+ Mehta 2016 first-value framing.

**Scope distinction:** enterprise-tier scope primarily; may apply to select
mid-market. Tech-touch onboarding = self-serve + doesn't require MSP formality.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **MSP skip at enterprise kickoff.** Enterprise customer without explicit
   Mutual Success Plan = ambiguous success criteria + drift + trust damage
   at first difficulty. LOAD-BEARING per Principle 1.
2. **Sales-context handoff opacity.** Gap-selling discovery insights from
   sales must transfer to CSM for MSP grounding. Without transfer, MSP is
   built on incomplete customer context.
3. **Success criteria wishful-not-measurable.** MSP with vague criteria
   ("customer will love the product") = unaccountable. Criteria must be
   specific + measurable + time-bound.
4. **Stakeholder validation missed.** MSP agreed with one stakeholder without
   Miller Heiman validation across decision-maker / champion / users / blockers
   = wrong-audience alignment.
5. **BATNA ignored.** Both sides have BATNA (best alternative to negotiated
   agreement); ignoring BATNA = brittle alignment that fails first difficulty.
6. **Individual crisis DURING kickoff sprint.** HARD BOUNDARY.

## When to Use

Trigger on:
- "Mutual Success Plan for [customer]" / "MSP for [enterprise account]"
- "Executive kickoff for [customer]" / "shared success criteria for [customer]"
- "BATNA for kickoff alignment" / "gap-selling handoff for [customer]"
- "Stakeholder validation for kickoff"

Do NOT use for:
- Journey structure → `onboarding-journey-design` (sibling)
- TTFV measurement → `time-to-first-value-optimization` (sibling)
- Segment playbook detail → `onboarding-playbooks-per-segment` (sibling)
- Post-kickoff QBR → ally `qbr-executive-review-framework` (Lead)
- Renewal / expansion negotiation → retain (sibling agent)
- Individual mental-health crisis → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
MUTUAL SUCCESS PLAN CANONICAL COMPONENTS

  1. CUSTOMER BUSINESS OUTCOMES SOUGHT
     - What customer's business gain (revenue / cost / risk / capability)
     - Cited from sales gap-selling discovery + kickoff validation

  2. SUCCESS CRITERIA (SPECIFIC + MEASURABLE + TIME-BOUND)
     - What measurable outcome by when
     - Both sides own — customer + our-side commitments

  3. STAKEHOLDER MAP (Miller Heiman)
     - Executive sponsor
     - Champion
     - Users / operators
     - Blockers
     - Roles + responsibilities per MSP milestone

  4. MILESTONE TIMELINE
     - Onboarding milestones + owner + due date
     - First-value milestone (coordinate with time-to-first-value-optimization)
     - QBR schedule (coordinate with ally qbr-executive-review-framework)

  5. RISK REGISTER
     - Known risks to success + mitigation
     - Escalation triggers + protocol

  6. CLOSE-LOOP + REVISION PROTOCOL
     - MSP reviewed at each QBR
     - Revisions require both-side agreement
     - Silent drift not permitted


GAP-SELLING DISCOVERY (Keenan 2018) — HANDOFF FROM SALES

  Structured discovery covering:
    - Current state (customer's status quo)
    - Future state (customer's desired outcome)
    - Gap (delta between current + future)
    - Impact (business consequence of gap)
    - Root cause (why gap exists)

  Sales team completes at discovery; CSM inherits + validates in kickoff.


BATNA DISCIPLINE (Fisher & Ury)

  Both sides:
    - Our BATNA: what happens if this customer doesn't succeed
      (churn cost / reputation / capacity redeployment)
    - Customer BATNA: what happens if our product doesn't deliver
      (competitor / build-in-house / do-nothing)

  Understanding both BATNAs prevents brittle-alignment; enables win-win
  negotiation vs zero-sum.


OPERATIONAL SEQUENCE:

  Phase 1: SALES-CONTEXT HANDOFF                        (gap-selling discovery transfer)
  Phase 2: MSP DRAFT                                     (business outcomes + success criteria + timeline)
  Phase 3: STAKEHOLDER VALIDATION (Miller Heiman)        (align across all stakeholder categories)
  Phase 4: BATNA-AWARE ALIGNMENT (Fisher & Ury)          (both sides' alternatives understood)
  Phase 5: MSP FORMALIZATION + CLOSE-LOOP PROTOCOL       (signed + review-schedule established)
```

## Instructions

### Phase 1 — Sales-context handoff

- Gap-selling discovery from sales (Keenan framework)
- Customer business outcomes sought
- Sales-agreed success criteria
- Stakeholder map from sales (Miller Heiman input)
- Commercial context (contract / renewal timing)

Handoff template for structured transfer.

### Phase 2 — MSP draft

Draft MSP with 6 canonical components (Structure/Protocol above).

Success criteria discipline:
- Specific (not "successful outcome")
- Measurable (with cited baseline + target)
- Time-bound (with milestone dates)
- Both-sides-owned (customer + our-side commitments)

### Phase 3 — Stakeholder validation (Miller Heiman)

- Executive sponsor alignment
- Champion validation
- User / operator validation
- Blocker identification + engagement plan
- Sign-off per stakeholder category

### Phase 4 — BATNA-aware alignment (Fisher & Ury)

- Our BATNA articulated internally (not shared with customer)
- Customer BATNA understood via discovery + questioning
- Alignment structured to be win-win vs zero-sum

### Phase 5 — MSP formalization + close-loop

- Signed MSP (executive sponsor + our-side executive)
- Review schedule established (typically each QBR — coordinate with ally
  `qbr-executive-review-framework`)
- Revision protocol (both-sides agreement required for changes)
- Silent drift not permitted — every review revisits MSP status

## Output Format

- Sales-context handoff summary (gap-selling discovery)
- Mutual Success Plan draft (6 components)
- Stakeholder-validation report (Miller Heiman across all categories)
- BATNA-alignment memo (our + customer BATNA + implications)
- Signed MSP + review-schedule
- Cross-agent handoff briefs — to ally (QBR + health-scoring + lifecycle-value) + retain (renewal timing)

## Principles

1. **Never MSP skip at enterprise kickoff** — LOAD-BEARING per Purpose failure
   mode 1. Enterprise requires MSP formality.
2. **Sales-to-CSM gap-selling handoff structured** — customer context
   transfers explicitly (Keenan framework).
3. **Success criteria specific + measurable + time-bound** — no wishful
   criteria.
4. **Stakeholder validation across all Miller Heiman categories** — decision-
   maker / champion / users / blockers.
5. **BATNA-aware alignment** — both sides' alternatives understood.
6. **MSP close-loop at every QBR** — silent drift not permitted (inherited
   from ally QBR close-loop pattern).
7. **No fabrication** — cited institutional + practitioner sources. Universal
   Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2. MSP
   customer-identifiable details stay in CS tools; aggregate MSP metrics
   for cross-department publication.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B.

## Fallback

- **Sales-context handoff incomplete** — escalate to sales leadership + operator;
  block MSP finalization until discovery complete OR proceed with reduced-info
  MSP with explicit "sales-context-gap" flag.
- **Stakeholder unable to validate** (executive sponsor unavailable). Coordinate
  scheduling; do NOT finalize MSP without executive-sponsor alignment.
- **Success criteria contested** between customer + our-side. Escalate to
  operator + relevant executive; may require sales re-engagement to reset
  expectations.
- **BATNA analysis reveals brittle alignment** (customer BATNA is strong
  competitor; our BATNA is losing significant strategic account). Route to
  operator + retain leadership for strategic-account escalation.
- **MSP revision request without both-sides agreement.** Decline per
  Principle 6. Route to both-side revision meeting.
- **Individual crisis signal.** STOP. Route per Universal Principle 3.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `onboarding-journey-design` (custom, kickoff — sibling) | Journey structure input | Coordination |
| `time-to-first-value-optimization` (custom, kickoff — sibling) | First-value milestone target | Coordination |
| `onboarding-playbooks-per-segment` (custom, kickoff — sibling) | Enterprise-tier playbook detail | Coordination |
| `qbr-executive-review-framework` (custom, ally — Lead) | MSP review at every QBR | Downstream Phase 5 |
| `customer-health-scoring` (custom, ally — Lead) | MSP success criteria feed health-score baseline | Downstream Phase 5 |
| `customer-lifecycle-value-mapping` (custom, ally — Lead) | MSP business outcomes align with lifecycle-value stages | Coordination |
| `renewal-negotiation` (custom, retain — sibling agent) | MSP is foundation for future renewal-value-conversation | Downstream (future) |
| `expansion-motions` (custom, retain — sibling agent) | MSP success criteria met → expansion opportunity | Downstream (future) |
| Sales / future Growth & Partnerships | Gap-selling handoff | Upstream |
| Operator + relevant executive | Success-criteria conflict + strategic-account escalation | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References

- [Miller Heiman Group — Strategic Selling](https://www.millerheimangroup.com/)
- [Fisher & Ury — Getting to Yes (Penguin)](https://www.penguinrandomhouse.com/books/318043/getting-to-yes-by-roger-fisher-and-william-ury/)
- [Keenan, Jim — Gap Selling](https://asalesguy.com/gap-selling/)
- [Winning by Design](https://winningbydesign.com/)
- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
