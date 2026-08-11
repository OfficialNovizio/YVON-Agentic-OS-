# YVON Chat — Command Layer, Runtime & Workflow Visibility

**Governs:** `/chat` as the primary working surface — the command layer, the
Hermes runtime it drives, the pipeline view, and the preview/deploy loop.
**Companion:** `system-harness/graph-brain/YVON-GRAPH.md` (shares the `events` table and
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

**This section describes the pre-TS-018 starting point (2026-08-04) — most of
it is fixed. Re-checked against live code 2026-08-10, kept as a record of the
original diagnosis, corrected column added.**

| Symptom | Root cause | Where | 2026-08-04 status | 2026-08-10 status |
|---|---|---|---|---|
| Slash commands do nothing | no command layer exists anywhere | `dashboard/app/chat/*` | `[planned]` | ✅ **fixed** — 7 commands (`help switch where clear confirm deploy preview`) dispatch for real, checked against the registry directly |
| Shell commands not recognised | terminal toolset likely not loaded for the wrapper's platform | Hermes on VPS | `[hypothesis]` | `[mitigated in code, unconfirmed live]` — `main.py` now tries `platform="cli"` → `toolset="cli"` → bare, each fallback logged; no VPS shell access to confirm it actually resolves on the box |
| …and would be useless if they were | wrong cwd + read-only filesystem | `systemd` unit + `config.yaml` | `[built]` — verified defects | **still broken** — `docs/MASTER-PLAN.md` §2 re-checked 2026-08-09: both defects still unpatched, no per-project cwd logic, no checkout in `ReadWritePaths` |
| Must scroll to reach the textbox | double-counted viewport padding | `Shell.tsx` + `chat/page.tsx` | `[built]` — verified defect | ✅ **fixed** — Shell full-bleed mode shipped (§7 Built table, TS-018) |
| Can't see the workflow running | phase data streamed, then discarded | `stream/route.ts` | `[partial]` | ✅ **built** — pipeline panel (TS-018) plus TS-028's full real-time expandable HUD (6 sections); see `docs/MASTER-PLAN.md` §1 |
| No local preview | never built; needs a filesystem, Vercel has none | — | `[planned]` | **still not built** — confirmed via `docs/MASTER-PLAN.md` §1 (P5): no `cli/local-dev.sh`, no `dashboard/app/dev-viewer/` |

**The hardcoded-workspace defect below is fixed — kept as history, not current
state.** It used to read, at `dashboard/app/api/chat/stream/route.ts:55`:

```ts
const workspace: WorkspaceKey = 'yvon-os'
```

That exact line is gone. The file now reads `activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validVentureSlugs)`
— confirmed directly against the source, with a code comment on-site citing
this fix (`TS-018 WI-2 (YVON-CHAT §3.2)`). Every event's `context_id` follows
the actual active venture now, not a fixed string.

---

## 1 · Chat layout — the scroll bug

### 1.1 The arithmetic

`dashboard/components/Shell.tsx`, as it was before the fix:

```
:71   <div className="flex h-screen bg-background text-on-surface overflow-hidden">
:113    <main className="flex-1 overflow-y-auto">
:114      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
```

`dashboard/app/chat/page.tsx`, as it was before the fix:

```
:339  <div className="flex h-[calc(100vh-1rem)] flex-col p-2 md:h-[calc(100vh-2rem)] md:p-4">
```

At the `lg` breakpoint Shell's wrapper adds **32px top + 32px bottom = 4rem** of
vertical padding. The chat page subtracts only **2rem**. The chat column is
therefore 2rem taller than the space it was given, `<main>` becomes scrollable,
and the composer sits below the fold — on every single message.

**Line numbers corrected 2026-08-10 — the fix (§1.3) landed and shifted the
file.** Shell.tsx today: `:94` the same wrapper (now also `supports-[height:
100dvh]:h-dvh`), `:136` `<main>` now branches on `fullBleed`, `:142` the old
padding div only runs on the *non*-fullBleed branch. `chat/page.tsx` today,
`:627`: `<div className="chat-shell flex h-full min-h-0 flex-col">` — chat
opts into `fullBleed` now, so it no longer takes the padding-math path at all;
the arithmetic above describes a bug chat itself can no longer hit. §1.2's
warning still holds for any *other* page that doesn't opt into `fullBleed`.

### 1.2 Why tweaking the calc is the wrong fix

The number is breakpoint-dependent (`p-4` / `sm:p-6` / `lg:p-8` = 2rem / 3rem /
4rem of vertical padding). Any calc you hardcode is correct at exactly one
breakpoint. And `100vh` is not the visible height on mobile — browser chrome
overlays it, which `viewportFit: 'cover'` in `app/layout.tsx` makes worse
without `dvh` and safe-area insets.

**Any future full-height page hits this same bug.** It is a Shell defect that
happens to be visible in chat first.

### 1.3 The fix `[built]` — confirmed against source 2026-08-10

Two changes, both structural, both shipped:

1. **Shell grows a full-bleed mode.** Pages that fill the viewport opt out of
   the padding wrapper; Shell hands them a correctly-sized flex child instead.
   Real: `ShellFullBleedContext` + the `fullBleed`-conditional `<main>` in
   `Shell.tsx`.
2. **Chat stops doing viewport math.** `h-full min-h-0` and let flex size it.
   `min-h-0` is required — without it a flex child refuses to shrink below its
   content and the overflow reappears one level down. Real:
   `chat/page.tsx:627`.

Mobile additionally needs `100dvh` and `env(safe-area-inset-bottom)` padding on
the composer, or the textarea sits under the home indicator. Real:
`Composer.tsx:258` — `paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0))'`.

**Verification:** the original acceptance criteria (375×667, 768×1024,
1920×1080 — composer visible without scrolling) — the code implementing it is
confirmed present and matches the design; a live-browser re-check at those
three sizes was not re-run in this pass.

---

## 2 · The command layer

### 2.1 Nothing caught commands — until TS-018 `[fixed]`

Original 2026-08-04 finding, kept as history: grepped `dashboard/app/chat/*`
for `startsWith('/')`, `slashCommand`, and command dispatch — zero matches. A
leading `/` went to Hermes as ordinary prose.

**Fixed, confirmed 2026-08-10.** `send/route.ts` now has
`if (content.startsWith('/')) { ... dispatchCommand(...) }` before the insert,
citing this exact section in its own comment. 7 real commands
(`help switch where clear confirm deploy preview`) dispatch through it.

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

**Corrected 2026-08-10 against the real file** — `types.ts`'s own header says
"do not diverge from this file without updating the doc," and this snippet
had: `supabase: SupabaseClient` was replaced by a minimal structural
`DbClient` (version-proof against `ssr`/`supabase-js` type churn — only
`.from()`/`.rpc()` are ever called), `cookies: ReadonlyRequestCookies` became
`RequestCookies` (`Awaited<ReturnType<typeof cookies>>`), and a real
`confirmed?: boolean` field was added — the flag `/confirm` sets when
re-running a command as the explicit follow-up (§2.5) — missing from the old
snippet entirely.

```ts
// dashboard/lib/commands/types.ts
export interface DbClient {
  from(table: string): any
  rpc(fn: string, args?: Record<string, unknown>): Promise<{
    data: unknown
    error: { message: string } | null
  }>
}

export type RequestCookies = Awaited<ReturnType<typeof cookies>>

export interface CommandContext {
  userId: string
  roomId: string
  args: string[]
  raw: string
  supabase: DbClient
  cookies: RequestCookies
  /** true when this run is the explicit follow-up after a confirm prompt */
  confirmed?: boolean
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
| 2 | Agent context | `workspace` → `events.context_id`, memory namespace | `[built]` — was hardcoded, fixed (§3.2) |
| 3 | Hermes working directory | terminal cwd → that project's checkout | `[planned]` |
| 4 | Graphify / CIE retrieval | project root → that project's `graphify-out/` | `[planned]` |

### 3.1 Part 1 — dashboard scope `[built]`

`POST /api/set-venture` sets `yvon_active_venture` (`httpOnly: false`, 1 year,
`sameSite: lax`), read by `VentureSelector.tsx` (renamed from `VentureSwitcher`
— corrected 2026-08-10, no file by the old name exists) and
`lib/venture-context.ts`. `/switch`'s command (`switch.ts`) sets the same
cookie directly rather than calling the endpoint — its own comment says
"mirrors POST /api/set-venture" — functionally equivalent, not a literal
call-through.

### 3.2 Part 2 — agent context `[built]` — corrected 2026-08-10, was `[partial]`

Both blockers this section used to describe are resolved, checked directly
against the source:

- `stream/route.ts` no longer hardcodes `'yvon-os'` — it now reads
  `activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validVentureSlugs)`
  (see §0's corrected callout).
- `dashboard/lib/workspaces.ts`'s `WorkspaceKey` is no longer the static
  4-item union this section originally described (`'yvon-os' | 'novizio' |
  'hourbour' | 'agentx'`) — it's `export type WorkspaceKey = string` now, so
  it *can* represent an arbitrary client. This is the runtime lookup the
  contract note below used to say was still needed — it landed as part of
  `docs/MASTER-PLAN.md`'s P1 (venture truth: no more hardcoded sub-brands,
  real DB rows only).

> **Contract (still true):** the value passed as `workspace` becomes
> `events.context_id` via `main.py` → `events.py`. Per
> `system-harness/graph-brain/YVON-GRAPH.md` §1.2 that must be
> `ventures.context_path`, not the bare slug — worth a direct check next time
> someone is in this code, since that specific mapping wasn't re-verified here.

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

**But the dashboard still doesn't use it today — for a different reason than
before.** Corrected 2026-08-10: `dashboard/lib/cie/sources/graphify.ts` (the
stub this section used to point at) doesn't exist anymore — `dashboard/lib/cie/`
was retired this session and `dashboard/app/api/claude/route.ts` now calls
`src/cie/sources/graphify.ts` directly via `buildCieContext()`. The stub is
gone. But `/api/claude` is not `/chat`'s generation path — checked, `/chat`
runs entirely through Hermes (`stream/route.ts` → `lib/hermes-client.ts` →
the VPS wrapper), a separate code path that never imports CIE or graphify at
all. Chat's own context injection (TS-025, `lib/context-resolver.ts`) is a
lighter-weight, purpose-built resolver — agent skills read straight off
`SKILL.md` files, venture memory from the `ventures` table — that bypasses
CIE/graphify entirely, by design, not by an unfinished stub.

**So the practical result is unchanged (chat still gets nothing from
Graphify) but the fix is not "finish wiring the stub."** There is no stub left
to wire. If Graphify-sourced context is wanted in chat, `context-resolver.ts`
would need a new source added, or `/chat`'s pipeline would need to route
through CIE the way `/api/claude` does — a design decision, not a leftover
TODO. Part 4 (project-aware retrieval) is downstream of that decision.

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

### 3.5 Sequencing `[1+2 shipped]` — corrected 2026-08-10

Parts 1 and 2 have no VPS dependency and deliver the visible half of the
feature: the UI stops lying, and events land under the right brand. Parts 3
and 4 are gated on [§4](#4--hermes-runtime--diagnose-then-patch). **1+2 are
now built** (§3.1, §3.2) — this used to be forward-looking sequencing advice,
now it's what already happened.

**`/switch` does report which parts took effect**, confirmed against
`switch.ts`'s real response — but its message had the same stale "Graphify
source is a stub" line the doc did (fixed in the same pass as this doc
correction, `dashboard/lib/commands/switch.ts`). Current real message: scope
switched, agent context follows next message, Hermes cwd unchanged (not yet
wired), Graphify retrieval unchanged (doesn't route through CIE — not "still
a stub," there's no stub left, see §3.4).

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

### 4.3 Defect C — the terminal toolset may not be loaded `[mitigated in code, unconfirmed live]` — corrected 2026-08-10, was `[hypothesis]`

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
not run as the CLI platform. **This is no longer the raw hypothesis it was —
`main.py` shipped a real mitigation (TS-018 WI-8/WI-12), confirmed against the
source:**

```python
# TS-018 WI-8/WI-12 — Defect C: try `platform`, then `toolset`, then bare —
# each fallback logs a warning. Exact kwarg name lives in hermes-agent source
# on the box (not tracked here), so this degrades loudly rather than guessing.
agent = None
for _kw, _val in (("platform", "cli"), ("toolset", "cli")):
    if agent is not None:
        break
    try:
        _agent_kwargs[_kw] = _val
        agent = AIAgent(**_agent_kwargs)
    except TypeError:
        del _agent_kwargs[_kw]
        log.warning("AIAgent rejected %s=%r, trying next fallback", _kw, _val)
