<!--
Operational: tool-requirements file for hire (People & Culture / Lead) per §7 tool/.

§7 rules for this file:
1. Technical requirements only — derived from what's written in each skill file.
2. Governance layer (which capabilities hire is ALLOWED to use at runtime) lives in
   operational/agent/hire-config.md § Tool Permissions, NOT here.
3. This file MUST state explicitly, near the top, that it specifies needs and does NOT
   grant them. That disclaimer is not optional (§7 rule).
4. Fixed table format per §14.4: | Skill | Required | Optional | Source line |
5. Recognized phrases only: "File read" / "File write" / "File read/write" /
   "Python/shell execution" / "web search" / "second model". Anything else compiles as
   loud FILL_IN.

Every row's "Source line" cites the skill line that requires the capability — audit
whenever a skill or its Output Format section changes.
-->

# hire — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Listing "Python/shell execution" or "web search" in the table below does not give hire
> those capabilities at runtime. Actual tool / file / execution access is a separate
> runtime-configuration step — set up wherever hire is deployed (the platform's own
> permission system, the operator's runtime configuration, or manual process).
>
> This table is the **checklist for whoever does that configuration**. Governance-layer
> decisions about which of these hire is allowed to use, in what scope, live in
> `operational/agent/hire-config.md` § 6 Tool Permissions — not here.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

Format per §14.4. Only the recognized phrase set (File read / File write / File read/write /
Python/shell execution / web search / second model) is used — any other capability would
compile as `FILL_IN`.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| interview-prep | File read, File write | — | `marketplace/interview-prep/SKILL.md` § Output ("Produce a complete interview kit: panel assignment, question bank by competency, scoring rubric, and debrief template") — reads scorecard input, writes kit output |
| hiring-kit | File read/write | web search | `custom/hiring-kit/SKILL.md` § Output Format (scorecard template, hiring-loop timeline, debrief matrix, reference-check script, offer memo — all written; existing scorecards, JDs, candidate data — read). Optional web search is for reference-verification lookups only; not core-loop-required |
| ats-selection | File read/write, web search | — | `custom/ats-selection/SKILL.md` § Principles rule 5 ("Every recommendation names 'verify with vendor' as an operator step" — web search verifies vendor pricing / regulatory dates); § Output Format (platform-selection memo, pipeline-audit memo, scorecard-audit memo, D&I funnel report, take-home ethics review — all written) |
| workforce-planning | File read/write, Python/shell execution | web search | `custom/workforce-planning/SKILL.md` § Python Utility ("Use `scripts/workforce_calculator.py` for the quantitative parts of steps 3–5"); § Output Format (workforce plan memo, org-design memo, FTE/span forecast table, cost validation request, governance approval request). Optional web search verifies public HR-analytics benchmarks cited in References |
| payroll-and-eor | File read/write, web search | — | `custom/payroll-and-eor/SKILL.md` § Principles rule 5 ("Every recommendation names 'verify with vendor'"); § Principles rule 7 ("Time-sensitive regulatory alerts surface proactively" — requires date verification via web); § Output Format (platform recommendation memo, classification worksheet, EOR-vs-entity decision memo, benefits recommendation memo, Carta-handoff timing memo, compliance audit checklist, migration plan — all written) |

## Cross-Cutting Requirements

Requirements that apply across all of hire's skills (not per-skill):

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every hire output routes through verification before shipping — that skill reads the drafted output |
| File write | Prime Directive + every skill's Output Format | Every skill produces a written artifact |
| Second model | Not required by any hire skill today | Reserved for future use (e.g., if `interview-prep` gains a "review this candidate's take-home with a second-opinion pass"). Currently no hire skill invokes a second model |

## Not Required (explicit)

Capabilities hire's skills DO NOT need. Called out explicitly so the runtime configurator
does not over-grant.

| Not required | Rationale |
|---|---|
| Direct ATS platform API access | `ats-selection` § When to Use "Do NOT use for" — hire produces the decision and audit, not the click-through configuration; ATS admin actions route to operator per `operational/agent/hire-config.md` § Tool Permissions |
| Direct payroll platform API access | Same reason — `payroll-and-eor` § When to Use "Do NOT use for" — hire produces the classification and platform recommendation, not the setup |
| Individual employee performance-data read | `workforce-planning` Principle 5 — role/function-level only, not individual-level |
| Individual candidate demographic-data read | `ats-selection` § Topic D — aggregate D&I only; per-candidate demographic data is a hard halt |
| Second model | No hire skill invokes one today |
| Write access to marketplace skills | §4.8 — marketplace skills are verbatim; frontmatter-only additions were made at build time; no runtime write required |
| Write access to `Teams/Engineering/SECURITY-CHARTER.md` | Charter is operator-amended only per Prime Directive |
| Access to any other agent's `custom/` or `operational/` folders | Cross-agent editing is out of scope; if hire's work requires updating another agent's file, that's an operator-mediated cross-department action, not a runtime capability |

## Compile Behavior

Per §14.4:

- Every row's `Required` and `Optional` cells use only the recognized phrase set. If a
  future edit puts an unrecognized phrase in either cell, the compiler treats it as
  `FILL_IN` and the affected skill ships without its tools until the phrase is fixed.
- The `Skill` column matches each skill's directory name exactly (a parenthetical
  suffix would be tolerated but none is used here).
- This file's structure is universal across every agent's `tool/<agent>-tool-requirements.md`
  per §7; the specific requirements per row are hire-unique.

## Audit Notes

- **Last audit:** 2026-07-29 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`, `## Python Utility`,
  or `## Principles` sections. A new capability introduced in a skill without updating this
  table is a §14.4 compile drift.
- **Non-leader P&C agents** (maslow, grove, merit) will each get their own tool file with the
  same structure and the same disclaimer. Requirements will be derived from THEIR skills'
  Output Format sections, not copied from this file.

## Governance Cross-Reference

The governance-layer companion to this file:
`operational/agent/hire-config.md` § 6 Tool Permissions.

That file decides which of the above hire is ALLOWED to use at runtime, in what scope, with
what deny list. This file only says what hire NEEDS in order to function.

Both files remain in sync by construction — a technical requirement here that governance
denies is a design conflict to resolve, not silently tolerated.
