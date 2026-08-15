# YVON Agentic OS — Session Handoff (2026-07-31)

**Purpose:** Resume the 6-department agent build in a new chat with full context.
Read this first before continuing.

---

## Project Overview

Building 6 departments assigned to Amit in the YVON Agentic OS. Each department
follows the AGENT-BUILD-PLAYBOOK.md §12 sequence:

> scaffold → skill list discussion → marketplace-first sort (§4.1) → build
> skills one at a time → identity (leader only) → operational layer → logical
> placeholder → agent.md → compile-clean pass

**Root repo:** `/Users/amitchoudhary/StudioProjects/YVON-Agentic-OS-/`
**Routing table:** `CLAUDE.md` (updated LIVE per agent as built)
**Playbook:** `Teams/AGENT-BUILD-PLAYBOOK.md`

---

## Where We Stopped (2026-07-31)

**Current position:** Risk & ESG department is 60% complete.

**Just shipped:**
- prism (ESG Reporting) — 4 skills complete
- Task #34 is `in_progress` (prism build)

**Immediately next:** prism closeout batch (8 files) + shield 4 skills

---

## What's Been Built — 5 Full Departments + prism skills

### Fleet Totals

| Metric | Count |
|---|---|
| Departments complete | 5 of 6 |
| Agents live | 21 of 24 |
| Skills built | 84 of 96 |
| Scripts | 9 |
| LOAD-BEARING REFUSALS | ~113 |

### Department 1: People & Culture ✅

**Files at:** `Teams/People & Culture/`

| Agent | Role | Skills | Scripts | LB REFUSALS | Identity |
|---|---|---|---|---|---|
| hire | Lead — Talent Acquisition | 5 | 1 (`workforce_calculator.py`) | 0 | Patty McCord (Netflix ex-CHRO) |
| maslow | Motivation | 4 | 2 | 1 | — |
| grove | Learning & Dev | 4 | 3 | 2 | — |
| merit | Performance Mgmt | 4 | 2 | 4 + 4 fabrication | — |

Also built: `Shared OS/skills/people-analytics-metrics/` + dept README + WORKFLOW.

### Department 2: Comms & PR ✅

**Files at:** `Teams/Comms & PR/`

| Agent | Role | Skills | Scripts | LB REFUSALS | Identity |
|---|---|---|---|---|---|
| herald | Lead — PR & Media | 4 | 1 (`pr_analytics.py` with `ave_refuse()`) | 9 | David Meerman Scott (2020) |
| signal | Internal Comms | 3 | 0 | 9 | — |
| beacon | Investor Comms | 3 | 0 | 9 | — |

**Distinctive:** All 3 tied at 9 LOAD-BEARING REFUSALS. AVE-refusal enforced at
code level (`herald/custom/pr-analytics/scripts/pr_analytics.py`).

### Department 3: Global Expansion ✅

**Files at:** `Teams/Global Expansion/`

| Agent | Role | Skills | Scripts | LB REFUSALS | Identity |
|---|---|---|---|---|---|
| compass | Lead — Market Selection & Entry | 4 | 0 | **11** ← fleet high | Pankaj Ghemawat (IESE / NYU Stern) |
| canopy | Regulatory & Compliance | 4 | 0 | 9 | — |
| lingua | Localization | 4 | 0 | 5 | — |
| frontier | Cross-border Ops | 4 | 0 | 9 | — |

**Distinctive:** Highest-density department. compass = individual-agent fleet-
high at 11.

### Department 4: Client Success (NET-NEW) ✅

**Files at:** `Teams/Client Success/`

| Agent | Role | Skills | Scripts | LB REFUSALS | Identity |
|---|---|---|---|---|---|
| ally | Lead — CS Strategy | 4 | 0 | 6 | Nick Mehta (Gainsight CEO) |
| kickoff | Onboarding | 4 | 0 | 2 | — |
| retain | Success/Retention/Expansion | 4 | 0 | 4 | — |
| keel | Support Ops | 4 | 0 | 3 | — |

**Distinctive:** Mehta 2016 grounds all 16 skills (16× §8.9 use — highest
single-source cross-agent use in fleet).

### Department 5: Growth & Partnerships ✅

