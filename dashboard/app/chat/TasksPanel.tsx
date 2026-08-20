// TasksPanel — the task LIST, living inside chat's sidebar slot (2026-08-18).
//
// A DockRail destination, same slot TeamsPanel occupies. This panel only
// ever shows the list now — opening a task hands off to TaskFocusView,
// which replaces the whole chat column instead of squeezing detail (a
// 6-stage card row, work items, everything) into a ~300px sidebar. That
// split came from real feedback: the detail view was unreadably cramped
// in here. See TaskFocusView.tsx for the wide layout.
//
// Real data only: GET /api/task-spec, which shells out to `cli/task.py
// list` — store/tasks/TS-NNN.yaml is the source of truth, this panel never
// renders anything task.py didn't actually write.
//
// Styled in Adora, reusing the same primitives as the rest of /chat.

'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, RefreshCw, Lock, User } from 'lucide-react'
import { TASK_STAGES, type TaskStage } from '@/lib/task-theme'
import type { Focus } from './page'

export interface TaskSpecWorkItem {
  id: string
  owner: string
  objective: string
}

export interface TaskHistoryEntry {
  ts: string
  actor: string
  event: string
  note: string
}

export interface TaskSpecItem {
  id: string
  status: TaskStage
  sourceMessage: string
  requester: string
  taskType: string
  departments: string[]
  lead: string
  discoveryQuestions: string[]
  workItems: TaskSpecWorkItem[]
  exitOwner: string
  exitProof: string
  approvedBy: string
  approvedAt: string
  nextBlocking: string
  active: boolean
  fromRoom?: boolean
  createdAt: string
  revisionOf: string
  gate0: boolean
  gate0Signoffs: string[]
  history: TaskHistoryEntry[]
  roomId?: string
  prdContent?: string
  /** 2026-08-19 (docs/PRD-design-first-workflow.md) — set via `task.sh
   * set-design-origin`, absent on every task not sourced from cli/design.py's
   * handoff. Powers TaskFocusView's unified design-preview panel. */
  designSessionId?: string
  designTool?: string
  designArtifactId?: string
  designProjectId?: string
  designHandoffPath?: string
}

interface TasksPanelProps {
  focus: Focus
  onFocus: (next: Focus) => void
  roomId: string | null
}

export function TasksPanel({ focus, onFocus, roomId }: TasksPanelProps) {
  const [tasks, setTasks] = useState<TaskSpecItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scope, setScope] = useState<'room' | 'all'>(roomId ? 'room' : 'all')

  const load = async () => {
    try {
      setError(null)
      const qs = roomId ? `?roomId=${encodeURIComponent(roomId)}` : ''
      const res = await fetch(`/api/task-spec${qs}`)
      const data = (await res.json()) as { tasks?: TaskSpecItem[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setTasks(data.tasks ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const visible = useMemo(
    () => (scope === 'room' && roomId ? tasks.filter((t) => t.fromRoom) : tasks),
    [tasks, scope, roomId],
  )

  const activeTaskId = focus.kind === 'tasks' ? focus.taskId : undefined

  return (
    <div className="chat-glass flex h-full flex-col overflow-hidden">
      <TaskList
        tasks={visible}
        loading={loading}
        error={error}
        scope={scope}
        hasRoom={Boolean(roomId)}
        activeId={activeTaskId}
        onScope={setScope}
        onRefresh={load}
        onOpen={(id) => onFocus({ kind: 'tasks', taskId: id })}
      />
    </div>
  )
}

// ── List ─────────────────────────────────────────────────────────────────

function TaskList({
  tasks,
  loading,
  error,
  scope,
  hasRoom,
  activeId,
  onScope,
  onRefresh,
  onOpen,
}: {
  tasks: TaskSpecItem[]
  loading: boolean
  error: string | null
  scope: 'room' | 'all'
  hasRoom: boolean
  activeId?: string
  onScope: (s: 'room' | 'all') => void
  onRefresh: () => void
  onOpen: (id: string) => void
}) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--chat-hairline)] px-4 py-3.5">
        <ClipboardList className="h-4 w-4 text-[var(--chat-accent)]" strokeWidth={1.75} />
        <span className="adora-display text-[14px] font-semibold">Tasks</span>
        <button
          onClick={onRefresh}
          aria-label="Refresh"
          className="chat-ghost-btn ml-auto h-6 w-6"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {hasRoom && (
        <div className="flex gap-1 px-4 pt-3">
          <ScopeTab active={scope === 'room'} onClick={() => onScope('room')} label="This chat" />
          <ScopeTab active={scope === 'all'} onClick={() => onScope('all')} label="All tasks" />
        </div>
      )}

      <div className="chat-scroll flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        {loading && tasks.length === 0 && (
          <div className="px-2 py-8 text-center text-[12.5px] text-[var(--chat-text-faint)]">Loading…</div>
        )}
        {error && (
          <div className="rounded-[12px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-[12px] text-[#b91c1c]">
            {error}
          </div>
        )}
        {!loading && !error && tasks.length === 0 && (
          <div className="px-2 py-8 text-center text-[12.5px] text-[var(--chat-text-faint)]">
            {scope === 'room' ? 'No tasks from this chat yet.' : 'No tasks yet.'}
          </div>
        )}
        {tasks.map((t) => {
          const isOpen = t.id === activeId
          return (
            <button
              key={t.id}
              onClick={() => onOpen(t.id)}
              className="chat-agent-card block w-full px-3.5 py-3 text-left"
              style={isOpen ? { borderColor: 'rgba(89,46,255,0.45)', background: 'rgba(89,46,255,0.03)' } : undefined}
            >
              <div className="flex items-center gap-2">
                <StagePill stage={t.status} compact />
                <span className="chat-mono text-[var(--chat-text-faint)]">{t.id}</span>
                {t.active && <span className="ml-auto adora-tag" style={{ color: 'var(--chat-accent)' }}>active</span>}
              </div>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-[var(--chat-body)]">
                {t.sourceMessage || '(no source message)'}
              </p>
              {t.lead && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--chat-text-dim)]">
                  <User className="h-3 w-3" /> {t.lead}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

function ScopeTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[200px] px-3 py-1.5 text-[12px] font-medium transition"
      style={{
        background: active ? 'rgba(89,46,255,0.08)' : 'transparent',
        color: active ? 'var(--chat-accent)' : 'var(--chat-text-dim)',
      }}
    >
      {label}
    </button>
  )
}

export function StagePill({ stage, compact }: { stage: TaskStage; compact?: boolean }) {
  const meta = TASK_STAGES.find((s) => s.key === stage)
  const done = stage === 'done'
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[200px] px-2 py-0.5 text-[10.5px] font-medium"
      style={{
        background: done ? 'rgba(162,234,19,0.16)' : 'rgba(89,46,255,0.07)',
        color: done ? '#4d7000' : 'var(--chat-accent)',
      }}
    >
      {stage === 'gated' && <Lock className="h-2.5 w-2.5" />}
      {compact ? (meta?.label ?? stage) : meta?.hint ?? stage}
    </span>
  )
}
