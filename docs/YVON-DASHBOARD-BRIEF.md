# YVON Live Graph Dashboard — Build Brief

**For:** a Cowork session with filesystem access to the YVON repo
**Goal:** wire the existing dashboard graph viewer to real structure + real live agent state

---

## 0. Context

The YVON repo contains a multi-agent system. A graph visualization component
already exists (design-complete, placeholder data). This brief covers connecting
it to real data.

**Known facts about the repo** (verified):

```
Agents/                          ← repo root
├── .agents/skills/              ← skills (brandkit, design-taste-frontend, …)
├── .claude/
├── cli/
├── dashboard/                   ← Next.js app, deploys to Vercel
├── dist/
├── docs/
├── graphify-out/                ← graph.json, graph.html, GRAPH_REPORT.md, manifest.json
├── rag/
├── src/
├── store/
│   ├── hermes/                  ← hermesMemoryDir
│   └── agent-memory/            ← agentMemoryDir
├── Teams/                       ← ORG STRUCTURE LIVES HERE
├── vps-scripts/
├── AGENTS.md
├── CLAUDE.md                    ← "routing table (46 agents, 7 departments)"
└── yvon.config.json
```

**Teams/ layout** — the org chart IS the directory tree:

```
Teams/<Department>/<agent>/
    agent.md
    agent.toon
    identity/
    logical/
    operational/
    custom/
    marketplace/          (not on all agents)
```

Example: `Teams/AI & Agents/proto/` → department "AI & Agents", agent "proto".
Departments also contain non-agent files (`README.md`, `FLEET-CHARTER.toon`,
`DEPARTMENT-WORKFLOW.toon`) — **a directory is an agent iff it contains
`agent.toon` or `agent.md`.**

**Scale:** 7 departments, 46 agents (per `AGENTS.md`).

**Execution:** agents run via **Hermes**, hosted on a VPS.

**Deployment target:** dashboard on Vercel. Agents on VPS. Nothing depends on a
local machine.

---

## 1. Architecture decided

Two data paths, deliberately separate — they have opposite requirements.

| | Structure | Live state |
|---|---|---|
| What | departments, agents, links | who's running, counts, errors |
| Changes | rarely (on commit) | constantly |
| Source | `Teams/` directory tree | Hermes run events |
| Transport | static JSON from CI build | Supabase Realtime |
| Latency need | minutes OK | sub-second |

```
GitHub repo (Teams/)
   │ push
   ├──▶ CI: build structure.json ──▶ Vercel deploy ──▶ dashboard
   │
   └──▶ VPS: Hermes runtime
              ├─ writes run events → Supabase
              └─ reads task rows   ← Supabase
                                        ▲
                    Vercel dashboard ───┘
                      · reads structure.json (static)
                      · subscribes Realtime (live glow)
                      · inserts task rows to trigger runs
```

Dashboard never talks to the VPS directly. No inbound ports, no tunnel.

---

## 2. Investigation tasks (do these first, report findings)

### 2.1 Read `master.md`
Locate and read it. Extract and report:
- How Hermes dispatches a run — the entry point that picks up work and invokes
  an agent. **This is the single instrumentation point.**
- Whether Hermes already persists run records, and in what format
- What identifier Hermes uses for an agent (directory name? slug? uuid?)

### 2.2 Inspect Hermes state
```bash
ls -la store/hermes/ | head -30
find store/hermes -type f | head -20
```
Report: does Hermes already write run records to disk? If yes, show the shape of
one. **If run records already exist, most of the event pipeline is built and we
only need a transport to Supabase — do not invent a new event schema.**

### 2.3 Check whether Graphify already has the org structure
```bash
python3 -c "
import json
g = json.load(open('graphify-out/graph.json'))
print('keys:', list(g.keys()))
nodes = g.get('nodes', [])
print('node count:', len(nodes))
teams = [n for n in nodes if 'Teams' in json.dumps(n)]
print('Teams-related nodes:', len(teams))
print(json.dumps(teams[:3], indent=2)[:1200])
"
```
**Decision rule:** if Graphify has department→agent edges, use `graph.json` as
the structure source. If it only indexed code (`src/`, `cli/`, `dashboard/`) and
treated `Teams/` as loose docs, **write the separate build script in §3.1** and
leave Graphify alone for agent retrieval.

Expectation: Graphify is an AST-based *code* mapper; org structure in TOON/MD
config is likely not captured as typed edges. Verify rather than assume.

### 2.4 Parse one agent definition
```bash
cat "Teams/AI & Agents/proto/agent.toon"
cat "Teams/AI & Agents/proto/agent.md" | head -40
find Teams -maxdepth 1
```
Report: the TOON schema, which fields exist (role, description, tools, owner,
department), and the full list of 7 department names.

