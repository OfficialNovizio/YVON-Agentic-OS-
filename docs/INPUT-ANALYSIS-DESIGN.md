# Input Analysis Pipeline — Deep Design (Self-Improving)

**Status:** `[planned]` — the full design for the Input Analysis pipeline, including the self-improving structure. Built per the operator's direction (2026-08-07): rules-first + LLM refine for implicit detection, full 7-stage, wire the self_improver loop, and this doc covers structure/scripts/skills/tools, what's solid (skeleton), and how the AI model works + is coded.
**Owner:** Engineering (dev · raj · mia · dana) · **Companions:** handout F1/F2 · MASTER.md PART 0 §3 (CAOS) · YVON-CHAT §2/§5.

---

## 1 · The vision

Every message gets analyzed into **explicit intent + implicit requirements**, the analysis decides the pipeline depth, and the whole system **self-improves** — logging every analysis, learning from feedback, and improving its own keywords/patterns/prompts/rules over time (weekly, sandbox-tested, operator-approved). The same self-improving structure extends to **all pipelines** (CAOS, RAG, Context, Input Analysis) as graph nodes in graphify.

---

## 2 · The 7 stages (what happens, in order)

```
[1] PRE-CLASSIFY      — deterministic: tier (generic/info/build) + relation (venture/general)
[2] EXTRACT           — dynamic fields: type/subject/scope/format/expected (info) or what (build) — deterministic
[3] DEEP-ANALYZE      — LLM (build): why/how/endResult/desiredOutput + IMPLICIT requirements (F2)
[4] DECIDE PIPELINE   — analysis output → decides context/CAOS/RAG (venture+build) vs fast path (general/info)
[5] LOG               — every analysis recorded (store/input-analysis-log.jsonl)
[6] FEEDBACK          — operator thumbs in HUD / /feedback good|bad
[7] SELF-IMPROVE      — weekly self_improver: scan logs+feedback → propose → sandbox-test → operator approve → apply
```

---

## 3 · The solid skeleton (what's fixed — the structure the model works on)

The **stage skeleton is solid and deterministic** — it never changes shape; the *content* (keywords, patterns, rules, prompts) is what self-improves:

- **InputAnalysis** — the fixed shape every message produces:
  ```ts
  {
    tier: 'generic' | 'info' | 'build',      // solid
    relation: 'venture' | 'general',          // solid
    // info fields (dynamic): type, subject, scope, expected, format
    // build fields (dynamic): what, why, how, endResult, desiredOutput
    implicit: {                               // NEW (F2) — solid container
      preservation: string[],                 // e.g. "keep /settings/venture edit view"
      propagation: string[],                  // e.g. "new venture reaches selector+switcher+graph"
      connecting: string[],                   // implicit links
    },
    engine: 'deterministic' | 'llm' | 'hybrid',
    logged: boolean, feedback?: 'good' | 'bad',
  }
  ```
- **The 7 stages** — fixed order, fixed responsibilities.
- **The files** — solid, don't change shape:
  - `dashboard/lib/input-analysis.ts` — the analyzer (classify/extract/analyze/implicit)
  - `dashboard/lib/implicit-rules.ts` — the deterministic implicit-requirement rules (NEW)
  - `dashboard/app/api/chat/input-analysis/route.ts` — the API
  - `store/input-analysis-log.jsonl` — the log (NEW)
  - `rag/monitor/improver.py` — the improvement loop (exists)
  - `cli/skill-check.py` — the gate for any changed skill

**What's NOT solid (self-improves):** the keyword lists, the pattern regexes, the LLM prompts, and the implicit-requirement rules — these are *data* the self_improver can propose changes to.

---

## 4 · The AI model structure (how it works + how it's coded)

**Hybrid — deterministic for structure, LLM for depth:**

1. **Deterministic (instant, free):**
   - `classifyTier` — keyword/start-word → generic/info/build
   - `detectRelation` — venture-markers vs general-markers → venture/general
   - `parseInfo` — type/subject/scope/format/expected from patterns
   - `detectImplicit` (NEW, `implicit-rules.ts`) — deterministic rules:
     - `restructure|redesign|reorganize <X>` → preservation: "keep X's existing capabilities"
     - `add <X> reflects|shows|appears throughout` → propagation: "X reaches every surface listing X"
     - `remove|delete <X>` → preservation: "ensure nothing else references X"
     - `integrate|connect|link <X>` → connecting: "X connects to its dependents"