**Files at:** `Teams/Growth & Partnerships/`

| Agent | Role | Skills | Scripts | LB REFUSALS | Identity |
|---|---|---|---|---|---|
| quest | Lead — Growth Strategy | 4 | 0 | 6 | Mark Roberge (HubSpot ex-CRO, HBS) |
| closer | Sales / BD | 4 | 0 | 5 | — |
| lure | Marketing / Demand-Gen | 4 | 0 | 7 | — |
| bond | Partnerships | 4 | 0 | 4 | — |

**Distinctive:** Roberge-flavored data-cited discipline mirrors Mehta on
growth side (parallel to ally on CS side).

### Department 6: Risk & ESG (IN PROGRESS)

**Files at:** `Teams/Risk & ESG/`

| Agent | Role | Skills | Scripts | LB REFUSALS | Identity | Status |
|---|---|---|---|---|---|---|
| pilot | Lead — Risk Strategy | 4 | 0 | 4 | Nassim Nicholas Taleb (NYU / Universa) | ✅ LIVE |
| hazard | Enterprise Risk (ERM) | 4 | 0 | 4 | — | ✅ LIVE |
| prism | ESG Reporting | 4 | 0 | 4 (planned) | — | ⏳ Skills done, closeout pending |
| shield | Operational Resilience | 4 planned | 0 | 4 planned | — | ⏳ Not started |

---

## What's Left

### 1. prism closeout batch (8 files)

**Path:** `Teams/Risk & ESG/prism/`

Files to create:
- `operational/skill/prism-skill-routing.md`
- `operational/agent/prism-config.md` — governance § 10 with **4 LOAD-BEARING REFUSALS**:
  1. Materiality without double-materiality assessment
  2. Fabricated emissions data / Scope 3 without cited methodology
  3. Individual employee data in social reporting (Universal Principle 2 execution)
  4. Governance disclosure without counsel review
- `operational/principles/prism-principles.md` (Universal-only + Taleb-flavored inherited at coordination surfaces)
- `operational/commands/prism-commands.md`
- `operational/tool/prism-tool-requirements.md`
- `logical/README.md` (§8.1 Touch-1 placeholder for 4 future Shared OS/logical/ assets)
- `agent.md` (canonical identity + 4 skills + 4 LB refusals)
- CLAUDE.md update — prism row from PENDING → LIVE (line matches pattern of prior entries)

**Skills already shipped in prism/custom/:**
- `esg-materiality-assessment/SKILL.md`
- `carbon-accounting-and-reporting/SKILL.md`
- `social-impact-metrics/SKILL.md`
- `governance-disclosure/SKILL.md`

### 2. shield full build (12 files: 4 skills + 8 closeout)

**Path:** `Teams/Risk & ESG/shield/`

**Planned 4 skills (all custom Route D, §4.6 reclass expected):**

1. **`business-continuity-planning`** — ISO 22301 + ISO 22317 + practitioner. LOAD-BEARING: BCP without tested exercise.
2. **`disaster-recovery-planning`** — NIST 800-34 + practitioner. LOAD-BEARING: DR without RTO/RPO cited from business requirements.
3. **`third-party-risk-management`** — SIG (Standardized Information Gathering) + ISO 27036 + practitioner. LOAD-BEARING: third-party engagement without security + compliance review.
4. **`operational-resilience-testing`** — Bank of England / FCA operational resilience regulations + practitioner. LOAD-BEARING: important-business-service identification without operational-impact-tolerance definition.

**Expected 4 LOAD-BEARING REFUSALS.**

Then shield closeout batch (8 files) matching non-leader pattern.

### 3. Risk & ESG dept closeout (2 files)

- `Teams/Risk & ESG/README.md` — dept overview matching Client Success / G&P pattern. Highlights: 4 agents / 16 skills / 0 scripts / ~16 LOAD-BEARING REFUSALS total. Taleb identity anchor. Fat-tail-first discipline + skin-in-the-game + antifragile framing.
- `Teams/Risk & ESG/DEPARTMENT-WORKFLOW.md` — pilot-led sequencing patterns covering: (a) annual risk cycle (identification → quantification → treatment → monitoring → committee reporting); (b) crisis scenario planning + tabletop; (c) ESG reporting cycle (materiality → carbon + social + governance → third-party assurance → publication); (d) operational resilience event (BCP activation → DR + third-party coordination → resilience testing follow-through); (e) material risk investor comms (pilot + hazard + beacon coordination via Reg FD).

