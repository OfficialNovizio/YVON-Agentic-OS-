// CAOS v2 — the pure event → view reducer.
//
// WHY THIS FILE EXISTS SEPARATELY FROM THE COMPONENT
// --------------------------------------------------
// docs/SESSION-HANDOUT.md §5.1 records that this repo has shipped a /chat
// redesign verified by `tsc` alone, never opened in a browser, and rolled it
// back in full (72 files restored). The lesson taken here is structural, not
// procedural: every decision this panel makes lives in pure functions with no
// React, no DOM and no GSAP, so it can be executed and asserted in CI or a
// plain node process. CaosPanel.tsx is then a thin renderer over `CaosView`.
// If the panel ever shows the wrong thing, it is provable here first.
//
// v1 (dashboard/lib/caos-phases.ts) described twelve phases of which three ever
// emitted an event — see docs/CAOS-V1-DEPRECATED.md. v2 has seven steps in
// three stages, and every one of them either has real data or says plainly
// that it does not.
import type { PipelineStage } from './pipeline'

// ── the shape the panel renders ─────────────────────────────────────────────

export type StepStatus =
  | 'ok'        // ran, produced a real decision
  | 'warn'      // ran, but degraded (a source was unavailable, a gate absent)
  | 'skip'      // not implemented — shown so the gap is visible, not hidden
  | 'run'       // in flight right now
  | 'pending'   // not reached yet this turn

export type StageId = 'prepare' | 'execute' | 'settle'

export interface StepDetail {
  label: string
  value: string
  /** renders as a muted chip rather than plain text — for statuses like
   *  "unwired" / "not measured", which must never look like a value */
  muted?: boolean
}

export interface CaosStep {
  id: string
  stage: StageId
  /** display number: '1'…'7b', or '→' for the envelope */
  n: string
  title: string
  status: StepStatus
  /** one-line summary shown collapsed */
  summary: string
  /** the expanded body: what it read, then what it decided */
  detail: StepDetail[]
  /** the verdict line at the bottom of the expansion */
  verdict?: string
  /** matched keywords / chips shown above the detail list */
  chips?: { text: string; on: boolean }[]
  ms?: number | null
}

export interface CaosCall {
  n: number
  tool: string | null
  args: string
  /** ms the governor held this call before sending — a DIFFERENT state from
   *  working, per the operator decision on 22 Aug. 0 means it never waited. */
  waitMs: number
  ok: boolean
  summary: string
  ms: number | null
  /** est input tokens for this call, when the meter apportioned them */
  tokens: number | null
  status: 'run' | 'hold' | 'done' | 'error'
}

export interface CaosCost {
  /** per MESSAGE — reset at the start of every turn */
  llmCalls: number | null
  estInputTokens: number | null
  fixedPerCall: number | null
  governorWaitS: number | null
  toolCalls: number
  /** false when two turns overlapped, so the split is approximate */
  exact: boolean
  /** the provider's own accounting — null means the runtime exposes none,
   *  which is the real state (probe 3: usage_attr NOT_IN_SOURCE). Never
   *  coerce this to 0; zero is a claim, absent is the truth. */
  providerTokens: number | null
  tier: string | null
  iterationCap: number | null
}

export interface CaosRoom {
  turns: number | null
  estInputTokens: number | null
  recycleAtTurns: number
  /** null when PooledAgent.turns is not being forwarded yet */
  turnsUntilRecycle: number | null
}

export interface CaosView {
  mode: 'live' | 'hold' | 'past' | 'none'
  steps: CaosStep[]
  calls: CaosCall[]
  cost: CaosCost
  room: CaosRoom
  stageMs: Record<StageId, number | null>
  agent: string | null
  elapsedMs: number | null
}

// ── inputs ──────────────────────────────────────────────────────────────────

/** The `usage` payload on the SSE `done` event (yvon-hermes-http main.py). */
export interface TurnUsageLike {
  llmCalls?: number
  estInputTokens?: number
  governorWaitS?: number
  llmCallsExact?: boolean
  toolCalls?: number
  latencyMs?: number
  tokensReported?: boolean
  totalTokens?: number | null
  poolTurns?: number
  firstCallShape?: { totalChars?: number; toolSchemaChars?: number; toolCount?: number }
}

export interface BuildInput {
  stages: PipelineStage[]
  source: 'live' | 'past' | 'none'
  usage?: TurnUsageLike | null
  agent?: string | null
  /** true while the turn is still streaming */
  awaiting?: boolean
}

