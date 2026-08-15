<!--
Operational: tool-requirements file for beacon (Comms & PR / Investor Comms)
per §7 tool/.

§7 rules for this file:
1. Technical requirements only — derived from what's written in each skill file.
2. Governance layer (which capabilities beacon is ALLOWED to use at runtime) lives in
   operational/agent/beacon-config.md § 10 Tool Permissions, NOT here.
3. This file MUST state explicitly, near the top, that it specifies needs and does NOT
   grant them. That disclaimer is not optional (§7 rule).
4. Fixed table format per §14.4: | Skill | Required | Optional | Source line |
5. Recognized phrases only: "File read" / "File write" / "File read/write" /
   "Python/shell execution" / "web search" / "second model".
-->

# beacon — Tool Requirements

> **This file specifies needs; it does NOT grant them.**
>
> Listing "web search" in the table below does not give beacon that capability at
> runtime. Actual tool / file / execution access is a separate runtime-configuration
> step — set up wherever beacon is deployed (the platform's own permission system, the
> operator's runtime configuration, or manual process).
>
> This table is the **checklist for whoever does that configuration**. Governance-layer
> decisions about which of these beacon is ALLOWED to use, in what scope, with what deny
> list, live in `operational/agent/beacon-config.md § 10 Tool Permissions` — not here.
>
> **This disclaimer is per §7 rule for tool/ files. It is not optional or implied.**

## Required and Optional Tools per Skill

Format per §14.4. Only the recognized phrase set is used.

| Skill | Required | Optional | Source line |
|---|---|---|---|
| crisis-comms | File read/write | web search | `custom/crisis-comms/SKILL.md` § Output Format (first holding statement, SCCT-attribution diagnosis, stakeholder-sequencing plan, single-spokesperson designation, correction/retraction plan, sustained-cadence schedule, resolution declaration, post-crisis retrospective — all written; prior crisis-plans + prior public statements + coverage — read). Optional web search verifies Fink / Coombs SCCT / Smith / PRSA / Barcelona citations + coverage-correction verification. |
| investor-cadence | File read/write | web search | `custom/investor-cadence/SKILL.md` § Output Format (quarterly letter, quarterly call prepared remarks, monthly investor note, material-info alert, investor Q&A prep pack, close-loop tracker entry, annual IR-cadence audit — all written; prior investor letters + operating/financial data + investor-roster + prior commitments — read). Optional web search verifies Buffett / Larcker & Tayan / NIRI / SEC Reg FD citations + material-info public-disclosure verification. |
| data-room-discipline | File read/write | web search | `custom/data-room-discipline/SKILL.md` § Output Format (architecture setup plan, versioning-audit report, access-control grant/revoke decision, material-info tagging decision, evidence-backing link audit, data-room audit report — all written; data-room contents + change-logs + access-control matrix + material-info register + cadence outputs for backing verification — read). Optional web search verifies Feld & Mendelson / Berkus / NVCA / AICPA / SEC EDGAR citations. |

## Cross-Cutting Requirements

Requirements that apply across all of beacon's 3 skills (not per-skill):

| Requirement | Source | Notes |
|---|---|---|
| File read | Shared OS: verification-before-completion | Every beacon output routes through verification before shipping |
| File write | Prime Directive + every skill's Output Format | Every skill produces a written artifact |
| Web search | Optional for all 3 beacon skills | Used to verify framework citations + material-info public-disclosure verification + coverage-correction verification |
| Python/shell execution | Not required by any beacon skill | beacon has NO scripts (all 3 skills Route D — cited rubrics + templates); matches signal's 0-scripts posture |
| Second model | Not required by any beacon skill today | Reserved for future use |

## Not Required (explicit)

Capabilities beacon's skills DO NOT need. Called out explicitly so the runtime
configurator does not over-grant. **Includes 9 LOAD-BEARING REFUSALS** enforcing
beacon's Universal Principles — ties beacon with herald + signal at 9 (Comms & PR
department all three agents tied at 9).

