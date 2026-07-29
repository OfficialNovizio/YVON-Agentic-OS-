# YVON-OS Import — Screen & Rewiring Analysis

**Purpose:** the imported YVON-OS app (`dashboard/`) was built to run against **ToonGine / a Hermes VPS**. This report catalogs every screen, its data dependencies, and what each must be re-pointed to so the app runs on the **in-project YVON-Engine** pipeline instead of the external ToonGine backend.
**Date:** 2026-07-28 · analysis by spec (product) + dev (architecture) · source: `dashboard/` (imported from OfficialNovizio/YVON-OS)

---

## 1. Executive summary

- **What it is:** a 35-screen AI agent command centre ("Mission Control") — decision queue, task board, content/social/growth pipelines, agent org, analytics. MD3 dark UI with per-workspace accent theming.
- **How it's built:** Next 15 / React 19, **200+ API routes**, a ~94-file `lib/` data layer.
- **The two `node_modules`** (your question, answered structurally): the app is a *second* Node project living inside the engine repo — `dashboard/` has its own `package.json` (Next 15 / React 19) separate from the root YVON-Engine tools (React 18). "Inbuilding" it means it stays its own app but its **backend is rewired** from ToonGine to the engine.
- **The rewire target:** replace the external **Hermes-VPS / ToonGine** calls with the in-project engine — `rag/` (CIE + retrieval), the agent fleet in `Teams/`, and the Hermes memory now at `store/hermes/`.
- **Current data status:** ~**26 of 35 screens render on static/mock data**; ~9 fetch live API routes. The `lib/` + `app/api` layer is where ToonGine/Supabase/LLM integration lives.

---

## 2. Architecture as-imported

```
                       dashboard/ (Next 15 app)
  ┌─────────────────────────────────────────────────────────────┐
  │  35 screens (app/*/page.tsx)                                 │
  │      │ fetch('/api/*')                                       │
  │  200+ API routes (app/api/*/route.ts)                       │
  │      │                                                       │
  │  lib/ data layer (94 files)                                 │
  └───────────────┬───────────────┬───────────────┬─────────────┘
                  │               │               │
          ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼─────────────┐
          │ Hermes VPS   │ │  Supabase   │ │ LLM + integrations │
          │ (ToonGine    │ │  (db.ts,    │ │ Anthropic/DeepSeek,│
          │  agent       │ │ db-phase1)  │ │ Instagram(45),     │
          │  runtime,SSH)│ │             │ │ LinkedIn(36), GA,  │
          │ graph-memory │ │             │ │ Leonardo/HeyGen/…  │
          └──────────────┘ └─────────────┘ └────────────────────┘
```

**Env the app expects** (`.env.example`): `HERMES_VPS_HOST/USER/KEY`, `HERMES_AGENTS_ENABLED`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, plus per-integration keys (LinkedIn, Leonardo, HeyGen, ElevenLabs, Krea, Adzuna, Apify, Kit, GitHub, Stripe, GA).

**The ToonGine/Hermes touchpoints** (the core rewire surface):
`app/api/council/convene`, `app/api/team-chat/execute-stage`, `lib/hermes-spawn.ts`, `lib/graph-memory.ts`, `lib/council-preflight.ts`, `lib/chat-session.ts`, `lib/agent-tools.ts`.

---

## 3. Screen inventory (35 screens)

Legend — **Data:** 🟢 live API · ⚪ static/mock (renders, no backend yet)

### Command Center
| Screen | Purpose | Data | Fetches |
|---|---|---|---|
| `/dashboard` | System health + decisions summary (home) | 🟢 | `/api/dashboard` |
| `/decision-queue` | AI-curated "what needs you now" queue | 🟢 | `/api/decision-queue` |
| `/task-board` | Kanban of agent tasks | ⚪ | mock |
| `/advisory-council` | Multi-agent council chat (SSE) | 🟢 | `/api/council/convene` → **Hermes** |
| `/agents` | Agent roster + health | 🟢 | `/api/ventures-health` |
| `/org-chart` | Agent org hierarchy | ⚪ | mock |
| `/office` | "The Office" spatial agent view | ⚪ | mock |
| `/skill-workshop` | Train/promote agent skills | 🟢 | `/api/skill-workshop/*` |

### Long-form
| `/content-pipeline` | Long-form content stages | ⚪ | mock |
| `/production-calendar` | Content calendar | ⚪ | mock |
| `/youtube-studio` | YouTube production | ⚪ | mock |
| `/youtube-analytics` | YouTube metrics | ⚪ | mock |

### Shorts
| `/short-pipeline` · `/shorts` | Shorts production + list | ⚪ | mock |

### Posts
| `/social-approvals` | Approve staged social posts | 🟢 | `/api/william/copy` |
| `/scheduler` | Post scheduler | ⚪ | mock |
| `/social-analytics` | Social metrics | ⚪ | mock |
| `/newsletter` | Newsletter composer | ⚪ | mock |

### Knowledge
| `/brain-wiki` | Knowledge base / wiki | ⚪ | mock |
| `/asset-lab` | AI image gen (Leonardo) | 🟢 | `/api/leonardo/generate` |
| `/trend-radar` | Trend scanning (Isaac) | 🟢 | `/api/isaac/scan` |

### Build
| `/idea-feed` | Idea backlog (94 items) | ⚪ | mock |
| `/software-pipeline` | Software build pipeline | ⚪ | mock |

