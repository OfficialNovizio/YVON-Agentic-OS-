<!--
Custom skill — built from scratch, synthesized from named published sources
(Ghemawat 2001 HBR + Ghemawat 2007 + Ghemawat 2011 + Rugman & Verbeke 2004 +
Douglas & Craig). Body follows §11 required structure + §14.2 exact-heading
compiler contract.

Reclassification note (2026-07-31): §4.1 marketplace search found 4 candidate
skills — all with scope mismatch. mcpmarket "International Expansion Strategy"
(alirezarezvani + independent) bundle 4+ scopes (selection + entry-mode + GTM +
regulatory + localization + logistics) into one broad advisor. compass needs a
NARROWER skill focused specifically on the country/market-selection decision.
§4.6 reclass to custom Route D. Same reclass path as Comms & PR pattern.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Ghemawat corpus grounds compass all 4 skills (single-source
multi-skill within compass); AAA framework (2007) also extends to
`go-to-market-adaptation` per the roster. Extract once, use across compass.
-->
---
name: market-selection-framework
type: custom
status: built from scratch (reclassified from marketplace scope-mismatch per §4.6)
sources_referenced:
  - "Ghemawat, Pankaj (2001). 'Distance Still Matters: The Hard Reality of Global Expansion.' Harvard Business Review, September 2001. Foundational CAGE-framework paper. Available at hbr.org."
  - "Ghemawat, Pankaj (2007). Redefining Global Strategy: Crossing Borders in a World Where Differences Still Matter. Harvard Business Review Press. ISBN 978-1591398660. Named academic per §8.8 (IESE Business School / NYU Stern). Extends CAGE with industry-sensitivity weighting + AAA (Adaptation/Aggregation/Arbitrage) framework."
  - "Ghemawat, Pankaj (2011). World 3.0: Global Prosperity and How to Achieve It. Harvard Business Review Press. ISBN 978-1422131503. Extends CAGE with semi-globalization framing."
  - "Rugman, Alan M. & Verbeke, Alain (2004). 'A Perspective on Regional and Global Strategies of Multinational Enterprises.' Journal of International Business Studies 35(1): 3-18. Named academic. LOF (Liability of Foreignness) + regional-vs-global strategy grounding."
  - "Douglas, Susan P. & Craig, C. Samuel (multiple editions). International Marketing Research. Wiley. Named academic (NYU Stern). Canonical reference for cross-national market research methodology."
  - "Institutional references for CAGE-axis indicators: World Bank Governance Indicators (Administrative axis), Freedom House Freedom in the World Index (Administrative axis), World Bank Doing Business archives (Administrative axis), IMF World Economic Outlook (Economic axis), Hofstede country-scores archive (Cultural axis pre-flag; see cultural-adaptation for direct use), CIA World Factbook (Geographic axis)."
fulfills_catalog_entry: market-selection-framework (custom per §2 routing)
reclassification_notes:
  - "§4.1 search found broad-scope 'International Expansion Strategy' skills bundling 4+ compass scopes into one; scope mismatch → §4.6 reclass to custom. Ghemawat's CAGE is the canonical framework for the country/market-selection decision specifically; no marketplace skill is anchored on it."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "5 canonical sources + institutional-indicator sources — well above §8.0 two-book minimum for Route D."
assigned_agent: compass (Global Expansion / Market Selection & Entry — Lead)
portable: true
date_added: 2026-07-31
tier: 3
description: Country/market prioritization framework — Ghemawat CAGE distance analysis (Cultural / Administrative / Geographic / Economic) + industry-sensitivity weighting + Rugman & Verbeke LOF (Liability of Foreignness) assessment + portfolio prioritization matrix + first-market-adjacency sequencing. For deciding which country/market to enter next, in what priority, with what expected foreignness-cost. Trigger on "which market should we enter next", "market selection", "country prioritization", "CAGE analysis for [candidate country]", "which country next after [current market]", "expansion candidate assessment", or "market portfolio prioritization".
triggers:
  - which market should we enter next
  - market selection
  - country prioritization
  - CAGE analysis for
  - which country next after
  - expansion candidate assessment
  - market portfolio prioritization
  - distance analysis for
  - Liability of Foreignness
  - LOF assessment
