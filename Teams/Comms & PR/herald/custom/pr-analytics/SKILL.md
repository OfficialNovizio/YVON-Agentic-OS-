<!--
Custom skill — built from scratch. NOT in the original catalog; added per §2 roster
expansion at operator sign-off.

Source content: AMEC (International Association for Measurement and Evaluation of
Communication) Integrated Evaluation Framework + Barcelona Principles 3.0 (2020) +
practitioner-institutional guidance from Cision / Meltwater.

Load-bearing rule embedded in the script: the pr_analytics.py `ave_refuse()` function
explicitly REFUSES to compute AVE (Advertising Value Equivalency) per Barcelona
Principle 5 and returns an error message. This is enforced at the code level, not just
as prose principle — matches the P&C pattern of load-bearing rules baked into tool-level
enforcement.
-->
---
name: pr-analytics
type: custom
status: built from scratch (added per §2 roster expansion beyond catalog's 2-skill floor)
sources_referenced:
  - "Barcelona Principles 3.0 (2020) — AMEC-endorsed canonical PR-measurement standards. Institutional source per §8.8 — replaces earlier Barcelona 1.0 (2010) and 2.0 (2015)."
  - "AMEC (International Association for Measurement and Evaluation of Communication) — Integrated Evaluation Framework (inputs / activities / outputs / outtakes / outcomes / impact). Institutional source per §8.8."
  - "AMEC Measurement Museum — public repository of measurement case studies + methodology."
  - "Cision + Meltwater — commercial vendor guidance on share-of-voice + sentiment aggregation methodology (practitioner-institutional supplement)."
  - "Scott, David Meerman (2020). The New Rules of Marketing and PR ch.9 (measurement chapter). Already cited across herald's other skills + identity; §8.9 extract-once-use-twice."
fulfills_catalog_entry: n/a (part of herald's expanded roster beyond catalog per §2)
genericization_notes:
  - "No VYON-branded content — PR measurement frameworks are public institutional practice."
assigned_agent: herald (Comms & PR / Lead — PR & Media)
portable: true
date_added: 2026-07-31
tier: 3
description: PR measurement + coverage tracking framework grounded in Barcelona Principles 3.0 + AMEC Integrated Evaluation Framework. Tracks share-of-voice, sentiment, coverage-vs-target, reach — NEVER AVE (Advertising Value Equivalency) which Barcelona explicitly rejects. Includes tested `pr_analytics.py` utility. Trigger on "measure the campaign", "share of voice for", "sentiment analysis for", "coverage report for", "PR ROI", "did the PR work", or "AVE" (which triggers the load-bearing refusal).
triggers:
  - measure the campaign
  - share of voice for
  - sentiment analysis for
  - coverage report for
  - PR ROI
  - did the PR work
  - AVE
  - advertising value equivalency
  - post-campaign report
---

# PR Analytics

## Introduction

This skill grounds PR measurement in the **Barcelona Principles 3.0** (2020) + **AMEC's
Integrated Evaluation Framework** — the canonical institutional standards for the PR
industry. It's the closed-loop measurement layer that answers "did the media-relations
+ press-kit + media-training investment produce the intended outcome?"

Added per §2 roster expansion — not in the original catalog. The catalog covered
pitching (media-relations) + content (press-kit) for herald; measurement was implicit.
This skill makes measurement explicit and enforces the Barcelona standards.

**Load-bearing rule baked into the script:** `pr_analytics.py`'s `ave_refuse()` function
explicitly REFUSES to compute AVE (Advertising Value Equivalency) per Barcelona
Principle 5 and returns an error message explaining why. AVE misrepresents editorial
coverage as equivalent to paid media impressions — the PR industry moved away from AVE
in 2010 (Barcelona 1.0), and Barcelona 3.0 (2020) is unambiguous that AVE is not a
valid measurement. Baking the refusal into the utility means the operator cannot
accidentally invoke AVE just because a legacy stakeholder asked for it.

## Purpose

Prevents four failure modes that show up when PR measurement is either absent or
mis-anchored:

1. **AVE as "measurement".** Advertising Value Equivalency — multiplying a piece of
   editorial coverage's column inches or airtime by the equivalent paid-ad rate —
   was rejected by Barcelona 1.0 (2010) as invalid because editorial and advertising
   are qualitatively different (readers know which is which; measurement discipline
   demands they be measured differently). Barcelona 3.0 (2020) is even more explicit.
   This skill's utility REFUSES AVE at the code level.
2. **Pure volume without quality.** Counting "we got 40 mentions" without measuring
   sentiment, message-alignment, or target-audience-reach is vanity-metric behavior —
   more mentions of the wrong kind can be net-negative for the brand. This skill's
   Barcelona-aligned framework measures quality alongside volume.
3. **Outputs mistaken for outcomes.** AMEC's framework distinguishes outputs (coverage
   pieces published) from outcomes (audience behavior change) from impact (business
   result). PR measurement that stops at outputs misses whether the coverage produced
   the intended effect. This skill enforces measurement through to outcomes and
   (where measurable) impact.
4. **No closed-loop learning.** Post-campaign measurement not fed back into the next
   campaign's planning wastes the learning. This skill's post-campaign debrief feeds
   forward into media-relations reporter research + press-kit message development +
   media-training message-map iteration.

herald uses this skill after every material PR campaign (product launch, milestone
announcement, crisis response, IPO / funding announcement) to close the loop and feed
learning forward.

## When to Use

Trigger on:

- "Measure the campaign" / "post-campaign report for [initiative]"
- "Share of voice for [brand vs competitors]"
- "Sentiment analysis for [coverage window]"
- "Coverage report for [reporter / publication / topic]"
- "PR ROI" / "did the PR work" / "was the [campaign] worth it"
- **"AVE" / "advertising value equivalency"** → triggers `ave_refuse()` with Barcelona
  Principle 5 explanation
- Handoff from `media-relations` after a campaign closes (coverage measurement)
- Handoff from `media-training` after an interview publishes (message-alignment check)

Do NOT use for:

- **Reporter outreach / pitching** → `media-relations` (custom, herald — sibling).
- **Content drafting** → `press-kit` (custom, herald — sibling).
- **Spokesperson prep** → `media-training` (custom, herald — sibling).
- **Investor-facing metrics** → `beacon` (Comms & PR sibling); some overlap on
  investor-audience share-of-voice but IR metrics have distinct disciplines.
- **Marketing-funnel attribution** (leads generated / opportunities influenced by PR) →
  future Growth & Partnerships department (task #5) or existing Brand Studio metrics.
  PR-analytics measures PR outcomes; marketing attribution is a broader discipline.
- **Individual mental-health signals during analysis** → HARD BOUNDARY escalation per
  Universal Principle 3 (inherited).

## Structure / Protocol

The Barcelona Principles 3.0 (7 principles, 2020) — canonical anchor:

```
1. Setting goals is fundamental to communication and evaluation.
2. Measurement and evaluation should identify outputs, outcomes, and potential impact.
3. Outcomes and impact should be identified for stakeholders, society, and the org.
4. Communication measurement should include both qualitative and quantitative analysis.
5. AVE is NOT the value of communication. (LOAD-BEARING — baked into the script.)
6. Holistic communication measurement includes all relevant online and offline channels.
7. Communication measurement is based on integrity + transparency to drive learning.
```

The AMEC Integrated Evaluation Framework (canonical evaluation chain):

```
INPUTS       →  ACTIVITIES  →  OUTPUTS  →  OUTTAKES  →  OUTCOMES  →  IMPACT
(resources)     (comms         (deliver-   (audience    (audience    (org / society
                planning +     ables:      awareness    behavior     result: revenue,
                execution)     coverage,   / recall)    change)      reputation,
                               reach)                                policy shift)
```

Measurement at every stage — stopping at OUTPUTS is Purpose failure mode 3.

## Instructions

### Phase 1 — Set goals BEFORE the campaign (Barcelona Principle 1)

The campaign's PR goals must be stated in measurable terms BEFORE launch. Goals get
categorized per AMEC framework:

- **Output goal** — "get 15 pieces of coverage in target publications by [date]"
- **Outtake goal** — "audience recall of key message #1 rises from 8% to 20% (per
  post-launch survey)"
- **Outcome goal** — "audience-behavior change: X% of target audience visits site / signs
  up / attends webinar within 30 days of coverage window"
- **Impact goal** — "PR-attributable revenue in the launch quarter reaches $Y" (where
  attributable can be defensibly claimed)

Without goals, measurement is descriptive but not evaluative. Coverage report without
goals: "we got 40 pieces." Coverage report against goals: "we got 40 pieces (target: 15)
— 267% of target; sentiment 68% positive (target: 60%); attributable trials up 15%
(target: 20% — under-delivered here)."

### Phase 2 — Measure OUTPUTS (coverage + reach + share-of-voice + sentiment)

Standard output metrics using `pr_analytics.py`:

- **Coverage count** — pieces of coverage published in the measurement window.
- **Coverage vs target** — actual / goal (from Phase 1).
- **Reach** — estimated total impressions across coverage (publication-reach × frequency;
  supplement with actual publisher-reported unique visitors where available).
- **Share of voice** — brand mentions / total category mentions × 100. Requires
  competitor set defined in Phase 1.
- **Sentiment** — positive / neutral / negative distribution. Manual triage still
  outperforms automated NLP sentiment for PR-specific coverage (industry-jargon +
  context-dependent framing); use automation only as a first-pass filter.
- **Message alignment** — did the coverage reflect the 3 key messages from media-training's
  message-map? Coverage that reaches audience but misses messages is a partial win at
  best.

### Phase 3 — Measure OUTTAKES (audience awareness / recall)

Post-campaign audience survey or panel research measures whether the intended messages
LANDED (as distinct from just being published). Standard outtake questions:

- Unaided awareness: "In the past 30 days, have you seen or heard anything about [org
  / topic]?"
