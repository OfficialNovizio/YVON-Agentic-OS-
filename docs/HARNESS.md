# YVON HARNESS — Complete Architecture Plan

**Status:** Design Phase  
**Date:** 2026-07-16  
**Goal:** Build a harness that covers every gap identified in the comparison matrix — source authentication, priority-based assembly, progressive disclosure, grounded citations, post-hoc verification, conflict detection, plan-lock, quarantine, agent delegation, and field monitoring.

---

## THE FULL WORKFLOW

```
QUERY: "should we acquire Competitor X for $2M?"
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: TASK CLASSIFICATION & AGENT SELECTION              │
│  (src/cie/classifier.ts — EXISTS, needs domain keyword fix)  │
│                                                              │
│  query → domain keyword classifier → task_type + agent_id   │
│  "acquire + $2M" → strategic_analysis → marcus               │
│  "GDPR + retention" → legal_review → comply                  │
│  "headline + campaign" → creative_review → spark             │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 2: SKILL PROGRESSIVE DISCLOSURE ★ NEW                │
│  (rag/progressive_disclosure.py — BUILD)                     │
│                                                              │
│  agent_id → load skill DESCRIPTIONS only (not full content)  │
│  match query against skill triggers                          │
│  activate 2-5 relevant skills → load full SKILL.md           │
│  inactive skills stay as one-line summaries                  │
│                                                              │
│  Example: marcus has 5 skills. Query triggers:               │
│    ✓ decision-critic (full load)                             │
│    ✓ venture-priority-matrix (full load)                     │
│    ✓ strategy-advisor (full load)                            │
│    ✗ okr-cascade (summary only — 8 tokens)                   │
│    ✗ vision-exploration (summary only — 6 tokens)           │
│                                                              │
│  Savings: ~60% on skill context for agents with 5+ skills    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 3: HYBRID RETRIEVAL                                   │
│  (rag/retriever.py — EXISTS, needs plan-lock)                │
│                                                              │
│  ┌─ PLAN-LOCK GATE ★ NEW ───────────────────────────────┐   │
│  │  Before retrieval runs:                                │   │
│  │  1. Lock agent authorization (which depts can query)   │   │
│  │  2. Lock knowledge sources (which files are in scope)  │   │
│  │  3. Hash the plan → append-only log                    │   │
│  │  4. Retrieval deviation from plan → HALT + escalate    │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  query → rewrite (3-5 variants) → dense + sparse search      │
│  → cross-encoder rerank → top-20 candidates                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 4: FORMULA EXECUTION                                   │
│  (rag/bridge.py → Shared OS scripts — EXISTS)                │
│                                                              │
│  detect computable formulas in query:                        │
│  "acquire + $2M" → competitive_strategy.py five_forces()     │
│                 → venture_valuation.py pre_money()            │
│                 → capital_budgeting.py npv()                  │
│                                                              │
│  computed facts are TESTABLE CREDENTIALS (Heath, Ch.4)        │
│  → any agent can reproduce: python3 script.py --args          │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 5: CONTEXT OPTIMIZER                                   │
│  (rag/optimizer.py — EXISTS, needs multiplicative fix)       │
│                                                              │
│  profile selection → tier allocation → source diversity       │
│  → adversary injection (premortem for deep_analysis only)     │
│                                                              │
│  ★ FIX: compute_chunk_quality() → multiplicative formula     │
│  reliability = freshness × source_authority × quality_score   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 6: HARNESS GATES ★ BUILD ENTIRELY NEW                │
│  (rag/harness.py — BUILD, the core new module)               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │  GATE 1: SOURCE AUTHENTICATION                       │    │
│  │  ─────────────────────────                          │    │
│  │  For every chunk:                                     │    │
│  │    1. source_file exists on disk? → if not, QUARANTINE│    │
│  │    2. chunk hash matches source file? → if not, FLAG  │    │
│  │    3. book citation traceable? → check Teams/Books/   │    │
│  │    4. within agent's authorized depts? → if not, BLOCK │    │
│  │                                                      │    │
│  │  Output: chunk + auth_status (verified|flagged|blocked)│   │
│  │                                                      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  GATE 2: RELIABILITY SCORING                         │    │
│  │  ──────────────────────                              │    │
│  │  For every authenticated chunk:                       │    │
│  │    reliability = freshness × authority × quality       │    │
│  │                                                      │    │
│  │    freshness    → staleness_economics.doc_freshness() │    │
│  │    authority    → source_authority mapping:           │    │
│  │      1.0 = verified book in Teams/Books/              │    │
│  │      0.9 = NIST/ISO/OECD standard                    │    │
│  │      0.8 = Shared OS script (testable credential)     │    │
│  │      0.7 = department document                       │    │
│  │      0.5 = playbook / skill                          │    │
│  │      0.4 = agent operational log                     │    │
│  │      0.2 = unknown source                            │    │
│  │    quality     → feedback loop historical score        │    │
│  │                                                      │    │
│  │  MULTIPLICATIVE: junk chunk → 0.3×0.2×0.5 = 0.03     │    │
│  │  AUTHORITATIVE: book chunk → 0.9×1.0×0.9 = 0.81      │    │
│  │                                                      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  GATE 3: CONFLICT DETECTION                          │    │
│  │  ─────────────────────                               │    │
│  │  For every pair of kept chunks:                       │    │
│  │    1. Semantic similarity (embedding cosine)          │    │
│  │    2. If similarity > 0.7 AND negation detected       │    │
│  │       → CONTRADICTION flag                           │    │
│  │    3. Same source, different version                  │    │
│  │       → VERSION CONFLICT flag                        │    │
│  │    4. General principle vs specific override          │    │
│  │       → DOMAIN CONFLICT flag                         │    │
│  │                                                      │    │
│  │  Detected conflicts → injected as ⚠️ CONFLICT blocks  │    │
│  │  in the context, NOT resolved silently                │    │
│  │                                                      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  GATE 4: PRIORITY-BASED BUDGET ENFORCEMENT           │    │
│  │  ──────────────────────────────────                  │    │
│  │  Assembly priority (highest → lowest):                │    │
│  │    P0: System prompt (agent identity + principles)    │    │
│  │    P1: Active skills (full SKILL.md for triggered)    │    │
│  │    P2: Computed facts (Shared OS results)             │    │
│  │    P3: Load-bearing chunks (T1, verified, high rel)   │    │
│  │    P4: Structural chunks (T2)                         │    │
│  │    P5: Adversarial chunk (one, if profile requires)   │    │
│  │    P6: Supplementary chunks (T3)                      │    │
│  │    P7: Inactive skill summaries (one-liners)          │    │
│  │                                                      │    │
│  │  Budget fills P0→P7 in order. When budget exhausted,  │    │
│  │  remaining priority levels are DROPPED.              │    │
│  │                                                      │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  GATE 5: QUARANTINE & RECOVERY                       │    │
│  │  ──────────────────────────                          │    │
│  │  Chunks with reliability < threshold:                 │    │
│  │    → NOT injected (excluded from assembly)            │    │
│  │    → LOGGED to quarantine.jsonl                      │    │
│  │    → OPERATOR NOTIFIED if chunk was previously T1     │    │
│  │                                                      │    │
│  │  Recovery pass (after assembly):                       │    │
│  │    → Scan dropped T1/T2 chunks                        │    │
│  │    → If novel fact, exception, or contradiction        │    │
│  │    → AND reliability > recovery_threshold              │    │
│  │    → recover (pull back into assembly)                 │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  OUTPUT: verified_chunks + conflict_flags + trace_log        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 7: STRATEGY ROUTING + INJECTION                        │
│  (rag/unified_pipeline.py — EXISTS, extend)                  │
│                                                              │
│  ┌─ FAST PATH ──────────────────────────────────────────┐    │
│  │  creative_review, factual_lookup, copy_edit           │    │
│  │  → Destructor v2 (hard budget, no recovery)           │    │
│  │  → 64-89% savings, quality acceptable for task        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ BALANCE PATH ───────────────────────────────────────┐    │
│  │  everything else                                      │    │
│  │  → Adaptive budget + Recovery pass                    │    │
│  │  → 39-77% savings, quality preserved for task         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ★ NEW: Progressive skill disclosure injected                │
│  ★ NEW: Conflict flags injected into context                 │
│  ★ NEW: Grounded citation markers on every chunk             │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 8: LLM GENERATION                                     │
│  agent persona + active skills + injection text + query      │
│               │                                              │
│               ▼                                              │
│         MODEL RESPONSE                                       │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 9: POST-HOC VERIFICATION ★ NEW                       │
│  (rag/verifier.py — BUILD)                                  │
│                                                              │
│  ┌─ GROUNDED CITATION CHECK ────────────────────────────┐    │
│  │  For every factual claim in the model's response:      │    │
│  │    1. Extract claim (number, rule, citation, fact)     │    │
│  │    2. Search injected chunks for supporting evidence   │    │
│  │    3. Embedding similarity between claim and chunks    │    │
│  │    4. If similarity < threshold → UNSUPPORTED flag     │    │
│  │    5. If similarity > threshold + wrong source         │    │
│  │       → MISATTRIBUTED flag                            │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ SELF-CONSISTENCY CHECK ─────────────────────────────┐    │
│  │  Does the response contradict itself?                  │    │
│  │  Does it contradict a computed fact from Shared OS?    │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ CONSTITUTION CHECK ─────────────────────────────────┐    │
│  │  Does the response comply with the context constitution?│   │
│  │  (readable, auditable, versioned document)             │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ★ OPTIONAL: Delegate verification to quinn agent            │
│    if uncertainty > threshold or task is high-stakes          │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 10: FEEDBACK LOOP                                     │
│  (rag/feedback.py — EXISTS, extend)                          │
│                                                              │
│  outcome (accept/reject/revise) → update chunk quality       │
│  ★ NEW: source-level feedback (if chunks from source X       │
│    consistently produce bad outcomes, down-weight source X   │
│    across ALL queries)                                       │
│  ★ NEW: budget feedback (if task_type consistently needs     │
│    more/less budget than multiplier provides, adjust)        │
│  ★ NEW: Lasswell trace extended with harness gate results    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 11: FIELD MONITORING ★ NEW                            │
│  (rag/field_monitor.py — BUILD)                              │
│                                                              │
│  Continuous observation of injection quality:                │
│    • Attractor detection: which chunk combinations produce   │
│      consistently good/bad outcomes?                         │
│    • Degradation alerts: quality score dropping over time    │
│    • Coverage gaps: queries that consistently get too few    │
│      chunks / too-low quality injection                     │
│    • Drift detection: agent behavior changing as source      │
│      documents evolve                                        │
│                                                              │
│  Output: weekly fleet health report (auto-generated)         │
└──────────────────────────────────────────────────────────────┘
```

