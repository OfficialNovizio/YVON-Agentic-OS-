<!--
Custom skill — built from scratch, synthesized from named published sources
(Buffett letters + Larcker & Tayan 2020 + NIRI institutional + SEC Reg FD +
Barcelona 3.0 inherited). Body follows §11 required structure + §14.2 exact-heading
compiler contract.

Custom-from-catalog per §2 routing: catalog listed `vyon-investor-cadence` — no
marketplace match; fulfills catalog slot as Route D custom skill.

Route D per §8.2 (cited rubric).

Cross-agent §8.9 note: Larcker & Tayan 2020 supports both investor-cadence (this
skill) and precedent (Governance) whenever built — single academic corpus grounds
2 skills across departments. Extract once, use twice.

Cross-agent §13.1 note: this skill INHERITS herald's Barcelona-Principles measurement
discipline (pr_analytics.ave_refuse() enforcement) + Comms & PR no-euphemism rule
(McCord discipline via herald identity). Not owned here — inherited.
-->
---
name: investor-cadence
type: custom
status: built from scratch (Route D cited rubric)
sources_referenced:
  - "Buffett, Warren (1977–present). Berkshire Hathaway annual letters to shareholders. Practitioner corpus per §8.9 — canonical text on candor + no-jargon + owner-oriented investor communication. Available FREE at berkshirehathaway.com/letters."
  - "Larcker, David F. & Tayan, Brian (2020, 3rd ed.). Corporate Governance Matters: A Closer Look at Organizational Choices and Their Consequences. Pearson. ISBN 978-0136660026. Named academic per §8.8 (Stanford GSB) — IR + governance intersection."
  - "NIRI (National Investor Relations Institute). Standards of Practice for Investor Relations + Reg FD compliance materials. Institutional. Some materials FREE at niri.org."
  - "SEC Regulation FD (17 CFR § 243, adopted 2000). Selective-disclosure rule — public companies must disclose material information simultaneously to all investors. Regulatory fence."
  - "Barcelona Principles 3.0 (AMEC 2020) — measurement discipline inherited via herald's pr_analytics.ave_refuse() enforcement. Not re-owned here."
fulfills_catalog_entry: vyon-investor-cadence (catalog listed as custom; no marketplace match)
assigned_agent: beacon (Comms & PR / Investor Comms)
portable: true
date_added: 2026-07-31
tier: 3
description: Investor-communication cadence framework — quarterly rhythm + between-quarters touchpoints + material-info trigger detection + Reg FD timing coordination + close-loop-with-investors discipline. Buffett candor + Larcker governance-academic grounding + NIRI professional standards + SEC Reg FD regulatory fence. Trigger on "quarterly investor letter", "quarterly call preparation", "monthly investor update", "IR cadence", "material info to investors", "Reg FD timing", "investor Q&A prep", "board-adjacent update to shareholders", or "close the loop with investors on [prior commitment]".
triggers:
  - quarterly investor letter
  - quarterly call preparation
  - monthly investor update
  - IR cadence
  - material info to investors
  - Reg FD timing
  - investor Q&A prep
  - board-adjacent update to shareholders
  - close the loop with investors
  - selective disclosure
---

# Investor Cadence

## Introduction

This skill packages the recurring rhythm of investor communications for beacon:
quarterly cadence (letter + call + Q&A prep) + between-quarters touchpoints (monthly
investor notes + ad-hoc updates) + material-info trigger detection (Reg FD fence).
Synthesized from Buffett's practitioner corpus (candor + no-jargon discipline) +
Larcker & Tayan's academic governance grounding + NIRI institutional standards + SEC
Regulation FD regulatory fence.

**Scope distinction:** this is the RECURRING RHYTHM (cadence), not deck-building.
beacon owns cadence + `data-room-discipline` (sibling — evidence backing); echo
(Executive Office) owns pitch materials + board prep. Crisis-timing coordination
(Reg FD during acute crisis) routes through `crisis-comms` (sibling).

Custom Route D per §8.2 — cited rubric grounded in named published sources; no
formula, no script.

## Purpose

Prevents six failure modes that show up when investor cadence is unstructured:

