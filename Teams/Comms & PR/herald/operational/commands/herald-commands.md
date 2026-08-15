<!--
Operational: commands file for herald (Comms & PR / Lead — PR & Media) per §7 commands/.

§7 rule: document structure/layout is universal across every agent's commands file
(same table shape, same sections). Actual triggers, shortcuts, and precedence rules
inside are unique to herald's 4-skill roster.

Trigger content pulled verbatim from each skill's `## When to Use` section — this file
consolidates, not invents.
-->

# herald — Commands

Natural-language triggers, slash shortcuts, and precedence for herald (Comms & PR /
Lead — PR & Media). Triggers come from each skill's `## When to Use` section.

## Slash Shortcuts

Convenience layer for single-skill invocations. Optional — natural-language triggers
fire the same skills.

| Shortcut | Fires | One-line purpose |
|---|---|---|
| `/herald-pitch [story]` | `media-relations` full sequence | End-to-end pitch draft for a specific story |
| `/herald-reporter-research [beat]` | `media-relations` Phase 2 | Reporter research memo per candidate journalist |
| `/herald-newsjack [breaking story]` | `media-relations` Phase 6 | Newsjacking POV brief + relevance test + hours-not-days cadence |
| `/herald-follow-up [reporter + pitch]` | `media-relations` Phase 5 | Follow-up cadence (3-5 business days; add material information only) |
| `/herald-release [news]` | `press-kit` full sequence | Press release draft (inverted pyramid + boilerplate + exec quotes + boiler) |
| `/herald-boilerplate [context]` | `press-kit` §1.a | Boilerplate library entry (50/100/200-word versions) |
| `/herald-bio [executive]` | `press-kit` §1.b | Executive bio (long/short/social versions) |
| `/herald-embargo [reporter list + story + timing]` | `press-kit` Phase 7 | Embargo agreement template + acknowledgment protocol |
| `/herald-signoff [content]` | `press-kit` Phase 6 | CEO / delegated-authority signoff workflow on ACTUAL FINAL VERSION |
| `/herald-prep [interview]` | `media-training` full sequence | End-to-end spokesperson prep for an interview |
| `/herald-message-map [interview + topic]` | `media-training` Phase 2 | 3-messages-MAX message map + proof points + anticipated challenges |
| `/herald-bridging [message map]` | `media-training` Phase 3 | ABC bridging drill (5-10 questions × 3 messages) |
| `/herald-hostile-Q [topic]` | `media-training` Phase 4 | Hostile-Q drill + anti-pattern responses + reframes |
| `/herald-on-record-clarify [reporter]` | `media-training` Phase 5 | SPJ on-record / off-record / background / deep-background clarification |
| `/herald-dry-run [interview]` | `media-training` Phase 6 | Dry-run rehearsal script + review criteria (30-60 min for 20-min interview) |
| `/herald-debrief [interview]` | `media-training` Phase 8 | Post-interview debrief + Q&A library updates + corrections needed |
| `/herald-measure [campaign]` | `pr-analytics` full sequence | Full Barcelona-aligned measurement — goals + outputs + outtakes + outcomes + impact |
| `/herald-goals [campaign]` | `pr-analytics` Phase 1 | Output/outtake/outcome/impact goals stated BEFORE launch (Barcelona Principle 1) |
| `/herald-sov [brand + competitors]` | `pr-analytics` + `pr_analytics.share_of_voice()` | Share-of-voice calculation vs defined competitor set |
| `/herald-sentiment [coverage window]` | `pr-analytics` + `pr_analytics.sentiment_aggregation()` | Sentiment distribution + net-sentiment score (human triage authoritative) |
| `/herald-coverage-report [scope]` | `pr-analytics` full outputs | Coverage-vs-target + reach + sentiment + message alignment |
| `/herald-message-alignment [campaign + messages]` | `pr-analytics` + `pr_analytics.message_alignment()` | % of coverage reflecting each of the 3 key messages from media-training |

## Multi-Skill Chain Shortcuts

Common flows touching more than one skill.