| Not required | Rationale |
|---|---|
| **Selective disclosure of material info to any investor subset without simultaneous public release** | **LOAD-BEARING REFUSAL** — `investor-cadence` Principle 1 + Universal Principle 5. Reg FD violation for public companies; trust damage at any stage; non-negotiable legal fence. Route to operator + CFO + securities counsel BEFORE any selective disclosure. |
| **Fabricate / speculate forward guidance in investor-facing artifacts** | **LOAD-BEARING REFUSAL** — `investor-cadence` Principle 3 + Universal Principle 1 (§0.5). Aspirational projections without operating-plan backing = securities-fraud exposure. "We don't know" is stronger than a guess. Guidance must be defensible + counsel-reviewed. |
| **Ship investor-facing content with corporate euphemism during bad-news event** | **LOAD-BEARING REFUSAL** — `investor-cadence` Principle 4 + Universal Principle 7. Buffett-discipline + McCord discipline inherited via herald + signal. Euphemism erodes trust faster than the underlying news. |
| **Publish silent contradiction with prior investor letter** | **LOAD-BEARING REFUSAL** — `investor-cadence` Principle 5 + Universal Principle 8. Explicit "Update from [prior letter]: previously said X, now Y because Z" format required. Long-tenured investors track prior letters. |
| **Deviate from single-designated-spokesperson during crisis** | **LOAD-BEARING REFUSAL** — `crisis-comms` Principle 5 + Universal Principle 6 (inherited via herald `media-training`). Multiple voices produce contradictions; contradictions amplify. HOLD if designated unavailable. |
| **Match wrong SCCT response strategy to crisis-attribution type** | **LOAD-BEARING REFUSAL** — `crisis-comms` Principle 2. Coombs research: wrong-match measurably worsens reputation + legal exposure. Default to more-responsible strategy when attribution unclear. |
| **Ship data-room with shadow-version drift; silent deletion / edit of prior versions** | **LOAD-BEARING REFUSAL** — `data-room-discipline` Principle 1 + 4. DD contradiction risk; trust damage + potential fraud allegation. Audit-trail preservation via `_change_log.md`. Superseded versions ARCHIVED not deleted. |
| **Broaden data-room access without corresponding DD-stage advancement + operator/counsel sign-off** | **LOAD-BEARING REFUSAL** — `data-room-discipline` Principle 3. Leaks strategic info; puts negotiation leverage at risk. Access grows narrower → broader across DD stages (initial → active → closing). |
| **Surface PII in data-room documents without redaction + Cybersecurity coordination** | **LOAD-BEARING REFUSAL** — `data-room-discipline` Principle 8. Data-protection compliance violation; requires warden/veil/bastion cross-department coordination + counsel. |
| Python/shell execution | Not required — beacon has NO scripts (all 3 skills Route D); matches signal |
| Second model | No beacon skill invokes one today |
| Write access to marketplace skills | §4.8 — beacon has 0 marketplace skills (all 3 reclassified-to-custom or custom-new); rule preserved for future compliance |
| Write access to `Teams/Engineering/SECURITY-CHARTER.md` | Charter is operator-amended only per Prime Directive |
| Access to any other agent's `custom/` or `operational/` folders | Cross-agent editing out of scope; cross-department action is operator-mediated |
| Direct data-room-platform admin (DocSend / Dropbox / SharePoint / DealRoom / Intralinks / Firmex admin) | Not beacon's scope — beacon produces discipline + content, not platform-admin clicks; route to operator |
| Direct investor-communication-platform admin (email-vendor admin, investor-portal admin) | Same — operator scope |
| Direct securities-filing platform admin (EDGAR filing submission) | securities counsel + operator scope; beacon coordinates content but does NOT submit |
| Individual crisis coaching or counseling | HARD BOUNDARY per Universal Principle 3 — route to manager + HR Ops + EAP |
| Structural design of reorg / headcount decisions | Not Comms & PR scope — routes to `workforce-planning` (hire, P&C Lead) |
| Legal formalization of securities-law obligations, NDA scope, M&A contract terms | Not beacon scope — routes to operator + securities/M&A counsel per Universal Principle 5 legal fence |
| Financial audit workpaper retention scoping (AICPA) | Not beacon scope — routes to CFO + external auditor |
| Individual performance / demographic / comp data publication | HARD BOUNDARY per Universal Principle 2 aggregate-only at publication surface (inherited from P&C precedent); requires operator + counsel + hire sign-off chain |

## Compile Behavior

Per §14.4:

- Every row's `Required` and `Optional` cells use only the recognized phrase set.
- The `Skill` column matches each skill's directory name exactly.
- This file's structure is universal across every agent's `tool/<agent>-tool-requirements.md`
  per §7; the specific requirements per row are beacon-unique.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `## Output Format`, `## Fallback`,
  or `## Principles` sections.
- **Comms & PR tool-file family:** all 3 Comms & PR agents (herald LIVE; signal LIVE;
  beacon — this file, LIVE) now have tool-requirements files with the same universal
  structure. All 3 tied at 9 LOAD-BEARING REFUSALS — highest count in the fleet.

## Governance Cross-Reference

The governance-layer companion to this file:
`operational/agent/beacon-config.md § 10 Tool Permissions`.

That file decides which of the above beacon is ALLOWED to use at runtime, in what scope,
with what deny list — including the 9 LOAD-BEARING REFUSALS enforcing Universal
Principles 1, 2, 5, 6, 7, 8 (inherited Principle 3 crisis + 4 min-group + 9 close-loop
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
| **signal** | 3 | 0 | **9 LOAD-BEARING REFUSALS** (draft-change-comms-without-counsel + skip-Neutral-Zone + corporate-euphemism + silent-contradiction + material-NPI + external-facing-change-comms + individual-perf-data + segmented-below-min-group + fabricate) | Tied for highest in fleet |
| **beacon** (this file) | 3 | 0 | **9 LOAD-BEARING REFUSALS** (selective-disclosure-Reg-FD + fabricate-forward-guidance + corporate-euphemism-investor + silent-contradiction-prior-letter + single-spokesperson-deviation + wrong-SCCT-match + shadow-version-drift + access-broadening-no-DD-stage + PII-no-redaction) | **Tied for highest in fleet with herald + signal.** All 3 Comms & PR agents tied at 9. |

**Comms & PR total: 27 refusals across 3 agents** (herald 9 + signal 9 + beacon 9).
P&C total: 7 refusals across 4 agents (hire 0 + maslow 1 + grove 2 + merit 4).

Rationale: Comms & PR outputs are the org's external + internal voice. Failure modes at
this surface have legal (Reg FD, WARN Act, defamation, protected-class, securities-fraud),
credibility (euphemism, silent contradiction, forced newsjack, blast-pitch, AVE), and
safety (distressed spokesperson, individual-crisis-during-org-crisis) consequences that
compound faster than most surfaces. beacon-specific rationale: investor-facing surface
adds Reg FD + securities-fraud + M&A DD-contradiction exposure on top of the existing
Comms & PR pattern. Structural refusals prevent these failure modes under closing
pressure, quarterly-cadence pressure, or crisis-timing pressure.