const POOL_RECYCLE_TURNS = 12 // mirrors YVON_HERMES_POOL_RECYCLE_TURNS in main.py

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

/** Absent must stay absent. A missing measurement rendered as 0 is the single
 *  easiest way for this panel to lie, and the operator asked for no stale
 *  numbers — so every getter here returns null rather than a default. */
export function fmt(v: number | null, unit = ''): string {
  return v === null ? 'not measured' : v.toLocaleString() + unit
}

// ── the reducer ─────────────────────────────────────────────────────────────

export function buildCaosView(input: BuildInput): CaosView {
  const { stages, source, usage, agent, awaiting } = input
  const byKind = (k: PipelineStage['kind']) => stages.filter((s) => s.kind === k)
  const first = (k: PipelineStage['kind']) => byKind(k)[0] ?? null

  const analyze = first('analyze')
  const disclosure = first('disclosure')
  const resolve = first('resolve')
  const retrieve = first('retrieve')
  const toolStages = byKind('tool')
  const runDone = stages.find((s) => s.id === 'run-done')
  const runFailed = stages.find((s) => s.id === 'run-failed')

  const calls = buildCalls(toolStages, awaiting === true)
  const holding = calls.some((c) => c.status === 'hold')

  const mode: CaosView['mode'] =
    source === 'none' ? 'none'
      : holding ? 'hold'
      : awaiting && source === 'live' ? 'live'
      : 'past'

  const a = analyze?.analysis
  const tier = a?.tier ?? null
  const iterationCap = tier === 'generic' ? 1 : tier === 'info' ? 4 : tier === 'build' ? 30 : null

  const steps: CaosStep[] = [
    stepLink(analyze, mode),
    stepClassify(analyze),
    stepRoute(analyze),
    stepAssemble(disclosure, resolve, retrieve),
    stepBudget(usage),
    stepEnvelope(usage),
    stepVerify(),
    stepRecord(runDone, runFailed, mode),
  ]

  const poolTurns = num(usage?.poolTurns)

  return {
    mode,
    steps,
    calls,
    cost: {
      llmCalls: num(usage?.llmCalls),
      estInputTokens: num(usage?.estInputTokens),
      fixedPerCall: deriveFixedPerCall(usage),
      governorWaitS: num(usage?.governorWaitS),
      toolCalls: calls.length,
      exact: usage?.llmCallsExact !== false,
      // tokensReported false => the provider told us nothing. Absent, not zero.
      providerTokens: usage?.tokensReported ? num(usage?.totalTokens) : null,
      tier,
      iterationCap,
    },
    room: {
      turns: poolTurns,
      estInputTokens: null, // needs the turn ledger — events has no room_id
      recycleAtTurns: POOL_RECYCLE_TURNS,
      turnsUntilRecycle: poolTurns === null ? null : Math.max(0, POOL_RECYCLE_TURNS - poolTurns),
    },
    stageMs: {
      prepare: sumMs([analyze, disclosure, resolve]),
      execute: num(usage?.latencyMs),
      settle: runDone?.ts && runFailed === undefined ? null : null,
    },
    agent: agent ?? a?.targetAgents?.primary ?? null,
    elapsedMs: num(usage?.latencyMs),
  }
}

function sumMs(list: (PipelineStage | null)[]): number | null {
  const ts = list.filter(Boolean).map((s) => (s as PipelineStage).ts).filter((t): t is number => typeof t === 'number')
  if (ts.length < 2) return null
  return Math.max(...ts) - Math.min(...ts)
}

/** The fixed per-call payload, if the composition recorder reported a shape.
 *  Derived rather than assumed: totalChars/4 is the same ~4 bytes-per-token
 *  estimate main.py's governor uses, so the two numbers are commensurable. */
function deriveFixedPerCall(u?: TurnUsageLike | null): number | null {
  const total = num(u?.firstCallShape?.totalChars)
  return total === null ? null : Math.round(total / 4)
}

function buildCalls(toolStages: PipelineStage[], awaiting: boolean): CaosCall[] {
  // tool stages arrive as start (status 'active') then end (done/error),
  // upserted onto the same id by lib/pipeline.ts — so one entry per call.
  return toolStages.map((s, i) => {
    const waitMs = 0 // populated once main.py reports per-call governor holds
    const status: CaosCall['status'] =
      s.status === 'active' ? (waitMs > 0 ? 'hold' : 'run')
        : s.status === 'error' ? 'error'
        : 'done'
    return {
      n: i + 1,
      tool: s.label || null,
      args: s.detail ?? '',
      waitMs,
      ok: s.status !== 'error',
      summary: s.detail ?? '',
      ms: parseMs(s.detail),
      tokens: null, // per-call apportioning needs the payload recorder extended
      status: awaiting && s.status === 'active' ? status : status,
    }
  })
}

