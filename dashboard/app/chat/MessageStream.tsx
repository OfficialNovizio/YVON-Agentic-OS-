// MessageStream — the conversation thread, rendered as a gallery wall.
//
// Redesigned 2026-08-17 (Adora). Hierarchy: date plaque → user message as a
// filled violet bubble → agent message as a white gallery card with the
// avatar hung off its top-left edge → command cards (system). A streaming
// card carries a painted stroke along its top edge and a violet caret.
//
// Interaction upgrades over the old build:
//   · Smart autoscroll — it only follows the stream while you're already at
//     the bottom. Scroll up to read and the thread stops yanking you down; a
//     "jump to latest" pill appears instead, with a live count.
//   · Per-message copy, revealed on hover/focus (keyboard reachable).
//   · An empty state that's an actual invitation: the live workforce orb, a
//     display heading with a hand-drawn squiggle, and real starter prompts
//     that load straight into the composer.
//   · Consecutive messages from one agent group under a single header.
'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Loader2, ChevronUp, Copy, Check, ArrowDown, CornerDownRight } from 'lucide-react'
import { FLEET } from '@/lib/fleet'
import { AgentAvatar } from './AgentAvatar'
import type { ChatMessage, ChatMessageAttachment } from '@/app/api/chat/messages/route'
import { Markdown } from './Markdown'
import { CommandCard } from './CommandCard'
import { Squiggle, WorkforceOrb } from './Atelier'
import { AttachmentCard } from './AttachmentCard'

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
  // ── Adora empty state ────────────────────────────────────────────────
  /** display heading for the empty state, e.g. "Put the workforce" */
  emptyTitle?: string
  /** the 1–2 words that get the hand-drawn squiggle */
  emptyHighlight?: string
  /** real starter prompts — clicking one loads it into the composer */
  starters?: string[]
  onStarter?: (text: string) => void
  /** real per-agent status, for the orb */
  agentLive?: Record<string, string>
}

