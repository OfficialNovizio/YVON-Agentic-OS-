<!--
Custom skill — built from catalog `vyon-internal-cadence`, genericized per §0.4b.

Catalog source: vyon-internal-cadence — "Internal comms rhythm: weekly founder sync notes,
monthly all-hands doc, decision broadcasts. TRIGGERS: announce internally, team update.
PROTOCOL: 1 Match message to channel + cadence 2 Decision broadcasts: what, why, what
changes 3 Archive to searchable log."

Genericization strip (§0.4b):
- vyon- prefix stripped per §0.4a → internal-cadence
- "founder sync notes" → "leadership sync notes" (role-generic; founder is one example)
- No other VYON refs

Complements marketplace `internal-comms` (Anthropic official, verbatim per §4.8) which
owns FORMAT templates (3P / newsletter / FAQ / general). This skill owns WHEN + WHERE +
HOW-TO-ARCHIVE — the cadence + channel-matching + decision-broadcast + searchable-archive
discipline.

Route D per §8.2 (cited rubric + framework, no script).
-->
---
name: internal-cadence
type: custom
status: built from catalog `vyon-internal-cadence`, genericized per §0.4b
sources_referenced:
  - "Catalog entry: vyon-internal-cadence (VYON_Skills_Catalog_Full_v2.html) — protocol structure. Provenance only; content genericized."
  - "Heath, Chip & Heath, Dan (2007). Made to Stick: Why Some Ideas Survive and Others Die. Random House. SUCCESS framework (Simple / Unexpected / Concrete / Credible / Emotional / Stories) for memorable decision broadcasts."
  - "Minto, Barbara (1996). The Pyramid Principle: Logic in Writing and Thinking. Prentice Hall. Structured-writing discipline for decision broadcasts (What / Why / What changes)."
  - "Scott, Kim (2017). Radical Candor. Already cited across P&C + Comms & PR identity work; §8.9 extract-once-use-twice. Solicit-first + cadence-based comms discipline."
  - "Fournier, Camille (2017). The Manager's Path. O'Reilly. Practitioner reference for internal-comms cadence in engineering-adjacent orgs."
  - "Udext + Gallup — pulse survey research (already cited in maslow's motivation-map) — the minimum-viable-action rule + response-rate discipline informs why cadence + archive matter."
fulfills_catalog_entry: vyon-internal-cadence
genericization_notes:
  - "vyon- prefix stripped per §0.4a."
  - "'founder sync notes' → 'leadership sync notes' (role-generic)."
assigned_agent: signal (Comms & PR / Internal Comms)
portable: true
date_added: 2026-07-31
tier: 3
description: The internal comms rhythm layer — weekly leadership sync notes, monthly all-hands docs, decision broadcasts (What / Why / What changes structure), and searchable-archive discipline. Complements marketplace internal-comms (Anthropic official) which owns format templates; this skill owns WHEN + WHERE + HOW-TO-ARCHIVE. Trigger on "announce internally", "team update", "decision broadcast", "match message to channel", "all-hands doc", "weekly leadership notes", "archive this comms", or "which channel for this message".
triggers:
  - announce internally
  - team update
  - decision broadcast
  - match message to channel
  - all-hands doc
  - weekly leadership notes
  - archive this comms
  - which channel for this message
  - internal cadence for
---

# Internal Cadence

## Introduction

This skill owns the **internal comms cadence + channel-matching + decision-broadcast +
searchable-archive** layer for signal. It complements the marketplace `internal-comms`
skill (Anthropic official, verbatim per §4.8) which owns the FORMAT templates (3P
updates, company newsletters, FAQs, general comms). Together:

- **`internal-comms` (marketplace)** — owns WHAT the message looks like (format template).
- **`internal-cadence` (this skill)** — owns WHEN + WHERE + HOW-TO-ARCHIVE (rhythm +
  channel + decision structure + archive discipline).

Built from the catalog's `vyon-internal-cadence` entry, genericized per §0.4b. Sources:
catalog protocol + Heath brothers' *Made to Stick* SUCCESS framework + Minto's *Pyramid
Principle* structured-writing + Scott's cadence discipline (already anchored across
herald identity + P&C) + Fournier's *The Manager's Path* practitioner reference +
Udext / Gallup pulse-survey research on close-the-loop discipline.

## Purpose

Prevents four failure modes that show up when internal comms operate without cadence
discipline:

1. **Format-without-cadence** — one-off announcements produce information overload;
   predictable cadence lets people know WHEN to look for updates and reduces the
   "did-I-miss-something" anxiety that erodes internal-trust.
2. **Wrong-channel drift** — the same message sent to the wrong channel loses signal.
   An urgent decision buried in a Friday-afternoon email; a routine team update dropped
   into #announce; a strategic pivot mentioned only in a manager 1:1 that never
   cascades. The channel-cadence matrix (Phase 1) fixes this.
3. **Decision broadcasts without WHAT / WHY / WHAT-CHANGES** — teams get told "we
   changed X" without knowing why or how it affects their work. Reads as arbitrary;
   damages trust in leadership. The 3-part decision-broadcast structure (Phase 3) fixes
   this.
4. **Un-archived comms** — decisions and announcements get buried in scrolling channels;
   future team members can't find context; institutional memory decays. Searchable-archive
   discipline (Phase 5) fixes this.

signal uses this skill as the operational entry point for every internal announcement
that requires cadence discipline (not one-off casual chat).

## When to Use

Trigger on:

- "Announce internally" / "team update" / "internal announcement for [scope]"
- "Decision broadcast" / "how do I explain this decision to the team"
- "Match message to channel" / "which channel for this message"
- "All-hands doc" / "prepare for all-hands"
- "Weekly leadership notes" / "leadership sync notes"
- "Archive this comms" / "add to the archive"
- "Internal cadence for [scope]" / "set up internal-comms rhythm"
- Handoff from marketplace `internal-comms` when a format is drafted and needs channel /
  cadence / archive routing

Do NOT use for:

- **Format-drafting itself** (3P / newsletter / FAQ / general comms) → marketplace
  `internal-comms` (Anthropic official, in signal's marketplace/).
- **Change-management comms** (reorg / layoff / major transition) → `change-comms`
  (custom, signal — sibling). Change-comms has distinct discipline (Kotter + Bridges +
  Prosci ADKAR) beyond routine cadence.
- **External-facing comms** → herald's `media-relations` + `press-kit`.
- **Investor-facing comms** → beacon's `investor-cadence`.
- **Individual mental-health signals** → HARD BOUNDARY escalation to manager + HR Ops +
  EAP per Universal Principle 3 (inherited).
- **Crisis comms** (correction / retraction / hostile press) → beacon's `crisis-comms`.

## Structure / Protocol

The internal-cadence workflow:

```
1. CHANNEL-CADENCE MATRIX (owned + maintained here)
    Match message TYPE + URGENCY + SCOPE to CHANNEL + CADENCE:
      Company-wide urgent   → Slack #announce + email backup (same-day)
      Company-wide routine  → Weekly newsletter (uses internal-comms newsletter format)
      Team-weekly           → 3P update (uses internal-comms 3P format) via team channel
      Monthly all-hands     → Prepared doc + live meeting + Q&A + async recording/summary
      Decisions             → Decision broadcast (this skill's format, Phase 3)
      Casual / operational  → Team-channel chat (no cadence overhead needed)
      FAQ                   → Weekly FAQ digest (uses internal-comms FAQ format)

2. FORMAT ROUTING
    If the message maps to a marketplace-internal-comms format (3P / newsletter / FAQ /
    general), route the DRAFTING to that skill; this skill handles the CHANNEL + CADENCE
    + ARCHIVE routing.

3. DECISION-BROADCAST STRUCTURE (this skill's specific format)
    Every decision announcement has 3 required sections:
      WHAT changed        — the concrete change (1-2 sentences)
      WHY it changed      — the business or team rationale (2-3 sentences; honest)
      WHAT this changes   — for whom, in what specific ways (per-audience if needed)
                            for [group A]: [specific implication]
                            for [group B]: [specific implication]

    Optional 4th section:
      Q&A anticipated     — top 3-5 questions with prepared answers
                            (feeds forward to next FAQ digest)

4. ALL-HANDS PREPARATION
    Every monthly all-hands has 4 artifacts:
      a. Prepared doc      — pre-shared 24-48 hours in advance
      b. Live meeting      — 60-90 minutes typical; time-boxed sections
      c. Q&A               — live + async (submitted questions before the meeting;
                             prioritized during the meeting)
      d. Async version     — recording + summary posted to searchable archive
                             within 24 hours of the live meeting

5. SEARCHABLE ARCHIVE (single source of truth)
    All decision broadcasts, all-hands materials, newsletters, and structured FAQ
    digests → searchable archive location (typically a company wiki / Notion /
    Confluence with search enabled + tags per topic + dates).
    Rules:
      - Every entry has a permanent link that survives channel-scrolling.
      - Every entry tagged: topic + affected-audience + date + author.
      - Prior entries linked from new entries when the topic connects.
      - Contradictions between entries: NEVER silent — address the contradiction
        explicitly ("update from [prior entry]: previously said X, now Y because Z").

6. CLOSE-THE-LOOP DISCIPLINE (inherited from maslow's pulse-survey pattern)
    Every cycle: before the next weekly leadership notes / monthly all-hands, communicate
    at least one visible action taken from the previous cycle's feedback / Q&A.
    Skipping this erodes trust; team stops sending questions / feedback because they
    don't feel heard.
```

## Instructions

### Phase 1 — Match message to channel + cadence (matrix lookup)

For every internal-announcement request, apply the channel-cadence matrix. Ask:

- **Scope:** company-wide vs team-level vs cross-team? Number of affected people?
- **Urgency:** same-day critical? this-week? routine?
- **Type:** informational? decision? call-to-action? recognition? crisis?

Match to the matrix (Structure/Protocol §1). If two candidates apply, pick the more
formal channel — over-formalizing an announcement is cheap; under-formalizing damages
signal.

**Anti-pattern:** "we'll just Slack it" as default. Slack works for casual +
same-day-urgent + team-level updates, but is the WRONG channel for decisions,
company-wide routine updates, all-hands content, and anything that needs to survive
scrolling. Force the matrix lookup first.

### Phase 2 — Format routing (to marketplace internal-comms if applicable)

If the message maps to a marketplace `internal-comms` format (3P / newsletter / FAQ /
general), route the DRAFTING to that skill. Do NOT re-invent format templates here —
that's marketplace's scope. This skill owns the surrounding cadence + channel + archive
discipline.

If the message is a **decision broadcast**, use Phase 3 structure directly (not a
marketplace format — decision broadcast is this skill's specific format).

### Phase 3 — Decision broadcast structure

Every decision announcement uses the 3-part structure:

- **WHAT changed** — the concrete change in 1-2 sentences. No lead-in filler. Not
  "After careful consideration and discussion with leadership, we have decided that...";
  just "Starting Monday, engineering will use branch-based deploys instead of trunk-based."
- **WHY it changed** — 2-3 sentences of honest rationale. Business driver, team feedback,
  external constraint, whatever the real reason is. Corporate euphemism ("headwinds,"
  "efficiency measures," "strategic reallocation") erodes trust — say what happened.
- **WHAT this changes** — per-audience if needed. What does each affected group do
  differently starting when? Concrete verbs, not "we'll be more thoughtful about..." —
  "engineering: your existing branches keep working; new features open a branch off
  main and merge via PR. Managers: your Q3 planning cadence stays the same; branch
  review is part of the deploy checklist."

Optional 4th section: **Q&A anticipated** — 3-5 questions with prepared answers. Feeds
forward to the next FAQ digest and to the searchable archive.

**Anti-pattern:** decision broadcasts that skip the WHY, or that state the WHY in
corporate-euphemism form. Teams smell the euphemism and infer the real reason (usually
worse than the actual reason). Honesty in the WHY builds trust; euphemism damages it.

### Phase 4 — All-hands preparation

Monthly all-hands has 4 required artifacts:

- **Prepared doc** — pre-shared **24-48 hours** in advance. Attendees who read the doc
  come to the meeting with better questions; attendees who miss the meeting get the
  content async. Doc contains: agenda, decisions since last all-hands, key metrics,
  focus areas for the coming month.
- **Live meeting** — 60-90 minutes typical. Time-boxed sections. Presenters preview
  their sections and take questions.
- **Q&A** — live (during the meeting) + async (questions submitted 24-48 hours before
  the meeting can be prioritized by leadership; anonymous submission optional). Questions
  not answered live get written answers within 48 hours.
- **Async version** — recording (if allowed by org's privacy stance) + summary posted
  to searchable archive within 24 hours. Async version is the source of truth for anyone
  who missed the meeting; the live meeting is only one delivery format.

### Phase 5 — Archive discipline

Every decision broadcast, all-hands artifact, newsletter, and structured FAQ digest goes
to the searchable archive.

**Requirements per entry:**

- Permanent link (survives channel-scrolling; not just a Slack message)
- Tags: topic + affected-audience + date + author
- Cross-references to prior related entries when the topic connects
- If contradicting a prior entry, explicit note: "Update from [prior entry link]:
  previously said X, now Y because Z"

**Never silent contradictions.** Silent contradictions get caught by long-tenured team
members and erode leadership credibility.

### Phase 6 — Close-the-loop discipline

Before every next cycle (weekly leadership notes / monthly all-hands), communicate at
least ONE visible action taken from the previous cycle's feedback / Q&A. Inherited from
maslow's pulse-survey minimum-viable-action rule — skipping it erodes trust; team stops
engaging with the cadence because they don't feel heard.

This is a hard rule per Principle 5. If NO action was taken from the previous cycle's
feedback, either name that explicitly ("we heard X; we're not addressing it because Y")
or delay the next cycle's launch until an action can be named.

## Output Format

Each invocation produces one or more of:

- **Channel-cadence recommendation** — matrix lookup result for a specific announcement
  scope + urgency + type.
- **Decision broadcast** — WHAT / WHY / WHAT-CHANGES structure with per-audience impact
  if applicable, plus optional Q&A anticipated.
- **All-hands preparation kit** — prepared doc + agenda + presenter briefs + Q&A
  submission form + archive plan.
- **Weekly leadership notes template** — cadence-consistent format for weekly leadership
  sync notes.
- **Searchable archive entry** — canonical archive form with tags + cross-references.
- **Close-the-loop memo** — visible-action-from-previous-cycle brief.

## Principles

1. **Match message to channel + cadence BEFORE drafting.** Format matters, but wrong
   channel = wrong outcome regardless of format quality. Matrix lookup is Phase 1 for a
   reason.
2. **Decision broadcasts use WHAT / WHY / WHAT-CHANGES structure.** No exceptions. A
   decision broadcast without WHY is a directive; a decision broadcast without
   WHAT-CHANGES is a rumor.
3. **Honest WHY, no corporate euphemism.** "Headwinds," "efficiency measures,"
   "strategic reallocation," "personnel adjustments" — say what happened. Teams smell
   euphemism; euphemism damages trust more than the underlying news does.
4. **All-hands has 4 artifacts, always.** Prepared doc pre-shared + live meeting + Q&A
   (live + async) + async recording + summary within 24 hours. Missing any of the 4 =
   the all-hands didn't happen for someone.
5. **Close the loop every cycle.** Visible action from previous cycle before next cycle
   launches. Skip = erode trust. Inherited from maslow's minimum-viable-action rule
   (pulse-survey pattern).
6. **Searchable archive is single source of truth.** Every decision + all-hands +
   newsletter + FAQ digest gets a permanent link + tags + cross-references. Silent
   contradictions with prior entries never allowed — address explicitly.
7. **Aggregate-only at publication surface** (Universal Principle 7 inherited). Internal
   comms may reference individuals by name (attribution for a decision-maker, recognition
   in a newsletter, etc.) but never publish individual performance data, individual
   demographic data, or individual health / feedback data.
8. **Individual mental-health signals escalate immediately** (Universal Principle 3
   inherited). Rare in internal-cadence context but possible via Q&A submissions or
   channel-monitoring. Route to manager + HR Ops + EAP per HARD BOUNDARY.
9. **§0.6 flag.** Channel-cadence matrix + 3-part decision structure + 4-artifact
   all-hands + 24-48hr prep window are Tier B (canonical practitioner discipline per
   Heath brothers + Minto + Scott + Fournier). Downgrade to Tier A when those books
   are placed and a `Shared OS/logical/internal_cadence.md` Route-D asset is built per §8.9.

## Fallback

- **Ambiguous scope / urgency** — ask the requester before drafting. Force the matrix
  lookup (Phase 1); guessing wrong channel damages more than delaying by an hour.
- **Decision broadcast requested without WHY.** Push back per Principle 3 — request the
  actual WHY from the decision-maker before drafting. If the decision-maker refuses to
  share the WHY, note that the broadcast will be drafted with WHY explicitly labeled
  "leadership has not shared the underlying rationale" (honest even if unflattering).
- **All-hands prep with less than 24 hours to the meeting.** Escalate — recommend
  postponing the all-hands by a week rather than shipping under-prepared. Under-prepared
  all-hands damage more than delayed ones.
- **Close-the-loop check fails** (no action taken from previous cycle). Delay next cycle
  OR explicitly announce "we heard X; we're not addressing it because Y" per Principle 5.
- **Individual mental-health signal in a Q&A submission or channel content.** STOP.
  Route per Universal Principle 3 to manager + HR Ops + EAP. Do NOT publish or otherwise
  process the signal in the internal-comms surface.
- **Crisis / correction comms request** (correction to prior announcement, hostile
  situation). Route to beacon's `crisis-comms` — this skill's cadence discipline doesn't
  apply during a live crisis.
- **Change-management comms request** (reorg, layoff, major transition). Route to
  sibling `change-comms` skill (Kotter + Bridges + Prosci ADKAR discipline).
- **Silent contradiction with prior archive entry** attempted (draft says X, prior
  entry said Y, but neither addresses the change). Refuse per Principle 6 — return the
  draft with a required "Update from [prior entry]: previously said X, now Y because Z"
  section.

## Boundaries with Other Skills

| Hands off to / from | For | Direction |
|---|---|---|
| `internal-comms` (marketplace, signal — sibling) | Format templates (3P / newsletter / FAQ / general) | Downstream — internal-cadence routes format drafting to internal-comms; internal-cadence handles channel + cadence + archive routing |
| `change-comms` (custom, signal — sibling) | Change-management comms (reorg / layoff / major transition) with Kotter + Bridges + Prosci discipline | Escalation — internal-cadence routes change-adjacent to change-comms |
| `crisis-comms` (custom, beacon — Comms & PR sibling) | Correction / retraction / hostile situation comms | Escalation |
| `press-kit` (custom, herald — sibling) | External-facing content consistency — internal announcements that will also go external must be consistent with press-kit canonical library | Coordination — same story, different audience |
| `media-relations` (custom, herald — sibling) | If an internal announcement contains news that will also be pitched externally, coordination with herald's pitch timing | Coordination |
| `investor-cadence` (custom, beacon — sibling) | Material-info fence — internal announcements that contain material non-public info route to beacon + operator + counsel BEFORE any internal broadcast | Coordination + escalation |
| `feedback-methods` (custom, merit — P&C) | Delivery discipline for sensitive internal announcements (SBI + Radical Candor stance) | Cross-department |
| `motivation-map` + `wellbeing-monitoring` (custom, maslow — P&C) | Q&A / channel-content signals that surface aggregate motivation/wellbeing patterns feed maslow's aggregate view | Cross-department (aggregate signals only) |
| `hire` (P&C Lead) | Universal principle inheritance (aggregate-only, verification-before-completion, individual-crisis HARD BOUNDARY); org-change internal comms coordination (layoff / restructure announcements) | Upstream principles; coordination for org-change |
| `merit` (P&C — Performance) | Individual perf data NEVER in internal comms; merit owns that scope | Boundary — no crossing |
| `veil` (Cybersecurity — data protection) | PII in Q&A submissions / channel monitoring / archive-system access control | Escalation |
| `board` (Governance) | Material NPI in internal announcements requires board + operator + securities counsel approval BEFORE broadcast (for public companies especially) | Escalation |
| Operator + employment counsel | Protected-class impact in announcement content; discriminatory phrasing; harassment signal in Q&A | Escalation — Universal Principle 5 legal fence |
| Manager + HR Ops + EAP | Individual mental-health signal in Q&A or channel content | HARD BOUNDARY escalation — Universal Principle 3 |
| `Shared OS: verification-before-completion` | Evidence gate on every internal-comms draft + decision broadcast + all-hands artifact before shipping | Cross-cutting |

## References (public / verifiable)

- [Heath brothers — Made to Stick book site](https://heathbrothers.com/books/made-to-stick/)
- [Barbara Minto — Pyramid Principle overview (McKinsey Quarterly)](https://www.mckinsey.com/) (institutional-adjacent)
- [Kim Scott — Radical Candor framework (already cited across P&C + Comms & PR)](https://www.radicalcandor.com/)
- [Camille Fournier — The Manager's Path book page](https://www.oreilly.com/library/view/the-managers-path/9781491973882/)
- [Udext — Pulse survey best practices (already cited in maslow)](https://www.udext.com/blog/benefits-best-practices-pulse-survey)
- [Google re:Work — internal-comms guidance (institutional, FREE)](https://rework.withgoogle.com/en/guides/communicate)
