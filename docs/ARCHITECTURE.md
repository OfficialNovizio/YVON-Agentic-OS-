# YVON — Unified Architecture (Micro → Macro)

**Status:** single source of truth. Supersedes: FULL.md, HARNESS.md, WORK_TREE.md, PIPELINE_FINAL.md, CODE_STRUCTURE.md, GOOGLE_PATTERNS.md, Upcoming Plan .md (all archived in `docs/archive/`).
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

Every work item's query then runs the CAOS flow (Context-Aware Orchestration: CLASSIFY → RESOLVE → RETRIEVE → GATE). Detailed layer diagrams: `docs/archive/WORK_TREE.md`.

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

Every gate has an explicit fallback (full matrix: `docs/archive/WORK_TREE.md` §Fallback Matrix). Degrading loudly beats improvising.

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
4. `cli/toonify.py` regenerates the `.toon` injectable form.

So a skill improves through: usage telemetry → gauge measurement → anneal proposal → operator-approved edit → skillgen + toonify recompile → next retrieval uses it. Checked in a loop, end to end.

## 6. Memory and graphs

- **Agent memory (hermes)** `[built]` — `src/adapters/hermes-sync.ts` reads/writes `USER.md` + `MEMORY.md` in the configured hermes memory dir (CRDT-synced); exposed to retrieval as the CIE source `src/cie/sources/hermes-memory.ts`. This is how an agent's accumulated experience enters context. (Note: "hermes" names both this memory system and the primary LLM in the generation trio.)
- **Code graphs** `[built]` — `npx yvon graph` (`cli/yvon.js`) builds the codegraph + graphify reports (`graphify-out/`); consumed by the CIE sources `codegraph.ts` / `graphify.ts`.
- **Graph memory tiers** `[planned]` — Tier 1 Master Graph (fleet state, all profiles, learning patterns; access: Core + board + meta), Tier 2 owned-brand graphs (dedicated DB per brand), Tier 3 tenant graphs (separate SQLite per tenant; data never leaves except anonymized aggregates). See §10.

## 7. Testing — the verification map `[built]`

263 tests, zero failures, across the pipeline modules (injector 22, strategy 23, destructor 35, unified 31, harness 36, verifier 16, disclosure 23, field monitor 17, self-improver 20, e2e 40; full table: `docs/archive/WORK_TREE.md`). Entry points:

- `python3 cli/verify-caos.py --quick` — end-to-end smoke (5 checks).
- `rag/test_runner.py` — module suites.
- quinn's real-browser gate for anything frontend (mock data in the DOM is an integrity block).
- `node cli/yvon.js doctor` — fleet health.

---

# PART III — THE SYNC FABRIC: dist, toon, hermes, and who decides what

## 8. Source → runtime sync `[built]`

```
Teams/**/*.md               SOURCE OF TRUTH (human-readable, book-grounded)
   │
   ├─ cli/toonify.py  →  *.toon        injectable compressed form (~650 files,
   │                                    84.5% avg token savings; TASK-SPEC rule:
   │                                    inject_form: .toon)
   ├─ cli/skillgen.js →  dist/skills/  compiled runtime skills (disposable output)
   │
src/ (TypeScript: cie/, pipelines/, toon/, adapters/, agents/, graphs/)
   │
   └─ tsc            →  dist/          compiled JS the runtime actually executes
```

`dist/` is always disposable and regenerable; `Teams/` and `src/` are the only things a human edits. hermes memory syncs *live* (CRDT) rather than compiling — it's state, not source.

## 9. Who decides which agent and which skill — and how it's checked

**Decision chain (forward):**
1. Session rail routing table (`CLAUDE.md` §2) — department + agent by task domain.
2. Multi-agent → meta's task-dispatch assigns work-item owners; department lead sequences (dev, spark, warden…).
3. Within the agent: `operational/skill/<agent>-skill-routing.md` + skill `triggers` frontmatter, matched by `cie/classifier.ts` + progressive disclosure → 2–3 active skills.
4. Config values come from `operational/agent/<agent>-config.md`; a `<FILL_IN>` field means ask — never improvise.

