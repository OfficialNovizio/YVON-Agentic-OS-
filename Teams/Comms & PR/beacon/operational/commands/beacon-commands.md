<!--
Operational: commands file for beacon (Comms & PR / Investor Comms) per §7
commands/. Non-leader agent: invocation patterns + operator-facing commands.
-->

# beacon — Commands

> Invocation patterns for beacon (Comms & PR / Investor Comms). Non-leader —
> report-up chain to herald (Comms & PR Lead).

## Direct Invocations

### `crisis-comms` invocations

| Command pattern | Skill phase | Output |
|---|---|---|
| `beacon: crisis-response for [event]` | Phase 1 — Assess + Assemble + Activate | Crisis-team activation + initial assessment |
| `beacon: holding statement for [event]` | Phase 2 — First holding statement | <100-word holding statement (within 30 min) |
| `beacon: SCCT diagnosis for [event]` | Phase 3 — SCCT-attribution diagnosis | Victim/accidental/preventable classification + matched response strategy |
| `beacon: stakeholder sequence for [event]` | Phase 4 — Stakeholder sequencing | affected → investors → public sequence plan |
| `beacon: designate spokesperson for [crisis]` | Phase 5 — Single-spokesperson delivery | Designation + backup + handoff to herald `media-training` |
| `beacon: correction request from [reporter]` | Phase 6 — Correction / retraction | Reporter-outreach OR public-correction OR legal-escalation plan |
| `beacon: crisis cadence for [event]` | Phase 7 — Sustained cadence | Hourly-to-daily update schedule (acute) or weekly-monthly (chronic) |
| `beacon: crisis retrospective for [event]` | Phase 8 — Resolution + learning | Public resolution declaration + internal retrospective + crisis-plan update |

### `investor-cadence` invocations

| Command pattern | Skill phase | Output |
|---|---|---|
| `beacon: cadence setup` or `beacon: audit our IR cadence` | Phase 1 — Cadence setup | Rhythm confirmation + investor roster + audit findings |
| `beacon: quarterly letter Q[N]` | Phase 2 — Quarterly letter draft | Buffett-discipline letter draft (4-8 pages) counsel-review-ready |
| `beacon: quarterly call prep Q[N]` | Phase 2 — Call prep | Prepared remarks (10-15 min) + anticipated Q&A pack |
| `beacon: monthly investor note` | Phase 3 — Between-quarters | 1-2 page progress-against-commitments update |
| `beacon: reg-fd-check on [proposed disclosure]` | Phase 4 — Material-info trigger detection | Material-info classification + Reg FD compliance verdict |
| `beacon: material-info alert for [event]` | Phase 4 — Material-info trigger | Simultaneous-public-disclosure draft coordinated with operator + CFO + counsel |
| `beacon: close-loop check` | Phase 5 — Close-loop discipline | Close-loop tracker status + next-letter references |
| `beacon: annual IR audit` | Phase 6 — Annual audit | Cadence adherence + close-loop rate + Reg FD near-misses + investor-feedback summary |

### `data-room-discipline` invocations

| Command pattern | Skill phase | Output |
|---|---|---|
| `beacon: set up data room for [round/event]` | Phase 1 — Architecture setup | 10-folder architecture + change-log + access-control matrix baseline + material-info register |
| `beacon: data-room versioning audit` | Phase 2 — Versioning discipline | Shadow-version findings + rename/archive recommendations + change-log updates |
| `beacon: grant access to [investor group] for [scope]` | Phase 3 — Access-control tier management | Tier appropriateness verification + NDA status + material-info fence check + grant log |
| `beacon: revoke access for [party]` | Phase 3 — Access-control | Immediate revoke + verification + log entry |
| `beacon: material-info tag [document]` | Phase 4 — Material-info tagging | [MATERIAL-NPI] / [MATERIAL-PUBLIC] / [NON-MATERIAL] classification + Reg FD fence status |
| `beacon: evidence-backing check for [cadence output]` | Phase 5 — Backing-link maintenance | Claim ↔ backing-link verification for pre-release gate |
| `beacon: data-room audit` | Phase 6 — Periodic audit | Quarterly / pre-DD-event / annual audit findings + remediation plan |
| `beacon: DD checklist prep for [event]` | Phase 6 — Pre-DD-event audit | Full data-room walk-through with DD-checklist alignment + investor-perspective review |

## Coordination Commands (cross-agent)

