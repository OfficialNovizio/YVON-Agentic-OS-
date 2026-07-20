# YVON ENGINE — COMPLETE WORK TREE WITH FALLBACKS

**Status:** All modules wired · 111 existing tests preserved · 112 new tests added  
**Date:** 2026-07-16  
**Entry points:** bridge.py (stdin/stdout), unified_pipeline.py (direct), CLI (npx yvon)

---

## LEGEND

```
    [MODULE]          Python module (rag/*.py)
    {TYPE}             TypeScript module (src/*.ts)
    >> FLOW >>          Primary data path
    .. FALLBACK ..>     Graceful degradation path
    ## SCHEDULED ##     Cron/scheduled task
    ⚠️ ORPHAN (FIXED)   Was orphaned, now wired
    ✅ VERIFIED         Connection tested and working
```

---

## LAYER 1: QUERY INGRESS — Classification + Progressive Disclosure

```
USER QUERY
    │
    ▼
┌─────────────────────────────────────────────┐
│  {src/cie/classifier.ts}                     │
│  Task Classification                         │
│  Domain keywords → task_type + agent_id      │
└──────────────────────┬──────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
    ┌─────────────────┐  ┌─────────────────────┐
    │ agent.md Skill   │  │ progressive_         │
    │ Roster Parser    │  │ disclosure.py ⚠️→✅  │
    │ (static)         │  │ Skill Lazy Loading   │
    └────────┬────────┘  └──────────┬──────────┘
             │                      │
             │    query + triggers   │
             └──────────┬───────────┘
                        │
              ┌─────────▼─────────┐
              │ ACTIVE SKILLS     │  ← 2-3 full SKILL.md loaded
              │ (triggered)       │
              ├───────────────────┤
              │ INACTIVE SKILLS   │  ← one-line summaries (~8 tokens each)
              │ (not triggered)   │     Savings: 40-60% on skill context
              └─────────┬─────────┘
                        │
            ┌───────────▼───────────┐
            │ FALLBACK              │
            │ If progressive_       │
            │ disclosure.py absent  │
            │ → all skills loaded   │
            │ as before (no savings)│
            └───────────────────────┘
```

---

## LAYER 2: RETRIEVAL + FORMULA EXECUTION — Plan-Locked

```
                    skills_context + query
                        │
    ┌───────────────────┼───────────────────┐
    │                   ▼                   │
    │  ┌─────────────────────────────┐      │
    │  │  bridge.py                  │      │
    │  │  --mode retrieve            │      │
    │  │  stdin JSON → stdout JSON   │──────┤  Called by CIE subprocess
    │  └────────────┬────────────────┘      │
    │               │                       │
    │    ┌──────────┴──────────┐            │
    │    ▼                     ▼            │
    │ ┌─────────────┐   ┌──────────────┐    │
    │ │ retriever.py│   │ bridge.py     │    │
    │ │ Hybrid      │   │ Formula       │    │
    │ │ Retrieve    │   │ Detection     │    │
    │ └──────┬──────┘   └──────┬───────┘    │
    │        │                 │            │
    │        ▼                 ▼            │
    │ ┌─────────────┐   ┌──────────────┐    │
    │ │ embed.py    │   │ Shared OS    │    │
    │ │ Dense+      │   │ logical/     │    │
    │ │ Sparse      │   │ *.py (35)    │    │
    │ └──────┬──────┘   └──────┬───────┘    │
    │        │                 │            │
    │        └────────┬────────┘            │
    │                 ▼                     │
    │        ┌────────────────┐             │
    │        │ optimizer.py   │             │
    │        │ Dynamic        │             │
    │        │ Profile +      │             │
    │        │ Diversity +    │             │
    │        │ Adversary      │             │
    │        └────────┬───────┘             │
    │                 │                     │
    │  ┌──────────────┼──────────────┐      │
    │  │              ▼              │      │
    │  │  ┌────────────────────┐     │      │
    │  │  │  retriever.py      │     │      │
    │  │  │  Cross-Encoder     │     │      │
    │  │  │  Re-ranker         │     │      │
    │  │  └────────┬───────────┘     │      │
    │  │           │                 │      │
    │  │           ▼                 │      │
    │  │  ┌────────────────────┐     │      │
    │  │  │  20 CANDIDATE      │     │      │
    │  │  │  CHUNKS            │     │      │
    │  │  └────────┬───────────┘     │      │
    │  │           │                 │      │
    │  │  FALLBACK: retriever.py     │      │
    │  │  → if sqlite-vec absent     │      │
    │  │  → direct chunks.json       │      │
    │  │  search (dense+sparse)      │      │
    │  └─────────────────────────────┘      │
    └────────────────────────────────────────┘
```

