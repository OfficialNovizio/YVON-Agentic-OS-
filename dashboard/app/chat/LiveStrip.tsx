// LiveStrip — compact frosted strip above the composer (TS-020).
// Real data only: the active agent (from focus), the current phase (from the
// pipeline state derived from SSE/events), the live thinking text (from the
// most recent thinking/notice chip). Idle → quiet "idle" state. Expand chevron
// toggles the full pipeline HUD.
'use client'

import { Loader2 } from 'lucide-react'
import { FLEET } from '@/lib/fleet'
import { AgentAvatar } from './AgentAvatar'

interface LiveStripProps {
  agentId: string | null
  active: boolean
  phase: string | null
  thinking: string | null
}

export function LiveStrip({ agentId, active, phase, thinking }: LiveStripProps) {
  const agent = agentId ? FLEET.find((a) => a.id === agentId) : undefined

  if (!active) {
    return (
      <div className="mx-6 mb-2 flex h-8 items-center gap-2 px-3">
        <span className="text-[11px] text-[var(--chat-text-faint)]">
          {agent ? `${agent.name} · idle` : 'Workforce · all agents idle'}
        </span>
      </div>
    )
  }

  return (
    <div className="chat-glass-soft mx-6 mb-2 flex h-9 items-center gap-2.5 px-3">
      {agent ? (
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
            style={{ background: agent.color }}
          />
          <AgentAvatar id={agent.id} name={agent.name} size={24} />
        </span>
      ) : (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--chat-text-dim)]" />
      )}
      <span className="shrink-0 text-[11.5px] font-semibold text-[var(--chat-text)]">
        {agent?.name ?? 'agents'}
      </span>
      <span className="min-w-0 flex-1 truncate text-[11px] italic text-[var(--chat-text-dim)]">
        {thinking ? (
          thinking
        ) : (
          <>
            thinking<span className="chat-ellipsis" />
          </>
        )}
      </span>
      {phase && (
        <span className="chat-breathe shrink-0 rounded-full border border-[var(--chat-accent)]/40 bg-[var(--chat-accent)]/10 px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-[var(--chat-accent)]">
          {phase}
        </span>
      )}
    </div>
  )
}
