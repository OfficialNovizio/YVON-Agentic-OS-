# YVON Engine — Session Rail (READ FIRST, EVERY SESSION)

This repository is an agent operating system. You are never "just coding" here — every task
routes through an agent, its skills, and the pipeline below. Building anything without
following this rail is a process violation, not a shortcut.

---

## 1. Prime Directive

For EVERY request to do something (build, research, design, restructure, integrate — anything
except a direct factual question):

```
CLASSIFY the task
  → ROUTE to the owning agent (table in §2)
  → LOAD  Teams/<Dept>/<agent>/agent.md + operational/skill/<agent>-skill-routing.md
  → DISCOVER (§3) — questions, directions, sources. WAIT for sign-off.
  → RETRIEVE context through the RAG pipeline (§4)
  → BUILD one artifact at a time (§3), from the agent's skills and config
  → VERIFY (§5) before claiming done
```

Never skip DISCOVER. Never batch artifacts. Never invent values
(`docs/AGENT-BUILD-PLAYBOOK.md` §0.5 — ask, or leave an explicit `<FILL_IN>`).

---

## 2. Routing Table — task → agent

| If the task involves… | Agent | Definition |
|---|---|---|
| Strategy, vision, roadmap | marcus / vista | `Teams/Executive Office/` |
| Investor / external comms | echo | `Teams/Executive Office/echo/agent.md` |
| Fiduciary oversight, precedent, audit | board / precedent / sentinel | `Teams/Governance/` |
| Architecture, code review, eng leadership | dev | `Teams/Engineering/dev/agent.md` |
| **Dashboards, web UI, frontend** | **mia** | `Teams/Engineering/mia/agent.md` |
| Backend, APIs | raj | `Teams/Engineering/raj/agent.md` |
| Mobile | nova | `Teams/Engineering/nova/agent.md` |
| QA, browser verification, release gate | quinn | `Teams/Engineering/quinn/agent.md` |
| DevOps, infra | ops | `Teams/Engineering/ops/agent.md` |
| Data | dana | `Teams/Engineering/dana/agent.md` |
| App security / eng security | aegis / cypher / axiom | `Teams/Engineering/` |
| SEO | rank | `Teams/Engineering/rank/agent.md` |
| GRC, IAM, infra sec, detection, data protection | warden / keyring / bastion / cortex / veil | `Teams/Cybersecurity/` |
| PRD, analytics, research, validation, pricing | spec / metric / ux / loom / price | `Teams/Product/` |
| Fleet governance, integrations, quality, benchmarks | meta / relay / gauge / anneal / forge / scout / proto / edge | `Teams/AI & Agents/` |
| Creative direction | spark | `Teams/Brand Studio/spark/agent.md` |
| Brand system, design tokens source | atlas | `Teams/Brand Studio/atlas/agent.md` |
| Copy / storytelling / ideation | lena / weave / muse | `Teams/Brand Studio/` |
| Visual design | pixel | `Teams/Brand Studio/pixel/agent.md` |
| Social, ads, growth, analytics, audio | pulse / rio / nate / kai / tempo | `Teams/Brand Studio/` |
| **Hiring, ATS, pipeline, workforce planning, payroll, EOR, worker classification** | **hire** (Lead) | `Teams/People & Culture/hire/agent.md` |
| **Motivation, wellbeing, recognition (P&C)** | **maslow** | `Teams/People & Culture/maslow/agent.md` |
| **Learning & Development, training design, skill-gap analysis, compliance-training operations (P&C)** | **grove** | `Teams/People & Culture/grove/agent.md` |
| **Performance mgmt (OKR + reviews), succession + 9-box, feedback (SBI + Radical Candor), HR-strategy alignment (P&C)** | **merit** | `Teams/People & Culture/merit/agent.md` |
| **PR & media (pitching + press-kit + media-training + PR analytics with code-level AVE refusal), Comms & PR Lead** | **herald** (Lead — David Meerman Scott identity) | `Teams/Comms & PR/herald/agent.md` |
| **Internal Communications (weekly cadence, all-hands, decision broadcasts, change comms — Kotter + Bridges + Prosci ADKAR)** | **signal** | `Teams/Comms & PR/signal/agent.md` |
| **Investor Communications (quarterly calls + monthly notes + Reg FD material-info fence, data-room discipline for DD readiness, organizational crisis-comms with Fink + Coombs SCCT + Judy Smith)** | **beacon** | `Teams/Comms & PR/beacon/agent.md` |
| **Country/market selection (Ghemawat CAGE + Rugman & Verbeke LOF), entry-mode decision (Root 7-mode + TCE), GTM adaptation (Ghemawat AAA + Meyer cultural), multi-market portfolio mgmt, Global Expansion Lead** | **compass** (Lead — Pankaj Ghemawat identity) | `Teams/Global Expansion/compass/agent.md` |
| **Multi-jurisdiction regulatory & compliance (entity setup + tax registration + employment-law-scoping per jurisdiction + data-residency + cross-border transfer mechanism, all counsel-scoping-first with clear scope split from hire on classification EXECUTION and Cybersecurity on technical IMPLEMENTATION)** | **canopy** | `Teams/Global Expansion/canopy/agent.md` |
| **Localization (product with Unicode CLDR + BCP 47, marketing transcreation with CSA, legal with counsel-review gate + ATA/FIT, deep cultural adaptation with Hofstede + Meyer + Trompenaars + Hall)** | **lingua** | `Teams/Global Expansion/lingua/agent.md` |
| **Cross-border operations (FX + treasury basics with BIS/CFA/JPM/HSBC, international banking with SWIFT/FATF/Wolfsberg + AML/KYC, cross-border payments with G20 Roadmap + Travel Rule, international logistics with ICC Incoterms 2020 + WCO HS)** | **frontier** | `Teams/Global Expansion/frontier/agent.md` |
| **Customer Success Strategy — health scoring + lifecycle-value mapping + QBR framework + CS tech-stack selection, Mehta 2016 discipline (data-cited-not-vibes), Client Success Lead** | **ally** (Lead — Nick Mehta identity) | `Teams/Client Success/ally/agent.md` |
| **Customer onboarding (journey design + time-to-first-value optimization + segment playbooks + kickoff executive alignment with Mutual Success Plan)** | **kickoff** | `Teams/Client Success/kickoff/agent.md` |
| **Customer success / retention / expansion (churn-risk prediction with cited signals + expansion motions with health-GREEN gating + renewal negotiation with value-realized-evidence primacy + customer advocacy with sign-off HARD BOUNDARY)** | **retain** | `Teams/Client Success/retain/agent.md` |
| **Support ops (tiered support design T1/T2/T3 + SLA management with ITIL + support analytics with Reichheld NPS + Dixon/Freeman/Toman CES + KCS v6 knowledge base with SME validation)** | **keel** | `Teams/Client Success/keel/agent.md` |
| **Growth Strategy — revenue-machine architecture (Roberge 4 formulas) + pricing/packaging with WTP discipline + funnel metrics + attribution with AARRR + GTM motion selection PLG/Sales-Led/Hybrid, Growth & Partnerships Lead** | **quest** (Lead — Mark Roberge identity) | `Teams/Growth & Partnerships/quest/agent.md` |
| **Sales / BD (sales methodology MEDDIC/Challenger + pipeline management Roberge/WbD + deal negotiation Fisher & Ury/Voss + customer discovery Blank/Bosworth/Ulwick/Keenan/Rackham)** | **closer** | `Teams/Growth & Partnerships/closer/agent.md` |
| **Marketing / Demand-Gen (demand generation strategy Kingsnorth/HubSpot + content marketing Pulizzi/Handley + marketing attribution Kaushik/GA4 + ABM Terminus/Demandbase with data-compliance)** | **lure** | `Teams/Growth & Partnerships/lure/agent.md` |
| **Partnerships (partner selection + tiering Rangan/Doz & Hamel + channel partner program with PRM + co-marketing/co-selling Winning by Design + strategic alliance management Doz & Hamel/Kanter/Gulati — all counsel-scoping-first)** | **bond** | `Teams/Growth & Partnerships/bond/agent.md` |
| **Risk Strategy — risk appetite framework + tail-risk scanning (Taleb Black Swan) + risk committee/reporting (Lam/COSO/IIA) + crisis scenario planning (Taleb Antifragile), Risk & ESG Lead** | **pilot** (Lead — Nassim Nicholas Taleb identity) | `Teams/Risk & ESG/pilot/agent.md` |
| **Enterprise Risk (ERM) — risk identification COSO/ISO 31000 + assessment quantification Hubbard/FAIR + treatment strategies (Mitigate/Avoid/Transfer/Accept) + monitoring/audit with immutable trail** | **hazard** | `Teams/Risk & ESG/hazard/agent.md` |
| **ESG Reporting — double-materiality assessment SASB/IFRS S1-S2/GRI + carbon accounting GHG Protocol/CDP/TCFD/SBTi + social impact GRI 400/B Lab/IMP/ILO + governance disclosure SOX/DGCL/ISS-Glass Lewis, all counsel-scoping-first** | **prism** | `Teams/Risk & ESG/prism/agent.md` |
| **Operational Resilience — business continuity ISO 22301 (LOAD-BEARING tested exercise) + disaster recovery NIST 800-34 (LOAD-BEARING business-derived RTO/RPO) + third-party risk SIG/ISO 27036 (LOAD-BEARING security+compliance review) + operational resilience testing BoE/FCA/BCBS/DORA (LOAD-BEARING IBS+tolerance pairing)** | **shield** | `Teams/Risk & ESG/shield/agent.md` |

