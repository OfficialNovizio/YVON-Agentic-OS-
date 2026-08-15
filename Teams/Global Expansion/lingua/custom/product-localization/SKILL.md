<!--
Custom skill — built from scratch, synthesized from named institutional sources
(GALA + W3C i18n + Unicode CLDR + Kelly 2012 + LISA legacy corpus). Body follows
§11 + §14.2.

Reclassification note (2026-07-31): §4.1 search found many mcpmarket i18n skills
(all community-publisher, all engineering-execution-focused). lingua needs the
broader COORDINATION scope: localization strategy + coordination with engineering
for code-level execution + non-code aspects + QA. §4.6 reclass to custom Route D.
Marketplace skills noted as ENGINEERING EXECUTION TOOLS that engineering teams
can use once lingua scopes localization requirements.

Route D per §8.2 (cited rubric).
-->
---
name: product-localization
type: custom
status: built from scratch (reclassified from marketplace execution-scope-mismatch per §4.6)
sources_referenced:
  - "GALA (Globalization and Localization Association) — industry-standards guides + terminology reference. Institutional. gala-global.org."
  - "W3C Internationalization (i18n) Working Group — technical standards for text handling, character encoding, locale identifiers (BCP 47), Unicode. Institutional. w3.org/International."
  - "Unicode CLDR (Common Locale Data Repository) — locale data for date/time/number/currency formatting standards. Institutional. cldr.unicode.org."
  - "Kelly, Nataly (2012). Found in Translation: How Language Shapes Our Lives and Transforms the World. Perigee. Named practitioner (translation industry). §8.9 with lingua sibling cultural-adaptation."
  - "LISA (Localization Industry Standards Association) legacy corpus — quality standards for translation + localization QA (LISA QA Model). Historical institutional (LISA closed 2011 but standards remain reference)."
  - "ISO 639 (language codes) + ISO 3166 (country codes) + ISO 4217 (currency codes) — institutional international standards."
