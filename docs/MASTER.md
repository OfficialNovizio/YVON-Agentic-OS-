# YVON — MASTER DOCUMENT

**The single source of truth for this system.** Nine separate architecture docs were
consolidated here on **2026-07-30** after a section-level coverage check confirmed every
heading and body paragraph of each was present. `docs/archive/` was removed in the same pass.

**New here?** Read **PART 0** — it's the end-to-end narrative. Parts 1–5 are stacked
deep-dives; Parts 6–7 are how work actually gets executed.

## Table of Contents

| # | Part | What it covers |
|---|------|----------------|
| **0** | **Orientation: Micro → Macro** | **Start here.** Life of a message end-to-end; `[built]` / `[partial]` / `[planned]` status markers |
| 1 | Full Project Architecture | Fleet, agent structure, skills, Shared OS, CIE, TOON, pipelines |
| 2 | Harness — Complete Architecture Plan | 5-gate verification, data flow, delegation, disclosure, citations |
| 3 | Unified Production Pipeline | Strategy routing (FAST/BALANCE), benchmarks, 12 scenarios |
| 4 | Complete Work Tree with Fallbacks | 11 layers, end-to-end data flow, fallback matrix, test suite |
| 5 | 4-Layer Multi-Tenant Architecture | YVON Core, Agent Layer, Integrations, AgentX SaaS, graphs, build order |
| **6** | **TASK-SPEC Template** | **The task state machine.** `draft → discovery → approved → executing → gated → done`. Records live in `store/tasks/` |
| **7** | **Unified Workflow Blueprint** | **How work executes.** Master tree + 5 scenarios (coding · feature · dissatisfaction · failure · parallel) + §7.7 sandbox-first promotion |
| **8** | **Enforcement** | **Makes 6 & 7 mechanical.** Transition conditions, gate map, write-gate hook, `cli/task.sh`, tool→gate bindings |
| A | Appendix — Code Structure | Refactor plan, import rewiring map |
| B | Appendix — Google agents-cli Patterns | 8 patterns to adopt, what to discard |
| C | Appendix — Dashboard Two-Tier Design | Operator + per-brand tiers, health score formula |

**Governing docs that live outside this file:**

| What | Where |
|---|---|
| Session rail (read every session) | `CLAUDE.md` |
| Agent build process + §0 ground rules | `docs/AGENT-BUILD-PLAYBOOK.md` |
| Security rails (senior to every agent) | `Teams/Engineering/SECURITY-CHARTER.md` |
| Department sequencing | `Teams/<Dept>/DEPARTMENT-WORKFLOW.md` |
| Shared tool registry | `Teams/Shared OS/tools/shared-tool-registry.md` |
| Graph-brain design of record — memory, structure, and (as of 2026-08-09) system/execution architecture | `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` |
| `/brain` graph viewer — visual model, query catalog, its own build roadmap | `system-harness/graph-brain/YVON-GRAPH.md` |
| Persistent backlog + verified-status audits | `docs/SESSION-HANDOUT.md` |

---

<!-- TOC:START -->
## How to read this file

`docs/MASTER.md` is ~5838 lines. **Do not read it whole.**
Jump straight to what you need:

```bash
grep -n '^### PART' docs/MASTER.md    # find a section's line number
sed -n '4170,4380p' docs/MASTER.md    # then read just that range
python3 cli/toc.py                    # regenerate this index
python3 cli/toc.py --check            # verify line numbers are accurate
```

> Line numbers below are generated. If you edit MASTER.md by hand, re-run
> `cli/toc.py` or they drift.

## Index


### PART 0 — ORIENTATION: MICRO → MACRO  ·  line 207
- `  219`  0. The System in One Paragraph
- `  236`  1. Ingress — who receives the message and what happens first
- `  245`  2. Synthesis — how the raw message becomes a proper template, and who does it
- `  262`  3. The Retrieval Pipeline — CAOS end to end
- `  303`  4. The feedback chain `[built]`
- `  318`  5. How agents update their own skills `[built]`
- `  332`  6. Memory and graphs
- `  755`  7. Testing — the verification map `[re-verified 2026-08-09]`
- `  803`  8. Source → runtime sync `[built, 84.5% figure corrected 2026-08-09]`
- `  838`  9. Who decides which agent and which skill — and how it's checked `[re-verified 2026-08-09]`
- `  878`  10. The stack `[file citations re-verified 2026-08-09]`
- `  888`  11. Multi-tenant data flow (as shipped)
- `  894`  12. Build order (10 weeks, phased)
- `  900`  13. Document Map `[re-verified 2026-08-09 — 7 of 13 rows were dead links]`

### PART 1 — FULL PROJECT ARCHITECTURE  ·  line 933
- `  955`  Project At a Glance
- `  984`  1. FULL WORKFLOW: Query → Agent → Response
- ` 1103`  2. THE 46-AGENT FLEET
- ` 1181`  3. EACH AGENT'S STRUCTURE
- ` 1242`  4. SKILL SYSTEM
- ` 1285`  5. SHARED OS — THE LOGICAL SCRIPTS (35 Python modules)
- ` 1358`  6. RAG PIPELINE — FULL ARCHITECTURE `[re-verified 2026-08-09]`
- ` 1499`  7. BRIDGE PROTOCOL — CIE ⇆ RAG INTEGRATION
- ` 1533`  8. CIE (CONTEXT INTELLIGENCE ENGINE) — TypeScript Core `[re-verified 2026-08-09 — list was missing 13 files]`
- ` 1577`  9. TOON COMPRESSION SYSTEM
- ` 1597`  10. GOVERNANCE PIPELINES (TypeScript) `[re-verified 2026-08-09]`
- ` 1632`  11. KNOWLEDGE FOUNDATION `[corrected 2026-08-09 — fabricated]`
- ` 1651`  12. COMPLETE TEST SUITE `[re-verified 2026-08-09 — see §7 for the real, live-run numbers]`
- ` 1679`  13. COMMANDS `[re-verified 2026-08-09]`
- ` 1712`  14. SINGLE ENTRY POINT FOR RAG `[import path corrected 2026-08-09]`

### PART 2 — HARNESS: COMPLETE ARCHITECTURE PLAN  ·  line 1743
- ` 1761`  THE FULL WORKFLOW
- ` 2025`  WHAT GETS BUILT (New Files)
- ` 2040`  WHAT GETS MODIFIED (Existing Files)
- ` 2054`  WHAT GETS LEFT ALONE (Working, No Changes)
- ` 2069`  HARNESS DATA FLOW (DETAILED)
- ` 2220`  AGENT DELEGATION (Phase 9 Enhancement)
- ` 2247`  PROGRESSIVE DISCLOSURE FLOW
- ` 2300`  GROUNDED CITATION FLOW
- ` 2337`  IMPLEMENTATION ORDER
- ` 2358`  SINGLE ENTRY POINT (FINAL)

### PART 3 — UNIFIED PRODUCTION PIPELINE: FINAL REPORT  ·  line 2436
- ` 2454`  Architecture: Strategy Routing
- ` 2495`  Full Demo Results — 12 Scenarios
- ` 2533`  Recovery Pass — 5 Triggers
- ` 2557`  Classification Accuracy
- ` 2574`  Full Project Structure `[paths corrected 2026-08-09]`
- ` 2640`  Single Entry Point (same `core/`-prefix correction as above)
- ` 2664`  When to Use What
- ` 2683`  Commands (`strategy.py` line is dead — deleted this session; others just need the `core/` prefix above)

### PART 4 — COMPLETE WORK TREE WITH FALLBACKS  ·  line 2700
- ` 2720`  LEGEND
- ` 2734`  LAYER 1: QUERY INGRESS — Classification + Progressive Disclosure
- ` 2776`  LAYER 2: RETRIEVAL + FORMULA EXECUTION — Plan-Locked
- ` 2838`  LAYER 3: HARNESS GATES — 5 Gates in Sequence ★
- ` 2934`  LAYER 4: STRATEGY ROUTING + INJECTION
- ` 2981`  LAYER 5: LLM GENERATION + POST-HOC VERIFICATION
- ` 3059`  LAYER 6: FEEDBACK LOOP
- ` 3089`  LAYER 7: FIELD MONITORING — Read-Only Analysis
- ` 3148`  LAYER 8: SELF-IMPROVER — Weekly Autonomous Optimization
- ` 3204`  LAYER 9: SHARED OS — Formula Execution
- ` 3239`  LAYER 10: AGENT FLEET — 46 Agents × 7 Departments
- ` 3279`  LAYER 11: CIE — TypeScript Orchestration
- ` 3320`  COMPLETE DATA FLOW — END TO END
- ` 3368`  FALLBACK MATRIX
- ` 3389`  TEST SUITE SUMMARY
- ` 3416`  COMMANDS

### PART 5 — COMPLETE 4-LAYER MULTI-TENANT ARCHITECTURE  ·  line 3451
- ` 3468`  THE 4-LAYER STACK
- ` 3526`  THE DATA FLOW — End to End
- ` 3572`  LAYER 1: YVON CORE — MASTER CONTROL PLANE
- ` 3657`  LAYER 2: AGENT LAYER — WHAT EXISTS & WHAT'S NEW
- ` 3679`  LAYER 3: INTEGRATION LAYER — MCP + EXTERNAL APIs
- ` 3720`  LAYER 4: AGENTX PLATFORM — SaaS FOR SMALL BUSINESSES
- ` 3815`  THE GRAPH MEMORY SYSTEM
- ` 3931`  DEPARTMENT DEPLOYMENT PIPELINE
- ` 3964`  WHAT GETS BUILT — NEW MODULES
- ` 3999`  COMPLETE WORKFLOW — END TO END
- ` 4079`  DATA ISOLATION MATRIX
- ` 4096`  BUILDING THE AGENTX CONNECTOR MARKETPLACE
- ` 4140`  SELF-IMPROVEMENT LOOP — EXTENDED FOR MULTI-TENANT
- ` 4185`  BUILD ORDER — PHASED ROLLOUT
- ` 4227`  VALIDATION: GOOGLE AGENTS-CLI CROSS-REFERENCE

### PART 6 — TASK-SPEC TEMPLATE  ·  line 4349

### PART 7 — UNIFIED WORKFLOW BLUEPRINT: ALL SECTIONS WORKING TOGETHER  ·  line 4407
- ` 4416`  7.0 THE MASTER TREE — one message, every system, every decision
- ` 4570`  7.1 SCENARIO A — CODING TASK ("test the code", "fix the API", "add endpoint")
- ` 4613`  7.2 SCENARIO B — PRODUCT FEATURE / DASHBOARD (the big-company rail)
- ` 4652`  7.3 SCENARIO C — THE DISSATISFACTION LOOP (output ≠ what the prompt needed)
- ` 4678`  7.4 SCENARIO D — SKILL / SCRIPT FAILURE + THE AI & AGENTS TEAM LOOP
- ` 4715`  7.5 SCENARIO E — MULTIPLE AGENTS IN PARALLEL
- ` 4744`  7.6 TOOLING DECISIONS LOCKED IN THIS PART
- ` 4757`  7.7 SANDBOX-FIRST PROMOTION FLOW — the quarantine layer (OpenSandbox)

### PART 8 — ENFORCEMENT: MAKING PARTS 6 & 7 MECHANICAL  ·  line 4856
- ` 4865`  8.0 The evidence
- ` 4896`  8.1 Two execution surfaces
- ` 4914`  8.2 The state machine (from PART 6, with transition conditions)
- ` 4946`  8.3 Gate map — what exists, what it blocks, who owns it
- ` 4972`  8.4 The write gate — `.claude/hooks/yvon-gate.sh`
- ` 5002`  8.5 `cli/task.sh` — the record manager
- ` 5022`  8.6 Tool → gate binding
- ` 5045`  8.7 What PART 8 deliberately does not do
- ` 5061`  8.8 Rollout order

### APPENDIX A — CODE STRUCTURE — REFACTOR PLAN  ·  line 5084
- ` 5105`  CURRENT MESS
- ` 5112`  TARGET STRUCTURE
- ` 5177`  IMPORT CHANGES
- ` 5195`  WIRING UPDATES
- ` 5211`  IMPLEMENTATION ORDER
- ` 5223`  WHAT DOES NOT MOVE
- ` 5233`  RISK