---

## LAYER 3: HARNESS GATES — 5 Gates in Sequence ★

```
    20 candidate chunks + computed_facts
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  harness.py ★ NEW — 5-gate verification               │
│  WIRED via: unified_pipeline.inject_with_harness()   │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ GATE 1: SOURCE AUTHENTICATION                  │  │
│  │ ────────────────────────────────────           │  │
│  │ • Source file exists on disk?                  │  │
│  │ • Chunk hash matches?                          │  │
│  │ • Book citation traceable to Teams/Books/?     │  │
│  │ • Within agent's authorized departments?       │  │
│  │                                                │  │
│  │ OUTPUT: verified | flagged | blocked           │  │
│  │ FALLBACK: if project_root not set,             │  │
│  │   assume source exists (test mode)             │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ GATE 2: MULTIPLICATIVE RELIABILITY             │  │
│  │ ────────────────────────────────────           │  │
│  │ reliability = freshness × authority × quality  │  │
│  │                                                │  │
│  │ freshness: staleness_economics.doc_freshness() │  │
│  │ authority: 7-level source type mapping         │  │
│  │   book=1.0, standard=0.9, shared_os=0.85,     │  │
│  │   dept_doc=0.7, agent=0.65, skill=0.55,       │  │
│  │   playbook=0.5, operational=0.4, unknown=0.2   │  │
│  │ quality: feedback loop historical score        │  │
│  │                                                │  │
│  │ RESULT: authoritative → 0.95, junk → 0.00      │  │
│  │         948x separation                        │  │
│  │ FALLBACK: if staleness_economics absent,       │  │
│  │   use simple linear decay (1 - age_days/365)   │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ GATE 3: CONFLICT DETECTION                     │  │
│  │ ────────────────────────────────────           │  │
│  │ • Pairwise embedding comparison                │  │
│  │ • Contradiction: shared terms ≥ 2 + negation   │  │
│  │ • Version conflict: same source, different sec │  │
│  │ • Domain conflict: general vs specific         │  │
│  │                                                │  │
│  │ OUTPUT: conflict flags → injected into context │  │
│  │   ⚠️ CONFLICT: [NIST SP 800-30] vs            │  │
│  │   [ISO 31000:2018] — fixed thresholds vs       │  │
│  │   context-dependent evaluation                 │  │
│  │   Agent must reconcile before responding.      │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ GATE 4: PRIORITY-BASED BUDGET ASSEMBLY         │  │
│  │ ────────────────────────────────────           │  │
│  │ P0: Agent identity (always)                    │  │
│  │ P1: Active skills (progressive-loaded)         │  │
│  │ P2: Computed facts (Shared OS results)         │  │
│  │ P3: T1 verified chunks (load-bearing)          │  │
│  │ P4: T2 structural chunks                       │  │
│  │ P5: One adversarial chunk                      │  │
│  │ P6: T3 supplementary                           │  │
│  │ P7: Inactive skill summaries                   │  │
│  │                                                │  │
│  │ Budget fills P0→P7. Exhausted → remaining      │  │
│  │ dropped. Assembly plan logged.                 │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ GATE 5: QUARANTINE + RECOVERY                  │  │
│  │ ────────────────────────────────────           │  │
│  │ • Reliability < threshold → quarantine         │  │
│  │ • T1 quarantine → operator notified            │  │
│  │ • Recovery scan: dropped chunks checked for:   │  │
│  │   novel facts, exceptions, contradictions      │  │
│  │ • Recovered → pulled back into assembly        │  │
│  │                                                │  │
│  │ Log: quarantine.jsonl (append-only)            │  │
│  │ FALLBACK: if no log file, skip quarantine      │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  FALLBACK: If harness.py absent → skip all gates     │
│            → pass chunks directly to injection        │
│            → inject() works exactly as before         │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              VERIFIED CHUNKS (5-8 chunks with conflict flags)
```