- Aided awareness: "Have you seen coverage about [specific message] in the past 30
  days?"
- Message recall: "What do you associate with [org] as a result of recent coverage?"

Outtake measurement typically requires a survey vendor or panel; skip this phase if the
campaign was too small to justify the survey cost, but note the gap in the report.

### Phase 4 — Measure OUTCOMES (audience behavior change)

Behavioral evidence of message-landing:

- Site traffic during and after coverage window (compared to baseline)
- Referral traffic from covering publications
- Signups / trials / downloads from target audience segments
- Social engagement + amplification (share ratios)
- Sales-team-reported inbound (attributable to the campaign)

Attribution discipline: PR-attributable is not always PR-caused. Coverage may correlate
with other marketing activity in the same window. Report honestly ("attributable"
means "temporally correlated in a way that suggests PR contribution"; not "PR alone
caused"). Barcelona Principle 4 — qualitative + quantitative both.

### Phase 5 — Assess IMPACT (org / society / reputation-level result)

Highest-level measurement, hardest to attribute cleanly. Standard impact measures:

- **Revenue** — where PR contribution can be defensibly claimed (typically for
  product-launch or funding-announcement campaigns with clear temporal correlation).
- **Reputation** — brand-trust / brand-consideration survey results before/after,
  compared to competitor set.
- **Employee-audience impact** — hiring pipeline signal (unsolicited applications
  spike); employee engagement signal (internal signal, coordinate with maslow's
  wellbeing-monitoring).
- **Policy / regulatory impact** — for advocacy campaigns; whether the intended policy
  conversation shifted.

Not every campaign has measurable impact. Report honestly — "impact was not measured
for this campaign because [reason]" is more useful than fabricated impact-claims.

### Phase 6 — Use the script's AVE refusal

If someone asks for AVE (Advertising Value Equivalency), call `pr_analytics.ave_refuse()`
which returns:

> "AVE (Advertising Value Equivalency) is not a valid PR measurement. Rejected by
> Barcelona Principle 5 (2010, reaffirmed 2015, reaffirmed 2020). Editorial coverage
> and paid advertising are qualitatively different — readers distinguish them; equating
> them misrepresents PR value. Route to Barcelona-aligned metrics: coverage-vs-target,
> reach, share-of-voice, sentiment, message alignment, outtakes, outcomes, impact."

Do NOT compute AVE via a workaround. If a legacy stakeholder insists on AVE, route to
operator + educate on Barcelona standards. The refusal is baked in per §Principles 8.

### Phase 7 — Closed-loop feedback (Barcelona Principle 7 — transparency + learning)

Post-campaign report feeds forward:

- To `media-relations` reporter research — which reporters/publications delivered
  quality coverage; which under-delivered; update the reporter list accordingly.
- To `press-kit` message development — which messages resonated; which didn't; iterate
  the message library for future campaigns.
- To `media-training` message-map — which bridging tactics landed; which hostile-Q
  responses worked in coverage.
- To future campaign planning — what worked structurally (channels, timing, formats)
  and what didn't.

Report the honest findings — including under-deliveries — per Barcelona Principle 7.
A campaign report that only shows wins isn't trustworthy per merit-adjacent scorecard
Principle 3.

## Python Utility

`scripts/pr_analytics.py` provides:

- `share_of_voice(brand_mentions, total_category_mentions)` — brand mentions ÷ total
  × 100 (returns %).
- `sentiment_aggregation(positive, neutral, negative)` — computes % distribution +
  net-sentiment score (positive − negative) as signed percentage.
- `coverage_vs_target(actual_hits, target_hits)` — actual ÷ target (returns ratio,
  can exceed 1.0).
- `reach_estimate(publication_reach_list)` — sum of publication reach values (simple
  additive estimate; note in return that de-duplication of audiences requires panel
  data).
- **`ave_refuse()` — LOAD-BEARING REFUSAL.** Raises `NotImplementedError` with the
  Barcelona Principle 5 explanation. Not a computation function; a principled refusal
  baked into code so the operator cannot invoke AVE by workaround.
- `BARCELONA_PRINCIPLES` — reference list of the 7 principles (2020 version).
- `AMEC_FRAMEWORK_STAGES` — reference tuple of the 6 evaluation-chain stages.

IMPLEMENTED-FROM-DESCRIPTION per §0.5. Self-tests included; run
`python3 pr_analytics.py --test`.

NOT a Shared OS/logical/ script yet (§8.0 two-book minimum unmet — AMEC materials are
institutional per §8.8 but the framework needs an academic-textbook pair). Candidate
second sources for graduation: **Watson & Noble *Evaluating Public Relations***
(academic HR-analytics-adjacent PR-measurement textbook, Kogan Page, multiple editions)
+ **Michaelson & Stacks *A Professional and Practitioner's Guide to Public Relations
Research, Measurement, and Evaluation*** (Business Expert Press).

## Output Format

Each invocation produces one or more of:

- **Campaign goals memo** (Phase 1) — output / outtake / outcome / impact goals stated
  in measurable terms BEFORE the campaign launches.
- **Output metrics report** — coverage count vs target + reach + share-of-voice +
  sentiment + message alignment.
- **Outtakes report** — audience awareness / recall (from survey / panel data).
- **Outcomes report** — behavior-change evidence + attribution discipline notes.
- **Impact assessment** — revenue / reputation / hiring / policy where measurable;
  honest "not measured for this campaign because [reason]" where not.
- **AVE refusal** — when triggered, the Barcelona-Principle-5 explanation instead of
  an AVE number.
- **Closed-loop feedback memo** — findings routed forward to media-relations + press-kit
  + media-training for the next campaign.

## Principles

The Barcelona Principles 3.0 (2020) are the seven load-bearing principles for PR
measurement. Restated here as merit's Universal principles with the AVE refusal
elevated to enforcement level.

1. **Set goals BEFORE the campaign** (Barcelona Principle 1). Without goals,
   measurement is descriptive but not evaluative. Every material campaign gets
   output / outtake / outcome / impact goals stated in measurable terms BEFORE launch.
2. **Measure outputs, outtakes, outcomes, AND impact** (Barcelona Principle 2 + AMEC
   framework). Stopping at outputs is Purpose failure mode 3.
3. **Measure for stakeholders, society, AND the org** (Barcelona Principle 3). PR
   measurement is not just internal — audience-side + broader-impact matter.
4. **Qualitative AND quantitative** (Barcelona Principle 4). Sentiment triage still
   requires human judgment; automated NLP is a first-pass filter, not the answer.
5. **AVE IS NOT A VALID MEASUREMENT** (Barcelona Principle 5 — LOAD-BEARING). Baked
   into `pr_analytics.py` as `ave_refuse()` which raises `NotImplementedError` with
   the Barcelona explanation. No workarounds. If a legacy stakeholder insists, route
   to operator + educate.
6. **Holistic — all channels online + offline** (Barcelona Principle 6). Coverage
   report that measures only online-earned-media misses print + broadcast + podcast +
   trade-press. Every campaign's channel mix defined in Phase 1.
7. **Integrity + transparency drive learning** (Barcelona Principle 7). Report honest
   findings including under-deliveries. Report only-wins is not trustworthy. Closed-loop
   feedback to future campaigns per Phase 7.
8. **§0.6 flag.** Barcelona 3.0 + AMEC framework are canonical institutional standards
   per §8.8 (institutional sources qualify); specific applications (attribution
   thresholds, sentiment methodology, panel-vs-survey tradeoffs) are Tier B until
   Watson & Noble + Michaelson & Stacks are placed and a `Shared OS/logical/pr_analytics.md`
   Route-D asset is built per §8.9.
9. **Individual mental-health signals in analysis conversations escalate immediately.**
   Universal Principle 3 (inherited). Rare in analysis scope but possible if analysis
   surfaces content about the person's mental-health-adjacent public statements.

## Fallback

- **Request for AVE.** `pr_analytics.ave_refuse()` returns the Barcelona Principle 5
  explanation. Do NOT compute AVE via workaround (e.g., "well, if we just multiplied
  column-inches by ad-rate hypothetically..."). If stakeholder insists, route to operator.
- **Campaign has no stated goals.** Do NOT retrofit goals to make the campaign look
  good. Report the coverage descriptively; note the missing goals; recommend Phase 1
  discipline for future campaigns.
- **Attribution ambiguity** (multiple marketing initiatives running concurrently).
  Report honestly — "attributable" as "temporally correlated in a way that suggests
  contribution"; not "caused". Do NOT overstate attribution to inflate PR credit.
- **Impact not measurable.** Report "impact was not measured for this campaign because
  [reason]" rather than fabricating impact claims. Some campaigns don't have measurable
  impact — that's honest, not a failing.
- **Automated NLP sentiment disagrees with human triage.** Trust human triage;
  automated NLP is a first-pass filter per Principle 4 + AMEC guidance. Log the
  disagreement for future NLP-tuning conversations.
- **Coverage present but doesn't reflect messages.** Report as "output achieved,
  message alignment weak" — coverage that reaches audience but misses messages is a
  partial win at best; feeds forward to media-training for message-map iteration.
- **Individual mental-health signal in coverage content.** STOP. Route per Universal
  Principle 3 to manager + HR Ops + EAP if the signal is about a person on the team;
  do not analyze the content further without appropriate handling.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `media-relations` (custom, herald — sibling) | Post-campaign closed-loop feedback: which reporters delivered quality coverage; update reporter list | Downstream — pr-analytics measures; media-relations uses findings |
| `press-kit` (custom, herald — sibling) | Message effectiveness feedback: which messages resonated / didn't | Downstream — message library iterates |
| `media-training` (custom, herald — sibling) | Message-alignment measurement: did the coverage reflect the message-map? | Downstream — media-training iterates message-maps + Q&A library |
| `crisis-comms` (custom, beacon — Comms & PR sibling) | Crisis-response measurement — coverage tracking + sentiment shift during crisis | Cross-cutting — same measurement framework, crisis-specific interpretation |
| `investor-cadence` + `data-room-discipline` (custom, beacon — sibling) | Investor-audience share-of-voice; some overlap on IR-adjacent coverage measurement | Coordination — some metrics shared, some IR-specific |
| `signal` (custom — Comms & PR sibling, Internal Comms) | Internal-audience measurement — coverage that team sees + amplifies | Coordination — signal has its own internal-audience metrics |
| `hr-strategy-alignment` (custom, merit — P&C) | PR / brand-reputation metrics feed merit's BSC Employee/Customer perspective; hiring-pipeline PR-signal feeds merit's talent-flow metrics | Downstream — pr-analytics supplies aggregate signals |
| `motivation-map` + `wellbeing-monitoring` (custom, maslow — P&C) | Employee-audience PR-signal (unsolicited-applications spike, employee-engagement signal from external coverage) | Cross-department coordination |
| Future Growth & Partnerships department (task #5) | Marketing-funnel attribution (leads / opps influenced by PR) — pr-analytics measures PR outcomes; marketing attribution is broader | Downstream — coordinate but distinct scope |
| Future `Shared OS: people-analytics-metrics` | Some metrics overlap (share-of-voice methodology, sentiment aggregation) — future consolidation candidate | Bidirectional |
| `veil` (Cybersecurity — data protection) | PII in coverage-tracking + reporter databases; survey/panel data governance | Escalation |
| Operator + legacy stakeholder | AVE requests — refuse per Principle 5; educate on Barcelona standards | Escalation for AVE-insistent stakeholders |
| Manager + HR Ops + EAP | Individual mental-health signal in coverage content — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every measurement report before it ships | Cross-cutting |

## References (public / verifiable)

- [Barcelona Principles 3.0 (2020) — AMEC](https://amecorg.com/barcelona-principles/)
- [AMEC — Integrated Evaluation Framework](https://amecorg.com/how-to-frameworks/integrated-evaluation-framework/)
- [AMEC Measurement Museum — case studies](https://amecorg.com/education/)
- [Cision — PR measurement resources](https://www.cision.com/resources/)
- [Meltwater — sentiment-analysis methodology](https://www.meltwater.com/en/resources)
- [Institute for Public Relations (IPR) — measurement research](https://instituteforpr.org/measurement/)
