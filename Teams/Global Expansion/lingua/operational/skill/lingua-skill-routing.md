<!--
Operational: skill-routing table for lingua (Global Expansion / Localization).
Non-leader agent: Universal-only principles apply.
-->

# lingua — Skill Routing

> Routing for lingua (Global Expansion / Localization). Non-leader — reports up
> to compass (Global Expansion Lead — Pankaj Ghemawat identity).

## Skill Roster (4 skills, all custom Route D)

| Skill | Route | Sources |
|---|---|---|
| `product-localization` | D custom (§4.6 reclass) | GALA + W3C i18n + Unicode CLDR + Kelly 2012 + LISA + ISO 639/3166/4217 |
| `marketing-localization` | D custom (§4.6 reclass) | CSA Research + Douglas & Craig + Meyer 2014 + de Mooij + Interbrand/WPP |
| `legal-localization` | D custom (§4.6 reclass) | ATA + FIT + Baker McKenzie + Bird & Bird + ISO 17100 + Cao 2007 |
| `cultural-adaptation` | D custom (no marketplace competitor) | Hofstede 2010 + Meyer 2014 + Trompenaars + Hall 1976 + World Values Survey |

## Trigger-Phrase Routing

### `product-localization`

- localize product for / i18n strategy for / which locales to prioritize
- RTL support for / locale identifier for / date/currency format for
- translation QA for / cultural product review for / localization roadmap / Unicode CLDR

### `marketing-localization`

- localize marketing content for / transcreate for / adapt messaging for
- brand voice for / local competitive positioning for / campaign adaptation for
- marketing translation vs transcreation for / marketing QA for / copywriter selection for

### `legal-localization`

- localize T&Cs for / privacy policy in / translate DPA for / cookie notice for
- subscription agreement localization for / IP notice localization
- legal translator certification for / counsel review for localized legal content
- legal-drafting vs legal-translation for / notarization apostille for legal doc

### `cultural-adaptation`

- cultural profile for / Hofstede analysis for / Meyer 8-scale for / Trompenaars analysis
- cross-cultural team building / cross-cultural negotiation for
- cultural appropriateness of / cultural-appropriateness gate for
- cross-cultural leadership advice for / high-context low-context for

## Conflict-Resolution Rules

| Overlap | Resolution | Rationale |
|---|---|---|
| "localize [content]" generic | Discovery per §3 — product / marketing / legal | Content-type distinction |
| "translate vs transcreate" | Route to `marketing-localization` (owns CSA transcreation decision) | Framework-owner |
| "translation for legal" | Route to `legal-localization` (owns counsel-review gate) | Legal-content specificity |
| "cultural review" | Route to `cultural-adaptation` for framework; lingua sibling coordinates for content-specific gate | Framework-owner |
| "T&Cs" or "privacy policy" or "DPA" | Route to `legal-localization` | Legal-content owner |
| "localize marketing OR product" ambiguous | Discovery — is content in-product (UI / help / transactional email) or out-of-product (headlines / campaigns / social)? | Scope distinction |
| "Meyer 8-scale" | Route to `cultural-adaptation` (framework-owner) — but `marketing-localization` applies it too | Framework-owner clarity |
| "Hofstede" | Route to `cultural-adaptation` (framework-owner) | Framework-owner |
| "RTL layout" | Route to `product-localization` | Scope owner |

## Escalation to Other Agents (out-of-scope)

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Country/market selection** | **compass** `market-selection-framework` | Selection scope |
| **Entry-mode decision** | **compass** `entry-mode-decision` | Entry-mode scope |
| **GTM strategy / AAA analysis** | **compass** `go-to-market-adaptation` | GTM scope |
| **Portfolio-mgmt** | **compass** `expansion-portfolio-mgmt` | Portfolio scope |
| **Regulatory / entity / tax / employment / data-residency compliance** | **canopy** (all 4 skills) | Regulatory scope |
| **Cross-border ops (FX / banking / payments / logistics)** | **frontier** (all 4 skills) | Cross-border ops scope |
| **International hiring** | **hire** (P&C Lead) `payroll-and-eor` | Cross-department |
| **Investor comms for material expansion** | **beacon** (Comms & PR) | Cross-department |
| **Internal / external announcement** | **signal / herald** (Comms & PR) | Cross-department |
| **Code-level i18n execution** (string extraction / JSON / RTL CSS) | **dev** (Engineering) with marketplace i18n execution skills | Engineering execution |
| **Legal-content DRAFTING** (not localization) | **operator + counsel** | Legal drafting |
| **Individual cross-cultural coaching** | **HR + operator + external cross-cultural coach** | Individual coaching scope |
| **Individual mental-health crisis signals** | **manager + HR Ops + EAP** | HARD BOUNDARY per Universal Principle 3 |

## Cross-Global Expansion Coordination

| Sibling | Coordination surface |
|---|---|
| **compass** (Lead) | Report-up; upstream inputs (CAGE Cultural axis + go-to-market Phase 5 messaging brief) |
| **canopy** (Regulatory & Compliance) | `legal-localization` triggered by canopy `data-residency-mapping` + `entity-setup-by-jurisdiction`; product/marketing localization coordinates with canopy for jurisdiction-specific content requirements |
| **frontier** (Cross-border Ops) | Currency-format localization (product) coordinates with frontier for cross-border-payment structure |

## Compile Behavior

Per §14.2: trigger phrases match front-matter `triggers:`; conflict-resolution
covers overlaps; escalation preserves scope discipline.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any skill front-matter `triggers:` change; any
  cross-agent handoff surface change.
