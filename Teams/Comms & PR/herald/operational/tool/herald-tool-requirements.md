<!--
Operational: tool-requirements file for herald (Comms & PR / Lead — PR & Media)
per §7 tool/.

§7 rules for this file:
1. Technical requirements only — derived from what's written in each skill file.
2. Governance layer (which capabilities herald is ALLOWED to use at runtime) lives in
   operational/agent/herald-config.md § 10 Tool Permissions, NOT here.
3. This file MUST state explicitly, near the top, that it specifies needs and does NOT
   grant them. That disclaimer is not optional (§7 rule).
4. Fixed table format per §14.4: | Skill | Required | Optional | Source line |
5. Recognized phrases only: "File read" / "File write" / "File read/write" /
   "Python/shell execution" / "web search" / "second model".
-->

# herald — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Listing "Python/shell execution" or "web search" in the table below does not give
> herald those capabilities at runtime. Actual tool / file / execution access is a
> separate runtime-configuration step — set up wherever herald is deployed (the
> platform's own permission system, the operator's runtime configuration, or manual
> process).
>
> This table is the **checklist for whoever does that configuration**. Governance-layer
> decisions about which of these herald is ALLOWED to use, in what scope, live in
> `operational/agent/herald-config.md § 10 Tool Permissions` — not here.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

Format per §14.4. Only the recognized phrase set is used.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| media-relations | File read/write, web search | — | `custom/media-relations/SKILL.md` § Instructions Phase 2 (reporter research MANDATORY — web search verifies beat + recent coverage + Muck Rack profile); § Output Format (pitch draft, reporter research memo, newsjacking POV brief, follow-up plan, campaign timeline — all written). Web search is REQUIRED not optional — reporter research per Phase 2 cannot proceed without live reporter-beat + recent-coverage verification. |
| press-kit | File read/write | web search | `custom/press-kit/SKILL.md` § Output Format (boilerplate library, executive bios, brand asset inventory, press release drafts, embargo agreements, Q&A briefs, fact sheets, coverage archive — all written; existing canonical library, prior release archive — read). Optional web search for fact-check verification of statistics + executive credentials in Phase 4. |
| media-training | File read/write | web search | `custom/media-training/SKILL.md` § Output Format (message maps, bridging drills, hostile-Q briefs, on-record clarifications, dry-run scripts, just-before cheatsheets, post-interview debriefs — all written; reporter research from media-relations, prior press-kit Q&A library — read). Optional web search for reporter's recent coverage angles + background research on interview topic. |
| pr-analytics | File read/write, Python/shell execution | web search | `custom/pr-analytics/SKILL.md` § Python Utility ("Use scripts/pr_analytics.py for share-of-voice, sentiment aggregation, coverage-vs-target, reach estimate, message alignment, and the LOAD-BEARING ave_refuse() code-level refusal"); § Output Format (campaign goals memos, output metrics reports, outtakes reports, outcomes reports, impact assessments, AVE refusal responses, closed-loop feedback memos — all written). Optional web search for research citations verification. |

## Cross-Cutting Requirements

Requirements that apply across all of herald's 4 skills (not per-skill):

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every herald output routes through verification before shipping |
| File write | Prime Directive + every skill's Output Format | Every skill produces a written artifact |
| Web search | media-relations Phase 2 (REQUIRED); other 3 skills optional | Highest web-search-dependency agent across P&C + Comms & PR so far — reporter research mandates live lookup |
| Python/shell execution | 1 of herald's 4 skills ships a tested Python utility | pr_analytics.py — includes LOAD-BEARING code-level AVE refusal |
| Second model | Not required by any herald skill today | Reserved for future use |

## Not Required (explicit)

Capabilities herald's skills DO NOT need. Called out explicitly so the runtime
configurator does not over-grant. **Includes 9 LOAD-BEARING REFUSALS** enforcing herald's
Universal Principles — highest count of any agent in the fleet so far.

