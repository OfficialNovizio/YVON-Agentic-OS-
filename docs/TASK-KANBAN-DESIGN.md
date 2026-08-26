# Task Kanban — Workflow & System Design

**Status: design (2026-08-25). Nothing here is built beyond what the "Ground truth" section cites.**
**Scope: how work enters the kanban, moves through it, gets executed by agents, and closes — including recurring/system tasks (the graph rebuild).**

---

## 1. Purpose & principles

The kanban is not a to-do list — it is the engine's **execution pipeline**. Every unit of work in the system is a task record, and the board is the visible state of that pipeline. Principles:

1. **Everything is a task.** A user request, a recurring rebuild, an agent's follow-up — all land as task records in `store/tasks/`. There is no work outside the kanban.
2. **Agents move the cards, not humans.** The operator approves and reviews; agents claim, execute, verify, and close. The executor loop (new, §6) is what makes this true.
3. **The board tells the truth.** Every column maps to a real state in the record. Nothing is shown as done that isn't (`feedback-verify-before-claiming`).
4. **Lineage is preserved.** Every task records where it came from (`derived_from`, `revision_of`) — the board can render the whole chain.
5. **The system feeds itself.** Recurring work (graph rebuilds, staleness sweeps, health checks) is scheduled inside the task system itself — not as external cron jobs.

---

## 2. Ground truth — what exists today (verified 2026-08-25)

| Piece | Where | State |
|---|---|---|
| Task state machine (CLI) | `cli/task.py` | Built. Transitions: `draft → discovery → approved → executing → gated → review → done`; blocked sidecar; acceptance statuses; roles; handoff; suite/run records |
| Task record template | `store/tasks/TEMPLATE.yaml` (v3, 2026-08-24) | Built. Fields: id, status, classification, discovery, work_items (acceptance/roles), dag, exit_gate, feedback, created/updated_at, revision_of, derived_from, superseded_by, blocked, run_ref, history, handoff, prd_ref/rice_score, design-origin |
| Intake inbox | `store/tasks/.pending/<uuid>.json` | Built. PRD-gated records from `meta/task-dispatch` (id/title/summary/prd/riceScore) wait here before activation |
| Board UI | `dashboard/app/chat/TasksPanel.tsx`, `TaskFocusView.tsx`, `/tasks` lineage page, `dashboard/lib/task-theme.ts` | Built. By-request grouping, all-records flat view, focus view with acceptance/handoff/design preview |
| Demo chain | TS-042…TS-047 seeded records | Built (demo only) |
| **Scheduler** (marks tasks due) | — | **Missing** |
| **Executor** (agent picks up + runs + closes) | — | **Missing** |
| **Recurrence** (task record field + semantics) | — | **Missing** |
| **Chat → task** (proposal event → record) | seed script only | Partial — demo seeding exists, live wiring missing |

---

## 3. The kanban model

### 3.1 Columns = the state machine

| Column (board) | Record state | Meaning | Who moves it |
|---|---|---|---|
| Backlog | `draft` | Idea captured, not yet shaped | operator / meta |
| Discovery | `discovery` | Questions + decisions being resolved (blocking) | meta → operator sign-off |
| Ready | `approved` | Shaped, PRD-gated, DAG signed off, awaiting pickup | meta (after operator approve) |
| Doing | `executing` | An agent owns it and is working it | executor agent |
| Review | `gated` → `review` | Work complete, verifier's suite runs; acceptance statuses per criterion | verifier (quinn-style agent or the suite) |
| Done | `done` | Suite passed, run_ref recorded, exit proof on disk | suite |
| (sidecar) | `blocked: true` | Frozen for a reason — status field unchanged; can be blocked AND executing | any actor with the reason |

### 3.2 The blocked sidecar

`blocked: true` + `blocked_at` + `blocked_reason` never empty. The card stays in its current column but is rendered with a blocker badge. Unblocking restores the exact prior state — no state machine re-entry needed. (This is how "waiting on the operator for a decision" is represented without inventing a column.)

### 3.3 Acceptance is per-criterion

Each work item carries `acceptance:` entries with `status: pass|fail|not_run|pending|deferred` + `evidence`. A card may be "done" only when every criterion is `pass` with evidence. Flat-string legacy criteria parse as `pending`.

---

## 4. Intake — how work enters the kanban

Five paths, all converging on the same record format:

### A. Operator command
`task.sh new` creates a record directly in `draft`. Used for anything the operator types.

### B. PRD inbox (design-first)
`meta/task-dispatch` writes a `.pending/<uuid>.json` record (title, summary, PRD markdown, RICE score) — the card sits in the intake inbox column. Activation (`task.sh new --prd`) converts it to a full TASK-SPEC record with `prd_ref` + `rice_score` set. **`approve` refuses without both** — the PRD gate is mechanical.