---

## WHAT GETS BUILT (New Files)

| # | File | Purpose | Lines (est.) | Dependencies |
|---|------|---------|-------------|--------------|
| 1 | `rag/harness.py` | 5-gate harness — authenticate, reliability, conflict, budget, quarantine | ~500 | retriever, optimizer, embed, staleness_economics, feedback |
| 2 | `rag/verifier.py` | Post-hoc verification — grounded citations, self-consistency, constitution | ~400 | embed, injector, Shared OS scripts |
| 3 | `rag/progressive_disclosure.py` | Skill progressive disclosure — description loading, trigger matching, on-demand full load | ~250 | Teams/ file system, skill registry |
| 4 | `rag/field_monitor.py` | Field monitoring — attractor detection, degradation alerts, coverage gaps, drift | ~350 | feedback, embed, harness |
| 5 | `rag/context_constitution.md` | Context constitution — human-readable rules for acceptable context | ~150 | None (document) |
| 6 | `rag/quarantine.jsonl` | Quarantine log — append-only record of excluded chunks | N/A | harness |
| 7 | `rag/plan_lock_log.jsonl` | Plan-lock log — append-only record of retrieval execution plans | N/A | harness |
| 8 | `rag/source_authority.yaml` | Source authority mappings — scores per source type | ~50 | harness |

