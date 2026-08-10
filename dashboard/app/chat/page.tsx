// /chat — command-deck chat (TS-020).
// Conversation-first: icon dock (left) → thread (center) → floating pipeline
// HUD (right, on demand) → Teams slide-over (on demand). Every element binds
// to real data: rooms, messages, SSE events, the command registry, the fleet.
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NotificationsSetup } from '@/components/NotificationsSetup'
import { FLEET, FLEET_DEPARTMENTS } from '@/lib/fleet'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useShellFullBleed } from '@/components/Shell'
import { MessageStream } from './MessageStream'
import { Composer } from './Composer'
import { DockRail } from './DockRail'
import { TeamsPanel } from './TeamsPanel'
import { LiveStrip } from './LiveStrip'
import { PipelineHud } from './PipelineHud'
import { VentureSelector } from './VentureSelector'
import './chat.css'
import type { UploadedAttachment } from '@/lib/attachments-client'
import type { ChatRoom } from '@/app/api/chat/rooms/route'
import type { ChatMessage } from '@/app/api/chat/messages/route'
import type { TurnEvent } from '@/app/api/chat/events/route'
import { stageFromSseEvent, stageFromEventRow, upsertStage, type PipelineView, type InputAnalysisStage } from '@/lib/pipeline'

// Live-status chip types (moved from the removed StatusChip.tsx — page.tsx is
// now the only consumer; the chip component itself was dead after TS-020).
type StatusChipKind =
  | 'thinking'
  | 'tool_call.start'
  | 'tool_call.end'
  | 'tool_call.error'
  | 'notice'

interface StatusChipData {
  id: string
  kind: StatusChipKind
  toolName?: string
  argsPreview?: string
  summary?: string
  message?: string
  level?: string
  ts: number
  done?: boolean
}

// ─── Focus state model — drives rooms + dock + slide-over ─────────────────
export type Focus =
  | { kind: 'workforce' }
  | { kind: 'department'; department: string }
  | { kind: 'agent'; department: string; agentId: string }
  | { kind: 'assigned_scope' }

