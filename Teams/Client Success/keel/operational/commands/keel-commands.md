<!--
Operational: commands file for keel. Non-leader agent.
-->

# keel — Commands

> Invocation patterns for keel (Client Success / Support Ops). Non-leader —
> reports up to ally.

## Direct Invocations

### `tiered-support-design`
- `keel: tier definitions for [org]` (Phase 1)
- `keel: routing rules matrix` (Phase 2)
- `keel: capacity model for [tier]` (Phase 3)
- `keel: CS-coordination integration brief` (Phase 4)

### `sla-and-escalation-management`
- `keel: SLA matrix for [tier × severity]` (Phase 1)
- `keel: capacity-check for [SLA commitment]` (Phase 2 — LOAD-BEARING)
- `keel: escalation matrix design` (Phase 3)
- `keel: breach post-mortem for [ticket]` (Phase 4)

### `support-analytics`
- `keel: metric selection for [objective]` (Phase 1)
- `keel: measurement instrumentation for [metric]` (Phase 2)
- `keel: segmentation dashboard for [scope]` (Phase 3)
- `keel: analytics feedback loop to ally + Product` (Phase 4)

### `knowledge-base-and-self-service`
- `keel: KCS discipline foundation for [team]` (Phase 1)
- `keel: KB structure + taxonomy for [product]` (Phase 2)
- `keel: self-service surface design` (Phase 3)
- `keel: article lifecycle + SME validation for [article]` (Phase 4 — LOAD-BEARING)

## Coordination Commands

| Command | Coordinates with | Purpose |
|---|---|---|
| `keel → ally: support-signal for health-scoring dimension` | ally `customer-health-scoring` | Downstream |
| `keel → ally: analytics feedback for lifecycle-value refinement` | ally `customer-lifecycle-value-mapping` | Coordination |
| `keel → ally: support-input for QBR` | ally `qbr-executive-review-framework` | Upstream input for QBR |
| `keel → retain: support-signal for churn-risk` | retain `churn-risk-prediction` | Downstream |
| `keel → kickoff: support-team introduction during onboarding` | kickoff `onboarding-journey-design` | Coordination |
| `keel → lingua: multi-locale KB coordination` | lingua `product-localization` + `legal-localization` | Cross-department |
| `keel → Product / dev: T3 engineering escalation + product documentation coordination` | Product + dev | Cross-department |
| `keel → grove: KCS + support-team training` | grove (P&C) | Cross-department |
| `keel → hire: support-team hiring` | hire (P&C Lead) | Cross-department |
| `keel → HR + merit: individual agent performance handling` | HR + merit (P&C) | Cross-department |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| SLA commitment pressure without capacity | operator + CSM leadership | LOAD-BEARING — SLA Principle 1 |
| Individual agent perf data external-publication pressure | operator + HR | LOAD-BEARING — support-analytics Principle 1 |
| KB article publication without SME validation pressure | operator | LOAD-BEARING — KB Principle 1 |
| Recurring SLA breach pattern | CSM leadership + operator + potentially product | Systemic escalation |
| Enterprise-tier custom SLA at renewal | retain `renewal-negotiation` + operator + counsel | Coordination |
| Reputation-adjacent support crisis | beacon `crisis-comms` + operator | Escalation |
| Regulated-content KB (health / financial / legal) | operator + counsel | Legal review |
| Multi-locale KB legal-content | lingua `legal-localization` + counsel | Cross-department + legal |
| Governance approval for major support decision | board (Governance) | Governance escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `keel: CS strategy / health-scoring / QBR / tech-stack` | ally | Scope split |
| `keel: onboarding execution` | kickoff | Scope split |
| `keel: churn / expansion / renewal / advocacy execution` | retain | Scope split |
| `keel: actual support delivery / ticket resolution` | support agents + operator | Execution scope |
| `keel: support-platform admin` | operator + IT | Platform admin |
| `keel: individual agent HR / performance evaluation` | HR + merit (P&C) | HR discipline |
| `keel: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
