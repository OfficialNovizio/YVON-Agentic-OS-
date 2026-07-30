// MessageStream — the center pane of /chat.
// Renders messages chronologically, auto-scrolls to bottom on new messages.
// Owner: mia · TS-009 Push C2
'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { FLEET } from '@/lib/fleet'
import type { ChatMessage } from '@/app/api/chat/messages/route'

const FLEET_BY_ID = Object.fromEntries(FLEET.map((a) => [a.id, a]))

// Safe timestamp render — Safari throws "SyntaxError: The string did not match
// the expected pattern." from Intl.DateTimeFormat when passed Invalid Date.
// Returns empty string for anything malformed instead of crashing the row.
function safeTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  try {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// Color for user avatars (deterministic hash from author id).
function userColor(id: string): string {
  const palette = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6']
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return palette[Math.abs(h) % palette.length]
}

interface MessageStreamProps {
  messages: ChatMessage[]
  awaitingReply: boolean
  emptyLabel?: string
}

export function MessageStream({ messages, awaitingReply, emptyLabel }: MessageStreamProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, awaitingReply])

  if (messages.length === 0 && !awaitingReply) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-[13px] text-on-surface-variant/60">
          {emptyLabel ?? 'No messages yet. Start the conversation below.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
      <ul className="space-y-4">
        {messages.map((m) => (
          <MessageRow key={m.id} m={m} />
        ))}
        {awaitingReply && (
          <li className="flex items-center gap-2 pl-11 text-[12px] text-on-surface-variant/70">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            agent is typing…
          </li>
        )}
      </ul>
      <div ref={endRef} />
    </div>
  )
}

function MessageRow({ m }: { m: ChatMessage }) {
  const isAgent = m.authorKind === 'agent'
  const agent = isAgent ? FLEET_BY_ID[m.authorId] : undefined
  const color = agent?.color ?? userColor(m.authorId)
  const initial = (agent?.name ?? m.authorName).slice(0, 1).toUpperCase()

  return (
    <li className="flex items-start gap-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#06121f]"
        style={{ background: color }}
        title={agent?.role ?? undefined}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-on-surface">
            {agent?.name ?? m.authorName}
          </span>
          {isAgent && agent && (
            <span className="text-[11px] text-on-surface-variant/70">{agent.role}</span>
          )}
          <span className="text-[11px] text-on-surface-variant/50">{safeTime(m.createdAt)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-on-surface">
          {m.content}
        </p>
        {m.mentions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-on-surface-variant/60">
            {m.mentions.map((h) => (
              <span key={h} className="rounded-full bg-white/[0.04] px-1.5 py-0.5">
                @{h}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  )
}