---

## WHAT GETS MODIFIED (Existing Files)

| # | File | Change | Why |
|---|------|--------|-----|
| 1 | `rag/unified_pipeline.py` | Add harness gate calls before strategy routing; add conflict flags to injection text; add grounded citation markers | Harness is a pre-injection gate |
| 2 | `rag/optimizer.py` | Fix `compute_chunk_quality()` to multiplicative formula; add source_authority lookup; wire calibration_weight into retrieval confidence | Currently additive + disconnected |
| 3 | `rag/feedback.py` | Add source-level feedback; add budget feedback; extend Lasswell trace with harness results | Feedback needs to tune retrieval, not just chunks |
| 4 | `rag/retriever.py` | Add plan-lock enforcement (hash execution plan, verify authorization before retrieval) | Rail 1 compliance |
| 5 | `rag/bridge.py` | Add harness output to bridge response JSON | CIE needs harness trace |
| 6 | `src/cie/classifier.ts` | Apply domain keyword priority fix (GDPR → legal_review, not factual_lookup) | Classification accuracy |
| 7 | `rag/books/harness-engineering.md` | Already rewritten — this defines the principles. Add context constitution reference. | Design rationale |

---

## WHAT GETS LEFT ALONE (Working, No Changes)

| Module | Why |
|--------|-----|
| `rag/injector.py` | 3-layer compression is correct and tested (22/22) |
| `rag/strategy.py` | Strategy selector is correct and tested (23/23) |
| `rag/destructor.py` | Hard budget pipeline is correct and tested (35/35) |
| `rag/embed.py` | Dense + sparse embedding works |
| `rag/chunkify.py` | Semantic chunking works |
| `Teams/` (all 46 agents) | No structural changes |
| `Teams/Shared OS/` (35 scripts) | No changes to formulas |
| `src/` (TypeScript CIE) | Minor only (classifier fix) |