Multi-agent tasks: route to the department leader (dev, warden, spark, meta, spec, marcus,
board, **hire**, **herald**) who sequences the others per `Teams/<Dept>/DEPARTMENT-WORKFLOW.md`.

A dashboard build is at minimum: **mia** (build) + **atlas** (tokens) + **quinn** (verify),
sequenced by **dev**.

---

## 3. Interaction Contract (non-negotiable)

From `docs/AGENT-BUILD-PLAYBOOK.md` — these rules are senior to speed:

- **§0.1 — Present before building.** Before ANY artifact: What you'll build, Why this
  approach (with source URLs), How you'll structure it. Then WAIT for sign-off.
- **Discovery first.** Ask 3–5 concrete questions (audience, scope, constraints, references).
  Propose 2–3 directions with named sources/inspiration. The user picks; then you build.
- **§0.2 — One artifact at a time.** Hard stop after each; approval to build several things
  ≠ approval to batch-build them.
- **§0.3 — Announce scope.** State which department and agent you're operating as, every time.
- **§0.4 — Genericize.** No hardcoded venture/company names in any built artifact.
- **§0.6 — Triple-counter verify** (silent, every response): source check, logic check,
  consistency check.

Zero questions asked + no sources cited + straight to output = this rail was violated.

---

## 4. Context Retrieval — use the pipeline, don't freelance

