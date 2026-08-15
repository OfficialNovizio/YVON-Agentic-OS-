<!--
Custom skill — built from catalog's `vyon-press-kit` entry, genericized per §0.4b.

Catalog source: vyon-press-kit — "Boilerplate, founder bios, brand assets, embargo
rules — the canonical external story." Protocol: (1) Draft from press-kit boilerplate
+ news hook; (2) Fact-check via vette; voice via lena; (3) CEO sign-off before any
external send.

Genericization strip (§0.4b):
- vyon- prefix stripped per §0.4a → press-kit
- "vette" (VYON fact-checking agent) → does NOT exist in YVON; route fact-checking to
  operator + Shared OS: verification-before-completion (universal verification gate).
  Note: a dedicated fact-check agent could be a future YVON build.
- "lena" (Brand Studio — Copy / storytelling / ideation) → KEPT as-is; real YVON agent
  per CLAUDE.md §2 routing table
- "CEO sign-off" → KEPT (CEO is a real role in every org; not VYON-specific)
- No other VYON refs

Route classification per §8.2: Route D (cited rubric + template library — no formula,
no script).
-->
---
name: press-kit
type: custom
status: built from catalog `vyon-press-kit`, genericized per §0.4b
sources_referenced:
  - "Catalog entry: vyon-press-kit (VYON_Skills_Catalog_Full_v2.html) — protocol structure. Provenance only; content genericized."
  - "Scott, David Meerman (2020, 8th ed). The New Rules of Marketing and PR. Wiley. Already cited in herald's media-relations; §8.9 extract-once-use-twice."
  - "Cision — press-release best practices; embargo protocol documentation."
  - "PRSA (Public Relations Society of America) — professional-standards materials on embargo ethics, press-kit content requirements."
  - "Businesswire / PR Newswire — public best-practices on press-release structure (inverted pyramid, 5 W's)."
fulfills_catalog_entry: vyon-press-kit
genericization_notes:
  - "vyon- prefix stripped per §0.4a."
  - "vette (VYON fact-check agent — doesn't exist in YVON) → operator + Shared OS: verification-before-completion. Future YVON build could add a dedicated fact-check agent."
  - "lena (Brand Studio) KEPT — real YVON agent per CLAUDE.md §2 routing."
  - "CEO sign-off gate KEPT — role-generic, not VYON-specific."
assigned_agent: herald (Comms & PR / Lead — PR & Media)
portable: true
date_added: 2026-07-31
tier: 3
description: The canonical external-story press-kit — boilerplate, founder / executive bios, brand assets, official press-release templates, and embargo protocol. Every external comm ships from THIS source of truth (single-source discipline). CEO sign-off required before external send. Trigger on "press release for", "press kit for", "draft the release", "embargo terms", "boilerplate for", "founder bio for", "brand assets for [publication]", or "prepare the kit".
triggers:
  - press release for
  - press kit for
  - draft the release
  - embargo terms
  - boilerplate for
  - founder bio for
  - brand assets for
  - prepare the kit
  - official statement for
---

# Press Kit

## Introduction

This skill owns the **canonical external story** for the org — the single source of
truth for boilerplate, executive bios, brand assets, official press releases, and
embargo protocol. Every external comm herald (or beacon / signal, when they need
external-facing content) ships from THIS material, not from ad-hoc drafts. Prevents
the classic drift where three versions of the company boilerplate exist in three
places and reporters get slightly-different framings.

