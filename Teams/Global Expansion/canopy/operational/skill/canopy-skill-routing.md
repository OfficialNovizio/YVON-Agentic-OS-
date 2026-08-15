<!--
Operational: skill-routing table for canopy (Global Expansion / Multi-jurisdiction
Regulatory & Compliance). Non-leader agent: Universal-only principles apply,
no identity-flavored routing rules.
-->

# canopy — Skill Routing

> Routing for canopy (Global Expansion / Multi-jurisdiction Regulatory & Compliance).
> Non-leader — reports up to compass (Global Expansion Lead — Pankaj Ghemawat
> identity) for department sequencing per `Teams/Global Expansion/DEPARTMENT-WORKFLOW.md`.

## Skill Roster (4 skills, all custom Route D §4.6 reclass)

| Skill | Route | Sources |
|---|---|---|
| `entity-setup-by-jurisdiction` | D custom | PwC + Deloitte + EY + Baker McKenzie + World Bank institutional |
| `tax-registration` | D custom | OECD BEPS + PwC + Deloitte + EY + KPMG + OECD/UN Model Conventions |
| `employment-law-multi-jurisdiction` | D custom | Baker McKenzie + Littler Mendelson + ILO Conventions + DLA Piper + Ogletree Deakins |
| `data-residency-mapping` | D custom | IAPP + Bird & Bird + DLA Piper + EDPB + NIST Privacy Framework + OECD Privacy Guidelines |

## Trigger-Phrase Routing

### `entity-setup-by-jurisdiction`

- entity setup for / incorporate in / entity registration checklist for
- which entity structure in / branch vs subsidiary in / LLC vs GmbH vs SA
- representative office in / dissolve entity in / entity-dissolution planning
- local-counsel scoping for entity

### `tax-registration`

- tax registration for / tax obligations for entity in
- VAT registration in / GST registration for / sales-tax nexus in
- digital-services tax for / BEPS Pillar 2 compliance
- transfer pricing setup for / withholding-tax scoping for / DTA analysis for

### `employment-law-multi-jurisdiction`

- employment law for hiring in / probation period for
- termination requirements in / statutory severance in
- WARN Act equivalent for / collective redundancy in
- works council consultation for / non-compete enforceability in
- protected classes in / employee vs contractor classification in

### `data-residency-mapping`

- data residency for / data protection registration in
- GDPR compliance for / CCPA/CPRA for / LGPD or PDPA or POPIA or DPDPA scoping
- cross-border data transfer to / cross-border data transfer from
- SCC or adequacy or BCR for / data-processing-agreement for
- PIPL CAC security assessment

## Conflict-Resolution Rules

| Overlap | Resolution | Rationale |
|---|---|---|
| "compliance" generic — hits multiple skills | Discovery per §3 — clarify entity vs tax vs employment vs data-protection | Skill-specific scope |
| "counsel scoping for [country]" — hits multiple | Discovery — which practice area? Each skill routes to different counsel type | Practice-area distinction |
| "WARN Act" or "collective redundancy" | Route to `employment-law-multi-jurisdiction` | Employment-law scope |
| "PIPL" — could be data-residency OR entity | `data-residency-mapping` — PIPL is data-protection framework | Framework-owner |
| "GDPR" | `data-residency-mapping` | Framework-owner |
| "OECD BEPS" | `tax-registration` — BEPS is tax framework | Framework-owner |
| "transfer pricing" | `tax-registration` — tax framework | Framework-owner |
| "cross-border transfer" — data OR payment | Data = `data-residency-mapping`; payment/tax = `tax-registration` (WHT scoping) + coordinate with frontier `cross-border-payments` | Scope distinction |
| "employment tax" | Parallel — canopy `tax-registration` scopes obligation; hire's `payroll-and-eor` executes | Cross-department coordination |
| "worker classification" — canopy scopes LAW; hire executes CLASSIFICATION | canopy `employment-law-multi-jurisdiction` scopes jurisdiction test; hire's `payroll-and-eor` executes W-2/1099/EOR/PEO decision | Clear scope split |
| "HR data residency" | `data-residency-mapping` (canopy owns jurisdiction-mapping) + hire (P&C data classification) + warden/veil (Cybersecurity technical) | Cross-agent coordination |

## Escalation to Other Agents (out-of-scope)

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Country/market selection** | **compass** `market-selection-framework` (Global Expansion Lead) | Selection scope, not compliance |
| **Entry-mode decision** | **compass** `entry-mode-decision` | Entry-mode scope |
| **GTM adaptation for market** | **compass** `go-to-market-adaptation` | GTM scope |
| **Portfolio-mgmt / market-exit protocol** | **compass** `expansion-portfolio-mgmt` (coordinates with canopy for divest employment-law + entity-dissolution) | Portfolio scope |
| **Product / marketing / cultural / legal-doc localization** | **lingua** (all 4 skills) | Localization scope |
| **FX / banking / payments / logistics** | **frontier** (all 4 skills) | Cross-border ops scope |
| **W-2 / 1099 / EOR / PEO CLASSIFICATION EXECUTION** | **hire** `payroll-and-eor` (P&C Lead) | Execution scope; canopy scopes LAW |
| **International hiring workforce planning** | **hire** `workforce-planning` | Cross-department |
| **Technical GRC implementation (SOC 2 / ISO 27001 / ISO 27701)** | **warden + veil + bastion** (Cybersecurity) | Cross-department technical implementation |
| **PII redaction + data-protection technical controls** | **warden + veil + bastion** (Cybersecurity) | Technical implementation |
| **Breach-response execution** | **warden + operator + breach-response counsel** | Breach-response playbook |
| **Investor comms for material regulatory event** | **beacon** `investor-cadence` (Reg FD fence) | Comms & PR cross-department |
| **Internal announcement of regulatory event** | **signal** `change-comms` or `internal-cadence` | Internal comms |
| **External press announcement of regulatory event** | **herald** `press-kit` + `media-relations` | External PR |
| **Individual mental-health crisis signals** | **manager + HR Ops + EAP** | HARD BOUNDARY per Universal Principle 3 |
| **Legal formalization / contract drafting / filings** | **operator + relevant counsel** per practice area | Legal execution scope |

## Cross-Global Expansion Coordination

canopy is one of 3 Global Expansion non-leader agents. Coordination:

| Sibling | Coordination surface |
|---|---|
| **compass** (Lead) | Report-up chain; upstream sequencing (selection → entry-mode → GTM → canopy scoping) |
| **lingua** (Localization) | Legal-localization coordinates with canopy for jurisdiction-specific legal-doc adaptation |
| **frontier** (Cross-border Ops) | Cross-border payment flows coordinate with canopy tax-registration WHT + data-residency for payment data |

## Compile Behavior

Per §14.2: trigger phrases match front-matter `triggers:` verbatim; conflict-
resolution covers every plausible overlap; escalation preserves scope discipline.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any skill front-matter `triggers:` change; any cross-
  agent handoff surface change.
