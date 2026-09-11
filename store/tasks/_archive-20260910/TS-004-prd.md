## 1. Problem

USAvionix needs a source-backed market analysis of the autonomous jet/tactical UAS and defense ISR market to clarify:

- The market boundary and segment sizes, including TAM and SAM.
- USAvionix’s perceived position relative to relevant competitors and adjacent companies.
- The defense demand drivers shaping the market.
- Brand-credibility strengths and gaps across mission, technology, autonomy, survivability, government traction, manufacturing, interoperability, security, compliance, and responsible use.

The deliverable must be a markdown report artifact suitable for review by stakeholders who were not part of this discussion.

## 2. Evidence

- Operator directive, validation ladder L1: the discussion explicitly requests a “source-backed market analysis” covering the autonomous jet/tactical UAS and defense ISR market.
- Operator directive, validation ladder L1: the discussion names the required comparison set: USAvionix, Anduril, AeroVironment, Shield AI, Kratos, Red Cat/Teal, Zipline, and Elroy Air.
- Operator directive, validation ladder L1: the discussion requires a 2x2 perceptual map with the axes “autonomy depth” and “fielded scale.”
- Operator directive, validation ladder L1: the discussion requires defense demand-driver analysis covering contested logistics, attritable autonomy, persistent ISR, counter-UAS, and procurement urgency.
- Operator directive, validation ladder L1: the discussion requires 1–10 credibility scores for nine named attributes, with per-score citations.
- No external research, market figures, analyst reports, company data, or prior decisions were supplied in the discussion. All such claims must therefore be researched and cited by the working agent rather than treated as established facts.

## 3. Proposed Scope

Produce one markdown report artifact containing:

1. **Executive framing and market boundary**
   - Define what is included in and excluded from the autonomous jet/tactical UAS and defense ISR market.
   - Explain how adjacent categories are treated, including logistics autonomy, counter-UAS, and broader commercial autonomous aircraft.
   - Clearly distinguish reported market figures from analyst-derived estimates or modeled ranges.

2. **Market sizing**
   - Provide TAM and SAM estimates or reported figures where defensible.
   - Name the analyst, research organization, government source, company filing, or other source behind each figure.
   - State dates, geography, segment definitions, currency, and methodology where available.
   - Label gaps, assumptions, and comparability limitations rather than presenting incompatible figures as directly comparable.

3. **Competitive and perceptual positioning**
   - Include a 2x2 perceptual map.
   - Use the named axes: **autonomy depth** and **fielded scale**.
   - Place USAvionix, Anduril, AeroVironment, Shield AI, Kratos, Red Cat/Teal, Zipline, and Elroy Air.
   - Explain the evidence and uncertainty behind each placement.
   - Avoid implying that perceptual placement is an audited market-share ranking.

4. **Defense demand drivers**
   - Analyze contested logistics, attritable autonomy, persistent ISR, counter-UAS, and procurement urgency.
   - Cite every non-obvious claim with an inline source URL.
   - Separate observed demand signals from interpretation or forward-looking judgment.

5. **Brand-credibility assessment**
   - Score USAvionix from 1–10 on:
     - Mission proof
     - Technical credibility
     - Autonomy trust
     - Survivability
     - Government traction
     - Manufacturing scale
     - Interoperability
     - Security/compliance
     - Responsible-use posture
   - Provide a citation or explicit evidence gap for every score.
   - Explain the scoring rubric so a stranger can reproduce or challenge the ratings.
   - Mark unsupported attributes as unknown or low-confidence rather than filling gaps with assumptions.

6. **Sources and caveats**
   - Include inline source URLs for every non-obvious claim.
   - Distinguish primary sources, analyst sources, government sources, company claims, and secondary reporting.
   - Identify stale, conflicting, inaccessible, or marketing-originated evidence.

## 4. Out of Scope

- Designing or changing USAvionix products, aircraft, autonomy systems, or mission systems.
- Producing a sales pipeline, account list, procurement forecast, or revenue forecast beyond what is directly supported by cited evidence.
- Conducting primary interviews, surveys, customer discovery, classified research, or field testing.
- Creating a full corporate brand strategy, messaging platform, advertising campaign, or visual identity system.
- Treating the perceptual map as a validated customer survey unless such research is separately conducted and cited.
- Assigning unsupported factual claims or credibility scores to USAvionix or competitors.
- Providing legal, export-control, policy, or weapons-use approval.
- Expanding the competitor set beyond the named companies unless an addition is necessary to define the market boundary and is clearly labeled as an adjacent reference.

