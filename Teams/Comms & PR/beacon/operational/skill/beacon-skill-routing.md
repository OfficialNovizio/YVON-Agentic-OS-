<!--
Operational: skill-routing table for beacon (Comms & PR / Investor Comms)
per §7 skill/. Non-leader agent: Universal-only principles apply, no
identity-flavored routing rules.

§7 rules for this file:
1. Every skill in beacon's roster has a row.
2. Trigger-phrase column mirrors each skill's front-matter `triggers:` list.
3. Conflict-resolution section addresses overlap between skills (which skill wins
   when a trigger phrase could hit more than one skill).
4. Escalation-to-other-agents rows for out-of-scope requests.
-->

# beacon — Skill Routing

> Routing for beacon (Comms & PR / Investor Comms). Non-leader agent — reports up
> to herald (Comms & PR Lead) for department-level sequencing per
> `Teams/Comms & PR/DEPARTMENT-WORKFLOW.md`.

## Skill Roster (3 skills)

| Skill | Type | Route | Sources |
|---|---|---|---|
| `crisis-comms` | custom (reclassified from marketplace per §4.6) | Route D — cited rubric | Fink 2013 + Coombs SCCT + Judy Smith 2012 + PRSA + Barcelona (inherited) |
| `investor-cadence` | custom | Route D — cited rubric | Buffett letters + Larcker & Tayan 2020 + NIRI + SEC Reg FD + Barcelona (inherited) |
| `data-room-discipline` | custom | Route D — cited rubric | Feld & Mendelson 2019 + Berkus + NVCA + AICPA + SEC EDGAR + Reg FD (inherited) |

## Trigger-Phrase Routing

### `crisis-comms`

- we have a crisis
- holding statement for
- correction request
- retraction after coverage
- hostile press moment
- crisis response plan
- stakeholder sequencing
- match response to crisis type
- first 30 minutes crisis
- SCCT

### `investor-cadence`

- quarterly investor letter
- quarterly call preparation
- monthly investor update
- IR cadence
- material info to investors
- Reg FD timing
- investor Q&A prep
- board-adjacent update to shareholders
- close the loop with investors
- selective disclosure

### `data-room-discipline`

- set up data room
- audit our data room
- DD checklist prep
- data-room versioning
- access-control for
- material-info tagging in data room
- prepare for due diligence
- clean up stale documents
- shadow versions
- single source of truth for

## Conflict-Resolution Rules

When a trigger phrase could route to more than one skill, the following rules apply:

| Overlap | Resolution | Rationale |
|---|---|---|
| "material info" — hits `investor-cadence` (Reg FD timing) + `data-room-discipline` (material-info tagging) | Route to `investor-cadence` FIRST for Reg FD disclosure obligation scoping; `data-room-discipline` handles document-side tagging as downstream coordination | Reg FD legal fence is upstream of document classification |
| "Reg FD" — hits `investor-cadence` (Phase 4 material-info trigger) + `data-room-discipline` (Phase 4 material-info tagging) | Route to `investor-cadence` for disclosure-timing decision; `data-room-discipline` updates tags as downstream | Cadence is timing-owner; data-room is tagging-owner |
| "prepare for" + crisis mention (e.g., "prepare for a crisis") | Route to `crisis-comms` Phase 1 (Assess + Assemble + Activate); NOT `data-room-discipline` even though "prepare" appears in DD context | Crisis-context wins over DD-context on prepare-language |
| "correction request" from a reporter covering an investor topic | Route to `crisis-comms` Phase 6 (correction / retraction handling); coordinate with `investor-cadence` if the correction touches material info (Reg FD fence) | Crisis-comms owns the reporter-correction protocol; cadence is coordination-only |
| "board-adjacent update to shareholders" | Route to `investor-cadence` (beacon owns shareholder-facing cadence); coordinate with echo (Executive Office — board prep) per §2 | Clear scope split — beacon owns shareholder-side; echo owns board-side |
| "quarterly [something]" without letter/call context | Ambiguous — request clarification. Quarterly board update = echo. Quarterly investor update = `investor-cadence`. Quarterly data-room audit = `data-room-discipline` Phase 6 | Discovery per §3 before routing |
| "single source of truth for [document]" | Route to `data-room-discipline` (versioning discipline) UNLESS document is a specific cadence artifact (letter template, press-release template) → herald's `press-kit` | Data-room owns backing docs; press-kit owns cadence templates |

