// /chat — Team chat surface. Left rail = rooms (RLS-filtered).
// Center = message stream. Bottom = composer with @mention autocomplete.
// Auth-gated by middleware. Real replies land in Push C3 (Hermes wire-up);
// for now C1's echo responder returns a placeholder so the loop works end-to-end.
//
// Owner: mia · TS-009 Push C2
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/ui'
import { NotificationsSetup } from '@/components/NotificationsSetup'
import { RoomSwitcher } from './RoomSwitcher'
import { MessageStream } from './MessageStream'
import { Composer } from './Composer'
import type { ChatRoom } from '@/app/api/chat/rooms/route'
import type { ChatMessage } from '@/app/api/chat/messages/route'

// Safe JSON fetcher — refuses to parse HTML/text as JSON.
// Fixes "SyntaxError: The string did not match the expected pattern." in
// Safari when the server returns HTML (e.g. middleware redirect to /login
// followed automatically by fetch).
async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
  })
  if (!res.ok) {
    // Try to surface the server's error text (JSON preferred)
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('application/json')) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(body?.error ?? `HTTP ${res.status}`)
    }
    throw new Error(`HTTP ${res.status}`)
  }
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    // Session probably expired and middleware served /login HTML — recover gently.
    if (res.redirected || res.url.includes('/login')) {
      window.location.reload()
      throw new Error('session expired; reloading')
    }
    throw new Error(`unexpected content-type: ${ct || 'none'}`)
  }
  return (await res.json()) as T
}

const POLL_INTERVAL_MS = 4000 // will disappear once C3 pushes streaming

export default function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [awaitingReply, setAwaitingReply] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  // ── Load rooms once on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await jsonFetch<{ rooms: ChatRoom[] }>('/api/chat/rooms')
        if (cancelled) return
        setRooms(data.rooms)
        // Default to the whole-team room if present, else first available.
        const first = data.rooms.find((r) => r.kind === 'whole_team') ?? data.rooms[0]
        if (first) setActiveRoomId(first.id)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setRoomsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // ── Load + poll messages for the active room ─────────────────────────────
  const loadMessages = useCallback(
    async (roomId: string, opts: { silent?: boolean } = {}) => {
      if (!opts.silent) setMessagesLoading(true)
      try {
        const data = await jsonFetch<{ messages: ChatMessage[] }>(
          `/api/chat/messages?roomId=${encodeURIComponent(roomId)}`
        )
        setMessages(data.messages)
        lastMessageIdRef.current = data.messages[data.messages.length - 1]?.id ?? null
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!opts.silent) setMessagesLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!activeRoomId) return
    setMessages([])
    lastMessageIdRef.current = null
    loadMessages(activeRoomId)

    // Polling (temporary — replaced by SSE in C3)
    const t = setInterval(() => {
      if (activeRoomId) loadMessages(activeRoomId, { silent: true })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [activeRoomId, loadMessages])

  // ── Send a message ────────────────────────────────────────────────────────
  const send = useCallback(
    async (content: string, mentions: string[]) => {
      if (!activeRoomId) return
      setSending(true)
      setAwaitingReply(true)
      setError(null)
      try {
        await jsonFetch<{ userMessage: unknown; agentMessage: unknown }>('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: activeRoomId, content, mentions }),
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setSending(false)
        // Refetch to pick up user + agent messages
        if (activeRoomId) await loadMessages(activeRoomId, { silent: true })
        setAwaitingReply(false)
      }
    },
    [activeRoomId, loadMessages]
  )

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col p-2 md:p-4">
      <PageHeader
        title="Chat"
        subtitle="Talk to the team. @agent-id to target a specific agent."
      />

      <NotificationsSetup />

      <div className="flex min-h-0 flex-1 gap-3 rounded-2xl border border-white/[0.06] bg-black/20">
        {/* Left rail */}
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] md:block">
          <RoomSwitcher
            rooms={rooms}
            activeRoomId={activeRoomId}
            onSelect={setActiveRoomId}
            loading={roomsLoading}
          />
        </aside>

        {/* Center */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3">
            <div>
              <h2 className="text-[14px] font-semibold text-on-surface">
                {activeRoom?.label ?? (roomsLoading ? '…' : 'No room')}
              </h2>
              {activeRoom?.kind === 'department' && (
                <p className="text-[11px] text-on-surface-variant/70">
                  Department room · scoped to assigned members
                </p>
              )}
              {activeRoom?.kind === 'whole_team' && (
                <p className="text-[11px] text-on-surface-variant/70">Everyone can see this.</p>
              )}
            </div>
          </header>

          {error && (
            <div className="mx-6 mt-3 rounded-md border border-error/25 bg-error/10 px-3 py-2 text-[12px] text-error">
              {error}
            </div>
          )}

          <MessageStream
            messages={messages}
            awaitingReply={awaitingReply || messagesLoading}
            emptyLabel={
              activeRoom
                ? `Say hi to the team in ${activeRoom.label}. Try “@atlas what would you do here?”`
                : 'Pick a room from the left.'
            }
          />

          <Composer
            sending={sending}
            disabled={!activeRoomId}
            disabledReason={!activeRoomId ? 'Pick a room on the left to start.' : undefined}
            onSend={send}
          />
        </section>
      </div>
    </div>
  )
}