export function MessageStream({
  messages,
  awaitingReply,
  streamingText,
  emptyLabel,
  hasEarlier,
  loadingEarlier,
  onLoadEarlier,
  emptyTitle,
  emptyHighlight,
  starters,
  onStarter,
  agentLive,
}: MessageStreamProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const [pinned, setPinned] = useState(true)
  const [unseen, setUnseen] = useState(0)
  const lastCount = useRef(messages.length)

  // Follow the stream only while the reader is already at the bottom.
  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setPinned(atBottom)
    if (atBottom) setUnseen(0)
  }, [])

  const jump = useCallback((behavior: ScrollBehavior = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior, block: 'end' })
    setPinned(true)
    setUnseen(0)
  }, [])

  useLayoutEffect(() => {
    const grew = messages.length > lastCount.current
    lastCount.current = messages.length
    if (pinned) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else if (grew) {
      setUnseen((n) => n + 1)
    }
  }, [messages.length, pinned])

  useEffect(() => {
    if (pinned && (streamingText != null || awaitingReply)) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [streamingText, awaitingReply, pinned])

  // Gallery-wall entrance — new rows rise + settle with a small stagger.
  // Only rows not yet animated get touched, so re-renders (streaming text
  // ticking in, autoscroll) never replay it. Skipped under reduced-motion.
  const animatedIds = useRef<Set<string>>(new Set())
  useLayoutEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const fresh = Array.from(root.querySelectorAll<HTMLElement>('li[data-mid]')).filter(
      (el) => !animatedIds.current.has(el.dataset.mid ?? ''),
    )
    if (fresh.length === 0) return
    fresh.forEach((el) => animatedIds.current.add(el.dataset.mid ?? ''))
    if (reduced) {
      gsap.set(fresh, { opacity: 1, y: 0, scale: 1 })
      return
    }
    gsap.fromTo(
      fresh,
      { opacity: 0, y: 14, scale: 0.985 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.44,
        ease: 'power3.out',
        stagger: 0.05,
        clearProps: 'transform',
      },
    )
  }, [messages.length])

  // ── Empty state — the invitation ───────────────────────────────────────
  if (messages.length === 0 && !awaitingReply) {
    return (
      <div className="chat-scroll relative flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <div className="flex max-w-[620px] flex-col items-center text-center">
          <WorkforceOrb size={186} live={agentLive ?? {}} className="mb-7 opacity-95" />

          <h2 className="adora-display text-[34px] leading-[1.1] sm:text-[42px]">
            {emptyTitle ?? 'Put the workforce'}{' '}
            <Squiggle>{emptyHighlight ?? 'to work'}</Squiggle>
          </h2>

          <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-[var(--chat-text-dim)]">
            {emptyLabel ?? 'No messages yet. Start the conversation below.'}
          </p>

          {starters && starters.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {starters.map((s, i) => (
                <button
                  key={s}
                  onClick={() => onStarter?.(s)}
                  className="adora-rise group inline-flex items-center gap-2 rounded-[200px] border border-[var(--chat-hairline)] bg-white px-4 py-2 text-left text-[13.5px] text-[var(--chat-body)] transition hover:border-[rgba(89,46,255,0.4)] hover:text-[var(--chat-accent)]"
                  style={{ animationDelay: `${120 + i * 70}ms` }}
                >
                  <CornerDownRight className="h-3.5 w-3.5 text-[var(--chat-text-faint)] transition group-hover:text-[var(--chat-accent)]" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const rows: React.ReactNode[] = []
  let lastDay = ''

  messages.forEach((m, i) => {
    const day = dayLabel(m.createdAt)
    if (day && day !== lastDay) {
      lastDay = day
      rows.push(
        <li key={`day-${day}`} className="my-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-[var(--chat-hairline)]" />
          <span className="rounded-[200px] border border-[var(--chat-hairline)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-dim)]">
            {day}
          </span>
          <span className="h-px flex-1 bg-[var(--chat-hairline)]" />
        </li>,
      )
    }
    // Consecutive messages from the same agent lose the repeated header.
    const prev = messages[i - 1]
    const grouped =
      m.authorKind === 'agent' &&
      prev?.authorKind === 'agent' &&
      prev.authorId === m.authorId &&
      new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 4 * 60_000
    rows.push(<MessageRow key={m.id} m={m} grouped={grouped} />)
  })

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="chat-scroll h-full overflow-y-auto px-4 py-6 sm:px-8"
      >
        <ul className="mx-auto flex w-full max-w-[780px] flex-col gap-4">
          {hasEarlier && (
            <li className="flex justify-center pb-2">
              <button
                onClick={onLoadEarlier}
                disabled={loadingEarlier}
                className="inline-flex items-center gap-2 rounded-[200px] border border-[var(--chat-hairline)] bg-white px-4 py-1.5 text-[12px] text-[var(--chat-text-dim)] transition hover:border-[rgba(89,46,255,0.35)] hover:text-[var(--chat-accent)] disabled:opacity-50"
              >
                {loadingEarlier ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
                {loadingEarlier ? 'Loading…' : 'Load earlier messages'}
              </button>
            </li>
          )}

          {rows}

          {streamingText != null && (
            <li>
              <AgentCard
                agentName="agent"
                agentId=""
                time={safeTime(new Date().toISOString())}
                streaming={streamingText}
              />
            </li>
          )}

          {awaitingReply && streamingText == null && <ThinkingCard />}
        </ul>
        <div ref={endRef} className="h-1" />
      </div>

      {/* Jump to latest — only when you've scrolled away from the stream. */}
      {!pinned && (
        <button
          onClick={() => jump()}
          className="adora-rise absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-[200px] border border-[var(--chat-hairline)] bg-white px-4 py-2 text-[12.5px] font-medium text-[var(--chat-text)] shadow-[0_14px_34px_-22px_rgba(33,22,76,0.6)] transition hover:border-[rgba(89,46,255,0.4)]"
        >
          <ArrowDown className="h-3.5 w-3.5 text-[var(--chat-accent)]" />
          {unseen > 0 ? `${unseen} new message${unseen > 1 ? 's' : ''}` : 'Jump to latest'}
        </button>
      )}
    </div>
  )
}

// ── Rows ────────────────────────────────────────────────────────────────────
function MessageRow({ m, grouped }: { m: ChatMessage; grouped: boolean }) {
  if (m.authorKind === 'system') {
    return (
      <li data-mid={m.id} className="flex justify-center">
        <CommandCard content={m.content} createdAt={safeTime(m.createdAt)} />
      </li>
    )
  }
  if (m.authorKind === 'user') {
    // Bug found 2026-08-20 (feedback: "why image i attach won't show with
    // message"): the upload → chat_attachments row → GET /api/chat/messages
    // join → ChatMessage.attachments path all worked; AttachmentCard existed
    // to render them; nothing in this component ever called it. Attachments
    // were saved and fetched, then silently dropped on the floor at the last
    // render step. Wired in here (and in AgentCard below, for symmetry).
    const hasAttachments = !!m.attachments && m.attachments.length > 0
    return (
      <li data-mid={m.id} className="flex flex-col items-end gap-1">
        {hasAttachments && (
          <div className="flex max-w-[76%] flex-wrap justify-end gap-2">
            {m.attachments!.map((a) => (
              <AttachmentCard key={a.id} {...a} />
            ))}
          </div>
        )}
        {m.content && (
          <div className="chat-user-bubble max-w-[76%] px-4 py-2.5">
            <p className="whitespace-pre-wrap text-[14.5px] leading-[1.55]">{m.content}</p>
          </div>
        )}
        <span className="pr-1 text-[10px] text-[var(--chat-text-faint)]">{safeTime(m.createdAt)}</span>
      </li>
    )
  }
  return (
    <li data-mid={m.id}>
      <AgentCard
        agentId={m.authorId}
        agentName={m.authorName}
        time={safeTime(m.createdAt)}
        content={m.content}
        attachments={m.attachments}
        grouped={grouped}
      />
    </li>
  )
}

function AgentCard({
  agentId,
  agentName,
  time,
  content,
  attachments,
  streaming,
  grouped,
}: {
  agentId: string
  agentName: string
  time: string
  content?: string
  attachments?: ChatMessageAttachment[]
  streaming?: string
  grouped?: boolean
}) {
  const agent = agentId ? FLEET_BY_ID[agentId] : undefined
  const name = agent?.name ?? agentName
  const tint = agent?.color ?? '#592eff'
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = content ?? streaming ?? ''
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="relative pl-[22px] pt-[6px]">
      {/* Avatar hangs off the card's edge — the gallery-plaque look. */}
      {!grouped && (
        <span
          className="absolute left-0 top-0 z-10 rounded-full ring-[3px] ring-white"
          style={{ boxShadow: `0 0 0 1px ${tint}33` }}
        >
          <AgentAvatar id={agentId || 'agent'} name={name} size={44} />
        </span>
      )}

      <div className={`chat-agent-card chat-shimmer px-6 pb-5 ${grouped ? 'pt-4' : 'pt-5'}`}>
        {streaming != null && <span className="chat-stroke" aria-hidden />}

        {!grouped && (
          <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 pl-[34px]">
            <span className="adora-display text-[15px] font-semibold">{name}</span>
            {agent ? (
              <>
                {agent.role && (
                  <span className="truncate text-[12px] text-[var(--chat-text-dim)]">{agent.role}</span>
                )}
                <span className="adora-tag" style={{ color: agent.color }}>
                  {agent.department}
                </span>
              </>
            ) : (
              <span className="adora-tag text-[var(--chat-text-faint)]">unassigned</span>
            )}
            <span className="ml-auto flex items-center gap-1.5">
              <span className="chat-mono text-[var(--chat-text-faint)]">{time}</span>
              <span className="chat-row-actions">
                <button onClick={copy} aria-label="Copy message" className="chat-ghost-btn h-6 w-6">
                  {copied ? (
                    <Check className="h-3.5 w-3.5" style={{ color: '#587000' }} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </span>
            </span>
          </div>
        )}

        <div className="pl-[34px]">
          {attachments && attachments.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-2">
              {attachments.map((a) => (
                <AttachmentCard key={a.id} {...a} />
              ))}
            </div>
          )}
          {streaming != null ? (
            <div className="chat-md text-[14.5px]">
              <p className="whitespace-pre-wrap">
                {streaming}
                <span className="chat-cursor" />
              </p>
            </div>
          ) : content ? (
            <Markdown text={content} />
          ) : (
            <p className="text-[13px] italic text-[var(--chat-text-faint)]">(no content)</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Awaiting the first token — three painted dots, not a spinner. */
function ThinkingCard() {
  return (
    <li className="pl-[22px]">
      <div className="chat-agent-card inline-flex items-center gap-3 px-6 py-4">
        <span className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full"
              style={{
                background: ['#2ed6ff', '#592eff', '#f843c2'][i],
                animation: `chat-breathe 1.2s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </span>
        <span className="text-[13px] text-[var(--chat-text-dim)]">
          working on it<span className="chat-ellipsis" />
        </span>
      </div>
    </li>
  )
}