const POLL_INTERVAL_MS = 4000

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
  const router = useRouter()
  const { setFullBleed } = useShellFullBleed()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [focus, setFocus] = useState<Focus>({ kind: 'workforce' })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [awaitingReply, setAwaitingReply] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [statusChips, setStatusChips] = useState<StatusChipData[]>([])
  const [pipeline, setPipeline] = useState<PipelineView>({ stages: [], source: 'none' })
  const [streamingText, setStreamingText] = useState<string | null>(null)
  // Default-visible on desktop (TS-021): teams panel + CAOS card show by
  // default; on mobile they're overlays toggled on demand.
  const [teamsOpen, setTeamsOpen] = useState<boolean>(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 768,
  )
  // TS-030: collapsed teams sidebar — the container shrinks so the chat fills
  // the freed width (no blank space). Restored from localStorage via the panel.
  const [teamsCollapsed, setTeamsCollapsed] = useState(false)
  // Single source of live agent status — one poll feeds the dock + teams
  // sidebar (was duplicated in both, 2× the network calls). TS-023 review.
  const [agentLive, setAgentLive] = useState<Record<string, 'active' | 'idle' | 'offline'>>({})
  const sendAbortRef = useRef<AbortController | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  const activeAgentId = useMemo<string | null>(() => {
    if (focus.kind === 'agent') return focus.agentId
    return null
  }, [focus])

  // Full-bleed layout (TS-018 WI-3 · YVON-CHAT §1.3)
  useEffect(() => {
    setFullBleed(true)
    return () => setFullBleed(false)
  }, [setFullBleed])

  // Live agent status — one 20s poll for the whole page (TS-023 review).
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/agent-status')
        if (!res.ok) return
        const data = (await res.json()) as { agents?: { id: string; status: string }[] }
        if (cancelled || !data.agents) return
        const map: Record<string, 'active' | 'idle' | 'offline'> = {}
        for (const a of data.agents) {
          if (a.status === 'active' || a.status === 'idle') map[a.id] = a.status
        }
        setAgentLive(map)
      } catch {
        // no dots — status is never invented
      }
    }
    load()
    const t = setInterval(load, 20_000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  // Keyboard: ⌘T teams, ⌘K focus composer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 't') {
        e.preventDefault()
        setTeamsOpen((v) => !v)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.querySelector<HTMLTextAreaElement>('textarea[data-composer]')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Auth user id for uploads
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!cancelled && user) setUserId(user.id)
    })()
    return () => { cancelled = true }
  }, [])

  // Load rooms once
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

  const activeRoom = useMemo<ChatRoom | null>(() => {
    if (focus.kind === 'workforce') return rooms.find((r) => r.kind === 'whole_team') ?? null
    if (focus.kind === 'assigned_scope') return rooms.find((r) => r.kind === 'assigned_scope') ?? null
    if (focus.kind === 'department')
      return rooms.find((r) => r.kind === 'department' && r.department === focus.department) ?? null
    if (focus.kind === 'agent')
      return rooms.find((r) => r.kind === 'agent' && r.agentId === focus.agentId) ?? null
    return null
  }, [focus, rooms])

  // Provision agent rooms on demand
  useEffect(() => {
    if (focus.kind !== 'agent') return
    if (activeRoom) return
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
    setPipeline({ stages: [], source: 'none' })
    setStreamingText(null)
    loadMessages(activeRoom.id)
    const t = setInterval(() => {
      if (activeRoom) loadMessages(activeRoom.id, { silent: true })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [activeRoom, loadMessages])

  // Pipeline panel, past turns (TS-018 WI-5 · YVON-CHAT §5.3)
  useEffect(() => {
    if (sendAbortRef.current) return
    const withCorrelation = [...messages].reverse().find((m) => m.correlation)
    if (!withCorrelation) return
    let cancelled = false
    const correlation = withCorrelation.correlation as string
    ;(async () => {
      try {
        const data = await jsonFetch<{ events: TurnEvent[] }>(
          `/api/chat/events?correlation=${encodeURIComponent(correlation)}`,
        )
        if (cancelled) return
        const stages = data.events
          .map((r) => stageFromEventRow(r))
          .filter((s): s is NonNullable<typeof s> => s !== null)
        if (stages.length > 0) {
          setPipeline({ stages, source: 'past' })
        }
      } catch {
        // panel stays as-is on failure — observability never breaks the turn
      }
    })()
    return () => { cancelled = true }
  }, [messages])

  // ── Send (command path + SSE stream + live tokens) ───────────────────────
  const send = useCallback(
    async (content: string, mentions: string[], attachments: UploadedAttachment[]) => {
      if (!activeRoom) return
      setSending(true)
      setAwaitingReply(true)
      setError(null)
      setStatusChips([])
      setPipeline({ stages: [], source: 'live' })
      setStreamingText('')
      const abort = new AbortController()
      sendAbortRef.current = abort

      try {
        const sendRes = await jsonFetch<{
          userMessage: { id: string } | null
          command?: { ok: boolean; message: string; effect: { kind: 'reload' | 'navigate'; href?: string } }
        }>(
          '/api/chat/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: activeRoom.id, content, mentions, attachments }),
            signal: abort.signal,
          },
        )
        if (sendRes.command) {
          setStreamingText(null)
          await loadMessages(activeRoom.id, { silent: true })
          const eff = sendRes.command.effect
          if (eff?.kind === 'navigate' && eff.href) {
            router.push(eff.href)
          }
          return
        }
        const msgId = sendRes.userMessage?.id
        if (!msgId) {
          setError('Failed to save message')
          return
        }

        // TS-027: Input Analysis runs inside the stream route. For generic
        // short messages ("hi") the route returns a direct reply (kind:'done',
        // no Hermes, no pipeline) — handled below by the normal done path.
        const sseRes = await fetch(`/api/chat/stream?userMessageId=${msgId}`, { signal: abort.signal })
        if (!sseRes.ok) {
          setError(`SSE stream failed: HTTP ${sseRes.status}`)
          return
        }
        if (!sseRes.body) {
          setError('SSE stream returned no body')
          return
        }

        const reader = sseRes.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let sep: number
          while ((sep = buffer.indexOf('\n\n')) !== -1) {
            const raw = buffer.slice(0, sep)
            buffer = buffer.slice(sep + 2)
            const dataLines = raw
              .split('\n')
              .filter((l) => l.startsWith('data:'))
              .map((l) => l.slice(5).trim())
              .join('')
            if (!dataLines) continue
            try {
              const event = JSON.parse(dataLines) as {
                kind: string
                text?: string
                toolName?: string
                argsPreview?: string
                ok?: boolean
                summary?: string
                message?: string
                level?: string
                what?: string
                why?: string
                how?: string
                endResult?: string
                desiredOutput?: string
                tier?: string
                label?: string
                detail?: string
                type?: string
                subject?: string
                scope?: string
                expected?: string
                format?: string
                relation?: string
                mustHaves?: string[]
                targetAgents?: { primary: string; team: string[]; reason: string }
              }

              // Live tokens → streaming bubble (TS-020)
              if (event.kind === 'token' && event.text) {
                setStreamingText((prev) => (prev ?? '') + event.text)
              }

              // Status chips (thinking / tool / notice)
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

              // Live pipeline stages
              const stage = stageFromSseEvent(event)
              if (stage) {
                setPipeline((prev) => ({
                  stages: upsertStage(prev.stages, stage),
                  source: 'live',
                }))
              }

              // TS-028: context-injection stage (real).
              if (event.kind === 'context.injected') {
                setPipeline((prev) => ({
                  stages: upsertStage(prev.stages, {
                    id: 'context-injected',
                    kind: 'context',
                    label: event.label ?? 'context',
                    detail: event.detail,
                    status: 'done',
                    ts: Date.now(),
                  }),
                  source: 'live',
                }))
              }

              // TS-028: recording stage — every turn records to events/graph.
              if (event.kind === 'done') {
                setPipeline((prev) => ({
                  stages: upsertStage(prev.stages, {
                    id: 'recording',
                    kind: 'record',
                    label: 'recorded',
                    detail: 'events · graph · memory',
                    status: 'done',
                    ts: Date.now(),
                  }),
                  source: 'live',
                }))
              }

              // TS-027/TS-029/TS-030: Input Analysis — dynamic fields (info vs
              // build), plus the structured payload so the HUD renders the
              // 5-stage flow (tier/relation/extract/routing/must-haves) as UI.
              if (event.kind === 'input.analysis') {
                const tier = (event.tier === 'build' || event.tier === 'generic' ? event.tier : 'info') as InputAnalysisStage['tier']
                const relation = (event.relation === 'general' ? 'general' : 'venture') as InputAnalysisStage['relation']
                const infoFields =
                  tier === 'info'
                    ? ([
                        ['type', event.type],
                        ['subject', event.subject],
                        ['scope', event.scope],
                        ['expected', event.expected],
                        ['format', event.format],
                      ] as const)
                    : ([
                        ['what', event.what],
                        ['why', event.why],
                        ['how', event.how],
                        ['end result', event.endResult],
                        ['desired output', event.desiredOutput],
                      ] as const)
                const fields = infoFields.filter(([, v]) => v && v !== 'not specified')
                setPipeline((prev) => ({
                  stages: upsertStage(prev.stages, {
                    id: 'input-analysis',
                    kind: 'analyze',
                    label: `input analysis · ${tier} · ${relation}`,
                    detail: fields.map(([k, v]) => `${k}: ${v}`).join('\n') || 'not specified',
                    status: 'done',
                    ts: Date.now(),
                    analysis: {
                      tier,
                      relation,
                      what: event.what,
                      type: event.type,
                      subject: event.subject,
                      scope: event.scope,
                      expected: event.expected,
                      format: event.format,
                      why: event.why,
                      how: event.how,
                      endResult: event.endResult,
                      desiredOutput: event.desiredOutput,
                      mustHaves: event.mustHaves,
                      targetAgents: event.targetAgents,
                    },
                  }),
                  source: 'live',
                }))
              }

              if (event.kind === 'error') {
                // Surface the REAL reason (Hermes env, wrapper down, …) — never
                // silence the failure (TS-021: "messages go but no reply" fix).
                setError(event.message ? `Agent stream: ${event.message}` : 'Agent stream failed')
                setStreamingText(null)
                break
              }
              if (event.kind === 'done') {
                setStreamingText(null)
                break
              }
            } catch {
              // skip malformed events
            }
          }
        }
      } catch (e) {
        if ((e as { name?: string })?.name === 'AbortError') {
          // user pressed Stop
        } else {
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        sendAbortRef.current = null
        setStreamingText(null)
        setSending(false)
        if (activeRoom) await loadMessages(activeRoom.id, { silent: true })
        setTimeout(() => setAwaitingReply(false), 500)
      }
    },
    [activeRoom, loadMessages, router],
  )

  // ── Load earlier messages (real pagination via the `before` cursor) ──────
  const [loadingEarlier, setLoadingEarlier] = useState(false)
  const loadEarlier = useCallback(async () => {
    if (!activeRoom) return
    setLoadingEarlier(true)
    try {
      const oldest = messages[0]
      if (!oldest) return
      const data = await jsonFetch<{ messages: ChatMessage[] }>(
        `/api/chat/messages?roomId=${encodeURIComponent(activeRoom.id)}&before=${encodeURIComponent(oldest.createdAt)}`,
      )
      if (data.messages.length > 0) setMessages((prev) => [...data.messages, ...prev])
    } catch {
      // keep the thread as-is on failure
    } finally {
      setLoadingEarlier(false)
    }
  }, [activeRoom, messages])

  const stopSend = useCallback(() => {
    sendAbortRef.current?.abort()
    setAwaitingReply(false)
    setSending(false)
    setStatusChips([])
    setStreamingText(null)
  }, [])

  const focusAndClose = useCallback((next: Focus) => {
    setFocus(next)
    setTeamsOpen(false)
  }, [])

  // ── Derived: live strip + HUD inputs ─────────────────────────────────────
  const activePhase = useMemo<string | null>(() => {
    const active = pipeline.stages.find((s) => s.status === 'active')
    if (!active) return null
    const map: Record<string, string> = { classify: 'CLASSIFY', resolve: 'RESOLVE', retrieve: 'RETRIEVE', gate: 'GATE' }
    return map[active.kind] ?? null
  }, [pipeline.stages])

  const thinking = useMemo<string | null>(() => {
    const last = [...statusChips].reverse().find((c) => c.kind === 'thinking' || c.kind === 'notice')
    return last?.message ?? last?.summary ?? last?.toolName ?? null
  }, [statusChips])

  const involvedAgents = useMemo<string[]>(() => {
    const set = new Set<string>()
    if (activeAgentId) set.add(activeAgentId)
    const lastUser = [...messages].reverse().find((m) => m.authorKind === 'user')
    for (const m of lastUser?.mentions ?? []) set.add(m)
    return Array.from(set)
  }, [activeAgentId, messages])

  // ── Top-bar identity (real data) ─────────────────────────────────────────
  const topTitle = useMemo(() => {
    if (focus.kind === 'workforce') return 'Workforce'
    if (focus.kind === 'assigned_scope') return 'All assigned'
    if (focus.kind === 'department') return `#${focus.department}`
    if (focus.kind === 'agent') return `@${focus.agentId}`
    return 'Chat'
  }, [focus])

  const topSubtitle = useMemo(() => {
    if (focus.kind === 'workforce') return `${FLEET.length} agents · ${FLEET_DEPARTMENTS.length} departments`
    if (focus.kind === 'department') {
      const count = FLEET.filter((a) => a.department === focus.department).length
      return `${count} agents · department room`
    }
    if (focus.kind === 'agent') {
      const agent = FLEET.find((a) => a.id === focus.agentId)
      return agent?.role ? `${agent.role} · 1:1 room` : '1:1 room'
    }
    return 'Assigned departments'
  }, [focus])

  const memberCount = useMemo(() => {
    if (focus.kind === 'department') return FLEET.filter((a) => a.department === focus.department).length
    if (focus.kind === 'workforce') return FLEET.length
    return null
  }, [focus])

  const composerPlaceholder =
    focus.kind === 'workforce'
      ? 'Message the workforce…  (/ for commands)'
      : focus.kind === 'department'
        ? `Message #${focus.department}… (/ for commands)`
        : focus.kind === 'agent'
          ? `Ask @${focus.agentId}… (/ for commands)`
          : 'Message across your departments… (/ for commands)'

  return (
    <div className="chat-shell flex h-full min-h-0 flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-3.5">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-[15px] font-semibold text-[var(--chat-text)]">{topTitle}</h1>
          <span className="text-[11px] text-[var(--chat-text-faint)]">{topSubtitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <VentureSelector />
          {memberCount != null && (
            <span className="rounded-full border border-[var(--chat-hairline-soft)] px-2 py-0.5 font-mono text-[9.5px] text-[var(--chat-text-faint)]">
              {memberCount} members
            </span>
          )}
          {(awaitingReply || pipeline.source === 'live') && (
            <span className="chat-breathe rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-widest text-emerald-300/90">
              live
            </span>
          )}
          <span className="rounded-full border border-[var(--chat-hairline-soft)] px-2 py-0.5 font-mono text-[9.5px] text-[var(--chat-text-faint)]">
            ⌘K
          </span>
        </div>
      </div>

      <NotificationsSetup />

      {error && (
        <div className="mx-6 mb-2 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-[12px] text-red-300">
          {error}
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-1">
        <DockRail rooms={rooms} focus={focus} onFocus={focusAndClose} onOpenTeams={() => setTeamsOpen(true)} teamsOpen={teamsOpen} agentLive={agentLive} />

        {/* Permanent secondary sidebar (desktop) — teams, switches with dept.
            When collapsed, the container shrinks to a 40px rail and the chat
            (main) expands to fill the freed space — no blank gap (TS-030). */}
        <div className={`hidden shrink-0 md:block ${teamsCollapsed ? 'w-10' : 'w-[300px]'}`}>
          <TeamsPanel
            focus={focus}
            onFocus={focusAndClose}
            onClose={() => setTeamsOpen(false)}
            variant="sidebar"
            live={agentLive}
            collapsed={teamsCollapsed}
            onToggleCollapsed={(v) => setTeamsCollapsed(v)}
          />
        </div>

        <main className="flex min-w-0 flex-1 flex-col">
          <MessageStream
            messages={messages}
            awaitingReply={awaitingReply || messagesLoading}
            streamingText={streamingText}
            hasEarlier={messages.length >= 50}
            loadingEarlier={loadingEarlier}
            onLoadEarlier={loadEarlier}
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
          <LiveStrip
            agentId={activeAgentId}
            active={awaitingReply}
            phase={activePhase}
            thinking={thinking}
          />
          <Composer
            sending={sending}
            awaitingReply={awaitingReply}
            disabled={!activeRoom || !userId}
            disabledReason={!activeRoom ? 'Loading room…' : !userId ? 'Signing in…' : undefined}
            forcedMention={focus.kind === 'agent' ? focus.agentId : null}
            placeholder={composerPlaceholder}
            userId={userId}
            onStop={stopSend}
            onSend={send}
          />
        </main>

        {/* Fixed CAOS card (right column, always present, no close — TS-023).
            Disabled + 'waiting' until a turn starts, then live metrics. */}
        <div className="hidden w-[300px] shrink-0 xl:block">
          <PipelineHud
            stages={pipeline.stages}
            source={pipeline.source}
            agents={involvedAgents}
            thinking={thinking}
          />
        </div>
      </div>

      {/* Teams panel — desktop: permanent sidebar above. Mobile: overlay
          drawer toggled from the dock. Scope follows the selected department
          (workforce = everything). */}
      {teamsOpen && (
        <div className="absolute inset-y-0 left-14 z-50 w-[320px] md:hidden">
          <TeamsPanel focus={focus} onFocus={focusAndClose} onClose={() => setTeamsOpen(false)} variant="overlay" visible live={agentLive} />
        </div>
      )}
    </div>
  )
}
