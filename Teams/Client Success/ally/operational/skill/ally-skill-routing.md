<!--
Operational: skill-routing table for ally (Client Success — Lead). Leader agent.
-->

# ally — Skill Routing

> Routing for ally (Client Success Lead — Nick Mehta identity).
> Leader agent — sequences kickoff, retain, keel per DEPARTMENT-WORKFLOW.

## Skill Roster (4 skills, all custom Route D)

| Skill | Route | Sources |
|---|---|---|
| `customer-health-scoring` | D custom (§4.6 reclass) | Mehta 2016 + Vaidyanathan/Rabago 2020 + Bhatt/Chinnappa 2018 + Gainsight + TSIA |
| `customer-lifecycle-value-mapping` | D custom (§4.6 reclass) | Mehta 2016 + Kaplan/Norton Balanced Scorecard + Bhatt/Chinnappa + Vaidyanathan/Rabago + TSIA |
| `qbr-executive-review-framework` | D custom (§4.6 reclass) | Mehta 2016 + Vaidyanathan/Rabago + Miller Heiman + Gainsight + TSIA |
| `cs-tech-stack-selection` | D custom (stinger) | G2 + Forrester + vendor materials + TSIA + Mehta 2016 |

## Trigger-Phrase Routing

### `customer-health-scoring`
- health score for / customer health dashboard / at-risk customers
- health score dimensions / segment health scores / health score benchmark
- health-scoring framework for / customer health rollup for
- green yellow red customer scoring

### `customer-lifecycle-value-mapping`
- lifecycle map for / value realization for / milestone tracking for
- value gaps in / customer maturity assessment / stage-specific value for
- value-delivery evidence for

### `qbr-executive-review-framework`
- QBR prep for / quarterly business review for / EBR agenda for
- prior QBR commitments for / expansion opportunity in QBR
- QBR risk escalation / QBR facilitation for / post-QBR commitment tracking

### `cs-tech-stack-selection`
- CS platform selection / Gainsight vs ChurnZero / CS tech stack for
- CS platform RFP / CS platform migration risk / which CS platform for
- customer success software selection

## Conflict-Resolution Rules

| Overlap | Resolution | Rationale |
|---|---|---|
| "health" + "churn" overlap | Health scoring = ally (input); churn prediction = retain (uses health as input) | Owner distinction |
| "expansion opportunity" | ally `qbr-executive-review-framework` for QBR-surfacing; retain `expansion-motions` for execution | Phase distinction |
| "value" generic | ally `customer-lifecycle-value-mapping` (strategic); Product for product-value definition | Scope distinction |
| "review" generic | Discovery — QBR (ally) vs performance review (merit — P&C) vs code review (dev) | Cross-agent distinction |
| "customer lifecycle" vs "customer journey" | Lifecycle-VALUE = ally; UX-touchpoint journey = Product/ux/loom | Framework distinction |
| "onboarding" | kickoff (execution); ally coordinates strategy | Owner distinction |
| "renewal" | retain `renewal-negotiation` (execution); ally coordinates strategy via QBR | Owner distinction |

## Escalation to Other Agents (out-of-scope)

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Onboarding-stage execution** | **kickoff** (Client Success sibling) | Scope split |
| **Churn / expansion / renewal execution** | **retain** (Client Success sibling) | Scope split |
| **Support ops / SLA / knowledge base** | **keel** (Client Success sibling) | Scope split |
| Product decisions from CS feedback | spec / metric / ux / loom (Product) | Product scope |
| Product analytics / usage data | dana (Engineering) or Product | Data scope |
| CS team hiring | hire (P&C Lead) | Cross-department |
| Sales-to-CS handoff at onboarding | future Growth & Partnerships dept when built | Cross-department |
| Customer references / case studies in press | herald (Comms & PR) `press-kit` (with customer sign-off) | Cross-department |
| Customer references in investor comms | beacon (Comms & PR) `investor-cadence` (aggregate + sign-off) | Cross-department |
| Multi-market customer coordination | compass + canopy + lingua (Global Expansion) | Cross-department |
| Contract-negotiation legal escalation | operator + counsel | Legal fence |
| Individual mental-health crisis | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |

## Cross-Client Success Coordination

ally is the LEAD of 4 Client Success agents. Coordination:

| Sibling | Coordination surface |
|---|---|
| **kickoff** (Onboarding) | Health-score baseline from onboarding activation; lifecycle-value stage-1 handoff |
| **retain** (Success/Retention/Expansion) | Health-score input for churn + renewal + expansion; QBR risk + expansion gating |
| **keel** (Support Ops) | Support-signal input for health-score + QBR; CSAT/NPS feeds value-realization |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any skill front-matter `triggers:` change; any
  cross-agent handoff surface change.
