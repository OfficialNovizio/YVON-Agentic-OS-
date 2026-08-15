<!--
Operational: commands file for retain. Non-leader agent.
-->

# retain — Commands

> Invocation patterns for retain (Client Success / Success/Retention/Expansion).
> Non-leader — reports up to ally.

## Direct Invocations

### `churn-risk-prediction`
- `retain: signal inventory for [customer]` (Phase 1)
- `retain: risk score for [customer]` (Phase 2)
- `retain: save motion for [tier] risk` (Phase 3)
- `retain: escalation for [RED-tier account]` (Phase 4)
- `retain: portfolio churn analysis` (Phase 5)

### `expansion-motions`
- `retain: expansion opportunity gate check for [customer]` (Phase 1 — LOAD-BEARING)
- `retain: motion qualification for [opportunity]` (Phase 2)
- `retain: motion design for [customer]` (Phase 3)
- `retain: sales handoff brief for [opportunity]` (Phase 4)

### `renewal-negotiation`
- `retain: renewal window setup for [customer]` (Phase 1)
- `retain: value-realized evidence for [renewal]` (Phase 2 — LOAD-BEARING)
- `retain: BATNA analysis for [renewal]` (Phase 3)
- `retain: negotiation playbook for [customer]` (Phase 4)
- `retain: post-renewal tracker for [customer]` (Phase 5)

### `customer-advocacy`
- `retain: advocacy program design for [segment]` (Phase 1)
- `retain: opt-in + sign-off for [customer]` (Phase 2 — LOAD-BEARING)
- `retain: advocacy pipeline for [quarter]` (Phase 3)
- `retain: reference request from [herald/beacon/sales] for [use case]` (Phase 4)

## Coordination Commands

| Command | Coordinates with | Purpose |
|---|---|---|
| `retain → ally: churn-risk pattern feedback for health-score recalibration` | ally `customer-health-scoring` | Upstream feedback |
| `retain → ally: renewal-value patterns for lifecycle-value refinement` | ally `customer-lifecycle-value-mapping` | Upstream feedback |
| `retain → ally: QBR risk / expansion input` | ally `qbr-executive-review-framework` | Coordination |
| `retain ← kickoff: post-onboarding motion transition` | kickoff siblings | Upstream trigger |
| `retain ← keel: support-signal input` | keel `support-analytics` | Upstream |
| `retain → sales / future Growth & Partnerships: expansion handoff` | sales | Downstream |
| `retain → operator + CFO + counsel: material renewal terms` | operator + CFO + counsel | Escalation |
| `retain → herald: press reference request processing` | herald `press-kit` + `media-relations` | Coordination |
| `retain → beacon: investor reference request processing` | beacon `investor-cadence` | Coordination |
| `retain → beacon: reputation-adjacent churn escalation` | beacon `crisis-comms` | Escalation |
| `retain → Product: pattern feedback` | Product | Feedback |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| Vibes-based churn prediction pressure | operator | LOAD-BEARING — churn Principle 1 |
| Expansion push without value-realized-evidence pressure | operator + retain leadership | LOAD-BEARING — expansion Principle 1 |
| Renewal-negotiation without value-evidence pressure | operator + retain leadership | LOAD-BEARING — renewal Principle 1 |
| Customer identity publication without sign-off pressure | operator + counsel | LOAD-BEARING — advocacy Principle 1 |
| RED-tier churn risk with strategic-account impact | operator + marcus / vista + retain leadership | Strategic escalation |
| Material renewal-term change | operator + CFO + counsel | LOAD-BEARING — Universal Principle 5 |
| Renewal-adjacent crisis-comms | beacon `crisis-comms` + operator | Escalation |
| Pattern reveals systemic product / pricing issue | Product + operator | Feedback escalation |
| Governance approval for major retain decision | board (Governance) | Governance escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `retain: CS strategy / health-scoring / QBR / tech-stack` | ally | Scope split |
| `retain: onboarding execution` | kickoff | Scope split |
| `retain: support ops execution` | keel | Scope split |
| `retain: sales execution` | sales / future Growth & Partnerships | Cross-department |
| `retain: contract execution / material term drafting` | operator + CFO + counsel | Execution scope |
| `retain: press execution / investor comms execution` | herald / beacon | Cross-department |
| `retain: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
