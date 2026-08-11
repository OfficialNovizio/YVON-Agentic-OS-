// CAOS (Context-Aware Orchestration System) — the full 12-phase structure
// for the chat pipeline HUD. Content sourced verbatim from docs/MASTER.md
// §6.2 "Canonical CAOS pipeline" (current, re-verified) and PART 2 "THE FULL
// WORKFLOW" (historical design doc, 2026-07-16 — read for the fuller gate-
// level detail only; its own phase numbering is superseded by §6.2, which
// added RESOLVE and is the doc's designated current source).
//
// Two things every phase carries, rendered as two dropdowns in PipelineHud:
//   - process:  static reference text — what the phase does / how it decides.
//     Never live data. Sourced from the docs, not invented (Playbook §0.5).
//   - decision: the phase's real output, pulled from the live event stream
//     when a `kind` mapping exists and that stage has fired. Where no event
//     kind exists yet (`docs/YVON-CHAT.md` §Phase observability — only
//     phase.classify / phase.resolve / tool.call are emitted by hermes-agent
//     today; phase.retrieve / gate.* / loop.iteration are reserved), the
//     fallback text says so honestly instead of fabricating a result.
//
// §3's own definition (line 264) draws the CAOS boundary at CLASSIFY →
// RESOLVE → RETRIEVE → GATE. Phases 08–11 are the doc's post-CAOS pipeline
// continuation (strategy routing → generation → verification → feedback),
// nested here as one visual container per operator request — not because
// §6.2 calls them "CAOS." Phase 12 (Field Monitoring) is a weekly batch
// process, not a per-turn phase, so it's held out of the dropdown list
// entirely and rendered as a static bottom note instead (see PipelineHud).
//
// Owner: mia · chat pipeline HUD restructure, 2026-08-11

import type { PipelineStage } from './pipeline'

export interface CaosPhase {
  n: string
  id: string
  title: string
  file: string
  /** Which live PipelineStage.kind feeds this phase's Decision dropdown, if any. */
  kind?: PipelineStage['kind']
  /** Reference text for the Process dropdown — static, never live. */
  process: string[]
  /** Shown in the Decision dropdown when no live stage of `kind` has fired. */
  decisionFallback: string
  /** Sub-gates only present on phase 07. */
  gates?: CaosGate[]
}

export interface CaosGate {
  n: number
  id: string
  title: string
  /** Loose keyword used to best-effort match a live gate event's label/detail
   * to this specific gate — the exact string hermes-agent will eventually
   * send in `payload.gate` isn't defined anywhere yet, so this is a
   * forward-compatible guess, not a contract. */
  matchKeyword: string
  process: string[]
  decisionFallback: string
}

