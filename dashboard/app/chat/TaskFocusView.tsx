// TaskFocusView — full-width task detail, replacing the chat column.
//
// v3 (2026-08-18, docs/PRD-task-detail-lifecycle-actions.md): adds the
// sourceful history trail, the conditional Gate-0 RFC checkpoint, a prominent
// creator header, an honest PRD-alignment panel (no real PRD exists for any
// task yet — this says so rather than faking a comparison), and the three
// real lifecycle actions (Make Changes / Retry / Redo). Retry/Redo POST to
// /api/task-spec/[id]/note BEFORE navigating — a failed write blocks the
// navigation rather than silently proceeding (PRD §6 acceptance criteria).
//
// v2 (2026-08-18, earlier same day): full-width layout replacing the ~300px
// sidebar squeeze — see git history for that fix's rationale.
//
// Fetches its own copy of /api/task-spec (same real source — cli/task.py
// list → store/tasks/TS-NNN.yaml) rather than threading TasksPanel's already
// -fetched array through page.tsx; simpler to keep these two decoupled.
//
// Owner: dev · task-section-in-chat feature, 2026-08-18
'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, CircleCheck, CircleDot, Circle, ArrowRight, User, Building2, Flag, Redo2, RotateCcw, Pencil } from 'lucide-react'
import { TASK_STAGES, stageTint, type TaskStage } from '@/lib/task-theme'
import { StagePill, type TaskSpecItem } from './TasksPanel'
import { Markdown } from './Markdown'

// Mirrors /api/design-preview's response shape (dashboard/app/api/design-preview/route.ts).
// One unified shape regardless of source tool (screenshot-to-code / open-design
// / custom) — each tab independently `available`, with an honest `reason`
// when it isn't, per docs/PRD-design-first-workflow.md.
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
  /** Opens the task's originating room in chat with the composer pre-filled.
   * Buttons that depend on this disable with an explanation when a task has
   * no resolvable room (roomId undefined — no task.proposal.accepted event
   * was ever recorded for it). */
  onOpenInChat: (roomId: string, prefillText: string) => void
}

