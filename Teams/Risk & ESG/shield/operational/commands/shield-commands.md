# shield — Commands

> Invocation patterns for shield. Non-leader — reports up to pilot.

## Direct Invocations

### `business-continuity-planning`
- `shield: BIA for [process]` (Phase 1)
- `shield: continuity strategy for [priority]` (Phase 2)
- `shield: BCP documentation + awareness` (Phase 3)
- `shield: BCP exercise for [scenario]` (Phase 4 — LOAD-BEARING)
- `shield: BCP maintenance review` (Phase 5)

### `disaster-recovery-planning`
- `shield: business-derived RTO/RPO for [system]` (Phase 1 — LOAD-BEARING)
- `shield: DR strategy selection for [system]` (Phase 2)
- `shield: DR runbook for [system]` (Phase 3)
- `shield: DR testing for [system]` (Phase 4)
- `shield: DR maintenance` (Phase 5)

### `third-party-risk-management`
- `shield: vendor tiering` (Phase 1)
- `shield: DD for [vendor]` (Phase 2)
- `shield: security + compliance + contract review for [vendor]` (Phase 3 — LOAD-BEARING)
- `shield: ongoing monitoring for [vendor]` (Phase 4)
- `shield: exit management for [vendor]` (Phase 5)

### `operational-resilience-testing`
- `shield: IBS + impact tolerance for [service]` (Phase 1 — LOAD-BEARING)
- `shield: end-to-end mapping for [IBS]` (Phase 2)
- `shield: severe-but-plausible scenario test for [IBS]` (Phase 3)
- `shield: tolerance-breach action for [IBS]` (Phase 4)
- `shield: regulatory reporting for [jurisdiction]` (Phase 5)

## Coordination Commands

| Command | Coordinates with |
|---|---|
| `shield → pilot: resilience risk data` | pilot |
| `shield → hazard: risk-treatment coordination` | hazard |
| `shield → prism: third-party ESG risk` | prism |
| `shield → warden + veil + bastion: cyber BCP/DR execution` | Cybersecurity |
| `shield → canopy + counsel: data-processing agreement + jurisdiction compliance` | canopy + counsel |
| `shield → canopy + counsel: international resilience regulation` | canopy + counsel |
| `shield → beacon: material resilience investor comms` | beacon (Reg FD) |
| `shield → beacon: BCP activation crisis-comms` | beacon `crisis-comms` |
| `shield → bond: partner-vendor overlap` | bond (Growth & Partnerships) |
| `shield → ops + dev: operational execution` | Engineering |
| `shield → grove: BCP awareness training` | grove (P&C) |
| `shield → operator + regulator: regulatory reporting` | Escalation |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| BCP exercise deferred pressure | operator + pilot | LOAD-BEARING — BCP Principle 1 |
| RTO/RPO business-input absent | operator + business owner | LOAD-BEARING — DR Principle 1 |
| Third-party engagement without review pressure | operator + counsel + warden | LOAD-BEARING — TPRM Principle 1 |
| IBS without impact tolerance pressure | operator + board | LOAD-BEARING — resilience Principle 1 |
| Critical vendor incident | operator + warden + counsel | Escalation |
| Tolerance-breach detected | operator + board + regulator (per jurisdiction) | Regulatory + governance |
| Regulatory reporting delay | operator + counsel | Legal escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route |
|---|---|
| `shield: risk strategy` | pilot |
| `shield: enterprise risk day-to-day` | hazard |
| `shield: ESG reporting` | prism |
| `shield: cyber technical execution` | warden + veil + bastion |
| `shield: data-processing agreement drafting` | canopy + counsel |
| `shield: regulatory filing submission` | operator + counsel |
| `shield: individual crisis support` | manager + HR Ops + EAP |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