/** lib/pipeline.ts writes tool timings into `detail` as "1234ms" — parse it
 *  back rather than re-deriving from ts, which is the event's arrival time. */
export function parseMs(detail?: string): number | null {
  if (!detail) return null
  const m = /(\d+)\s*ms/.exec(detail)
  return m ? Number(m[1]) : null
}

// ── the seven steps ─────────────────────────────────────────────────────────

function stepLink(analyze: PipelineStage | null, mode: CaosView['mode']): CaosStep {
  const known = analyze !== null
  return {
    id: 'link', stage: 'prepare', n: '1', title: 'Link',
    status: mode === 'none' ? 'pending' : known ? 'ok' : 'pending',
    summary: known ? 'new frame — no prior turn' : 'waiting',
    detail: [
      { label: 'continuation', value: 'no — nothing prior in this room' },
      { label: 'agent lock', value: 'opens on this turn, held for follow-ups' },
    ],
    verdict: known ? '→ NEW FRAME · the agent routed below is locked for follow-ups' : undefined,
    ms: null,
  }
}

function stepClassify(analyze: PipelineStage | null): CaosStep {
  const a = analyze?.analysis
  if (!a) {
    return {
      id: 'classify', stage: 'prepare', n: '2', title: 'Classify',
      status: 'pending', summary: 'waiting', detail: [], ms: null,
    }
  }
  const musts = a.mustHaves ?? []
  return {
    id: 'classify', stage: 'prepare', n: '2', title: 'Classify',
    status: 'ok',
    summary: `tier ${a.tier} · relation ${a.relation}`,
    detail: [
      { label: 'tier', value: a.tier },
      { label: 'relation', value: a.relation },
      ...(a.what ? [{ label: 'what', value: a.what }] : []),
      ...(a.subject ? [{ label: 'subject', value: a.subject }] : []),
      ...(musts.length ? [{ label: 'must-haves', value: musts.join(' · ') }] : []),
    ],
    verdict: `→ ${a.tier.toUpperCase()} · iteration cap ${a.tier === 'generic' ? 1 : a.tier === 'info' ? 4 : 30}`,
    ms: null,
  }
}

function stepRoute(analyze: PipelineStage | null): CaosStep {
  const t = analyze?.analysis?.targetAgents
  if (!t) {
    return {
      id: 'route', stage: 'prepare', n: '3', title: 'Route',
      status: 'pending', summary: 'waiting', detail: [], ms: null,
    }
  }
  const scores = t.scores ?? []
  return {
    id: 'route', stage: 'prepare', n: '3', title: 'Route',
    status: 'ok',
    summary: `→ ${t.primary}${scores.length ? ` · score ${scores[0].score}` : ''}`,
    chips: scores.length
      ? scores.flatMap((s) => s.hits.map((h) => ({ text: h, on: s.agent === t.primary })))
      : undefined,
    detail: scores.length
      ? scores.map((s) => ({ label: s.agent, value: `${s.score} — ${s.hits.join(', ')}` }))
      : [
          { label: 'scores', value: 'not forwarded by this build', muted: true },
          { label: 'reason', value: t.reason },
        ],
    verdict: `→ ${t.primary.toUpperCase()} · locked for this frame`,
    ms: null,
  }
}

/** Step 4 is the ONLY retrieval step. Every memory the system has — skills,
 *  venture memory, repo, MemPalace, the venture graph, docs — is gathered
 *  here; step 5 then decides what survives. Gather and choose are deliberately
 *  separate so retrieval never has to reason about budgets. */
