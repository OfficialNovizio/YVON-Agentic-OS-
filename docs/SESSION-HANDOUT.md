# YVON — Session Handout & Persistent Backlog

*Last updated: 2026-08-01 (M1–M4 closed) · Repo: `main @ 7e9d69b` — migration fixes committed & pushed · Operator: Novy*
*Addendum 2026-08-09: §2a added — verified-status audit against the real repo, done during the
graph-docs (`MASTER.md`/`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md`/`system-harness/graph-brain/YVON-GRAPH.md`) review. Everything above this
line is the 2026-08-01 record, unedited.*

*Addendum 2026-08-12: §9 #16 added — production-wide middleware outage (`yvon.in` 500 on every
request), diagnosed and a fix pushed same day (commits `3fc7de6`, `48158fe`). **Status: fix
pushed, live verification pending as of this writing** — check `yvon.in` loads before trusting
this closed. Also this session (not yet written up in full): the per-venture graphify +
MemPalace client-onboarding pipeline (artifacts 1–4, `ADR-002`), turn-correlation unification
across dashboard + Hermes, and the CAOS panel redesign — a fuller §-level writeup of that work is
still owed to this handout.*

> **This file is the durable memory of the project.** In-session task lists are ephemeral and
> die with the session — anything that must survive lives here. It is written to be
> **self-contained and exportable**: a fresh session, a different AI, or a human should be
> able to read only this file and know what to do next.

> **Read order for a fresh session:** `CLAUDE.md` (the rail) → **this file** → `docs/MASTER.md`
> PART 0 (orientation — jump via its line index, never read it whole).

---

## Table of contents

| § | Section |
|---|---|
| 1 | Current state (verified) |
| 2 | **PRIORITY 0 — do these first** |
| 2a | **Verified-status audit (2026-08-09) — Appendix A refactor is now top priority** |
| 3 | The core finding — why nothing follows the workflow |
| 4 | VPS — measured state + upgrade options |
| 5 | **The 7 tools — full spec, repos, install commands, placement** |
| 6 | Tool overlap analysis (new vs already installed) |
| 7 | **Decision log — every question asked and answered** |
| 8 | Full backlog (V / T / A / E tracks) |
| 9 | Corrections & known errors |
| 10 | Known gaps (unchanged from before) |
| 11 | Key files and commands |

---

## 1. Current state (verified on disk 2026-08-01)

**Repo:** `main @ 7e9d69b` — "feat: Contabo migration fixes + docs consolidation".
**Working tree clean, pushed to origin.** M1 (commit migration fixes) is DONE — all the
files that were uncommitted below are now in `7e9d69b`. Prior HEAD was `14f3b02`.

The 2026-07-30 Notion/design-token redesign was **rolled back in full**. `dashboard/` is
byte-identical to `14f3b02`. The UI is the original dark Material-3 theme.

**Landed in `7e9d69b`** (was the uncommitted set — kept here as the changelog):

```
 M CLAUDE.md · README.md · Teams/README.md · docs/MASTER.md · docs/SESSION-HANDOUT.md
 M docs/AGENT-BUILD-PLAYBOOK.md          (moved from Teams/, now the sole copy, 511 lines / 11 §0 rules)
 D Teams/AGENT-BUILD-PLAYBOOK.md(+.toon) (the stale 355-line / 8-rule fork — deleted)
 D docs/{4LAYER,ARCHITECTURE,BENCHMARK_REPORT,CODE_STRUCTURE,DASHBOARD,Engineering_Review,
     FULL,GOOGLE_PATTERNS,HARNESS,PIPELINE_FINAL,WORK_TREE,YVON-OS-IMPORT-ANALYSIS}.md
 D docs/archive/**                        (all 7 files)
?? cli/toc.py                             (new — MASTER.md index generator)
?? vps-scripts/MIGRATE-TO-CONTABO.md      (new — migration runbook, Contabo IP filled in)
 M vps-scripts/yvon-hermes-http/main.py   (pass model+provider to AIAgent · surface agent-init errors as SSE)
 M vps-scripts/yvon-hermes-http/install.sh (skip copy step when already in dest dir)
 M vps-scripts/yvon-hermes-http/systemd/yvon-hermes-http.service (Hermes venv uvicorn · logs write path)
 M vps-scripts/yvon-hermes-http/README.md (Hostinger → VPS)
 M dashboard/app/api/ventures-health/route.ts (VPS_METRICS_URL env-only — no hardcoded IP)
 M dashboard/.env.local.example          (document HERMES_URL/HERMES_TOKEN/VPS_METRICS_URL)
```

**Tool layer installed (2026-08-01).** All 7 target tools live: reticle + page-agent
(`dashboard/node_modules`), taste-skill (12 skills, `.agents/skills/`), playwright + agentation
(root + dashboard `node_modules`), and on the VPS via `vps-scripts/install-tools.sh` —
crawl4ai (`crwl`), browser-use, scrapegraphai, agent-reach, strix (`strix-agent 1.4.1`, reuses
Hermes's OpenAI key). On-demand Docker services (localstack, vaultwarden ready; plausible/
cal-com/penpot/appflowy needs-config) now live under `Teams/Shared OS/tools/<name>/`, managed
by `cli/tool.sh up|down|status`. The old command-only stub folders were deleted; the registry
(`shared-tool-registry.md`) is rewritten with a placement map + INSTALLED/LICENCE columns.

**M1–M4 all reported DONE by operator (2026-08-01):** migration fixes committed (M1);
`OPENAI_API_KEY` + `KREA_API_KEY` rotated (M2); Hermes API `:9119` verified (M3);
Hostinger decommissioned (M4). ⚠️ M4 was executed ~1 day after cutover, not after the
`≥ 1 week green` hold — and the Hostinger `config.yaml` (the only record of that box's
Hermes skills/tools/MCP) was never in git, so it is now likely unrecoverable. See the
new **Hermes tool-parity** open item in §2.

**Committed and working:**

| Area | State |
|---|---|
| Chat surface, drill-down (Workforce → Dept → Agent) | committed |
| Password auth, 3 BOD accounts, whole dashboard gated | committed |
| Hermes HTTP wrapper `vps-scripts/yvon-hermes-http/` | in repo (`main.py` · `install.sh` · `nginx` · `systemd`) |
| File uploads · voice messages · cancel-generation | committed |
| PWA + Web Push (`app/manifest.ts` · `public/sw.js` · `lib/push-server.ts`) | committed |
| Deploy gate `cli/verify-deploy.sh` (8 checks) + `cli/deploy.sh` | committed, **passing 8/8** |
| Hermes API catalog `store/hermes-api-catalog.json` | 176 endpoints |