---

# Market Selection Framework

## Introduction

This skill packages the country/market prioritization discipline for compass:
Ghemawat's CAGE distance framework + industry-sensitivity weighting +
Rugman & Verbeke's LOF (Liability of Foreignness) assessment + portfolio
prioritization matrix + first-market-adjacency sequencing. For deciding which
country/market to enter next, in what priority, with what expected foreignness-
cost.

**Scope distinction:** this is the SELECTION decision — which country/market
next, in what order. Distinct from `entry-mode-decision` (which handles greenfield
vs. acquisition vs. JV vs. licensing vs. distributor once a country is chosen),
`go-to-market-adaptation` (which handles product/pricing/positioning adaptation
per market), and `expansion-portfolio-mgmt` (which handles multi-market portfolio
optimization once ≥3 markets are active).

Reclassified from a marketplace scope-mismatch per §4.6 — broad-scope
"International Expansion Strategy" marketplace skills bundle 4+ compass scopes
into one; this skill is scoped specifically to the country-selection decision.

Custom Route D per §8.2 — cited rubric grounded in Ghemawat's canonical corpus;
no formula, no script.

## Purpose

Prevents six failure modes that show up when country selection is unstructured:

1. **Single-axis analysis.** Picking a country because one indicator looks good
   ("English-speaking!" or "close geographically!" or "GDP per capita!") without
   the other 3 CAGE axes = predictable underperformance. Ghemawat's 2001 HBR
   paper documents the pattern: firms consistently underestimate distance costs
   in the axes they didn't examine.
2. **Industry-blind CAGE weighting.** CAGE weights VARY by industry (Ghemawat
   2007). A food/beverage company weights cultural + administrative distance
   heavily; an aerospace company weights economic + geographic. Applying the
   same weights across industries misprioritizes candidates for the specific
   business.
3. **Ignoring LOF (Liability of Foreignness).** Rugman & Verbeke's insight:
   entering a country carries a cost of being foreign that domestic incumbents
   don't bear. Underestimating LOF = underestimating time-to-profitability +
   overestimating first-year revenue.
4. **Political-risk blind selection.** Not consulting Freedom House / EIU /
   World Bank Governance Indicators = missing regime-change / expropriation /
   capital-controls risk that dominates all other CAGE factors when it materializes.
5. **Fabricated market-sizing.** Round-number market-size estimates ("$50B TAM")
   without cited source = downstream investment decisions built on fiction.
   Universal Principle 1 applied under expansion pressure.
6. **First-market-adjacency ignored.** Second-market choice should build on
   first-market learning; jumping to an unrelated market discards learning +
   restarts the LOF curve. Ghemawat + Rugman & Verbeke both emphasize regional
   clustering.

compass uses this skill as Phase 1 of any expansion decision. Coordinates
downstream with `entry-mode-decision` (Phase 2), `go-to-market-adaptation`
(Phase 3), and `expansion-portfolio-mgmt` (Phase 4+ once multiple markets
active).

## When to Use

Trigger on:

- "Which market should we enter next" / "market selection" / "country prioritization"
- "CAGE analysis for [candidate country]" / "distance analysis for [country]"
- "Which country next after [current market]" / "first-market-adjacency"
- "Expansion candidate assessment" / "market portfolio prioritization"
- "Liability of Foreignness" / "LOF assessment" / "foreignness cost estimate"
- Handoff from marcus / vista (Executive Office) when strategy scope includes
  geographic expansion
- Handoff from operator when a specific market candidate needs assessment

Do NOT use for:

- **Entry mode decision** (greenfield / acquisition / JV / licensing / distributor)
  once country selected → `entry-mode-decision` (compass sibling)
