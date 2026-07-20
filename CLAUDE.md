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
(`Teams/AGENT-BUILD-PLAYBOOK.md` §0.5 — ask, or leave an explicit `<FILL_IN>`).

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

Multi-agent tasks: route to the department leader (dev, warden, spark, meta, spec, marcus,
board) who sequences the others per `Teams/<Dept>/DEPARTMENT-WORKFLOW.md`.

A dashboard build is at minimum: **mia** (build) + **atlas** (tokens) + **quinn** (verify),
sequenced by **dev**.

---

## 3. Interaction Contract (non-negotiable)

From `Teams/AGENT-BUILD-PLAYBOOK.md` — these rules are senior to speed:

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
`docs/HARNESS.md`. End-to-end check: `python3 cli/verify-caos.py --quick`.

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
| Build process + ground rules | `Teams/AGENT-BUILD-PLAYBOOK.md` |
| Dept sequencing | `Teams/<Dept>/DEPARTMENT-WORKFLOW.md` |
| Cross-agent skills + logic scripts | `Teams/Shared OS/` |
| Security rails (senior to all agents) | `Teams/Engineering/SECURITY-CHARTER.md` |
| Architecture docs | `docs/` (4LAYER, HARNESS, WORK_TREE, FULL) |
| Fleet CLI | `node cli/yvon.js doctor|agents|graph` |
