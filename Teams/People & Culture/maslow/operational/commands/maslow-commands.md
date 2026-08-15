<!--
Operational: commands file for maslow (People & Culture / Motivation) per §7 commands/.

§7 rule: document structure/layout is universal across every agent's commands file (same
table shape, same sections). Actual triggers, shortcuts, and precedence rules inside are
unique to maslow's 4-skill roster.

Trigger content pulled verbatim from each skill's `## When to Use` section — this file
consolidates them, adds slash-style shortcuts as convenience, and states precedence when
triggers overlap.
-->

# maslow — Commands

Natural-language triggers, slash shortcuts, and precedence for maslow (People & Culture /
Motivation). Triggers come from each skill's `## When to Use` section — this file
consolidates, not invents.

## Slash Shortcuts

Convenience layer for common single-skill invocations. Slash shortcuts are optional; every
skill also fires on the natural-language triggers below.

| Shortcut | Fires | One-line purpose |
|---|---|---|
| `/maslow-sdt-diagnose [team]` | `self-determination-theory` § Phase 1 | Diagnose which SDT need (autonomy/competence/relatedness) is starved for a team |
| `/maslow-sdt-frame [context]` | `self-determination-theory` § Instructions | Provide SDT-lens framing for a motivation situation without a full pulse |
| `/maslow-sdt-continuum [team]` | `self-determination-theory` § Phase 2 | Where does the team's motivation sit on the autonomous↔controlled continuum |
| `/maslow-pulse [team]` | `motivation-map` § Phases 3–4 (run + score) | Launch the quarterly SDT pulse for a team |
| `/maslow-design-pulse [team]` | `motivation-map` § Phase 1 | Design the pulse questionnaire for a cohort (baseline; once per cohort) |
| `/maslow-cycle-open [team]` | `motivation-map` § Phase 2 | Communicate previous cycle's minimum-viable-action + open the new pulse |
| `/maslow-intervention [team]` | `motivation-map` § Phase 5 | Select intervention from the menu after Phase 4 diagnosis |
| `/maslow-follow-up [team]` | `motivation-map` § Phase 6 | 12-week follow-up read on a previously-recommended intervention |
| `/maslow-wellbeing [team]` | `wellbeing-monitoring` § Steps 1–3 (design + run) | Full wellbeing pulse for a cohort |
| `/maslow-enps [cohort]` | `wellbeing-monitoring` § Step 2 + script | Compute or trend eNPS for a cohort |
| `/maslow-workload [team]` | `wellbeing-monitoring` § Step 3 | Aggregate workload signal read (overtime, absence, EAP utilization) |
| `/maslow-flag [team]` | `wellbeing-monitoring` § Step 5 + script | Compute burnout risk flag (GREEN / AMBER / RED) for a cohort |
| `/maslow-recognize-design [scope]` | `recognition-program` § Instructions Steps 1–5 | Design a new recognition program (tied objective + categories + tiers + fast pathway + launch comm) |
| `/maslow-recognize-tier [program]` | `recognition-program` § Instructions Step 3 + script | Configure or look up point-tier values for a program |
| `/maslow-recognize-audit [program]` | `recognition-program` § Instructions Step 7 + script | Cycle audit — participation rate + timeliness status + per-capita equity check |
| `/maslow-recognize-refresh [program]` | `recognition-program` § Output Format refresh trigger | 12-month refresh recommendation for an existing program |

## Multi-Skill Chain Shortcuts

Common flows touching more than one skill.

| Chain shortcut | Sequence | Purpose |
|---|---|---|
| `/maslow-full-cycle [team]` | `motivation-map` Phase 1–2 (design + open) → `motivation-map` Phase 3–4 (run + score) + parallel `wellbeing-monitoring` Steps 1–5 (design + run + score + flag) → `self-determination-theory` framing on combined signal → `motivation-map` Phase 5 (intervention selection) | End-to-end quarterly cycle for a cohort: motivation pulse + wellbeing pulse, unified diagnostic and intervention |
| `/maslow-cycle-close [team]` | `motivation-map` Phase 6 (follow-up read) + `wellbeing-monitoring` Step 8 (individual-crisis-signal check on cycle exit) → `motivation-map` Phase 2 preparation for next cycle (minimum-viable-action for the next launch) | Close-out for the previous cycle; prepares the next |
| `/maslow-relatedness-intervention [team]` | `motivation-map` Phase 4 diagnosis (relatedness starved, substrate present verification) → `motivation-map` Phase 5 routes here → `recognition-program` design → `wellbeing-monitoring` corroboration read within 30 days | The full "recognition-fires-correctly" chain per the overjustification-effect rule |
| `/maslow-burnout-triage [team]` | `wellbeing-monitoring` Step 5 (flag compute) → if RED/AMBER: `motivation-map` Phase 4 (SDT-need read for the "why") → `self-determination-theory` framing → routing to `workforce-planning` (structural) OR `recognition-program` (relatedness only) OR maslow's own intervention menu | Fast triage when a burnout flag surfaces mid-cycle |