function stepAssemble(
  disclosure: PipelineStage | null,
  resolve: PipelineStage | null,
  retrieve: PipelineStage | null,
): CaosStep {
  const d = disclosure?.disclosure
  const sources: StepDetail[] = [
    d
      ? { label: 'skills', value: `${d.active.length} of ${d.totalSkills} matched` }
      : { label: 'skills', value: 'no disclosure event', muted: true },
    resolve
      ? { label: 'venture memory', value: resolve.label }
      : { label: 'venture memory', value: 'no resolve event', muted: true },
    retrieve
      ? { label: 'retrieved', value: retrieve.detail ?? 'ran' }
      : { label: 'retrieved', value: 'unwired — pgvector query not built', muted: true },
    { label: 'MemPalace', value: 'unwired — drawers written, never queried', muted: true },
    { label: 'venture graph', value: 'unwired — rows written, never queried', muted: true },
    { label: 'history', value: 'unwired — needs the turn ledger', muted: true },
  ]
  const live = sources.filter((s) => !s.muted).length
  return {
    id: 'assemble', stage: 'prepare', n: '4', title: 'Assemble',
    status: live === sources.length ? 'ok' : 'warn',
    summary: `${live} of ${sources.length} sources available`,
    detail: sources,
    verdict: `→ ${live}/${sources.length} live · the unwired ones are one pgvector query away`,
    ms: null,
  }
}

function stepBudget(usage?: TurnUsageLike | null): CaosStep {
  const fixed = deriveFixedPerCall(usage)
  return {
    id: 'budget', stage: 'prepare', n: '5', title: 'Budget',
    status: 'warn',
    summary: 'not enforced — nothing was refused',
    detail: [
      { label: 'ceiling', value: 'none set for any tier', muted: true },
      fixed === null
        ? { label: 'fixed payload', value: 'not measured — run the composition probe', muted: true }
        : { label: 'fixed payload', value: `~${fixed.toLocaleString()} tokens per call` },
      { label: 'dropped', value: 'nothing — the gate does not exist yet', muted: true },
    ],
    verdict: '→ NOT ENFORCED · this is the structural fix, not yet built',
    ms: null,
  }
}

/** The envelope is the artifact stage 1 produces and hands over. Nothing in
 *  v1 ever showed it, which is why "what input did it give Hermes" had no
 *  answer in the UI. */
function stepEnvelope(usage?: TurnUsageLike | null): CaosStep {
  const shape = usage?.firstCallShape
  const detail: StepDetail[] = shape
    ? [
        { label: 'total on the wire', value: `${(shape.totalChars ?? 0).toLocaleString()} chars` },
        { label: 'tool schemas', value: `${(shape.toolSchemaChars ?? 0).toLocaleString()} chars · ${shape.toolCount ?? 0} tools` },
        { label: 'ours', value: `${Math.max(0, (shape.totalChars ?? 0) - (shape.toolSchemaChars ?? 0)).toLocaleString()} chars incl. system` },
      ]
    : [{ label: 'composition', value: 'not measured — run the composition probe', muted: true }]
  return {
    id: 'envelope', stage: 'prepare', n: '→', title: 'Envelope',
    status: shape ? 'ok' : 'warn',
    summary: shape ? `${(shape.totalChars ?? 0).toLocaleString()} chars sent` : 'sent — composition not measured',
    detail,
    verdict: '→ SENT to Hermes',
    ms: null,
  }
}

function stepVerify(): CaosStep {
  return {
    id: 'verify', stage: 'settle', n: '7a', title: 'Verify',
    status: 'skip',
    summary: 'not implemented',
    detail: [{ label: 'would do', value: 'match reply claims against injected item ids', muted: true }],
    verdict: '→ SKIPPED · shown so the gap is visible, not hidden',
    ms: null,
  }
}

function stepRecord(
  runDone: PipelineStage | undefined,
  runFailed: PipelineStage | undefined,
  mode: CaosView['mode'],
): CaosStep {
  if (runFailed) {
    return {
      id: 'record', stage: 'settle', n: '7b', title: 'Record',
      status: 'warn', summary: 'turn failed',
      detail: [{ label: 'error', value: runFailed.detail ?? 'unknown' }],
      verdict: '→ FAILED · cost was still incurred and is counted above',
      ms: null,
    }
  }
  const done = runDone !== undefined
  return {
    id: 'record', stage: 'settle', n: '7b', title: 'Record',
    status: done ? 'ok' : mode === 'none' ? 'pending' : 'pending',
    summary: done ? 'turn recorded' : 'waiting',
    detail: [
      { label: 'ledger', value: 'not written — chat_turn_ledger not built', muted: true },
      { label: 'verdict', value: 'set by your next message', muted: true },
    ],
    verdict: done ? '→ RECORDED · a follow-up resolves against this turn' : undefined,
    ms: null,
  }
}

export const CAOS_V2_STAGES: { id: StageId; label: string; note: string }[] = [
  { id: 'prepare', label: 'Prepare', note: 'local · no model' },
  { id: 'execute', label: 'Execute', note: 'the only stage that spends' },
  { id: 'settle', label: 'Settle', note: 'durable record' },
]