---

## LAYER 4: STRATEGY ROUTING + INJECTION

```
    verified chunks + conflict flags
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  unified_pipeline.py — Strategy Router                │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ FAST PATH                                      │  │
│  │ creative_review, copy_edit, factual_lookup     │  │
│  │ → destructor.py                               │  │
│  │ → hard budget: 80-100t                        │  │
│  │ → strip-to-essentials: citations + rules +    │  │
│  │   numbers + authorities + gates + computed    │  │
│  │ → survival mode (<200t budget)               │  │
│  │ → 64-89% savings                             │  │
│  │ → No recovery pass (quality acceptable)      │  │
│  │                                              │  │
│  │ FALLBACK: if destructor.py absent            │  │
│  │ → raw text injection (no compression)        │  │
│  └──────────────────────┬───────────────────────┘  │
│                         │                          │
│  ┌──────────────────────┴───────────────────────┐  │
│  │ BALANCE PATH                                  │  │
│  │ everything else                              │  │
│  │ → adaptive budget (0.4x-4.0x multiplier)     │  │
│  │ → strip essentials per chunk                 │  │
│  │ → recovery pass (5 triggers)                 │  │
│  │ → 39-77% savings, quality preserved          │  │
│  │                                              │  │
│  │ FALLBACK: if recovery fails                  │  │
│  │ → inject without recovery (all kept chunks)  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  FALLBACK: if unified_pipeline absent                │
│  → direct destructor.inject() as minimal path        │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              FINAL INJECTION TEXT
              (with citations, conflict flags, computed facts)
```

---

## LAYER 5: LLM GENERATION + POST-HOC VERIFICATION

```
    injection_text + agent persona + active skills
        │
        ├──────────────────────────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────────┐              ┌─────────────────────┐
│  PRIMARY LLM      │              │  DEEPSEEK (adversarial│
│  hermes + claude  │              │  verification LLM)   │
│  Reasoning + code │              │  Different perspective│
└────────┬──────────┘              └──────────┬──────────┘
         │                                   │
         │         ┌─────────────────────────┘
         │         │
         ▼         ▼
    MODEL RESPONSE
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  verifier.py — Post-Hoc Verification ★ WIRED          │
│  WIRED via: bridge.py --mode verify                  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ LAYER 1: GROUNDED CITATION CHECK               │  │
│  │ ────────────────────────────────────           │  │
│  │ • Extract factual claims from response         │  │
│  │   (numbers, rules, citations, entities,        │  │
│  │    statements)                                 │  │
│  │ • Search injected chunks for support           │  │
│  │ • Text similarity: exact match → 1.0           │  │
│  │   partial match → overlap score                │  │
│  │ • Output: per-claim verification               │  │
│  │   supported | unsupported | misattributed      │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ LAYER 2: SELF-CONSISTENCY CHECK               │  │
│  │ ────────────────────────────────────           │  │
│  │ • Check for opposing rules (must A vs never A) │  │
│  │ • Sentence-level contradiction detection       │  │
│  │ • Output: consistent | issues list            │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ LAYER 3: CONSTITUTION COMPLIANCE               │  │
│  │ ────────────────────────────────────           │  │
│  │ • Every citation sourced?                      │  │
│  │ • Computed values reference Shared OS?         │  │
│  │ • No unsupported speculation?                  │  │
│  │ • Contradictions acknowledged?                 │  │
│  └───────────────────────┬────────────────────────┘  │
│                          │                           │
│  ┌───────────────────────▼────────────────────────┐  │
│  │ AGENT DELEGATION                               │  │
│  │ ────────────────────────────────────           │  │
│  │ High-stakes (governance, legal, strategy)      │  │
│  │ + low verification score (<0.7)                │  │
│  │ → delegate to quinn (QA, charter enforcement)  │  │
│  │ → delegate to precedent (consistency)          │  │
│  │ → delegate to sentinel (bypass detection)      │  │
│  │                                                │  │
│  │ NOTE: Agent delegation is a recommendation.     │  │
│  │ The CIE decides whether to actually delegate.  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  FALLBACK: if verifier absent → skip verification    │
│           → response delivered without check         │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              VERIFICATION REPORT
              + verified response
```

