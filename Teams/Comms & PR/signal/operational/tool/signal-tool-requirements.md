<!--
Operational: tool-requirements file for signal (Comms & PR / Internal Comms)
per §7 tool/.

§7 rules for this file:
1. Technical requirements only — derived from what's written in each skill file.
2. Governance layer (which capabilities signal is ALLOWED to use at runtime) lives in
   operational/agent/signal-config.md § 10 Tool Permissions, NOT here.
3. This file MUST state explicitly, near the top, that it specifies needs and does NOT
   grant them. That disclaimer is not optional (§7 rule).
4. Fixed table format per §14.4: | Skill | Required | Optional | Source line |
5. Recognized phrases only: "File read" / "File write" / "File read/write" /
   "Python/shell execution" / "web search" / "second model".
-->

# signal — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Listing "web search" in the table below does not give signal that capability at
> runtime. Actual tool / file / execution access is a separate runtime-configuration
> step — set up wherever signal is deployed (the platform's own permission system, the
> operator's runtime configuration, or manual process).
>
> This table is the **checklist for whoever does that configuration**. Governance-layer
> decisions about which of these signal is ALLOWED to use, in what scope, live in
> `operational/agent/signal-config.md § 10 Tool Permissions` — not here.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

Format per §14.4. Only the recognized phrase set is used.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| internal-comms | File read/write | web search | `marketplace/internal-comms/SKILL.md` — Anthropic official skill; source references 4 example files (3P / newsletter / FAQ / general) read from `examples/` directory + writes internal-comms artifacts. Optional web search for institutional-guidance verification. |
| internal-cadence | File read/write | web search | `custom/internal-cadence/SKILL.md` § Output Format (channel-cadence recommendation, decision broadcast, all-hands preparation kit, weekly leadership notes template, searchable archive entry, close-the-loop memo — all written; prior archive entries + channel-cadence matrix + calling context — read). Optional web search verifies Heath / Minto / Scott / Fournier / Udext / Gallup citations. |
| change-comms | File read/write | web search | `custom/change-comms/SKILL.md` § Output Format (change-scope confirmation memo, legal-fence status check, audience segmentation plan, pre-change narrative brief, announcement drafts audience-specific, Neutral Zone comms plan, reinforcement plan, post-change retrospective — all written; existing archive + prior change events + counsel guidance — read). Optional web search verifies Kotter / Bridges / Prosci / McCord citations; WARN Act / SEC Reg FD / EU works-council regulatory verification. |

## Cross-Cutting Requirements

Requirements that apply across all of signal's 3 skills (not per-skill):

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every signal output routes through verification before shipping |
| File write | Prime Directive + every skill's Output Format | Every skill produces a written artifact |
| Web search | Optional for all 3 signal skills | Used to verify framework citations + regulatory verification for change-comms (WARN Act / Reg FD / works-councils) |
| Python/shell execution | Not required by any signal skill | signal has NO scripts (all 3 skills Route D — cited rubrics + templates) |
| Second model | Not required by any signal skill today | Reserved for future use |

## Not Required (explicit)

Capabilities signal's skills DO NOT need. Called out explicitly so the runtime
configurator does not over-grant. **Includes 9 LOAD-BEARING REFUSALS** enforcing
signal's Universal Principles — matches herald's count of 9 as highest in the fleet.

| Not required | Rationale |
|---|---|
| **Draft change-comms without employment counsel involvement** | **LOAD-BEARING REFUSAL** — Universal Principle 4 + change-comms Principle 1. Employment counsel involved BEFORE drafting for layoff / reorg-with-role-elim / M&A / major transition. Comms language that creates legal exposure is worse than delayed comms. If counsel not involved, HOLD. |
| **Skip Neutral Zone comms** | **LOAD-BEARING REFUSAL** — Universal Principle 5 + change-comms Principle 4. Bridges' Transition Model: Neutral Zone is where MOST change management fails. High-cadence updates during Neutral Zone are non-optional. Escalate if resource constraints threaten Neutral Zone cadence — reduce scope, extend timeline, or add comms resource; do NOT skip. |
| **Ship content with corporate euphemism in change or decision context** | **LOAD-BEARING REFUSAL** — Universal Principle 7 + internal-cadence Principle 3 + change-comms Principle 3. Honest WHY; no "headwinds" / "efficiency measures" / "personnel adjustments" during layoff. Teams smell euphemism; euphemism erodes trust more than the underlying news. McCord discipline inherited via herald identity + P&C precedent. |
| **Publish silent contradiction with prior archive entry** | **LOAD-BEARING REFUSAL** — Universal Principle 8 + internal-cadence Principle 6. Explicit "Update from [prior entry link]: previously said X, now Y because Z" format required. Silent contradictions get caught by long-tenured team members and erode leadership credibility. |
| **Release material non-public information in internal announcement without board + operator + securities counsel approval** | **LOAD-BEARING REFUSAL** — Universal Principle 5 legal fence. For public companies especially, SEC Regulation FD requires simultaneous public disclosure when material information is shared with select analysts/investors. Internal announcement timing must coordinate with external-disclosure timing via beacon + operator + securities counsel. |
| **Draft external-facing change comms** (press coverage, customer notifications) | **LOAD-BEARING REFUSAL** — change-comms § When to Use "Do NOT use for". signal owns internal-facing comms; external routes to herald's `press-kit` + `media-relations`. Coordination for internal-external consistency mandatory but signal does NOT draft external. |
| **Publish individual performance data or 9-box placements** | **LOAD-BEARING REFUSAL** — Universal Principle 2 aggregate-only at publication surface (inherited from P&C precedent). Individual perf / demographic / feedback / medical data never publish identifiably through signal outputs. Internal comms may name individual leadership (attribution for a decision-maker; recognition in a newsletter) but never individual data at scale. |
| **Publish segmented figures below minimum-group-size** | **LOAD-BEARING REFUSAL** — Universal Principle 4 aggregate-privacy rule inherited from P&C precedent. If a segmented figure would identify individuals, suppress / roll up / report qualitatively. |
| **Fabricate statistic, quote, executive rationale, or case study** | **LOAD-BEARING REFUSAL** — Universal Principle 1 (§0.5) + inherited from herald's no-fabrication rule. Never invented statistics; never unapproved executive quotes; never fabricated case studies. Silent contradictions with prior entries are a fabrication variant per Principle 8. |
| Python/shell execution | Not required — signal has NO scripts (all 3 skills Route D) |
| Second model | No signal skill invokes one today |
| Write access to marketplace skills | §4.8 — signal's `internal-comms` is Anthropic-official verbatim; NEVER edit marketplace body (frontmatter additions were made at build time only) |
| Write access to `Teams/Engineering/SECURITY-CHARTER.md` | Charter is operator-amended only per Prime Directive |
| Access to any other agent's `custom/` or `operational/` folders | Cross-agent editing out of scope; cross-department action is operator-mediated |
| Direct comms-platform admin actions (Slack workspace admin, email-vendor admin, intranet-CMS admin) | Not signal's scope — signal produces the design + content, not the click-through platform configuration; route to operator |
| Individual crisis coaching or counseling | HARD BOUNDARY per Universal Principle 3 — route to manager + HR Ops + EAP; do NOT resolve internally |
| Structural design of reorg / headcount decisions | Not signal's scope — routes to `workforce-planning` (custom, hire — P&C) |
| Legal formalization of layoff / restructure (WARN notices, severance agreements, protected-class analysis) | Not signal's scope — routes to operator + employment counsel per Universal Principle 5 legal fence |

## Compile Behavior

Per §14.4:

- Every row's `Required` and `Optional` cells use only the recognized phrase set.
- The `Skill` column matches each skill's directory name exactly.
- This file's structure is universal across every agent's `tool/<agent>-tool-requirements.md`
  per §7; the specific requirements per row are signal-unique.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`, `## Python
  Utility`, or `## Principles` sections.
- **Comms & PR tool-file family:** all 3 Comms & PR agents (herald live; signal — this
  file; beacon pending) will have tool-requirements files with the same universal
  structure. herald + signal both carry 9 LOAD-BEARING REFUSALS (tied for highest in
  the fleet); beacon count TBD when built.

## Governance Cross-Reference

The governance-layer companion to this file:
`operational/agent/signal-config.md § 10 Tool Permissions`.

That file decides which of the above signal is ALLOWED to use at runtime, in what scope,
with what deny list — including the 9 LOAD-BEARING REFUSALS enforcing Universal
Principles 1, 2, 4, 5, 7, 8 (inherited Principles 3 crisis + 6 matrix + 9 close-loop
+ 10 verification are cross-cutting rules rather than concrete refusals).

Both files remain in sync by construction — a technical requirement here that
governance denies is a design conflict to resolve, not silently tolerated.

## Cross-Agent Comparison

LOAD-BEARING REFUSAL counts across the fleet (P&C + Comms & PR built so far):

| Agent | Skills | Scripts required | LOAD-BEARING REFUSALS | Distinctive rules |
|---|---|---|---|---|
| **hire** | 5 | 1 | 0 explicit at tool-level | ATS/payroll admin denied |
| **maslow** | 4 | 2 | 1 (individual mental-health HARD BOUNDARY) | Wellbeing/medical HARD BOUNDARY |
| **grove** | 4 | 3 | 2 (audit-trail edit/delete + broadening access without countersign) | Aggregate-only INVERSION for training-operations |
| **merit** | 4 | 2 | 4 (comp-in-review + 9-box-misuse + feedback-event-recording + cross-venture-silent-picking) + 4 fabrication REFUSALS | Highest in P&C |
| **herald** | 4 | 1 | **9 LOAD-BEARING REFUSALS** (AVE + external-send-no-signoff + material-NPI + partial-embargo + force-newsjack + blast-pitch + retroactive-off-record + push-distressed-spokesperson + fabricate) | Tied for highest in fleet |
| **signal** (this file) | 3 | 0 | **9 LOAD-BEARING REFUSALS** (draft-change-comms-without-counsel + skip-Neutral-Zone + corporate-euphemism + silent-contradiction + material-NPI + external-facing-change-comms + individual-perf-data + segmented-below-min-group + fabricate) | **Tied for highest in fleet with herald.** Reflects Comms & PR internal-facing scope where change-comms surface has legal-adjacent exposure (WARN Act, Reg FD, protected-class) + honesty discipline (no-euphemism) + trust-preservation (close-the-loop + no-silent-contradiction). |

herald + signal are **tied for highest LOAD-BEARING REFUSAL count in the fleet** at 9
each. Comms & PR department overall carries more structural refusals than P&C reflects:

- Comms & PR total: 18 refusals across 3 agents (herald 9 + signal 9; beacon pending).
- P&C total: 7 refusals across 4 agents (hire 0 + maslow 1 + grove 2 + merit 4).

Rationale: Comms & PR outputs are the org's external + internal voice. Failure modes at
this surface have legal (Reg FD, WARN Act, defamation, protected-class), credibility
(euphemism, silent contradiction, forced newsjack, blast-pitch, AVE), and safety
(distressed spokesperson) consequences that compound faster than most P&C surfaces.
Structural refusals prevent these failure modes under timing pressure or stakeholder
insistence.
