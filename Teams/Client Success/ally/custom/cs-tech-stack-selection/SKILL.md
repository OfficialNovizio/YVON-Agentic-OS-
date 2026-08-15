<!--
Custom skill — built from scratch, synthesized from named sources (G2 + Forrester
Wave + Gainsight + ChurnZero + Totango + Vitally + Planhat + Catalyst practitioner
+ TSIA benchmarks). Stinger-style decision-matrix skill modeled after hire's
ats-selection pattern. Body follows §11 + §14.2.

Route D per §8.2 (cited rubric).
-->
---
name: cs-tech-stack-selection
type: custom
status: built from scratch
sources_referenced:
  - "G2 — Customer Success Software Grid (institutional practitioner marketplace)."
  - "Forrester — Customer Success Platform Wave reports (institutional)."
  - "Gainsight — vendor materials + Customer Success framework (institutional)."
  - "ChurnZero + Totango + Vitally + Planhat + Catalyst — vendor materials (practitioner)."
  - "TSIA — Customer Success technology benchmark research. Institutional."
  - "Mehta, Nick; Steinman, Dan; Murphy, Lincoln (2016). Customer Success (Wiley). §8.9 4th use in ally."
fulfills_catalog_entry: cs-tech-stack-selection (custom per §2 routing)
assigned_agent: ally (Client Success / CS Strategy — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: CS platform selection decision matrix — Gainsight vs ChurnZero vs Totango vs Vitally vs Planhat vs Catalyst vs in-house-with-BI. Stinger-style modeled after hire's ats-selection. LOAD-BEARING operator + procurement + CFO scoping before recommendation + vendor-lock-in awareness. Trigger on "CS platform selection", "Gainsight vs ChurnZero vs [other]", "CS tech stack for [org size]", "CS platform RFP", "CS platform migration risk", or "which CS platform for [stage]".
triggers:
  - CS platform selection
  - Gainsight vs ChurnZero
  - CS tech stack for
  - CS platform RFP
  - CS platform migration risk
  - which CS platform for
  - customer success software selection
---

# CS Tech Stack Selection

## Introduction

CS platform decision-matrix skill for ally — Gainsight vs ChurnZero vs
Totango vs Vitally vs Planhat vs Catalyst vs in-house-with-BI. Stinger-style
skill (decision-matrix + operator/procurement handoff) modeled after hire's
`ats-selection` pattern.

**Scope distinction:** ally scopes decision + coordinates. Operator +
procurement + CFO + IT decide + execute vendor engagement.

Custom Route D per §8.2.

## Purpose

Prevents six failure modes:

1. **Recommendation without operator + procurement + CFO scoping** — CS
   platform selection is cross-department (CS + IT + Finance + operator).
   Unilateral recommendation without cross-functional scoping = political
   damage + wrong decision. LOAD-BEARING per Principle 1.
2. **Vendor-lock-in ignored.** Platform migrations take 6-12 months typical;
   data-model migration is painful. Selection must consider lock-in +
   migration cost. LOAD-BEARING per Principle 2.
3. **Feature-only comparison.** Features matter but so do pricing model,
   integration depth (CRM / product analytics / support / BI), support
   quality, implementation effort, community + hiring pool.
4. **Stage-inappropriate platform.** Enterprise platform (Gainsight) for
   early-stage org = over-buying + implementation drag. SMB platform for
   enterprise = feature gaps. Stage-fit matters.
5. **RFP without in-depth demo + reference calls.** Vendor sales materials
   are optimistic; reference calls surface real customer experience.
6. **Individual crisis DURING RFP crunch.** HARD BOUNDARY.

## When to Use

Trigger on:

- "CS platform selection" / "which CS platform for [stage]"
- "Gainsight vs ChurnZero vs [other]"
- "CS tech stack for [org size]"
- "CS platform RFP" / "customer success software selection"
- "CS platform migration risk"

Do NOT use for:

- **Operational CS work** → other ally / kickoff / retain / keel skills
- **Actual vendor engagement** → operator + procurement
- **Platform implementation** → IT + operator + vendor
- **Individual mental-health crisis** → HARD BOUNDARY per Universal Principle 3

## Structure / Protocol

```
MAJOR CS PLATFORMS (2026 landscape — evolving)

  GAINSIGHT
    - Established enterprise leader; deepest features
    - Complex implementation; higher price
    - Best-fit: mid-market to enterprise

  CHURNZERO
    - Mid-market focused; good balance
    - Faster implementation than Gainsight
    - Best-fit: growth-stage SaaS

  TOTANGO
    - Mid-market to enterprise; strong analytics
    - Best-fit: data-driven CS orgs

  VITALLY
    - Modern UX; strong CSM-workflow focus
    - Best-fit: growth-stage; CSM-productivity-focused

  PLANHAT
    - EU-origin; strong European market presence
    - Modern architecture
    - Best-fit: EU-headquartered orgs

  CATALYST
    - Modern; strong integration with GTM stack
    - Sales + CS alignment
    - Best-fit: aligned sales+CS orgs

  IN-HOUSE WITH BI (Looker / Tableau / Metabase / etc.)
    - Full customization; no vendor lock-in
    - Higher build + maintenance cost
    - Best-fit: eng-heavy orgs OR very-simple CS motion
    - Common early-stage; migrate to platform at scale


DECISION-MATRIX CRITERIA

  Features                    (health-scoring / workflows / playbooks /
                              alerts / QBR / community-mgmt / etc.)
  Pricing model               (per-seat / per-account / value-based / hybrid)
  Integrations                (CRM / product analytics / support / BI / etc.)
  Support quality             (implementation + ongoing)
  Implementation effort       (weeks to months)
  Community + hiring pool     (larger community = easier to hire CSM Ops)
  Vendor-lock-in risk         (data-model + migration cost)
  Stage-fit                   (org-size + CS-maturity alignment)


CS-TECH-STACK OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: NEEDS ASSESSMENT                (org stage / CS-model / integrations / budget)
  Phase 2: SHORTLIST (top 3-4)              (based on Phase 1 needs)
  Phase 3: DECISION MATRIX                   (weighted scoring per criterion)
  Phase 4: RFP + DEMO + REFERENCES           (in-depth + reference-call verification)
  Phase 5: LOAD-BEARING OPERATOR + PROCUREMENT + CFO HANDOFF
```

## Instructions

### Phase 1 — Needs assessment

- Org stage (early / growth / mid-market / enterprise)
- CS model (tech-touch / high-touch / enterprise-touch mix)
- Existing integrations (CRM / product analytics / support / BI / billing)
- Budget range (approved by operator + CFO)
- Timeline (immediate vs planned)

### Phase 2 — Shortlist (top 3-4)

Based on Phase 1, shortlist 3-4 platforms. Include in-house-with-BI as
option for early-stage OR very-simple CS motion.

### Phase 3 — Decision matrix

Weighted scoring per criterion per shortlist candidate. Weights per org
priorities (features-heavy vs implementation-speed vs cost vs integration
depth).

### Phase 4 — RFP + demo + references

- RFP with specific use-cases + integration needs
- In-depth demos (not sales pitch — actual workflow demos with our data
  patterns)
- Reference calls (3-5 per candidate — orgs at similar stage + CS model)
- Reference-call questions: implementation experience / actual value
  realization / gotchas / support quality / migration difficulty

### Phase 5 — LOAD-BEARING operator + procurement + CFO handoff

**Recommendation routes through operator + procurement + CFO before
vendor engagement.** LOAD-BEARING per Principle 1.

Handoff brief:
- Shortlist + decision matrix + reference-call findings
- Recommendation with rationale
- Vendor-lock-in + migration-cost estimate (LOAD-BEARING per Principle 2)
- Implementation timeline + resource estimate
- Success criteria for platform decision

Operator + procurement + CFO decide + engage vendor. ally coordinates
implementation kickoff.

## Output Format

- **Needs-assessment memo** — org stage + CS-model + integrations + budget
- **Shortlist memo** — 3-4 candidates with initial fit-analysis
- **Decision matrix** — weighted scoring per criterion
- **RFP + demo + reference-call plan + findings**
- **Recommendation brief** — for operator + procurement + CFO handoff
- **Vendor-lock-in + migration-cost estimate** — LOAD-BEARING
- **Cross-agent handoff briefs** — to operator + procurement + CFO + IT

## Principles

1. **Never recommendation without operator + procurement + CFO scoping** —
   LOAD-BEARING per Purpose failure mode 1.
2. **Never vendor-lock-in ignored** — migration cost estimate + lock-in
   analysis mandatory. LOAD-BEARING per Purpose failure mode 2.
3. **Multi-criterion decision matrix** — features + pricing + integrations
   + support + implementation + community + lock-in + stage-fit.
4. **Reference-call verification mandatory** — vendor materials optimistic;
   reference calls surface real experience.
5. **Stage-fit assessment** — enterprise platform for early-stage = over-
   buying; SMB for enterprise = feature gaps.
6. **No fabrication** — cited G2 + Forrester + vendor materials + TSIA +
   Mehta 2016. Universal Principle 1.
7. **Aggregate-only at publication surface** — Universal Principle 2.
   Vendor-specific pricing / commercial terms handled per operator +
   procurement + counsel privilege discipline.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **§0.6 flag.** Sources Tier B.

## Fallback

- **Budget constraint** blocks preferred platform. Route to operator + CFO
  for budget-vs-scope trade-off; consider phased implementation OR
  alternate platform.
- **Existing-platform migration decision** (org has platform; considering
  switch). LOAD-BEARING migration-cost estimate mandatory. Route to
  operator + procurement + IT for migration-project sizing.
- **In-house-with-BI recommendation.** Only recommend for early-stage OR
  very-simple CS motion. Beyond that, in-house build+maintain cost
  typically exceeds platform license + implementation. Escalate to operator
  + eng-lead for build-vs-buy decision.
- **Vendor-lock-in concern** blocking recommendation. Route to operator +
  procurement + counsel for contract-negotiation exit-provisions.
- **Reference-call findings contradict vendor materials significantly.**
  Escalate concern to operator; re-consider shortlist ranking.
- **Individual crisis signal during CS-tech-stack conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `customer-health-scoring` (custom, ally — sibling) | Health-scoring platform capabilities inform selection | Coordination |
| `customer-lifecycle-value-mapping` (custom, ally — sibling) | Lifecycle-mgmt platform capabilities | Coordination |
| `qbr-executive-review-framework` (custom, ally — sibling) | QBR-supporting features | Coordination |
| retain siblings (`churn-risk-prediction` + `expansion-motions` + `renewal-negotiation`) | Platform features for retention workflows | Coordination |
| kickoff siblings | Onboarding workflow features | Coordination |
| keel siblings | Support-integration features | Coordination |
| dev (Engineering) / dana | In-house build alternative | Cross-department if in-house path |
| Operator + procurement + CFO | LOAD-BEARING recommendation handoff | Escalation — Principle 1 |
| Operator + IT | Implementation planning | Cross-department |
| Operator + procurement + counsel | Contract negotiation + lock-in exit provisions | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate | Cross-cutting |

## References (public / verifiable)

- [G2 — Customer Success Software](https://www.g2.com/categories/customer-success)
- [Forrester — Customer Success Platforms Wave reports (institutional)](https://www.forrester.com/)
- [Gainsight](https://www.gainsight.com/)
- [ChurnZero](https://churnzero.com/)
- [Totango](https://www.totango.com/)
- [Vitally](https://www.vitally.io/)
- [Planhat](https://www.planhat.com/)
- [Catalyst](https://catalyst.io/)
- [TSIA](https://www.tsia.com/)
- [Mehta, Steinman, Murphy — Customer Success (Wiley)](https://www.wiley.com/en-us/Customer+Success-p-9781119167969)
