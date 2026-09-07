# Shared OS — Shared Tool Registry

**System of record** for plugins, npm deps, CLIs, skills, Python tools, and on-demand
services used by two or more agents (Playbook §13.6). MCP **servers** are registered by relay
(`Teams/AI & Agents/relay/custom/mcp-tool-registry/`); this file points to relay for those and
covers everything else.

*Last restructured 2026-08-01 — added placement map + INSTALLED/LICENCE columns; recorded the
reticle/page-agent/taste-skill/localstack/vaultwarden installs and the overlap dedup.*
*2026-09-04 VPS audit — every VPS row below verified against the live box (`hermes.yvon.in`);
vaultwarden stood up (https://vault.yvon.in), graphify skills synced 0.9.32→0.9.49, opensandbox
SDK/CLI installed in a dedicated venv, turbovec venv torn down (see its entry), MemPalace row
corrected — it was behind reality.*

---

## Why tools do NOT live inside `Teams/Shared OS/tools/`

This folder is a **registry (documentation) + a home for shared *skill* files** — it is **not a
package root or a runtime**. Every tool installs to the home its runtime *requires*, and this
file records where. Reasons a tool lives elsewhere:

- **npm packages → `node_modules`.** Node's module resolution only finds a dependency if it sits
  in a `node_modules` on the import path. `import { Agentation } from 'agentation'` resolves from
  `dashboard/node_modules`, never from a docs folder. Putting packages here would make them
  unimportable, and would commit thousands of vendor files into Shared OS.
- **Skills → the agent runtime's skill dir** (`.agents/skills/`, `.claude/skills/`). Agents
  auto-discover skills there; a copy under Shared OS wouldn't be loaded. (The *reusable* skill
  files we author ourselves — impeccable, ponytail — DO live in `Teams/Shared OS/skills/`, which
  is the one thing that belongs in Shared OS.)
- **Docker service *config* → `Teams/Shared OS/tools/<name>/`.** The `docker-compose.yml` +
  `.env.example` ARE docs-like config, so they live in Shared OS right next to this registry
  (managed by `cli/tool.sh`). What stays *out* is the runtime: the running containers, the data
  volumes, and the filled-in `.env` secrets — all gitignored. A docs folder holds config, never
  secrets or vendor data.
- **Python tools → venvs on the VPS** (`/opt/yvon-tools/venvs/`). Server-side, machine-specific,
  never in the repo (Ubuntu 24.04 is externally-managed → one venv per tool).
- **MCP servers → user/host config**, spawned on demand; registered by relay.

**Rule (unchanged):** install once to the natural home → register here → cite by reference from
each consuming agent's `operational/tool/<agent>-tool-requirements.md`. Never re-install or
re-document per agent, and never install *into* an agent folder or into this folder.

---

## Placement map — the homes and what belongs in each

| Home | Path | What lives here | Why here |
|---|---|---|---|
| **ROOT node_modules** | `/node_modules` | engine + shared agent/build npm devDeps | resolvable by `cli/`, `rag/`, and the `tsc` build |
| **DASH node_modules** | `/dashboard/node_modules` | the Next.js app's deps (ship) + devDeps (dev-only) | the dashboard imports them at build/runtime |
| **Agent skills** | `/.agents/skills`, `/.claude/skills` | installed markdown skills (taste-skill) | agent runtime auto-discovers skills here |
| **Shared OS skills** | `/Teams/Shared OS/skills/` | skill files we author (impeccable, ponytail) | the reusable-skill home — the *only* tool artifact inside Shared OS |
| **On-demand service config** | `/Teams/Shared OS/tools/<name>/` | `docker-compose.yml` + `.env.example` | config is docs-like → lives in Shared OS; containers/volumes/`.env` secrets are gitignored runtime, started one at a time via `cli/tool.sh` |
| **VPS Python** | `/opt/yvon-tools/venvs/` (Contabo) | per-tool Python venvs | server-side scraping/security; not repo artifacts |
| **MCP servers** | user/host config | stdio MCP registrations | spawned on demand; registered by relay |

