// StatusChip — animated status chip for live agent activity (TS-017).
//
// States:
//   thinking        → pulsing dots + elapsed time counter
//   tool_call.start → pulsing tool name badge
//   tool_call.end   → green checkmark + tool name + summary
//   notice          → info icon + message
//
// Used by both StatusTimeline (inline, per-turn) and SessionBar (persistent).
// Owner: mia · TS-017 WI-3
'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Info, Loader2 } from 'lucide-react'

export type StatusChipKind =
  | 'thinking'
  | 'tool_call.start'
  | 'tool_call.end'
  | 'tool_call.error'
  | 'notice'

export interface StatusChipData {
  id: string
  kind: StatusChipKind
  toolName?: string
  argsPreview?: string
  summary?: string
  message?: string
  level?: string
  /** Timestamp (ms) when this status event was emitted — used for elapsed counter */
  ts: number
  /** Set when the chip's activity has completed (solidify, stop pulsing) */
  done?: boolean
}

interface StatusChipProps {
  chip: StatusChipData
}

/** Elapsed time since `ts` in seconds, updating every 250ms while active. */
function useElapsed(ts: number, active: boolean): number {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - ts) / 1000))
  useEffect(() => {
    if (!active) return
    setElapsed(Math.floor((Date.now() - ts) / 1000))
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - ts) / 1000)), 250)
    return () => clearInterval(id)
  }, [ts, active])
  return elapsed
}

export function StatusChip({ chip }: StatusChipProps) {
  const elapsed = useElapsed(chip.ts, chip.kind === 'thinking' || (chip.kind === 'tool_call.start' && !chip.done))
  const isActive = !chip.done && (chip.kind === 'thinking' || chip.kind === 'tool_call.start' || chip.kind === 'notice')

  switch (chip.kind) {
    case 'thinking':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-2.5 py-1 text-[11px] text-indigo-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
          </span>
          <span className="font-medium">thinking</span>
          <span className="tabular-nums text-indigo-400/70">{elapsed}s</span>
        </div>
      )

    case 'tool_call.start': {
      const preview = chip.argsPreview
        ? chip.argsPreview.length > 40
          ? chip.argsPreview.slice(0, 40) + '…'
          : chip.argsPreview
        : null
      return (
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${
            chip.done
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-sky-500/15 text-sky-300 animate-pulse'
          }`}
        >
          {chip.done ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Loader2 className="h-3 w-3 animate-spin text-sky-400" />
          )}
          <span className="font-mono font-medium">{chip.toolName ?? 'tool'}</span>
          {preview && (
            <span className="max-w-[120px] truncate text-[10px] opacity-70">{preview}</span>
          )}
          {!chip.done && <span className="tabular-nums text-sky-400/70">{elapsed}s</span>}
        </div>
      )
    }

    case 'tool_call.end':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-300">
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="font-mono font-medium">{chip.toolName ?? 'tool'}</span>
          {chip.summary && (
            <span className="max-w-[160px] truncate text-[10px] opacity-70">
              {chip.summary.length > 60 ? chip.summary.slice(0, 60) + '…' : chip.summary}
            </span>
          )}
        </div>
      )

    case 'tool_call.error':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] text-red-300">
          <span className="font-mono font-medium">{chip.toolName ?? 'tool'}</span>
          <span className="text-[10px] opacity-70">failed</span>
        </div>
      )

    case 'notice':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-on-surface-variant/80">
          <Info className="h-3 w-3" />
          <span>{chip.message ?? ''}</span>
        </div>
      )

    default:
      return null
  }
}