- **Product / marketing adaptation per market** → `go-to-market-adaptation` (compass sibling)
- **Multi-market portfolio management** once ≥3 markets active →
  `expansion-portfolio-mgmt` (compass sibling)
- **Entity setup / tax registration / employment-law in chosen country** → canopy
- **Localization work per market** → lingua
- **Cross-border payments / FX / banking** → frontier
- **Fundraising decisions to fund the expansion** → echo (Executive Office)
- **Individual mental-health crisis signals** → HARD BOUNDARY escalation to
  manager + HR Ops + EAP per Universal Principle 3

## Structure / Protocol

The market-selection workflow combines CAGE + industry-weighting + LOF +
prioritization + adjacency:

```
CAGE DISTANCE FRAMEWORK (Ghemawat 2001, 2007, 2011)

  CULTURAL DISTANCE
    - Language differences (native + business language mismatch)
    - Ethnicity / social norms differences
    - Religious differences
    - Lack of connective ethnic / social networks between countries
    - Historical relationship (colonial ties reduce cultural distance)

  ADMINISTRATIVE / POLITICAL DISTANCE
    - Absence of shared regional trading bloc (EU / USMCA / ASEAN membership)
    - Absence of shared currency
    - Absence of shared political-economic system (democracy / autocracy mismatch)
    - Absence of colonial ties
    - Government policies (tariffs / quotas / capital controls / FDI restrictions)
    - Institutional weakness (corruption / weak rule-of-law / expropriation risk)
    - Political-risk indicators: Freedom House, EIU Democracy Index, World Bank
      Governance Indicators, Transparency International CPI

  GEOGRAPHIC DISTANCE
    - Physical distance (km / travel time)
    - Absence of common border
    - Time-zone differences (relevant for services / SaaS with real-time support)
    - Climate differences (relevant for physical products)
    - Infrastructure differences (relevant for logistics / distribution)

  ECONOMIC DISTANCE
    - Income differences (GDP per capita gap)
    - Cost + quality of natural resources / labor / capital differences
    - Information + knowledge infrastructure differences
    - Complementarity of trade (e.g., commodity exporter vs. manufacturer)


INDUSTRY-SENSITIVITY WEIGHTING (Ghemawat 2007)

  CAGE weights VARY by industry. Illustrative examples:

  Food / Beverage / Media / Language-heavy      → Cultural + Administrative HEAVY
  Financial Services / Insurance / Healthcare   → Administrative + Economic HEAVY
  Aerospace / Heavy Industry / Commodities      → Economic + Geographic HEAVY
  Automotive / Consumer Electronics             → Economic + Administrative HEAVY
  Software / SaaS (English-language)            → Administrative + Economic (Cultural moderate)
  Software / SaaS (multi-language required)     → Cultural + Administrative + Economic HEAVY
  Physical goods / Retail                       → Geographic + Cultural + Administrative HEAVY

  Weight-tuning per business is Phase 2 of the framework — never skip; industry-
  blind weights misprioritize candidates.


LOF ASSESSMENT (Rugman & Verbeke 2004)

  Liability of Foreignness = cost of being foreign in a market that
  domestic incumbents don't bear. Estimated components:

  - Unfamiliarity cost (learning local business practices, customer preferences,
    regulatory environment)
  - Discrimination cost (customer / partner / government preference for local
    firms)
  - Relational cost (building local networks that domestic incumbents have)
  - Isolation cost (distance from HQ decision-making)

  LOF-adjustment on candidate opportunity: higher LOF = longer time-to-
  profitability + higher required investment.


MARKET-SELECTION OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: CANDIDATE ROSTER + PRE-SCREEN                (5-15 candidates → 5-8)
  Phase 2: CAGE DISTANCE ANALYSIS + INDUSTRY WEIGHTING  (per candidate)
  Phase 3: LOF ASSESSMENT + OPPORTUNITY SIZING           (per candidate; cited sources)
  Phase 4: PORTFOLIO PRIORITIZATION MATRIX                (CAGE-adjusted opportunity ranking)
  Phase 5: FIRST-MARKET-ADJACENCY SEQUENCING              (first pick + 2nd + 3rd sequence)
  Phase 6: DECISION MEMO + HANDOFF TO ENTRY-MODE          (compass sibling `entry-mode-decision`)
```