### Revenue
| `/consulting-crm` | Consulting CRM | ⚪ | mock |
| `/cinematic-sites` | Cinematic-site leads | ⚪ | mock |

### System
| `/inbox` | Email inbox | ⚪ | mock |
| `/settings` | System settings | 🟢 | `/api/dashboard`, `/api/ventures-health` |
| `/settings/dashboard` | YVON Engine dashboard config | 🟢 | `/api/yvon-config`, `/api/yvon-dashboard-stats` |
| `/settings/venture` | Per-venture config | 🟢 | `/api/ventures*` |
| `/hardware` | Hardware & runtime status | ⚪ | mock |
| `/projects` · `/people` · `/docs` · `/logs` | Supporting screens | ⚪ | mock |

**Totals:** 35 screens · ~9 live-API · ~26 static/mock (all render; mock is intentional fallback).

---

## 4. Backend surface (what the rewire touches)

- **200+ API routes** under `app/api/` — the integration layer. Biggest clusters: competitor-intelligence (~20 routes), content-lab/content-* (~15), social/instagram/linkedin (~30), agent-cron/* (scheduled agents), council/team-chat (Hermes agent runs).
- **`lib/` (94 files)** — the real logic: `hermes-spawn.ts` (spawns ToonGine agents over SSH), `graph-memory.ts` (ToonGine knowledge graph), `chat-session.ts` (session + context builder), `agent-registry/personalities/skills/tools.ts`, `db.ts`/`db-phase1.ts` (Supabase), `claude-client.ts`/`ai-client.ts` (LLMs).
- **External services actually referenced:** Instagram (45 files), LinkedIn (36), DeepSeek (8), Stripe (1), plus Leonardo/HeyGen/ElevenLabs/Krea/GA/Adzuna/Apify/Kit/GitHub. Supabase/Anthropic/Hermes are referenced via the `lib` wrappers (indirect, so the earlier keyword grep undercounts them).

---

## 5. The rewire map — ToonGine → in-project YVON-Engine

| Imported dependency | Today (ToonGine) | Re-point to (in-project) |
|---|---|---|
| `lib/hermes-spawn.ts` (spawn agent over SSH) | Hermes VPS | the fleet in `Teams/` via `rag/` bridge — run agents locally, no SSH |
| `lib/graph-memory.ts` (knowledge graph) | ToonGine unified.db | `graphify-out/` codegraph + `rag/` retrieval + `store/hermes/MEMORY.md` |
| `app/api/council/convene`, `team-chat` | Hermes council | the CAOS pipeline (`rag/core/*`) + agent routing |
| `lib/chat-session.ts` context builder | CONSTITUTION + Hermes memory | `store/hermes/USER.md`+`MEMORY.md` (already wired via `hermes_memory.py`) |
| `db.ts` / `db-phase1.ts` | Supabase | keep Supabase, **or** the engine's `store/` (SQLite `rag.db`) — decision needed |
| `claude-client.ts` / `ai-client.ts` | Anthropic/DeepSeek keys | unchanged (same LLM providers) — just needs keys in `.env` |
| Social/analytics integrations | direct APIs | unchanged — operator connectors, out of engine scope |

**Key insight:** the Hermes memory contract already matches — the old `chat-session.ts` reads `CONSTITUTION + memory + graph`, and the engine now serves exactly that from `store/hermes/` (TS-002). So the council/chat screens are the *closest* to a clean rewire; the deep integration routes (competitor intel, social) are the *furthest* and may stay as-is or become connectors.

---

## 6. Data-status reality

- **Renders today (mock):** all 35 screens display — the app degrades gracefully to mock when APIs/env are absent (that's why it runs without ToonGine).
- **Truly live once rewired:** dashboard, decision-queue, advisory-council, agents, skill-workshop, asset-lab, trend-radar, settings/* — the 9 that already fetch.
- **Needs a data decision:** Supabase vs engine `store/` for persistence; which of the 200 routes are in-scope vs left as external connectors.

---

## 7. Recommended phasing (proposed TASK-SPECs)

1. **TS-005 · Council/chat rewire** — re-point `chat-session.ts` + `council/convene` + `hermes-spawn.ts` from Hermes-VPS to the in-project `rag/` bridge + `store/hermes`. Highest value, closest fit. *(dev + raj + the AI & Agents team)*
2. **TS-006 · Core dashboards live** — wire `/dashboard`, `/decision-queue`, `/agents`, `/task-board` to real fleet data from `rag/` + `store/`. *(raj + dana)*
3. **TS-007 · Persistence decision** — Supabase vs `store/rag.db`; migrate `db.ts`. *(dana, GATE 0)*
4. **TS-008+ · Integrations triage** — decide per cluster (social, competitor-intel, content-lab): rewire, keep as external connector, or retire. *(spec + relay)*

---

## 8. Risks / open decisions

- **Scope:** 200 routes is a lot of surface. Most should stay external connectors (social/analytics) — only the *agent/council/memory* core needs to move onto the engine. Decide the boundary before building.
- **Persistence:** two stores today (Supabase + engine SQLite). Running both is fine short-term; converging is a GATE 0 decision.
- **Env:** the app needs `.env` keys to light up live screens; without them it stays on mock (which is safe).
- **The two node_modules stay** — that's correct; the app is its own build. Just keep framework packages from leaking between root and dashboard (the crash lesson).
