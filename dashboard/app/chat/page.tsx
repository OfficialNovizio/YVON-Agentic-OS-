// /chat — Team chat with drill-down.
//   Workforce → Department → Agent (breadcrumb + pill navigation)
//   "All assigned" combined chat for BOD members with multiple assigned depts.
//   Owner sees each BOD member's assigned_scope room; drill-downs are 1:1 rooms.
//
// Owner: mia · TS-015 WI-3
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Menu, X as CloseIcon } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { NotificationsSetup } from '@/components/NotificationsSetup'
import { FLEET_DEPARTMENTS } from '@/lib/fleet'
import type { FleetDepartment } from '@/lib/fleet'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { ContextPanel } from './ContextPanel'
import { PillHeader } from './PillHeader'
import { MessageStream } from './MessageStream'
import { SessionBar } from './SessionBar'
import { Composer } from './Composer'
import type { StatusChipData } from './StatusChip'
import type { UploadedAttachment } from '@/lib/attachments-client'
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
  const [userId, setUserId] = useState<string>('')
  const [mobileRailOpen, setMobileRailOpen] = useState(false)
  const [statusChips, setStatusChips] = useState<StatusChipData[]>([])
  const sendAbortRef = useRef<AbortController | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  // Derive the active agent id for the SessionBar (from focus or mentions)
  const activeAgentId = useMemo<string | null>(() => {
    if (focus.kind === 'agent') return focus.agentId
    return null
  }, [focus])

  // Grab the auth user's id once for the composer (uploads go under {userId}/…)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!cancelled && user) setUserId(user.id)
    })()
    return () => { cancelled = true }
  }, [])

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

  // ── Send a message (TS-017: decoupled + SSE) ─────────────────────────────
  // Flow: POST user message → open SSE stream → pipe status events → on done, poll reply
  const send = useCallback(
    async (content: string, mentions: string[], attachments: UploadedAttachment[]) => {
      if (!activeRoom) return
      setSending(true)
      setAwaitingReply(true)
      setError(null)
      setStatusChips([])
      const abort = new AbortController()
      sendAbortRef.current = abort

      try {
        // 1) POST the user message (fast — no longer blocks on Hermes)
        const sendRes = await jsonFetch<{ userMessage: { id: string } | null }>(
          '/api/chat/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: activeRoom.id, content, mentions, attachments }),
            signal: abort.signal,
          },
        )
        const msgId = sendRes.userMessage?.id
        if (!msgId) {
          setError('Failed to save message')
          return
        }

        // 2) Open SSE stream to /api/chat/stream
        const sseRes = await fetch(`/api/chat/stream?userMessageId=${msgId}`, {
          signal: abort.signal,
        })
        if (!sseRes.ok) {
          setError(`SSE stream failed: HTTP ${sseRes.status}`)
          return
        }
        if (!sseRes.body) {
          setError('SSE stream returned no body')
          return
        }

        // 3) Read SSE events from the response body
        const reader = sseRes.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Split on double-newline (SSE event boundary)
          let sep: number
          while ((sep = buffer.indexOf('\n\n')) !== -1) {
            const raw = buffer.slice(0, sep)
            buffer = buffer.slice(sep + 2)

            // Extract data: lines
            const dataLines = raw
              .split('\n')
              .filter((l) => l.startsWith('data:'))
              .map((l) => l.slice(5).trim())
              .join('')
            if (!dataLines) continue

            try {
              const event = JSON.parse(dataLines) as {
                kind: string
                toolName?: string
                argsPreview?: string
                ok?: boolean
                summary?: string
                message?: string
                level?: string
              }

              // Map SSE events → StatusChipData
              const chipKind = event.kind === 'tool_call.start'
                ? 'tool_call.start'
                : event.kind === 'tool_call.end'
                  ? 'tool_call.end'
                  : event.kind === 'notice'
                    ? 'notice'
                    : event.kind === 'thinking'
                      ? 'thinking'
                      : null

              if (chipKind) {
                setStatusChips((prev) => [
                  ...prev,
                  {
                    id: `${event.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    kind: chipKind,
                    toolName: event.toolName,
                    argsPreview: event.argsPreview,
                    summary: event.summary,
                    message: event.message,
                    level: event.level,
                    ts: Date.now(),
                    done: event.kind === 'tool_call.end',
                  } as StatusChipData,
                ])
              }

              // Stream ended
              if (event.kind === 'done' || event.kind === 'error') break
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (e) {
        if ((e as { name?: string })?.name === 'AbortError') {
          // silent — user pressed Stop
        } else {
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        sendAbortRef.current = null
        setSending(false)
        if (activeRoom) await loadMessages(activeRoom.id, { silent: true })
        // Brief delay so user can see the final status chips before they disappear
        setTimeout(() => setAwaitingReply(false), 500)
      }
    },
    [activeRoom, loadMessages],
  )

  const stopSend = useCallback(() => {
    sendAbortRef.current?.abort()
    setAwaitingReply(false)
    setSending(false)
    setStatusChips([])
  }, [])

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

  // Wrap setFocus so mobile drawer auto-closes on selection
  const focusAndClose = useCallback((next: Focus) => {
    setFocus(next)
    setMobileRailOpen(false)
  }, [])

  return (
    <div className="flex h-[calc(100vh-1rem)] flex-col p-2 md:h-[calc(100vh-2rem)] md:p-4">
      {/* Header with mobile hamburger */}
      <div className="mb-2 flex items-start justify-between gap-2 md:mb-0">
        <div className="flex flex-1 items-start gap-2">
          <button
            onClick={() => setMobileRailOpen(true)}
            aria-label="Open rooms"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-on-surface-variant transition hover:border-white/25 hover:text-on-surface md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <PageHeader
              title="Chat"
              subtitle="Workforce · Departments · Individual agents. @mention to target."
            />
          </div>
        </div>
      </div>

      <NotificationsSetup />

      {/* Main split card */}
      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden rounded-2xl border border-white/[0.10] bg-black/20">
        {/* ── Desktop / tablet rail ──────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 border-r border-white/[0.06] md:block lg:w-64">
          <ContextPanel rooms={rooms} focus={focus} onFocus={focusAndClose} loading={roomsLoading} />
        </aside>

        {/* ── Mobile drawer ──────────────────────────────────────────── */}
        {mobileRailOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileRailOpen(false)}
              aria-hidden
            />
            <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-white/[0.10] bg-surface-container">
              <div className="flex items-center justify-between border-b border-white/[0.06] p-3">
                <div className="text-[13px] font-semibold text-on-surface">Rooms</div>
                <button
                  onClick={() => setMobileRailOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                  aria-label="Close"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ContextPanel
                  rooms={rooms}
                  focus={focus}
                  onFocus={focusAndClose}
                  loading={roomsLoading}
                />
              </div>
            </aside>
          </div>
        )}

        {/* ── Message pane ───────────────────────────────────────────── */}
        <section className="flex min-w-0 flex-1 flex-col bg-black/30">
          <PillHeader
            focus={focus}
            visibleDepartments={visibleDepartments}
            hasAssignedScope={hasAssignedScope}
            onFocus={setFocus}
          />

          <SessionBar
            chips={statusChips}
            agentId={activeAgentId}
            active={awaitingReply}
          />

          {error && (
            <div className="mx-3 mt-2 rounded-md border border-error/25 bg-error/10 px-3 py-2 text-[12px] text-error md:mx-6 md:mt-3">
              {error}
            </div>
          )}

          <MessageStream
            messages={messages}
            awaitingReply={awaitingReply || messagesLoading}
            statusChips={statusChips}
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
            awaitingReply={awaitingReply}
            disabled={!activeRoom || !userId}
            disabledReason={!activeRoom ? 'Loading room…' : !userId ? 'Signing in…' : undefined}
            forcedMention={forcedMention}
            placeholder={composerPlaceholder}
            userId={userId}
            onStop={stopSend}
            onSend={send}
          />
        </section>
      </div>
    </div>
  )
}