**Docs work completed this session (uncommitted):**

1. Rollback of the failed redesign — 72 files restored from `14f3b02`
2. **`docs/` consolidated 15 → 3 files.** `MASTER.md` = PART 0–8 + APPX A–C (~5,100 lines)
3. **PART 0 — Orientation**, merged from `ARCHITECTURE.md` (was **0% covered** by MASTER — a genuinely different doc, not a duplicate)
4. **PART 8 — Enforcement** written (transition conditions, gate map, hook spec, `cli/task.sh` spec, tool→gate bindings). Status **`[planned]` — nothing enforces yet**
5. **`cli/toc.py`** — generates + self-verifies the line-numbered index in MASTER.md. Idempotent. Re-run after any hand-edit
6. All dangling doc references fixed repo-wide (`CLAUDE.md` ×4, `README.md` ×12, `Teams/README.md`)

Deletion was gated: a section-level coverage check proved every H2–H4 heading **and** a
180-char body sample of each deleted file existed in the merged MASTER. 16/16 PASS.

**Hostinger → Contabo migration: COMPLETE (2026-08-01).** Chat / transcribe / hermes-proxy all
live on Contabo `169.58.107.148` via `hermes.yvon.in` (BigRock DNS flipped, verified via `dig`).
GPT-5.6 Luna verified streaming end-to-end (`curl` + live dashboard deploy). Fresh re-provision —
no data was copied off the old box. See §4 for the config that made it work, and
`vps-scripts/MIGRATE-TO-CONTABO.md` for the runbook. Still open: commit fixes, rotate exposed
keys, verify the :9119 Hermes API, metrics service, decommission Hostinger (§2).

---

## 2. PRIORITY 0 — do these first

**M1–M4 are DONE (2026-08-01).** The migration-critical block is closed. New top of stack:

1. **H1 — Hermes tool-parity: FULLY RESOLVED 2026-08-01.** Contabo is a STOCK Hermes install
   (full default builtin toolset; inventory committed at `vps-scripts/hermes-config.contabo.yaml`).
   - **H1a DONE** — `/root/.hermes/skills/` holds the **bundled/stock skill set** (apple, github,
     research, software-development, creative, productivity, … + `.bundled_manifest`, all at
     install time). No custom Hostinger skill existed → nothing lost. Parity confirmed.
   - **H1b provider DONE** — the live, chat-working box runs `provider: openai-api` + base_url.
     Since chat works, `openai-api` is the CORRECT value; §9 #6's "invalid" claim was wrong
     (corrected in §9 #14).

2. **M3 — DONE 2026-08-01 (re-closed properly).** Hermes dashboard API now runs as a persistent
   systemd service `yvon-hermes-dashboard` (`vps-scripts/yvon-hermes-dashboard.service`),
   `LISTEN 127.0.0.1:9119` (pid confirmed), enabled on boot + `Restart=always`. The wrapper's
   `/api/hermes/*` proxy (Foundry / Task Board / Office) now has a live backend. (The earlier
   M3 "done" was false — the API wasn't running; this is the real close.)

3. **E2 — Backfill/close the legacy ledger.** `cli/task.sh validate` (now built, E1 done)
   FAILS on **12 legacy records** (TS-001…013): `approved` with no `approved_by`, and TS-006/007
   `done` with empty/self-asserting `exit_gate.proof`. Backfill these (or re-drive via task.sh)
   so the ledger is honest **before** E3 wires `validate` into the deploy gate. This is now the
   concrete next step — validate surfaces exactly which records and why.

4. **E3 — wire `task.sh validate` into `verify-deploy.sh`** as the first blocking point — only
   after E2 (else every push blocks on the 12 legacy fails).

5. **V5 — Identify/recreate the 4201 metrics service on Contabo** — ventures-health shows
   offline until done; the wrapped-domain name is known only to the operator.

**Done, for the record (was P0):** M1 commit migration fixes · M2 rotate `OPENAI_API_KEY` +
`KREA_API_KEY` · M3 verify Hermes API `:9119` · M4 decommission Hostinger ·
**T1–T3 Tools track** (all 7 tools installed + registry rewritten, commit `ed237df`) ·
**A1** (`cli/agent-compile.py` built; all **46 agents compiled** to `.claude/agents/` — the
`.claude/agents/` gap from §3 is closed) · **E1** (`cli/task.sh` + `task.py` record manager,
8 commands, state machine + guards, lifecycle-tested; `validate` exits 1 for the gate).

---

## 2a. Verified-status audit (2026-08-09)

Cross-checked every claim in §2/§8 above against the real repo state (not against what a prior
session wrote) as part of the `MASTER.md`/`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md`/`system-harness/graph-brain/YVON-GRAPH.md` graph-docs
review. Two backlog items turned out to be more done than recorded (T2, A2); five are still
exactly as open as §2 says. **New top priority below — it wasn't tracked anywhere before today.**

### PRIORITY 0.1 — Appendix A refactor path fix — RESOLVED 2026-08-09

Checked `rag/` directly: the refactor described in `MASTER.md` Appendix A is **real and mostly
done** — `rag/core/`, `rag/harness/`, `rag/eval/`, `rag/monitor/`, `rag/verify/` all exist with
the exact modules `MASTER.md` Part 0 assumes, and `rag/__init__.py` itself already imports from
the new nested paths. Both concrete fixes below are now applied:

1. **`MASTER.md` Part 1 and Part 3 cited the pre-refactor flat paths** (`rag/bridge.py`,
   `rag/unified_pipeline.py` at root, `rag/harness.py`, `rag/verifier.py`) — none of those four
   files existed anymore. **Fixed**: 55 references corrected to the real nested path
   (`rag/core/bridge.py`, `rag/harness/gates.py`, `rag/verify/grounded.py`) — plus one path this
   note originally got wrong too: `rag/unified_pipeline.py` **kept its own name**, it only moved
   into `core/` (so the correct target is `rag/core/unified_pipeline.py`, not `rag/core/unified.py`
   as this line previously said — the doc's own migration table had the same bug, also fixed).
2. **Two flat leftover files at `rag/` root** — `self_improver.py`, `field_monitor.py` — diverged
   from their real, wired counterparts (`rag/monitor/improver.py`, `rag/monitor/watcher.py`,
   confirmed via `rag/__init__.py`'s actual imports). A third file this note originally lumped in,
   `test_runner.py`, turned out to already correctly import the moved modules — not a duplicate,
   left as-is. **Fixed**: first delete attempt via `allow_cowork_file_delete` was declined, so the
   two real duplicates were converted to deprecated `ImportError` stubs instead; once the operator
   confirmed they weren't needed, deletion was re-requested, approved, and applied —
   `git rm rag/field_monitor.py rag/self_improver.py`, both gone as of 2026-08-09 (recoverable
   from git history if ever needed). The moved files' docstrings no longer say the stale
   `Usage: python3 rag/self_improver.py` — fixed to cite their own real path.
   `docs/INPUT-ANALYSIS-DESIGN.md`'s matching flat-path references fixed the same way (5 spots).

**Why this mattered:** every other doc (`MASTER.md` Part 0, this session's graph-docs work) already
assumed the nested paths were correct — leaving Part 1/Part 3 wrong meant the next session trusting
either Part would get misdirected. Also surfaced one real, unrelated bug in the same pass:
`rag/monitor/improver.py`'s `sandbox_test()` calls `cli/task.py validate`, which doesn't exist
(the real script is `cli/task.sh`) — noted here, not fixed, since it's inside the *stub's* own
docstring explanation, not a separate open item; worth a look next time that file is touched.

### Reconciled against §2/§8 above — what's actually done vs. left

| Item | §2/§8 said | Verified 2026-08-09 | Status |
|---|---|---|---|
| **T2 — reticle** | "phantom," resolved 2026-08-01 (install + MCP registered) | Confirmed still installed. **Also fixed today:** `quinn-config.md`'s `reticle_mcp` field was still `<FILL_IN>` five weeks after install — installed but never bound into the one config quinn reads. Now filled. `MASTER.md` §8.3/§8.6/§8.8 updated to match. | **Now fully done** (was: installed but silently unbound) |
| **A2 — `<agent>-worktree.yaml`** | listed as still-open in §8 backlog | All **46/46** exist under `Teams/<Dept>/<agent>/operational/worktree/`. | **Already done — backlog was stale, not the work** |
| **E2 — legacy ledger backfill** | 12 records failing (TS-001…013) | `cli/task.sh validate` now fails on **6 files, 8 issues**: TS-001/002/003/004 (`approved`, no `approved_by`), TS-006/007 (`done`, empty/self-asserting `exit_gate.proof`). Real progress — down from 12 — but not closed. | **Partially done** |
| **E3 — `task.sh validate` in `verify-deploy.sh`** | blocked on E2 | `cli/verify-deploy.sh` has zero references to `task.sh`/`validate`. | **Still open**, correctly blocked on E2 |
| **E4 — `.claude/hooks/yvon-gate.sh`** | `[planned]` | Does not exist — `.claude/hooks/` holds only `yvon-retrieve.sh` (context injection, not a gate). | **Still open**, exactly as recorded |
| **E5 — impeccable/Playwright as blocking gates** | `[planned]` | No hook references `impeccable`. | **Still open**, exactly as recorded |
| **V5 — 4201 metrics service** | open, domain known only to operator | `VPS_METRICS_URL` still unset by default (`dashboard/app/api/ventures-health/route.ts` — graceful-offline fallback, not a real value); `vps-scripts/MIGRATE-TO-CONTABO.md` row 7 still literally says `**FILL_IN**` for the metrics domain. | **Still open**, exactly as recorded |

### Graph-docs decisions (separate track, resolved 2026-08-09)

`MASTER.md`'s Open Issues 3–6 (`belongs_to` ownership mechanism, 12GB VPS queueing policy,
cross-brand default, pgvector/qdrant isolation tiering) were discussed and resolved with the
operator this session — see `MASTER.md`'s Open Issues block and `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §0/§8.3/
§15.2 for the recorded decisions. Issue 7 (`system-harness/graph-brain/YVON-GRAPH.md` vs. `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` content
overlap) is open, next up.

---

## 3. The core finding — why nothing follows the workflow

Diagnosed this session, with evidence:

1. **`.claude/agents/` does not exist.** All 46 agent folders (27–35 files each) are
   **uninvocable**. They are documentation that one model reads and roleplays. This is the
   root cause of "single stream, no working structure" — there is no mechanism.
   *An agent = the whole folder* (`agent.md` + `identity/` + `custom/` + `marketplace/` +
   `operational/{agent,commands,principles,skill,tool}/` + `logical/`), not just `agent.md`.

2. **The protocol already exists and was abandoned.** `MASTER.md` PART 6 defines a real state
   machine (`draft → discovery → approved → executing → gated → done`, with
   `discovery: BLOCKING`). PART 7 defines five execution scenarios. `store/tasks/` holds
   **TS-001…TS-013** with genuine exit-gate proofs.
   **TS-014 / TS-015 / TS-016 do not exist** — yet the old handout listed them as shipped.
   That is the exact abandonment point. **8 of 11** records are still stuck at `approved`.

3. **Nothing reads any of it.** The only live hook is `yvon-retrieve.sh`, which injects
   context but gates nothing. `verify-deploy.sh` — which *is* wired to a blocking point —
   has held every regression class it encodes.
   > **A rule with a checker is a rail. A rule in prose is a suggestion.**

4. **Parallelism was planned, never executed.** TS-001/002/003/005/010 have populated
   `dag.parallel`, with the correct safety rule already written:
   *"disjoint write paths → safe parallel"*. It ran serially because one context can't fan out.

5. **Intra-agent routing already documented.** All 46 agents document handoff in
   `operational/skill/<agent>-skill-routing.md`. marcus has an explicit DAG:
   `vision-exploration → okr-cascade → venture-priority-matrix → decision-critic`.
   The knowledge exists; it is not machine-readable and nothing enforces it.

---

## 4. VPS — migrated to Contabo (2026-08-01)

**Was:** Hostinger, `2.25.189.22`, $18/mo, 1 core / 3.8 GiB / 48 GB, zero swap (measured
2026-07-31 — the reason for the upgrade: any two of {reticle, crawl4ai, strix} would OOM and
take `next-server` or `hermes gateway` down).

**Now:** Contabo VPS 20 — `169.58.107.148` (hostname `vmi3479143`), 6 vCPU / 12 GB / 100 GB
NVMe / ~$7. Ubuntu 24.04, system Python 3.12.3; Hermes venv = Python 3.11.15; nginx 1.24.0 +
certbot (TLS for `hermes.yvon.in`, cert expires 2026-10-30, auto-renew via certbot timer).

**Migration:** performed 2026-08-01, **fresh re-provision — zero data copied off Hostinger**
(runbook: `vps-scripts/MIGRATE-TO-CONTABO.md`). DNS at **BigRock** repointed
`hermes.yvon.in → 169.58.107.148` (verified via `dig`). Vercel `HERMES_TOKEN` updated to the
new bearer token; `HERMES_URL=https://hermes.yvon.in` unchanged; dashboard redeployed live.

**Key config on the new box (all operator-verified):**
- Hermes installed via official installer (`hermes-agent.nousresearch.com/install.sh`), lives
  at `/usr/local/lib/hermes-agent/` **with its own venv** (`venv/bin/python`, Python 3.11.15).
- Model: **`gpt-5.6-luna`** · provider: **`openai`** (NOT `openai-api` — an invalid ID that
  empties the model; §9) · reasoning effort: **high**.
- Wrapper at `/opt/yvon-hermes-http`; systemd unit runs **Hermes's venv uvicorn**
  (`/usr/local/lib/hermes-agent/venv/bin/uvicorn`), `ReadWritePaths` includes
  `/usr/local/lib/hermes-agent/logs`, hardening directives commented out
  (`226/NAMESPACE` on Contabo's LXC), drop-in `override.conf` holds `OPENAI_API_KEY` — **rotate
  it, it was exposed in chat** (§2 M2).
- DeepSeek fully removed (`.env` + override) — operator chose OpenAI-only.

**Remaining unknown:** the **port-4201 metrics service** (ventures-health) existed only on
Hostinger, wrapped behind a domain the operator owns. It does NOT exist on Contabo —
ventures-health may show offline until the service is identified/recreated (§8 V5).

---

## 5. The 7 tools — full spec

**Operator decision: install ALL 7, but ONLY when first needed** (not pre-emptively).
Register with bindings now so the registry is honest.

### 5.1 reticle — in-loop verification ★ highest value

| | |
|---|---|
| **Repo** | https://github.com/reticlehq/reticle |
| **Package** | `@reticlehq/core` (npm) |
| **Licence** | **Apache-2.0** (SDK: browser/protocol/react/babel-plugin/next) · **FSL-1.1-ALv2** (server/CLI/MCP) · **Enterprise licence** (`packages/server/src/ee/` — paid key in prod) |
| **Purpose** | Instruments a running app and reads *the program* — network, store state, custom signals, console, React commit stream. Returns pass/fail **with `file:line` to fix**. MCP server. |
| **Placement** | **Mac** (dev machine) — it verifies a dev server while an agent codes |
| **Install** | `npm i -D @reticlehq/core` then `claude mcp add reticle -s user -- npx @reticlehq/core mcp` (restart Claude Code after) |
| **Alt install** | Paste to agent: `Follow https://raw.githubusercontent.com/reticlehq/reticle/main/SKILL.md` |
| **App wiring** | `if (import.meta.env.DEV) reticle.connect({ session: 'my-app' })` — dev-only, tree-shaken from prod |
| **Gate binding** | quinn's **VERIFY** gate (edit-time). Blocking for UI work |
| **Status** | ✗ not installed · **cited as a gate in 4 agent docs already** (see T2) |

**Benchmarks (their committed harness, `pnpm bench`):** 50/52 injected regressions caught
(Playwright-script 38) · 0 false positives · ~47 tokens to re-run a 4-flow suite vs ~120,000
LLM re-drive (**2,574×**) · 0% flake on deterministic replay · 16 flows across 8 leased
contexts in 5.2 s vs 35.4 s serial (**6.78×**).

**Why it matters most:** it is precisely the tool that would have caught this session's
failure. The redesign was verified via compiled CSS and `tsc` and declared done — the app was
never opened. Reticle's stated purpose is *"your agent says done without ever opening the
app."* Its lease pool is also the parallel-agent verification layer the new architecture needs.

**warden review: PASS, conditional** —
(a) never enable `packages/server/src/ee/`;
(b) grep the production Vercel bundle for `reticle` to prove the SDK is tree-shaken;
(c) TIER-1 `quarantine.sh` + egress check on the daemon (vendor claims dev-only, localhost-only, no telemetry — verify, don't trust);
(d) relay registers the **MCP server**, not the shared tool registry;
(e) it injects a Babel/Vite plugin (build-chain modification) — aegis should review the diff.
**No AgentX conflict:** FSL restricts offering Reticle *itself* as a hosted service, which you are not doing.

### 5.2 strix — autonomous security agents

| | |
|---|---|
| **Repo** | https://github.com/usestrix/strix |
| **Package** | `strix-agent` (PyPI) |
| **Licence** | **Apache-2.0** |
| **Purpose** | Autonomous AI pentest agents. Full HTTP proxy, browser automation, terminal, Python runtime, recon, static+dynamic analysis. "Graph of agents" — parallel specialised agents |
| **Placement** | **VPS, on-demand only** — never a resident service |
| **Install** | `curl -sSL https://strix.ai/install | bash` |
| **Config** | `export STRIX_LLM="anthropic/claude-sonnet-4-6"` + `export LLM_API_KEY=...` |
| **Requires** | **Docker** (pulls a sandbox image on first run) + an LLM API key |
| **Gate binding** | Security gate — cypher (Red Team, caged) |
| **Status** | ✗ not installed. **Blocked on V1** (disk at 80%, image is multi-GB) |

**Overlap: zero.** There is currently **no security testing tool at all** in the registry —
cypher is a role with no weapon.
**Charter fit is exact:** SECURITY-CHARTER Rail 4 requires cypher to attack only
operator-signed in-scope targets, in-sandbox, findings-only. Strix is Docker-sandboxed,
scope-flagged, and outputs findings + PoCs.
**Cheaper alternative to consider:** their GitHub Actions workflow runs it on PRs on GitHub's
runners — zero VPS cost, and gates code before merge.

### 5.3 taste-skill — frontend design quality skills

| | |
|---|---|
| **Repo** | https://github.com/Leonxlnx/taste-skill |
| **Licence** | **MIT** |
| **Purpose** | 13 portable Agent Skills for frontend design quality. Dials: `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY` (1–10) |
| **Placement** | **Mac** — markdown skill files, zero runtime |
| **Install (all)** | `npx skills add https://github.com/Leonxlnx/taste-skill` |
| **Install (one)** | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` |
| **Gate binding** | Generation-time guidance for mia/atlas (advisory, not a gate) |
| **Status** | ✗ not installed |

**Skills (install name):** `design-taste-frontend` (v2 default) · `design-taste-frontend-v1` ·
`gpt-taste` · `image-to-code` · `redesign-existing-projects` · `high-end-visual-design` ·
`full-output-enforcement` · `minimalist-ui` · `industrial-brutalist-ui` ·
`stitch-design-taste` · `imagegen-frontend-web` · `imagegen-frontend-mobile` · `brandkit`

**Recommended subset:** `design-taste-frontend` + `redesign-existing-projects`.
Skip `stitch-design-taste` (duplicates **getdesign**) and the image-gen skills unless needed.
**Honest caveat:** taste-skill would **not** have prevented this session's failure — that was
a dangling token bridge and zero browser verification, a mechanical bug, not a taste deficit.

### 5.4 page-agent — in-page GUI agent

| | |
|---|---|
| **Repo** | https://github.com/alibaba/page-agent |
| **Package** | `page-agent` (npm) |
| **Licence** | **MIT** |
| **Purpose** | In-page JS GUI agent. Natural language → DOM actions. No extension, no Python, no headless browser. Text-based DOM, no screenshots. Optional Chrome extension + MCP server |
| **Placement** | **Dashboard `dependencies`** — it ships to your users' browsers |
| **Install** | `npm install page-agent` |
| **Usage** | `new PageAgent({ model, baseURL, apiKey, language })` then `await agent.execute('Click the login button')` |
| **Gate binding** | **Product feature, not a gate** |
| **Status** | ✗ not installed |

**Category note:** the README states *"designed for client-side web enhancement, not
server-side automation."* Use cases are SaaS AI copilot, smart form filling, accessibility.
This is something you **ship inside the YVON dashboard for BOD users**, not a tool agents use
to build. **Derived from browser-use** (already registered) — same DOM processing and prompts.

### 5.5 crawl4ai — scraping for RAG

| | |
|---|---|
| **Repo** | https://github.com/unclecode/crawl4ai |
| **Package** | `crawl4ai` (PyPI) |
| **Licence** | **Apache-2.0** |
| **Purpose** | JS-rendered crawling → clean markdown for the RAG chunker. No API key |
| **Placement** | **VPS** — server-side crawling |
| **Install** | `pip install crawl4ai && crawl4ai-setup` (installs Playwright browsers) · MCP: `crawl4ai --mcp` |
| **Gate binding** | Research phase (`discovery`) — dana, rank, scout |
| **Status** | ✗ not installed (already in registry). **Blocked on V1** — ~300 MB deps + browsers |

### 5.6 playwright — release gate

| | |
|---|---|
| **Repo** | https://github.com/microsoft/playwright |
| **Package** | `@playwright/test` **^1.61.1** |
| **Licence** | **Apache-2.0** |
| **Placement** | **Mac** + CI |
| **Install** | `npm i -D @playwright/test && npx playwright install chromium firefox webkit` |
| **Gate binding** | quinn's **RELEASE** gate (`npm run test:e2e`) |
| **Status** | **✓ installed** in root `node_modules` — but **bound to nothing** |

### 5.7 agentation — visual feedback input

| | |
|---|---|
| **Repo** | https://github.com/benjitaylor/agentation |
| **Package** | `agentation` **^3.0.2** |
| **Licence** | **PolyForm Shield 1.0.0** ← **not an OSS licence** |
| **Purpose** | Human clicks an element in the running app → structured selector + notes back to the agent. Opposite direction to reticle |
| **Placement** | **Dashboard `devDependencies`** |
| **Install** | `npm install agentation -D` |
| **Gate binding** | Feedback input during `executing` (not a gate) |
| **Status** | **✓ installed** |

### 5.8 Placement summary

| Tool | Mac | Dashboard deps | Dashboard devDeps | VPS |
|---|:--:|:--:|:--:|:--:|
| reticle | ● | | | |
| playwright | ● | | | |
| taste-skill | ● | | | |
| page-agent | | ● | | |
| agentation | | | ● | |
| crawl4ai | | | | ● |
| strix | | | | ● on-demand |

---

## 6. Tool overlap analysis

**Already installed (root `node_modules`, verified):** `impeccable` ^3.2.1 ·
`@playwright/test` ^1.61.1 · `agentation` ^3.0.2 · `@dietrichgebert/ponytail` ^4.8.4
**Registered but not importable in the build sandbox:** crawl4ai · browser-use ·
ScrapeGraphAI · OpenSandbox (registry notes these as operator-machine installs)

| New tool | Overlaps with | Verdict |
|---|---|---|
| **reticle** | Playwright | **Complementary.** Vendor: *"Playwright gates releases. Reticle gates edits."* Reticle needs an SDK in an app you own; Playwright drives any site, other engines, true pixels. **Keep both** |
| **strix** | nothing | **Pure gap-fill.** No security tool exists today |
| **taste-skill** | impeccable, getdesign | **Partial.** impeccable = deterministic *detectors* (objective, blocks CI); getdesign = *reference* DESIGN.md; taste-skill = *generation* guidance (subjective). Complementary, but `stitch-design-taste` duplicates getdesign and `redesign-existing-projects` overlaps impeccable `/audit`+`/polish` |
| **page-agent** | browser-use | **Derived from it.** Different category — product feature vs build tool |
| **crawl4ai** | ScrapeGraphAI | **Mild.** crawl4ai = key-free bulk → markdown; ScrapeGraphAI = LLM-driven NL extraction. crawl4ai is the cheaper default |
| **playwright** | — | already installed |
| **agentation** | — | already installed, opposite direction to reticle |

---

## 7. Decision log — every question asked and answered

### Design decisions (made, then **rolled back** — kept for if the redesign is retried)

| # | Question | Decision |
|---|---|---|
| D1 | Theme target | **Ship both light + dark, light default** |
| D2 | Rebuild scope | **Full dashboard token migration** |
| D3 | Verification bar | **Full: impeccable zero-drift + Playwright real-render + no hardcoded brand values** |
| D4 | Handling design gaps in DESIGN.md | **atlas proposes 2–3 options with sources → operator picks → mia builds** |
| D5 | Dark-mode pastel tints | **Deepen** (as Notion's own product does) |
| D6 | Chat bubbles | **Lavender user / gray agent** (softer) |
| D7 | 46 agent colours | **Remap to the 9 Notion database-property colours** |
| D8 | Workspace accent | **Retint through the Notion palette** |

### Architecture & process decisions (**active**)

| # | Question | Decision |
|---|---|---|
| A1 | Where does the build-time protocol live? | **Inside `MASTER.md`** — became **PART 8** (PART 6 and 7 were already taken by TASK-SPEC and the Workflow Blueprint) |
| A2 | How hard should enforcement be? | **Hard block via `PreToolUse` hooks** |
| A3 | Tool scope for this pass | **Protocol first, bind tools after** · *"present me plan before doing it"* |
| A4 | Docs with unique content | **Merge as Appendices A/B/C in MASTER.md** |
| A5 | SESSION-HANDOUT.md | **Keep it, rewrite at end of session** (this file) |
| A6 | Agent → subagent compilation | **Compile ONE agent first, operator reviews, then the rest** |
| A7 | Where does the per-agent work tree live? | **New file `operational/worktree/<agent>-worktree.yaml`** |
| A8 | Tool research | **Deep research all 7 repos, compare against installed, then install** |
| A9 | Which tools to install | **All 7, including page-agent** |
| A10 | reticle licence | **Flag + review before install** (warden review done — §5.1) |
| A11 | Where do tools install | **VPS** — but check memory first (led to the V1 blocker) |
| A12 | strix install timing | **Install all tools only when needed, not before** |
| A13 | VPS | **Upgrade first**, suggest affordable alternatives (§4) |
| A14 | VPS migration | **Fresh re-provision on Contabo** (no VPS data copied) — runbook `vps-scripts/MIGRATE-TO-CONTABO.md` |
| A15 | Default model after migration | **OpenAI `gpt-5.6-luna`** (provider `openai`) — operator picked OpenAI over DeepSeek; DeepSeek removed |

### Standing definitions established

- **"Agent" means the whole folder**, not `agent.md`. For marcus that is all 27 files.
- **Parallel-safety rule** (already the convention in TS-001): agents may run in parallel
  **only when their `owns_paths` are disjoint**.
- **Gate rule:** *"a gate that is installed but not wired to a blocking point does not exist."*
- **Registry rule:** adding a tool row without a gate binding is incomplete — that is how
  `reticle` became fictional.

---

## 8. Full backlog

Dependency order: `M1`→`M2`→`M3`→`M4` (post-migration) · `A1`+`A2` block `A3` · `E1` blocks `E3`/`E4`.

### V — Infrastructure (blocking)

| # | Task | Notes |
|---|---|---|
| **V1** | ~~Upgrade the VPS~~ | **DONE 2026-08-01** — Contabo VPS 20, `169.58.107.148`. §4 |
| **V2** | ~~VPS relief on Hostinger~~ | **OBSOLETE** — old box being decommissioned |
| **V3** | ~~Audit cal.com / next-server~~ | **OBSOLETE** — no longer migrating the old box |
| **V4** | ~~Decommission Hostinger~~ | **DONE 2026-08-01** (operator). ⚠️ done ~1 day post-cutover, not after ≥1 week green; old `config.yaml` not captured → see §2 H1 |
| **V5** | Identify/recreate the 4201 metrics service on Contabo | ventures-health offline until done; wrapped-domain name known only to operator |

### T — Tools (register now, install on demand)

| # | Task | Notes |
|---|---|---|
| **T1** | ~~Register all 7 with gate bindings~~ | **DONE 2026-08-01** — registry rewritten with placement map + `INSTALLED`/`LICENCE` columns; all 7 verified installed (§2, commit `ed237df`) |
| **T2** | ~~Resolve the `reticle` phantom~~ | **DONE 2026-08-01** — reticle installed (`dashboard/node_modules/@reticlehq/core` 2.2.1) + MCP registered (`~/.claude.json`) + registry row |
| **T3** | ~~Add `LICENCE` column~~ | **DONE 2026-08-01** — LICENCE column live (agentation=PolyForm Shield, reticle=Apache/FSL/EE, playwright/crawl4ai/strix=Apache-2.0, …) |

### A — Agent architecture

| # | Task | Notes |
|---|---|---|
| **A1** | ~~`cli/agent-compile.py` — compile agents~~ | **DONE 2026-08-01** — compiler built; mia reviewed then **all 46 compiled** to `.claude/agents/`. Frontmatter (`name`·`description`=triggers·`tools` allowlist; `model` omitted when config has none) + compiled body. Re-run `python3 cli/agent-compile.py --all` after source edits. Open follow-up: pin `model` per agent in config; review derived tool allowlists |
| **A2** | `operational/worktree/<agent>-worktree.yaml` | `consumes` · `skill_chain` · `tools` · `owns_paths` · `produces` · `handoff` · `escalates_to`. Derived from the prose already in `*-skill-routing.md` + `*-tool-requirements.md` |
| **A3** | Parallel orchestration | Dept lead fans out `dag.parallel` items as **concurrent** Task invocations in one message. Only when `owns_paths` are disjoint |

**Target `worktree.yaml` shape:**
```yaml
agent: mia
dept: Engineering
consumes:     [design-tokens@atlas, api-contract@raj]
skill_chain:  [design-tokens, impeccable-shape, ui-accessibility-standards,
               impeccable-audit, frontend-verification, frontend-performance]
tools:        [impeccable, playwright, reticle, agentation]
owns_paths:   [dashboard/app/**, dashboard/components/**]
produces:     ui-build
handoff:      quinn
escalates_to: dev
```

### E — Enforcement (MASTER PART 8 §8.8 rollout order)

| # | Task | Notes |
|---|---|---|
| **E1** | ~~`cli/task.sh` — 8 commands~~ | **DONE 2026-08-01** — `cli/task.sh` + `cli/task.py` (no pyyaml); state machine + transition guards; `validate` exits 1. Lifecycle-tested. No blocking yet (E3) |
| **E2** | Close the legacy ledger (validate FAILS on 12 records) | **Now concrete** — `task.sh validate` flags TS-001…013: `approved` w/o `approved_by`; TS-006/007 `done` w/ empty/self-asserting `exit_gate.proof`. Backfill or re-drive before E3 |
| **E3** | `task validate` as check 9 in `verify-deploy.sh` | **First blocking point.** Push-time only |
| **E4** | `.claude/hooks/yvon-gate.sh` warn+log → blocking | `PreToolUse` on Write/Edit. One session warn-mode to calibrate always-allowed paths. Add `SessionStart` rail re-injection (fixes context decay) |
| **E5** | Wire `impeccable` + browser gate as **blocking** for UI work | Both installed, bound to nothing. Their absence let the broken redesign ship |

**Definition of done for the whole push:** a `Write` to `dashboard/` with no active approved
TASK-SPEC is **refused**, and the refusal names the exact command to fix it.

| **F1** | **Self-improving pipeline structure (RAG · CAOS · Context Injection · Input Analysis)** | **Planned (2026-08-07)** — the operator wants the WHOLE pipeline to self-improve, not just input analysis. Design: every stage (input analysis, context injection, CAOS, RAG) becomes a **graph node in graphify** so the system can visualize + learn from its own execution; the feedback loop (analyze → log → operator feedback → self_improver proposes → sandbox-test → operator approves → apply) spans the entire pipeline, with each stage's log + feedback feeding the weekly improvement cycle. **Deferred until we build the visualization section for these** (operator decision). Prereqs: input-analysis log (`store/input-analysis-log.jsonl`), operator feedback hook, self_improver consumption of all stage logs |
| **F2** | **Input analysis — implicit/connecting-element detection** | **Planned (2026-08-07)** — the input analysis misses IMPLICIT requirements that are linked to a message but not stated. Two concrete misses: (1) "restructure Settings" implied the existing venture-detail capability must survive (the `/settings/venture` edit view); (2) "add venture reflects throughout" implied new ventures must propagate to every surface that lists ventures (selector, switcher, settings, graph tabs) without refresh. **Lesson: input analysis must also extract implicit preservation + propagation requirements.** Redesign input analysis when we build the visuals for RAG/graphs/CAOS (with F1). |

---

## 9. Corrections & known errors (recorded so they aren't repeated)

1. **"There is no task-execution workflow"** — **wrong.** MASTER PART 6 + PART 7 already
   define one; I truncated a `grep` and missed them. The problem is enforcement, not absence.
2. **"Contabo uses standard SSD, not NVMe"** — **likely wrong.** A later source states all
   Contabo VPS plans run AMD CPUs and NVMe. Verify on Contabo's own spec page.
3. **"9 of 11 records stuck at approved"** — actual count is **8**. Corrected in PART 8.
4. **Uncommitted Notion work was lost.** A prior session's uncommitted theme migration
   (ThemeContext, ThemeToggle, `notion-*` classes in globals.css, DESIGN.md) was overwritten
   during the rollback. `git stash` **failed silently** because the sandbox could not remove
   `.git/index.lock`. `dashboard/components/ThemeToggle.tsx` and `dashboard/lib/ThemeContext.tsx`
   survive as untracked orphans. Recovery, if wanted: editor Local History or Time Machine.
5. **`.git/index.lock` left behind** by that failed stash. If git says *"another git process
   seems to be running"*: `rm -f .git/index.lock`.
6. **`provider: openai-api` is not a valid Hermes provider ID** — canonical is `openai`.
   `normalize_model_for_provider` empties the model for unrecognized provider IDs → requests
   went out with `"model": ""` → HTTP 400 "you must provide a model parameter". Hours of
   debugging traced to this one string.
7. **`AIAgent` does NOT read `config.yaml`** for model/provider — `self.model` comes only from
   constructor args. The wrapper MUST pass `model=` + `provider=` explicitly (fixed in
   `main.py` — reads `model.default`/`model.provider` from Hermes config itself).
8. **OpenAI model ID on this key is `gpt-5.6-luna`**, not the catalog's
   `databricks-gpt-5-6-luna`. Also: gpt-5.6 rejects `max_tokens` — use `max_completion_tokens`.
9. **Systemd hardening breaks under Contabo's LXC** — `status=226/NAMESPACE` with
   `ProtectSystem=strict` + `ReadOnlyPaths`. Hardening commented out in the unit; service runs
   fine unhardened.
10. **install.sh's copy step fails when run inside the dest dir** (`cp: same file` + `set -e`
    bails) — fixed with a dir guard. Also on a fresh box install.sh silently skipped nginx
    (apt race with unattended-upgrades) — nginx/certbot had to be installed manually, and
    certbot's generated config must NOT be overwritten with the template afterwards (removes
    `ssl_certificate` lines → nginx won't start).
11. **Hermes ships its own venv** (`/usr/local/lib/hermes-agent/venv/`) — point the wrapper's
    uvicorn there instead of fighting missing deps in a second venv.
12. **Stale `models_dev_cache.json`** can pin an old provider — deleting it forces a rebuild.
13. **The wrapper now surfaces agent-init errors as SSE `error` events** instead of a bare
    `Internal Server Error` — no more blind debugging (§1, `main.py` change).
14. **✅ RESOLVED — `provider: openai-api` is CORRECT (not #6's "invalid").** The live box runs
    `provider: openai-api` + base_url and chat works end-to-end (operator-confirmed 2026-08-01).
    So correction #6 above is **wrong** — `openai-api` is the working direct-API provider ID;
    do not "fix" it to `openai`. #6 likely described a transient mid-debug state.
15. **✅ FIXED — `:9119` was DOWN, now persistent.** Was not listening (2026-08-01); M3's earlier
    "done" was false. Now running as systemd service `yvon-hermes-dashboard`
    (`vps-scripts/yvon-hermes-dashboard.service`), `LISTEN 127.0.0.1:9119`, enabled + Restart=always.
    `/api/hermes/*` proxy has a live backend. Lesson: "verified" must mean a live check, not a
    marked box — the same class as §3's "browsers tell the truth".
16. **⚠️ 2026-08-12 — site-wide production outage: every `yvon.in` request 500'd**
    (`MIDDLEWARE_INVOCATION_FAILED`, `ReferenceError: __dirname is not defined`, in
    `dashboard/middleware.ts` — the auth gate that runs on every route). **Fix pushed same day,
    live verification still pending as of this writing — do not mark this resolved without
    checking `yvon.in` loads.**
    - **Diagnosis path, in order (each step ruled out one theory):**
      1. Rolled back Vercel to a 24h-old deployment (`37f7350`, "Promote to Production" — this
         re-aliases an existing build, it does NOT rebuild) → **same crash**. This ruled out
         every code change from this session's earlier work (turn-correlation unification,
         artifacts 1–4) as the cause, since that deployment predates all of it.
      2. Checked Vercel Project Settings → Environment Variables → `NEXT_PUBLIC_SUPABASE_URL` /
         `NEXT_PUBLIC_SUPABASE_ANON_KEY` present, Production-scoped, unchanged since Jul 28 →
         **ruled out missing/misconfigured env vars.**
      3. Upgraded `@supabase/ssr` 0.5.2 → 0.12.4 (commit `3fc7de6`) on the theory that an old,
         known-buggy version of the package was the source — pushed, redeployed (cache
         disabled) → **same crash, same error, on a fresh commit.** Confirmed this package
         version was NOT the (sole) cause.
      4. Inspected the actual compiled `.next/server/middleware.js` + its sourcemap locally.
         Found `middleware.js.map`'s `sourcesContent` includes `ua-parser-js` — pulled in
         *transitively by `next/server` itself* (our `middleware.ts` never imports it directly,
         never calls any UA-parsing helper). `ua-parser-js` references `__dirname` internally.
         Confirmed as a known Next.js/Vercel platform gap, not package-specific — the identical
         symptom is separately reported against `next-intl`, `next-auth`, and `@supabase/ssr`
         (`vercel/next.js#53968`, `supabase/supabase#21009`). Local `next build` tree-shakes the
         dead UA-parsing code path away (we never call it) — reproduces as a clean build every
         time locally — but Vercel's actual deployed Edge Function bundler does not tree-shake
         it the same way, so the reference survives only in their build output.
    - **Fix (commit `48158fe`):** `dashboard/next.config.ts`'s `webpack()` hook now injects a
      `DefinePlugin` that force-resolves `__dirname` to a literal string, scoped to
      `nextRuntime === 'edge'` only (the Node.js server compilation, which has a real
      `__dirname`, is untouched). This is the community-verified workaround for this exact bug
      class. **Could not be verified locally before pushing** — the failure is specific to
      Vercel's platform bundler, `next build` has never reproduced it once, before or after this
      fix.
    - **If still broken next session:** the next thing worth trying is dropping
      `output: 'standalone'` from `next.config.ts` (Vercel generally advises against that
      setting on their own platform, since Vercel already produces its own optimized deployment
      output — combining the two is a separate known source of bundling inconsistencies; not
      touched this round since it's also used for `outputFileTracingIncludes` and the narrower
      fix was tried first).
    - **Lesson for future sessions:** a clean local `next build` does not prove an Edge
      Function/middleware bundle is safe on Vercel — their platform bundles Edge Runtime code
      differently (tree-shaking behavior differs at minimum). The only real verification for an
      Edge Runtime bug is a live Vercel deployment, same "browsers tell the truth" class of
      lesson as §3 and #15 above, one level deeper (a build that *compiles* clean is not the
      same as a build that *runs* clean on the actual target platform).

---

## 10. Known gaps (unchanged)

- **VAPID keys not set** — push code ships but silently no-ops
- **DNS** `hermes.yvon.in → 169.58.107.148` (BigRock) — **verified** 2026-08-01
- **Vercel env** `HERMES_URL` / `HERMES_TOKEN` — updated for Contabo, deploy live; `VAPID_*` still unverified
- ⚠️ **2026-08-06 CORRECTION:** the Vercel env claim above is **unverified/stale** — chat still returns "HERMES_URL and HERMES_TOKEN not set in Vercel env". The VPS wrapper is proven working (platform='cli', SSE streaming, `pwd` → `/opt/yvon-hermes-http`), so the ONLY missing link is the env vars in the dashboard runtime (Vercel project env or local `dashboard/.env.local`). Set both and redeploy; then chat replies + bash work end-to-end.
- **`hermes-agent` not in git** — still VPS-only on Contabo. The wrapper (`vps-scripts/`) *is* in git
- **Hermes API server `127.0.0.1:9119`** — must run (`hermes dashboard`); powers the `/api/hermes/*` proxy (Foundry/Task Board/Office). **Unverified on Contabo** (§2 M3)
- **4201 metrics service** — existed only on Hostinger, wrapped behind the operator's domain; not on Contabo → ventures-health may show offline (§8 V5)
- **`OPERATOR_KEY`** unused since the Supabase auth switch — safe to delete
- **`/office`** shows all 46 agents idle until `agent_sessions` gets rows
- **Task Board** is a static demo · **Foundry sub-routes** are stubs
- **3 BOD passwords were shared in chat** — rotate via `dashboard/supabase/scripts/seed-bod-users.sql` (never commit real values)
- **`OPENAI_API_KEY` + `KREA_API_KEY` exposed in chat** — rotate; OpenAI key also lives in the systemd drop-in + Vercel env (§2 M2)
- **`node cli/yvon.js agents`** is a stub — prints "Run: npx yvon init"

---

## 11. Key files and commands

| What | Where |
|---|---|
| Session rail (read every session) | `CLAUDE.md` |
| Architecture, single source of truth | `docs/MASTER.md` — PART 0–8 + APPX A–C |
| Task state machine | `docs/MASTER.md` PART 6 · records in `store/tasks/` |
| Execution scenarios + sandbox-first | `docs/MASTER.md` PART 7 (§7.7) |
| Enforcement spec | `docs/MASTER.md` PART 8 |
| Agent build process + §0 ground rules | `docs/AGENT-BUILD-PLAYBOOK.md` (511 lines, 11 §0 rules) |
| Security rails (senior to all agents) | `Teams/Engineering/SECURITY-CHARTER.md` |
| Shared tool registry | `Teams/Shared OS/tools/shared-tool-registry.md` |
| Department sequencing | `Teams/<Dept>/DEPARTMENT-WORKFLOW.md` |
| Migration runbook (Contabo, filled in) | `vps-scripts/MIGRATE-TO-CONTABO.md` |

```bash
# Regenerate the MASTER.md line index after any hand-edit
python3 cli/toc.py            # write
python3 cli/toc.py --check    # verify only, exit 1 on drift

# Jump to a MASTER.md section instead of reading 5,100 lines
grep -n '^### PART' docs/MASTER.md
sed -n '4170,4380p' docs/MASTER.md

# Deploy gate (8 checks) — must be green before push
bash cli/verify-deploy.sh
bash cli/deploy.sh            # gate → push → watch Vercel → classify

# CAOS end-to-end check
python3 cli/verify-caos.py --quick

# Quarantine any new external tool BEFORE it enters the repo (§7.7 TIER-1)
bash cli/quarantine.sh <name> <git|npm> <source>
```

---

*End of handout. This file is the persistent backlog — update it before ending any session.*