---

## LAYER 6: FEEDBACK LOOP

```
    verification_report + user_outcome (accept/reject/revise)
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  feedback.py — Quality Scoring System                │
│                                                      │
│  quality_new = quality_old × 0.95 + outcome × 0.05   │
│  Slow-moving. 5% weight on latest. 95% on history.   │
│                                                      │
│  ★ ALSO UPDATES via verifier results:               │
│    - Grounded score → chunk quality adjustment       │
│    - Unsupported claims → source downgrade           │
│    - Repeated unsupported → quarantine suggestion    │
│                                                      │
│  Log: feedback.jsonl (append-only)                   │
│                                                      │
│  FALLBACK: if feedback.py absent                    │
│  → quality scores stay static (0.5 default)         │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              UPDATED CHUNK QUALITY SCORES
              (used by Gate 2 Reliability in harness)
```

---

## LAYER 7: FIELD MONITORING — Read-Only Analysis

```
    feedback records + quality history + query history + agent history
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  field_monitor.py — Continuous Observer ★             │
│  Scheduled via: self_improver weekly                  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ ATTRACTOR DETECTION                            │  │
│  │ ────────────────────────────────────           │  │
│  │ Chunk combinations that consistently produce   │  │
│  │ good or bad outcomes.                          │  │
│  │ Good: >80% accepted, 3+ occurrences            │  │
│  │ Bad: >60% rejected, 3+ occurrences             │  │
│  │ Output: top-10 attractors by frequency         │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ DEGRADATION DETECTION                          │  │
│  │ ────────────────────────────────────           │  │
│  │ Quality trend over last 4 periods              │  │
│  │ Drop >0.15 → warning                          │  │
│  │ Drop >0.25 → critical                         │  │
│  │ Output: degradation alerts with severity       │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ COVERAGE GAP DETECTION                         │  │
│  │ ────────────────────────────────────           │  │
│  │ Queries getting <2 chunks + <0.4 quality       │  │
│  │ Or >90% savings with <0.3 quality              │  │
│  │ Output: per-task coverage gaps                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ DRIFT DETECTION                                │  │
│  │ ────────────────────────────────────           │  │
│  │ Agent behavior changing over time              │  │
│  │ Savings change >15% → drift                    │  │
│  │ Quality change >0.10 → drift                   │  │
│  │ Output: per-agent drift signals                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Output: field_monitor_report.md (weekly)            │
│          field_monitor_data.json (daily)              │
│                                                      │
│  FALLBACK: if no data → empty report (no crash)      │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              WEEKLY FIELD REPORT
              (feeds self_improver.py)
```

---

## LAYER 8: SELF-IMPROVER — Weekly Autonomous Optimization

