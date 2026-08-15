<!--
Custom skill — built from scratch, synthesized from named published sources (Scott 2020 +
newsjacking framework + Cision / Muck Rack institutional guidance). Body follows §11
required structure + §14.2 exact-heading compiler contract.

Reclassification note (2026-07-31): the catalog listed this as "media-relations MARKETPLACE."
§4.1 search found `Digital PR & Media Relations` on mcpmarket by gnoviawan (29 GitHub
stars, real adoption but middle-zone quality; scope bundled media outreach + press
release + crisis-comms + SEO link building = blurs 3-4 skill boundaries in this
department). Per §4.6 exception clause and the P&C pattern established with SDT /
deliberate-practice / feedback-methods reclasses: when a marketplace candidate has scope
mismatch that blurs boundaries with other planned skills in the department, reclass to
custom and build from cited published sources.

Same reclass path applied here. Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Scott 2020 also grounds herald's identity file (David Meerman
Scott is the picked identity anchor). Same book grounds framework + identity — extract
once, use twice.
-->
---
name: media-relations
type: custom
status: built from scratch (reclassified from catalog's marketplace slot per §4.6 exception)
sources_referenced:
  - "Scott, David Meerman (2020, 8th ed; first ed 2007). The New Rules of Marketing and PR: How to Use Content Marketing, Podcasting, Social Media, AI, Live Video, and Newsjacking to Reach Buyers Directly. Wiley. Practitioner-operator per §8.9 — former IBM / MarketWave / IONA; keynote speaker; established real-time-PR / newsjacking framework."
  - "Scott, David Meerman. Newsjacking framework — the practice of injecting your ideas into breaking news to generate press coverage. Widely documented in Scott's blog + speaking corpus."
  - "Cision — media-database vendor with public best-practices materials on journalist outreach (institutional-adjacent source; supplementary reference)."
  - "Muck Rack — journalist-database vendor with public best-practices materials on pitch craft (institutional-adjacent source; supplementary reference)."
  - "Smith, PR (multiple editions). SOSTAC framework — Situation-Objectives-Strategy-Tactics-Action-Control planning discipline. Referenced by the gnoviawan mcpmarket skill; used here for the campaign-planning surface."
fulfills_catalog_entry: media-relations (catalog listed as marketplace; reclassified per §4.6)
reclassification_notes:
  - "Catalog labeled MARKETPLACE. §4.1 search found `Digital PR & Media Relations` on mcpmarket by gnoviawan (29 stars) — scope bundled 4 skill boundaries; reclass matches P&C pattern for scope-mismatch cases."
  - "Route D per §8.2 — cited rubric, no formula, no script."
  - "Scott 2020 cross-serves this skill AND herald's identity file per §8.9 extract-once-use-twice."
assigned_agent: herald (Comms & PR / Lead — PR & Media)
portable: true
date_added: 2026-07-31
tier: 2
description: The media-relations pitch craft + reporter research + real-time-PR / newsjacking framework for external press coverage. Grounded in Scott 2020 (The New Rules of Marketing and PR). Trigger on "pitch this to media", "media outreach for", "how do I get press coverage", "newsjacking", "reporter research for", "pitch craft", or "why won't reporters cover us".
triggers:
  - pitch this to media
  - media outreach for
  - how do I get press coverage
  - newsjacking
  - reporter research for
  - pitch craft
  - why won't reporters cover us
  - draft a media pitch
---

# Media Relations

## Introduction

This skill packages David Meerman Scott's *The New Rules of Marketing and PR* framework
(8th ed 2020; first ed 2007) into herald's operational entry point for external press
coverage. Scott's core insight — that PR shifted from "press-release-and-pray" to
"real-time, buyer-direct, content-driven" over the past two decades — is the theoretical
anchor. The **newsjacking** technique (injecting your ideas into breaking news to
generate coverage) is Scott's specific contribution; it's the practice this skill
optimizes for when a news hook is available. When no news hook exists, the skill falls
back to relationship-first outreach + reporter-beat-aligned angle discipline.

Reclassified from the catalog's marketplace slot per §4.6 — §4.1 marketplace search
found the `gnoviawan/digital-pr-media-relations` skill on mcpmarket with 29 GitHub stars,
but its scope bundles media outreach + press release + crisis-comms + digital-PR SEO
link building, blurring boundaries with 3-4 planned Comms & PR skills. Same reclass
path as maslow's SDT, grove's deliberate-practice, and merit's feedback-methods.

**Honesty bound — the "New Rules" aren't universal.** Scott's framework is heavily
tuned to B2B tech / SaaS / content-marketing contexts, and its "shift from
press-release-and-pray to content-marketing-direct" thesis works best when the buyer
does their own research online before making a purchase. For consumer-media / lifestyle
brands, breaking-news political-comms, and heavily regulated industries (finance,
pharma), traditional embargo-and-exclusive PR still dominates. This skill applies
Scott's framework where it fits and names the limits where it doesn't.

## Purpose

Prevents three failure modes that show up most often in workplace media outreach:

1. **Press-release-and-pray.** Distributing a press release via a wire service and
   hoping reporters pick it up produces low-coverage rates and no relationships. Scott's
   framework: skip the wire, publish direct to your own site, brief a small set of
   pre-researched reporters whose beat aligns with the story.
2. **Wrong-reporter blast pitching.** Sending the same pitch to 40 reporters
   irrespective of beat produces mostly-ignored inboxes and burns future relationships.
   This skill's reporter-research discipline is single-source (per journalist), not blast.
3. **Missing the newsjack window.** When breaking news creates a moment where your
   perspective is relevant, you have hours (not days) to publish a pitch. Miss the
   window and the coverage opportunity closes. This skill's newsjacking cycle owns
   the timing discipline.

herald uses this skill as the pitch-craft + campaign-planning surface. It hands off to
`press-kit` (custom, herald) for the underlying press-kit content, to `media-training`
(custom, herald) for spokesperson prep before high-stakes interviews, and to `pr-analytics`
(custom, herald) for coverage measurement after the fact.

## When to Use

Trigger on:

- "Pitch this to media" / "draft a media pitch for [story]"
- "Media outreach for [product launch / milestone / study]"
- "How do I get press coverage for [thing]" / "why won't reporters cover us"
- "Newsjacking" / "there's a breaking news moment we could ride"
- "Reporter research for [beat / publication]"
- "Pitch craft" / "help me phrase this pitch better"
- Handoff from `press-kit` when campaign material is ready and needs to reach reporters

Do NOT use for:

- **Crisis communications** → `crisis-comms` (custom, beacon — Comms & PR sibling).
  Media relations during a crisis routes to beacon; herald's crisis role is
  press-relationship management, not the crisis-message drafting.
- **Internal communications** → `signal` (custom, sibling). Team-facing / all-hands
  work is signal's scope.
- **Investor communications** → `beacon` (custom, sibling). Data-room + IR-cadence +
  investor-briefing is beacon's scope; echo (Executive Office) handles pitch materials
  + board prep.
- **Content marketing at scale** → future or existing Brand Studio skill (spark / lena /
  weave / muse). Media relations is one-to-few reporter outreach; content marketing is
  one-to-many audience-facing.
- **SEO / digital-PR link building** → `rank` (Engineering — technical SEO); coordinate
  cross-department for content-marketing-adjacent SEO.
- **Individual mental-health signals during outreach conversation** → HARD BOUNDARY to
  manager + HR Ops + EAP per Universal Principle 3 (inherited).

## Structure / Protocol

The media-relations cycle:

```
1. WHERE'S THE HOOK
    News hook (planned or newsjack) OR relationship-first (evergreen story).
    No hook + no relationship = don't pitch; build the reporter list first.

2. REPORTER RESEARCH (single-source, not blast)
    For each candidate reporter: recent coverage, beat, preferred contact,
    stated preferences (Muck Rack profile if available), publication constraints.
    Rule: don't pitch reporter you haven't researched.

3. PITCH CONSTRUCTION
    Subject line = the pitch (Cision + Scott discipline).
    Opening 2 sentences = the news + why it matters to THIS reporter's audience.
    Body = 3-5 sentences max + link to full press-kit content + optional exclusive offer.
    Close = one specific ask (call? interview? embargo until X?).

4. DELIVERY
    Email typically; some beats prefer DM (product/gadget beats) or phone (breaking news).
    Send at times aligned to the reporter's actual work rhythm (not global-default 9am).
    Personalize opening — reference their recent article; NOT a form letter.

5. FOLLOW-UP
    One follow-up after 3-5 business days if no response. Second follow-up ONLY if the
    first added new information. Silence = signal to move on; do not spam.

6. NEWSJACKING (special-case timing discipline)
    Breaking news happens → assess relevance (do we actually have a POV?).
    IF yes: publish POV to own channels IMMEDIATELY (blog post + social).
    Pitch within HOURS (not days). Miss the window and the opportunity closes.
    (Scott, throughout — real-time PR is the framework's core.)

7. RELATIONSHIP MAINTENANCE (ongoing)
    Cover coverage-received publicly (thank the reporter; amplify).
    Send targeted heads-ups to reporters whose beat matches upcoming stories.
    Keep the reporter list current — beats shift; publications change.
```

## Instructions

### Phase 1 — Locate the hook or the relationship

Every pitch needs one of two grounding conditions:

- **A news hook** — a real event, milestone, study, or breaking news moment that gives
  the reporter a reason to care THIS WEEK. Includes newsjacking (see Phase 6).
- **An established reporter relationship** — a reporter whose beat you've been feeding
  relevant heads-ups on for months, whom you can pitch on an evergreen or slow-development
  story because they trust the pipeline.

Without either: don't pitch. Build the reporter list (Phase 2) and wait for a hook, or
develop the relationship first via non-transactional touches. Pitching cold to unresearched
reporters wastes their time and burns future relationships per Purpose failure mode 2.

### Phase 2 — Reporter research (single-source discipline)

For every reporter under consideration, gather:

- **Beat** — what topics they cover; what topics they DON'T cover (equally important).
- **Recent coverage** — last 3-5 pieces. Confirms current beat; surfaces angles they've
  already done (don't pitch a story that duplicates their recent piece).
- **Publication constraints** — what does the publication demand? Wire-only sources?
  Exclusive first? Data-heavy pieces? Timing constraints?
- **Preferred contact + response pattern** — email / DM / phone; response times
  (some reporters explicitly say "no follow-up after 3 days"); Muck Rack profile
  preferences.
- **Stated pitch preferences** — many reporters publicly document what they want and
  don't want. Check their site / social bio / Muck Rack.

Never send the same pitch to more than one reporter with different personalizations
tacked on. If two reporters actually cover the same beat similarly, offer one an
exclusive and the other a follow-up. Blast-pitching is the specific failure mode this
skill exists to prevent.

### Phase 3 — Pitch construction

Structure the pitch:

- **Subject line IS the pitch.** Cision + Scott discipline: if the reporter only reads
  the subject line (they will), it should say what you're offering + why it matters to
  their audience. Bad: "PR Pitch: Company X Launches Y." Good: "Fintech data: 40% of
  under-30s use 3+ neobanks — happy to share underlying dataset if useful for a piece."
- **Opening 2 sentences.** The news + why it matters to THIS reporter's audience.
  Reference the reporter's recent piece if you can genuinely say "this connects to X
  you covered last week."
- **Body: 3–5 sentences max + link.** State what's available (data, source, angle);
  offer specifics; link to full press-kit content (owned by herald's `press-kit` skill).
  No attachments unless requested (many reporters filter).
- **Close: one specific ask.** Call? Interview slot? Embargo until X? Exclusive?
  Multiple asks = zero response. One clear ask.

### Phase 4 — Delivery

- Send via the reporter's stated preferred channel (usually email; sometimes DM for
  product beats; rarely phone for anything except breaking news).
- Time-align to the reporter's actual rhythm — a US East Coast reporter reading at
  6am gets a different pitch cadence than a UK-based reporter reading at 3pm.
- Personalize the opening explicitly to a recent piece the reporter wrote. NEVER a
  form-letter opening.

### Phase 5 — Follow-up

- One follow-up after 3–5 business days if no response.
- Second follow-up ONLY if it adds material new information (a new development in the
  story, a new data point, a new source availability). "Just following up" is spam.
- After the second follow-up (or the reporter's stated preference limit): move on.
  Silence is a signal. Do not spam.

### Phase 6 — Newsjacking (Scott's core timing discipline)

Scott's specific contribution to modern PR. When breaking news creates a moment where
your perspective is relevant:

- **Speed matters more than polish.** You have hours, not days. Miss the window and
  the coverage opportunity closes.
- **Assess relevance first (don't force it).** Do we actually have a real POV on this
  breaking story? If not — don't newsjack. Forced newsjacks read as opportunistic and
  damage brand credibility.
- **Publish to owned channels IMMEDIATELY** — blog post + social with the POV. Reporters
  google the topic and land on your content organically; the pitch follows.
- **Pitch within HOURS.** Subject line references the breaking news + your specific POV
  ("On today's [X] news: we have data showing Y — happy to share if useful for a piece").
- **Follow up faster than usual** — the news cycle moves quickly; a 3-day follow-up
  window becomes a 24-hour window during a live news moment.

Scott's framework here is heavily tuned to B2B / content-marketing contexts. For
consumer-media / lifestyle / heavily-regulated industries, traditional embargo-and-exclusive
PR still dominates and newsjacking is riskier — name that limit per §Principles Bound below.

### Phase 7 — Relationship maintenance (ongoing)

- **Amplify coverage received.** Thank the reporter publicly (social); ensure your team
  shares the piece. This is the low-cost / high-signal maintenance move.
- **Send targeted heads-ups.** Reporters whose beat matches an upcoming story get a
  courtesy heads-up 1-2 weeks before public announcement. Non-transactional; no ask.
  Builds the trust that enables Phase 1's "established relationship" pathway.
- **Keep the reporter list current.** Beats shift; reporters move publications; some
  quit journalism. Audit the list quarterly.

## Output Format

Each invocation produces one or more of:

- **Pitch draft** — subject line + opening + body + close, ready to send to a specific
  named reporter.
- **Reporter research memo** — per candidate reporter: beat + recent coverage + contact
  + preferences + rationale for pitching.
- **Newsjacking POV brief** — quick assessment: is this breaking news relevant to us? do
  we have a real POV? recommended owned-content post + pitch template.
- **Follow-up plan** — 3-5 business day cadence with content of the follow-up (or a
  do-not-follow-up flag if the reporter's stated preference limits reach reached).
- **Campaign timeline** — for planned pitches (launch announcements, milestone stories):
  reporter research window + owned-content publish date + pitch date + follow-up dates +
  amplification plan.

## Principles

1. **Subject line IS the pitch.** If the reporter only reads the subject line — they
   will — the subject line must say what you're offering and why it matters to their
   audience. (Cision + Scott discipline.)
2. **Single-source, not blast.** Never send the same pitch to more than one reporter
   with cosmetic personalization. If two reporters could cover the same story, offer
   an exclusive to one and a follow-up angle to the other. Blast-pitching is the failure
   mode this skill exists to prevent. (Scott, throughout.)
3. **Reporter research is prerequisite.** Don't pitch reporters you haven't researched.
   Beat + recent coverage + preferences + publication constraints all confirmed BEFORE
   the pitch is drafted. (Muck Rack / Cision institutional discipline.)
4. **Speed matters for newsjacking; polish matters more otherwise.** Real-time PR is
   Scott's core framework contribution; hours-not-days for a live news moment. Non-
   newsjack pitches optimize for polish (right angle, right reporter, right time)
   over speed.
5. **Follow up ONCE, ADD information.** One follow-up 3-5 business days after; second
   follow-up only if it adds new material. "Just following up" is spam. Silence = move on.
6. **Amplify coverage received.** Non-transactional relationship maintenance. Public
   thanks + team amplification. Costs nothing; signals partnership; enables future
   pitches.
7. **Never fabricate or misrepresent.** Everything in a pitch traces to real facts,
   real sources, real data. Scott is emphatic on this — invented statistics or
   misrepresented context are the fastest way to burn a reporter relationship permanently
   AND damage brand credibility beyond one story. §0.5 applied at the pitch surface.
8. **Bound the "New Rules" honestly** (§0.6 flag + §6.2a "identities are not idols"
   applied at framework level). Scott's framework is heavily tuned to B2B tech / SaaS /
   content-marketing contexts. Consumer-media / lifestyle / heavily-regulated industries
   (finance, pharma, healthcare) still rely on traditional embargo-and-exclusive PR
   patterns where newsjacking is risky and press-release-and-pray still has a role.
   Name the context limit in the pitch strategy; don't apply Scott mechanically.
9. **§0.6 flag.** Scott 2020 framework is well-established but specific applications
   (subject-line-length; follow-up cadence 3-5 days; newsjacking-hours-window) are Tier
   B (framework-cited, not book-page-cited from `Agents/_books/`). Downgrade to Tier A
   when Scott 2020 is placed and a `Shared OS/logical/media_relations.md` Route-D asset
   is built per §8.9.

## Fallback

- **No news hook AND no established reporter relationship.** Do NOT pitch. Build the
  reporter list (Phase 2) and wait for a hook, or develop relationships via
  non-transactional touches. Cold pitches to unresearched reporters burn future
  opportunities.
- **Wrong-beat pitch.** Reporter's recent coverage clearly shows they don't cover this
  topic. Redirect — either find the right reporter at the same publication or find a
  different publication. Never "close enough" — reporters are pitched hundreds of times
  weekly; off-beat pitches build inbox filters against your address.
- **Embargo request from a reporter.** Route to `press-kit` (custom, herald) for the
  embargo framework; herald's `media-relations` handles the reporter conversation but
  the embargo terms + press-kit content are owned by press-kit.
- **Correction / retraction request needed after coverage.** Route to `crisis-comms`
  (custom, beacon — Comms & PR sibling) — correction requests are crisis-adjacent and
  need beacon's crisis-comms discipline (holding statement + sequencing) even for a
  small correction.
- **Reporter asks for content we don't have publicly available.** Route to `press-kit`
  for the underlying materials; do not fabricate materials in-conversation with the
  reporter per Principle 7 + §0.5.
- **Newsjacking-relevance is thin.** If the "do we actually have a POV" test in Phase 6
  fails — do NOT newsjack. Forced newsjacks read as opportunistic and damage brand
  credibility. Better to pass on the moment than force a fit.
- **Individual mental-health signal during outreach conversation.** STOP. Route per
  Universal Principle 3 (inherited from hire's precedent for all departments — need to
  confirm P&C→Comms&PR inheritance is fully in place; escalate to manager + HR Ops +
  EAP for the affected person).
- **Reporter asks for legally-sensitive information** (unreleased financials, unannounced
  M&A, personal info about employees). Decline; route to operator + employment counsel
  per Universal Principle 5. Never share unreleased material information via media
  channels.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `press-kit` (custom, herald — sibling) | Underlying press-kit content (boilerplate, founder bios, brand assets); embargo framework; official press-release drafts | Downstream — media-relations delivers the pitch; press-kit provides the underlying material |
| `media-training` (custom, herald — sibling) | Spokesperson prep before high-stakes interviews arranged via media-relations pitches | Downstream — when a pitch lands and yields an interview, spokesperson gets media-training brief |
| `pr-analytics` (custom, herald — sibling) | Coverage tracking / share-of-voice / sentiment after the fact | Downstream — closes the campaign loop |
| `crisis-comms` (custom, beacon — Comms & PR sibling) | Correction / retraction requests; crisis-adjacent media inquiries; hostile press moments | Escalation — media-relations passes to beacon for crisis-comms discipline |
| `investor-cadence` (custom, beacon — Comms & PR sibling) | Investor-facing story boundaries; material information rules; SEC-adjacent constraints | Coordination — herald pitches non-material stories only; material info routes to beacon + operator + counsel |
| `signal` (custom — Comms & PR sibling, Internal Comms) | Internal messaging that must precede or follow external coverage (team briefing before / after a press moment) | Coordination — same story surface, different audience |
| `echo` (Executive Office / Investor & external comms) | CEO-voice / strategic external comms; pitch materials + board prep (per boundary decision — beacon owns cadence + data-room, echo owns artifacts) | Cross-department — herald pitches media; echo owns the executive-voice content that goes IN the pitch |
| `spark / lena / weave / muse` (Brand Studio) | Brand voice consistency; copy craft; storytelling narrative | Cross-department — pitch must sound like the brand voice; herald doesn't invent brand voice, Brand Studio owns it |
| `rank` (Engineering — technical SEO) | Digital-PR link building coordination (media coverage that produces high-authority backlinks feeds SEO) | Cross-department — media wins have SEO value; herald focuses on coverage, rank focuses on SEO extraction |
| `veil` (Cybersecurity — data protection) | PII in journalist databases (Muck Rack accounts, contact lists); GDPR right-to-erasure requests from reporters | Escalation — reporter-data governance |
| `board` (Governance) | Material information disclosure timing (herald never pitches unreleased material info; goes through board approval first) | Escalation — anything material or governance-sensitive |
| Operator + employment / securities counsel | Legally-sensitive pitch content; SEC-adjacent constraints (material non-public info); libel / defamation exposure | Escalation — legal fence |
| `Shared OS: verification-before-completion` | Evidence gate on every pitch, reporter memo, newsjacking POV before it ships | Cross-cutting |

## References (public / verifiable)

- [David Meerman Scott — official site](https://www.davidmeermanscott.com/)
- [The New Rules of Marketing and PR — book page](https://www.newrulesofmarketingandpr.com/)
- [Scott's blog — Web Ink Now (framework + case studies)](https://www.webinknow.com/)
- [Cision — public best-practices materials on media outreach](https://www.cision.com/resources/)
- [Muck Rack — public best-practices materials on pitch craft](https://muckrack.com/blog)
- [Businesswire — 32 Media Relations Tips (public reference)](https://www.businesswire.com/blog/32-media-relations-tips-to-maximize-your-coverage-opportunities)
