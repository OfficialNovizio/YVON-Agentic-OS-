# YVON Chat — Command Layer, Runtime & Workflow Visibility

**Governs:** `/chat` as the primary working surface — the command layer, the
Hermes runtime it drives, the pipeline view, and the preview/deploy loop.
**Companion:** `docs/YVON-GRAPH.md` (shares the `events` table and
`context_id` contract) · `docs/MASTER.md` PART 7 (execution scenarios).

**Goal:** make chat good enough to run the rest of the work from. Everything
here is ordered by that, not by size.

Every claim verified against the repo on **2026-08-04**. Status markers:
`[built]` verified present · `[partial]` started · `[planned]` no code yet ·
`[hypothesis]` needs a live check before acting.

---

## Table of Contents

- [0 · What is broken and why](#0--what-is-broken-and-why)
- [1 · Chat layout — the scroll bug](#1--chat-layout--the-scroll-bug)
- [2 · The command layer](#2--the-command-layer)
- [3 · `/switch` — the four-part switch](#3--switch--the-four-part-switch)
- [4 · Hermes runtime — diagnose, then patch](#4--hermes-runtime--diagnose-then-patch)
- [5 · Live pipeline panel](#5--live-pipeline-panel)
- [6 · Preview environments & the deploy gate](#6--preview-environments--the-deploy-gate)
- [7 · Current state vs remaining work](#7--current-state-vs-remaining-work)
- [8 · Invariants & failure modes](#8--invariants--failure-modes)
- [A — Diagnostic probe](#appendix-a--diagnostic-probe)
- [B — Command catalog](#appendix-b--command-catalog)
- [C — Open decisions](#appendix-c--open-decisions)

---

## 0 · What is broken and why

Five complaints, four distinct root causes. None of them share a fix.

| Symptom | Root cause | Where | Status |
|---|---|---|---|
| Slash commands do nothing | no command layer exists anywhere | `dashboard/app/chat/*` | `[planned]` |
| Shell commands not recognised | terminal toolset likely not loaded for the wrapper's platform | Hermes on VPS | `[hypothesis]` |
| …and would be useless if they were | wrong cwd + read-only filesystem | `systemd` unit + `config.yaml` | `[built]` — verified defects |
| Must scroll to reach the textbox | double-counted viewport padding | `Shell.tsx` + `chat/page.tsx` | `[built]` — verified defect |
| Can't see the workflow running | phase data streamed, then discarded | `stream/route.ts` | `[partial]` |
| No local preview | never built; needs a filesystem, Vercel has none | — | `[planned]` |

**One defect underlies more than it appears to.** In
`dashboard/app/api/chat/stream/route.ts:55`:

```ts
const workspace: WorkspaceKey = 'yvon-os'
```

Hardcoded. Every event ever emitted carries `context_id='yvon-os'` regardless of
which venture you are working in. That single line is why brand satellites in
`/brain` would never light, why agent memory can't separate by brand, and it is
the first thing `/switch` must change.

---

## 1 · Chat layout — the scroll bug

### 1.1 The arithmetic

`dashboard/components/Shell.tsx`:

```
:71   <div className="flex h-screen bg-background text-on-surface overflow-hidden">
:113    <main className="flex-1 overflow-y-auto">
:114      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
```

`dashboard/app/chat/page.tsx`:

```
:339  <div className="flex h-[calc(100vh-1rem)] flex-col p-2 md:h-[calc(100vh-2rem)] md:p-4">
```

At the `lg` breakpoint Shell's wrapper adds **32px top + 32px bottom = 4rem** of
vertical padding. The chat page subtracts only **2rem**. The chat column is
therefore 2rem taller than the space it was given, `<main>` becomes scrollable,
and the composer sits below the fold — on every single message.

### 1.2 Why tweaking the calc is the wrong fix

The number is breakpoint-dependent (`p-4` / `sm:p-6` / `lg:p-8` = 2rem / 3rem /
4rem of vertical padding). Any calc you hardcode is correct at exactly one
breakpoint. And `100vh` is not the visible height on mobile — browser chrome
overlays it, which `viewportFit: 'cover'` in `app/layout.tsx` makes worse
without `dvh` and safe-area insets.

**Any future full-height page hits this same bug.** It is a Shell defect that
happens to be visible in chat first.

### 1.3 The fix

Two changes, both structural:

1. **Shell grows a full-bleed mode.** Pages that fill the viewport opt out of
   the padding wrapper; Shell hands them a correctly-sized flex child instead.
2. **Chat stops doing viewport math.** `h-full min-h-0` and let flex size it.
   `min-h-0` is required — without it a flex child refuses to shrink below its
   content and the overflow reappears one level down.

Mobile additionally needs `100dvh` and `env(safe-area-inset-bottom)` padding on
the composer, or the textarea sits under the home indicator.

**Verification:** at 375×667, 768×1024 and 1920×1080, the composer is visible
without scrolling, and `<main>` has no scrollbar while the message list does.

---

## 2 · The command layer

### 2.1 Nothing catches commands today

Grepped `dashboard/app/chat/*` for `startsWith('/')`, `slashCommand`, and
command dispatch: **zero matches.** A leading `/` is sent to Hermes as ordinary
prose. The model may narrate switching projects; nothing switches.

### 2.2 The principle

> **A deterministic action must never be a model decision.**

Asking an LLM to switch projects, deploy, or run tests is a probabilistic call
on something with a correct answer. Commands execute directly and report
factually. The model is not consulted and cannot decline.

Corollary: a command that fails must say so plainly. Silent success on a
no-op is the failure mode that makes an operator distrust the whole surface.

### 2.3 Interception point — `POST /api/chat/send`

Chosen over client-side and over Hermes tools:

| Where | Why not |
|---|---|
| `Composer.tsx` (client) | no server auth; cookie and Supabase writes need an API call anyway, so most commands round-trip regardless |
| Hermes tools (VPS) | needs a VPS deploy per command, and turns deterministic actions back into model decisions |
| **`/api/chat/send`** | **chosen** — server-side, authenticated, cookies available, one registry serves every surface |

`send/route.ts` already authenticates, resolves the profile, parses mentions,
and inserts the row. Command dispatch goes **before** the insert.

### 2.4 Dispatch contract

```ts
// dashboard/lib/commands/types.ts
export interface CommandContext {
  userId: string
  roomId: string
  args: string[]
  raw: string
  supabase: SupabaseClient
  cookies: ReadonlyRequestCookies
}

export interface CommandResult {
  ok: boolean
  /** rendered into chat as an author_kind='system' message */
  message: string
  /** client-side follow-up: 'reload' | 'navigate' | 'none' */
  effect?: { kind: 'reload' } | { kind: 'navigate'; href: string } | { kind: 'none' }
  /** structured detail for the pipeline panel */
  detail?: Record<string, unknown>
}

export interface Command {
  name: string
  aliases?: string[]
  summary: string
  usage: string
  /** commands that touch infrastructure require an explicit confirm step */
  confirm?: boolean
  run(ctx: CommandContext): Promise<CommandResult>
}
```

Rules the registry enforces:

- **Unknown command is an error, never a fallthrough.** `/swich novizio` must
  say "unknown command" and suggest `/switch`, not silently ask the model.
  Fallthrough is how a typo becomes a confusing conversation.
- **Every command has `usage`,** and `/help` is generated from the registry —
  so a command cannot exist without being discoverable.
- **Results are persisted** as `author_kind='system'` messages, so the room
  history shows what was done and by whom.
- **Commands emit events** to the same `events` table with `kind='command.run'`
  and the room's `correlation`, so the pipeline panel and `/brain` both see them.

### 2.5 Confirmation for destructive commands

`confirm: true` commands (deploy, restart, anything writing to the VPS) return a
prompt first and execute only on an explicit follow-up. The confirmation token
is bound to `(userId, roomId, command, args)` and expires — so an accidental
second Enter cannot fire yesterday's deploy.

---

## 3 · `/switch` — the four-part switch

`/switch novizio` must change four things. Doing fewer produces a UI that lies
about what the agent is operating on.

| # | What | Mechanism | Status |
|---|---|---|---|
| 1 | Dashboard scope | `yvon_active_venture` cookie | `[built]` |
| 2 | Agent context | `workspace` → `events.context_id`, memory namespace | `[partial]` — hardcoded |
| 3 | Hermes working directory | terminal cwd → that project's checkout | `[planned]` |
| 4 | Graphify / CIE retrieval | project root → that project's `graphify-out/` | `[planned]` |

### 3.1 Part 1 — dashboard scope `[built]`

`POST /api/set-venture` sets `yvon_active_venture` (`httpOnly: false`, 1 year,
`sameSite: lax`), read by `VentureSwitcher` and `lib/venture-context.ts`.
`/switch` reuses this endpoint's logic rather than duplicating it.

### 3.2 Part 2 — agent context `[partial]`

`dashboard/lib/workspaces.ts` already maps the four scopes and carries
`ventureSlug`:

```ts
export type WorkspaceKey = 'yvon-os' | 'novizio' | 'hourbour' | 'agentx'
```

`stream/route.ts:55` hardcodes `'yvon-os'`. It must read the cookie instead.

> **Contract:** the value passed as `workspace` becomes `events.context_id` via
> `main.py` → `events.py`. Per `YVON-GRAPH.md` §1.2 that must be
> `ventures.context_path`, not the bare slug. `WorkspaceKey` is a static union
> of four and cannot represent a client — it has to become a runtime lookup
> against `ventures` when the context graph lands.

### 3.3 Part 3 — Hermes working directory `[planned]`

`ventures.local_repo_path` already exists (`038_venture_local_repo_path.sql`) —
this is the per-project checkout path, and it is the input to a cwd switch.

**The hard constraint: cwd is process-global, sessions are not.**

`main.py` pools one `AIAgent` per `(user_id, room_id)` inside a single uvicorn
process. A `chdir()` would change the directory for **every** concurrent
session, including other users' — so two people working on different projects
would silently corrupt each other's context. This is a data-integrity problem,
not a nuisance.

Three ways out, in order of preference:

| Approach | Isolation | Cost |
|---|---|---|
| **Per-session cwd passed to the tool call** | correct | needs Hermes to accept a per-invocation cwd — unverified, see [§4](#4--hermes-runtime--diagnose-then-patch) |
| **Worker process per project** | correct | process management, ports, memory |
| **Global chdir** | **none** | trivial — and unsafe. Rejected. |

**Do not implement a global `chdir()`,** even as a stopgap. Silent cross-session
corruption is worse than the feature being absent.

### 3.4 Part 4 — Graphify / CIE retrieval `[planned]`

`src/adapters/config.ts` resolves everything from `detectProjectRoot()`, which
walks up from `process.cwd()` looking for `yvon.config.json` or `package.json`:

```
projectRoot     → cwd walk-up
graphifyReport  → <root>/graphify-out/GRAPH_REPORT.md
teamsPath       → <root>/Teams
agentMemoryDir  → <root>/agent-memory
```

**This means retrieval already follows the project root — for free.** Switch the
root and Graphify, CIE, Teams and memory all follow. Nothing needs a per-project
config table.

**But the dashboard cannot use it today.** There are two Graphify sources and
only one is real:

| File | State |
|---|---|
| `src/cie/sources/graphify.ts` | real — parses `GRAPH_REPORT.md`, mtime cache, `queryGraphify()` scores communities |
| `dashboard/lib/cie/sources/graphify.ts` | **stub** — `queryGraphify()` returns `''`, marked `TODO: wire to real graphify backend` |

So chat-side retrieval currently gets **nothing** from Graphify regardless of
project. Part 4 is therefore two jobs: wire the dashboard source to the real
implementation, *then* make it project-aware. Making it project-aware first
would produce a switch that correctly points at a source that returns nothing.

The real implementation inherits the same global-state problem as §3.3, plus one
more — it caches by mtime in module scope:

```ts
let cachedCommunities: GraphifyCommunity[] | null = null
let cachedMtime: number = 0
```

Switching projects changes the *path*, not the mtime. **A stale cache from the
previous project will be served** because the mtime check passes against a
different file. `invalidateGraphifyCache()` exists and must be called on every
switch — or better, the cache key becomes the path, not module scope.

*Repo hygiene:* `src/adapters/config.ts` declares `cachedConfig` and
`configMtime` but `getConfig()` never reads them, and `invalidateConfig()`
clears a cache that is never used. Dead code — remove or wire it, but do not
leave a no-op invalidator that a future session will trust.

### 3.5 Sequencing

Parts 1 and 2 have no VPS dependency and deliver the visible half of the
feature: the UI stops lying, and events land under the right brand. Parts 3 and
4 are gated on [§4](#4--hermes-runtime--diagnose-then-patch).

Ship 1+2 first. **`/switch` must report which parts took effect** — "scope and
agent context switched; Hermes working directory unchanged (not yet wired)" —
rather than implying a full switch.

---

## 4 · Hermes runtime — diagnose, then patch

Three defects. Two are verified from tracked files; one is a hypothesis that
must be checked on the live box **before** anything is changed.

### 4.1 Defect A — terminal cwd is the wrapper's folder `[built]`

`vps-scripts/hermes-config.contabo.yaml`:

```yaml
terminal:
  backend: local
  cwd: .          # ← relative to the process working directory
  timeout: 180
```

`vps-scripts/yvon-hermes-http/systemd/yvon-hermes-http.service`:

```ini
WorkingDirectory=/opt/yvon-hermes-http
```

So `.` resolves to `/opt/yvon-hermes-http`. Every shell command runs there.
`git status` → "not a git repository". `ls` → `main.py`, `pyproject.toml`.

### 4.2 Defect B — the repo is read-only to Hermes `[built]`

Same unit:

```ini
ProtectSystem=strict
ReadWritePaths=/root/.hermes /var/log /usr/local/lib/hermes-agent/logs
```

`ProtectSystem=strict` mounts the **entire filesystem read-only** except the
listed paths. The YVON checkout is not among them. Even with the cwd corrected,
Hermes cannot write a single file in the repo — no `git pull`, no
`npm install`, no edits. Every write fails with a read-only filesystem error.

> This hardening is correct in intent and must not simply be deleted. The fix is
> to add the specific project checkouts to `ReadWritePaths` — not to weaken
> `ProtectSystem`. A wrapper that can write anywhere on the box is a much larger
> problem than one that cannot write your repo.

### 4.3 Defect C — the terminal toolset may not be loaded `[hypothesis]`

`hermes-config.contabo.yaml` groups tools by platform:

```yaml
platform_toolsets:
  cli: [bfl, browser, clarify, code_execution, computer_use, context_engine,
        cronjob, delegation, file, image_gen, memory, session_search, skills,
        terminal, todo, tts, video, video_gen, vision, web]
  telegram: [hermes-telegram]
  …
```

`terminal` and `code_execution` appear **only** under `cli`. The wrapper does
not run as the CLI platform — `main.py` imports `run_agent.AIAgent` directly:

```python
agent = AIAgent(
    session_id=f"web-{user_id}-{room_id}",
    model=…, provider=…, max_iterations=MAX_ITERATIONS,
    quiet_mode=True, save_trajectories=False,
    skip_context_files=False, load_soul_identity=False, skip_memory=False,
)
```

No platform argument is passed. **If `AIAgent` defaults to a platform whose
toolset excludes `terminal`, no shell tool is registered at all** — which
matches "not recognized" exactly, and would also explain why the failure looks
different from a permissions error.

This cannot be settled from the repo. `hermes-agent` lives at
`/usr/local/lib/hermes-agent/` on the VPS and is not tracked here.

**Run [Appendix A](#appendix-a--diagnostic-probe) before changing anything.**
The probe distinguishes "tool absent" from "tool present but failing", and those
have opposite fixes. Changing systemd hardening on an unconfirmed hypothesis
risks weakening the box for no benefit.

### 4.4 What the patch will contain, once confirmed

Written here so it can be reviewed before it is run — not applied yet.

- **cwd** — set per project rather than a fixed `.`; source of truth is
  `ventures.local_repo_path`
- **`ReadWritePaths`** — add each project checkout explicitly. `ProtectSystem=strict`
  stays.
- **toolset** — pass the platform (or explicit toolset list) that includes
  `terminal` and `code_execution` when constructing `AIAgent`, if the probe
  shows they are absent
- **timeout** — `terminal.timeout: 180` against `code_execution.timeout: 300`
  and `YVON_HERMES_MAX_ITER=40`; a `next build` will exceed 180s and be killed
  mid-run. Raise before expecting builds to work from chat.

All four go into `vps-scripts/` as tracked files. The existing config header
says it plainly: the toolset must never again be knowable only from a server
that might be decommissioned.

---

## 5 · Live pipeline panel

### 5.1 The data already flows — and is thrown away

`main.py` streams these SSE kinds today `[built]`:

```
token · done · error · ping
thinking · tool_call.start · tool_call.end · notice
```

`stream/route.ts` forwards them to the browser, which renders and discards them.
Meanwhile `events.py` persists only three kinds: `run.started`,
`run.completed`, `run.failed`.

So the phase detail exists in flight and vanishes. Nothing can show what
happened thirty seconds ago, and `/brain` sees only start and end.

### 5.2 Emit phases as events

Same table, same `correlation` — `YVON-GRAPH.md` §1.4.

```
run.started          already emitted
phase.classify       CAOS: intent + department resolution
phase.resolve        agent + skill selection
phase.retrieve       CIE/RAG chunk selection  (payload: sources, count)
tool.call            one tool invocation      (payload: tool, ok, ms)
gate.passed          a verification gate cleared
gate.blocked         a gate refused           (payload: gate, reason)
loop.iteration       retry / dissatisfaction loop (payload: n, why)
run.completed | run.failed
```

Three properties make this work:

- **One `correlation` per turn** — already generated in `main.py`. Every phase
  shares it, so a turn reconstructs with one indexed query.
- **`gate.blocked` carries its reason.** A gate that blocks without saying why
  is indistinguishable from a crash.
- **`loop.iteration` is what makes looping visible.** Without it a retry looks
  like a slow first attempt, which is the single most confusing thing an agent
  can do to an operator.

> **Emission must stay fire-and-forget.** `events.py` already runs on a daemon
> thread swallowing every exception. Phase emission is higher-volume than run
> emission; if it ever blocks, it degrades every turn. Observability that can
> take down execution is worse than none.

### 5.3 The panel

Beside the conversation, scoped to the current turn:

```
┌─ pipeline ──────────────────────────┐
│ ● classify    intent → engineering  │
│ ● resolve     @mia · frontend-verif │
│ ● retrieve    7 chunks · 3 sources  │
│ ◐ tool        Read ×4 · Edit ×1     │
│ ○ gate        pending               │
└─────────────────────────────────────┘
```

Live from SSE for the in-flight turn; from `events` for any past turn — same
renderer, two sources, because the event shapes are identical. A completed turn
stays inspectable, which is the whole point.

`ContextPanel.tsx` already exists (151 lines) and is where this belongs.

### 5.4 What this does **not** do

It does not replace `cli/verify-caos.py`. That is a test that exercises
CLASSIFY→RESOLVE→RETRIEVE→EXECUTE→GATE→FEEDBACK→CACHE deliberately. The panel
observes real turns. Both are needed: the test proves the pipeline can work, the
panel shows whether it did.

*Terminology:* the repo uses **CAOS** (CLASSIFY → RESOLVE → RETRIEVE → GATE) and
**CIE** (`src/cie/`). "CIA" and "CIAOS" do not appear anywhere — see
[Appendix C](#appendix-c--open-decisions).

---

## 6 · Preview environments & the deploy gate

### 6.1 The gate you already have `[built]`

`cli/deploy.sh` → `cli/verify-deploy.sh` → `git push` → `cli/vercel-watch.sh` →
`cli/vercel-classify.sh` on failure. Wired into `.git/hooks/pre-push` via
`cli/install-hooks.sh`. This is a real pipeline and should not be replaced.

`verify-deploy.sh` runs 8 static checks in ~2s: undeclared imports, bare
`supabase.<verb>()`, `Promise.all` destructure mismatch, duplicate
`next.config.*`, cron count vs Hobby limit, `.gitignore` coverage, `tsc
--noEmit`, middleware Edge safety.

### 6.2 The gap

**All 8 are static. Nothing runs the app.** A bug that only appears at runtime —
a failing fetch, an RLS denial, a hydration mismatch, a client component
importing server-only code — passes the gate and dies on Vercel.

Playwright is configured (`baseURL: http://localhost:3000`, `webServer` block,
`chat-sse.spec.ts` and `tasks.spec.ts`) and is **not** in the gate.

### 6.3 Two tiers, not one

The 2s gate is valuable *because* it is 2s — it runs on every push without
friction. Adding a 90s build to it destroys that.

| Tier | Runs | When | Time |
|---|---|---|---|
| `verify-deploy.sh` | 8 static checks | every push (hook) | ~2s |
| `verify-deploy.sh --full` | + `next build` + Playwright smoke | before a risky push; on demand | ~90s |

`/deploy` from chat runs the full tier, streams progress into the pipeline
panel, and returns the Vercel URL — using `deploy.sh` rather than reimplementing
it.

### 6.4 Preview: Vercel, not a VPS dev server

You chose Vercel previews. The reasoning holds up:

| | Vercel preview | VPS `next dev` |
|---|---|---|
| Time to URL | ~40s | seconds |
| New infra | none | process mgr, ports, subdomains, cleanup |
| Environment fidelity | **identical to production** | differs from prod |
| Concurrent branches | unlimited | bounded by RAM |

The fidelity row is what decides it. A preview that differs from production
reproduces bugs production doesn't have and hides ones it does.

`/preview` pushes the current branch, waits for the preview URL, and posts it
into chat. `cli/worktree-gen.py` already exists, so per-branch worktrees are
available if you want several in flight.

**Deferred, not rejected:** a VPS dev server is the right answer if the 40s
feedback loop proves too slow in practice. Revisit with evidence, not upfront.

---

## 7 · Current state vs remaining work

*§7 refreshed 2026-08-04 after the TS-018 rollout (command layer, /switch 1–2,
Shell full-bleed, phase events, pipeline panel, deploy-gate --full, Supabase
foundation, engineering docs).*

### Built

| Thing | Evidence |
|---|---|
| SSE chat transport | `main.py` `/v1/chat/stream`, 8 event kinds |
| Status events in flight | `thinking`, `tool_call.start/end`, `notice` |
| Run lifecycle persistence | `events.py` + `_emit_all` with `correlation` |
| Session pooling | `(user_id, room_id)`, 30-min idle TTL |
| Venture cookie + switcher | `/api/set-venture`, `lib/venture-context.ts` |
| Per-project repo path column | `038_venture_local_repo_path.sql` |
| cwd-driven config resolution | `src/adapters/config.ts` `detectProjectRoot()` |
| Deploy gate + Vercel watch | `cli/deploy.sh`, `verify-deploy.sh`, `vercel-watch.sh` |
| E2E harness | `dashboard/tests/e2e/`, Playwright `webServer` |
| Chat UI components | 10 files, 1,910 lines under `app/chat/` |
| Command registry + dispatch | `dashboard/lib/commands/*` — 7 commands, dispatch before insert in `send/route.ts` (TS-018 WI-1) |
| Confirm-token flow | `confirm-tokens.ts` — sha256 store, 10-min expiry, single-use, (user, room, cmd, args) binding |
| `/switch` parts 1–2 | cookie set (reuses set-venture logic) + `stream/route.ts` reads it; reports parts 3–4 honestly |
| Shell full-bleed mode | `Shell.tsx` full-bleed context + `chat/page.tsx` `h-full min-h-0`; `dvh` + safe-area |
| Phase event kinds (wrapper-observable) | `events.py` vocabulary + `main.py` emits `phase.classify/resolve`, `tool.call` with correlation |
| Pipeline panel | `ContextPanel.tsx` + `lib/pipeline.ts` — live (SSE) + past (events), same renderer |
| Deploy gate `--full` tier | `verify-deploy.sh --full` — next build + Playwright smoke; tier-1 unchanged |
| `/preview`, `/deploy` commands | registered `[built]`; executors `[planned]` (Appendix C #6) |
| Supabase foundation | `migrations/106_chat_commands.sql` — system kind, audit, tokens, correlation, definer writers (needs `supabase db push`) |
| Hermes patch plan | `vps-scripts/hermes-patch-notes.md` — probe-gated, not applied |
| Engineering + CAOS docs | `docs/CHAT-ENGINEERING.md` — 11-agent roster + CAOS design from `MASTER.md` |
| **Command-deck redesign** | TS-020: icon dock + Teams slide-over (`DockRail`/`TeamsPanel`), markdown thread + streaming bubble (`MessageStream`/`Markdown`), command cards (`CommandCard`), live strip + pipeline HUD (`LiveStrip`/`PipelineHud`), `/` command popover from the registry (`Composer` + `/api/chat/commands`), real skill chips (`/api/fleet/skills`), ⌘T/⌘K — all bound to real data |

### Partial

| Thing | Missing |
|---|---|
| Workspace scoping | fixed for the dashboard (`stream/route.ts` reads the cookie); `WorkspaceKey` still a static union of 4 — runtime lookup against `ventures` after `YVON-GRAPH.md` §1.2 lands |
| Phase observability | wrapper-observable kinds emitted; `phase.retrieve` / `gate.*` / `loop.iteration` reserved until hermes-agent exposes phase hooks (probe-gated) |
| Playwright | `--full` tier exists; pre-push hook stays tier-1 only by design (§6.3) |
| Graphify retrieval in chat | `dashboard/lib/cie/sources/graphify.ts` is still a stub returning `''` |
| Migration 106 | code `[built]`; requires `supabase db push` + verify |
| Agent-reply author forgery gap | pre-existing: any authenticated user can write `author_kind='agent'`; close with a service-role write path (documented in migration 106) |

### Missing / probe-gated

| Thing | Section |
|---|---|
| Hermes cwd + write access + toolset (defects A–C) | [§4](#4--hermes-runtime--diagnose-then-patch) — patch written in `vps-scripts/hermes-patch-notes.md`, blocked on Appendix A probe |
| `/deploy`, `/preview` executors | [Appendix B](#appendix-b--command-catalog) — commands report honestly until an executor is configured (Appendix C #6) |
| `phase.retrieve` / `gate.*` / `loop.iteration` emission | [§5.2](#52-emit-phases-as-events) — needs hermes-agent phase hooks |

---

## 8 · Invariants & failure modes

### 8.1 Commands never fall through to the model

An unrecognised `/command` is an error with a suggestion. Falling through means
a typo becomes a conversation, and the operator cannot tell whether the action
happened.

### 8.2 A command reports what it actually did

Partial success is reported as partial. `/switch` reporting a full switch when
Hermes's cwd did not move trains you to trust a display that is wrong.

### 8.3 cwd is process-global; sessions are not

See [§3.3](#33-part-3--hermes-working-directory-planned). No global `chdir()` in
a pooled multi-session process. Ever.

### 8.4 The `context_id` contract

`workspace` → `main.py` → `events.context_id` → the graph's satellite filter.
Three systems agree on this string; `YVON-GRAPH.md` §6.1 owns the contract. A
change here silently stops nodes lighting.

### 8.5 Telemetry cannot break a turn

Fire-and-forget, exceptions swallowed, as `events.py` already does.

### 8.6 Path-keyed caches, not module-scope caches

`src/cie/sources/graphify.ts` caches by mtime in module scope. On a project
switch the path changes but the mtime check still passes — serving the previous
project's graph. Key by path, or invalidate on every switch.

### 8.7 Hardening stays; scope widens

Fix `ProtectSystem=strict` by adding explicit `ReadWritePaths`, never by
relaxing the directive.

### 8.8 Failure modes

| # | Failure | Symptom | Mitigation |
|---|---|---|---|
| 1 | Global chdir across sessions | two users' work interleaves silently | per-session cwd or per-project worker (§3.3) |
| 2 | Stale Graphify after switch | agent cites the wrong project's code | path-keyed cache (§8.6) |
| 3 | Command typo falls through | model answers instead of acting | unknown-command error (§8.1) |
| 4 | Confirm token replay | an old `/deploy` fires | bind to (user, room, cmd, args) + expiry (§2.5) |
| 5 | `next build` killed at 180s | build "fails" with no error | raise `terminal.timeout` (§4.4) |
| 6 | Phase emission blocks a turn | chat slows under load | daemon thread, swallow (§8.5) |
| 7 | Workspace stays `'yvon-os'` | brand satellites never light | §3.2 |
| 8 | Shell hardening relaxed to fix writes | wrapper can write anywhere | explicit paths only (§8.7) |

---

## Appendix A — Diagnostic probe

**Run this before changing anything on the VPS.** It distinguishes "terminal
tool absent" from "terminal tool present but blocked", which have opposite
fixes. Read-only — it changes nothing.

```bash
# ── On the VPS, as root ────────────────────────────────────────────────────

# 1. Is the wrapper alive, and what is its actual working directory?
systemctl show yvon-hermes-http -p WorkingDirectory -p MainPID
readlink -f /proc/$(systemctl show -p MainPID --value yvon-hermes-http)/cwd

# 2. What does the mount namespace actually allow it to write?
#    (ProtectSystem=strict is enforced per-process — this is ground truth.)
cat /proc/$(systemctl show -p MainPID --value yvon-hermes-http)/mounts \
  | grep -E ' (ro|rw),' | head -20

# 3. Where is the YVON checkout on this box — if anywhere?
ls -d /root/Agents /opt/Agents /srv/Agents 2>/dev/null
find / -maxdepth 4 -name yvon.config.json -not -path '*/node_modules/*' 2>/dev/null

# 4. THE KEY QUESTION — which tools does a web session actually have?
#    Ask the running agent to enumerate its own toolset.
TOKEN=$(cat /etc/yvon-hermes/token)
curl -sN -X POST http://127.0.0.1:8765/v1/chat/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"message":"List every tool you currently have available, by name only. Then state your current working directory. Do not guess — if you have no shell tool, say exactly that.","user_id":"probe","room_id":"probe"}' \
  | grep -E '"kind":"(token|tool_call|done|error)"' | tail -40

# 5. Does the terminal tool exist and function?
curl -sN -X POST http://127.0.0.1:8765/v1/chat/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"message":"Run exactly: pwd && whoami && git rev-parse --show-toplevel","user_id":"probe","room_id":"probe"}' \
  | grep -E '"kind":"(tool_call|token|error)"' | tail -30

# 6. Live config — the tracked copy is a record, not the truth
grep -A6 -E '^(terminal|code_execution):' /root/.hermes/config.yaml
grep -A4 '^platform_toolsets:' /root/.hermes/config.yaml

# 7. Is the Hermes dashboard API up? (catalog notes it returned empty on 08-01)
ss -tlnp | grep -E '9119|8765'
```

**How to read the result**

| Probe 4/5 shows | Meaning | Fix |
|---|---|---|
| No terminal/shell tool listed | Defect C confirmed — toolset not loaded | pass the platform/toolset to `AIAgent` (§4.4) |
| Tool listed, `pwd` = `/opt/yvon-hermes-http` | Defect A only | set cwd per project |
| Tool listed, writes fail read-only | Defect B | add checkouts to `ReadWritePaths` |
| Tool listed, `git rev-parse` fails | no checkout on the box | clone it; also blocks the Graphify cron in `YVON-GRAPH.md` §4.4 |

Paste the output back and the patch gets written against facts.

---

## Appendix B — Command catalog

First release in bold; the rest are the shape it grows into.

| Command | Does | Confirm | Depends on |
|---|---|---|---|
| **`/help`** | lists commands from the registry | — | §2.4 |
| **`/switch <slug>`** | scope + agent context (parts 1–2) | — | §3.1–3.2 |
| **`/where`** | prints active venture, workspace, Hermes cwd, project root | — | §3, §4 |
| `/agents [dept]` | fleet from `structure.json`, with live status | — | `YVON-GRAPH.md` §1.1 |
| `/status` | Hermes health, session pool, last deploy | — | `/v1/pool`, `/healthz` |
| `/deploy [--full]` | runs `cli/deploy.sh`, streams to the panel | **yes** | §6.3 |
| `/preview` | pushes branch, returns Vercel preview URL | **yes** | §6.4 |
| `/test [pattern]` | Playwright, results into chat | — | §6.3 |
| `/graph rebuild` | triggers the Graphify rebuild | **yes** | `YVON-GRAPH.md` §4.4 |
| `/task <id>` | TASK-SPEC record from `store/tasks/` | — | `MASTER.md` PART 6 |
| `/trace [correlation]` | full phase timeline for a turn | — | §5.2 |
| `/clear` | drops the pooled session for this room | — | `/v1/pool/drop` |

`/where` is deliberately in the first release. While `/switch` is partial, you
need one command that states the truth about what is actually pointed where.

---

## Appendix C — Open decisions

| # | Question | Why it matters | Status |
|---|---|---|---|
| 1 | Probe output | decides whether Defect C is real and what the patch does | **blocking §4** |
| 2 | Is the YVON repo checked out on the VPS at all? | blocks `/switch` parts 3–4 *and* the Graphify cron | **blocking §3.3** |
| 3 | Does Hermes accept a per-invocation cwd? | decides per-session vs per-project-worker (§3.3) | needs probe |
| 4 | "CIA" / "CIAOS" | repo has **CAOS** and **CIE**; confirm which you meant, or whether a third thing exists that isn't in the repo | needs answer |
| 5 | `WorkspaceKey` → runtime lookup | the static union of 4 cannot hold a client context | after `YVON-GRAPH.md` §1.2 lands |
| 6 | Where does `/deploy` execute? | Vercel can't run `deploy.sh`; it needs the VPS or CI | after §4 |

---

*Sources: verified against `dashboard/app/chat/{page,Composer,ContextPanel,MessageStream}.tsx`,
`dashboard/app/api/chat/{send,stream}/route.ts`, `dashboard/app/api/set-venture/route.ts`,
`dashboard/components/Shell.tsx`, `dashboard/lib/workspaces.ts`,
`src/cie/sources/graphify.ts` and its dashboard stub, `src/adapters/config.ts`,
`vps-scripts/hermes-config.contabo.yaml`,
`vps-scripts/yvon-hermes-http/{main.py,events.py,README.md,systemd/yvon-hermes-http.service}`,
`cli/{deploy.sh,verify-deploy.sh,vercel-watch.sh}`, `dashboard/playwright.config.ts`,
`dashboard/supabase/migrations/038_venture_local_repo_path.sql`, `store/hermes-api-catalog.json`.*
