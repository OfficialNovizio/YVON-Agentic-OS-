// /chat — Team chat with drill-down.
//   Workforce → Department → Agent (breadcrumb + pill navigation)
//   "All assigned" combined chat for BOD members with multiple assigned depts.
//   Owner sees each BOD member's assigned_scope room; drill-downs are 1:1 rooms.
//
// Owner: mia · TS-015 WI-3
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/ui'
import { NotificationsSetup } from '@/components/NotificationsSetup'
import { FLEET_DEPARTMENTS } from '@/lib/fleet'
import type { FleetDepartment } from '@/lib/fleet'
import { ContextPanel } from './ContextPanel'
import { PillHeader } from './PillHeader'
import { MessageStream } from './MessageStream'
import { Composer } from './Composer'
import type { ChatRoom } from '@/app/api/chat/rooms/route'
import type { ChatMessage } from '@/app/api/chat/messages/route'

// ─── Focus state model — drives EVERYTHING in the header + composer ──────
export type Focus =
  | { kind: 'workforce' }
  | { kind: 'department'; department: string }
  | { kind: 'agent'; department: string; agentId: string }
  | { kind: 'assigned_scope' }

const POLL_INTERVAL_MS = 4000

// ─── Safe JSON fetcher — refuses to parse HTML/text as JSON (SyntaxError fix) ─
async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
  })
  if (!res.ok) {
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('application/json')) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(body?.error ?? `HTTP ${res.status}`)
    }
    throw new Error(`HTTP ${res.status}`)
  }
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    if (res.redirected || res.url.includes('/login')) {
      window.location.reload()
      throw new Error('session expired; reloading')
    }
    throw new Error(`unexpected content-type: ${ct || 'none'}`)
  }
  return (await res.json()) as T
}

export default function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [focus, setFocus] = useState<Focus>({ kind: 'workforce' })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [awaitingReply, setAwaitingReply] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  // ── Load rooms once on mount ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await jsonFetch<{ rooms: ChatRoom[] }>('/api/chat/rooms')
        if (cancelled) return
        setRooms(data.rooms)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setRoomsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Derive the "active" room based on focus + rooms ─────────────────────
  const activeRoom = useMemo<ChatRoom | null>(() => {
    if (focus.kind === 'workforce') return rooms.find((r) => r.kind === 'whole_team') ?? null
    if (focus.kind === 'assigned_scope') return rooms.find((r) => r.kind === 'assigned_scope') ?? null
    if (focus.kind === 'department')
      return rooms.find((r) => r.kind === 'department' && r.department === focus.department) ?? null
    if (focus.kind === 'agent')
      return rooms.find((r) => r.kind === 'agent' && r.agentId === focus.agentId) ?? null
    return null
  }, [focus, rooms])

  // ── When focus is 'agent' but no room exists yet, provision it ──────────
  useEffect(() => {
    if (focus.kind !== 'agent') return
    if (activeRoom) return  // already provisioned
    let cancelled = false
    ;(async () => {
      try {
        const { room } = await jsonFetch<{ room: ChatRoom }>('/api/chat/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: focus.agentId }),
        })
        if (cancelled) return
        setRooms((prev) => [...prev, room])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => { cancelled = true }
  }, [focus, activeRoom])

  // ── Load + poll messages for the active room ─────────────────────────────
  const loadMessages = useCallback(
    async (roomId: string, opts: { silent?: boolean } = {}) => {
      if (!opts.silent) setMessagesLoading(true)
      try {
        const data = await jsonFetch<{ messages: ChatMessage[] }>(
          `/api/chat/messages?roomId=${encodeURIComponent(roomId)}`,
        )
        setMessages(data.messages)
        lastMessageIdRef.current = data.messages[data.messages.length - 1]?.id ?? null
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!opts.silent) setMessagesLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!activeRoom) return
    setMessages([])
    lastMessageIdRef.current = null
    loadMessages(activeRoom.id)
    const t = setInterval(() => {
      if (activeRoom) loadMessages(activeRoom.id, { silent: true })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [activeRoom, loadMessages])

  // ── Send a message ────────────────────────────────────────────────────────
  const send = useCallback(
    async (content: string, mentions: string[]) => {
      if (!activeRoom) return
      setSending(true)
      setAwaitingReply(true)
      setError(null)
      try {
        await jsonFetch<{ userMessage: unknown; agentMessage: unknown }>('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: activeRoom.id, content, mentions }),
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setSending(false)
        if (activeRoom) await loadMessages(activeRoom.id, { silent: true })
        setAwaitingReply(false)
      }
    },
    [activeRoom, loadMessages],
  )

  // ── Which departments should show pills / be listed? ───────────────────
  const visibleDepartments = useMemo<FleetDepartment[]>(() => {
    const set = new Set<string>()
    for (const r of rooms) {
      if (r.kind === 'department' && r.department) set.add(r.department)
    }
    return FLEET_DEPARTMENTS.filter((d) => set.has(d))
  }, [rooms])

  const hasAssignedScope = rooms.some((r) => r.kind === 'assigned_scope')

  // Composer's auto-@mention when focused on an agent
  const forcedMention = focus.kind === 'agent' ? focus.agentId : null

  const composerPlaceholder =
    focus.kind === 'workforce'
      ? 'Message the workforce…'
      : focus.kind === 'assigned_scope'
      ? 'Message across all your departments…'
      : focus.kind === 'department'
      ? `Message #${focus.department}…`
      : `Ask @${focus.agentId}…`

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col p-2 md:p-4">
      <PageHeader
        title="Chat"
        subtitle="Workforce · Departments · Individual agents. @mention to target."
      />

      <NotificationsSetup />

      {/* Main split card */}
      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden rounded-2xl border border-white/[0.10] bg-black/20">
        {/* Left rail */}
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] md:block">
          <ContextPanel rooms={rooms} focus={focus} onFocus={setFocus} loading={roomsLoading} />
        </aside>

        {/* Message pane */}
        <section className="flex min-w-0 flex-1 flex-col bg-black/30">
          <PillHeader
            focus={focus}
            visibleDepartments={visibleDepartments}
            hasAssignedScope={hasAssignedScope}
            onFocus={setFocus}
          />

          {error && (
            <div className="mx-6 mt-3 rounded-md border border-error/25 bg-error/10 px-3 py-2 text-[12px] text-error">
              {error}
            </div>
          )}

          <MessageStream
            messages={messages}
            awaitingReply={awaitingReply || messagesLoading}
            emptyLabel={
              focus.kind === 'workforce'
                ? 'Nothing yet in Workforce. Say hi — everyone can see this.'
                : focus.kind === 'department'
                ? `Nothing yet in #${focus.department}. Kick things off with a question.`
                : focus.kind === 'agent'
                ? `You haven't talked to @${focus.agentId} yet. Ask them something.`
                : 'Empty. Send a message across your assigned departments.'
            }
          />

          <Composer
            sending={sending}
            disabled={!activeRoom}
            disabledReason={!activeRoom ? 'Loading room…' : undefined}
            forcedMention={forcedMention}
            placeholder={composerPlaceholder}
            onSend={send}
          />
        </section>
      </div>
    </div>
  )
}
