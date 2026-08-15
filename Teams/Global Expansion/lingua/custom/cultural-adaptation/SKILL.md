<!--
Custom skill — built from scratch, synthesized from named sources
(Hofstede 2010 + Meyer 2014 + Trompenaars & Hampden-Turner + Hall 1976 +
World Values Survey). Body follows §11 + §14.2.

§4.1 search returned no marketplace competitors — custom Route D
straightforward, no reclass pressure.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Meyer 2014 3rd use (compass GTM + lingua marketing-
localization + this).
-->
---
name: cultural-adaptation
type: custom
status: built from scratch (no marketplace competitor)
sources_referenced:
  - "Hofstede, Geert; Hofstede, Gert Jan; Minkov, Michael (2010). Cultures and Organizations: Software of the Mind, 3rd ed. McGraw-Hill. ISBN 978-0071664189. Canonical 6-dimensional cultural framework (power distance / individualism / masculinity-femininity / uncertainty avoidance / long-term-orientation / indulgence-restraint)."
  - "Meyer, Erin (2014). The Culture Map: Breaking Through the Invisible Boundaries of Global Business. PublicAffairs. ISBN 978-1610392501. 8-scale business-communication framework. §8.9 3rd use (compass go-to-market + lingua marketing-localization + this)."
  - "Trompenaars, Fons & Hampden-Turner, Charles (multiple editions). Riding the Waves of Culture: Understanding Diversity in Global Business. Nicholas Brealey. ISBN 978-1904838388. 7-dimensional framework (universalism-particularism / individualism-communitarianism / neutral-emotional / specific-diffuse / achievement-ascription / time orientation / internal-external control)."
  - "Hall, Edward T. (1976). Beyond Culture. Anchor Books. ISBN 978-0385124744. High-context/low-context communication + monochronic/polychronic time. Foundational cultural anthropology text; Meyer builds on Hall."
  - "World Values Survey (WVS) — institutional cross-cultural values research. worldvaluessurvey.org. Multi-decade longitudinal data across 100+ countries."
fulfills_catalog_entry: cultural-adaptation (custom per §2 routing)
reclassification_notes:
  - "§4.1 search returned no marketplace competitors — custom Route D straightforward."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 canonical sources — well above §8.0 two-book minimum."
assigned_agent: lingua (Global Expansion / Localization)
portable: true
date_added: 2026-07-31
tier: 3
description: Deep cultural framework application — Hofstede 6 dimensions + Meyer 8 scales + Trompenaars 7 dimensions + Hall high/low-context + monochronic/polychronic. Applied to leadership, team-building, negotiation, product design, messaging, and localization-decision cultural-appropriateness gates. Cross-department resource. Trigger on "cultural profile for [country]", "Hofstede analysis for [country]", "Meyer 8-scale for [country]", "cross-cultural team building", "cross-cultural negotiation for [context]", "cultural appropriateness of [decision]", "cross-cultural leadership advice for [context]", or "cultural-appropriateness gate for [content]".
triggers:
  - cultural profile for
  - Hofstede analysis for
  - Meyer 8-scale for
  - cross-cultural team building
  - cross-cultural negotiation for
  - cultural appropriateness of
  - cross-cultural leadership advice for
  - cultural-appropriateness gate for
  - Trompenaars analysis
  - high-context low-context for
---

# Cultural Adaptation

## Introduction

This skill packages deep cross-cultural framework application discipline for
lingua — invoked when other lingua skills need cultural-appropriateness gate
input, OR for cross-cultural business decisions beyond localization
(leadership across cultures, team building, negotiation, product design).
Multi-framework: Hofstede 6 dimensions + Meyer 8 scales + Trompenaars 7
dimensions + Hall high/low-context + monochronic/polychronic time.

**Scope distinction:** this is the DEEP FRAMEWORK APPLICATION skill —
strategic-level cultural analysis. Distinct from `product-localization` +
`marketing-localization` + `legal-localization` (which are execution-focused
localization skills that COORDINATE with cultural-adaptation for cultural-
appropriateness gates).

Also serves as cross-department cultural-resource — cross-cultural leadership
questions (from executive teams), cross-cultural negotiation (from BD /
partnerships), cross-cultural team building (from P&C).

Custom Route D per §8.2 — cited rubric grounded in Hofstede + Meyer +
Trompenaars + Hall + WVS.

## Purpose

Prevents six failure modes:

1. **Single-framework analysis.** Using Hofstede alone (or Meyer alone, or
   any single framework) misses dimensions the other frameworks capture.
   Multi-framework triangulation is more robust.
2. **Stereotype substitution.** Cultural frameworks describe TENDENCIES + AVERAGES
   for cultures; they do NOT determine individuals. Applying framework
   findings as individual determinants = stereotype. Frameworks inform
   context; individuals still surprise.