## Escalation to Other Agents (out-of-scope)

| If the request involves… | Route to | Rationale |
|---|---|---|
| **Pitch decks + fundraising materials + board decks** | **echo** (Executive Office) | beacon owns cadence + data-room; echo owns pitch materials + board prep per §2 + Comms & PR scaffold |
| Routine PR / press outreach | herald's `media-relations` + `press-kit` + `media-training` (Comms & PR Lead) | Media-relations scope, not beacon's |
| Routine internal comms / decision broadcasts / all-hands | signal's `internal-cadence` (Comms & PR sibling) | Internal-comms scope, not beacon's |
| Change-management comms (planned reorg / layoff / M&A without crisis dimension) | signal's `change-comms` (Comms & PR sibling) | Only if the change escalates to crisis does it route to beacon's `crisis-comms` |
| PR analytics / coverage measurement | herald's `pr-analytics` (Comms & PR Lead) | AVE-refusal enforced at code level in herald's `pr_analytics.ave_refuse()` |
| Legal formalization of securities-law disclosure obligations | operator + securities counsel FIRST | beacon coordinates comms cadence only AFTER counsel scopes disclosure obligation |
| M&A DD legal contracts + NDA scope | operator + securities/M&A counsel | beacon owns data-room discipline; counsel owns contract scope |
| Financial audit workpaper preservation (AICPA scope) | CFO + external auditor | beacon coordinates data-room integration; auditor owns workpaper retention |
| PII redaction + data-protection compliance | warden + veil + bastion (Cybersecurity) | beacon coordinates data-room integration; Cybersecurity owns data-protection posture |
| Structural design of reorg / headcount decisions | hire (P&C Lead) → `workforce-planning` | Not Comms & PR scope |
| Individual mental-health crisis signals | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 inherited |
| Individual performance / demographic / comp data for DD backing | hire (P&C Lead) + operator + counsel | Aggregate-only at publication surface per Universal Principle 2 |
| Governance approval for major crisis-response / investor-comms decisions | board (Governance) | Escalation per Prime Directive |
| Prior-decision precedent tracking for cadence audit | precedent (Governance) | Coordination, not owned by beacon |

## Cross-Comms & PR Coordination

beacon is one of 3 Comms & PR agents. Coordination surfaces:

| Sibling | Coordination surface |
|---|---|
| **herald** (Comms & PR Lead) | Department sequencing per DEPARTMENT-WORKFLOW; herald owns all press-side skills; beacon inherits herald's Barcelona-Principles measurement discipline via `pr_analytics.ave_refuse()` at code level |
| **signal** | Internal-external comms consistency; stakeholder-sequencing rules (affected-employees FIRST per `crisis-comms`); material-info coordination during `change-comms` events (signal routes to beacon for Reg FD fence) |

## Compile Behavior

Per §14.2:

- Trigger phrases in this file match each skill's front-matter `triggers:` list verbatim
- Conflict-resolution rules cover every plausible overlap identified at build time
- Escalation-to-other-agents rows preserve scope discipline per §2 routing table

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's `triggers:` front-matter list.
- **Cross-agent §8.9 note:** trigger-phrase overlap with signal's `change-comms`
  ("change" phrases) intentionally routes THROUGH signal FIRST; only if signal's
  change-comms escalates the event to crisis does it re-route to beacon's
  `crisis-comms`. Same for signal's `internal-cadence` "cadence" phrases — signal
  owns internal, beacon owns investor.