1. **Selective disclosure = Reg FD violation.** Sharing material non-public
   information with any investor subset (individual analyst call, ad-hoc board
   member outreach, informal Slack to a strategic investor) without simultaneous
   public disclosure = securities-law violation for public companies + trust damage
   at any stage. LOAD-BEARING legal fence.
2. **Missed quarterly cadence = credibility damage.** Missed / late quarterly letter
   or call reads as either sloppy or hiding-something to investors. Cadence
   consistency signals operational discipline. Skipped quarters compound.
3. **Corporate euphemism in investor comms.** "Challenging quarter" / "headwinds" /
   "strategic realignment" during a bad quarter erodes trust faster than the underlying
   news. Buffett-discipline: honest WHY. Inherited from Comms & PR precedent
   (McCord via herald + signal).
4. **Fabricated / speculative forward guidance.** Investors remember guidance that
   turns out wrong. Guidance must be defensible + counsel-reviewed. Aspirational
   projections without operating-plan backing = credibility damage + potential
   securities-fraud exposure.
5. **Silent contradiction with prior investor letters.** Long-tenured investors
   track your prior letters. Silent shift on prior commitment / metric definition /
   strategic direction gets noticed + damages trust. Explicit "Update from [prior
   letter]: previously said X, now Y because Z" format required.
6. **Individual crisis DURING investor-cadence work.** Team members drafting
   investor comms under quarterly pressure + personal distress can coincide.
   HARD BOUNDARY per Universal Principle 3 — individual crisis signal blocks all
   processing regardless of quarterly-cadence timing pressure.

beacon uses this skill as the operational entry point for all recurring investor
touchpoints. Coordinates upstream with echo (pitch materials + board prep) and
sideways with `data-room-discipline` (evidence backing) + `crisis-comms` (Reg FD
timing during acute crisis).

## When to Use

Trigger on:

- "Quarterly investor letter" / "Q[N] shareholder letter" / "quarterly update to investors"
- "Quarterly call preparation" / "earnings call script" / "quarterly Q&A prep"
- "Monthly investor update" / "IR monthly note" / "between-quarters touchpoint"
- "IR cadence" / "set up investor communication rhythm" / "audit our IR cadence"
- "Material info to investors" / "we have material news for shareholders"
- "Reg FD timing" / "selective-disclosure question" / "Reg FD compliance check"
- "Investor Q&A prep" / "prep for investor call" / "anticipated questions from [investor]"
- "Board-adjacent update to shareholders" — coordination with echo's board-prep scope
- "Close the loop with investors on [prior commitment]" — explicit follow-through
- "Selective disclosure" / "one-on-one investor meeting" — Reg FD scope check

Do NOT use for:

- **Pitch decks + fundraising materials + board decks** → echo (Executive Office).
- **Data-room population / due-diligence evidence backing** → beacon's
  `data-room-discipline` (sibling).
- **Crisis-adjacent investor timing** (crisis-response with investor dimension) →
  beacon's `crisis-comms` (sibling — but coordinates with this skill for Reg FD).
- **Legal formalization of securities-law disclosure obligations** — route to
  operator + securities counsel FIRST; this skill coordinates comms cadence only
  AFTER counsel has scoped the disclosure obligation.
- **Media pitches to journalists writing on investors** → herald's `media-relations` +
  `press-kit` + `media-training`.
- **Internal comms about a material investor event** → signal's `internal-cadence` +
  `change-comms` (with material-NPI coordination back to beacon per Reg FD).
- **Individual mental-health crisis signals** → HARD BOUNDARY escalation to manager +
  HR Ops + EAP per Universal Principle 3.

## Structure / Protocol

The investor-cadence workflow combines quarterly + between-quarters + material-info
trigger streams:

```
QUARTERLY CADENCE (foundational rhythm)

  T-4 weeks   Draft quarterly letter (Buffett-discipline outline)
  T-3 weeks   Operating + financial data close; letter update
  T-2 weeks   Legal + audit + counsel review; anticipated Q&A drafting
  T-1 week    Final letter approval (operator + CFO + counsel)
  T-0         Quarterly call + letter release (simultaneous per Reg FD if public)
  T+1 week    Close-loop entries (commitments made on call go to tracker)
  T+2 weeks   Post-call investor follow-up (individual outreach OK IF no material
              info disclosed — Reg FD fence)


BETWEEN-QUARTERS TOUCHPOINTS

  Monthly     Investor note (progress against quarterly commitments)
              — NO material info without simultaneous public disclosure per Reg FD
              — Aggregate operating rhythm + strategic-direction consistency
              — Buffett-discipline: no jargon, no euphemism

  Ad-hoc      Material-info alert (Reg FD trigger — see below)
              — Simultaneous public disclosure required
              — Coordinated with operator + CFO + securities counsel
              — Timing coordinated with signal's internal-cadence (employees may
                learn same time or before per stakeholder-sequencing rules — see
                crisis-comms sibling)


MATERIAL-INFO TRIGGER DETECTION (Reg FD fence)

  Material = a reasonable investor would consider it important to an investment
  decision. Examples (non-exhaustive, per SEC + case law):
    - Earnings materially different from prior guidance / analyst consensus
    - Major acquisition / divestiture / merger
    - Leadership change (CEO / CFO / material officer)
    - Major customer win / loss materially affecting revenue
    - Regulatory action (SEC / DOJ / FTC / state AG)
    - Material litigation initiated / settled
    - Change in auditor
    - Material change to strategic direction
    - Material cybersecurity incident
    - Bankruptcy / restructuring / liquidity event

  If a proposed investor communication contains material info AND selective (not
  simultaneous public):
    STOP → route to operator + CFO + securities counsel for Reg FD compliance
           coordination BEFORE any communication.


INVESTOR-CADENCE OPERATIONAL SEQUENCE (this skill's phase-by-phase):

  Phase 1: CADENCE SETUP + RHYTHM CONFIRMATION      (initial or annual audit)
  Phase 2: QUARTERLY LETTER + CALL PREP              (T-4 to T-0)
  Phase 3: BETWEEN-QUARTERS MONTHLY NOTES             (recurring)
  Phase 4: MATERIAL-INFO TRIGGER DETECTION            (continuous scan)
  Phase 5: CLOSE-LOOP-WITH-INVESTORS DISCIPLINE       (T+1 week after every touchpoint)
  Phase 6: ANNUAL IR-CADENCE AUDIT                    (yearly retrospective)
```

## Instructions

### Phase 1 — Cadence setup + rhythm confirmation

- **Confirm quarterly rhythm.** Quarterly letter + call standard for growth-stage +
  public companies. Early-stage private may run monthly-only. Cadence choice
  documented in operator + CFO + counsel-approved IR plan.
- **Confirm monthly rhythm.** Between-quarters monthly note standard. Scope:
  progress against quarterly commitments; NO material info without simultaneous
  public disclosure (Reg FD).
- **Confirm ad-hoc rhythm.** Material-info alert protocol activated on trigger
  (Phase 4). Must coordinate with operator + CFO + securities counsel BEFORE
  external release.
- **Document investor roster.** Who receives which cadence artifact. Distinction:
  ALL investors (letter + monthly note) vs. board (additional board update) vs.
  strategic-investor subset (careful — Reg FD fence applies).

### Phase 2 — Quarterly letter + call prep (T-4 to T-0)

**T-4 weeks: Draft quarterly letter (Buffett-discipline outline).**

Buffett-letter structure (adapted from Berkshire Hathaway letters 1977–present):

1. **Result summary** — clean numbers with WHY. Not "we performed X against Y";
   instead "we did X. Y was the target. Here's why we missed / hit / beat."
2. **What went well + what didn't.** Explicit. Buffett-discipline: name misses
   BEFORE hits. Investors remember when leadership names its own misses.
3. **Strategic direction check.** Consistency with prior letters. Silent
   contradiction with prior commitments = trust damage per Principle 5.
4. **Progress against prior commitments.** Explicit close-loop for each commitment
   made in prior letter / prior call: "Prior quarter said we'd do X by Y. Result:
   [DONE / IN PROGRESS / MISSED and why]."
5. **Forward guidance** — ONLY defensible + counsel-reviewed. Aspirational
   projections without operating-plan backing = securities-fraud exposure per
   Principle 4.
6. **Explicit acknowledgment of uncertainty.** "We don't know" is stronger than a
   guess. Investors remember guesses that turn out wrong.

**T-3 weeks: Operating + financial data close.** Update letter with actuals from
close. Coordinate with CFO / finance for data validation. NO estimates in the
letter — actuals only per Buffett-discipline.

