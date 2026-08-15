<!--
Operational: commands file for signal (Comms & PR / Internal Comms) per §7 commands/.

§7 rule: document structure/layout is universal across every agent's commands file
(same table shape, same sections). Actual triggers, shortcuts, and precedence rules
inside are unique to signal's 3-skill roster.
-->

# signal — Commands

Natural-language triggers, slash shortcuts, and precedence for signal (Comms & PR /
Internal Comms). Triggers come from each skill's `## When to Use` section.

## Slash Shortcuts

Convenience layer for single-skill invocations. Optional — natural-language triggers
fire the same skills.

| Shortcut | Fires | One-line purpose |
|---|---|---|
| `/signal-3p [team]` | `internal-comms` (marketplace) — 3P format | 3P update (Progress / Plans / Problems) for a team |
| `/signal-newsletter [scope]` | `internal-comms` — newsletter format | Company-wide newsletter (~20-25 bullets) |
| `/signal-faq [topic]` | `internal-comms` — FAQ format | Weekly FAQ digest — company-wide questions with summarized answers |
| `/signal-general [context]` | `internal-comms` — general format | General internal comms that doesn't fit 3P/newsletter/FAQ |
| `/signal-channel-match [message]` | `internal-cadence` § Phase 1 (matrix lookup) | Match message TYPE + URGENCY + SCOPE to CHANNEL + CADENCE before drafting |
| `/signal-decision [context]` | `internal-cadence` § Phase 3 (decision broadcast) | 3-part WHAT / WHY / WHAT-CHANGES structure for a decision |
| `/signal-all-hands [month]` | `internal-cadence` § Phase 4 (all-hands prep) | 4-artifact prep — prepared doc + live meeting + Q&A + async version |
| `/signal-leadership-notes [week]` | `internal-cadence` weekly leadership notes | Weekly cadence-consistent leadership sync notes |
| `/signal-archive [entry]` | `internal-cadence` § Phase 5 (archive discipline) | Searchable archive entry with permanent link + tags + cross-refs |
| `/signal-close-loop [cycle]` | `internal-cadence` § Phase 6 (minimum-viable-action check) | Visible action from previous cycle check before next cycle launches |
| `/signal-change-scope [event]` | `change-comms` § Phase 1 (major-vs-routine qualification) | Confirm scope qualifies as major-change requiring distinct discipline |
| `/signal-change-legal [event]` | `change-comms` § Phase 2 (LOAD-BEARING legal fence) | Employment counsel involvement check + counsel routing per change type |
| `/signal-change-segment [event]` | `change-comms` § Phase 3 (audience segmentation) | Segment audiences (affected / retained / adjacent / customers / board) |
| `/signal-pre-change [event]` | `change-comms` § Phase 4 (Kotter step 1 + Bridges Ending) | Pre-change narrative (sense of urgency + guiding coalition + strategic vision) |
| `/signal-change-announce [event + audience]` | `change-comms` § Phase 5 (announcement drafts audience-specific) | Per-audience announcement — WHAT / WHY / WHAT-CHANGES / TIMING / RESOURCES |
| `/signal-neutral-zone [event]` | `change-comms` § Phase 6 (LOAD-BEARING Neutral Zone comms) | High-cadence Neutral Zone comms plan (weekly minimum written updates + Q&A + POC) |
| `/signal-reinforce [event]` | `change-comms` § Phase 7 (Kotter step 8 + ADKAR Reinforcement) | Weeks-to-months reinforcement plan — short-term wins + institutional anchoring + ADKAR |
| `/signal-change-retrospective [event]` | `change-comms` § Phase 8 (post-change retrospective) | What worked + what didn't + lessons for next change event |

## Multi-Skill Chain Shortcuts

Common flows touching more than one skill.

