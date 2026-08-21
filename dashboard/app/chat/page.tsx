// /chat — the Atelier (TS-020, redesigned 2026-08-17 in the Adora system).
//
// Conversation-first: floating dock pill (left) → teams gallery panel →
// thread (center, on a paper canvas with painterly washes) → CAOS pipeline
// card (right) → Teams slide-over on mobile. Every element still binds to
// real data: rooms, messages, SSE events, the command registry, the fleet.
// The redesign is a shape/interaction pass — the data path below is unchanged.
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { NotificationsSetup } from '@/components/NotificationsSetup'
import { FLEET, FLEET_DEPARTMENTS } from '@/lib/fleet'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useShellFullBleed } from '@/components/Shell'
import { MessageStream } from './MessageStream'
import { Composer } from './Composer'
import { DockRail } from './DockRail'
import { TeamsPanel } from './TeamsPanel'
import { TasksPanel } from './TasksPanel'
import { HistoryPanel } from './HistoryPanel'
import { TaskPill } from './TaskPill'
import { TaskFocusView } from './TaskFocusView'
import { LiveStrip } from './LiveStrip'
import { PipelineHud } from './PipelineHud'
import { TaskProposalPrompt, type PendingTaskProposal } from './TaskProposalPrompt'
import { PrdProposalCard, type PendingPrdProposal } from './PrdProposalCard'
import { VentureSelector } from './VentureSelector'
import { AtelierBackdrop } from './Atelier'
import './chat.css'
import type { UploadedAttachment } from '@/lib/attachments-client'
import type { ChatRoom } from '@/app/api/chat/rooms/route'
import type { ChatMessage } from '@/app/api/chat/messages/route'
import type { TurnEvent } from '@/app/api/chat/events/route'
import { stageFromSseEvent, stageFromEventRow, upsertStage, type PipelineView, type InputAnalysisStage, type SkillDisclosureStage } from '@/lib/pipeline'
import type { TurnUsage } from '@/lib/hermes-client'

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
  | { kind: 'tasks'; taskId?: string }
  // 'history' shows the past-chats list in the sidebar slot (2026-08-21).
  // It is a sidebar destination, not a room: the main column keeps showing
  // whatever room you were in, so opening History never interrupts a turn
  // that is still streaming.
  | { kind: 'history' }
  | { kind: 'room'; roomId: string }

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
  // 2026-08-21: manual "reset conversation" action — drops this room's
  // pooled agent (main.py's POST /v1/pool/drop) so the next message starts
  // fresh instead of riding the same ever-growing history that (per real
  // journalctl evidence) climbs toward the account's TPM rate limit the
  // longer a room stays active. Sibling to stream/route.ts's automatic
  // threshold-based reset — this is the "do it right now" version.
  const [resettingContext, setResettingContext] = useState(false)
  // New chat + History (2026-08-21). historyRefresh is a counter, not a
  // boolean: HistoryPanel re-fetches whenever it changes, so creating a
  // thread makes the new row appear without waiting for the 15s poll.
  const [creatingChat, setCreatingChat] = useState(false)
  const [historyRefresh, setHistoryRefresh] = useState(0)
  // Chat-as-task (2026-08-11): the agent's inline "ready to start this as a
  // task?" offer, parsed server-side from a fenced marker (see
  // /api/chat/stream). null = nothing pending.
  const [taskProposal, setTaskProposal] = useState<PendingTaskProposal | null>(null)
  // PRD gate (docs/PRD-prd-gated-task-conversion.md): the second stage,
  // after TaskProposalPrompt hands off a generated PRD. null = nothing pending.
  const [prdProposal, setPrdProposal] = useState<PendingPrdProposal | null>(null)
  const [streamingText, setStreamingText] = useState<string | null>(null)
  // Added 2026-08-20 (Task #18/#20): usage/context data from the most
  // recently completed turn's `done` event — see hermes-client.ts's
  // TurnUsage. Null until the first reply lands; the Composer's chip row
  // stays hidden while this is null rather than showing a placeholder.
  const [lastUsage, setLastUsage] = useState<TurnUsage | null>(null)
  // Adora: a starter prompt clicked in the empty state, handed to the composer
  // once and then cleared.
  const [prefill, setPrefill] = useState<string | null>(null)
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
    // TS lifecycle actions (retry/redo/make changes): jump to the room a task
    // originated from, prefilled with a message drafted from that task.
    if (focus.kind === 'room') return rooms.find((r) => r.id === focus.roomId) ?? null
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
    setTaskProposal(null)
    setPrdProposal(null)
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
      // A new turn starting supersedes any unresolved proposal from the
      // previous one — sending a follow-up message is itself "discuss more".
      setTaskProposal(null)
      setPrdProposal(null)
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
                title?: string
                correlation?: string
                active?: SkillDisclosureStage['active']
                inactiveCount?: number
                totalSkills?: number
                savingsPct?: number
                attached?: boolean
                wing?: string
                count?: number
                usage?: TurnUsage
              }

              // Live tokens → streaming card (TS-020)
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

              // RESOLVE (2026-08-11): venture-memory attachment — the one
              // real, live signal RESOLVE has (replaces the old
              // 'context.injected' event, which bundled in agent-skills
              // data that's phase 02's job now — see stream/route.ts).
              if (event.kind === 'venture.context') {
                setPipeline((prev) => ({
                  stages: upsertStage(prev.stages, {
                    id: 'venture-context',
                    kind: 'resolve',
                    label: event.attached ? 'venture memory attached' : 'no venture memory',
                    detail: event.detail,
                    status: 'done',
                    ts: Date.now(),
                  }),
                  source: 'live',
                }))
              }

              // MemPalace Phase 2 (2026-08-11, PRD: docs/PRD-graph-memory-live-
              // brands.md Work item B) — a real drawer just got written for
              // this turn. Separate stage id, same 'resolve' kind, so it
              // shows alongside the venture-context line rather than
              // overwriting it (upsertStage keys on id).
              if (event.kind === 'mempalace.drawer') {
                setPipeline((prev) => ({
                  stages: upsertStage(prev.stages, {
                    id: 'mempalace-drawer',
                    kind: 'resolve',
                    label: `mempalace drawer saved · ${event.wing ?? '?'}`,
                    detail: `${event.count ?? 0} row(s)`,
                    status: 'done',
                    ts: Date.now(),
                  }),
                  source: 'live',
                }))
              }

              // TS-028: recording stage — only a REAL CAOS turn records to
              // events/graph. Bug fix (2026-08-11): this used to fire
              // unconditionally on every 'done', including the generic
              // small-talk shortcut a few lines up in stream/route.ts, which
              // never touches Hermes, never gets a correlation, and never
              // writes to events/graph/memory at all — yet the panel was
              // claiming "recorded · events · graph · memory" anyway. main.py
              // stamps a real correlation on every genuine Hermes 'done'
              // event (vps-scripts/yvon-hermes-http/main.py:438); the generic
              // shortcut sends `correlation: null`. Use that as the honest
              // signal instead of fabricating a stage for turns that never
              // ran through CAOS at all.
              if (event.kind === 'done' && event.correlation) {
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

              // Skill disclosure (2026-08-11): real per-turn skill matching
              // from lib/context-resolver.ts's skillDisclosureFor() — which
              // skills actually got full content injected vs stayed a
              // one-line summary, and the real savings%. Mirrors the
              // input.analysis handler above; same 'never fabricate' rule —
              // absent unless this turn actually resolved an agent.
              if (event.kind === 'skill.disclosure') {
                setPipeline((prev) => ({
                  stages: upsertStage(prev.stages, {
                    id: 'skill-disclosure',
                    kind: 'disclosure',
                    label: `skill disclosure · ${(event.active ?? []).length} active`,
                    detail: (event.active ?? []).map((a) => a.name).join(', ') || 'none matched',
                    status: 'done',
                    ts: Date.now(),
                    disclosure: {
                      active: event.active ?? [],
                      inactiveCount: event.inactiveCount ?? 0,
                      totalSkills: event.totalSkills ?? 0,
                      savingsPct: event.savingsPct ?? 0,
                    },
                  }),
                  source: 'live',
                }))
              }

              // Chat-as-task (2026-08-11): the agent judged this discussion
              // resolved and offered a task. Real event, parsed server-side
              // from a fenced marker (/api/chat/stream) — never fabricated
              // client-side.
              if (event.kind === 'task.proposed' && event.title && event.summary) {
                setTaskProposal({
                  title: event.title,
                  summary: event.summary,
                  correlation: event.correlation ?? null,
                })
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
                // Only ever set from a real `usage` object main.py actually
                // attached to this event — undefined stays undefined, never
                // coerced into a fake zeroed-out usage row.
                if (event.usage) setLastUsage(event.usage)
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

  // 2026-08-21: manual context reset — see the resettingContext state's
  // header comment above for why this exists.
  const handleResetContext = useCallback(async () => {
    if (!activeRoom || resettingContext) return
    setResettingContext(true)
    try {
      await jsonFetch('/api/chat/reset-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: activeRoom.id }),
      })
    } catch {
      // Best-effort — worst case the next message just doesn't get a fresh
      // pool entry; nothing in the UI depends on this succeeding.
    } finally {
      setResettingContext(false)
    }
  }, [activeRoom, resettingContext])

  const focusAndClose = useCallback((next: Focus) => {
    setFocus(next)
    setTeamsOpen(false)
  }, [])

  // ── New chat + History (2026-08-21) ──────────────────────────────────────
  // Until now /chat had no way to start a conversation: the header's
  // "New message ⌘K" only focused the textarea, and every room was an
  // auto-provisioned singleton, so all workforce messages ever sent lived in
  // one endless room. A thread room is a real new conversation — and because
  // the Hermes agent pool is keyed on (user_id, room_id), it also comes with
  // a genuinely fresh agent rather than a re-used one carrying old context.
  const handleNewChat = useCallback(async () => {
    if (creatingChat) return
    setCreatingChat(true)
    try {
      const { room } = await jsonFetch<{ room: ChatRoom }>('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      // Thread rooms are not in the /api/chat/rooms list (that drives the
      // fixed dock rail), so add it here — activeRoom resolves
      // focus.kind==='room' against this array.
      setRooms((prev) => (prev.some((r) => r.id === room.id) ? prev : [...prev, room]))
      setFocus({ kind: 'room', roomId: room.id })
      setTeamsOpen(false)
      setHistoryRefresh((n) => n + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreatingChat(false)
    }
  }, [creatingChat])

  /** Reopen a past chat from History. */
  const openThread = useCallback((thread: { id: string; title: string }) => {
    setRooms((prev) =>
      prev.some((r) => r.id === thread.id)
        ? prev
        : [
            ...prev,
            {
              id: thread.id,
              kind: 'thread',
              department: null,
              agentId: null,
              ownerUserId: null,
              ventureSlug: null,
              title: thread.title,
              label: thread.title,
              section: 'recent',
            } satisfies ChatRoom,
          ],
    )
    setFocus({ kind: 'room', roomId: thread.id })
    setTeamsOpen(false)
  }, [])

  // TaskFocusView lifecycle actions (make changes / retry / redo): switch
  // focus to the task's originating room and hand the composer a drafted
  // message, same hand-off pattern as the empty-state starter prompts.
  const openRoomWithPrefill = useCallback(
    (roomId: string, text: string) => {
      focusAndClose({ kind: 'room', roomId })
      setPrefill(text)
    },
    [focusAndClose],
  )

  // ── Derived: live strip + HUD inputs ─────────────────────────────────────
  // Bug fix (2026-08-11): this used to map only the 4 raw kinds
  // (classify/resolve/retrieve/gate) — but those are never emitted live
  // (main.py writes phase.classify/phase.resolve straight to the events
  // table, never through the SSE queue; gate.* isn't emitted at all yet).
  // Live turns only ever produce analyze/context/tool/record kinds, so the
  // LiveStrip's phase badge was dark for the entire live portion of every
  // send, even while phase pills 01/03/09/11 were visibly lighting up in
  // the CAOS panel right next to it. Map every real kind onto the CAOS
  // phase it belongs to (mirrors PipelineHud's extraForPhase folding), and
  // fall back to the most recent real stage when nothing is literally
  // mid-flight — most of these events are point-in-time, not spans, so
  // requiring status==='active' left the badge blank almost always.
  const activePhase = useMemo<string | null>(() => {
    const map: Record<string, string> = {
      analyze: 'CLASSIFY',
      classify: 'CLASSIFY',
      context: 'RESOLVE',
      resolve: 'RESOLVE',
      retrieve: 'RETRIEVE',
      tool: 'GENERATION',
      gate: 'GATE',
      record: 'FEEDBACK LOOP',
    }
    const inFlight = pipeline.stages.find((s) => s.status === 'active' && map[s.kind])
    if (inFlight) return map[inFlight.kind]
    const latest = [...pipeline.stages]
      .filter((s) => map[s.kind])
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))[0]
    return latest ? map[latest.kind] : null
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
    // A thread's own title (derived from its first message) — otherwise the
    // header would read a flat "Chat" for every past conversation.
    if (focus.kind === 'room' && activeRoom?.kind === 'thread') {
      return activeRoom.title?.trim() || activeRoom.label || 'New chat'
    }
    return 'Chat'
  }, [focus, activeRoom])

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
    if (focus.kind === 'room' && activeRoom?.kind === 'thread') return 'Your chat'
    return 'Assigned departments'
  }, [focus, activeRoom])

  const memberCount = useMemo(() => {
    if (focus.kind === 'department') return FLEET.filter((a) => a.department === focus.department).length
    if (focus.kind === 'workforce') return FLEET.length
    return null
  }, [focus])

  const liveAgentCount = useMemo(
    () => Object.values(agentLive).filter((s) => s === 'active').length,
    [agentLive],
  )

  const composerPlaceholder =
    focus.kind === 'workforce'
      ? 'Message the workforce…  (/ for commands)'
      : focus.kind === 'department'
        ? `Message #${focus.department}… (/ for commands)`
        : focus.kind === 'agent'
          ? `Ask @${focus.agentId}… (/ for commands)`
          : 'Message across your departments… (/ for commands)'

  // ── Empty-state copy + starters, per focus ───────────────────────────────
  const empty = useMemo(() => {
    if (focus.kind === 'department') {
      return {
        title: 'Brief the',
        highlight: `${focus.department} room`,
        label: `Everyone in ${focus.department} sees this thread. Ask for a plan, a review, or a status read.`,
        starters: [
          `What is ${focus.department} working on right now?`,
          `What are the biggest risks in ${focus.department} this week?`,
          'Draft a plan for the next sprint',
        ],
      }
    }
    if (focus.kind === 'agent') {
      const agent = FLEET.find((a) => a.id === focus.agentId)
      return {
        title: 'Start with',
        highlight: agent?.name ?? `@${focus.agentId}`,
        label: agent?.role
          ? `A private 1:1 room. ${agent.name} handles ${agent.role.toLowerCase()}.`
          : 'A private 1:1 room with this agent.',
        starters: [
          'What can you help me with?',
          'Review what we shipped this week',
          'Draft a plan and stop before you execute',
        ],
      }
    }
    if (focus.kind === 'assigned_scope') {
      return {
        title: 'Reach every',
        highlight: 'assigned team',
        label: 'One message across all the departments assigned to you.',
        starters: ['Status across all my departments', "What's blocked right now?"],
      }
    }
    return {
      title: 'Put the workforce',
      highlight: 'to work',
      label: `${FLEET.length} agents across ${FLEET_DEPARTMENTS.length} departments are listening. Type / for commands, @ to target one directly.`,
      starters: [
        'What should I focus on today?',
        'Summarise this week across every department',
        'Draft a plan for our next release',
        'Which agents are idle right now?',
      ],
    }
  }, [focus])

  const isLive = awaitingReply || pipeline.source === 'live'

  return (
    <div className="chat-shell flex h-full min-h-0 flex-col" data-live={isLive ? 'true' : 'false'}>
      <AtelierBackdrop />

      {/* ── Floating pill header — never a full-bleed bar ─────────────── */}
      <div className="relative z-20 shrink-0 px-3 pb-1 pt-3 sm:px-5">
        <header className="mx-auto flex w-full items-center gap-3 rounded-[200px] border border-[var(--chat-hairline)] bg-white py-2 pl-5 pr-2.5">
          <div className="flex min-w-0 items-baseline gap-2.5">
            <h1 className="adora-display truncate text-[17px]">{topTitle}</h1>
            <span className="hidden truncate text-[12.5px] text-[var(--chat-text-dim)] sm:inline">
              {topSubtitle}
            </span>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <VentureSelector />

            {activeRoom && (
              <button
                type="button"
                onClick={handleResetContext}
                disabled={resettingContext}
                title="Drop this room's saved conversation history — the next message starts fresh, helps avoid rate limits on a long-running chat"
                className="adora-tag hidden text-[var(--chat-text-faint)] hover:text-[var(--chat-text-dim)] disabled:opacity-50 lg:inline-flex"
              >
                {resettingContext ? 'Resetting…' : 'Reset context'}
              </button>
            )}

            {memberCount != null && (
              <span className="adora-tag hidden text-[var(--chat-text-faint)] lg:inline-flex">
                {memberCount} members
              </span>
            )}

            {liveAgentCount > 0 && !isLive && (
              <span className="adora-tag hidden lg:inline-flex" style={{ color: '#587000' }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#a2ea13' }} />
                {liveAgentCount} live
              </span>
            )}

            {isLive && (
              <span className="adora-tag chat-breathe" style={{ color: 'var(--chat-accent)' }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
                live
              </span>
            )}

            {/* Was "New message ⌘K", which only focused the textarea and so
                read as a broken New-chat button. It now actually starts a new
                conversation; ⌘K still focuses the composer via the global
                key handler above, it just no longer masquerades as this. */}
            <button
              onClick={handleNewChat}
              disabled={creatingChat}
              title="Start a new conversation — a fresh room with its own history and its own agent context"
              className="adora-cta hidden py-2 text-[14px] disabled:opacity-60 sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
              {creatingChat ? 'Starting…' : 'New chat'}
            </button>
          </div>
        </header>
      </div>

      <NotificationsSetup />

      {error && (
        <div className="relative z-20 mx-3 mb-1 rounded-[16px] border border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.06)] px-4 py-2.5 text-[12.5px] text-[#b91c1c] sm:mx-5">
          {error}
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-0 flex-1">
        <DockRail rooms={rooms} focus={focus} onFocus={focusAndClose} onOpenTeams={() => setTeamsOpen(true)} teamsOpen={teamsOpen} agentLive={agentLive} />

        {/* Permanent secondary sidebar (desktop) — teams, switches with dept.
            When collapsed, the container shrinks to a rail and the chat
            (main) expands to fill the freed space — no blank gap (TS-030). */}
        <div className={`hidden shrink-0 py-3 pl-3 md:block ${teamsCollapsed ? 'w-[64px]' : 'w-[312px]'}`}>
          {focus.kind === 'tasks' ? (
            <TasksPanel focus={focus} onFocus={focusAndClose} roomId={activeRoom?.id ?? null} />
          ) : focus.kind === 'history' || focus.kind === 'room' ? (
            <HistoryPanel
              activeRoomId={activeRoom?.id ?? null}
              onOpen={openThread}
              onNewChat={handleNewChat}
              refreshToken={historyRefresh}
            />
          ) : (
            <TeamsPanel
              focus={focus}
              onFocus={focusAndClose}
              onClose={() => setTeamsOpen(false)}
              variant="sidebar"
              live={agentLive}
              collapsed={teamsCollapsed}
              onToggleCollapsed={(v) => setTeamsCollapsed(v)}
            />
          )}
        </div>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {focus.kind === 'tasks' && focus.taskId ? (
            <div className="min-h-0 flex-1 py-3 pr-3">
              <TaskFocusView
                taskId={focus.taskId}
                onBack={() => focusAndClose({ kind: 'tasks' })}
                onOpenInChat={openRoomWithPrefill}
              />
            </div>
          ) : (
            <>
              <MessageStream
                messages={messages}
                awaitingReply={awaitingReply || messagesLoading}
                streamingText={streamingText}
                hasEarlier={messages.length >= 50}
                loadingEarlier={loadingEarlier}
                onLoadEarlier={loadEarlier}
                emptyTitle={empty.title}
                emptyHighlight={empty.highlight}
                emptyLabel={empty.label}
                starters={empty.starters}
                onStarter={(t) => setPrefill(t)}
                agentLive={agentLive}
              />
              <LiveStrip
                agentId={activeAgentId}
                active={awaitingReply}
                phase={activePhase}
                thinking={thinking}
              />
              <TaskPill roomId={activeRoom?.id ?? null} onOpen={(taskId) => focusAndClose({ kind: 'tasks', taskId })} />
              <TaskProposalPrompt
                proposal={taskProposal}
                roomId={activeRoom?.id ?? ''}
                onResolved={() => setTaskProposal(null)}
                onPrdGenerated={(p) => { setTaskProposal(null); setPrdProposal(p) }}
              />
              <PrdProposalCard
                proposal={prdProposal}
                roomId={activeRoom?.id ?? ''}
                onResolved={() => setPrdProposal(null)}
              />
              <Composer
                sending={sending}
                awaitingReply={awaitingReply}
                disabled={!activeRoom || !userId}
                disabledReason={
                  !userId
                    ? 'Signing in…'
                    : !activeRoom
                      ? focus.kind === 'history'
                        ? 'Pick a chat from History, or start a new one'
                        : 'Loading room…'
                      : undefined
                }
                forcedMention={focus.kind === 'agent' ? focus.agentId : null}
                placeholder={composerPlaceholder}
                userId={userId}
                onStop={stopSend}
                onSend={send}
                prefill={prefill}
                onPrefillConsumed={() => setPrefill(null)}
                usage={lastUsage}
              />
            </>
          )}
        </main>

        {/* Fixed CAOS card (right column, always present, no close — TS-023).
            Disabled + 'waiting' until a turn starts, then live metrics. */}
        <div className="hidden w-[312px] shrink-0 py-3 pr-3 xl:block">
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
        <div className="absolute inset-y-3 left-[78px] z-50 w-[320px] md:hidden">
          {focus.kind === 'tasks' ? (
            <TasksPanel focus={focus} onFocus={focusAndClose} roomId={activeRoom?.id ?? null} />
          ) : focus.kind === 'history' || focus.kind === 'room' ? (
            <HistoryPanel
              activeRoomId={activeRoom?.id ?? null}
              onOpen={openThread}
              onNewChat={handleNewChat}
              refreshToken={historyRefresh}
            />
          ) : (
            <TeamsPanel focus={focus} onFocus={focusAndClose} onClose={() => setTeamsOpen(false)} variant="overlay" visible live={agentLive} />
          )}
        </div>
      )}
    </div>
  )
}