**T-2 weeks: Legal + audit + counsel review.** Securities counsel reviews for:

- Reg FD compliance (any selective disclosure risk)
- Forward-looking statement safe-harbor language (for public companies)
- Material-litigation disclosure language
- Executive compensation / related-party transaction disclosures if quarter-relevant

Concurrent: draft anticipated Q&A for the call. Structure per PRSA + NIRI standards:

- **Anticipated hard questions** — the ones the CEO / CFO would prefer not to
  answer. Draft them anyway. Answer discipline: acknowledge → address → bridge to
  strategic message.
- **Investor-specific concerns** — from prior investor calls + recent 1:1 meetings.
- **Reg FD boundary** — any question requiring material info gets deferred to the
  simultaneous public-disclosure protocol.

**T-1 week: Final letter approval.** Operator + CFO + counsel sign-off. Any last
material change re-triggers legal review.

**T-0: Quarterly call + letter release.** SIMULTANEOUS per Reg FD if public
company. Standard sequence within T-0:

1. Letter release (email + investor portal + public filing if applicable)
2. Call opens with prepared remarks (10-15 min)
3. Live Q&A (30-45 min) — single-designated-spokesperson discipline inherited from
   `crisis-comms` (sibling); typically CEO + CFO
4. Post-call written follow-up (24 hours) — commitments made on call go to
   close-loop tracker per Phase 5

### Phase 3 — Between-quarters monthly notes

**Format** (adapted from NIRI standards + Buffett-discipline):

- **Length:** 1-2 pages max. Longer = noise. Shorter = signal.
- **Content:** progress against quarterly commitments + operating rhythm updates +
  strategic-direction consistency check. NO material info without simultaneous
  public disclosure.
- **Tone:** Buffett-discipline — no jargon, no euphemism, honest WHY.
- **Cadence:** consistent day-of-month release. Investors calibrate to your rhythm;
  drift signals sloppiness.

**Reg FD boundary for monthly notes:** if a month contains material news, it
routes through Phase 4 (material-info trigger) NOT the monthly-note channel.
Monthly notes are the FLOOR for cadence consistency; material info gets its own
simultaneous-public-disclosure protocol.

### Phase 4 — Material-info trigger detection (continuous scan)

**Scan continuously for material-info triggers** (Structure/Protocol above):

- Earnings materially different from prior guidance / consensus
- Major acquisition / divestiture / merger
- Leadership change (CEO / CFO / material officer)
- Major customer win/loss / regulatory action / litigation / auditor change
- Cybersecurity incident / bankruptcy / liquidity event

**On trigger:**

1. **STOP any selective-disclosure comms.** No individual investor calls / emails /
   Slack until Phase 4 protocol runs.
2. **Escalate to operator + CFO + securities counsel.** Counsel scopes the Reg FD
   disclosure obligation.
3. **Draft simultaneous public disclosure** — 8-K filing (public companies), press
   release, or investor-wide simultaneous email. Coordinate with herald's
   `media-relations` if press coverage expected.
4. **Coordinate internal timing** with signal's `internal-cadence` +
   `change-comms` — stakeholder sequencing rules apply (affected → investors →
   public per `crisis-comms` sibling; but Reg FD for public companies may force
   simultaneous public-investor disclosure).
5. **Individual investor 1:1s AFTER public disclosure** — post-disclosure Q&A OK
   provided no NEW material info shared.

### Phase 5 — Close-loop-with-investors discipline (T+1 week after every touchpoint)

**Every commitment made in an investor communication goes to a close-loop tracker.**
Format:

| Commitment | Made in | Owner | Due | Status | Update |
|---|---|---|---|---|---|
| Ship [feature] by Q[N] | Q[N-1] letter | [CFO/CEO/etc.] | [Date] | [DONE / IN PROGRESS / MISSED / DEFERRED with reason] | [Link to next letter entry] |

Every subsequent quarterly letter references close-loop tracker in Phase 2 step 4:
"Prior quarter said we'd do X by Y. Result: [status]." Explicit close-loop is
Buffett-discipline; silent drift from prior commitments = trust damage per
Principle 5.

### Phase 6 — Annual IR-cadence audit