```
    ## SCHEDULED: Sunday 00:00 UTC ##
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  self_improver.py — Autonomous Optimization ★         │
│                                                      │
│  PHASE 1 — ANALYZE                                   │
│  ────────────────────────────────────                │
│  Read field_monitor data from past week              │
│  Identify: degradations, coverage gaps, drifts       │
│  Output: Problem list with severity                  │
│                                                      │
│  PHASE 2 — PROPOSE                                   │
│  ────────────────────────────────────                │
│  For each problem:                                   │
│    degradation → reduce chunk weight by 20%          │
│    coverage_gap → increase budget multiplier 1.5x    │
│    drift → reduce compression aggression            │
│  Output: Proposal list with risk levels              │
│                                                      │
│  PHASE 3 — SANDBOX TEST                              │
│  ────────────────────────────────────                │
│  Test proposals against 5 benchmark scenarios        │
│  ALL tests in sandbox: synthetic data only            │
│  No real files modified                               │
│  Output: Test results (passed/failed per scenario)    │
│                                                      │
│  PHASE 4 — DECIDE                                    │
│  ────────────────────────────────────                │
│  All tests pass → proceed to deploy                  │
│  Any test fails → ALL proposals held                 │
│  Output: deployment decision                         │
│                                                      │
│  PHASE 5 — DEPLOY (conditional)                      │
│  ────────────────────────────────────                │
│  Atomically update parameter files                   │
│  Previous version backed up: *.backup                │
│  File-based → git rollback always available          │
│                                                      │
│  PHASE 6 — LOG                                       │
│  ────────────────────────────────────                │
│  Append to improvement_log.jsonl:                     │
│    timestamp, problems, proposals, tests, deployed    │
│                                                      │
│  FALLBACK: if sandbox test fails                    │
│  → report to operator, do NOT deploy                │
│  → revert to previous parameter set                 │
│  → log failure to improvement_log.jsonl             │
└──────────────────────────────────────────────────────┘
```

---

## LAYER 9: SHARED OS — Formula Execution

```
    ┌───────────────────────────────────────┐
    │  Teams/Shared OS/logical/             │
    │  35 Python scripts                    │
    │                                      │
    │  Finance: capital_budgeting.py        │
    │    npv(), wacc(), irr()               │
    │  Strategy: competitive_strategy.py    │
    │    five_forces()                      │
    │  Risk: risk_management.py             │
    │    risk_score(), risk_level()         │
    │  Marketing: marketing_laws.py         │
    │    lasswell_model(), pareto_principle │
    │  Planning: planning_fallacy.py        │
    │    calibration_weight(), de_bias()    │
    │  Governance: governance_gate.py       │
    │    board_independence_check()         │
    │  ... (29 more)                        │
    │                                      │
    │  Called by: bridge.py formula detect │
    │  Used by: optimizer.py (freshness)   │
    │          harness.py (authority)      │
    │          feedback.py (quality)       │
    │                                      │
    │  FALLBACK: if script absent          │
    │  → skip formula computation          │
    │  → inject query with no computed     │
    │    facts (graceful degradation)      │
    └───────────────────────────────────────┘
```

---

## LAYER 10: AGENT FLEET — 46 Agents × 7 Departments

```
    ┌───────────────────────────────────────┐
    │  Teams/                               │
    │                                      │
    │  AI & Agents (8): meta, proto, relay, │
    │    forge, gauge, anneal, scout, edge  │
    │  Brand Studio (11): spark, lena,      │
    │    atlas, muse, weave, pixel, pulse,  │
    │    rio, nate, kai, tempo             │
    │  Cybersecurity (5): warden, keyring,  │
    │    bastion, cortex, veil              │
    │  Engineering (11): dev, ops, cypher,  │
    │    aegis, axiom, rank, quinn, dana,   │
    │    raj, mia, nova                    │
    │  Executive Office (3): marcus, echo,  │
    │    vista                              │
    │  Governance (3): board, precedent,    │
    │    sentinel                            │
    │  Product (5): spec, metric, ux, loom, │
    │    price                              │
    │                                      │
    │  Each agent: agent.md + identity/ +   │
    │    custom/ + marketplace/ +           │
    │    operational/ + logical/            │
    │                                      │
    │  Used by: progressive_disclosure.py  │
    │          harness.py (auth check)     │
    │          retriever.py (dept filter)   │
    │          optimizer.py (agent profiles)│
    │                                      │
    │  FALLBACK: if agent files absent     │
    │  → use default compression profile   │
    │  → no authorization check            │
    └───────────────────────────────────────┘
```