| Command pattern | Coordinates with | Purpose |
|---|---|---|
| `beacon → herald: crisis-response coverage measurement` | herald's `pr-analytics` | Barcelona-aligned crisis-coverage tracking (AVE-refusal inherited) |
| `beacon → herald: spokesperson prep for [crisis]` | herald's `media-training` | Crisis-spokesperson prep with 3-messages-MAX + ABC bridging + hostile-Q drill adapted for crisis |
| `beacon → herald: holding-statement templates` | herald's `press-kit` | Templates from canonical library for crisis holding statements |
| `beacon → herald: reporter outreach for [correction]` | herald's `media-relations` | Reporter-side coordination for correction requests + hostile press moments |
| `beacon → signal: internal announcement for [material event]` | signal's `internal-cadence` + `change-comms` | Stakeholder-sequencing (affected employees FIRST per crisis-comms Phase 4); material-info coordination back to beacon per Reg FD |
| `beacon → echo: pitch-material consistency check` | echo (Executive Office) | Evidence-consistency between echo's pitch materials + beacon's data-room + investor-cadence artifacts |
| `beacon → hire: individual data for DD backing` | hire (P&C Lead) + operator + counsel | Aggregate-only surface; individual-identifiable data requires sign-off chain per Universal Principle 2 |
| `beacon → warden: PII redaction for data-room document` | warden + veil + bastion (Cybersecurity) | Data-protection compliance coordination |
| `beacon → board: governance approval for [major decision]` | board (Governance) | Escalation for major crisis-response / investor-comms / DD decisions |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal detected | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 — overrides all timing pressure |
| Reg FD compliance uncertainty | operator + CFO + securities counsel | LOAD-BEARING legal fence per `investor-cadence` Principle 1 |
| Forward-guidance defensibility uncertainty | operator + CFO + securities counsel | Securities-fraud exposure risk per `investor-cadence` Principle 3 |
| M&A DD contract / NDA scope question | operator + securities/M&A counsel | Legal scope, not beacon |
| Employment-law dimension of crisis / DD | operator + employment counsel | Legal scope, not beacon |
| Defamation-review need (reporter refuses correction + continues inaccurate framing) | operator + defamation counsel | Legal scope, not beacon |
| Financial audit workpaper retention question | CFO + external auditor | AICPA scope, not beacon |
| PII in data-room without redaction | warden + veil + bastion + operator + counsel | Data-protection compliance, cross-department |
| Individual perf / demographic / comp data request for DD | hire (P&C Lead) + operator + counsel | Aggregate-only per Universal Principle 2 |
| Structural reorg / headcount decision underlying crisis or DD | hire → `workforce-planning` | Not Comms & PR scope |
| Departmental sequencing question spanning multiple Comms & PR agents | herald (Comms & PR Lead) | Report-up chain |

## Not Available (explicit)

Commands beacon does NOT accept — routed elsewhere:

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `beacon: pitch deck` | echo (Executive Office) | Scope split — echo owns pitch materials + board prep |
| `beacon: board deck` | echo (Executive Office) | Same |
| `beacon: press pitch` | herald's `media-relations` | Media-relations scope |
| `beacon: press release` | herald's `press-kit` | Press-kit scope (though beacon coordinates for material-info alerts) |
| `beacon: PR analytics report` | herald's `pr-analytics` | PR-analytics scope; AVE-refusal at code level |
| `beacon: all-hands agenda` | signal's `internal-cadence` | Internal-comms scope |
| `beacon: decision broadcast` | signal's `internal-cadence` | Internal-comms scope |
| `beacon: layoff announcement` | signal's `change-comms` | Internal-facing; only if leaks + escalates to crisis does it route to beacon's `crisis-comms` |
| `beacon: hire someone` | hire (P&C Lead) | Cross-department |
| `beacon: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| `beacon: submit 8-K filing` | securities counsel + operator | Filing-submission is counsel + operator scope; beacon coordinates content |
| `beacon: data-room platform admin` | operator | Platform-admin is operator scope; beacon owns discipline |

## Compile Behavior

Per §14.2:

- Every command pattern matches an in-skill phase or coordination surface
- Coordination commands preserve scope discipline per §2 routing + Comms & PR
  DEPARTMENT-WORKFLOW
- Escalation commands cover the LOAD-BEARING REFUSAL surface + HARD BOUNDARY
  categories
- Not-available commands prevent scope creep at invocation surface

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's phases, any change to
  cross-agent coordination model in `operational/skill/beacon-skill-routing.md`,
  or any change to LOAD-BEARING REFUSAL list in `operational/agent/beacon-config.md
  § 10`.