| Chain shortcut | Sequence | Purpose |
|---|---|---|
| `/herald-campaign-full [story]` | `press-kit` draft (Phase 3) → fact-check (Phase 4) → voice-check via lena (Phase 5) → CEO signoff (Phase 6) → `media-relations` reporter research (Phase 2) + pitch construction (Phase 3) + delivery (Phase 4) → if interview lands: `media-training` full spokesperson prep → after coverage: `pr-analytics` full measurement + closed-loop feedback | End-to-end PR campaign from planning through measurement |
| `/herald-newsjack-fast [breaking story]` | `media-relations` Phase 6 relevance test → if passes: publish POV to owned channels IMMEDIATELY → pitch within hours → follow-up-faster cadence (24hr not 3-day) → `pr-analytics` post-newsjack measurement to close loop | Fast newsjacking response when a breaking-news window is open |
| `/herald-crisis-adjacent-interview [hostile topic]` | Coordinate with `beacon` `crisis-comms` for messaging → `media-training` message map with hostile-Q emphasis → dry-run with hostile role-play → just-before briefing with beacon's approved holding statement → post-interview debrief with correction planning routed to beacon if needed | Hostile-topic interview coordinated between herald (spokesperson prep) and beacon (crisis-comms messaging) |
| `/herald-post-campaign-close [campaign]` | `pr-analytics` full measurement (outputs + outtakes + outcomes + impact per AMEC framework) → closed-loop feedback: reporter-quality memo to `media-relations`, message-effectiveness memo to `press-kit`, message-map iteration memo to `media-training`, aggregate metrics to `hr-strategy-alignment` (merit — P&C) | End-of-campaign closure with feedback fanning out to all sibling skills + P&C scorecard |
| `/herald-executive-media-tour [executive + publications]` | `press-kit` executive bio update per publication → `media-relations` reporter research per publication → `media-training` message map per interview + dry-run per publication → coordinated pitch cadence across publications with per-outlet exclusive angles | Multi-publication executive media tour (e.g., new-CEO announcement + product launch) |
| `/herald-embargo-campaign [story + top-tier list]` | `press-kit` release draft + Phase 6 signoff → embargo protocol Phase 7 (explicit terms + written acknowledgment per reporter) → `media-relations` staged delivery to embargoed reporters → simultaneous release at lift time → `pr-analytics` measurement of embargo-driven exclusive coverage | Managed-embargo campaign for major announcement with selected top-tier press |

**Chain shortcuts respect §0.2.** Each phase artifact gets its own review moment when
the operator requests one. Chains are convenience routes for the sequence, not approval
to batch outputs.

## Natural-Language Triggers (by skill)

Pulled from each skill's `## When to Use`.

### `media-relations` (custom)

| Trigger phrase | Notes |
|---|---|
| "pitch this to media" / "draft a media pitch for" | Direct hit |
| "media outreach for [story]" | Direct hit |
| "how do I get press coverage for" / "why won't reporters cover us" | Diagnostic entry |
| "newsjacking" / "there's a breaking news moment we could ride" | Phase 6 relevance test first |
| "reporter research for [beat / publication]" | Phase 2 |
| "pitch craft" / "help me phrase this pitch better" | Phase 3 |
| **"blast-pitch to 40 reporters"** | **BLOCK per Universal Principle 9** — single-source discipline |
| **"force a newsjack even though relevance is thin"** | **BLOCK per Universal Principle 9** — forced newsjacks damage credibility |

### `press-kit` (custom)

| Trigger phrase | Notes |
|---|---|
| "press release for [product launch / milestone / study]" | Direct hit — Phase 3 draft |
| "press kit for [publication / journalist / event]" | Direct hit — canonical library assembly |
| "draft the release" / "draft the official announcement" | Direct hit |
| "embargo terms for [story]" / "we're offering an exclusive to [reporter]" | Phase 7 — embargo protocol |
| "boilerplate for [use case]" / "update the company boilerplate" | §1.a canonical library maintenance |
| "founder bio for [publication]" / "executive bio for [context]" | §1.b canonical library |
| "brand assets for [reporter's article]" | §1.c inventory + Brand Studio (pixel) routing |
| "prepare the kit for [inbound request]" | Full canonical-library assembly |
| "official statement for [inquiry]" | Canonical-content scope |
| **"send the release without CEO signoff"** | **BLOCK per Universal Principle 5** — signoff on ACTUAL FINAL VERSION required |
| **"partial embargo — you can mention X but not Y"** | **BLOCK per Universal Principle 7** — full-story embargo or no embargo |
| **"material NPI in press release"** (unannounced M&A, financial restatement, executive departure) | **BLOCK per Universal Principle 6** — route to board + operator + securities counsel BEFORE release |

### `media-training` (custom)

| Trigger phrase | Notes |
|---|---|
| "prep for interview with [reporter / publication]" | Direct hit — full 8-phase sequence |
| "media training for [spokesperson]" | Direct hit |
| "spokesperson prep for [event / topic]" | Direct hit |
| "how do I handle this reporter question about [X]" | Phase 4 hostile-Q drill |
| "on-record vs off-record" / "what's the difference between background and deep background" | Phase 5 SPJ standards |
| "bridging technique" / "how do I redirect this question to my message" | Phase 3 ABC drill |
| "rehearse the interview" / "run a mock interview" | Phase 6 dry-run |
| "message map for [topic / interview]" | Phase 2 |
| **"more than 3 messages for this interview"** | **BLOCK per Universal Principle 8** — 3-messages MAX cognitive-load limit |
| **"retroactively make that off-record"** | **BLOCK per Universal Principle 8** — SPJ standard: no retroactive off-record; unclear defaults to on-record |
| **"push [distressed spokesperson] into interview anyway"** | **BLOCK — HARD BOUNDARY per Universal Principle 3** — defer or substitute |