if agent is None:
    agent = AIAgent(**_agent_kwargs)  # bare — last resort, logs its own warning
```

So the old snippet below (no platform argument, straight construction) no
longer matches `main.py` — kept for contrast:

```python
# STALE — this is what main.py used to do, not what it does now:
agent = AIAgent(
    session_id=f"web-{user_id}-{room_id}",
    model=…, provider=…, max_iterations=MAX_ITERATIONS,
    quiet_mode=True, save_trajectories=False,
    skip_context_files=False, load_soul_identity=False, skip_memory=False,
)
```

**What's still open:** whether this fallback chain actually lands on a kwarg
`AIAgent` accepts, on the real box, is unconfirmed — `hermes-agent` lives at
`/usr/local/lib/hermes-agent/` on the VPS and is not tracked here, and there's
no VPS shell access in this session to check. The mitigation is real code, not
a hope; it just hasn't been observed working live.

**Run [Appendix A](#appendix-a--diagnostic-probe) to confirm.** The probe
distinguishes "tool absent" from "tool present but failing" — with the
fallback chain now in place, a negative result would mean none of the three
kwarg names worked, which is new information the probe should be re-read for.

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

Same table, same `correlation` — `system-harness/graph-brain/YVON-GRAPH.md` §1.4.

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

**Corrected 2026-08-10:** `ContextPanel.tsx` no longer exists — checked, no
file by that name anywhere in `dashboard/app/chat/`. It was superseded by
`PipelineHud.tsx` (396 lines, TS-028: "full real-time expandable pipeline
HUD," 6 sections — Input Analysis, Context Injection, CAOS, RAG, Execution,
Recording), which is what `chat/page.tsx` actually renders today. The mockup
above is a smaller illustration of the same idea than what shipped; see
`docs/MASTER-PLAN.md` §1 (P3) for the real shape.

Still accurate, re-checked directly against `events.py`/`main.py`:
`phase.retrieve`, `gate.passed`, `gate.blocked`, `loop.iteration` are declared
in `events.py`'s vocabulary but genuinely never called from `main.py` — only
`run.started/completed/failed`, `phase.classify`, `phase.resolve`, and
`tool.call` are actually emitted. §5.2's design is still unimplemented for
those four kinds specifically.

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
foundation, engineering docs). Not refreshed since — TS-025 through TS-029
(context injection, venture truth, input analysis, the pipeline HUD rewrite,
build/info/general tiering) all postdate this table. Current state for that
work lives in `docs/MASTER-PLAN.md` §1, not here.*

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
| Pipeline panel | `PipelineHud.tsx` (396 lines, TS-028 rewrite — `ContextPanel.tsx` no longer exists, corrected 2026-08-10) + `lib/pipeline.ts` — live (SSE) + past (events), same renderer |
| Deploy gate `--full` tier | `verify-deploy.sh --full` — next build + Playwright smoke; tier-1 unchanged |
| `/preview`, `/deploy` commands | registered `[built]`; executors `[planned]` (Appendix C #6) |
| Supabase foundation | `migrations/106_chat_commands.sql` — system kind, audit, tokens, correlation, definer writers (needs `supabase db push`) |
| Hermes patch plan | `vps-scripts/hermes-patch-notes.md` — probe-gated, not applied |
| **Command-deck redesign** | TS-020: icon dock + Teams slide-over (`DockRail`/`TeamsPanel`), markdown thread + streaming bubble (`MessageStream`/`Markdown`), command cards (`CommandCard`), live strip + pipeline HUD (`LiveStrip`/`PipelineHud`), `/` command popover from the registry (`Composer` + `/api/chat/commands`), real skill chips (`/api/fleet/skills`), ⌘T/⌘K — all bound to real data |

### Partial

| Thing | Missing |
|---|---|
| ~~Workspace scoping~~ | **moved to Built (§3.2, corrected 2026-08-10)** — `stream/route.ts` reads the cookie and `WorkspaceKey` is `string`, not a static union, confirmed against source |
| Phase observability | wrapper-observable kinds emitted; `phase.retrieve` / `gate.*` / `loop.iteration` reserved until hermes-agent exposes phase hooks (probe-gated) |
| Playwright | `--full` tier exists; pre-push hook stays tier-1 only by design (§6.3) |
| Graphify retrieval in chat | still nothing, but not a stub anymore — the stub file was deleted; chat's TS-025 context resolver bypasses CIE/graphify entirely by design (see §3.4) |
| ~~Migration 106~~ | **moved to Built, corrected 2026-08-10** — ✅ applied, confirmed via live Supabase project check (`docs/MASTER-PLAN.md`, migrations 001-107 applied) |
| Agent-reply author forgery gap | pre-existing: any authenticated user can write `author_kind='agent'`; close with a service-role write path (documented in migration 106) |

### Missing / probe-gated

| Thing | Section |
|---|---|
| Hermes cwd + write access (defects A–B); toolset (defect C, now `[mitigated in code, unconfirmed]` — see §4.3) | [§4](#4--hermes-runtime--diagnose-then-patch) — patch written in `vps-scripts/hermes-patch-notes.md`, A/B still blocked on Appendix A probe |
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
Three systems agree on this string; `system-harness/graph-brain/YVON-GRAPH.md` §6.1 owns the contract. A
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
| No terminal/shell tool listed | Defect C still live — the `platform`/`toolset` fallback chain already shipped (§4.3) but didn't resolve it | check `hermes-agent` source on the box directly for the real kwarg name; neither `platform` nor `toolset` worked |
| Tool listed, `pwd` = `/opt/yvon-hermes-http` | Defect A only | set cwd per project |
| Tool listed, writes fail read-only | Defect B | add checkouts to `ReadWritePaths` |
| Tool listed, `git rev-parse` fails | no checkout on the box | clone it; also blocks the Graphify cron in `system-harness/graph-brain/YVON-GRAPH.md` §4.4 |

Paste the output back and the patch gets written against facts.

---

## Appendix B — Command catalog

Shipped (real file in `dashboard/lib/commands/`) in bold; the rest are the
shape it grows into. **Corrected 2026-08-10** — this table previously bolded
only 3 of the 7 commands that actually exist; re-checked against the registry
directly (`clear.ts confirm.ts deploy.ts help.ts preview.ts switch.ts
where.ts`, 7 files, matches `docs/MASTER-PLAN.md`'s companion doc's command
table exactly). "Shipped" means the command dispatches and reports honestly —
`/deploy`'s and `/preview`'s own *executors* are separately gated (see Depends
on column), not a reason to un-bold the command itself.

| Command | Does | Confirm | Depends on |
|---|---|---|---|
| **`/help`** | lists commands from the registry | — | §2.4 |
| **`/switch <slug>`** | scope + agent context (parts 1–2) | — | §3.1–3.2 |
| **`/where`** | prints active venture, workspace, Hermes cwd, project root | — | §3, §4 |
| **`/clear`** | drops the pooled session for this room | — | `/v1/pool/drop` |
| **`/confirm <token>`** | executes a pending confirm-gated command | — | §2.5 |
| **`/deploy [--full]`** | runs `cli/deploy.sh`, streams to the panel | **yes** | executor gated on `YVON_DEPLOY_EXECUTOR` (§6.3, Appendix C #6) |
| **`/preview`** | pushes branch, returns Vercel preview URL | **yes** | §6.4, Appendix C #6 |
| `/agents [dept]` | fleet from `structure.json`, with live status | — | `system-harness/graph-brain/YVON-GRAPH.md` §1.1 |
| `/status` | Hermes health, session pool, last deploy | — | `/v1/pool`, `/healthz` |
| `/test [pattern]` | Playwright, results into chat | — | §6.3 |
| `/graph rebuild` | triggers the Graphify rebuild | **yes** | `system-harness/graph-brain/YVON-GRAPH.md` §4.4 |
| `/task <id>` | TASK-SPEC record from `store/tasks/` | — | `MASTER.md` PART 6 |
| `/trace [correlation]` | full phase timeline for a turn | — | §5.2 |

`/where` was deliberately in the first release. While `/switch` is partial, you
need one command that states the truth about what is actually pointed where.

---

## Appendix C — Open decisions

**2 of 6 resolved since 2026-08-04** (#4, #5 below) — checked 2026-08-10.

| # | Question | Why it matters | Status |
|---|---|---|---|
| 1 | Probe output | decides whether Defect C's fallback chain actually worked, and what the patch does next if not | **blocking §4** |
| 2 | Is the YVON repo checked out on the VPS at all? | blocks `/switch` parts 3–4 *and* the Graphify cron | **blocking §3.3** |
| 3 | Does Hermes accept a per-invocation cwd? | decides per-session vs per-project-worker (§3.3) | needs probe |
| 4 | ~~"CIA" / "CIAOS"~~ | repo has **CAOS** and **CIE** | ✅ **resolved** — grep-verified across the whole repo, "CIAOS" appears nowhere; canonical workflow is **CAOS** (`docs/MASTER.md`) |
| 5 | ~~`WorkspaceKey` → runtime lookup~~ | the static union of 4 couldn't hold a client context | ✅ **resolved** — `WorkspaceKey` is `string` now, not a union; landed with `docs/MASTER-PLAN.md`'s P1 (venture truth) |
| 6 | Where does `/deploy` execute? | Vercel can't run `deploy.sh`; it needs the VPS or CI | still open — confirmed `YVON_DEPLOY_EXECUTOR` is unset anywhere in tracked config, `deploy.ts`'s `executor()` still returns `{kind: 'none'}` |

---

*Sources, original pass (2026-08-04): `dashboard/app/chat/{page,Composer,ContextPanel,MessageStream}.tsx`,
`dashboard/app/api/chat/{send,stream}/route.ts`, `dashboard/app/api/set-venture/route.ts`,
`dashboard/components/Shell.tsx`, `dashboard/lib/workspaces.ts`,
`src/cie/sources/graphify.ts` and its dashboard stub, `src/adapters/config.ts`,
`vps-scripts/hermes-config.contabo.yaml`,
`vps-scripts/yvon-hermes-http/{main.py,events.py,README.md,systemd/yvon-hermes-http.service}`,
`cli/{deploy.sh,verify-deploy.sh,vercel-watch.sh}`, `dashboard/playwright.config.ts`,
`dashboard/supabase/migrations/038_venture_local_repo_path.sql`, `store/hermes-api-catalog.json`.
**Re-verified 2026-08-10** against current source, superseding the stale ones above:
`dashboard/app/chat/{page,Composer,PipelineHud,VentureSelector}.tsx` (`ContextPanel.tsx` and
`VentureSwitcher` no longer exist), `dashboard/lib/commands/*.ts` (7 files),
`dashboard/lib/context-resolver.ts`, `dashboard/lib/hermes-client.ts`,
`dashboard/app/api/claude/route.ts`, `dashboard/lib/workspaces.ts` (`WorkspaceKey` now `string`),
`main.py`'s `AIAgent` fallback chain, `docs/MASTER-PLAN.md`.*
