<!--
Custom skill — built from scratch, synthesized from named institutional sources
(CSA Research + Douglas & Craig + Meyer 2014 + de Mooij + Interbrand/WPP).
Body follows §11 + §14.2.

Reclassification note (2026-07-31): §4.1 search found translation-focused
marketplace skills; none address transcreation (fundamentally distinct from
translation — recreates for cultural relevance, not translates). §4.6 reclass
to custom Route D.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Douglas & Craig 4th use (compass 2 skills + this + lingua
future); Meyer 2014 2nd use (compass GTM + this).
-->
---
name: marketing-localization
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "CSA Research (Common Sense Advisory) — canonical language-services industry research. Institutional. csa-research.com. Coined 'transcreation' as distinct discipline from translation."
  - "Douglas, Susan P. & Craig, C. Samuel (multiple editions). International Marketing Research. Wiley. §8.9 4th use — grounds compass market-selection + compass go-to-market + this skill + future lingua work."
  - "Meyer, Erin (2014). The Culture Map: Breaking Through the Invisible Boundaries of Global Business. PublicAffairs. §8.9 2nd use (compass go-to-market Phase 5 messaging brief + this skill)."
  - "de Mooij, Marieke. Global Marketing and Advertising: Understanding Cultural Paradoxes. Sage. ISBN 978-1544329881 (multiple editions). Canonical academic text on cross-cultural marketing."
  - "WPP / Interbrand annual Best Global Brands reports. Institutional. interbrand.com. Practitioner corpus on global brand-management + local-adaptation trade-offs."
