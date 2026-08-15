<!--
Custom skill — built from scratch, synthesized from named published sources (Fink 2013
+ Coombs SCCT + Judy Smith + PRSA institutional). Body follows §11 required structure +
§14.2 exact-heading compiler contract.

Reclassification note (2026-07-31): the catalog listed this as "crisis-comms MARKETPLACE."
§4.1 search found `jamditis/crisis-communications` on mcpmarket (41 stars) — newsroom/
journalist-oriented rather than org-side crisis-response oriented. Scope mismatch: beacon
needs org-side crisis-response (holding statements + stakeholder sequencing + investor
coordination + correction/retraction handling), not newsroom-side fact-checking + rapid
verification. Same reclass path as herald's `media-relations` (gnoviawan mcpmarket scope
mismatch) + P&C's SDT/DP/feedback-methods reclasses.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Judy Smith was one of herald's identity-candidate options (I
presented Scott/Smith/Campbell); Scott was picked. Smith's crisis-PR discipline appears
here as source material for the crisis-specific scope. Single practitioner corpus grounds
2 skills across Comms & PR — extract once, use twice per §8.9.
-->
---
name: crisis-comms
type: custom
status: built from scratch (reclassified from catalog's marketplace slot per §4.6 exception)
sources_referenced:
  - "Fink, Steven (1986, updated 2013). Crisis Communications: The Definitive Guide to Managing the Message. McGraw-Hill. ISBN 978-0071799225. Practitioner-operator per §8.9 — advised Three Mile Island crisis response; 20+ years crisis-PR practice; foundational text in the discipline."
  - "Coombs, W. Timothy (multiple editions). Ongoing Crisis Communication: Planning, Managing, and Responding. Sage. Named academic per §8.8 (Texas A&M professor). SCCT (Situational Crisis Communication Theory) — matches response strategy to crisis-attribution-type."
  - "Smith, Judy (2012). Good Self, Bad Self. Free Press. Named practitioner (basis for the Scandal character) — crisis-PR specialist; extract-once-use-twice with herald identity-candidate options per §8.9."
  - "PRSA (Public Relations Society of America) Crisis Communication institutional materials — professional standards; some FREE at prsa.org."
  - "Barcelona Principles 3.0 codified in herald's pr_analytics.ave_refuse() — measurement discipline for crisis-response coverage; inherited across Comms & PR."
  - "Scott, David Meerman (2020) — herald identity anchor; real-time PR framing for crisis speed-of-response (hours not days) inherited via herald tone-inheritance."
fulfills_catalog_entry: crisis-comms (catalog listed as marketplace; reclassified per §4.6)
reclassification_notes:
  - "Catalog labeled MARKETPLACE. §4.1 search found jamditis mcpmarket skill (41 stars) with scope mismatch — newsroom/journalist-oriented not org-side crisis-response. Reclass matches Comms & PR pattern for scope-mismatch cases."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "Fink 2013 + Coombs SCCT + Smith 2012 + PRSA + Barcelona (inherited) — 5 sources; well above §8.0 two-book minimum for Route D."
assigned_agent: beacon (Comms & PR / Investor Comms)
portable: true
date_added: 2026-07-31
tier: 3
description: Organizational crisis communications framework — Fink 5-stage lifecycle + Coombs SCCT (Situational Crisis Communication Theory) response matching + Judy Smith practitioner discipline. Owns holding statements + stakeholder sequencing + single-spokesperson rule + correction/retraction protocol + first-30-minutes discipline. Trigger on "we have a crisis", "holding statement for", "correction request", "retraction after coverage", "hostile press moment", "crisis response plan", "stakeholder sequencing", or "match response to crisis type".
triggers:
  - we have a crisis
  - holding statement for
  - correction request
  - retraction after coverage
  - hostile press moment
  - crisis response plan
  - stakeholder sequencing
  - match response to crisis type
  - first 30 minutes crisis
  - SCCT
---

# Crisis Comms

## Introduction

This skill packages organizational crisis-communications discipline for beacon. Combines
the canonical practitioner text (Fink 1986/2013 *Crisis Communications: The Definitive
Guide to Managing the Message*) + the academic Situational Crisis Communication Theory
(Coombs' SCCT) + practitioner discipline (Judy Smith 2012) + PRSA institutional
standards + Barcelona-aligned measurement inherited from herald's `pr-analytics`.

**Scope distinction:** this is ORG-SIDE crisis response — helping the org manage the
message when a crisis affects it. Distinct from journalist-side crisis coverage
(fact-checking + rapid verification for reporters producing the story) which the
jamditis mcpmarket skill covers and which is out of beacon's scope.

Reclassified from the catalog's marketplace slot per §4.6 — jamditis mcpmarket skill
(41 stars) had scope mismatch (newsroom-oriented). Same reclass path as herald's
`media-relations` and 3 other P&C reclasses.

**Cross-agent §8.9 note:** Judy Smith appeared as an identity-candidate option for
herald (I presented Scott/Smith/Campbell; Scott was picked). Smith's crisis-PR discipline
appears here as source material specifically for beacon's crisis scope. Single
practitioner corpus grounds 2 skills across Comms & PR — extract once, use twice.

## Purpose

Prevents six failure modes that show up when crises hit an unprepared org:

1. **No crisis plan** — crisis hits; team scrambles; ad-hoc responses generate
   contradictions across channels. Fink's Stage 1 (Prodromal / precursor) discipline
   requires a plan BEFORE the crisis, not during. This skill assumes the plan exists
   or is being drafted; if neither, escalate to operator immediately.
2. **Missed first-30-minutes window** — the initial window between the crisis event
   and first public response is when the narrative gets set. Silence during this window
   invites journalists + social media to frame the story without the org's voice.
   Fink's + Smith's discipline: first holding statement out within 30 minutes even if
   it's just "we're aware; investigating; will update within [time window]."
3. **Wrong SCCT-attribution-response match** — Coombs's SCCT shows that response
   strategy must match crisis-attribution type (victim / accidental / preventable).
   Preventable-attribution crises need FULL responsibility + corrective action; using
   victim-frame response for a preventable crisis worsens the outcome measurably.
4. **Stakeholder-sequence break** — telling investors before affected employees, or
   the public before either, breaks trust across all three. Standard sequence: affected
   → investors → public. This skill enforces the sequence.
5. **Multiple spokespeople contradicting** — different voices from the org during a
   crisis produce contradictions that get amplified. Single-designated-spokesperson
   rule prevents this. Deviation is a §Principles violation.
6. **Individual crisis DURING org crisis** — team members processing the org crisis +
   personal distress can coincide. Elevated probability during high-stakes crisis
   moments. HARD BOUNDARY per Universal Principle 3 — individual crisis signal blocks
   all processing regardless of org-crisis timing pressure.

beacon uses this skill as the operational entry point whenever an event qualifies as
crisis-adjacent (see When to Use). Coordinates upstream with herald (`media-training`
for spokesperson prep, `press-kit` for holding-statement TEMPLATES, `media-relations`
for reporter coordination) and downstream with hire, merit, maslow via P&C for
employee-facing coordination.

## When to Use

Trigger on:

- "We have a crisis" / "crisis response plan" / "activate crisis protocol"
- "Holding statement for [situation]" / "draft the holding statement"
- "Correction request from [reporter / publication]" / "we need to issue a correction"
- "Retraction after coverage" / "coverage got a key fact wrong"
- "Hostile press moment" / "reporter [X] is hostile on [topic]"
- "Stakeholder sequencing" / "who do we tell first"
- "SCCT" / "match response to crisis type" / "Situational Crisis Communication Theory"
- "First 30 minutes crisis" / "we just found out about [event]"
- Handoff from herald's `media-relations` when a pitch or interview escalates to
  crisis-adjacent (hostile topic, correction request, leaked news)
- Handoff from signal's `change-comms` when a change event escalates to crisis
  (leaked news, unexpected market reaction, hostile press coverage of the change)

Do NOT use for:

- **Routine PR / press outreach** → herald's `media-relations` + `press-kit` +
  `media-training`.
- **Routine internal comms / decision broadcasts / all-hands** → signal's `internal-cadence`.
- **Change-management comms** (planned reorg / layoff / merger without crisis dimension)
  → signal's `change-comms`. Only if the change escalates to crisis (leaked / hostile /
  unexpected reaction) does it route here.
- **Investor cadence / data-room maintenance** → beacon's `investor-cadence` +
  `data-room-discipline` (sibling skills within beacon).
- **Legal crisis** (litigation, regulatory enforcement action, SEC investigation) —
  route to operator + securities/employment/regulatory counsel FIRST; this skill
  coordinates comms discipline only AFTER counsel is involved.
- **Individual mental-health crisis signals** → HARD BOUNDARY escalation to manager +
  HR Ops + EAP per Universal Principle 3.

## Structure / Protocol

The crisis-comms workflow combines two frameworks (Fink lifecycle + Coombs SCCT):

```
FINK 5-STAGE CRISIS LIFECYCLE (Fink 1986/2013)

  Stage 1: PRODROMAL   — precursor / warning signals; act on Stage 1 signals + you
                         may avoid the acute stage
  Stage 2: ACUTE       — crisis event; damage happening; first-30-min discipline critical
  Stage 3: CHRONIC     — ongoing cleanup + lawsuits + coverage; can last months-years
  Stage 4: RESOLUTION  — org returns to normal (or new normal); crisis officially over
  Stage 5: LEARNING    — post-crisis retrospective + institutional learning + plan update


COOMBS SCCT (Situational Crisis Communication Theory)

  CRISIS-ATTRIBUTION TYPE     →   MATCHED RESPONSE STRATEGY

  VICTIM cluster                  DENY / diminish
  (Natural disaster,              (deny responsibility; minimize link)
   workplace violence
   by outsider, product
   tampering)                     "We were also affected. We're helping victims."

  ACCIDENTAL cluster              DIMINISH / rebuild (moderate)
  (Technical accident,            (acknowledge; explain circumstances; commit to fix)
   product failure not
   due to negligence,
   challenge)                     "We're sorry this happened. Here's what we're doing."

  PREVENTABLE cluster             REBUILD / FULL RESPONSIBILITY
  (Human error, org               (acknowledge fully; apologize; corrective action;
   misconduct, ethical            offer restitution)
   violation, negligence)
                                  "We are responsible. We apologize. Here's how we make
                                   it right + prevent recurrence."

  WRONG match = worse outcome. Using DENY for a PREVENTABLE crisis (e.g., "it wasn't
  really our fault" for organizational misconduct) measurably worsens reputation +
  legal exposure. Coombs' research: victims + regulators respond to mismatch with
  greater hostility than they would to a full-responsibility response.


CRISIS-COMMS OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: ASSESS + ASSEMBLE + ACTIVATE   (0-30 min from awareness)
  Phase 2: FIRST HOLDING STATEMENT         (within 30 min)
  Phase 3: SCCT-ATTRIBUTION DIAGNOSIS      (concurrent with Phase 2)
  Phase 4: STAKEHOLDER SEQUENCING          (affected → investors → public)
  Phase 5: SINGLE-SPOKESPERSON DELIVERY    (all interviews + statements)
  Phase 6: CORRECTION / RETRACTION HANDLING (if coverage errors)
  Phase 7: SUSTAINED CADENCE               (hourly-to-daily during acute; weekly during chronic)
  Phase 8: RESOLUTION + LEARNING           (post-acute retrospective)
```

## Instructions

### Phase 1 — Assess + Assemble + Activate (first 30 minutes from awareness)

Simultaneously in the first 30 minutes:

- **Assess** — what happened? Who is affected? What's the crisis-attribution type per
  Coombs SCCT (victim / accidental / preventable)? What's the timeline of exposure?
- **Assemble** — activate the crisis team. Standard membership: designated spokesperson,
  legal counsel (mandatory), HR (if employee-affected), affected-function leader (product
  / operations / etc.), beacon (comms lead), operator (final decision authority).
- **Activate** — internal alert to the crisis team. Do NOT wait for full facts to
  activate; better to stand down a false alarm than lose the first-30-minutes window.

If no pre-existing crisis plan exists, escalate to operator IMMEDIATELY — this skill
assumes a plan (or the plan is being drafted concurrent with Phase 1 activation). Draft
holding statement anyway (Phase 2) but flag operator that plan is being reverse-engineered.

### Phase 2 — First holding statement (within 30 minutes)

**The first-30-minute window is non-negotiable.** Silence during this window invites
journalists + social media to frame the story without the org's voice. First holding
statement template:

```
[ORG] is aware of [event/situation]. We are [investigating / actively responding /
gathering facts]. Our first priority is [affected people / safety / accuracy]. We
will provide [next update time or milestone]. Contact for media: [designated spokesperson].
```

**Rules for the first holding statement:**

- **Under 100 words.** Longer statements produce more nits for reporters to pick apart
  before facts are settled.
- **Acknowledge the event.** Do NOT deny existence of a situation that will be verified
  publicly.
- **State first priority** (usually people, safety, or accuracy). Never state financial
  impact as first priority even if it is — reads as tone-deaf.
- **Commit to next update time.** Specific ("within 2 hours") is stronger than vague
  ("soon").
- **Single spokesperson contact** stated explicitly. All follow-up questions route to
  one voice per Phase 5.
- **Never speculate.** "We don't know yet" is stronger than a guess. Journalists remember
  guesses that turn out wrong.

### Phase 3 — SCCT-attribution diagnosis (concurrent with Phase 2)

Match the crisis to Coombs's attribution clusters (Structure/Protocol above):

- **Victim cluster** (natural disaster; workplace violence by outsider; product
  tampering by third party) → DENY / DIMINISH strategy. "We were also affected. Here's
  what we're doing to help victims."
- **Accidental cluster** (technical accident; product failure not due to negligence;
  challenge without evidence of misconduct) → DIMINISH / REBUILD (moderate). "We're
  sorry this happened. Here's what we're doing to fix it."
- **Preventable cluster** (human error; organizational misconduct; ethical violation;
  negligence) → REBUILD / FULL RESPONSIBILITY. "We are responsible. We apologize.
  Here's how we make it right and prevent recurrence."

**WRONG-match warning:** using DENY for a PREVENTABLE crisis measurably worsens
reputation + legal exposure per Coombs's research. When attribution is UNCLEAR in the
first hours (facts still developing), default to the more-responsible response strategy
(diminish rather than deny; rebuild rather than diminish) — safer to over-acknowledge
than under-acknowledge.

Legal counsel involvement is MANDATORY for the attribution diagnosis if there's any
possibility of litigation exposure. "Preventable" attribution carries specific legal
implications that counsel must confirm before the response strategy commits.

### Phase 4 — Stakeholder sequencing

**Standard sequence: affected → investors → public.** Never break the sequence:

- **Affected people FIRST.** Directly-affected employees / customers / partners /
  families. They should NEVER hear about the crisis from external media before hearing
  from the org.
- **Investors SECOND.** Board + material shareholders + institutional investors.
  Coordination with beacon's `investor-cadence` for material-info disclosure timing
  (for public companies, SEC Reg FD timing constraint — legal counsel involved).
- **Public / press THIRD.** Media outreach via herald's `media-relations` +
  `press-kit`; general public via owned channels.

Simultaneous release is acceptable when regulatory timing forces it (SEC Reg FD requires
simultaneous public disclosure with select investors) — but sequence-break by mistake
or convenience is not.

**Sequence-break consequences:** affected people learning from external media before
the org = trust damage that lasts years. Investors learning from public disclosure
before official notification = securities-law exposure + investor-relations damage.
These are the specific outcomes this rule prevents.

### Phase 5 — Single-spokesperson delivery

**One designated spokesperson for the entire crisis.** All statements, all interviews,
all Q&A route through the same voice. Standard designations:

- **CEO** — highest-visibility crisis; ethical / reputational; requires org-level
  authority.
- **CFO** — financial crisis (restatement / fraud allegation / market reaction).
- **CTO** — technical crisis (breach / outage / product failure).
- **CLO or General Counsel** — legal-adjacent (litigation announcement / regulatory
  action) — coordinated with securities counsel.
- **Designated Crisis Spokesperson** — pre-identified in the crisis plan; typically
  a senior communications executive or the operator.

**Deviation is a §Principles violation.** Multiple voices produce contradictions;
contradictions get amplified. If the designated spokesperson is unavailable, HOLD
statements until an alternate designated by the crisis team + operator can speak.

Spokesperson prep coordinates with herald's `media-training` — the 3-messages-MAX + ABC
bridging + hostile-Q drill + SPJ on-record standards + dry-run rehearsal discipline all
apply, adapted for the crisis context (higher stakes; faster timing; hostile likelihood).

### Phase 6 — Correction / retraction handling (if coverage errors emerge)

When coverage runs with factual errors (reporter got a fact wrong, misquoted the
spokesperson, framed the story inaccurately):

- **Verify the error** — confirm with press-kit canonical library + fact-check discipline.
- **Assess materiality** — is the error material to the crisis narrative (worth
  correcting publicly) or immaterial (worth letting go)?
- **Reach out to reporter FIRST** — private correction request via media-relations
  (herald sibling coordination). Most reporters correct genuine errors upon request.
- **Public correction ONLY if reporter refuses** — issue a factual clarification via
  owned channels; do NOT frame as attack on the reporter (burns the relationship).
- **Never issue silent corrections** — if a public correction ships, it references
  the specific coverage that had the error.

For hostile press moments (reporter continues to run inaccurate framing despite
correction requests), escalate to operator + legal counsel for defamation review; do NOT
resolve in-conversation with the reporter.

### Phase 7 — Sustained cadence (during acute + chronic stages)

**Acute stage (typically 24-72 hours):** hourly-to-every-few-hours updates:

- Fact updates as verified
- Response actions as executed
- Investigation progress
- Support / restitution for affected people

**Chronic stage (weeks-to-months):** weekly-to-monthly updates:

- Investigation findings
- Corrective actions completed
- Regulatory / legal status
- Progress toward resolution

Silence during acute stage = story goes stale + speculation fills the vacuum. Silence
during chronic stage = perceived cover-up + credibility damage.

All updates through the single spokesperson (Phase 5). All content through the crisis
team + legal review before external release.

### Phase 8 — Resolution + learning (post-acute retrospective)

Once the acute stage ends and the org enters resolution:

- **Publicly declare resolution** — signal to stakeholders that the acute phase is
  over; state what was learned + what's changing.
- **Internal retrospective** — Fink's Stage 5. What worked / what didn't / what needs
  to change in the crisis plan. Confidential internal document per legal-counsel
  guidance.
- **Update crisis plan** — feed learning back into Stage 1 Prodromal preparedness for
  next time.

## Output Format

Each invocation produces one or more of:

- **First holding statement** — <100 words, acknowledge + priority + next update time
  + spokesperson contact.
- **SCCT-attribution diagnosis** — crisis type + matched response strategy + legal
  counsel confirmation status.
- **Stakeholder-sequencing plan** — affected → investors → public with per-sequence
  content + timing.
- **Single-spokesperson designation** — named person + backup + spokesperson-prep
  handoff to herald's media-training.
- **Correction/retraction plan** — reporter outreach OR public correction OR legal
  escalation.
- **Sustained-cadence schedule** — acute + chronic update rhythm.
- **Resolution declaration** — public + internal.
- **Post-crisis retrospective** — what worked / what didn't / crisis-plan updates.

## Principles

1. **First-30-minutes window is non-negotiable** (Fink discipline). Silence during
   this window = story frames without the org's voice. Holding statement out within
   30 minutes even if just "we're aware; investigating."
2. **SCCT-attribution match matters** (Coombs). Wrong match = worse outcome. When
   attribution is unclear, default to MORE-responsible response (rebuild over
   diminish; diminish over deny).
3. **Never speculate.** "We don't know yet" is stronger than a guess. Journalists
   remember guesses that turn out wrong. Universal Principle 1 (§0.5) applied under
   crisis pressure.
4. **Stakeholder sequence: affected → investors → public.** Never break. Sequence-break
   damages trust for years + creates securities-law exposure.
5. **Single spokesperson.** One voice for the entire crisis. Deviation invites
   contradiction. If designated unavailable, HOLD until alternate designated.
6. **Never issue silent corrections.** If a public correction ships, it references
   the specific coverage that had the error explicitly.
7. **Legal counsel MANDATORY** for SCCT-attribution diagnosis when litigation exposure
   is possible. "Preventable" attribution carries specific legal implications.
   Universal Principle 5 legal fence.
8. **No corporate euphemism** — inherited from signal's Principle 7 + herald identity
   (Scott + McCord). Honest WHY under crisis pressure; euphemism during crisis is
   worse than routine because stakes are higher.
9. **Aggregate-only at publication surface** — Universal Principle 2 inherited.
   Individual perf / demographic / feedback / medical data NEVER published even during
   crisis.
10. **Individual crisis signals during org crisis** — HARD BOUNDARY per Universal
    Principle 3. Team members processing personal distress + org crisis coincide
    at elevated rate; escalate to manager + HR Ops + EAP without exception, regardless
    of org-crisis timing pressure.
11. **AVE-refusal-at-code-level applies** — inherited from herald's `pr-analytics`.
    Crisis-response coverage measurement uses Barcelona-aligned metrics; NEVER AVE.
12. **§0.6 flag.** Fink 5-stage lifecycle + Coombs SCCT + Judy Smith practitioner
    discipline are Tier B (canonical academic + practitioner sources cited but not
    book-page-cited from `Agents/_books/`). Downgrade to Tier A when Fink 2013 +
    Coombs multiple editions + Smith 2012 are placed and a `Shared OS/logical/crisis_comms.md`
    Route-D asset is built per §8.9.

## Fallback

- **No pre-existing crisis plan.** Escalate to operator immediately + activate crisis
  team simultaneously with Phase 1 assessment. Draft holding statement anyway to meet
  first-30-minute window; flag operator that plan is being reverse-engineered.
- **Legal counsel unavailable + timing pressure.** HOLD SCCT-attribution response
  strategy commitment. Ship holding statement (Phase 2 — factual acknowledgment) but
  do NOT commit to a response strategy without counsel involvement per Principle 7.
- **Facts still developing + speculation pressure from reporters.** "We don't know
  yet" (Principle 3). Journalists remember guesses; do not guess under pressure.
- **Attribution unclear.** Default to MORE-responsible response strategy per Principle
  2. Safer to over-acknowledge than under-acknowledge when facts are developing.
- **Stakeholder-sequence break required by regulatory timing** (SEC Reg FD for public
  companies requires simultaneous). Coordinate with beacon's `investor-cadence` +
  operator + securities counsel; document the regulatory constraint in the sequencing
  plan.
- **Single spokesperson unavailable.** HOLD statements until alternate designated. Do
  NOT let a non-designated executive speak just because they're available.
- **Reporter refuses correction request.** Public correction via owned channels; do
  NOT frame as attack on reporter (burns future relationship). If continued
  inaccurate framing, escalate to operator + legal counsel for defamation review.
- **Individual crisis signal during org-crisis conversation.** STOP. Route per
  Universal Principle 3 (inherited) to manager + HR Ops + EAP. Elevated probability
  during org-crisis moments; HARD BOUNDARY overrides all org-crisis timing pressure.
- **Material NPI in crisis response.** Route to board + operator + securities counsel
  BEFORE any external comms. SEC Reg FD timing coordination via `investor-cadence`
  (sibling).
- **Legal crisis (litigation / regulatory enforcement action / SEC investigation).**
  Route to operator + securities/regulatory counsel FIRST; this skill coordinates comms
  discipline only AFTER counsel is involved.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `investor-cadence` + `data-room-discipline` (custom, beacon — sibling) | Material-info fence + investor-facing crisis coordination + SEC Reg FD timing for public companies | Coordination + escalation |
| `media-training` (custom, herald — sibling) | Spokesperson prep for crisis interviews — 3-messages-MAX + ABC bridging + hostile-Q drill adapted for crisis context | Downstream — crisis-comms designates spokesperson; media-training preps them |
| `press-kit` (custom, herald — sibling) | Holding-statement TEMPLATES from press-kit's canonical library; official crisis statements | Downstream — press-kit provides templates; crisis-comms fills in crisis specifics |
| `media-relations` (custom, herald — sibling) | Reporter outreach for corrections + hostile press moments; crisis-response coverage tracking | Coordination |
| `pr-analytics` (custom, herald — sibling) | Crisis-response coverage measurement using Barcelona-aligned metrics; AVE refusal inherited | Downstream — closes the crisis loop with measurement |
| `internal-cadence` (custom, signal — sibling) | Internal announcements coordination during crisis (affected employees FIRST per stakeholder sequencing) | Coordination |
| `change-comms` (custom, signal — sibling) | If a change event escalates to crisis (leaked / hostile / unexpected reaction), change-comms routes here | Escalation from signal |
| `hire` (P&C Lead) + `payroll-and-eor` | Employee-affected crisis dimensions (layoff-adjacent, protected-class exposure, benefits during crisis) | Coordination + escalation to counsel |
| `merit`'s `feedback-methods` (P&C) | Individual 1:1 delivery discipline for accompanying manager-to-directs conversations during org crisis | Cross-department |
| `maslow`'s `wellbeing-monitoring` (P&C) | Aggregate wellbeing monitoring during and post-crisis (elevated distress probability) | Cross-department coordination |
| `board` (Governance) | Governance approval for major crisis-response decisions; material-info disclosure timing | Escalation |
| Operator + securities counsel | Material NPI disclosure timing; SEC Reg FD compliance for public companies | Escalation — LOAD-BEARING legal fence Universal Principle 5 |
| Operator + employment counsel | Employee-affected crisis (WARN Act triggers, protected-class impact, harassment/discrimination claims surfacing during crisis) | Escalation |
| Operator + defamation/libel counsel | Reporter refusing correction request + continued inaccurate framing | Escalation |
| Manager + HR Ops + EAP | Individual mental-health signal during crisis conversation (elevated probability) — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every crisis-response artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [Fink, Steven — Crisis Communications book page (McGraw-Hill)](https://www.mhprofessional.com/9780071799225-usa-crisis-communications-the-definitive-guide-to-managing-the-message)
- [Coombs, W. Timothy — SCCT overview via Ongoing Crisis Communication book page (Sage)](https://us.sagepub.com/en-us/nam/ongoing-crisis-communication/book272062)
- [Institute for Public Relations — SCCT research overview (institutional)](https://instituteforpr.org/crisis-management-and-communications-updated-january-2014/)
- [Smith, Judy — author site + Good Self, Bad Self book page](https://judysmith.com/)
- [PRSA — Crisis Communication professional standards](https://www.prsa.org/topics-tools/topics/crisis-communication)
- [PRSA Silver Anvil Awards — crisis-comms case studies (institutional)](https://www.prsa.org/awards/silver-anvil-awards)
