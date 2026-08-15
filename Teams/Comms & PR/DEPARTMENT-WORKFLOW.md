<!--
Department workflow for Comms & PR. herald-led multi-agent sequencing patterns.
Companion to README.md (department overview + scope splits).
-->

# Comms & PR — Department Workflow

> **herald** (Comms & PR Lead — David Meerman Scott identity) sequences
> multi-agent Comms & PR work. This file documents the standard sequencing
> patterns for events that span 2 or 3 agents in the department.

## Sequencing Principle

Per §2 (CLAUDE.md routing) + Prime Directive: multi-agent tasks route to the
department leader (**herald**) who sequences the others. herald never does
signal's or beacon's work — herald sequences the sequence, checks the seams,
and enforces department-level principles at the coordination surface.

## Standard Sequencing Patterns

### Pattern A — Crisis with press + internal + investor dimensions

**Trigger:** any organizational crisis that touches all three surfaces (product
failure with public press coverage + employee-affected + investor-material).

**herald sequences:**

1. **beacon `crisis-comms` Phase 1** — Assess + Assemble + Activate (0-30 min).
   Crisis-team activation. SCCT-attribution diagnosis started concurrently.
2. **beacon `crisis-comms` Phase 2** — first holding statement (<100 words,
   within 30 min). Uses herald `press-kit` template library for holding-
   statement structure.
3. **beacon `crisis-comms` Phase 3** — SCCT-attribution finalized. Legal
   counsel involvement MANDATORY if litigation exposure possible.
4. **beacon `crisis-comms` Phase 4 stakeholder sequencing** — affected →
   investors → public. beacon coordinates with:
   - **signal `internal-cadence`** for affected-employee announcement (FIRST
     per sequence); if change-comms scope applies (layoff / reorg) then
     `change-comms` protocol with counsel involvement
   - **herald `media-relations` + `press-kit`** for press-side release (LAST
     per sequence unless Reg FD forces simultaneous for public companies)
5. **beacon `crisis-comms` Phase 5** — single-designated-spokesperson.
   Spokesperson-prep handoff to **herald `media-training`** (3-messages-MAX +
   ABC bridging + hostile-Q drill adapted for crisis).
6. **beacon `crisis-comms` Phase 6** — correction/retraction handling via
   **herald `media-relations`** reporter outreach.
7. **beacon `crisis-comms` Phase 7** — sustained cadence. beacon owns cadence;
   signal owns internal channel; herald owns press channel.
8. **beacon `crisis-comms` Phase 8** — resolution + learning. Retrospective
   shared across all 3 agents + operator + counsel.

**Coverage measurement:** **herald `pr-analytics`** tracks crisis-coverage per
Barcelona Principles; AVE-refusal enforced at `ave_refuse()` code level.

**Escalation:** operator + relevant counsel per Universal Principle 5 (legal
fence); board (Governance) for governance-approval decisions.

### Pattern B — Product / feature launch with press + internal + investor angles

**Trigger:** major product / feature launch with all-hands attention + press
coverage + investor-material dimension.

**herald sequences:**

1. **signal `internal-cadence`** — decision broadcast / all-hands preparation
   for internal announcement (FIRST unless Reg FD forces simultaneous).
2. **herald `press-kit`** — press-release + canonical materials library
   population for launch date.
3. **herald `media-training`** — spokesperson prep for launch-day interviews +
   anticipated-Q&A drill.
4. **herald `media-relations`** — press pitch strategy + reporter outreach for
   launch day (embargo discipline per herald principles).
5. **beacon `investor-cadence`** — if material to investors, either:
   - Include in next scheduled quarterly letter / monthly note, OR
   - Trigger material-info alert Phase 4 (Reg FD simultaneous-public-disclosure
     coordinated with signal + herald + operator + CFO + counsel)
6. **beacon `data-room-discipline`** — evidence-backing links from any
   investor-facing launch claim to authoritative backing document in data room.
7. **herald `pr-analytics`** — post-launch coverage measurement per Barcelona
   Principles.

**Escalation:** operator + securities counsel if material-info status uncertain.

### Pattern C — Material-info event (earnings surprise / leadership change / major deal / regulatory action)

**Trigger:** event meeting Reg FD material-info criteria.

**herald sequences (Reg FD legal fence upstream of everything):**

1. **beacon `investor-cadence` Phase 4** — material-info trigger detection +
   escalation to operator + CFO + securities counsel FIRST. Counsel scopes
   Reg FD disclosure obligation.
2. **beacon `data-room-discipline` Phase 4** — backing documents tagged
   `[MATERIAL-NPI]`; access-tier confirmed Tier A/B until public disclosure.
3. **Simultaneous public disclosure ships** (for public companies) — 8-K
   filing + press release + investor-wide simultaneous email. Timing
   coordinated:
   - **beacon `investor-cadence`** — investor-facing content (letter to
     shareholders + call if scheduled)
   - **herald `press-kit` + `media-relations`** — press release + media
     outreach
   - **signal `internal-cadence`** — internal announcement (per stakeholder-
     sequencing may be BEFORE public for affected-employee dimension IF Reg
     FD timing permits; consult counsel)
4. **Post-disclosure investor 1:1s** allowed via **beacon `investor-cadence`**
   provided no NEW material info shared (Reg FD fence still applies).
5. **beacon `data-room-discipline` Phase 4** — documents retagged
   `[MATERIAL-PUBLIC]`; access can broaden per operator + counsel approval.
6. **herald `pr-analytics`** — coverage measurement.