Legend for **Installed?**: ✅ installed · ◑ declared (run one command to finish) · ⚙ ready
(fill `.env`, then `tool.sh up`) · ○ needs-config · ⛔ dropped.

---

## Registry — grouped by install home

### ROOT `node_modules` — engine/agent devDeps

| Tool | Ver | Installed? | Licence | Purpose | Consumers |
|---|---|---|---|---|---|
| impeccable | 3.2.1 | ✅ | ⚠ verify | Design-quality gate: 46 detectors + 23 `/impeccable` commands | atlas, spark, pixel, mia |
| @playwright/test | 1.61.1 | ✅ (chromium) | Apache-2.0 | Scripted E2E release gate | quinn, mia, nova |
| agentation | 3.0.2 | ✅ | PolyForm Shield 1.0 (not OSS) | Human→agent visual feedback (dev-only) | mia, quinn |
| ponytail | 4.8.4 | ✅ | MIT | Minimal-code generation skill | dev, axiom |

### DASH `node_modules` — the Next.js app

| Tool | Ver | Type | Installed? | Licence | Purpose | Where wired |
|---|---|---|---|---|---|---|
| @playwright/test | 1.61.1 | devDep | ✅ | Apache-2.0 | E2E gate | `dashboard/playwright.config.ts` (chromium-only) |
| agentation | 3.0.2 | devDep | ✅ | PolyForm Shield 1.0 | feedback toolbar | `dashboard/components/AgentationToolbar.tsx`, dev-guarded in `layout.tsx` |
| @reticlehq/core (reticle) | 2.2.1 | devDep | ✅ | Apache-2.0 / FSL-1.1-ALv2 / EE | In-loop verification (`file:line`); dev-only | installed in `dashboard/node_modules`; MCP registered in `~/.claude.json` |
| page-agent | 1.12.2 | **dependency** | ✅ | MIT | In-page GUI agent — **ships to users' browsers** | installed in `dashboard/node_modules` |

> reticle EE (`packages/server/src/ee/`) must never be enabled; grep the prod bundle to prove the SDK tree-shakes (warden condition).

### Agent skills — `/.agents/skills`

| Tool | Count | Installed? | Licence | Purpose | Consumers |
|---|---|---|---|---|---|
| taste-skill | 12 skills | ✅ (full set) | MIT | Frontend design-taste generation guidance | atlas, mia, spark, pixel |
| getdesign | — | per-build `npx` (no install) | ⚠ verify | 74 reference `DESIGN.md` systems | atlas, mia |

### On-demand services — `/tools/<name>/` via `cli/tool.sh`

| Tool | Home | Installed? | Licence | Purpose | Consumers |
|---|---|---|---|---|---|
| localstack | Mac dev | ⚙ ready | Apache-2.0 | Local AWS emulator for integration tests | raj, dana |
| vaultwarden | VPS | ✅ **running** (2026-09-04) | GPL-3.0 | Self-hosted secrets vault (Bitwarden-compatible, ~256 MB) — live at `https://vault.yvon.in` (TLS via certbot, nginx → 127.0.0.1:8080, signups invite-only, admin token in the VPS-side `.env` never committed, weekly backup cron Mondays 05:00 → `/root/vault-backups/`) | warden, bastion, ops |
| plausible | VPS | ○ | AGPL-3.0 | Privacy web analytics | ops, rank |
| cal-com | VPS | ○ | AGPL-3.0 | Scheduling (likely on old Hostinger box) | raj, spec |
| penpot | VPS | ○ | MPL-2.0 | Design/prototyping (Figma alt) | atlas, spark, pixel |
| appflowy | VPS | ○ | AGPL-3.0 | Collaborative workspace (Notion alt) | spec, marcus |

