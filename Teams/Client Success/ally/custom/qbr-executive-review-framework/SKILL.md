<!--
Custom skill — built from scratch, synthesized from named sources (Mehta 2016
+ Vaidyanathan/Rabago 2020 + Miller Heiman + Gainsight practitioner corpus).
Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 search found bundled CSM-analytics
marketplace skills with QBR templates included — community publishers. Mehta-
anchored framework provides stronger grounding. §4.6 reclass to custom Route D.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Mehta 2016 3rd use in ally.
-->
---
name: qbr-executive-review-framework
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 3rd use in ally."
  - "Vaidyanathan, Ashvin & Rabago, Ruben (2020). The Customer Success Professional's Handbook (Wiley). §8.9 with ally-1 + ally-2."
  - "Miller Heiman Group — Strategic Selling / Conceptual Selling frameworks (institutional). Stakeholder-mapping input to QBR prep."
  - "Gainsight — QBR templates + best practices (institutional). gainsight.com."
  - "TSIA — Executive Business Review benchmark research. Institutional. tsia.com."
fulfills_catalog_entry: qbr-executive-review-framework (custom per §2 routing)
assigned_agent: ally (Client Success / CS Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Executive Business Review (EBR / QBR) framework — pre-QBR data prep + agenda structure + in-QBR facilitation + expansion + risk surfacing + LOAD-BEARING close-loop with prior-QBR commitments + no-expansion-push-during-renewal-risk discipline. Trigger on "QBR prep for [customer]", "quarterly business review for [account]", "EBR agenda for [customer]", "prior QBR commitments for [account]", "expansion opportunity in QBR", or "QBR risk escalation".
triggers:
  - QBR prep for
  - quarterly business review for
  - EBR agenda for
  - prior QBR commitments for
  - expansion opportunity in QBR
  - QBR risk escalation
  - QBR facilitation for
  - post-QBR commitment tracking
---

# QBR Executive Review Framework

## Introduction

This skill packages Executive Business Review (EBR / QBR) discipline for ally
— pre-QBR data prep + agenda structure + in-QBR facilitation + post-QBR
commitment tracking. Grounded in Mehta 2016 + Vaidyanathan/Rabago 2020 +
Miller Heiman stakeholder-mapping + Gainsight practitioner + TSIA benchmarks.

**Scope distinction:** ally OWNS QBR framework + coordinates preparation.
CSM + executive sponsor + customer stakeholders EXECUTE the actual QBR
conversation. ally does NOT deliver the QBR itself.

Custom Route D per §8.2 — cited rubric grounded in canonical CS practitioner
corpus.

## Purpose

Prevents seven failure modes:

1. **QBR without prior-QBR close-loop.** Silent-contradiction with prior
   QBR commitments = customer trust damage. Every QBR references prior
   commitments explicitly. LOAD-BEARING per Principle 1 (inherited pattern
   from Comms & PR + Global Expansion no-silent-contradiction).
2. **Expansion push during renewal-risk / customer-relationship-strain.**
   Pushing upsell / cross-sell when relationship is strained = signals
   deprioritized customer concern; damages long-term relationship. LOAD-
   BEARING per Principle 2.
3. **Data-free QBR** — QBR without cited health-score + value-realization
   milestone completion = feels-based conversation without accountability.
4. **Agenda-driven-by-us-only.** QBR that only covers our-side agenda
   (health / expansion) without customer-side agenda (their business
   priorities / where they need us to improve) = one-way meeting;
   customers disengage.
5. **Stakeholder-mapping ignored.** QBR without knowing who's in the room
   + who's not (executive sponsor / champion / blocker) = wrong conversation
   for wrong audience.
6. **Post-QBR commitment tracking absent.** Commitments made in QBR without
   tracker = silent-drift; next-QBR credibility damage.
7. **Individual crisis DURING QBR-prep crunch.** HARD BOUNDARY.

ally uses this skill 60-90 days before quarterly touchpoints for major
customers.

## When to Use

Trigger on:

- "QBR prep for [customer]" / "EBR agenda for [customer]" / "QBR facilitation for [account]"
- "Prior QBR commitments for [account]" / "post-QBR commitment tracking"
- "Expansion opportunity in QBR" / "QBR risk escalation"

Do NOT use for:

- **Operational health scoring** → `customer-health-scoring` (ally sibling)
- **Lifecycle value mapping** → `customer-lifecycle-value-mapping` (ally sibling)
- **Tech-stack selection** → `cs-tech-stack-selection` (ally sibling)
- **Renewal negotiation execution** → retain `renewal-negotiation`
- **Actual QBR delivery** — CSM + executive sponsor scope
- **Individual mental-health crisis** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
QBR CORE COMPONENTS (Mehta 2016 canonical structure)

  1. RECAP OF PRIOR-QBR COMMITMENTS         (both sides — closed / in-progress / missed)
  2. CURRENT-STATE HEALTH REVIEW             (health score + trend + segment context)
  3. VALUE REALIZATION UPDATE                 (per-stage milestones per customer-lifecycle-value-mapping)
  4. CUSTOMER-SIDE PRIORITIES                 (their business priorities + our role)
  5. STRATEGIC ROADMAP ALIGNMENT              (our product roadmap + their strategic direction)
  6. RISK IDENTIFICATION + MITIGATION         (open risks + intervention plans)
  7. EXPANSION OPPORTUNITY (if healthy)       (surface — NOT push if renewal-risk exists)
  8. FORWARD COMMITMENTS + NEXT-QBR PREP      (mutual — tracked)


AGENDA-STRUCTURE (Mehta 2016 + Vaidyanathan/Rabago 2020)

  Pre-QBR (60-90 days ahead):
    - Data-prep (health + value + risk + prior commitments)
    - Stakeholder mapping (Miller Heiman — decision-makers / champions /
      blockers / new stakeholders)
    - Pre-alignment with CSM + executive sponsor
    - Agenda draft shared with customer 2 weeks ahead

  In-QBR (60-90 minute typical):
    - 10 min: prior-commitment recap (both sides)
    - 15 min: current-state + value realization
    - 20 min: customer-side priorities + our-role
    - 15 min: forward commitments + next steps
    - 10 min: risk / expansion discussion (as applicable)

  Post-QBR (T+1 week):
    - Commitment tracker updated
    - Follow-up items owned + dated
    - Next-QBR pre-prep scheduled


STAKEHOLDER MAPPING (Miller Heiman input)

  Per account:
    - Executive sponsor (decision-maker; usually attends QBR)
    - Champion (internal advocate; drives adoption)
    - User / operator (day-to-day product user)
    - Blocker (skeptical stakeholder; may or may not attend)
    - New stakeholder (recent org change; may need re-engagement)

  QBR agenda tuned to who's in the room.


QBR OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: PRE-QBR DATA PREP                  (60-90 days ahead — health + value + risk + prior commitments)
  Phase 2: STAKEHOLDER MAPPING + AGENDA        (Miller Heiman + customer-side priorities)
  Phase 3: IN-QBR FACILITATION DISCIPLINE      (recap + review + priorities + commitments)
  Phase 4: EXPANSION + RISK SURFACING          (health-tier-gated — LOAD-BEARING no-push-during-risk)
  Phase 5: POST-QBR COMMITMENT TRACKING        (T+1 week — tracker + next-QBR prep)
```

## Instructions

### Phase 1 — Pre-QBR data prep

- Pull health-score from `customer-health-scoring` (ally sibling)
- Pull lifecycle-value milestone completion from `customer-lifecycle-value-
  mapping` (ally sibling)
- Pull prior-QBR commitments tracker (both sides — ours + customer-side)
- Pull recent support tickets + escalations from keel `support-analytics`
- Pull recent product usage trend from Product/dana
- Pull commercial context from CRM + billing

Timeline: 60-90 days ahead.

### Phase 2 — Stakeholder mapping + agenda

- Apply Miller Heiman stakeholder-mapping per account
- Identify who's in the room + who's not
- Draft agenda balanced between our-side + customer-side priorities
- Share agenda with customer 2 weeks ahead — invite customer input

### Phase 3 — In-QBR facilitation discipline

Prep facilitation notes per canonical structure:
- Prior-commitment recap (both sides)
- Health + value review
- Customer-side priorities (their business priorities + our role)
- Strategic roadmap alignment
- Forward commitments + next steps

CSM + executive sponsor facilitate; ally provides framework.

### Phase 4 — Expansion + risk surfacing (LOAD-BEARING gated)

- **If health = GREEN + no active concerns** → surface expansion
  opportunity for discussion (coordinate with retain `expansion-motions`)
- **If health = YELLOW / RED OR any active concern** → NO expansion push.
  Focus on risk mitigation + relationship repair. Expansion timing = later.

**LOAD-BEARING** per Principle 2 — expansion push during customer-strain
damages trust.

### Phase 5 — Post-QBR commitment tracking (T+1 week)

- Update commitment tracker (both sides — ours + customer-side)
- Follow-up items owned + dated
- Next-QBR pre-prep scheduled (60-90 days ahead)
- Feed close-loop discipline for next QBR (Principle 1)

## Output Format

- **Pre-QBR data-prep briefing** — health + value + risk + prior commitments
- **Stakeholder-mapping memo** — per account
- **QBR agenda draft** — with customer-side + our-side balance
- **Facilitation notes** — per-section for CSM + executive sponsor
- **Post-QBR commitment tracker update** — both sides
- **Cross-agent handoff briefs** — to retain (expansion / renewal) + keel
  (support-signal input) + Product (roadmap alignment) + operator

## Principles

1. **Never QBR without prior-QBR close-loop** — LOAD-BEARING per Purpose
   failure mode 1. Inherited pattern from Comms & PR + Global Expansion
   no-silent-contradiction.
2. **Never expansion push during renewal-risk / customer-strain** — LOAD-
   BEARING per Purpose failure mode 2. Damages long-term trust.
3. **Data-cited QBR** — health + value + risk + prior-commitments cited.
   No feels-based reviews.
4. **Agenda balanced customer-side + our-side.** One-way meetings fail.
5. **Stakeholder mapping applied.** Wrong conversation for wrong audience
   = wasted QBR.
6. **Post-QBR commitment tracking mandatory.** Silent drift = next-QBR
   credibility damage.
7. **No fabrication** — cited institutional + practitioner sources.
   Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2.
   Individual QBR outcomes stay in CS tools; aggregate portfolio-level
   QBR insights for cross-department publication.
9. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
10. **§0.6 flag.** Sources Tier B. Downgrade path in `logical/README.md`.

## Fallback

- **Prior-QBR data unavailable** (first QBR for customer OR data lost).
  Explicitly acknowledge in current QBR ("first review together — establishing
  baseline"). Do NOT fabricate prior commitments.
- **Customer refuses agenda-input opportunity.** Proceed with our-side draft;
  document reduced customer engagement as CS risk signal.
- **Expansion push pressure from sales / operator** during customer-strain
  signal. Decline per Principle 2 — LOAD-BEARING. Escalate to operator +
  retain for expansion-timing discussion post-strain-resolution.
- **In-QBR conflict escalation** (customer raises significant concern).
  Route to escalation-response — coordinate with retain (churn-risk-prediction
  + renewal-negotiation) + operator + relevant counsel if legal-adjacent.
- **Post-QBR commitment slippage** on our side. Escalate to operator; do
  NOT silently drop commitment. Next-QBR must acknowledge slippage
  explicitly (Principle 1).
- **Individual crisis signal during QBR-prep conversation.** STOP. Route
  per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `customer-health-scoring` (custom, ally — sibling) | Health-score input for QBR | Upstream |
| `customer-lifecycle-value-mapping` (custom, ally — sibling) | Lifecycle + value milestones for QBR | Upstream |
| `cs-tech-stack-selection` (custom, ally — sibling) | Coordination on QBR-supporting tooling | Coordination |
| `time-to-first-value-optimization` (custom, kickoff — sibling agent) | Onboarding-stage QBR input | Coordination |
| `expansion-motions` (custom, retain — sibling agent) | Health-GREEN expansion opportunity handoff | Downstream (Phase 4 gated) |
| `renewal-negotiation` (custom, retain — sibling agent) | Renewal-risk QBR input + escalation | Coordination |
| `churn-risk-prediction` (custom, retain — sibling agent) | Risk-signal input for QBR | Upstream |
| `support-analytics` (custom, keel — sibling agent) | Support-signal input for QBR | Upstream |
| Product (spec / metric / ux / loom) | Product-roadmap alignment for QBR | Coordination |
| beacon `data-room-discipline` (Comms & PR) | Aggregate QBR insights for DD backing | Coordination (aggregate-only per Principle 8) |
| Operator + relevant counsel | Legal-adjacent in-QBR escalation | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References (public / verifiable)

- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
- [Vaidyanathan & Rabago — CS Professional's Handbook (Wiley)](https://www.wiley.com/en-us/The+Customer+Success+Professional%27s+Handbook-p-9781119624615)
- [Miller Heiman Group — Strategic Selling](https://www.millerheimangroup.com/)
- [Gainsight — QBR resources](https://www.gainsight.com/resources/)
- [TSIA — Executive Business Review benchmarks](https://www.tsia.com/)