| Not required | Rationale |
|---|---|
| **Compute AVE (Advertising Value Equivalency) by ANY means** | **LOAD-BEARING REFUSAL enforced at CODE LEVEL** — `pr_analytics.ave_refuse()` always raises NotImplementedError. Universal Principle 4 + Barcelona Principle 5 baked. No workarounds — no manual math, no spreadsheet formula, no derived metric that reconstructs AVE, no "just hypothetically" workaround. Refusal is senior even to identity (Scott himself couldn't override). If legacy stakeholder insists, route to operator + educate. |
| **External send without CEO signoff (or delegated authority per material type)** | **LOAD-BEARING REFUSAL** — Universal Principle 5 + press-kit Principle 4. Signoff on ACTUAL FINAL VERSION required. Delegated authority: CFO (financial), CTO (technical), COO (operational), board + securities counsel (material NPI). If no authority available, HOLD. |
| **Release material non-public information without board + operator + securities counsel approval** | **LOAD-BEARING REFUSAL** — Universal Principle 6 + press-kit Principle 8 legal fence. Material NPI in any comms channel (press release, pitch, interview, statement) BLOCKED until board + operator + securities counsel approve. |
| **Partial embargo (embargo on some parts, not others)** | **LOAD-BEARING REFUSAL** — Universal Principle 7 + press-kit Principle 7. Full-story embargo or no embargo. Partial ("you can mention X but not Y") gets accidentally broken and burns relationships. |
| **Force newsjack when relevance test fails** | **LOAD-BEARING REFUSAL** — Universal Principle 9 + media-relations Principle 4. If "do we actually have a POV" test fails, do NOT newsjack. Forced newsjacks damage credibility beyond one moment. |
| **Blast-pitch (same pitch to multiple reporters with cosmetic personalization)** | **LOAD-BEARING REFUSAL** — Universal Principle 9 + media-relations Principle 2. Single-source per reporter. If two reporters could cover the same story, offer exclusive to one, follow-up angle to the other. Blast-pitching is the specific failure mode media-relations exists to prevent. |
| **Retroactive off-record acceptance** | **LOAD-BEARING REFUSAL** — Universal Principle 8 + media-training Principle 4 + SPJ standard. On-record status confirmed BEFORE interview starts. Unclear status defaults to on-record. Chit-chat is on-record. Once on-record, always usable. |
| **Push distressed spokesperson into interview** | **LOAD-BEARING REFUSAL + HARD BOUNDARY** — Universal Principle 3 + media-training Principle 8. Individual mental-health signal during prep → defer interview or substitute spokesperson. Weak interview does more damage than delayed/declined one. |
| **Fabricate statistic, quote, product feature, executive credential, or case study** | **LOAD-BEARING REFUSAL** — Universal Principle 1 (§0.5) + press-kit Principle 2 + media-training Principle 3 + media-relations Principle 7 + pr-analytics attribution discipline. Fact-check mandatory before CEO signoff. Proof points trace to press-kit canonical library. Never invent. |
| Publishing individual performance data or 9-box placements broadly | Inherited Universal Principle 2 aggregate-only at publication surface (from P&C precedent). Individual perf / 9-box data belongs to manager-and-direct-report + governance conversation only, never in comms outputs. |
| Publishing individual demographic data (e.g., in coverage-analysis narrative) | Universal Principle 2 aggregate-only rule; demographic data never in comms outputs |
| Publishing segmented figures below minimum-group-size | Universal Principle 4 aggregate-privacy rule inherited from P&C precedent |
| Reading individual employee performance-data (for pitch content or bio prep) | Universal Principle 2 aggregate-only rule; individual perf data is merit's scope, not herald's |
| Second model | No herald skill invokes one today |
| Write access to marketplace skills | §4.8 — but herald has zero marketplace skills anyway (media-relations reclassed to custom per §4.6) |
| Write access to `Teams/Engineering/SECURITY-CHARTER.md` | Charter is operator-amended only per Prime Directive |
| Access to any other agent's `custom/` or `operational/` folders | Cross-agent editing out of scope; cross-department action is operator-mediated |
| Direct wire-service distribution / PR-agency-tool API access | Not herald's scope — wire distribution is a legacy default per Scott identity Mental Model 1; publish direct to owned channels via press-kit + pitch via media-relations |
| Individual crisis coaching or counseling | HARD BOUNDARY per Universal Principle 3 — route to manager + HR Ops + EAP; do NOT resolve internally |
| Payroll / benefits / HR-adjacent employee data | Not herald's scope — routes to hire (P&C Lead) |

## Compile Behavior

Per §14.4:

- Every row's `Required` and `Optional` cells use only the recognized phrase set. If a
  future edit puts an unrecognized phrase in either cell, the compiler treats it as
  `FILL_IN` and the affected skill ships without its tools until the phrase is fixed.
- The `Skill` column matches each skill's directory name exactly.
- This file's structure is universal across every agent's `tool/<agent>-tool-requirements.md`
  per §7; the specific requirements per row are herald-unique.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`, `## Python Utility`,
  or `## Principles` sections. A new capability introduced in a skill without updating
  this table is a §14.4 compile drift.
- **Comms & PR tool-file family:** all 3 Comms & PR agents (herald live; signal + beacon
  pending) will have tool-requirements files with the same universal structure. The 9
  LOAD-BEARING REFUSALS in this file are herald-unique (some inherit down to signal +
  beacon through department-leader inheritance — e.g., no-fabrication + aggregate-only +
  crisis-hard-boundary; the AVE-refusal is inherited via pr-analytics-adjacent
  measurement discipline; the CEO-signoff + material-NPI + embargo + newsjack + blast +
  on-record + distressed-spokesperson are herald-specific to PR/media work).

## Governance Cross-Reference

The governance-layer companion to this file:
`operational/agent/herald-config.md § 10 Tool Permissions`.

That file decides which of the above herald is ALLOWED to use at runtime, in what scope,
with what deny list — including the 9 LOAD-BEARING REFUSALS enforcing Universal
Principles 1, 3, 4, 5, 6, 7, 8, 9 (all except 2 aggregate-only and 10 verification, which
are cross-cutting rather than concrete refusals).

Both files remain in sync by construction — a technical requirement here that governance
denies is a design conflict to resolve, not silently tolerated.

## Cross-Agent Comparison

LOAD-BEARING REFUSAL counts across the fleet (P&C + Comms & PR built so far):

| Agent | Skills | Scripts required | LOAD-BEARING REFUSALS | Distinctive rules |
|---|---|---|---|---|
| **hire** | 5 | 1 (workforce_calculator.py) | 0 explicit at tool-level | ATS/payroll admin actions denied (produces decision, not config) |
| **maslow** | 4 | 2 | 1 (individual mental-health HARD BOUNDARY) | wellbeing/medical-data read HARD BOUNDARY |
| **grove** | 4 | 3 | 2 (audit-trail edit/delete + broadening access without countersign) | Aggregate-only INVERSION for training-operations compliance records |
| **merit** | 4 | 2 | 4 (comp-in-review + 9-box-misuse + feedback-event-recording + cross-venture-silent-picking) + 4 fabrication REFUSALS | Highest count in P&C |
| **herald** (this file) | 4 | 1 | **9 LOAD-BEARING REFUSALS** (AVE-any-means + external-send-no-signoff + material-NPI-no-board + partial-embargo + force-newsjack + blast-pitch + retroactive-off-record + push-distressed-spokesperson + fabricate) | **Highest LOAD-BEARING REFUSAL count in the entire fleet so far.** Reflects PR/media surface where many failure modes have legal or credibility consequences. |

herald has the HIGHEST count of LOAD-BEARING REFUSALS across the fleet — reflecting the
PR/media scope where many failure modes have significant legal (material NPI, defamation,
embargo breach), credibility (forced newsjack, blast-pitch, fabrication), or safety
(distressed spokesperson) consequences. Structural refusals prevent the operator from
inadvertently invoking these failure modes under timing pressure or stakeholder
insistence.