### APPENDIX B — GOOGLE agents-cli PATTERN INTEGRATION  ·  line 5260
- ` 5278`  WHAT TO ADOPT (8 patterns, all map to YVON's existing structure)
- ` 5280`  WHAT TO DISCARD (Google Cloud-specific, replaced with YVON equivalents)
- ` 5297`  PATTERN 1: MANIFEST-BASED PROVISIONING (from agents-cli-manifest.yaml)
- ` 5337`  PATTERN 2: SCAFFOLD → ENHANCE → UPGRADE (from agents-cli scaffold)
- ` 5365`  PATTERN 3: EVAL DATASETS + QUALITY FLYWHEEL (from agents-cli eval)
- ` 5433`  PATTERN 4: PROTOTYPE-FIRST (from agents-cli --prototype flag)
- ` 5453`  PATTERN 5: AGENT CARD + DISCOVERY (from agents-cli publish)
- ` 5501`  PATTERN 6: OBSERVABILITY TIERS (from agents-cli observe)
- ` 5520`  PATTERN 7: LIFECYCLE MAPPING (8 phases → YVON gates)
- ` 5537`  PATTERN 8: SKILL ARCHITECTURE (identical — validates YVON's approach)
- ` 5549`  WHAT GETS BUILT

### APPENDIX C — DASHBOARD — TWO-TIER DESIGN  ·  line 5577
- ` 5600`  DESIGN CONSTRAINTS (from dev's principles)
- ` 5609`  QUINN CHARTER ENFORCEMENT (applied to dashboard)
- ` 5619`  TIER 1: YVON MASTER DASHBOARD (operators)
- ` 5720`  TIER 2: PER-BRAND DASHBOARD (business owners)
- ` 5782`  DASHBOARD API (bridge.py --mode dashboard)
- ` 5813`  FAILURE MODE OWNERSHIP
- ` 5825`  WHAT GETS BUILT

<!-- TOC:END -->

# ═══════════ PART 0 — ORIENTATION: MICRO → MACRO ═══════════
*(source: docs/ARCHITECTURE.md — merged 2026-07-30)*

> **Read this first.** Parts 1–5 are stacked deep-dives; this part is the
> end-to-end narrative that makes them navigable. `[built]` = running today ·
> `[partial]` = exists, being extended · `[planned]` = designed, not yet coded.

**Convention:** everything is described as the complete system. `[built]` = running today, tested. `[partial]` = exists, being extended. `[planned]` = designed in the 4-layer plan, not yet coded.
**Depth contract:** every system is explained end-to-end here; exhaustive detail lives in the linked code files, not in prose.

---

## 0. The System in One Paragraph

YVON is an agent operating system: 46 agents in 7 departments, ~200+ skills, sitting on a retrieval-and-verification pipeline that turns every operator message into budgeted, gate-verified, citation-grounded context — and a set of feedback loops that make the fleet measurably better every week without human tuning. Around that core sits a 4-layer multi-tenant platform (YVON Core → Agent Layer → Integration Layer → AgentX SaaS) that deploys departments to owned brands and paying tenants with hard data isolation and anonymized cross-tenant learning.

```
MACRO   L4 AgentX SaaS  →  L3 Integrations (MCP)  →  L2 Agent Fleet  →  L1 YVON Core
                                                          │
MICRO   message → TASK-SPEC → CAOS retrieval → 5-gate harness → strategy
        routing → compression → LLM trio → post-hoc verification → response
                                                          │
LOOPS   feedback → field monitor → self-improver → skill/param updates → (repeat)
```

---

# PART I — MICRO: The Life of a Message

## 1. Ingress — who receives the message and what happens first

A message enters through the session rail (`CLAUDE.md` §1). Two paths:

- **Direct factual question** → answered, no machinery. `[built]`
- **Do-something request** (build, research, design — anything else) → classified and routed by the routing table (`CLAUDE.md` §2) to an owning agent, or — if it touches more than one agent/department — to **meta's task-dispatch** (`Teams/AI & Agents/meta/custom/task-dispatch/SKILL.md`). `[built]`

In the multi-tenant platform, the same ingress is fronted by the AgentX layer: the platform first resolves *which tenant graph* the message belongs to, loads the tenant profile, active departments, and connected integrations, then hands down to this layer. `[planned]`

## 2. Synthesis — how the raw message becomes a proper template, and who does it

**The "who" is meta** (Fleet Governance). task-dispatch is the fleet's executive function; its output is a **TASK-SPEC** written to `store/tasks/TS-<seq>.yaml` from `store/tasks/TEMPLATE.yaml`:

| Block | What it captures | Rule |
|---|---|---|
| `source_message` | The message | **Verbatim, never paraphrased** |
| `classification` | task_type, departments, lead | Routing decision is logged |
| `context` | Chunks, existing assets, conflicts | Hook-injected, gate-verified, citations only |
| `discovery` | 3–5 questions → decisions | **BLOCKING** — no fan-out until answered; meta asks once, workers never interrogate the operator |
| `work_items` | owner, one testable objective, consumes/produces, owns_paths, per-item FAST/BALANCE budget, acceptance, security_review | Handoffs are **contracts-only** — no transcript inheritance; no two parallel items share a write path |
| `dag` | parallel sets + critical path | Lead department's workflow file governs sequencing |
| `exit_gate` | owner + proof | "Agents say done; browsers tell the truth" |
| `feedback` | outcome + lesson | Filled post-execution; **anneal** consumes it |

Sharding rule: each worker receives ONLY its work item + consumed contracts, injected in `.toon` form. meta proposes; the operator approves — dispatch never self-activates. `[built]`

## 3. The Retrieval Pipeline — CAOS end to end

Every work item's query then runs the CAOS flow (Context-Aware Orchestration: CLASSIFY → RESOLVE → RETRIEVE → GATE). "Detailed layer diagrams: `docs/archive/WORK_TREE.md`" — that exact file was removed in the 2026-07-30 consolidation, but its content is merged inline as **PART 4 "Complete Work Tree With Fallbacks"** further down this document (see §13's Document Map for the exact line). §6.2/§6.3 (Layer 0–11) and §7 (Testing) elsewhere in this document are a second, independently re-verified-against-live-code source — PART 4 itself has not been re-verified this session.

### 3.1 Classification + progressive disclosure `[built]`
`src/cie/classifier.ts` maps domain keywords → task_type + agent_id. `rag/harness/disclosure.py` then lazy-loads skills: 2–3 triggered skills load as full SKILL.md, the rest as one-line summaries (~8 tokens each) — 40–60% context savings. Fallback: all skills load as before.

### 3.2 Retrieval + formula execution `[built]`
`rag/core/bridge.py` (called as a subprocess by `src/cie/rag-bridge.ts`, JSON over stdin/stdout) fans out to:

- `retriever.py` — query rewrite (expansion + agent-domain terms + agentic premortem/alternative angles, capped at 5 queries) → hybrid dense (MiniLM-L6-v2, 384-d) + sparse (BM25) retrieval → cross-encoder re-rank → 20 candidate chunks. Fallback: direct `chunks.json` scan when sqlite-vec is absent.
- Formula detection → `Teams/Shared OS/logical/` (35 Python scripts: finance, marketing, security, planning). Exact values are *computed*, never estimated by the LLM — the computed fact + citation IS the context.
- `optimizer.py` — dynamic agent profile, diversity, one adversarial chunk.

### 3.3 The Harness — 5 gates in sequence `[built]`
`rag/harness/gates.py`, wired via `unified_pipeline.inject_with_harness()`:

1. **Source authentication** — file exists, hash matches, citation traceable to Teams/Books/, within the agent's authorized departments → verified/flagged/blocked.
2. **Multiplicative reliability** — freshness × authority × quality. Authority is a 7-level source-type map (book 1.0 → unknown 0.2); quality comes from the feedback loop. Produces 948× separation between authoritative and junk.
3. **Conflict detection** — pairwise comparison; contradictions/version/domain conflicts become ⚠️ flags injected into context: *"Agent must reconcile before responding."*
4. **Priority budget assembly** — P0 agent identity → P1 active skills → P2 computed facts → P3 T1 verified chunks → … → P7 inactive skill summaries. Budget fills in priority order; plan logged.
5. **Quarantine + recovery** — low-reliability chunks quarantined (`quarantine.jsonl`); dropped chunks re-scanned for novel facts, exceptions, contradictions and pulled back if load-bearing.

Every gate has an explicit fallback. "Full matrix: `docs/archive/WORK_TREE.md` §Fallback Matrix" — same file, same 2026-07-30 removal; a fallback matrix does live in **PART 4** now (not independently re-verified this session — see §13's Document Map). The fallbacks that *have* been checked are documented inline where each mechanism is introduced throughout this Part 0 (e.g. §3.1's "all skills load as before," §3.2's "direct `chunks.json` scan when sqlite-vec is absent"). Degrading loudly beats improvising.

### 3.4 Strategy routing + compression `[built]`
`rag/core/unified_pipeline.py` routes by task type:

- **FAST** (creative review, copy edit, factual lookup) → `destructor.py`, hard budget, 64–89% savings.
- **BALANCE** (default) → adaptive budget ×0.4–4.0 by task type (legal_review 4.0×, strategic 3.0×, governance 2.5×…) + aggressive recovery. 39–77% savings.
- **QUALITY** → relational + progressive when contradictions are detected.

`injector.py` then applies sentence-level pruning, citation-only mode for formula queries, and per-agent compression profiles (spark needs Ogilvy verbatim; board needs thresholds, not prose). Output: the enhanced injection — header `[YVON · agent · task · tokens]`, ⚠️ conflict-flagged chunks, ♻️ recovered chunks.

### 3.5 Generation + post-hoc verification `[built]`
`src/cie/builder.ts` assembles the final prompt. Generation is a trio: hermes+claude (primary reasoning), deepseek (adversarial verification), chatgpt (creative quality). Then `rag/verify/` (bridge `--mode verify`) checks grounded citations + self-consistency; high-stakes low-score responses are **delegated** to quinn / precedent / sentinel for agent review, low-stakes get automated verification only.

---

# PART II — LOOPS: How the System Improves Itself

## 4. The feedback chain `[built]`

```
outcome (accept/reject/revise) + verifier report
  → feedback.py     quality_new = 0.95·old + 0.05·outcome  (slow-moving; feeds Gate 2)
  → field monitor   weekly read-only analysis: attractors (chunk combos that
                    consistently win/lose), degradation (quality drop >0.15 warn,
                    >0.25 critical), coverage gaps, per-agent drift
  → self-improver   Sunday 00:00 UTC, six phases: analyze → propose → sandbox-test
                    (synthetic data only) → decide (one failure holds ALL proposals)
                    → deploy (atomic, *.backup, git-revertible) → log
                    (rag/monitor/improvement_log.jsonl)
  → eval flywheel   rag/eval/judge.py + flywheel.py score outputs; results feed back
```

## 5. How agents update their own skills `[built]`

Skills live in `Teams/<Dept>/<agent>/{custom,marketplace}/` as SKILL.md (source of truth). The loop:

1. Every skill invocation is logged to `store/telemetry/skill-invocations.jsonl`.
2. **gauge** benchmarks skill quality; **anneal** consumes TASK-SPEC `feedback` blocks and telemetry to propose skill edits per skill-authoring-standards.
3. Edited source skills are recompiled by `cli/skillgen.js` into runtime skills in `dist/skills/` — frontmatter, triggers, allowed-tools, and boundaries are *derived* from the source (nothing invented; Playbook §0.5), version-bumped on source-hash change.
4. `node cli/toonify.js --all` (or `yvon toonify`) regenerates the `.toon` injectable form.
   **Corrected 2026-08-09** — a duplicate `cli/toonify.py` existed alongside this, unwired into
   `cli/yvon.js`'s actual `toonify` command; removed as dead code (ponytail-audit finding, see
   `system-harness/PONYTAIL-AUDIT-2026-08-09.md`).

So a skill improves through: usage telemetry → gauge measurement → anneal proposal → operator-approved edit → skillgen + toonify recompile → next retrieval uses it. Checked in a loop, end to end.

## 6. Memory and graphs

> **Graph-Brain design of record (G-track):** `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` — hub-of-brains,
> four-memory (CLS) model, node/edge schema, keep/forget management, query design, cross-brain
> learning. Two engines: **graphify** (deterministic structure, built) + **MemPalace**
> (episodic/semantic memory, replaces turbovec — Phase 1 installed 2026-08-09, Claude Code
> sessions only; Phase 2 VPS-serve planned; full record: `system-harness/adr/ADR-001-mempalace-episodic-backend.md`).
> turbovec swap applied across `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §1/§6/§8, `shared-tool-registry.md`,
> `vps-scripts/install-tools.sh` — done, not pending.

- **Agent memory (`agent-diary`, formerly `hermes-sync.ts`)** `[built → migrating]` — per-agent
  diary content, migrating from flat `USER.md`/`MEMORY.md` (CRDT) to **MemPalace wings** — each
  agent's diary becomes a scoped wing (wing/room/drawer retrieval instead of flat-file search).
  Exposed to retrieval as CIE source `src/cie/sources/agent-memory.ts` (renamed from
  `hermes-memory.ts` — "hermes" is reserved for the generation-trio LLM only, removing the
  naming collision the old note flagged).
- **Code graphs** `[built]` — unchanged. `npx yvon graph` (`cli/yvon.js`) builds the codegraph +
  graphify reports (`graphify-out/`); consumed by CIE sources `codegraph.ts` / `graphify.ts`.
- **Episodic/semantic memory — MemPalace** `[Phase 1 built 2026-08-09 — Claude Code sessions
  only, pgvector backend; Phase 2 (VPS-resident serve) planned, deferred until the chat system is
  live — ADR-001, system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §6]`. turbovec fully removed (ADR-001):
  - **Wings** = brand/client graphs (Novizio, Hourbour, per-client) — matches the existing
    isolation invariant ("outer brains link inward only").
  - **Rooms** = department/topic subgraphs within a wing.
  - **Drawers** = verbatim leaf content — notes, conversation turns, agent-diary entries. Never
    summarized at storage time; compression happens only at injection time (TOON layer).
  - **Native temporal KG** (add/query/invalidate/timeline) replaces the custom bi-temporal
    `valid_from`/`supersedes` fields `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §11 planned to build — MemPalace
    ships this natively.
  - **Backend: `qdrant` or `pgvector`, not the ChromaDB default, and never local/file-based** —
    Chroma has no namespace isolation and both this and any local/flat-file storage are
    disqualified outright for episodic memory: it must live on a proper DB, full stop (operator
    decision 2026-08-09). Required to satisfy Principle 1 ("business data never crosses a
    boundary"). **Recommendation: `pgvector`** — reuses the existing Supabase Postgres infra
    instead of standing up a new service; move to qdrant only if a measured latency/volume
    bottleneck appears. **Isolation is tiered, not uniform (resolved 2026-08-09 — see Open
    Issues, Issue 6):** Tier 1/2 (Master + owned brands) share one pgvector/qdrant instance,
    isolated by namespace (`{tier}:{brand_or_tenant_id}` — `master`, `brand:novizio`,
    `brand:hourbour`); Tier 3 (client/tenant wings) get **schema-per-tenant within the same
    Postgres instance** — a real Postgres-native boundary, not just a namespace filter in
    application code, because a leak there is existential (see §14 in `system-harness/graph-brain/YVON-GRAPH.md`) and a
    full separate DB per tenant doesn't scale past a handful of clients.
  - **Auto-save hooks** fire periodically *and specifically before context compression* — the
    direct fix for large-context degradation: episodic state persists outside the live window
    continuously, so nothing depends on the window holding everything at once.
  - **`belongs_to` / `last_worked_by` — resolved 2026-08-09 (Open Issues, Issue 3).** Code
    entities keep auto-deriving `belongs_to` from `Teams/<Department>/<agent>/` folder structure.
    Business/content nodes are **auto-stamped at write time**: whichever agent or task creates or
    last touches a node becomes its `belongs_to` (ownership) and `last_worked_by` (most recent
    editor) by default — no one has to remember to fill in frontmatter. Frontmatter stays
    available as a manual override/correction, not the primary acquisition path. When a venture
    connects live, its own DB gives a second, often better source: foreign keys in the venture's
    schema (e.g. a content row's `author_id`/`venture_id`) map straight to a `belongs_to` edge,
    same determinism code entities get from folder structure. Auditing already-existing content
    nodes' frontmatter compliance against the real repo is still open — this fixes new nodes
    going forward, not the backlog.
- **Graph memory tiers** `[planned]` — Tier 1 Master Graph (fleet state, all profiles, learning
  patterns) — graphify structural + MemPalace semantic, shared `pgvector`/`qdrant` namespace
  `master`. Tier 2 owned-brand graphs — dedicated MemPalace wing per brand, dedicated namespace
  per brand, same shared instance as Tier 1. Tier 3 tenant graphs — dedicated MemPalace wing per
  tenant, **schema-per-tenant** (not just a namespace) within that same Postgres instance; raw
  data never leaves except anonymized aggregates (unchanged invariant, see §10).

### 6.1 Rebuild triggers — two independent cycles, not one

```
STRUCTURAL (graphify)                    EPISODIC (MemPalace)
git commit/merge                          message sent / task done /
      │                                   context nearing compaction
      ▼                                          │
graphify git hook / --update                     ▼
      │                                  MemPalace auto-save hook
      ▼                                  (periodic + pre-compaction)
reparse ONLY changed files                       │
(delta, not full rebuild)                        ▼
      │                                  mempalace sweep — one verbatim
      ▼                                  drawer per message, idempotent
graph.json + Obsidian vault                      │
updated in ms                                    ▼
                                          pgvector/qdrant namespace updated,
                                          temporal KG timeline extended
```

Neither engine does a full rebuild during normal operation — both are delta-only, event-driven.
Full rebuilds are reserved for schema migrations only.

### 6.2 Canonical CAOS pipeline (consolidated reference — see also Layer 1-11, §7.0)

```
INPUT
  │
  ▼
CLASSIFY  [src/cie/classifier.ts]
  ├─ keyword/domain match → task_type + agent_id
  └─ progressive disclosure: 2-3 triggered skills load full,
     rest load as ~8-token one-line summaries (40-60% savings)
  │
  ▼
RESOLVE  [src/cie/graph-resolver.ts]
  ├─ which graph tier / sources this agent+tenant is authorized to see
  │  (Master Graph vs brand graph vs tenant graph — isolation boundary,
  │  enforced via pgvector/qdrant namespace per §6 above)
  ├─ CAG check [cie/cache.ts, LRU] — stable context (agent identity,
  │  principles, brand kit, dept workflow) served from cache, NOT
  │  re-retrieved. Only volatile context (chunks, formulas, episodic
  │  memory) proceeds to full RETRIEVE.
  └─ source fan-out: graphify (structural) + MemPalace (episodic/semantic,
     scoped to the resolved wing/namespace)
  │
  ▼
RETRIEVE  [rag/core/bridge.py — see Open Issues re: path confirmation]
  ├─ RAG: retriever.py — query rewrite (up to 5 variants) → hybrid dense
  │    (MiniLM-L6-v2) + sparse (BM25) → cross-encoder re-rank → 20 candidates
  ├─ graphify structural pull — query_graph/get_neighbors, results marked
  │    GRAPH-PINNED (high confidence, explained edges)
  ├─ MemPalace episodic pull — semantic search scoped to wing/room, verbatim
  │    drawers, temporal-KG validity checked (invalidated facts excluded
  │    before they ever reach GATE)
  ├─ Formula execution: 35 deterministic Python scripts (Shared OS/logical/)
  │    exact computed values, never LLM-estimated — computed fact + citation = context
  └─ optimizer.py: dynamic agent profile, diversity check, 1 adversarial chunk
  │
  ▼
GATE  [rag/harness/gates.py — 5 gates in sequence]
  1. Source authentication — hash-verified, traceable citation
  2. Multiplicative reliability — freshness × authority × quality
  3. Conflict detection — pairwise, flags contradictions (⚠️ for agent to
     reconcile). MemPalace's native supersede/invalidate metadata feeds
     this directly — stale facts flagged automatically, not shown as current.
  4. Priority budget assembly — P0 identity → P1 active skills → P2 computed
     facts → P3 verified/GRAPH-PINNED chunks → P4 MemPalace episodic recall
     → ... fills in priority order until budget hits
  5. Quarantine + recovery — low-reliability chunks quarantined, re-scanned
     for load-bearing facts, pulled back if needed
  │
  ▼
STRATEGY ROUTING + COMPRESSION  [rag/core/unified_pipeline.py]
  ├─ FAST (creative review/copy edit/lookup) → hard budget, 64-89% savings
  ├─ BALANCE (default) → adaptive ×0.4-4.0 by task, 39-77% savings
  └─ QUALITY → relational+progressive when contradictions detected
  │
  ▼
GENERATION  [src/cie/builder.ts — trio]
  ├─ hermes+claude → primary reasoning (generation-trio "hermes" — distinct
  │    from the agent-diary memory system per the naming fix in §6 above)
  ├─ deepseek       → adversarial verification (checks the primary output)
  └─ chatgpt        → creative quality pass
  │
  ▼
POST-HOC VERIFICATION  [rag/verify/]
  ├─ grounded citation check
  ├─ self-consistency check
  └─ high-stakes/low-score → delegated to quinn/precedent/sentinel for human-agent review
     low-stakes → automated verification only
  │
  ▼
OUTPUT
  │
  ▼
FEEDBACK LOOP  (async, not blocking output)
  ├─ outcome (accept/reject/revise) + verifier report
  ├─ rag/core/feedback.py: quality_new = 0.95·old + 0.05·outcome → feeds Gate 2
  ├─ rag/monitor/watcher.py ("field monitor"): weekly drift/degradation/coverage-gap analysis
  ├─ rag/monitor/improver.py ("self-improver"): Sunday 00:00 UTC — propose → sandbox-test →
  │    deploy (git-revertible). Verified 2026-08-09 — file names drifted from the bare
  │    `rag/field_monitor.py` / `rag/self_improver.py` this diagram used to imply; current
  │    working tree even has stale copies of those two old filenames staged for deletion.
  │    See `system-harness/REORG-PLAN.md` §5.
  ├─ writes into MemPalace agent-diary drawer (auto-save, wing-scoped) →
  │    next RETRIEVE sees it
  └─ weekly: anneal consolidates MemPalace episodic drawers → dedupe →
       promotes stable patterns to graphify Lesson nodes → sanitization
       gate (warden/veil) strips business data → sanitized pattern ascends
       to Master Graph → available to every brand/client next time
```

**Note on `rag/core/bridge.py` path above:** written in the post-Appendix-A-refactor form to
match Part 0's convention. **Confirmed correct 2026-08-09** — `rag/core/bridge.py` exists and
`rag/__init__.py` already imports from it. Part 1/Part 3 below still have the *pre-refactor*
flat paths; that correction is tracked as the top-priority item in `docs/SESSION-HANDOUT.md`
§2a, not yet applied here (see Open Issues, Issue 1).

### 6.3 Full task workflow — Layer 0 through Layer 11

Expands §6.2's CAOS pipeline into the full CLASSIFY breakdown, task archetypes, team assignment,
tool binding, and the layers surrounding generation. This section supersedes §6.2 as the
canonical reference; §6.2 is retained above as the condensed pipeline view.

#### Layer 0 — Session / Scope

```
Chat opens → brand selector, default = YVON (Master scope)
Operator switches brand → session.brand_scope updates
Every message in this session inherits session.brand_scope — not
re-derived per message
```

**Cross-scope bridge** (sibling owned-brand graphs, e.g. Novizio session asking about Hourbour)
— see `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §8.3 for the full query mechanism. **Confirmed 2026-08-09** (Open
Issues, Issue 5): every owned sibling brand is **always** connected to every other, not gated
behind detecting an explicit cross-brand mention in the query — the earlier "detect explicit
mention" trigger is removed. Results from another brand's wing are still **read-only and
explicitly attributed** to their source wing, never merged into one pool — brands stay separated
even while linked. Master-mediated only for anything touching a client/tenant wing (per
`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §0 Principle 7) — that boundary is unchanged; this confirmation covers
owned siblings only, never client/tenant.

#### Layer 1 — CLASSIFY `[src/cie/classifier.ts]`

**1.1 Entity Resolution** — "what is this message about?" graphify checked first (canonical),
MemPalace as episodic fallback, ambiguous/no-match stops and asks rather than guessing. Full
mechanism: `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §8.1.

**1.2 Impact Radius Check** — for functional changes only (skip for cosmetic). Walks
`consumes`/`produces`/`handoff` edges 1-hop (2-hop if high-fanout) to check whether connected
nodes' purpose is affected. User-specified downstream behavior is followed directly; ambiguous
cases stop and ask. Full mechanism: `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §8.2.

**1.3 Team Assignment** — output is a team, not necessarily one agent:
```
primary_agent = graphify.get_neighbors(entity, "belongs_to")
team = [primary_agent] + [owner of each node touched by 1.2's impact radius]
```
`belongs_to` mechanism resolved 2026-08-09 (Open Issues, Issue 3; §6 above) — code entities
folder-derived, business/content nodes auto-stamped at write time by the creating/last-touching
agent. Historical audit of existing content nodes' frontmatter is the one piece still open.

**1.4 Tool Binding** — baseline (always-loaded per department) vs. task-specific (pulled per
phase/archetype). Cross-referenced against `Teams/Shared OS/tools/shared-tool-registry.md`
rather than duplicated here — see `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §15.2 for the resolution logic.

**1.5 Tool Location Resolution** — repo (in-process) / VPS venv (subprocess bridge, same
pattern as `rag/core/bridge.py`) / on-demand service (`cli/tool.sh status` check first; 12GB
VPS constraint = one heavy service at a time, queueing policy **resolved 2026-08-09** — simple
FIFO wait, no forced eviction, no timeout; a task needing a down service waits until the running
one frees up. Appropriate at current testing-scale load; revisit at production scale (Open
Issues, Issue 4)) / MCP (spawned via relay).

**1.6 Progressive disclosure** — unchanged, §6.2 above.

**1.7 Archetype Mapping** — see Layer 2.

#### Layer 2 — Task Archetypes (7 total) `[built 2026-08-09]`

Full archetype table, department mapping, and Session Memory (2a, for Deep Exploration) moved
to `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §14 — that document owns the graph-query implications of each
archetype; this section is the CLASSIFY-side pointer to it. Built and tested: `src/cie/archetype.ts`
(the §14.1 table + §14.3 department mapping + keyword classification) and
`src/cie/session-memory.ts` (§14.2 — explore/converge/resume session state, local JSON is the
source of truth, best-effort filed into MemPalace as an episodic drawer via `--wing session-memory`,
the closest real approximation to the doc's "distinct drawer type" since MemPalace's CLI has no
literal drawer-type flag).

#### Layer 3 — RESOLVE `[src/cie/graph-resolver.ts]`

Unchanged — see §6.2.

#### Layer 4 — RETRIEVE `[rag/core/bridge.py]` `[built 2026-08-09]`

Base retrieval unchanged (§6.2). Archetype-specific retrieval variants (narrow/wide/distant per
archetype) built and wired: `src/cie/retrieval-shape.ts` maps each of the 7 archetypes (§14.1) to
a real `top_k`/`retrieval_mode` pair on `rag/core/bridge.py`'s actual params — verified there is no
literal "distant recall" mode in `rag/core/retriever.py`, so `'agentic'` (multi-angle query
rewrite) is used as the documented approximation for "wide" archetypes, not invented behavior.
`resolveRetrievalShape()` is live-wired into `src/cie/index.ts`'s main CAOS entrypoint (Step 2,
archetype-derived shape is now the primary signal for retrieval breadth, with an explicit
`params.retrievalMode` still able to override it).

Tool-augmented retrieval (live tool calls treated as freshly-generated context, subject to Gate 1
same as any other source) built as `src/cie/tool-context.ts` — `materializeToolContext()` writes
a tool call's output to `store/tool-context-cache/` so Gate 1's real on-disk `source_file` check
genuinely passes rather than superficially matching field names. Exported from `src/cie/index.ts`
as public API; not yet called from a specific integration point in this repo (awaiting the
tool-execution call site that would invoke it).

Creative-mode variant: `src/cie/creative-retrieval.ts` (`gatherCreativeContext()`) implements the
four-source pull from `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §13.1 — graphify loose/AMBIGUOUS edges
(uses the real `INFERRED` confidence value, since no literal "AMBIGUOUS" tag exists in
`sources/graphify.ts`), MemPalace scoped vs. distant recall (distant = same search with
wing/room filters omitted, since `mempalace search --help` has no similarity-threshold flag to
tune), and kai historical performance — returns `null` with an explicit reason string since kai is
a prompt-only agent definition with no scored-performance dataset anywhere in code. Exported from
`src/cie/index.ts`; not yet called from a Creative Production orchestrator (§7.3) in this repo.
`tsc --noEmit` clean across all three files.

#### Layer 5 — GATE `[built 2026-08-09]`

**5a Precision** (5-gate harness) — unchanged, §6.2. Re-verified: `rag/harness/gates.py` still has
exactly 5 gate functions (`gate_authenticate`, `gate_reliability`, `gate_conflicts`,
`gate_priority_assembly`, `gate_quarantine`).

**5b Creative Gate Chain** (C1–C5) — `src/cie/creative-gate-chain.ts`, full detail in
`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §13.2 `[partially built]`. Per-check status: C1 Brand Voice
Conformance `[built, blocked on config]` — reads real `brand_kit_path`/`voice_guide_path` from
`atlas-config.md`/`lena-config.md`, both `<FILL_IN>` for every brand today, so it correctly reports
`not_configured` rather than fabricating conformance. C2 Novelty/Repetition `[built,
approximated]` — `mempalace search` has no numeric similarity score, so this returns a
hit-count-based flag, not a graduated score. C3 Premortem/Risk `[built]` — genuinely reuses
`rag/harness/gates.py`'s `P5_ADVERSARY` chunk. C4 Predicted Performance `[not available]` — kai
has no scored-performance model anywhere in code; returns `available: false` with a reason rather
than a fake score. C5 Real-World Outcome Capture `[built, untested against real data]` — writes to
`store/creative-outcomes/`, no shipped creative exists yet to exercise it.

**5c Adversarial Gate Logic** — `src/cie/adversarial-gate.ts` (`evaluateAdversarialGate`), full
detail in `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §15.1 `[built]`. Inverted pass condition (a vulnerability
found = pass; silence = not a pass) genuinely reuses the same `P5_ADVERSARY` mechanism as 5b's C3.
Tool resolution (`strix` etc.) is real, via `src/cie/tool-binding.ts`'s `resolveToolBinding()`
(§15.2, live-parses `shared-tool-registry.md`). The coverage-completeness check itself is `[not
built]` — no line/path/endpoint coverage instrumentation exists in this repo; the function flags
`needsCoverageCheck: true` on zero findings rather than fabricating a coverage percentage.
`tsc --noEmit` clean across all three Layer 5 files.

#### Layer 6 — STRATEGY ROUTING + COMPRESSION `[rag/core/unified_pipeline.py]`

Unchanged — see §6.2. (Bare `unified_pipeline.py` filename here corrected to its real path,
same ambiguous-prefix fix already applied to §6.2's own diagram.)

#### Layer 7 — GENERATION `[built 2026-08-09]`

**7.1 Standard trio — `[built]`.** Was `[not built]` earlier the same day (`src/cie/builder.ts`
only formats context, no LLM call anywhere; the live dashboard chat route calls exactly one model
and its own CIE hook was a no-op stub) — built for real as `src/cie/generation-trio.ts`
(`runGenerationTrio`), wired into `src/pipelines/caos-executor.ts` in place of its old hardcoded
stub output line. Archetype-gated by operator decision, not always-on: full trio (primary +
adversarial + creative) only for `PRECISION_CRITICAL` and `ADVERSARIAL_TESTING` — the two
archetypes where a wrong answer is expensive enough to justify 3x cost/latency; everything else is
primary-only. `CREATIVE_PRODUCTION` deliberately skips this trio — it already has its own real
verification mechanism, the C1–C5 gate chain (§5b). No new runtime dependency added (`yvon-engine`
ships zero by design) — raw `fetch()` against each provider's REST API, same native-platform choice
already made elsewhere in `src/cie/`. `OPENAI_API_KEY` does not exist anywhere in this repo
(checked directly) — the creative/chatgpt role is real, callable code but reports `available: false`
with an explicit reason rather than faking a response, same honesty pattern as C4/kai. Verified via
mocked HTTP responses (no real API spend, per operator instruction): gating logic, dependency
chain, and the missing-key degrade path all confirmed live.

**7.2 Engineering team phase execution — `[built]`.** Was `[not built]` earlier the same day
(`graph-resolver.ts` had pipelines for Brand Studio and Governance only; Engineering fell through
to a single default stage; "handoff edge"/"impact radius"/"consumes-edge" existed nowhere in code).
Built for real as `ENGINEERING_PIPELINE` + `ENGINEERING_SECURITY_PHASE` in `graph-resolver.ts`,
replacing the old placeholder "Frontend → Backend → Testing → Security" language with the actual
documented workflow (`Teams/Engineering/DEPARTMENT-WORKFLOW.md`): `raj`+`mia` build in parallel →
`dev` reviews every change → `quinn` gates on two independent verdicts (quality AND
security/charter — either blocks alone) → `ops` ships rollback-first. `aegis`+`cypher` (real
continuous pod in the department doc) are appended as a conditional phase between `dev` and
`quinn` when the change looks security-sensitive — the closest honest single-task approximation of
"continuous coverage" without running two more agents on every trivial change. Sensitivity check
has two tiers: real (`getImpactRadius()` — already-built AST-derived dependency walk,
`sources/graphify.ts` — when a code-entity id is available) falling back to a documented keyword
heuristic on the task text (same pattern as the existing `isCreativeTask`/`isGovernanceTask`
checks) since no caller in this repo threads an entity id through yet. Cypher's gate is inverted
per §5c (a finding is a pass, silence needs a coverage-completeness check) — reuses that logic by
reference rather than re-implementing it. Verified live: non-sensitive Engineering tasks resolve to
the 5-stage base pipeline; a task mentioning "auth token" correctly inserts `aegis`→`cypher` and
re-points `quinn`'s dependency to wait on both `dev` and `cypher`; non-Engineering-keyword tasks
still correctly fall through to the single-agent default, unchanged.

Both `tsc --noEmit` clean.

**7.3 Creative sequence — `[built, corrected]`.** The only one of the three that's real. Actual
built pipeline (`BRAND_STUDIO_PIPELINE` in `graph-resolver.ts`, auto-selected by
`resolveExecutionGraph()` for any task `isCreativeTask()` matches):
```
muse (concepts, dedupe vs. registry) → weave (chapter positioning, continuity)
  → lena (structure/voice/humanic pass) → pixel (shot lists, asset QA)
  → spark (Creative Director gate — Ogilvy 10-test battery, APPROVE/REVISE/REJECT)
```
Five sequential stages, not the three (`spark` → `lena` → `pixel`) this line previously described —
muse and weave run before lena, and spark is the terminal gate, not the opening "direction" stage.
Matches the correction already made in `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §13.3; this section had
not caught up to it until now.

#### Layer 8 — POST-HOC VERIFICATION `[rag/verify/]`

Unchanged — see §6.2.

#### Layer 9 — OUTPUT

```
Shallow/Precision/Synthesis  → single answer
Deep Exploration               → options + reasoning (3-5 shortlisted)
Creative Production            → draft + operator approval before publish
Continuous Monitoring          → not a chat response — MemPalace drawer
                                  + conditional alert if threshold crossed
Adversarial Testing            → findings report, routed regardless of
                                  severity (silence itself is logged)
```

#### Layer 10 — FEEDBACK LOOP

Base loop unchanged (§6.2). Creative-specific (C5 outcome capture feeding C4's prediction model,
self-tuning distant-recall threshold) — `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §13.4 `[planned]` — blocked on
real data, not code: needs C4 predictions (unavailable, kai has no scored model) and real C5
engagement history (mechanism exists, no shipped creative has fed it yet), so there's nothing to
consolidate yet. Monitoring-specific (baseline comparisons writing to the temporal KG timeline) —
`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §14.1's archetype table row 6 `[classification only]` — `archetype.ts`/
`retrieval-shape.ts` correctly classify and shape CONTINUOUS MONITORING tasks, but no actual
scheduled/cron monitoring job or baseline-comparison-writeback mechanism exists anywhere in this
repo yet; only the retrieval shape is built, not the monitoring loop itself.

#### Layer 11 — DISCUSSION CAPTURE `[built 2026-08-09, scope reduced]`

Architecture discussions (like the ones that produced this section) become queryable `Decision`
nodes, scope `meta:architecture`, rather than being lost in chat history. `src/cie/discussion-capture.ts`
(`captureDiscussion`) — live-tested: writes a real §4-shaped Decision node file to
`docs/decisions/` (frontmatter + body + wikilinks, verified byte-for-byte against §4's schema),
then attempts `mineIntoMemPalace` (correctly reports unavailable when `mempalace` isn't on PATH,
rather than silently no-op'ing).

**Load-bearing finding surfaced while building this — affects §4/§5/§6 generally, not just this
layer:** the live `graphify-out/graph.json` was checked directly. Every real node's `file_type` is
`code`, `rationale` (docstrings extracted via AST), or `concept` (config/JSON key references) — all
`_origin: "ast"`. No node type anywhere in the live data matches §5's schema
(`Decision`/`Lesson`/`Agent`/`Task`/etc.), and nothing indicates the installed `graphify` package
reads YAML frontmatter as structured fields at all — it behaves as a pure AST/code tool. **§4's
foundational premise — that graphify parses Node-Zero markdown frontmatter into typed graph
nodes — does not hold against the real installed tool**, independent of how many files in this
repo follow that frontmatter shape. `captureDiscussion()` therefore does the two things that are
real today: writes the human/Obsidian-legible §4-shaped file (forward-compatible if frontmatter
parsing is ever actually built into graphify) and mines it into MemPalace's genuine scoped
semantic search (`meta-architecture` wing) — that's the true half of "queryable graph node" right
now. `graphifyIndexed: false` is returned explicitly on every call rather than implied otherwise.
Full detail and the "worth a dedicated pass across §4/§5/§6" note: `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §15.3.

## 7. Testing — the verification map `[re-verified 2026-08-09]`

Re-run live rather than trusted from the prior count, which had drifted on several fronts: `strategy`
no longer exists (deleted this session, `rag/core/strategy.py` — dead code, no live callers), the
`docs/archive/WORK_TREE.md` "full table" citation points at a file that **does not exist anywhere
in this repo**, and `harness` is 35 passing tests today, not 36.

**`rag/test_runner.py`'s own umbrella — 14/14 modules, 275 tests, zero failures** (confirmed via a
live run just now): `core/injector` 22, `core/destructor` 35, `core/optimizer` 24, `core/retriever`
20, `core/bridge` 16, `core/embed` 12, `core/feedback` 13, `harness/gates` 35, `harness/disclosure`
23, `verify/grounded` 16, `monitor/watcher` 17 (the "field monitor" from earlier session notes —
real filename, see §6.2's Feedback Loop note), `monitor/improver` 20 (the "self-improver"), `eval/judge`
10, `eval/flywheel` 12.

**Two more real, passing suites exist but are not wired into that umbrella** — found by checking
for `run_tests()` outside `test_runner.py`'s `MODULES` dict: `rag/core/unified_pipeline.py`
(`run_tests()`, 31/31 passing, live-run confirmed) and `rag/experiments/e2e.py` (no `run_tests()`
convention — its own standalone script, 40/40 passing across 12 scenarios, live-run confirmed).
Both numbers match what the doc previously claimed for "unified" and "e2e" — those two counts were
accurate, just never actually reachable from `rag/test_runner.py` itself. Worth wiring both into
the umbrella's `MODULES` dict in a future pass so "14/14 modules" becomes "16/16" and reflects the
whole real suite in one command; not done here since it's a code change, not a doc fix.

**True total across every real, live-confirmed passing test in the repo: 346** (275 umbrella + 31
unified + 40 e2e), zero failures, zero fabricated counts. `docs/archive/WORK_TREE.md` itself
doesn't exist as a file, but its content is merged inline as **PART 4 "Complete Work Tree With
Fallbacks"** further down this document (see §13's Document Map) — that section has its own test
table, not independently re-verified against the live numbers above this session.

Entry points:

- `python3 cli/verify-caos.py --quick` — end-to-end smoke. **6 checks today, not 5** (live-run
  confirmed: retrieval, chunk selection, injection CRITICAL marker, NPV formula detection, bridge
  feedback, and CAOS executor end-to-end — the 6th check appears to have been added after this
  doc's "5 checks" note was last written).
- `rag/test_runner.py` — module suites (14 of the 16 real suites; see gap above).
- quinn's real-browser gate for anything frontend (mock data in the DOM is an integrity block).
- `node cli/yvon.js doctor` — fleet health. Runs and reports real status (live-run: 4/11
  operational in this sandbox — Hermes and Claude API correctly flagged as external services,
  consistent with this repo's documented sandbox network limitations elsewhere in this doc); its
  own output has a cosmetic bug worth flagging separately — the ✅/❌ icons don't consistently match
  the status text next to them (e.g. `❌ Graphify (built-in): ✅ Built-in engine`), a `cli/yvon.js`
  code issue, not a doc-accuracy one, so not fixed here.

---

# PART III — THE SYNC FABRIC: dist, toon, hermes, and who decides what

## 8. Source → runtime sync `[built, 84.5% figure corrected 2026-08-09]`

```
Teams/**/*.md               SOURCE OF TRUTH (human-readable, book-grounded)
   │
   ├─ cli/toonify.js  →  *.toon        injectable compressed form (659 files,
   │                                    real measured savings below — NOT
   │                                    84.5%; TASK-SPEC rule: inject_form: .toon)
   ├─ cli/skillgen.js →  dist/skills/  compiled runtime skills (disposable output)
   │
src/ (TypeScript: cie/, pipelines/, toon/, adapters/, agents/, graphs/)
   │
   └─ tsc            →  dist/          compiled JS the runtime actually executes
```

`dist/` is always disposable and regenerable; `Teams/` and `src/` are the only things a human edits. hermes memory syncs *live* (CRDT) rather than compiling — it's state, not source.

**"84.5% avg token savings" was checked directly against the real converted files (2026-08-09) and
is false for this repo's actual `Teams/**/*.md → *.toon` output — not just imprecise, backwards.**
Measured all 659 real `.md`→`.toon` pairs by byte length (the same metric `toonify.js`'s own
`savings` calculation uses): median **-2.4%** (the `.toon` file is typically *larger* than its `.md`
source), mean **-2.6%**, and **495 of 659 files (75%) are larger after conversion, not smaller**.
Only the top quartile shows real savings, topping out at 80.8% on the best individual file. Root
cause: `cli/toonify.js` doesn't use this repo's real TOON dense-encoding engine
(`src/toon/toon.ts`/`compressor.ts`) at all for this conversion — it only abbreviates markdown
headings via a lookup table (`p:`, `s:`, `i:` etc.) and escapes a few characters, which does little
or nothing for prose-heavy agent docs and sometimes adds bytes back via escaping. The real
"80-87% savings vs JSON" figures documented in `src/toon/toon.ts` (§8 further below, PART II) are a
different, legitimate claim about TOON's dense encoding vs. JSON for structured/tabular data — true
of the format, just not of what `cli/toonify.js` actually does to `Teams/` markdown. The two
figures got conflated somewhere upstream of this doc. Two other `84.5%` citations elsewhere in this
file (agent skeleton diagram, TOON compression system's "Key metrics") inherited the same error —
not independently re-derived, corrected together below and in §9 (PART II) rather than left to drift
differently.

## 9. Who decides which agent and which skill — and how it's checked `[re-verified 2026-08-09]`

**Decision chain (forward):**
1. Session rail routing table (`CLAUDE.md` §2) — department + agent by task domain. Confirmed:
   `src/cie/classifier.ts` does real department/task-type classification (8 categories —
   engineering/strategy/governance/brand_marketing/cybersecurity/product_analytics/ai_agents/general
   — via regex keyword matching + agent-department bias), but that's *this* step, not step 3.
2. Multi-agent → meta's task-dispatch assigns work-item owners (`Teams/AI & Agents/meta/custom/task-dispatch`,
   confirmed present); department lead sequences (dev, spark, warden…).
3. Within the agent: `operational/skill/<agent>-skill-routing.md` (all 46 confirmed present) + skill
   `triggers` frontmatter, matched by **`rag/harness/disclosure.py`** — corrected citation:
   `cie/classifier.ts` does NOT do skill-trigger matching or progressive disclosure at all (checked
   its full contents — department classification only); the real mechanism is
   `disclosure.py`'s `parse_skill_triggers()` + `DisclosureEngine.load_for_query()`. Active-skill
   cap is a `max_active` parameter, **default 5, not a hard "2–3"** — "2–3" may describe a typical
   real-world match count for a given query, but the code's actual ceiling is 5; restated here
   rather than implied as the mechanism's fixed behavior.
4. Config values come from `operational/agent/<agent>-config.md`; a `<FILL_IN>` field means ask — never improvise.

**Check chain (backward):** telemetry logs the invocation → gauge measures whether the routed skill
performed → field monitor (`rag/monitor/watcher.py`) detects drift per agent → anneal proposes
routing/skill fixes → self-improver (`rag/monitor/improver.py`) deploys parameter changes after
sandbox tests → Gate 2 reliability (`rag/harness/gates.py`'s `gate_reliability`, confirmed real)
scores shift which sources win next time. `gauge` and `anneal` agent folders both confirmed present
under `Teams/AI & Agents/`; their specific skill implementations for this loop weren't traced
file-by-file here. The forward chain is re-tuned by the backward chain weekly.

---

# PART IV — MACRO: The 4-Layer Multi-Tenant Platform

**"Full design: `docs/archive/Upcoming Plan .md`" is a dead citation** — `docs/archive/` does not
exist anywhere in this repo (checked directly, 2026-08-09), and no other file contains matching
"4-Layer Multi-Tenant" content (repo-wide search). This is the third broken `docs/archive/*`
citation found in this doc this pass, after §7's Testing table and §9's original figure — same
pattern each time: a plausible-sounding path to a file that was never actually written or was
removed without updating what points to it. The section below is the only real source for this
material; there is no separate "full design" doc to cross-check it against. (Brand names
genericized per Playbook §0.4.)

## 10. The stack `[file citations re-verified 2026-08-09]`

**Layer 1 — YVON Core (master control plane).** Master graph vault (Obsidian) `[planned]`; fleet governance: meta + board + precedent + sentinel `[built]`; business profile registry, department deployment engine (`platform/deploy.py`: create tenant vault → copy agent definitions → apply overrides → wire connectors), multi-tenant isolation, cross-tenant learning pipeline `[planned]`. Note: `platform/` doesn't exist in this repo yet (checked directly) — consistent with `[planned]`, not a drift issue, since the path was never claimed as already built.

**Layer 2 — Agent Layer.** Everything in Parts I–II: 46 agents × 7 departments, 5-gate harness, progressive disclosure, grounded verification, self-improvement, 64–91% compression, graph memory. `[built]` — this layer is the shipped core.

**Layer 3 — Integration Layer.** relay owns the MCP tool registry (`Teams/AI & Agents/relay/custom/mcp-tool-registry/assets/tool-registry.md`, confirmed real), integration patterns (idempotency, retry, circuit breaker), and per-tool egress allowlists `[partial]` — corrected count: the registry has **9 tools total (6 of kind MCP, 3 non-MCP: a local repo/script, a local plugin, and a database), not "7 MCP tools"**, and status-wise every entry is `trial` with most `auth`/`egress` fields still `<FILL_IN>` pending operator connection — `[registered, trial]` is more accurate than `[built]` for this row. Connector SDK (`platform/connector_sdk.py`) + 6 pre-built connectors (social, commerce, design, email, analytics, payments) `[planned]` — same `platform/`-doesn't-exist-yet note as Layer 1, consistent with the tag. Least-privilege per agent per tenant (e.g., a creative agent READS analytics; only the social agent POSTS). `[planned]`

**Layer 4 — AgentX Platform (SaaS).** Onboarding flow (business profile → department selection → subscription tier → tenant provisioning), billing tiers, department packages, tenant dashboard. `[planned]`

## 11. Multi-tenant data flow (as shipped)

A tenant message: AgentX resolves tenant graph + profile + integrations (L4) → relay verifies connector health and applies least-privilege + egress allowlist (L3) → the Part-I pipeline runs *scoped to the tenant's graph only* — Gate 1 authenticates against tenant sources, Gate 2 uses per-tenant quality scores (L2) → generation + verification → deliver via dashboard, update tenant graph → anonymized aggregates flow up to the cross-tenant learner → master graph learns industry patterns (posting-time effects, industry-specific query profiles) → tuned defaults flow back down. `[planned]`

**Isolation invariants:** dedicated graph DB per brand, separate SQLite per tenant, raw data never crosses tenant boundaries, only anonymized aggregates ascend; sandbox tests verify no cross-tenant leakage before any deployment. The self-improvement loop of §4 extends per-tenant: per-tenant analysis → cross-tenant aggregation → per-tenant/per-industry/global proposals → per-tenant sandboxes → scoped deploys → master graph log. `[planned]`

## 12. Build order (10 weeks, phased)

Core hardening (2w) → department deployment engine (2w) → AgentX onboarding (2w) → connector marketplace (2w) → cross-tenant learning (1w) → production hardening (1w). "Detail: `docs/archive/Upcoming Plan .md` §Build Order" — same dead citation as Part IV's header above; no such file or `§Build Order` section exists anywhere in this repo. This one-line phase list is the only real content for this build order.

---

## 13. Document Map `[re-verified 2026-08-09 — 7 of 13 rows were dead links]`

**`docs/archive/*.md` don't exist as separate files, but the content isn't gone — it's merged
inline later in this same document.** This document's own line 5 says why: "Nine separate
architecture docs were consolidated here on 2026-07-30... `docs/archive/` was removed in the same
pass." Checked every `*(source: ...)*` attribution line in this file to find exactly where each
one landed — corrected table below points at the real PART, not just "somewhere in the index."

| Need | Go to |
|---|---|
| Session process + ground rules | `CLAUDE.md`, `docs/AGENT-BUILD-PLAYBOOK.md` (was mis-cited as `Teams/AGENT-BUILD-PLAYBOOK.md` — that path doesn't exist; confirmed real at `docs/`) |
| Layer-by-layer pipeline diagrams, fallback matrix, test table | ~~`docs/archive/WORK_TREE.md`~~ → **PART 4 "Complete Work Tree With Fallbacks"** (line ~2593, `*(source: docs/WORK_TREE.md — verbatim)*`) — the real thing, not a substitute. Also cross-check against this document's own §6.3 (Layer 0–11) and §7 (Testing), which were independently re-verified against live code this session — PART 4 was not. |
| Harness build history + data flow | ~~`docs/archive/HARNESS.md`~~ → **PART 2 "Harness: Complete Architecture Plan"** (line ~1656) |
| Strategy benchmark data (12 scenarios) | ~~`docs/archive/PIPELINE_FINAL.md`~~ → **PART 3 "Unified Production Pipeline: Final Report"** (line ~2342) — likely the source of `rag/experiments/e2e.py`'s real "12 scenarios, 40/40 passed" (§7), not independently confirmed as the same data. |
| Fleet census, skill format, Shared OS catalog, CIE/TOON internals | ~~`docs/archive/FULL.md`~~ → **PART 1 "Full Project Architecture"** (line ~936) |
| 4-layer platform design (full) | ~~`docs/archive/Upcoming Plan .md`~~ → **PART 5 "Complete 4-Layer Multi-Tenant Architecture"** (line ~3331, `*(source: docs/4LAYER.md — verbatim)*` — note the source filename doesn't even match "Upcoming Plan.md," a separate small drift on top of the archive path being wrong) |
| Repo layout | ~~`docs/archive/CODE_STRUCTURE.md`~~ → **Appendix A "Code Structure — Refactor Plan"** (line ~4928) |
| Industry patterns adopted | ~~`docs/archive/GOOGLE_PATTERNS.md`~~ → **Appendix B "Google agents-cli Pattern Integration"** (line ~5094) |
| RAG module docs | `rag/README.md` — confirmed real |
| Dept sequencing | `Teams/<Dept>/DEPARTMENT-WORKFLOW.md` — confirmed real, 7/7 departments present |
| Graph/memory design, system & execution architecture (§16 onward) | `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` — confirmed real |
| `/brain` graph viewer (visual model, queries, build roadmap) | `system-harness/graph-brain/YVON-GRAPH.md` — confirmed real |

**Not yet reality-checked this pass:** PART 1, 2, 3, 4, 5 above, PART 6 ("Task-Spec Template," line
~4222), PART 7 ("Unified Workflow Blueprint," line ~4280), PART 8 ("Enforcement," line ~4712), and
Appendices A, B, C (line ~4928–5654) — roughly 4,700 of this document's 5,654 lines. These were
merged verbatim on 2026-07-30 and haven't been individually re-verified against live code the way
§6.2/§6.3/§7/§8/§9/Part IV were this session. Given this session already found a false "84.5%"
headline metric and nine dead file citations in the ~1,000 lines that *were* checked, these larger,
older, un-re-verified sections are a reasonable place to expect more of the same.

---

# ═══════════ PART 1 — FULL PROJECT ARCHITECTURE ═══════════
*(source: docs/FULL.md — verbatim; `docs/FULL.md` does not exist in this repo, checked 2026-08-09 —
see §13's Document Map note. The content below is real and lives here now regardless of where it
originally came from.)*

**Re-verified 2026-08-09 — several claims below were stale.** The 46-agent roster and department
counts (§2) checked out exactly against `src/agents/personalities.ts`, zero discrepancies. What
didn't: bare `rag/*.py` filenames throughout §1's diagram (same missing-`core/`-prefix issue fixed
in §6.2 — `rag/retriever.py`/`rag/embed.py`/`rag/optimizer.py`/`rag/feedback.py` are actually
`rag/core/retriever.py`/`embed.py`/`optimizer.py`/`feedback.py`), the "12 PDF reference books" and
"17 modules, 111 tests" claims below (both corrected in place), and — the biggest one — §3/§4's
agent.md/SKILL.md section templates, which describe a structure that doesn't match any real file
checked (see the note at §3 and §4 below for the actual, verified-uniform templates).

# YVON Engine — Full Project Architecture

**Identity:** YVON Engine v1.3.0 — AI Agent OS Kernel
**Scale:** 46 agents, 7 departments, 1,500+ files
**Instillation:** `npm install` (one command, everything running)

---

## Project At a Glance

```
/Agents/
├── cli/                    CLI entry points (yvon, toonify, verify-caos)
├── src/                    TypeScript source → CIE, pipelines, graphs, TOON
├── dist/                   Compiled JavaScript (npm entry point)
├── rag/                    Python RAG pipeline (16 real test-bearing modules, 346 tests —
│                            re-verified live 2026-08-09, see §7; not the "17 modules, 111 tests"
│                            this line previously claimed)
├── Teams/                  46 agents across 7 departments
│   ├── AI & Agents/        8 agents (meta, proto, relay, forge, etc.)
│   ├── Brand Studio/       11 agents (spark, lena, atlas, muse, etc.)
│   ├── Cybersecurity/      5 agents (warden, keyring, bastion, etc.)
│   ├── Engineering/        11 agents (dev, ops, raj, quinn, etc.)
│   ├── Executive Office/   3 agents (marcus, echo, vista)
│   ├── Governance/         3 agents (board, precedent, sentinel)
│   ├── Product/            5 agents (spec, metric, ux, loom, price)
│   ├── Shared OS/          Shared logical scripts + wisdom documents
│   └── Books/              reference library — 0 PDFs present today (checked 2026-08-09),
│                            explicitly an operator-fill placeholder per Teams/Books/README.md
│                            ("Actual PDF files must be sourced by the operator and placed here"),
│                            not the "12 PDF reference books" this line previously claimed
├── package.json            npm package: yvon-engine
└── README.md               Main project documentation
```

---

## 1. FULL WORKFLOW: Query → Agent → Response

```
                    ┌──────────────────────────────────────┐
                    │          USER ISSUES QUERY            │
                    │  "review this headline for campaign"  │
                    └──────────────┬───────────────────────┘
                                   │
                    ┌──────────────▼───────────────────────┐
                    │      CIE TASK CLASSIFIER              │
                    │  src/cie/classifier.ts               │
                    │  → Classifies task type               │
                    │  → Routes to appropriate agent/skill  │
                    └──────────────┬───────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │  AGENT SELECTION │  │  SKILL ROUTING   │  │  RAG RETRIEVAL   │
    │  src/agents/     │  │  agent.md Skill  │  │  rag/core/bridge.py   │
    │  personalities.ts│  │  Roster section  │  │  ← CIE calls     │
    └────────┬────────┘  └────────┬────────┘  │  rag via stdin    │
             │                    │             └────────┬────────┘
             └────────────────────┼──────────────────────┘
                                  │
                    ┌─────────────▼──────────────────────┐
                    │       RAG RETRIEVAL PIPELINE        │
                    │  rag/core/bridge.py (stdin/stdout)       │
                    └─────────────┬──────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ QUERY REWRITER  │  │ HYBRID RETRIEVER     │  │ FORMULA EXECUTOR    │
│ rag/core/retriever.py│ rag/core/embed.py   │  │ rag/core/bridge.py       │
│                 │  │ (dense + sparse)     │  │ → Shared OS scripts │
│ Lasswell model  │  │ + sqlite-vec store   │  │ Detect NPV, WACC,   │
│ expand→3-5 vars │  │ chunk similarity     │  │ risk scores, etc.   │
└────────┬────────┘  └──────────┬──────────┘  └──────────┬──────────┘
         │                      │                        │
         └──────────────────────┼────────────────────────┘
                                │
                    ┌───────────▼───────────────────────────┐
                    │       CROSS-ENCODER RE-RANKER          │
                    │  rag/core/retriever.py — CrossEncoderReranker│
                    │  Re-ranks top-20 → top-5 by precision   │
                    └───────────┬───────────────────────────┘
                                │
                    ┌───────────▼───────────────────────────┐
                    │       CONTEXT OPTIMIZER               │
                    │  rag/core/optimizer.py                │
                    │  → Select retrieval profile           │
                    │  → Enforce tier allocation (Pareto)   │
                    │  → Enforce source diversity           │
                    │  → Inject adversarial chunk (premortem)│
                    └───────────┬───────────────────────────┘
                                │
                    ┌───────────▼───────────────────────────┐
                    │       UNIFIED INJECTION PIPELINE ★     │
                    │  rag/core/unified_pipeline.py              │
                    │                                       │
                    │  ┌─ DOMAIN KEYWORD CLASSIFIER ────┐   │
                    │  │  GDPD/CCPA → legal_review       │   │
                    │  │  NPV/WACC → financial_analysis  │   │
                    │  │  NIST/ISO → compliance_check    │   │
                    │  │  acquire → strategic_analysis   │   │
                    │  │  pipeline → engineering_debug   │   │
                    │  │  headline → creative_review     │   │
                    │  └─────────────────────────────────┘   │
                    │                                       │
                    │  ┌─ STRATEGY ROUTER ──────────────┐   │
                    │  │                                  │   │
                    │  │  creative/copy/factual → FAST    │   │
                    │  │  everything else → BALANCE       │   │
                    │  └──────────────┬──────────────────┘   │
                    │                 │                      │
                    │     ┌───────────▼───────────┐          │
                    │     │                       │          │
                    │  ┌──▼──────┐         ┌──────▼──────┐   │
                    │  │  FAST   │         │   BALANCE   │   │
                    │  │Destructor│         │ Adaptive +  │   │
                    │  │   v2    │         │  Recovery   │   │
                    │  │         │         │             │   │
                    │  │ • 80t   │         │ • Adaptive  │   │
                    │  │   budget│         │   budget    │   │
                    │  │ • Strip │         │ • Strip     │   │
                    │  │   only  │         │   essentials│   │
                    │  │ • No    │         │ • Recovery  │   │
                    │  │   recov │         │   pass (5   │   │
                    │  │ • 89%   │         │   triggers) │   │
                    │  │   save  │         │ • 39-77%    │   │
                    │  │         │         │   save      │   │
                    │  └──┬──────┘         └──────┬──────┘   │
                    │     │                       │          │
                    │     └───────────┬───────────┘          │
                    │                 │                      │
                    │    ┌────────────▼────────────┐         │
                    │    │   FINAL INJECTION TEXT   │         │
                    │    │  with citations, rules,  │         │
                    │    │  numbers, computed facts │         │
                    │    └─────────────────────────┘         │
                    └───────────────────┬───────────────────┘
                                        │
                    ┌───────────────────▼───────────────────────┐
                    │         LLM GENERATES RESPONSE            │
                    │  Agent persona + skills + injected context │
                    └───────────────────┬───────────────────────┘
                                        │
                    ┌───────────────────▼───────────────────────┐
                    │         FEEDBACK LOOP                     │
                    │  rag/core/feedback.py                     │
                    │  → Log acceptance/rejection               │
                    │  → Update chunk quality scores            │
                    │  → Record Lasswell trace for audit        │
                    └───────────────────────────────────────────┘
```

---

## 2. THE 46-AGENT FLEET

### AI & Agents Department (8 agents)
```
meta        Fleet governance & standards      agent-architecture-standards, fleet-governance
proto       Rapid prototyping                 agent-prototype-kit, eval-first-design
relay       Integrations & security           mcp-tool-registry, integration-patterns
forge       Model/technique benchmarking      benchmarking-discipline, degradation-diagnosis
gauge       Fleet quality monitoring          agent-quality-scorecard, fleet-health-report
anneal      Continuous improvement            self-annealing-loop, skill-lifecycle
scout       Ecosystem scanning                ecosystem-scanning, marketplace-skill-scouting
edge        Cutting-edge tech adoption        landscape-assets, tech-adoption-criteria
```

### Brand Studio Department (11 agents) — Creative Engine
```
spark       Creative director (Ogilvy persona)     art-direction-critique, coherence-qa
lena        Copywriting & brand voice              humanic-writing, voice-guides
atlas       Brand guidelines & identity            brand-guidelines, multi-brand-system
muse        Creative ideation                      concept-library, generate-creative-ideas
weave       Brand storytelling & narrative         brand-story-arcs, brand-storytelling
pixel       Visual assets & images                 asset-pipeline, image-style-guide
pulse       Social media & community               community-engagement, hook-writing
rio         Paid advertising                       ad-platform-mechanics, ad-thresholds
nate        Growth & experimentation               experiment-backlog, ab-test-analysis
kai         Marketing analytics & SEO              marketing-dashboards, seo-strategist
tempo       Audio/sound identity                   sound-identity, usage-licensing
```

### Cybersecurity Department (5 agents)
```
warden      GRC (CISO persona)                     risk-register, security-policy-framework
keyring     Identity & access management           access-reviews, privileged-access-management
bastion     Infrastructure/network security        cloud-posture, hardening-baselines
cortex      Detection & response                   security-incident-response, threat-hunting
veil        Data protection & privacy              breach-notification, data-loss-prevention
```

### Engineering Department (11 agents)
```
dev         Architecture & standards (Vogels)      architecture-decisions, code-review-standards
ops         DevOps / SRE                           incident-response, release-discipline
cypher      Offensive security / pen-testing       attack-playbooks, continuous-attack-loop
aegis       App/API security                       secure-code-review, threat-model
axiom       Algorithms & data structures           algorithm-review, complexity-analysis
rank        SEO & discoverability                  claude-seo-integration, structured-data-geo
quinn       QA & testing                           eval-harness, test-strategy
dana        Databases & data engineering            data-modeling, migration-discipline
raj         Backend services & APIs                api-standards, service-patterns
mia         Front-end engineering                  design-tokens, frontend-performance
nova        Mobile development                     app-store-release-discipline, mobile-app-architecture
```

### Executive Office (3 agents)
```
marcus      Strategy & vision (Steve Jobs)         decision-critic, okr-cascade, venture-priority-matrix
echo        Investor relations & pitch             pitch-framework, investor-update-generator
vista       Roadmap & prioritization               roadmap-sync, rice-prioritization
```

### Governance Department (3 agents)
```
board       Fiduciary oversight (Munger persona)   constitution-enforcement, fiduciary-guard
precedent   Legal/compliance consistency           case-law-method, ruling-log
sentinel    Audit & bypass detection               constitution-watch, gate-bypass-detection
```

### Product Department (5 agents)
```
spec        PRD & requirements                     prd-discipline, acceptance-criteria-handoff
metric      Product analytics                      metrics-governance, product-metrics-spec
ux          UX research                            research-repository, study-design
loom        Validation & PMF                       assumption-mapping, experiment-discipline
price       Pricing & packaging                    packaging-tiers, pricing-experiment-discipline
```

---

## 3. EACH AGENT'S STRUCTURE

Every one of the 46 agents follows this exact skeleton:

**agent.md's claimed 6-section template below does not match reality — corrected 2026-08-09.**
Checked two real files (`Teams/Engineering/dev/agent.md`, a leader, and `Teams/Engineering/quinn/agent.md`,
a non-leader) — both have the identical real structure, 8 sections: **Purpose, Position in the Org,
Skill Roster (N), Skill Chain (summary), Identity, Operational Layer, Logical Layer, Workflow
Structure.** There is no "Summary" or "Status" section anywhere in either file — this wasn't a
leader-vs-non-leader difference, both real files matched each other and neither matched the claim
below.

```
agent-name/
│
├── agent.md                  Real structure (verified 2026-08-09, not the 6-section
│   │                          "Summary · Purpose · Position · Skill Roster · Status ·
│   │                          Workflow" this line used to claim): Purpose, Position in
│   │                          the Org, Skill Roster (N), Skill Chain (summary), Identity,
│   │                          Operational Layer, Logical Layer, Workflow Structure — 8
│   │                          sections, confirmed identical across a leader and non-leader agent
│   └── agent.toon            TOON-compressed version (real measured savings vary widely,
│                              median -2.4% — see §8's correction; not the 84.5% figure
│                              this line previously claimed)
│
├── identity/                 [REQUIRED] Agent persona
│   └── README.md / persona.md    "You are X. Your role is Y."
│       (e.g., spark: David Ogilvy persona, marcus: Steve Jobs,
│        board: Charlie Munger, dev: Werner Vogels, warden: CISO)
│
├── custom/                   Custom skills (real SKILL.md template below, §4, is
│                              also corrected — this line's "9-section: Definition ·
│                              Triggers · Input · Output · Examples · Constraints ·
│                              Verification" names don't match any real file)
│   ├── skill-a/SKILL.md
│   ├── skill-b/SKILL.md
│   │   └── assets/                Templates, manifests, reference docs
│   └── ...                        (1-5 custom skills per agent, not "2-5" — 5 of 46
│                                    agents have exactly 1, confirmed via a full live count)
│
├── logical/                  [OPTIONAL] Logical script requirements
│   └── book-requirements.md       Which Shared OS scripts this agent needs
│
├── marketplace/              [OPTIONAL] Shared/marketplace skills
│   └── market-skill/SKILL.md      e.g., meta has writing-skills in marketplace
│
├── operational/              [REQUIRED] Configuration
│   ├── agent/<name>-config.md           Agent runtime configuration
│   ├── commands/<name>-commands.md      Command definitions & routing
│   ├── principles/<name>-principles.md  Operating principles & constraints
│   ├── skill/<name>-skill-routing.md    Which skills → which query types
│   └── tool/<name>-tool-requirements.md Tool access & permission specs
│
└── logical/ other docs       [PER DEPARTMENT]
    └── DEPARTMENT-WORKFLOW.md   How agents interact within this department
```

**Total agent-specific files: ~650 `.md` + ~650 `.toon` = ~1,300 files across 46 agents**

---

## 4. SKILL SYSTEM

### What is a SKILL.md?

**The template below does not match any real SKILL.md — corrected 2026-08-09.** Checked 5 real
files at random, spanning 5 different departments (Engineering ×2, AI & Agents, Executive Office):
every one uses the identical real template, none matching a single section name claimed below. The
section *count* (9, sometimes 10 with an agent-specific dated-log section inserted before
Principles) happened to be coincidentally close to right — the names weren't.

Real, verified-uniform template:

```markdown
# Skill Name
## Introduction
## Purpose
## When to Use
## Structure / Protocol
## Instructions
## Output Format
## [optional: an agent-specific dated-log section, e.g. "Frontend Performance: [page/flow]"]
## Principles
## Fallback
## Boundaries with Other Skills
```

(The previously-claimed "Definition · Triggers · Input · Output · Examples · Constraints ·
Verification · Tool Requirements · References" template isn't shown here — checked against 5 real
files across 5 departments, none matched it.)

### Skill Types

| Type | Location | Example |
|------|----------|---------|
| **Custom Skills** | `agent-name/custom/` | spark has `art-direction-critique/SKILL.md` |
| **Marketplace Skills** | `agent-name/marketplace/` | meta has `writing-skills/SKILL.md` |
| **Cross-Cutting Skills** | `Shared OS/skills/` | `verification-before-completion/SKILL.md` |
| **Operational Skills** | Automatically loaded from `operational/skill/` | `meta-skill-routing.md` |

### Total Skills: 193 `SKILL.md` files across all 46 agents (live count 2026-08-09, not "~200+")

---

## 5. SHARED OS — THE LOGICAL SCRIPTS (35 Python modules)

All agents share a common library of executable formula scripts. These are NOT LLM calls — they're deterministic Python functions.

### Finance & Strategy (5 scripts)
```
capital_budgeting.py        NPV, WACC, IRR, CAPM, payback period
investor_metrics.py         LTV/CAC, burn multiple, rule of 40, magic number
venture_valuation.py        Cap table math, dilution, ESOP pools
decision_analysis.py        Decision trees, expected value, sensitivity
forecasting.py              ARIMA, exponential smoothing, regression
```

### Marketing & Brand (4 scripts)
```
marketing_laws.py           25 universal marketing principles (Lasswell, Pareto, etc.)
brand_metrics.py            Brand equity scoring, association strength
content_performance.py      STEPPS + SUCCESs composite scoring (viral potential)
pricing_methods.py          Van Westendorp, Gabor-Granger, conjoint analysis
```

### Security & Risk (4 scripts)
```
risk_management.py          NIST RMF: risk = impact × likelihood, risk appetite
security_assessment.py      CVSS scoring, OWASP testing, vulnerability assessment
identity_zero_trust.py      Zero-trust architecture, IAM policy engine
incident_response.py        Incident severity classification, patch prioritization
```

### Engineering & DevOps (7 scripts)
```
swe_practices.py            Code quality metrics, technical debt scoring
test_design.py              Test case generation, coverage analysis, attack patterns
sre_methods.py              SLO/SLI/SLA calculation, error budgets
web_performance.py          Core Web Vitals, browser networking metrics
api_design.py               REST maturity model, HTTP status decision trees
algorithm_analysis.py       Complexity analysis, algorithm selection framework
data_systems.py             CAP theorem decisions, consistency models
```

### Governance & Legal (4 scripts)
```
governance_gate.py          4-gate cycle: recommend→review→approve→audit
case_law_method.py          Precedent reasoning engine, stare decisis
privacy_compliance.py       GDPR/CCPA compliance checklist & scoring
audit_sampling.py           Statistical audit sampling (MUS, attribute sampling)
```

### Product & Experimentation (5 scripts)
```
experiment_methods.py       A/B test design, sample size, significance
rice_prioritization.py      RICE, WSJF, Cost of Delay scoring
signal_detection.py         Statistical significance, MDE, power analysis
ux_research_methods.py      SUS scoring, heuristic evaluation, task success rate
pitch_validation.py         Pitch deck narrative scoring, investor readiness
```

### Fleet & Organization (5 scripts)
```
fleet_measurement.py        Agent health, staleness scoring, skill coverage
staleness_economics.py      Knowledge decay curves, maintenance cost models
planning_fallacy.py         Reference-class forecasting, calibration weighting
storyline_engine.py         McKee 5-part structure + Miller StoryBrand SB7
competitive_strategy.py     Porter's Five Forces, value chain analysis
```

### Prompt Engineering (1 script)
```
prompt_craft.py             Cinematographic prompt vocabulary builder
```

---

## 6. RAG PIPELINE — FULL ARCHITECTURE `[re-verified 2026-08-09]`

**Two corrections:** every bare `rag/*.py` path below is missing its real `core/` prefix (same
issue already fixed in §6.2/PART 1 §1 — `chunkify.py`, `embed.py`, `optimizer.py`, `retriever.py`,
`injector.py`, `feedback.py`, `bridge.py` are all really `rag/core/*.py`, confirmed live). More
significantly: **ELEMENT 7 (`rag/strategy.py`, "23 tests") no longer exists** — `rag/core/strategy.py`
was deleted earlier this session as dead code (no live callers; part of the ponytail-audit cleanup,
see the earlier task log) — it's not a path typo like the others, the module and its 23 tests are
genuinely gone. §7's real, live-verified module list (16 modules, 346 tests) does not include a
strategy module. The remaining 7 elements are otherwise real.

### The 8 Elements (one, Element 7, no longer exists — see note above)

```
ELEMENT 1: SEMANTIC CHUNKER
  rag/core/chunkify.py
  → Splits documents by heading boundaries (not tokens)
  → Assigns priority tiers (T1=load-bearing, T2=structural, T3=supplementary)
  → Tags adversarial variants (same claim, different framing)
  → Output: chunks.json + sqlite-vec vector store

ELEMENT 2: HYBRID EMBEDDER
  rag/core/embed.py
  → Dense embeddings: sentence-transformers (all-MiniLM-L6-v2)
  → Sparse embeddings: TF-IDF with learned vocabulary
  → Vector store: SQLite + sqlite-vec extension
  → Combined similarity: 65% dense + 35% sparse

ELEMENT 3: CONTEXT OPTIMIZER
  rag/core/optimizer.py
  → Task complexity classifier (4 profiles: quick_check, standard_review,
    deep_analysis, governance_gate)
  → Chunk quality scoring (tier, freshness, historical quality, citations)
  → Diversity enforcer (max per source, max per heading)
  → Tier allocation (Pareto 80/20: 80% budget to T1)
  → Adversary injector (Kahneman premortem: "assume our plan failed")

ELEMENT 4: FULL RETRIEVAL PIPELINE
  rag/core/retriever.py
  → Query rewriter (Lasswell model: expand 1 query → 3-5 variants)
  → Hybrid retrieval (dense + sparse + metadata filter)
  → Cross-encoder re-ranker (lightweight heuristic: term overlap, key phrase,
    structure relevance, citation presence)
  → Context compressor (keep Commander's Intent + citation per chunk)
  → Format injection (Cialdini Authority: citations BEFORE content)

ELEMENT 5: SMART INJECTOR
  rag/core/injector.py (22 tests)
  → Layer 1: Sentence-Level Relevance Pruning (60-85% savings)
      Score every sentence against query. Keep Commander's Intent + citations.
      Drop filler, introductions, examples, metacommentary.
  → Layer 2: Citation-Only Mode for Formula Queries (85-95% savings)
      When Shared OS scripts computed a value, drop formula explanation.
      "[COMPUTED] npv() = $137,236 [Brealey & Myers, Ch.5]"
  → Layer 3: Agent-Specific Compression Profiles
      46 agents → 5 compression types (creative, governance, strategy, technical, general)
      Spark: verbatim, image-friendly. Board: formula-only, NEVER image numbers.

ELEMENT 6: FEEDBACK LOOP
  rag/core/feedback.py
  → Log every injection outcome (accept/reject)
  → Update chunk quality scores based on outcomes
  → Lasswell trace for audit: who said what, to whom, in which channel, with what effect

ELEMENT 7: MULTI-STRATEGY ENGINE — DELETED 2026-08-09, this element no longer exists
  rag/strategy.py (23 tests)   [dead code removed this session — no live callers found]
  → Content type classifier (5 types: formula, creative, structured, prose, citation)
  → Strategy selector per chunk (auto-routes to best compression path)
  → pxpipe integration: image-friendly chunks → PNG (67% vision token savings)
  → Exact values (numbers, citations, computed facts) NEVER imaged

ELEMENT 8: UNIFIED PRODUCTION PIPELINE ★
  rag/core/unified_pipeline.py (31 tests)
  → Domain keyword classifier (fixed — prioritizes domain terms over generic verbs)
  → Strategy router: FAST (Destructor v2) vs BALANCE (Adaptive+Recovery)
  → 5-trigger recovery pass: novel_fact, exception, contradiction,
    missing_source, defines_term
  → Single entry point: unified_pipeline.inject(query, agent_id, chunks)
```

### Pipeline Data Flow

```
┌──────────────────┐
│  DOCUMENTS (.md) │
└────────┬─────────┘
         │ core/chunkify.py
         ▼
┌──────────────────┐     ┌──────────────────┐
│  chunks.json     │────▶│  core/embed.py    │
│  priority tiers  │     │  dense + sparse   │
│  adversarial     │     │  → sqlite-vec     │
└──────────────────┘     └────────┬─────────┘
                                  │
         ┌────────────────────────┼───────────────────────┐
         │                        ▼                       │
         │              ┌──────────────────┐              │
         │              │  core/bridge.py   │  ← CIE call │
         │              │  stdin/stdout     │              │
         │              │  JSON protocol    │              │
         │              └────────┬─────────┘              │
         │                       │                        │
         │     ┌─────────────────┼─────────────────┐      │
         │     ▼                 ▼                 ▼      │
         │ ┌─────────┐   ┌─────────────┐   ┌───────────┐ │
         │ │retriever│   │formula exec │   │ optimizer  │ │
         │ │query→   │   │detect NPV,  │   │task class │ │
         │ │rewrite→ │   │WACC, risk → │   │diversity→ │ │
         │ │retrieve→│   │compute→     │   │adversary→ │ │
         │ │rerank   │   │inject facts │   │tier alloc │ │
         │ └────┬────┘   └──────┬──────┘   └─────┬─────┘ │
         │      └───────────────┼─────────────────┘      │
         │                      ▼                        │
         │           ┌─────────────────────┐             │
         │           │ core/unified_pipeline.py│ ★        │
         │           │ ┌─────────────────┐ │             │
         │           │ │ classify query  │ │             │
         │           │ │ route strategy  │ │             │
         │           │ ├─────────────────┤ │             │
         │           │ │ FAST   │BALANCE │ │             │
         │           │ │destruct│adapt+  │ │             │
         │           │ │  v2    │recovery│ │             │
         │           │ └────────┴────────┘ │             │
         │           └──────────┬──────────┘             │
         │                      ▼                        │
         │           ┌─────────────────────┐             │
         │           │ INJECTION TEXT      │             │
         │           │ → LLM context       │             │
         │           └──────────┬──────────┘             │
         │                      ▼                        │
         │           ┌─────────────────────┐             │
         │           │ FEEDBACK LOOP       │             │
         │           │ log outcome →       │             │
         │           │ update quality →    │             │
         │           │ Lasswell trace      │             │
         │           └─────────────────────┘             │
         └──────────────────────────────────────────────┘
```

---

## 7. BRIDGE PROTOCOL — CIE ⇆ RAG INTEGRATION

The TypeScript CIE communicates with the Python RAG pipeline via subprocess stdin/stdout JSON:

```
CIE (TypeScript)                              RAG (Python)
     │                                              │
     │  echo '{"query":"...","agent_id":"..."}'     │
     │  | python3 rag/core/bridge.py --mode retrieve     │
     ├─────────────────────────────────────────────▶│
     │                                              │
     │                    ┌─────────────────────┐    │
     │                    │ 1. Detect formulas  │    │
     │                    │ 2. RAG retrieval    │    │
     │                    │ 3. Optimize context │    │
     │                    │ 4. Compress inject  │    │
     │                    │ 5. Format response  │    │
     │                    └──────────┬──────────┘    │
     │                               │               │
     │  {"success":true,             │               │
     │   "injection_text":"...",     │               │
     │   "computed_formulas":[...],  │               │
     │   "trace":{...}}              │               │
     │◀──────────────────────────────┘               │
     │                                              │

Three modes:
  --mode retrieve   → query → injection_text + computed facts + trace
  --mode formula    → direct formula execution (no retrieval)
  --mode feedback   → log outcome → update quality scores
```

---

## 8. CIE (CONTEXT INTELLIGENCE ENGINE) — TypeScript Core `[re-verified 2026-08-09 — list was missing 13 files]`

The 10 top-level files and 6 sources below are all real, but `src/cie/` now has **23** top-level
`.ts` files and `src/cie/sources/` has **9** — this list predates a lot of later work (including
some from earlier today: `generation-trio.ts`, §7.1). Real, complete listing:

```
src/cie/
├── index.ts              Module entry point
├── types.ts              Type definitions (InjectionRequest, RetrievalResult, etc.)
├── classifier.ts         Task classification → routes to agent + skill
├── retriever.ts          Knowledge retrieval → calls bridge.py
├── ranker.ts             Re-ranks context for relevance
├── builder.ts            Builds final context payload for LLM (formatting only — no LLM call;
│                          see §6.3 Layer 7.1's correction, this doc, for the real generation trio)
├── cache.ts              Context caching layer (LRU)
├── graph-resolver.ts     Knowledge graph resolver + department execution pipelines (§6.3 Layer 7.2)
├── rag-bridge.ts         Bridge: TypeScript → Python via subprocess
├── algorithms.ts         Bloom filter, MinHash, TF-IDF, Priority Queue, BFS, Circuit Breaker
├── archetype.ts          Task archetype classification (§6.3 Layer 2, 7 archetypes)
├── retrieval-shape.ts    Archetype → retrieval breadth/mode mapping (§6.3 Layer 4)
├── generation-trio.ts    Archetype-gated primary/adversarial/creative generation (§6.3 Layer 7.1)
├── creative-retrieval.ts Creative Retrieval Mode, 4-source pull (§6.3 Layer 4, GRAPH-BRAIN-DESIGN §13.1)
├── creative-gate-chain.ts C1–C5 Creative Gate Chain (§6.3 Layer 5b)
├── adversarial-gate.ts   Adversarial Testing archetype's inverted gate logic (§6.3 Layer 5c)
├── tool-binding.ts       Resolves tool locations against shared-tool-registry.md (§6.3 Layer 5c)
├── tool-context.ts       Materializes live tool-call output as a real Gate-1-passable chunk
├── session-memory.ts     Deep Exploration session state (explore/converge/resume)
├── discussion-capture.ts Architecture-discussion → Decision-node capture (§6.3 Layer 11)
├── entity-resolution.ts, team-assignment.ts, cross-scope-bridge.ts  — exist, not traced this pass

src/cie/sources/          Knowledge sources (where CIE pulls context from)
├── agent-memory.ts       Agent's own memory/experience
├── codegraph.ts          Code dependency graph
├── graphify.ts           Code structure graph (also: getImpactRadius/getNeighbors/queryGraph —
│                          real AST-derived graph-query primitives, §6.3 Layer 7.2)
├── hermes-memory.ts      Hermes agent memory (CRDT-synced)
├── project-docs.ts       Project documentation (.md files)
├── shared-os-logical.ts  Shared OS logical scripts (35 Python modules)
└── mempalace.ts, venture-agents.ts, ventures.ts  — exist, not traced this pass
```

---

## 9. TOON COMPRESSION SYSTEM

```
src/toon/
├── toon.ts          Core TOON type definitions / encoding
├── compressor.ts    TOON compression engine
└── delta.ts         Delta (differential) TOON updates

Key metrics (`src/toon/` encoding vs. JSON — a different claim from `cli/toonify.js`'s
markdown-heading-abbreviation conversion; see §8's correction, PART III, for that one):
  → toon.claude() mode: 80-87% savings vs JSON (per its own header comment, not independently
    re-verified here — this is about TOON's dense encoding of structured data, not about
    Teams/**/*.md conversion)
  → Every .md file has a parallel .toon file (659/700, 94.1% coverage — confirmed live via
    `node cli/toonify.js --status`)
  → 659 .toon files across the project (confirmed live, not "~650")
```

---

## 10. GOVERNANCE PIPELINES (TypeScript) `[re-verified 2026-08-09]`

**Correction to a mistake made and caught within this same editing pass:** a stale session note had
this section down as "2 of 3 files deleted" — checked directly and that's wrong. All three files
are real, present, and `content-pipeline.ts`/`governance-gate.ts` are genuinely exported from
`src/index.ts` (`export { ... } from './pipelines/content-pipeline'` etc., confirmed via grep) —
intentional public API of the `yvon-engine` package, not dead code. (This mirrors a false-positive
this session already caught once before with the same two files, from an audit subagent's grep-only
caller-count heuristic — worth remembering that heuristic keeps producing the same wrong answer on
these two specific files.) `content-pipeline.ts`'s own `CONTENT_PIPELINE` array already has the
correct `muse→weave→lena→pixel→spark` sequence (matches `graph-resolver.ts`'s
`BRAND_STUDIO_PIPELINE` in spirit, though it's a separate, independent array — not obviously wired
together, not traced further here). `governance-gate.ts`'s `requiresGovernanceReview()` takes
`gateThreshold` as a caller-supplied parameter — the specific "$10K / $50K / $250K" figures below
aren't hardcoded constants in this file; not confirmed as accurate or inaccurate, just not found
here.

```
src/pipelines/
├── caos-executor.ts      CAOS (Context-Aware Orchestration System)
│                          Orchestrates multi-agent workflows via graph-resolver.ts's execution
│                          graphs; generation calls now go through generation-trio.ts (§6.3 Layer 7.1)
│
├── content-pipeline.ts   Content processing pipeline — real, exported, confirmed 2026-08-09
│                          Brand Studio agents: muse→weave→lena→pixel→spark (own CONTENT_PIPELINE
│                          array, matches graph-resolver.ts's BRAND_STUDIO_PIPELINE in sequence)
│
└── governance-gate.ts    Governance gate pipeline — real, exported, confirmed 2026-08-09
                           5 named gates: constitution→strategic-veto→fiduciary→pre-mortem→risk-matrix
                           Board + precedent + sentinel interaction
                           Fiduciary threshold is a caller-supplied param, not a hardcoded constant
```

---

## 11. KNOWLEDGE FOUNDATION `[corrected 2026-08-09 — fabricated]`

**The 12-PDF listing below is fabricated — not stale, invented.** `Teams/Books/` really contains
only `README.md` and `README.toon`; its own README says this is intentional ("Actual PDF files
must be sourced by the operator and placed here"). Every title/author/file-size below is invented
on top of that. The 6 Route D wisdom docs just below, by contrast, are real — confirmed present.

Plus 6 Route D wisdom documents (`Teams/Shared OS/logical/`):
```
ogilvy-creative-code.md        Ogilvy's creative principles (Ch.1, p.20)
aaker-brand-equity.md          Aaker's brand equity model (Ch.3)
berger-contagious.md           Berger's STEPPS framework
binet-field-effectiveness.md   Binet & Field effectiveness model
heath-made-to-stick.md         Heath brothers SUCCESs framework
mckee-story-structure.md       McKee's 5-part story structure
```

---

## 12. COMPLETE TEST SUITE `[re-verified 2026-08-09 — see §7 for the real, live-run numbers]`

Every path below is missing its real `core/` (or `experiments/`) prefix, `rag/strategy.py` no
longer exists (deleted this session, dead code), and the "111" total is stale. §7 elsewhere in
this document has the actual live-run figures — **16 real test-bearing modules, 346 tests total**
— not reproduced again here to avoid two numbers drifting apart from each other.

```
Module                          Tests    Status
──────────────────────────────────────────────
rag/core/injector.py             22      ✅ All passing
rag/strategy.py                  —       DELETED 2026-08-09, no longer exists
rag/core/destructor.py           35      ✅ All passing
rag/core/unified_pipeline.py     31      ✅ All passing
──────────────────────────────────────────────
See §7 for the real current total (346, across 16 modules) — "111" above was stale even
before rag/strategy.py's deletion; see §7 for the reconciliation.
```

Plus separate test suites in:
- `rag/core/retriever.py` — Full pipeline smoke tests
- `rag/core/optimizer.py` — Task classification + quality scoring
- `rag/experiments/benchmark.py` — comparison suite (not independently re-verified this pass)
- `cli/verify-caos.py` — E2E CAOS verification, **6 checks live-confirmed** (§7), not the count
  implied elsewhere in this doc before correction

---

## 13. COMMANDS `[re-verified 2026-08-09]`

`npx yvon compress` doesn't exist — checked `cli/yvon.js`'s real command dispatch table directly:
`{ init, toonify, doctor, graph, agents, dashboard, integrate, version }`. The real equivalent is
`npx yvon toonify` (or `node cli/toonify.js --all`, already listed below). `rag/strategy.py` is
deleted (dead code, this session); its command line is struck below rather than removed outright,
so this stays a record of what changed and why.

```bash
# Python RAG tests
python3 rag/core/unified_pipeline.py --test   # 31 tests
python3 rag/core/destructor.py --test         # 35 tests
python3 rag/strategy.py --test                # DELETED 2026-08-09 — no longer exists
python3 rag/core/injector.py --test           # 22 tests
python3 rag/core/destructor.py --demo         # Budget guarantee demo
python3 rag/core/unified_pipeline.py --demo   # 12-scenario strategy demo
python3 rag/experiments/benchmark.py          # comparison suite

# TypeScript (requires npm install)
npx yvon init      # Initialize YVON in current directory
npx yvon doctor    # Health check on fleet
npx yvon graph     # Show knowledge graph
npx yvon agents    # List all agents
npx yvon toonify   # TOON-compress Teams/ directory (not "npx yvon compress" — no such command)
npx yvon dashboard # Visual dashboard

# CLI tools
node cli/toonify.js --all                     # TOON compression
python3 cli/verify-caos.py                    # E2E CAOS verification — 6 checks live-confirmed (§7)
```

---

## 14. SINGLE ENTRY POINT FOR RAG `[import path corrected 2026-08-09]`

`inject()` is real, confirmed at `rag/core/unified_pipeline.py` line 575 — but the import path
below was missing `core.` (same recurring bare-path issue as everywhere else this pass). The
result-field example values (task_confidence 0.60, savings_pct 38.8%, etc.) are illustrative, not
independently re-verified against a live call this pass.

```python
from rag.core.unified_pipeline import inject

result = inject(
    query="verify our data retention policy complies with GDPR Article 5",
    agent_id="comply",
    chunks=retrieved_chunks
)

# result.strategy          → "balance"
# result.task_type         → "legal_review"
# result.task_confidence   → 0.60
# result.budget_tokens     → 385 (4.0× multiplier)
# result.savings_pct       → 38.8%
# result.quality_score     → 0.955
# result.kept_chunks       → 8
# result.recovered_chunks  → 3
# result.dropped_chunks    → 9
# result.contradictions    → 0
# result.injection_text    → "[YVON · comply · Legal Review · 385t]\n⚠️ [gdpr-compliance.md] ..."
```

---

# ═══════════ PART 2 — HARNESS: COMPLETE ARCHITECTURE PLAN ═══════════
*(source: docs/HARNESS.md — verbatim)*

**Read this as history, not current state.** Dated 2026-07-16, self-labeled "Design Phase," and
marked with its own `★ NEW` / `EXISTS, needs fix` / `★ BUILD ENTIRELY NEW` tags throughout — a
point-in-time plan for the harness, not a claim about today. §6.2/§6.3/§7 elsewhere in this
document describe the same gates and have been independently re-verified against live code this
session (real file paths, real test counts, real gate count) — treat those as current, this Part
as the plan that preceded them. Not re-verified line-by-line here to avoid duplicating that work.

# YVON HARNESS — Complete Architecture Plan

**Status:** Design Phase  
**Date:** 2026-07-16  
**Goal:** Build a harness that covers every gap identified in the comparison matrix — source authentication, priority-based assembly, progressive disclosure, grounded citations, post-hoc verification, conflict detection, plan-lock, quarantine, agent delegation, and field monitoring.

---

## THE FULL WORKFLOW

```
QUERY: "should we acquire Competitor X for $2M?"
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: TASK CLASSIFICATION & AGENT SELECTION              │
│  (src/cie/classifier.ts — EXISTS, needs domain keyword fix)  │
│                                                              │
│  query → domain keyword classifier → task_type + agent_id   │
│  "acquire + $2M" → strategic_analysis → marcus               │
│  "GDPR + retention" → legal_review → comply                  │
│  "headline + campaign" → creative_review → spark             │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 2: SKILL PROGRESSIVE DISCLOSURE ★ NEW                │
│  (rag/harness/disclosure.py — BUILD)                     │
│                                                              │
│  agent_id → load skill DESCRIPTIONS only (not full content)  │
│  match query against skill triggers                          │
│  activate 2-5 relevant skills → load full SKILL.md           │
│  inactive skills stay as one-line summaries                  │
│                                                              │
│  Example: marcus has 5 skills. Query triggers:               │
│    ✓ decision-critic (full load)                             │
│    ✓ venture-priority-matrix (full load)                     │
│    ✓ strategy-advisor (full load)                            │
│    ✗ okr-cascade (summary only — 8 tokens)                   │
│    ✗ vision-exploration (summary only — 6 tokens)           │
│                                                              │
│  Savings: ~60% on skill context for agents with 5+ skills    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 3: HYBRID RETRIEVAL                                   │
│  (rag/retriever.py — EXISTS, needs plan-lock)                │
│                                                              │
│  ┌─ PLAN-LOCK GATE ★ NEW ───────────────────────────────┐   │
│  │  Before retrieval runs:                                │   │
│  │  1. Lock agent authorization (which depts can query)   │   │
│  │  2. Lock knowledge sources (which files are in scope)  │   │
│  │  3. Hash the plan → append-only log                    │   │
│  │  4. Retrieval deviation from plan → HALT + escalate    │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  query → rewrite (3-5 variants) → dense + sparse search      │
│  → cross-encoder rerank → top-20 candidates                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 4: FORMULA EXECUTION                                   │
│  (rag/core/bridge.py → Shared OS scripts — EXISTS)                │
│                                                              │
│  detect computable formulas in query:                        │
│  "acquire + $2M" → competitive_strategy.py five_forces()     │
│                 → venture_valuation.py pre_money()            │
│                 → capital_budgeting.py npv()                  │
│                                                              │
│  computed facts are TESTABLE CREDENTIALS (Heath, Ch.4)        │
│  → any agent can reproduce: python3 script.py --args          │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 5: CONTEXT OPTIMIZER                                   │
│  (rag/optimizer.py — EXISTS, needs multiplicative fix)       │
│                                                              │
│  profile selection → tier allocation → source diversity       │
│  → adversary injection (premortem for deep_analysis only)     │
│                                                              │
│  ★ FIX: compute_chunk_quality() → multiplicative formula     │
│  reliability = freshness × source_authority × quality_score   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 6: HARNESS GATES ★ BUILD ENTIRELY NEW                │
│  (rag/harness/gates.py — BUILD, the core new module)               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │  GATE 1: SOURCE AUTHENTICATION                       │    │
│  │  ─────────────────────────                          │    │
│  │  For every chunk:                                     │    │
│  │    1. source_file exists on disk? → if not, QUARANTINE│    │
│  │    2. chunk hash matches source file? → if not, FLAG  │    │
│  │    3. book citation traceable? → check Teams/Books/   │    │
│  │    4. within agent's authorized depts? → if not, BLOCK │    │
│  │                                                      │    │
│  │  Output: chunk + auth_status (verified|flagged|blocked)│   │
│  │                                                      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  GATE 2: RELIABILITY SCORING                         │    │
│  │  ──────────────────────                              │    │
│  │  For every authenticated chunk:                       │    │
│  │    reliability = freshness × authority × quality       │    │
│  │                                                      │    │
│  │    freshness    → staleness_economics.doc_freshness() │    │
│  │    authority    → source_authority mapping:           │    │
│  │      1.0 = verified book in Teams/Books/              │    │
│  │      0.9 = NIST/ISO/OECD standard                    │    │
│  │      0.8 = Shared OS script (testable credential)     │    │
│  │      0.7 = department document                       │    │
│  │      0.5 = playbook / skill                          │    │
│  │      0.4 = agent operational log                     │    │
│  │      0.2 = unknown source                            │    │
│  │    quality     → feedback loop historical score        │    │
│  │                                                      │    │
│  │  MULTIPLICATIVE: junk chunk → 0.3×0.2×0.5 = 0.03     │    │
│  │  AUTHORITATIVE: book chunk → 0.9×1.0×0.9 = 0.81      │    │
│  │                                                      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  GATE 3: CONFLICT DETECTION                          │    │
│  │  ─────────────────────                               │    │
│  │  For every pair of kept chunks:                       │    │
│  │    1. Semantic similarity (embedding cosine)          │    │
│  │    2. If similarity > 0.7 AND negation detected       │    │
│  │       → CONTRADICTION flag                           │    │
│  │    3. Same source, different version                  │    │
│  │       → VERSION CONFLICT flag                        │    │
│  │    4. General principle vs specific override          │    │
│  │       → DOMAIN CONFLICT flag                         │    │
│  │                                                      │    │
│  │  Detected conflicts → injected as ⚠️ CONFLICT blocks  │    │
│  │  in the context, NOT resolved silently                │    │
│  │                                                      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  GATE 4: PRIORITY-BASED BUDGET ENFORCEMENT           │    │
│  │  ──────────────────────────────────                  │    │
│  │  Assembly priority (highest → lowest):                │    │
│  │    P0: System prompt (agent identity + principles)    │    │
│  │    P1: Active skills (full SKILL.md for triggered)    │    │
│  │    P2: Computed facts (Shared OS results)             │    │
│  │    P3: Load-bearing chunks (T1, verified, high rel)   │    │
│  │    P4: Structural chunks (T2)                         │    │
│  │    P5: Adversarial chunk (one, if profile requires)   │    │
│  │    P6: Supplementary chunks (T3)                      │    │
│  │    P7: Inactive skill summaries (one-liners)          │    │
│  │                                                      │    │
│  │  Budget fills P0→P7 in order. When budget exhausted,  │    │
│  │  remaining priority levels are DROPPED.              │    │
│  │                                                      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  GATE 5: QUARANTINE & RECOVERY                       │    │
│  │  ──────────────────────────                          │    │
│  │  Chunks with reliability < threshold:                 │    │
│  │    → NOT injected (excluded from assembly)            │    │
│  │    → LOGGED to quarantine.jsonl                      │    │
│  │    → OPERATOR NOTIFIED if chunk was previously T1     │    │
│  │                                                      │    │
│  │  Recovery pass (after assembly):                       │    │
│  │    → Scan dropped T1/T2 chunks                        │    │
│  │    → If novel fact, exception, or contradiction        │    │
│  │    → AND reliability > recovery_threshold              │    │
│  │    → recover (pull back into assembly)                 │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  OUTPUT: verified_chunks + conflict_flags + trace_log        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 7: STRATEGY ROUTING + INJECTION                        │
│  (rag/core/unified_pipeline.py — EXISTS, extend)                  │
│                                                              │
│  ┌─ FAST PATH ──────────────────────────────────────────┐    │
│  │  creative_review, factual_lookup, copy_edit           │    │
│  │  → Destructor v2 (hard budget, no recovery)           │    │
│  │  → 64-89% savings, quality acceptable for task        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ BALANCE PATH ───────────────────────────────────────┐    │
│  │  everything else                                      │    │
│  │  → Adaptive budget + Recovery pass                    │    │
│  │  → 39-77% savings, quality preserved for task         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ★ NEW: Progressive skill disclosure injected                │
│  ★ NEW: Conflict flags injected into context                 │
│  ★ NEW: Grounded citation markers on every chunk             │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 8: LLM GENERATION                                     │
│  agent persona + active skills + injection text + query      │
│               │                                              │
│               ▼                                              │
│         MODEL RESPONSE                                       │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 9: POST-HOC VERIFICATION ★ NEW                       │
│  (rag/verify/grounded.py — BUILD)                                  │
│                                                              │
│  ┌─ GROUNDED CITATION CHECK ────────────────────────────┐    │
│  │  For every factual claim in the model's response:      │    │
│  │    1. Extract claim (number, rule, citation, fact)     │    │
│  │    2. Search injected chunks for supporting evidence   │    │
│  │    3. Embedding similarity between claim and chunks    │    │
│  │    4. If similarity < threshold → UNSUPPORTED flag     │    │
│  │    5. If similarity > threshold + wrong source         │    │
│  │       → MISATTRIBUTED flag                            │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ SELF-CONSISTENCY CHECK ─────────────────────────────┐    │
│  │  Does the response contradict itself?                  │    │
│  │  Does it contradict a computed fact from Shared OS?    │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ CONSTITUTION CHECK ─────────────────────────────────┐    │
│  │  Does the response comply with the context constitution?│   │
│  │  (readable, auditable, versioned document)             │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ★ OPTIONAL: Delegate verification to quinn agent            │
│    if uncertainty > threshold or task is high-stakes          │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 10: FEEDBACK LOOP                                     │
│  (rag/feedback.py — EXISTS, extend)                          │
│                                                              │
│  outcome (accept/reject/revise) → update chunk quality       │
│  ★ NEW: source-level feedback (if chunks from source X       │
│    consistently produce bad outcomes, down-weight source X   │
│    across ALL queries)                                       │
│  ★ NEW: budget feedback (if task_type consistently needs     │
│    more/less budget than multiplier provides, adjust)        │
│  ★ NEW: Lasswell trace extended with harness gate results    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 11: FIELD MONITORING ★ NEW                            │
│  (rag/monitor/watcher.py — BUILD)                              │
│                                                              │
│  Continuous observation of injection quality:                │
│    • Attractor detection: which chunk combinations produce   │
│      consistently good/bad outcomes?                         │
│    • Degradation alerts: quality score dropping over time    │
│    • Coverage gaps: queries that consistently get too few    │
│      chunks / too-low quality injection                     │
│    • Drift detection: agent behavior changing as source      │
│      documents evolve                                        │
│                                                              │
│  Output: weekly fleet health report (auto-generated)         │
└──────────────────────────────────────────────────────────────┘
```

---

## WHAT GETS BUILT (New Files)

| # | File | Purpose | Lines (est.) | Dependencies |
|---|------|---------|-------------|--------------|
| 1 | `rag/harness/gates.py` | 5-gate harness — authenticate, reliability, conflict, budget, quarantine | ~500 | retriever, optimizer, embed, staleness_economics, feedback |
| 2 | `rag/verify/grounded.py` | Post-hoc verification — grounded citations, self-consistency, constitution | ~400 | embed, injector, Shared OS scripts |
| 3 | `rag/harness/disclosure.py` | Skill progressive disclosure — description loading, trigger matching, on-demand full load | ~250 | Teams/ file system, skill registry |
| 4 | `rag/monitor/watcher.py` | Field monitoring — attractor detection, degradation alerts, coverage gaps, drift | ~350 | feedback, embed, harness |
| 5 | `rag/context_constitution.md` | Context constitution — human-readable rules for acceptable context | ~150 | None (document) |
| 6 | `rag/quarantine.jsonl` | Quarantine log — append-only record of excluded chunks | N/A | harness |
| 7 | `rag/plan_lock_log.jsonl` | Plan-lock log — append-only record of retrieval execution plans | N/A | harness |
| 8 | `rag/source_authority.yaml` | Source authority mappings — scores per source type | ~50 | harness |

---

## WHAT GETS MODIFIED (Existing Files)

| # | File | Change | Why |
|---|------|--------|-----|
| 1 | `rag/core/unified_pipeline.py` | Add harness gate calls before strategy routing; add conflict flags to injection text; add grounded citation markers | Harness is a pre-injection gate |
| 2 | `rag/optimizer.py` | Fix `compute_chunk_quality()` to multiplicative formula; add source_authority lookup; wire calibration_weight into retrieval confidence | Currently additive + disconnected |
| 3 | `rag/feedback.py` | Add source-level feedback; add budget feedback; extend Lasswell trace with harness results | Feedback needs to tune retrieval, not just chunks |
| 4 | `rag/retriever.py` | Add plan-lock enforcement (hash execution plan, verify authorization before retrieval) | Rail 1 compliance |
| 5 | `rag/core/bridge.py` | Add harness output to bridge response JSON | CIE needs harness trace |
| 6 | `src/cie/classifier.ts` | Apply domain keyword priority fix (GDPR → legal_review, not factual_lookup) | Classification accuracy |
| 7 | `rag/books/harness-engineering.md` | Already rewritten — this defines the principles. Add context constitution reference. | Design rationale |

---

## WHAT GETS LEFT ALONE (Working, No Changes)

| Module | Why |
|--------|-----|
| `rag/injector.py` | 3-layer compression is correct and tested (22/22) |
| `rag/strategy.py` | Strategy selector is correct and tested (23/23) |
| `rag/destructor.py` | Hard budget pipeline is correct and tested (35/35) |
| `rag/embed.py` | Dense + sparse embedding works |
| `rag/chunkify.py` | Semantic chunking works |
| `Teams/` (all 46 agents) | No structural changes |
| `Teams/Shared OS/` (35 scripts) | No changes to formulas |
| `src/` (TypeScript CIE) | Minor only (classifier fix) |

---

## HARNESS DATA FLOW (DETAILED)

```
Chunks arrive from optimizer (20 candidates)
    │
    ▼
┌─────────────────────────────────────┐
│ GATE 1: SOURCE AUTHENTICATION       │
│ ─────────────────────────────────   │
│ Input:  20 chunks                   │
│ Output: 18 verified, 1 flagged,     │
│          1 blocked                  │
│                                     │
│ Flagged: source_file hash mismatch  │
│   → chunk may have been tampered    │
│   → still injected, but with ⚠️     │
│                                     │
│ Blocked: source_file not found      │
│   → chunk is orphaned               │
│   → NOT injected, logged            │
│   → operator notified if was T1     │
│                                     │
│ Log: quarantine.jsonl               │
│   {chunk_id, reason, timestamp,     │
│    operator_notified: true/false}   │
└──────────────┬──────────────────────┘
               │
               ▼ (18 verified + 1 flagged)
┌─────────────────────────────────────┐
│ GATE 2: RELIABILITY SCORING         │
│ ────────────────────────────        │
│ Input:  19 chunks                   │
│ Output: 19 scored (0.0-1.0)         │
│                                     │
│ Formula: freshness × authority       │
│          × quality_score             │
│                                     │
│ Example scores:                     │
│   NIST doc (fresh 0.9 × auth 0.9    │
│     × quality 0.85) = 0.69          │
│   Blog chunk (fresh 0.3 × auth 0.2  │
│     × quality 0.5) = 0.03           │
│   Ogilvy book (fresh 0.7 × auth 1.0 │
│     × quality 0.9) = 0.63           │
│                                     │
│ Threshold: 0.15 for T1, 0.10 for T2 │
│ Below threshold → QUARANTINE        │
└──────────────┬──────────────────────┘
               │
               ▼ (16 reliable + 3 quarantined)
┌─────────────────────────────────────┐
│ GATE 3: CONFLICT DETECTION          │
│ ──────────────────────────          │
│ Input:  16 chunks                   │
│ Output: 16 chunks + 2 conflict      │
│           flags                     │
│                                     │
│ Pairwise embedding comparison       │
│ (cosine similarity of chunk vectors) │
│                                     │
│ Found:                              │
│   Chunk A (NIST): "risk score >12   │
│     → board review"                 │
│   Chunk B (ISO 31000): "fixed       │
│     numerical thresholds create     │
│     blind spots"                    │
│   → similarity: 0.72                │
│   → negation: "create blind spots"  │
│   → CONTRADICTION DETECTED          │
│                                     │
│ Flags injected into context:        │
│   ⚠️ CONFLICT [g1]:                 │
│   NIST SP 800-30 vs ISO 31000:2018  │
│   §6.4.3 — fixed thresholds vs      │
│   context-dependent evaluation      │
│   Agent must reconcile or flag      │
│   to operator.                      │
└──────────────┬──────────────────────┘
               │
               ▼ (16 chunks + 2 conflict flags)
┌─────────────────────────────────────┐
│ GATE 4: PRIORITY ASSEMBLY           │
│ ──────────────────────────          │
│ Input:  16 chunks, active skills,   │
│         computed facts, agent       │
│         identity                    │
│ Budget: computed from task_type     │
│         multiplier                  │
│                                     │
│ P0: [80t] agent identity            │
│     "You are marcus, CEO...         │
│      Steve Jobs persona"            │
│                                     │
│ P1: [150t] active skills             │
│     decision-critic, venture-       │
│     priority-matrix, strategy-      │
│     advisor (full SKILL.md)         │
│                                     │
│ P2: [60t] computed facts            │
│     five_forces() = {rivalry: HIGH, │
│     entry_barriers: MEDIUM...}      │
│     npv() = $137,236.03             │
│                                     │
│ P3: [200t] T1 verified chunks (3)   │
│     Porter Ch.1, Brealey Ch.5,      │
│     venture_valuation.py            │
│                                     │
│ P4: [120t] T2 structural (2)        │
│     WACC pitfalls, Porter limits    │
│                                     │
│ P5: [40t] adversarial chunk (1)     │
│     ISO 31000 contradicts NIST      │
│                                     │
│ P6: [0t] T3 supplementary — BUDGET  │
│     EXHAUSTED at P5                 │
│     → 2 T3 chunks DROPPED           │
│                                     │
│ P7: [30t] inactive skills            │
│     okr-cascade: "cascades company  │
│     OKRs to department level"       │
│     vision-exploration: "explores   │
│     future scenarios..."            │
│                                     │
│ Total assembled: 680t               │
│ Budget: 680t ← exactly filled       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ GATE 5: QUARANTINE & RECOVERY       │
│ ──────────────────────────────      │
│                                     │
│ Quarantined (from Gates 1-3):       │
│   1 orphaned, 3 low-reliability     │
│   → logged to quarantine.jsonl      │
│   → operator notified for T1        │
│                                     │
│ Recovery scan on dropped:           │
│   Dropped T3 chunks (2) scanned     │
│   1 has novel fact not in kept:     │
│     → recovered if reliability       │
│       > 0.10                        │
│   +1 chunk added to P6              │
│                                     │
│ Final assembly: 680t + 40t rec      │
│ = 720t total injection              │
└──────────────────────────────────────┘
```

---

## AGENT DELEGATION (Phase 9 Enhancement)

Instead of building all verification logic into verifier.py, delegate to existing agents when the task is high-stakes:

```
Post-hoc verification flow:

MODEL RESPONSE
    │
    ├── Low-stakes (creative_review, factual_lookup)
    │       → automated verification only
    │       → grounded citation check + self-consistency
    │
    ├── Medium-stakes (standard_review, engineering_debug)
    │       → automated + quinn verification
    │       → quinn runs verification-before-completion skill
    │       → checks: are all claims supported? any contradictions?
    │
    └── High-stakes (governance, legal, strategic)
            → automated + quinn + precedent + sentinel
            → precedent: consistency with prior rulings
            → sentinel: constitution bypass detection
            → full audit trail generated
```

---

## PROGRESSIVE DISCLOSURE FLOW

```
Agent: marcus (5 skills)
Query: "should we acquire Competitor X for $2M?"

┌──────────────────────────────────────────┐
│ SKILL REGISTRY (loaded from agent.md)    │
│ ────────────────────────────────────     │
│ Skill descriptions only (not full body)  │
│                                          │
│ decision-critic:                         │
│   "Stress-tests strategic decisions      │
│    against decision analysis framework"  │
│   Triggers: decision, approve, reject    │
│   → MATCHED (query contains "acquire")   │
│   → LOAD FULL SKILL.md ✓                │
│                                          │
│ venture-priority-matrix:                 │
│   "Scores ventures on strategic fit,     │
│    urgency, and resource requirements"   │
│   Triggers: invest, acquire, prioritize  │
│   → MATCHED                              │
│   → LOAD FULL SKILL.md ✓                │
│                                          │
│ strategy-advisor:                        │
│   "Provides strategic options with       │
│    competitive analysis"                 │
│   Triggers: strategy, competition        │
│   → MATCHED (context: Porter's forces)   │
│   → LOAD FULL SKILL.md ✓                │
│                                          │
│ okr-cascade:                             │
│   "Cascades company OKRs to department   │
│    level with measurable KRs"            │
│   Triggers: OKR, goals, quarterly        │
│   → NOT MATCHED                          │
│   → SUMMARY ONLY (one line, ~8 tokens)  │
│                                          │
│ vision-exploration:                      │
│   "Explores future scenarios and         │
│    long-term strategic narratives"       │
│   Triggers: vision, future, scenario     │
│   → NOT MATCHED                          │
│   → SUMMARY ONLY (one line, ~6 tokens)  │
│                                          │
│ Result: 3 full loads + 2 summaries       │
│ vs all 5 full loads = ~40% savings       │
└──────────────────────────────────────────┘
```

---

## GROUNDED CITATION FLOW

```
MODEL OUTPUT: "Based on Porter's analysis, the industry has high
rivalry and low entry barriers, making it structurally unattractive
for acquisition. The computed NPV is $137,236."

POST-HOC VERIFICATION:
─────────────────────

Claim 1: "industry has high rivalry and low entry barriers"
  → Search injected chunks for "rivalry" + "entry barriers"
  → Found: chunk_c14 (porter-competitive-strategy.md, Five Forces)
    "Porter Ch.1: Five forces — rivalry, entry threat..."
  → Embedding similarity: 0.84
  → ✅ SUPPORTED [porter-competitive-strategy.md, Ch.1]

Claim 2: "structurally unattractive for acquisition"
  → Search injected chunks for "structurally unattractive"
  → Found: chunk_c14
    "High rivalry + low entry barriers = structurally unattractive"
  → Embedding similarity: 0.91
  → ✅ SUPPORTED [porter-competitive-strategy.md, Ch.1]

Claim 3: "computed NPV is $137,236"
  → Search injected chunks for "NPV" + "137,236"
  → Found: chunk_c7 (capital_budgeting.py, NPV)
    "[COMPUTED] npv() = $137,236.03 [Brealey & Myers, Ch.5]"
  → Embedding similarity: 0.97
  → ✅ SUPPORTED [capital_budgeting.py, npv()]

All 3 claims verified. 0 unsupported. 0 misattributed.
Verification score: 1.00
```

---

## IMPLEMENTATION ORDER

| Phase | What | Depends On | Effort | Test Target |
|-------|------|-----------|--------|-------------|
| **1** | `rag/harness/gates.py` — Gates 1, 2, 5 (authenticate, reliability, quarantine) | staleness_economics, feedback, optimizer fix | 3 days | 30+ tests |
| **2** | `rag/optimizer.py` — Fix multiplicative formula + source_authority lookup | harness.py | 1 day | existing tests pass + new |
| **3** | `rag/harness/gates.py` — Gates 3, 4 (conflict, priority assembly) | Phase 1 harness, embed | 2 days | 20+ tests |
| **4** | `rag/harness/disclosure.py` — Skill progressive disclosure | agent registry, SKILL.md files | 1.5 days | 15+ tests |
| **5** | `rag/core/unified_pipeline.py` — Wire harness gates + conflict flags + citation markers | harness.py, progressive_disclosure | 1.5 days | existing 31 tests + new |
| **6** | `rag/verify/grounded.py` — Post-hoc grounded citation + self-consistency | embed, unified_pipeline | 2 days | 20+ tests |
| **7** | `rag/retriever.py` — Plan-lock enforcement | harness.py | 1 day | 10+ tests |
| **8** | `rag/feedback.py` — Source-level + budget feedback | verifier.py | 1 day | existing tests + new |
| **9** | `rag/monitor/watcher.py` — Attractor detection + degradation + coverage + drift | feedback, harness | 2 days | 15+ tests |
| **10** | `rag/core/bridge.py` — Harness output in bridge JSON | harness.py | 0.5 days | integration tests |
| **11** | `rag/context_constitution.md` — Human-readable constitution | all of above | 0.5 days | N/A (document) |
| **12** | Integration testing — End-to-end across 13 scenarios | all of above | 2 days | E2E benchmark |

**Total: ~18 days of focused work. 110+ new tests on top of existing 111.**

---

## SINGLE ENTRY POINT (FINAL)

```python
from rag.harness import Harness
from rag.unified_pipeline import inject
from rag.progressive_disclosure import ProgressiveDisclosure
from rag.verifier import verify_response

# ── PHASE 1-2: Classification + Progressive Disclosure ──
task_type, agent_id = classify_query(query, agent_id)
skills_context = ProgressiveDisclosure(agent_id).load_for_query(query)

# ── PHASE 3-5: Retrieval + Formula + Optimization ──
retrieval_result = retrieve(query, agent_id, dept, mode='standard')
computed_facts = detect_and_execute_formulas(query, agent_id)
optimized = optimize_context(retrieval_result.candidates, query, agent_id)

# ── PHASE 6: HARNESS GATES ★ ──
harness = Harness()
verified = harness.process(
    chunks=optimized.selected_chunks,
    agent_id=agent_id,
    query=query,
    task_type=task_type,
)

# verified.auth_status     → {chunk_id: verified|flagged|blocked}
# verified.reliability      → {chunk_id: 0.0-1.0}
# verified.conflicts        → [(chunk_a, chunk_b, conflict_type, description)]
# verified.quarantined      → [{chunk_id, reason, notified}]
# verified.recovered        → [{chunk_id, reason}]
# verified.assembly_plan    → {priority_level: [chunk_ids], budget_used, budget_total}

# ── PHASE 7: Injection ──
result = inject(
    query=query,
    agent_id=agent_id,
    chunks=verified.assembly,
    task_type=task_type,
    skills_context=skills_context,
    computed_facts=computed_facts,
    conflicts=verified.conflicts,  # ← NEW: conflict flags in context
)

# ── PHASE 8: LLM ──
response = llm.generate(
    persona=agent_persona,
    skills=skills_context.active,
    context=result.injection_text,
    query=query
)

# ── PHASE 9: Verification ★ ──
verification = verify_response(
    response=response,
    injected_chunks=result.kept_chunks,
    computed_facts=computed_facts,
    task_type=task_type,
)

# verification.claims           → [{claim, support_chunk, similarity, status}]
# verification.unsupported      → [claims with no matching chunk]
# verification.misattributed    → [claims citing wrong source]
# verification.self_consistent  → bool
# verification.score            → 0.0-1.0

# ── PHASE 10: Feedback ──
log_feedback(trace, outcome='pending', verification=verification)

# ── PHASE 11: Field Monitor (async, runs periodically) ──
# field_monitor.record(query, agent_id, task_type,
#                      harness_result=verified,
#                      verification=verification,
#                      outcome=final_outcome)
```

---

# ═══════════ PART 3 — UNIFIED PRODUCTION PIPELINE: FINAL REPORT ═══════════
*(source: docs/PIPELINE_FINAL.md — verbatim)*

**Spot-checked 2026-08-09 — this one holds up.** Ran `python3 rag/core/unified_pipeline.py --demo`
live and every number below (GDPR 385t/38.8%/0.955/8-kept/3-recovered, Strategic Acquisition
302t/54.3%/0.773, Deployment Fix 114t/77.3%/0.500, Cross-Dept 403t/39.0%/1.045, FAST avg
72.4%/0.469, BALANCE avg 59.4%/0.742) reproduced exactly. Only the "111/111" test count below is
stale — same already-corrected figure as elsewhere (§7: real current total is 346 across 16 modules;
`strategy: 23` no longer exists, deleted this session).

# YVON Unified Production Pipeline — Final Report

**Date:** 2026-07-15  
**Status:** Production Ready  
**Tests:** 111/111 passing (injector: 22, strategy: 23, destructor: 35, unified: 31) — stale, see note above

---

## Architecture: Strategy Routing

```
                     QUERY ARRIVES
                          │
                    ┌─────▼─────┐
                    │ CLASSIFIER │  Domain keywords > generic verbs > agent default
                    └─────┬─────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         creative      factual     everything
         copy_edit     lookup        else
              │           │           │
              ▼           ▼           ▼
         ══════════  ══════════  ═══════════
         ║  FAST   ║  ║  FAST  ║  ║ BALANCE ║
         ║Destructor║  ║Destruct║  ║Adaptive ║
         ║   v2     ║  ║  v2    ║  ║+Recovery║
         ══════════  ══════════  ═══════════
          89% save     64% save    39-77% save
          0.24 qual    0.58 qual   0.50-0.96 qual
```

### Strategy Selection Rules

| Task Type | Strategy | Rationale |
|-----------|----------|-----------|
| creative_review | **FAST** | Model knows Ogilvy from training — needs only the citation + rule |
| copy_edit | **FAST** | Model knows grammar — needs only the text to edit |
| factual_lookup | **FAST** | One citation answers the question |
| standard_review | **BALANCE** | Needs moderate context |
| governance_decision | **BALANCE** | Needs precedents, thresholds, cross-references (2.5× budget) |
| strategic_analysis | **BALANCE** | Needs multiple perspectives, computed facts (3.0× budget) |
| legal_review | **BALANCE** | Missing context = liability (4.0× budget) |
| financial_analysis | **BALANCE** | Needs formulas, caveats, sensitivity (2.0× budget) |
| engineering_debug | **BALANCE** | Needs code patterns, architecture (1.5× budget) |
| compliance_check | **BALANCE** | Needs regulatory text, interpretations (2.5× budget) |

---

## Full Demo Results — 12 Scenarios

### FAST Strategy (3 scenarios)

| Scenario | Agent | Input | Savings | Quality | Kept/Dropped |
|----------|-------|-------|---------|---------|-------------|
| Creative Review | spark | 15c/792t | 89.1% | 0.240 | 2/13 |
| Simple Fact Check | spark | 4c/192t | 64.1% | 0.583 | 1/3 |
| Quick Grammar Edit | lena | 4c/192t | 64.1% | 0.583 | 1/3 |
| **FAST Average** | | | **72.4%** | **0.469** | 75t final |

### BALANCE Strategy (9 scenarios)

| Scenario | Agent | Input | Task | Multiplier | Budget | Savings | Quality | Rec |
|----------|-------|-------|------|-----------|--------|---------|---------|-----|
| WACC Computation | marcus | 9c/502t | financial_analysis | 2.0× | 127t | 69.7% | 0.700 | 0 |
| NPV Investment | felix | 9c/502t | financial_analysis | 2.0× | 127t | 69.7% | 0.800 | 1 |
| Board Fiduciary | board | 15c/792t | governance_decision | 2.5× | 252t | 61.9% | 0.636 | 1 |
| Risk Assessment | sentinel | 15c/792t | compliance_check | 2.5× | 252t | 61.9% | 0.636 | 1 |
| **GDPR Compliance** | **comply** | **14c/755t** | **legal_review** | **4.0×** | **385t** | **38.8%** | **0.955** | **3** |
| Strategic Acq. | marcus | 15c/792t | strategic_analysis | 3.0× | 302t | 54.3% | 0.773 | 2 |
| Deployment Fix | dev | 11c/600t | engineering_debug | 1.5× | 114t | 77.3% | 0.500 | 1 |
| Short Board | board | 15c/792t | governance_decision | 2.5× | 252t | 61.9% | 0.636 | 1 |
| Cross-Dept | dev | 15c/792t | legal_review | 4.0× | 403t | 39.0% | 1.045 | 4 |
| **BALANCE Avg** | | | | | | **59.4%** | **0.742** | **1.6** |

### Key Observations

1. **GDPR Compliance Check** — Classification correctly routes to legal_review (4.0× multiplier, 385t budget). Recovered 3 chunks (ISO 31000 adversary, Aaker definitions, exception to GDPR retention limits). Quality score of 0.955 — near-perfect fact preservation.

2. **Cross-Department Review** ("review deployment + check GDPR") — Domain keyword "GDPR" correctly overrides the agent default (dev→engineering_debug) and routes to legal_review. Recovered 4 chunks with quality of 1.045.

3. **Strategic Acquisition** — 3.0× budget multiplier gives 302t budget. Porter's Five Forces + ISO adversary + Brealey finance chunks all survive. Recovered 2 chunks (exception + missing_source).

4. **The quality-to-savings tradeoff is deliberate, not accidental.** FAST gives 72% savings at 0.47 quality. BALANCE gives 59% savings at 0.74 quality. For a headline review, 0.24 quality is fine. For a GDPR audit, you need 0.96 quality even at 39% savings.

---

## Recovery Pass — 5 Triggers

| Trigger | Threshold | What It Catches | Example |
|---------|-----------|----------------|---------|
| **novel_fact** | 1 new fact | Dropped chunk has unique entity/number/rule | [COMPUTED] NPV value not in any kept chunk |
| **exception** | Always | Exception/limitation to a rule | "unless curiosity gap" → Ogilvy headline exception |
| **contradiction** | 3+ shared terms + negation | Opposing claim | ISO 31000 contradicts NIST SP 800-30 |
| **missing_source** | Domain source absent from kept | Important document dropped entirely | ogilvy-creative-code.md not represented in kept |
| **defines_term** | Key query term in first sentence | Definition of a term the query uses | "WACC" term defined in chunk but not in kept |

### Recovery Effectiveness

| Task Type | Recovered | Recovery Rate | Most Common Trigger |
|-----------|-----------|---------------|-------------------|
| legal_review | 3-4 | 20-30% of dropped | novel_fact + exception |
| strategic_analysis | 2 | 15-20% | novel_fact + missing_source |
| governance_decision | 1 | 8-12% | novel_fact |
| financial_analysis | 0-1 | 0-10% | novel_fact |
| compliance_check | 1 | 8-12% | novel_fact |
| engineering_debug | 1 | 8-12% | novel_fact |
| creative_review (FAST) | 0 | 0% | N/A — no recovery pass |

---

## Classification Accuracy

The domain keyword system correctly routes queries:

| Query | Old Classifier | New Classifier | Correct? |
|-------|---------------|----------------|----------|
| "verify GDPR Article 5" | factual_lookup (0.4×) | **legal_review (4.0×)** | ✅ Fixed |
| "compute WACC for..." | strategic_analysis (3.0×) | **financial_analysis (2.0×)** | ✅ Fixed |
| "NIST risk scoring" | standard_review (1.0×) | **compliance_check (2.5×)** | ✅ Fixed |
| "acquire Company X" | strategic_analysis (3.0×) | strategic_analysis (3.0×) | ✅ Correct |
| "deployment pipeline error" | engineering_debug (1.5×) | engineering_debug (1.5×) | ✅ Correct |
| "review headline copy" | creative_review (0.6×) | creative_review (0.6×) | ✅ Correct |

The two misclassifications from the earlier benchmark (GDPR→factual_lookup, WACC→strategic_analysis) are both fixed by the domain keyword priority system.

---

## Full Project Structure `[paths corrected 2026-08-09]`

Bare filenames below are missing the real `core/` prefix (same fix as everywhere else this pass —
`injector.py`/`strategy.py`/`destructor.py`/`optimizer.py`/`retriever.py`/`unified_pipeline.py`/
`bridge.py`/`embed.py`/`feedback.py`/`chunkify.py` are all under `rag/core/`); `strategy.py` no
longer exists (deleted this session); `pipeline_adaptive_recovery.py` and
`pipeline_relational_progressive.py` don't exist anywhere in this repo (not just wrong path —
genuinely absent). `rag/books/` is real, all 3 files confirmed present.

```
/Agents/rag/
│
├── injector.py                          # 3-Layer Compression (22 tests)
│   ├── Layer 1: Sentence-Level Pruning (60-85% savings)
│   ├── Layer 2: Citation-Only Mode (85-95% savings)
│   └── Layer 3: Agent-Specific Profiles (46 agents → 5 types)
│
├── strategy.py                          # Multi-Strategy Engine (23 tests)
│   ├── Content Type Classifier (5 types)
│   ├── Strategy Selector (per-chunk routing)
│   ├── pxpipe Integration (image-vs-text separation)
│   └── Agent Profile Matrix
│
├── destructor.py                        # Hard Budget Pipeline (35 tests)
│   ├── Adaptive Budget Formula (input-size based)
│   ├── Survival Mode (<200t budget)
│   ├── Strip-to-Essentials Engine
│   └── Post-Assembly Budget Enforcement
│
├── optimizer.py                         # Dynamic Context Optimizer
│   ├── Task Complexity Classifier (4 profiles)
│   ├── Chunk Quality Scoring
│   ├── Diversity + Tier Allocation Enforcement
│   └── Adversary Injection (Kahneman Premortem)
│
├── retriever.py                         # Full Retrieval Pipeline
│   ├── Query Rewriter (Lasswell model)
│   ├── Hybrid Retriever (dense + sparse)
│   ├── Cross-Encoder Re-ranker
│   └── Context Compressor + Injector
│
├── unified_pipeline.py ★                # PRODUCTION ENTRY POINT (31 tests)
│   ├── Domain Keyword Classifier (fixed)
│   ├── Strategy Router (FAST vs BALANCE)
│   ├── FAST Path → Destructor v2
│   ├── BALANCE Path → Adaptive Budget + Recovery Pass
│   ├── Contradiction Detector
│   └── 5-Trigger Recovery Engine
│
├── pipeline_adaptive_recovery.py        # Option 1+3 (standalone)
├── pipeline_relational_progressive.py   # Option 2+4 (standalone)
│
├── benchmark.py                         # Benchmark Suite (7 scenarios)
├── bridge.py                            # CIE ⇄ RAG Integration
├── embed.py                             # Vector Embedding
├── feedback.py                          # Quality Feedback Loop
├── chunkify.py                          # Document Chunking
│
└── books/                               # Grounding References
    ├── harness-engineering.md
    ├── prompt-engineering.md
    └── context-engineering.md
```

---

## Single Entry Point (same `core/`-prefix correction as above)

```python
from rag.core.unified_pipeline import inject

result = inject(
    query="verify our data retention policy complies with GDPR Article 5",
    agent_id="comply",
    chunks=retrieved_chunks
)

# result.strategy          → "balance" or "fast"
# result.task_type         → "legal_review"  
# result.task_confidence   → 0.60
# result.savings_pct       → 38.8
# result.quality_score     → 0.955
# result.kept_chunks       → 8
# result.recovered_chunks  → 3
# result.dropped_chunks    → 9
# result.injection_text    → optimized context for the LLM
```

---

## When to Use What

```
Query is...                  → Strategy    → Budget    → Savings    → Quality
────────────────────────────────────────────────────────────────────────────
headline/copy review          FAST          80-100t     64-89%      0.24-0.58
grammar/spelling check        FAST          80t         64%         0.58
"what is X" / "define Y"      FAST          80t         64%          median
engineering debug              BALANCE       1.5×        77%         0.50
financial analysis (WACC/NPV)  BALANCE       2.0×        70%         0.70-0.80
compliance audit (NIST/ISO)    BALANCE       2.5×        62%         0.64
governance/board decision      BALANCE       2.5×        62%         0.64
strategic acquisition          BALANCE       3.0×        54%         0.77
GDPR/legal/compliance review   BALANCE       4.0×        39%         0.96
cross-department with legal    BALANCE       4.0×        39%         1.04
```

---

## Commands (`strategy.py` line is dead — deleted this session; others just need the `core/` prefix above)

```bash
# Run all tests
python3 rag/core/unified_pipeline.py --test     # 31 tests
python3 rag/core/destructor.py --test           # 35 tests
python3 rag/core/injector.py --test             # 22 tests

# Full demo with all scenarios
python3 rag/core/unified_pipeline.py --demo

# Benchmark comparison (all 3 pipelines)
python3 rag/benchmark.py
```

---

# ═══════════ PART 4 — COMPLETE WORK TREE WITH FALLBACKS ═══════════
*(source: docs/WORK_TREE.md — verbatim)*

**This is the real content behind the dead `docs/archive/WORK_TREE.md` citation elsewhere in this
doc (§13's Document Map) — dated 2026-07-16, and it checks out well: it's the accurate historical
plan that §6.2/§6.3/§7 (independently re-verified against live code this session) describe as
built. Same recurring, already-explained corrections apply throughout and aren't repeated
line-by-line here: bare `rag/*.py` paths need a `core/` prefix, `strategy.py` no longer exists
(deleted this session), "field_monitor.py"/"self_improver.py" are really `rag/monitor/watcher.py`/
`improver.py`, and every stale test total (263, 111, etc.) is superseded by §7's live-verified 346
across 16 modules.**

# YVON ENGINE — COMPLETE WORK TREE WITH FALLBACKS

**Status:** All modules wired · 111 existing tests preserved · 112 new tests added (stale — see note above)  
**Date:** 2026-07-16  
**Entry points:** bridge.py (stdin/stdout), unified_pipeline.py (direct), CLI (npx yvon)

---

## LEGEND

```
    [MODULE]          Python module (rag/*.py)
    {TYPE}             TypeScript module (src/*.ts)
    >> FLOW >>          Primary data path
    .. FALLBACK ..>     Graceful degradation path
    ## SCHEDULED ##     Cron/scheduled task
    ⚠️ ORPHAN (FIXED)   Was orphaned, now wired
    ✅ VERIFIED         Connection tested and working
```

---

## LAYER 1: QUERY INGRESS — Classification + Progressive Disclosure

```
USER QUERY
    │
    ▼
┌─────────────────────────────────────────────┐
│  {src/cie/classifier.ts}                     │
│  Task Classification                         │
│  Domain keywords → task_type + agent_id      │
└──────────────────────┬──────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
    ┌─────────────────┐  ┌─────────────────────┐
    │ agent.md Skill   │  │ progressive_         │
    │ Roster Parser    │  │ disclosure.py ⚠️→✅  │
    │ (static)         │  │ Skill Lazy Loading   │
    └────────┬────────┘  └──────────┬──────────┘
             │                      │
             │    query + triggers   │
             └──────────┬───────────┘
                        │
              ┌─────────▼─────────┐
              │ ACTIVE SKILLS     │  ← 2-3 full SKILL.md loaded
              │ (triggered)       │
              ├───────────────────┤
              │ INACTIVE SKILLS   │  ← one-line summaries (~8 tokens each)
              │ (not triggered)   │     Savings: 40-60% on skill context
              └─────────┬─────────┘
                        │
            ┌───────────▼───────────┐
            │ FALLBACK              │
            │ If progressive_       │
            │ disclosure.py absent  │
            │ → all skills loaded   │
            │ as before (no savings)│
            └───────────────────────┘
```

---

## LAYER 2: RETRIEVAL + FORMULA EXECUTION — Plan-Locked

```
                    skills_context + query
                        │
    ┌───────────────────┼───────────────────┐
    │                   ▼                   │
    │  ┌─────────────────────────────┐      │
    │  │  bridge.py                  │      │
    │  │  --mode retrieve            │      │
    │  │  stdin JSON → stdout JSON   │──────┤  Called by CIE subprocess
    │  └────────────┬────────────────┘      │
    │               │                       │
    │    ┌──────────┴──────────┐            │
    │    ▼                     ▼            │
    │ ┌─────────────┐   ┌──────────────┐    │
    │ │ retriever.py│   │ bridge.py     │    │
    │ │ Hybrid      │   │ Formula       │    │
    │ │ Retrieve    │   │ Detection     │    │
    │ └──────┬──────┘   └──────┬───────┘    │
    │        │                 │            │
    │        ▼                 ▼            │
    │ ┌─────────────┐   ┌──────────────┐    │
    │ │ embed.py    │   │ Shared OS    │    │
    │ │ Dense+      │   │ logical/     │    │
    │ │ Sparse      │   │ *.py (35)    │    │
    │ └──────┬──────┘   └──────┬───────┘    │
    │        │                 │            │
    │        └────────┬────────┘            │
    │                 ▼                     │
    │        ┌────────────────┐             │
    │        │ optimizer.py   │             │
    │        │ Dynamic        │             │
    │        │ Profile +      │             │
    │        │ Diversity +    │             │
    │        │ Adversary      │             │
    │        └────────┬───────┘             │
    │                 │                     │
    │  ┌──────────────┼──────────────┐      │
    │  │              ▼              │      │
    │  │  ┌────────────────────┐     │      │
    │  │  │  retriever.py      │     │      │
    │  │  │  Cross-Encoder     │     │      │
    │  │  │  Re-ranker         │     │      │
    │  │  └────────┬───────────┘     │      │
    │  │           │                 │      │
    │  │           ▼                 │      │
    │  │  ┌────────────────────┐     │      │
    │  │  │  20 CANDIDATE      │     │      │
    │  │  │  CHUNKS            │     │      │
    │  │  └────────┬───────────┘     │      │
    │  │           │                 │      │
    │  │  FALLBACK: retriever.py     │      │
    │  │  → if sqlite-vec absent     │      │
    │  │  → direct chunks.json       │      │
    │  │  search (dense+sparse)      │      │
    │  └─────────────────────────────┘      │
    └────────────────────────────────────────┘
```

---

## LAYER 3: HARNESS GATES — 5 Gates in Sequence ★

```
    20 candidate chunks + computed_facts
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  harness.py ★ NEW — 5-gate verification               │
│  WIRED via: unified_pipeline.inject_with_harness()   │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ GATE 1: SOURCE AUTHENTICATION                  │  │
│  │ ────────────────────────────────────           │  │
│  │ • Source file exists on disk?                  │  │
│  │ • Chunk hash matches?                          │  │
│  │ • Book citation traceable to Teams/Books/?     │  │
│  │ • Within agent's authorized departments?       │  │
│  │                                                │  │
│  │ OUTPUT: verified | flagged | blocked           │  │
│  │ FALLBACK: if project_root not set,             │  │
│  │   assume source exists (test mode)             │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ GATE 2: MULTIPLICATIVE RELIABILITY             │  │
│  │ ────────────────────────────────────           │  │
│  │ reliability = freshness × authority × quality  │  │
│  │                                                │  │
│  │ freshness: staleness_economics.doc_freshness() │  │
│  │ authority: 7-level source type mapping         │  │
│  │   book=1.0, standard=0.9, shared_os=0.85,     │  │
│  │   dept_doc=0.7, agent=0.65, skill=0.55,       │  │
│  │   playbook=0.5, operational=0.4, unknown=0.2   │  │
│  │ quality: feedback loop historical score        │  │
│  │                                                │  │
│  │ RESULT: authoritative → 0.95, junk → 0.00      │  │
│  │         948x separation                        │  │
│  │ FALLBACK: if staleness_economics absent,       │  │
│  │   use simple linear decay (1 - age_days/365)   │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ GATE 3: CONFLICT DETECTION                     │  │
│  │ ────────────────────────────────────           │  │
│  │ • Pairwise embedding comparison                │  │
│  │ • Contradiction: shared terms ≥ 2 + negation   │  │
│  │ • Version conflict: same source, different sec │  │
│  │ • Domain conflict: general vs specific         │  │
│  │                                                │  │
│  │ OUTPUT: conflict flags → injected into context │  │
│  │   ⚠️ CONFLICT: [NIST SP 800-30] vs            │  │
│  │   [ISO 31000:2018] — fixed thresholds vs       │  │
│  │   context-dependent evaluation                 │  │
│  │   Agent must reconcile before responding.      │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ GATE 4: PRIORITY-BASED BUDGET ASSEMBLY         │  │
│  │ ────────────────────────────────────           │  │
│  │ P0: Agent identity (always)                    │  │
│  │ P1: Active skills (progressive-loaded)         │  │
│  │ P2: Computed facts (Shared OS results)         │  │
│  │ P3: T1 verified chunks (load-bearing)          │  │
│  │ P4: T2 structural chunks                       │  │
│  │ P5: One adversarial chunk                      │  │
│  │ P6: T3 supplementary                           │  │
│  │ P7: Inactive skill summaries                   │  │
│  │                                                │  │
│  │ Budget fills P0→P7. Exhausted → remaining      │  │
│  │ dropped. Assembly plan logged.                 │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ GATE 5: QUARANTINE + RECOVERY                  │  │
│  │ ────────────────────────────────────           │  │
│  │ • Reliability < threshold → quarantine         │  │
│  │ • T1 quarantine → operator notified            │  │
│  │ • Recovery scan: dropped chunks checked for:   │  │
│  │   novel facts, exceptions, contradictions      │  │
│  │ • Recovered → pulled back into assembly        │  │
│  │                                                │  │
│  │ Log: quarantine.jsonl (append-only)            │  │
│  │ FALLBACK: if no log file, skip quarantine      │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  FALLBACK: If harness.py absent → skip all gates     │
│            → pass chunks directly to injection        │
│            → inject() works exactly as before         │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              VERIFIED CHUNKS (5-8 chunks with conflict flags)
```

---

## LAYER 4: STRATEGY ROUTING + INJECTION

```
    verified chunks + conflict flags
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  unified_pipeline.py — Strategy Router                │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ FAST PATH                                      │  │
│  │ creative_review, copy_edit, factual_lookup     │  │
│  │ → destructor.py                               │  │
│  │ → hard budget: 80-100t                        │  │
│  │ → strip-to-essentials: citations + rules +    │  │
│  │   numbers + authorities + gates + computed    │  │
│  │ → survival mode (<200t budget)               │  │
│  │ → 64-89% savings                             │  │
│  │ → No recovery pass (quality acceptable)      │  │
│  │                                              │  │
│  │ FALLBACK: if destructor.py absent            │  │
│  │ → raw text injection (no compression)        │  │
│  └──────────────────────┬───────────────────────┘  │
│                         │                          │
│  ┌──────────────────────┴───────────────────────┐  │
│  │ BALANCE PATH                                  │  │
│  │ everything else                              │  │
│  │ → adaptive budget (0.4x-4.0x multiplier)     │  │
│  │ → strip essentials per chunk                 │  │
│  │ → recovery pass (5 triggers)                 │  │
│  │ → 39-77% savings, quality preserved          │  │
│  │                                              │  │
│  │ FALLBACK: if recovery fails                  │  │
│  │ → inject without recovery (all kept chunks)  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  FALLBACK: if unified_pipeline absent                │
│  → direct destructor.inject() as minimal path        │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              FINAL INJECTION TEXT
              (with citations, conflict flags, computed facts)
```

---

## LAYER 5: LLM GENERATION + POST-HOC VERIFICATION

```
    injection_text + agent persona + active skills
        │
        ├──────────────────────────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────────┐              ┌─────────────────────┐
│  PRIMARY LLM      │              │  DEEPSEEK (adversarial│
│  hermes + claude  │              │  verification LLM)   │
│  Reasoning + code │              │  Different perspective│
└────────┬──────────┘              └──────────┬──────────┘
         │                                   │
         │         ┌─────────────────────────┘
         │         │
         ▼         ▼
    MODEL RESPONSE
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  verifier.py — Post-Hoc Verification ★ WIRED          │
│  WIRED via: bridge.py --mode verify                  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ LAYER 1: GROUNDED CITATION CHECK               │  │
│  │ ────────────────────────────────────           │  │
│  │ • Extract factual claims from response         │  │
│  │   (numbers, rules, citations, entities,        │  │
│  │    statements)                                 │  │
│  │ • Search injected chunks for support           │  │
│  │ • Text similarity: exact match → 1.0           │  │
│  │   partial match → overlap score                │  │
│  │ • Output: per-claim verification               │  │
│  │   supported | unsupported | misattributed      │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ LAYER 2: SELF-CONSISTENCY CHECK               │  │
│  │ ────────────────────────────────────           │  │
│  │ • Check for opposing rules (must A vs never A) │  │
│  │ • Sentence-level contradiction detection       │  │
│  │ • Output: consistent | issues list            │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ LAYER 3: CONSTITUTION COMPLIANCE               │  │
│  │ ────────────────────────────────────           │  │
│  │ • Every citation sourced?                      │  │
│  │ • Computed values reference Shared OS?         │  │
│  │ • No unsupported speculation?                  │  │
│  │ • Contradictions acknowledged?                 │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ AGENT DELEGATION                               │  │
│  │ ────────────────────────────────────           │  │
│  │ High-stakes (governance, legal, strategy)      │  │
│  │ + low verification score (<0.7)                │  │
│  │ → delegate to quinn (QA, charter enforcement)  │  │
│  │ → delegate to precedent (consistency)          │  │
│  │ → delegate to sentinel (bypass detection)      │  │
│  │                                                │  │
│  │ NOTE: Agent delegation is a recommendation.     │  │
│  │ The CIE decides whether to actually delegate.  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  FALLBACK: if verifier absent → skip verification    │
│           → response delivered without check         │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              VERIFICATION REPORT
              + verified response
```

---

## LAYER 6: FEEDBACK LOOP

```
    verification_report + user_outcome (accept/reject/revise)
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  feedback.py — Quality Scoring System                │
│                                                      │
│  quality_new = quality_old × 0.95 + outcome × 0.05   │
│  Slow-moving. 5% weight on latest. 95% on history.   │
│                                                      │
│  ★ ALSO UPDATES via verifier results:               │
│    - Grounded score → chunk quality adjustment       │
│    - Unsupported claims → source downgrade           │
│    - Repeated unsupported → quarantine suggestion    │
│                                                      │
│  Log: feedback.jsonl (append-only)                   │
│                                                      │
│  FALLBACK: if feedback.py absent                    │
│  → quality scores stay static (0.5 default)         │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              UPDATED CHUNK QUALITY SCORES
              (used by Gate 2 Reliability in harness)
```

---

## LAYER 7: FIELD MONITORING — Read-Only Analysis

```
    feedback records + quality history + query history + agent history
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  field_monitor.py — Continuous Observer ★             │
│  Scheduled via: self_improver weekly                  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ ATTRACTOR DETECTION                            │  │
│  │ ────────────────────────────────────           │  │
│  │ Chunk combinations that consistently produce   │  │
│  │ good or bad outcomes.                          │  │
│  │ Good: >80% accepted, 3+ occurrences            │  │
│  │ Bad: >60% rejected, 3+ occurrences             │  │
│  │ Output: top-10 attractors by frequency         │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ DEGRADATION DETECTION                          │  │
│  │ ────────────────────────────────────           │  │
│  │ Quality trend over last 4 periods              │  │
│  │ Drop >0.15 → warning                          │  │
│  │ Drop >0.25 → critical                         │  │
│  │ Output: degradation alerts with severity       │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ COVERAGE GAP DETECTION                         │  │
│  │ ────────────────────────────────────           │  │
│  │ Queries getting <2 chunks + <0.4 quality       │  │
│  │ Or >90% savings with <0.3 quality              │  │
│  │ Output: per-task coverage gaps                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ DRIFT DETECTION                                │  │
│  │ ────────────────────────────────────           │  │
│  │ Agent behavior changing over time              │  │
│  │ Savings change >15% → drift                    │  │
│  │ Quality change >0.10 → drift                   │  │
│  │ Output: per-agent drift signals                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Output: field_monitor_report.md (weekly)            │
│          field_monitor_data.json (daily)              │
│                                                      │
│  FALLBACK: if no data → empty report (no crash)      │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              WEEKLY FIELD REPORT
              (feeds self_improver.py)
```

---

## LAYER 8: SELF-IMPROVER — Weekly Autonomous Optimization

```
    ## SCHEDULED: Sunday 00:00 UTC ##
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  self_improver.py — Autonomous Optimization ★         │
│                                                      │
│  PHASE 1 — ANALYZE                                   │
│  ────────────────────────────────────                │
│  Read field_monitor data from past week              │
│  Identify: degradations, coverage gaps, drifts       │
│  Output: Problem list with severity                  │
│                                                      │
│  PHASE 2 — PROPOSE                                   │
│  ────────────────────────────────────                │
│  For each problem:                                   │
│    degradation → reduce chunk weight by 20%          │
│    coverage_gap → increase budget multiplier 1.5x    │
│    drift → reduce compression aggression            │
│  Output: Proposal list with risk levels              │
│                                                      │
│  PHASE 3 — SANDBOX TEST                              │
│  ────────────────────────────────────                │
│  Test proposals against 5 benchmark scenarios        │
│  ALL tests in sandbox: synthetic data only            │
│  No real files modified                               │
│  Output: Test results (passed/failed per scenario)    │
│                                                      │
│  PHASE 4 — DECIDE                                    │
│  ────────────────────────────────────                │
│  All tests pass → proceed to deploy                  │
│  Any test fails → ALL proposals held                 │
│  Output: deployment decision                         │
│                                                      │
│  PHASE 5 — DEPLOY (conditional)                      │
│  ────────────────────────────────────                │
│  Atomically update parameter files                   │
│  Previous version backed up: *.backup                │
│  File-based → git rollback always available          │
│                                                      │
│  PHASE 6 — LOG                                       │
│  ────────────────────────────────────                │
│  Append to improvement_log.jsonl:                     │
│    timestamp, problems, proposals, tests, deployed    │
│                                                      │
│  FALLBACK: if sandbox test fails                    │
│  → report to operator, do NOT deploy                │
│  → revert to previous parameter set                 │
│  → log failure to improvement_log.jsonl             │
└──────────────────────────────────────────────────────┘
```

---

## LAYER 9: SHARED OS — Formula Execution

```
    ┌───────────────────────────────────────┐
    │  Teams/Shared OS/logical/             │
    │  35 Python scripts                    │
    │                                      │
    │  Finance: capital_budgeting.py        │
    │    npv(), wacc(), irr()               │
    │  Strategy: competitive_strategy.py    │
    │    five_forces()                      │
    │  Risk: risk_management.py             │
    │    risk_score(), risk_level()         │
    │  Marketing: marketing_laws.py         │
    │    lasswell_model(), pareto_principle │
    │  Planning: planning_fallacy.py        │
    │    calibration_weight(), de_bias()    │
    │  Governance: governance_gate.py       │
    │    board_independence_check()         │
    │  ... (29 more)                        │
    │                                      │
    │  Called by: bridge.py formula detect │
    │  Used by: optimizer.py (freshness)   │
    │          harness.py (authority)      │
    │          feedback.py (quality)       │
    │                                      │
    │  FALLBACK: if script absent          │
    │  → skip formula computation          │
    │  → inject query with no computed     │
    │    facts (graceful degradation)      │
    └───────────────────────────────────────┘
```

---

## LAYER 10: AGENT FLEET — 46 Agents × 7 Departments

```
    ┌───────────────────────────────────────┐
    │  Teams/                               │
    │                                      │
    │  AI & Agents (8): meta, proto, relay, │
    │    forge, gauge, anneal, scout, edge  │
    │  Brand Studio (11): spark, lena,      │
    │    atlas, muse, weave, pixel, pulse,  │
    │    rio, nate, kai, tempo             │
    │  Cybersecurity (5): warden, keyring,  │
    │    bastion, cortex, veil              │
    │  Engineering (11): dev, ops, cypher,  │
    │    aegis, axiom, rank, quinn, dana,   │
    │    raj, mia, nova                    │
    │  Executive Office (3): marcus, echo,  │
    │    vista                              │
    │  Governance (3): board, precedent,    │
    │    sentinel                            │
    │  Product (5): spec, metric, ux, loom, │
    │    price                              │
    │                                      │
    │  Each agent: agent.md + identity/ +   │
    │    custom/ + marketplace/ +           │
    │    operational/ + logical/            │
    │                                      │
    │  Used by: progressive_disclosure.py  │
    │          harness.py (auth check)     │
    │          retriever.py (dept filter)   │
    │          optimizer.py (agent profiles)│
    │                                      │
    │  FALLBACK: if agent files absent     │
    │  → use default compression profile   │
    │  → no authorization check            │
    └───────────────────────────────────────┘
```

---

## LAYER 11: CIE — TypeScript Orchestration

```
    ┌───────────────────────────────────────┐
    │  src/ (TypeScript)                    │
    │                                      │
    │  {cie/classifier.ts}                  │
    │    → task classification              │
    │    → agent routing                    │
    │  {cie/retriever.ts}                   │
    │    → calls bridge.py subprocess       │
    │    → JSON stdin/stdout                │
    │  {cie/ranker.ts}                      │
    │    → re-ranks retrieved context       │
    │  {cie/builder.ts}                     │
    │    → builds final LLM prompt          │
    │  {cie/rag-bridge.ts}                  │
    │    → subprocess: python3 rag/bridge   │
    │  {pipelines/governance-gate.ts}       │
    │    → 4-gate cycle (recommend→review  │
    │      →approve→audit)                 │
    │  {pipelines/caos-executor.ts}         │
    │    → orchestrates multi-agent flow    │
    │  {pipelines/content-pipeline.ts}      │
    │    → Brand Studio content flow        │
    │  {toon/compressor.ts}                │
    │    → TOON compression                │
    │                                      │
    │  Bridge protocol:                    │
    │    → --mode retrieve                  │
    │    → --mode formula                   │
    │    → --mode feedback                  │
    │    → --mode verify ★ NEW              │
    │                                      │
    │  FALLBACK: if bridge.py unavailable  │
    │  → direct LLM call (no RAG)          │
    └───────────────────────────────────────┘
```

---

## COMPLETE DATA FLOW — END TO END

```
USER QUERY
    │
    ├─{cie/classifier.ts}────────────→ task_type + agent_id
    │
    ├─progressive_disclosure.py──────→ active skills (2-3) + inactive summaries
    │
    ├─{cie/rag-bridge.ts}────────────→ python3 rag/core/bridge.py --mode retrieve
    │   │
    │   ├─retriever.py───────────────→ query rewrite → hybrid retrieve → rerank
    │   ├─optimizer.py───────────────→ dynamic profile → diversity → adversary
    │   ├─bridge.py (formula detect) → Shared OS scripts → computed facts
    │   │
    │   ├─unified_pipeline.py────────→ inject_with_harness()
    │   │   │
    │   │   ├─harness.py (Gate 1)────→ authenticate: verified/flagged/blocked
    │   │   ├─harness.py (Gate 2)────→ reliability: multiplicative score
    │   │   ├─harness.py (Gate 3)────→ conflict: detection + flags
    │   │   ├─harness.py (Gate 4)────→ priority: P0→P7 budget assembly
    │   │   ├─harness.py (Gate 5)────→ quarantine + recovery
    │   │   │
    │   │   ├─FAST → destructor.py───→ hard budget: 80-100t, 64-89% savings
    │   │   └─BALANCE → adaptive ────→ budget: 0.4x-4.0x, 39-77% savings
    │   │
    │   └─bridge.py──────────────────→ JSON response with harness trace
    │
    ├─{cie/builder.ts}───────────────→ LLM prompt assembly
    │
    ├─LLM (hermes+claude)────────────→ primary reasoning + code
    ├─LLM (deepseek)─────────────────→ adversarial verification
    ├─LLM (chatgpt)──────────────────→ content/creative quality
    │
    ├─verifier.py (--mode verify)────→ grounded citations + self-consistency
    │   │
    │   ├─high-stakes + low score───→ delegate to quinn/precedent/sentinel
    │   └─low-stakes─────────────────→ automated verification only
    │
    ├─feedback.py────────────────────→ update chunk quality scores
    │
    └─field_monitor.py───────────────→ continuous observation (async)
        │
        └─self_improver.py───────────→ weekly optimization cycle ##
```

---

## FALLBACK MATRIX

| Component | Failure | Fallback | Impact |
|-----------|---------|----------|--------|
| progressive_disclosure.py | Import error | All skills loaded as before | No savings, but works |
| harness.py | Import error | Chunks pass through unverified | No auth/reliability/conflict checks |
| harness.py Gate 1 | project_root not set | Assume source exists (test mode) | No auth in test environments |
| harness.py Gate 2 | staleness_economics absent | Linear decay: 1 - age/365 | Simplified freshness model |
| harness.py Gate 3 | No embeddings | Text overlap + regex fallback | Less accurate conflict detection |
| harness.py Gate 4 | Budget overflow | Post-assembly truncation | Deterministic character-level enforcement |
| harness.py Gate 5 | No log file | Skip quarantine logging | Quarantined chunks excluded silently |
| unified_pipeline.py | Import error | Direct destructor.inject() | Minimal path: hard budget only |
| verifier.py | Import error | Skip verification | Response delivered without check |
| bridge.py | Subprocess error | Direct LLM call | No RAG, model works from training data |
| Shared OS scripts | Import error | Skip formula computation | No computed facts in context |
| feedback.py | Import error | Quality scores static at 0.5 | No learning over time |
| field_monitor.py | No data | Empty report | No alerts, but no crash |
| self_improver.py | Sandbox test fails | ALL proposals held, operator notified | Safe: no bad changes deployed |

---

## TEST SUITE SUMMARY

Table below is the 2026-07-16 plan (strategy.py since deleted, field_monitor.py/self_improver.py
renamed to monitor/watcher.py+improver.py, gates really 35 not 36) — 263 is stale, real live total
is 346 across 16 modules, see §7.

```
Module                            Tests    Status
──────────────────────────────────────────────
injector.py                         22     ✅ ALL PASSING
strategy.py                         23     ✅ ALL PASSING (deleted since — see §7)
destructor.py                       35     ✅ ALL PASSING
unified_pipeline.py                 31     ✅ ALL PASSING
harness.py                          36     ✅ ALL PASSING (real: 35)
verifier.py                         16     ✅ ALL PASSING
progressive_disclosure.py           23     ✅ ALL PASSING
field_monitor.py                    17     ✅ ALL PASSING
self_improver.py                    20     ✅ ALL PASSING
e2e_validation.py (12 scenarios)    40     ✅ ALL PASSING
optimizer.py (+multiplicative)     all    ✅ EXISTING PRESERVED
bridge.py (+verify mode)           all    ✅ EXISTING PRESERVED
──────────────────────────────────────────────
TOTAL                              263    (stale — real total 346, see §7)
```

---

## COMMANDS

```bash
# Full test suite (paths corrected to real locations)
python3 rag/core/unified_pipeline.py --test        # 31 tests + harness wiring
python3 rag/harness/gates.py --test                 # 35 tests (all 5 gates)
python3 rag/verify/grounded.py --test               # 16 tests
python3 rag/harness/disclosure.py --test            # 23 tests
python3 rag/monitor/watcher.py --test               # 17 tests
python3 rag/monitor/improver.py --test              # 20 tests
python3 rag/experiments/e2e.py                      # 40 tests (12 scenarios)

# Bridge modes
echo '{"query":"...","agent_id":"spark"}' | python3 rag/core/bridge.py --mode retrieve
echo '{"response":"...","chunks":[...]}' | python3 rag/core/bridge.py --mode verify

# Production injection with all harness gates
python3 -c "
from rag.core.unified_pipeline import inject_with_harness
result = inject_with_harness(
    query='review headline copy for campaign',
    agent_id='spark',
    chunks=retrieved_chunks,
    agent_identity='You are spark...',
    enable_harness=True,
    enable_progressive=True,
)
"

# Weekly self-improvement (dry run)
python3 rag/monitor/improver.py --dry-run
```

---

# ═══════════ PART 5 — COMPLETE 4-LAYER MULTI-TENANT ARCHITECTURE ═══════════
*(source: docs/4LAYER.md — verbatim)*

# YVON — COMPLETE 4-LAYER MULTI-TENANT ARCHITECTURE

**Status:** Design Phase — Master Architecture Plan  
**Date:** 2026-07-16  
**Purpose:** YVON Core manages Novizio, Hourbour, and AgentX (SaaS for small businesses)  
**Validated Against:** Google agents-cli (github.com/google/agents-cli) — YVON's architecture aligns with Google's agent engineering patterns at every layer. See cross-reference section at end.

**Design-phase doc (2026-07-16), read as history like PART 2/3 — two spots already got a
2026-08-09 resolution note pointing to `GRAPH-BRAIN-DESIGN.md` as canonical (below). One more
concrete fix applied now: "7 tools mapped" for the MCP marketplace → real count is 9 (6 MCP-kind,
3 non-MCP), see §10.**

---

## THE 4-LAYER STACK

> **Resolved 2026-08-09 (Open Issues, Issue 7):** this is no longer the canonical technical-layer
> model — `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §18 is, having absorbed and reconciled the parallel four-layer
> description that used to live in `system-harness/graph-brain/YVON-GRAPH.md` §9. The four items below are **product/
> deployment-tier content**, not a peer technical stack: AgentX is a *tenant* of the L1–L4
> execution stack, not a layer on top of it. See `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §18.1 for the exact
> mapping of where each item below actually lives in the canonical stack (mostly: L1 Data for the
> registries/graphs, L2 Capability for governance-as-agents and tool grants, L3 Orchestration for
> tier-based concurrency caps, L4 Interface for the dashboards). Content below is unchanged and
> still accurate as a description of what each tier carries — only the "layer" framing is
> superseded.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  LAYER 4: AGENTX PLATFORM (SaaS for Small Business)              │
│  • Business onboarding & profile creation                        │
│  • Department subscription & billing tiers                       │
│  • Tenant provisioning & isolation                               │
│  • External integration marketplace                              │
│  • Business dashboard & analytics                                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 3: INTEGRATION LAYER (MCP + External APIs)               │
│  • MCP tool registry (relay) — ALL external tools registered     │
│  • Integration patterns (relay) — idempotency, retry, circuit    │
│  • Egress allowlist (relay) — per-tool network boundaries        │
│  • Engineering MCP marketplace — 9 tools mapped (6 MCP, 3 non-MCP)│
│  • Connector SDK — build custom integrations per business        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 2: AGENT LAYER (46 Agents × 7 Departments)               │
│  • RAG pipeline with 5-gate harness (auth, reliability, conflict,│
│    priority, quarantine)                                         │
│  • Progressive skill disclosure (40-60% context savings)         │
│  • Post-hoc grounded citation verification                       │
│  • Field monitoring + self-improvement (weekly auto-optimize)    │
│  • Token savings pipeline (64-91% compression)                  │
│  • Graph memory (relational + dependency)                        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 1: YVON CORE (Master Control Plane)                      │
│  • Master Obsidian Graph Vault                                  │
│  • Fleet governance (meta + board + precedent + sentinel)        │
│  • Business profile registry                                    │
│  • Department deployment engine                                 │
│  • Multi-tenant isolation & data boundaries                      │
│  • Cross-tenant learning pipeline                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## THE DATA FLOW — End to End

```
                                  MASTER OBSIDIAN GRAPH VAULT
                                  ┌──────────────────────┐
                                  │ YVON MASTER GRAPH    │
                                  │ • Fleet state        │
                                  │ • All business profiles│
                                  │ • Learning patterns  │
                                  │ • Global improvements│
                                  └──────┬───────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
              ┌──────────┐       ┌──────────┐        ┌──────────────┐
              │ NOVIZIO  │       │ HOURBOUR │        │    AGENTX    │
              │ (Brand 1)│       │ (Brand 2)│        │  (SaaS Layer)│
              │ 3 depts  │       │ 2 depts  │        │              │
              └────┬─────┘       └────┬─────┘        └──────┬───────┘
                   │                  │                     │
                   │                  │         ┌───────────┼───────────┐
                   │                  │         │           │           │
                   │                  │         ▼           ▼           ▼
                   │                  │    ┌─────────┐┌─────────┐┌─────────┐
                   │                  │    │Boutique ││  Cafe   ││SaaS Co. │
                   │                  │    │Client A ││Client B ││Client C │
                   │                  │    │2 depts  ││1 dept   ││4 depts  │
                   │                  │    └────┬────┘└────┬────┘└────┬────┘
                   │                  │         │          │          │
                   │                  │    ┌────▼──────────▼──────────▼────┐
                   │                  │    │    PER-TENANT ISOLATION      │
                   │                  │    │    • Schema-per-tenant, shared│
                   │                  │    │      pgvector/qdrant Postgres │
                   │                  │    │      instance (§6, Issue 6)   │
                   ▼                  ▼    │    • Separate agent state     │
         ┌────────────────────┐  ┌────────┐│    • Separate skills/config   │
         │ OWNED BRAND GRAPH  │  │TENANT  ││    • Separate feedback loop   │
         │ • Novizio + Hourbour│  │GRAPH   ││    • Anonymized telemetry →  │
         │ • Direct YVON access│  │MEMORY  ││      Master Graph for learning│
         │ • Full dept access  │  │        │└─────────────────────────────┘
         └────────────────────┘  └────────┘
```

---

## LAYER 1: YVON CORE — MASTER CONTROL PLANE

### WHAT IT IS
The single source of truth for the entire YVON ecosystem. One Obsidian vault containing the master knowledge graph that connects every business, every agent deployment, and every learning signal.

### MASTER GRAPH VAULT STRUCTURE

```
/vault/                          # Single Obsidian vault
├── fleet/                       # Agent fleet state
│   ├── agents/                  # All 46 agent statuses
│   ├── departments/             # Per-department health
│   └── improvements/            # Self-improver deployment history
│
├── businesses/                  # Business profile registry
│   ├── novizio/                 # Owned brand — full access
│   ├── hourbour/                # Owned brand — full access
│   └── agentx/                  # Tenant registry
│       ├── tenants/             # One folder per tenant
│       │   ├── boutique-a/      # Business profile + config
│       │   ├── cafe-b/
│       │   └── saas-c/
│       └── templates/           # Department deployment templates
│
├── learning/                    # Cross-tenant learning
│   ├── patterns/                # Anonymized behavior patterns
│   ├── improvements/            # Global improvements from tenant data
│   └── benchmarks/              # Performance baselines
│
├── governance/                  # Master governance
│   ├── constitution/            # YVON constitution
│   ├── rulings/                 # Board decisions
│   └── audit/                   # Audit trails
│
└── integrations/                # External integration registry
    ├── mcp-registry/            # Complete MCP tool catalog
    ├── connectors/              # Per-business connector configs
    └── marketplace/             # Available integration marketplace
```

### MULTI-TENANT GRAPH MEMORY MODEL

Each tenant (business) gets its own **isolated graph database**:

```
TENANT: Boutique A
/vault/businesses/agentx/tenants/boutique-a/
│
├── profile.md                  # Business identity, industry, size, goals
├── departments/                # Active department configs
│   ├── brand-studio/           # Only agents rented by this business
│   │   ├── spark/              # Each agent has per-tenant state
│   │   ├── lena/
│   │   └── pixel/
│   └── product/                # Optional: second department
│
├── graph/                      # ISOLATED tenant graph (Obsidian vault)
│   ├── content/                # All content produced for this business
│   ├── decisions/              # Decisions made + outcomes
│   ├── customers/              # Customer profiles (encrypted)
│   ├── analytics/              # Performance data
│   └── feedback/               # Agent feedback for this tenant
│
├── integrations/               # External tool connections
│   ├── instagram.md            # Connected social account
│   ├── shopify.md              # Connected e-commerce
│   └── mailchimp.md            # Connected email marketing
│
├── state/                      # Runtime state (ephemeral)
│   ├── sessions/               # Active agent sessions
│   ├── queue/                  # Pending tasks
│   └── cache/                  # Temporary context cache
│
└── analytics.md                # Business-specific metrics dashboard
```

**Isolation guarantees:**
- Each tenant has a separate SQLite database (graph store)
- Tenant A's graph queries can NEVER return Tenant B's data
- Agent sessions are sandboxed per tenant (no cross-tenant context leakage)
- Anonymized aggregate patterns feed back to master (not raw data)
- Encryption at rest for customer-sensitive data in tenant graphs

---

## LAYER 2: AGENT LAYER — WHAT EXISTS & WHAT'S NEW

### STATUS: 80% COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| 46 agents × 7 departments | ✅ DONE | Full definitions, skills, configs |
| RAG pipeline (retrieval → injection) | ✅ DONE | 16 modules, 346 tests (re-verified 2026-08-09, see §7) |
| 5-gate harness | ✅ DONE | auth, reliability, conflict, priority, quarantine |
| Progressive skill disclosure | ✅ DONE | 40-60% context savings |
| Post-hoc verification | ✅ DONE | Grounded citations + self-consistency |
| Token savings pipeline | ✅ DONE | 22-91% compression |
| Relational chunk graph | ✅ DONE | defines/extends/contradicts/supersedes |
| Field monitoring | ✅ DONE | Attractors, degradation, coverage, drift |
| Self-improvement | ✅ DONE | Weekly analyze→propose→test→deploy |
| **Business Profile System** | ❌ BUILD | Define tenant identity, departments, constraints |
| **Department Deployment Engine** | ❌ BUILD | Spin up dept subset per business |
| **Multi-Tenant RAG Router** | ❌ BUILD | Route queries to correct tenant's graph |
| **Cross-Tenant Learning** | ❌ BUILD | Anonymized patterns → master improvements |

---

## LAYER 3: INTEGRATION LAYER — MCP + EXTERNAL APIs

### STATUS: 60% COMPLETE

### WHAT EXISTS

| Component | Agent | Status |
|-----------|-------|--------|
| MCP tool registry | relay | ✅ SKILL.md defined. Registry lint script exists. Append-only. |
| Integration patterns | relay | ✅ SKILL.md defined. Idempotency, retry, circuit breaker, contract monitoring. |
| Egress allowlist | relay | ✅ SKILL.md defined. Per-tool network boundaries. |
| Least privilege grants | relay | ✅ SKILL.md defined. Per-agent access map. |
| MCP client (TypeScript) | CIE | ✅ `src/adapters/mcp-client.ts`. stdio JSON-RPC. Spawns MCP servers. |
| Engineering MCP marketplace | dev team | ✅ 7 tools mapped to 9 agents. Full inventory. |
| Ecosystem scanning | scout | ✅ SKILL. Evaluates new tools, feeds relay's registry. |

### 7 MCP TOOLS IN ENGINEERING MARKETPLACE

| Tool | Assigned Agents | Purpose |
|------|----------------|---------|
| **Ponytail** | dev, axiom | Minimal code generation (54% less code) |
| **Browserbase MCP** | mia, nova, cypher, aegis, quinn | Cloud browser automation (QA, security, visual testing) |
| **Firecrawl MCP** | rank, cypher, dana | Web scraping + search (10+ tools) |
| **Website Cloner** | mia, rank | Multi-agent site reconstruction |
| **Crawl4AI** | dana, rank | LLM-friendly web crawling |
| **Scrapling** | dana, rank | Adaptive scraping with anti-bot |
| **Playwright MCP** | mia, nova, quinn | Browser automation (testing, screenshots) |

### WHAT NEEDS BUILDING FOR AGENTX

| Component | Purpose |
|-----------|---------|
| **Connector SDK** | Standardized way for businesses to connect their tools (Instagram, Shopify, Mailchimp, Square, QuickBooks, etc.) |
| **Connector Marketplace** | Pre-built connectors businesses can enable with one click |
| **Connector Sandbox** | Test new connectors in isolation before production |
| **Per-Tenant Tool Config** | Each tenant's API keys, credentials stored encrypted |
| **Integration Health Monitor** | Track which connectors are working, which are failing |
| **Auto-Discovery** | scout scans for new tools a business might benefit from |

---

## LAYER 4: AGENTX PLATFORM — SaaS FOR SMALL BUSINESSES

### THE ONBOARDING FLOW

```
SMALL BUSINESS OWNER VISITS agentx.ai
    │
    ▼
┌──────────────────────────────────────────────┐
│ STEP 1: BUSINESS PROFILE CREATION            │
│ ─────────────────────────────────           │
│ • Business name, industry, size              │
│ • What do they need help with?               │
│   "I need social media management"           │
│   "I need brand design"                      │
│   "I need customer support"                  │
│ • YVON recommends department(s)              │
│ • Select subscription tier                   │
│                                              │
│ TIERS:                                       │
│   Starter ($49/mo) — 1 dept, 3 agents        │
│   Growth ($149/mo) — 2 depts, 8 agents       │
│   Scale ($399/mo) — 4 depts, full automation │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ STEP 2: TENANT PROVISIONING                  │
│ ─────────────────────────────────           │
│ • Create isolated tenant graph vault         │
│ • Deploy department subset (e.g.,            │
│   Brand Studio: spark + lena + pixel)        │
│ • Generate agent identities for this business │
│ • Set up feedback loop for this tenant       │
│ • Provision RAG pipeline with per-tenant     │
│   context window                             │
│ • Generate business-specific skill overrides │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ STEP 3: EXTERNAL INTEGRATIONS                │
│ ─────────────────────────────────           │
│ • Connect business tools:                    │
│   Instagram (for social media dept)          │
│   Canva/Figma (for design dept)              │
│   Shopify (for e-commerce dept)              │
│   Square/Stripe (for payments)               │
│   Mailchimp (for email marketing)            │
│   Google Analytics (for analytics)           │
│                                              │
│ • Each connector:                             │
│   1. Business authorizes (OAuth)             │
│   2. YVON tests connection in sandbox        │
│   3. Connector registered in relay's MCP     │
│      registry with per-tenant scope          │
│   4. Agent gets tool access via relay's      │
│      least-privilege grant                   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ STEP 4: GO LIVE                              │
│ ─────────────────────────────────           │
│ • Agents begin operating                     │
│ • Business owner gets dashboard              │
│ • Weekly performance reports                 │
│ • Graph memory begins accumulating           │
│ • Feedback loop tunes per-tenant quality     │
│ • Anonymized patterns feed Master Graph      │
└──────────────────────────────────────────────┘
```

### AGENTX SUBSCRIPTION TIERS

| Tier | Departments | Agents | Price | Best For |
|------|------------|--------|-------|----------|
| **Starter** | 1 | Up to 3 | $49/mo | Solo business, one need |
| **Growth** | 2 | Up to 8 | $149/mo | Growing business, 2 needs |
| **Scale** | 4 | Up to 20 | $399/mo | Full automation |
| **Enterprise** | All 7 | All 46 | Custom | Full YVON deployment |

### DEPARTMENT PACKAGES

| Package | Agents Included | What It Does |
|---------|----------------|--------------|
| **Social Media** | spark, lena, pulse, rio | Content creation, scheduling, ad management, community engagement |
| **Brand & Design** | spark, atlas, pixel, muse, weave | Logo, brand identity, visual assets, creative direction |
| **Growth & Analytics** | kai, nate, rank, metric | SEO, A/B testing, analytics, funnel optimization |
| **Customer Support** | spec, ux, loom | Customer research, feedback management, PMF tracking |
| **E-Commerce** | price, metric, dev, ops | Pricing, analytics, technical operations |
| **Full Marketing** | All Brand Studio (11 agents) | Complete marketing department |

---

## THE GRAPH MEMORY SYSTEM

> **Isolation model aligned with §6 2026-08-09** (Open Issues, Issue 6). This section predates
> the MemPalace/pgvector decision and originally described "dedicated graph DB per brand" /
> "separate SQLite per tenant" — a stronger, per-tenant-instance isolation model that was never
> reconciled with §6's shared-namespace design. Resolved: **tiered, not uniform.** Tier 1/2
> below share one pgvector/qdrant instance (Master + owned brands, isolated by namespace); Tier 3
> uses schema-per-tenant within that same Postgres instance, not a separate DB per client. Sizes/
> content below are otherwise unchanged and still accurate.

### THREE GRAPH TIERS

```
TIER 1: MASTER GRAPH (YVON Core)
┌─────────────────────────────────────────┐
│ Size: Massive (all knowledge)           │
│ Content:                                │
│ • All 46 agents' operational state      │
│ • All business profiles                 │
│ • All governance decisions              │
│ • Cross-tenant learning patterns        │
│ • Global improvement history            │
│ • MCP/integration registry              │
│                                         │
│ Access: YVON Core + board + meta        │
│ Isolation: N/A (master is single source)│
└─────────────────────────────────────────┘
            │
            │ feeds learning patterns
            ▼
TIER 2: OWNED BRAND GRAPHS (Novizio, Hourbour)
┌─────────────────────────────────────────┐
│ Size: Large (full business knowledge)   │
│ Content:                                │
│ • Business-specific agent state         │
│ • Content produced by agents            │
│ • Customer data (encrypted)             │
│ • Performance analytics                 │
│ • Integration configurations            │
│                                         │
│ Access: Brand owner + YVON Core         │
│ Isolation: pgvector/qdrant namespace,   │
│   shared instance with Tier 1 (§6)      │
└─────────────────────────────────────────┘
            │
            │ anonymized patterns
            ▼
TIER 3: TENANT GRAPHS (AgentX clients)
┌─────────────────────────────────────────┐
│ Size: Small (per-business knowledge)    │
│ Content:                                │
│ • Tenant-specific agent state           │
│ • Content produced for this business    │
│ • Customer data (encrypted)             │
│ • Basic analytics                       │
│ • Connector configurations              │
│                                         │
│ Access: Tenant owner + YVON Core        │
│ Isolation: schema-per-tenant, same      │
│   Postgres instance as Tier 1/2 (§6)    │
│ Privacy: Data never leaves tenant graph │
│          except anonymized aggregates   │
└─────────────────────────────────────────┘
```

### HOW CROSS-TENANT LEARNING WORKS

```
TENANT A (Boutique)         TENANT B (Cafe)         TENANT C (SaaS Co.)
"social media schedule"     "social media posts"    "Instagram campaign"
      │                           │                        │
      ▼                           ▼                        ▼
┌─────────────────┐     ┌─────────────────┐    ┌─────────────────┐
│ TENANT GRAPH A  │     │ TENANT GRAPH B  │    │ TENANT GRAPH C  │
│ (ISOLATED)      │     │ (ISOLATED)      │    │ (ISOLATED)      │
└────────┬────────┘     └────────┬────────┘    └────────┬────────┘
         │                       │                      │
         │    ANONYMIZED         │                      │
         │    AGGREGATES         │                      │
         │    (no raw data)      │                      │
         └───────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  CROSS-TENANT LEARNER   │
                    │  (self_improver.py      │
                    │   extended for          │
                    │   multi-tenant mode)    │
                    │                         │
                    │  Patterns detected:      │
                    │  → Social media queries │
                    │    peak at 9am and 5pm  │
                    │  → Boutiques ask more   │
                    │    visual design q's    │
                    │  → Cafes ask more event │
                    │    promotion q's        │
                    │  → SaaS cos ask more    │
                    │    technical content q's│
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  MASTER GRAPH UPDATE    │
                    │                         │
                    │  → Tune compression     │
                    │    per industry          │
                    │  → Improve department   │
                    │    package defaults      │
                    │  → Create industry-     │
                    │    specific skill        │
                    │    overrides            │
                    │  → Adjust pricing tiers │
                    │    based on usage data  │
                    └─────────────────────────┘
```

---

## DEPARTMENT DEPLOYMENT PIPELINE

```
OPERATOR SELECTS: "Deploy Brand Studio to Boutique A"
    │
    ▼
┌──────────────────────────────────────────────────┐
│ DEPLOYMENT ORCHESTRATOR (new: deploy.py)         │
│                                                  │
│ 1. Create tenant graph vault                     │
│ 2. Copy agent definitions (spark, lena, pixel)   │
│ 3. Strip YVON-internal references                │
│ 4. Apply business-specific overrides:            │
│    - spark: "You are creative director for       │
│      Boutique A, a women's clothing brand..."    │
│    - lena: "Your brand voice is warm, inclusive, │
│      premium..."                                 │
│ 5. Provision isolated DB per agent               │
│ 6. Wire external connectors (Instagram, Shopify) │
│ 7. Run smoke test (generate one piece of content)│
│ 8. Register in master graph                      │
│ 9. Activate monitoring                           │
│                                                  │
│ ── ROLLBACK ────────────────────────────────    │
│ • Deployment is versioned                        │
│ • Previous configs stored as *.dep-{version}.bak │
│ • git checkout reverts any deployment            │
│ • Tenant graph is append-only (never deleted)    │
└──────────────────────────────────────────────────┘
```

---

## WHAT GETS BUILT — NEW MODULES

### NEW PYTHON MODULES (rag/ platform layer)

| Module | Purpose | Tests Est. |
|--------|---------|-----------|
| `platform/business_profile.py` | Business identity, industry, goals, department selection | 20 |
| `platform/tenant_provisioner.py` | Create isolated tenant graph, deploy agents, wire integrations | 25 |
| `platform/deployment_orchestrator.py` | Version-controlled deploy/rollback pipeline | 20 |
| `platform/graph_vault.py` | Multi-tenant graph database (SQLite per tenant + master Obsidian) | 25 |
| `platform/cross_tenant_learner.py` | Anonymized pattern extraction, master graph updates | 20 |
| `platform/connector_sdk.py` | Standardized interface for business tool integrations | 15 |
| `platform/tenant_rag_router.py` | Route queries to correct tenant's graph with isolation | 20 |
| `platform/billing_tiers.py` | Subscription management, department limits, usage tracking | 15 |

### NEW TYPESCRIPT MODULES (src/ platform layer)

| Module | Purpose |
|--------|---------|
| `src/platform/onboarding.ts` | Business signup flow, tier selection |
| `src/platform/tenant-dashboard.ts` | Per-business analytics dashboard |
| `src/platform/connector-marketplace.ts` | Browse + enable pre-built connectors |

### MODIFIED EXISTING MODULES

| Module | Change |
|--------|--------|
| `rag/core/unified_pipeline.py` | Per-tenant context routing |
| `rag/harness/gates.py` | Per-tenant reliability thresholds |
| `rag/core/feedback.py` | Per-tenant feedback isolation |
| `rag/monitor/improver.py` | Cross-tenant learning mode |
| `rag/monitor/watcher.py` | Per-tenant monitoring |

---

## COMPLETE WORKFLOW — END TO END

```
BOUTIQUE A OWNER: "I need social media content for this week"
    │
    ▼
┌──────────────────────────────────────────────────────┐
│ AGENTX PLATFORM (Layer 4)                            │
│ 1. Route to Boutique A's tenant graph               │
│ 2. Load Boutique A's profile (women's clothing)      │
│ 3. Load active departments (Brand Studio: social)    │
│ 4. Load connected integrations (Instagram, Canva)    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ INTEGRATION LAYER (Layer 3)                          │
│ 1. relay: check MCP registry for this tenant         │
│ 2. Verify Instagram connector is active + healthy    │
│ 3. Apply least-privilege: spark can READ Instagram   │
│    analytics, pulse can POST to Instagram            │
│ 4. Egress allowlist: only *.instagram.com allowed    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ AGENT LAYER (Layer 2)                                │
│ 1. progressive_disclosure: load spark + lena + pulse │
│ 2. retriever: search Boutique A's tenant graph       │
│    (NOT Boutique B's, NOT YVON's internal)           │
│ 3. harness:                                        │
│    Gate 1: authenticate (tenant graph source)        │
│    Gate 2: reliability (per-tenant quality scores)   │
│    Gate 3: conflict (any contradictions?)            │
│    Gate 4: priority assembly (P0→P7)                 │
│    Gate 5: quarantine + recovery                     │
│ 4. unified_pipeline: FAST/BALANCE strategy           │
│ 5. Inject into LLM context                           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ LLM GENERATION                                       │
│ hermes+claude: Generate 5 social posts for week      │
│ deepseek: Verify content aligns with brand voice     │
│ chatgpt: Quality check creative output               │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ POST-HOC VERIFICATION                                │
│ verifier.py: are all claims grounded?                │
│ quinn: QA check on content quality                   │
└──────────────────────┬───────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│ DELIVER TO        │    │ UPDATE TENANT GRAPH   │
│ BOUTIQUE A OWNER  │    │ • Content produced    │
│ via dashboard     │    │ • Engagement metrics  │
│                   │    │ • Agent feedback      │
└──────────────────┘    └──────────┬───────────┘
                                   │
                         ┌─────────▼──────────┐
                         │ ANONYMIZE + AGGREGATE│
                         │ (cross_tenant_learner)│
                         └─────────┬───────────┘
                                   │
                         ┌─────────▼──────────┐
                         │ MASTER GRAPH LEARNS │
                         │ → Boutiques: visual  │
                         │   content outperforms│
                         │ → 9am posts get 2x   │
                         │   engagement vs 3pm  │
                         └──────────────────────┘
```

---

## DATA ISOLATION MATRIX

| Data Type | YVON Core | Novizio | Hourbour | Tenant A | Tenant B |
|-----------|-----------|---------|----------|----------|----------|
| Agent definitions | ✅ R/W | ✅ READ | ✅ READ | ✅ READ | ✅ READ |
| YVON fleet state | ✅ R/W | ❌ | ❌ | ❌ | ❌ |
| Novizio content | ✅ READ | ✅ R/W | ❌ | ❌ | ❌ |
| Hourbour content | ✅ READ | ❌ | ✅ R/W | ❌ | ❌ |
| Tenant A content | ANON ONLY | ❌ | ❌ | ✅ R/W | ❌ |
| Tenant B content | ANON ONLY | ❌ | ❌ | ❌ | ✅ R/W |
| Tenant A customers | ❌ | ❌ | ❌ | ✅ R/W | ❌ |
| Cross-tenant patterns | ✅ R/W | ✅ READ | ✅ READ | ❌ | ❌ |
| MCP registry | ✅ R/W | ✅ READ | ✅ READ | SCOPED | SCOPED |
| Connector credentials | ❌ | ✅ OWN | ✅ OWN | ✅ OWN | ✅ OWN |

---

## BUILDING THE AGENTX CONNECTOR MARKETPLACE

### PRE-BUILT CONNECTORS (Phase 1)

| Connector | Category | For Department | Auth |
|-----------|----------|---------------|------|
| Instagram Graph API | Social Media | Brand Studio | OAuth |
| Facebook Pages API | Social Media | Brand Studio | OAuth |
| TikTok Content API | Social Media | Brand Studio | OAuth |
| Canva API | Design | Brand Studio | API Key |
| Shopify API | E-Commerce | Product + Brand Studio | OAuth |
| WooCommerce API | E-Commerce | Product | API Key |
| Square API | Payments | Product | OAuth |
| Stripe API | Payments | Product | API Key |
| Mailchimp API | Email | Brand Studio | OAuth |
| Google Analytics 4 | Analytics | Product | OAuth |
| Google My Business | Local | Brand Studio | OAuth |
| QuickBooks API | Accounting | Shared OS | OAuth |

### CONNECTOR SDK PATTERN

```python
# platform/connector_sdk.py

class BusinessConnector:
    """Every connector implements this interface."""
    
    name: str              # "instagram", "shopify", etc.
    category: str          # "social_media", "ecommerce", etc.
    auth_method: str       # "oauth", "api_key", "basic"
    scopes: List[str]      # Required permissions
    
    async def connect(self, credentials: Dict) -> bool: ...
    async def test(self) -> ConnectorHealth: ...
    async def execute(self, agent: str, action: str, params: Dict) -> Any: ...
    async def disconnect(self) -> bool: ...
    
    # MCP registration
    def register_in_mcp_registry(self, tenant_id: str) -> None:
        """Register this connector in relay's MCP registry for this tenant."""
```

---

## SELF-IMPROVEMENT LOOP — EXTENDED FOR MULTI-TENANT

```
CURRENT (single-project):
  field_monitor → self_improver → sandbox test → deploy

EXTENDED (multi-tenant):
  
  ┌──────────────────────────────────────────────────────┐
  │ WEEKLY CYCLE: Sunday 00:00 UTC                       │
  │                                                      │
  │ 1. PER-TENANT ANALYSIS (field_monitor × N tenants)   │
  │    → Each tenant's attractors, degradation, coverage │
  │    → Tenant A: social posts at 9am outperform 3pm    │
  │    → Tenant B: visual-first posts get more engagement│
  │                                                      │
  │ 2. CROSS-TENANT AGGREGATION                          │
  │    → Anonymized patterns across all tenants          │
  │    → Industry clusters: boutiques vs cafes vs SaaS   │
  │    → Common failure modes across tenants             │
  │                                                      │
  │ 3. IMPROVEMENT PROPOSALS                             │
  │    → Per-tenant: adjust compression, recovery params │
  │    → Per-industry: tune agent identity overrides     │
  │    → Global: adjust budget multipliers, thresholds   │
  │                                                      │
  │ 4. SANDBOX TESTING (per proposal)                    │
  │    → Test in isolated sandbox per tenant             │
  │    → Simulate with synthetic tenant data             │
  │    → Verify no cross-tenant leakage                  │
  │                                                      │
  │ 5. DEPLOYMENT                                        │
  │    → Per-tenant changes: deploy to specific tenant   │
  │    → Global changes: deploy to all tenants           │
  │    → Rollback ready: *.backup per deployment         │
  │                                                      │
  │ 6. MASTER GRAPH UPDATE                               │
  │    → Log all changes with rationale                  │
  │    → Update learning patterns                        │
  │    → Generate weekly fleet health report             │
  └──────────────────────────────────────────────────────┘
```

---

## BUILD ORDER — PHASED ROLLOUT

### PHASE 1: YVON CORE HARDENING (2 weeks)
- Master graph vault with Obsidian integration
- Fleet governance dashboard (existing agents: meta, board, sentinel)
- Business profile registry (YAML/JSON → graph nodes)
- `platform/business_profile.py`

### PHASE 2: DEPARTMENT DEPLOYMENT ENGINE (2 weeks)
- `platform/tenant_provisioner.py`
- `platform/deployment_orchestrator.py`
- `platform/graph_vault.py`
- Multi-tenant isolation tests

### PHASE 3: AGENTX ONBOARDING (2 weeks)
- Business signup flow
- Department selection & subscription tiers
- `src/platform/onboarding.ts`
- `platform/billing_tiers.py`

### PHASE 4: CONNECTOR MARKETPLACE (2 weeks)
- `platform/connector_sdk.py`
- 6 pre-built connectors (Instagram, Shopify, Canva, Mailchimp, GA4, Stripe)
- Connector sandbox for testing
- `src/platform/connector-marketplace.ts`

### PHASE 5: CROSS-TENANT LEARNING (1 week)
- `platform/cross_tenant_learner.py`
- Anonymization pipeline
- Master graph pattern ingestion
- Extended self_improver for multi-tenant mode

### PHASE 6: PRODUCTION HARDENING (1 week)
- E2E tests across all layers
- Multi-tenant isolation verification
- Performance benchmarks
- Documentation

**Total: 10 weeks to production-ready AgentX platform**

---

## VALIDATION: GOOGLE AGENTS-CLI CROSS-REFERENCE

YVON's architecture aligns with Google's agent engineering patterns at every layer. The `google/agents-cli` (GitHub, Apache 2.0) validates the core design decisions. Below is a detailed mapping of what YVON already does, what Google does that confirms it, and what YVON should adopt.

### ARCHITECTURE MATCH — Layer by Layer

| YVON Layer | Google agents-cli Equivalent | Match |
|-----------|------------------------------|-------|
| **YVON Core (Master Control Plane)** | Agent Garden + publish/register | 🔄 Partial — YVON needs Agent Card and discovery |
| **Agent Layer (46 agents)** | ADK agents with tools, callbacks, state | ✅ Aligned — same agent structure |
| **Integration Layer (MCP)** | MCP for tools, A2A for agent coordination | ✅ Aligned — Google also uses MCP + A2A protocols |
| **RAG Pipeline with Harness** | agentic_rag template | ✅ Aligned — same RAG + verification pattern |
| **SKILL.md files (200+)** | 7 installable skills (Markdown docs) | ✅ Aligned — identical concept, same format |
| **Progressive Disclosure** | Skill activation via triggers | ✅ Aligned — same on-demand loading |
| **Field Monitor + Self-Improver** | Observe phase (Cloud Trace + BigQuery) | 🔄 Partial — YVON needs production observability tiers |

### SKILL SYSTEM — Identical Pattern

Google's 7 skills and YVON's 200+ SKILL.md files use the same architecture:

| Google Skill | YVON Equivalent | Status |
|-------------|----------------|--------|
| `google-agents-cli-workflow` | `AGENT-BUILD-PLAYBOOK.md` | ✅ Exists — lifecycle orchestration |
| `google-agents-cli-scaffold` | `platform/deployment_orchestrator.py` (planned) | 🔄 Phase 2 build |
| `google-agents-cli-adk-code` | `Teams/Shared OS/logical/*.py` (35 scripts) | ✅ Exists — agent code patterns |
| `google-agents-cli-eval` | `rag/verify/grounded.py` + `rag/e2e_validation.py` | 🔄 Partial — needs eval dataset + metrics |
| `google-agents-cli-deploy` | `platform/deployment_orchestrator.py` (planned) | 🔄 Phase 2 build |
| `google-agents-cli-publish` | **MISSING** — needs Agent Card + discovery | ❌ Plan to add |
| `google-agents-cli-observability` | `rag/monitor/watcher.py` | 🔄 Partial — needs Cloud Trace/BigQuery tier |

### 8-PHASE LIFECYCLE vs YVON 4-GATE CYCLE

| Google Phase | YVON Gate | Status |
|-------------|-----------|--------|
| **0 — Spec** | Constitution (board enforces) | ✅ Exists — board checks constitution compliance |
| **1 — Scaffold** | **MISSING** — no project scaffolding CLI | ❌ Plan to add (`agents-cli scaffold create` equivalent) |
| **2 — Build** | Agent skills + identity definitions | ✅ Exists — 46 agents fully defined |
| **3 — Orchestrate** | CAOS executor (TypeScript) | ✅ Exists — multi-agent orchestration |
| **4 — Evaluate** | Post-hoc verifier + E2E validation | 🔄 Partial — needs eval datasets + LLM-as-judge |
| **5 — Deploy** | **MISSING** — no deployment pipeline | ❌ Phase 2-3 build (AgentX tenant provisioning) |
| **6 — Publish** | **MISSING** — no agent discovery | ❌ Plan to add (Agent Garden equivalent) |
| **7 — Observe** | Field monitor + self-improver | 🔄 Partial — needs production tier monitoring |

### KEY PATTERNS TO ADOPT FROM GOOGLE

**1. Agent Scaffold Create (for AgentX tenant provisioning)**

Google's pattern:
```
agents-cli scaffold create my-agent --deployment-target cloud_run
```

YVON's equivalent (to build):
```
yvon tenant provision boutique-a --departments brand-studio,product --tier growth
```
This would create the full tenant directory structure, copy agent definitions, apply business-specific overrides, and provision the isolated graph database — all from one command.

**2. eval → fix → eval loop (for agent quality)**

Google runs 5-10+ iterations of eval → fix before production. YVON's verifier checks grounded citations but doesn't have evaluation datasets. Need to add:
```
yvon eval run --agent spark --eval-set headline_review_benchmark
yvon eval grade --agent spark --dataset-id 2026Q3
yvon eval optimize --agent spark  # auto-tune parameters
```

**3. Agent Card + Discovery (for AgentX marketplace)**

Google's `publish gemini-enterprise` registers agents so other agents can discover them. YVON needs:
```
yvon publish --agent spark --card social-media-creative-director
```
This creates an Agent Card (what the agent does, what tools it needs, what it costs per month) and publishes it to the AgentX marketplace so small businesses can discover agents they want.

**4. Observability Tiers**

Google has three tiers: Cloud Trace (always on) → Prompt-Response Logging (on deploy) → BigQuery Analytics (opt-in). YVON's field_monitor should mirror:

| YVON Tier | Google Equivalent | Default |
|-----------|------------------|---------|
| **Trace** | Cloud Trace spans | Always on |
| **Logging** | Prompt-response + BigQuery | On for owned brands, opt-in for tenants |
| **Analytics** | BigQuery Agent Analytics | Opt-in (adds cost) |

**5. Manifest File (for deployment preservation)**

Google's `agents-cli-manifest.yaml` preserves creation parameters:
```yaml
agent_id: boutique-a
departments: [brand-studio]
template: social_media
tier: growth
created_at: 2026-07-16
deployment_target: agentx
```

YVON needs `tenant-manifest.yaml` per tenant so upgrades preserve configuration — identical to the code-preservation rules YVON already has in the Security Charter.

**6. Prototype-First Pattern**

Google: `scaffold create --prototype` → minimal agent, then `scaffold enhance --deployment-target` to add deployment later.

YVON equivalent: provision a tenant with `--demo` mode (synthetic data, no production connections), let the business test for 7 days, then `yvon tenant upgrade --to production` to add real integrations.

### WHAT THIS MEANS FOR YVON

The Google architecture validates that YVON is building in the right direction. The skill system, agent definitions, multi-agent orchestration, MCP integration, and RAG pipeline all match Google's production patterns.

**Three critical additions for YVON to match Google's maturity:**

1. **CLI Lifecycle Tool** (`yvon` CLI with `scaffold → eval → deploy → observe` commands)
2. **Tenant Scaffold Create** (one-command provisioning of isolated agent departments for AgentX businesses)
3. **Agent Card + Discovery** (publish agents to marketplace, businesses discover and subscribe)

All three map directly to Phase 1-3 of the build plan above. The existing codebase (346 tests — see
§7, 5-gate harness, 46 agents, 9 MCP marketplace tools — see §10) provides the engine. These
additions provide the steering wheel and dashboard.


---

# ═══════════ PART 6 — TASK-SPEC TEMPLATE ═══════════
*(source: store/tasks/TEMPLATE.yaml — verbatim)*

```yaml
# TASK-SPEC template v2 — generated by meta/task-dispatch. Do not fill by hand
# without meta's protocol: discovery once → DAG → sign-off → activate.
id: TS-000
status: draft            # draft → discovery → approved → executing → gated → done
source_message: ""       # verbatim, never paraphrased
requester: operator
rules:
  sharding: worker receives ONLY its work item + consumed contracts
  handoff: contracts-only — no transcript inheritance
  inject_form: .toon (this YAML is the source form)

classification:
  task_type: ""
  departments: []
  lead: ""

context:                 # hook-injected, gate-verified (citations only)
  chunks: []
  existing_assets: []
  conflicts: []

discovery:               # BLOCKING — no fan-out until resolved
  questions: []
  decisions: []

work_items:
  - id: WI-1
    owner: ""
    objective: ""        # one testable sentence
    strategy: BALANCE 1.0x   # per-item budget (FAST | BALANCE ×)
    consumes: []
    produces: ""
    owns_paths: []
    skills: []
    scripts: []
    blocked_by: []
    acceptance: []
    security_review: none

dag:
  parallel: []
  critical_path: []

exit_gate:
  owner: ""
  proof: ""

feedback:                # filled post-execution — anneal consumes
  outcome: null          # accepted | revised | rejected
  lesson: null
```

---

# ═══════════ PART 7 — UNIFIED WORKFLOW BLUEPRINT: ALL SECTIONS WORKING TOGETHER ═══════════
*(new — this is the combined workflow the other parts only describe in isolation)*

**Use case covered here: №1 — developing and maintaining our own software** (owned brands + AgentX platform itself + upcoming products). Use case №2 (SaaS tenants) reuses this same tree scoped to a tenant graph — see Part 5.
**All product development is Next.js. This is a technical workflow — we build and maintain software.**
Tags: `[built]` running today · `[partial]` exists, being extended · `[gap→design]` decided here, to be built.

---

## 7.0 THE MASTER TREE — one message, every system, every decision

```
OPERATOR MESSAGE  ("test the code" / "build a dashboard" / "fix the API")
    │
    ▼
╔════════════════════════════════════════════════════════════════════════╗
║ STEP 0 — INGRESS + PROMPT SYNTHESIS (the "prompt enhancer")            ║
║ WHO: meta (task-dispatch). WHERE: BEFORE CIE — this is the answer to   ║
║ "where is the enhancer": it is NOT inside CIE. CIE consumes its output.║
╚════════════════════════════════════════════════════════════════════════╝
    │
    ├─ DECISION: direct factual question?
    │      YES → answer, no machinery. END.
    │      NO ↓
    ├─ DECISION: single-agent, single-skill task?
    │      YES → route via routing table, skip dispatch, go to STEP 1
    │      NO ↓ (multi-agent / build / structural)
    │
    ├─ [GATE 0 — CHANGE-MANAGEMENT RFC]  [gap→design]
    │   Triggers when the task CREATES / REMOVES / EDITS structure of:
    │   frontend · backend · API · security · algorithms
    │      │
    │      ├─ dev     (Engineering): architecture impact, owns_paths map
    │      ├─ spec    (Product/PRD): PRD delta, acceptance criteria
    │      ├─ meta    (AI & Agents): which agents/skills affected
    │      └─ warden  (Cybersecurity): security review triggers
    │   ALL FOUR sign the classification block before work items exist.
    │   Any veto → back to operator with the objection. NO silent builds.
    │
    ├─ task-dispatch synthesizes TASK-SPEC (store/tasks/TS-<seq>.yaml)  [built]
    │   source_message VERBATIM → classification → context (gate-verified,
    │   citations only) → DISCOVERY (3–5 questions, BLOCKING — the enhancement
    │   happens here: vague "test the code" becomes "run unit suite for
    │   modules X,Y touched since <commit>, then quinn browser gate on flows
    │   A,B; acceptance: 0 failures, coverage ≥ floor")
    │      │
    │      └─ DECISION: discovery answered?
    │             NO  → BLOCKED. Workers never start. Operator pinged.
    │             YES → work_items + dag + exit_gate written, sign-off, ACTIVATE
    │
    ▼
╔════════════════════════════════════════════════════════════════════════╗
║ STEP 1 — CIE (dist/cie/*.js — the COMPILED code is what runs)          ║
║ dist/ answer: nothing at runtime reads Teams/*.md or src/*.ts directly.║
║ Runtime = dist/cie + dist/pipelines + dist/skills + *.toon. Teams/ and ║
║ src/ are edit-time; skillgen/toonify/tsc are the compile bridges.      ║
╚════════════════════════════════════════════════════════════════════════╝
    │
    ├─ classifier.ts → task_type + agent_id (per work item)          [built]
    ├─ progressive disclosure → 2–3 active skills FULL, rest as        [built]
    │   ~8-token summaries (loaded from dist/skills, injected as .toon)
    │
    ├─ ★ CAG LAYER — cache-augmented generation  [gap→design]
    │   WHERE: cie/cache.ts (LRU — exists, extend it)
    │   Stable context is PRE-CACHED, not re-retrieved per query:
    │      • agent identity + principles     (changes ~never)
    │      • design tokens / brand kit       (changes on atlas release)
    │      • dept workflow + security charter (changes on RFC only)
    │   Volatile context (chunks, formulas, memory) stays retrieval-path.
    │   Cache key: (agent_id, source_hash). Invalidation: skillgen/toonify
    │   version bump busts the entry. Effect: repeated dev-loop queries skip
    │   ~40% of retrieval cost and CANNOT lose stable facts to compression —
    │   part of the answer to "RAG skips important information."
    │
    ├─ ★ GRAPH RESOLVE — where graphs plug in (the placement answer)
    │   WHERE: between classification and RAG retrieval, inside CIE's
    │   source fan-out (graph-resolver.ts + sources/*):
    │      • codegraph.ts / graphify.ts  [built] — code structure graph from
    │        `npx yvon graph` (graphify-out/CODEGRAPH_REPORT.md). For coding
    │        tasks: resolves query entities → files/modules/dependencies →
    │        seeds retrieval with the RIGHT file chunks + marks them
    │        GRAPH-PINNED (see 7.2 RAG loss prevention).
    │      • hermes-memory.ts [built + fixed 2026-08-10] — reads agent USER.md/
    │        MEMORY.md, mtime-cached. 2026-08-09 found two real bugs, both fixed:
    │        (1) it split on a '§' delimiter nothing ever wrote — the real file
    │        uses `## Section` headers + `- bullet` lines (rag/core/hermes_memory.py's
    │        format), so retrieval was silently degrading to whole-file keyword
    │        search. Rewrote parsing to match exactly, threaded agentId through
    │        from retriever.ts. (2) "(CRDT)" was asserted with zero merge logic
    │        anywhere. Added a real one: `mergeMemorySections()` is a G-Set CRDT
    │        (bullets are append-only, never edited — union+dedup per section is
    │        conflict-free by construction). Verified commutative/associative/
    │        idempotent against the live store/hermes/MEMORY.md, 19/19 checks.
    │        `reconcileWithHermes()` exposes it for two-copy sync.
    │      • obsidian master vault [planned] — Tier-1 knowledge graph;
    │        resolver treats it as a source once platform/graph_vault.py lands.
    │   Refresh rule [gap→design]: `yvon graph` re-runs on every merge to
    │   main (post-exit-gate hook) so the graph never lags the code.
    │
    ▼
╔════════════════════════════════════════════════════════════════════════╗
║ STEP 2 — RAG RETRIEVAL + HARNESS (python, via rag-bridge subprocess)   ║
╚════════════════════════════════════════════════════════════════════════╝
    │
    ├─ retriever.py: query rewrite (≤5 queries) → hybrid dense+sparse →
    │   rerank → 20 candidates                                       [built]
    │   FALLBACK: sqlite-vec absent → direct chunks.json scan
    ├─ formula detection → Shared OS logical/*.py → computed facts   [built]
    │   FALLBACK: import error → skip computation, flag "no computed facts"
    ├─ optimizer.py: agent profile + diversity + 1 adversarial chunk [built]
    │
    ├─ HARNESS — 5 gates                                             [built]
    │   G1 authenticate → G2 reliability (freshness×authority×quality) →
    │   G3 conflicts (⚠️ flags) → G4 priority assembly P0→P7 →
    │   G5 quarantine + recovery
    │
    ├─ ★ RAG LOSS PREVENTION — "what if compression drops something vital"
    │   Existing spine [built]: G5 recovery scan (novel facts, exceptions,
    │   negations pulled back) + BALANCE recovery pass + exception signals
    │   always recovered + GDPR-class tasks get 4.0× budget.
    │   Hardening [gap→design]:
    │      1. GRAPH-PINNED chunks: any chunk the graph resolver marked as
    │         structurally load-bearing (direct dependency of the file under
    │         work) is EXEMPT from destructive compression — it can be
    │         truncated, never dropped.
    │      2. FACT-DIFF gate: extract_facts(input) vs extract_facts(injection);
    │         any lost fact that matches the query terms → forced pullback or
    │         loud ⚠️ DROPPED-FACT flag in the injection header.
    │      3. CAG exemption: stable cached context never enters the
    │         compression path at all (it's not a chunk anymore).
    │
    ▼
╔════════════════════════════════════════════════════════════════════════╗
║ STEP 3 — STRATEGY + INJECTION (unified production pipeline)  [built]   ║
╚════════════════════════════════════════════════════════════════════════╝
    │
    ├─ DECISION: task_type?
    │     creative/copy/factual → FAST   (destructor, 64–89% savings)
    │     contradictions found  → QUALITY (relational+progressive)
    │     everything else       → BALANCE (0.4–4.0× adaptive budget)
    ├─ injector: sentence pruning, citation-only for formulas, per-agent
    │   profiles → [YVON · agent · task · Nt] + ⚠️ + ♻️ enhanced injection
    │
    ▼
╔════════════════════════════════════════════════════════════════════════╗
║ STEP 4 — GENERATION + VERIFICATION                            [built]  ║
╚════════════════════════════════════════════════════════════════════════╝
    │
    ├─ LLM trio: hermes+claude (reasoning) / deepseek (adversarial) /
    │   chatgpt (creative QC)
    ├─ verifier: grounded citations + self-consistency
    │     DECISION: high-stakes AND low score?
    │        YES → delegate to quinn / precedent / sentinel (agent review)
    │        NO  → automated verification only
    │
    ▼
╔════════════════════════════════════════════════════════════════════════╗
║ STEP 5 — EXIT GATE + FEEDBACK                                          ║
╚════════════════════════════════════════════════════════════════════════╝
    │
    ├─ exit_gate.proof produced (browser render / test log / diff)   [built]
    ├─ DECISION: operator satisfied?
    │     YES → feedback.outcome=accepted → quality scores up → anneal lesson
    │     NO  → THE DISSATISFACTION LOOP (7.3)
    └─ post-merge hooks [gap→design]: yvon graph refresh · toonify delta ·
       skillgen re-derive · telemetry flush
```

---

## 7.1 SCENARIO A — CODING TASK ("test the code", "fix the API", "add endpoint")

```
"test the code"
    │
    ├─ STEP 0: dispatch enhances → which code? which suites? acceptance?
    │   (discovery pulls git diff scope + regression-map fragile areas)
    ├─ GATE 0: touches API/backend structure? → 4-team RFC sign-off, else skip
    │
    ├─ OWNERS (routing): dev leads · raj (backend/API) · mia (frontend,
    │   Next.js ALWAYS) · nova (mobile) · dana (data) — per work item
    │
    ├─ WRITE PHASE — per work item, in an ISOLATED SANDBOX
    │   │   sandbox = git worktree/branch per work item; owns_paths enforced;
    │   │   synthetic data only (Security Charter Rail 3 — no real data)
    │   ├─ Ponytail MCP (dev, axiom) [partial — mapped, wire per-task]:
    │   │   minimal-code generation — compact, non-repeating, constants
    │   │   extracted, ~54% less code. DRY is enforced at GENERATION time,
    │   │   then re-checked at review time by dev (duplication = review block).
    │   ├─ graph seed: codegraph tells the agent what the change touches —
    │   │   callers, dependents, shared constants (no drive-by duplication)
    │   └─ dev-loop verification with Agentation feedback (see 7.5)
    │
    ├─ TEST PHASE — pyramid, per quinn's test-strategy skill
    │   ├─ unit: module suites (rag/test_runner.py / vitest per project)
    │   ├─ integration: contract tests on consumes/produces boundaries
    │   ├─ E2E: ★ PLAYWRIGHT GATE AFTER EVERY FEATURE [built as skill]
    │   │   quinn's webapp-testing (Anthropic Playwright skill, imported
    │   │   verbatim) + Playwright MCP (mia/nova/quinn): critical flows,
    │   │   real browser, real network. Reticle gates edits; Playwright
    │   │   gates releases. Mock data in DOM = integrity block.
    │   └─ DECISION: any failure?
    │         YES → back to WRITE PHASE same work item (loop, max N=3,
    │               then escalate to dev + regression-map update)
    │         NO ↓
    ├─ SECURITY PHASE: aegis vuln pipeline + axiom review (auto-added when
    │   security_review trigger fired at GATE 0)
    ├─ REVIEW PHASE: dev — architecture, mock-data check, hardcoded-value
    │   check, duplication check (Ponytail promise verified by a human gate)
    ├─ MERGE + EXIT GATE: quinn proof attached → operator sign-off
    └─ POST-MERGE: yvon graph refresh · telemetry · feedback block
```

## 7.2 SCENARIO B — PRODUCT FEATURE / DASHBOARD (the big-company rail)

*This is the flow that was violated when "build a dashboard" produced a generic
page with zero PRD involvement and no UI skills. The rail below is mandatory.*

```
"build a dashboard / page / feature"          (product = Next.js, always)
    │
    ├─ PRD PHASE — Product team (NOT optional, output artifacts required)
    │   ├─ spec:  PRD + acceptance-criteria-handoff skill → PRD.md artifact
    │   ├─ ux:    user research / heuristics → flows + edge states artifact
    │   ├─ loom:  prototype/validation if novel interaction
    │   └─ metric: what gets measured post-ship (events, KPIs)
    │   EXIT: PRD approved by operator. No PRD → no design phase.
    │
    ├─ DESIGN PHASE — Brand Studio
    │   ├─ spark: creative direction (2–3 directions, named references)
    │   ├─ atlas: design tokens — THE source of styling truth (brand kit →
    │   │   semantic tokens; hardcoded brand values are drift findings)
    │   └─ pixel: visual design of the chosen direction (real mock, not
    │       "generic UI" — Figma MCP when connected)
    │   EXIT: operator picks direction; tokens versioned.
    │
    ├─ BUILD PHASE — Engineering
    │   ├─ dev: architecture note (data flow, API contract with raj, owns_paths)
    │   ├─ raj: API endpoints (consumed contract)
    │   └─ mia: Next.js build USING SKILLS EXPLICITLY:
    │       design-tokens → ui-accessibility-standards (WCAG AA, semantic,
    │       keyboard) → frontend-verification → frontend-performance (CWV)
    │
    ├─ VERIFY PHASE
    │   ├─ Agentation loop: operator annotates the RUNNING UI in browser →
    │   │   structured selectors+notes come back → mia fixes precisely (7.5)
    │   ├─ quinn: Playwright critical flows + Reticle edit gates
    │   └─ rank: CWV/SEO signal if public-facing
    │
    └─ SHIP: dev review → exit gate proof → operator → metric dashboards live
```

## 7.3 SCENARIO C — THE DISSATISFACTION LOOP (output ≠ what the prompt needed)

```
Operator: "not what I asked" / rejects at exit gate
    │
    ├─ feedback.outcome = rejected|revised  → feedback.py: quality_new =
    │   0.95·old + 0.05·outcome → the chunks/skills that fed the bad output
    │   LOSE reliability (Gate 2 ranks them lower NEXT time)          [built]
    │
    ├─ DECISION: what failed? (meta triages, logged in TASK-SPEC lesson)
    │   ├─ WRONG UNDERSTANDING → discovery was insufficient →
    │   │   re-open discovery with delta questions; re-dispatch SAME spec,
    │   │   revision N+1; original + revision linked (audit trail)
    │   ├─ RIGHT understanding, WEAK output → strategy escalation:
    │   │   FAST→BALANCE→QUALITY (more budget, more recovery), re-run;
    │   │   verifier delegation forced ON for the re-run
    │   ├─ WRONG agent/skill routed → meta corrects routing; gauge logs a
    │   │   routing miss (feeds weekly re-tuning)
    │   └─ SKILL ITSELF is bad → Scenario D
    │
    ├─ LOOP LIMIT: 2 automated revisions, then human-in-the-loop review with
    │   the lead agent — no infinite regeneration burning tokens
    └─ EVERY rejection becomes: telemetry event + feedback.jsonl entry +
       anneal lesson → the same mistake gets structurally harder to repeat
```

## 7.4 SCENARIO D — SKILL / SCRIPT FAILURE + THE AI & AGENTS TEAM LOOP

```
A skill misfires or a script throws
    │
    ├─ IMMEDIATE (runtime): fallback matrix [built] — every module degrades
    │   loudly, never silently: harness absent→pass-through flagged; script
    │   error→"no computed facts" flag; bridge dead→direct LLM, labeled.
    │   The response SAYS what degraded (degrading loudly beats improvising).
    │
    ├─ RECORDED: telemetry (skill-invocations.jsonl) + improvement_log
    │
    ├─ WEEKLY LOOP — the AI & Agents team on OUR OWN agents:
    │   meta    → fleet governance: routing decisions, dispatch quality
    │   gauge   → benchmarks agents+skills from telemetry (failure rates,
    │             routing misses, per-skill win rates)
    │   anneal  → consumes TASK-SPEC feedback blocks + gauge data →
    │             improvement proposals (skill edits, routing fixes)
    │   forge   → rewrites/builds the skill per skill-authoring-standards
    │   scout   → if failure is a tooling gap: evaluates new tools → relay
    │   relay   → integration/MCP failures: registry health, egress, retry
    │   proto/edge → experiments on risky changes before fleet-wide
    │   │
    │   └─ HERMES CONNECTION: every confirmed lesson is written into the
    │       agent's MEMORY.md via hermes-sync (pushToHermes, now writes into
    │       the right `## agentId` section, not a flat blob) → hermes-memory.ts
    │       injects it into that agent's NEXT retrieval → the agent remembers
    │       its own failure modes. Performance analysis lives in
    │       graphs/telemetry; behavioral memory lives in hermes.   [built +
    │       fixed 2026-08-10 — "(CRDT)" is now real: mergeMemorySections() is a
    │       G-Set CRDT, reconcileWithHermes() exposes it for two-copy sync, see
    │       7.0's STEP 1 note for the full before/after]
    │
    ├─ DEPLOY: self_improver 6-phase (analyze→propose→sandbox→decide→
    │   deploy→log). ONE failed sandbox test holds ALL proposals.   [built]
    └─ RECOMPILE: forge's skill edit → skillgen (dist/skills) + toonify
       (.toon) → next dispatch uses the fixed skill                 [built]
```

## 7.5 SCENARIO E — MULTIPLE AGENTS IN PARALLEL

```
TASK-SPEC dag.parallel = [[WI-2, WI-3], [WI-4, WI-5]]
    │
    ├─ INVARIANTS that make parallel safe [built by protocol]:
    │   • owns_paths DISJOINT — two parallel items never share a write path
    │   • sharding — each worker gets ONLY its item + consumed contracts
    │   • handoffs contracts-only — artifact+path, never transcripts
    │   • per-item strategy budgets — one agent's token burn can't starve another
    │
    ├─ EACH parallel worker runs the FULL master tree (STEP 1→5)
    │   independently: own CIE classification, own retrieval, own harness
    │   run, own sandbox, own Playwright gate on its slice
    │
    ├─ SYNC POINTS: blocked_by edges — a work item activates only when its
    │   consumed contracts EXIST at the produced path (file-existence gate)
    │   DECISION: upstream contract late? → downstream stays blocked, lead
    │   re-plans critical path (visible slippage, no silent waiting)
    │
    ├─ CONFLICT ARBITRATION: two items need the same path → dispatcher must
    │   serialize them (DAG edge) or split the path — the spec is INVALID
    │   otherwise, meta rejects it at sign-off
    │
    └─ MERGE: lead (dev for eng work) integrates at a sync work item;
       quinn gates the INTEGRATED result, not just the pieces; exit gate
       is singular — one proof for the whole spec
```

## 7.6 TOOLING DECISIONS LOCKED IN THIS PART

| Tool | Role in the loop | Status |
|---|---|---|
| **impeccable** (`Teams/Shared OS/skills/impeccable` plugin + `impeccable` CLI) | Design-quality layer for the Design + Verify phases: `/impeccable shape` before build, `/audit`+`critique`+`polish` after; 46 deterministic anti-pattern detectors run in CI with no API key and BLOCK generic-UI tells. Owned by atlas (DESIGN.md) + spark + pixel + mia. | `[built]` — CLI dep confirmed real (root `package.json`: `"impeccable": "^3.2.1"`, not `dashboard/` as originally written); skill present at `Teams/Shared OS/skills/impeccable`; `dashboard/DESIGN.md`+`PRODUCT.md` confirmed present. |
| **Playwright** (quinn webapp-testing + Playwright MCP) | E2E gate after EVERY feature; releases blocked without it | `[built]` — confirmed: `@playwright/test ^1.61.1` in `dashboard/package.json`, `playwright.config.ts` + `tests/e2e/` with real spec files present, quinn's `webapp-testing` skill present at `Teams/Engineering/quinn/marketplace/webapp-testing`. |
| **Agentation** (`agentation` npm, dev-dep) | UI feedback FROM the running app: operator clicks elements, annotates, structured selectors come back to mia — replaces "describe the button in chat" | `[built]` — installed in `dashboard/` (v3.0.2), dev-only toolbar in `components/AgentationToolbar.tsx`, wired in `app/layout.tsx` |
| **Ponytail MCP** (dev, axiom) | Minimal-code generation at write time: compact, DRY, constants extracted | `[partial]` — mapped in marketplace; wiring per coding work item |
| **CAG** (extend `cie/cache.ts`) | Stable context cached, exempt from retrieval AND compression | `[gap→design]` |
| **Graph refresh hook** (`yvon graph` post-merge) | Code graph never lags code | `[gap→design]` |
| **GATE 0 RFC** (dev+spec+meta+warden) | Structural changes to frontend/backend/API/security/algorithms need 4-team sign-off BEFORE work | `[gap→design]` |
| **OpenSandbox** (SDK + `osb` CLI + MCP) | Isolation runtime: the quarantine box every web-skill / feature / unproven dep runs in BEFORE it touches the repo (§7.7) | `[partial, SDK/CLI fixed 2026-08-10]` — Tier-1 (`cli/quarantine.sh`, no Docker) is real, confirmed by actual logs in `store/quarantine/`. Tier-2: SDK+CLI now actually installed (`pip install opensandbox==0.1.14 opensandbox-cli==0.1.1`, pinned in `requirements.txt`) and all 4 interface checks re-verified live — see §7.7 Status. Only live container provisioning is still blocked, on Docker/K8s availability, not on the install. |

## 7.7 SANDBOX-FIRST PROMOTION FLOW — the quarantine layer (OpenSandbox)

**The rule:** nothing from the untrusted outside world — a skill pulled from a GitHub URL, a new feature's code, an unproven dependency — touches `Teams/`, the repo, `dist/`, or `node_modules` until it has first run and passed *inside a disposable OpenSandbox container*. **The sandbox is where things are proven; the repo is where proven things live.** The promotion gate is the one-way door between them; the box is destroyed either way.

This is the concrete engine for what the rest of this doc only names abstractly: Scenario A's "ISOLATED SANDBOX, synthetic data only," Scenario D's self-improver "sandbox test," Scenario E's per-worker isolation, and Part 5's per-tenant isolation.

```
SOMETHING NEW ARRIVES  (web skill · new feature · external tool/dep)
    │
    ▼
╔════════════════════════════════════════════════════════════════════╗
║ PROVISION — TWO TIERS (pick the strongest available)  [owner: ops]  ║
║                                                                    ║
║ TIER-1 · PROCESS BOX (no Docker) — `cli/quarantine.sh <name> <git|npm> <src>` ║
║   throwaway dir OUTSIDE the repo · warden safety-scan (install      ║
║   hooks, pipe-to-shell, eval/exec, base64 exfil, cred reads) ·      ║
║   claim check · PASS/FAIL · never auto-promotes · log →             ║
║   store/quarantine/<name>.log.  Runs EVERYWHERE. [built]            ║
║                                                                    ║
║ TIER-2 · CONTAINER — `Sandbox.create(image, timeout)` (OpenSandbox) ║
║   kernel-isolated (gVisor/Kata/Firecracker) · egress LOCKED         ║
║   (warden/bastion). Stronger, but needs Docker/K8s. [needs-docker]  ║
║                                                                    ║
║ Both: synthetic data only · Security Charter Rail 3.               ║
║ Rule: no Docker ⇒ use TIER-1 — never skip quarantine entirely.     ║
╚════════════════════════════════════════════════════════════════════╝
    │
    ├─[A] SKILL/TOOL FROM WEB ─────────────────────────────────────────┐
    │   scout clones the repo INTO the box (never the repo);           │
    │   install it there; run its own tests + your smoke checks;       │
    │   aegis/warden watch behaviour (egress? file access? phone-home?)│
    │                                                                  │
    ├─[B] NEW FEATURE ─────────────────────────────────────────────────┤
    │   mia/raj/nova write code IN the box; unit → integration →       │
    │   Playwright gate run inside; broken build dies with the box     │
    │                                                                  │
    └─[C] UNPROVEN DEP / SCRIPT / MIGRATION ───────────────────────────┤
        install/run the candidate in the box, never in dashboard/      │
        first; dana's migrations dry-run here before operator applies  │
                                                                       │
    ▼ (all three converge)                                             │
╔════════════════════════════════════════════════════════════════════╗
║ PROMOTION GATE  — the one-way door                                  ║
║   quinn proof (real render / green tests)                           ║
║ + security clearance (aegis/warden: no malware, egress within policy)║
║ + operator sign-off                                                 ║
╚════════════════════════════════════════════════════════════════════╝
    │ PASS                                   │ FAIL
    ▼                                        ▼
 PROMOTE into the repo:                  Sandbox.kill()
   Teams/ · shared-tool-registry ·       nothing reached the repo;
   dist/ · node_modules · agent wiring   zero cleanup, zero blast radius
    │
    ▼
 Sandbox.kill()   (box destroyed on success too — it was a clean room)
```

### Two interfaces (both registered in §13.6 / relay)
- **MCP server** (`opensandbox-mcp`) — how *agents* drive sandboxes: create/run/file tools an agent calls the same way it calls any MCP. Path for interactive per-work-item boxes (Scenarios A/B). Registered by **relay**.
- **Python SDK** (`opensandbox`) — how *platform code* drives sandboxes: `tenant_provisioner.py` / `deploy.py` call `Sandbox.create()` to stand up one isolated box per tenant (Part 5). No agent involved.
- Rule of thumb: **agent needs a box → MCP; platform provisions a box → SDK.**

### Isolation guarantees (why the box is trustworthy)
- **Compute:** container runs under gVisor / Kata / Firecracker microVM — a rogue process cannot reach the host kernel.
- **Network:** per-sandbox egress control — you declare exactly what each box may reach (a coding box → npm only; a tenant box → that tenant's connectors only). Maps onto relay's existing egress-allowlist.
- **Parallel safety (Scenario E):** each parallel worker gets its OWN box, physically enforcing "disjoint owns_paths" instead of merely trusting it.
- **Tenant safety (Part 5):** one box per tenant, egress locked to that tenant — Boutique A's agents literally cannot reach Café B's data.

### Why this exists (the lesson)
Every install in this project's history — impeccable, agentation, browser-use — went *straight into the repo* from a GitHub URL before anything vetted it; and a broken `middleware.ts` reached the running app. The sandbox-first flow is the discipline that catches exactly those: untrusted code proves itself in a box that gets destroyed, and only the vetted diff crosses the promotion gate.

### Status
`[fixed 2026-08-10]` — the 2026-08-09 pass flagged this as disputed (the SDK wasn't actually
installed anywhere despite being claimed "installed & unit-tested"). Re-resolved by actually
installing it: `pip install opensandbox==0.1.14 opensandbox-cli==0.1.1` (both real PyPI packages,
confirmed available), now pinned in root `requirements.txt`. All four checks below were re-run
today and are real, reproducible results in this environment, not carried-over claims.
`Teams/Shared OS/tools/shared-tool-registry.md` updated to `◐` (SDK/CLI real, live containers
still `○`, no Docker). Tier-1 (`cli/quarantine.sh`) remains real and unaffected, with logs in
`store/quarantine/`. Owners: **ops** (runtime), **warden/bastion** (isolation + egress policy —
senior per the Charter), **relay** (MCP registration), **scout** (drives case A tool-vetting).

Strict-test results (re-run 2026-08-10, this build sandbox):

| Test | Result |
|---|---|
| SDK import (`Sandbox`, `SandboxManager`, `SandboxPool`) | ✅ PASS — real |
| `osb config init` → `~/.opensandbox/config.toml` | ✅ PASS — real |
| CLI subcommands (`sandbox`, `command`, `file`, `egress`, `skills`, `diagnostics`, `config`, `devops`, `diagnostics`) present | ✅ PASS — real, 8 subcommands confirmed via `osb --help` |
| `await Sandbox.create('python:3.12')` live container | ❌ EXPECTED FAIL — `SandboxInternalException: Network connectivity error: All connection attempts failed` (no OpenSandbox server; server needs **Docker**, absent here) |

`[needs-docker]` — live container provisioning requires a Docker/K8s runtime, unavailable in this
build sandbox, available on the operator's machine via `uvx opensandbox-server`. The SDK/CLI
install and all four interfaces are now genuinely verified; only the runtime backend is
machine-gated — the same class of limit as Playwright's `install-deps` and browser-use's
Python-3.11 gap.



# ═══════════ PART 8 — ENFORCEMENT: MAKING PARTS 6 & 7 MECHANICAL ═══════════
*(added 2026-07-30 · owner: meta + quinn · status: `[planned]` until 8.9 rollout completes)*

> **The problem this part solves.** PART 6 defines a task state machine. PART 7 defines
> five execution scenarios. Both are good, and both are **advisory** — nothing reads them,
> so compliance depends on whoever is at the keyboard remembering. That fails predictably.

---

## 8.0 The evidence

This part is not theoretical. The record:

| Observation | Where |
|---|---|
| TS-001 … TS-013 exist, filled in, with real `exit_gate.proof` | `store/tasks/` |
| **TS-014, TS-015, TS-016 shipped with no task record at all** | `docs/SESSION-HANDOUT.md` §2 lists them as shipped; `store/tasks/` has no file |
| 8 of TS-001…013 stuck at `status: approved` — never advanced to `done` | confirmed 2026-08-09, `grep -l '^status: approved' store/tasks/TS-*.yaml` |
| A full dashboard redesign (2026-07-30) ran start→finish with zero records, zero agent routing, zero browser verification | this session |

**Update, checked 2026-08-09 — the "abandoned" framing below is now half-wrong:** `cli/task.sh` +
`cli/task.py` (§8.5's full 8-command record manager) actually exist, dated 2026-08-01, and 11 more
records were created after TS-013 (TS-018…TS-023, TS-025…TS-029 — TS-014/015/016/017/024 are
genuinely absent), all sitting at `status: gated`, none at `done`. So the protocol wasn't silently
abandoned after TS-013 — it resumed once `task.sh` landed and got *further* (to `gated`, one step
short of `done`) but still isn't wired to anything blocking: `verify-deploy.sh` doesn't call
`task.sh validate` yet, and `store/tasks/ACTIVE` doesn't exist, confirming §8.8 rollout step 1 is
done, steps 3-6 are not. The original "thirteen tasks then silence" story below is stale; treat
the mechanism (§8.2-8.6) as still accurate and the origin story as superseded.

The protocol was followed for thirteen tasks and then silently abandoned. **Nothing detected
the abandonment**, because nothing in the repo reads `store/tasks/`.

Contrast with `cli/verify-deploy.sh`: 8 mechanical checks, wired to `.git/hooks/pre-push`.
Every deploy-failure class it encodes has stayed fixed. That is the whole thesis of this part —

> **A rule with a checker is a rail. A rule in prose is a suggestion.**

---

## 8.1 Two execution surfaces

PARTS 1–5 describe a runtime that is **not yet deployed** (Hermes → CIE → RAG → harness gates
→ post-hoc verification). PARTS 6–7 describe how work is *produced*. These are different
machines and need different enforcement:

| | **Surface A — Runtime** | **Surface B — Build** |
|---|---|---|
| What | Operator query → agent response | Operator request → committed artifact |
| Governed by | PARTS 1–5 | PARTS 6–7 |
| Enforced by | Harness 5 gates, Phase 9 verification | **nothing today** ← PART 8 fixes this |
| Live? | No — blocked on VPS/DNS/env | Yes — 100% of work happens here |

Every agent definition, every skill, every line of dashboard code was produced on Surface B.
All documented verification targets Surface A. PART 8 gives Surface B its own gates.

---

## 8.2 The state machine (from PART 6, with transition conditions)

`store/tasks/TEMPLATE.yaml` already defines the states. PART 8 adds **what must be true to
leave each one** — the part that was missing.

```
draft ──▶ discovery ──▶ approved ──▶ executing ──▶ gated ──▶ done
  │           │             │            │           │
  │           │             │            │           └─ exit_gate.proof non-empty
  │           │             │            │              AND verifiable by its owner
  │           │             │            └─ every work_item has acceptance[] met
  │           │             └─ operator sign-off recorded (approved_by + approved_at)
  │           └─ discovery.questions[] answered → discovery.decisions[] non-empty
  └─ source_message captured verbatim + classification.lead assigned
```

**Transition table — each row is a mechanical check:**

| From → To | Required in the record | Validator |
|---|---|---|
| `draft → discovery` | `source_message` non-empty · `classification.lead` set | `cli/task.sh` schema check |
| `discovery → approved` | `discovery.decisions[]` non-empty · every `questions[]` has an answer | `cli/task.sh validate` |
| `approved → executing` | `approved_by` + `approved_at` present · ≥1 `work_items[]` with `owner` + `acceptance[]` | `cli/task.sh validate` |
| `executing → gated` | every `work_items[].acceptance[]` marked met · `produces` paths exist on disk | `cli/task.sh validate` |
| `gated → done` | `exit_gate.owner` set · `exit_gate.proof` non-empty and **not** a self-assertion | `cli/task.sh validate` + gate map §8.3 |

**Anti-pattern the last check exists to block:** `proof: "I verified it works"`. Proof must
name an artifact, command output, or file path — the existing records already do this well
(`"apple_full_page.png (real Chromium render)"`, `"regression test PASS + hook PASS"`).

---

## 8.3 Gate map — what exists, what it blocks, who owns it

| Gate | Command | Blocks | Owner | Status |
|---|---|---|---|---|
| Deploy gate (8 checks) | `cli/verify-deploy.sh` | `git push` via `.git/hooks/pre-push` | quinn | `[built]` |
| Vercel post-push classify | `cli/vercel-watch.sh` + `vercel-classify.sh` | nothing (reports) | ops | `[built]` |
| CAOS end-to-end | `python3 cli/verify-caos.py --quick` | nothing (reports) | meta | `[built]` |
| Sandbox-first quarantine | `cli/quarantine.sh <name> <git\|npm> <src>` | new external tool entering repo | warden | `[built]` (§7.7) |
| Design anti-patterns | `impeccable detect` | design drift | mia + atlas | `[partial]` — installed, not wired to a gate |
| Real-browser render | Playwright `npm run test:e2e` | "done" on any UI work | quinn | `[partial]` — installed, not wired |
| Agent feedback loop | `agentation` toolbar | nothing (input channel) | mia | `[partial]` |
| **Task-state gate** | `cli/task.sh validate` | **state transitions** | meta | `[planned]` — §8.5 |
| **Write gate** | `.claude/hooks/yvon-gate.sh` | **Write/Edit without an approved task** | meta | `[planned]` — §8.4 |

**Standing rule:** a gate that is installed but not wired to a blocking point does not exist.
`reticle` was cited as quinn's browser gate in four agent definitions while never being
wired — the canonical example of this failure. **Resolved 2026-08-09:** the package was never
missing (installed + MCP-registered since 2026-08-01, `dashboard/node_modules/@reticlehq/core`,
confirmed against the repo) — the actual gap was `quinn-config.md`'s `reticle_mcp` field sitting
at `<FILL_IN>` for five weeks. That field is now filled from the verified install; see
`quinn-config.md` and `quinn-tool-requirements.md`. The standing rule stands as written — this
was the exact failure mode it describes, just diagnosed as "not installed" when it was really
"installed, not bound."

---

## 8.4 The write gate — `.claude/hooks/yvon-gate.sh`

Wired as `PreToolUse` on `Write|Edit|NotebookEdit`, alongside the existing `UserPromptSubmit`
retrieval hook in `.claude/settings.json`.

**Logic:**

1. Resolve the active task — `store/tasks/ACTIVE` (a file containing one task id).
2. **No active task** → block, with: *"No active TASK-SPEC. Run `cli/task.sh new '<request>'` first (MASTER PART 6)."*
3. Active task not in `executing` → block, naming the current state and the transition needed.
4. Target path not covered by any `work_items[].owns_paths` → block, listing the owned paths.
5. Otherwise → allow.

**Always-allowed paths** (editing these must never require a task):

```
store/tasks/**      docs/**        .claude/**
*.md at repo root   /tmp/**
```

**Escape hatch:** `YVON_GATE=off` env var bypasses the block and appends a line to
`store/gate-violations.log` with timestamp, path, and reason. Deliberately noisy — an
un-loggable bypass would recreate the current situation.

**Companion hook — `SessionStart`:** re-injects the CLAUDE.md rail plus the active task id.
This addresses context decay: CLAUDE.md is injected once and is 100+ messages away by
mid-session, which is precisely when the rail stops being followed.

---

## 8.5 `cli/task.sh` — the record manager

The hook needs something to read. Without this the gate blocks everything.

| Command | Effect |
|---|---|
| `task.sh new "<verbatim request>"` | Next free `TS-NNN` from `TEMPLATE.yaml`, `status: draft`, captures `source_message`, sets `ACTIVE` |
| `task.sh discover` | `draft → discovery`; opens `discovery.questions[]` for filling |
| `task.sh approve --by operator` | `discovery → approved`; stamps `approved_by` + `approved_at` |
| `task.sh start` | `approved → executing`; validates work_items have owners + acceptance |
| `task.sh gate` | `executing → gated`; checks every `produces` path exists |
| `task.sh done --proof "<artifact>"` | `gated → done`; rejects empty or self-asserting proof |
| `task.sh status` | Prints active task, state, work items, blocking condition |
| `task.sh validate [id]` | Schema + transition check; **exit 1 on failure** so `verify-deploy.sh` can call it |

`validate` becoming a check inside `cli/verify-deploy.sh` is what makes the whole thing
survive: the push is blocked if the task record is incomplete.

---

## 8.6 Tool → gate binding

The shared tool registry (`Teams/Shared OS/tools/shared-tool-registry.md`) is an accurate
*inventory* but not a *contract* — it records what is installed, never when it must run.
Each tool binds to a gate here, or it does not enter the repo.

| Tool | Bound gate | Fires when | Blocking |
|---|---|---|---|
| `verify-deploy.sh` | Deploy | pre-push | yes |
| `quarantine.sh` | Sandbox-first (§7.7) | any new external dep | yes |
| `impeccable detect` | Design | UI work → `gated` | yes (after §8.9) |
| Playwright | Browser render | UI work → `gated` | yes (after §8.9) |
| `reticle` | Browser render | with Playwright | **bound 2026-08-09** — `quinn-config.reticle_mcp`; still gated behind §8.8 step 6 (flip to blocking) |
| `agentation` | Feedback (input) | during `executing` | no |
| `browser-use` | Exploratory QA | during `executing` | no (non-deterministic — never a gate) |
| Crawl4AI · ScrapeGraphAI · Agent-Reach | Research | during `discovery` | no |
| *(new, unvetted)* taste-skill · strix · page-agent | — | — | must pass `quarantine.sh` before binding |

**Rule:** adding a row to the registry without a gate binding is incomplete. Unbound tools
are the mechanism by which `reticle` became fictional.

---

## 8.7 What PART 8 deliberately does not do

Honesty about limits, so this section isn't over-trusted:

- **It does not make agent routing real.** "Operating as mia" remains narration in a single
  context. True separation needs distinct sub-agent invocations with scoped tools; that is a
  larger change and is out of scope here.
- **It does not verify output quality** — only that the *process* ran and gates were invoked.
  A passing Playwright test on an ugly page still passes.
- **It cannot survive a determined bypass.** `YVON_GATE=off` exists. The goal is to make
  skipping deliberate and logged rather than accidental and invisible.
- **It adds friction to genuine exploration.** §8.4's always-allowed paths mitigate this;
  if the friction is wrong in practice, tune that list rather than disabling the gate.

---

## 8.8 Rollout order

Each step is independently useful; do not batch (PLAYBOOK §0.2).

1. ~~`cli/task.sh` + `store/tasks/ACTIVE`~~ — **`cli/task.sh`/`task.py` DONE** (dated 2026-08-01,
   full 8-command set confirmed 2026-08-09, see §8.0 update); `store/tasks/ACTIVE` still doesn't
   exist. Records became manageable but **still no blocking**.
2. Backfill TS-014/015/016/017 from the handout so the ledger is honest, and close the records
   stuck at `approved`/`gated` (8 at `approved`, 10 more now at `gated` — see §8.0 update).
3. `task.sh validate` added to `cli/verify-deploy.sh` as check 9 — **first blocking point**,
   at push time only.
4. `.claude/hooks/yvon-gate.sh` in warn+log mode for one working session; read
   `store/gate-violations.log` to calibrate the always-allowed list.
5. Flip the hook to blocking. Add `SessionStart` rail re-injection.
6. ~~Resolve `reticle` (install or strike)~~ **DONE 2026-08-09** — was already installed, now
   bound via `quinn-config.reticle_mcp`. Remaining: wire `reticle` + Playwright + `impeccable
   detect` as blocking gates for UI work.

**Definition of done for PART 8:** a Write to `dashboard/` with no active approved task is
refused, and the refusal names the exact command to fix it.

---

# ═══════════ APPENDIX A — CODE STRUCTURE — REFACTOR PLAN ═══════════
*(source: docs/CODE_STRUCTURE.md — merged 2026-07-30)*

> Target module layout, import rewiring map, what does not move.

**Current state:** 19 Python files flat in `rag/`, architecture docs scattered at root, experiments mixed with production code.

**Target state:** Logical subdirectories, docs centralized, imports clean, tests preserved.

**This refactor actually happened — re-verified 2026-08-09.** Real `rag/` matches the target
layout below closely: `core/harness/eval/monitor/verify/experiments/` all exist as described,
`rag/experiments/adaptive_recovery.py` and `relational_graph.py` are both real (a different,
unrelated finding earlier this session was about differently-named files —
`pipeline_adaptive_recovery.py`/`pipeline_relational_progressive.py` — which genuinely don't
exist; these do). `rag/__init__.py` is real and mostly matches the backwards-compat block below.
Two modules exist in `rag/core/` that aren't in this plan's list: `hermes_memory.py`,
`plan_lock.py`. Two remaining bugs below (both the same "unified" vs "unified_pipeline" typo
already fixed once in this Appendix): the bridge.py wiring row and the `__init__.py` example.

---

## CURRENT MESS

```
Project root:  8 architecture .md files scattered
rag/:          19 .py files flat, 3 books, 1 jsonl — no organization
```

## TARGET STRUCTURE

```
rag/
├── core/                      ← Pipeline engine (9 modules)
│   ├── injector.py            # 3-layer compression
│   ├── strategy.py            # Multi-strategy token pipeline
│   ├── destructor.py          # Hard budget enforcement
│   ├── optimizer.py           # Dynamic context optimizer
│   ├── retriever.py           # Full retrieval pipeline
│   ├── bridge.py              # CIE to/from RAG bridge
│   ├── embed.py               # Hybrid embedder
│   ├── chunkify.py            # Semantic chunker
│   ├── feedback.py            # Quality feedback loop
│   └── unified_pipeline.py    # kept its name, just moved into core/ (verified 2026-08-09 —
│                               #   this line previously said "unified.py (renamed)", which was
│                               #   wrong; the real file is rag/core/unified_pipeline.py)
│
├── harness/                   ← 5-gate verification (2 modules)
│   ├── gates.py               # ← harness.py (renamed)
│   └── disclosure.py          # ← progressive_disclosure (renamed)
│
├── eval/                      ← Quality flywheel + judge (2 modules)
│   ├── judge.py               # ← eval_judge (renamed)
│   └── flywheel.py            # ← quality_flywheel (renamed)
│
├── monitor/                   ← Field monitoring (2 modules)
│   ├── watcher.py             # ← field_monitor (renamed)
│   └── improver.py            # ← self_improver (renamed)
│
├── verify/                    ← Post-hoc verification (1 module)
│   └── grounded.py            # ← verifier (renamed)
│
├── experiments/               ← Experimental (not production, 4 modules)
│   ├── adaptive_recovery.py   # Option 1+3 pipeline
│   ├── relational_graph.py    # Option 2+4 pipeline
│   ├── benchmark.py           # Comparison suite
│   └── e2e.py                 # E2E validation
│
├── books/                     ← Design rationale (3 .md, unchanged)
├── store/                     ← Data (unchanged)
├── chunks/                    ← Data (unchanged)
├── README.md                  ← RAG overview (unchanged)
└── requirements.txt           ← Python deps (unchanged)

docs/                          ← All architecture docs moved here
├── 4LAYER_ARCHITECTURE.md
├── DASHBOARD_ARCHITECTURE.md
├── FULL_ARCHITECTURE.md
├── GOOGLE_PATTERNS.md
├── HARNESS_ARCHITECTURE.md
├── WORK_TREE.md
├── BENCHMARK_REPORT.md
├── PIPELINE_FINAL_REPORT.md
├── UPGRADE_PLAN.md
└── CODE_STRUCTURE.md

Teams/                         ← Agents (unchanged)
src/                           ← TypeScript CIE (unchanged)
cli/                           ← CLI tools (unchanged)
dist/                          ← Compiled output (unchanged)
```

---

## IMPORT CHANGES

### Before → After

| Old Import | New Import |
|-----------|-----------|
| `from rag.injector import ...` | `from rag.core.injector import ...` |
| `from rag.harness import ...` | `from rag.harness.gates import ...` |
| `from rag.verifier import ...` | `from rag.verify.grounded import ...` |
| `from rag.unified_pipeline import ...` | `from rag.core.unified_pipeline import ...` (kept its name — verified 2026-08-09, this row previously said `rag.core.unified`, which doesn't exist) |
| `from rag.eval_judge import ...` | `from rag.eval.judge import ...` |
| `from rag.field_monitor import ...` | `from rag.monitor.watcher import ...` |
| `from rag.self_improver import ...` | `from rag.monitor.improver import ...` |
| `from rag.progressive_disclosure import ...` | `from rag.harness.disclosure import ...` |
| `from rag.quality_flywheel import ...` | `from rag.eval.flywheel import ...` |

---

## WIRING UPDATES

### unified_pipeline.py internally imports:
- `from destructor import destructive_inject` → `from rag.core.destructor import destructive_inject`
- `from injector import estimate_tokens` → `from rag.core.injector import estimate_tokens`
- `from harness import process` → `from rag.harness.gates import process`
- `from progressive_disclosure import ProgressiveDisclosure` → `from rag.harness.disclosure import ProgressiveDisclosure`

### bridge.py internally imports:
- `from retriever import ...` → `from rag.core.retriever import ...`
- `from optimizer import ...` → `from rag.core.optimizer import ...`
- `from unified_pipeline import ...` → `from rag.core.unified_pipeline import ...`
- `from verifier import verify` → `from rag.verify.grounded import verify`

---

## IMPLEMENTATION ORDER

1. Create subdirectories: `rag/core/`, `rag/harness/`, `rag/eval/`, `rag/monitor/`, `rag/verify/`, `rag/experiments/`, `docs/`
2. Move files to new locations (git mv to preserve history)
3. Fix imports within each module (cross-references)
4. Fix imports in bridge.py and unified.py (all internal wires)
5. Run full test suite — fix any broken path references
6. Create `rag/__init__.py` with backwards-compatible imports for external consumers
7. Commit

---

## WHAT DOES NOT MOVE

- `Teams/` — 46 agents, unchanged
- `src/` — TypeScript CIE, unchanged
- `cli/` — CLI tools, unchanged
- `rag/books/` — unchanged location
- `rag/store/` — unchanged location
- `rag/chunks/` — unchanged location
- `rag/requirements.txt` — unchanged location

## RISK

| Risk | Mitigation |
|------|-----------|
| All tests break on import (real count 346, see §7) | Fix imports one subdirectory at a time, retest after each |
| bridge.py breaks (critical path) | Fix bridge.py imports first, test with `--mode retrieve` |
| unified_pipeline breaks (critical path) | Fix unified_pipeline.py imports second, run 31 tests |
| External imports from CIE break | Create `rag/__init__.py` with backwards-compat re-exports |

**Mitigation: Backwards-compatible __init__.py**

```python
# rag/__init__.py — backwards-compat re-exports
from rag.core.injector import estimate_tokens, SentenceScorer, CitationInjector
from rag.core.destructor import destructive_inject
from rag.core.unified_pipeline import inject, inject_with_harness
from rag.harness.gates import process as harness_process
from rag.verify.grounded import verify
from rag.harness.disclosure import ProgressiveDisclosure
```

Old `from rag.harness import process` still works because `rag/harness/__init__.py` re-exports it.

**Estimated: 4 hours, 100% test preservation guaranteed.**

---

# ═══════════ APPENDIX B — GOOGLE agents-cli PATTERN INTEGRATION ═══════════
*(source: docs/GOOGLE_PATTERNS.md — merged 2026-07-30)*

> 8 patterns to adopt, what to discard, YVON equivalents.

**Status:** Analysis Complete — Building Enhancements  
**Source:** github.com/google/agents-cli (Apache 2.0)  
**Date:** 2026-07-16

**Spot-checked 2026-08-09 — checks out.** This is a proposal doc, not a current-state claim: every
"already built" cross-reference (`rag/monitor/watcher.py`, `feedback.py`, relay's grants,
`self_improver.py`→`rag/monitor/improver.py`, `rag/verify/grounded.py`) points at a module
confirmed real elsewhere in this doc, and every `platform/*.py` file is consistently marked
`🔄 Build` (future work) — matches the already-established finding that `platform/` doesn't exist
yet (see §10). No corrections needed.

---

## WHAT TO ADOPT (8 patterns, all map to YVON's existing structure)

## WHAT TO DISCARD (Google Cloud-specific, replaced with YVON equivalents)

| Google Pattern | Why Discard | YVON Replacement |
|----------------|------------|------------------|
| `agents-cli deploy --deployment-target cloud_run/gke` | GCP-specific container deployment | `yvon tenant provision` (deploys to YVON's agent fleet) |
| `agents-cli publish gemini-enterprise` | Gemini Enterprise registration | `yvon publish --marketplace agentx` (AgentX marketplace) |
| `agents-cli infra single-project` | GCP Terraform project setup | N/A — YVON runs locally, no cloud infra needed |
| BigQuery Agent Analytics | GCP-specific data warehouse | `rag/monitor/watcher.py` (already built) |
| Cloud Trace spans | GCP-specific tracing | Lasswell traces (already built in feedback.py) |
| IAP / Workload Identity | GCP IAM | relay's least-privilege grants (already built) |
| Cloud Build CI/CD | GCP-specific CI | `self_improver.py` sandbox testing (already built) |
| gcloud CLI | GCP SDK | N/A — no cloud dependency |
| Vertex AI Eval Service | GCP-specific eval | `rag/verify/grounded.py` + local eval (already built + enhance) |
| Agent Runtime sessions | GCP-specific session management | Per-tenant SQLite graph DB (planned Phase 2) |

---

## PATTERN 1: MANIFEST-BASED PROVISIONING (from agents-cli-manifest.yaml)

### What Google Does
```yaml
# agents-cli-manifest.yaml
agent_directory: app
create_params:
  deployment_target: cloud_run
  session_type: agent_platform_sessions
  agent_template: adk
```

### What YVON Builds
```yaml
# tenant-manifest.yaml (NEW)
tenant_id: boutique-a
business_name: "Boutique A"
industry: fashion_retail
departments:
  - brand-studio:
      agents: [spark, lena, pixel, pulse]
      config:
        brand_voice: "warm, inclusive, premium"
        target_audience: "women 25-45"
        content_cadence: weekly
  - product:
      agents: [spec, metric]
tier: growth
created_at: 2026-07-16
provisioned_by: yvon-core
deployment_version: 1.0.0
integrations:
  - instagram: {status: active, auth: oauth}
  - shopify: {status: active, auth: api_key}
```

File: `platform/manifest.py` — reads/writes tenant-manifest.yaml, validates schema, preserves creation parameters for upgrades.

---

## PATTERN 2: SCAFFOLD → ENHANCE → UPGRADE (from agents-cli scaffold)

### What Google Does
```
agents-cli scaffold create my-agent --prototype     # Minimal
agents-cli scaffold enhance . --deployment-target   # Add deployment
agents-cli scaffold upgrade --dry-run               # Preview upgrade
```

### What YVON Builds
```
yvon tenant create boutique-a \
  --departments brand-studio \
  --tier growth \
  --prototype          # No integrations, synthetic data for testing

yvon tenant enhance boutique-a \
  --add-integrations instagram,shopify \
  --add-department product

yvon tenant upgrade boutique-a \
  --dry-run            # Preview manifest changes
```

File: `platform/scaffold.py` — creates tenant directory structure, copies agent definitions, applies business-specific overrides, provisions isolated graph DB.

---

## PATTERN 3: EVAL DATASETS + QUALITY FLYWHEEL (from agents-cli eval)

### What Google Does
```
agents-cli eval generate       # Run agent on dataset
agents-cli eval grade          # LLM-as-judge scoring
agents-cli eval analyze        # Failure clustering
agents-cli eval optimize       # Auto-tune prompts (GEPA)
agents-cli eval compare        # A/B test two versions
```
The eval SKILL.md defines 6 built-in metrics and a 5-stage quality flywheel.

### What YVON Builds

YVON already has `rag/verify/grounded.py` (grounded citations + self-consistency + constitution). Enhance it with:

**New: Eval Dataset System**

File: `rag/eval_dataset.py`
```python
# Eval dataset format
{
  "dataset_id": "headline_review_v1",
  "agent": "spark",
  "scenarios": [
    {
      "query": "Review this headline for the campaign",
      "expected_citations": ["Ogilvy Ch.5", "p.71"],
      "expected_rules": ["Must include brand name"],
      "expected_no_claims": ["unsupported speculation"],
      "rubric": {
        "citation_accuracy": 0.8,
        "rule_adherence": 0.9,
        "no_hallucination": 1.0
      }
    }
  ]
}
```

**New: Quality Flywheel** (5 stages, from Google's eval SKILL.md)

File: `rag/quality_flywheel.py`
```
Stage 1: Prepare Data → yvon eval generate
Stage 2: Run Inference → yvon eval run --agent spark
Stage 3: Grade Traces → yvon eval grade (LLM-as-judge on rubric)
Stage 4: Analyze Failures → yvon eval analyze (cluster failures)
Stage 5: Optimize → yvon eval optimize (auto-tune budget parameters)
```

**New: LLM-as-Judge Grading**

File: `rag/eval_judge.py`
```python
def grade_agent_output(output, rubric, injected_chunks):
    """Grade agent output against rubric using LLM-as-judge."""
    # Uses the same verifier.py patterns but with rubric-based scoring
    return {
        'citation_accuracy': 0.92,
        'rule_adherence': 0.88,
        'no_hallucination': 0.95,
        'overall': 0.91
    }
```

---

## PATTERN 4: PROTOTYPE-FIRST (from agents-cli --prototype flag)

### What Google Does
Start minimal (no CI/CD, no Terraform, no deployment), iterate fast, add infrastructure later with `scaffold enhance`.

### What YVON Builds
```yvon tenant create --prototype``` provisions a tenant with:
- Synthetic data only (no real integrations connected)
- 7-day trial period
- Demo dashboard with sample content
- Business can test before committing

```yvon tenant upgrade --to production``` adds:
- Real external integrations (OAuth flow)
- Production monitoring (field_monitor activated)
- Billing starts
- Live agent sessions

---

## PATTERN 5: AGENT CARD + DISCOVERY (from agents-cli publish)

### What Google Does
```
agents-cli publish gemini-enterprise
```
Creates an Agent Card so other agents can discover this one.

### What YVON Builds

**Agent Card Format** (new: `platform/agent_card.py`)

```yaml
# agent-card.yaml
agent_id: spark
display_name: "Creative Director"
persona: "David Ogilvy — the Father of Advertising"
what_it_does:
  - "Reviews and critiques creative work (ads, headlines, visuals)"
  - "Ensures brand consistency across all channels"
  - "Coaches other creative agents (lena, pixel, muse)"
what_it_needs:
  - "Brand guidelines document"
  - "Target audience profile"
  - "Campaign brief"
tools_used:
  - MCP: Browserbase (visual review)
  - API: Canva (design assets)
pricing:
  starter: {price: 49, included: true}
  growth: {price: 149, included: true}
  scale: {price: 399, included: true}
department: brand-studio
```

**Marketplace Discovery** (new: `src/platform/agent-marketplace.ts`)

```
AgentX Marketplace:
  Businesses browse available agents
  → See Agent Card (what it does, pricing, requirements)
  → "Add to my business"
  → Tenant provisioner deploys agent subset
  → Agent starts working
```

---

## PATTERN 6: OBSERVABILITY TIERS (from agents-cli observe)

### What Google Does
Three tiers: Cloud Trace (always on) → Prompt-Response Logging (on deploy) → BigQuery Analytics (opt-in).

### What YVON Builds

YVON already has `rag/monitor/watcher.py`. Mirror the tier system:

| YVON Tier | Google Equivalent | Default | Implementation |
|-----------|------------------|---------|---------------|
| **Trace** | Cloud Trace | Always on | `field_monitor.py` attractors + degradation |
| **Logging** | Prompt-Response Logging | On for owned brands, opt-in for tenants | `feedback.py` Lasswell traces |
| **Analytics** | BigQuery Analytics | Opt-in (adds cost) | `field_monitor.py` weekly reports |

File: `platform/observability.py` — configures which tiers are active per tenant.

---

## PATTERN 7: LIFECYCLE MAPPING (8 phases → YVON gates)

### Google's 8 Phases → YVON's Implementation

| Google Phase | YVON Gate/Module | Status |
|-------------|-----------------|--------|
| 0 — Spec | Constitution (board enforces) + `platform/manifest.py` | 🔄 Build |
| 1 — Scaffold | `platform/scaffold.py` (tenant create) | 🔄 Build |
| 2 — Build | 46 agent definitions + 200+ SKILL.md files | ✅ Complete |
| 3 — Orchestrate | CAOS executor (TypeScript) | ✅ Complete |
| 4 — Evaluate | `rag/verify/grounded.py` + `rag/eval_dataset.py` + `rag/eval_judge.py` | 🔄 Enhance |
| 5 — Deploy | `platform/scaffold.py` (tenant provision) | 🔄 Build |
| 6 — Publish | `platform/agent_card.py` + marketplace | 🔄 Build |
| 7 — Observe | `rag/monitor/watcher.py` + `platform/observability.py` | 🔄 Enhance |

---

## PATTERN 8: SKILL ARCHITECTURE (identical — validates YVON's approach)

### What Google Does
7 installable skills (Markdown docs), loaded into coding agents via `agents-cli setup`. Each skill has triggers, explicit boundaries, and cross-references.

### What YVON Already Does (Identical Pattern)
200+ SKILL.md files across 46 agents. Each SKILL.md follows a 9-section format. The skill routing (`operational/skill/`) determines which activates per query. Progressive disclosure (`progressive_disclosure.py`) loads only matched skills.

**YVON's advantage:** Google has 7 skills for the CLI itself. YVON has 200+ operational skills for the business agents. Google's skill system confirms YVON's approach. No changes needed.

---

## WHAT GETS BUILT

### New Files (8)

| File | Purpose | Size Est |
|------|---------|---------|
| `platform/manifest.py` | Read/write/validate tenant-manifest.yaml. Versioned. Preserves creation params for upgrades. | ~200L |
| `platform/scaffold.py` | `yvon tenant create/enhance/upgrade`. Provisions tenant directory, copies agent defs, applies overrides, creates graph DB. Supports --prototype and --dry-run. | ~400L |
| `rag/eval_dataset.py` | Eval dataset schema + generator. Scenarios with rubrics, expected citations, expected rules. | ~250L |
| `rag/eval_judge.py` | LLM-as-judge grading against rubric. Scores: citation_accuracy, rule_adherence, no_hallucination. Quality flywheel integration (5 stages). | ~300L |
| `rag/quality_flywheel.py` | 5-stage loop: prepare data → run inference → grade traces → analyze failures → optimize. Coordinate eval_dataset + eval_judge + verifier. | ~200L |
| `platform/agent_card.py` | Agent Card schema + generator. Display name, persona, what it does, what it needs, tools used, pricing tiers. Publish to marketplace. | ~150L |
| `platform/observability.py` | Per-tenant observability tier configuration. Trace (always), Logging (owned/opt-in), Analytics (opt-in). Wraps field_monitor. | ~150L |
| `cli/yvon.py` | CLI entry point: `yvon tenant create/enhance/upgrade`, `yvon eval generate/grade/analyze/optimize`, `yvon publish`, `yvon observe`. | ~300L |

### Modified Files (4)

| File | Change |
|------|--------|
| `rag/verify/grounded.py` | Add rubric-based grading integration with eval_judge |
| `rag/monitor/watcher.py` | Add observability tier gating |
| `rag/monitor/improver.py` | Add cross-tenant learning mode |
| `rag/core/unified_pipeline.py` | Add per-tenant context routing |

### Total: 8 new files, 4 modified, ~1950 lines of new code, ~60 new tests

---

# ═══════════ APPENDIX C — DASHBOARD — TWO-TIER DESIGN ═══════════
*(source: docs/DASHBOARD.md — merged 2026-07-30)*

> Operator tier + per-brand tier, health score formula, Rail-3 safe flows.

**Status:** Reviewed by Engineering agents against dev's 8 principles + quinn's charter  
**Date:** 2026-07-16  
**Pipeline verified:** Live 5-query test passed with fixes applied  
**Method:** Pipeline executed → agents consulted → architecture designed from real data

**Checked 2026-08-09 — this is unbuilt, and distinct from the real app.** This mockup (Fleet
Health / RAG Health / Graph Vitals / Connected Brands cards) is speculative design for a future
multi-tenant operator dashboard (Part 5's AgentX platform) and does not exist anywhere in
`dashboard/app` — none of these card names appear there. The real `dashboard/` (`yvon-dashboard`
Next.js app, already built and live) has a completely different, unrelated set of routes
(`agents`, `chat`, `brain`, `brain-wiki`, `asset-lab`, `foundry`, `content-pipeline`,
`consulting-crm`, etc.) serving today's actual product, not this tiered SaaS-operator view. Read
everything below as a proposal, not a status report — `field_monitor.py`/`self_improver.py`/
`scaffold.py` are the old pre-rename names (see Appendix A) and `scaffold.py` doesn't exist yet
(it's part of the not-yet-built `platform/` layer, Appendix B).

---

## DESIGN CONSTRAINTS (from dev's principles)

| Principle | Requirement | How Dashboard Meets It |
|-----------|------------|----------------------|
| P4 — "Done is a checked list" | Every feature has a verification gate | Each dashboard card has a data-source check + freshness check |
| P5 — "No unowned failure modes" | Every failure has an owner | Each data source has an owner agent; failures escalate to operator |
| P6 — "Measure, don't guess" | Numbers from pipeline, not assumptions | Dashboard calls bridge.py `--mode dashboard` which runs real pipeline queries |
| P7 — "Charter-clean" | Plan-locked, sandboxed, read-only | Dashboard queries are read-only; no agent-run DB changes; plan-locked per tenant |

## QUINN CHARTER ENFORCEMENT (applied to dashboard)

| Rail | Requirement | Dashboard Enforcement |
|------|------------|----------------------|
| Rail 1 (Plan-Lock) | Every dashboard query is a locked plan | Dashboard fetches from bridge.py only; no ad-hoc queries |
| Rail 2 (Sandbox) | Data sources are allowlisted | Dashboard API only serves from validated modules (field_monitor, feedback, harness trace) |
| Rail 3 (No Destructive DB) | Dashboard never writes | Read-only API; all "Add Brand" writes go through scaffold.py with plan-lock |

---

## TIER 1: YVON MASTER DASHBOARD (operators)

### Data Sources (real pipeline output)

| Card | Data Source | Update | Owner |
|------|------------|--------|-------|
| Fleet Health | `field_monitor.py` — drift signals per agent | Hourly | gauge (agent-quality-scorecard) |
| RAG Health | `bridge.py --mode dashboard/rag` — savings %, quality, test count | Daily | field_monitor |
| Graph Vitals | `src/graphs/builder.ts` — nodes, edges, communities | Daily | dev (ADRs record changes) |
| Self-Improver | `self_improver.py` — improvement_log.jsonl | Weekly | self_improver |
| Connected Brands | Per-brand aggregation from field_monitor | Hourly | board (governance gate) |
| Alerts | Harness quarantine log + field_monitor degradation | Real-time | sentinel (bypass detection) |

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  YVON MASTER — v1.3.0                           [⚙️]  [🔔 2 alerts] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────┐  │
│  │ FLEET HEALTH │  RAG HEALTH  │  GRAPH VITALS│  SELF-IMPROVER   │  │
│  │              │              │              │                  │  │
│  │ 46/46 agents │ Pipeline: 5/5│ 1,482 nodes  │ Last: 2026-07-16 │  │
│  │ 0 incidents  │ 73% avg save │ 3,840 edges  │ 4 proposals held │  │
│  │ 7 depts green│ Harness: 1.1 │ 12 commun.   │ 0 auto-deployed  │  │
│  │ Drift: none  │ conflicts/run│ Cohesion:0.87│ Next: Sun 00:00  │  │
│  └──────────────┴──────────────┴──────────────┴──────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  CONNECTED BRANDS                                    [+ ADD] │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐│    │
│  │  │ NOVIZIO      │  │ HOURBOUR     │  │ BOUTIQUE A           ││    │
│  │  │ Owned Brand   │  │ Owned Brand  │  │ AgentX · Growth      ││    │
│  │  │ Health: 82%   │  │ Health: 93%  │  │ Health: 78%          ││    │
│  │  │ 3 depts       │  │ 2 depts      │  │ 2 depts: Brand+Prod ││    │
│  │  │ 11 agents     │  │ 8 agents     │  │ IG ✅ Shopify ✅     ││    │
│  │  │ [$ Open →]    │  │ [$ Open →]   │  │ [$ Open →]           ││    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘│    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  RECENT ALERTS                               [Mark All Read] │    │
│  │  ⚠️ Financial Analysis — avg 26 conflicts/query (threshold)  │    │
│  │  ⚠️ Engineering Debug — quality 0.00 (authority fix applied) │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │
│  │ OBSIDIAN GRAPH PREVIEW      │  │ PIPELINE LIVE TEST          │   │
│  │ Communities: 12             │  │ Last run: 5/5 queries ok    │   │
│  │ Largest: Brand Studio (259) │  │ Legal: 0→8 chunks (fixed)  │   │
│  │ Most connected: Shared OS   │  │ Finance: 73% save, 0.27 Q  │   │
│  │ [Open Vault →]              │  │ [Re-run Test →]             │   │
│  └─────────────────────────────┘  └─────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Health Score Formula

```
Brand Health = (agent_uptime × 0.3) + (content_quality × 0.25) +
               (integration_health × 0.25) + (pipeline_savings × 0.2)

agent_uptime:       % of agents without degradation alerts
content_quality:    avg grounded score from verifier.py (last 7 days)
integration_health: % of connectors with status=active
pipeline_savings:   savings_pct / 100 (capped at 1.0)
```

### Add Brand Flow (Rail 3 safe — read-only until operator approves)

```
[+ ADD BRAND] clicked
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  ADD NEW BRAND                                       │
│                                                      │
│  Brand Name: [________________]                      │
│  Industry:   [Fashion Retail ▾]                      │
│                                                      │
│  Departments needed:                                 │
│  ☑ Social Media (Brand Studio: spark, lena, pulse)  │
│  ☐ Brand Design (Brand Studio: atlas, pixel, muse)  │
│  ☐ E-Commerce (Product: price, spec, metric)         │
│  ☐ Customer Support (Product: ux, loom)              │
│                                                      │
│  Tier: Growth ($149/mo) · 2 depts · 8 agents         │
│                                                      │
│  [Submit for Provisioning] ← plan-locked by quinn    │
└──────────────────────────────────────────────────────┘
    │
    ▼ quinn: plan-lock created + hashed
    ▼ scaffold.py: tenant-provision (sandboxed)
    ▼ quinn: verify plan completed
    ▼ board: record in master graph
```

---

## TIER 2: PER-BRAND DASHBOARD (business owners)

### What They See

```
┌──────────────────────────────────────────────────────┐
│  BOUTIQUE A — Your Dashboard          [⚙️ Settings]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────┬─────────────────┬────────────┐  │
│  │ THIS WEEK       │ YOUR CONTENT    │ REACH      │  │
│  │                 │                 │            │  │
│  │ 5 posts ready   │ 3 Instagram     │ 1.2k views │  │
│  │ 2 reviews done  │ 2 Stories       │ 84 clicks  │  │
│  │ Next: Thursday  │ Drafts: 4       │ Growing ↑  │  │
│  └─────────────────┴─────────────────┴────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  UPCOMING CONTENT                             │    │
│  │                                              │    │
│  │  MON  │ New arrivals post             ✅    │    │
│  │  TUE  │ Behind-the-scenes Story        ✅    │    │
│  │  WED  │ Customer spotlight             ⏳    │    │
│  │  THU  │ Sale announcement              📝    │    │
│  │  FRI  │ Weekend style inspiration      📝    │    │
│  │                                              │    │
│  │  [Approve] [Request Changes] [Skip Week]     │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  CONNECTIONS                    [Manage →]   │    │
│  │  ✅ Instagram   ✅ Shopify                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Plan: Growth ($149/mo) · Next bill: Aug 1           │
└──────────────────────────────────────────────────────┘
```

### What Maps to Pipeline Data

| Card | Pipeline Source | Business Owner Sees |
|------|----------------|-------------------|
| This Week | `bridge.py` — content pipeline output count | "5 posts ready" |
| Your Content | Per-tenant agent session logs | Content feed with status |
| Reach | Connector API (Instagram, Shopify) | Views, clicks, growth direction |
| Upcoming Content | Content pipeline scheduler | Calendar with approve/skip |
| Connections | relay MCP registry (per-tenant) | Green checks for active |
| Settings | `tenant-manifest.yaml` | Plan, billing, connectors |

### What They NEVER See

| Hidden | Why |
|--------|-----|
| spark, lena, pixel | They see "Your Creative Team" |
| RAG pipeline metrics | "Content Quality: Good ✅" |
| Harness gates | "All systems working ✅" |
| Graph databases | Their content feed (already filtered) |
| Token savings | "Optimized for speed" |
| Agent error logs | Escalated to operator, not shown to business owner |

---

## DASHBOARD API (bridge.py --mode dashboard)

```
GET /dashboard/master
  → field_monitor.generate_report()
  → self_improver last run
  → harness quarantine log (last 24h)
  → graph builder stats
  → per-brand aggregation

GET /dashboard/brand/:id
  → per-tenant field_monitor
  → content pipeline output feed
  → connector health (relay MCP registry)
  → tenant-manifest.yaml (plan/billing)

POST /dashboard/brands
  → validate brand name, industry, departments
  → plan-lock (quinn)
  → scaffold.py tenant-provision (Phase 2 build)
  → return provisioning status

GET /dashboard/alerts
  → harness quarantine log
  → field_monitor degradation alerts
  → coverage gaps
  → drift signals
```

---

## FAILURE MODE OWNERSHIP

| Failure Mode | Detection | Owner Agent | Recovery |
|-------------|-----------|-------------|----------|
| Dashboard API returns stale data | Freshness check (data timestamp < 1h old) | ops | Re-fetch from source |
| Per-brand dashboard shows wrong tenant | Tenant isolation check (brand_id matches auth) | sentinel | Halt + escalate |
| Add Brand provisions duplicate tenant | Idempotency check (brand name + industry hash) | quinn | Return existing tenant |
| Dashboard fetches from unauthorized dept | Plan-lock: dashboard query plan hashed before execution | quinn | Halt + escalate |
| Obsidian graph preview stale | Graph builder last-run timestamp check | dev | Trigger graph rebuild |

---

## WHAT GETS BUILT

| File | Purpose | Tests |
|------|---------|-------|
| `dashboard/dashboard_api.py` | bridge.py extension: `--mode dashboard` endpoints | 15 |
| `dashboard/master_dashboard.html` | Self-contained HTML artifact for YVON operators | N/A (artifact) |
| `dashboard/brand_dashboard.html` | Self-contained HTML artifact for business owners | N/A (artifact) |
| `dashboard/add_brand.html` | Add Brand wizard — form → scaffold.py | N/A (artifact) |

**Estimated: 3 days, 15 tests, 3 HTML artifacts. All read-only, plan-locked, sandboxed. Zero destructive operations.**

---

