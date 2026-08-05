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
  kind: 'classify' | 'resolve' | 'retrieve' | 'tool' | 'gate' | 'loop' | 'run'
  label: string
  detail?: string
  status: 'active' | 'done' | 'error' | 'pending'
  /** event timestamp (ms) — enables real per-stage timings in the HUD */
  ts?: number
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
      }
    case 'tool_call.end':
      return {
        id: `tool-${ev.toolName ?? '?'}`,
        kind: 'tool',
        label: ev.toolName ?? 'tool',
        detail: ev.summary ? ev.summary.slice(0, 120) : undefined,
        status: ev.ok ? 'done' : 'error',
      }
    case 'thinking':
      return { id: 'thinking', kind: 'run', label: 'thinking', status: 'active' }
    case 'notice':
      return {
        id: `notice-${(ev.message ?? '').slice(0, 24)}`,
        kind: 'run',
        label: (ev.message ?? 'notice').slice(0, 80),
        status: 'active',
      }
    case 'error':
      return {
        id: 'error',
        kind: 'run',
        label: 'failed',
        detail: ev.message ?? undefined,
        status: 'error',
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
      return { id: 'gate', kind: 'gate', label: 'gate passed', detail: payload.gate ? String(payload.gate) : undefined, status: 'done', ts }
    case 'gate.blocked':
      return {
        id: 'gate-blocked',
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
    default:
      return null
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