Built from the catalog's `vyon-press-kit` entry, genericized per §0.4b. Retargets to
real YVON agents: `vette` (VYON fact-checking, doesn't exist) → operator + Shared OS
verification; `lena` (Brand Studio copy) → kept as-is (real YVON agent).

**Scope constraint:** press-kit owns the CANONICAL content + the EMBARGO FRAMEWORK.
It does NOT own reporter outreach (`media-relations`), spokesperson prep for interviews
(`media-training`), or crisis-response messaging (beacon's `crisis-comms`). It owns
the material those other skills consume.

## Purpose

Prevents four failure modes that show up when press content is ad-hoc:

1. **Boilerplate drift.** Three versions of "About [company]" exist in three places
   (website / last press release / this pitch); reporters get subtly-different framings
   and eventually flag the inconsistency. This skill maintains ONE canonical source.
2. **Embargo breaches.** Reporter A publishes at 6am; reporter B was told 8am; reporter
   C never got told there was an embargo. Damages relationships permanently. This skill
   owns the embargo protocol + explicit embargo agreements.
3. **Off-brand voice in press content.** Herald or a founder drafts a release in a voice
   that doesn't match how the brand actually speaks; Brand Studio finds out after the
   release ships. This skill routes voice-check to lena (Brand Studio) BEFORE CEO sign-off.
4. **Fact errors in released material.** Statistics slightly off; founder credentials
   misstated; product feature described in ways not-quite-true. Reporters cite the errors
   in coverage; corrections become crisis-comms events. This skill enforces
   verification-before-completion + operator fact-check BEFORE CEO sign-off.

herald uses this skill as the underlying-content layer that `media-relations` links to
when pitching reporters. Also cited by beacon's `crisis-comms` for holding-statement
templates and by signal's `internal-cadence` for internal-facing announcement text that
must be consistent with external-facing content.

## When to Use

Trigger on:

- "Press release for [product launch / milestone / study]"
- "Press kit for [publication / journalist / event]"
- "Draft the release" / "draft the official announcement"
- "Embargo terms for [story]" / "we're offering an exclusive to [reporter]"
- "Boilerplate for [use case]" / "update the company boilerplate"
- "Founder bio for [publication]" / "executive bio for [context]"
- "Brand assets for [reporter's article]" / "prepare the kit for [inbound request]"
- "Official statement for [inquiry]"

Do NOT use for:

- **Reporter outreach / pitching** → `media-relations` (custom, herald — sibling). This
  skill provides the content; media-relations delivers it to reporters.
- **Spokesperson interview prep** → `media-training` (custom, herald — sibling).
- **Crisis-response messaging** → `crisis-comms` (custom, beacon — Comms & PR sibling).
  Press-kit can provide crisis-adjacent holding-statement TEMPLATES; the specific
  crisis messaging is beacon's scope.
- **Internal messaging** → `signal` (custom, sibling). Press-kit content may need
  internal-facing versions (announced to team first, then external); the internal
  drafting is signal's scope.
- **Investor-communication artifacts** → `echo` (Executive Office) per beacon-echo
  boundary decision — echo owns pitch materials + board prep; press-kit hands off
  material info to echo, doesn't draft it.
- **Brand voice determination** → `lena` (Brand Studio) or the broader Brand Studio
  team (spark / lena / weave / muse). Press-kit CONSUMES brand voice; it does not
  define it.

## Structure / Protocol

The press-kit workflow:

```
1. CANONICAL LIBRARY (maintained continuously)
    a. Boilerplate — "About [org]" in 3 lengths (50-word / 100-word / 200-word)
    b. Executive bios — per executive, per publication-type (long / short / social)
    c. Brand assets — logos, photos, video, product screenshots (Brand Studio-owned;
       inventoried here for reference)
    d. Press-release archive — every prior release for reference / linking
    e. Fact sheet — company facts (founding date, funding, employee count, product
       description) with dates-checked-last stamp
    f. Common Q&A — anticipated reporter questions with approved answers
    g. Media coverage archive — third-party validation for future pitches

2. RELEASE / KIT REQUEST INTAKE
    Request from media-relations (pitching a story), from a reporter directly
    (inbound), from beacon (crisis-comms holding-statement), or from signal
    (external-facing internal announcement).

3. DRAFT (from canonical library + news-specific content)
    a. Structure: inverted pyramid (5 W's in the lead paragraph).
    b. Pull boilerplate + relevant executive bio + relevant brand assets.
    c. Draft the news-specific content (2-3 quotes; product description; data).
    d. NO fabrication (Universal Principle 1 inherited from hire).

4. FACT-CHECK
    Route to operator + Shared OS: verification-before-completion for every fact,
    number, credential, and product claim in the draft. Do NOT proceed without
    fact-check completion.

5. VOICE-CHECK (Brand Studio)
    Route to lena (Brand Studio — Copy / storytelling / ideation) for brand-voice
    consistency check. Off-brand voice returns for revision.

6. CEO SIGN-OFF (mandatory)
    No external send without CEO (or delegated authority — CFO for financial-material
    releases; CTO for technical releases; COO for ops releases) explicit approval.
    Sign-off is on the ACTUAL FINAL VERSION, not an earlier draft.

7. EMBARGO FRAMEWORK (when applicable)
    Explicit embargo agreement with each reporter given advance access:
      - Embargo date + time (with time zone) EXPLICIT
      - Signed acknowledgment (email confirmation counts) from each reporter
      - Enforcement plan for breaches (typically: future exclusion + public statement)
    Do NOT distribute embargo content without acknowledged terms.

8. DELIVER
    Via media-relations to reporters (following media-relations Phase 5-6 delivery
    discipline). Simultaneously to owned channels (blog / newsroom page) at embargo
    lift time.

9. POST-RELEASE ARCHIVE
    Save the released version + the reporter list + embargo terms + coverage
    resulting from it into the press-release archive (§1.d) for future reference.
```

## Instructions

### Phase 1 — Maintain the canonical library (ongoing background work)

The library is a living document. herald maintains it:

- **Boilerplate freshness.** Company boilerplate updated whenever material company facts
  change (funding rounds, employee count crossing meaningful thresholds, new markets,
  new product lines). Every release starts by confirming the current boilerplate is
  accurate.
- **Executive bios updated quarterly.** New accomplishments, promotions, publications.
  3 lengths per exec (long for feature-piece bio inclusion; short for quote attribution;
  social for reporter reference).
- **Brand asset inventory.** Assets themselves live in Brand Studio's ownership; press-kit
  maintains the INVENTORY (what's available, who authors, where it lives, current
  version). When a reporter requests an asset, press-kit routes to the right Brand
  Studio location.
- **Fact sheet dates-checked-last stamp.** Every fact on the sheet carries the date it
  was last verified. Facts older than 90 days get re-verified before use in a fresh
  release.
- **Common Q&A refreshed after major news moments.** Reporter questions in the field
  during a launch or crisis become new Q&A entries for future preparation.

### Phase 2 — Release / kit request intake

Requests come from four sources:

- **media-relations (sibling)** — pitching a planned story, needs the release + kit
  package to link reporters to.
- **Direct reporter inbound** — reporter reached out; needs the current kit content.
- **beacon's crisis-comms** — needs holding-statement TEMPLATE (press-kit provides
  templates; beacon's crisis-comms fills in crisis-specific content).
- **signal's internal-cadence** — internal announcement needs consistent external-facing
  version.

Confirm scope: what's the news? Which reporters / audiences? What timing? Any embargo?

### Phase 3 — Draft using inverted pyramid

Press-release standard structure (Cision / PR Newswire / Businesswire discipline):

- **Headline** — the news in ≤10 words; SEO-conscious phrasing (may be pitched or
  informational-neutral depending on context).
- **Dateline** — CITY, State, DATE.
- **Lead paragraph** — the 5 W's (Who / What / When / Where / Why) in ≤3 sentences. If
  a reporter reads only the lead, they have the full news.
- **Body** — 2-3 paragraphs of supporting detail. Quotes from executives (typically 2
  — one strategic, one operational). Data points supporting the news.
- **Boilerplate** — "About [org]" from canonical library.
- **Media contact** — herald's inbound contact (name + email + phone).

NO fabrication per Universal Principle 1. Statistics traceable to actual source; quotes
authored by (or approved by) the attributed executive; product descriptions verifiable
against the actual product.

### Phase 4 — Fact-check via operator + verification-before-completion

Route the draft to operator (or a designated fact-check role) AND through Shared OS:
verification-before-completion. Every:

- **Number** — traceable to actual data source
- **Date** — verified (founding date; product-launch date; funding round close)
- **Credential** — executive-bio credentials confirmed against LinkedIn / previous
  employer / actual accomplishments
- **Product claim** — verifiable against the actual product (or clearly labeled as
  forward-looking / aspirational)
- **Quote attribution** — approved by the attributed person

Do NOT proceed to CEO sign-off with unverified facts. This is where the source-plugin's
`vette` agent lived; YVON routes to operator + verification-before-completion until a
dedicated fact-check agent is built.

### Phase 5 — Voice-check via lena (Brand Studio)

Route to lena (Brand Studio / Copy / storytelling / ideation) for brand-voice
consistency check. Common voice-check failures:

- Corporate-jargon that doesn't match the brand's plain-English standard
- Tone mismatch (release feels enterprise-y when brand voice is playful, or vice versa)
- Executive quote that sounds unlike the executive's actual public voice

Off-brand voice returns to Phase 3 for revision. Cross-department escalation to spark
(Brand Studio creative direction) if voice-check surfaces a broader strategic voice
question.

### Phase 6 — CEO sign-off (mandatory)

No external send without CEO explicit approval on the ACTUAL FINAL VERSION. Delegation
rules:

- **CFO** approves financial-material releases (funding, layoffs, restructures, financial
  restatements)
- **CTO** approves technical-material releases (product launches with major architecture
  claims, security disclosures)
- **COO** approves operational releases (major partnership announcements, capacity
  changes)
- **Board / legal counsel** approves material-non-public-info releases (M&A,
  regulatory-adjacent) — Universal Principle 5 legal fence

**Sign-off is on the actual final version.** An earlier-draft sign-off does not carry
to a materially-revised version. If the release changes after sign-off, re-approval
required.

### Phase 7 — Embargo framework (when applicable)

When offering advance access to specific reporters:

- **Explicit embargo agreement** — date + time (with time zone) stated in the outreach
  email.
- **Acknowledged terms** — reporter confirms in writing (email reply). No acknowledgment,
  no embargo content sent. Reporter "silence is agreement" is NOT sufficient.
- **Enforcement plan for breaches** — future exclusion from advance access; public
  statement if the breach damaged the release; escalation to publication editor if
  systemic.
- **Never partial embargo** — embargo on the FULL story, not "you can mention X but not
  Y." Partial embargoes are broken accidentally and burn relationships.
- **Simultaneous release** at embargo lift time — release goes to owned channels (blog /
  newsroom) at the exact embargo lift moment; reporters publish at the same time; nobody
  scoops.

### Phase 8 — Deliver + amplify

Deliver via `media-relations` to reporters (following that skill's Phase 5-6 delivery
discipline). Simultaneously to owned channels. Amplify via team social + coverage-received
public thanks per `media-relations` Principle 6.

### Phase 9 — Archive

Save released version + reporter list + embargo terms + coverage received to the
canonical library's press-release archive (§1.d Structure / Protocol). Referenceable
in future releases (never contradict what was said in a prior release without
addressing the contradiction).

## Output Format

Each invocation produces one or more of:

- **Boilerplate library entry** — 50/100/200-word versions of "About [org]"; date-stamped.
- **Executive bio entry** — long/short/social versions per exec; date-stamped; source-checked.
- **Press release draft** — inverted pyramid structure; awaiting fact-check + voice-check + CEO sign-off.
- **Embargo agreement template** — for use in media-relations reporter outreach; explicit
  date + time + acknowledgment protocol.
- **Q&A brief** — anticipated reporter questions with approved answers for a specific news moment.
- **Fact sheet** — company facts with dates-checked-last stamps.
- **Brand asset inventory** — what's available, where it lives, current version, Brand
  Studio owner.
- **Post-release archive entry** — released version + reporter list + coverage received.

## Principles

1. **Single source of truth.** Every external comm ships from the canonical library, not
   from ad-hoc drafts. Boilerplate drift is the specific failure mode this skill exists
   to prevent.
2. **No fabrication.** Universal Principle 1 inherited from hire. Every number,
   credential, date, product claim traceable. No invented statistics; no aspirational
   claims presented as facts; no quotes not-actually-approved. §0.5 applied at the
   press-content surface.
3. **Fact-check BEFORE sign-off.** Sequence is DRAFT → FACT-CHECK → VOICE-CHECK →
   CEO SIGN-OFF → DELIVER. Skipping fact-check to hit a timing deadline creates
   corrections that become crisis-comms events (route to beacon).
4. **CEO sign-off is on the ACTUAL FINAL VERSION.** An earlier-draft sign-off does not
   carry to a materially-revised version. If content changes after sign-off, re-approval
   required.
5. **Voice-check by Brand Studio.** herald doesn't invent brand voice; lena
   (Brand Studio) does. Off-brand voice returns for revision. Cross-department
   escalation to spark for broader strategic voice questions.
6. **Explicit embargo agreements, always.** Date + time + time zone STATED; written
   acknowledgment from each reporter REQUIRED; enforcement plan CLEAR. Ambiguous
   embargoes get broken and burn relationships permanently.
7. **Never partial embargo.** Full-story embargo or no embargo. Partial ("you can
   mention X but not Y") gets accidentally broken.
8. **Material non-public information routes to legal + board.** Universal Principle 5
   legal fence. Herald never releases material NPI via a press release without securities
   counsel + board approval.
9. **Archive everything.** Released versions + reporter lists + embargo terms + coverage
   received into the canonical library. Future releases reference past releases to
   maintain consistency; contradictions surfaced and addressed before shipping.
10. **§0.6 flag.** Press-release structural discipline (inverted pyramid, 5 W's, 3-length
    boilerplate) is Tier B (canonical PR-industry practice per Cision / PR Newswire /
    Businesswire / PRSA institutional sources). Downgrade to Tier A when a PR industry
    textbook (e.g., Bivins *Public Relations Writing*; or a PRSA-approved reference) is
    placed and a `Shared OS/logical/press_kit.md` Route-D asset is built per §8.9.

## Fallback

- **CEO unavailable for sign-off + release timing pressure.** Route to delegated
  authority (CFO/CTO/COO per material type). If NO delegated authority available, HOLD
  the release. Per Principle 4 — a release without sign-off is a §0.5 violation dressed
  up as urgency.
- **Fact-check surfaces a material error.** Fix the error in Phase 3; re-run fact-check;
  re-run voice-check; re-run CEO sign-off. Do NOT ship with a fact you know is wrong.
- **Voice-check returns off-brand.** Return to Phase 3 for revision. Escalate to spark
  (Brand Studio) if the voice question is systemic (release fits fine as prose but the
  positioning is off-brand).
- **Embargo breach by a reporter.** Route to `crisis-comms` (custom, beacon — Comms & PR
  sibling) for the response; enforce future exclusion per Principle 6; escalate to
  publication editor if pattern.
- **Reporter requests unreleased material info** (unannounced financials, M&A rumors,
  personal info about employees). Decline; route to operator + securities counsel per
  Universal Principle 5. Never share material non-public info via press-kit content.
- **Request to include a fabricated / unverifiable statistic** ("just make up something
  plausible for effect"). Refuse per Principle 2 + §0.5. Either find a real source or
  drop the claim.
- **Individual mental-health signal during content preparation** (a founder / exec bio
  or quote content surfaces personal distress). STOP. Route per Universal Principle 3
  (inherited) to manager + HR Ops + EAP; do NOT publish content that references the
  person's condition without their explicit consent + legal counsel involvement.
- **Prior release contradicts current release without acknowledgment.** Address the
  contradiction explicitly (why the position changed; what's different now). Silent
  contradictions get caught by reporters and become credibility issues.
- **Multiple reporters given DIFFERENT embargo times accidentally.** Immediately notify
  all affected reporters of the earliest embargo time; lift the embargo early if the
  spread is more than a few hours; treat as a near-breach for internal process review.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `media-relations` (custom, herald — sibling) | Pitches USE press-kit content; links reporters to the underlying material | Upstream — media-relations consumes press-kit output |
| `media-training` (custom, herald — sibling) | Spokesperson prep uses press-kit Q&A + fact sheet + boilerplate as prep material | Upstream |
| `pr-analytics` (custom, herald — sibling) | Post-release coverage tracked here informs press-kit's coverage archive | Bidirectional — pr-analytics measures; press-kit archives |
| `crisis-comms` (custom, beacon — Comms & PR sibling) | Holding-statement TEMPLATES + crisis-adjacent fact sheet | Downstream — press-kit provides templates; beacon fills in crisis specifics |
| `investor-cadence` + `data-room-discipline` (custom, beacon — sibling) | Investor-facing content that must be consistent with external-facing press content; material-info boundary | Coordination — beacon's investor content and herald's press content must not contradict |
| `signal` (custom — Comms & PR sibling, Internal Comms) | Internal announcement of external news must be consistent with press-kit release content | Coordination — same content surface, different audience; internal often precedes external by hours |
| `echo` (Executive Office / Investor & external comms) | Executive-voice content that goes IN press-kit executive quotes; board-prep-adjacent artifacts | Cross-department — press-kit hosts the material; echo authors the executive voice |
| `lena` + `weave` + `muse` (Brand Studio / Copy) | Brand voice consistency check (Phase 5) — MANDATORY before CEO sign-off | Cross-department — press-kit CONSUMES brand voice from lena |
| `spark` (Brand Studio / Creative direction) | Broader strategic voice questions escalated from lena's voice-check | Cross-department escalation |
| `pixel` (Brand Studio / Visual design) | Brand asset content lives with pixel; press-kit hosts INVENTORY + routing | Cross-department — assets in pixel; access in press-kit |
| `board` (Governance) | Material non-public info release approval; strategic-message approval for major releases | Escalation |
| Operator + securities / employment counsel | Legally-sensitive release content (M&A, restatements, protected-class references) | Escalation — Universal Principle 5 legal fence |
| CEO / CFO / CTO / COO | Sign-off gate on final version | Escalation — mandatory before external send |
| `Shared OS: verification-before-completion` | Fact-check gate on every draft (Phase 4); operator plays the vette role | Cross-cutting |

## References (public / verifiable)

- [Cision — Press release best practices](https://www.cision.com/resources/)
- [PR Newswire — Anatomy of a press release](https://www.prnewswire.com/knowledge-center/)
- [Businesswire — Press release structure guide](https://www.businesswire.com/portal/site/home/)
- [PRSA (Public Relations Society of America) — professional standards](https://www.prsa.org/)
- [Bivins, Thomas H. — Public Relations Writing (Wiley, multiple editions) — book reference for future book-grounding](https://www.wiley.com/)