fulfills_catalog_entry: marketing-localization (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found translation-focused marketplace skills (Translation Specialist, Universal Text Translator, Documentation Localization, Lokalise Integration); none address transcreation. §4.6 reclass to custom Route D."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 institutional sources — well above §8.0 two-book minimum."
assigned_agent: lingua (Global Expansion / Localization)
portable: true
date_added: 2026-07-31
tier: 3
description: Marketing content adaptation framework — transcreation-vs-translation decision per content type + brand voice preservation + local competitive-context adaptation + culturally-appropriate positioning per market. Invoked after compass go-to-market-adaptation Phase 5 messaging brief. Coordinates with lingua cultural-adaptation for cultural-appropriateness gate. Trigger on "localize marketing content for [locale]", "transcreate [campaign] for [market]", "adapt messaging for [market]", "brand voice for [locale]", "local competitive positioning for [market]", "marketing translation vs transcreation for [content]", or "marketing QA for [locale]".
triggers:
  - localize marketing content for
  - transcreate for
  - adapt messaging for
  - brand voice for
  - local competitive positioning for
  - marketing translation vs transcreation for
  - marketing QA for
  - campaign adaptation for
  - copywriter selection for
---

# Marketing Localization

## Introduction

This skill packages marketing content adaptation discipline for lingua —
invoked once compass `go-to-market-adaptation` Phase 5 produces the messaging
brief for a market. Transcreation-vs-translation decision per content type +
brand voice preservation + local competitive-context adaptation + culturally-
appropriate positioning + QA.

**Scope distinction:** this is MARKETING content adaptation — headlines,
campaigns, taglines, ad copy, landing-page copy, email marketing, social
content. Distinct from `product-localization` (in-product strings, UI, help
content, transactional emails), `legal-localization` (T&Cs, privacy policy,
regulatory notices), and `cultural-adaptation` (deep framework application
for cultural review across scopes).

**Transcreation ≠ translation.** CSA Research established the distinction:
- **Translation** — preserves source meaning; used for informational content
  (help docs, product strings, legal content) where accuracy matters more
  than emotional impact
- **Transcreation** — recreates for emotional / cultural impact; used for
  marketing content where landing-in-the-target-audience matters more than
  literal fidelity to source

Custom Route D per §8.2 — cited rubric grounded in CSA + Douglas & Craig +
Meyer + de Mooij + WPP/Interbrand institutional corpus.

## Purpose

Prevents seven failure modes:

1. **Machine-translate-everything for marketing.** Machine translation of
   headlines / taglines / campaigns = culturally-flat + often unintentionally
   awkward or offensive. LOAD-BEARING refusal.
2. **Translate-when-transcreate-needed.** Direct translation of clever headlines
   / puns / cultural-references = source-culture-anchored content that
   doesn't land in target culture. Transcreation required for high-impact
   marketing content.
3. **Brand voice erasure.** Local copywriters recreating content in
   target-culture style but losing brand voice = fragmented brand
   experience across markets. Brand voice preservation is non-negotiable
   during transcreation. LOAD-BEARING refusal.
4. **Ignore local competitive context.** Messaging that positions well
   against home-market competitors may position wrongly against local
   competitors. Local competitive-context adaptation is part of transcreation.
5. **Cultural-appropriateness ignored.** Meyer 8-scale + de Mooij cultural
   dimensions matter for marketing — direct/indirect, principles-first/
   applications-first, task-based/relationship-based communication. Skipping
   = culturally-blind messaging that misses target audience.
6. **QA-skipped at launch pressure.** Marketing content ships without
   native-speaker in-context QA. Errors (typos / awkward phrasing / off-tone
   / cultural mishap) surface in-market with reputational damage.
7. **Individual crisis DURING campaign-launch sprint.** Team members under
   launch-timeline pressure + personal distress can coincide. HARD BOUNDARY
   per Universal Principle 3.

lingua uses this skill as Phase 2 of localization workflow (after
`product-localization` scoping) or as a standalone workflow for marketing-
only localization projects.

## When to Use

Trigger on:

- "Localize marketing content for [locale]" / "adapt messaging for [market]"
- "Transcreate [campaign] for [market]" / "campaign adaptation for [market]"
- "Brand voice for [locale]" / "copywriter selection for [locale]"
- "Local competitive positioning for [market]"
- "Marketing translation vs transcreation for [content]"
- "Marketing QA for [locale]"
- Handoff from compass `go-to-market-adaptation` (Phase 5) with messaging
  brief

Do NOT use for:

- **Product / UI / help content localization** → `product-localization`
  (lingua sibling)
- **Legal / regulatory content localization** → `legal-localization`
  (lingua sibling)
- **Deep cultural framework application** → `cultural-adaptation` (lingua sibling)
- **PR / press-release localization** — coordinates with herald's `press-kit`
  + `media-relations` (Comms & PR) for press-side; lingua supports content
  adaptation
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal
  Principle 3

## Structure / Protocol

The marketing-localization workflow combines transcreation-decision + brand
voice + local context + QA:

```
TRANSCREATION-VS-TRANSLATION DECISION (per content type)

  CONTENT TYPE                        RECOMMENDED APPROACH

  Headlines / taglines / slogans      TRANSCREATE (high emotional impact)
  Campaign concepts                   TRANSCREATE
  Ad copy (display / social)          TRANSCREATE
  Landing-page hero copy              TRANSCREATE
  Landing-page body copy              MIX (transcreate hero; translate
                                       feature explanations with cultural
                                       tuning)
  Email marketing subject lines       TRANSCREATE
  Email marketing body                MIX
  Social-media posts                  TRANSCREATE (voice + local trends)
  Blog / long-form content            TRANSLATE with cultural tuning
  Case studies                        TRANSLATE (adapt local examples)
  Product descriptions (marketing)    MIX
  Help docs / support content         TRANSLATE (accuracy > impact)
  Product UI strings                  TRANSLATE (product-localization scope)
  Legal / T&Cs                        TRANSLATE (legal-localization scope)

  Rule of thumb (CSA Research): high emotional-impact + brand-tone-critical
  content = transcreate. Informational content = translate with cultural
  tuning.


BRAND VOICE PRESERVATION FRAMEWORK

  Brand voice = the personality dimensions of how the brand speaks:
    - Formal ⇄ Casual
    - Serious ⇄ Playful
    - Reserved ⇄ Bold
    - Traditional ⇄ Innovative
    - Corporate ⇄ Human
    - Sincere ⇄ Ironic

  Voice attributes preserved ACROSS languages even when transcreation
  reworks content substantially. Brand-voice-guidelines document handed
  off to every local transcreator.

  Failure mode: local transcreator "improves" the voice into local-
  culture-default style, losing brand distinctiveness across markets.


LOCAL COMPETITIVE-CONTEXT ADAPTATION

  Per market, transcreation considers:
    - Local competitors + their positioning
    - Local media environment (channels, tone conventions)
    - Local cultural moments (holidays, trends, cultural references)
    - Local language conventions (formal register default in DE/JP/KR
      business; informal default in US B2C tech)
    - Local sensitivities (topics to avoid; religious / political
      considerations)


MEYER 8-SCALE + DE MOOIJ APPLIED TO MESSAGING

  From compass go-to-market Phase 5 messaging brief:
    - Communicating (low-context ⇄ high-context)
    - Evaluating (direct ⇄ indirect feedback)
    - Persuading (principles-first ⇄ applications-first)
    - Leading (egalitarian ⇄ hierarchical)
    - Deciding (consensual ⇄ top-down)
    - Trusting (task-based ⇄ relationship-based)
    - Disagreeing (confrontational ⇄ avoids)
    - Scheduling (linear-time ⇄ flexible-time)

  Plus de Mooij cultural paradoxes for advertising specifically.


MARKETING-LOCALIZATION OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: MESSAGING BRIEF INTAKE                     (from compass go-to-market Phase 5)
  Phase 2: TRANSCREATION-VS-TRANSLATION DECISION       (per content type)
  Phase 3: LOCAL TRANSCREATOR / TRANSLATOR SELECTION   (with brand voice guidelines)
  Phase 4: LOCAL COMPETITIVE-CONTEXT ADAPTATION        (competitors + media + cultural context)
  Phase 5: QA + CULTURAL-APPROPRIATENESS GATE          (coordinate with cultural-adaptation)
```

## Instructions

### Phase 1 — Messaging brief intake

Receive from compass `go-to-market-adaptation` Phase 5:
- Meyer 8-scale profile for target market
- Positioning + key messages
- Target audience segment(s)
- Local competitive context (initial scan from compass)

Confirm scope: which content types are in-scope (headlines / campaigns /
landing pages / social / etc.)?

### Phase 2 — Transcreation-vs-translation decision per content type

Apply CSA rule-of-thumb (Structure/Protocol above) — transcreate high-
emotional-impact + brand-tone-critical content; translate informational
content with cultural tuning.

Output: content-type decision matrix per campaign / project.

### Phase 3 — Local transcreator / translator selection

- **Native-speaker requirement** — LOAD-BEARING for transcreation. Machine
  translation supplemented by human editing is NOT transcreation. Human
  native speaker (or bilingual native-culture person) recreates content.
- **Brand voice guidelines document** handed to every local transcreator —
  formal-vs-casual, serious-vs-playful, brand voice attributes preserved
- **Vendor coordination** — translation-vendor selection is operator +
  procurement scope; lingua scopes requirements + brand-voice guidelines
- **In-house vs vendor** — larger orgs may have in-house native-speaker
  copywriters per major market; smaller orgs use transcreation vendors

### Phase 4 — Local competitive-context adaptation

Coordinate with compass for local competitor + media landscape input +
local cultural context:
- Adapt positioning to differentiate from local competitors
- Adapt tone / register to local business + media conventions
- Reference local cultural moments where appropriate (holidays / trends /
  cultural references — with cultural-appropriateness gate)
- Avoid local sensitivities (topics / religious / political)

### Phase 5 — QA + cultural-appropriateness gate

- **Linguistic QA** — accuracy, tone-per-brand-voice-guidelines, no typos
- **In-context QA** — content reviewed in actual placement (landing page,
  email preview, social post) — not just in translation-file
- **Cultural QA** — coordinate with lingua sibling `cultural-adaptation`
  for cultural-appropriateness gate (imagery + copy + call-to-action)
- **Brand-voice audit** — voice preserved across local transcreation
- **Native-speaker sign-off** — final gate before launch

## Output Format

Each invocation produces one or more of:

- **Transcreation-vs-translation decision matrix** — per content type per
  project
- **Local transcreator / translator selection brief** — for operator +
  procurement + vendor engagement
- **Brand voice guidelines document** — handed to every local transcreator
- **Local competitive-context adaptation memo** — per market
- **Transcreated content deliverables** — via translation vendor coordination
- **Marketing QA plan + gate** — linguistic + in-context + cultural + brand-
  voice audit + native-speaker sign-off
- **Cross-agent handoff briefs** — to cultural-adaptation sibling (cultural
  gate) + compass (report-back) + herald (press-side if applicable) + signal
  (internal launch comms if applicable)

## Principles

1. **Never machine-translation-only for user-facing marketing content** —
   LOAD-BEARING per Purpose failure mode 1. Transcreation requires human
   native-speaker recreation.
2. **Never brand-voice erasure during transcreation** — LOAD-BEARING per
   failure mode 3. Voice attributes preserved across languages.
3. **CSA transcreation-vs-translation rule applied per content type.** High-
   emotional-impact + brand-tone-critical → transcreate. Informational →
   translate with cultural tuning.
4. **Meyer 8-scale + de Mooij cultural paradoxes applied.** Messaging brief
   from compass Phase 5 informs transcreation direction.
5. **Local competitive-context adapted per market.** Home-market positioning
   doesn't auto-transfer.
6. **In-context QA mandatory pre-launch.** Content reviewed in actual
   placement — not just translation-file. Native-speaker sign-off gate.
7. **Cultural-appropriateness gate** with lingua sibling `cultural-adaptation`
   pre-launch.
8. **No fabrication** — cited institutional sources (CSA + Douglas & Craig +
   Meyer + de Mooij + Interbrand / WPP). Universal Principle 1.
9. **Aggregate-only at publication surface** — Universal Principle 2.
10. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
11. **§0.6 flag.** Institutional sources Tier B. Downgrade path in
    `logical/README.md`.

## Fallback

- **Machine-translation pressure to save cost.** Decline per Principle 1 —
  LOAD-BEARING. Machine translation acceptable ONLY for informational
  content (help docs / product strings / factual translation) — NEVER for
  headlines / campaigns / brand-critical content. Escalate cost concerns
  to operator.
- **Brand voice conflict** — local transcreator recommends voice-departure
  claiming "won't land in local market otherwise." Escalate to brand
  (Brand Studio spark / atlas / lena) + operator for voice-adaptation
  decision. Do NOT auto-approve voice-erasure.
- **Cultural-appropriateness issue** surfaces in QA. Coordinate with
  `cultural-adaptation` sibling for resolution; may require content
  redesign — escalate to operator + timing decision.
- **Local competitive-context data unavailable.** Coordinate with compass
  + operator + potentially local market-research; do NOT invent competitor
  positioning.
- **Sensitive-topic content** (health / financial / political / religious).
  Coordinate with `legal-localization` sibling + relevant counsel + cultural-
  adaptation sibling before proceeding.
- **Native-speaker unavailable for QA** at launch timing. DEFER launch until
  native-speaker QA complete. Do NOT launch without in-context native-
  speaker sign-off.
- **Translation-vendor issue** (quality / timing / capacity). Escalate to
  operator + procurement; may require vendor-switch mid-project (disruption
  cost vs. quality trade-off).
- **Cross-locale campaign inconsistency** — same campaign feels off across
  locales despite transcreation. Coordinate with brand + operator for global-
  campaign-consistency review; may indicate transcreation direction needs
  re-alignment.
- **Individual crisis signal during marketing-localization conversation.**
  STOP. Route per Universal Principle 3 (inherited) to manager + HR Ops +
  EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `go-to-market-adaptation` (custom, compass — Global Expansion Lead) | Messaging brief input from Phase 5 | Upstream |
| `product-localization` (custom, lingua — sibling) | Coordination for product-marketing consistency + product-strings vs marketing-content decision boundary | Coordination |
| `legal-localization` (custom, lingua — sibling) | Legal / disclaimer content that appears in marketing (fine print, subscription terms) | Coordination |
| `cultural-adaptation` (custom, lingua — sibling) | Cultural-appropriateness gate at QA Phase 5 | Coordination — LOAD-BEARING for QA gate |
| `press-kit` + `media-relations` (custom, herald — Comms & PR) | Press-release localization coordination; marketing content that overlaps with PR (product launch announcements) | Cross-department |
| `internal-cadence` + `change-comms` (custom, signal — Comms & PR) | Internal launch communications for localized marketing | Cross-department |
| `investor-cadence` (custom, beacon — Comms & PR) | If marketing localization material to investors (major market entry) | Cross-department escalation |
| dev / spec / ux / loom (Product) | Product-marketing intersection (marketing website, in-product upsell) | Cross-department |
| spark / atlas / lena / weave / muse / pixel (Brand Studio) | Brand voice guidelines + design system + creative direction for local campaigns | Cross-department |
| compass (Global Expansion Lead) | Report-back on marketing-localization progress + competitor / market context inputs | Upstream |
| Operator + translation / transcreation vendor | Vendor selection + procurement + quality management | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every marketing-localization artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [CSA Research (formerly Common Sense Advisory)](https://csa-research.com/)
- [Douglas, Susan P. & Craig, C. Samuel — International Marketing Research (Wiley)](https://www.wiley.com/en-us/International+Marketing+Research%2C+3rd+Edition-p-9780470012673)
- [Meyer, Erin — The Culture Map (PublicAffairs)](https://www.publicaffairsbooks.com/titles/erin-meyer/the-culture-map/9781610392501/)
- [de Mooij, Marieke — Global Marketing and Advertising (Sage)](https://us.sagepub.com/en-us/nam/global-marketing-and-advertising/book259864)
- [Interbrand — Best Global Brands](https://interbrand.com/best-global-brands/)
- [Wikipedia — Transcreation (concept overview)](https://en.wikipedia.org/wiki/Transcreation)