export function TaskFocusView({ taskId, onBack, onOpenInChat }: TaskFocusViewProps) {
  const [task, setTask] = useState<TaskSpecItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openStage, setOpenStage] = useState<string | null>(null)
  const [actionPending, setActionPending] = useState<'retry' | 'redo' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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
        setOpenStage(found?.status ?? null)
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
        // Default to whichever tab actually has something, preview first —
        // never land on a tab that's just going to show an empty state.
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

  const stages: string[] = task?.gate0
    ? ['draft', 'discovery', 'gate0', 'approved', 'executing', 'gated', 'done']
    : ['draft', 'discovery', 'approved', 'executing', 'gated', 'done']

  const stageReached = (s: string) => {
    if (!task) return false
    if (s === 'gate0') return task.status !== 'draft' && task.status !== 'discovery'
    return TASK_STAGES.findIndex((x) => x.key === task.status) >= TASK_STAGES.findIndex((x) => x.key === s)
  }

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
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      // History write succeeded — only now is it safe to navigate. A thrown
      // error above skips this, so we never navigate on a silently-swallowed
      // failure (PRD §6 acceptance criteria).
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

  return (
    <div className="chat-frame flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--chat-hairline)] px-5 py-3.5">
        <button onClick={onBack} className="chat-ghost-btn h-8 w-8" aria-label="Back to chat">
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
        <span className="text-[13px] font-medium text-[var(--chat-text-dim)]">Back to chat</span>
        <span className="chat-mono ml-auto text-[var(--chat-text-faint)]">{taskId}</span>
        {task && <StagePill stage={task.status} compact />}
      </div>

      <div className="chat-scroll flex-1 overflow-y-auto px-6 py-6 sm:px-10">
        <div className="mx-auto max-w-[860px]">
          {loading && <div className="py-16 text-center text-[13px] text-[var(--chat-text-faint)]">Loading…</div>}
          {!loading && error && !task && (
            <div className="rounded-[16px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-4 py-3 text-[13px] text-[#b91c1c]">
              {error}
            </div>
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
                    {task.createdAt ? `Created ${task.createdAt}` : 'Creation time not recorded (pre-2026-08-18 record)'}
                    {task.revisionOf && (
                      <>
                        {' '}
                        · revision of <span className="chat-mono">{task.revisionOf}</span>
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
              </div>

              {/* ── Stage-card row — real grid, Gate-0 shown only when the
                  record is actually classification.gate_0: true (MASTER §7.0's
                  structural-impact test), never invented for a non-structural
                  task ── */}
              <div className={`mt-6 grid grid-cols-3 gap-2.5 ${task.gate0 ? 'sm:grid-cols-7' : 'sm:grid-cols-6'}`}>
                {stages.map((s) => {
                  const isGate0 = s === 'gate0'
                  const tone = isGate0 ? (stageReached('gate0') ? 'done' : 'upcoming') : stageTint(s as TaskStage, task.status)
                  const open = openStage === s
                  const label = isGate0 ? 'RFC Sign-off' : (TASK_STAGES.find((x) => x.key === s)?.label ?? s)
                  return (
                    <button
                      key={s}
                      onClick={() => setOpenStage(s)}
                      className="flex flex-col gap-2 rounded-[18px] border px-3.5 py-3 text-left transition"
                      style={{
                        borderColor: open ? 'rgba(89,46,255,0.45)' : isGate0 ? '#e0b84a' : 'var(--chat-hairline)',
                        borderStyle: isGate0 && !open ? 'dashed' : 'solid',
                        background: open ? 'rgba(89,46,255,0.04)' : isGate0 ? '#fffaf0' : '#ffffff',
                        boxShadow: open ? '0 10px 24px -18px rgba(89,46,255,0.5)' : undefined,
                      }}
                    >
                      <span style={{ color: isGate0 ? '#a15c00' : tone === 'upcoming' ? 'var(--chat-text-faint)' : 'var(--chat-accent)' }}>
                        {isGate0 ? (
                          <Flag className="h-[18px] w-[18px]" />
                        ) : tone === 'done' ? (
                          <CircleCheck className="h-[18px] w-[18px]" />
                        ) : tone === 'active' ? (
                          <CircleDot className="h-[18px] w-[18px]" />
                        ) : (
                          <Circle className="h-[18px] w-[18px]" />
                        )}
                      </span>
                      <span
                        className="text-[12.5px] font-medium leading-tight"
                        style={{ color: tone === 'upcoming' && !isGate0 ? 'var(--chat-text-faint)' : 'var(--chat-text)' }}
                      >
                        {label}
                      </span>
                      {isGate0 && <span className="text-[9.5px] text-[var(--chat-text-faint)]">structural</span>}
                    </button>
                  )
                })}
              </div>
              {task.gate0 && (
                <div className="mt-1.5 text-[11px] text-[#a15c00]">
                  ⚑ RFC Sign-off shown because this task is marked <span className="chat-mono">gate_0: true</span> — it touches
                  frontend/backend/API/security/algorithm structure (MASTER §7.0), so approval needs sign-offs before it can proceed.
                </div>
              )}

              {/* ── Selected stage detail ─────────────────────────────── */}
              <div className="chat-glass-soft mt-4 p-5">
                {openStage === 'gate0' ? <Gate0Body task={task} /> : <StageBody stage={(openStage ?? task.status) as TaskStage} task={task} />}
              </div>

              {/* ── Design preview — only for tasks sourced from cli/design.py's
                  handoff (task.designSessionId set via `task.sh set-design-origin`,
                  docs/PRD-design-first-workflow.md). Absent entirely for every other
                  task, never an empty panel shown speculatively. ── */}
              {task.designSessionId && (
                <DesignPreviewPanel
                  task={task}
                  data={designPreview}
                  loading={designPreviewLoading}
                  activeTab={designTab}
                  onTabChange={setDesignTab}
                />
              )}

              {/* ── History — sourceful trail ─────────────────────────── */}
              <div className="chat-glass-soft mt-4 p-5">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">History</div>
                {task.history.length === 0 ? (
                  <div className="text-[12.5px] italic text-[var(--chat-text-faint)]">
                    No history recorded — this task was created before the history trail existed (2026-08-18), or nothing has happened
                    to it yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {task.history.map((h, i) => (
                      <div key={i} className="border-l-2 border-[rgba(89,46,255,0.35)] pl-3">
                        <div className="text-[10.5px] text-[var(--chat-text-faint)]">{h.ts}</div>
                        <div className="text-[12.5px]">
                          <span className="font-semibold">{h.actor}</span>{' '}
                          <span className="text-[var(--chat-text-dim)]">{h.event.replace(/_/g, ' ')}</span>
                        </div>
                        {h.note && <div className="mt-0.5 text-[12px] text-[var(--chat-text-faint)]">{h.note}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PRD — honest, opt-in per task: most tasks have no PRD.md at
                  all (docs/PRD-task-detail-lifecycle-actions.md §4 out-of-scope), so
                  this says so plainly rather than faking a comparison. When a task DOES
                  have store/tasks/{id}-prd.md, the full file renders here instead. ── */}
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

              {task.status !== 'done' && (
                <div className="mt-4 flex items-center gap-2 rounded-[14px] border border-[var(--chat-hairline-soft)] bg-[var(--chat-surface-strong)] px-4 py-2.5 text-[12.5px] text-[var(--chat-text-dim)]">
                  <ArrowRight className="h-4 w-4 shrink-0" />
                  <span>{task.nextBlocking}</span>
                </div>
              )}

              {/* ── Lifecycle actions ──────────────────────────────────── */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  onClick={handleMakeChanges}
                  disabled={!task.roomId}
                  title={!task.roomId ? 'No originating chat room found for this task' : undefined}
                  className="flex min-w-[170px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(89,46,255,0.3)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(89,46,255,0.55)] disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="flex min-w-[170px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(224,184,74,0.5)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(224,184,74,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="flex min-w-[170px] flex-1 flex-col gap-0.5 rounded-[14px] border border-[rgba(46,214,255,0.5)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(46,214,255,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0a7ea6]">
                    <Redo2 className="h-3.5 w-3.5" /> {actionPending === 'redo' ? 'Redoing…' : 'Redo'}
                  </span>
                  <span className="text-[11px] text-[var(--chat-text-faint)]">Same goal, another pass — same mechanism as Retry.</span>
                </button>
              </div>
              {actionError && (
                <div className="mt-2 rounded-[10px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-[11.5px] text-[#b91c1c]">
                  Couldn&apos;t record that action: {actionError}
                </div>
              )}
              {!task.roomId && (
                <div className="mt-2 text-[11px] text-[var(--chat-text-faint)]">
                  These actions need a known originating room — this task has no linked <span className="chat-mono">task.proposal.accepted</span>{' '}
                  event, so it can&apos;t be resolved.
                </div>
              )}
            </>
          )}
        </div>
      </div>
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

function Gate0Body({ task }: { task: TaskSpecItem }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">RFC Sign-off · Gate 0</div>
      {task.gate0Signoffs.length === 0 ? (
        <div className="text-[12.5px] italic text-[var(--chat-text-faint)]">No sign-offs recorded yet — approval is blocked until at least one is added.</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {task.gate0Signoffs.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-[200px] bg-[rgba(162,234,19,0.16)] px-2.5 py-1 text-[12px] font-medium text-[#4d7000]">
              ✓ {s}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 text-[11px] text-[var(--chat-text-faint)]">
        Sign-off itself happens outside this UI (a backend/agent action per MASTER §7.0) — this view only reads and displays the current state.
      </div>
    </div>
  )
}

function StageBody({ stage, task }: { stage: TaskStage; task: TaskSpecItem }) {
  if (stage === 'draft') {
    return (
      <Field label="Requested by">
        {task.requester || '—'}
        {task.taskType ? ` · ${task.taskType}` : ''}
      </Field>
    )
  }
  if (stage === 'discovery') {
    return task.discoveryQuestions.length > 0 ? (
      <div className="space-y-2">
        {task.discoveryQuestions.map((q, i) => (
          <div key={i} className="text-[13px] text-[var(--chat-body)]">
            · {q}
          </div>
        ))}
      </div>
    ) : (
      <EmptyNote>No discovery questions recorded yet.</EmptyNote>
    )
  }
  if (stage === 'approved') {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Lead">{task.lead || '—'}</Field>
        <Field label="Departments">{task.departments.join(', ') || '—'}</Field>
        <Field label="Approved by">{task.approvedBy || '—'}</Field>
      </div>
    )
  }
  if (stage === 'executing') {
    return task.workItems.length > 0 ? (
      <div className="grid gap-3 sm:grid-cols-2">
        {task.workItems.map((wi) => (
          <div key={wi.id} className="rounded-[14px] border border-[var(--chat-hairline)] bg-white px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="chat-mono text-[var(--chat-text-faint)]">{wi.id}</span>
              {wi.owner && (
                <span className="adora-tag" style={{ color: 'var(--chat-accent)' }}>
                  {wi.owner}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.45] text-[var(--chat-body)]">{wi.objective || '—'}</p>
          </div>
        ))}
      </div>
    ) : (
      <EmptyNote>No work items filled in yet.</EmptyNote>
    )
  }
  if (stage === 'gated') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Exit owner">{task.exitOwner || '—'}</Field>
        <Field label="Proof">{task.exitProof || <EmptyNote>Not filed yet.</EmptyNote>}</Field>
      </div>
    )
  }
  // done
  return (
    <div className="flex items-start gap-2.5">
      <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#4d7000' }} />
      <Field label="Shipped">{task.exitProof || '—'}</Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--chat-text-faint)]">{label}</div>
      <div className="mt-1 text-[13px] leading-[1.5] text-[var(--chat-body)]">{children}</div>
    </div>
  )
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--chat-text-faint)]">{children}</span>
}
