<!--
Operational: tool-requirements file for merit (People & Culture / Performance Management)
per §7 tool/.

§7 rules for this file:
1. Technical requirements only — derived from what's written in each skill file.
2. Governance layer (which capabilities merit is ALLOWED to use at runtime) lives in
   operational/agent/merit-config.md § 9 Tool Permissions, NOT here.
3. This file MUST state explicitly, near the top, that it specifies needs and does NOT
   grant them. That disclaimer is not optional (§7 rule).
4. Fixed table format per §14.4: | Skill | Required | Optional | Source line |
5. Recognized phrases only: "File read" / "File write" / "File read/write" /
   "Python/shell execution" / "web search" / "second model".

Every row's "Source line" cites the skill line that requires the capability.
-->

# merit — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Listing "Python/shell execution" or "web search" in the table below does not give merit
> those capabilities at runtime. Actual tool / file / execution access is a separate
> runtime-configuration step — set up wherever merit is deployed (the platform's own
> permission system, the operator's runtime configuration, or manual process).
>
> This table is the **checklist for whoever does that configuration**. Governance-layer
> decisions about which of these merit is ALLOWED to use, in what scope, live in
> `operational/agent/merit-config.md § 9 Tool Permissions` — not here.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

Format per §14.4. Only the recognized phrase set (File read / File write / File read/write /
Python/shell execution / web search / second model) is used.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| feedback-methods | File read/write | web search | `custom/feedback-methods/SKILL.md` § Output Format (SBI feedback script, feedback quadrant diagnostic, solicit-first script, delivery-and-pause plan, praise-with-specificity draft — all written; input scenarios and prior conversation context — read). Optional web search verifies Scott / Weitzel / CCL / Radical Candor citations. NO script — Route D per §8.2. NO individual-feedback-event ledger writing (Principle 5 LOAD-BEARING). |
| performance-frame | File read/write | web search | `custom/performance-frame/SKILL.md` § Output Format (individual OKR draft, mid-cycle status, end-of-cycle written review, year-end synthesis, comp hand-off memo — all written; company OKRs from vista, prior cycle history — read). Optional web search verifies Doerr / Grove / Bock / re:Work citations. NO script — Route D per §8.2. |
| succession-planning | File read/write, Python/shell execution | web search | `custom/succession-planning/SKILL.md` § Python Utility ("Use scripts/succession_planning.py for 9-box label lookup, bench-strength scoring, and risk-flag classification"); § Output Format (critical roles list, candidate pool, 9-box grid, readiness assessment, bench-strength memo, development path, career-lattice recommendation, zero-successor escalation memo — all written). Optional web search verifies succession-planning research citations. |
| hr-strategy-alignment | File read/write, Python/shell execution | web search | `custom/hr-strategy-alignment/SKILL.md` § Python Utility ("Use scripts/hr_scorecard.py for scorecard build, orphan flagging in both directions, per-entry progress, and weighted alignment score"); § Output Format (HR strategy scorecard, orphan report, HRBP discovery memo, weighting recommendation, sunset conversation script, cross-venture tradeoff memo, strategic-priority routing — all written). Optional web search verifies Kaplan & Norton / HRBP research citations. |

## Cross-Cutting Requirements

Requirements that apply across all of merit's 4 skills (not per-skill):

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every merit output routes through verification before shipping |
| File write | Prime Directive + every skill's Output Format | Every skill produces a written artifact |
| Python/shell execution | 2 of merit's 4 skills ship tested Python utilities | Fewer scripts than grove (3) but consistent with maslow (2) |
| Second model | Not required by any merit skill today | Reserved for future use |

## Not Required (explicit)

Capabilities merit's skills DO NOT need. Called out explicitly so the runtime configurator
does not over-grant. **Includes the 4 LOAD-BEARING REFUSALS** enforcing merit's Universal
Principles.

| Not required | Rationale |
|---|---|
| **Recording individual feedback events** | **LOAD-BEARING REFUSAL** — Universal Principle 8 + `feedback-methods` Principle 5. merit teaches the framework; does NOT build per-person feedback ledger or surveillance layer over feedback conversations. Not a discretionary block. |
| **Publishing individual 9-box placements broadly** | **LOAD-BEARING REFUSAL** — Universal Principle 6 + `succession-planning` Principle 8. Governance / manager-conversation surface only. Public ranking is misuse of the framework. Not a discretionary block. |
| **Publishing individual perf scores broadly** | **LOAD-BEARING REFUSAL** — Universal Principle 2 (aggregate-only at publication) + `performance-frame` Principle 5 inheritance. Individual perf data belongs to manager-and-direct-report only. Not a discretionary block. |
| **Using 9-box as comp / PIP / ranking / permanent-label input** | **LOAD-BEARING REFUSAL** — Universal Principle 6 + `succession-planning` Principle 3. 9-box is a development-conversation input; misuse destroys the framework. Not a discretionary block. |
| **Mixing comp discussion into performance-review conversation** | **LOAD-BEARING REFUSAL** — Universal Principle 5 + `performance-frame` Principle 4. Comp routes to `payroll-and-eor` or future `comp-benchmarking` on separate cadence. Not a discretionary block. |
| **Fabricating business objectives for scorecard** | **LOAD-BEARING REFUSAL** — Universal Principle 1 + §0.5 + `hr-strategy-alignment` Fallback rule 1. Objectives come from marcus / vista / board / requester; missing objectives = scorecard incomplete. |
| **Fabricating metric values** | **LOAD-BEARING REFUSAL** — Universal Principle 1 + §0.5 + `hr-strategy-alignment` Principle 4. Missing metric = INCOMPLETE, never guess. |
| **Silently picking cross-venture priorities** | **LOAD-BEARING REFUSAL** — Universal Principle 5 + `hr-strategy-alignment` Principle 5. Cross-venture tradeoffs route to marcus + board for the strategic call. |
| Individual employee performance-data read | Universal Principle 2 aggregate-only at publication rule; permitted internally only for `performance-frame` (manager-and-direct-report scope) and `succession-planning` (governance-and-manager scope) — never surfaced broadly |
| Individual demographic-data read | Universal Principle 2 aggregate-only rule; demographic data not permitted for 9-box, perf-cycle, or scorecard inputs |
| Publishing segmented figures below minimum-group-size | Universal Principle 2 aggregate-privacy rule applies to hr-strategy-alignment scorecard aggregates |
| Second model | No merit skill invokes one today |
| Write access to marketplace skills | §4.8 — but merit has zero marketplace skills anyway (all 4 custom) |
| Write access to `Teams/Engineering/SECURITY-CHARTER.md` | Charter is operator-amended only per Prime Directive |
| Access to any other agent's `custom/` or `operational/` folders | Cross-agent editing out of scope; cross-department action is operator-mediated |
| LMS / audit-trail-system platform admin actions | Not merit's scope — that's grove's `training-operations` (with its own aggregate-only inversion for compliance records). merit does not touch training-operations records. |
| PIP formalization / discriminatory-phrasing determination | Not merit's scope — Universal Principle 5 legal fence routes to operator + employment counsel. merit's persistent-N pattern SURFACES the PIP-candidate signal; formalization is legal-adjacent. |

## Compile Behavior

Per §14.4:

- Every row's `Required` and `Optional` cells use only the recognized phrase set. If a
  future edit puts an unrecognized phrase in either cell, the compiler treats it as
  `FILL_IN` and the affected skill ships without its tools until fixed.
- The `Skill` column matches each skill's directory name exactly.
- This file's structure is universal across every agent's `tool/<agent>-tool-requirements.md`
  per §7; the specific requirements per row are merit-unique.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`, `## Python Utility`,
  or `## Principles` sections. A new capability introduced in a skill without updating
  this table is a §14.4 compile drift.
- **P&C tool-file family:** all 4 P&C agents (hire live, maslow live, grove live, merit
  = this file) have tool-requirements files with the same universal structure. The 4
  LOAD-BEARING REFUSALS in this file are merit-unique.

## Governance Cross-Reference

The governance-layer companion to this file:
`operational/agent/merit-config.md § 9 Tool Permissions`.

That file decides which of the above merit is ALLOWED to use at runtime, in what scope,
with what deny list — including the 4 LOAD-BEARING REFUSALS enforcing Universal
Principles 5, 6, 8, and 9.

Both files remain in sync by construction — a technical requirement here that governance
denies is a design conflict to resolve, not silently tolerated.

## Cross-Agent Comparison

Tool-requirements across P&C agents:

| Agent | Skills | Scripts required | Notable REFUSALS |
|---|---|---|---|
| **hire** | 5 | 1 (workforce_calculator.py) | ATS / payroll admin actions denied (produces decision, not config) |
| **maslow** | 4 | 2 (wellbeing_monitor.py, recognition_program.py) | Individual wellbeing/medical-data read HARD BOUNDARY |
| **grove** | 4 | 3 (skill_gap.py, training_program.py, training_ops.py) | Audit-trail edit/delete HARD REFUSAL + aggregate-only INVERSION for compliance records |
| **merit** (this file) | 4 | 2 (succession_planning.py, hr_scorecard.py) | **4 LOAD-BEARING REFUSALS** enforcing Universal Principles 5, 6, 8, 9 (comp-in-review / 9-box-misuse / feedback-event-recording / cross-venture-silent-picking) |

merit has the HIGHEST count of LOAD-BEARING REFUSALS across P&C — reflecting its
performance / succession / strategy scope where the most rules originate about what NOT
to do with individual performance data and framework outputs.