Config folders: `Teams/Shared OS/tools/<name>/` (compose + `.env.example`, committed).
Start one: `cli/tool.sh up <name>` · stop + free RAM: `cli/tool.sh down <name>` · `cli/tool.sh status`.
On 12 GB, run one heavy service at a time.

### VPS Python venvs — `/opt/yvon-tools/venvs/` (via `vps-scripts/install-tools.sh`)

| Tool | Installed? | Licence | Purpose | Consumers |
|---|---|---|---|---|
| crawl4ai | ✅ `/opt/yvon-tools/venvs/crawl4ai` (CLI: `crwl`) | Apache-2.0 | JS-rendered crawl → markdown for RAG (key-free default) | dana, rank, scout |
| agent-reach | ✅ `/opt/yvon-tools/venvs/agent-reach` + `/usr/local/bin` + skill (**VPS**) | ✅ installed v1.5.0 (2026-08-25); **refreshed 2026-09-05** — `yt-dlp 2026.08.19` + `yt-dlp-ejs 0.8.0` installed into the venv, CLI symlinked to `/usr/local/bin/yt-dlp`, `--js-runtimes node` config written → doctor now **5/15 channels** (Web via Jina Reader, YouTube ✅, RSS, V2EX, Bilibili) | Read Web/YouTube/GitHub/RSS/V2EX (+opt-in Twitter/Reddit). **2026-09-05: first-choice reference reader for hermes chat** (Jina Reader fetches from Jina's infra, so it succeeds where the site blocks the VPS IP — e.g. Akamai 403s — key-free) | cypher, meta, **hermes (reference-scrape order: agent-reach → web_extract → crawl4ai)** |
| strix | ✅ pipx `strix-agent 1.4.1` → `/usr/local/bin/strix` (Docker on-demand) | Apache-2.0 | Autonomous security/pentest agent; **reuses Hermes's LLM key** (`STRIX_LLM`+`LLM_API_KEY`) | cypher |
| **HeadlessX** | ✅ **self-host Docker stack** at `/root/.headlessx` (2026-09-05, `headlessx init --mode self-host`): 7 containers (api :38473, web :34872, worker, postgres :35432, redis :36379, yt-engine, html-to-md) all healthy. **All ports bound 127.0.0.1** (same-day fix: init shipped 0.0.0.0 — API/web/Postgres/Redis were internet-reachable with only the internal key guarding the API; compose profiles = `--profile all`). API auth: `DASHBOARD_INTERNAL_API_KEY` in `/root/.headlessx/repo/infra/docker/.env` (401 without it). MCP endpoint at `/mcp`. TIER-1 log: `store/quarantine/headlessx.log` (heuristic FAIL — child_process/env/hooks — overridden by operator review, findings individually assessed) | AGPL-3.0 | Anti-detect browsing + scraping platform (Camoufox/Firefox stealth): website render/crawl/map, YouTube ops, html→md, proxy mgmt — for the hard-blocked targets neither crawl4ai nor agent-reach can reach | cypher, dana, rank, scout, hermes (escalation AFTER agent-reach/crawl4ai) |
| opensandbox (SDK/CLI/MCP) | ◐ SDK+CLI installed 2026-09-04 in dedicated VPS venv `/opt/yvon-tools/venvs/opensandbox` (`opensandbox==0.1.14` + `opensandbox-cli==0.1.1`, pinned in `requirements.txt`). An earlier 2026-08-10 "installed" claim proved stale — the 2026-09-04 audit found it on no VPS python env. ○ live containers still need Docker/K8s (VPS has Docker; not yet run) | ⚠ verify | Isolation runtime — quarantine box (§7.7) | ops, warden, bastion, dana, scout; mia, quinn, raj, nova (MCP) |
| **graphify** (`graphifyy`) | ✅ VPS `/usr/local/bin/graphify` 0.9.49 (skills in `~/.hermes/skills/` + `~/.agents/skills/` + `~/.claude/skills/` synced to 0.9.49 on 2026-09-04 — package had drifted to 0.9.49 while skills sat at 0.9.32, the tool itself warning about the mismatch) · Mac `uv tool` + git hooks | MIT | **Graph-brain structural engine**: deterministic AST knowledge graph, Obsidian export, community clustering, lessons/reflect loop, MCP serve, git-hook self-build. **No vector store.** Not in Shared OS/tools — uv-tool/venv + `graphify-out/` in repo | all agents (via `/graphify` skill + MCP) |
| **MemPalace** | ✅ **Phase 1** (2026-08-09, ADR-001) — installed per Claude Code session via `uv tool install mempalace` / `pip install mempalace[pgvector]`, backend `pgvector` against the shared Supabase Postgres (`vector` extension enabled 2026-08-09). ✅ **VPS-resident CLI also live (verified 2026-09-04)** — venv `/opt/yvon-tools/venvs/mempalace` with `mempalace` + `mempalace-mcp` CLIs, local data store at `/root/.mempalace` (rag.db, drawers, runs, design-sessions, plan-lock.jsonl). A prior row here said "Phase 2 not installed" — that was behind reality: the nightly mempalace rebuilds (cron) have been running against this venv for weeks. ○ **`mempalace serve` for Hermes/dashboard** still not stood up as a service (deferred until the chat system plan lands; scaffold at `vps-scripts/mempalace-serve-install.md`) | MIT | **Graph-brain episodic engine** (replaces turbovec, ADR-001): verbatim storage + semantic search, wings=brands/clients · rooms=depts · drawers=verbatim, temporal KG (add/query/invalidate/timeline), 44 MCP tools. Full detail: `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §6 | Claude Code sessions + nightly cron in Phase 1. `serve` for Hermes + dashboard backend — not yet wired |

~~turbovec / fastembed~~ — **removed 2026-08-09, superseded by MemPalace (ADR-001).** VPS venv at `/opt/yvon-tools/venvs/turbovec` torn down 2026-09-04 (verified — venvs dir held agent-reach, browser-use, crawl4ai, jobhunt, mempalace, opensandbox, scrapegraphai at teardown time; browser-use + scrapegraphai were removed 2026-09-07, see below). **WHY removed:** ADR-001 (2026-08-09) named MemPalace the episodic engine and dropped turbovec; nothing in this repo installs or calls it, it was occupying disk on the box while dead, and the teardown was approved during the 2026-09-04 VPS audit.

~~browser-use~~ — **removed 2026-09-07 (operator order, after the LLM-vs-deterministic comparison).** Venv `/opt/yvon-tools/venvs/browser-use` (435 MB) torn down same day; VPS sweep found zero cron/systemd/script references and the repo had zero runtime callers (agent-doc mentions only). **WHY:** an autonomous NL browser agent nobody called — deterministic browser automation is Playwright (the release gate) + quinn's local real-browser gate, and stealth fetching of walled targets is HeadlessX + the capture-worker relay. Exploratory-QA skills that named it (quinn `exploratory-qa`, rank `browser-audit`, dana act-and-extract) degrade to those.

~~scrapegraphai~~ — **removed 2026-09-07 (operator order).** Venv `/opt/yvon-tools/venvs/scrapegraphai` (520 MB) torn down same day; zero references on the VPS and zero runtime callers in the repo. **WHY:** every extraction page burned LLM inference, and structured extraction is covered free by **crawl4ai** (kept — the deterministic bulk-crawl default) plus the agents' own LLM reading crawl4ai's markdown. Rule of thumb recorded from the comparison: *LLM for the first read of something new; deterministic for everything you'll ever read twice.* ~955 MB freed (disk 37G→36G used).

**Agent usage** (preserved from the removed command-only stub folders):
- **agent-reach** — CLI: `agent-reach read <url>` · `agent-reach search twitter|github "q"` · `agent-reach doctor`. Python: `from agent_reach import AgentReach; AgentReach().read(url)`. Zero-config for Web/YouTube/GitHub/RSS/V2EX/Exa/Bilibili; Twitter/Reddit/XiaoHongShu need opt-in cookie login. Web reads go through Jina Reader (`https://r.jina.ai/URL`) — the fetch comes from Jina's infrastructure, so pages that 403 the VPS's own IP (Akamai etc.) still read fine, key-free. YouTube path needs the node JS runtime: `/root/.config/yt-dlp/config` holds `--js-runtimes node` (set 2026-09-05).

### Reference capture — repo-local scripts (THE site scraper, 2026-09-07)

| Tool | Home | Requirements | Purpose | Consumers |
|---|---|---|---|---|
| **capture-reference.py** (+ `build-static-clone.py` + `verify-clone-proof.py`) | repo `scripts/` — runs on the **local machine** (headed browser, residential IP) | Python + `playwright` + `undetected-playwright`, Edge/Chrome installed; a visible browser window for ~1-2 min | **THE canonical site scraper for reference capture**: stealth headed browser passes Akamai-class bot walls; harvests every DOM/CSS-referenced asset (bot-walled fonts via in-page fetch bridge); emits `reference.html/png` + `inventory.json` + `asset-manifest.json` → clone builder → offline static clone (+ `--standalone` single-file) → headless proof | mia, dev, spec — the reference-capture stage; any "clone/ingest this site" task |
| **capture-worker.py** + **request-capture.py** | repo `scripts/` — worker runs on the local (residential-IP) machine; dispatcher runs anywhere with ssh to the VPS | ssh key auth to `root@hermes.yvon.in`; queue dirs at `/root/capture-queue/{pending,running,done,failed,captures}` (auto-created) | **The live-operation relay** (built + smoke-proven 2026-09-07, 55s round-trip): VPS agent enqueues `{url,out}` jobs (`request-capture.py` / plain ssh write), the worker polls over ssh, captures with its own private stealth Edge, uploads the bundle; `request-capture.py --wait/--fetch` retrieves + extracts. E2E smoke: books.toscrape.com → complete capture, 30/30 assets | hermes/devops (dispatch side), mia (worker host) |

### MCP servers (registered by relay; spawned on demand)

| Server | State | Notes |
|---|---|---|
| reticle MCP | ✅ added (`~/.claude.json`, user scope) | `npx @reticlehq/core mcp` — dev verification |
| opensandbox-mcp | ○ | needs a running OpenSandbox server (Docker) |

### Dropped (deduped)

| Tool | Why dropped |
|---|---|
| Whisper | ⛔ Hermes ships a builtin `stt` toolset (whisper-1 + local model); transcription already works on Contabo. Standalone Whisper is redundant. |

---

## Overlap decisions (dedup audit, 2026-08-01)

- **Whisper = Hermes builtin `stt`** → dropped (above).
- **Scraping cluster (UPDATED 2026-09-07 — operator directive after the Brunello Cucinelli
  proof): `scripts/capture-reference.py` (local headed stealth capture) is THE site scraper —
  use it and ignore the rest for any website reference capture.** Proof matrix
  (2026-09-06/07, shop.brunellocucinelli.com): agent-reach/Jina, HeadlessX (Camoufox stealth,
  VPS), crawl4ai, plain fetch — ALL 403 (Akamai). The only passing combo: Playwright +
  undetected-playwright Malenia stealth, HEADED, on the local machine (headless still denied).
  Demotions: agent-reach stays fine for chat-turn TEXT reads (hermes reference-reading order
  unchanged for markdown-only needs); crawl4ai stays the bulk-RAG crawl default for unwalled
  sites. But anything needing a site's real DOM / assets / motion (reference capture, clone,
  design ingest) goes **straight to capture-reference.py** — never re-probe the matrix.
  Constraint: it needs the local machine (headed browser + residential IP) — it cannot run
  unattended on the VPS.
  **Tier rule for LIVE operation (2026-09-07):** (1) unwalled targets → VPS built-ins
  (agent-reach / crawl4ai / HeadlessX) as today; (2) walled targets → the VPS agent enqueues
  a capture job (`scripts/request-capture.py`) and the local **capture-worker** picks it up
  and captures with its private stealth Edge; (3) no worker online → **loud gate failure** —
  never a silent text-only clone. Worker + queue details in the Reference-capture table above.
