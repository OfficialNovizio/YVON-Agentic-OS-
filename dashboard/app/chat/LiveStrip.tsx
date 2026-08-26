// LiveStrip — the floating status pill above the composer (Adora).
//
// Real data only: the focused agent, the CAOS phase derived from SSE/events,
// and the live thinking text from the most recent thinking/notice chip. When
// nothing is in flight the pill disappears entirely rather than sitting there
// saying "idle" — a quiet surface is the idle state.
//
// The stroke on the left is the same painted sweep the streaming message card
// uses, so "generating" reads as one continuous idea across the page.
'use client'

import { FLEET } from '@/lib/fleet'
import { AgentAvatar } from './AgentAvatar'

interface LiveStripProps {
  agentId: string | null
  active: boolean
  phase: string | null
  thinking: string | null
}

export function LiveStrip({ agentId, active, phase, thinking }: LiveStripProps) {
  if (!active) return null

  const agent = agentId ? FLEET.find((a) => a.id === agentId) : undefined
  const tint = agent?.color ?? '#592eff'

  return (
    <div className="relative z-10 px-4 pb-2 sm:px-8">
      <div className="adora-rise mx-auto flex w-full max-w-[780px] items-center gap-3 overflow-hidden rounded-[200px] border border-[var(--chat-hairline)] bg-white py-1.5 pl-1.5 pr-4">
        {agent ? (
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-30"
              style={{ background: tint }}
            />
            <AgentAvatar id={agent.id} name={agent.name} size={32} />
          </span>
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center">
            <span className="flex items-center gap-[3px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: ['#2ed6ff', '#592eff', '#f843c2'][i],
                    animation: `chat-breathe 1.2s ease-in-out ${i * 0.16}s infinite`,
                  }}
                />
              ))}
            </span>
          </span>
        )}

        <span className="shrink-0 text-[13px] font-semibold text-[var(--chat-text)]">
          {agent?.name ?? 'Workforce'}
        </span>

        <span className="min-w-0 flex-1 truncate text-[12.5px] italic text-[var(--chat-text-dim)]">
          {thinking ? (
            thinking
          ) : (
            <>
              thinking<span className="chat-ellipsis" />
            </>
          )}
        </span>

        {phase && (
          <span
            className="adora-tag chat-breathe shrink-0"
            style={{ color: 'var(--chat-accent)' }}
          >
            {phase}
          </span>
        )}
      </div>
    </div>
  )
}