### 2.5 Existing dashboard + Supabase
```bash
ls dashboard/
cat dashboard/package.json
grep -ri "supabase" --include="*.ts" --include="*.tsx" --include="*.json" -l . | head
```
Report: Next.js version, App or Pages router, whether Supabase is already
wired for YVON (vs only Hourbour).

---

## 3. Build tasks

### 3.1 Structure build script

`scripts/build-structure.mjs` — walks `Teams/`, emits
`dashboard/public/structure.json`.

Rules:
- A directory under `Teams/<Dept>/` is an agent **iff** it contains `agent.toon`
  or `agent.md`
- Skip `README.*`, `FLEET-CHARTER.*`, `DEPARTMENT-WORKFLOW.*`, `*-PLAN.md`
- Parse `agent.toon` for role/description; fall back to the directory name
- **Agent id must be stable and deterministic** — `slug(dept) + "-" + dirname`.
  This id is the contract with the event pipeline; if it drifts, nothing lights
  up.

Output shape (the viewer expects exactly this):

```json
{
  "version": 1738531200000,
  "departments": [
    {
      "id": "ai-agents",
      "name": "AI & Agents",
      "metric": "8",
      "metricLabel": "Agents Active",
      "agents": [
        { "id": "ai-agents-proto", "name": "proto", "tag": "…from agent.toon" }
      ]
    }
  ]
}
```

Wire as `"prebuild"` in `dashboard/package.json` so every Vercel deploy
regenerates it. Add a GitHub Action on push to `Teams/**` so structure updates
without a code change.

### 3.2 Supabase events schema

```sql
create table runs (
  id           uuid primary key default gen_random_uuid(),
  agent_id     text not null,          -- MUST match structure.json ids
  department   text not null,
  status       text not null,          -- 'started' | 'completed' | 'failed'
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  error        text,
  meta         jsonb
);
create index on runs (started_at desc);
alter publication supabase_realtime add table runs;
```

Emit **start and end only — no heartbeats.** The dashboard fades a node over
~10–30s after completion, which gives "recent activity" warmth rather than a
binary on/off and keeps writes minimal.

### 3.3 Hermes instrumentation

At the single dispatch point found in §2.1, wrap agent invocation:

```
on start    → insert runs row (status='started')
on success  → update ended_at, status='completed'
on error    → update ended_at, status='failed', error=<message>
```

Must not block or fail the agent run — fire-and-forget with a caught error.

### 3.4 Dashboard wiring

Abstract the event source behind one interface so transport can change without
touching components:

```ts
// dashboard/lib/events/index.ts
export interface RunEvent {
  agentId: string; department: string;
  status: 'started' | 'completed' | 'failed';
  ts: number; error?: string;
}
export interface EventSource {
  subscribe(cb: (e: RunEvent) => void): () => void;
}
```

Implement `supabaseSource()` using Realtime on the `runs` table.

Then in the existing graph component:
- Replace the placeholder `DEPARTMENTS` const with a fetch of `/structure.json`
- Replace the `setInterval` activity simulator with the event subscription
- Key status by `agentId`; roll agent status up to department status
- **Keep layout frozen.** Positions are computed once in `useMemo` from stable
  ids and must never recompute on a state change. Derive positions from sorted
  agent ids, not array index, so adding an agent doesn't reshuffle the ring.

---

## 4. Constraints

- **Never run agents on Vercel** — serverless timeouts kill long runs. Hermes
  stays on the VPS.
- **Do not commit Supabase service keys.** Env vars only. The dashboard uses the
  anon key + RLS; the VPS uses the service key.
- **`agent_id` is the contract** between structure and events. Changing the slug
  rule breaks the glow silently. Pin it and add a test.
- **Don't rebuild Graphify from the dashboard.** Graphify serves agent
  retrieval; the dashboard reads `structure.json`. Keep them independent.

---

## 5. Definition of done

1. `structure.json` generated from `Teams/`, 7 departments and 46 agents present
2. Dashboard renders real department and agent names, no placeholder data
3. A Hermes run on the VPS lights the corresponding node in the deployed
   dashboard within ~1s
4. Node positions stable across reloads and across state changes
5. Adding an agent directory + push → structure updates on next deploy without
   layout reshuffle

---

## 6. Report back

- Findings from every §2 task, especially the Hermes dispatch point and whether
  run records already exist
- The TOON schema and the 7 department names
- Whether Graphify covered the org structure (yes/no + evidence)
- Any place where this brief's assumptions were wrong — the brief was written
  without filesystem access and several details are inferred
