<!--
Operational: skill-routing for keel (Client Success / Support Ops). Non-leader.
-->

# keel — Skill Routing

> Routing for keel (Client Success / Support Ops). Non-leader — reports up to
> ally (Client Success Lead — Nick Mehta identity).

## Skill Roster (4 skills, all custom Route D §4.6 reclass)

| Skill | Route | Sources |
|---|---|---|
| `tiered-support-design` | D custom | Zendesk + Salesforce + Intercom + Mehta 2016 + ITIL |
| `sla-and-escalation-management` | D custom | ITIL + Zendesk + Salesforce + Mehta 2016 + PagerDuty |
| `support-analytics` | D custom | Reichheld + Dixon/Freeman/Toman + Bain + Zendesk + Salesforce + Mehta 2016 |
| `knowledge-base-and-self-service` | D custom | KCS v6 + Zendesk + Salesforce + Mehta 2016 + TSIA |

## Trigger-Phrase Routing

### `tiered-support-design`
tiered support design for / T1 T2 T3 escalation for / support-team
architecture / escalation routing rules / support capacity planning for /
specialist team design for / support tier design

### `sla-and-escalation-management`
SLA design for / SLA definition for / SLA breach for / escalation matrix for /
SLA capacity check for / service level objective for / SLA reporting for

### `support-analytics`
CSAT measurement for / NPS analysis for / CES measurement for /
support metrics benchmark / support analytics dashboard /
support-signal feedback to health-scoring / Voice of Customer analysis

### `knowledge-base-and-self-service`
KB article for / self-service design for / KCS methodology for /
KB taxonomy for / deflection design / SME validation for /
knowledge base structure / help center architecture

## Conflict-Resolution Rules

| Overlap | Resolution | Rationale |
|---|---|---|
| "support architecture" | `tiered-support-design` (tier + routing); `sla-and-escalation-management` (SLA + escalation matrix); coordinate | Scope split |
| "escalation" — routing vs SLA | Routing = `tiered-support-design`; SLA-triggered = `sla-and-escalation-management` | Scope split |
| "metrics" — CS-wide vs support-specific | Support-specific = `support-analytics`; CS-wide = ally | Owner distinction |
| "self-service" | `knowledge-base-and-self-service` (owns); coordinate with Product for in-product surfaces | Owner |
| "capacity" | `tiered-support-design` (team model) + `sla-and-escalation-management` (SLA capacity-check) — coordinate | Cross-skill coordination |

## Escalation to Other Agents

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Health scoring / lifecycle-value / QBR / tech-stack** | **ally** siblings | Upstream / cross-agent |
| **Onboarding** | **kickoff** siblings | Cross-agent |
| **Churn / expansion / renewal / advocacy** | **retain** siblings | Cross-agent |
| **Individual agent HR / performance** | **HR + merit (P&C)** | HR discipline |
| **Product-side reliability (SRE)** | **dev / ops (Engineering)** | Product infra |
| **Product documentation** | **Product + dev** | Product docs |
| **Multi-locale KB** | **lingua (Global Expansion)** | Localization |
| **Legal KB content** | **lingua legal-loc + counsel** | Legal review |
| **Actual support delivery** | support agents + operator | Execution |
| **Support-platform selection** | **ally** `cs-tech-stack-selection` | Platform selection |
| **Individual mental-health crisis** | **manager + HR Ops + EAP** | HARD BOUNDARY per Universal Principle 3 |

## Cross-Client Success Coordination

| Sibling | Coordination surface |
|---|---|
| **ally** (Lead) | Report-up; support-signal feeds health-scoring |
| **kickoff** | Support-team introduction during onboarding |
| **retain** | Support-signal feeds churn-risk-prediction |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