| Chain shortcut | Sequence | Purpose |
|---|---|---|
| `/signal-decision-broadcast [context]` | `internal-cadence` Phase 1 (matrix lookup) → Phase 3 (3-part WHAT/WHY/WHAT-CHANGES draft) → Phase 5 (archive entry with cross-refs + tags) → Phase 6 (close-the-loop check for next cycle) | End-to-end decision broadcast with cadence + archive + close-loop |
| `/signal-all-hands-cycle [month]` | `internal-cadence` Phase 4a (prepared doc 24-48hr advance share) → Phase 4b (live meeting 60-90 min) → Phase 4c (Q&A live + async) → Phase 4d (async recording + summary within 24hr) → Phase 5 (archive entry) → Phase 6 (close-loop for next month) | End-to-end monthly all-hands cycle |
| `/signal-change-comms-full [event]` | `change-comms` Phase 1 (scope confirm major-vs-routine) → Phase 2 (**LOAD-BEARING legal fence — HOLD if counsel not involved**) → Phase 3 (audience segmentation) → Phase 4 (pre-change narrative if permitted) → Phase 5 (audience-specific announcement drafts) → Phase 6 (**LOAD-BEARING Neutral Zone comms plan**) → Phase 7 (reinforcement plan) → Phase 8 (archive + retrospective) | End-to-end change-management comms with all LOAD-BEARING gates |
| `/signal-close-the-loop [cycle]` | `internal-cadence` Phase 6 previous-cycle action check → if action taken: name it visibly + launch next cycle; if not: explicitly name "we heard X; we're not addressing it because Y" OR delay next cycle | LOAD-BEARING close-loop discipline before every next cycle |
| `/signal-reorg-comms [event]` | `change-comms` full sequence + coordination with `workforce-planning` (hire — structural) + `succession-planning` (merit — leadership transition) + `feedback-methods` (merit — individual 1:1 delivery) + `press-kit` + `media-relations` (herald — external face if applicable) | Comprehensive reorg comms coordinated across affected agents |
| `/signal-layoff-comms [event]` | `change-comms` full sequence with EMPHASIS on legal-fence Phase 2 (WARN Act + protected-class + severance + international) + audience segmentation (affected employees FIRST + separate + most compassionate; retained employees; external if applicable) + Neutral Zone comms (elevated crisis probability per Universal Principle 3) | Comprehensive layoff comms — highest-stakes change-comms scenario |

**Chain shortcuts respect §0.2.** Each phase artifact gets its own review moment.

## Natural-Language Triggers (by skill)

### `internal-comms` (marketplace — Anthropic verbatim)

| Trigger phrase | Notes |
|---|---|
| "3P update" / "progress plans problems" / "team weekly update" | Direct hit — 3P format |
| "company newsletter" / "company-wide update" / "weekly newsletter" | Direct hit — newsletter format |
| "FAQ digest" / "common questions" / "answer these company questions" | Direct hit — FAQ format |
| "leadership update" / "project update" / "status report" / "incident report" / "general internal message" | Direct hit — general or specific format from source |

### `internal-cadence` (custom)

| Trigger phrase | Notes |
|---|---|
| "announce internally" / "team update" / "internal announcement for [scope]" | Direct hit; matrix lookup Phase 1 first |
| "decision broadcast" / "how do I explain this decision to the team" | Phase 3 — 3-part WHAT/WHY/WHAT-CHANGES structure |
| "match message to channel" / "which channel for this message" | Phase 1 matrix lookup |
| "all-hands doc" / "prepare for all-hands" / "monthly all-hands" | Phase 4 — 4-artifact prep |
| "weekly leadership notes" / "leadership sync notes" | Weekly cadence format |
| "archive this comms" / "add to searchable archive" | Phase 5 archive discipline |
| "internal cadence for [scope]" / "set up internal-comms rhythm" | Full cadence design |
| **"just Slack it"** (as default channel choice for a decision or company-wide comms) | **BLOCK per Universal Principle 6** — matrix lookup mandatory; Slack wrong channel for decisions/routine-company-wide |
| **"skip the archive entry"** | **BLOCK per Universal Principle 8** — every decision/all-hands/newsletter/FAQ needs archive entry |