### C. Chat → proposal → task (decision: work-shaped chat moves to the kanban)
A user message in chat goes through classification; if it shapes as a work request, a **proposal event** is emitted (demo-seeded; the dashboard already renders proposal cards). When the operator accepts the proposal, a task record is created with `source_message` set verbatim.

**Decision (2026-08-25): every work-shaped chat exchange becomes a card on the kanban. Chat is the front door, not a second board.** Justification:

1. **One source of truth.** If chat tasks live only in chat and board tasks only on the board, we have two boards again — the same trap as the hermes-api vs store/tasks split (§12). A single record store with multiple views is the only design that stays truthful.
2. **Lifecycle outlives the conversation.** A request runs draft → discovery → approved → executing → review → done. The chat thread is live while the conversation is fresh; a week later the card still needs a visible, claimable, verifiable home. The board is the durable view; chat is the ephemeral one.
3. **Agents need a claim queue.** An approved card waits in Ready until an agent picks it up. Chat cannot represent "awaiting pickup" — the board can.
4. **Lineage grouping already bridges them.** The `/tasks` "by request" view groups records by their root — which is the chat-thread view, derived from the store. "Chat task" as a grouping already exists on the board.
5. **The filter is classification, not location.** Informational exchanges (questions, quick facts, conversations) never become cards — only work-shaped items (build/research/design/restructure per the routing table) do. So chat does not flood the board; it feeds it exactly the work.

Converse: the alternative (chat tasks stay in chat) fails because agent execution needs a durable queue, a task's states outlive its thread, and the operator ends up with two places to look for "what's open."

### D. Agent handoff / derived work
While executing, an agent may create a child task with `derived_from: <parent-id>` (a different goal made possible by this one) or `revision_of: <id>` (a redo of the same goal — which auto-marks the parent `superseded_by`). This is how the lineage board gets its chains.

### E. Recurring / system tasks (NEW — §7)
The scheduler creates (or marks due) tasks from **task templates** — e.g., the nightly venture-graph rebuild. No human ever touches it. This is the "Kanban of Hermes" property: the system's own maintenance is visible on the board like any other work.

### Intake invariants
- `source_message` is verbatim when a message exists — never paraphrased.
- Discovery is blocking: no fan-out past `discovery` until `discovery.questions/decisions` are resolved.
- Every task has one `classification.lead` (the owning agent per the routing table).

---

## 5. The lifecycle — transitions and gates

```
draft ──discover──▶ discovery ──approve (PRD gate, decisions, gate_0 signoffs)──▶ approved
approved ──start (owner set)──▶ executing ──gate (produces exist on disk)──▶ gated
gated ──review──▶ review ──suite──▶ pass → done  |  fail → stays review
any state ◀──block / unblock──▶ (sidecar)
```

Enforcement notes (from MASTER PART 8 — mechanical, not advisory):
- `gate` requires every `produces` path to exist on disk — "the code is there" is not enough, the artifact must be verifiable.
- `done` requires a `run_ref` — a suite run record, not prose. Empty or self-asserting proof is rejected.
- `updated_at` stamps every transition; `history[]` appends `{ts, actor, event, note}` — the record is a trail, not a snapshot.

---

## 6. The executor loop (NEW — the missing heart)

This is the piece that makes the kanban agentic. Three parts:

### 6.1 The heartbeat (scheduler)
A small loop that runs **inside the engine** (on the VPS next to hermes-agent — not Vercel, not crontab):

```
every N minutes:
  for each task record in (approved | due):
    if recurrence due (or created > 0 minutes ago):
      → move/keep in Ready, stamp due_at
  for each due recurring template:
    → derive a child task record (derived_from: template parent)
  → emit board events (due, needs_pickup)
```

- Single process, single writer (file lock on `store/tasks/` during mutation — the store is flat files today; the heartbeat serializes with `task.sh`).
- The heartbeat is itself a task-managed thing: its health is a recurring task (dogfooding).

### 6.2 Claiming
When a card enters `Ready` (or is due), an executor agent claims it:
- Routing: `classification.lead` + `departments` decide the owning agent (same table as the routing rail).
- Claim = `start` with `owner` set. Two claims on one card: rejected — the record's `owner` is the lock.
- Unclaimed cards age visibly on the board (staleness via `updated_at`).

### 6.3 Execution — the task-executor skill
The agent runs the card through a shared skill: `Teams/Shared OS/skills/task-executor/SKILL.md` (NEW). The skill defines the run protocol:

