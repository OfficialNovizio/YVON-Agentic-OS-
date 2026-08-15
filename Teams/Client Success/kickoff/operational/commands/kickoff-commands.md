<!--
Operational: commands file for kickoff. Non-leader agent.
-->

# kickoff — Commands

> Invocation patterns for kickoff (Client Success / Onboarding). Non-leader —
> reports up to ally.

## Direct Invocations

### `onboarding-journey-design`
- `kickoff: sales-to-CS handoff template` (Phase 1)
- `kickoff: journey map for [tier]` (Phase 2)
- `kickoff: milestone map for [customer]` (Phase 3)
- `kickoff: coordination handoffs for [customer]` (Phase 4)
- `kickoff: onboarding-to-CSM handoff design for [customer]` (Phase 5)

### `time-to-first-value-optimization`
- `kickoff: first-value milestone for [segment]` (Phase 1)
- `kickoff: instrumentation brief for [product]` (Phase 2)
- `kickoff: TTFV baseline + benchmark for [segment]` (Phase 3)
- `kickoff: TTFV gap + optimization plan for [customer]` (Phase 4)
- `kickoff: ally handoff for onboarding-stage close for [customer]` (Phase 5)

### `onboarding-playbooks-per-segment`
- `kickoff: segment classification criteria` (Phase 1)
- `kickoff: [segment] playbook detail` (Phase 2)
- `kickoff: playbook adaptation for [case]` (Phase 3)
- `kickoff: playbook maintenance review` (Phase 4)

### `kickoff-executive-alignment`
- `kickoff: gap-selling handoff for [customer]` (Phase 1)
- `kickoff: MSP draft for [customer]` (Phase 2)
- `kickoff: stakeholder validation for [customer]` (Phase 3)
- `kickoff: BATNA analysis for [customer]` (Phase 4)
- `kickoff: MSP formalization for [customer]` (Phase 5)

## Coordination Commands

| Command | Coordinates with | Purpose |
|---|---|---|
| `kickoff → ally: onboarding progress report` | ally | Report-up |
| `kickoff → ally: health-baseline handoff` | ally `customer-health-scoring` | Downstream Phase 5 |
| `kickoff → ally: lifecycle-value stage-1 close` | ally `customer-lifecycle-value-mapping` | Downstream Phase 5 |
| `kickoff → ally: first QBR scheduling` | ally `qbr-executive-review-framework` | Downstream |
| `kickoff → retain: post-onboarding motion transition` | retain siblings | Downstream |
| `kickoff → keel: support-team introduction` | keel siblings | Coordination |
| `kickoff → dana + Product: instrumentation brief` | dana + Product | Cross-department |
| `kickoff → dev: technical integration handoff` | dev | Cross-department |
| `kickoff ← sales: gap-selling handoff` | sales / future Growth & Partnerships | Upstream |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| Activation metrics fabrication pressure | operator | LOAD-BEARING — TTFV Principle 1 |
| MSP skip at enterprise kickoff pressure | operator | LOAD-BEARING — MSP Principle 1 |
| Sales-context handoff incomplete | sales leadership + operator | Blocking issue |
| CSM capacity constrained | CSM leadership + operator | Blocking issue |
| Executive-sponsor unavailable for MSP validation | operator + customer executive-sponsor scheduling | Blocking issue |
| BATNA analysis reveals brittle alignment | operator + retain | Strategic escalation |
| Cross-venture / cross-product onboarding complexity | ally + marcus / vista | Strategy escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `kickoff: post-onboarding motion` | retain | Scope split |
| `kickoff: support ops execution` | keel | Scope split |
| `kickoff: health-scoring framework design` | ally `customer-health-scoring` | Scope split |
| `kickoff: QBR content beyond scheduling` | ally `qbr-executive-review-framework` | Scope split |
| `kickoff: CS tech-stack selection` | ally `cs-tech-stack-selection` | Scope split |
| `kickoff: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