### `change-comms` (custom)

| Trigger phrase | Notes |
|---|---|
| "reorg announcement" / "reorganize the team" / "team restructure" | Direct hit — major-change scope |
| "layoff comms" / "layoff announcement" / "reduction in force" / "RIF" | Direct hit — highest-stakes change-comms |
| "merger comms" / "acquisition comms" / "M&A announcement" | Direct hit — major-change scope |
| "major transition comms" / "org change" | Direct hit |
| "change management" (in internal-comms context) | Direct hit |
| "how do we announce this change" — major change (>2-3 people substantially affected) | Direct hit |
| "how do we announce this change" — routine decision | Routes to `internal-cadence` decision-broadcast instead |
| "transition plan for [scope]" | Direct hit |
| "pre-change communications" / "post-change reinforcement" | Direct hit — Phases 4 + 7 |
| **"draft change-comms without legal counsel involvement"** | **BLOCK per Universal Principle 4** — LOAD-BEARING legal fence; HOLD drafting until counsel involved |
| **"skip the Neutral Zone comms"** / **"announce and move on"** | **BLOCK per Universal Principle 5** — LOAD-BEARING; Neutral Zone non-optional |
| **"just say 'headwinds' — cleaner"** / any corporate euphemism during layoff/change | **BLOCK per Universal Principle 7** — honest WHY, no euphemism |
| **"release material NPI in this internal announcement"** (unannounced M&A / financial restatement / exec departure) | **BLOCK** — route to board + operator + securities counsel BEFORE broadcast |

## Precedence Rules (when triggers overlap)

Full precedence in `operational/skill/signal-skill-routing.md § Trigger Precedence`.
Load-bearing calls restated:

| Overlap | Winner | Reason |
|---|---|---|
| Ambiguous "internal comms" | `internal-cadence` first (matrix lookup Phase 1); routes to `internal-comms` for format if applicable | Matrix decides channel + cadence before format drafting |
| "how do we announce this change" — routine (1-3 people, no restructure) | `internal-cadence` decision-broadcast (WHAT/WHY/WHAT-CHANGES) | Routine change |
| "how do we announce this change" — major (reorg / layoff / merger / >2-3 people substantially affected) | `change-comms` full sequence | Major change |
| **Change-comms request WITHOUT legal counsel involvement** | **BLOCK per Universal Principle 4** | LOAD-BEARING legal fence — no operator override |
| **Skip Neutral Zone comms request** | **BLOCK per Universal Principle 5** | LOAD-BEARING; skipping = change fails |
| **Corporate euphemism in draft** | **BLOCK per Universal Principle 7** | LOAD-BEARING honest-WHY discipline |
| **Silent contradiction with prior archive entry** | **BLOCK per Universal Principle 8** | LOAD-BEARING archive integrity |
| **Material NPI in internal announcement without board + counsel** | **BLOCK route to board + counsel BEFORE** | LOAD-BEARING legal fence |
| **External-facing change comms** | **Route to `press-kit` + `media-relations` (herald)** | Boundary — signal handles internal, herald external |
| **Crisis dimension of change event** | **Route to `crisis-comms` (beacon)** | Escalation |
| Any request colliding with **individual crisis signal** | **HARD ESCALATION — no skill fires** | Universal Principle 3; load-bearing safety |

## Not-a-Command (routes to another agent)