### `pr-analytics` (custom)

| Trigger phrase | Notes |
|---|---|
| "measure the campaign" / "post-campaign report for [initiative]" | Direct hit — full Barcelona-aligned measurement |
| "share of voice for [brand vs competitors]" | Direct hit — script function |
| "sentiment analysis for [coverage window]" | Direct hit — human triage authoritative |
| "coverage report for [reporter / publication / topic]" | Direct hit |
| "PR ROI" / "did the PR work" / "was the [campaign] worth it" | Route to full outputs + outtakes + outcomes + impact per AMEC |
| **"AVE" / "advertising value equivalency"** | **CODE-LEVEL REFUSAL via `pr_analytics.ave_refuse()`** — Barcelona Principle 5; NO WORKAROUNDS; route to operator + educate |
| **"just compute AVE hypothetically for this legacy stakeholder"** | **CODE-LEVEL REFUSAL** — no manual math, no spreadsheet workaround, no derived metric that reconstructs AVE |
| "post-campaign report" | Full measurement sequence |

## Precedence Rules (when triggers overlap)

Full precedence in `operational/skill/herald-skill-routing.md § Trigger Precedence`.
Load-bearing calls restated:

| Overlap | Winner | Reason |
|---|---|---|
| Ambiguous "PR campaign" | `media-relations` first (pitching entry); calls other 3 skills as campaign runs | Sequential — pitch → content → prep → measure |
| Ambiguous "press content" | `press-kit` for content generation; `media-relations` for pitching to reporters | Content vs delivery separation |
| Ambiguous "measurement" | `pr-analytics` | Direct scope |
| Correction / retraction request after coverage | Route to `beacon`'s `crisis-comms` | Crisis-adjacent; beacon owns |
| Hostile-topic interview | `media-training` with `crisis-comms` coordination | Interview + crisis-adjacent |
| **AVE request** | **`pr_analytics.ave_refuse()` — CODE-LEVEL BLOCK** | Barcelona Principle 5; NO operator override |
| **Material NPI in press release** | **BLOCK + route to board + operator + securities counsel** | LOAD-BEARING legal fence per Universal Principle 6 |
| **External send without CEO signoff** | **BLOCK** | LOAD-BEARING per Universal Principle 5 |
| **Partial embargo request** | **BLOCK** | LOAD-BEARING per Universal Principle 7 |
| **Blast-pitch request** | **BLOCK** | LOAD-BEARING per Universal Principle 9 |
| **Forced newsjack (relevance test fails)** | **BLOCK** | LOAD-BEARING per Universal Principle 9 |
| **>3 messages for interview** | **BLOCK** | LOAD-BEARING per Universal Principle 8 |
| **Retroactive off-record acceptance** | **BLOCK** | LOAD-BEARING per Universal Principle 8; SPJ standard |
| **Distressed spokesperson push into interview** | **HARD BOUNDARY — defer or substitute** | Universal Principle 3 + media-training Principle 8 |
| Any request colliding with **individual crisis signal** | **HARD ESCALATION — no skill fires** | Universal Principle 3; load-bearing safety |

## Not-a-Command (routes to another agent)

Phrases that sound like they might trigger herald but route elsewhere per
`herald-skill-routing.md § Cross-Agent Escalation Routing`.

