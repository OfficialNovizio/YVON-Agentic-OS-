<!--
Operational: skill-routing table for compass (Global Expansion / Market Selection
& Entry — Lead). Leader agent: Universal + Ghemawat-flavored routing rules.

§7 rules for this file:
1. Every skill in compass's roster has a row.
2. Trigger-phrase column mirrors each skill's front-matter `triggers:` list.
3. Conflict-resolution section addresses overlap between skills.
4. Escalation-to-other-agents rows for out-of-scope requests.
-->

# compass — Skill Routing

> Routing for compass (Global Expansion Lead — Pankaj Ghemawat identity).
> Leader agent — sequences canopy, lingua, frontier per `Teams/Global
> Expansion/DEPARTMENT-WORKFLOW.md`.

## Skill Roster (4 skills, all custom Route D)

| Skill | Route | Sources |
|---|---|---|
| `market-selection-framework` | D custom (§4.6 reclass) | Ghemawat 2001 HBR + 2007 + 2011 + Rugman & Verbeke 2004 + Douglas & Craig + institutional political-risk indicators |
| `entry-mode-decision` | D custom (§4.6 reclass) | Root 1994 + Ghemawat 2007 + Hill textbook + Anderson & Gatignon 1986 + McKinsey/BCG matrices |
| `go-to-market-adaptation` | D custom (§4.6 reclass) | Ghemawat 2007 (AAA framework) + Douglas & Craig + Kotler & Keller + Meyer 2014 + HBR corpus |
| `expansion-portfolio-mgmt` | D custom (§4.6 reclass) | Ghemawat 2007 + 2011 + Rugman & Verbeke 2004 + Porter 1980 + BCG + MGI |

## Trigger-Phrase Routing

### `market-selection-framework` (Phase 1 of expansion)

- which market should we enter next / market selection / country prioritization
- CAGE analysis for / distance analysis for
- which country next after / first-market-adjacency
- expansion candidate assessment / market portfolio prioritization
- Liability of Foreignness / LOF assessment / foreignness cost estimate

### `entry-mode-decision` (Phase 2 of expansion)

- entry mode for / how to enter [country]
- greenfield vs acquisition for / JV vs licensing for / distributor vs direct sales in
- franchising vs licensing for / acquisition vs greenfield in
- Root 7-mode framework / entry-mode decision matrix

### `go-to-market-adaptation` (Phase 3 of expansion)

- GTM plan for / adapt product for / pricing for / positioning in
- channel strategy for / AAA analysis for / Adaptation Aggregation Arbitrage
- GTM adaptation after entry-mode decision / marketing mix for / 4Ps for

### `expansion-portfolio-mgmt` (Phase 4+ of expansion — ≥3 markets)

- market portfolio review / annual expansion review / multi-market resource allocation
- which markets to double down / hold / divest
- market divest decision / market exit protocol / exit [market]
- cross-market learning / portfolio rebalance across markets
- regional vs global strategy decision

## Conflict-Resolution Rules

| Overlap | Resolution | Rationale |
|---|---|---|
| "which market" — hits `market-selection-framework` + `expansion-portfolio-mgmt` | If NEW market being added to portfolio → market-selection-framework. If EXISTING portfolio rebalancing → expansion-portfolio-mgmt | New vs. existing distinction |
| "market entry" ambiguous — selection vs. mode | Discovery per §3 — clarify which phase. Default to skill 1 if org has <3 markets; default to skill 2 if a country is already picked | Phase sequence |
| "pricing" — could hit `go-to-market-adaptation` (compass) OR `entity-setup-by-jurisdiction` (canopy for tax-affected pricing) | GTM pricing decisions → compass skill 3. Tax-driven pricing implications → canopy | Owner distinction |
| "regional strategy" — hits `market-selection-framework` (regional adjacency) + `expansion-portfolio-mgmt` (regional clustering) | Phase-1 use → skill 1. Portfolio-review use → skill 4 | Phase distinction |
| "AAA framework" | Route to `go-to-market-adaptation` (compass owns AAA per Ghemawat 2007 Ch. 6) | Clear framework-owner |
| "CAGE analysis" | Route to `market-selection-framework` (compass owns CAGE per Ghemawat 2001) | Clear framework-owner |
| "distance framework" ambiguous | Discovery — CAGE (compass) vs. Meyer 8-scale cultural (lingua `cultural-adaptation`) | Framework-owner distinction |

## Escalation to Other Agents (out-of-scope)

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Entity setup + legal registration in country** | **canopy** `entity-setup-by-jurisdiction` | Regulatory scope, not selection |
| **Tax registration + tax compliance** | **canopy** `tax-registration` | Tax scope |
| **Employment law in international jurisdiction** | **canopy** `employment-law-multi-jurisdiction` | Employment-law scope |
| **Data residency mapping (GDPR / LGPD / PIPL etc.)** | **canopy** `data-residency-mapping` (coordinates with warden + veil) | Data-protection scope |
| **Product technical i18n / RTL / character encoding** | **lingua** `product-localization` | Technical localization |
| **Marketing content translation + cultural adaptation** | **lingua** `marketing-localization` | Marketing localization |
| **Legal document translation** | **lingua** `legal-localization` | Legal-doc localization |
| **Cultural adaptation (Hofstede + Meyer deep application)** | **lingua** `cultural-adaptation` | Deep cultural work |
| **FX / treasury / cross-border banking / payments / international logistics** | **frontier** (all 4 skills) | Cross-border ops scope |
| **International hiring (payroll + EOR + worker classification)** | **hire** `payroll-and-eor` (P&C Lead) | Cross-department |
| **Investor comms for material expansion event** | **beacon** `investor-cadence` (Reg FD fence) | Comms & PR cross-department |
| **Internal announcement of expansion decision** | **signal** `change-comms` or `internal-cadence` (Comms & PR) | Internal comms |
| **External press announcement of expansion** | **herald** `press-kit` + `media-relations` (Comms & PR) | External PR |
| **Crisis-adjacent expansion event** (regulatory-action / geopolitical) | **beacon** `crisis-comms` | Crisis scope |
| **Fundraising to fund expansion** | **echo** (Executive Office) | Fundraising scope |
| **Strategic-vision-level expansion decisions** | **marcus / vista** (Executive Office) | Strategy scope |
| **Individual mental-health crisis signals** | **manager + HR Ops + EAP** | HARD BOUNDARY per Universal Principle 3 |
| **Sanctions / trade-restriction check** | **operator + international-trade counsel** | Legal-fence Universal Principle 5 |
| **Financial-portfolio management (stocks / ETFs / treasury)** | **operator + CFO** | NOT compass — different domain |

## Cross-Global Expansion Coordination

compass is the LEAD of 4 Global Expansion agents. Coordination surfaces:

| Sibling | Coordination surface |
|---|---|
| **canopy** (Regulatory & Compliance) | Regulatory scoping starts once market selected; entity setup after entry-mode chosen |
| **lingua** (Localization) | Localization scoping starts once GTM adaptation Phase 3 identifies localization needs |
| **frontier** (Cross-border Ops) | FX + banking + payments + logistics scoped once entry mode + GTM channel finalized |

## Compile Behavior

Per §14.2:

- Trigger phrases match each skill's front-matter `triggers:` verbatim
- Conflict-resolution rules cover every plausible overlap
- Escalation-to-other-agents preserves scope discipline per §2 routing + Global
  Expansion DEPARTMENT-WORKFLOW

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `triggers:` front-matter;
  any new compass skill; any change to cross-agent handoff surfaces.
