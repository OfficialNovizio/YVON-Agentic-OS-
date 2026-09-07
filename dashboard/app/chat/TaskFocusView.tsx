// TaskFocusView — full-width task detail, replacing the chat column.
//
// v4 (2026-08-24, "One Request, End to End" artifact, beats 9–22): the task
// surface is rebuilt to the artifact's design — a status strip with an age
// readout (staleness), the acceptance block with per-criterion verdicts +
// evidence (a criterion and an assertion are the same line), the six-field
// handoff packet, artifacts, people (doer · verifier · integrator), an iconed
// history trail, a provenance sidebar (prd / rice / revision_of / derived_from /
// superseded_by / last activity), and the blocked SIDECAR rendered as a red
// strip that does NOT change the status field (a task can be blocked AND
// executing). The old linear stage-card row is gone — it belonged to the
// pre-artifact design.
//
// v3 (2026-08-18): sourceful history trail, Gate-0 RFC checkpoint, creator
// header, honest PRD-alignment panel, lifecycle actions (Make Changes/Retry/Redo).
//
// Fetches its own copy of /api/task-spec (same real source — cli/task.py
// list → store/tasks/TS-NNN.yaml) rather than threading TasksPanel's already
// -fetched array through page.tsx; simpler to keep these two decoupled.
//
// Owner: dev · task-section-in-chat feature, 2026-08-18; task-surface v4 2026-08-24
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft, CircleCheck, ArrowRight, User, Building2, Flag, Redo2, RotateCcw,
  Pencil, Ban, Play, Users, FileText, ExternalLink, Hammer,
} from 'lucide-react'
import { TASK_STAGES, type TaskStage } from '@/lib/task-theme'
import { StagePill, type TaskSpecItem } from './TasksPanel'
import { Markdown } from './Markdown'
import { VerifyCard, type VerifyVerdictRow } from './VerifyCard'

// Mirrors /api/design-preview's response shape (dashboard/app/api/design-preview/route.ts).
interface DesignPreviewTab {
  available: boolean
  reason?: string
  html?: string
  code?: string
  stack?: string
  stub?: boolean
  text?: string
}
interface DesignPreviewResponse {
  ok: boolean
  taskId: string
  designSessionId: string | null
  tool: string | null
  tabs: { preview: DesignPreviewTab; code: DesignPreviewTab; designMd: DesignPreviewTab }
  error?: string
}

interface TaskFocusViewProps {
  taskId: string
  onBack: () => void
  onOpenInChat: (roomId: string, prefillText: string) => void
}

/** SSE events the build console cares about (subset of the stream route's
 * frames — unknown kinds are ignored, same policy as the chat page reader). */
interface KickoffSseEvent {
  kind: string
  toolName?: string
  argsPreview?: string
  summary?: string
  ok?: boolean
  message?: string
  text?: string
  response?: string
  repoChanged?: boolean
  url?: string
  label?: string
  // design.verify (re-engineer Phase 7)
  taskId?: string
  verdicts?: unknown
  asks?: unknown
}

// ── helpers ────────────────────────────────────────────────────────────────