fulfills_catalog_entry: product-localization (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found mcpmarket i18n skills — all engineering-execution-focused (string extraction, JSON files, RTL CSS). lingua needs broader coordination + strategy scope. §4.6 reclass. Marketplace skills noted as engineering execution tools once lingua scopes localization requirements."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "6 institutional sources — well above §8.0 two-book minimum."
assigned_agent: lingua (Global Expansion / Localization)
portable: true
date_added: 2026-07-31
tier: 3
description: Product-localization coordination framework — localization strategy (which locales, priority, scope) + coordination with engineering for code-level i18n execution + non-code aspects (character encoding, date/time/number/currency formatting per Unicode CLDR, BCP 47 locale identifiers, RTL layout requirements) + culturally-sensitive product decisions (imagery, colors, icons) + QA for translated content. Coordinates with lingua siblings + engineering + product + design. Trigger on "localize product for [locale]", "which locales to prioritize", "i18n strategy for [feature]", "RTL support for [product]", "locale identifier for [market]", "date/currency format for [locale]", "translation QA for [locale]", "cultural product review for [locale]", or "localization roadmap".
triggers:
  - localize product for
  - which locales to prioritize
  - i18n strategy for
  - RTL support for
  - locale identifier for
  - date/currency format for
  - translation QA for
  - cultural product review for
  - localization roadmap
  - Unicode CLDR
---

# Product Localization

## Introduction

This skill packages product-localization coordination discipline for lingua —
invoked once compass `go-to-market-adaptation` (Phase 3) identifies localization
needs for a chosen market. Localization strategy + coordination with engineering
for code-level i18n execution + non-code aspects (character encoding, date-time-
number-currency formatting per Unicode CLDR, BCP 47 locale identifiers, RTL
layout requirements) + culturally-sensitive product decisions (imagery, colors,
icons) + QA for translated content.

**Scope distinction:** lingua's `product-localization` scopes STRATEGY +
COORDINATES. Engineering teams execute code-level i18n (string extraction,
JSON translation files, RTL CSS logical properties, Intl API) — using
marketplace i18n skills or in-house tooling. lingua does NOT do the code-level
extraction itself.

Distinct from `marketing-localization` (marketing content translation +
adaptation), `legal-localization` (legal-doc translation), `cultural-adaptation`
(deep cultural framework application).

Custom Route D per §8.2 — cited rubric grounded in GALA + W3C i18n + Unicode
CLDR + Kelly 2012 + LISA legacy + ISO standards.

## Purpose

Prevents seven failure modes:

1. **Localize-everything default.** Localizing all product features into all
   locales without prioritization = wasted spend + slower time-to-market.
   Localization strategy prioritizes locales + features + timing based on
   market ROI (coordinate with compass `go-to-market-adaptation`).
2. **Engineering-first without strategy.** Engineering starts extracting strings
   before locale scope + priority is defined = throwaway work when strategy
   changes. lingua scopes strategy FIRST; engineering executes SECOND.
3. **Wrong locale identifier.** Using "es" (Spanish generic) when "es-MX"
   (Mexico Spanish) vs "es-ES" (Spain Spanish) matters materially for user
   experience. BCP 47 locale identifiers per W3C standards; Unicode CLDR
   for locale-data granularity.
4. **Non-code localization aspects skipped.** Date format (MM/DD/YYYY vs
   DD/MM/YYYY vs YYYY-MM-DD), number format (1,234.56 vs 1.234,56 vs
   1 234,56), currency format ($1,234 vs 1.234 € vs ¥1,234), address format,
   phone number format, name-format (family-name-first for JP/KR/CN vs
   given-name-first for most others) — Unicode CLDR is the source of truth.
5. **RTL layout treated as "flip everything."** RTL (Arabic, Hebrew, Persian,
   Urdu) requires logical CSS properties + reversed content flow BUT some
   elements stay LTR (numbers, math, English brand names embedded). W3C
   guidance + engineering coordination.
6. **Culturally-sensitive product decisions ignored.** Colors carry cultural
   meaning (red = luck in China / danger in West; white = mourning in some
   Asian cultures / purity in West); icons + imagery + illustrations vary in
   cultural appropriateness; gestures + hand signs vary; religious symbols
   sensitive. lingua reviews product visual decisions for cultural
   appropriateness.
7. **Individual crisis DURING localization sprint.** Team members under
   launch-timeline pressure + personal distress can coincide. HARD BOUNDARY
   per Universal Principle 3.

lingua uses this skill as Phase 1 of any localization workflow — invoked at
handoff from compass Phase 3.

## When to Use

Trigger on:

- "Localize product for [locale]" / "i18n strategy for [feature]"
- "Which locales to prioritize" / "localization roadmap"
- "RTL support for [product]" / "locale identifier for [market]"
- "Date/currency format for [locale]" / "Unicode CLDR"
- "Translation QA for [locale]" / "cultural product review for [locale]"
- Handoff from compass `go-to-market-adaptation` (Phase 3) with localization
  requirements

Do NOT use for:

- **Country/market selection** → compass `market-selection-framework`
- **GTM strategy / AAA analysis** → compass `go-to-market-adaptation`
- **Marketing content translation** → `marketing-localization` (lingua sibling)
- **Legal document translation** → `legal-localization` (lingua sibling)
- **Deep cultural framework application (Hofstede / Meyer)** →
  `cultural-adaptation` (lingua sibling)
- **Code-level string extraction / JSON file management / RTL CSS
  implementation** — engineering scope; engineering teams may use marketplace
  i18n execution skills or in-house tooling
- **Translation vendor selection + procurement** — operator + procurement
  scope; lingua scopes translation requirements
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal
  Principle 3

## Structure / Protocol

The product-localization workflow combines strategy + coordination + non-code
+ cultural review + QA:

```
LOCALE IDENTIFIER STANDARDS (W3C + Unicode CLDR + ISO)

  BCP 47 language tags — [language]-[script]-[region]-[variant]-[extension]
    Examples:
      en-US        English (United States)
      en-GB        English (United Kingdom)
      es-MX        Spanish (Mexico)
      es-ES        Spanish (Spain)
      pt-BR        Portuguese (Brazil)
      pt-PT        Portuguese (Portugal)
      zh-Hans-CN   Chinese (Simplified script, China)
      zh-Hant-TW   Chinese (Traditional script, Taiwan)
      zh-Hant-HK   Chinese (Traditional script, Hong Kong)
      ar-EG        Arabic (Egypt) — RTL
      he-IL        Hebrew (Israel) — RTL
      ja-JP        Japanese (Japan)
      ko-KR        Korean (Korea)


NON-CODE LOCALIZATION ELEMENTS (per Unicode CLDR)

  DATE FORMAT              MM/DD/YYYY (US) / DD/MM/YYYY (most others) /
                            YYYY-MM-DD (ISO 8601, JP, KR, sometimes CN)

  TIME FORMAT              12-hour AM/PM (US) / 24-hour (most others)

  NUMBER FORMAT            1,234.56 (US, UK) / 1.234,56 (DE, most EU) /
                            1 234,56 (FR) / 1,234·56 (occasionally)

  CURRENCY FORMAT          $1,234 (before) / 1.234 € (after) /
                            ¥1,234 (before, no decimal) /
                            $1,234.00 vs 1.234,00 $

  ADDRESS FORMAT           Order varies (city+state+zip vs zip+city);
                            some cultures (JP) include prefecture / district

  PHONE FORMAT             +[country][area][number] but grouping varies

  NAME FORMAT              Given+Family (most Western) vs Family+Given
                            (JP, KR, CN, HU); honorifics vary

  MEASUREMENT              Metric (most) vs Imperial (US, UK partial, LR)

  SORT ORDER               Alphabetical varies (character order in scripts)


RTL (RIGHT-TO-LEFT) LOCALES

  Full RTL: Arabic (all variants), Hebrew, Persian, Urdu, some others
  Layout: content flows R-to-L; some elements stay LTR (numbers, math,
    embedded English brand names, code)
  W3C guidance: use logical CSS properties (start/end, inline-start/end)
    instead of physical (left/right); engineering execution


PRODUCT-LOCALIZATION OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: LOCALIZATION STRATEGY                     (locale prioritization + scope + timing)
  Phase 2: LOCALE IDENTIFIER SPECIFICATION            (BCP 47 + Unicode CLDR data granularity)
  Phase 3: ENGINEERING COORDINATION                   (handoff to engineering for code-level i18n)
  Phase 4: NON-CODE LOCALIZATION ELEMENTS              (dates / numbers / currency / address / RTL requirements)
  Phase 5: CULTURAL PRODUCT REVIEW                    (colors / imagery / icons / illustrations)
  Phase 6: QA + LAUNCH READINESS                       (LISA-adjacent QA + launch checklist)
```

## Instructions

### Phase 1 — Localization strategy

Coordinate with compass `go-to-market-adaptation` output:

- **Locale prioritization** — which locales are tier-1 (full localization),
  tier-2 (core features only), tier-3 (English acceptable with i18n
  infrastructure ready)?
- **Feature scope per locale** — full product vs core-features-only vs
  minimum-viable-localization
- **Timing** — sequential launch (locale-by-locale) vs simultaneous (multi-
  locale launch) — trade-offs on scale vs risk
- **Rollout plan** — beta locales + expanded locales; feedback-loop
  integration with engineering + product

Document strategy explicitly; do NOT default to "localize everything."

### Phase 2 — Locale identifier specification

Per prioritized locale, specify BCP 47 identifier + Unicode CLDR data
granularity:

- Language + script + region tag (e.g., zh-Hans-CN for Simplified Chinese
  China vs zh-Hant-TW for Traditional Chinese Taiwan)
- Locale-data source (Unicode CLDR is standard)
- Fallback chain (e.g., es-MX → es → en fallback path)

### Phase 3 — Engineering coordination

Handoff to engineering (dev + relevant product team):

- Locale identifiers specified
- Feature scope per locale
- String-extraction requirements (all user-facing strings, error messages,
  emails, notifications, help content)
- Translation-file format (JSON / gettext / XLIFF / etc. — engineering choice
  with lingua input)
- RTL layout requirements if applicable (W3C logical CSS properties reference)
- Marketplace i18n execution skills reference — engineering teams may use
  mcpmarket i18n skills as operational tools once lingua scopes requirements

lingua stays involved for QA (Phase 6) but does NOT do code-level extraction.

### Phase 4 — Non-code localization elements

Per Unicode CLDR data, specify per locale:

- **Date format** — MM/DD/YYYY (US) vs DD/MM/YYYY (most others) vs YYYY-MM-DD
- **Time format** — 12-hour vs 24-hour + time-zone display
- **Number format** — thousand separator + decimal separator conventions
- **Currency format** — symbol placement + spacing + decimal precision
- **Address format** — order + fields per country
- **Phone format** — country code + grouping
- **Name format** — given/family order + honorifics
- **Measurement units** — metric vs imperial vs mixed
- **Sort order** — collation per script

Provide to engineering as configuration data (referencing Unicode CLDR — do
NOT invent formats).

### Phase 5 — Cultural product review

For each prioritized locale, review product visual decisions for cultural
appropriateness (coordinate with lingua sibling `cultural-adaptation` for
deeper work):

- **Colors** — red / white / gold / etc. carry different meanings per culture
- **Icons + imagery + illustrations** — hand gestures, religious symbols,
  culturally-specific imagery
- **Photography** — representation + inclusion + cultural specificity
- **Copy tone** — formal vs informal register per locale (some languages
  have formal/informal distinctions — vous/tu in French, formal/informal
  Japanese)
- **Animation + interaction patterns** — some patterns culturally-specific

Output: cultural-review memo per locale with issues flagged + recommendations.

### Phase 6 — QA + launch readiness

Translation + localization QA per LISA-adjacent quality standards:

- **Linguistic QA** — accuracy, terminology consistency, tone, register
  (coordinate with translation vendor)
- **Functional QA** — dates / numbers / currency display correct; RTL layout
  correct; string truncation handled; character encoding correct (UTF-8
  default)
- **Cultural QA** — visual review passes; culturally-appropriate imagery
- **In-context review** — translated strings reviewed in-product (not just
  in translation-file)

Launch readiness checklist — completed before locale launch.

## Output Format

Each invocation produces one or more of:

- **Localization strategy memo** — locale prioritization + feature scope +
  timing + rollout plan
- **Locale identifier specification** — BCP 47 + Unicode CLDR data granularity
  + fallback chain
- **Engineering coordination brief** — locale identifiers + feature scope +
  string-extraction requirements + RTL requirements
- **Non-code localization elements spec** — per-locale date/number/currency/
  address/phone/name/measurement formats per Unicode CLDR
- **Cultural product review memo** — per-locale visual-review issues +
  recommendations
- **Translation QA plan** — linguistic + functional + cultural + in-context
  review process
- **Launch readiness checklist** — per-locale
- **Cross-agent handoff briefs** — to lingua siblings (marketing / legal /
  cultural) + engineering + product + design + compass (report-back on
  localization progress)

## Principles

1. **Never localize-everything default** — strategy prioritizes locales +
   features + timing based on market ROI from compass.
2. **Strategy FIRST, engineering SECOND.** lingua scopes strategy; engineering
   executes code-level i18n.
3. **BCP 47 locale identifiers** + Unicode CLDR data granularity — cite
   standards, never invent locale identifiers.
4. **Non-code localization elements per Unicode CLDR** — dates / numbers /
   currency / address / phone / name / measurement — CLDR is source of truth.
5. **RTL uses W3C logical CSS properties** approach — never "flip everything"
   naive implementation.
6. **Culturally-sensitive product decisions reviewed per locale** — colors /
   imagery / icons / illustrations / gestures / religious symbols.
7. **Translation QA per LISA-adjacent quality standards** — linguistic +
   functional + cultural + in-context review.
8. **No fabrication** — cited institutional sources (GALA + W3C + Unicode
   CLDR + Kelly 2012 + LISA + ISO 639/3166/4217). Universal Principle 1.
9. **Aggregate-only at publication surface** — Universal Principle 2.
10. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
11. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
    `logical/README.md`.

## Fallback

- **Locale identifier ambiguous** for a market (e.g., which Spanish variant
  for pan-LatAm targeting). Escalate to compass + operator; document
  trade-offs (single es-419 pan-LatAm vs multi-locale es-MX + es-AR + es-CO).
  Coordinate with translation vendor for practical recommendation.
- **Unicode CLDR data insufficient** for a rare / underserved locale.
  Coordinate with translation vendor + native-speaker consultants; do NOT
  invent formats.
- **Engineering-team capacity constrained** for i18n infrastructure. Escalate
  to operator + dev (Engineering) for capacity planning; recommend phased
  approach vs everything-at-once.
- **RTL layout technically-complex for legacy codebase.** Coordinate with
  engineering + design; recommend RTL-mockup phase before full implementation;
  RTL is typically 6-12 months of work for large existing codebases.
- **Cultural-review issue surfaces at late-stage QA.** Coordinate with lingua
  sibling `cultural-adaptation` for deeper review; may require product
  redesign — escalate to product + operator for timing decision.
- **Translation-quality issue** post-launch. Coordinate with translation
  vendor + escalate to operator; issue may require re-translation + re-QA
  cycle.
- **Sensitive-content localization** (health / financial / legal / children's)
  — coordinate with lingua sibling `legal-localization` + canopy `data-
  residency-mapping` + relevant counsel.
- **Individual crisis signal during localization conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `go-to-market-adaptation` (custom, compass — Global Expansion Lead) | Localization requirements input from Phase 3 output | Upstream |
| `marketing-localization` (custom, lingua — sibling) | Marketing content coordination | Coordination |
| `legal-localization` (custom, lingua — sibling) | Legal-doc translation for user-facing legal content | Coordination |
| `cultural-adaptation` (custom, lingua — sibling) | Deep Hofstede + Meyer application for cultural product review | Coordination — Phase 5 handoff |
| `entity-setup-by-jurisdiction` (custom, canopy — Global Expansion sibling) | Jurisdiction-specific product requirements (e.g., data-collection notices per jurisdiction) | Coordination |
| `data-residency-mapping` (custom, canopy — Global Expansion sibling) | Data-residency implications of localized data (user PII in localized locale) | Coordination |
| `press-kit` + `media-relations` (custom, herald — Comms & PR) | Launch-comms coordination for localized product launches | Cross-department |
| `internal-cadence` + `change-comms` (custom, signal — Comms & PR) | Internal launch communications | Cross-department |
| dev (Engineering) | Code-level i18n execution — string extraction, JSON files, RTL CSS, Intl API | Downstream Phase 3 handoff |
| spec / ux / loom (Product) | Product decisions on localization scope + priority | Coordination |
| atlas / pixel (Brand Studio) | Design system + brand assets adaptation per locale | Coordination |
| compass (Global Expansion Lead) | Report-back on localization progress | Upstream |
| Operator + translation vendor | Translation-vendor selection + procurement | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every localization artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [GALA — Globalization and Localization Association](https://www.gala-global.org/)
- [W3C Internationalization Working Group](https://www.w3.org/International/)
- [W3C — Language tags in HTML and XML (BCP 47)](https://www.w3.org/International/articles/language-tags/)
- [Unicode CLDR — Common Locale Data Repository](https://cldr.unicode.org/)
- [Unicode Consortium](https://home.unicode.org/)
- [Kelly, Nataly — Found in Translation (Perigee)](https://www.penguinrandomhouse.com/books/307828/found-in-translation-by-nataly-kelly-and-jost-zetzsche/)
- [ISO 639 language codes](https://www.iso.org/iso-639-language-codes.html)
- [ISO 3166 country codes](https://www.iso.org/iso-3166-country-codes.html)
- [ISO 4217 currency codes](https://www.iso.org/iso-4217-currency-codes.html)