3. **Home-culture-as-neutral.** Every culture (including home) has cultural
   dimensions. Applying frameworks only to "other" cultures while treating
   home as neutral / default = the classic ethnocentric bias.
4. **Cultural-appropriateness gate bypassed.** When lingua siblings surface
   content for cultural review, the gate must resolve — approve, revise,
   or escalate. Bypassing the gate under launch-timeline pressure = failure
   mode. LOAD-BEARING gate integrity.
5. **Change over time ignored.** Cultures evolve. Hofstede data is refreshed
   periodically but generation-level changes (millennial + Gen Z global-
   convergence trends per WVS) matter. Frameworks are frameworks, not
   frozen facts.
6. **Individual crisis DURING cross-cultural conversation.** Cultural
   discussions can surface personal cultural-identity tension for team
   members. HARD BOUNDARY per Universal Principle 3.

lingua uses this skill as cross-cutting cultural resource + as cultural-
appropriateness gate for sibling skills.

## When to Use

Trigger on:

- "Cultural profile for [country]" / "Hofstede analysis for [country]"
- "Meyer 8-scale for [country]" / "Trompenaars analysis for [country]"
- "High-context / low-context for [country]"
- "Cross-cultural team building" / "cross-cultural leadership advice for
  [context]"
- "Cross-cultural negotiation for [context]"
- "Cultural appropriateness of [decision]" / "cultural-appropriateness gate
  for [content]"
- Handoff from lingua siblings (`product-localization` Phase 5 cultural
  product review, `marketing-localization` Phase 5 cultural-appropriateness
  gate)
- Cross-department requests (executive cross-cultural leadership, BD cross-
  cultural negotiation, P&C cross-cultural team building)

Do NOT use for:

- **Locale identifiers + non-code localization data** → `product-localization`
- **Marketing content transcreation** → `marketing-localization`
- **Legal-document localization** → `legal-localization`
- **Individual cross-cultural coaching / mediation** — HR + operator + potentially
  external cross-cultural coach; lingua provides framework input, does not
  coach individuals
- **Cultural training program design** — coordinates with grove (P&C L&D) for
  training design + this skill for content input
- **Individual mental-health crisis signals** → HARD BOUNDARY per Universal
  Principle 3

## Structure / Protocol

The cultural-adaptation workflow combines multi-framework profile + application
+ gate + learning:

```
MULTI-FRAMEWORK CULTURAL PROFILE PER CULTURE

  HOFSTEDE 6 DIMENSIONS (with 0-100 scores per culture from Hofstede Insights)
    - Power Distance (PDI) — hierarchy acceptance
    - Individualism (IDV) — individual vs collective orientation
    - Masculinity (MAS) — competitive-achievement vs quality-of-life
      orientation
    - Uncertainty Avoidance (UAI) — comfort with ambiguity
    - Long-Term Orientation (LTO) — future vs tradition orientation
    - Indulgence vs Restraint (IVR) — gratification vs restraint

  MEYER 8 SCALES (business-communication oriented)
    - Communicating (low-context ⇄ high-context)
    - Evaluating (direct ⇄ indirect negative feedback)
    - Persuading (principles-first ⇄ applications-first)
    - Leading (egalitarian ⇄ hierarchical)
    - Deciding (consensual ⇄ top-down)
    - Trusting (task-based ⇄ relationship-based)
    - Disagreeing (confrontational ⇄ avoids confrontation)
    - Scheduling (linear-time ⇄ flexible-time)

  TROMPENAARS 7 DIMENSIONS
    - Universalism ⇄ Particularism (rules vs relationships)
    - Individualism ⇄ Communitarianism
    - Neutral ⇄ Emotional
    - Specific ⇄ Diffuse (separated ⇄ blended life domains)
    - Achievement ⇄ Ascription (earned vs ascribed status)
    - Time orientation (past / present / future emphasis;
      sequential vs synchronic)
    - Internal ⇄ External control (agency over vs adaptation to environment)

  HALL (Meyer builds on)
    - High-context ⇄ Low-context communication
    - Monochronic ⇄ Polychronic time

  MULTI-FRAMEWORK TRIANGULATION — dimensions overlap partially. Using
  multiple frameworks catches what single framework misses.


APPLICATION DOMAINS

  LEADERSHIP        — Hofstede PDI + Meyer Leading + Trompenaars Achievement/
                       Ascription determine leadership-style expectations
  TEAM BUILDING     — Hofstede IDV + Trompenaars Individualism-Communitarianism
                       + Meyer Trusting + Hall high/low-context
  NEGOTIATION       — Meyer Persuading / Trusting / Deciding / Disagreeing +
                       Trompenaars Universalism-Particularism + Hall context
  PRODUCT DESIGN    — All frameworks for aesthetic + interaction preferences
  MESSAGING         — Meyer Communicating / Persuading + Hall context +
                       Hofstede UAI (comfort with ambiguity in ad copy)
  DECISION-MAKING   — Meyer Deciding + Hofstede PDI + Trompenaars
                       Universalism-Particularism


CULTURAL-ADAPTATION OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: CULTURAL-CONTEXT INPUT                      (market + purpose)
  Phase 2: MULTI-FRAMEWORK CULTURAL PROFILE            (Hofstede + Meyer + Trompenaars + Hall)
  Phase 3: APPLICATION TO SPECIFIC DECISION            (leadership / team / negotiation / product / messaging)
  Phase 4: CULTURAL-APPROPRIATENESS GATE                (invoked by lingua siblings + cross-department)
  Phase 5: CROSS-CULTURAL LEARNING + RETENTION          (feedback for future decisions)
```

