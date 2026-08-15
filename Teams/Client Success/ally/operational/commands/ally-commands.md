<!--
Operational: commands file for ally (Client Success Lead) per §7 commands/.
-->

# ally — Commands

> Invocation patterns for ally (Client Success Lead — Nick Mehta identity).
> Leader — sequences kickoff, retain, keel per DEPARTMENT-WORKFLOW.

## Direct Invocations

### `customer-health-scoring`

| Command | Skill phase | Output |
|---|---|---|
| `ally: health scoring framework for [tier]` | Phase 1 | Dimension + weight matrix per tier |
| `ally: data-signal sourcing for [dimension]` | Phase 2 | Sourcing plan with coordination briefs |
| `ally: health score for [customer]` | Phase 3 | Score + segmentation |
| `ally: action mapping for [tier]` | Phase 4 | Playbook per tier |
| `ally: quarterly health-score recalibration` | Phase 5 | Outcome-validation report |

### `customer-lifecycle-value-mapping`

| Command | Skill phase | Output |
|---|---|---|
| `ally: lifecycle map for [customer/segment]` | Phase 1 | Stage map + transitions |
| `ally: per-stage value for [tier/segment]` | Phase 2 | Balanced-Scorecard value definitions |
| `ally: milestone evidence for [value claim]` | Phase 3 | Evidence log |
| `ally: value gaps for [customer]` | Phase 4 | Gap + intervention plan |
| `ally: cross-agent handoff for [stage gap]` | Phase 5 | Handoff brief |

### `qbr-executive-review-framework`

| Command | Skill phase | Output |
|---|---|---|
| `ally: QBR prep for [customer]` | Phases 1-2 | Data-prep + stakeholder mapping + agenda |
| `ally: QBR facilitation notes for [customer]` | Phase 3 | Per-section facilitation notes |
| `ally: post-QBR tracking update for [customer]` | Phase 5 | Commitment tracker update |

### `cs-tech-stack-selection`

| Command | Skill phase | Output |
|---|---|---|
| `ally: CS platform needs assessment` | Phase 1 | Needs-assessment memo |
| `ally: CS platform shortlist` | Phase 2 | Top 3-4 with fit-analysis |
| `ally: CS platform decision matrix` | Phase 3 | Weighted scoring |
| `ally: CS platform RFP + reference calls` | Phase 4 | RFP + demo + reference findings |
| `ally: CS platform recommendation` | Phase 5 | Recommendation for operator + procurement + CFO |

## Coordination Commands (cross-agent — ally sequences Client Success)

| Command | Coordinates with | Purpose |
|---|---|---|
| `ally → kickoff: onboarding baseline for [customer]` | kickoff (Client Success sibling) | Downstream sequencing |
| `ally → retain: churn risk from health score for [customer]` | retain `churn-risk-prediction` | Downstream |
| `ally → retain: renewal risk from QBR for [customer]` | retain `renewal-negotiation` | Downstream |
| `ally → retain: expansion opportunity from QBR (GREEN-gated)` | retain `expansion-motions` | Downstream (LOAD-BEARING gated) |
| `ally → keel: support-signal request for health-score dimension` | keel `support-analytics` | Upstream input |
| `ally → Product / dana: usage-analytics data request` | Product / dana | Cross-department |
| `ally → herald: customer reference for press (with sign-off)` | herald `press-kit` | Cross-department (per Principle 2) |
| `ally → beacon: aggregate CS metrics for investor comms` | beacon `investor-cadence` | Cross-department (aggregate-only) |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| Health-scoring pressure for inflated score | operator | LOAD-BEARING — customer-health Principle 1 |
| Value claims without evidence pressure | operator | LOAD-BEARING — lifecycle-value Principle 1 |
| QBR without prior-close-loop pressure | operator | LOAD-BEARING — QBR Principle 1 |
| Expansion push during customer-strain | operator + retain | LOAD-BEARING — QBR Principle 2 |
| CS platform recommendation without cross-functional scoping | operator + procurement + CFO | LOAD-BEARING — tech-stack Principle 1 |
| Vendor-lock-in ignored pressure | operator + procurement + counsel | LOAD-BEARING — tech-stack Principle 2 |
| Customer identity data external publication | operator + counsel + customer sign-off | Universal Principle 2 aggregate-only + sign-off |
| Customer contract-negotiation legal escalation | operator + counsel | Legal fence |
| Cross-venture customer coordination | marcus / vista (Executive Office) | Strategy escalation |
| Governance approval for major CS decision | board (Governance) | Governance escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `ally: onboarding execution` | kickoff | Scope split |
| `ally: churn / expansion / renewal execution` | retain | Scope split |
| `ally: support ops execution` | keel | Scope split |
| `ally: product decision` | Product (spec / metric / ux / loom) | Product scope |
| `ally: sales execution` | future Growth & Partnerships dept | Cross-department |
| `ally: hire CSM` | hire (P&C Lead) | Cross-department |
| `ally: publish individual customer data` | Decline per Universal Principle 2 aggregate-only + sign-off | HARD BOUNDARY |
| `ally: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