---

## HARNESS DATA FLOW (DETAILED)

```
Chunks arrive from optimizer (20 candidates)
    │
    ▼
┌─────────────────────────────────────┐
│ GATE 1: SOURCE AUTHENTICATION       │
│ ─────────────────────────────────   │
│ Input:  20 chunks                   │
│ Output: 18 verified, 1 flagged,     │
│          1 blocked                  │
│                                     │
│ Flagged: source_file hash mismatch  │
│   → chunk may have been tampered    │
│   → still injected, but with ⚠️     │
│                                     │
│ Blocked: source_file not found      │
│   → chunk is orphaned               │
│   → NOT injected, logged            │
│   → operator notified if was T1     │
│                                     │
│ Log: quarantine.jsonl               │
│   {chunk_id, reason, timestamp,     │
│    operator_notified: true/false}   │
└──────────────┬──────────────────────┘
               │
               ▼ (18 verified + 1 flagged)
┌─────────────────────────────────────┐
│ GATE 2: RELIABILITY SCORING         │
│ ────────────────────────────        │
│ Input:  19 chunks                   │
│ Output: 19 scored (0.0-1.0)         │
│                                     │
│ Formula: freshness × authority       │
│          × quality_score             │
│                                     │
│ Example scores:                     │
│   NIST doc (fresh 0.9 × auth 0.9    │
│     × quality 0.85) = 0.69          │
│   Blog chunk (fresh 0.3 × auth 0.2  │
│     × quality 0.5) = 0.03           │
│   Ogilvy book (fresh 0.7 × auth 1.0 │
│     × quality 0.9) = 0.63           │
│                                     │
│ Threshold: 0.15 for T1, 0.10 for T2 │
│ Below threshold → QUARANTINE        │
└──────────────┬──────────────────────┘
               │
               ▼ (16 reliable + 3 quarantined)
┌─────────────────────────────────────┐
│ GATE 3: CONFLICT DETECTION          │
│ ──────────────────────────          │
│ Input:  16 chunks                   │
│ Output: 16 chunks + 2 conflict      │
│           flags                     │
│                                     │
│ Pairwise embedding comparison       │
│ (cosine similarity of chunk vectors) │
│                                     │
│ Found:                              │
│   Chunk A (NIST): "risk score >12   │
│     → board review"                 │
│   Chunk B (ISO 31000): "fixed       │
│     numerical thresholds create     │
│     blind spots"                    │
│   → similarity: 0.72                │
│   → negation: "create blind spots"  │
│   → CONTRADICTION DETECTED          │
│                                     │
│ Flags injected into context:        │
│   ⚠️ CONFLICT [g1]:                 │
│   NIST SP 800-30 vs ISO 31000:2018  │
│   §6.4.3 — fixed thresholds vs      │
│   context-dependent evaluation      │
│   Agent must reconcile or flag      │
│   to operator.                      │
└──────────────┬──────────────────────┘
               │
               ▼ (16 chunks + 2 conflict flags)
┌─────────────────────────────────────┐
│ GATE 4: PRIORITY ASSEMBLY           │
│ ──────────────────────────          │
│ Input:  16 chunks, active skills,   │
│         computed facts, agent       │
│         identity                    │
│ Budget: computed from task_type     │
│         multiplier                  │
│                                     │
│ P0: [80t] agent identity            │
│     "You are marcus, CEO...         │
│      Steve Jobs persona"            │
│                                     │
│ P1: [150t] active skills             │
│     decision-critic, venture-       │
│     priority-matrix, strategy-      │
│     advisor (full SKILL.md)         │
│                                     │
│ P2: [60t] computed facts            │
│     five_forces() = {rivalry: HIGH, │
│     entry_barriers: MEDIUM...}      │
│     npv() = $137,236.03             │
│                                     │
│ P3: [200t] T1 verified chunks (3)   │
│     Porter Ch.1, Brealey Ch.5,      │
│     venture_valuation.py            │
│                                     │
│ P4: [120t] T2 structural (2)        │
│     WACC pitfalls, Porter limits    │
│                                     │
│ P5: [40t] adversarial chunk (1)     │
│     ISO 31000 contradicts NIST      │
│                                     │
│ P6: [0t] T3 supplementary — BUDGET  │
│     EXHAUSTED at P5                 │
│     → 2 T3 chunks DROPPED           │
│                                     │
│ P7: [30t] inactive skills            │
│     okr-cascade: "cascades company  │
│     OKRs to department level"       │
│     vision-exploration: "explores   │
│     future scenarios..."            │
│                                     │
│ Total assembled: 680t               │
│ Budget: 680t ← exactly filled       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ GATE 5: QUARANTINE & RECOVERY       │
│ ──────────────────────────────      │
│                                     │
│ Quarantined (from Gates 1-3):       │
│   1 orphaned, 3 low-reliability     │
│   → logged to quarantine.jsonl      │
│   → operator notified for T1        │
│                                     │
│ Recovery scan on dropped:           │
│   Dropped T3 chunks (2) scanned     │
│   1 has novel fact not in kept:     │
│     → recovered if reliability       │
│       > 0.10                        │
│   +1 chunk added to P6              │
│                                     │
│ Final assembly: 680t + 40t rec      │
│ = 720t total injection              │
└──────────────────────────────────────┘
```