### 4. Final Verification (Task #7 in list)

- Compile-clean pass across all 24 agent.md files
- CLAUDE.md routing table verification — every agent has LIVE row with clear scope
- Fleet-wide summary: 24 agents / 96 skills / 9 scripts / ~120 LOAD-BEARING REFUSALS
- Cross-agent §8.9 tracker consolidated
- Optionally: `node cli/yvon.js doctor` and `node cli/yvon.js agents` if tooling exists

---

## Established Patterns — DO NOT DEVIATE

### Playbook Rules (senior to speed)

1. **§0.1 Present before building** — announce what/why/how, wait for approval. User says "go" per artifact.
2. **§0.2 One artifact at a time** — hard stop after each unless user batches.
3. **§0.3 Announce scope** — say which agent/department.
4. **§0.4 Genericize** — no hardcoded venture names.
5. **§0.5 No fabrication** — cite sources or use `<FILL_IN>` for operator input.
6. **§0.6 Triple-counter verify** — source + logic + consistency (silent).
7. **§4.1 Marketplace-first search** — WebSearch mcpmarket before building custom.
8. **§4.6 Reclass path** — marketplace scope-mismatch OR unknown-credibility → custom Route D.
9. **§4.8 Marketplace verbatim rule** — Anthropic-official skills use verbatim if scope-match.
10. **§6.1 Leader-only identity** — only Lead agents get identity anchors.
11. **§6.2a Real-person anchor** — verifiable, still-active person with public sources.
12. **§7 Operational layer** — 5 files per agent: skill-routing / config / principles / commands / tool-requirements.
13. **§8.1 Touch-1 logical placeholder** — future Shared OS/logical/ Route-D asset plan.
14. **§8.9 Extract-once-use-twice** — cross-agent source-sharing tracking.
15. **§13.1 Shared OS inherited-not-owned** — dept-level principles inherit up.
16. **§14.2 exact-heading compiler contract** — agent.md section headings verbatim.
17. **§14.4 fixed table format** for tool/*-tool-requirements.md.

### Skill File Structure (§11 + §14.2)

Every SKILL.md has:
- Front-matter (name, type, status, sources_referenced, fulfills_catalog_entry, reclassification_notes, assigned_agent, portable, date_added, tier, description, triggers)
- Introduction
- Purpose (6-7 failure modes prevented)
- When to Use (triggers + explicit "Do NOT use for")
- Structure / Protocol (framework + operational sequence)
- Instructions (per-phase)
- Output Format
- Principles (numbered — includes LOAD-BEARING flags + inherited Universal Principles)
- Fallback
- Boundaries with Other Skills (table)
- References (public/verifiable URLs)

### Universal Principles (inherited by every agent)

1. No fabrication (§0.5)
2. Aggregate-only at publication surface (HARD BOUNDARY per skill for individual identifiable data)
3. Individual crisis HARD BOUNDARY (manager + HR Ops + EAP)
4. Segmented-below-min-group suppression
5. Legal fence (counsel-scoping for legal-adjacent decisions)
6. Single-designated-spokesperson
7. No corporate euphemism (McCord discipline inherited from Comms & PR)
8. No silent contradiction with prior artifacts
9. Close-loop discipline
10. Verification-before-completion

### Identity-Flavored Variants (Lead-only per §7)

Leaders carry their identity anchor's disciplines as principle-level variants
at the leader agent (not inherited by non-leader siblings' own principle files
— only at coordination surfaces).

Established identity-flavored principle sets:
- Patty McCord (hire): honest WHY / no fluff / high-performer discipline
- David Meerman Scott (herald): real-time PR / newsjacking-with-taste / no-fabrication
- Pankaj Ghemawat (compass): distance-still-matters / evidence-grounded / semi-globalization / regional-over-global / skeptical-of-consulting-hype
- Nick Mehta (ally): data-cited-not-vibes / customer-outcome-focused / no-vanity-metrics / community-oriented / expansion-when-earned / skeptical-of-CS-fluff
- Mark Roberge (quest): repeatable-formula > heroic-selling / data-cited / stage-appropriate / coachable > charismatic / revenue-machine / skeptical-of-growth-fluff
- Nassim Nicholas Taleb (pilot): fat-tail-first / skeptical-of-Gaussian / fragility-antifragility framing / skin-in-the-game / convex-options / skeptical-of-risk-fluff

### Closeout Batch Patterns

**Non-leader agent closeout = 8 files:**
- 5 operational files (skill-routing / config / principles / commands / tool-requirements)
- logical/README.md
- agent.md
- CLAUDE.md row update (PENDING → LIVE)

**Leader agent closeout = 9 files:**
- Above 8 files
- Plus identity/README.md

**Department closeout = 2 files:**
- README.md (dept overview + agent roster + scope splits + dept-specific principles + cross-department coordination)
- DEPARTMENT-WORKFLOW.md (Lead-led sequencing patterns 4-6 patterns typical)

### Marketplace Search Pattern (§4.1)

Always run WebSearch first:
```
WebSearch query: "mcpmarket claude skill [specific topic] [key sources]"
```

Result typically:
- Community-publisher tools (unknown credibility) → §4.6 reclass to custom Route D
- Anthropic-official skill match → §4.8 verbatim use
- Scope-mismatch bundle → §4.6 reclass

Note candidate marketplace skills as complementary tactical-execution tools
in the reclass note.

### Cross-Department Coordination Universals

Every non-leader skill's Boundaries table has:
- Cross-agent (within same department siblings)
- Cross-department (specific agents in other departments)
- **Manager + HR Ops + EAP** for individual mental-health signal (HARD BOUNDARY per Universal Principle 3)
- **Shared OS: verification-before-completion** cross-cutting

Every leader skill has same + upstream escalation (marcus / vista / operator / board / counsel).

---

## §8.9 Extract-Once-Use-Twice Fleet Tracker

Key cross-agent source uses (informs future Shared OS/logical/ asset placement):

| Source | Uses | Departments |
|---|---|---|
| **Mehta 2016** | 16× | Client Success (all 16 skills) |
| **Ghemawat corpus (2001/2007/2011)** | 8× | Global Expansion (compass 4 + coordination) |
| **Baker McKenzie corpus** | 4× | Global Expansion (canopy 2 + lingua 1) + coordination |
| **Roberge 2015** | 6× | Growth & Partnerships (quest 2 + closer 2 + lure 2) |
| **Winning by Design** | 6× | kickoff + retain 2 + closer + bond 2 (highest utility source) |
| **Fisher & Ury 2011** | 4× | kickoff MSP + retain renewal + closer deal + coordination |
| **Miller Heiman** | 3× | ally QBR + kickoff MSP + lure ABM |
| **Meyer 2014** | 3× | compass GTM + lingua marketing + lingua cultural |
| **Taleb corpus** | 4× | pilot (all 4 skills) |
| **Lam ERM** | 6× | pilot 2 + hazard 4 |
| **COSO ERM/IC** | 6× | pilot 2 + hazard 4 |
| **Fink 1986 Crisis Comms** | 2× cross-department | beacon crisis-comms + pilot crisis-scenario |
| **Bush 2019 PLG** | 4× | kickoff TTFV + quest 2 + coordination |

---

## Naming Conventions & Fleet Roster (all 24 agents)

**Existing baseline agents** (not in Amit's scope, do not conflict):
marcus, vista, echo, board, precedent, sentinel, dev, mia, raj, nova, quinn,
ops, dana, aegis, cypher, axiom, rank, warden, keyring, bastion, cortex, veil,
spec, metric, ux, loom, price, meta, relay, gauge, anneal, forge, scout,
proto, edge, spark, atlas, lena, weave, muse, pixel, pulse, rio, nate, kai, tempo.

**Amit's 24 built agents:**

| Dept | Agent | Role |
|---|---|---|
| P&C | hire | Lead — Talent Acquisition |
| P&C | maslow | Motivation |
| P&C | grove | Learning & Dev |
| P&C | merit | Performance Mgmt |
| Comms & PR | herald | Lead — PR & Media |
| Comms & PR | signal | Internal Comms |
| Comms & PR | beacon | Investor Comms |
| Global Expansion | compass | Lead — Market Selection & Entry |
| Global Expansion | canopy | Regulatory & Compliance |
| Global Expansion | lingua | Localization |
| Global Expansion | frontier | Cross-border Ops |
| Client Success | ally | Lead — CS Strategy |
| Client Success | kickoff | Onboarding |
| Client Success | retain | Success/Retention/Expansion |
| Client Success | keel | Support Ops |
| Growth & Partnerships | quest | Lead — Growth Strategy |
| Growth & Partnerships | closer | Sales / BD |
| Growth & Partnerships | lure | Marketing / Demand-Gen |
| Growth & Partnerships | bond | Partnerships |
| Risk & ESG | pilot | Lead — Risk Strategy |
| Risk & ESG | hazard | Enterprise Risk |
| Risk & ESG | prism | ESG Reporting (skills done, closeout pending) |
| Risk & ESG | shield | Operational Resilience (not started) |

---

## Task List State

Task list at last update:

- #1-#5 [completed] All 5 departments
- #6 [in_progress] Build Risk & ESG department
- #7 [pending] Verify all 6 departments
- #8-#31 [completed] All P&C + Comms & PR + Global Expansion + Client Success + Growth & Partnerships subtasks
- #32 [completed] pilot
- #33 [completed] hazard
- #34 [in_progress] prism (skills done, closeout pending)
- #35 [pending] shield
- #36 [pending] Risk & ESG dept README + WORKFLOW

---

## How to Resume in New Session

**Prompt to paste into new chat:**

> I'm resuming a YVON Agentic OS build. Read the handoff document at
> `/Users/amitchoudhary/StudioProjects/YVON-Agentic-OS-/SESSION-HANDOFF.md`
> first for full context. We're mid-way through Risk & ESG department. prism
> agent skills are done but closeout batch is pending (8 files). Then shield
> full build (4 skills + 8 closeout). Then Risk & ESG dept README +
> DEPARTMENT-WORKFLOW. Then final verification.
>
> Continue from where we left off. Say "presenting prism closeout" and ship
> the 8 files, then present shield skill 1 for approval per §0.1 discipline.

**Alternative — if user wants stricter re-approval per §0.2:**

> Same as above, but stop at each per-agent step for explicit "go" approval
> rather than batching skills.

---

## Files to Read for Deeper Context

1. `Teams/AGENT-BUILD-PLAYBOOK.md` — ground rules
2. `CLAUDE.md` — current routing table (21 agents LIVE)
3. `Teams/Risk & ESG/pilot/agent.md` — most recent leader agent pattern
4. `Teams/Growth & Partnerships/bond/agent.md` — most recent non-leader agent pattern
5. `Teams/Client Success/DEPARTMENT-WORKFLOW.md` — recent dept workflow example
6. Any prism SKILL.md in `Teams/Risk & ESG/prism/custom/` — most recent skill patterns

---

## Confidence Notes

- **Zero scripts across all 5 completed non-P&C departments.** P&C has 8 scripts total; every other agent runs Route D (cited rubrics).
- **§4.6 reclass is default pattern** — nearly every marketplace search resulted in reclass to custom Route D. Community-publisher tools noted as complementary but not scope-matches.
- **Anthropic-official skills encountered rarely** and typically had scope mismatches (e.g., claude-for-legal entity-compliance noted as complementary in canopy `entity-setup-by-jurisdiction`).
- **Real-person identity anchors used** for all 6 department Leads. Verifiable and still-active practitioners preferred over dead academics.

---

## Final Verification Scope (Task #7)

When Risk & ESG completes, run:
1. Read every agent.md — verify §14.2 exact-heading contract
2. Read CLAUDE.md — verify 24 rows all LIVE
3. Cross-check §8.9 tracker consistency across `logical/README.md` files
4. Verify no `PENDING` placeholders remain in routing
5. Optionally spawn Explore subagent for cross-agent skill-name uniqueness check

---

**Session end: 2026-07-31.** Ready to resume from prism closeout batch.
