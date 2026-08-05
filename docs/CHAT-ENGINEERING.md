# CHAT-ENGINEERING — The Engineering Team, Their Skills & Tools, and the CAOS Workflow

**Governs:** how `/chat` drives the Engineering department — the command surface
operators use, the 11 agents who build under it, and the workflow design (CAOS)
that orchestrates every request. Chat's own runtime doc is `docs/YVON-CHAT.md`;
this doc covers the *team* and the *pipeline* — the two halves the chat layer
sits on top of.
**Companions:** `docs/YVON-CHAT.md` (command layer, Hermes runtime, pipeline
panel) · `docs/MASTER.md` (the workflow design, PART 0 §3, PART 2, PART 6–8)
· `Teams/Engineering/DEPARTMENT-WORKFLOW.md` (sequencing) ·
`Teams/Engineering/SECURITY-CHARTER.md` (the four rails).

**Goal:** an operator inside `/chat` knows exactly which agent does what, with
which skills and tools, under which gates — and how the request flows through
CLASSIFY → RESOLVE → RETRIEVE → GATE before anything is built.

Verified against the repo on **2026-08-04** (post TS-018 rollout build).
Status markers: `[built]` verified present · `[partial]` started ·
`[planned]` no code yet · `[hypothesis]` needs a live check before acting.

---

## Table of Contents