---

## LAYER 11: CIE — TypeScript Orchestration

```
    ┌───────────────────────────────────────┐
    │  src/ (TypeScript)                    │
    │                                      │
    │  {cie/classifier.ts}                  │
    │    → task classification              │
    │    → agent routing                    │
    │  {cie/retriever.ts}                   │
    │    → calls bridge.py subprocess       │
    │    → JSON stdin/stdout                │
    │  {cie/ranker.ts}                      │
    │    → re-ranks retrieved context       │
    │  {cie/builder.ts}                     │
    │    → builds final LLM prompt          │
    │  {cie/rag-bridge.ts}                  │
    │    → subprocess: python3 rag/bridge   │
    │  {pipelines/governance-gate.ts}       │
    │    → 4-gate cycle (recommend→review  │
    │      →approve→audit)                 │
    │  {pipelines/caos-executor.ts}         │
    │    → orchestrates multi-agent flow    │
    │  {pipelines/content-pipeline.ts}      │
    │    → Brand Studio content flow        │
    │  {toon/compressor.ts}                │
    │    → TOON compression                │
    │                                      │
    │  Bridge protocol:                    │
    │    → --mode retrieve                  │
    │    → --mode formula                   │
    │    → --mode feedback                  │
    │    → --mode verify ★ NEW              │
    │                                      │
    │  FALLBACK: if bridge.py unavailable  │
    │  → direct LLM call (no RAG)          │
    └───────────────────────────────────────┘
```

---

## COMPLETE DATA FLOW — END TO END

```
USER QUERY
    │
    ├─{cie/classifier.ts}────────────→ task_type + agent_id
    │
    ├─progressive_disclosure.py──────→ active skills (2-3) + inactive summaries
    │
    ├─{cie/rag-bridge.ts}────────────→ python3 rag/bridge.py --mode retrieve
    │   │
    │   ├─retriever.py───────────────→ query rewrite → hybrid retrieve → rerank
    │   ├─optimizer.py───────────────→ dynamic profile → diversity → adversary
    │   ├─bridge.py (formula detect) → Shared OS scripts → computed facts
    │   │
    │   ├─unified_pipeline.py────────→ inject_with_harness()
    │   │   │
    │   │   ├─harness.py (Gate 1)────→ authenticate: verified/flagged/blocked
    │   │   ├─harness.py (Gate 2)────→ reliability: multiplicative score
    │   │   ├─harness.py (Gate 3)────→ conflict: detection + flags
    │   │   ├─harness.py (Gate 4)────→ priority: P0→P7 budget assembly
    │   │   ├─harness.py (Gate 5)────→ quarantine + recovery
    │   │   │
    │   │   ├─FAST → destructor.py───→ hard budget: 80-100t, 64-89% savings
    │   │   └─BALANCE → adaptive ────→ budget: 0.4x-4.0x, 39-77% savings
    │   │
    │   └─bridge.py──────────────────→ JSON response with harness trace
    │
    ├─{cie/builder.ts}───────────────→ LLM prompt assembly
    │
    ├─LLM (hermes+claude)────────────→ primary reasoning + code
    ├─LLM (deepseek)─────────────────→ adversarial verification
    ├─LLM (chatgpt)──────────────────→ content/creative quality
    │
    ├─verifier.py (--mode verify)────→ grounded citations + self-consistency
    │   │
    │   ├─high-stakes + low score───→ delegate to quinn/precedent/sentinel
    │   └─low-stakes─────────────────→ automated verification only
    │
    ├─feedback.py────────────────────→ update chunk quality scores
    │
    └─field_monitor.py───────────────→ continuous observation (async)
        │
        └─self_improver.py───────────→ weekly optimization cycle ##
```

