'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader, StatusBadge, Card } from '@/components/ui'
import { getKanbanBoard, createTask, decomposeTask, dispatchWork } from '@/lib/hermes-api'
import { Plus, Sparkles, Play, Loader2, Brain, GripVertical } from 'lucide-react'

interface KanbanTask {
  id: string
  title: string
  status: string
  description?: string
  assignee?: string
  priority?: string
}

interface KanbanColumn {
  name: string
  tasks: KanbanTask[]
}

export default function TaskBoardPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [decomposing, setDecomposing] = useState<string | null>(null)
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null)

  const fetchBoard = useCallback(async () => {
    try {
      setError(null)
      const board = await getKanbanBoard()
      const raw = (board as any)?.columns ?? (board as any)?.data?.columns ?? []
      setColumns(Array.isArray(raw) ? raw : Object.entries(raw || {}).map(([n, t]) => ({ name: n, tasks: t as KanbanTask[] })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    try {
      await createTask({ title: newTitle })
      setNewTitle('')
      setShowNew(false)
      fetchBoard()
    } catch (e) {
      setError(`Create failed: ${e instanceof Error ? e.message : ''}`)
    }
  }

  const handleDecompose = async (id: string) => {
    setDecomposing(id)
    try {
      const r = await decomposeTask(id)
      setDispatchMsg(`Decomposed ✓`)
      fetchBoard()
    } catch (e) {
      setError(`Decompose failed: ${e instanceof Error ? e.message : ''}`)
    } finally {
      setDecomposing(null)
      setTimeout(() => setDispatchMsg(null), 3000)
    }
  }

  const handleDispatch = async () => {
    try {
      await dispatchWork({})
      setDispatchMsg('Work dispatched ✓')
      fetchBoard()
    } catch (e) {
      setError(`Dispatch failed: ${e instanceof Error ? e.message : ''}`)
    }
    setTimeout(() => setDispatchMsg(null), 3000)
  }

  const totalTasks = columns.reduce((s, c) => s + (c.tasks?.length || 0), 0)
  const activeTasks = columns.filter(c => c.name !== 'done' && c.name !== 'Done').reduce((s, c) => s + (c.tasks?.length || 0), 0)

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Task Board"
        subtitle="Hermes Kanban-powered agent task management."
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge tone="green">{activeTasks} active</StatusBadge>
            <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-[#06121f] hover:opacity-90 transition">
              <Plus size={14} /> New Task
            </button>
            <button onClick={handleDispatch} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-on-surface-variant hover:bg-white/[0.05] transition">
              <Play size={14} /> Dispatch
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-[12px] text-red-400">
          {error} <button onClick={fetchBoard} className="underline">Retry</button>
        </div>
      )}
      {dispatchMsg && (
        <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-[12px] text-emerald-400">{dispatchMsg}</div>
      )}

      {showNew && (
        <Card className="mb-4 p-4">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title…"
            className="w-full mb-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/20" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-[#06121f] hover:opacity-90">Create</button>
            <button onClick={() => setShowNew(false)} className="rounded-lg border border-white/[0.08] px-4 py-1.5 text-xs text-on-surface-variant hover:bg-white/[0.05]">Cancel</button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-on-surface-variant">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading board…
        </div>
      ) : columns.length === 0 ? (
        <Card className="p-8 text-center">
          <Brain size={32} className="text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant">No tasks yet. Create one or dispatch work.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.name}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <h3 className="text-sm font-semibold text-on-surface">{col.name}</h3>
                <StatusBadge tone="muted">{col.tasks?.length || 0}</StatusBadge>
              </div>
              <div className="space-y-2">
                {(col.tasks || []).map(task => (
                  <Card key={task.id} className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="text-on-surface-variant/30 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-on-surface">{task.title}</h4>
                        {task.description && <p className="text-[10px] text-on-surface-variant/70 mt-0.5 line-clamp-2">{task.description}</p>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {task.priority && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400">{task.priority}</span>}
                          {task.assignee && <span className="text-[9px] text-on-surface-variant/50">{task.assignee}</span>}
                          <button onClick={() => handleDecompose(task.id)} disabled={decomposing === task.id}
                            className="ml-auto flex items-center gap-1 text-[9px] text-primary/70 hover:text-primary">
                            {decomposing === task.id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                            Decompose
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