- [1 · The command surface](#1--the-command-surface)
- [2 · The engineering team](#2--the-engineering-team)
- [3 · Department workflow — chat to gate](#3--department-workflow--chat-to-gate)
- [4 · The CAOS workflow design (from MASTER.md)](#4--the-caos-workflow-design-from-mastermd)
- [5 · What chat observes today vs what is probe-gated](#5--what-chat-observes-today-vs-what-is-probe-gated)
- [6 · Current state vs remaining work](#6--current-state-vs-remaining-work)
- [7 · Invariants](#7--invariants)
- [Sources](#sources)

---

## 1 · The command surface

`/chat` is the command layer: a deterministic action is never a model decision
(YVON-CHAT §2.2). Commands dispatch in `POST /api/chat/send` **before** any
insert; an unknown command is an error with a suggestion, never a fallthrough;
results persist as `author_kind='system'` messages, are audited in
`chat_command_log`, and emit `command.run` events with the turn's correlation.
Registry: `dashboard/lib/commands/` · contract: `types.ts` · dispatch:
`registry.ts` (edit distance ≤ 2 suggestion on typo).

| Command | Does | Confirm | Status |
|---|---|---|---|
| `/help` | lists commands, generated from the registry | — | `[built]` |
| `/switch <slug>` | venture scope cookie + agent context (parts 1–2); reports parts 3–4 honestly | — | `[built]` (1–2) |
| `/where` | prints active venture, workspace, Hermes cwd, project root | — | `[built]` |
| `/clear` | drops the pooled Hermes session for this room (`/v1/pool/drop`) | — | `[built]` |
| `/confirm <token>` | executes a pending confirm command (token bound to user+room+cmd+args, 10-min expiry, single-use) | — | `[built]` |
| `/deploy [--full]` | runs the deploy pipeline; executor-gated (`YVON_DEPLOY_EXECUTOR`) | **yes** | `[built]` / executor `[planned]` |
| `/preview [branch]` | pushes branch → Vercel preview URL | **yes** | `[built]` / harness `[planned]` |

Supabase foundation (migration `106_chat_commands.sql`, `[built]` code —
requires `supabase db push`): `message_author_kind` gains `'system'`;
`chat_command_log` (append-only audit); `chat_command_tokens` (confirm store,
hash-only); `chat_messages.correlation` (turn → events link);
`chat_insert_system_message()` + `chat_emit_command_event()` security-definer
writers; direct inserts of `author_kind='system'` are rejected by policy.

---

## 2 · The engineering team

Eleven agents. Department leader **dev** writes the law; **quinn** gates and
**ops** ships under it; **aegis**/**cypher** secure it; the builders
(**raj, mia, nova, dana, axiom**) implement; **rank** keeps it findable.
Every agent's authority and prohibitions come from its
`Teams/Engineering/<agent>/agent.md` + `operational/` files — this table is a
pointer, not a replacement.

### Build pod

| Agent | Role | Skills | Tools | Commands | Handoffs |
|---|---|---|---|---|---|
| **raj** | Backend & APIs | api-standards · service-patterns · data-access-discipline · backend-observability · api-design-principles (marketplace) | code write (review+gate), datastore READ, queue/telemetry | `/raj-api` `/raj-service` `/raj-data` `/raj-observe` | → mia's clients, ops's telemetry; ← axiom, dana; auth → aegis |
| **mia** | Frontend Web | design-tokens (atlas bridge) · impeccable-design (`/impeccable` CLI, 46 detectors) · ui-accessibility-standards (WCAG AA) · frontend-verification (Agentation + quinn Playwright) · frontend-performance (CWV) | Next.js (App Router), atlas tokens, Agentation, `npm run test:e2e` | `/mia-tokens` `/mia-ui` `/mia-verify` `/mia-perf` | ← raj's contracts, atlas's kit; → quinn's browser gate; CWV shared with rank |
| **nova** | Mobile (dormant by default — `mobile_active=false`) | mobile-app-architecture · offline-sync-discipline · mobile-verification · app-store-release-discipline | real devices both OSes; simulator never the verdict | `/nova-arch` `/nova-sync` `/nova-verify` `/nova-release` | ← raj's API, dana's model; → quinn; own conservative release cadence |

### Design pod

| Agent | Role | Skills | Tools | Commands | Handoffs |
|---|---|---|---|---|---|
| **dana** | Data Architecture | datastore-selection (+HelixDB) · data-modeling · db-performance · migration-discipline · database-migrations (marketplace) | datastore READ; writes via operator-run scripts (Rail 3) | `/dana-store` `/dana-model` `/dana-perf` `/dana-migrate` | → raj's contracts, ops's deploys; ← axiom; **never executes a data change** |
| **axiom** | Algorithms & DSA | dsa-design-records · complexity-analysis · performance-profiling · algorithm-review | profiling (measure-only) | `/axiom-dsr` `/axiom-complexity` `/axiom-profile` `/axiom-review` | → raj/dana advisory; dev routes algorithm-heavy diffs; never writes code |

### Quality, release & security pod

| Agent | Role | Skills | Tools | Commands | Handoffs |
|---|---|---|---|---|---|
| **quinn** | QA — the blocking gate | charter-enforcement (Rails 1–3) · test-strategy · regression-map · browser-verification · webapp-testing (Playwright live harness) · eval-harness (marketplace) · exploratory-qa (Shared OS browser-use) | Playwright (Chromium/FF/WebKit), Reticle, hashing, append-only registries; no code write, no DB | `/quinn-lock` `/quinn-gate` `/quinn-map` `/quinn-verify` | blocks; never builds; ← every builder; → ops |
| **ops** | DevOps & Reliability | release-discipline (rollback-exercised-first) · incident-response (blameless post-mortems) · maintenance-hygiene · platform-playbooks · deployment-patterns (marketplace) + OpenSandbox runtime (Shared OS) | systemd, infra, sandbox provisioning | `/ops-deploy` `/ops-incident` `/ops-hygiene` `/ops-playbook` | ships only on quinn GATE PASS + tested rollback; never deploys without it, mid-incident included |
| **aegis** | App Security (defense) | threat-model (marketplace, verbatim) · vuln-pipeline · secure-code-review (primary teeth: authz-per-object, taint-to-sink, LLM/agent classes) · verified-patching (four checks) | static + web/LLM detection; execution only in quinn's sandbox (Rail 2) | `/aegis-threats` `/aegis-scan` `/aegis-review` `/aegis-patch` | verdicts → quinn's S-tier gate; fixes route owner+quinn; never attacks (that's cypher) |
| **cypher** | Adversary (offense, caged — dormant until the operator signs the red-team scope, Rail 4) | caged-scope (three gates, all-or-halt) · attack-playbooks (OWASP Web 10 + LLM 2025) · continuous-attack-loop · findings-report | in-sandbox only; findings to quinn only | `/cypher-scope` `/cypher-attack` `/cypher-loop` `/cypher-report` | → quinn (sole intake) → aegis fixes → cypher re-attack = "can't re-break" |

### Law & discovery

| Agent | Role | Skills | Tools | Commands | Handoffs |
|---|---|---|---|---|---|
| **dev** | Lead — the law-writer | architecture-decisions (ADR ledger) · stack-profile · code-review-standards (integrity → correctness → security → tests → style) · delivery-governance (DoD, Rail 1 execution-plan artifact) · git-workflow-and-versioning (marketplace) | documents + reviews only; never runs data changes | `/dev-adr` `/dev-stack` `/dev-review` `/dev-done` | routes diffs → aegis/axiom; done = full DoD gate (review + quinn + ops rollback + charter-clean) |
| **rank** | Technical SEO | seo-ownership-boundary (kai = strategy, rank = execution) · technical-seo-execution · structured-data-geo · claude-seo-integration (plugin wrapper) | rendered-page audits (browser-use), claude-seo plugin; never auto-edits | `/rank-boundary` `/rank-technical` `/rank-schema` `/rank-seo` | specs → mia (frontend) / raj (server) → dev → quinn; CWV shared |

**Shared OS layer (all agents, inherited):** `verification-before-completion`
(no claim without fresh evidence), `browser-use`, OpenSandbox, the 5-gate
harness, progressive skill disclosure (~40–60% context savings).

**The Security Charter is senior to every agent** — four rails, operator-owned,
never waived by an agent: ① plan-lock (quinn freezes + hashes plans before
external calls) · ② sandbox + egress-allowlist (fails closed) · ③ no agent
destructive DB ops (dana authors scripts, the operator runs them — not
configurable) · ④ caged adversary (cypher attacks only signed, in-sandbox,
findings to quinn only).

---

## 3 · Department workflow — chat to gate

How a request that lands in `/chat` moves through Engineering
(`Teams/Engineering/DEPARTMENT-WORKFLOW.md`; chat-facing status is observable
in the pipeline panel — see §5):

1. **Plan-lock (Rail 1)** — the acting agent writes an execution plan
   (dev's delivery-governance artifact); quinn validates, hashes, locks it;
   unbounded plans returned. Every call runs sandboxed (Rail 2).
2. **Design** — load-bearing algorithm choices → axiom DSA records; store/schema
   → dana ADRs + models, reviewed by consumers (raj/mia).
3. **Build** — raj (backend), mia (frontend), nova (mobile, if active);
   destructive/schema changes are NOT executed — dana authors reversible
   scripts, the operator runs them (Rail 3).
4. **Review (dev)** — fixed order integrity → correctness → security → tests →
   style; risky diffs → aegis; algorithm-heavy → axiom.
5. **Gate (quinn)** — two independent verdicts: quality (test tiers by change
   type, targeted regression from the fragile-areas map, browser evidence) AND
   security (charter compliance). Either blocks alone. Evidence, not claims.
6. **Ship (ops)** — only on GATE PASS, rollback-exercised-first, monitored.
7. **Incident loop** — breaks → restore first (charter holds mid-incident) →
   blameless post-mortem → feeds quinn's regression map + dev's ADRs.
8. **Attack continuously** — cypher (signed scope only) → findings → aegis
   four-check fixes → re-attack to confirm. A rail that bends reaches the
   operator.
9. **Maintain** — ops hygiene (deps, restore-tested backups, dated baselines);
   rank keeps the site discoverable, specing fixes through the gate.
10. **Escalate upward** — rail violations halt + escalate; floor/threshold
    disputes and charter amendments are operator-only; unfilled configs → the
    most-restrictive reading, stated aloud.

---

## 4 · The CAOS workflow design (from MASTER.md)

**Terminology note:** "CIAOS" does not appear anywhere in the repo — this was
grep-verified across `docs/MASTER.md` and the tree. The canonical workflow is
**CAOS** — *Context-Aware Orchestration System* (MASTER.md:1025), defined at
MASTER.md:270 as **Context-Aware Orchestration: CLASSIFY → RESOLVE → RETRIEVE
→ GATE**. `docs/YVON-CHAT.md` Appendix C #4 (open decision) is resolved: CAOS,
as documented here. (If a doc or person says "CIAOS", ask for the expansion —
it is not defined anywhere in this repo.)

### 4.1 The micro flow (MASTER.md:232)

```
message → TASK-SPEC → CAOS retrieval → 5-gate harness → strategy routing
→ compression → LLM trio → post-hoc verification → response
```

### 4.2 The four CAOS steps (MASTER.md:272–303)

| Step | What happens | Implementation | State |
|---|---|---|---|
| **CLASSIFY** | domain keywords → task_type + agent_id; progressive disclosure loads 2–3 triggered skills full, the rest as ~8-token summaries (40–60% context savings) | `src/cie/classifier.ts` + `rag/harness/disclosure.py` | `[built]` |
| **RESOLVE** | retrieval + formula execution: query rewrite (≤5 queries) → hybrid dense (MiniLM-L6-v2) + sparse (BM25) → cross-encoder re-rank (top-20 → top-5); computed facts come from `Teams/Shared OS/logical/` scripts — exact values are *computed*, never estimated | `rag/core/bridge.py` (subprocess of `src/cie/rag-bridge.ts`), `retriever.py`, `optimizer.py` | `[built]` |
| **RETRIEVE** | the retrieval itself (step 3.2 above) feeds the gate step | — | `[built]` |
| **GATE** | the 5-gate harness, in fixed order (below) | `rag/harness/gates.py` via `unified_pipeline.inject_with_harness()` | `[built]` |

### 4.3 The 5-gate harness (MASTER.md:1236–1322, PART 2)

1. **Source authentication** — every chunk: source_file exists (else
   QUARANTINE), hash matches (else FLAG), book citations traceable to
   `Teams/Books/`, within the agent's authorized depts (else BLOCK).
2. **Reliability scoring** — `reliability = freshness × authority × quality`;
   7-level authority map (1.0 verified book → 0.2 unknown); thresholds 0.15
   (T1) / 0.10 (T2), below → QUARANTINE. Worked example in the doc: junk 0.03
   vs book 0.81 — 948× separation.
3. **Conflict detection** — pairwise embedding cosine similarity > 0.7 +
   negation → CONTRADICTION; same source different version → VERSION CONFLICT;
   principle vs specific override → DOMAIN CONFLICT. Conflicts are injected as
   ⚠️ blocks into context, **never resolved silently**.
4. **Priority-based budget enforcement** — assembly order P0 (system prompt:
   agent identity + principles) → P1 (active skills) → P2 (computed facts) →
   P3 (load-bearing T1) → P4 (structural T2) → P5 (adversarial chunk) → P6
   (supplementary T3) → P7 (inactive skill summaries). Budget exhausted →
   remaining levels DROPPED.
5. **Quarantine & recovery** — low-reliability chunks logged to
   `quarantine.jsonl`, operator notified if previously T1; recovery pass
   re-scans dropped chunks and pulls them back above the recovery threshold.

Gates never degrade silently: *"Degrading loudly beats improvising"*
(MASTER.md PART 2). After the gates: strategy routing FAST / BALANCE / QUALITY
(compression via `injector.py`), then generation with the **LLM trio**
(hermes+claude reasoning · deepseek adversarial · chatgpt creative QC), then
post-hoc verification (`rag/verify/`; high-stakes + low score → delegated to
quinn/precedent/sentinel).

### 4.4 TASK-SPEC — the work record (MASTER.md PART 6, lines 3687–3741)

Every request becomes a TASK-SPEC (`store/tasks/TS-###.yaml`), with lifecycle
`draft → discovery → approved → executing → gated → done` — each transition
has required fields (source_message verbatim; discovery.decisions; approved_by
+ approved_at; work_items with owner + acceptance; produces paths on disk;
exit_gate.proof that is **not a self-assertion**). Validator:
`cli/task.sh validate` (exit 1 on bad record). Sharding: a worker receives only
its work item + consumed contracts; handoffs are contracts-only. Exit-gate
motto: *"Agents say done; browsers tell the truth."*

### 4.5 The master tree + scenarios (MASTER.md PART 7)

STEP 0 ingress (meta/task-dispatch; GATE 0 change-management RFC with 4-team
sign-off) → STEP 1 CIE (classifier → progressive disclosure → cache-augmented
generation with LRU `(agent_id, source_hash)` → graph resolve: codegraph,
graphify, hermes-memory) → STEP 2 RAG + harness (5 gates, GRAPH-PINNED chunks
exempt from destructive compression, FACT-DIFF gate) → STEP 3 strategy +
injection → STEP 4 generation + verification → STEP 5 exit gate + feedback
(the dissatisfaction loop, max 2 automated revisions then human-in-the-loop).

Execution scenarios A–E: **A** coding task (sandbox write → test pyramid with
Playwright gate → aegis → dev review → merge + exit gate) · **B** product
feature (PRD phase mandatory → design → build → verify → ship) · **C**
dissatisfaction loop (quality scores feed Gate 2 next time; strategy
escalation FAST→BALANCE→QUALITY) · **D** skill/script failure (fallback
matrix, telemetry, self_improver 6-phase) · **E** multiple agents in parallel
(disjoint owns_paths, sharding, contracts-only, one exit gate on the
integrated result). Sandbox-first promotion: Tier-1 process box
(`cli/quarantine.sh`) → Tier-2 container; *"the sandbox is where things are
proven; the repo is where proven things live."*

### 4.6 Enforcement (MASTER.md PART 8)

*A rule with a checker is a rail. A rule in prose is a suggestion.*
(MASTER.md:4203). Enforcement is the transition conditions above (`task.sh`
state machine), the deploy gate (`verify-deploy.sh`, 8 static checks + `--full`
tier), the CAOS end-to-end check (`cli/verify-caos.py --quick`), and the
planned write gate (PreToolUse hook blocking writes outside `work_items
[].owns_paths`). A gate that is installed but not wired to a blocking point
does not exist.

---

## 5 · What chat observes today vs what is probe-gated

The pipeline panel (`dashboard/app/chat/ContextPanel.tsx` + `lib/pipeline.ts`)
renders the CAOS flow live: one renderer, two sources — SSE for the in-flight
turn, the `events` table for any past turn (linked via
`chat_messages.correlation`, one indexed query per turn).

| Kind | Emitted by | Status |
|---|---|---|
| `run.started / completed / failed` | Hermes wrapper (`main.py` → `events.py`) | `[built]` |
| `phase.classify` / `phase.resolve` | wrapper — real input facts (intent, targets, workspace) | `[built]` |
| `tool.call` | wrapper — tool, ok, ms from its own tool callbacks | `[built]` |
| `command.run` | dashboard (definer writer, migration 106) | `[built]` |
| `phase.retrieve` / `gate.passed` / `gate.blocked` / `loop.iteration` | **reserved** — classification, retrieval and gates happen inside hermes-agent, invisible to the wrapper; emitted once hermes-agent exposes phase hooks | `[planned]` probe-gated |

A phase the wrapper cannot observe is never fabricated — the vocabulary is
documented in `vps-scripts/yvon-hermes-http/events.py`.

---

## 6 · Current state vs remaining work

### Built (TS-018, 2026-08-04)

| Thing | Evidence |
|---|---|
| Command registry + dispatch | `dashboard/lib/commands/*` (7 commands), `send/route.ts` command path before insert |
| Confirm-token flow | `confirm-tokens.ts` (sha256 store, 10-min expiry, single-use, (user, room, cmd, args) binding) |
| Supabase foundation | `migrations/106_chat_commands.sql` (needs `supabase db push`) |
| `/switch` parts 1–2 | cookie set + `stream/route.ts` reads it; `events.context_id` follows the venture |
| Shell full-bleed scroll fix | `Shell.tsx` full-bleed mode + `chat/page.tsx` `h-full min-h-0`; `dvh` + safe-area on mobile |
| Phase events (wrapper-observable) | `events.py` vocabulary + `main.py` emissions with correlation |
| Pipeline panel | `ContextPanel.tsx` + `lib/pipeline.ts` (live + past, same renderer) |
| Deploy gate `--full` tier | `verify-deploy.sh --full` (next build + Playwright smoke); tier-1 unchanged |
| Hermes patch plan | `vps-scripts/hermes-patch-notes.md` — probe-gated, not applied |

### Partial / planned

| Thing | Missing |
|---|---|
| Hermes cwd + write access + toolset (defects A–C) | `[planned]` — blocked on Appendix A probe output (WI-0) |
| `/deploy` / `/preview` executors | commands `[built]`, executors `[planned]` (Appendix C #6) |
| `phase.retrieve` / `gate.*` / `loop.iteration` | `[planned]` — needs hermes-agent phase hooks |
| Migration 106 applied | code `[built]` — requires `supabase db push` + verify |
| Agent-reply author forgery gap | pre-existing: any authenticated user can write `author_kind='agent'`; close with a service-role write path (documented in migration 106) |
| Playwright in the gate | `--full` tier `[built]`; pre-push hook still tier-1 only (by design, §6.3) |

---

## 7 · Invariants

- **A deterministic action is never a model decision** (YVON-CHAT §2.2); unknown
  commands error, never fall through.
- **A command reports what it actually did** — partial switch is reported as
  partial (§8.2).
- **The Security Charter is senior to every agent and every doc in this repo.**
- **Rail 3 is not configurable** — dana authors, the operator runs.
- **No global `chdir()` in a pooled multi-session process. Ever.** (§8.3)
- **`ProtectSystem=strict` stays; scope widens by explicit `ReadWritePaths` only.**
- **A gate that is installed but not wired to a blocking point does not exist.**
- **Telemetry cannot break a turn** — fire-and-forget, exceptions swallowed.
- **A phase the wrapper cannot observe is never fabricated** — vocabulary is
  documented, emission is gated on real hooks.

---

## Sources

Verified against (2026-08-04): `docs/MASTER.md` (lines 213–307, 1236–1322,
3687–3741, 3745–4175, 4177–4380 — quoted sections) · `Teams/Engineering/`
agent.md + operational/commands for all 11 agents ·
`Teams/Engineering/DEPARTMENT-WORKFLOW.md` · `Teams/Engineering/SECURITY-CHARTER.md` ·
`docs/YVON-CHAT.md` §2–§8 · `dashboard/lib/commands/*` ·
`dashboard/supabase/migrations/106_chat_commands.sql` ·
`vps-scripts/yvon-hermes-http/{main.py,events.py}` ·
`vps-scripts/hermes-patch-notes.md` · `cli/verify-deploy.sh`.
