// MessageStream — the conversation thread (TS-020).
// Hierarchy: date divider → user bubble (right) → agent message (avatar,
// name/role, rendered markdown) → command cards (system). A streaming bubble
// renders live token text with a blinking cursor while awaiting a reply.
'use client'

import { useEffect, useRef } from 'react'
import { Loader2, ChevronUp } from 'lucide-react'
import { FLEET } from '@/lib/fleet'
import { AgentAvatar } from './AgentAvatar'
import type { ChatMessage } from '@/app/api/chat/messages/route'
import { Markdown } from './Markdown'
import { CommandCard } from './CommandCard'

const FLEET_BY_ID = Object.fromEntries(FLEET.map((a) => [a.id, a]))

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

function dayLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((start(now) - start(d)) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  try {
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

interface MessageStreamProps {
  messages: ChatMessage[]
  awaitingReply: boolean
  /** live streaming text from SSE tokens (null when not streaming) */
  streamingText: string | null
  emptyLabel?: string
  /** real history pagination (TS-021): true when a full page loaded */
  hasEarlier?: boolean
  loadingEarlier?: boolean
  onLoadEarlier?: () => void
}

export function MessageStream({
  messages,
  awaitingReply,
  streamingText,
  emptyLabel,
  hasEarlier,
  loadingEarlier,
  onLoadEarlier,
}: MessageStreamProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, awaitingReply, streamingText])

  if (messages.length === 0 && !awaitingReply) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-[13px] text-[var(--chat-text-faint)]">
          {emptyLabel ?? 'No messages yet. Start the conversation below.'}
        </p>
      </div>
    )
  }

  const rows: React.ReactNode[] = []
  let lastDay = ''

  for (const m of messages) {
    const day = dayLabel(m.createdAt)
    if (day && day !== lastDay) {
      lastDay = day
      rows.push(
        <li key={`day-${day}`} className="my-4 flex items-center gap-3 px-4">
          <span className="h-px flex-1 bg-[var(--chat-hairline-soft)]" />
          <span className="text-[9.5px] font-semibold uppercase tracking-widest text-[var(--chat-text-faint)]">
            {day}
          </span>
          <span className="h-px flex-1 bg-[var(--chat-hairline-soft)]" />
        </li>,
      )
    }
    rows.push(<MessageRow key={m.id} m={m} />)
  }

  return (
    <div className="chat-scroll flex-1 overflow-y-auto px-6 py-4">
      <ul className="mx-auto flex max-w-[860px] flex-col space-y-3">
        {hasEarlier && (
          <li className="flex justify-center py-1">
            <button
              onClick={onLoadEarlier}
              disabled={loadingEarlier}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chat-hairline-soft)] bg-white/[0.03] px-3 py-1 text-[10.5px] text-[var(--chat-text-dim)] transition hover:bg-white/[0.06] hover:text-[var(--chat-text)] disabled:opacity-50"
            >
              {loadingEarlier ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
              {loadingEarlier ? 'Loading…' : 'Load earlier messages'}
            </button>
          </li>
        )}
        {rows}
        {streamingText != null && (
          <li>
            <AgentBubble
              agentName="agent"
              agentId=""
              time={new Date().toISOString()}
              streaming={streamingText}
            />
          </li>
        )}
        {awaitingReply && streamingText == null && (
          <li className="flex items-center gap-2 pl-12 text-[12px] text-[var(--chat-text-faint)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            agent is working…
          </li>
        )}
      </ul>
      <div ref={endRef} />
    </div>
  )
}

function MessageRow({ m }: { m: ChatMessage }) {
  if (m.authorKind === 'system') {
    return (
      <li className="flex justify-center">
        <CommandCard content={m.content} createdAt={safeTime(m.createdAt)} />
      </li>
    )
  }
  if (m.authorKind === 'user') {
    return (
      <li className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-md bg-[var(--chat-accent)]/15 border border-[var(--chat-accent)]/25 px-3.5 py-2">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--chat-text)]">{m.content}</p>
          <p className="mt-0.5 text-right text-[9px] text-[var(--chat-text-faint)]">{safeTime(m.createdAt)}</p>
        </div>
      </li>
    )
  }
  return (
    <li>
      <AgentBubble agentId={m.authorId} agentName={m.authorName} time={safeTime(m.createdAt)} content={m.content} />
    </li>
  )
}

function AgentBubble({
  agentId,
  agentName,
  time,
  content,
  streaming,
}: {
  agentId: string
  agentName: string
  time: string
  content?: string
  streaming?: string
}) {
  const agent = agentId ? FLEET_BY_ID[agentId] : undefined
  const name = agent?.name ?? agentName

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5">
        <AgentAvatar id={agentId || 'agent'} name={name} size={32} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[12px] font-semibold text-[var(--chat-text)]">{name}</span>
          {agent ? (
            <>
              {agent.role && (
                <span className="truncate text-[10.5px] text-[var(--chat-text-faint)]">{agent.role}</span>
              )}
              <span
                className="rounded-full border border-[var(--chat-hairline-soft)] px-1.5 py-px text-[8.5px] font-medium uppercase tracking-widest"
                style={{ color: agent.color }}
              >
                {agent.department}
              </span>
            </>
          ) : (
            <span className="rounded-full border border-[var(--chat-hairline-soft)] px-1.5 py-px text-[8.5px] uppercase tracking-widest text-[var(--chat-text-faint)]">
              unassigned
            </span>
          )}
          <span className="text-[9.5px] text-[var(--chat-text-faint)]">{time}</span>
        </div>
        <div className="mt-1">
          {streaming != null ? (
            <div className="chat-shimmer rounded-xl px-3 py-2">
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--chat-text)]">
                {streaming}
                <span className="chat-cursor" />
              </p>
            </div>
          ) : (
            <div className="rounded-xl px-3 py-2">
              {content ? (
                <Markdown text={content} />
              ) : (
                <p className="text-[12px] text-[var(--chat-text-faint)]">(no content)</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