---

## AGENT DELEGATION (Phase 9 Enhancement)

Instead of building all verification logic into verifier.py, delegate to existing agents when the task is high-stakes:

```
Post-hoc verification flow:

MODEL RESPONSE
    │
    ├── Low-stakes (creative_review, factual_lookup)
    │       → automated verification only
    │       → grounded citation check + self-consistency
    │
    ├── Medium-stakes (standard_review, engineering_debug)
    │       → automated + quinn verification
    │       → quinn runs verification-before-completion skill
    │       → checks: are all claims supported? any contradictions?
    │
    └── High-stakes (governance, legal, strategic)
            → automated + quinn + precedent + sentinel
            → precedent: consistency with prior rulings
            → sentinel: constitution bypass detection
            → full audit trail generated
```

---

## PROGRESSIVE DISCLOSURE FLOW

```
Agent: marcus (5 skills)
Query: "should we acquire Competitor X for $2M?"

┌──────────────────────────────────────────┐
│ SKILL REGISTRY (loaded from agent.md)    │
│ ────────────────────────────────────     │
│ Skill descriptions only (not full body)  │
│                                          │
│ decision-critic:                         │
│   "Stress-tests strategic decisions      │
│    against decision analysis framework"  │
│   Triggers: decision, approve, reject    │
│   → MATCHED (query contains "acquire")   │
│   → LOAD FULL SKILL.md ✓                │
│                                          │
│ venture-priority-matrix:                 │
│   "Scores ventures on strategic fit,     │
│    urgency, and resource requirements"   │
│   Triggers: invest, acquire, prioritize  │
│   → MATCHED                              │
│   → LOAD FULL SKILL.md ✓                │
│                                          │
│ strategy-advisor:                        │
│   "Provides strategic options with       │
│    competitive analysis"                 │
│   Triggers: strategy, competition        │
│   → MATCHED (context: Porter's forces)   │
│   → LOAD FULL SKILL.md ✓                │
│                                          │
│ okr-cascade:                             │
│   "Cascades company OKRs to department   │
│    level with measurable KRs"            │
│   Triggers: OKR, goals, quarterly        │
│   → NOT MATCHED                          │
│   → SUMMARY ONLY (one line, ~8 tokens)  │
│                                          │
│ vision-exploration:                      │
│   "Explores future scenarios and         │
│    long-term strategic narratives"       │
│   Triggers: vision, future, scenario     │
│   → NOT MATCHED                          │
│   → SUMMARY ONLY (one line, ~6 tokens)  │
│                                          │
│ Result: 3 full loads + 2 summaries       │
│ vs all 5 full loads = ~40% savings       │
└──────────────────────────────────────────┘
```