## Instructions

### Phase 1 — Cultural-context input

Confirm:
- Which culture(s) in scope (country / sub-culture / region)
- Purpose of adaptation (leadership / team / negotiation / product / messaging /
  cultural-appropriateness gate for lingua sibling content)
- Home-culture context (for comparative framing — never treat home as neutral)

### Phase 2 — Multi-framework cultural profile

Build profile using at least 3 of 4 frameworks (Hofstede + Meyer + Trompenaars
+ Hall). Cite institutional source per dimension (Hofstede Insights scores;
Meyer's Country Mapping in *The Culture Map*; Trompenaars' organizational
research; Hall's foundational texts).

Note dimension overlaps + tensions between frameworks — triangulation reveals
what single-framework analysis misses.

### Phase 3 — Application to specific decision

Apply cultural profile to the specific decision domain:

- **Leadership** — expected leader style + team-lead interaction; how
  authority is exercised + respected
- **Team building** — group vs individual orientation; direct vs indirect
  feedback norms; task-based vs relationship-based team formation
- **Negotiation** — pre-negotiation relationship-building expectations;
  direct-vs-indirect disagreement; consensual-vs-top-down decision-making
- **Product design** — aesthetic preferences; interaction patterns;
  hierarchy-vs-flatness in information architecture
- **Messaging** — direct-vs-indirect; principles-first-vs-applications-first;
  low-vs-high context
- **Decision-making** — group consensus vs top-down; universal-rules-vs-
  particular-relationships

Provide concrete recommendations grounded in framework analysis + explicit
acknowledgment of individual variance.

### Phase 4 — Cultural-appropriateness gate (when invoked by sibling / cross-department)

For content review (product visuals / marketing content / legal-content
presentation / cross-cultural communication):

- **APPROVE** — cultural profile analysis supports content as culturally
  appropriate
- **REVISE** — specific revisions recommended with framework-grounded
  rationale
- **ESCALATE** — cultural risk beyond skill scope requires operator + local
  cultural consultant + counsel (if legal-adjacent)

Gate decisions documented — never silently bypassed. LOAD-BEARING gate
integrity.

### Phase 5 — Cross-cultural learning + retention

Post-decision retrospective feeds future decisions:

- What framework predictions held?
- What surprised (individual variance / sub-cultural nuance / evolution)?
- What framework dimension was under-weighted?
- Update cultural-profile confidence per market

Retention loop feeds back into future cultural-adaptation invocations for
the same market — culture-per-market institutional-knowledge builds over
time.

## Output Format

Each invocation produces one or more of:

- **Cultural-context confirmation memo** — culture(s) + purpose + home
  comparison
- **Multi-framework cultural profile** — Hofstede + Meyer + Trompenaars +
  Hall per culture with cited institutional source
- **Application memo** — specific-decision framework application with
  concrete recommendations
- **Cultural-appropriateness gate decision** — APPROVE / REVISE / ESCALATE
  with framework-grounded rationale
- **Cross-cultural learning memo** — post-decision retrospective + confidence
  updates
- **Cross-agent handoff briefs** — to lingua siblings, cross-department
  requesters, operator + external cultural consultant if escalated

## Principles

1. **Multi-framework triangulation** — at least 3 frameworks per profile;
   single-framework analysis is failure mode.
2. **Cultural profiles describe tendencies + averages, NOT individuals.**
   Frameworks inform context; individuals still surprise. Avoid stereotype
   substitution.
3. **Home-culture is not neutral.** Apply frameworks to home culture in
   comparative analysis; never treat home as default.
4. **Cultural-appropriateness gate integrity** — LOAD-BEARING. Gate decisions
   (APPROVE / REVISE / ESCALATE) documented; never silently bypassed.
5. **Change over time acknowledged.** Cultures evolve; generational shifts
   (WVS documents millennial + Gen Z convergence trends) matter. Frameworks
   are frameworks, not frozen facts.
6. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
   Cultural discussions can surface personal cultural-identity tension —
   escalate to HR + EAP if signals emerge.
7. **No fabrication** — cited institutional sources (Hofstede + Meyer +
   Trompenaars + Hall + WVS). Universal Principle 1.
8. **Aggregate-only at publication surface** — Universal Principle 2.
9. **§0.6 flag.** Sources Tier B. Downgrade path in `logical/README.md`.

## Fallback

- **Framework data unavailable for a culture** (sub-culture, region, obscure
  jurisdiction). Coordinate with local cultural consultants; qualitative
  framing acceptable with explicit uncertainty flag. Do NOT invent
  Hofstede-style scores.
- **Framework disagreement** between Hofstede / Meyer / Trompenaars / Hall
  on a specific dimension. Present the disagreement; recommend triangulation
  + local-consultant input for high-stakes decisions.
- **Cultural-appropriateness gate ESCALATE** — content flagged as high-risk.
  Route to operator + local cultural consultant + potentially local counsel
  if legal-adjacent (defamation, religious sensitivities, political
  sensitivities).
- **Individual cultural-identity tension** surfaces in cross-cultural
  conversation. HARD BOUNDARY escalation per Universal Principle 3 — route
  to HR + EAP + potentially culturally-competent counselor.
- **Stereotype-application pressure** (using framework to make individual
  judgments). Decline per Principle 2. Frameworks describe averages, not
  individuals.
- **Home-culture-as-neutral framing** in a team discussion. Correct explicitly;
  apply frameworks to home culture in comparative analysis.
- **Individual crisis signal during cultural-adaptation conversation.** STOP.
  Route per Universal Principle 3 (inherited) to manager + HR Ops + EAP.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `product-localization` (custom, lingua — sibling) | Cultural product review at Phase 5 QA | Coordination — this skill provides framework input |
| `marketing-localization` (custom, lingua — sibling) | Cultural-appropriateness gate at Phase 5 QA | Coordination — LOAD-BEARING gate |
| `legal-localization` (custom, lingua — sibling) | Cultural-appropriateness of legal-content presentation (not legal-content itself) | Coordination |
| compass (Global Expansion Lead) | Ghemawat CAGE Cultural axis + regional-clustering inputs | Coordination — this skill provides deep cultural profile |
| `go-to-market-adaptation` (custom, compass) | Meyer 8-scale profile input for Phase 5 messaging brief | Upstream input |
| `hire` (P&C Lead) + `maslow` (P&C) | Cross-cultural team building + culturally-adapted motivation approaches | Cross-department |
| `merit` (P&C) `feedback-methods` | Culturally-adapted SBI/Radical-Candor feedback (Meyer Evaluating scale) | Cross-department |
| `signal` (Comms & PR) `internal-cadence` + `change-comms` | Cross-cultural internal comms adaptation | Cross-department |
| `herald` (Comms & PR) `media-relations` + `media-training` | Cross-cultural media / spokesperson prep | Cross-department |
| BD / partnership teams | Cross-cultural negotiation input | Cross-department |
| Executive team | Cross-cultural leadership advice | Cross-department |
| Operator + external cultural consultant | ESCALATE cultural-appropriateness gate; high-risk cultural situations | Escalation |
| Operator + local counsel | Legal-adjacent cultural risks (defamation / religious / political sensitivities) | Escalation |
| Manager + HR Ops + EAP | Individual cultural-identity tension surfaces — HARD BOUNDARY per Universal Principle 3 | Escalation |
| `Shared OS: verification-before-completion` | Evidence gate on every cultural-adaptation artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [Hofstede Insights — Country Comparison Tool](https://www.hofstede-insights.com/country-comparison-tool)
- [Hofstede, Geert; Hofstede, Gert Jan; Minkov, Michael — Cultures and Organizations (McGraw-Hill)](https://www.mhprofessional.com/9780071664189-usa-cultures-and-organizations-software-of-the-mind)
- [Meyer, Erin — The Culture Map (PublicAffairs)](https://www.publicaffairsbooks.com/titles/erin-meyer/the-culture-map/9781610392501/)
- [Meyer, Erin — Country Mapping Tool](https://erinmeyer.com/tools/culture-map-country-comparison/)
- [Trompenaars & Hampden-Turner — Riding the Waves of Culture (Nicholas Brealey)](https://www.nicholasbrealey.com/titles/fons-trompenaars/riding-the-waves-of-culture/9781904838388/)
- [Hall, Edward T. — Beyond Culture (Anchor Books)](https://www.penguinrandomhouse.com/books/117862/beyond-culture-by-edward-t-hall/)
- [World Values Survey](https://www.worldvaluessurvey.org/)
