# Shared OS — Shared Tool Registry

**System of record** for plugins, npm deps, CLIs, skills, Python tools, and on-demand
services used by two or more agents (Playbook §13.6). MCP **servers** are registered by relay
(`Teams/AI & Agents/relay/custom/mcp-tool-registry/`); this file points to relay for those and
covers everything else.

*Last restructured 2026-08-01 — added placement map + INSTALLED/LICENCE columns; recorded the
reticle/page-agent/taste-skill/localstack/vaultwarden installs and the overlap dedup.*

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
| vaultwarden | VPS | ⚙ ready | GPL-3.0 | Self-hosted secrets vault (Bitwarden-compatible, ~256 MB) | warden, bastion, ops |
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
| browser-use | ✅ `/opt/yvon-tools/venvs/browser-use` (import lib) | MIT (verify) | Autonomous NL browser agent (exploratory) | quinn, dana, rank, scout |
| scrapegraphai | ✅ `/opt/yvon-tools/venvs/scrapegraphai` (import lib) | MIT (verify) | LLM-driven structured web extraction | dana, rank, cypher |
| agent-reach | ✅ `/opt/yvon-tools/venvs/agent-reach` + `/usr/local/bin` + skill (**VPS**) | ✅ installed v1.5.0 (2026-08-25) | Read Web/YouTube/GitHub/RSS/V2EX (+opt-in Twitter/Reddit) | cypher, meta |
| strix | ✅ pipx `strix-agent 1.4.1` → `/usr/local/bin/strix` (Docker on-demand) | Apache-2.0 | Autonomous security/pentest agent; **reuses Hermes's LLM key** (`STRIX_LLM`+`LLM_API_KEY`) | cypher |
| opensandbox (SDK/CLI/MCP) | ◐ SDK+CLI installed & unit-tested 2026-08-10 (`pip install opensandbox==0.1.14 opensandbox-cli==0.1.1`, pinned in `requirements.txt`) — import + `osb config init` + all 8 CLI subcommands confirmed live. ○ live containers still need Docker/K8s (VPS), not present in the build sandbox | ⚠ verify | Isolation runtime — quarantine box (§7.7) | ops, warden, bastion, dana, scout; mia, quinn, raj, nova (MCP) |
| **graphify** (`graphifyy`) | ✅ VPS `/usr/local/bin/graphify` 0.9.32 (skills in `~/.hermes/skills/` + `~/.agents/skills/`) · Mac `uv tool` + git hooks | MIT | **Graph-brain structural engine**: deterministic AST knowledge graph, Obsidian export, community clustering, lessons/reflect loop, MCP serve, git-hook self-build. **No vector store.** Not in Shared OS/tools — uv-tool/venv + `graphify-out/` in repo | all agents (via `/graphify` skill + MCP) |
| **MemPalace** | ✅ **Phase 1** (2026-08-09, ADR-001) — installed per Claude Code session via `uv tool install mempalace` / `pip install mempalace[pgvector]`, backend `pgvector` against the shared Supabase Postgres (`vector` extension enabled 2026-08-09). ○ **Phase 2** (planned, not installed) — VPS-resident `mempalace serve`, deferred until the chat system (`MASTER-PLAN.md`) is live; scaffold at `vps-scripts/mempalace-serve-install.md` | MIT | **Graph-brain episodic engine** (replaces turbovec, ADR-001): verbatim storage + semantic search, wings=brands/clients · rooms=depts · drawers=verbatim, temporal KG (add/query/invalidate/timeline), 44 MCP tools. Full detail: `system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md` §6 | Claude Code sessions only in Phase 1. Phase 2 adds Hermes + dashboard backend — not yet, not wired |

~~turbovec / fastembed~~ — **removed 2026-08-09, superseded by MemPalace (ADR-001).** Live VPS venv at `/opt/yvon-tools/venvs/turbovec` may still physically exist until ops tears it down; nothing in this repo installs or calls it anymore.

**Agent usage** (preserved from the removed command-only stub folders):
- **agent-reach** — CLI: `agent-reach read <url>` · `agent-reach search twitter|github "q"` · `agent-reach doctor`. Python: `from agent_reach import AgentReach; AgentReach().read(url)`. Zero-config for Web/YouTube/GitHub/RSS/V2EX/Exa/Bilibili; Twitter/Reddit/XiaoHongShu need opt-in cookie login.
- **scrapegraphai** — Python: `from scrapegraphai.graphs import SmartScraperGraph` with `config={"llm":{"model":"openai/gpt-4o-mini"|"ollama/llama3.2"}}`. Pipelines: SmartScraperGraph (single page), SearchGraph (across results), ScriptCreatorGraph (emit a scraper), SpeechGraph (extract + audio).

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
- **Scraping cluster** (crawl4ai / scrapegraphai / agent-reach / browser-use): **crawl4ai is the
  key-free default**; scrapegraphai only when LLM-structured extraction is needed; agent-reach
  only for gated social platforms; browser-use for autonomous exploratory tasks. Complementary,
  but don't reach for scrapegraphai/agent-reach when crawl4ai suffices.
- **Design cluster** (impeccable / taste-skill / getdesign / penpot): kept **all** per operator —
  impeccable = deterministic CI detectors, taste-skill = generation guidance, getdesign =
  references, penpot = full design tool. `taste-skill/stitch-design-taste` overlaps getdesign and
  `redesign-existing-projects` overlaps impeccable, but both installed by choice.
- **Browser cluster** (playwright / browser-use / reticle / agentation / page-agent): kept all —
  each hits a different point (scripted gate · autonomous · in-loop · feedback-in · shipped feature).

---

## Sandbox-first quarantine (§7.7) — two tiers
Any new external tool/skill/dep is vetted BEFORE it touches the repo:
- **TIER-1 · process box** — `cli/quarantine.sh <name> <git|npm> <source>` (no Docker, runs everywhere): throwaway dir outside the repo, warden safety-scan, claim check, PASS/FAIL, log → `store/quarantine/`. Default; closes the Docker-less gap.
- **TIER-2 · container** — OpenSandbox `Sandbox.create()` (kernel isolation, needs Docker/K8s) when available.
Rule: no Docker ⇒ TIER-1, never skip. Each installed tool should carry a `store/quarantine/<name>.log` once re-vetted.

## Boundary note — browser-use vs Playwright (don't confuse them)
- **Playwright** = deterministic release gate. Script every step + assertion; answers "does the *known* flow still pass?" Runs in CI, blocks releases. Owner: quinn.
- **browser-use** = autonomous exploratory agent. Give a natural-language task; the LLM decides the steps. Non-deterministic → NOT a CI gate. Owner: quinn (QA), dana/rank.
- They stack: browser-use surfaces a bug → the fix gets a scripted Playwright test so the regression is gated forever.

## How to add a row
1. Confirm the tool is (or will be) used by ≥2 agents. One agent only → keep it in that agent's `tool/` file until a second needs it.
2. Install to the tool's natural home (see the placement map) — never into this folder or an agent folder.
3. Add a row to the correct home group above: tool, version, Installed?, Licence, purpose, consumers.
4. In each consuming agent's `operational/tool/<agent>-tool-requirements.md`, cite: *"Shared OS tool (inherited, not owned): <name> — see Shared OS/tools/shared-tool-registry.md."*
5. If it's an MCP server, register it with relay and link that row here.