---

## FALLBACK MATRIX

| Component | Failure | Fallback | Impact |
|-----------|---------|----------|--------|
| progressive_disclosure.py | Import error | All skills loaded as before | No savings, but works |
| harness.py | Import error | Chunks pass through unverified | No auth/reliability/conflict checks |
| harness.py Gate 1 | project_root not set | Assume source exists (test mode) | No auth in test environments |
| harness.py Gate 2 | staleness_economics absent | Linear decay: 1 - age/365 | Simplified freshness model |
| harness.py Gate 3 | No embeddings | Text overlap + regex fallback | Less accurate conflict detection |
| harness.py Gate 4 | Budget overflow | Post-assembly truncation | Deterministic character-level enforcement |
| harness.py Gate 5 | No log file | Skip quarantine logging | Quarantined chunks excluded silently |
| unified_pipeline.py | Import error | Direct destructor.inject() | Minimal path: hard budget only |
| verifier.py | Import error | Skip verification | Response delivered without check |
| bridge.py | Subprocess error | Direct LLM call | No RAG, model works from training data |
| Shared OS scripts | Import error | Skip formula computation | No computed facts in context |
| feedback.py | Import error | Quality scores static at 0.5 | No learning over time |
| field_monitor.py | No data | Empty report | No alerts, but no crash |
| self_improver.py | Sandbox test fails | ALL proposals held, operator notified | Safe: no bad changes deployed |

---

## TEST SUITE SUMMARY

```
Module                            Tests    Status
──────────────────────────────────────────────
injector.py                         22     ✅ ALL PASSING
strategy.py                         23     ✅ ALL PASSING
destructor.py                       35     ✅ ALL PASSING
unified_pipeline.py                 31     ✅ ALL PASSING
harness.py                          36     ✅ ALL PASSING
verifier.py                         16     ✅ ALL PASSING
progressive_disclosure.py           23     ✅ ALL PASSING
field_monitor.py                    17     ✅ ALL PASSING
self_improver.py                    20     ✅ ALL PASSING
e2e_validation.py (12 scenarios)    40     ✅ ALL PASSING
optimizer.py (+multiplicative)     all    ✅ EXISTING PRESERVED
bridge.py (+verify mode)           all    ✅ EXISTING PRESERVED
──────────────────────────────────────────────
TOTAL                              263    ✅ ZERO FAILURES
```

---

## COMMANDS

```bash
# Full test suite
python3 rag/unified_pipeline.py --test       # 31 tests + harness wiring
python3 rag/harness.py --test                 # 36 tests (all 5 gates)
python3 rag/verifier.py --test                # 16 tests
python3 rag/progressive_disclosure.py --test   # 23 tests
python3 rag/field_monitor.py --test            # 17 tests
python3 rag/self_improver.py --test            # 20 tests
python3 rag/e2e_validation.py                  # 40 tests (12 scenarios)

# Bridge modes
echo '{"query":"...","agent_id":"spark"}' | python3 rag/bridge.py --mode retrieve
echo '{"response":"...","chunks":[...]}' | python3 rag/bridge.py --mode verify

# Production injection with all harness gates
python3 -c "
from rag.unified_pipeline import inject_with_harness
result = inject_with_harness(
    query='review headline copy for campaign',
    agent_id='spark',
    chunks=retrieved_chunks,
    agent_identity='You are spark...',
    enable_harness=True,
    enable_progressive=True,
)
"

# Weekly self-improvement (dry run)
python3 rag/self_improver.py --dry-run
```
