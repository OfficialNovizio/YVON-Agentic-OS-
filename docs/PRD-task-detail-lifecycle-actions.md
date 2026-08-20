# PRD — Task Detail & Lifecycle Actions

**Register:** product (dashboard feature spec, per `docs/MASTER.md` §7.2 PRD phase)
**Owner (assigned per routing table):** spec (Product), build handoff to mia (Engineering/Frontend)
**Status:** draft v1 — written retroactively after the task-detail view (`TaskFocusView.tsx`) shipped without this document, per the process correction on 2026-08-18. Not yet operator-approved.
**Related:** `store/tasks/TEMPLATE.yaml` (schema), `cli/task.py` (state-machine CLI), `docs/MASTER.md` §7.0/§7.2/§7.3 (Gate 0, PRD phase, dissatisfaction loop), `app/api/task-spec/route.ts`, `app/chat/TaskFocusView.tsx`, `app/chat/TasksPanel.tsx`.

---

## 1. Problem

Operators can see a TASK-SPEC's current stage (draft/discovery/approved/executing/gated/done) but have no visibility into **how it got there** — no record of who did what, when, or why a task is stuck. When a task's output isn't right, there is no in-UI way to act on that (no retry, no "make changes," no redo) — the operator has to go find the originating chat manually and start over with no link back to the task. Two concrete instances of this, both from direct operator feedback on the live app:

- "task section didn't expand automatically... why it's soo conjusted" — the detail view was too cramped to show real information (fixed 2026-08-18, separate change).
- "i asked to make this section more better, sourceful to easily know what's happening and what happened in these sections... I want more informative, sensful, and who's creating this... I need button over there... which helps me to redo/make changes/retry... check output vs the PRD file maybe they are not aligns."

## 2. Evidence