2. **LLM (`callFast`/deepseek) — for build + ambiguity + implicit refinement:**
   - The LLM fills `why/how/endResult/desiredOutput` (needs understanding).
   - The LLM refines implicit requirements (catches patterns the rules miss).
   - The prompt is strict JSON, with "not specified" for gaps, never invent.
3. **Coded as:** pure functions in `lib/input-analysis.ts` + `lib/implicit-rules.ts`, called by the route; the LLM via `callFast({system, messages, maxTokens})`.

**The AI model's "job" is fixed** (extract intent + implicit requirements into the solid `InputAnalysis` shape); **how it does it** (keywords/rules/prompts) is what self-improves.

---

## 5 · Scripts, skills, tools

- **Scripts:** `rag/monitor/improver.py` (the loop) · `rag/monitor/watcher.py` (signals) · `cli/skill-check.py` (gate for changed skills)
- **Skills:** `lib/input-analysis.ts` (the analyzer) · `lib/implicit-rules.ts` (NEW) · `lib/pipeline.ts` (stage kinds — `analyze`/`context`/etc.)
- **Tools:** `callFast` (LLM) · the `/api/chat/input-analysis` route · the events table (recording) · graphify (graph nodes, F1)

---

## 6 · The self-improving loop (F1, wired) — a TRAINED structure, not just keyword tweaks

The loop doesn't just propose keyword tweaks — it **learns** from accumulated feedback by training a real classifier:

```
analysis → LOG (store/input-analysis-log.jsonl: message, tier, relation, fields, implicit, engine, ts)
         → operator feedback (HUD thumbs / /feedback good|bad → store/feedback.jsonl)
         → TRAIN (the learning step, on a schedule):
             1. COLLECT — every (message, tier, relation) + its feedback becomes a labeled training example
             2. EMBED — vectorize the messages with the existing all-MiniLM-L6-v2 embedder (384-dim)
             3. TRAIN — fit the classifier (tier + relation) on the labeled embeddings
             4. VALIDATE — test the trained classifier on held-out examples; it must BEAT the
                           deterministic keyword baseline (accuracy) or it's rejected
             5. DEPLOY — only a validated-better classifier replaces the keyword classifier
             (the deterministic keyword classifier stays as the SAFE baseline until the trained
              model proves better — never regress)
         → weekly self_improver.py also proposes: keyword/pattern fixes, prompt tweaks,
             implicit-rule additions (sandbox-test + operator approve)
         → better analysis next time
```

**The trained classifier uses what already exists:** `rag/core/embed.py` (all-MiniLM-L6-v2 dense embeddings) + `src/cie/classifier.ts` (the classifier) + `store/feedback.jsonl` (labeled training data). So it's a **real learning loop** — the more you use it and give feedback, the better classification becomes, beyond what keywords can express.

**Extends to all pipelines:** each stage (CAOS, RAG, Context, Input Analysis) becomes a **graph node in graphify** so the system visualizes + learns from its own execution — the same trained loop per node.

---

## 6b · Agent routing — which agent handles the message (before the pipeline)

The input analysis decides the **target agent** (stage 2–3, before the pipeline), so the pipeline runs for *that* agent's context/CAOS/RAG:

```
message → input analysis [tier, relation, targetAgent] → decide pipeline (that agent's context/CAOS/RAG) → execute
```

- **`targetAgent`** — the agent who should handle the task (dev, mia, raj, echo, …).
- **How it's chosen:** deterministic routing keywords first (frontend/UI → mia, API/backend → raj, data → dana, security → aegis, brand/copy → lena/spark, …), then LLM-refined for ambiguity.
- **Scoped by brand:** the same agent is chosen, but with that brand's memory injected (agents are roles, venture is context).
- **Falls back** to the orchestrator (meta) when no clear match — never unassigned.
- **Logs + improves:** the chosen agent is logged with the analysis, and training learns the routing (which messages → which agents), improving it over time.

This closes the gap: today the agent is decided late/by-fallback; with this, the input analysis routes to the right agent *before* the pipeline runs.

## 7 · Context Injection in the unified structure (per-brand, Supabase)

The unified Supabase store (per-brand, `context_id`-scoped) also powers **context injection** — the same store feeds analysis, graphs, queries, AND injection:

