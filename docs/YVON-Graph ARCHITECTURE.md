# YVON System Architecture

**VYON Group Inc. — Multi-Brand Agentic Operating System**
Version 1.0 · Architecture Reference

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Architectural Principle](#2-core-architectural-principle)
3. [System Topology](#3-system-topology)
4. [The Four Layers](#4-the-four-layers)
5. [Data Architecture](#5-data-architecture)
6. [Execution Model](#6-execution-model)
7. [Concurrency & Conflict Prevention](#7-concurrency--conflict-prevention)
8. [Memory Architecture](#8-memory-architecture)
9. [Multi-Tenancy & Isolation](#9-multi-tenancy--isolation)
10. [Deployment Topology](#10-deployment-topology)
11. [Repository Structure](#11-repository-structure)
12. [Observability & The Dashboard](#12-observability--the-dashboard)
13. [Failure Modes & Mitigations](#13-failure-modes--mitigations)
14. [Scaling Path](#14-scaling-path)
15. [Build Sequence](#15-build-sequence)

---

## 1. Executive Summary

YVON is the operating core of VYON Group. It holds a single library of agent
definitions and executes them against many separate **contexts** — Novizio,
Hourbour, AgentX, and each of AgentX's clients.

The system is built on one decision that determines everything else:

> **Agents are definitions, not deployments. Contexts are data, not processes.**

Everything in this document follows from that. Agents are never copied,
cloned, or mirrored into sub-brands. A single `marketing-agent` definition
serves Novizio, Hourbour, and 100 AgentX clients — differing only in the
context it is handed at runtime.

**Consequences of this choice:**

| Property | Result |
|---|---|
| Updating an agent | Edit one file. All contexts inherit on next run. |
| Onboarding a client | Write one YAML file. Deploy nothing. |
| Storage per client | One config + one memory namespace (~KB) |
| Compute per client | Zero when idle |
| Scaling | Add workers, not per-client infrastructure |
| Drift risk | Structurally impossible — there is only one copy |

---

## 2. Core Architectural Principle

### 2.1 The rejected model: clone/mirror teams

The intuitive model treats agents like staff — deploy a copy of the Marketing
team into Novizio, another into AgentX, another into each client.

```
                    YVON Marketing Agent
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  Novizio clone       Hourbour clone       AgentX clone
                                                │
                              ┌─────────────────┼─────────────┐
                              ▼                 ▼             ▼
                        Client-01 clone   Client-02 clone   ... ×100
```

**Why this fails:**

- **Drift.** 103 copies diverge. A prompt fix applied to YVON must propagate
  through three levels. Some copies get missed. Behaviour becomes
  non-reproducible.
- **Update cost is O(n).** Every agent change becomes a fleet-wide migration.
- **Debugging is impossible.** "Why did the marketing agent do that?" now
  requires knowing *which copy* ran and *what version* it was on.
- **Onboarding cost is O(n).** Client #101 requires provisioning a full
  agent stack.
- **Storage and compute scale with client count** even when clients are idle.

### 2.2 The adopted model: definition + context

```
        ┌─────────────────────────────────────┐
        │   AGENT DEFINITIONS (one copy)      │
        │   marketing · finance · content ... │
        └──────────────────┬──────────────────┘
                           │ executed with
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ctx: novizio      ctx: hourbour     ctx: agentx/bloom-cafe
   ─────────────     ─────────────     ─────────────────────
   AWS adapter       Supabase adapter  AgentX adapter (scoped)
   novizio memory    hourbour memory   bloom-cafe memory
   novizio guards    hourbour guards   client guards
```

An **agent** is: prompt + skills + tool grants + policies + verification rules.
It is stateless and location-independent.

A **context** is: data adapter + memory namespace + guardrails + enabled agent
list + tier + credentials reference.

A **run** is: `execute(agent_definition, context, task)`.

The same agent node in your visualization can be simultaneously lit toward
Novizio and toward three clients. That is not three agents. It is one
definition in three concurrent executions.

### 2.3 What lives where

| Artifact | Location | Copies | Changes when |
|---|---|---|---|
| Agent definitions | YVON repo | 1 | You improve an agent |
| Skills / prompts | YVON repo | 1 | You improve a capability |
| Routing logic | YVON repo | 1 | Org structure changes |
| Verification protocols | YVON repo | 1 | Quality bar changes |
| Context config | YVON repo | 1 per context | Brand/client onboarded or reconfigured |
| Brand memory | Graphify namespace | 1 per context | Continuously, during runs |
| Operational data | Brand's own DB (AWS/Supabase) | 1 per brand | Continuously, by the brand's app |
| Run history | YVON event log | 1 (shared, tagged) | Every run |

---

## 3. System Topology

### 3.1 Full system map

```
┌───────────────────────────────────────────────────────────────────────┐
│                            VYON GROUP INC.                            │
│                          (legal holding layer)                        │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                                YVON                                   │
│                     AI Operating System (core)                        │
│                                                                       │
│   ┌─────────────────┐  ┌──────────────┐  ┌─────────────────────┐      │
│   │ Agent Registry  │  │ Task Queue   │  │  Worker Pool        │      │
│   │ 19 depts        │  │ + leasing    │  │  N workers ×        │      │
│   │ 100+ definitions│  │ + priority   │  │  M async slots      │      │
│   └─────────────────┘  └──────────────┘  └─────────────────────┘      │
│                                                                       │
│   ┌─────────────────┐  ┌──────────────┐  ┌─────────────────────┐      │
│   │ Context Registry│  │ Event Log    │  │  Memory Writer      │      │
│   │ (YAML configs)  │  │ (append-only)│  │  (serialized/ns)    │      │
│   └─────────────────┘  └──────────────┘  └─────────────────────┘      │
│                                                                       │
│   ┌─────────────────────────────────────────────────────────┐         │
│   │  LiteLLM Gateway (:4000) — all model traffic            │         │
│   └─────────────────────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────────────────┘
          │                      │                      │
          │ MCP adapter          │ MCP adapter          │ MCP adapter
          ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│     NOVIZIO      │  │     HOURBOUR     │  │        AGENTX            │
│   AWS (RDS/S3)   │  │ Vercel+Supabase  │  │  Supabase (multi-tenant) │
│                  │  │                  │  │                          │
│  fashion brand   │  │  fintech app     │  │  SaaS platform           │
└──────────────────┘  └──────────────────┘  └──────────────────────────┘
                                                        │
                                       ┌────────────────┼────────────────┐
                                       ▼                ▼                ▼
                                  Client-001       Client-002    ...  Client-100
                                  (ctx only)       (ctx only)         (ctx only)
```

### 3.2 Why YVON is the center, not VYON Group

VYON Group is a legal wrapper (CBCA holding company). It has no runtime, no
data, no agents. Placing it at the center of the architecture would make the
diagram legally accurate and operationally useless.

YVON is where execution happens, so YVON is the architectural center. The
brands orbit it because they *consume* it.

### 3.3 Why clients hang off AgentX, not off YVON

Clients are **external tenants**. They must never be able to reach
YVON-internal capability, other clients' data, or your own brands' data.
Routing them through AgentX gives you one enforcement point for tenant
isolation rather than scattering that concern across the whole system.

Structurally: YVON trusts AgentX. AgentX trusts nothing.

---

## 4. The Four Layers

```
┌─────────────────────────────────────────────────────────┐
│  L4  INTERFACE      Dashboard · API · Chat · Webhooks   │
├─────────────────────────────────────────────────────────┤
│  L3  ORCHESTRATION  Queue · Workers · Routing · Leasing  │
├─────────────────────────────────────────────────────────┤
│  L2  CAPABILITY     Agents · Skills · Tools · Protocols  │
├─────────────────────────────────────────────────────────┤
│  L1  DATA           Adapters · Memory · Events · Metrics │
└─────────────────────────────────────────────────────────┘
```

### L1 — Data
Owns all access to state. Nothing above this layer talks to a database
directly. Contains the MCP adapters (one per brand), the Graphify memory
graph, the event log, and the metrics store.

**Why:** if agents can reach databases directly, tenant isolation becomes a
prompt-engineering problem. It must be a code problem.

### L2 — Capability
Agent definitions, skills taxonomy, tool grants, verification protocols.
Pure logic — no state, no I/O credentials, no knowledge of where it runs.

**Why:** statelessness is what makes one definition usable across 100
contexts.

### L3 — Orchestration
Decides *what runs, when, for whom, and with what limits*. Task queue,
leasing, priority lanes, concurrency caps, worker pool.

**Why:** this is the only layer that understands the whole system's load, so
fairness and rate limiting belong here and nowhere else.

### L4 — Interface
Dashboard, API, chat surfaces, inbound webhooks. Presentation and entry only —
no business logic.

**Why:** four dashboard scopes share one codebase because they are views over
the same L3/L1 data.

---

## 5. Data Architecture

### 5.1 The federation decision

**Rejected: central warehouse.** Sync everything from AWS, Supabase, and
AgentX into a YVON master database.

Why rejected:
- Three sync pipelines to build and maintain
- Three schema-drift surfaces
- Permanent staleness questions ("is this number current?")
- Pays full cost for data that never joins — Novizio's fabric inventory and
  Hourbour's transaction ledger have no shared query

**Adopted: federate by read-latency need.**

| Data class | Pattern | Lives in | Copied to YVON? |
|---|---|---|---|
| Operational reads | Live query via adapter | AWS / Supabase | No |
| Cross-brand metrics | Push on change | YVON metrics store | Yes (small) |
| Agent memory | Native | Graphify | N/A — YVON-owned |
| Events | Push (webhook) | YVON event log | Yes (append-only) |

Only metrics and events are copied. Both are small, both are additive, neither
requires schema agreement with the source.

### 5.2 Adapter pattern

```
        Agent code
             │
             │  novizio.get_inventory(sku="NV-1042")
             ▼
   ┌─────────────────────┐
   │   novizio-mcp       │   ← uniform interface
   ├─────────────────────┤
   │ translates to:      │
   │  AWS RDS query      │   ← implementation detail
   └─────────────────────┘
             │
             ▼
        AWS RDS / S3
```

Agents never learn that Novizio runs on AWS. They call a semantic method.

**Why this matters:** if Novizio migrates from AWS to Supabase next year, you
rewrite one adapter. Zero agent definitions change. Without this indirection,
that migration touches every agent that ever read Novizio data.

**One adapter per brand:**

- `novizio-mcp` → AWS (RDS, S3)
- `hourbour-mcp` → Supabase (thin — Postgres already speaks REST/RPC)
- `agentx-mcp` → Supabase multi-tenant, **requires `client_id` on construction**

### 5.3 Sync direction: push, never poll

```
Novizio (AWS)      ──webhook──┐
                              │
Hourbour (Supabase)──webhook──┼──▶  YVON /ingest  ──▶ event log
                              │                          │
AgentX (Supabase)  ──webhook──┘                          ├──▶ metrics store ──▶ dashboard
                                                         └──▶ task triggers
```

**Why push:**
- Polling three systems on a timer means constant load for mostly-nothing
- Polling introduces latency equal to the poll interval
- Push gives you a natural event log for free, which the dashboard needs anyway

**Implementation per platform:**
- **Supabase** — Database Webhooks or Realtime (near-free)
- **AWS** — EventBridge rule, or Lambda on table change → HTTP POST

### 5.4 Event log schema

```sql
CREATE TABLE events (
  id           bigserial PRIMARY KEY,
  ts           timestamptz NOT NULL DEFAULT now(),
  source       text NOT NULL,        -- 'novizio' | 'hourbour' | 'agentx' | 'yvon'
  context_id   text NOT NULL,        -- 'novizio' | 'agentx/bloom-cafe'
  kind         text NOT NULL,        -- 'run.started' | 'order.created' | ...
  actor        text,                 -- agent id, or 'system'
  payload      jsonb NOT NULL,
  correlation  uuid                  -- links related events across a workflow
);

CREATE INDEX ON events (context_id, ts DESC);
CREATE INDEX ON events (correlation);
```

Append-only. Never updated, never deleted. This is your audit trail, your
dashboard feed, and your debugging record.

---

## 6. Execution Model

### 6.1 Two paths, chosen by who is waiting

```
                    ┌──────────────────┐
   Request arrives  │  Is a human      │
   ────────────────▶│  waiting on      │
                    │  this right now? │
                    └────────┬─────────┘
                             │
             ┌───────────────┴───────────────┐
            YES                              NO
             │                                │
             ▼                                ▼
   ┌───────────────────┐          ┌────────────────────┐
   │  INLINE PATH      │          │  QUEUED PATH       │
   │  run immediately  │          │  enqueue + NOTIFY  │
   │  stream result    │          │  worker claims     │
   │  latency: ~0      │          │  latency: ~ms      │
   └───────────────────┘          └────────────────────┘
```

**Why split:** most "the queue is too slow" complaints are actually
"interactive work shouldn't be queued." Solving it by removing the queue
entirely loses fairness, retries, and durability. Solving it by bypassing the
queue for interactive work keeps both.

### 6.2 Queues are not serial

A common misconception worth stating plainly: **a queue with 20 workers runs 20
tasks at literally the same instant.** The queue is a shared buffer, not a
line. Concurrency comes from worker count × async slots, not from removing
the queue.

### 6.3 Worker anatomy

```
┌──────────────────────────────────────────────────────┐
│  WORKER PROCESS                                      │
│                                                      │
│  max_inflight = 15                                   │
│                                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ...             │
│  │run │ │run │ │run │ │idle│ │idle│                  │
│  │ctx:│ │ctx:│ │ctx:│ │    │ │    │                  │
│  │nov │ │bc  │ │hb  │ │    │ │    │                  │
│  └────┘ └────┘ └────┘ └────┘ └────┘                  │
│                                                      │
│  loop:                                               │
│    wait for NOTIFY or free slot                      │
│    claim task (atomic lease)                         │
│    load context + adapter + memory ns                │
│    load agent definition                             │
│    execute (async, I/O-bound)                        │
│    write results, emit events, release lease         │
└──────────────────────────────────────────────────────┘
```

**Why async slots rather than one-task-per-worker:** agent runs are
I/O-bound — most wall-clock time is spent waiting on LLM responses, not
burning CPU. A single process can hold 15–20 concurrent runs at negligible
cost. 20 workers × 15 slots = 300 genuinely simultaneous runs from modest
hardware.

### 6.4 Dispatch latency

Never poll. Use push wakeup:

- **Postgres** `LISTEN/NOTIFY` — worker wakes the instant a row lands
- **Redis** `BLPOP` — blocking pop, zero poll delay
- **Supabase Realtime** — already available in your stack

Reduces dispatch latency from seconds (poll interval) to milliseconds.

### 6.5 Fan-out within a task

When one logical task needs independent sub-work, run it concurrently inside
a single worker rather than enqueuing children and waiting:

```python
results = await asyncio.gather(
    run_agent("marketing", ctx, subtask_a),
    run_agent("finance",   ctx, subtask_b),
    run_agent("content",   ctx, subtask_c),
)
```

**Why:** avoids queue round-trips for work that is known-parallel at
dispatch time. Keeps the correlation id intact for tracing.

### 6.6 Load math — why 100 clients is not 100 concurrent runs

```
100 clients × ~8 agent runs/day        =  800 runs/day
800 runs × ~60s average                =  ~13.3 compute-hours/day
13.3 hours ÷ 24 hours                  =  ~0.55 average concurrency
```

Even with heavy peak clustering (say 20× average during business hours),
peak concurrency lands around 10–30. Well inside a single worker process.

**The real ceiling is provider rate limits, not architecture.** This is
precisely why all model traffic routes through the LiteLLM gateway — it is
the single place to enforce backoff, budgets, and failover.

---

## 7. Concurrency & Conflict Prevention

Conflicts are prevented in four layers, in order of importance. Layer 1 does
most of the work; the rest catch what leaks through.

### 7.1 Layer 1 — Single-writer ownership (most important)

For every resource type, **exactly one agent may write it.** Any number may
read it.

```
Resource                     Writer                Readers
──────────────────────────────────────────────────────────────────
novizio.inventory            inventory-agent       marketing, ops, finance
novizio.product_copy         content-agent         marketing, design
hourbour.user_segments       analytics-agent       marketing, growth
agentx.client_report         reporting-agent       all client-facing agents
graph.entities               memory-writer         all agents
```

**Why this dominates:** most conflicts are not race conditions — they are
design errors where two agents were both given authority over the same thing.
No locking scheme repairs bad ownership boundaries.

**Diagnostic rule:** if two agents genuinely need to write the same resource,
that is strong evidence they should be one agent, or that the resource should
be split.

### 7.2 Layer 2 — Task leasing

Prevents two workers executing the same task.

```sql
UPDATE tasks
SET    status     = 'claimed',
       worker_id  = $1,
       claimed_at = now(),
       expires_at = now() + interval '5 minutes'
WHERE  id = $2
  AND  status = 'pending'
RETURNING *;
```

Atomic. Empty result means another worker won the race — move on, no error.

**Lease expiry handles crashes.** A worker that dies mid-task leaves an
expired lease; a sweeper returns it to `pending`. Without expiry, a crash
would strand the task forever.

```
┌─────────┐  claim   ┌─────────┐  complete  ┌───────────┐
│ pending │─────────▶│ claimed │───────────▶│ completed │
└─────────┘          └─────────┘            └───────────┘
     ▲                    │
     │   lease expired    │
     └────────────────────┘
```

### 7.3 Layer 3 — Optimistic concurrency

For legitimate sequential writes to the same row by the same owner:

```sql
UPDATE products
SET    price = $1, version = version + 1
WHERE  id = $2 AND version = $3;
-- 0 rows affected → someone else wrote first → re-read and retry
```

Prevents lost updates. Cheap — no locks held.

### 7.4 Layer 4 — Per-context concurrency caps

Prevents one context starving the system.

```yaml
limits:
  max_concurrent_per_context: 3
  max_concurrent_per_tier:
    internal:   unlimited
    enterprise: 8
    pro:        3
    free:       1
```

A worker skips a task if that context is already at cap. This eliminates the
noisy-neighbour problem structurally rather than by monitoring and reacting.

### 7.5 Priority lanes

```
priority 0  ·  internal      (YVON, Novizio, Hourbour)
priority 1  ·  enterprise    (AgentX paying tier)
priority 2  ·  pro
priority 3  ·  free
```

**Why:** your own brands' work must never queue behind a client's bulk batch.
Workers drain lower priority numbers first, with a small anti-starvation
allowance so free tier still progresses.

### 7.6 Cross-brand writes: saga, not transaction

Do **not** attempt distributed transactions across AWS and Supabase.

```
Step 1: write to Hourbour        ──▶ success
Step 2: write to AgentX          ──▶ FAILS
Step 3: compensating action       ──▶ undo step 1
```

**Why:** two-phase commit across heterogeneous cloud platforms is enormous
complexity for a case that will occur rarely at your scale. Sagas are simpler,
observable in the event log, and adequate.

---

## 8. Memory Architecture

### 8.1 One graph per corpus, namespaced

```
Graphify
  ├─ yvon/                    ← internal ops knowledge
  ├─ novizio/                 ← brand memory
  ├─ hourbour/                ← brand memory
  ├─ agentx/
  │    ├─ _platform/          ← AgentX's own knowledge
  │    ├─ bloom-cafe/         ← client-isolated
  │    ├─ vale-dental/        ← client-isolated
  │    └─ ... ×100
```

**Why namespaces rather than separate graphs per agent:** agents within a
context need shared knowledge. Per-agent graphs fragment that and force
expensive cross-graph joins. Per-context namespaces give sharing where it
helps and isolation where it matters.

### 8.2 The write bottleneck — and why it exists

Concurrent graph writes are the one place true parallelism causes damage:

- Two agents create the same entity under slightly different names →
  duplicate nodes → poisoned retrieval for every downstream agent
- Lock contention on shared edges

**Mitigation: propose/apply split.**

```
Agent ──proposes──▶ mutation queue ──▶ memory-writer ──▶ Graphify
                                       (one per namespace)
                                       ├─ entity resolution
                                       ├─ canonical key lookup
                                       └─ serialized apply
```

Agents never write the graph directly. They emit proposed mutations. A
dedicated memory-writer per namespace applies them serially, running entity
resolution first (canonical key lookup before insert).

**Why accept the serialization:** parallel across namespaces preserves
throughput at the system level. Within one namespace, serial writes are
inexpensive and the correctness gain is large. A corrupted memory graph
degrades every agent that reads it — this is the highest-blast-radius
component in the system.

### 8.3 Obsidian's role

Obsidian remains the **human** view. Graphify is the machine view.

- Graphify: dense, flat, retrieval-optimized, never viewed directly
- Obsidian: MOC hub notes, Dataview tables, curated links, human-readable

Do not attempt to make one serve both purposes. The failure mode of merging
them is a graph that is neither queryable nor legible.

---

## 9. Multi-Tenancy & Isolation

### 9.1 The hard boundary

Client data isolation is the single most consequential guarantee in the
system. A cross-tenant leak is an existential event for a SaaS business.

**Enforcement principle: isolation is enforced *below* the agent, in code,
where a prompt cannot reach it.**

```
        Agent (untrusted — prompt-injectable)
                    │
                    │ calls tool
                    ▼
   ┌────────────────────────────────────┐
   │  agentx-mcp(client_id="bloom-cafe")│  ← scope bound at construction
   ├────────────────────────────────────┤
   │  every query gains:                │
   │    WHERE client_id = 'bloom-cafe'  │
   │  no method accepts a client_id arg │
   └────────────────────────────────────┘
                    │
                    ▼
             Supabase + RLS         ← second layer, defence in depth
```

**Why not trust the agent:** an agent's behaviour is shaped by text, and text
can be adversarial. If the agent is *capable* of requesting another tenant's
data, some prompt eventually will. Remove the capability rather than
instructing against its use.

**Two layers, deliberately redundant:**
1. Adapter scoping (application layer)
2. Postgres Row-Level Security (database layer)

Either alone is sufficient in theory. Both together survive one being wrong.

### 9.2 Context definition — client

```yaml
# contexts/agentx/bloom-cafe.yaml
context_id:       agentx/bloom-cafe
client_id:        bloom-cafe
tier:             pro
priority:         2

enabled_agents:
  - marketing
  - content
  - social

agent_versions:
  marketing:      v2.1        # pinned; others track channel
  content:        latest
  social:         latest

data_adapter:
  type:           agentx_mcp
  scope:          bloom-cafe   # bound at construction, immutable

memory_namespace: graphify/agentx/bloom-cafe

guardrails:
  - contexts/agentx/_shared/client-guardrails.yaml
  - contexts/agentx/bloom-cafe/brand-voice.yaml

limits:
  max_concurrent:     3
  monthly_token_cap:  2_000_000
```

Onboarding client #101 is writing this file. Nothing is deployed, cloned, or
provisioned.

### 9.3 Tiers as agent lists

```yaml
tiers:
  marketing_only: [marketing, content, social]
  finance_only:   [finance, reporting]
  full_agentic:   [marketing, content, social, finance,
                   reporting, ops, research, support]
```

A client's "team" is a list. Upgrading a client is editing that list.

---

## 10. Deployment Topology

```
┌───────────────────────────────────────────────────────────────┐
│  ALWAYS-ON RUNTIME    (Fly.io / ECS / dedicated box)          │
│                                                               │
│   worker-pool          memory-writers      scheduler          │
│   (async slots)        (per namespace)     (cron → tasks)     │
│                                                               │
│   ⚠ NOT Vercel — serverless timeouts kill long agent runs     │
└───────────────────────────────────────────────────────────────┘
              │                    │                   │
              ▼                    ▼                   ▼
┌──────────────────┐   ┌────────────────────┐  ┌───────────────┐
│  YVON Postgres   │   │     Graphify       │  │  LiteLLM      │
│  tasks · events  │   │  (namespaced)      │  │  :4000        │
│  metrics · ctx   │   │                    │  │  all models   │
└──────────────────┘   └────────────────────┘  └───────────────┘

┌───────────────────────────────────────────────────────────────┐
│  VERCEL         dashboard (4 scopes) · API · webhook ingest   │
│                 ⚠ web surface only — no agent execution       │
└───────────────────────────────────────────────────────────────┘
```

### 10.1 Why the runtime is not on Vercel

Vercel functions have execution time limits. Agent runs — particularly
multi-step ones with verification passes — routinely exceed them. Long-lived
worker processes with async slot pools also require persistent memory between
tasks, which serverless does not provide.

Vercel is correct for the dashboard, the API surface, and webhook ingest.
It is incorrect for the agent runtime.

### 10.2 Why all model traffic routes through LiteLLM

Single choke point for:
- Rate limit handling and backoff
- Per-context token budgets and cost attribution
- Provider failover (Anthropic → DeepSeek → OpenAI)
- Model routing by task class
- Unified observability on spend

Without it, rate limiting and cost control must be reimplemented in every
agent.

---

## 11. Repository Structure

```
yvon/
├── agents/                          # L2 — definitions, one copy each
│   ├── _shared/
│   │   ├── skills/                  # OS-level skills
│   │   ├── protocols/
│   │   │   ├── verification.md
│   │   │   ├── triple-pass.md
│   │   │   └── reflection.md
│   │   └── TOOLS.md                 # MCP tool registry
│   ├── marketing/
│   │   ├── agent.yaml
│   │   ├── prompt.md
│   │   └── skills/
│   ├── finance/
│   ├── engineering/
│   └── ... (19 departments)
│
├── contexts/                        # config only — no logic
│   ├── yvon.yaml
│   ├── novizio.yaml
│   ├── hourbour.yaml
│   └── agentx/
│       ├── _platform.yaml
│       ├── _shared/
│       │   └── client-guardrails.yaml
│       ├── bloom-cafe.yaml
│       ├── vale-dental.yaml
│       └── ... (one file per client)
│
├── adapters/                        # L1 — MCP servers
│   ├── novizio-mcp/                 # → AWS
│   ├── hourbour-mcp/                # → Supabase
│   └── agentx-mcp/                  # → Supabase, tenant-scoped
│
├── runtime/                         # L3
│   ├── worker.py                    # claim → load → execute → emit
│   ├── queue.py                     # leasing, priority, caps
│   ├── scheduler.py                 # cron → task rows
│   ├── memory_writer.py             # serialized graph apply
│   └── router.py                    # task → agent resolution
│
├── dashboard/                       # L4 — one app, four scopes
│   ├── app/
│   └── components/
│       ├── RadialMap.tsx
│       ├── EventStream.tsx
│       └── ContextSwitcher.tsx
│
├── db/
│   └── migrations/
│
└── docs/
    └── ARCHITECTURE.md              # this document
```

**Why one repo:** agent definitions, contexts, and runtime change together.
Splitting them creates version-skew between a definition and the runtime that
executes it.

---

## 12. Observability & The Dashboard

### 12.1 One application, four scopes

```
┌──────────────────────────────────────────────────┐
│  Scope selector:  [YVON] Novizio Hourbour AgentX │
└──────────────────────────────────────────────────┘
                        │
                        ▼
        Same components, filtered by context_id
        ┌─────────────────────────────────┐
        │  RadialMap    · scoped subtree  │
        │  EventStream  · WHERE context   │
        │  MetricStrip  · aggregated      │
        │  DetailPanel  · selected node   │
        └─────────────────────────────────┘
```

**Why not four dashboards:** four codebases drift. Features land in one and
not the others. Bugs get fixed three times. A scope parameter costs nothing
and guarantees parity.

AgentX scope adds one control: a client sub-selector, since it has a level
the others lack.

### 12.2 What drives the glow

The activity glow is fed by the **event stream**, not by polling agents.

```
run.started   ──▶ node enters active state, pulse begins
run.progress  ──▶ pulse continues, activity value refreshed
run.completed ──▶ pulse fades over ~10s decay
run.failed    ──▶ error ring, coral, persists until acknowledged
```

Activity decays rather than switching off, so the map shows *recent* work,
not only the current instant. A department with nothing active but recent
completions still reads warmer than a dormant one.

**Bubble-up:** a collapsed department inherits the max activity of its
children, so hotspots are visible without expanding all 19.

### 12.3 Execution links, not membership links

An important correction to the earlier visual model: agent nodes live in the
YVON ring. The line drawn from an agent to a brand is a **live execution
link** — it appears when that agent is running for that context and fades
after.

The same agent node can show links to Novizio and to three clients at once.
That is one definition in five concurrent executions, and the visualization
should say so.

---

## 13. Failure Modes & Mitigations

| # | Failure | Cause | Mitigation | Blast radius |
|---|---|---|---|---|
| 1 | Cross-tenant data leak | Agent given unscoped adapter | Scope bound at adapter construction + RLS | **Existential** |
| 2 | Memory graph corruption | Concurrent unresolved entity writes | Propose/apply queue, entity resolution | **Very high** — degrades all agents |
| 3 | Duplicate task execution | Two workers claim same task | Atomic conditional claim | Medium — wasted spend |
| 4 | Stranded task | Worker crashed mid-run | Lease expiry + sweeper | Low |
| 5 | Noisy neighbour starvation | One context floods queue | Per-context concurrency cap | Medium |
| 6 | Internal work starved | Client bulk job ahead in queue | Priority lanes, internal = 0 | Medium |
| 7 | Runaway spend | Agent loop, no budget | Per-context token cap at LiteLLM | High — financial |
| 8 | Provider rate limit cascade | All workers retry simultaneously | Backoff + jitter at gateway | Medium |
| 9 | Agent regression across all brands | Unreviewed definition change | Version pinning + staged rollout | High |
| 10 | Adapter schema drift | Brand DB changed, adapter didn't | Contract tests in CI per adapter | Medium |
| 11 | Lost update | Two sequential writes, same row | Optimistic version check | Low |
| 12 | Partial cross-brand write | Saga step 2 failed | Compensating action + event log | Medium |
| 13 | Timeout on long run | Runtime on serverless | Runtime on always-on host | High |
| 14 | Dashboard shows stale state | Polling instead of events | Event-driven feed | Low |

### 13.1 Staged rollout — mitigating #9

```
edit definition ──▶ verification protocol ──▶ merge
                                                │
                    ┌───────────────────────────┤
                    ▼                           │
              Novizio (ring 1)                  │  observe 24h
                    │                           │
                    ▼                           │
           Hourbour + YVON (ring 2)             │  observe 24h
                    │                           │
                    ▼                           │
         AgentX enterprise (ring 3)             │  observe 48h
                    │                           │
                    ▼                           ▼
              All clients (ring 4)
```

Brands function as deployment rings. Your own brands absorb regression risk
before clients ever see a change — which is the correct ordering of risk,
since you can forgive yourself and a client cannot.

---

## 14. Scaling Path

| Clients | Workers | Processes | Notes |
|---|---|---|---|
| 1–20 | 5–10 | 1 | Single box. Current state. |
| 20–100 | 20–40 | 2–3 | Add memory-writer separation |
| 100–500 | 60–120 | 4–8 | Shard workers by tier |
| 500+ | 150+ | sharded | Dedicated enterprise capacity, second queue |

**What scales with client count:** one YAML file, one memory namespace. Both
negligible.

**What scales with *load*:** worker count. Add processes.

**What does not scale by adding workers:** provider rate limits and graph
write throughput per namespace. These are the genuine ceilings, and both are
addressed at the gateway and the memory-writer respectively.

---

## 15. Build Sequence

Ordered by unblock value — each step makes the next one safe.

### Phase 1 — Foundations
1. **Task table + atomic leasing.** ~50 lines. Immediately makes parallel
   execution safe. Highest value-to-effort ratio in the entire system.
2. **Event log + ingest endpoint.** Unblocks the dashboard and gives you an
   audit trail from day one.
3. **Worker loop with async slots + LISTEN/NOTIFY.** Real concurrency, near-zero
   dispatch latency.

### Phase 2 — Federation
4. **First adapter — `hourbour-mcp`.** Supabase is thinnest; learn the pattern
   on the easy one.
5. **`novizio-mcp`.** AWS is more work; do it second with the pattern proven.
6. **Webhooks from both brands** → ingest → dashboard goes live.

### Phase 3 — Multi-tenancy
7. **`agentx-mcp` with construction-time scoping + RLS.** Do not onboard a
   second client until this is verified with a deliberate cross-tenant test
   that must fail.
8. **Context registry + tier definitions.**
9. **Per-context caps and priority lanes.**

### Phase 4 — Memory & scale
10. **Memory-writer with propose/apply and entity resolution.** Build this
    before entity duplication appears, not after — cleanup is far more
    expensive than prevention.
11. **Version pinning + staged rollout rings.**
12. **Budget caps and cost attribution at LiteLLM.**

---

## Appendix A — Vocabulary

| Term | Definition |
|---|---|
| **Agent** | A stateless definition: prompt + skills + tools + policies. One copy exists. |
| **Context** | Configuration + data scope for one brand or client. Data, not a process. |
| **Run** | One execution of an agent against a context for a task. |
| **Adapter** | MCP server translating semantic calls into a specific brand's storage. |
| **Namespace** | An isolated partition of the Graphify memory graph. |
| **Lease** | A time-bounded claim on a task preventing duplicate execution. |
| **Ring** | A deployment stage in staged rollout. |
| **Saga** | Multi-step cross-system write with compensating actions on failure. |

---

## Appendix B — The Principle, Restated

Every non-obvious decision in this document traces back to one line:

> **Agents are definitions, not deployments. Contexts are data, not processes.**

- No clones → no drift → updates are O(1)
- Contexts are files → onboarding is O(1) → 100 clients cost ~nothing idle
- Isolation lives below the agent → prompts cannot breach it
- Concurrency comes from workers → scaling is one dimension, not per-client
- One dashboard, scoped → no parity drift

When a future decision is unclear, check it against that line. If a proposal
requires copying an agent, or spinning up a process per context, it is
fighting the architecture.

---

*End of document.*