/** "2d 6h" / "3h" / "18m" — staleness is the point of updated_at. */
function ageFrom(iso: string, now = Date.now()): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const mins = Math.max(0, Math.round((now - t) / 60000))
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.round(hrs / 24)}d ${hrs % 24}h`
}

function shortDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Evidence rail (2026-09-05): a produced artifact under dashboard/public/
 *  is served LIVE by this very server — dashboard/public/novizio/index.html
 *  renders at /novizio/index.html. Return that in-page URL, or null when the
 *  produces path isn't a servable public artifact. */
function publicArtifactUrl(produces: string): string | null {
  const p = produces.replace(/\\/g, '/')
  const m = p.match(/^dashboard\/public\/(.+)$/)
  return m ? `/${m[1]}` : null
}

/** History event → icon tone (artifact rail: ● info · ✓ success · ↺ warn · ✕ error). */
type EvtTone = 'info' | 'success' | 'warn' | 'error'
const SUCCESS_EVENTS = new Set(['approved', 'gated', 'done', 'suite_passed', 'handoff_emitted', 'prd_attached', 'unblocked', 'discovery_filled'])
const ERROR_EVENTS = new Set(['blocked', 'suite_failed'])
const WARN_EVENTS = new Set(['criterion_deferred', 'retry_opened', 'redo_opened', 'changes_requested', 'superseded'])
function evtTone(event: string): EvtTone {
  if (ERROR_EVENTS.has(event)) return 'error'
  if (WARN_EVENTS.has(event)) return 'warn'
  if (SUCCESS_EVENTS.has(event)) return 'success'
  return 'info'
}

function metCount(task: TaskSpecItem): number {
  return task.workItems.reduce((n, wi) => n + wi.acceptance.filter((a) => a.status === 'pass').length, 0)
}
function totalAcceptance(task: TaskSpecItem): number {
  return task.workItems.reduce((n, wi) => n + wi.acceptance.length, 0)
}
function uniqueRoles(task: TaskSpecItem, key: 'doer' | 'verifier' | 'integrator'): string {
  return [...new Set(task.workItems.map((wi) => wi[key]).filter(Boolean))].join(', ') || '—'
}

export function TaskFocusView({ taskId, onBack, onOpenInChat }: TaskFocusViewProps) {
  const [task, setTask] = useState<TaskSpecItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionPending, setActionPending] = useState<'retry' | 'redo' | 'block' | 'unblock' | 'review' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [blockOpen, setBlockOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  const load = () => {
    setLoading(true)
    setTask(null)
    fetch('/api/task-spec')
      .then((r) => r.json())
      .then((data: { tasks?: TaskSpecItem[]; error?: string }) => {
        const found = (data.tasks ?? []).find((t) => t.id === taskId) ?? null
        setTask(found)
        if (!found) setError(data.error ?? `${taskId} not found`)
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setTask(null)
    fetch('/api/task-spec')
      .then((r) => r.json())
      .then((data: { tasks?: TaskSpecItem[]; error?: string }) => {
        if (cancelled) return
        const found = (data.tasks ?? []).find((t) => t.id === taskId) ?? null
        setTask(found)
        if (!found) setError(data.error ?? `${taskId} not found`)
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [taskId])

  const [designPreview, setDesignPreview] = useState<DesignPreviewResponse | null>(null)
  const [designPreviewLoading, setDesignPreviewLoading] = useState(false)
  const [designTab, setDesignTab] = useState<'preview' | 'code' | 'designMd'>('preview')

  useEffect(() => {
    if (!task?.designSessionId) {
      setDesignPreview(null)
      return
    }
    let cancelled = false
    setDesignPreviewLoading(true)
    fetch(`/api/design-preview?taskId=${encodeURIComponent(task.id)}`)
      .then((r) => r.json())
      .then((data: DesignPreviewResponse) => {
        if (cancelled) return
        setDesignPreview(data)
        const order: Array<'preview' | 'code' | 'designMd'> = ['preview', 'code', 'designMd']
        const firstAvailable = order.find((t) => data.tabs?.[t]?.available)
        setDesignTab(firstAvailable ?? 'preview')
      })
      .catch(() => !cancelled && setDesignPreview(null))
      .finally(() => !cancelled && setDesignPreviewLoading(false))
    return () => {
      cancelled = true
    }
  }, [task?.id, task?.designSessionId])

  // Evidence rail (2026-09-05): which produced artifacts are live on this
  // server right now — a HEAD probe per dashboard/public/ artifact URL.
  // Keyed on the joined produces string, NOT on `task`: the board re-fetches
  // every 8s and hands down a fresh object each time, so depending on the
  // array would re-probe every poll. Empty → nothing servable, no probes.
  const [liveArtifacts, setLiveArtifacts] = useState<Record<string, boolean>>({})
  const producesKey = (task?.workItems ?? []).map((wi) => wi.produces || '').join('|')
  useEffect(() => {
    const urls = producesKey
      .split('|')
      .filter(Boolean)
      .map(publicArtifactUrl)
      .filter((u): u is string => Boolean(u))
    if (urls.length === 0) {
      setLiveArtifacts({})
      return
    }
    let cancelled = false
    Promise.all(
      urls.map(async (u) => {
        try {
          const r = await fetch(u, { method: 'HEAD' })
          return [u, r.ok] as const
        } catch {
          return [u, false] as const
        }
      }),
    ).then((pairs) => {
      if (!cancelled) setLiveArtifacts(Object.fromEntries(pairs))
    })
    return () => {
      cancelled = true
    }
  }, [producesKey])

  const makeChangesText = (kind: 'changes' | 'retry' | 'redo') => {
    const label =
      kind === 'changes'
        ? "I'd like to make some changes"
        : kind === 'retry'
          ? "Retrying this — here's what needs to change"
          : 'Redoing this — same goal, another pass'
    const quote = task?.sourceMessage ? `"${task.sourceMessage.slice(0, 80)}${task.sourceMessage.length > 80 ? '…' : ''}"` : ''
    return `Re: ${task?.id} — ${label}: ${quote}\n\n`
  }

  function handleMakeChanges() {
    if (!task?.roomId) return
    onOpenInChat(task.roomId, makeChangesText('changes'))
    onBack()
  }

  async function handleLifecycle(kind: 'retry' | 'redo') {
    if (!task) return
    setActionError(null)
    setActionPending(kind)
    try {
      const res = await fetch(`/api/task-spec/${task.id}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: kind === 'retry' ? 'retry_opened' : 'redo_opened',
          note: 'opened from task detail view',
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      if (task.roomId) {
        onOpenInChat(task.roomId, makeChangesText(kind))
        onBack()
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e))
    } finally {
      setActionPending(null)
    }
  }

  /** v4 — the artifact's lifecycle surface, driven by real CLI commands via
   *  /api/task-spec/[id]/command (block / unblock / review). Suite runs stay
   *  CLI-side (task.sh suite --run <path>) because the proof IS the run record. */
  async function runCommand(cmd: 'block' | 'unblock' | 'review', body: Record<string, string> = {}) {
    if (!task) return
    setActionError(null)
    setActionPending(cmd)
    try {
      const res = await fetch(`/api/task-spec/${task.id}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd, ...body }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setBlockOpen(false)
      setBlockReason('')
      load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e))
    } finally {
      setActionPending(null)
    }
  }

  // ── Run suite (re-engineer Phase 8, 2026-09-06) — the company loop's last
  // joint. review is a run, not a signature: this POSTs /suite, which spins
  // scripts/run-task-suite.mjs (mechanical checks → store/runs/run-N.md →
  // task.py suite closes review→done). The 409 with swapRequired is the
  // asset-swap gate surfacing: the card shows the swap list and the two
  // honest exits (confirm swapped / waive, recorded on the design session).
  interface SuiteState {
    phase: 'running' | 'ready' | 'error'
    result?: 'pass' | 'fail'
    run?: string
    checks?: { name: string; state: 'pass' | 'fail' | 'skipped'; detail?: string }[]
    error?: string
    swapRequired?: boolean
    swapList?: { kind?: string; what?: string; note?: string }[]
  }
  const [suite, setSuite] = useState<SuiteState | null>(null)
  const [suitePending, setSuitePending] = useState(false)

  async function runSuite(swap?: 'swapped' | 'waived') {
    if (!task) return
    setSuitePending(true)
    setSuite({ phase: 'running' })
    try {
      const res = await fetch(`/api/task-spec/${task.id}/suite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swap ? { swap } : {}),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        result?: 'pass' | 'fail'
        run?: string
        checks?: SuiteState['checks']
        swapRequired?: boolean
        swapList?: SuiteState['swapList']
      }
      if (res.ok && data.ok) {
        setSuite({ phase: 'ready', result: data.result, run: data.run, checks: data.checks })
        load() // task.py may have closed the task — refresh under the panel
      } else if (res.status === 409 && data.swapRequired) {
        setSuite({ phase: 'error', swapRequired: true, swapList: data.swapList, error: data.error })
      } else {
        setSuite({ phase: 'error', error: data.error ?? `HTTP ${res.status}` })
      }
    } catch (e) {
      setSuite({ phase: 'error', error: e instanceof Error ? e.message : String(e) })
    } finally {
      setSuitePending(false)
    }
  }

  // ── Continue to backend (re-engineer Phase 8, 2026-09-06) — a done design
  // task is not a dead end: this sends a real turn into the originating room
  // asking for the follow-on proposal (backend + connect + e2e), carrying the
  // design.md, the recipe and the produced artifact paths. The agent ends the
  // turn with a normal ```task-proposal fence (plus "derivedFrom": this task)
  // and the EXISTING governed chain takes over: proposal card → PRD → convert
  // (task.py --derived-from + the same design origin) → Start build → verify
  // → gate → review → suite. The button only ever sends the turn; the
  // proposal still has to be accepted by a human.
  const [backendPending, setBackendPending] = useState(false)
  const [backendSent, setBackendSent] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)

  async function handleContinueBackend() {
    if (!task?.roomId || !task.designSessionId) return
    setBackendPending(true)
    setBackendError(null)
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: task.roomId,
          content:
            `Continue to backend for ${task.id} — the design build is done and verified. ` +
            `Draft the follow-on TASK-SPEC proposal for the backend + API + connect + e2e work this design made possible:\n` +
            `- Carry the design.md facts (${task.id}-design.md) and the build recipe into the proposal summary.\n` +
            `- List the design's produced artifact paths as evidence.\n` +
            `- Include "derivedFrom": "${task.id}" in the task-proposal fence so the records link.\n` +
            `End with the task-proposal fence.`,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setBackendSent(true)
    } catch (e) {
      setBackendError(e instanceof Error ? e.message : String(e))
    } finally {
      setBackendPending(false)
    }
  }

  // ── Start build + the alignment loop (re-engineer Phases 6+7, 2026-09-05/06) ─
  // The engine's user-facing surface. Every pipeline turn — build, fix,
  // verify — goes POST /api/chat/task-kickoff → GET /api/chat/stream?
  // userMessageId=…, consumed quietly here. The loop closes itself: a build
  // (or fix) turn's done auto-starts the verify turn, whose design.verify
  // frame becomes the VerifyCard; its Fix-gaps button sends a [TASK FIX]
  // turn, which auto-verifies again — build → verify → fix → verify …
  interface KickoffState {
    phase: 'starting' | 'streaming' | 'done' | 'error'
    mode: 'build' | 'fix'
    roomId?: string
    error?: string
    lines: string[]
    tail?: string
    repoChanged?: boolean
  }
  interface VerifyState {
    phase: 'streaming' | 'ready' | 'error'
    payload?: { verdicts: VerifyVerdictRow[]; asks: VerifyVerdictRow[]; summary: string }
    error?: string
  }
  const [kickoff, setKickoff] = useState<KickoffState | null>(null)
  const [verify, setVerify] = useState<VerifyState | null>(null)
  const kickoffAbortRef = useRef<AbortController | null>(null)
  useEffect(() => () => kickoffAbortRef.current?.abort(), [])

  /** Shared SSE consumption for one pipeline turn. Verify frames go to the
   * caller's handler; everything else feeds the build console (or is ignored
   * on verify turns, whose reply renders through the VerifyCard). */
  async function consumePipelineTurn(
    userMessageId: string,
    opts: {
      mode: 'build' | 'fix' | 'verify'
      onVerifyFrame: (p: { verdicts: VerifyVerdictRow[]; asks: VerifyVerdictRow[]; summary: string }) => void
    },
  ): Promise<{ tail: string; repoChanged?: boolean }> {
    const abort = new AbortController()
    kickoffAbortRef.current = abort
    const pushLine = (line: string) =>
      setKickoff((k) => (k && k.phase === 'streaming' ? { ...k, lines: [...k.lines, line].slice(-12) } : k))
    const sseRes = await fetch(`/api/chat/stream?userMessageId=${userMessageId}`, { signal: abort.signal })
    if (!sseRes.ok || !sseRes.body) throw new Error(`SSE stream failed: HTTP ${sseRes.status}`)
    const reader = sseRes.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let tail = ''
    let repoChanged: boolean | undefined
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
        let evt: KickoffSseEvent | null = null
        try {
          evt = JSON.parse(dataLines) as KickoffSseEvent
        } catch {
          evt = null
        }
        if (!evt) continue
        if (evt.kind === 'tool_call.start') {
          pushLine(`⚙ ${evt.toolName ?? 'tool'} ${evt.argsPreview?.slice(0, 90) ?? ''}`)
        } else if (evt.kind === 'tool_call.end') {
          pushLine(`${evt.ok === false ? '✕' : '✓'} ${evt.toolName ?? 'tool'} — ${evt.summary?.slice(0, 120) ?? ''}`)
        } else if (evt.kind === 'notice') {
          pushLine(`• ${evt.message?.slice(0, 160) ?? ''}`)
        } else if (evt.kind === 'artifact') {
          pushLine(`📎 artifact — ${evt.label ?? evt.url ?? ''}`)
        } else if (evt.kind === 'design.verify') {
          opts.onVerifyFrame({
            verdicts: (evt.verdicts ?? []) as VerifyVerdictRow[],
            asks: (evt.asks ?? []) as VerifyVerdictRow[],
            summary: evt.summary ?? '',
          })
        } else if (evt.kind === 'token' && evt.text) {
          tail = (tail + evt.text).slice(-900)
          if (opts.mode !== 'verify') {
            setKickoff((k) => (k && k.phase === 'streaming' ? { ...k, tail } : k))
          }
        } else if (evt.kind === 'done') {
          if (typeof evt.repoChanged === 'boolean') repoChanged = evt.repoChanged
          const response = evt.response ?? tail
          if (opts.mode !== 'verify') {
            setKickoff((k) => (k ? { ...k, phase: 'done', tail: response.slice(-900), repoChanged } : k))
          }
          return { tail: response || tail, repoChanged }
        } else if (evt.kind === 'error') {
          throw new Error(evt.message ?? 'stream error')
        }
      }
    }
    // Stream closed without an explicit done — end quietly, show the tail.
    if (opts.mode !== 'verify') {
      setKickoff((k) => (k && k.phase === 'streaming' ? { ...k, phase: 'done', tail: tail.slice(-900), repoChanged } : k))
    }
    return { tail, repoChanged }
  }

  /** One governed pipeline turn, end to end: insert → stream → next step.
   * build/fix auto-chain into verify (the CAOS loop); verify ends at the
   * VerifyCard (or an honest error when no verdict fence arrived). */
  async function startPipelineTurn(mode: 'build' | 'fix' | 'verify', gaps?: string[]) {
    if (!task) return
    setActionError(null)
    if (mode === 'verify') {
      setVerify({ phase: 'streaming' })
    } else {
      setKickoff({ phase: 'starting', lines: [], mode })
    }
    try {
      const res = await fetch('/api/chat/task-kickoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, mode, ...(gaps ? { gaps } : {}) }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        roomId?: string
        userMessage?: { id: string }
      }
      if (!res.ok || !data.ok || !data.userMessage?.id) {
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      if (mode !== 'verify') {
        setKickoff((k) =>
          k ? { ...k, phase: 'streaming', roomId: data.roomId, lines: [mode === 'fix' ? 'fix turn sent — streaming' : 'kickoff sent — builder turn is streaming'] } : k,
        )
      }
      let gotFrame = false
      const { tail } = await consumePipelineTurn(data.userMessage.id, {
        mode,
        onVerifyFrame: (payload) => {
          gotFrame = true
          setVerify({ phase: 'ready', payload })
        },
      })
      load()
      if (mode === 'verify') {
        if (!gotFrame) {
          setVerify({
            phase: 'error',
            error:
              'The verify turn finished without a verdict fence — no card can be shown. Try re-running verify; if it repeats, the verifier is not following the contract.',
          })
        }
        return
      }
      // The loop: a finished build or fix turn triggers its verify pass.
      void startPipelineTurn('verify')
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      const msg = e instanceof Error ? e.message : String(e)
      if (mode === 'verify') setVerify({ phase: 'error', error: msg })
      else setKickoff((k) => (k ? { ...k, phase: 'error', error: msg } : k))
    }
  }

  const handleStartBuild = () => startPipelineTurn('build')

  /** ref → criterion text for the VerifyCard, from the live task record. */
  const criteriaText: Record<string, string> = {}
  if (task) {
    for (const wi of task.workItems) {
      wi.acceptance.forEach((a, i) => {
        criteriaText[`${wi.id}:${i + 1}`] = a.text
      })
    }
  }

  // ── derived display state ────────────────────────────────────────────────
  const met = task ? metCount(task) : 0
  const total = task ? totalAcceptance(task) : 0
  const failed = task ? task.workItems.some((wi) => wi.acceptance.some((a) => a.status === 'fail')) : false

  const stripTone = (() => {
    if (!task) return 'neutral'
    if (task.blocked) return 'blk'
    if (task.status === 'review') return 'rev'
    if (task.status === 'done') return 'ok'
    if (task.status === 'executing') return 'run'
    return 'neutral'
  })()

  const stripText = (() => {
    if (!task) return ''
    if (task.blocked) return `blocked · ${ageFrom(task.blockedAt)}`
    if (task.status === 'review') return total > 0 ? `suite ran · ${met} of ${total}` : 'in review'
    if (task.status === 'done') return task.handoff?.entry ? 'closed · handoff emitted' : 'closed'
    if (task.status === 'gated') return 'artifacts exist'
    if (task.status === 'executing') return 'in flight'
    return task.status
  })()

  const stripWho = (() => {
    if (!task) return ''
    if (task.blocked) return 'waiting on you — the block below must resolve first · status unchanged'
    if (task.status === 'review') return `${uniqueRoles(task, 'verifier') === '—' ? 'the suite' : uniqueRoles(task, 'verifier')} decides — review is a run, not a signature`
    if (task.status === 'done') return `${uniqueRoles(task, 'doer')} built · ${uniqueRoles(task, 'verifier')} signed by run`
    if (task.status === 'gated') return 'all declared files present · nothing tested yet'
    if (task.status === 'executing') return `${uniqueRoles(task, 'doer')} is building · nothing verified yet`
    return `${uniqueRoles(task, 'doer')} · ${task.lead || 'unassigned'}`
  })()

  return (
    <div className="chat-frame flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--chat-hairline)] px-5 py-3.5">
        <button onClick={onBack} className="chat-ghost-btn h-8 w-8" aria-label="Back to chat">
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
        <span className="text-[13px] font-medium text-[var(--chat-text-dim)]">Back to chat</span>
        <span className="chat-mono ml-auto text-[var(--chat-text-faint)]">{taskId}</span>
        {task && (
          <span className="flex items-center gap-1.5">
            {task.blocked && (
              <span className="rounded-[200px] bg-[#fdf2f0] px-2 py-0.5 text-[10.5px] font-semibold text-[#b91c1c]">blocked</span>
            )}
            <StagePill stage={task.status} compact />
          </span>
        )}
      </div>

      <div className="chat-scroll flex-1 overflow-y-auto px-6 py-6 sm:px-10">
        <div className="mx-auto max-w-[920px]">
          {loading && <div className="py-16 text-center text-[13px] text-[var(--chat-text-faint)]">Loading…</div>}
          {!loading && error && !task && (
            <div className="rounded-[16px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-4 py-3 text-[13px] text-[#b91c1c]">{error}</div>
          )}
          {task && (
            <>
              {/* ── Creator header ─────────────────────────────────────── */}
              <div className="mb-3.5 flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[12px] font-bold text-white"
                  style={{ background: 'var(--chat-accent)' }}
                >
                  {(task.requester || task.lead || '?').slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--chat-text)]">
                    {task.requester || 'unknown'}
                    <span className="ml-1.5 font-normal text-[var(--chat-text-faint)]">requested this</span>
                  </div>
                  <div className="text-[11.5px] text-[var(--chat-text-faint)]">
                    Created {task.createdAt ? shortDate(task.createdAt) : '—'}
                    {task.revisionOf && (
                      <>
                        {' '}· revision of <span className="chat-mono">{task.revisionOf}</span>
                      </>
                    )}
                    {task.derivedFrom && (
                      <>
                        {' '}· derived from <span className="chat-mono">{task.derivedFrom}</span>
                      </>
                    )}
                    {task.supersededBy && (
                      <>
                        {' '}· superseded by <span className="chat-mono">{task.supersededBy}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="adora-display text-[26px] leading-[1.2]">{task.sourceMessage}</h2>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-[12.5px] text-[var(--chat-text-dim)]">
                {task.lead && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> {task.lead}
                  </span>
                )}
                {task.departments.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> {task.departments.join(', ')}
                  </span>
                )}
                {task.requester && <span>Requested by {task.requester}</span>}
                {task.gate0 && (
                  <span className="flex items-center gap-1.5 text-[#a15c00]">
                    <Flag className="h-3.5 w-3.5" /> RFC sign-off · {task.gate0Signoffs.length} recorded
                  </span>
                )}
              </div>

              {/* ── Status strip — artifact taskSurface .vst ───────────── */}
              <div
                className="mt-6 flex items-center gap-3 rounded-[14px] border px-4 py-3"
                style={{
                  borderLeft: `4px solid ${
                    stripTone === 'blk' ? '#b91c1c' : stripTone === 'rev' ? '#592eff' : stripTone === 'ok' ? '#587000' : stripTone === 'run' ? '#0a7ea6' : 'var(--chat-hairline)'
                  }`,
                  borderColor: stripTone === 'blk' ? 'rgba(239,68,68,0.3)' : stripTone === 'rev' ? 'rgba(89,46,255,0.35)' : 'var(--chat-hairline)',
                  background:
                    stripTone === 'blk' ? '#fdf2f0' : stripTone === 'rev' ? '#f3f0ff' : stripTone === 'ok' ? '#f4f8e9' : stripTone === 'run' ? '#eef8fb' : 'var(--chat-surface-strong)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div
                    className="chat-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: stripTone === 'blk' ? '#b91c1c' : stripTone === 'rev' ? '#592eff' : stripTone === 'ok' ? '#4d7000' : stripTone === 'run' ? '#0a7ea6' : 'var(--chat-text-faint)' }}
                  >
                    {stripText}
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold text-[var(--chat-text)]">{stripWho}</div>
                  {task.blocked && task.blockedReason && (
                    <div className="mt-0.5 text-[12px] text-[#b91c1c]">{task.blockedReason}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="chat-mono text-[15px] font-bold text-[var(--chat-text)]">{ageFrom(task.updatedAt || task.createdAt)}</div>
                  <div className="text-[10.5px] text-[var(--chat-text-faint)]">
                    {task.blocked ? `blocked since ${shortDate(task.blockedAt)}` : 'since last activity'}
                  </div>
                </div>
              </div>

              {/* ── Build console — live while a kickoff turn streams ──── */}
              {kickoff && (
                <div className="chat-glass-soft mt-4 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">
                      🔨 Build console · {task.id}
                    </div>
                    <div
                      className="chat-mono text-[11px]"
                      style={{
                        color:
                          kickoff.phase === 'error' ? '#b91c1c' : kickoff.phase === 'done' ? '#587000' : '#0a7ea6',
                      }}
                    >
                      {kickoff.phase === 'starting' && 'sending kickoff…'}
                      {kickoff.phase === 'streaming' && 'builder is working'}
                      {kickoff.phase === 'done' && 'build turn finished'}
                      {kickoff.phase === 'error' && 'failed'}
                    </div>
                  </div>

                  {kickoff.lines.length > 0 && (
                    <pre className="mb-2 max-h-[150px] overflow-auto rounded-[10px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] p-2.5 text-[10.5px] leading-[1.6] text-[var(--chat-text-dim)]">
                      {kickoff.lines.join('\n')}
                    </pre>
                  )}

                  {kickoff.tail && (
                    <div className="chat-prose max-h-[300px] overflow-auto whitespace-pre-wrap rounded-[10px] border border-[var(--chat-hairline)] bg-white p-3 text-[12px] leading-[1.6] text-[var(--chat-body)]">
                      {kickoff.tail}
                    </div>
                  )}

                  {kickoff.phase === 'streaming' && !kickoff.tail && (
                    <div className="text-[12px] italic text-[var(--chat-text-faint)]">
                      The turn must be streamed to run — keep this view open; the reply will appear here.
                    </div>
                  )}

                  {kickoff.phase === 'error' && kickoff.error && (
                    <div className="mb-2 text-[12px] text-[#b91c1c]">{kickoff.error}</div>
                  )}

                  {kickoff.phase === 'done' && kickoff.repoChanged && (
                    <div className="mb-2 text-[11.5px] text-[#4d7000]">✓ the working repo changed during this turn</div>
                  )}

                  {(kickoff.phase === 'done' || kickoff.phase === 'error') && kickoff.roomId && (
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => {
                          onOpenInChat(kickoff.roomId!, '')
                          onBack()
                        }}
                        className="rounded-[8px] border border-[var(--chat-hairline)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--chat-text)] transition hover:border-[rgba(89,46,255,0.5)]"
                      >
                        Open in chat
                      </button>
                      {kickoff.phase === 'done' && verify === null && (
                        <button
                          onClick={() => startPipelineTurn('verify')}
                          className="rounded-[8px] border border-[rgba(89,46,255,0.4)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--chat-accent)] transition hover:border-[rgba(89,46,255,0.7)]"
                        >
                          Verify against original asks
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Verify — the alignment loop's verdict card ──────────── */}
              {verify && (
                <div className="chat-glass-soft mt-4 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">
                      ✅ Verify · {task.id} — output vs original asks
                    </div>
                    <div
                      className="chat-mono text-[11px]"
                      style={{ color: verify.phase === 'error' ? '#b91c1c' : '#0a7ea6' }}
                    >
                      {verify.phase === 'streaming' && 'verifying against the real output…'}
                      {verify.phase === 'error' && 'verify failed'}
                    </div>
                  </div>
                  {verify.phase === 'streaming' && (
                    <div className="text-[12px] italic text-[var(--chat-text-faint)]">
                      The verifier is inspecting the produced files and evidence — its verdict card appears here when the turn ends.
                    </div>
                  )}
                  {verify.phase === 'error' && verify.error && (
                    <div className="text-[12px] text-[#b91c1c]">
                      {verify.error}
                      {/* the verify loop must never dead-end on a transient
                          stream failure — verify is read-only, retrying is
                          always safe (live E2E gap, 2026-09-06) */}
                      <button
                        onClick={() => startPipelineTurn('verify')}
                        className="ml-3 rounded-md border border-[var(--chat-border)] px-2 py-1 text-[11px] hover:bg-[var(--chat-hover)]"
                      >
                        Retry verify
                      </button>
                    </div>
                  )}
                </div>
              )}
              {verify?.phase === 'ready' && verify.payload && (
                <VerifyCard
                  taskId={task.id}
                  verdicts={verify.payload.verdicts}
                  asks={verify.payload.asks}
                  summary={verify.payload.summary}
                  criteriaText={criteriaText}
                  onFixGaps={(gaps) => {
                    setVerify(null)
                    startPipelineTurn('fix', gaps)
                  }}
                  onReverify={() => {
                    setVerify(null)
                    startPipelineTurn('verify')
                  }}
                  onPassed={() => {
                    setVerify(null)
                    setKickoff(null)
                    load()
                  }}
                />
              )}

              {/* ── Acceptance — from the PRD, verdict per criterion ──── */}
              <div className="chat-glass-soft mt-4 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">
                    Acceptance · from the PRD
                  </div>
                  <div className="chat-mono text-[11px]" style={{ color: failed ? '#b91c1c' : 'var(--chat-text-dim)' }}>
                    {met} of {total} met
                  </div>
                </div>
                {total === 0 ? (
                  <div className="text-[12.5px] italic text-[var(--chat-text-faint)]">No acceptance criteria recorded — the PRD's assertions become these lines.</div>
                ) : (
                  <div className="space-y-1">
                    {task.workItems.map((wi) =>
                      wi.acceptance.map((a, i) => {
                        const on = a.status === 'pass'
                        const no = a.status === 'fail'
                        const dfr = a.status === 'deferred'
                        return (
                          <div key={`${wi.id}-${i}`} className="flex items-start gap-2.5 rounded-[10px] px-1.5 py-2" style={{ background: no ? 'rgba(239,68,68,0.04)' : dfr ? 'rgba(224,184,74,0.07)' : undefined }}>
                            <span
                              className="mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] text-[9px] font-bold text-white"
                              style={{
                                background: on ? '#587000' : no ? '#b91c1c' : dfr ? '#c8951a' : '#cfcfc8',
                                borderColor: on ? '#587000' : no ? '#b91c1c' : '#cfcfc8',
                              }}
                            >
                              {on ? '✓' : no ? '✕' : dfr ? '↺' : '·'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[12.5px] leading-[1.45]" style={{ color: no ? '#b91c1c' : dfr ? '#8a6114' : 'var(--chat-body)' }}>
                                {a.text}
                                {dfr && <span className="ml-1.5 rounded-[200px] bg-[#f6ecd8] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#8a6114]">deferred by decision</span>}
                              </div>
                              {a.evidence && <div className="chat-mono mt-0.5 text-[10.5px] text-[var(--chat-text-faint)]">{a.evidence}</div>}
                            </div>
                          </div>
                        )
                      }),
                    )}
                  </div>
                )}
              </div>

              {/* ── Handoff packet — six fields ───────────────────────── */}
              {task.handoff?.entry && (
                <div className="chat-glass-soft mt-4 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">Handoff packet</div>
                    <div className="chat-mono text-[11px] text-[var(--chat-text-dim)]">6 fields</div>
                  </div>
                  <div className="space-y-2">
                    {(
                      [
                        ['entry', task.handoff.entry],
                        ['contract', task.handoff.contract],
                        ['stubbed', task.handoff.stubbed],
                        ['needs_wiring', task.handoff.needs_wiring],
                        ['tokens', task.handoff.tokens],
                        ['verified_on', task.handoff.verified_on],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k} className="flex items-start gap-2.5">
                        <span className="chat-mono mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[5px] bg-[#ede8ff] text-[9px] text-[#592eff]">→</span>
                        <div className="min-w-0 flex-1">
                          <span className="chat-mono text-[10.5px] font-semibold text-[var(--chat-text)]">{k}</span>
                          <div className="text-[12px] leading-[1.45] text-[var(--chat-text-dim)]">{v}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Evidence — what this task builds on ───────────────── */}
              {/* Evidence rail fix ⑥ (2026-09-04): screenshots/scraped data
                  the origin chat turn actually saved (wrapper /artifacts/
                  store), carried from the proposal on PRD conversion. Honest
                  absence: no section at all when the record has none. */}
              {task.evidence && task.evidence.length > 0 && (
                <div className="chat-glass-soft mt-4 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">Evidence</div>
                    <div className="chat-mono text-[11px] text-[var(--chat-text-dim)]">{task.evidence.length} item(s)</div>
                  </div>
                  <div className="space-y-1.5">
                    {task.evidence.map((e) => (
                      <a
                        key={e.url}
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2.5"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--chat-text-faint)]" />
                        <span className="chat-mono min-w-0 flex-1 truncate text-[11.5px] text-[var(--chat-text)] group-hover:text-[#592eff]">{e.label || e.url}</span>
                        <span className="chat-mono shrink-0 text-[10px] uppercase text-[var(--chat-text-faint)]">{e.kind}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-[var(--chat-text-faint)] opacity-0 transition group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Artifacts — produces + the run record ─────────────── */}
              {task.workItems.some((wi) => wi.produces) && (
                <div className="chat-glass-soft mt-4 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">Artifacts · produces</div>
                    <div className="chat-mono text-[11px] text-[var(--chat-text-dim)]">{task.workItems.filter((wi) => wi.produces).length} item(s)</div>
                  </div>
                  <div className="space-y-1.5">
                    {task.workItems.map((wi) => {
                      if (!wi.produces) return null
                      const previewUrl = publicArtifactUrl(wi.produces)
                      if (!previewUrl) {
                        // Not a servable public artifact (a source file, say) —
                        // keep the plain path row.
                        return (
                          <div key={`${wi.id}-p`} className="flex items-center gap-2.5">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--chat-text-faint)]" />
                            <span className="chat-mono min-w-0 flex-1 truncate text-[11.5px] text-[var(--chat-text)]">{wi.produces}</span>
                          </div>
                        )
                      }
                      // A dashboard/public/ artifact is served by this server:
                      // make the row a live link, with the HEAD-probe verdict
                      // (live · not built yet) shown honestly beside it.
                      const live = liveArtifacts[previewUrl]
                      return (
                        <a
                          key={`${wi.id}-p`}
                          href={previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={`${typeof window !== 'undefined' ? window.location.origin : ''}${previewUrl}${live === false ? ' (not built yet)' : ''}`}
                          className="group flex items-center gap-2.5"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--chat-text-faint)]" />
                          <span className="chat-mono min-w-0 flex-1 truncate text-[11.5px] text-[var(--chat-text)] group-hover:text-[#592eff]">
                            {wi.produces}
                          </span>
                          {live === true ? (
                            <>
                              <span className="chat-mono shrink-0 rounded-[200px] bg-[rgba(89,46,255,0.07)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-accent)]">
                                preview live
                              </span>
                              <ExternalLink className="h-3 w-3 shrink-0 text-[var(--chat-text-faint)] opacity-0 transition group-hover:opacity-100" />
                            </>
                          ) : live === false ? (
                            <span className="chat-mono shrink-0 text-[10px] text-[var(--chat-text-faint)]">not built yet</span>
                          ) : null}
                        </a>
                      )
                    })}
                    {task.runRef && (
                      <div className="flex items-center gap-2.5">
                        <CircleCheck className="h-3.5 w-3.5 shrink-0 text-[#587000]" />
                        <span className="chat-mono min-w-0 flex-1 truncate text-[11.5px] text-[var(--chat-text)]">{task.runRef}</span>
                        <span className="text-[10px] text-[var(--chat-text-faint)]">run record · the proof</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Design preview — only for tasks sourced from cli/design.py's
                  handoff (task.designSessionId set via `task.sh set-design-origin`).
                  Absent entirely for every other task. ── */}
              {task.designSessionId && (
                <DesignPreviewPanel
                  task={task}
                  data={designPreview}
                  loading={designPreviewLoading}
                  activeTab={designTab}
                  onTabChange={setDesignTab}
                />
              )}

              {/* ── People — doer · verifier · integrator ─────────────── */}
              <div className="chat-glass-soft mt-4 p-5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">People</div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <RoleCard label="Doer" who={uniqueRoles(task, 'doer')} note="writes the code" tone="ok" />
                  <RoleCard
                    label="Verifier"
                    who={uniqueRoles(task, 'verifier')}
                    note="owns the suite — assertions ≠ author"
                    tone={task.status === 'review' && failed ? 'warn' : 'wait'}
                  />
                  <RoleCard
                    label="Integrator"
                    who={uniqueRoles(task, 'integrator')}
                    note={task.status === 'done' ? 'takes the brief — the session opens next' : 'takes the brief at handoff'}
                    tone="wait"
                  />
                </div>
              </div>

              {/* ── History — iconed trail ────────────────────────────── */}
              <div className="chat-glass-soft mt-4 p-5">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">History</div>
                {task.history.length === 0 ? (
                  <div className="text-[12.5px] italic text-[var(--chat-text-faint)]">
                    No history recorded — this task was created before the history trail existed (2026-08-18), or nothing has happened to it yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {task.history.map((h, i) => {
                      const tone = evtTone(h.event)
                      return (
                        <div key={i} className="flex items-start gap-2.5">
                          <span
                            className="mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[5px] text-[9px] font-bold"
                            style={{
                              background: tone === 'success' ? '#eef4e2' : tone === 'error' ? '#fdf2f0' : tone === 'warn' ? '#fdf8ec' : '#f2f2ee',
                              color: tone === 'success' ? '#587000' : tone === 'error' ? '#b91c1c' : tone === 'warn' ? '#c8951a' : 'var(--chat-text-faint)',
                            }}
                          >
                            {tone === 'success' ? '✓' : tone === 'error' ? '✕' : tone === 'warn' ? '↺' : '●'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] leading-[1.35]">
                              <span className="font-semibold">{h.event.replace(/_/g, ' ')}</span>
                              <span className="text-[var(--chat-text-dim)]"> · {h.actor}</span>
                            </div>
                            <div className="chat-mono mt-0.5 text-[10px] text-[var(--chat-text-faint)]">{h.ts}</div>
                            {h.note && <div className="mt-0.5 text-[12px] text-[var(--chat-text-faint)]">{h.note}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── PRD ───────────────────────────────────────────────── */}
              {task.prdContent ? (
                <div className="mt-4 rounded-[14px] border border-[var(--chat-hairline)] bg-white px-5 py-4">
                  <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">
                    📄 PRD.md — store/tasks/{task.id}-prd.md
                  </div>
                  <div className="chat-prose text-[13px] leading-[1.6] text-[var(--chat-body)]">
                    <Markdown text={task.prdContent} />
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2.5 rounded-[14px] border border-dashed border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] px-4 py-3 text-[12px] text-[var(--chat-text-faint)]">
                  📄 PRD alignment check — not available. No PRD.md has been generated for this task yet.
                </div>
              )}

              {/* ── Provenance sidebar ────────────────────────────────── */}
              <div className="chat-glass-soft mt-4 p-5">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">Provenance</div>
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  <KvRow k="prd_ref" v={task.prdRef || '—'} mono />
                  <KvRow k="rice" v={task.riceScore || '—'} mono />
                  <KvRow k="revision_of" v={task.revisionOf || '—'} mono link={Boolean(task.revisionOf)} />
                  <KvRow k="derived_from" v={task.derivedFrom || '—'} mono link={Boolean(task.derivedFrom)} />
                  <KvRow k="superseded_by" v={task.supersededBy || '—'} mono />
                  <KvRow k="last activity" v={task.updatedAt || task.createdAt || '—'} mono />
                </div>
              </div>

              {task.status !== 'done' && (
                <div className="mt-4 flex items-center gap-2 rounded-[14px] border border-[var(--chat-hairline-soft)] bg-[var(--chat-surface-strong)] px-4 py-2.5 text-[12.5px] text-[var(--chat-text-dim)]">
                  <ArrowRight className="h-4 w-4 shrink-0" />
                  <span>{task.nextBlocking}</span>
                </div>
              )}

              {/* ── Lifecycle actions ─────────────────────────────────── */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                {task.status === 'executing' && !task.blocked && (
                  <button
                    onClick={handleStartBuild}
                    disabled={
                      actionPending !== null ||
                      kickoff?.phase === 'starting' ||
                      kickoff?.phase === 'streaming'
                    }
                    title="Sends the kickoff turn into the originating room — the builder receives the TASK-SPEC, design.md and recipe for this turn"
                    className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-[14px] px-4 py-2.5 text-left text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: 'var(--chat-accent)' }}
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                      <Hammer className="h-3.5 w-3.5" />
                      {kickoff?.phase === 'starting' ? 'Kicking off…' : kickoff?.phase === 'streaming' ? 'Building…' : 'Start build'}
                    </span>
                    <span className="text-[11px] text-white/70">
                      Sends the kickoff turn — the builder loads the recipe's skills, builds, reports per criterion.
                    </span>
                  </button>
                )}
                {task.status === 'executing' && !task.blocked && (
                  <button
                    onClick={() => startPipelineTurn('verify')}
                    disabled={
                      actionPending !== null ||
                      kickoff?.phase === 'starting' ||
                      kickoff?.phase === 'streaming'
                    }
                    title="Runs the alignment verifier against the produced output and the original asks — read-only, safe to run any time. Use this after publishing new evidence (screenshots, artifacts) without another build turn."
                    className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(89,46,255,0.3)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(89,46,255,0.55)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--chat-accent)]">
                      ✅ Verify output
                    </span>
                    <span className="text-[11px] text-[var(--chat-text-faint)]">
                      The verifier inspects the produced files and evidence — verdict card per criterion and per original ask.
                    </span>
                  </button>
                )}
                <button
                  onClick={handleMakeChanges}
                  disabled={!task.roomId}
                  title={!task.roomId ? 'No originating chat room found for this task' : undefined}
                  className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(89,46,255,0.3)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(89,46,255,0.55)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--chat-accent)]">
                    <Pencil className="h-3.5 w-3.5" /> Make changes
                  </span>
                  <span className="text-[11px] text-[var(--chat-text-faint)]">Opens the originating chat to describe what to change.</span>
                </button>
                <button
                  onClick={() => handleLifecycle('retry')}
                  disabled={!task.roomId || actionPending !== null}
                  title={!task.roomId ? 'No originating chat room found for this task' : undefined}
                  className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(224,184,74,0.5)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(224,184,74,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#a15c00]">
                    <RotateCcw className="h-3.5 w-3.5" /> {actionPending === 'retry' ? 'Retrying…' : 'Retry'}
                  </span>
                  <span className="text-[11px] text-[var(--chat-text-faint)]">Logs a retry entry here, then opens chat to redo it.</span>
                </button>
                <button
                  onClick={() => handleLifecycle('redo')}
                  disabled={!task.roomId || actionPending !== null}
                  title={!task.roomId ? 'No originating chat room found for this task' : undefined}
                  className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(46,214,255,0.5)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(46,214,255,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0a7ea6]">
                    <Redo2 className="h-3.5 w-3.5" /> {actionPending === 'redo' ? 'Redoing…' : 'Redo'}
                  </span>
                  <span className="text-[11px] text-[var(--chat-text-faint)]">Same goal, another pass — same mechanism as Retry.</span>
                </button>

                {task.status !== 'done' && !task.blocked && task.status !== 'draft' && task.status !== 'discovery' && (
                  <div className="flex min-w-[150px] flex-1 flex-col rounded-[14px] border border-[rgba(239,68,68,0.35)] bg-white px-4 py-2.5">
                    {blockOpen ? (
                      <div className="flex flex-col gap-1.5">
                        <input
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder="Why is it blocked?"
                          className="w-full rounded-[8px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] px-2 py-1 text-[12px] outline-none focus:border-[rgba(239,68,68,0.5)]"
                        />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => blockReason.trim() && runCommand('block', { reason: blockReason.trim() })}
                            disabled={!blockReason.trim() || actionPending !== null}
                            className="rounded-[8px] bg-[#b91c1c] px-2.5 py-1 text-[11.5px] font-semibold text-white disabled:opacity-40"
                          >
                            {actionPending === 'block' ? 'Blocking…' : 'Block'}
                          </button>
                          <button onClick={() => { setBlockOpen(false); setBlockReason('') }} className="rounded-[8px] border border-[var(--chat-hairline)] px-2.5 py-1 text-[11.5px] text-[var(--chat-text-dim)]">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setBlockOpen(true)} disabled={actionPending !== null} className="flex flex-col items-start gap-0.5 text-left">
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#b91c1c]">
                          <Ban className="h-3.5 w-3.5" /> Block
                        </span>
                        <span className="text-[11px] text-[var(--chat-text-faint)]">Sidecar — status stays {task.status}; a task can be blocked and executing.</span>
                      </button>
                    )}
                  </div>
                )}
                {task.blocked && (
                  <button
                    onClick={() => runCommand('unblock')}
                    disabled={actionPending !== null}
                    className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(162,234,19,0.4)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(162,234,19,0.7)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4d7000]">
                      {actionPending === 'unblock' ? 'Unblocking…' : 'Unblock'}
                    </span>
                    <span className="text-[11px] text-[var(--chat-text-faint)]">Clears the sidecar — the record keeps the blocked history entry.</span>
                  </button>
                )}
                {task.status === 'gated' && (
                  <button
                    onClick={() => runCommand('review')}
                    disabled={actionPending !== null}
                    className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(89,46,255,0.45)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(89,46,255,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--chat-accent)]">
                      <Play className="h-3.5 w-3.5" /> {actionPending === 'review' ? 'Opening…' : 'Open review'}
                    </span>
                    <span className="text-[11px] text-[var(--chat-text-faint)]">gated → review. The suite decides — a run, not a signature.</span>
                  </button>
                )}
                {task.status === 'review' && (
                  <div className="flex min-w-[220px] flex-[1.4] flex-col gap-1 rounded-[14px] border border-[rgba(89,46,255,0.45)] bg-white px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--chat-accent)]">
                      <Users className="h-3.5 w-3.5" />
                      {suite?.phase === 'running' ? 'Running the suite…' : 'Run suite'}
                    </span>
                    <span className="text-[11px] leading-[1.5] text-[var(--chat-text-faint)]">
                      Mechanical checks (produces on disk, product build, specs) → run record → review closes. Minutes, not moments.
                    </span>
                    {!suite && (
                      <button
                        onClick={() => runSuite()}
                        disabled={suitePending || actionPending !== null}
                        className="mt-1 self-start rounded-[8px] px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: 'var(--chat-accent)' }}
                      >
                        Run suite
                      </button>
                    )}
                    {suite?.phase === 'running' && (
                      <div className="chat-mono mt-1 text-[10.5px] text-[var(--chat-text-faint)]">building + checking — this can take a few minutes…</div>
                    )}
                    {suite?.phase === 'error' && suite.swapRequired && (
                      <div className="mt-1 space-y-1.5">
                        <div className="text-[11.5px] font-semibold text-[#c8951a]">
                          Asset-swap gate — this build used the reference&apos;s own assets
                        </div>
                        <ul className="ml-3 list-disc space-y-0.5 text-[11px] text-[var(--chat-text-dim)]">
                          {(suite.swapList ?? []).map((a, i) => (
                            <li key={i}>
                              {a.what ?? a.kind ?? 'asset'}
                              {a.note ? ` — ${a.note}` : ''}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => runSuite('swapped')}
                            disabled={suitePending}
                            className="rounded-[8px] bg-[#587000] px-3 py-1.5 text-[11.5px] font-semibold text-white transition disabled:opacity-50"
                          >
                            Assets swapped — run suite
                          </button>
                          <button
                            onClick={() => runSuite('waived')}
                            disabled={suitePending}
                            className="rounded-[8px] border border-[rgba(200,149,26,0.5)] px-3 py-1.5 text-[11.5px] font-semibold text-[#c8951a] transition hover:border-[#c8951a] disabled:opacity-50"
                          >
                            Waive — ship reference assets as-is
                          </button>
                        </div>
                        <div className="text-[10.5px] text-[var(--chat-text-faint)]">Either choice is recorded on the design session — the waiver is visible forever.</div>
                      </div>
                    )}
                    {suite?.phase === 'error' && !suite.swapRequired && (
                      <div className="mt-1 text-[11px] leading-[1.5] text-[#b91c1c]">{suite.error}</div>
                    )}
                    {suite?.phase === 'ready' && (
                      <div className="mt-1.5 space-y-1">
                        <div
                          className="flex items-center gap-2 text-[12px] font-semibold"
                          style={{ color: suite.result === 'pass' ? '#587000' : '#b91c1c' }}
                        >
                          {suite.result === 'pass' ? '✓ Suite passed' : '✗ Suite failed'}
                          <span className="chat-mono min-w-0 truncate text-[10.5px] font-normal text-[var(--chat-text-faint)]">{suite.run}</span>
                        </div>
                        {(suite.checks ?? []).map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px]">
                            <span
                              className="chat-mono shrink-0 rounded-[4px] px-1.5 text-[9.5px] font-bold text-white"
                              style={{ background: c.state === 'pass' ? '#587000' : c.state === 'fail' ? '#b91c1c' : '#8a8a80' }}
                            >
                              {c.state}
                            </span>
                            <span className="chat-mono shrink-0 text-[var(--chat-text)]">{c.name}</span>
                            {c.detail && (
                              <span className="min-w-0 flex-1 truncate text-[var(--chat-text-faint)]" title={c.detail}>
                                {c.detail}
                              </span>
                            )}
                          </div>
                        ))}
                        <div className="text-[10.5px] text-[var(--chat-text-faint)]">
                          The run record is the proof — task.py recorded {suite.result === 'pass' ? 'done' : 'the failure (review stays open)'}.
                          {suite.result !== 'pass' && (
                            // a failed run must not dead-end the card — fix the
                            // environment and re-run; the record trail stays
                            // append-only (live E2E, 2026-09-06)
                            <button
                              onClick={() => runSuite()}
                              disabled={suitePending || actionPending !== null}
                              className="ml-3 rounded-md border border-[var(--chat-border)] px-2 py-1 text-[11px] hover:bg-[var(--chat-hover)] disabled:opacity-50"
                            >
                              Run again
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {task.status === 'done' && task.designSessionId && task.roomId && (
                  <button
                    onClick={handleContinueBackend}
                    disabled={backendPending}
                    title="Sends a turn into the originating room asking for the backend follow-on proposal — it arrives as a normal task-proposal card you still have to accept"
                    className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(89,46,255,0.45)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(89,46,255,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--chat-accent)]">
                      <ArrowRight className="h-3.5 w-3.5" />
                      {backendPending ? 'Sending…' : 'Continue to backend'}
                    </span>
                    <span className="text-[11px] leading-[1.5] text-[var(--chat-text-faint)]">
                      {backendSent
                        ? 'Proposal turn sent — open the chat to review and accept it.'
                        : 'Proposes the backend + connect + e2e task this design made possible, linked as derived-from.'}
                    </span>
                  </button>
                )}
              </div>
              {backendError && (
                <div className="mt-2 rounded-[10px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-[11.5px] text-[#b91c1c]">
                  Couldn&apos;t send the backend proposal turn: {backendError}
                </div>
              )}
              {actionError && (
                <div className="mt-2 rounded-[10px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-[11.5px] text-[#b91c1c]">
                  Couldn&apos;t record that action: {actionError}
                </div>
              )}
              {!task.roomId && (
                <div className="mt-2 text-[11px] text-[var(--chat-text-faint)]">
                  These actions need a known originating room — this task has no linked <span className="chat-mono">task.proposal.accepted</span> event, so it can&apos;t be resolved.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function RoleCard({ label, who, note }: { label: string; who: string; note: string; tone: 'ok' | 'wait' | 'warn' }) {
  return (
    <div className="rounded-[12px] border border-[var(--chat-hairline)] bg-white px-3.5 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--chat-text-faint)]">{label}</div>
      <div className="mt-1 text-[13px] font-semibold text-[var(--chat-text)]">{who}</div>
      <div className="mt-0.5 text-[10.5px] text-[var(--chat-text-faint)]">{note}</div>
    </div>
  )
}

function KvRow({ k, v, mono, link }: { k: string; v: string; mono?: boolean; link?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--chat-hairline-soft)] pb-1.5">
      <span className="text-[11px] text-[var(--chat-text-faint)]">{k}</span>
      <span className={mono ? 'chat-mono text-[11.5px] font-medium' : 'text-[12px] font-medium'} style={{ color: link ? 'var(--chat-accent)' : 'var(--chat-text)' }}>
        {v}
      </span>
    </div>
  )
}

const DESIGN_TAB_LABEL: Record<'preview' | 'code' | 'designMd', string> = {
  preview: 'Live Preview',
  code: 'Code',
  designMd: 'design.md',
}

function DesignPreviewPanel({
  task,
  data,
  loading,
  activeTab,
  onTabChange,
}: {
  task: TaskSpecItem
  data: DesignPreviewResponse | null
  loading: boolean
  activeTab: 'preview' | 'code' | 'designMd'
  onTabChange: (t: 'preview' | 'code' | 'designMd') => void
}) {
  const tabs: Array<'preview' | 'code' | 'designMd'> = ['preview', 'code', 'designMd']
  const tab = data?.tabs?.[activeTab]

  return (
    <div className="chat-glass-soft mt-4 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">
          🎨 Design preview{data?.tool ? ` · ${data.tool}` : ''}
        </div>
        <div className="flex gap-1.5">
          {tabs.map((t) => {
            const available = data?.tabs?.[t]?.available
            return (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                disabled={!data}
                className="rounded-[10px] border px-2.5 py-1 text-[11px] font-medium transition disabled:opacity-40"
                style={{
                  borderColor: activeTab === t ? 'rgba(89,46,255,0.45)' : 'var(--chat-hairline)',
                  background: activeTab === t ? 'rgba(89,46,255,0.06)' : '#ffffff',
                  color: available ? 'var(--chat-text)' : 'var(--chat-text-faint)',
                }}
              >
                {DESIGN_TAB_LABEL[t]}
                {!available && data ? ' —' : ''}
              </button>
            )
          })}
        </div>
      </div>

      {loading && <div className="text-[12.5px] italic text-[var(--chat-text-faint)]">Loading…</div>}

      {!loading && tab?.available && activeTab === 'preview' && tab.html && (
        <>
          {tab.stub && (
            <div className="mb-2 text-[11px] text-[#a15c00]">
              ⚠ stub — generated without a live deployment, this is placeholder content, not real output.
            </div>
          )}
          <iframe
            sandbox="allow-scripts"
            srcDoc={tab.html}
            className="h-[420px] w-full rounded-[12px] border border-[var(--chat-hairline)] bg-white"
            title={`${task.id} design preview`}
          />
        </>
      )}

      {!loading && tab?.available && activeTab === 'code' && tab.code && (
        <div>
          {tab.stack && <div className="mb-1.5 text-[11px] text-[var(--chat-text-faint)] chat-mono">stack: {tab.stack}</div>}
          <pre className="max-h-[420px] overflow-auto rounded-[12px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] p-3 text-[11.5px] leading-[1.5]">
            {tab.code}
          </pre>
        </div>
      )}

      {!loading && tab?.available && activeTab === 'designMd' && tab.text && (
        <div className="chat-prose max-h-[420px] overflow-auto text-[13px] leading-[1.6] text-[var(--chat-body)]">
          <Markdown text={tab.text} />
        </div>
      )}

      {!loading && tab && !tab.available && (
        <div className="flex items-center gap-2.5 rounded-[14px] border border-dashed border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] px-4 py-3 text-[12px] text-[var(--chat-text-faint)]">
          {tab.reason || 'not available'}
        </div>
      )}
    </div>
  )
}
