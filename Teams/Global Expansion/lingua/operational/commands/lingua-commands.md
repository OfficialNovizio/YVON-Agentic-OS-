<!--
Operational: commands file for lingua (Global Expansion / Localization) per §7
commands/. Non-leader agent.
-->

# lingua — Commands

> Invocation patterns for lingua (Global Expansion / Localization). Non-leader —
> reports up to compass.

## Direct Invocations

### `product-localization`

| Command | Skill phase | Output |
|---|---|---|
| `lingua: localization strategy for [locales]` | Phase 1 | Locale prioritization + feature scope + timing |
| `lingua: locale identifier for [market]` | Phase 2 | BCP 47 + Unicode CLDR data |
| `lingua: engineering coordination brief for [feature]` | Phase 3 | Engineering handoff |
| `lingua: non-code localization spec for [locale]` | Phase 4 | Date/currency/address/phone/name formats |
| `lingua: cultural product review for [locale]` | Phase 5 | Colors / imagery / icons review |
| `lingua: translation QA plan for [locale]` | Phase 6 | Linguistic + functional + cultural + in-context |
| `lingua: launch readiness for [locale]` | Phase 6 | Launch checklist |

### `marketing-localization`

| Command | Skill phase | Output |
|---|---|---|
| `lingua: transcreation-vs-translation decision for [content]` | Phase 2 | Per-content-type decision matrix |
| `lingua: transcreator selection for [locale]` | Phase 3 | ATA/FIT/native-speaker requirements + brand voice guidelines |
| `lingua: brand voice guidelines for transcreation` | Phase 3 | Voice attributes preservation document |
| `lingua: local competitive-context adaptation for [market]` | Phase 4 | Competitors + media + cultural context memo |
| `lingua: marketing QA + cultural gate for [locale]` | Phase 5 | Gate + native-speaker sign-off |

### `legal-localization`

| Command | Skill phase | Output |
|---|---|---|
| `lingua: legal-doc scope for [jurisdiction]` | Phase 1 | Docs required memo |
| `lingua: legal-translation vs legal-drafting for [doc]` | Phase 2 | Decision memo with counsel confirmation |
| `lingua: certified translator for [language pair]` | Phase 3 | ATA/FIT/ISO 17100/sworn requirements |
| `lingua: jurisdiction-format for [doc in country]` | Phase 4 | Language precedence / notarization / apostille / bilingual |
| `lingua: counsel-review gate for localized legal content` | Phase 5 | LOAD-BEARING gate checklist |

### `cultural-adaptation`

| Command | Skill phase | Output |
|---|---|---|
| `lingua: cultural profile for [country]` | Phase 2 | Multi-framework profile |
| `lingua: Hofstede analysis for [country]` | Phase 2 | Hofstede 6-dimension per Hofstede Insights |
| `lingua: Meyer 8-scale for [country]` | Phase 2 | Meyer country mapping |
| `lingua: Trompenaars analysis for [country]` | Phase 2 | Trompenaars 7-dimension |
| `lingua: application for [decision] in [culture]` | Phase 3 | Leadership / team / negotiation / product / messaging |
| `lingua: cultural-appropriateness gate for [content]` | Phase 4 | APPROVE / REVISE / ESCALATE |
| `lingua: cross-cultural learning retro for [decision]` | Phase 5 | Post-decision retrospective |

## Coordination Commands (cross-agent)

| Command | Coordinates with | Purpose |
|---|---|---|
| `lingua → compass: localization progress report` | compass (Global Expansion Lead) | Report-up |
| `lingua → canopy: legal-loc from data-residency scoping` | canopy `data-residency-mapping` | Upstream trigger response |
| `lingua → canopy: legal-loc from entity-setup` | canopy `entity-setup-by-jurisdiction` | Upstream trigger response |
| `lingua → canopy: cultural-appropriateness gate for legal content` | canopy | Coordination |
| `lingua → frontier: currency-format for cross-border payments` | frontier `cross-border-payments` | Coordination |
| `lingua → dev: code-level i18n handoff` | dev (Engineering) | Downstream engineering execution |
| `lingua → spark / atlas / lena: brand voice guidelines coordination` | Brand Studio | Cross-department |
| `lingua → hire: cross-cultural team building input` | hire (P&C Lead) | Cross-department |
| `lingua → merit: culturally-adapted feedback methods input` | merit (P&C) `feedback-methods` | Cross-department |
| `lingua → signal: cross-cultural internal comms adaptation` | signal (Comms & PR) | Cross-department |
| `lingua → herald: cross-cultural media / spokesperson prep` | herald (Comms & PR) `media-training` | Cross-department |
| `lingua → herald: press-release localization coordination` | herald `press-kit` + `media-relations` | Cross-department |
| `lingua → beacon: material regulatory-content localization for investors` | beacon `investor-cadence` | Reg FD coordination |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| Cultural-identity tension surfaces in cross-cultural discussion | HR + EAP + potentially culturally-competent counselor | HARD BOUNDARY |
| Machine-translation pressure for marketing/legal content | operator | LOAD-BEARING — marketing-loc Principle 1 + legal-loc Principle 2 |
| Legal-content publication without counsel review | operator + local counsel | LOAD-BEARING — legal-loc Principle 1 |
| Cultural-appropriateness gate ESCALATE (high-risk content) | operator + external cultural consultant + potentially local counsel | Cultural risk beyond skill scope |
| Certified translator unavailable for language pair | operator + procurement + counsel-network | Vendor-network expansion |
| Local counsel unavailable in jurisdiction (for legal-loc) | operator + international-trade counsel | Legal-fence escalation |
| Sensitive-topic content (health / financial / political / religious) | `legal-localization` + relevant counsel + `cultural-adaptation` | Multi-skill coordination |
| Cross-jurisdiction legal-content inconsistency | operator + international-trade counsel | Legal-fence escalation |
| Governance approval for major localization decision | board (Governance) | Governance escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `lingua: market selection` | compass | Selection scope |
| `lingua: entry mode` | compass | Entry-mode scope |
| `lingua: GTM plan` | compass | GTM scope |
| `lingua: entity setup / tax / employment / data-residency` | canopy | Regulatory scope |
| `lingua: cross-border payment` | frontier | Cross-border ops scope |
| `lingua: hire in [market]` | hire | Cross-department |
| `lingua: code-level string extraction / JSON / RTL CSS` | dev (Engineering) | Engineering execution |
| `lingua: draft legal contract` | operator + counsel | Legal drafting scope |
| `lingua: individual cross-cultural coaching` | HR + operator + external coach | Individual coaching scope |
| `lingua: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY |
| `lingua: apply cultural framework as individual determinism` | Decline per `cultural-adaptation` Principle 2 | Frameworks describe averages, not individuals |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any skill phase change; any cross-agent handoff
  change; any LOAD-BEARING REFUSAL change.
