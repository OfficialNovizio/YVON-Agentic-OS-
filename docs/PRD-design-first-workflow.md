# PRD — Design-First Workflow (pre-PRD design session → handoff → existing PRD-gate)

**Register:** process/infra (new pre-PRD stage sitting upstream of the existing `docs/PRD-prd-gated-task-conversion.md` flow)
**Owner:** dev (Engineering) — mechanics + wiring; spec (Product) still owns the actual PRD once handoff reaches `generatePrd()`; ux owns the operator-facing prompts this CLI's messages are meant to be wrapped by, once a chat surface calls it.
**Status:** Extended past the MVP slice, 2026-08-19. Stage 2 (reference presentation — F2a-F2e, live tier against the open-design daemon + a curated static tier) is now **built and tested** (§3c), on top of the already-shipped MVP (Stages 0–4, Scenario A, F6b). `deploy-open-design.sh` (Docker-based, pulls the prebuilt `ghcr.io/nexu-io/od:latest` image rather than building the 386MB monorepo) has been handed to the operator to run on the Contabo VPS — real output pending, see §3a for the screenshot-to-code precedent this mirrors. Stage 5b (motion / Higgsfield / scroll-world) and most of the wider 25-point fallback inventory beyond what's listed in §3 are still explicitly deferred — see §4.
**Related:** the design-discussion artifacts this MVP implements a slice of (not part of this repo's `docs/`, delivered as standalone files during the discussion that preceded this build): the master tree diagram and its fallback inventory covering all 8 stages / 25 fallback points / Scenarios A–F. `cli/task.py`, `dashboard/lib/prd-generator.ts`, `dashboard/lib/prd-pending.ts` (the existing Stage 7 machinery this hands off to, unchanged by this PRD).

---

## 1. Problem

The existing chat-to-task flow (`docs/PRD-prd-gated-task-conversion.md`) starts from a chat discussion and ends at a PRD. For design/UI work specifically, the operator wanted something upstream of that: a structured way to go from "make a new design" through capturing/generating a starting visual, reviewing whether it's actually right (not just technically successful), and getting a real cost figure approved — before any of that becomes the "discussion" a PRD gets generated from. The operator was explicit that this must never assume a PRD already exists at any point; it always feeds into a PRD generated fresh, exactly once, at the end.

## 2. Evidence

- **Operator directive, validation ladder L1** — a multi-turn discussion (design-only, no execution) that produced a master tree diagram covering all 8 stages and 25 named fallback points across Scenarios A–F, then an explicit instruction to implement a first slice of it for real.
- **A real gap surfaced mid-discussion:** a generation-shaped step (screenshot-to-code's code-gen call) can succeed technically and still be wrong — not what the operator meant — and nothing in the original design would have stopped that from riding silently into an approved, frozen PRD (`cli/task.py cmd_setprd` freezes `prd_ref` once a record leaves `draft`/`discovery`). This MVP's F6b review gate exists specifically to close that gap for the one generation step it implements.

## 3. What was built

**`cli/design.py`** — a new state-machine CLI, deliberately mirroring `cli/task.py`'s conventions (same `STATES`/`die`/`require`/`_append_history` shape, same `DESIGN_SESSIONS_DIR` env-override-for-testing pattern as `task.py`'s `TASKS_DIR`). Lifecycle:

```
trigger -> review -> draft_ready -> spend -> ready -> handed_off
```
Terminal, no further transitions, no PRD ever follows: `abandoned` (review gate), `declined` (spend gate). Text-only input skips `review` entirely (nothing generated, nothing to review) straight from `trigger` to `draft_ready` on `draft`.

Commands: `new`, `input`, `capture`, `generate`, `review`, `draft`, `estimate`, `approve-spend`, `decline-spend`, `handoff`, `status`, `list`, `validate`.

Fallback handling actually implemented (named to match the discussion's own IDs):
- **F1a** — capture failures retry, capped at 3 *consecutive* failures (a successful capture resets the streak — this MVP originally conflated total-attempts with fail-streak and capped legitimate re-generation too; fixed before shipping, see `cli/test_design.py`'s regenerate-loop coverage), then escalates to `--manual-screenshot <path>` or a switch to text input.
- **F1c** — text input under 40 chars is blocked by `new` unless `--confirm-thin` is passed, so a too-thin brief gets a deliberate confirmation instead of a silent low-confidence draft.
- **F4a/F4b/F4c** — `estimate` computes a real (if MVP-simple) cost from `store/design-sessions/pricing.json`, honestly defaulting every figure to $0 with a loud warning when that file doesn't exist yet (same "Generation Notes" discipline as `prd-generator.ts`); `approve-spend`/`decline-spend` gate on it explicitly, `decline-spend` ends the session cleanly (Scenario E) with the design.md kept and nothing further spent.
- **F6a** — generate failures retry/escalate the same way as F1a (separate fail-streak counter).
- **F6b (the flagship gap this pass exists to close)** — after a successful generate, status moves to `review` and blocks. `review --decision approve|regenerate|adjust-input|abandon` is the only way forward: `approve` proceeds to drafting, `regenerate` re-runs `generate` (capped at 3 free regenerations — F6c — then requires `--confirm-override`, same discipline as a budget-drift re-confirm), `adjust-input` clears capture+generation and requires a `--note` explaining what was wrong with the brief (routes back through `input`/`capture`/`generate` rather than silently reusing a bad brief), `abandon` ends the session terminally.
- **FX2** — every record write is atomic (write-to-temp, rename), so a crash mid-write can't leave a half-written record a later command misreads as valid.

**`cli/lib/screenshot_to_code_client.py`** — client with two honestly-distinguished modes: LIVE (`SCREENSHOT_TO_CODE_URL` set, real calls, real failures surfaced as `ScreenshotToCodeError`/`GenerateResult.error`) and STUB (unset, or upstream capture was itself stubbed — no network call, every result flagged `stub=True` so nothing downstream can mistake a placeholder for a real asset). `cli/design.py handoff` refuses to hand off a stub-sourced session unless `--allow-stub` is explicitly passed. `capture_url` is a real `POST /api/screenshot` call; `generate_code` is now a real `websockets` client against `/generate-code` (added same day as capture, after verifying the wire protocol against `routes/generate_code.py` directly — see §3b for the API-key correction this surfaced).

**`cli/test_design.py`** — 37 scratch-dir checks (stub mode, no network, never touches the real `store/design-sessions/`), covering Scenario A's full happy path, the stub/`--allow-stub` refusal, the F6b regenerate cap + override, F6b abandon as terminal, Scenario E's clean decline, and F1c's thin-input gate.

**`cli/test_screenshot_to_code_client.py`** — 11 checks against a local mock WebSocket server (background thread, real `websockets.serve`, real message protocol — success/`setCode`+`variantComplete`, `variantError`, connection-level `error`, API-key pass-through, and the stub-short-circuit when upstream capture was itself stubbed). Never touches the real VPS. All passing (see §5).

**`vps-scripts/deploy-screenshot-to-code.sh` + `vps-scripts/yvon-screenshot-to-code.service`** — provisioning script + systemd unit for hosting screenshot-to-code on the Contabo VPS, matching `install-tools.sh`'s venv-per-tool layout and `yvon-hermes-dashboard.service`'s loopback-only pattern.

### 3a. VPS deployment — executed by the operator, 2026-08-19

Run against the real Contabo box (169.58.107.148), not simulated. Two real failures hit and fixed against actual output, not guessed in advance (both documented in the script's own revision history):
1. First attempt assumed pip+requirements.txt and npm; the real backend uses Poetry (`pyproject.toml`) and the real frontend uses pnpm. Rewritten against the cloned repo's own `backend/README.md`.
2. Second attempt's `pip install --break-system-packages poetry` failed uninstalling apt-managed `urllib3` (no pip RECORD file). Switched to `pipx`, matching `install-tools.sh`'s existing convention on this same box.

Third run completed clean: poetry deps installed, Chromium + its system libs installed via `playwright install --with-deps`, frontend built (pnpm, `tsc && vite build`), blank `.env` template written. `yvon-screenshot-to-code.service` was then installed and is confirmed `active (running)` on 127.0.0.1:7001, `enabled` (survives reboot).

Still open, operator's call, not automated by anything here: real LLM provider keys in `backend/.env` (none set yet — the service runs without them, generation just isn't usable until at least one is filled in); whether to get a screenshottone.com key for URL-capture-and-clone (§4 explains why this is a separate paid dependency, not optional self-hosted infra).

### 3b. `generate_code`'s real API-key path — a correction, then a real integration

The operator reported having "set the key stuff in settings" — the frontend's settings-dialog (gear icon), confirmed in the real source (`backend/README.md`, `routes/generate_code.py`'s `_get_from_settings_dialog_or_env`) to be **browser-local state**, sent fresh on every `/generate-code` request from that specific browser session. It does not touch `backend/.env`, and it cannot reach `cli/design.py` — there is no browser in that path at all.

The operator's follow-up correctly pointed at the right fix instead: this dashboard already has a configured-once credential store — Supabase's `ai_provider_keys` table (`dashboard/lib/ai-client.ts`), one active `{provider, api_key, base_url}` row, 60s-cached, used by the whole agent system's own LLM calls. `cli/lib/dashboard_credentials.py` now reads that same table directly via Supabase's REST API (same `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` env-var convention this repo's other standalone Python scripts already use, `vps-scripts/yvon-hermes-http/events.py`) and maps the one active row onto whichever of screenshot-to-code's four provider fields it corresponds to — `anthropic` provider → `anthropicApiKey`; `custom` provider (typed uniformly as `openai-compat` protocol regardless of host, per `dashboard/lib/providers.ts`) → `openAiApiKey` (+ `openAiBaseURL` for anything other than `api.openai.com`), except the Gemini host specifically, which maps to `geminiApiKey`. Only a `custom` row with no `base_url` at all, or an unrecognized `provider` value, is genuinely unmapped.

`_api_key_fields()`'s precedence, highest first: (1) an explicit `OPENAI_API_KEY`/etc. in `cli/design.py`'s own process environment, letting an operator override per-run; (2) the Supabase-derived mapping above; (3) omitted, letting the screenshot-to-code server's own `backend/.env` fallback apply. Every step that doesn't contribute a key produces a warning (not a silent gap) — `GenerateResult.warnings`, printed by `cmd_generate`. Caught one real bug writing this against real test cases before shipping: the first version only mapped `custom` rows whose host matched a known list (OpenAI/Gemini) and reported everything else — DeepSeek, Groq, a proxy — as unmapped, when `providers.ts`'s own type system says `custom` is *always* OpenAI-compatible protocol, so it should always map via `openAiApiKey`+`openAiBaseURL`. `cli/test_dashboard_credentials.py`'s DeepSeek case failed against the first version and caught it.

### 3c. Stage 2 — reference presentation (F2a-F2e), 2026-08-19

New command `reference <id> [--skip | --pick <ref_id> [--competing-input "<val>" --lead template|site] [--confirm-unlicensed]]`, inserted between `capture` and `generate` per the master tree (IMGIN -> Stage2 -> Stage3); `generate` now requires Stage 2 resolved first for url-input sessions (text-only sessions still skip it entirely — SKIPREF).

- **F2a** — `cli/lib/open_design_client.py` calls the open-design daemon's `GET /api/design-systems` (`OPEN_DESIGN_URL` + `OD_API_TOKEN` env vars). Unset/unreachable/malformed-response all degrade honestly to curated-only with a warning, same discipline as `dashboard_credentials.py` — never a silent empty list mistaken for "no live entries".
- **F2b** — curated entries (`store/design-sessions/curated-references.json`, tracked in git — real catalog content, not a secret) flagged stale past 90 days from their `added_at`.
- **F2c** — entries with no `license` tag are shown but marked "not usable without manual review"; picking one requires `--confirm-unlicensed`, same override discipline as F6c's regenerate cap.
- **F2d** — `--competing-input` + `--lead template|site` resolves the human decision when the operator also supplied a competing URL/screenshot; `site` drops the reference pick, `template` keeps it.
- **F2e** — re-verified at *selection* time against the list actually shown (persisted in the record), not recomputed fresh — so a reference that vanished between listing and picking is caught, not silently re-agreed with itself. Curated tier re-reads the catalog file; live tier makes a fresh `GET /api/design-systems/:id` call.
- Extraction well-formedness (F3a-equivalent) folded into the same command: a picked entry missing `name`/`category` falls back to drafting fresh with a note, rather than failing hard.
- `draft` now includes a "## Reference" section in design.md when a pick was extracted.

`cli/lib/open_design_client.py` never guesses at the daemon's response shape — verified against the same real `nexu-io/open-design` source clone used for §"OpenRouter blueprint"/media-provider investigation earlier this session, not assumed.

### 3d. Task↔design-session linkage + unified design-preview panel, 2026-08-19

Operator asked, discussion-first: when a task in the dashboard's task-board is design-sourced, show its actual output (screenshot-to-code / open-design / custom) instead of the generic task-detail panels alone. Discussed before building — the key finding that shaped the design: open-design's real live-preview route (`GET /api/live-artifacts/:artifactId/preview`) is guarded by `requireLocalDaemonRequest` (verified against `apps/daemon/src/http/local-daemon-request.ts`), which hard-checks the TCP peer address is loopback — an API token doesn't bypass it. This only resolves because the dashboard (`yvon-hermes-dashboard.service`) already runs on the same box as the daemon; a server-side `fetch('http://127.0.0.1:...')` from that process genuinely is a loopback request. If the dashboard ever moves off that host, this tab degrades honestly (see below), it doesn't silently break.

Built, per the operator's two decisions (one unified panel regardless of tool; build the open-design proxy now, ahead of need):

- **`cli/task.py`** — new `design_session_id`/`design_tool`/`design_artifact_id`/`design_project_id`/`design_handoff_path` fields (`TEMPLATE.yaml`), set via `set-design-origin <id> --session <sid> --tool screenshot-to-code|open-design|custom [--artifact <id>] [--project <id>] [--handoff <path>]` — mirrors `set-prd`'s pattern, but not a lifecycle gate (works at any status). Exposed via `list`'s JSON for the dashboard to read.
- **`dashboard/app/api/design-preview/route.ts`** — `GET ?taskId=TS-NNN`, resolves a task's design-origin into three independently-`available` tabs (preview/code/design.md), each with an honest `reason` when not available. screenshot-to-code reads the stored `generation.code` directly off disk (no dependency on their frontend app being up). open-design proxies the loopback-gated route above. custom/stub sessions only ever get the design.md tab.
- **`dashboard/app/chat/TaskFocusView.tsx`** — new `DesignPreviewPanel`, rendered only when `task.designSessionId` is set (absent for every other task, never an empty panel shown speculatively). Tabs default to whichever content actually resolved, never a tab guaranteed to show an empty state first.

Verified: `python3 cli/task.py test_task.py` — 51/51 (was 33; +15 for `set-design-origin`) and `cli/test_design.py` unaffected (59/59), both re-run on the operator's real machine. `npx tsc --noEmit` across the whole dashboard — zero errors, twice (once after the API route, once after the panel). A real end-to-end data check on the operator's machine: a real task linked via `set-design-origin` to the real `3697d41f…` session from §5's live verification correctly exposed `generation.code`/`stack`/`stub` and a real `design.md` on disk — confirms the route's read path lines up with `cli/design.py`'s actual on-disk schema. **Not yet verified: the route/panel haven't been exercised against a running `next dev` server** (device_bash has no network to install `eslint`, and a full dev-server run wasn't attempted this pass) — treat the live UI behavior as unverified until the operator loads a design-sourced task in the real dashboard. The open-design preview tab specifically can't be verified at all yet — no task has real `design_artifact_id`/`design_project_id` values (nothing produces them until Stage 5b exists), so that path has only been exercised via its honest "not available" branch.

## 4. Out of scope / deferred (named, not silently dropped)

- **Stage 5b — motion (Higgsfield MCP, Monid, scroll-world).** Not implemented. No scene-generation loop, no F6d assembly-failure handling, no session-wide spend ceiling (FX4).
- **Scenario C (mid-run failure/interrupt) and F (interrupted/resumed)** — not implemented; both depend on Stage 5b's generation loop (INT node), which doesn't exist yet.
- **Scenario B is now partially covered** (F2d conflicting-input resolution, F2e vanished-reference handling) — but only for the Stage 2 slice; B's other implications (e.g. a competing input surfacing again later in the flow) aren't traced further.
- **F3b (drafting confidence loop)** — not implemented; `draft` always proceeds, no clarifying-question round-trip when confidence is low.
- **The rest of the 25-point fallback inventory** not listed in §3 (F0, F1b/F1d, F3b, F4c/FX5's "parked" state, F5a/F5b, F6d, F7a–F7c, FX1/FX3/FX6) — none contradicted by this build, all still apply once extended.
- **`generate_code` is now real (added same day as the VPS deployment) but untested against an actual live LLM call** — `cli/test_screenshot_to_code_client.py` verifies the wire protocol against a mock server, not against the real deployed backend with real provider keys and a real model response. It only reads `variantIndex` 0 — the app's multi-variant (compare several models per generation) feature is deliberately unused. `isImageGenerationEnabled` is hardcoded `False` — no Replicate-backed asset generation/editing is triggered by this MVP. First real live call (once keys are set per §3b) should be treated as still-unverified until it actually happens.
- **screenshottone.com is a third paid external dependency, discovered only once the real source was read.** The original design discussion assumed URL capture would be self-hosted headless capture. It isn't: `POST /api/screenshot` proxies to screenshottone.com and requires a caller-supplied API key (no server-side fallback in the route itself) — the repo's own genuinely self-hosted Playwright/Chromium piece (`backend/preview_screenshot/`) is for a different feature (the backend self-checking its own generated output), not input capture. `capture_url` now reads `SCREENSHOTONE_API_KEY` and fails honestly if it's unset rather than sending an empty key.
- **VPS deployment status:** `deploy-screenshot-to-code.sh` completed successfully end to end on the real Contabo VPS, and `yvon-screenshot-to-code.service` is `active (running)`/`enabled` — see §3a. What's still NOT done, and still requires the operator: setting `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` wherever `cli/design.py` runs so §3b's key lookup can reach the dashboard's own configured provider (or setting an explicit `OPENAI_API_KEY`/etc. there directly); deciding on a screenshottone.com key.
- **The Supabase key lookup (§3b) hasn't been run against the real `ai_provider_keys` table** — `cli/test_dashboard_credentials.py` verifies the mapping logic against a mock HTTP server, not the operator's actual Supabase project. First real lookup should be treated as unverified until it happens (same discipline as `generate_code` itself, below).
- **`requirements.txt` needs a real `pip install`** — `websockets>=14.0` was added for `generate_code()`; it's not automatically present just because this PRD updated the file. Confirm with `python3 -c "import websockets"` before relying on live generation anywhere new.

## 5. How this was verified

`python3 cli/test_design.py` — 59/59 passing (was 37/37 pre-Stage-2; +22 for F2a-F2e/F3a coverage), against a throwaway `DESIGN_SESSIONS_DIR` + a fixture `CURATED_REFERENCES_FILE`, stub mode only (no network, no live deployment of either screenshot-to-code or open-design required). `python3 cli/test_open_design_client.py` — 11/11 passing, against a local mock HTTP server shaped like the real daemon's `/api/design-systems` routes (never the real VPS) — covers unconfigured/unreachable/empty-catalog/F2e-404 degradation, all honest, never a silent gap. `python3 cli/test_screenshot_to_code_client.py` — 11/11 passing, against a local mock WebSocket server. `python3 cli/test_dashboard_credentials.py` — 18/18 passing, against a local mock HTTP server. `python3 cli/test_task.py` — 33/33, re-run to confirm zero regression on the existing PRD-gate machinery this hands off to (unchanged by this PRD). All five suites re-run together on the operator's real machine (`device_bash`) after this Stage 2 pass, not just in the sandbox — `test_screenshot_to_code_client.py` gracefully SKIPs there (no network on that specific bridge, by design) while the other four passed for real: 33+59+18+11 = 121 confirmed there, +11 more (`test_screenshot_to_code_client.py`) confirmed separately where network is available. 132 total across all five suites. The open-design VPS deployment itself (§3a-style, via `deploy-open-design.sh`) was handed to the operator to run — real output pending as of this PRD revision, same "verify against real output, don't guess" discipline as §3a.

## 6. Risks + Rollback stance

New files only (`cli/design.py`, `cli/lib/`, `cli/test_design.py`, `cli/test_open_design_client.py`, `cli/test_screenshot_to_code_client.py`, `cli/test_dashboard_credentials.py`, `vps-scripts/*`, `docs/PRD-design-first-workflow.md`, `store/design-sessions/{README.md,pricing.example.json,curated-references.json}`) plus an additive `.gitignore` change and an additive `requirements.txt` entry (`websockets`). `cli/lib/dashboard_credentials.py` and `cli/lib/open_design_client.py` are both read-only against their respective external systems (`select` only / `GET` only) — neither can affect the dashboard's own agent system or the open-design daemon's own state. Nothing in the existing `cli/task.py`/`dashboard/lib/prd-*.ts` chain was modified. Rollback is deleting the new files and the `.gitignore` addition — no migration, no data in `store/tasks/` is touched by anything here.

## Working Agents

Lead: dev. This is Engineering mechanics (a new CLI + client + tests), not a product decision — ux should own wrapping these CLI commands in an actual chat surface once this extends past the CLI, and spec owns nothing here changing about how `generatePrd()` itself works.

## Context Refs

- `cli/task.py` (`cmd_setprd`, `STATES`) — the state-machine conventions this file mirrors.
- `dashboard/lib/prd-generator.ts` — the honest-degradation ("Generation Notes") pattern `estimate`'s pricing warnings and `screenshot_to_code_client.py`'s stub-flagging both reuse.
- `dashboard/lib/prd-pending.ts` — the disk-backed-not-ephemeral precedent `store/design-sessions/*.json` follows.
- `vps-scripts/install-tools.sh`, `vps-scripts/yvon-hermes-dashboard.service` — the venv-per-tool + loopback-systemd conventions `deploy-screenshot-to-code.sh` and its unit file mirror.
