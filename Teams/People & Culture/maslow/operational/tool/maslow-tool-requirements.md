<!--
Operational: tool-requirements file for maslow (People & Culture / Motivation) per §7 tool/.

§7 rules for this file:
1. Technical requirements only — derived from what's written in each skill file.
2. Governance layer (which capabilities maslow is ALLOWED to use at runtime) lives in
   operational/agent/maslow-config.md § 7 Tool Permissions, NOT here.
3. This file MUST state explicitly, near the top, that it specifies needs and does NOT
   grant them. That disclaimer is not optional (§7 rule).
4. Fixed table format per §14.4: | Skill | Required | Optional | Source line |
5. Recognized phrases only: "File read" / "File write" / "File read/write" /
   "Python/shell execution" / "web search" / "second model". Anything else compiles as
   loud FILL_IN.

Every row's "Source line" cites the skill line that requires the capability — audit
whenever a skill or its Output Format section changes.
-->

# maslow — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Listing "Python/shell execution" or "web search" in the table below does not give maslow
> those capabilities at runtime. Actual tool / file / execution access is a separate
> runtime-configuration step — set up wherever maslow is deployed (the platform's own
> permission system, the operator's runtime configuration, or manual process).
>
> This table is the **checklist for whoever does that configuration**. Governance-layer
> decisions about which of these maslow is ALLOWED to use, in what scope, live in
> `operational/agent/maslow-config.md § 7 Tool Permissions` — not here.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

Format per §14.4. Only the recognized phrase set (File read / File write / File read/write /
Python/shell execution / web search / second model) is used — any other capability would
compile as `FILL_IN`.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| self-determination-theory | File read/write | web search | `custom/self-determination-theory/SKILL.md` § Output Format (SDT diagnostic worksheet, intervention design memo, follow-up plan, SDT lens note — all written; input scenarios and prior diagnostic history — read). Optional web search verifies research citations (Ryan & Deci 2000; Deci, Olafsen, Ryan 2017; Gagné & Deci 2005). |
| motivation-map | File read/write | Python/shell execution, web search | `custom/motivation-map/SKILL.md` § Output Format (pulse questionnaire, aggregate response report, burnout early-warning flag, intervention memo, follow-up read — all written; previous cycle history — read). Optional Python for the burnout flag computation which calls the same rule encoded in `wellbeing_monitor.py`; optional web search for research verification. |
| wellbeing-monitoring | File read/write, Python/shell execution | web search | `custom/wellbeing-monitoring/SKILL.md` § Python Utility ("Use scripts/wellbeing_monitor.py for eNPS scoring, minimum-group-size suppression, and burnout risk flag"); § Output Format (pulse questionnaire, aggregate response report, burnout risk flag, aggregate risk report, escalation log — all written). Optional web search verifies research citations and ISO 45003 status. |
| recognition-program | File read/write, Python/shell execution | web search | `custom/recognition-program/SKILL.md` § Python Utility ("Use scripts/recognition_program.py for tier lookup, participation rate, timeliness status, per-capita recognition equity check"); § Output Format (program design memo, cycle report, equity audit, refresh recommendation — all written; existing program config — read). Optional web search verifies research citations. |

## Cross-Cutting Requirements

Requirements that apply across all of maslow's 4 skills (not per-skill):

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every maslow output routes through verification before shipping — that skill reads the drafted output |
| File write | Prime Directive + every skill's Output Format | Every skill produces a written artifact |
| Second model | Not required by any maslow skill today | Reserved for future use. Currently no maslow skill invokes a second model |

## Not Required (explicit)

Capabilities maslow's skills DO NOT need. Called out explicitly so the runtime configurator
does not over-grant.

| Not required | Rationale |
|---|---|
| Direct survey-platform API access | `wellbeing-monitoring` and `motivation-map` produce the pulse design and the analysis, not the platform-admin configuration; platform-side actions route to operator per `maslow-config.md § 5 external_escalations` |
| Direct recognition-platform API access | Same — `recognition-program` produces the design and audit, not the click-through configuration |
| Individual employee performance-data read | Universal Principle 2 (aggregate-only for people data); `motivation-map` Principle 8; `wellbeing-monitoring` Principle 1; `recognition-program` Principle 6 — hard rule inherited from hire Universal 7 |
| **Individual wellbeing, mental-health, or medical data read** | **HARD BOUNDARY** — `wellbeing-monitoring` Principle 1 and § Fallback rule 1. Individual mental-health work is fully out of maslow's scope; signals escalate immediately per Universal Principle 3 |
| Individual demographic-data read | Universal Principle 2; ats-selection Topic D discipline extends here |
| Individual recognition-preference read | `recognition-program` Instructions Step 6 — aggregate preference pattern at team level only; individual preference never surfaces identifiably |
| Publishing segmented figures below minimum-group-size | Universal Principle 4 — hard rule inherited across all 3 quantitative maslow skills |
| Second model | No maslow skill invokes one today |
| Write access to marketplace skills | §4.8 — but maslow has zero marketplace skills anyway (all 4 are custom, per SDT reclassification per §4.6) |
| Write access to `Teams/Engineering/SECURITY-CHARTER.md` | Charter is operator-amended only per Prime Directive |
| Access to any other agent's `custom/` or `operational/` folders | Cross-agent editing is out of scope; if maslow's work requires updating another agent's file, that's an operator-mediated cross-department action |

## Compile Behavior

Per §14.4:

- Every row's `Required` and `Optional` cells use only the recognized phrase set. If a
  future edit puts an unrecognized phrase in either cell, the compiler treats it as
  `FILL_IN` and the affected skill ships without its tools until the phrase is fixed.
- The `Skill` column matches each skill's directory name exactly.
- This file's structure is universal across every agent's `tool/<agent>-tool-requirements.md`
  per §7; the specific requirements per row are maslow-unique.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`, `## Python Utility`,
  or `## Principles` sections. A new capability introduced in a skill without updating this
  table is a §14.4 compile drift.
- **Peer P&C agents** (grove, merit) will each get their own tool file with the same
  structure and the same disclaimer. Requirements will be derived from THEIR skills'
  Output Format sections, not copied from this file.

## Governance Cross-Reference

The governance-layer companion to this file:
`operational/agent/maslow-config.md § 7 Tool Permissions`.

That file decides which of the above maslow is ALLOWED to use at runtime, in what scope,
with what deny list. This file only says what maslow NEEDS in order to function.

Both files remain in sync by construction — a technical requirement here that governance
denies is a design conflict to resolve, not silently tolerated.
