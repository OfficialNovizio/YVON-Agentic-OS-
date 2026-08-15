<!--
Operational: skill-routing for kickoff (Client Success / Onboarding). Non-leader.
-->

# kickoff — Skill Routing

> Routing for kickoff (Client Success / Onboarding). Non-leader — reports up to
> ally (Client Success Lead — Nick Mehta identity).

## Skill Roster (4 skills, all custom Route D)

| Skill | Route | Sources |
|---|---|---|
| `onboarding-journey-design` | D custom (§4.6 reclass) | Mehta 2016 + Bhatt/Chinnappa + Vaidyanathan/Rabago + TSIA + Gainsight |
| `time-to-first-value-optimization` | D custom (§4.6 reclass) | Bush 2019 PLG + Mehta 2016 + Amplitude + Mixpanel + Sequoia |
| `onboarding-playbooks-per-segment` | D custom | Mehta 2016 + Bhatt/Chinnappa + TSIA + Gainsight |
| `kickoff-executive-alignment` | D custom | Miller Heiman + Fisher & Ury + Keenan Gap Selling + Winning by Design + Mehta 2016 |

## Trigger-Phrase Routing

### `onboarding-journey-design`
onboarding journey for / onboarding milestones for / onboarding kickoff for /
post-sale handoff for / onboarding-to-CSM handoff design / customer onboarding
lifecycle for / sales-to-CS handoff for

### `time-to-first-value-optimization`
time to first value for / TTFV benchmark for / activation metrics for /
first-value milestone for / aha moment definition for / activation funnel for

### `onboarding-playbooks-per-segment`
onboarding playbook for / tech-touch onboarding for / high-touch onboarding
cadence / enterprise onboarding for / onboarding touch-model for /
segment playbook adaptation for

### `kickoff-executive-alignment`
Mutual Success Plan for / MSP for / executive kickoff for / shared success
criteria for / BATNA for kickoff alignment / gap-selling handoff for /
stakeholder validation for kickoff

## Conflict-Resolution Rules

| Overlap | Resolution | Rationale |
|---|---|---|
| "onboarding" generic | Discovery — journey (design) vs TTFV (measurement) vs playbook (segment) vs MSP (enterprise) | Scope split |
| "kickoff" generic | If enterprise-tier → `kickoff-executive-alignment`; else → `onboarding-journey-design` Phase 1 | Segment gate |
| "first value" | `time-to-first-value-optimization` (measurement); journey-design references target | Owner |
| "handoff" | Sales-to-CS handoff = journey-design Phase 1; onboarding-to-CSM handoff = journey-design Phase 5 | Skill-phase distinction |

## Escalation to Other Agents

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Health scoring baseline post-onboarding** | **ally** `customer-health-scoring` | Downstream |
| **Lifecycle-value stage-1 close** | **ally** `customer-lifecycle-value-mapping` | Downstream |
| **QBR scheduled at onboarding end** | **ally** `qbr-executive-review-framework` | Downstream |
| **Post-onboarding ongoing motion** | **retain** siblings | Downstream |
| **Support-team introduction** | **keel** siblings | Coordination |
| **Product-analytics instrumentation execution** | **dana + Product** | Cross-department |
| **Sales-side execution** | future **Growth & Partnerships** | Cross-department |
| **CS-tech-stack selection** | **ally** `cs-tech-stack-selection` | Cross-agent |
| **Individual mental-health crisis** | **manager + HR Ops + EAP** | HARD BOUNDARY per Universal Principle 3 |

## Cross-Client Success Coordination

| Sibling | Coordination surface |
|---|---|
| **ally** (Lead) | Report-up; upstream tier segmentation + downstream health-baseline / QBR / lifecycle-value handoff |
| **retain** | Onboarding-to-retention motion transition |
| **keel** | Support-team introduction during onboarding |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
