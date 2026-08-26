# TASK-SPEC history entry conventions

Every `store/tasks/TS-NNN.yaml` record carries a `history:` list. Each entry is
one flow-style YAML map appended by `cli/task.py` — never rewritten, never
reordered, never deleted (append-only, same discipline as `feedback.jsonl`):

```yaml
history:
  - {ts: "2026-08-18T03:26:20+00:00", actor: "operator", event: "opened_draft", note: ""}
```

## Fields

- **ts** — ISO-8601 UTC timestamp, set by `now_iso()` at write time. Never
  backfilled or estimated.
- **actor** — who caused the entry. `"operator"` for dashboard-driven actions
  today; a specific agent id (e.g. `"dev"`, `"meta"`) once agent-triggered
  notes exist. Never blank — callers that don't pass `--actor` default to
  `"operator"`.
- **event** — a short, fixed name. State-transition commands use their own
  fixed event names (`opened_draft`, `discovery_opened`, `approved`,
  `executing_started`, `gated`, `done`). Lifecycle-action notes (posted via
  `POST /api/task-spec/[id]/note`, no state change) are restricted to the
  whitelist in `app/api/task-spec/[id]/note/route.ts`'s `ALLOWED_EVENTS`:
  `retry_opened`, `redo_opened`, `changes_requested`. Free-text event names
  are rejected — this keeps the CLI and the frontend from drifting apart.
- **note** — optional free text giving context for the entry (e.g. what
  changed, or a revision-of reference). Truncated to 500 characters
  server-side before it's written into the YAML history block, so one bad
  paste can't blow up a record file.

## Why a fixed event enum

The dashboard reads `history` to render a task's audit trail. If `event`
values were free text, the UI would need to guess how to label/group/icon an
arbitrary string. Keeping the set fixed (and shared between `cli/task.py` and
the note route) means the frontend can map every known event to a specific
label and icon, and anything unexpected is a bug to fix rather than a new
case to silently render.
