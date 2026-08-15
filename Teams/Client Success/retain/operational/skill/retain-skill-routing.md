<!--
Operational: skill-routing for retain (Client Success). Non-leader.
-->

# retain — Skill Routing

> Routing for retain (Client Success / Success/Retention/Expansion). Non-leader
> — reports up to ally (Client Success Lead — Nick Mehta identity).

## Skill Roster (4 skills, all custom Route D)

| Skill | Route | Sources |
|---|---|---|
| `churn-risk-prediction` | D custom (§4.6 reclass) | Mehta 2016 + Gainsight + Vaidyanathan/Rabago + TSIA + Barnes/Ricketts |
| `expansion-motions` | D custom | Mehta 2016 + Winning by Design + Point Nine + a16z + Kellblog |
| `renewal-negotiation` | D custom | Mehta 2016 + Winning by Design + Fisher & Ury + Ury + Gainsight + Kellblog |
| `customer-advocacy` | D custom | Mehta 2016 + Bill Lee 2012 + IDC + Forrester + Influitive + Gainsight |

## Trigger-Phrase Routing

### `churn-risk-prediction`
churn risk for / at-risk accounts / renewal risk assessment for /
churn signal detection / save motion for / portfolio churn risk analysis /
churn score for

### `expansion-motions`
expansion opportunity for / upsell motion for / cross-sell for /
multi-team expansion in / land-and-expand for / NRR / net dollar retention
analysis / expansion timing for

### `renewal-negotiation`
renewal for / renewal negotiation for / renewal timing for / renewal terms for /
BATNA for renewal / renewal escalation for / contract-restructure at renewal for /
multi-year renewal for

### `customer-advocacy`
customer reference for / case study for / customer advocacy program for /
reference program design / customer community for / user conference planning /
advocacy opt-in for / reference call for

## Conflict-Resolution Rules

| Overlap | Resolution | Rationale |
|---|---|---|
| "renewal risk" | Route to `churn-risk-prediction` (risk assessment) + coordinate with `renewal-negotiation` (negotiation execution) | Risk vs execution |
| "expansion" during churn-risk | Health-gate blocks expansion per `expansion-motions` LOAD-BEARING; route to `churn-risk-prediction` first | Gate ordering |
| "reference" or "case study" | Route to `customer-advocacy` (owns opt-in + sign-off protocol) | Framework-owner |
| "customer feedback" | Product-scope feedback → Product; advocacy-scope → `customer-advocacy` | Scope split |

## Escalation to Other Agents

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Health scoring** | **ally** `customer-health-scoring` | Upstream input |
| **Lifecycle-value / QBR** | **ally** siblings | Upstream input |
| **Onboarding** | **kickoff** siblings | Cross-agent |
| **Support ops** | **keel** siblings | Cross-agent |
| **Actual sales execution** | sales / future **Growth & Partnerships** | Cross-department |
| **Contract execution / material terms** | operator + CFO + counsel | Legal execution |
| **Press reference execution** | **herald** (Comms & PR) | Cross-department |
| **Investor reference execution** | **beacon** (Comms & PR) | Cross-department |
| **Reputation-adjacent churn** | **beacon** `crisis-comms` | Escalation |
| **Product improvement from patterns** | Product | Feedback |
| **Individual mental-health crisis** | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |

## Cross-Client Success Coordination

| Sibling | Coordination surface |
|---|---|
| **ally** (Lead) | Report-up; health-score input + lifecycle-value + QBR |
| **kickoff** | Post-onboarding motion transition |
| **keel** | Support-signal input for churn + renewal risk |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
