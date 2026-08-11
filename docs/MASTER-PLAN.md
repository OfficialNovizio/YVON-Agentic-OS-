# MASTER PLAN — Full Chat Pipeline: CAOS · RAG · Context Injection · Local Loop

**Status:** `[active]` — updated 2026-08-09 after a full repo scan (uncommitted working tree,
live Supabase project, VPS-tracked config, task ledger) and reconciled against `docs/MASTER.md`
and `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md`, both of which changed materially today (MemPalace replacing
turbovec, belongs_to/last_worked_by auto-stamp, tiered pgvector/qdrant isolation, cross-brand
default, canonical 4-layer stack — see `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §0/§6/§18/§23 and `MASTER.md`'s
Open Issues block).
**Owner:** Engineering (dev sequencing · mia frontend · raj backend · dana pipeline · ops deploy
· quinn gate) — full roster and skills in each agent's `Teams/Engineering/<agent>/agent.md` +
`operational/`, sequencing in `Teams/Engineering/DEPARTMENT-WORKFLOW.md` (`docs/CHAT-ENGINEERING.md`
retired 2026-08-10 — frozen since 2026-08-04, never updated past TS-018; its roster table was a
convenience rollup of these same per-agent files, which stay the real source).
**Supersedes:** the 2026-08-06 version of this file (P1–P6, "next phase of work"). That plan is
**mostly built** — see §1. This version corrects the record against the real repo and adds the
work `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md`'s 2026-08-09 decisions newly require.

---

## The vision, in one sentence

When you talk to any agent in chat, YVON runs a **full, visible pipeline** — analyze your message
(what/why/how/end result/desired output) → inject the agent's real abilities + the active
venture's memory → CAOS (classify→resolve→retrieve→gate) → RAG → execute with tools → record
everything to events/graph/memory — and you can **see every stage expand**, while **quick info
questions skip the heavy stages** (but still get recorded) and everything is **tested locally
first with two URLs**. Unchanged from the 2026-08-06 version — still the right target.

---

## ⚠️ PRIORITY 0 — before anything else in this plan

**185 files are uncommitted in the working tree** (`git status --porcelain`, checked 2026-08-09),
covering nearly all of §1's "done" row below — the entire P1–P4 build plus TS-025 through TS-029.
None of it is pushed, none of it has run through the real deploy gate (`cli/verify-deploy.sh`
only runs pre-push), and none of it is backed up anywhere but this one working directory. Every
exit-gate proof in `store/tasks/TS-026..029.yaml` says **"OPERATOR-GATED: local test... before
push"** — meaning quinn's static checks passed (tsc, deploy-gate static tier, CAOS e2e 6/6), but
the *actual live behavior* has not been confirmed by a human, and TS-029 specifically still needs
its migration applied.

**This has to happen before P5 or anything below, not after:**
1. Review the 185-file diff (dashboard/app is 108 of them, dashboard/lib 24, migrations 9,
   `docs/`/`store/` doc updates, a handful of `dist/`/`rag/` artifacts worth checking for
   accidental inclusion).
2. Run the local test each exit_gate.proof already specifies (TS-026 through TS-029's proofs
   above list exactly what to click/send to confirm).
3. Commit, push, let `verify-deploy.sh` run for real at the git hook.
4. Advance TS-026/027/028/029 `gated → done` with a real (not self-asserted) exit-gate proof —
   `cli/task.sh done --proof "<evidence>"`.

Until this happens, every phase below is being built on top of unverified, unbacked-up code.

---

## 1 · Current state — verified against the repo, 2026-08-09

The 2026-08-06 version of this table was written as a forward plan ("what this plan adds"). It
undersold itself — P1 through P4 are built, just uncommitted (§ Priority 0).

| Phase | 2026-08-06 said | Verified 2026-08-09 |
|---|---|---|
| **P1 · Venture truth** | ❌ planned | ✅ **built** — `dashboard/app/api/ventures/route.ts` no longer seeds hardcoded sub-brands, returns only real DB rows + `yvon-os`; `venture-context.ts` defaults to `yvon-os` throughout (TS-026, exit_gate VERIFIED 2026-08-06) |
| **P2 · Input analysis** | ❌ planned | ✅ **built** — `dashboard/app/api/chat/input-analysis/route.ts` (TS-027/030). **Note:** implemented as **LLM-first with a light-analysis fallback**, not the deterministic-first the 2026-08-06 open decision recommended — confirm this was a deliberate change (§4 open questions) |
| **P3 · Expandable pipeline HUD** | ⚠️ partial | ✅ **built** — `dashboard/lib/pipeline.ts` carries all planned stage kinds (`analyze, context, classify, resolve, retrieve, tool, gate, loop, run, record`); `PipelineHud.tsx` renders them (TS-028) |
| **P4 · Two-tier execution (build vs info)** | ❌ planned | ✅ **built** — tier field (`build`/`info`/`generic`) flows through `pipeline.ts`; TS-029 additionally added a **third dimension** not in the original plan — message-*relation* classification (does this message relate to the active venture at all), skipping context/CAOS/RAG entirely for unrelated messages and recording them as distinct `chat.general` graph nodes |
| **P5 · Local testing loop (two URLs)** | ❌ planned | ❌ **still not built** — no `cli/local-dev.sh`, no `dashboard/app/dev-viewer/` |
| **P6 · Connection diagram** | ❌ planned | ❌ **still not built** |

**Layer status, corrected:**

| Layer | Status |
|---|---|
| Chat streaming, commands, venture selector | ✅ Live |
| Context injection (agent skills / venture memory) | ✅ Live (TS-025) |
| CAOS + RAG core | ✅ Live — `rag/core/*`, `verify-caos` 6/6, 5-gate harness wired |
| Recording (events, feedback, telemetry, plan-lock) | ✅ Live |
| Venture truth (no phantom brands) | ✅ Built, **uncommitted** |
| Input analysis (what/why/how/end/desired) | ✅ Built, **uncommitted**, engine choice unconfirmed |
| Full expandable pipeline HUD | ✅ Built, **uncommitted** |
| Info-vs-build-vs-unrelated gating | ✅ Built, **uncommitted** (exceeds original P4 scope) |
| Two-URL local dev loop | ❌ Missing |
| System connection diagram | ❌ Missing |
| Hermes runtime (cwd/write/toolset — `YVON-CHAT.md` §4) | ⚠️ **Partial** — see §2 |
| Task ledger hygiene | ⚠️ **Degraded** — see §3 |
| Graph-brain alignment (MemPalace, belongs_to, archetypes, discussion capture) | ❌ **Not started** — see §5, all `[planned]` per `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` |

---

## 2 · Hermes runtime — still the real blocker for anything touching the filesystem

Three defects, `docs/YVON-CHAT.md` §4 / `vps-scripts/hermes-patch-notes.md`. Status re-verified
against the tracked files 2026-08-09, not the live box — **I have no VPS shell access; the
diagnostic probe (`YVON-CHAT.md` Appendix A) has still never been run or its output recorded
anywhere in the repo.**

| Defect | 2026-08-04 status | Verified 2026-08-09 |
|---|---|---|
| **A — cwd fixed to wrapper's own folder** | `[built]`, unpatched | **Still unpatched.** `systemd/yvon-hermes-http.service` still has `WorkingDirectory=/opt/yvon-hermes-http`, no per-project cwd logic in `main.py` |
| **B — repo read-only to Hermes** | `[built]`, unpatched | **Still unpatched.** `ReadWritePaths=/root/.hermes /var/log /usr/local/lib/hermes-agent/logs` — no checkout paths added |
| **C — terminal toolset may not load** | `[hypothesis]`, unconfirmed | **Mitigated in code, unconfirmed live.** `main.py` now tries `AIAgent(platform="cli")`, falls back to `toolset="cli"`, then bare with a loud warning log — this ships without needing the probe first, but whether it actually resolves to a working terminal tool on the real box is still unverified |

**P7 · Hermes runtime patch — sequenced after Priority 0**
- Run the Appendix A probe on the VPS (needs operator or VPS-capable agent — not available in
  this session) and paste the output back into `vps-scripts/hermes-patch-notes.md`.
- Apply Defect A (per-project cwd, sourced from `ventures.local_repo_path`) and Defect B
  (explicit `ReadWritePaths` per checkout) per the draft diffs already written in
  `hermes-patch-notes.md` — `ProtectSystem=strict` stays, per the standing invariant.
- Confirm Defect C's runtime fallback actually lands on a working terminal tool; if it's still
  silently falling to "no toolset," the exact kwarg name needs checking against
  `/usr/local/lib/hermes-agent/` source on the box.
- Raise `terminal.timeout` above 300s — `next build` will exceed the current 180s.
- Run the kanban schema probe below in the same VPS trip — it answers §2.1's gate condition.

### 2.1 · Task orchestration — hybrid TASK-SPEC + Hermes kanban (decided 2026-08-09, condition-gated)

`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §20–21 scoped a worker pool + task queue + atomic leasing from scratch,
`[planned]`. `store/hermes-api-catalog.json` documents a Hermes-native kanban plugin
(`/api/plugins/kanban/*`, 35+ endpoints) already shipping board/task CRUD, AI decompose/specify,
worker dispatch, and run inspect/terminate — unused (`wiring_status.in_use_by_dashboard: []`).
Decision, discussed with the operator: **hybrid, not a replacement of either system.**

**Division of labor:**
- **TASK-SPEC (`store/tasks/*.yaml`) governs, unconditionally.** Gating, exit-proof (never
  self-asserted), discovery-blocking, `owns_paths`, `security_review`, the feedback→anneal
  learning loop. Hermes's kanban has no equivalent concept for any of this — none of it moves,
  regardless of what the probe below shows.
- **Hermes kanban becomes the dispatch/execution UI, conditionally.** Replaces the bespoke
  worker-pool/leasing build §20–21 scoped, *if* the schema can carry an opaque reference back to
  the real `TS-###` record. The value isn't code saved — the bespoke leasing SQL is ~50 lines
  either way (§21.2) — it's a working board/task-detail/worker-run UI that doesn't exist today
  (`SESSION-HANDOUT.md` §10: Task Board is "a static demo," Foundry sub-routes are "stubs").

**Standing rule, non-negotiable if hybrid proceeds:** `store/tasks/*.yaml` stays the only source
of truth. Hermes's kanban is a **driven mirror** — dispatch pushes a card, run status flows back,
never edited there directly as the record. Two systems both claiming to be the record is the
same failure class as `reticle` "installed but not wired" and the two-docs-disagree pattern this
whole session has been closing out — not reintroducing it here.

**Gate condition — resolves on this probe (same VPS trip as the Appendix A probe above, all GET,
read-only, nothing created or changed):**

```bash
curl -s http://127.0.0.1:9119/api/plugins/kanban/boards        | python3 -m json.tool
curl -s http://127.0.0.1:9119/api/plugins/kanban/board         | python3 -m json.tool
curl -s http://127.0.0.1:9119/api/plugins/kanban/config        | python3 -m json.tool
curl -s http://127.0.0.1:9119/api/plugins/kanban/orchestration | python3 -m json.tool
curl -s http://127.0.0.1:9119/api/plugins/kanban/profiles      | python3 -m json.tool
curl -s http://127.0.0.1:9119/api/plugins/kanban/workers/active | python3 -m json.tool
curl -s http://127.0.0.1:9119/api/plugins/kanban/stats         | python3 -m json.tool
# if any board/task already exists, one real record shows the actual task schema:
curl -s http://127.0.0.1:9119/api/plugins/kanban/tasks/<task_id> | python3 -m json.tool
```

`:9119` is loopback-only (no bearer token, CORS-restricted) — must run from the VPS itself, same
constraint as Appendix A.

```
probe confirms a task/board field can carry an opaque TS-### reference
  → proceed hybrid: kanban dispatch/board UI, TASK-SPEC stays the record (P7 continues as above)
schema too rigid to carry it
  → fall back to the bespoke worker pool system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §20-21 already scoped
```

**Status: decided in principle — condition unresolved, blocked on the same VPS probe as Defects
A/B/C above.**

### 2.2 · Toolset governance — the gate-bypass gap, and three tools needing alignment (resolved 2026-08-09)

**The gate-bypass gap.** Verified: `Teams/Engineering/SECURITY-CHARTER.md` never mentions Hermes,
and no `plan_lock`/`plan-lock` code touches the VPS runtime anywhere in `vps-scripts/`. Right now
that's accidentally safe, because Defects A/B mean Hermes's `terminal`/`file`/`code_execution`
tools can't actually touch the repo. Once A/B are patched **as originally scoped** (real cwd +
real write access to the checkout), Hermes gets a second, fully independent write path around
every rail built for the Claude-Code path — no task-state requirement, no gate, no plan-lock, no
quarantine. This has to be resolved before P7 ships, not discovered after.

**Resolution: contain, don't teach.** Don't try to make Hermes's foreign tool loop understand
quinn's plan-lock/hash model — too invasive, and it's a system YVON doesn't control the internals
of. Instead, contain the blast radius the same way `MASTER.md` §7.7 already contains everything
else: **sandbox-first.**
- Defect A's fix changes from "cwd = `ventures.local_repo_path`" to **cwd = a dedicated
  worktree/sandbox checkout** — `cli/worktree-gen.py` already exists, per-branch worktrees are
  already available (`YVON-CHAT.md` §6.4).
- Defect B's `ReadWritePaths` scopes to that worktree path only — never the primary checkout.
- Promotion from the worktree to the real branch requires an active TASK-SPEC + the existing
  exit-gate/proof machinery, same as any other change. Hermes's writes stay quarantined until
  something governed merges them.

Cheaper than it sounds — `cli/worktree-gen.py` and the sandbox-first promotion flow (§7.7) already
exist for exactly this purpose; this applies them to a new caller, not a new mechanism.

**Three tools, aligned individually — not all get the same answer:**

| Tool | Risk/overlap | Alignment decision |
|---|---|---|
| `delegation` (own sub-agent spawning, ≤50 iterations) | Looks like it could compete with CAOS's team-assignment routing | **Different layers — allow, but scope explicitly.** CAOS decides *which* of the 46 named agents handle an incoming request, upfront, before generation starts. `delegation` is a within-turn primitive for fanning out sub-work *inside* an already-dispatched turn — the same shape as `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §20.5's fan-out (`asyncio.gather`). **Rule: `delegation` must never address or invoke one of the 46 named agent identities** (it has no knowledge of `Teams/` anyway) — keep it a generic helper-call primitive, not a second routing system. Written down now so nobody later "wires delegation to pick an agent" and recreates two parallel identity systems. |
| `cronjob` (agent self-schedules recurring jobs) | Unattended, unsupervised future execution — a different risk class than one supervised turn; Rails 1/3 assume a supervised call, neither has a story for this | **Disable from the chat-facing toolset** until scheduled-agent-action gets its own governed design (a TASK-SPEC-gated feature, not raw cron access). **How** depends on whether `AIAgent` accepts an explicit tool-name allowlist (exclude just `cronjob`, keep the rest of `cli`) instead of only a platform bundle — unconfirmed, added to the probe below. |
| `computer_use` (desktop control) | Almost certainly inert — the VPS is headless, no GUI to control | **Verify, don't assume.** Added to the probe below rather than treated as a live risk. |

**Probe additions — same VPS trip as §2.1 and Defects A/B/C:**
```bash
# Does AIAgent take an explicit tool-name list (to exclude cronjob specifically) instead of
# only a platform bundle? Check the real signature on the box:
python3 -c "import inspect; from run_agent import AIAgent; print(inspect.signature(AIAgent.__init__))" 2>&1 | head -5
# (import path per store/hermes-api-catalog.json: /usr/local/lib/hermes-agent/)

# Confirm computer_use is inert on a headless box — expect an error/no-op, not a real action:
# probe session prompt: "Use computer_use to describe what's on the screen. If there's no
# display, say exactly that." — read the tool_call.end payload.
```

---

## 3 · Task ledger hygiene — a process gap, not a code gap

`cli/task.sh validate` still fails on the same 6 pre-existing TS-001-007 records it did before
(unrelated to chat). New findings specific to this scan:

- **TS-024 does not exist** — the numbering jumps 023 → 025 with no record explaining the gap.
  Either a task was abandoned before being written, or it's a numbering skip — worth a one-line
  note either way so a future session doesn't assume data loss.
- **TS-030 is referenced in code** (`dashboard/lib/pipeline.ts` comments: "Structured
  input-analysis payload (TS-030)") **but has no task record.** This is the same failure mode
  `SESSION-HANDOUT.md` §3 already diagnosed once (TS-014/015/016 shipped with no matching
  records) — recurring, not a one-off.
- **TS-026 through TS-029 are all stuck at `gated`**, not `done` — correct, since none are pushed
  yet (§ Priority 0), but worth tracking as one line item so "done" doesn't get claimed without
  the real exit-gate proof `task.sh done --proof` requires.

**P8 · Ledger hygiene** — write the TS-024 gap note, backfill a TS-030 record for the
already-shipped input-analysis persistence work, and advance TS-026-029 to `done` as part of §
Priority 0's step 4.

---

## 4 · Open questions — resolved 2026-08-10

1. **Input-analysis engine (P2).** ✅ **Resolved: keep the hybrid as built.** Re-checked the code
   (`pipelines/input-analysis/analyze.ts`) — `info` tier is already fully deterministic, zero LLM
   calls; only `build` tier calls the LLM (`analyzeBuild`), with a deterministic fallback on
   failure/bad-parse. Decision: build-tier intent extraction (why/how/end-result) isn't reliably
   pattern-matchable, and the fallback already covers LLM failure — no change needed.
2. **F1/F2 from `SESSION-HANDOUT.md`** — ✅ **Resolved: still blocked, not satisfied by TS-028.**
   Compared the two: TS-028's `PipelineHud.tsx` is a real-time **operator-facing UI** (6 sections,
   expand-to-view-steps). F1 asked for pipeline stages becoming **graphify nodes** so the *system*
   can learn from its own execution via a feedback loop into `self_improver` — a different
   mechanism for a different consumer. TS-028 built the human-visible half only. F1/F2 stay
   deferred until the graphify-node + feedback-loop half is scoped.
3. **Priority-0 commit** — ✅ **Resolved: proceed.** Reviewing the 185-file diff now, flagging
   anything that shouldn't ship, then staging a local commit. **Push still requires separate
   explicit approval** — nothing goes to a remote/deploy from this pass.
4. **MemPalace sequencing (P9)** — ✅ **Resolved: hold.** No second venture exists to validate
   tenant isolation against; sequencing schema/isolation work with nothing real to test against
   risks getting it wrong twice. P9 stays parked until a second venture is added via Settings —
   see §6 sequencing (unchanged, P9 still sits after P7/P5/P6).

---

## 5 · New work — what today's graph-docs decisions add to this plan

`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` and `MASTER.md` changed materially today (2026-08-09) — MemPalace
replacing turbovec, `belongs_to`/`last_worked_by` auto-stamp, tiered pgvector/qdrant isolation,
the confirmed cross-brand default, archetype-based retrieval, discussion capture. None of this
was in scope when the original P1–P6 plan was written. It's genuinely new work, not a correction.

### P9 · MemPalace wiring for chat's context injection

`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §6 settles the episodic/semantic backend as MemPalace on `pgvector`
(shared namespace for Master + owned brands, schema-per-tenant for clients — Issue 6). Chat's
context injection (TS-025, `/api/chat/context`) currently reads agent skills / venture memory
directly — once MemPalace lands, this becomes the injection point that reads from MemPalace wings
instead. **Structural work only for now** (backend choice, schema, wing/room/drawer conventions)
— nothing to validate against live isolation until a second venture exists (open question 4).

### P10 · `belongs_to` / `last_worked_by` on chat-produced nodes

Per Issue 3's resolution (`MASTER.md` §6, `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §0 Principle 6): any node chat
produces (a message, a task, a decision) should be auto-stamped with its producing/last-touching
agent at write time — this is a small, mechanical addition to wherever chat writes into
`events`/task records, not a new subsystem. Natural to build alongside P9's wiring since both
touch the same write path.

### P11 · Cross-brand default in `/switch`

Per Issue 5's resolution: once more than one owned brand exists, `/switch`'s Part 2 (agent
context) should give always-on, read-only, attributed access to sibling owned brands — not gated
behind detecting a cross-brand mention. **Not actionable today** — P1 confirmed only `yvon-os` is
real; this activates the day a second owned brand is added via Settings. Recorded here so it
isn't rediscovered as a surprise later.

### P12 · Archetype-based retrieval for chat's CAOS path

`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §14 defines seven task archetypes (shallow lookup, precision-critical,
deep exploration, synthesis, creative production, continuous monitoring, adversarial testing),
each with a different retrieval shape. Chat's RETRIEVE step currently treats every message the
same (modulo P4's build/info/general tiering, which is a coarser cut). Once archetype
classification exists, RETRIEVE can route narrow vs. wide vs. distant recall per archetype instead
of one shape for everything — this is the natural next refinement past P4, not a replacement for
it.

### P13 · Discussion Capture — chat's own architecture conversations become graph nodes

`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §16.3/§15.3: architecture discussions become queryable `Decision` nodes
(scope `meta:architecture`) instead of being lost in chat scrollback. **This session is a working
example of exactly that gap** — every resolution recorded in `MASTER.md`'s Open Issues block today
happened in a chat conversation with no structured record beyond the doc edits themselves. Once
built, a conversation like this one would write a queryable Decision node per resolved issue,
answerable later without re-deriving from doc diffs.

---

## 6 · Sequencing

```
PRIORITY 0  Commit + verify the 185-file diff, advance TS-026-029 to done   ← do this first, no exceptions
     │
     ▼
P8   Task ledger hygiene (TS-024 note, TS-030 backfill)                     ← cheap, do alongside P0
     │
     ▼
P7   Hermes runtime patch (probe → Defect A/B fix, confirm C)               ← needs VPS access
     │    + §2.1 kanban schema probe → resolves hybrid task-orchestration
     │      gate condition (same VPS trip)
     ▼
P5   Local testing loop (two URLs)                                          ← unblocks safe iteration on P9-P13
     │
     ▼
P6   Connection diagram                                                     ← cheap, do alongside P5
     │
     ▼
P9   MemPalace wiring (structural)  ──┬── P10 belongs_to/last_worked_by     ← same write path, same PR
     │                                │
     ▼                                ▼
P12  Archetype-based retrieval    P13  Discussion Capture
     │
     ▼
P11  Cross-brand default in /switch                                        ← activates when brand #2 exists
```

**Each phase:** build → local test (per its own exit-gate proof) → you approve → next. Recording
stays universal throughout — no phase changes what gets saved, only what pipeline depth runs or
what gets wired to write into. Nothing here is deployed until you approve each step.

---

*This is the working plan as of 2026-08-09. Sources: `docs/YVON-CHAT.md`,
`docs/MASTER.md` (Open Issues block + §6), `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` (§0, §6, §14, §16.3, §18,
§23), `docs/SESSION-HANDOUT.md` §2a/§8 F1-F2, `store/tasks/TS-018..029.yaml`,
`vps-scripts/hermes-patch-notes.md`, `vps-scripts/yvon-hermes-http/main.py`, live Supabase project
`cjjllgexiecesgwenpph` (`list_migrations`, confirmed 001-107 applied), `git status --porcelain`
(185 uncommitted files, checked 2026-08-09).*
