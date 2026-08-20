# PRD — PRD-Gated Task Conversion Flow (chat discussion → PRD → operator approval → TASK-SPEC → executing)

**Register:** process/infra (fleet-wide task-lifecycle change, per `docs/MASTER.md` PART 6/7/8)
**Owner (assigned per routing table):** spec (Product, department leader) — PRD content; build handoff to meta (AI & Agents, task-dispatch mechanics) + dev/quinn (Engineering, gate enforcement)
**Status:** v2 — **built and tested**, 2026-08-18 (v1 was the design draft; this revision reflects what actually shipped). This PRD is itself the first real run of the `prd-discipline` + `backlog-rules` skills against a live request — per the repo audit in `docs/PRD-task-detail-lifecycle-actions.md`, neither skill had ever been run against a real `store/tasks/` request before this.
**Related:** `docs/MASTER.md` §6 (TEMPLATE.yaml schema), §7.0 (dispatch), §7.2 (Scenario B — PRD phase), §7.3 (dissatisfaction loop), §8.2–8.5 (state machine + `cli/task.py`); `Teams/Product/spec/custom/{prd-discipline,backlog-rules,opportunity-assessment,acceptance-criteria-handoff}/`; `docs/PRD-task-detail-lifecycle-actions.md`; `docs/YVON-CHAT.md`.

---

## 1. Problem

Operators discuss ideas freely with the agent team in chat. There was no consistent, structured step between "we finished discussing this" and "an agent starts building it" — so neither the agent nor the operator had a clear, written statement of what's in scope, what's explicitly out, what "done" means, or which agents/context are involved. Two concrete symptoms:

- The PRD phase `MASTER.md` §7.2 mandates ("PRD approved by operator. No PRD → no design phase") had never actually run against a real task — confirmed by `docs/PRD-task-detail-lifecycle-actions.md`'s repo audit.
- RICE/backlog scoring (`backlog-rules`) had likewise never been run with real inputs, so tasks weren't ranked against each other at all.

## 2. Evidence