- **Operator directive, validation ladder L1** (direct operator feedback in-session, no formal user research conducted — per `prd-discipline`'s fallback clause, stated honestly rather than dressed up as researched).
- **Repo audit confirming the gap is real, not assumed:**
  - `cli/task.py`'s six subcommands (`new/discover/approve/start/gate/done`) write **zero** history entries anywhere — no event, no log line, no YAML history block.
  - `store/tasks/TEMPLATE.yaml`'s only outcome-tracking field is a single flat `feedback: {outcome, proof, lesson}` block, filled once post-execution. Of 23 real records in `store/tasks/`, only `TS-001.yaml` has it filled.
  - `git log --follow store/tasks/TS-001.yaml` returns one squashed commit — git history is not a usable audit trail.
  - `docs/MASTER.md` §7.3 (Dissatisfaction Loop) already *describes* the target shape — "revision N+1; original + revision linked (audit trail)" — but nothing in `cli/task.py` or the schema implements it. This PRD is closing a documented, not hypothetical, gap.
  - §7.0 Gate 0 (RFC sign-off: dev/spec/meta/warden) is a real, existing conditional checkpoint — it triggers when a task touches frontend/backend/API/security/algorithm structure — but it's invisible in the current UI, which only ever shows the fixed 6-stage row. This is the real mechanism behind the operator's "different types need different checkpoints" ask; nothing needs to be invented, it needs to be surfaced.
  - No task in this repo has ever had a generated `PRD.md` artifact (the `prd-discipline` skill exists at `Teams/Product/spec/custom/prd-discipline/` but has never been run against a real request in `store/tasks/`). "Check output vs PRD" is therefore not implementable against real data yet — logged as out-of-scope below, not silently dropped.

## 3. Proposed Scope (smallest coherent slice)

1. **History log, real and written.** Add `history: []` to the TASK-SPEC schema (list of `{ts, actor, event, note}`). Every `cli/task.py` transition subcommand (`discover/approve/start/gate/done`) appends one entry. Surfaced in the UI as a chronological trail per task, not per stage-tab (a stage can have multiple events).
2. **Gate 0 surfaced as a conditional checkpoint.** When `classification.task_type` or `work_items[].owns_paths` indicates structural impact (frontend/backend/API/security/algorithms — same test §7.0 already defines), render an extra "RFC Sign-off" checkpoint chip between Discovery and Approved, showing the four required signers and which have signed. Read-only in this slice — the sign-off itself stays a backend/agent action, not a button an operator clicks in this UI.
3. **Three lifecycle actions**, each a real button on the task detail view:
   - **Make Changes** — closes the task view, navigates to the originating chat room (already resolvable via the `events` table `task.proposal.accepted` cross-reference this feature already built), and opens the composer with a pre-filled reference to the task so the operator can describe the change.
   - **Retry** — same navigation as Make Changes, plus: writes a `history` entry `{event: "retry_opened", note}` on the *current* record, and creates a new linked record (`revision_of: <original id>`) once the operator's follow-up in chat produces a new TASK-SPEC — matching §7.3's "revision N+1; original + revision linked" language exactly, not a new invention.
   - **Redo** — same as Retry, distinguished by intent (`event: "redo_opened"`) — both write to history identically; the distinction is presentational (what the operator meant), not a different mechanism.
4. **Creator/requester made prominent** — `requester` (already in schema) shown with a name, not buried; timestamp of creation added (needs a `created_at` field — currently absent from the template).
5. **Demo-data mock** (companion artifact to this PRD, not production code) showing full realistic content for every stage plus the history log and the three action buttons, for operator review before any schema/backend work starts.

## 4. Out of Scope

- **PRD-file generation + output-vs-PRD alignment check** — **not yet.** Requires `prd-discipline` actually running against a task first (nothing to diff against today). Tracked as a follow-on once a task has a real generated PRD to compare.
- **Local/live preview URL per task** — **not yet.** No field exists (`exit_gate.proof` is a text/path string, not a routable URL) and no staging/preview infrastructure is wired to task records. Would need a new `exit_gate.preview_url` field plus an actual deploy-preview mechanism — separate scope.
- **Automated retry re-dispatch** (§7.3's full loop: quality-score adjustment, 2-automated-revision cap, escalation to human review) — **not yet.** This slice writes the history/link data the loop needs; it does not implement meta's routing or anneal's scoring.
- **Gate 0 sign-off as an in-UI action** — **not ever in this surface.** RFC sign-off is a cross-department agent action (dev+spec+meta+warden), not something one operator clicks from a task card; this UI only reads and displays sign-off state.

## 5. Success Metric

`<FILL_IN — needs metric's versioned definition; metric has not been asked>`. Proposed working measure until metric assigns a real one: **rate of tasks where the operator's next action after opening detail is a lifecycle button (Make Changes/Retry/Redo) vs. leaving without action** — a proxy for "the detail view gave enough information to decide," which is the problem stated in §1. Not a registered metric — flagged honestly per `prd-discipline`'s evidence-gate rule rather than invented.

## 6. Acceptance Criteria

- [ ] A task record can carry ≥1 `history` entries; `cli/task.py validate` treats a missing `history` key on old records as valid (backward compatible), not a validation failure.
- [ ] Every `cli/task.py` transition command appends exactly one `history` entry with a real ISO timestamp, the acting identity, and the transition name — verified by running each subcommand against a scratch record and inspecting the written YAML.
- [ ] `/api/task-spec` returns `history` and (when applicable) `revision_of` / a task's known revisions, without breaking existing callers (`TaskPill`, `TasksPanel`) that don't read those fields.
- [ ] The Gate-0 checkpoint chip appears only for tasks whose `work_items[].owns_paths` or `classification.task_type` matches the structural-impact test already defined in §7.0 — verified against at least one real task that should show it and one that shouldn't.
- [ ] Clicking Make Changes / Retry / Redo navigates to the correct originating room (matching an existing `fromRoom` task) — verified against a real task with a real `room_id`, not a mocked one.
- [ ] Retry/Redo write a `history` entry before navigating; failure to write does not silently proceed (surfaced as an error, not swallowed).
- [ ] No field in this slice is presented as populated when it isn't — `revision_of`/preview-url/PRD-alignment fields render an explicit "not available yet" state rather than blank or fabricated content.

## 7. Risks + Rollback Stance

- **Schema change risk:** adding `history`/`revision_of`/`created_at` to `TEMPLATE.yaml` and 23 live records touches the state-machine source of truth. Mitigation: additive-only fields, defaulted to `[]`/`null`/absent on old records; `cli/task.py validate` re-run against all 23 before and after to confirm no regressions (matches the existing validate discipline already used in this session).
- **Gate 0 surfacing risk:** misclassifying a task as structural (or not) shows the wrong checkpoint. Mitigation: reuse §7.0's existing test verbatim rather than writing a new one, and treat it as read-only display, not a control, so a misclassification is cosmetic, not a blocked workflow.
- **Rollback:** every change here is additive (new optional fields, new UI elements gated on those fields' presence) — reverting is deleting the added fields/UI, not unwinding a migration. If `history` writes turn out to be wrong, existing `feedback`-based behavior (TS-001's pattern today) keeps working unmodified.

---

*Amendments to this PRD are versioned below; the version shipped-against is frozen at handoff per `prd-discipline` §Instructions.4.*

## Changelog
- v1 — 2026-08-18 — initial draft, written after the fact per process correction, before any of §3's items are built.