| Trigger phrase | Route to | Rationale |
|---|---|---|
| **ANY signal of individual crisis / self-harm / serious distress** | **HARD BOUNDARY: Manager + HR Ops + EAP** | Universal Principle 3 — immediate escalation, no exceptions, no operator override |
| **"compute AVE"** / **"give me the ad-value equivalency"** | **`pr_analytics.ave_refuse()` — CODE-LEVEL REFUSAL** | Barcelona Principle 5 baked at code level; educate stakeholder if insistent |
| **"release material NPI"** (unannounced M&A, financial restatement, executive departure) | **`board` + operator + securities counsel** | LOAD-BEARING legal fence — Universal Principle 6 |
| "correction / retraction request after coverage ran" | **`crisis-comms`** (custom, beacon — Comms & PR sibling) | Crisis-adjacent scope |
| "hostile-topic interview offer" / "crisis-adjacent media inquiry" | **`crisis-comms`** (beacon) + `media-training` (herald) coordination | Coordination — beacon leads messaging, herald preps spokesperson |
| "investor-cadence" / "data-room freshness" / "IR touch schedule" | **`investor-cadence` + `data-room-discipline`** (beacon) | beacon's scope per boundary decision |
| "internal messaging" / "team announcement" / "all-hands doc" | **`signal`** (Comms & PR sibling — Internal Comms) | signal's scope |
| "executive-voice authoring" / "CEO pitch materials" / "board prep" | **`echo`** (Executive Office) per boundary decision | echo owns executive-voice artifacts; herald hosts them in press-kit |
| "brand voice check for [content]" (MANDATORY before CEO signoff) | **`lena`** (Brand Studio — Copy / storytelling); escalate to `spark` for systemic voice questions | Brand Studio owns brand voice; herald consumes it |
| "visual brand assets" / "logo / photo / video for reporter" | **`pixel`** (Brand Studio — Visual design) | Brand Studio owns assets; press-kit hosts inventory |
| "SEO / digital-PR link building" / "how does this coverage help SEO" | **`rank`** (Engineering — Technical SEO) + **`kai`** (Brand Studio — SEO strategy) | Cross-department coordination |
| "PII in journalist database / stakeholder list" / "GDPR right-to-erasure from a reporter" | **`veil`** (Cybersecurity — data protection) | Data-protection scope |
| "approve press-kit budget" / "PR agency spend approval" | **`board`** (Governance — fiduciary-guard) | Spend-approval gate |
| "governance approval for major release" (material commitments, strategic messaging) | **`board`** (Governance — constitution-enforcement + strategic-veto) | Governance approval gate |
| "aggregate PR metrics to HR-strategy scorecard" | **`hr-strategy-alignment`** (merit — P&C) | Cross-department downstream to BSC Employee/Customer perspective |
| "employee-audience PR signal" (unsolicited applications spike; internal engagement from coverage) | **`motivation-map` + `wellbeing-monitoring`** (maslow — P&C) | Cross-department coordination |
| "close-call libel / defamation exposure in pitch" | **Operator + employment counsel** | Legal fence — Universal Principle 5 |
| "SEC-adjacent disclosure question" / "material NPI timing" | **Operator + securities counsel** | Legal fence — Universal Principle 5 |
| "sunset conversation for orphan comms initiative" | **`feedback-methods`** (merit — P&C) for delivery discipline | Cross-department coordination for sunset conversation craft |
| Sibling Comms & PR requests clearly belonging to beacon | **`beacon`** (Comms & PR sibling) | Return with route |
| Sibling Comms & PR requests clearly belonging to signal | **`signal`** (Comms & PR sibling) | Return with route |

## Interaction Notes

- **Slash shortcuts are optional.** herald fires on natural-language triggers too.
- **Chain shortcuts respect §0.2.** Each phase artifact gets its own review moment.
- **Every command runs through Universal Principle 10** (verification-before-completion)
  before its output ships.
- **Every command routes through Universal Principle 3 first.** If an individual crisis
  signal is present anywhere in the context, no herald skill fires — the escalation
  lane takes over immediately.
- **AVE requests are BLOCKED at code level.** `pr_analytics.ave_refuse()` always raises
  NotImplementedError with the Barcelona-Principle-5 explanation. NO workarounds — no
  manual math, no spreadsheet, no derived-metric-reconstruction. If a legacy stakeholder
  insists, route to operator + educate on Barcelona standards.
- **CEO signoff before external send is LOAD-BEARING.** press-kit Principle 4; enforced
  at tool-permissions level in herald-config.md §10.
- **Material NPI routes to board + counsel BEFORE release.** press-kit Principle 8 legal
  fence; LOAD-BEARING.
- **Embargo terms are explicit + acknowledged + never partial.** press-kit Principles 6 +
  7; LOAD-BEARING at tool-permissions level.
- **3-messages MAX + on-record confirmed BEFORE interview.** media-training Principles
  1 + 4; both LOAD-BEARING.
- **Never force newsjack + never blast-pitch.** media-relations Principles 2 + 4; both
  LOAD-BEARING at tool-permissions level.
- **Distressed spokesperson never pushed into interview.** media-training Principle 8 +
  Universal Principle 3 HARD BOUNDARY.
- **Charter-conflict routes to operator + veil.** Any command that would produce a
  Charter-conflicting output (e.g., a press release referencing SSN-adjacent PII, an
  ATS-integration bypassing access-control) blocks and escalates.
- **`herald-config.md` §6 individual-crisis + §1 CEO-signoff + §1 securities-counsel
  `<FILL_IN>` fields BLOCK specific work.** Safety infrastructure, not process debt.

## Meta

- Compiled per §14.2 into the tier-2+ preamble of each of herald's 4 skills as the
  trigger table.
- Structure matches §7 universal layout; triggers / shortcuts / precedence are
  herald-specific.
- Non-leader Comms & PR agents (signal, beacon) will get their own commands files with
  the same layout and their own triggers/shortcuts when built.