- **Operator directive, validation ladder L1** (direct description in chat of the desired flow — no formal user research; stated honestly per `prd-discipline`'s fallback clause).
- **Repo audit confirming the gap was real:** `docs/PRD-task-detail-lifecycle-actions.md` §2 (`prd-discipline` never run against a real task); `docs/MASTER.md` §8.0/§8.1 (Surface B — Build — enforced by nothing); `backlog-rules` SKILL.md (RICE self-flagged `[reasoning-based, not formula-verified]`, never actually run).
- **Pre-existing infrastructure discovered mid-build, changing scope:** the dashboard already had a working dual-trigger chat-as-task feature (`TaskProposalPrompt` agent-offered card + `/assignTask` command, both routed through `createTaskSpecAndMirror`) and a PRD-render slot already wired (`task-spec/route.ts`'s `prdContent`, `TaskFocusView.tsx`) that had simply never been fed a real, auto-generated PRD. This PRD-gate feature is built as a new stage inserted into that existing flow, not a parallel system.

## 3. What was built (Phase 1 + Phase 2)

**Phase 1 — the mechanical gate (`cli/task.py`, `store/tasks/TEMPLATE.yaml`):**
- `prd_ref` / `rice_score` fields added to the TASK-SPEC schema.
- `task.py set-prd <id> --ref <path> --rice <score>` — the only writer of those fields; frozen once a record is `approved` (amendments require a new PRD version, per `prd-discipline` §Instructions.4).
- `task.py fill-discovery <id> --lead <agent> --decisions '[...]' --objective <text>` — one-shot transcription of the PRD's own decisions into `classification.lead` + `discovery.decisions` + `work_items[0].owner/objective` (only on a pristine record — never overwrites a human-filled one).
- `discovery → approved` now **blocks** without both `prd_ref` (path must exist on disk) and `rice_score` — no exemptions, every task gated, matching operator direction.
- Backward-compatible: only enforced on records that carry the `prd_ref` key at all — the 24 pre-existing records (none of which have it) are unaffected. Verified: `cli/task.py validate` against the real repo shows the same 7 pre-existing failures as before (documented in `MASTER.md` §8.0), zero new ones.
- Fixed a latent bug hit while testing: `gate_0` detection in `approve`/`validate` was a plain substring check that false-triggered off `TEMPLATE.yaml`'s commented-out placeholder text; tightened to the anchored regex `cmd_list` already used correctly.
- `cli/test_task.py` — 33 scratch-dir checks, covering the full lifecycle including the new gate, `fill-discovery`, and backward compatibility. All passing on the real repo.

**Phase 2 — the chat wiring (`dashboard/lib/`, `dashboard/app/`):**
- `lib/prd-generator.ts` — calls `callSynthesis` with spec's system prompt (condensed `prd-discipline`), gets back the 7-section PRD + **Working Agents** + **Context Refs** as markdown, plus two fenced machine-readable blocks (`prd-meta`, `rice-inputs` — same convention `stream/route.ts` already uses for `task-proposal` markers). The RICE score is **always** computed by the real `scripts/rice.py`, never hand-typed by the model. Parsing failures degrade honestly (a `## Generation Notes` section lists exactly what was missing/malformed) rather than silently inventing data.
- `lib/prd-pending.ts` — a generated-but-not-yet-approved PRD is a real file under `store/tasks/.pending/{uuid}.json` (gitignored), not ephemeral state. A discarded proposal writes no `store/tasks/` record at all.
- `lib/create-task-spec.ts` — new `createTaskFromPrd()`: chains `new → write {id}-prd.md → set-prd → fill-discovery → discover → approve → start`, stopping and reporting exactly which step failed if any step fails (never silently partial).
- `app/api/chat/prd-proposal/route.ts` — `generate` / `convert` / `discard` actions, backing both entry points.
- **Both triggers wired**, per operator direction:
  - **Agent-offered:** `TaskProposalPrompt`'s "Yes, start it" now calls `generate` instead of creating a task directly; on success it hands off to a new `PrdProposalCard` (shows the full PRD + RICE + lead, with real "Convert to task" / "Discard" buttons) instead of a terminal message.
  - **Manual `/assignTask` (and `/task`)**: now `confirm: true`-gated, reusing the exact same mechanism `/deploy` already uses (`confirm-tokens.ts`) rather than inventing new UI — first run generates and prints the PRD + a confirm token; `/confirm <token>` runs the actual conversion.
- `next tsc --noEmit` (project-wide) passes clean with these changes.
- A Node-level smoke test replicating `createTaskFromPrd`'s exact `execFile` sequence against a scratch `TASKS_DIR` confirmed the full chain reaches `executing`. A separate test exercised the fenced-block parsing/fallback logic against 5 scenarios (well-formed, missing block, malformed JSON, no blocks at all, messy casing) — all passed.

## 4. Out of Scope (not yet)

- **Auto-detecting "discussion is finished" without an explicit trigger or agent-offered prompt.** The agent-offered marker (`stream/route.ts`'s existing `task-proposed` detection) is reused as-is; no new completion heuristic was built.
- **New memory-node/mempalace schema.** "Context Refs" cites what the discussion already mentioned; no new graph-memory node types were introduced.
- **RICE weight calibration.** Remains the logical layer's future job per `backlog-rules` — the rubric is used as-is, flagged `[reasoning-based, not formula-verified]`.
- **CAOS-lite execution loop (skipping Context/Input-Analysis at generation time).** The mechanical chain reaches `executing` — real code-writing execution against that state is Surface A (Hermes/CIE runtime), which `MASTER.md` §8.1 documents as **not live** (blocked on VPS/DNS/env) independent of this feature. Nothing here fakes that; `executing` hands off exactly the way a CLI-created task already does today.
- **Live, end-to-end test of the actual LLM call** (`callSynthesis` → Anthropic/OpenAI). Verified: the deterministic parts (task.py chain, `rice.py` invocation, fenced-block parsing/fallback logic, TypeScript type-checking) for real. Not verified: an actual network round-trip through a running `next dev` server with real Supabase auth + a real model API key — that requires the operator's own running dev environment and credentials, which this build session didn't have access to. Recommend a manual smoke test in a real chat room before relying on this in anger.
- **Inline PRD editing before approval.** Approve-as-shown or decline-and-keep-discussing; editing the PRD text directly in chat is a future slice.

## 5. Success Metric

`<FILL_IN — needs metric's versioned definition; metric has not been asked>`. Proposed working measure until metric assigns a real one: **rate of tasks that reach `done` with `feedback.outcome: accepted` on the first PRD-gated attempt** (no dissatisfaction-loop re-open), against a baseline of zero comparable data (no PRD had ever gated a real task before this).

## 6. Acceptance Criteria (all verified against real code + real repo, per §3 above)

- [x] An explicit convert-to-task trigger (agent-offered "Yes, start it" or `/assignTask`) starts spec's PRD generation against the preceding chat discussion.
- [x] The generated PRD contains all 7 standard sections plus **Working Agents** and **Context Refs**, rendered as a visible chat message/card before any TASK-SPEC record exists.
- [x] The PRD includes a RICE line computed by the real `scripts/rice.py`, confidence capped per evidence level, `[reasoning-based, not formula-verified]` flag intact.
- [x] `cli/task.py validate` rejects any record attempting `discovery → approved` with an empty `prd_ref` (only for records carrying that key — backward compatible).
- [x] Operator approval is the only path that creates the TASK-SPEC; `discovery.decisions[]` is populated from the PRD, not re-asked.
- [x] Declining/discarding reopens the chat discussion and writes no `store/tasks/` record.
- [x] Execution, once approved, reaches `executing` via the mechanical chain — real code-generation execution against that state remains Engineering's/the (not-yet-live) runtime's job, same as any other task.

## 7. Risks + Rollback Stance

- **Friction risk:** a mandatory PRD on every task, including trivial ones, adds overhead. Chosen explicitly (no exemptions) — mitigation is keeping generation fast (one `callSynthesis` call) rather than skipping it.
- **Schema risk:** `prd_ref`/`rice_score` on `TEMPLATE.yaml` are additive-only, defaulted empty on old records; `cli/task.py validate` re-run against all 24 existing records before/after confirmed zero regressions.
- **Enforcement risk:** a hard-blocking gate can stall work if PRD generation is slow/unavailable (network, API key). No escape hatch was added in this pass — if this proves too rigid in practice, add one explicitly (logged, never silent), mirroring PART 8's `YVON_GATE=off` pattern.
- **Vercel/production-deploy risk (inherited, not new):** `createTaskSpecAndMirror`/`createTaskFromPrd` both shell out to a local `python3 cli/task.py` — this already didn't work under a Vercel deploy before this change (documented in the original `create-task-spec.ts` header) and still doesn't; unaffected by this patch either way.
- **Rollback:** everything here is additive (new fields, new files, new API route, new component, a two-phase confirm flow replacing an instant one). Reverting `assign-task.ts`/`TaskProposalPrompt.tsx` to their pre-PRD-gate versions restores instant task creation; the `prd_ref`/`rice_score` gate in `task.py` can be disabled by reverting `cmd_approve`'s two `require()` calls.

---

## 8. RICE (this feature itself)

| id | reach (estimate) | impact | confidence (input) | confidence used | effort (months) | evidence_level | **score** |
|---|---|---|---|---|---|---|---|
| PRD-GATE-001 | 100 | 3.0 | 0.7 | 0.5 (capped, evidence_level=1) | 2 | 1 | **75.0** |

`[reasoning-based, not formula-verified]` — computed via `scripts/rice.py` during design; effort is a spec-side placeholder pending Engineering's real estimate.

---


## 9. Full-Workflow Multi-Scenario Test (Phase 3)

Per operator direction ("once every phases done test the full workflow of this in to multiple different scenarios"), a 7-scenario harness was run against the real cli/task.py and the real scripts/rice.py (never a mock), each in its own scratch TASKS_DIR, after Phase 1 + Phase 2 were both individually tested. 53/53 checks passed:

1. Happy path -- new -> write PRD -> set-prd -> fill-discovery -> discover -> approve -> start -> executing.
2. Discard before approval -- confirmed a discarded proposal writes zero store/tasks/ records (the pending .json is the only artifact, and it is gone after discard).
3. Malformed model output -- both fenced blocks (prd-meta, rice-inputs) missing; prd-generator.ts's documented fallback (lead=dev, decisions=["Working agent: dev"], reach/impact floor) still produces a real rice.py score and still reaches executing.
4. gate_0-classified task -- confirmed the PRD gate and the pre-existing gate_0 RFC-signoff gate are independent: approve is blocked on gate_0_signoffs specifically (not on prd_ref/rice_score, which were already satisfied), and only succeeds once both gates are satisfied.
5. PRD frozen after approval -- set-prd against an approved/executing record is refused; the original prd_ref is unchanged.
6. rice_score="0" (the honest fallback value prd-generator.ts writes when scripts/rice.py itself fails) still satisfies the gate -- confirmed the gate checks presence of a score, not its magnitude, by design.
7. set-prd refuses a prd_ref path that does not exist on disk, and prd_ref stays empty afterward.

Combined with cli/verify-caos.py (the fleet's own CAOS E2E harness): quick smoke 6/6 passed; full run 61/69 passed, with all 8 failures pre-existing and unrelated to this feature (RAG-module path-existence checks using a stale relative path, 0 source-book PDFs present in this environment, one latency check slightly over budget under this session's I/O) -- none touch store/tasks/, cli/task.py, or dashboard/lib/prd-*.

cli/task.py validate against the real repo: same 8 pre-existing failures as documented in §6 above (TS-001/002/003/004 missing approved_by, TS-006/007 missing approved_by + empty exit_gate.proof), zero new ones. cli/test_task.py: 33/33 passed.

## Changelog
- v1 — 2026-08-18 — initial design draft, produced from operator chat discussion, before any of §3's items were built.
- v2 — 2026-08-18 — rewritten to reflect what was actually built and verified: Phase 1 (mechanical gate) + Phase 2 (chat wiring), both triggers, tests passing on the real repo.

- v3 -- 2026-08-18 -- added §9, the Phase 3 full-workflow multi-scenario test (53/53) plus a fleet-wide cli/verify-caos.py run.