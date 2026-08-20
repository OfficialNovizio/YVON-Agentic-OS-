// TaskPill — the pinned "a task from this chat is in flight" card.
//
// Sits between MessageStream and LiveStrip (same slot pattern as
// TaskProposalPrompt), independent of whichever proposal card is currently
// showing — this is for tasks that already exist, not the moment of
// creating one. Only renders when /api/task-spec?roomId=<this room> returns
// at least one non-done task that traces back to this room (fromRoom===true,
// per the events-table cross-reference in that route). Clicking it opens
// the Tasks section (DockRail) focused on that specific task.
//
// Owner: dev · task-section-in-chat feature, 2026-08-18
'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, ChevronRight } from 'lucide-react'
import { TASK_STAGES } from '@/lib/task-theme'
import type { TaskSpecItem } from './TasksPanel'

interface TaskPillProps {
  roomId: string | null
  onOpen: (taskId: string) => void
}

export function TaskPill({ roomId, onOpen }: TaskPillProps) {
  const [tasks, setTasks] = useState<TaskSpecItem[]>([])

  useEffect(() => {
    if (!roomId) {
      setTasks([])
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/task-spec?roomId=${encodeURIComponent(roomId)}`)
        const data = (await res.json()) as { tasks?: TaskSpecItem[] }
        if (!cancelled) setTasks((data.tasks ?? []).filter((t) => t.fromRoom && t.status !== 'done'))
      } catch {
        // stays quiet — this is a convenience pill, not a critical surface
      }
    }
    load()
    const id = setInterval(load, 10_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [roomId])

  if (tasks.length === 0) return null

  const top = tasks[0]
  const stageLabel = TASK_STAGES.find((s) => s.key === top.status)?.label ?? top.status

  return (
    <div className="relative z-10 px-4 pb-2 sm:px-8">
      <button
        onClick={() => onOpen(top.id)}
        className="adora-rise chat-breathe mx-auto flex w-full max-w-[780px] items-center gap-2.5 rounded-[16px] border border-[rgba(89,46,255,0.25)] bg-white px-4 py-2.5 text-left transition hover:border-[rgba(89,46,255,0.5)]"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px]" style={{ background: 'rgba(89,46,255,0.08)' }}>
          <ClipboardList className="h-3.5 w-3.5 text-[var(--chat-accent)]" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="chat-mono text-[var(--chat-text-faint)]">{top.id}</span>
          <span className="mx-1.5 text-[var(--chat-text-faint)]">·</span>
          <span className="text-[12.5px] font-medium text-[var(--chat-text)]">{stageLabel}</span>
          {tasks.length > 1 && (
            <span className="ml-1.5 text-[11.5px] text-[var(--chat-text-dim)]">+{tasks.length - 1} more</span>
          )}
          <span className="block truncate text-[12px] text-[var(--chat-text-dim)]">{top.sourceMessage}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--chat-text-faint)]" />
      </button>
    </div>
  )
}