**Critical:** Reg FD fence is UPSTREAM of stakeholder-sequencing default. For
public companies, simultaneous public disclosure may force affected-employees
to learn same time or after public per Reg FD, contradicting the standard
affected-FIRST sequence. Legal-counsel-arbitrated per event.

### Pattern D — Hostile press moment

**Trigger:** reporter hostile on a topic; correction request denied; continued
inaccurate framing across coverage.

**herald sequences:**

1. **herald `media-relations`** detects hostile pattern; attempts private
   correction request first.
2. If reporter refuses correction OR continues inaccurate framing, herald
   escalates to **beacon `crisis-comms` Phase 6** (correction/retraction
   handling).
3. **beacon `crisis-comms`** assesses whether this qualifies as crisis-adjacent
   (single-hostile-piece vs. sustained-hostile-coverage-pattern). If sustained
   pattern OR framing has material-info dimension, activate full crisis
   protocol.
4. **operator + defamation counsel** engaged for defamation review before any
   public counter-statement.
5. **herald `media-training`** re-briefs designated spokesperson on updated
   messaging.
6. **herald `press-kit`** ships public correction via owned channels (never
   framed as attack on reporter — burns future relationship).
7. **beacon `investor-cadence`** coordinates if the hostile coverage has
   investor-Q&A implications (anticipated-Q preparation for next call).

### Pattern E — Change event (planned layoff / reorg / M&A) without crisis dimension

**Trigger:** planned change with employee-affected + potentially investor-
material dimensions.

**herald sequences:**

1. **operator + employment counsel involved BEFORE drafting** —
   LOAD-BEARING per signal `change-comms` Principle 1. WARN Act + protected-
   class analysis + severance-agreement scope + timing.
2. **signal `change-comms`** — pre-change narrative brief + audience-segmented
   announcement drafts + Neutral Zone comms plan (Bridges Transition Model).
3. **beacon `investor-cadence`** — if material to investors:
   - Reg FD material-info trigger Phase 4 (Pattern C above)
   - Coordinate with **signal `change-comms`** for stakeholder-sequencing
     (affected FIRST unless Reg FD forces simultaneous)
4. **herald `press-kit` + `media-relations`** — if press coverage expected,
   press-side coordination for external release timing (post-internal per
   sequence unless Reg FD forces simultaneous).
5. **signal `change-comms`** Neutral Zone reinforcement — high-cadence updates
   during transition period. LOAD-BEARING: skipping Neutral Zone comms is
   a change-comms Principle 4 violation.
6. **signal `change-comms`** post-change retrospective feeds back to next
   change event.
7. **If change event leaks OR reaction is unexpectedly hostile OR press
   coverage becomes hostile** → escalates to Pattern A (crisis) via
   **beacon `crisis-comms`**.

**Escalation:** operator + employment counsel per Universal Principle 5.

## Cross-Comms & PR Coordination Rules

Enforced by herald at coordination surface:

- **Barcelona Principles at code level.** herald's `pr_analytics.ave_refuse()`
  raises `NotImplementedError`. Inherited by signal + beacon at principle
  level. NO measurement work uses AVE across the department.
- **No corporate euphemism at any surface.** Herald identity carries McCord
  discipline; signal + beacon inherit at principle level. Bad-news events
  ship with honest WHY.
- **Single-designated-spokesperson during high-stakes events.** Inherited
  from herald `media-training`. Crisis / investor calls / launch interviews:
  ONE voice.
- **No silent contradiction with prior artifact.** All 3 agents apply.
  Explicit "Update from [prior artifact]" framing when correcting or shifting.
- **Reg FD fence UPSTREAM of stakeholder-sequencing default.** beacon-owned;
  signal + herald coordinate timing per counsel guidance for public-company
  events.
- **Individual crisis HARD BOUNDARY.** Universal Principle 3 across all 3
  agents. Escalate to manager + HR Ops + EAP regardless of timing pressure.

## Cross-Department Coordination

Comms & PR routinely coordinates with:

- **echo** (Executive Office) — pitch materials + board prep (echo scope);
  beacon coordinates evidence consistency
- **marcus / vista** (Executive Office) — strategic narrative alignment;
  quarterly letter / all-hands narrative consistency with strategy
- **hire** (P&C Lead) — key-employee contracts + individual data aggregate-only
  for DD backing; layoff-adjacent change-comms coordination
- **maslow + merit** (P&C) — post-crisis wellbeing monitoring (aggregate-only);
  post-change engagement measurement
- **warden + veil + bastion** (Cybersecurity) — cybersecurity-incident
  crisis-comms coordination; PII data-protection for data-room
- **board + precedent + sentinel** (Governance) — governance approval for
  major decisions; prior-decision precedent tracking
- **dev / spec + product agents** — product-launch coordination
- **spark + atlas** (Brand Studio) — brand-consistency check for press-kit +
  press-release materials
- **operator + relevant counsel** — legal-fence escalation (securities / M&A /
  employment / defamation) — LOAD-BEARING per Universal Principle 5

## Not Sequenced Here (out of scope)

- **Pitch decks + fundraising materials + board decks** — echo (Executive
  Office) sequences separately; Comms & PR coordinates evidence consistency
- **Product roadmap + PRD-level product decisions** — Product department
  (spec / metric / ux / loom / price) sequences separately
- **Individual mental-health crisis** — HARD BOUNDARY per Universal Principle
  3 — manager + HR Ops + EAP; NOT Comms & PR

## Audit Notes

- **Workflow patterns audited:** 2026-07-31 (all 3 agents LIVE).
- **Next audit trigger:** new sequencing pattern identified in production; any
  agent skill added / removed; any coordination-surface principle change.
