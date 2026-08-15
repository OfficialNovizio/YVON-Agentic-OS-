<!--
Operational: tool-requirements file for grove (People & Culture / Learning & Development)
per §7 tool/.

§7 rules for this file:
1. Technical requirements only — derived from what's written in each skill file.
2. Governance layer (which capabilities grove is ALLOWED to use at runtime) lives in
   operational/agent/grove-config.md § 9 Tool Permissions, NOT here.
3. This file MUST state explicitly, near the top, that it specifies needs and does NOT
   grant them. That disclaimer is not optional (§7 rule).
4. Fixed table format per §14.4: | Skill | Required | Optional | Source line |
5. Recognized phrases only: "File read" / "File write" / "File read/write" /
   "Python/shell execution" / "web search" / "second model". Anything else compiles as
   loud FILL_IN.

Every row's "Source line" cites the skill line that requires the capability.
-->

# grove — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Listing "Python/shell execution" or "web search" in the table below does not give grove
> those capabilities at runtime. Actual tool / file / execution access is a separate
> runtime-configuration step — set up wherever grove is deployed (the platform's own
> permission system, the operator's runtime configuration, or manual process).
>
> This table is the **checklist for whoever does that configuration**. Governance-layer
> decisions about which of these grove is ALLOWED to use, in what scope, live in
> `operational/agent/grove-config.md § 9 Tool Permissions` — not here.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

Format per §14.4. Only the recognized phrase set (File read / File write / File read/write /
Python/shell execution / web search / second model) is used — any other capability would
compile as `FILL_IN`.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| deliberate-practice | File read/write | web search | `custom/deliberate-practice/SKILL.md` § Output Format (component decomposition memo, feedback loop specification, difficulty calibration note, repetition schedule, DP framework brief — all written; input scenarios and prior diagnostic history — read). Optional web search verifies Ericsson (1993/2016) + Macnamara (2014) citations. |
| skill-gap-map | File read/write, Python/shell execution | web search | `custom/skill-gap-map/SKILL.md` § Python Utility ("Use scripts/skill_gap.py for score computation, priority ranking, and Build/Buy/Borrow/Bridge recommendation"); § Output Format (skills matrix, priority-ranked gap list, action recommendation memo, rater-discrepancy log — all written). Optional web search for HR-analytics research verification. |
| training-program-design | File read/write, Python/shell execution | web search | `custom/training-program-design/SKILL.md` § Python Utility ("Use scripts/training_program.py for completion rate, ROI estimate, 70-20-10 allocation check, Kirkpatrick evaluation-timing helper"); § Output Format (program design memo, evaluation plan, 70-20-10 allocation check, Kirkpatrick 4-levels evaluation report, required-drivers gap flag — all written). Optional web search verifies ADDIE / Kirkpatrick / Whatfix / Docebo citations. |
| training-operations | File read/write, Python/shell execution | web search | `custom/training-operations/SKILL.md` § Python Utility ("Use scripts/training_ops.py for audit-trail validation, days-until-expiry, renewal-alert status, completion-status rollup"); § Output Format (enrollment rules memo, audit-trail validation report, expiry alert report, compliance status rollup, access-control audit — all written; existing audit-trail records — read per aggregate-only inversion). Optional web search for retention-period authoritative sources (ISO, OSHA, EU directives, etc.). |

## Cross-Cutting Requirements

Requirements that apply across all of grove's 4 skills (not per-skill):

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every grove output routes through verification before shipping |
| File write | Prime Directive + every skill's Output Format | Every skill produces a written artifact |
| Python/shell execution | 3 of grove's 4 skills ship with a tested Python utility | Highest script-density agent in P&C |
| Second model | Not required by any grove skill today | Reserved for future use |

## Not Required (explicit)

Capabilities grove's skills DO NOT need. Called out explicitly so the runtime configurator
does not over-grant.

| Not required | Rationale |
|---|---|
| **Audit-trail entry edit or delete** | **HARD REFUSAL** — Universal Principle 4 + `training-operations` § Principles rule 6. Cross-cutting to ALL grove skills, not just training-operations. Corrections appended as new entries only. This is a design invariant, not a discretionary permission. |
| **Broadening audit-trail access without veil + operator countersign** | Universal Principle 5 — access-control direction always tightening. Broadening requires documented rationale + countersign; grove does not unilaterally grant or expand access. |
| Direct LMS or audit-trail-system platform admin API access | `training-operations` § When to Use "Do NOT use for" — grove produces the design and audit, not the click-through configuration; platform-admin actions route to operator per `grove-config.md § 7 external_escalations` |
| Individual employee performance-data read | Universal Principle 2 aggregate-only rule; `skill-gap-map` Principle 5; `training-program-design` Principle 6; `deliberate-practice` Principle 6 — individual perf data belongs to future `merit` |
| **Individual compliance-audit-trail record read** | **EXCEPTION per Universal Principle 2's scoped inversion** — ALLOWED for `training-operations` scope only (individually-identifiable records by legal necessity per its Principle 3). Every other grove skill stays aggregate-only. The runtime permission for this exception is governed via least-privilege IAM by veil + operator per `grove-config.md § 1 access_control` |
| Individual demographic-data read | Universal Principle 2 aggregate-only rule; demographic data is not part of the 4 required audit-trail fields |
| Publishing segmented figures below minimum-group-size | Universal Principle 4 aggregate-privacy rule applies to `skill-gap-map` / `training-program-design` rollups. `training-operations` compliance records are exempt per the aggregate-only inversion. |
| Second model | No grove skill invokes one today |
| Write access to marketplace skills | §4.8 — but grove has zero marketplace skills anyway (all 4 are custom; `deliberate-practice` reclassified per §4.6) |
| Write access to `Teams/Engineering/SECURITY-CHARTER.md` | Charter is operator-amended only per Prime Directive |
| Access to any other agent's `custom/` or `operational/` folders | Cross-agent editing out of scope; cross-department action is operator-mediated |
| Cross-jurisdiction retention-rule authoritative determination | Route to operator + employment counsel per Universal Principle 5; grove does not decide retention on its own |

## Compile Behavior

Per §14.4:

- Every row's `Required` and `Optional` cells use only the recognized phrase set. If a
  future edit puts an unrecognized phrase in either cell, the compiler treats it as
  `FILL_IN` and the affected skill ships without its tools until the phrase is fixed.
- The `Skill` column matches each skill's directory name exactly.
- This file's structure is universal across every agent's `tool/<agent>-tool-requirements.md`
  per §7; the specific requirements per row are grove-unique.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`, `## Python Utility`,
  or `## Principles` sections. A new capability introduced in a skill without updating
  this table is a §14.4 compile drift.
- **Peer P&C agents** (maslow shipped; merit pending) have / will have their own tool
  files with the same structure and disclaimer. Requirements derive from THEIR skills'
  Output Format sections.

## Governance Cross-Reference

The governance-layer companion to this file:
`operational/agent/grove-config.md § 9 Tool Permissions`.

That file decides which of the above grove is ALLOWED to use at runtime, in what scope,
with what deny list — including the two HARD refusals (audit-trail edit/delete + access
broadening without countersign) and the ONE SCOPED EXCEPTION (individual compliance
audit-trail read allowed for training-operations only).

Both files remain in sync by construction — a technical requirement here that governance
denies is a design conflict to resolve, not silently tolerated.