## Instructions

### Phase 1 — Candidate roster + pre-screen (5-15 candidates → 5-8)

- **Assemble candidate roster** — usually 5-15 candidates from strategy /
  operator / prior expansion assessments.
- **Pre-screen for hard blockers**:
  - Sanctioned country (OFAC / EU / UN sanctions list) → REMOVE
  - Legally-restricted for the product/service (regulatory ban) → REMOVE
  - Existing exclusivity / non-compete in place → REMOVE
- **Confirm 5-8 finalists** for deep CAGE analysis.

### Phase 2 — CAGE distance analysis + industry weighting

**Per candidate country, score each CAGE axis 1-5** (1 = negligible distance,
5 = severe distance from home market). Score with cited indicator per axis:

- **Cultural** — language mismatch (cited), Hofstede power-distance + individualism
  distance (cited), ethnic-network absence
- **Administrative** — political-system distance, regional-trading-bloc absence,
  currency mismatch, Freedom House score (cited), Transparency International CPI
  (cited), World Bank Doing Business (cited if still available; note the ranking
  was discontinued in 2021 — use archived data + successor Business Ready)
- **Geographic** — km distance, time-zone gap, common-border absence
- **Economic** — GDP per capita gap (cited IMF WEO), infrastructure gap (cited
  World Bank), labor-cost gap

**Then weight per industry** — determine your industry's CAGE-weighting profile
(Structure/Protocol above). Weighted CAGE score per candidate:

```
Weighted CAGE = (C_score * C_weight) + (A_score * A_weight) +
                (G_score * G_weight) + (E_score * E_weight)
```

Where weights sum to 1.0 and reflect industry sensitivity.

### Phase 3 — LOF assessment + opportunity sizing

**Per candidate country**, assess LOF (Rugman & Verbeke):

- **Unfamiliarity cost** — how much local-business-practice learning is required?
- **Discrimination cost** — is there measurable customer / partner / government
  preference for local firms?
- **Relational cost** — how strong are the local incumbent networks?
- **Isolation cost** — how far from HQ decision-making (time zones, cultural
  translation load)?

Score LOF 1-5 (1 = negligible foreignness cost, 5 = severe). Cited sources:
academic studies of LOF in specific industries + practitioner case studies
(e.g., Wilcox on China / SVB, published expansion post-mortems).

**Opportunity sizing per candidate** — market size + serviceable segment +
competitive-intensity assessment. NEVER fabricated. Cited sources: Statista,
IBIS, industry associations, or clearly-marked "internal estimate — assumption
X, Y, Z."

**LOF-adjusted opportunity** = raw opportunity × LOF discount + time-to-
profitability adjustment.

### Phase 4 — Portfolio prioritization matrix

Plot candidates on 2×2:

- **X-axis:** Weighted CAGE distance (low → high)
- **Y-axis:** LOF-adjusted opportunity (low → high)

Four quadrants:

- **Enter now** (low CAGE, high opportunity) — first-priority candidates
- **Enter later** (high CAGE, high opportunity) — worth entering but wait for
  organizational maturity + first-market learning
- **Test lightly** (low CAGE, low opportunity) — potential test market or
  regional launchpad
- **Skip** (high CAGE, low opportunity) — deprioritize

### Phase 5 — First-market-adjacency sequencing

Ghemawat + Rugman & Verbeke both emphasize: **second-market choice should build
on first-market learning + reduce CAGE distance from first-market operating base**.

- Rank the "Enter now" quadrant candidates by adjacency to current markets
  (regional clustering, cultural clusters, common regulatory frameworks like EU
  or ASEAN)
- Sequence: pick #1 for near-term entry; identify #2 and #3 for adjacency-based
  next steps once #1 is stable
- Document the sequencing logic explicitly — silent jumps to unrelated markets
  discard first-market learning

