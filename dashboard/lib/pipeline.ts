// Pipeline panel normalizer — YVON-CHAT §5.3.
// One renderer, two sources: live SSE events (in-flight turn) and events-table
// rows (any past turn). Both normalize into the same PipelineStage[] shape.
//
// Owner: mia · TS-018 WI-5
import type { TurnEvent } from '@/app/api/chat/events/route'

/** Structural subset of HermesEvent — accepts the page's parsed SSE objects too. */
export type SseLike = {
  kind: string
  toolName?: string
  argsPreview?: string
  ok?: boolean
  summary?: string
  message?: string
  level?: string
}

export interface PipelineStage {
  id: string
  kind: 'analyze' | 'context' | 'classify' | 'resolve' | 'retrieve' | 'tool' | 'gate' | 'loop' | 'run' | 'record'
  label: string
  detail?: string
  status: 'active' | 'done' | 'error' | 'pending'
  /** event timestamp (ms) — enables real per-stage timings in the HUD */
  ts?: number
  /** Structured input-analysis payload (TS-030) — carried on the 'analyze'
   * stage so the HUD renders tier/relation/fields/must-haves/routing as UI
   * (chips, checklist, agent plan), not flattened text. Absent for old rows. */
  analysis?: InputAnalysisStage
}

/** The InputAnalysis shape the pipeline panel cares about — mirrors
 * pipelines/input-analysis/types.ts (InputAnalysis) minus pipeline internals. */
export interface InputAnalysisStage {
  tier: 'generic' | 'info' | 'build'
  relation: 'venture' | 'general'
  what?: string
  type?: string
  subject?: string
  scope?: string
  expected?: string
  format?: string
  why?: string
  how?: string
  endResult?: string
  desiredOutput?: string
  /** The MUST-HAVE checklist — defines "done"; rendered as a checklist. */
  mustHaves?: string[]
  /** The agent routing plan — primary agent + team, rendered as chips. */
  targetAgents?: { primary: string; team: string[]; reason: string }
}

// ── Live source: SSE events (token/thinking/tool_call.*/notice) ────────────
export function stageFromSseEvent(ev: SseLike): PipelineStage | null {
  switch (ev.kind) {
    case 'tool_call.start':
      return {
        id: `tool-${ev.toolName ?? '?'}`,
        kind: 'tool',
        label: ev.toolName ?? 'tool',
        detail: ev.argsPreview ? ev.argsPreview.slice(0, 120) : undefined,
        status: 'active',
        ts: Date.now(),
      }
    case 'tool_call.end':
      return {
        id: `tool-${ev.toolName ?? '?'}`,
        kind: 'tool',
        label: ev.toolName ?? 'tool',
        detail: ev.summary ? ev.summary.slice(0, 120) : undefined,
        status: ev.ok ? 'done' : 'error',
        ts: Date.now(),
      }
    case 'thinking':
      return { id: 'thinking', kind: 'run', label: 'thinking', status: 'active', ts: Date.now() }
    case 'notice':
      return {
        id: `notice-${(ev.message ?? '').slice(0, 24)}`,
        kind: 'run',
        label: (ev.message ?? 'notice').slice(0, 80),
        status: 'active',
        ts: Date.now(),
      }
    case 'error':
      return {
        id: 'error',
        kind: 'run',
        label: 'failed',
        detail: ev.message ?? undefined,
        status: 'error',
        ts: Date.now(),
      }
    default:
      return null
  }
}