- **Venture memory** — already in the DB (`ventures` table); read per-brand via `context_id` (a venture's memory is its own row). ✓ already unified.
- **Agent skills** — currently read from the **local `Teams/` filesystem**. In the unified structure, they move into Supabase as `agent_skills` (scoped by brand/department/agent), so skills are:
  - shared across environments (not tied to the local repo),
  - injectable per-brand (a brand's agents get their skills from Supabase),
  - part of the same store the graph + training read.
- **Context resolution flow (unified):** `context_id` (active venture) → resolve that brand's memory + agent skills from Supabase → inject into the turn. Per-brand, one store.

So the unified architecture covers **everything** — analysis logs, graphs, queries, context injection — all in Supabase, scoped by `context_id`.

## 6c · The verification + improvement loop (full agent fleet — the pure logic)

The complete loop that catches silent failures (e.g. a button delivered without the API it calls):

```
message → input analysis [tier, relation, targetAgents, MUST-HAVE CHECKLIST]
  → pre-load each agent's skills/tools (strict)
  → agents build (dev + builder + tester)
  → [agent-level verify] the agent verifies its OWN work first (tests, runtime probe)
  → quinn's gate (INDEPENDENT): browser check + tests + runtime probe
      → FAIL → "agent didn't check/verify at its own level first" → saved to brand memory/graph/DB → back to dev to fix → retry
  → quinn PASS → CYBER TEAM (attacker) attacks the feature, finds flaws
      → flaws → back to quinn to check → back to dev to fix → keep improving (loop)
  → quinn + cyber both PASS → delivered
  → ALL results collected all day → evening: decide with the owner (what to train)
```

**The pure logic:**
1. **The must-have checklist** (from the input's desired output) defines "done" — the deliverable must satisfy each item (e.g. button → renders + click-action wired + calls API + API exists).
2. **Agent verifies its own level first** — quinn's independent FAIL means the agent claimed "verified" without verifying.
3. **Quinn is the independent gate** — browser + tests + runtime probe; "browsers tell the truth."
4. **Cyber team attacks after quinn passes** — finds flaws in the verified feature; flaws loop quinn→dev→fix until clean.
5. **All-day collection** — every pass/fail, flaw, fix, agent misstep is logged.
6. **Evening decision with the owner** — a daily review of what failed/improved → what to train (the self-improvement).

**Failure saved per-brand:** any failure is saved to that BRAND's memory/graph/DB section, training that agent's skills/tools + the brand's patterns.

## 7b · Build status (what's built vs planned)

**BUILT (verified tsc/deploy/CAOS green, 2026-08-07):**
- **Must-have checklist generator** — `deriveMustHaves()` in `lib/input-analysis.ts`: turns the desired output into testable "done" items (catches silent failures like the button-without-API).
- **Agent routing** — `routeAgents()`: selects the primary agent by name + the team (skills/tools-first + team patterns, falls back to `meta`); wired into `analyzeMessage` + emitted in the `input.analysis` event.
- **The 7-stage skeleton** — pre-classify / extract / deep-analyze / decide / log / feedback / self-improve (stage 1–4 live).

**PLANNED (in order):**
1. `lib/implicit-rules.ts` — deterministic implicit-requirement detection (F2) + LLM refine
2. `store/input-analysis-log.jsonl` + Supabase `input.analysis` event (per-brand `context_id`) — the log
3. The **verification check** — quinn's independent gate (browser/tests/runtime probe) checks each must-have; FAIL → saved to brand memory/graph/DB → back to dev
4. **Cyber team loop** — post-quinn attack finds flaws → quinn → dev → fix
5. **Pipeline-health record** (`pipeline.run` event) — stage outcomes + failures, per-brand
6. Feedback hook (HUD thumbs / `/feedback`)
7. `rag/monitor/improver.py` — consume logs + feedback; **the training loop** (collect → embed → train → validate → deploy, uses `embed.py` + `classifier.ts`)
8. Graph nodes (F1) — with the visuals work

**Files (the solid skeleton):** `lib/input-analysis.ts` (analyzer + routing + must-haves) · `lib/implicit-rules.ts` (planned) · `app/api/chat/input-analysis/route.ts` · `app/api/chat/stream/route.ts` (emits) · `rag/monitor/improver.py` · `rag/embed.py` + `src/cie/classifier.ts` (training).

---

## 8 · Invariants

- **The skeleton is solid; only the data self-improves** (never change the stage shape silently).
- **Missing → "not specified"** — never invent.
- **Implicit requirements are surfaced** — preservation/propagation/connecting, so nothing linked gets missed (F2).
- **Self-improve is gated** — sandbox-test + operator approval, never self-deploys a bad change.
- **Every message records** — logging is universal, even on the fast path.