Before building, pull harness-verified context for the task (CAOS:
CLASSIFY → RESOLVE → RETRIEVE → GATE):

```bash
cd rag
python3 -c "
import sys,os; sys.path.insert(0,'core'); sys.path.insert(0,'harness')
sys.path.insert(0,os.path.join('..','Teams','Shared OS','logical'))
from retriever import retrieve
r = retrieve('<the user task, verbatim>', agent_id='<agent>', agent_dept='<Dept>')
for c in r.optimized.selected_chunks: print(c.get('source_file','?'))
"
```

Use the returned chunks (agent skills, dept docs, book wisdom) as build context. Honor
conflict flags ("⚠️ Agent must reconcile"). Full pipeline reference: `README.md`,
`docs/MASTER.md` PART 2 (Harness). End-to-end check: `python3 cli/verify-caos.py --quick`.

---

## 5. Verification Before "Done"

- Shared OS skill: `Teams/Shared OS/skills/verification-before-completion/` — run it.
- Frontend: quinn's real-browser gate (mia's `frontend-verification` skill). Mock data
  rendering in the DOM is an integrity block. "Agents say done; browsers tell the truth."
- Config values must come from the agent's `operational/agent/<agent>-config.md`. If a field
  is `<FILL_IN>`, ask — degrading loudly beats improvising (mia-config rule).
- Cite the sources actually used (files, books, URLs) in the final summary.

---

## 6. Pointers

| What | Where |
|---|---|
| Build process + ground rules | `docs/AGENT-BUILD-PLAYBOOK.md` |
| **Task state machine (TASK-SPEC)** | `docs/MASTER.md` PART 6 · records in `store/tasks/` |
| **Execution scenarios (A–E) + sandbox-first** | `docs/MASTER.md` PART 7 |
| **Enforcement — gates, hooks, transitions** | `docs/MASTER.md` PART 8 |
| Dept sequencing | `Teams/<Dept>/DEPARTMENT-WORKFLOW.md` |
| Cross-agent skills + logic scripts | `Teams/Shared OS/` |
| Security rails (senior to all agents) | `Teams/Engineering/SECURITY-CHARTER.md` |
| Architecture (single source of truth) | `docs/MASTER.md` — PART 0 orientation, 1–8, APPX A–C |

> **`docs/MASTER.md` is ~5,100 lines — never read it whole.** It opens with a
> line-numbered index; find your section there, then `sed -n 'START,ENDp'` just that
> range. Regenerate the index after any hand-edit: `python3 cli/toc.py` (`--check` verifies).
| Fleet CLI | `node cli/yvon.js doctor|agents|graph` |