---

## GROUNDED CITATION FLOW

```
MODEL OUTPUT: "Based on Porter's analysis, the industry has high
rivalry and low entry barriers, making it structurally unattractive
for acquisition. The computed NPV is $137,236."

POST-HOC VERIFICATION:
─────────────────────

Claim 1: "industry has high rivalry and low entry barriers"
  → Search injected chunks for "rivalry" + "entry barriers"
  → Found: chunk_c14 (porter-competitive-strategy.md, Five Forces)
    "Porter Ch.1: Five forces — rivalry, entry threat..."
  → Embedding similarity: 0.84
  → ✅ SUPPORTED [porter-competitive-strategy.md, Ch.1]

Claim 2: "structurally unattractive for acquisition"
  → Search injected chunks for "structurally unattractive"
  → Found: chunk_c14
    "High rivalry + low entry barriers = structurally unattractive"
  → Embedding similarity: 0.91
  → ✅ SUPPORTED [porter-competitive-strategy.md, Ch.1]

Claim 3: "computed NPV is $137,236"
  → Search injected chunks for "NPV" + "137,236"
  → Found: chunk_c7 (capital_budgeting.py, NPV)
    "[COMPUTED] npv() = $137,236.03 [Brealey & Myers, Ch.5]"
  → Embedding similarity: 0.97
  → ✅ SUPPORTED [capital_budgeting.py, npv()]

All 3 claims verified. 0 unsupported. 0 misattributed.
Verification score: 1.00
```

---

## IMPLEMENTATION ORDER