**Check chain (backward):** telemetry logs the invocation → gauge measures whether the routed skill performed → field monitor detects drift per agent → anneal proposes routing/skill fixes → self-improver deploys parameter changes after sandbox tests → Gate 2 reliability scores shift which sources win next time. The forward chain is re-tuned by the backward chain weekly.

---

# PART IV — MACRO: The 4-Layer Multi-Tenant Platform

Full design: `docs/archive/Upcoming Plan .md`. Described here as the complete system with status tags. (Brand names genericized per Playbook §0.4.)

## 10. The stack

**Layer 1 — YVON Core (master control plane).** Master graph vault (Obsidian) `[planned]`; fleet governance: meta + board + precedent + sentinel `[built]`; business profile registry, department deployment engine (`platform/deploy.py`: create tenant vault → copy agent definitions → apply overrides → wire connectors), multi-tenant isolation, cross-tenant learning pipeline `[planned]`.

**Layer 2 — Agent Layer.** Everything in Parts I–II: 46 agents × 7 departments, 5-gate harness, progressive disclosure, grounded verification, self-improvement, 64–91% compression, graph memory. `[built]` — this layer is the shipped core.

**Layer 3 — Integration Layer.** relay owns the MCP tool registry, integration patterns (idempotency, retry, circuit breaker), and per-tool egress allowlists `[partial]` — 7 Engineering marketplace MCP tools mapped `[built]`; connector SDK (`platform/connector_sdk.py`) + 6 pre-built connectors (social, commerce, design, email, analytics, payments) `[planned]`. Least-privilege per agent per tenant (e.g., a creative agent READS analytics; only the social agent POSTS). `[planned]`

**Layer 4 — AgentX Platform (SaaS).** Onboarding flow (business profile → department selection → subscription tier → tenant provisioning), billing tiers, department packages, tenant dashboard. `[planned]`

## 11. Multi-tenant data flow (as shipped)

A tenant message: AgentX resolves tenant graph + profile + integrations (L4) → relay verifies connector health and applies least-privilege + egress allowlist (L3) → the Part-I pipeline runs *scoped to the tenant's graph only* — Gate 1 authenticates against tenant sources, Gate 2 uses per-tenant quality scores (L2) → generation + verification → deliver via dashboard, update tenant graph → anonymized aggregates flow up to the cross-tenant learner → master graph learns industry patterns (posting-time effects, industry-specific query profiles) → tuned defaults flow back down. `[planned]`

**Isolation invariants:** dedicated graph DB per brand, separate SQLite per tenant, raw data never crosses tenant boundaries, only anonymized aggregates ascend; sandbox tests verify no cross-tenant leakage before any deployment. The self-improvement loop of §4 extends per-tenant: per-tenant analysis → cross-tenant aggregation → per-tenant/per-industry/global proposals → per-tenant sandboxes → scoped deploys → master graph log. `[planned]`

## 12. Build order (10 weeks, phased)

Core hardening (2w) → department deployment engine (2w) → AgentX onboarding (2w) → connector marketplace (2w) → cross-tenant learning (1w) → production hardening (1w). Detail: `docs/archive/Upcoming Plan .md` §Build Order.

---

## 13. Document Map

| Need | Go to |
|---|---|
| Session process + ground rules | `CLAUDE.md`, `Teams/AGENT-BUILD-PLAYBOOK.md` |
| Layer-by-layer pipeline diagrams, fallback matrix, test table | `docs/archive/WORK_TREE.md` |
| Harness build history + data flow | `docs/archive/HARNESS.md` |
| Strategy benchmark data (12 scenarios) | `docs/archive/PIPELINE_FINAL.md` |
| Fleet census, skill format, Shared OS catalog, CIE/TOON internals | `docs/archive/FULL.md` |
| 4-layer platform design (full) | `docs/archive/Upcoming Plan .md` |
| Repo layout | `docs/archive/CODE_STRUCTURE.md` |
| Industry patterns adopted | `docs/archive/GOOGLE_PATTERNS.md` |
| RAG module docs | `rag/README.md` |
| Dept sequencing | `Teams/<Dept>/DEPARTMENT-WORKFLOW.md` |