**Chain shortcuts don't skip stops.** Each phase still produces its own artifact and gets
its own review moment per §0.2. Chains are convenience routes for the sequence, not
approval to batch outputs.

## Natural-Language Triggers (by skill)

Pulled from each skill's `## When to Use` section.

### `self-determination-theory` (custom)

| Trigger phrase | Notes |
|---|---|
| "motivation theory" / "motivation framework" / "which framework applies here" | Direct hit |
| "diagnose motivation" / "why is this team demotivated" / "what's really going on with engagement" | Ambiguous — see precedence (motivation-map wins if it's an operational-diagnostic ask) |
| "autonomy" / "competence" / "relatedness" in a workplace-motivation context | Direct hit — SDT-specific vocabulary |
| "intrinsic vs extrinsic motivation" / "autonomous vs controlled motivation" | Direct hit — SDT-continuum vocabulary |
| "which SDT need is starved here" | Direct hit |
| "should we add a bonus?" | SDT lens: usually the wrong question — diagnose first (Principle 4 overjustification-effect) |

### `motivation-map` (custom)

| Trigger phrase | Notes |
|---|---|
| "run the motivation pulse" / "quarterly needs pulse" / "start the motivation cycle" | Operational entry |
| "team morale check" / "burnout check" / "is this team burning out" | Ambiguous — see precedence (motivation-map for SDT-need cause, wellbeing-monitoring for aggregate signals) |
| "motivation trend for [team / venture]" / "what's happening with engagement on [cohort]" | Direct hit |
| "map the motivation gap for [cohort]" | Direct hit |
| Auto-cadence: start of every quarter for cohorts with a baseline | System-triggered, not operator-triggered |

### `wellbeing-monitoring` (custom)

| Trigger phrase | Notes |
|---|---|
| "pulse survey for [team / venture]" / "run a wellbeing pulse" | Direct hit — wellbeing-scope pulse |
| "eNPS" / "compute eNPS for [cohort]" / "eNPS trend" | Direct hit — script surface |
| "interpret [these] wellbeing signals" / "workload trend for [team]" | Direct hit |
| "build a wellbeing-monitoring cadence for [venture]" | Direct hit |
| "flag [team] for elevated burnout-risk signals" | Direct hit |
| "aggregate wellbeing report for the Board / operator" | Direct hit |
| "psychosocial risk audit for [cohort]" / "ISO 45003" | Direct hit — governance framing |

### `recognition-program` (custom)

| Trigger phrase | Notes |
|---|---|
| "design a new recognition/rewards program" for a venture or the group | Direct hit — BUT check precedence rule for tie-to-objective requirement |
| "build a fast peer-to-peer / manager-to-employee recognition pathway" | Direct hit |
| "audit our existing recognition program" for participation / equity issues | Direct hit — script surface |
| "tie a recognition initiative to a specific retention/engagement objective" | Direct hit |
| "report recognition program health" | Direct hit |
| "how do we thank the team" (operator vague ask) | Precedence: push back per overjustification-effect rule — ask what specific objective |
| Handoff from `motivation-map` Phase 5 (relatedness diagnosis + substrate present) | System-triggered, not operator-triggered |

## Precedence Rules (when triggers overlap)

Full precedence lives in `operational/skill/maslow-skill-routing.md § Trigger Precedence`.
Load-bearing calls restated here:

| Overlap | Winner | Reason |
|---|---|---|
| "diagnose motivation" / "why is this team demotivated" | `motivation-map` first (operational diagnostic), which calls `self-determination-theory` for framing | motivation-map owns the entry; SDT provides theory |
| "burnout check" / "team morale check" | `motivation-map` for SDT-need cause; `wellbeing-monitoring` for aggregate signals (overtime, absence, eNPS trend). Usually run both via `/maslow-burnout-triage` chain | Different scopes; the chain shortcut runs them together |
| "should we add a bonus?" / "how do we thank the team" without a diagnosis | `motivation-map` Phase 4 first, THEN `recognition-program` only if diagnosis routes there per overjustification-effect rule | SDT Principle 4 + motivation-map Principle 6 |
| "design a recognition program" without a tied objective | Push back per `recognition-program` § Fallback rule "generic-perk request" — ask for the specific objective; if operator insists, ship with objective explicitly labeled "unspecified" | recognition-program Principle 5 |
| Any trigger colliding with an **individual crisis signal** in the surrounding context | **HARD ESCALATION — no skill fires.** Route immediately to manager + HR Ops + EAP per Universal Principle 3 | Load-bearing safety rule; no operator override |

## Not-a-Command (routes to another agent)

Phrases that sound like they might trigger maslow but route elsewhere per
maslow-skill-routing.md § Cross-Agent Escalation Routing.

| Trigger phrase | Route to | Rationale |
|---|---|---|
| ANY signal of individual crisis, self-harm, serious personal distress | **HARD BOUNDARY: Manager + HR Ops + EAP** | Universal Principle 3 — immediate escalation, no exceptions, no operator override |
| "assess this individual's mental health" / "how is [person] doing" | **Operator + external professional** | Aggregate-only rule — individual mental-health work fully out of scope |
| "review [person]'s performance" / "coach [person] through [issue]" | **Future `merit` agent** (P&C sibling); currently → operator | Individual perf out of maslow's scope |
| "design a training program for [role]" / "build a learning path" | **Future `grove` agent** (P&C sibling); currently → operator with note | L&D-side interventions |
| "our team is overworked; the manager can't cope with the span" | **`workforce-planning`** (custom, hire) | Structural workload cause — hire's scope |
| "we need to raise comp to fix retention" / "pay-equity audit" | **`payroll-and-eor`** (custom, hire) OR future `comp-benchmarking` | Comp-side — recognition never fixes a comp problem |
| "approve this program's budget" | **`board`** (Governance — fiduciary-guard skill) | Spend-approval gate; maslow produces cost, board approves |
| "aggregate psychosocial-risk trends for the board" | **Future Risk & ESG department lead** (CRSO); currently → hold and log for future routing | ISO 45003 governance route |
| "PII / GDPR question about survey or recognition-platform data" | **`veil`** (Cybersecurity — data protection) | Data-protection scope |
| "SSO / SCIM setup for our recognition platform" | **`keyring`** (Cybersecurity — IAM) | IAM scope |
| "configure the recognition platform" / "grant permissions" / "vendor integration change" | **Operator** | maslow produces the design, not the click-through config |
| "time-to-fill" / "cost-per-hire" / "voluntary turnover rate" | **Future `Shared OS: people-analytics-metrics`** (planned per §13.6, task #12) | Shared skill — maslow references it but doesn't own it |
| "harassment signal in a survey comment" | **Operator + employment counsel** (via external_escalations lane) | Legal fence — but if the same content contains an individual crisis signal, that HARD BOUNDARY escalation fires first |
| Sibling P&C requests that clearly belong to hire | **`hire`** (P&C Lead) | Return with route |

## Interaction Notes

- **Slash shortcuts are optional.** maslow fires on natural-language triggers too.
- **Chain shortcuts respect §0.2.** Each phase artifact still gets its own review moment.
- **Every command runs through Universal Principle 11** (verification-before-completion)
  before its output ships.
- **Every command routes through Universal Principle 3 first.** If an individual crisis
  signal is present anywhere in the context, no maslow skill fires — the escalation lane
  takes over immediately.
- **Charter-conflict routes to operator.** If any command would produce a Charter-conflicting
  output (e.g., a survey design that would expose SSNs), maslow blocks and escalates
  rather than executing.
- **Config §1 crisis-escalation `<FILL_IN>` fields block ANY invocation.** Per maslow-config.md
  §1 rule, an unfilled crisis-escalation contact block halts all skill invocations until
  filled — not a debt-loud announcement, an actual block. This is safety infrastructure,
  not process debt.

## Meta

- Compiled per §14.2 into the tier-2+ preamble of each of maslow's 4 skills as the trigger table.
- Structure (same section shape as every other agent's commands file) matches the §7
  universal layout; triggers/shortcuts/precedence are maslow-specific.
- Peer P&C agents (grove, merit) will get their own commands files with the same layout
  and their own triggers/shortcuts when built.