Once per year (typically Q1):

- **Cadence adherence** — did we hit quarterly + monthly rhythm consistently? Any
  drift?
- **Close-loop rate** — what % of prior-year commitments were closed vs. drifted
  silently? Target: 100% close-loop; silent drift is Principle 5 violation.
- **Reg FD near-misses** — any selective-disclosure incidents caught before
  release? Root-cause + prevent.
- **Investor feedback** — what did investors ask most / express concern about?
  Feed into next-year cadence design.
- **Board / operator review** — annual IR audit shared with board + operator.

## Output Format

Each invocation produces one or more of:

- **Quarterly investor letter draft** — Buffett-discipline structure, 4-8 pages
  typical, counsel-review-ready
- **Quarterly call prepared remarks** — 10-15 min opening; anticipated Q&A pack
- **Monthly investor note** — 1-2 page progress-against-commitments update
- **Material-info alert** — Reg FD simultaneous-disclosure draft (coordinated with
  operator + CFO + securities counsel)
- **Investor Q&A prep pack** — anticipated hard questions + acknowledge-address-
  bridge answers + Reg FD boundary flags
- **Close-loop tracker entry** — commitment + owner + due + status + next-letter link
- **Annual IR-cadence audit** — cadence adherence + close-loop rate + Reg FD
  near-misses + investor-feedback summary

## Principles

1. **Reg FD is a LOAD-BEARING legal fence.** Selective disclosure of material info
   to any investor subset without simultaneous public release = securities-law
   violation for public companies + trust damage at any stage. Non-negotiable.
2. **Buffett-candor discipline.** Name misses BEFORE hits. Honest WHY. No jargon.
   No euphemism. Investors remember when leadership names its own misses.
3. **Never fabricate / speculate forward guidance.** Guidance must be defensible +
   counsel-reviewed. Aspirational projections without operating-plan backing =
   securities-fraud exposure. "We don't know" is stronger than a guess.
4. **No corporate euphemism** — inherited from Comms & PR precedent (McCord via
   herald + signal). "Challenging quarter" / "headwinds" / "strategic realignment"
   during a bad quarter erodes trust faster than the underlying news.
5. **No silent contradiction with prior investor letters.** Long-tenured investors
   track prior letters. Silent shift = trust damage. Explicit "Update from [prior
   letter]: previously said X, now Y because Z" format required.
6. **Close-loop-with-investors discipline.** Every commitment goes to tracker;
   every subsequent letter references close-loop. Silent drift = Principle 5
   violation.
7. **Single-designated-spokesperson for investor calls** — inherited from
   `crisis-comms` (sibling). Typically CEO + CFO. Deviation invites contradiction
   under investor Q&A pressure.
8. **Cadence consistency signals operational discipline.** Missed / late quarterly
   letter or call reads as sloppy or hiding-something. Skipped quarters compound.
9. **Aggregate-only at publication surface** — Universal Principle 2 inherited.
   Individual employee perf / demographic / comp data NEVER published in investor
   comms.
10. **Individual crisis signals during investor-cadence work** — HARD BOUNDARY per
    Universal Principle 3 inherited. Escalate to manager + HR Ops + EAP without
    exception, regardless of quarterly-cadence timing pressure.
11. **AVE-refusal-at-code-level applies** — inherited from herald's `pr-analytics`.
    Investor-facing measurement (analyst coverage, press mentions in earnings
    context) uses Barcelona-aligned metrics; NEVER AVE.
12. **§0.6 flag.** Buffett letters + Larcker & Tayan 2020 + NIRI + SEC Reg FD are
    Tier B (canonical sources cited but not book-page-cited from `Agents/_books/`).
    Downgrade to Tier A when Larcker & Tayan 2020 is placed and a `Shared OS/logical/
    investor_cadence.md` Route-D asset is built per §8.9.

## Fallback

- **Uncertainty about Reg FD materiality of proposed disclosure.** STOP → route to
  operator + CFO + securities counsel per Principle 1. Do NOT proceed with
  selective disclosure without counsel confirmation. Legal fence is
  non-negotiable.
- **Missed quarterly cadence.** Do NOT skip the letter/call. Ship a late letter
  with explicit acknowledgment of the delay + WHY (Buffett-discipline). Investors
  forgive one late; they don't forgive silent skips.