1. **Read the card** — work item, acceptance criteria, consumes, owns_paths, skills, scripts.
2. **Resolve discovery** — if `discovery.questions` are non-empty and undecided, the agent must NOT fan out; it raises the question back (blocked sidecar) and waits. (§0.1-style: questions before building.)
3. **Execute** — one work item at a time, per its `strategy` budget (FAST/BALANCE), using `skills` + `scripts` from the record.
4. **Prove** — every `acceptance` criterion updated to `pass`/`fail` with evidence (`set-acceptance`); every `produces` path written.
5. **Hand over** — write the handoff packet (`set-handoff`: entry/contract/stubbed/needs_wiring/tokens/verified_on) while context is live; `gate`.
6. **Verify** — the verifier (per work item's `verifier` role, or the suite) runs; `suite` decides pass/fail; `done` only on pass with run_ref.
7. **Report** — the run record is the exit proof; the card's history carries the trail.

### 6.4 Failure handling
- Card fails verification → stays in `review` with `suite_failed`; owner fixes or requests `revision_of` — forward-only rotation.
- Agent dies mid-run (SSH drop, wrapper restart) → the run was **detached and logged** (same lesson as the graph saga); the card stays `executing` with the run log path in its history; the heartbeat notices staleness and re-queues with a `revision_of` note.

---

## 7. Recurring tasks (NEW)

### 7.1 Record semantics
A recurring task is a **template parent** record (status: `draft`-style, `task_type: recurring`) carrying:

```yaml
id: TS-REC-001
status: draft          # template parent — never executes itself
task_type: recurring
recurrence:
  cadence: daily       # daily | hourly | weekly | interval
  interval: 1
  at: "03:00"          # for daily/weekly
  next_due: "2026-08-26T03:00:00Z"
  template: venture-graph-rebuild   # the builder to use
```

Each cycle, the heartbeat **derives a child task** (`derived_from: TS-REC-001`) with the real work items — the lineage board then shows the chain: `TS-REC-001 → TS-xxx (cycle n) → TS-xxx (cycle n+1)`. Each cycle's card is a normal card: visible, claimable, verifiable, closable.

### 7.2 The flagship example: venture graph rebuild (this week's pain)

Template `venture-graph-rebuild` — what the operator was doing by hand tonight becomes one card per night:

```yaml
id: TS-REC-002
task_type: recurring
recurrence: { cadence: daily, at: "03:00", template: venture-graph-rebuild }
work_items:
  - id: WI-1
    owner: <engine-agent>
    objective: "For every venture with repo_url + github_pat set, rebuild code graph + semantic palace, push yvon-graph branch, and confirm venture_graphs/venture_repo_knowledge rows are ready"
    skills: [graph-brain]
    scripts: [system-harness/graph-brain/ci/graphify-venture.sh,
              system-harness/graph-brain/ci/mempalace-venture.sh]
    acceptance:
      - text: "venture_graphs.status = ready for all ventures, node_count > 0"
        status: pending
      - text: "venture_repo_knowledge.status = ready for all ventures, entry_count > 0"
        status: pending
      - text: "yvon-graph branch pushed for every venture (or recorded skip with reason)"
        status: pending
```

Each night the heartbeat derives a child; the agent (with the graph-brain skill — which already knows the scripts, the env-file sourcing lesson, the detached-run lesson) executes, verifies the Supabase rows, and closes the card. The board shows last night's run, the run_ref, and any venture that skipped (with reason). **No button, no SSH, no 4am session.**

### 7.3 Other natural recurring cards
- Engine repo self-graph (replaces the hand-built cron — same script, now a visible card)
- Staleness sweep (cards with old `updated_at`)
- Health checks (wrapper up, env vars sane — would have caught tonight's corrupted DSN)
- Backup/verification sweeps

---

## 8. Project structure (existing + new)

```
store/tasks/
  TEMPLATE.yaml                     # record schema (exists)
  TS-042..047.yaml                  # demo chain (exists)
  TS-REC-001.yaml                   # recurring templates (new)
  .pending/<uuid>.json              # PRD inbox (exists)
  .done/ .active/                   # state folders as records move (new, optional)
cli/task.py                         # state machine + commands (exists)
cli/task.sh                         # CLI entry (exists)
scripts/task-heartbeat.py           # scheduler loop (NEW — §6.1)
scripts/task-executor.py            # executor driver (NEW — §6.2/6.3)
Teams/Shared OS/skills/task-executor/SKILL.md   # run protocol (NEW — §6.3)
Teams/Shared OS/skills/graph-brain/SKILL.md     # graph rebuild protocol (NEW — encodes tonight's lessons)
dashboard/app/chat/TasksPanel.tsx   # board (exists — add Ready/Doing columns as they map)
dashboard/app/tasks/page.tsx        # lineage board (exists)
```

The heartbeat and executor run on the VPS as a companion service to hermes-agent (same host, same env file — `/root/.yvon-supabase.env` — no systemd env fighting).

---

## 9. Walkthroughs

### Flow 1 — Recurring graph rebuild (the flagship)
1. 03:00 — heartbeat derives child card from TS-REC-002 (`derived_from` set).
2. Board: new card in Ready, "graph rebuild · <date>".
3. Agent claims (routing: engine agent, graph-brain skill), starts, runs the two scripts detached with logging (per the skill's graph-brain protocol — env from the env file, never the wrapper's).
4. Verifier runs the acceptance queries (venture_graphs/venture_repo_knowledge ready); suite passes; card done with run_ref.
5. Lineage board shows the nightly chain. Operator opens the board in the morning, sees green or sees exactly which venture skipped and why.

### Flow 2 — Chat request → task
1. User types in chat; classification shapes it as a work request.
2. Proposal card renders in the chat panel (exists in demo).
3. Operator accepts → record created with `source_message` verbatim (live wiring in Phase B).
4. Same lifecycle: discovery → approved → executed by the routed agent → verified → done.

### Flow 3 — Agent handoff (derived work)
1. Agent A hits something that needs Agent B's skill mid-run (e.g., a design token question during a dashboard build).
2. A creates a child task (`derived_from`) routed to B with the handoff packet — contracts only, no transcript.
3. B picks it up, closes it; A's card's history records the delegation. The lineage board shows the fork.

---

## 10. Build plan (phased)

| Phase | What | Outcome | Size |
|---|---|---|---|
| **A — The loop** | `scripts/task-heartbeat.py` + `task-executor.py` + `task-executor` skill + recurring template support in `task.py` | Cards can be claimed, run, verified, closed by agents | ~half a session |
| **B — Flagship card** | `TS-REC-002` (venture graph rebuild) + graph-brain skill (encodes env-file sourcing, detached logging, orphan-checkout fix, DSN sanity check) | The graph rebuild runs itself nightly; this week's manual saga becomes a board card | ~1 session incl. verification |
| **C — Chat intake** | Live proposal event → record conversion | Flow 2 live | 1 session |
| **D — Hardening** | Heartbeat health self-task, staleness re-queue, board columns for Ready/Doing, conflict rules | The loop survives its own failures | as needed |

Gate for each phase: the demo chain pattern — a seeded card that runs end to end, verified by suite, visible on the board. "Built" means the browser shows it and the record proves it.

---

## 11. UI surfaces — where everything renders (verified 2026-08-25)

Three surfaces, **one store**. All three read/write the same records; none is allowed to drift.

| Surface | Route | Today | In the design |
|---|---|---|---|
| **Sidebar Kanban** | `/task-board` | Column board fed by hermes-api (`getKanbanBoard`) — Create / Decompose / **Dispatch** buttons, live sidebar badge | The canonical board. Columns map to the state machine (§3.1); the Dispatch button is replaced by the automatic heartbeat (§6.1); cards open the focus view |
| **Lineage board** | `/tasks` | By-request + all-records views, state colors, reads `/api/task-spec` → `store/tasks/` | Unchanged in spirit — becomes the drill-down: root card → derived chain → attempt counts |
| **Chat panel** | TasksPanel / TaskFocusView | Proposal cards + focus view (demo-seeded) | The front door — proposals render here, accept → record created; focus view is the shared card inspector everywhere |

**Alignment work item (Phase A, blocking):** `getKanbanBoard` and `/api/task-spec` must read the same source. Today the sidebar board talks to the Hermes VPS kanban while the lineage board reads `store/tasks/` — a card can exist on one and not the other. The Hermes kanban endpoints become a view over the task store (or the sidebar board switches to `/api/task-spec`). Until this lands, "built" for the kanban means both surfaces agree — same cards, same states, same evidence.

---

## 12. Open questions (operator decides)

1. **Cadence** — daily 03:00 UTC for graph rebuilds, or on every push to origin (webhook-style)? (Recommend: daily + manual re-trigger button remains for immediacy.)
2. **Heartbeat host** — VPS companion to hermes-agent is assumed; confirm no container move planned.
3. **Claim scope** — should any agent claim any Ready card, or strictly the classified lead? (Recommend: lead only, with explicit delegation.)
4. **Store layout** — keep flat files with state folders, or move records into Supabase when multi-tenant lands? (Recommend: flat files now, Supabase migration as a Phase-E task when the dashboard needs multi-user writes.)