## 5. Success Metric

No versioned success metric definition has been provided; a success metric has not been asked for. The report should instead be evaluated against the completeness and testability of the acceptance criteria below.

## 6. Acceptance Criteria

1. **Report artifact exists**
   - A readable markdown report is delivered.
   - Falsifying case: the output is only a conversation summary, slide outline, or unstructured notes.

2. **Market boundary is explicit**
   - The report defines included and excluded market segments and explains treatment of adjacent categories.
   - Falsifying case: a TAM or SAM figure is presented without a segment definition or boundary rationale.

3. **TAM/SAM evidence is traceable**
   - Every TAM/SAM figure identifies its source, publication or reporting date, geography, segment definition, and whether it is reported or estimated.
   - Falsifying case: a market-size number cannot be traced to a named source or is presented as reported when it was modeled by the author.

4. **Perceptual map uses the requested comparison set and axes**
   - A 2x2 map names “autonomy depth” and “fielded scale” as its axes and includes USAvionix, Anduril, AeroVironment, Shield AI, Kratos, Red Cat/Teal, Zipline, and Elroy Air.
   - Falsifying case: any named company is omitted, either axis is renamed without explanation, or placement is unsupported by an explanation.

5. **Demand drivers are covered**
   - The report contains distinct analysis of contested logistics, attritable autonomy, persistent ISR, counter-UAS, and procurement urgency.
   - Falsifying case: any named driver appears only as an unexplained keyword or is omitted.

6. **Credibility scores are complete and reproducible**
   - All nine requested attributes receive a 1–10 score, an explanation of the scoring rubric, and a citation or explicit evidence-gap label.
   - Falsifying case: any attribute lacks a score, rationale, or traceable evidence; or a score is presented as fact without acknowledging uncertainty.

7. **Claims are source-linked**
   - Every non-obvious factual claim in the report has an inline source URL.
   - Falsifying case: a stranger cannot identify the source for a material market, competitor, defense-demand, company, or credibility claim.

8. **Evidence quality and uncertainty are labeled**
   - The report distinguishes primary, analyst, government, company, and secondary sources and labels assumptions, estimates, conflicts, and evidence gaps.
   - Falsifying case: company marketing claims are presented as independently verified facts or incompatible market figures are merged without caveat.

## 7. Risks + Rollback Stance

**Risks**

- Public data may be sparse, inconsistent, stale, or commercially motivated, especially for fielded scale, autonomy depth, survivability, government traction, and manufacturing capacity.
- TAM and SAM definitions may differ materially across analyst sources, making direct comparison misleading.
- USAvionix-specific evidence may be insufficient for defensible 1–10 scores.
- The perceptual map may be mistaken for objective market ranking if its methodology and uncertainty are not clearly stated.
- Inline-source requirements may expose gaps in claims that would otherwise appear plausible.
- Sensitive defense, security, export-control, or responsible-use claims may not be verifiable from public sources.

**Rollback stance**

- Do not publish unsupported figures, placements, or scores as conclusions.
- Replace unverifiable claims with “insufficient public evidence,” a clearly labeled estimate, or an evidence-gap note.
- If the requested market boundary cannot be made coherent, deliver a narrower, explicitly defined segment analysis rather than combining incompatible markets.
- If source quality is inadequate for a confident competitive map or brand assessment, retain the requested structure but mark placements and scores as provisional and recommend validation before external use.
- Roll back any claim that lacks a traceable inline URL or whose source does not support the strength of the wording.

## Working Agents

**Lead: price** — market analysis, competitive positioning, market sizing, and source-backed product research.

Supporting review: **spec** for evidence-gate compliance and PRD/report completeness; **dev** only if architectural or data-methodology review becomes necessary.

## Context Refs

- None — no prior files, modules, or decisions were cited in the discussion.

## 8. RICE

`[reasoning-based, not formula-verified]` — per backlog-rules rule 0.6, computed by the real `scripts/rice.py`, not hand-typed.

- reach: 1
- impact: 1
- confidence: 0.1
- effort: 1
- evidence_level: 1
- **score: 0.1**