| Phase | What | Depends On | Effort | Test Target |
|-------|------|-----------|--------|-------------|
| **1** | `rag/harness.py` — Gates 1, 2, 5 (authenticate, reliability, quarantine) | staleness_economics, feedback, optimizer fix | 3 days | 30+ tests |
| **2** | `rag/optimizer.py` — Fix multiplicative formula + source_authority lookup | harness.py | 1 day | existing tests pass + new |
| **3** | `rag/harness.py` — Gates 3, 4 (conflict, priority assembly) | Phase 1 harness, embed | 2 days | 20+ tests |
| **4** | `rag/progressive_disclosure.py` — Skill progressive disclosure | agent registry, SKILL.md files | 1.5 days | 15+ tests |
| **5** | `rag/unified_pipeline.py` — Wire harness gates + conflict flags + citation markers | harness.py, progressive_disclosure | 1.5 days | existing 31 tests + new |
| **6** | `rag/verifier.py` — Post-hoc grounded citation + self-consistency | embed, unified_pipeline | 2 days | 20+ tests |
| **7** | `rag/retriever.py` — Plan-lock enforcement | harness.py | 1 day | 10+ tests |
| **8** | `rag/feedback.py` — Source-level + budget feedback | verifier.py | 1 day | existing tests + new |
| **9** | `rag/field_monitor.py` — Attractor detection + degradation + coverage + drift | feedback, harness | 2 days | 15+ tests |
| **10** | `rag/bridge.py` — Harness output in bridge JSON | harness.py | 0.5 days | integration tests |
| **11** | `rag/context_constitution.md` — Human-readable constitution | all of above | 0.5 days | N/A (document) |
| **12** | Integration testing — End-to-end across 13 scenarios | all of above | 2 days | E2E benchmark |

**Total: ~18 days of focused work. 110+ new tests on top of existing 111.**

---

## SINGLE ENTRY POINT (FINAL)

```python
from rag.harness import Harness
from rag.unified_pipeline import inject
from rag.progressive_disclosure import ProgressiveDisclosure
from rag.verifier import verify_response

# ── PHASE 1-2: Classification + Progressive Disclosure ──
task_type, agent_id = classify_query(query, agent_id)
skills_context = ProgressiveDisclosure(agent_id).load_for_query(query)

# ── PHASE 3-5: Retrieval + Formula + Optimization ──
retrieval_result = retrieve(query, agent_id, dept, mode='standard')
computed_facts = detect_and_execute_formulas(query, agent_id)
optimized = optimize_context(retrieval_result.candidates, query, agent_id)

# ── PHASE 6: HARNESS GATES ★ ──
harness = Harness()
verified = harness.process(
    chunks=optimized.selected_chunks,
    agent_id=agent_id,
    query=query,
    task_type=task_type,
)

# verified.auth_status     → {chunk_id: verified|flagged|blocked}
# verified.reliability      → {chunk_id: 0.0-1.0}
# verified.conflicts        → [(chunk_a, chunk_b, conflict_type, description)]
# verified.quarantined      → [{chunk_id, reason, notified}]
# verified.recovered        → [{chunk_id, reason}]
# verified.assembly_plan    → {priority_level: [chunk_ids], budget_used, budget_total}

# ── PHASE 7: Injection ──
result = inject(
    query=query,
    agent_id=agent_id,
    chunks=verified.assembly,
    task_type=task_type,
    skills_context=skills_context,
    computed_facts=computed_facts,
    conflicts=verified.conflicts,  # ← NEW: conflict flags in context
)

# ── PHASE 8: LLM ──
response = llm.generate(
    persona=agent_persona,
    skills=skills_context.active,
    context=result.injection_text,
    query=query
)

# ── PHASE 9: Verification ★ ──
verification = verify_response(
    response=response,
    injected_chunks=result.kept_chunks,
    computed_facts=computed_facts,
    task_type=task_type,
)

# verification.claims           → [{claim, support_chunk, similarity, status}]
# verification.unsupported      → [claims with no matching chunk]
# verification.misattributed    → [claims citing wrong source]
# verification.self_consistent  → bool
# verification.score            → 0.0-1.0

# ── PHASE 10: Feedback ──
log_feedback(trace, outcome='pending', verification=verification)

# ── PHASE 11: Field Monitor (async, runs periodically) ──
# field_monitor.record(query, agent_id, task_type,
#                      harness_result=verified,
#                      verification=verification,
#                      outcome=final_outcome)
```