| Trigger phrase | Route to | Rationale |
|---|---|---|
| **ANY signal of individual crisis / self-harm / serious distress** (elevated during change events) | **HARD BOUNDARY: Manager + HR Ops + EAP** | Universal Principle 3 — immediate escalation, no exceptions, no operator override |
| **"draft change-comms without counsel"** / **"skip the legal review this once"** | **Operator + employment counsel** | LOAD-BEARING legal fence per Universal Principle 4 |
| **"release material NPI in internal announcement"** | **`board` + operator + securities counsel** | LOAD-BEARING per Universal Principle 5 legal fence |
| "structural design of reorg" / "org chart change" / "headcount decisions" | **`workforce-planning`** (custom, hire — P&C) | signal handles comms; hire handles structure |
| "succession-adjacent change" (executive departure, leadership transition) | **`succession-planning`** (custom, merit — P&C) | Coordination |
| "individual 1:1 conversation delivery" (SBI + Radical Candor for managers) | **`feedback-methods`** (custom, merit — P&C) | Cross-department |
| "Neutral Zone wellbeing monitoring" (aggregate signals during change) | **`motivation-map` + `wellbeing-monitoring`** (custom, maslow — P&C) | Cross-department coordination |
| "external press coverage of the reorg" / "customer notifications about the change" | **`press-kit` + `media-relations`** (custom, herald — sibling) | signal handles internal, herald handles external |
| "crisis dimension of the change" (leaked news, hostile press, unexpected market reaction) | **`crisis-comms`** (custom, beacon — sibling) | Escalation |
| "investor-facing change comms" (M&A material info, investor briefing) | **`investor-cadence` + `data-room-discipline`** (custom, beacon) | Coordination + escalation |
| "PII in Q&A submissions / channel monitoring / archive access control" | **`veil`** (Cybersecurity — data protection) | Data-protection scope |
| "comms tooling / all-hands production budget" | **`board`** (Governance — fiduciary-guard) | Spend-approval gate |
| "protected-class impact / discriminatory phrasing / harassment signal in draft or Q&A" | **Operator + employment counsel** | Legal fence — Universal Principle 5 |
| "individual perf data in internal newsletter" / "9-box placement to team" | **BLOCK — aggregate-only inherited from P&C** | Universal Principle 2 |
| Sibling Comms & PR requests belonging to herald (media / press-kit / spokesperson prep) | **`herald`** (Comms & PR Lead) | Return with route |
| Sibling Comms & PR requests belonging to beacon (investor / crisis-comms) | **`beacon`** (Comms & PR sibling) | Return with route |

## Interaction Notes

- **Slash shortcuts are optional.** signal fires on natural-language triggers too.
- **Chain shortcuts respect §0.2.** Each phase artifact gets its own review moment.
- **Every command runs through Universal Principle 10** (verification-before-completion)
  before its output ships.
- **Every command routes through Universal Principle 3 first.** If an individual crisis
  signal is present, no signal skill fires — the escalation lane takes over immediately.
- **Legal fence enforced STRUCTURALLY.** signal cannot draft change-comms without
  employment counsel involvement. If counsel is not involved, HOLD. Not a discretionary
  block — LOAD-BEARING per Universal Principle 4 + `signal-config.md` §1 tool-permissions.
- **Neutral Zone comms non-optional.** No change program ships that skips Neutral Zone
  comms per Universal Principle 5 LOAD-BEARING.
- **Channel-cadence matrix mandatory BEFORE drafting.** Universal Principle 6
  LOAD-BEARING. "Just Slack it" as default is anti-pattern.
- **No corporate euphemism.** Push back on euphemism drafts + provide direct
  plain-English alternatives per Universal Principle 7.
- **Never silent contradictions with prior archive.** Universal Principle 8 LOAD-BEARING.
  Explicit "Update from [prior entry]: previously said X, now Y because Z."
- **Close the loop every cycle.** Universal Principle 9 LOAD-BEARING. Visible action
  from previous cycle before next cycle launches OR explicit no-action-with-reason.
- **Charter-conflict routes to operator + veil.**
- **`signal-config.md` §1/§6 invocation-blocking `<FILL_IN>`s** — safety infrastructure.

## Meta

- Compiled per §14.2 into the tier-2+ preamble of each of signal's 3 skills.
- Structure matches §7 universal layout; triggers / shortcuts / precedence are
  signal-specific.
- Peer Comms & PR agent (beacon) will get its own commands file with the same layout
  when built.