export const CAOS_PHASES: CaosPhase[] = [
  {
    n: '01',
    id: 'classify',
    title: 'CLASSIFY',
    file: 'src/cie/classifier.ts',
    kind: 'classify',
    process: [
      'keyword/domain match → task_type + agent_id',
      '"acquire + $2M" → strategic_analysis → marcus',
      '"GDPR + retention" → legal_review → comply',
    ],
    decisionFallback: 'awaiting phase.classify event',
  },
  {
    n: '02',
    id: 'disclosure',
    title: 'SKILL DISCLOSURE',
    file: 'rag/harness/disclosure.py',
    process: [
      'agent_id → load skill DESCRIPTIONS only, match query against triggers',
      '2–5 relevant skills activate → load full SKILL.md',
      'inactive skills stay as ~8-token one-line summaries (40–60% savings)',
    ],
    decisionFallback: 'not emitted — no dedicated event kind yet',
  },
  {
    n: '03',
    id: 'resolve',
    title: 'RESOLVE',
    file: 'src/cie/graph-resolver.ts',
    kind: 'resolve',
    process: [
      'graph-tier authorization — Master Graph vs brand graph vs tenant graph',
      '(isolation boundary, pgvector/qdrant namespace per agent+tenant)',
      'CAG check [cie/cache.ts, LRU] — stable context served from cache;',
      'only volatile context proceeds to RETRIEVE',
      'source fan-out: graphify (structural) + MemPalace (episodic/semantic)',
    ],
    decisionFallback: 'awaiting phase.resolve event',
  },
  {
    n: '04',
    id: 'retrieve',
    title: 'HYBRID RETRIEVAL',
    file: 'rag/core/bridge.py · rag/retriever.py',
    kind: 'retrieve',
    process: [
      'query rewrite (≤5 variants) → hybrid dense (MiniLM-L6-v2) +',
      'sparse (BM25) → cross-encoder re-rank → 20 candidates',
      'graphify structural pull — GRAPH-PINNED results',
      'MemPalace episodic pull — verbatim drawers, temporal-KG validity checked',
    ],
    decisionFallback: 'not emitted — hermes-agent phase hooks are probe-gated',
  },
  {
    n: '05',
    id: 'formula',
    title: 'FORMULA EXECUTION',
    file: 'Shared OS/logical/*.py via bridge.py',
    process: [
      'detect computable formulas in query',
      '"acquire + $2M" → competitive_strategy.five_forces() ·',
      'venture_valuation.pre_money() · capital_budgeting.npv()',
      'computed facts are testable credentials — any agent can reproduce',
      'via `python3 script.py --args`',
    ],
    decisionFallback: 'not emitted — no dedicated event kind yet',
  },
  {
    n: '06',
    id: 'optimizer',
    title: 'CONTEXT OPTIMIZER',
    file: 'rag/optimizer.py',
    process: [
      'profile selection → tier allocation → source diversity check',
      'adversary injection (premortem, deep_analysis tasks only)',
      'reliability = freshness × source_authority × quality_score',
    ],
    decisionFallback: 'not emitted — no dedicated event kind yet',
  },
  {
    n: '07',
    id: 'gate',
    title: 'HARNESS GATES',
    file: 'rag/harness/gates.py',
    kind: 'gate',
    process: ['5 gates in sequence — see each below'],
    decisionFallback: 'not emitted — hermes-agent phase hooks are probe-gated',
    gates: [
      {
        n: 1,
        id: 'source-authentication',
        title: 'source authentication',
        matchKeyword: 'authenticat',
        process: [
          'file exists on disk? → else QUARANTINE',
          'chunk hash matches source? → else FLAG',
          'book citation traceable? → checked against Teams/Books/',
          'within agent’s authorized depts? → else BLOCK',
        ],
        decisionFallback: 'not emitted — would be verified / flagged / blocked',
      },
      {
        n: 2,
        id: 'reliability',
        title: 'multiplicative reliability',
        matchKeyword: 'reliab',
        process: [
          'reliability = freshness × authority × quality',
          'authority: 1.0 book · 0.9 NIST/ISO/OECD · 0.8 Shared OS script ·',
          '0.7 dept doc · 0.5 playbook/skill · 0.4 agent log · 0.2 unknown',
          'junk 0.3×0.2×0.5=0.03 vs. authoritative 0.9×1.0×0.9=0.81',
        ],
        decisionFallback: 'not emitted — would be a per-chunk reliability score',
      },
      {
        n: 3,
        id: 'conflict-detection',
        title: 'conflict detection',
        matchKeyword: 'conflict',
        process: [
          'cosine similarity >0.7 + negation → CONTRADICTION',
          'same source, different version → VERSION CONFLICT',
          'general principle vs. specific override → DOMAIN CONFLICT',
          'flags injected as ⚠️, never silently resolved',
        ],
        decisionFallback: 'not emitted — would be "N conflicts flagged"',
      },
      {
        n: 4,
        id: 'priority-budget',
        title: 'priority budget assembly',
        matchKeyword: 'priority',
        process: [
          'P0 identity → P1 active skills → P2 computed facts →',
          'P3 load-bearing (T1) → P4 structural (T2) → P5 adversarial (1) →',
          'P6 supplementary (T3) → P7 inactive skill summaries',
          'fills in order; budget exhausted = remaining tiers dropped',
        ],
        decisionFallback: 'not emitted — would show where the budget cut off',
      },
      {
        n: 5,
        id: 'quarantine-recovery',
        title: 'quarantine + recovery',
        matchKeyword: 'quarantine',
        process: [
          'below-threshold chunks excluded + logged to quarantine.jsonl',
          'operator notified if a quarantined chunk was previously T1',
          'recovery pass re-scans dropped T1/T2 for load-bearing facts,',
          'pulls back if reliability > recovery_threshold',
        ],
        decisionFallback: 'not emitted — would be "N quarantined, M recovered"',
      },
    ],
  },
  {
    n: '08',
    id: 'strategy-routing',
    title: 'STRATEGY ROUTING',
    file: 'rag/core/unified_pipeline.py',
    process: [
      'FAST (creative review/copy edit/lookup) → hard budget, 64–89% savings',
      'BALANCE (default) → adaptive ×0.4–4.0 by task, 39–77% savings',
      'QUALITY → relational+progressive when contradictions detected',
    ],
    decisionFallback: 'not emitted — no dedicated event kind exists',
  },
  {
    n: '09',
    id: 'generation',
    title: 'GENERATION',
    file: 'src/cie/builder.ts',
    process: [
      'hermes+claude → primary reasoning',
      'deepseek → adversarial verification (checks the primary output)',
      'chatgpt → creative quality pass',
    ],
    decisionFallback: 'not emitted — no dedicated event kind exists (real tool-call activity, if any, is folded in above)',
  },
  {
    n: '10',
    id: 'post-hoc-verification',
    title: 'POST-HOC VERIFICATION',
    file: 'rag/verify/',
    process: [
      'grounded citation check — claim vs. injected chunk embedding similarity',
      'self-consistency check — response vs. itself, vs. computed facts',
      'constitution check — compliance with the context constitution',
      'high-stakes/low-score → delegated to quinn/precedent/sentinel',
    ],
    decisionFallback: 'not emitted — no dedicated event kind exists',
  },
  {
    n: '11',
    id: 'feedback-loop',
    title: 'FEEDBACK LOOP',
    file: 'rag/core/feedback.py · watcher.py · improver.py',
    process: [
      'outcome (accept/reject/revise) → quality_new = 0.95·old + 0.05·outcome',
      'weekly field monitor: drift, degradation (>0.15 warn, >0.25 critical)',
      'Sunday 00:00 UTC self-improver: analyze → propose → sandbox-test →',
      'decide → deploy (git-revertible) → log',
    ],
    decisionFallback: 'not emitted here yet (real per-turn record events, if any, are folded in above)',
  },
]

export const CAOS_FIELD_MONITORING = {
  n: '12',
  title: 'FIELD MONITORING',
  file: 'rag/monitor/watcher.py',
  note: 'weekly batch report (attractors · degradation · coverage gaps · drift) — not a per-turn phase, so it has no per-turn decision to show here.',
}