- **Bad-news quarter + team pressure to soften language.** Buffett-discipline holds
  per Principle 2 + 4. Softened language erodes trust faster than the underlying
  news. If team resistance persists, escalate to operator; principle is not
  negotiable at the artifact layer.
- **Forward guidance requested but no defensible operating-plan backing.** Decline
  per Principle 3. Aspirational projections without backing = securities-fraud
  exposure. Alternative: qualitative direction ("we're focused on X") without
  quantitative forward guidance.
- **Silent-contradiction risk detected with prior letter.** Draft explicit "Update
  from [prior letter]" entry per Principle 5. Never ship silent contradiction.
- **Material info detected in a draft monthly note.** ROUTE to Phase 4 material-
  info trigger protocol. Monthly notes do NOT carry material info without
  simultaneous public disclosure.
- **Selective-disclosure request from a strategic investor** (individual analyst
  call asking for material info). Decline politely per Principle 1 + Reg FD;
  offer to include the question in next scheduled public disclosure or invite to
  public analyst day.
- **Individual crisis signal during quarterly-prep conversation.** STOP. Route per
  Universal Principle 3 (inherited) to manager + HR Ops + EAP. HARD BOUNDARY
  overrides all quarterly-cadence timing pressure.
- **Crisis-adjacent investor timing** (crisis-response with investor dimension).
  Route to `crisis-comms` (sibling) — this skill coordinates Reg FD timing but
  does NOT own crisis-response content.
- **Board dimension in investor update.** Coordinate with echo (Executive Office —
  board-prep scope) per §2 routing; this skill owns shareholder-facing cadence,
  not board-prep.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `data-room-discipline` (custom, beacon — sibling) | Evidence backing for quarterly / material-info claims; due-diligence-ready supporting materials | Coordination |
| `crisis-comms` (custom, beacon — sibling) | Crisis-adjacent investor timing (Reg FD during acute crisis); stakeholder-sequencing rules | Coordination |
| `echo` (Executive Office) | Pitch materials + board prep — echo owns; beacon owns shareholder-facing cadence | Cross-department — clear scope split |
| `media-relations` + `press-kit` (custom, herald — Comms & PR sibling) | Press-coverage coordination for material-info alerts | Coordination |
| `pr-analytics` (custom, herald — Comms & PR sibling) | Barcelona-aligned measurement for analyst / press coverage in earnings context; AVE refusal inherited | Downstream |
| `internal-cadence` + `change-comms` (custom, signal — Comms & PR sibling) | Internal announcements coordination for material-info events (stakeholder-sequencing) | Coordination |
| `hire`'s `payroll-and-eor` (P&C) | Material officer changes (CEO / CFO / material officer) triggering both HRIS + Reg FD | Cross-department coordination |
| `board` (Governance) | Governance approval for major investor comms decisions; annual IR audit review | Escalation |
| `precedent` (Governance) | Prior investor-comms decisions + precedent-tracking for cadence audit | Coordination |
| Operator + CFO + securities counsel | Reg FD compliance coordination; material-info disclosure obligation scoping; forward-guidance defensibility review | Escalation — LOAD-BEARING legal fence Principle 1 + 3 |
| Manager + HR Ops + EAP | Individual mental-health signal during investor-cadence conversation — HARD BOUNDARY | Escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every investor-cadence artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [Berkshire Hathaway annual letters (1977–present) — FREE](https://www.berkshirehathaway.com/letters/letters.html)
- [Larcker, David F. & Tayan, Brian — Corporate Governance Matters (Pearson book page)](https://www.pearson.com/en-us/subject-catalog/p/corporate-governance-matters/P200000005911)
- [NIRI — Standards of Practice for Investor Relations (institutional)](https://www.niri.org/about-niri/mission-and-standards)
- [SEC — Regulation FD Final Rule (17 CFR § 243)](https://www.sec.gov/rules/final/33-7881.htm)
- [SEC — Regulation FD Compliance & Disclosure Interpretations (staff Q&A)](https://www.sec.gov/divisions/corpfin/guidance/regfd-interp.htm)
- [AMEC — Barcelona Principles 3.0 (2020)](https://amecorg.com/2020/07/barcelona-principles-3-0/)
