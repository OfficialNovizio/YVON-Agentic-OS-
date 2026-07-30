// SessionBar — persistent status strip below the page header (TS-017).
//
// Shows live agent activity across the session:
//   - Active agent + current thinking/tool call (prominent)
//   - Completed chips as compact badges
//   - Idle state when no agents are working
//
// Style B of the TS-017 live status feed — complements the inline StatusTimeline.
// Owner: mia · TS-017 WI-4
'use client'

import { type StatusChipData, StatusChip } from './StatusChip'
import { FLEET } from '@/lib/fleet'
import { Loader2 } from 'lucide-react'

interface SessionBarProps {
  /** Status chips from the current (or most recent) generation turn */
  chips: StatusChipData[]
  /** The agent being talked to (from the drill-down focus) */
  agentId?: string | null
  /** True while a generation is in progress */
  active: boolean
}

const FLEET_BY_ID = Object.fromEntries(FLEET.map((a) => [a.id, a]))

export function SessionBar({ chips, agentId, active }: SessionBarProps) {
  const agent = agentId ? FLEET_BY_ID[agentId] : undefined

  // Split into active (not done) and completed chips
  const activeChips = chips.filter((c) => !c.done && (c.kind === 'thinking' || c.kind === 'tool_call.start' || c.kind === 'notice'))
  const completedChips = chips.filter((c) => c.done || c.kind === 'tool_call.end')

  // Nothing happening — idle state
  if (!active && chips.length === 0) {
    return (
      <div className="flex h-9 items-center gap-2 border-b border-white/[0.06] px-4 text-[11px] text-on-surface-variant/50">
        <span className="text-[13px]">💤</span>
        <span>
          {agent ? `${agent.name} · idle` : 'Workforce · all agents idle'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-9 items-center gap-2 overflow-x-auto border-b border-white/[0.06] px-4 no-scrollbar">
      {/* Agent indicator */}
      {agent && (
        <div className="flex shrink-0 items-center gap-1.5 pr-2 text-[11px]">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: agent.color }}
          />
          <span className="font-semibold text-on-surface">{agent.name}</span>
          {active && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          )}
        </div>
      )}

      {/* Active chip (prominent) */}
      {activeChips.length > 0 && (
        <div className="shrink-0">
          <StatusChip chip={activeChips[activeChips.length - 1]} />
        </div>
      )}

      {/* Completed chips (compact) */}
      {completedChips.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-on-surface-variant/40">·</span>
          {completedChips.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-on-surface-variant/60"
            >
              <span className="text-emerald-400">✓</span>
              {c.toolName ?? 'step'}
            </span>
          ))}
        </div>
      )}

      {/* Idle pulse when generating but no chips yet */}
      {active && chips.length === 0 && (
        <div className="inline-flex items-center gap-1.5 text-[11px] text-on-surface-variant/60">
          <Loader2 className="h-3 w-3 animate-spin" />
          connecting…
        </div>
      )}
    </div>
  )
}