### Phase 6 — Decision memo + handoff to entry-mode

- **Decision memo** (2-4 pages) with: candidate roster + CAGE scores + LOF
  scores + opportunity sizing + prioritization matrix + first-market-adjacency
  sequence + explicit recommendation
- **Handoff to `entry-mode-decision`** (compass sibling) — once #1 candidate
  approved, entry-mode is the next skill
- **Handoff to canopy** — regulatory-scoping starts once candidate approved
  (parallel with entry-mode)

## Output Format

Each invocation produces one or more of:

- **Candidate roster + pre-screen memo** — 5-15 → 5-8 finalists with hard-
  blocker eliminations documented
- **CAGE distance scorecard** — per-candidate C/A/G/E scores with cited
  indicators per axis
- **Industry-weighted CAGE ranking** — candidates ranked by weighted CAGE per
  business's industry sensitivity
- **LOF assessment memo** — per-candidate 4-component LOF with cited sources
- **Opportunity sizing memo** — per-candidate market size / serviceable segment
  / competitive intensity with cited sources
- **Portfolio prioritization matrix** — 2×2 with candidate placements
- **First-market-adjacency sequencing** — #1, #2, #3 with adjacency logic
- **Decision memo** — 2-4 pages full framework output + explicit recommendation
- **Handoff briefs** to `entry-mode-decision` + canopy

## Principles

1. **Never single-axis selection.** All 4 CAGE axes analyzed per candidate.
   Skipping an axis = §Principles violation.
2. **Industry-sensitivity weighting applied** — never industry-blind weights.
   Weight-tuning per business is mandatory Phase 2 step.
3. **Political-risk indicators cited** — Freedom House / EIU / World Bank
   Governance Indicators / Transparency International CPI. Ignoring political-
   risk in the Administrative axis = predictable-failure mode.
4. **LOF assessed explicitly** — Rugman & Verbeke's foreignness cost is a real
   line item; ignoring = underestimated time-to-profitability + first-year
   revenue.
5. **Market-sizing sourced or flagged.** Every quantitative claim in opportunity
   sizing cites source OR is clearly labeled "internal estimate — assumption
   X, Y, Z." Universal Principle 1 (§0.5).
6. **First-market-adjacency respected.** Second-market choice builds on first-
   market learning; silent jumps to unrelated markets discard learning +
   restart LOF curve.
7. **Aggregate-only at publication surface** — Universal Principle 2. Individual
   employee / customer data never surfaced in market-selection outputs.
8. **Individual crisis HARD BOUNDARY** — Universal Principle 3 inherited.
9. **Legal fence** — Universal Principle 5. Sanctioned-country candidates
   REMOVED in Phase 1; legal-restriction candidates REMOVED. Escalate to
   operator + counsel if any sanctions / restriction status is ambiguous.
10. **§0.6 flag.** Ghemawat 2001 HBR + 2007 book + 2011 book + Rugman & Verbeke
    2004 + Douglas & Craig are Tier B (canonical sources cited but not book-
    page-cited from `Agents/_books/`). Downgrade to Tier A when Ghemawat 2007
    + 2011 + Rugman & Verbeke 2004 are placed and a `Shared OS/logical/
    market_selection.md` Route-D asset is built per §8.9.

## Fallback

- **Candidate roster incomplete or uncertain.** Escalate to marcus / vista
  (Executive Office) for strategy-level candidate generation. Do NOT invent
  candidates.
- **Political-risk data unavailable for a candidate.** Do NOT score Administrative
  axis without indicator. Flag "insufficient data" and defer candidate to next-
  round assessment when data available.
- **Market-sizing source unavailable.** Flag "internal estimate" with explicit
  assumptions X, Y, Z. Never fabricate a round-number market size.
- **Sanctioned-country or legal-restriction status ambiguous.** Escalate to
  operator + international-trade counsel. Do NOT proceed without counsel
  confirmation.
