# YVON — Session Handout & Persistent Backlog

*Last updated: 2026-08-01 (M1–M4 closed) · Repo: `main @ 7e9d69b` — migration fixes committed & pushed · Operator: Novy*
*Addendum 2026-08-09: §2a added — verified-status audit against the real repo, done during the
graph-docs (`MASTER.md`/`system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md`/`system-harness/graph-brain/YVON-GRAPH.md`) review. Everything above this
line is the 2026-08-01 record, unedited.*

*Addendum 2026-08-12: §9 #16 added — production-wide middleware outage (`yvon.in` 500 on every
request), diagnosed and a fix pushed same day (commits `3fc7de6`, `48158fe`). **Status: fix
pushed, live verification pending as of this writing** — check `yvon.in` loads before trusting
this closed. (Evening follow-up: operator confirmed the outage was STILL LIVE after that fix —
round-2 change, dropping `output: 'standalone'`, was committed as `d3a9d1efb` and pushed —
deploy-gate PASS 8/8 — see §9 #16.) Also this session (not yet written up in full): the per-venture graphify +
MemPalace client-onboarding pipeline (artifacts 1–4, `ADR-002`), turn-correlation unification
across dashboard + Hermes, and the CAOS panel redesign — a fuller §-level writeup of that work is
still owed to this handout.*

*Addendum 2026-08-15: §12 added — Job Hunt module, OrgBook BC automation session. **Local commit
`5310eac` is made but NOT pushed — `git push` is currently blocked by the deploy-gate** (2 real
findings, 1 gate bug). Read §12 first if resuming this thread; it has the exact fix + the
still-open user decision blocking the cron-count finding.*

*Addendum 2026-08-25: §13 added — the chat→task→generation track. Covers the Work Ladder
design decisions, the Generations tab (`/generations`), the hand-port of Open-Generative-AI's
model registry and Marketing Studio, the three `/api/muapi/*` server routes, and the browser
harness that now gates this work. **Read §13.6 (open gaps) and §13.7 (verification method)
before touching the generation surface** — §13.7 records the second occurrence of shipping a
design as a product, and the traps that only a real browser catches.*

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
| 12 | Job Hunt module (2026-08-15) |
| 13 | **Chat → Task → Generation (2026-08-22/25) — Generations tab + OGAI port** |
| 14 | **Task surface v4 + demo chain (2026-08-24) — the artifact, built** |

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

3. **E2 — Backfill/close the legacy ledger.** **DONE 2026-08-24** — `task.sh validate` is now
   green on all records (TS-001..004 approved_by backfilled; TS-006/007 exit_gate converted to
   parseable block form with their real proofs; TS-035 PRD-transcribed + approved). **E3 is now
   unblocked**: wire `validate` into `verify-deploy.sh` as check 9 — the next P0.

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
16. **✅ RESOLVED 2026-08-12 (operator-confirmed) — site-wide production outage: every `yvon.in`
    request 500'd** (`MIDDLEWARE_INVOCATION_FAILED`, `ReferenceError: __dirname is not defined`,
    in `dashboard/middleware.ts` — the auth gate that ran on every route). Took 6 rounds across
    two sessions to actually close — rounds 1–5 (below) were all app-side attempts that each
    passed the deploy gate and still crashed identically in production; round 6 was the fix:
    **the edge middleware was removed entirely** (`dashboard/middleware.ts` deleted) and replaced
    with a client-side session gate (`dashboard/app/session-gate.tsx`, wrapping children in
    `dashboard/app/layout.tsx`) plus a router-level root redirect (`dashboard/app/page.tsx` +
    `next.config.ts`) to replace what middleware used to handle. **Operator confirmed `yvon.in`
    loads correctly as of this writing — closed.**
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
    - **⚠️ Follow-up (2026-08-12 evening):** operator confirmed the outage was **STILL LIVE**
      after the DefinePlugin deploy — same `MIDDLEWARE_INVOCATION_FAILED` / `__dirname` error.
      The recorded next step was then executed: `output: 'standalone'` (+ `outputFileTracingRoot`
      and the now-unused `fileURLToPath`/`dirname` imports) removed from `dashboard/next.config.ts`
      — Vercel advises against standalone output on their platform. The DefinePlugin is kept as
      belt-and-braces. **Status: committed `d3a9d1efb` + pushed 2026-08-12 evening (deploy-gate
      PASS 8/8). Live verification still pending** — `curl -I https://yvon.in` must return 200
      before marking resolved. **If it STILL fails after this deploy:** alias `ua-parser-js` to an
      empty stub inside the edge-only webpack block in `next.config.ts` (removes the reference
      from the edge bundle entirely — the diagnosis says the code path is dead, so a stub is
      safe) and check the Vercel project env vars (`HERMES_URL`/`HERMES_TOKEN`) for the separate
      chat env gap.
    - **⚠️ Rounds 3–5 (2026-08-12 late night) — ALL FAILED, platform verdict:** each was pushed
      (deploy-gate PASS 8/8, production READY) and each still 500'd identically. Round 3 aliased
      bare `ua-parser-js`; round 4 removed `@supabase/ssr` from middleware (jose JWT validation);
      round 5 aliased BOTH bare and `next/dist/compiled/ua-parser-js` (stub confirmed present in
      the deployed bundle's sourcemap). **Decisive evidence:** local `dashboard/.next/server/
      middleware.js` (107,524 B) contains ZERO `__dirname` references (verified `grep`), yet the
      identical build crashes on Vercel. Conclusion: **Vercel's platform-side edge bundler injects
      `__dirname` into the middleware function — a platform bug, not our code.** Rounds 1–5 could
      not fix it from the app side. (External reports confirm the same `MIDDLEWARE_INVOCATION_FAILED`
      class with no app-level fix; see stackoverflow vercel-middleware-crash + vercel-status
      middleware incidents.)
    - **ROUND 6 — the fix (recommended + operator-approved), CONFIRMED WORKING:** remove the edge
      middleware entirely so Vercel's bundler has nothing to crash, and replace the gate with a
      client-side session check. Changes: `dashboard/middleware.ts` deleted (`git rm`);
      `dashboard/app/session-gate.tsx` added (client component: reads `sb-<ref>-auth-token`
      cookie, checks JWT expiry in-browser, redirects to `/login` with `?next`, exempts `/login`
      + `/auth/*`); `dashboard/app/layout.tsx` wraps children in `<SessionGate>`. Real data
      security stays server-side (API routes auth independently). A follow-up
      (`fix: root redirect at router level`) was needed for a 404 that appeared at `/` after
      middleware removal (middleware used to own that redirect). **Reversible:**
      `git restore dashboard/middleware.ts dashboard/app/layout.tsx && git rm
      dashboard/app/session-gate.tsx` restores the pre-round-6 state, if ever needed. **Operator
      confirmed `yvon.in` loads — RESOLVED.**
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

## 12. Job Hunt module — 2026-08-15 session (OrgBook automation) — **git push currently BLOCKED**

**Read this first if resuming.** Everything below is committed locally (`main @ 5310eac`,
"job-hunt: automatic OrgBook BC lead pull via Vercel cron", 32 files) but **not yet pushed** —
`git push origin main` is rejected by the pre-push deploy-gate (`cli/verify-deploy.sh`, installed
at `.git/hooks/pre-push`). Do NOT `git push --no-verify` to bypass; one of the two findings is a
real Vercel deploy-time rejection, not a false alarm. Fix order below.

### What shipped this session (all real, sourced, working)

- **`target_companies` expanded 22 → 91** across Aerospace/IT/Trucking/Drone/Business (migration
  `129`), every row WebSearch-sourced, `domain`/`careers_url` left `NULL` where not confidently
  found (not invented).
- **Company-suggestions bar** on `/job-hunt/companies` — surfaces real employers seen in
  `job_postings` that aren't on the watchlist yet (`api/job-hunt/companies/suggestions`).
- **OrgBook BC integration** — the BC government's free public corporate-registry API
  (`orgbook.gov.bc.ca/api/v4/search/topic`), not scraped. Empirically confirmed hard pagination
  cap: every keyword 400s at page 11 (offset 100) regardless of the `total` field it reports —
  treated as graceful end-of-results everywhere (`lib/job-hunt/orgbook.ts`).
- **`company_leads` table** (migration `130`) + review/promote UI at `/job-hunt/companies/leads`
  — raw unverified leads, a human promotes real ones into `target_companies`.
- **Three layered pull mechanisms**, all sharing `lib/job-hunt/orgbook.ts`:
  1. `dashboard/scripts/fetch-orgbook-leads.mjs` — manual CLI fallback. Already run once for
     real: **2,694 genuinely new BC leads** pulled across 29 industry keywords.
  2. "Pull leads now" button on `/job-hunt/companies/leads` — browser-driven, one OrgBook page
     per API call (`api/job-hunt/companies/leads/fetch-batch`), no terminal needed.
  3. **Vercel cron** `api/job-hunt/companies/leads/cron` (migration `131` for the resumable
     cursor row `company_lead_pull_state`) — fully automatic once deployed, processes one
     keyword's full pagination per tick, cycles all 29 keywords forever. **This is the piece
     that's currently blocked from deploying — see below.**
- `cd dashboard && npx tsc --noEmit` — clean across the whole app as of this commit.

### The push blocker — 2 real deploy-gate findings + 1 gate bug

Running `bash cli/verify-deploy.sh` (or `git push`, which runs it via the hook) reports:

1. **Gate bug (false positive) — FIXED, not yet re-verified.** `check_undeclared_imports` in
   `cli/verify-deploy.sh` misfires on `dashboard/app/job-hunt/linkedin/ImportSection.tsx`. Root
   cause: its regex looks for the literal word `import` followed (eventually) by a quote to spot
   dynamic `import('pkg')` / side-effect `import 'pkg'` statements — but the file has
   `fetch('/api/job-hunt/linkedin/import')`, where `import` is just the tail of a URL path
   string. The regex doesn't understand string-literal boundaries, so it treats that string's
   *closing* quote as if it opened a new import spec, then greedily captures every char up to the
   *next* quote anywhere later in the file (landed mid-way through the next function, `+20`
   lines) and reports that whole blob as an "undeclared package". **Fix applied:** added a
   negative lookbehind `(?<![\w/.])` before each `import`/`require` branch in the regex (rejects
   matches preceded by a word char, `/`, or `.` — i.e. rejects "part of a path/property access",
   accepts "real statement/keyword position"). Not yet re-run to confirm this closes check 1
   clean — do that first on resume.
2. **Real finding — UNRESOLVED, needs a decision.** `vercel.json` now has 3 cron entries
   (`/api/briefing` 7am, `/api/trending` 9am, `/api/job-hunt/companies/leads/cron` 8am) but
   Vercel's Hobby plan hard-caps at 2 crons — this will be rejected at deploy time, not just by
   the local gate (`VERCEL_PLAN` defaults to `hobby` in `cli/verify-deploy.sh` §CHECK 5). **Asked
   the operator to choose; they deferred the decision to next session ("wait here update handout
   from where to start for next session to fix git push error as well").** Three options were on
   the table, none picked yet:
   - **On Vercel Pro already?** → limit is 40, not 2. If so, just bump `VERCEL_PLAN=pro` when
     running the gate (or hardcode `VERCEL_PLAN="pro"` at the top of `cli/verify-deploy.sh` if
     the account is confirmed Pro) and this finding disappears — no code changes needed.
   - **Still on Hobby, merge into `/api/trending`** — fold the OrgBook single-tick logic
     (currently in `api/job-hunt/companies/leads/cron/route.ts`) into the existing
     `api/trending/route.ts` so it runs both jobs once daily at 9am; delete the 3rd `vercel.json`
     entry.
   - **Still on Hobby, merge into `/api/briefing`** — same idea, fold into `api/briefing/route.ts`
     (7am) instead.
   First question to ask the operator on resume: *which Vercel plan is this project actually on?*
   That alone resolves it in one message.

### Exact next steps on resume

1. Confirm which Vercel plan — resolves finding 2 (see above).
2. If merging: move the tick logic out of `api/job-hunt/companies/leads/cron/route.ts` into
   whichever existing cron route was chosen, keep the `CRON_SECRET` auth + `company_lead_pull_state`
   cursor logic as-is (it's route-agnostic), then delete the extra `vercel.json` entry and the now-
   unused standalone route file.
3. Re-run `bash cli/verify-deploy.sh` from repo root — expect all 8 checks green.
4. `git push origin main` (should succeed once gate is green; no `--no-verify` needed).
5. On Vercel: confirm `CRON_SECRET` env var is set (very likely already is — `/api/briefing` and
   `/api/trending` already depend on it) and watch the first cron tick's logs after deploy.
6. Tell the operator the real cadence tradeoff once live: on Hobby (daily crons only), a full
   29-keyword OrgBook cycle takes ~29 days before repeating; Pro allows tightening the schedule
   (e.g. every 15–30 min) for a same-day full cycle.

### Known gaps carried forward (not yet acted on, only caveated to operator)

- OrgBook BC is BC-only. Same-shape "5k+ real companies" treatment for other provinces needs an
  equivalent per-province registry API researched first.
- `domain`/`careers_url` still `NULL` for the entire migration-129 batch (69 companies) — flagged
  as a follow-up enrichment item in that migration's own header comment.
- ScrapeGraphAI (task #112 in the in-session task list) is a dead end **specifically in this
  sandbox** — no root, blocked package mirror, `libXdamage.so.1` unfixable here. Works fine on a
  real machine/VPS with root; not worth revisiting from this sandbox.

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

## 14. Task surface v4 + demo chain — 2026-08-24 (the "One Request, End to End" artifact, built)

*Status: built, NOT yet verified in a browser or by `python3` — the sandbox VM was down all
session (disk-full). Everything below is code-reviewed by inspection only. Verify with the
commands in §14.4 before trusting it.*

### 14.1 What this is

The operator's ask: the task section of the **One Request, End to End** artifact
(`onerequestendtoend.html`, uploaded to the session; the claude.ai URL is
f6219d05-f9cf-4749-a210-f91488ca9806) was a design, not a build — a demo task still showed
the pre-artifact v3 UI. This session implemented the artifact's task design for real and
seeded the demo chain behind it.

### 14.2 What shipped (all files real)

**CLI / data model** (`cli/task.py`, `store/tasks/TEMPLATE.yaml` v3):
- `review` state added to the machine: `draft → discovery → approved → executing → gated → review → done`
- `blocked` SIDECAR (`block` / `unblock` commands) — status unchanged; a task can be blocked AND executing
- `review` / `suite` commands (gated → review; suite pass → done / fail stays review); the **run record**
  (`--run <path>`, must exist on disk) replaces prose `exit_gate.proof` — the self-assertion hole is closed
  BY DESIGN (proof is a path), and the legacy prose blocklist is strengthened with phrase matching
  (was exact-match only; `"I verified it works"` passed before)
- `set-acceptance` — per-criterion status (`pass|fail|not_run|pending|deferred`) + evidence; flat-string
  criteria (legacy) still parse
- `set-roles` — doer / verifier / integrator per work item (doer defaults to owner)
- `set-handoff` — the six-field packet (entry/contract/stubbed/needs_wiring/tokens/verified_on) + `handoff_emitted` event
- `derived_from` (distinct link from `revision_of`) via `new --derived-from`; `superseded_by` auto-marked
  on `new --revision-of` (forward-only rotation)
- `updated_at` stamped on every transition/activity (staleness)
- new events: `blocked`, `unblocked`, `review_opened`, `suite_failed`, `suite_passed`, `handoff_emitted`,
  `revision_opened`, `criterion_deferred`, `superseded`
- `list` emits everything; `validate` extended (blocked-reason/at, acceptance statuses, handoff fields, run proof)

**API + UI** (`dashboard/`):
- `app/api/task-spec/route.ts` — types extended (**fixes the live tsc error**: `designSessionId` was read
  at 3 call sites and missing from `TaskSpecItem`)
- `app/api/task-spec/[id]/command/route.ts` — NEW: block/unblock/review/note(criterion_deferred) via task.py
- `lib/task-theme.ts` — review stage; `app/chat/TasksPanel.tsx` — blocked badge + review pill
- `app/chat/TaskFocusView.tsx` — rebuilt to the artifact's task surface: status strip with age/staleness,
  acceptance block with verdicts + evidence, handoff packet, artifacts, people (doer/verifier/integrator),
  iconed history, provenance sidebar (prd/rice/revision_of/derived_from/superseded_by/last activity),
  Block/Unblock/Open-review actions. The old linear stage-card row is gone.
- `app/tasks/page.tsx` + `tasks.css` — NEW lineage board: by-request grouped (revision → attempt count,
  derived → one-level nesting, blocked_by ordering) + All-records flat view; wired into Sidebar (Build),
  TopBar ⌘K, and Shell's ADORA_ROUTE_PREFIXES
- `lib/db/runs.ts` — NEW run-record store (read side; TS-045's produces)

**Demo seed:**
- `store/tasks/TS-042…TS-047.yaml` — the artifact's chain, timeline compressed to end 2026-08-24:
  TS-042 (review, suite FAILED 3 of 4, superseded_by TS-043) · TS-043 (revision, done, 6-field handoff
  packet) · TS-044 (derived, done, contract) · TS-045 (derived, review + **blocked sidecar** + 1 criterion
  **deferred**) · TS-046 (derived, done, e2e) · TS-047 (derived from TS-045, draft — the deferral)
- `store/tasks/TS-042/044/045/046-prd.md` — the PRDs (TS-043 inherits TS-042's)
- `store/runs/run-{2617,2631,2644,2645,2646}.md` — the run records (the proofs)
- `dashboard/scripts/seed-demo-flow.mjs` — idempotent: demo room + transcript messages + 6
  `task.proposal.accepted` events (powers roomId linkage + Open in chat). Title-column fallback included.

**Tests:** `cli/test_task.py` §11 (v3: 11a–11k) · `dashboard/tests/e2e/e2e-panel.spec.ts` (full, mocked
API) · `dashboard/tests/e2e/task-flow.spec.ts` (smoke). **Both live in tests/e2e/ because
playwright.config.ts's testDir is ./tests/e2e** — a spec in the tests/ root never runs (found the
hard way: "No tests found"; the root-level copies are neutralized tombstones, delete when a
terminal is available). TS-046's produces updated to the real path.

### 14.3 How to view the demo

1. `cd dashboard && npm run dev` (signed in) — task records are repo files, no DB needed for the Tasks panel or /tasks.
2. `node scripts/seed-demo-flow.mjs` — once, for the demo chat room (Supabase service role key in .env.local).
3. Open **History → "Demo · One request, end to end"** (the transcript) or the **Tasks dock** → TS-042…TS-047.
   **Task Lineage** (`/tasks`, sidebar Build) shows the whole chain grouped by request.

### 14.4 Verification commands

```bash
python3 cli/test_task.py                       # 97/97 PASS (verified by operator 2026-08-24)
python3 cli/task.py validate                   # PASS (E2 backfill closed; verified 2026-08-24)
cd dashboard && npx tsc --noEmit               # 0 errors (fixed to 0; re-verified after last shim fix)
E2E_USERNAME=<username> E2E_PASSWORD=<...> npx playwright test tests/e2e/e2e-panel.spec.ts
#   browser gate — the config's `setup` project signs in via the app's own
#   password auth and saves tests/e2e/.auth/user.json (gitignored); later
#   runs need no env vars until the stored session expires. The specs live in
#   tests/e2e/ because testDir is ./tests/e2e — root-level specs never run.
```

### 14.5 First-run fixes (operator ran the tests 2026-08-24 evening)

Five bugs in the new code, all fixed after the operator's first run:
1. `superseded_by: null` was treated as a real value — `new --revision-of` / `supersede` /
   `list` now treat `null` as unset.
2. `set-acceptance` crashed: the indentation capture group was missing from the acceptance-key
   regex (`IndexError: no such group`).
3. `set-handoff` flags were snake_case (`--needs_wiring`) while the CLI/tests used kebab-case
   (`--needs-wiring`) — flags now map kebab → field.
4. `cli/test_task.py` §11 fixtures never set `work_items[].owner` / `exit_gate.owner`, so
   suite/done/roles failed on records that were missing real records' required fields.
5. Same owner gap for the §10 record used by 11b.

**tsc --noEmit — fixed to 0 errors (2026-08-24 evening):** first run showed 23 errors. 2 were
this build's (Provenance panel read `prdRef`/`riceScore` before they were declared on
`TaskSpecItem` — declared in both TasksPanel.tsx and route.ts). 21 were pre-existing, in files
this session never touched, from the 2026-08-22/25-era work: `stream/route.ts` forwards
`tier:` into `HermesChatInput` which never declared it (declared now, hermes-client.ts);
`types/supabase-ssr.d.ts` shim (NOT dormant despite its comment — ambient declarations win
over installed types) was missing `refreshSession`, breaking page.tsx's quiet session recovery
(added); `tests/caos-v2.test.ts` imported `./caos-v2`/`./pipeline` which don't exist under
tests/ (fixed to `../lib/…` — the 16 implicit-any errors all cascaded from that).

**E2 legacy ledger — CLOSED (2026-08-24):** `python3 cli/task.py validate` now fails on
nothing. Backfilled: TS-001..004 `approved_by: operator` (approved_at not recorded — pre-history);
TS-006/007 converted from unparseable inline-flow `exit_gate: {…}` to block form with their real
proofs (verify-deploy.sh regression run; vercel-classify 5-log replay — both cited from each
record's own feedback block); TS-035 `approved_by/approved_at` + `prd_ref` (`TS-035-prd.md`,
transcribed from the record's own content) + `rice_score: "0"` (unranked). **E3 (wire validate
into verify-deploy.sh) is now unblocked** — the next session's P0 per §2.

### 14.6 Honest gaps (unchanged by this session)

- The **session engine** (live ceiling gate, provider screening, probes, spend ledger — ORCHESTRATION §7)
  is still unbuilt; the demo chat is a seeded transcript, not a live session.
- `chat_rooms.title` has no migration (dashboard-side add) — seed script falls back gracefully.
- `docs/MASTER.md` untouched this session (PART 6/8 state lists still say 6 states — update + re-run
  `cli/toc.py` in a later session; the handout rule says never hand-edit MASTER without regenerating the index).

---

*End of handout. This file is the persistent backlog — update it before ending any session.*

---

## 13. Chat → Task → Generation — 2026-08-22/25 sessions (Generations tab + OGAI port)

*Written as a standalone brief. A fresh session should be able to read only this section and
resume the generation track without re-deriving anything. Everything here was verified in a
browser, not by reading compiled CSS — see §13.7 for why that distinction is load-bearing.*

### 13.1 What this track is for

Two surfaces that were previously only designed, now partly built:

1. **The Work Ladder** — the chat→task→delivery model. Spec at `docs/ORCHESTRATION.md`.
2. **The Generations tab** (`/generations`) — the asset surface where every image/video the
   system produces lands, addressable by `request_id`, scoped per-session **and** globally.

The connective idea: a chat conversation reaches a *gate*, the gate produces an approved spec,
the spec becomes a task, and any media that task needs is generated in `/generations` and
referred back into the chat by id. The hard spend ceiling is a **quality gate, not a budget
line** — its purpose is to make an under-specified prompt fail loudly before it is paid for
five times.

### 13.2 Design artifacts published (claude.ai) — read these before redesigning anything

| Artifact | Covers | URL |
|---|---|---|
| The Work Ladder | orchestration model, ladder vs. flat tasks | `https://claude.ai/code/artifact/fdb57400-bd72-49fc-9576-e2b290ef5b60` |
| Fifty Cents | the hard-ceiling mechanic as a quality gate | `https://claude.ai/code/artifact/e78286c4-aa89-4c60-8cdb-d87a15efee79` |
| Three Scroll Directions | chat / task / library scroll axes | `https://claude.ai/code/artifact/95524fc0-6012-47e5-8ad6-ae5fcc1b2efa` |
| The Task Surface | what a task shows, who reviews, who integrates | `https://claude.ai/code/artifact/e0913f86-c9ec-453b-888c-0efe12db79dc` |
| One Request, End to End | full chat→task→delivery walkthrough | `https://claude.ai/code/artifact/f6219d05-f9cf-4749-a210-f91488ca9806` |
| Two Prompts, One Image | the A/B (json vs prose) mechanic | `https://claude.ai/code/artifact/c66953f5-9a7e-43aa-85f5-a5661c24dba2` |

**Decisions settled in those artifacts** (do not relitigate without cause):

- **Sub-tasks inherit inside the parent task.** Five sibling tasks all contributing to one
  piece of work was the rejected shape — it does not scale past a handful of tasks.
- **Review = the owning team runs the browser suite.** A bug does not open a new task; it
  *rotates the existing one* back a rung on the ladder.
- **Integration = the whole engineering team**, not a designated integrator.
- **A/B means one JSON-shaped prompt vs one prose prompt of the same intent**, run as two
  separate requests. It is not "which looks prettier" — it asks whether the spec is tight
  enough that wording does not change the result. No seed, no fps: seeds were dropped because
  the models in the default roster do not expose one, which is a real limit on what A/B proves
  and is stated in the UI.

### 13.3 Open-Generative-AI — what was taken, what was deliberately left

Upstream: `https://github.com/Anil-matcha/Open-Generative-AI.git`, cloned to `/tmp/ogai` in
session (**not vendored into the repo** — verified: OGAI is *not* installed as a dependency or
submodule, and should not be). It is a **MuAPI.ai client**. Useful parts were ported by hand.

**Ported:**

| From | To | Notes |
|---|---|---|
| `packages/studio/src/models.js` | `dashboard/lib/generation-models.ts` | 439 models, 8 categories, real per-model aspect / quality / duration |
| `components/MarketingStudio.jsx` | `dashboard/app/generations/MarketingComposer.tsx` | full composer, see §13.5 |
| `MarketingStudio.jsx` `ASSETS`/`OPTIONS` | `dashboard/lib/marketing-presets.ts` | verbatim ids + CDN urls |
| `muapi.js` `uploadFile` / `estimateV2VCost` / `generateMarketingStudioAd` | `dashboard/app/api/muapi/*` | moved server-side |

**Deliberately NOT ported — each of these is a hazard. Do not reintroduce them:**

1. **Site-wide CSP middleware** — would apply to every route in our app, not just theirs.
2. **Unscoped `* { margin: 0 }` reset** — would leak into every other page.
3. **Shared axios interceptor** that attaches `x-api-key` — it fires on *relative* URLs too,
   so the MuAPI key leaks to our own endpoints.
4. **Non-HttpOnly `muapi_key` cookie** — the key is readable by any script on the page.
5. **Unnamespaced `localStorage["token"]`** (in their Design Agent) — collides with ours.
6. **`window.location.reload()` on tab change** — throws away all in-flight state.
7. **30-minute in-tab polling** (900 attempts × 2s). A refresh loses the job *and the money*.
   Ours submits and returns the `request_id`; see the gap in §13.6.

### 13.4 The Generations tab — current shape

Files:

```
dashboard/app/generations/page.tsx            the surface (library + generic composer)
dashboard/app/generations/MarketingComposer.tsx
dashboard/app/generations/generations.css     all styles, scoped to .gen-shell
dashboard/lib/generation-models.ts            the 439-model registry
dashboard/lib/marketing-presets.ts            marketing avatars / motion templates
dashboard/app/api/generations/route.ts        the library read  ← currently 401s, see §13.6
dashboard/app/api/muapi/_shared.ts            key handling, one place
dashboard/app/api/muapi/upload/route.ts       multipart → MuAPI upload_file
dashboard/app/api/muapi/estimate/route.ts     POST models/{id}/estimate-cost
dashboard/app/api/muapi/marketing/route.ts    submit the ad, return request_id
dashboard/tests/generations.spec.ts           browser gate
dashboard/tests/marketing.spec.ts             browser gate for the marketing composer
```

**Sidebar / TopBar wiring** (three files must agree, they are not derived from each other):

- `components/Sidebar.tsx` → `Build` section, `{ label: 'Generations', href: '/generations',
  icon: 'auto_awesome' }`. **Icon is a Material Symbols Outlined ligature, not a lucide
  component** — the sidebar and the page use different icon systems.
- `components/TopBar.tsx` → has its **own duplicated `ALL_PAGES` list** for ⌘K. Adding a route
  to the sidebar does not add it to ⌘K. Both must be edited.
- `components/Shell.tsx` → `ADORA_ROUTE_PREFIXES = ['/chat', '/generations']`.

**THE LAYOUT CONTRACT — this caused a shipped bug, it is now a comment in `page.tsx`:**

> Shell renders `<main className="flex-1 overflow-hidden">` and hands full-bleed pages a plain
> `height:100%` div. The page is therefore a normal `height:100%` flex column. It must **NEVER**
> be `position:absolute; inset:0` — that escapes to the viewport and paints over the sidebar
> and collides with the TopBar. Use `useShellFullBleed()` → `setFullBleed(true)`.

**Studios.** `STUDIOS` in `generation-models.ts` — **7 entries, all active**: Image, Video,
Cinema, Audio, Lip Sync, Body Swap, Marketing. `Studio` has **no `available` flag any more**;
five studios that had nothing behind them (AI Clipping, Vibe Motion, Workflows, Agents, Design
Agent) were removed rather than shown greyed out, with a comment block in the file recording
each one's reason. `modelsForStudio()` honours an optional `only: string[]` allow-list.

**Design tokens are duplicated in four places** and must be kept in sync by hand:
`app/adora.css`, `tailwind.config.ts` (`adora.*`), `chat/chat.css` (`--chat-*`),
`chat/caos-panel.css` (`--paper/--hair/--vio`). `generations.css` defines its own `--g-*`
layer that *falls back* to the adora vars, so it degrades rather than breaking if they move.

### 13.5 Marketing Studio — the shape, and the mistake that produced the wrong one

**The mistake, recorded so it is not repeated:** the first Marketing implementation was derived
from the *signature* of `generateMarketingStudioAd()` — `{prompt, aspect_ratio, duration,
images_list, video_files}` — without opening `MarketingStudio.jsx`. That signature reads like a
video model, so it shipped as "the video composer with a 2-model roster". It had no way to
populate `images_list` or `video_files` at all, so it could not have generated anything. **Read
the component, not the function signature.**

**The actual shape:**

- **No model dropdown.** Resolution picks the endpoint:
  `720p → seedance-2-vip-omni-reference`, `1080p → seedance-2-vip-omni-reference-1080p`.
  The resolution popover shows which endpoint each choice selects.
- **Three typed upload slots — Product (required), Avatar, References (max 6).** Their order
  **is** `images_list`, which is what `@image1` / `@image2` in the script refer to. A missing
  avatar collapses the list rather than leaving a hole. Reference chips are labelled
  `@image3`, `@image4`, … so the numbering is visible.
- **Video format presets** — six motion templates (UGC, Tutorial, Unboxing, Hyper Motion,
  Product Review, TV Spot). These are **not decoration**: the chosen url is sent as
  `video_files: [url]` and is what the endpoint conditions the motion on.
- **Avatar presets** — eight reference faces, upstream's ids preserved.
- Ratio (5, default `9:16`), duration (4–15s, default 5), **Launch** — not Generate.
- Placeholder: `Describe your ad script… Use @image1 for product, @image2 for avatar.`

**Our changes from upstream:** uploads go through `/api/muapi/upload` so no key reaches the
browser; `localStorage` is namespaced `yvon.marketing.v1` and stores only text/urls; `alert()`
became an inline error line; cyan `#22d3ee` became Adora violet.

**Preset media is hotlinked** from `https://d3adwkbyhxyrtq.cloudfront.net/web-app/`. That host
is **blocked from the cloud build container** (403 at the proxy) but resolves fine in a real
browser — same call as `PROVIDER_LOGOS`. Every tile has an `onError` fallback to a labelled,
still-selectable plate, because a preset is valid whether or not we could show a picture of it.

### 13.6 Open gaps — the honest list

| # | Gap | Where | Consequence if ignored |
|---|---|---|---|
| 1 | `generations` + `design_sessions` tables **do not exist** | Supabase | `/api/generations` 401s; the library is always empty |
| 2 | Supabase auth **cookie names were guessed** (`sb-access-token`, `supabase-auth-token`) | `app/api/generations/route.ts` | may be the real cause of the 401, independent of #1 |
| 3 | **No durable job store** | `app/api/muapi/marketing/route.ts` has the `TODO` | a submitted job's `request_id` is returned but never persisted — a refresh loses a paid 30-min video |
| 4 | `MUAPI_KEY` not set | `.env.local` | all three `/api/muapi/*` routes return **503** with that exact message |
| 5 | The **generic** composer's Generate is still disabled | `page.tsx`, `const estimate = null` | only Marketing has a wired estimate; the other studios never got one |
| 6 | `tsc --noEmit` has **never** been run against the real `@/components/Shell` types | — | the browser harness shims Shell, so a type error there would not have been caught |

Item 3 is the one that costs money. Do it before shipping Marketing to anyone.

### 13.7 How this work is verified — and why the method matters

**A design was once shipped as a product here.** A React component with no handlers, no model
registry, and no picker was delivered as done, having been "verified" by reading the compiled
CSS. It also carried `position:absolute; inset:0`, which ate the sidebar. Nothing was ever
opened in a browser. §5.1 of this handout already says a browser gate "is precisely the tool
that would have caught this session's failure" — this is the second time that sentence applied.

**The harness that now guards it** (recreate it if a fresh session needs one — it is throwaway,
it lives in `/tmp/harness`, not the repo):

1. `esbuild` bundles the **real** `page.tsx` with shims for `@/components/Shell`,
   `next/navigation`, `@/lib/*` — no mock of the component under test.
2. A tiny static server + Playwright clicks **every control**.
3. Assertions are on behaviour (`this popover opened`, `this payload was posted`), never on
   "the class is present".

Current: **27 tests** on the generic surface, **18** on Marketing, zero console errors. The
repo-resident equivalents are `tests/generations.spec.ts` and `tests/marketing.spec.ts`, which
run against `npm run dev`.

**Traps the harness caught that a code read did not:**

- **`.gen-ctls` is `overflow-x: auto` — a clipping context.** A popover rendered *inside* it is
  cut off and the visible remnant falls behind `.gen-canvas`, so clicks land on the canvas.
  Every popover must be a child of the bar (`position: relative`), never of the control row.
  This is exactly how the generic composer was already built; the Marketing port broke it and
  the test found it.
- **Headless Chromium has no H.264 decoder.** `<video src="…mp4">` fails with
  `MediaError.code 4`, which looks identical to a broken component. Serve **webm** in tests, or
  you will "fix" a bug that does not exist. Confirmed working with webm:
  `readyState 4, paused false, 240×320`.
- **Playwright gives precedence to the LAST registered route.** A specific `route()` must be
  registered *after* the general one or it never fires.
- **A stubbed asset can trip the very fallback you are testing.** The "these tiles are videos"
  assertion silently began testing the fallback plate once the CDN stub returned a GIF.
- **Toy static servers must read the file before `writeHead`.** `writeHead(200)` then a
  throwing `readFileSync` then `writeHead(404)` in the catch → `ERR_HTTP_HEADERS_SENT`, which
  kills the server mid-suite and looks like a test hang.

**A recurring CSS bug, hit three separate times in the design artifacts:** a generic class
name (`.gate`, `.gen`) used for a *layout block* also matched a *modifier* on small chips
(`.bt.gate`, `.bt.gen`), turning buttons into 600px black boxes. Namespace modifiers.

### 13.8 Exact next steps on resume

1. **Supabase migration** for `generations` + `design_sessions` (gap #1). Then fix the guessed
   cookie names (#2) and confirm `/api/generations` returns 200.
2. **Persist the job** in `app/api/muapi/marketing/route.ts` where the `TODO(quinn)` is — insert
   the row with `request_id`, endpoint, estimate, and status, so a refresh survives (#3).
3. Wire `estimate-cost` for the **generic** composer the way Marketing does (#5).
4. Run `npx tsc --noEmit` in `dashboard/` — it has genuinely never been run against these files.
5. Run both browser specs against `npm run dev` with `MUAPI_KEY` set.