// ── Past source: events-table rows (phase.*, tool.call, gate.*, loop.*) ────
export function stageFromEventRow(row: TurnEvent): PipelineStage | null {
  const { kind, payload } = row
  const ts = new Date(row.ts).getTime() || undefined
  switch (kind) {
    case 'phase.classify':
      return {
        id: 'classify',
        kind: 'classify',
        label: 'classify',
        detail: payload.intent ? `intent → ${String(payload.intent).slice(0, 80)}` : undefined,
        status: 'done',
        ts,
      }
    case 'phase.resolve':
      return {
        id: 'resolve',
        kind: 'resolve',
        label: 'resolve',
        detail: payload.targets
          ? `targets → ${Array.isArray(payload.targets) ? (payload.targets as string[]).join(', ') : String(payload.targets)}`
          : undefined,
        status: 'done',
        ts,
      }
    case 'phase.retrieve':
      return {
        id: 'retrieve',
        kind: 'retrieve',
        label: 'retrieve',
        detail:
          payload.count != null
            ? `${String(payload.count)} chunks${payload.sources ? ` · ${String(payload.sources)}` : ''}`
            : undefined,
        status: 'done',
        ts,
      }
    case 'tool.call':
      return {
        id: `tool-${String(payload.tool ?? '')}-${row.ts}`,
        kind: 'tool',
        label: String(payload.tool ?? 'tool'),
        detail:
          payload.ms != null
            ? `${String(payload.ms)}ms${payload.ok === false ? ' · failed' : ''}`
            : payload.status === 'start'
              ? 'started'
              : undefined,
        status: payload.ok === false ? 'error' : payload.status === 'start' ? 'active' : 'done',
        ts,
      }
    case 'gate.passed':
      // id keyed by which gate (payload.gate), not a flat 'gate' — otherwise every
      // gate in the 5-gate sequence overwrites the previous one and only the last
      // survives to render (CAOS restructure, 2026-08-11). Reserved/not emitted by
      // hermes-agent yet (docs/YVON-CHAT.md §Phase observability) — this just makes
      // the UI forward-compatible for whenever it is.
      return { id: `gate-${payload.gate ? String(payload.gate) : 'unknown'}`, kind: 'gate', label: 'gate passed', detail: payload.gate ? String(payload.gate) : undefined, status: 'done', ts }
    case 'gate.blocked':
      return {
        id: `gate-${payload.gate ? String(payload.gate) : 'unknown'}`,
        kind: 'gate',
        label: `gate blocked${payload.gate ? ` · ${String(payload.gate)}` : ''}`,
        detail: payload.reason ? String(payload.reason) : undefined,
        status: 'error',
        ts,
      }
    case 'loop.iteration':
      return {
        id: `loop-${row.ts}`,
        kind: 'loop',
        label: `retry #${String(payload.n ?? '?')}`,
        detail: payload.why ? String(payload.why).slice(0, 120) : undefined,
        status: 'active',
        ts,
      }
    case 'run.completed':
      return { id: 'run-done', kind: 'run', label: 'completed', status: 'done', ts }
    case 'run.failed':
      return { id: 'run-failed', kind: 'run', label: 'failed', detail: payload.error ? String(payload.error).slice(0, 120) : undefined, status: 'error', ts }
    case 'input.analysis':
      return stageFromInputAnalysisPayload(payload, ts)
    default:
      return null
  }
}

/** Build the analyze stage from a persisted input.analysis payload (TS-030).
 * Shared shape with page.tsx's live handler: same id, same label, same detail
 * lines, plus the structured `analysis` payload for the HUD flow. */
export function stageFromInputAnalysisPayload(
  payload: Record<string, unknown>,
  ts?: number,
): PipelineStage | null {
  const rawTier = String(payload.tier ?? '')
  const tierKey = (rawTier === 'build' || rawTier === 'generic' ? rawTier : 'info') as InputAnalysisStage['tier']
  const relation = (String(payload.relation ?? 'venture') === 'general' ? 'general' : 'venture') as InputAnalysisStage['relation']
  const fields =
    tierKey === 'info'
      ? ([['type', payload.type], ['subject', payload.subject], ['scope', payload.scope], ['expected', payload.expected], ['format', payload.format]] as const)
      : ([['what', payload.what], ['why', payload.why], ['how', payload.how], ['end result', payload.endResult], ['desired output', payload.desiredOutput]] as const)
  const lines = fields
    .filter(([, v]) => v && String(v) !== 'not specified')
    .map(([k, v]) => `${k}: ${String(v)}`)
  const str = (v: unknown) => (v == null ? undefined : String(v))
  return {
    id: 'input-analysis',
    kind: 'analyze',
    label: `input analysis · ${tierKey} · ${relation}`,
    detail: lines.join('\n') || 'not specified',
    status: 'done',
    ts,
    analysis: {
      tier: tierKey,
      relation,
      what: str(payload.what),
      type: str(payload.type),
      subject: str(payload.subject),
      scope: str(payload.scope),
      expected: str(payload.expected),
      format: str(payload.format),
      why: str(payload.why),
      how: str(payload.how),
      endResult: str(payload.endResult),
      desiredOutput: str(payload.desiredOutput),
      mustHaves: Array.isArray(payload.mustHaves) ? (payload.mustHaves as string[]) : undefined,
      targetAgents:
        payload.targetAgents && typeof payload.targetAgents === 'object'
          ? (payload.targetAgents as InputAnalysisStage['targetAgents'])
          : undefined,
    },
  }
}

/** Merge live stages into the panel list: same tool id → latest status wins. */
export function upsertStage(stages: PipelineStage[], next: PipelineStage): PipelineStage[] {
  const idx = stages.findIndex((s) => s.id === next.id)
  if (idx === -1) return [...stages, next]
  const copy = [...stages]
  copy[idx] = next
  return copy
}

/** The pipeline panel view — consumed by the page and the fixed CAOS card. */
export interface PipelineView {
  stages: PipelineStage[]
  /** 'live' = in-flight turn from SSE · 'past' = completed turn from events */
  source: 'live' | 'past' | 'none'
}