- **Candidate has active geopolitical conflict / war / sanctions development.**
  Suspend candidate assessment; route to operator + counsel + risk (Risk & ESG
  when built). Do NOT publish CAGE scores for actively-changing candidates
  without conflict-scenario framing.
- **Industry-weighting profile unclear** for a novel industry / product. Consult
  Douglas & Craig methodology; default to balanced 0.25/0.25/0.25/0.25 weights
  with explicit flag "industry-weighting requires refinement." Do NOT default
  to a canned industry profile without justification.
- **Cross-venture expansion selection** (multiple ventures under one holding —
  which venture in which market first). Coordinate with marcus / vista for
  venture-portfolio sequencing decision that upstream this skill.
- **Individual crisis signal during selection conversation.** STOP. Route per
  Universal Principle 3 (inherited) to manager + HR Ops + EAP. HARD BOUNDARY
  overrides all expansion-timing pressure.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `entry-mode-decision` (custom, compass — sibling) | Once candidate #1 approved, entry-mode selection (greenfield / acquisition / JV / licensing / distributor) is the next skill | Downstream Phase 6 handoff |
| `go-to-market-adaptation` (custom, compass — sibling) | Product / pricing / positioning adaptation for chosen market | Downstream (after entry-mode) |
| `expansion-portfolio-mgmt` (custom, compass — sibling) | Multi-market portfolio management once ≥3 markets active | Downstream (after multiple selections) |
| `entity-setup-by-jurisdiction` (custom, canopy) | Regulatory scoping starts once candidate approved | Cross-agent (parallel with entry-mode) |
| `employment-law-multi-jurisdiction` (custom, canopy) | Employment-law scoping in candidate country | Cross-agent |
| `data-residency-mapping` (custom, canopy) | Data-residency implications of candidate country | Cross-agent |
| `product-localization` + `cultural-adaptation` (custom, lingua) | Localization scoping for chosen market | Cross-agent |
| `fx-treasury-basics` + `international-banking` (custom, frontier) | Cross-border operations scoping for chosen market | Cross-agent |
| `payroll-and-eor` (custom, hire — P&C Lead) | International hiring implications of candidate country | Cross-department |
| `investor-cadence` (custom, beacon — Comms & PR) | If market-selection decision is material to investors → Reg FD fence | Cross-department escalation |
| `change-comms` (custom, signal — Comms & PR) | Employee-facing announcement of market-selection decision | Cross-department |
| marcus / vista (Executive Office) | Strategy-level candidate generation + venture-portfolio sequencing | Upstream escalation |
| Operator + international-trade counsel | Sanctions / legal-restriction status; political-risk-triggered candidate suspension | Escalation — LOAD-BEARING legal fence Principle 9 |
| Manager + HR Ops + EAP | Individual mental-health signal during selection conversation — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every market-selection artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [Ghemawat, Pankaj — Distance Still Matters (HBR, September 2001)](https://hbr.org/2001/09/distance-still-matters-the-hard-reality-of-global-expansion)
- [Ghemawat, Pankaj — Redefining Global Strategy (HBR Press book page)](https://store.hbr.org/product/redefining-global-strategy-crossing-borders-in-a-world-where-differences-still-matter/9781422172025)
- [Ghemawat, Pankaj — World 3.0 (HBR Press book page)](https://store.hbr.org/product/world-3-0-global-prosperity-and-how-to-achieve-it/9905)
- [Rugman & Verbeke — A Perspective on Regional and Global Strategies (JIBS 2004)](https://link.springer.com/article/10.1057/palgrave.jibs.8400073)
- [World Bank — Worldwide Governance Indicators](https://www.worldbank.org/en/publication/worldwide-governance-indicators)
- [Freedom House — Freedom in the World](https://freedomhouse.org/report/freedom-world)
- [Transparency International — Corruption Perceptions Index](https://www.transparency.org/en/cpi)
- [IMF — World Economic Outlook](https://www.imf.org/en/Publications/WEO)
- [OFAC — Sanctions Programs and Country Information](https://ofac.treasury.gov/sanctions-programs-and-country-information)