- **Tool-cost doctrine (2026-09-05, operator directive):** always prefer tools already
  installed in the repo/VPS that are **free**; paid services only when no free path exists
  AND the cost is negligible cents — never wire in a paid tool when a free installed one
  covers the need (this is why the dashboard chat pre-scrape moved off Apify to agent-reach).
  **APIFY DECOMMISSIONED 2026-09-07 (operator order):** every dashboard Apify route is
  deleted (`scrape`, `trending`, `calendar-verify`, `competitor-bulk`, `instagram` POST,
  `linkedin` POST) along with `lib/apify.ts`; `social-stats` is cache-only
  (`lib/social-cache.ts`), `manual-competitor` saves without scraping,
  `competitor-refresh` POST returns 501. The only paid scraping service in the stack is
  gone — website reference capture is `capture-reference.py` (+ worker relay), text reads
  are agent-reach/Jina, bulk RAG crawling is crawl4ai.
- **Design cluster** (impeccable / taste-skill / getdesign / penpot): kept **all** per operator —
  impeccable = deterministic CI detectors, taste-skill = generation guidance, getdesign =
  references, penpot = full design tool. `taste-skill/stitch-design-taste` overlaps getdesign and
  `redesign-existing-projects` overlaps impeccable, but both installed by choice.
- **Browser cluster** (playwright / reticle / agentation / page-agent): kept all —
  each hits a different point (scripted gate · in-loop · feedback-in · shipped feature).
  ~~browser-use~~ (the cluster's "autonomous" point) **removed 2026-09-07** — zero callers; see removal note above.

---

## Sandbox-first quarantine (§7.7) — two tiers
Any new external tool/skill/dep is vetted BEFORE it touches the repo:
- **TIER-1 · process box** — `cli/quarantine.sh <name> <git|npm> <source>` (no Docker, runs everywhere): throwaway dir outside the repo, warden safety-scan, claim check, PASS/FAIL, log → `store/quarantine/`. Default; closes the Docker-less gap.
- **TIER-2 · container** — OpenSandbox `Sandbox.create()` (kernel isolation, needs Docker/K8s) when available.
Rule: no Docker ⇒ TIER-1, never skip. Each installed tool should carry a `store/quarantine/<name>.log` once re-vetted.

## Boundary note — browser automation (after browser-use removal)
- **Playwright** = deterministic release gate. Script every step + assertion; answers "does the *known* flow still pass?" Runs in CI, blocks releases. Owner: quinn.
- ~~browser-use~~ (autonomous NL exploratory agent, non-deterministic, never a CI gate) — **removed 2026-09-07** with zero callers; exploratory QA runs through quinn's local real-browser gate + Playwright regressions instead.
- The old stacking pattern survives that pair: real-browser exploration finds the bug → a scripted Playwright test gates the regression forever.

## How to add a row
1. Confirm the tool is (or will be) used by ≥2 agents. One agent only → keep it in that agent's `tool/` file until a second needs it.
2. Install to the tool's natural home (see the placement map) — never into this folder or an agent folder.
3. Add a row to the correct home group above: tool, version, Installed?, Licence, purpose, consumers.
4. In each consuming agent's `operational/tool/<agent>-tool-requirements.md`, cite: *"Shared OS tool (inherited, not owned): <name> — see Shared OS/tools/shared-tool-registry.md."*
5. If it's an MCP server, register it with relay and link that row here.
