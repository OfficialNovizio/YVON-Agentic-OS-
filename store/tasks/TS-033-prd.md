# PRD — Client Management Screen

**Owner:** spec (Product) · **Contributors:** ux (Product), dev (Engineering) · **Status:** Draft, pending discovery sign-off · **Task:** TS-033

## 1. Problem

Client information currently lives nowhere as a single record. It's scattered across chat threads (whoever mentioned a client last), individual TASK-SPEC records that happen to reference a client by name, and whatever notes an operator kept elsewhere. There is no place to answer "who are our clients," "what's the status of client X," or "what have we done for them" without manually reconstructing it from scattered conversations.

Requested verbatim by the operator: *"Create a new screen where I can manage my clients — list, add, edit, and view client details/history in one place."*

The underlying need is a system of record for clients — not just a form. Anything that touches a client today (a task, a chat thread, a deliverable) should be discoverable from that client's page, not just from wherever it happened to originate.

## 2. Evidence

EVIDENCE: operator directive TS-033, validation ladder L1. There is no historical usage data to cite — no client entity has existed in this system before now, so there's nothing to measure. This PRD is written from the request itself plus a review of what the system already models (TASK-SPEC records, chat rooms, the `events` table) to determine what a client record needs to link to. Before this leaves Draft for real, it should be validated against at least a handful of real operator workflows — how they currently track clients today, even informally — so the fields below aren't just guessed.

## 3. Proposed Scope

**Data model.** A new `clients` entity: `id`, `name`, `primary_contact` (name/email/phone), `status` (active / prospect / inactive), `notes` (free text), `created_at`, `updated_at`. Kept deliberately small for v1 — this is the minimum a list/detail view needs, not a full CRM schema.

**List view (`/clients`).** Every client in a sortable, searchable table: name, status, last-activity date (most recent linked task or conversation), primary contact. Search filters by name and contact. Default sort: most recently active first, since that's the operator's most common question ("who am I actively working with").

**Add.** A form for name, primary contact, initial status, and optional notes. No required fields beyond name — the operator should be able to create a bare record and fill it in over time rather than being blocked by a long form up front.

**Edit.** Same fields as Add, editable in place from the detail view. Every edit should append to the client's own history (mirroring the TASK-SPEC `history:` pattern already established in this system) so changes to a client record are auditable too, not just task records.

**Detail / history view.** The core of the feature. One panel per client showing:
- Contact + status at the top.
- A reverse-chronological feed of everything linked to this client: TASK-SPEC records that reference them, and (once resolvable) the chat rooms those tasks originated from — reusing the exact `events` table cross-reference (`task.proposal.accepted`, `payload.taskId` → `room_id`) that the task-detail lifecycle actions already depend on.
- A notes field for anything that doesn't fit a task or conversation.

**Linking mechanism.** A task gets associated with a client either by an explicit `client_id` field added to TASK-SPEC (additive, like `history`/`gate_0`/`revision_of` were), or by name-matching against `classification.task_type`/`source_message` as a fallback for records created before the field existed. Explicit linking is preferred; fallback matching should be flagged as "possibly related" rather than treated as confirmed, so we don't silently mislink.

## 4. Out-of-Scope

- Billing, invoicing, or contracts — this is a record-keeping and visibility screen, not a finance tool.
- A client-facing portal or any external access — internal-only, same trust boundary as the rest of the dashboard.
- Bulk import/export — useful eventually, not needed to validate the core screen.
- Automatic client detection from chat (parsing conversations to guess which client is being discussed) — v1 requires explicit linking; inference can follow once the basic screen is proven useful.

## 5. Success Metric

Adoption, not vanity: **at least 80% of active clients (by task volume in the trailing 30 days) have a client record with at least one linked task within two weeks of launch.** This is measurable directly from `clients` + the linking field once both exist, and it tests whether the screen is actually being used as the system of record rather than sitting empty next to the old scattered approach.

## 6. Acceptance Criteria

- [ ] `/clients` lists every client with name, status, primary contact, and last-activity date, sortable and searchable.
- [ ] "Add client" creates a record with only name required; it appears in the list immediately.
- [ ] Editing a client persists the change and appends an entry to that client's history.
- [ ] A client's detail view shows every linked task and, where resolvable, the originating chat room — using the existing `events` cross-reference, not a new one.
- [ ] Fallback name-matched task links are visually distinguished from explicit `client_id` links ("possibly related" vs confirmed).
- [ ] Screen matches the dashboard's existing visual system — same components/spacing/typography as the rest of the Adora chat surface, no one-off styling.
- [ ] Mobile: list view usable at narrow widths (matches the existing responsive pattern used elsewhere in the dashboard, not a separate mobile design).

## 7. Risks + Rollback

- **Risk — no client entity exists today.** This is new schema, not just a new screen; scope could grow once we see how operators actually use it (e.g., they may want client-level status beyond active/prospect/inactive). Ship the small v1 model above and expand only from real usage, not speculation.
- **Risk — linking accuracy.** Fallback name-matching against old records will be imperfect. Mitigated by clearly labeling inferred links as unconfirmed rather than presenting them with the same confidence as explicit links.
- **Rollback.** Fully additive: new table, new route, one new optional TASK-SPEC field. Nothing existing is modified or required to change behavior, so this can be disabled or removed without affecting any current workflow.

---
*Demo note: this PRD backs TS-033, a task created directly via the CLI (not through a real discovery/product review cycle) so the Draft-stage UI could be reviewed against realistic content. Treat the content above as a genuine first-pass spec — good enough to actually build from — not filler. It still needs real discovery sign-off before anyone starts Executing against it.*
