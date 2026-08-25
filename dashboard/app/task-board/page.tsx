// /task-board — the Kanban: the task section, moved out of chat (2026-08-25),
// dressed in the same Adora gallery surface as /chat.
//
// This is the same real TASK-SPEC surface that lived in chat's sidebar
// (TasksPanel) — records from store/tasks via /api/task-spec, the source of
// truth. The board renders them as columns keyed to the state machine
// (draft → discovery → approved → executing → gated → review → done) so the
// sidebar "Kanban" section and the lineage board (/tasks) show the same
// cards, same states, same evidence. Nothing here is invented: no mirror,
// no hermes-api board, no states the records don't carry.
//
// Adora treatment: the route opts into data-theme='adora' via Shell's
// ADORA_ROUTE_PREFIXES; the page uses the same pieces as /chat — the
// chat-shell paper canvas, the painterly AtelierBackdrop washes, the
// adora-display face with a hand-drawn Squiggle under the heading, and
// chat-glass columns (white gallery cards, hairline borders, 28px radii).
//
// Clicking a card opens TaskFocusView (the wide detail — acceptance,
// handoff, history, design preview). Deep-link ?task=<id> opens it directly
// (chat's TaskPill points here now).
//
// Owner: dev · task-section-to-kanban, 2026-08-25

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Lock, User, ChevronLeft, ClipboardList } from 'lucide-react'
import { useShellFullBleed } from '@/components/Shell'
import { TASK_STAGES } from '@/lib/task-theme'
import type { TaskSpecItem } from '../chat/TasksPanel'
import { StagePill } from '../chat/TasksPanel'
import { TaskFocusView } from '../chat/TaskFocusView'
import { AtelierBackdrop, Squiggle } from '../chat/Atelier'
import '../chat/chat.css'

// Column header tints — same palette as the lineage board (/tasks STCOL).
const COL_TINT: Record<string, [string, string]> = {
  draft: ['#f2f2ee', '#6b6b74'],
  discovery: ['#f3f0ff', '#7c5cf0'],
  approved: ['#ede8ff', '#592eff'],
  executing: ['#ede8ff', '#592eff'],
  gated: ['#fdf8ec', '#8a6114'],
  review: ['#e6f4f9', '#0a7ea6'],
  done: ['#eef4e2', '#587000'],
}

function ageFrom(iso: string): string {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000))
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.round(hrs / 24)}d`
}

export default function TaskBoardPage() {
  const router = useRouter()
  const { setFullBleed } = useShellFullBleed()
  const [tasks, setTasks] = useState<TaskSpecItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    setFullBleed(true)
    return () => setFullBleed(false)
  }, [setFullBleed])

  const load = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/task-spec')
      const data = (await res.json()) as { tasks?: TaskSpecItem[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setTasks(data.tasks ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
  }, [load])

  // Deep-link: /task-board?task=<id> (chat's TaskPill routes here).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('task')
    if (p) setSelected(p)
  }, [])

  const columns = useMemo(
    () => TASK_STAGES.map((s) => ({ ...s, items: tasks.filter((t) => t.status === s.key) })),
    [tasks],
  )
  const activeCount = tasks.filter((t) => t.status !== 'done').length
  const doneCount = tasks.filter((t) => t.status === 'done').length

  const closeDetail = () => {
    setSelected(null)
    router.replace('/task-board')
  }

  // ── Detail view (card clicked, or deep-linked) ──────────────────────────
  if (selected) {
    return (
      <div className="chat-shell relative min-h-screen overflow-hidden">
        <AtelierBackdrop />
        <div className="relative z-10 mx-auto max-w-[1120px] px-4 py-6 md:px-8 md:py-8">
          <button
            onClick={closeDetail}
            className="chat-ghost-btn mb-4 inline-flex items-center gap-1.5 rounded-[200px] px-4 py-2 text-[13px] font-medium"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to board
          </button>
          <TaskFocusView
            taskId={selected}
            onBack={closeDetail}
            onOpenInChat={() => router.push('/chat')}
          />
        </div>
      </div>
    )
  }

  // ── Board ──────────────────────────────────────────────────────────────
  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
              <Squiggle>Kanban</Squiggle>
            </h1>
            <p className="mt-2 max-w-[520px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
              The task section — real TASK-SPEC records (store/tasks), keyed to the state
              machine. Same cards as /tasks lineage.
            </p>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <span className="rounded-[200px] border border-[var(--chat-hairline)] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[var(--chat-text-dim)]">
              {activeCount} active · {doneCount} done
            </span>
            <button onClick={load} aria-label="Refresh" className="chat-ghost-btn h-9 w-9 rounded-[200px]">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-4 rounded-[16px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-4 py-2.5 text-[12.5px] text-[#b91c1c]">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-start gap-4 overflow-x-auto pb-6">
          {columns.map((col) => {
            const [bg, fg] = COL_TINT[col.key] ?? ['#f2f2ee', '#6b6b74']
            return (
              <section
                key={col.key}
                className="chat-glass flex max-h-[calc(100vh-240px)] w-[262px] shrink-0 flex-col overflow-hidden"
              >
                <header className="flex items-center gap-2 border-b border-[var(--chat-hairline)] px-3.5 py-3">
                  <span
                    className="rounded-[200px] px-2.5 py-1 text-[11px] font-bold tracking-wide"
                    style={{ background: bg, color: fg }}
                  >
                    {col.label}
                  </span>
                  <span className="chat-mono text-[11px] text-[var(--chat-text-faint)]">
                    {col.items.length}
                  </span>
                  <span className="ml-auto hidden text-[10.5px] text-[var(--chat-text-faint)] lg:block">
                    {col.hint}
                  </span>
                </header>

                <div className="chat-scroll flex-1 space-y-2 overflow-y-auto px-2.5 py-2.5">
                  {loading && col.items.length === 0 && (
                    <div className="px-2 py-6 text-center text-[12px] text-[var(--chat-text-faint)]">Loading…</div>
                  )}
                  {!loading && col.items.length === 0 && (
                    <div className="px-2 py-6 text-center text-[12px] text-[var(--chat-text-faint)]">Empty</div>
                  )}
                  {col.items.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t.id)}
                      className="chat-agent-card block w-full px-3 py-2.5 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <StagePill stage={t.status} compact />
                        {t.blocked && (
                          <span className="rounded-[200px] bg-[#fdf2f0] px-2 py-0.5 text-[10px] font-semibold text-[#b91c1c]">
                            blocked
                          </span>
                        )}
                        <span className="chat-mono ml-auto text-[10.5px] text-[var(--chat-text-faint)]">
                          {t.id}
                          {t.updatedAt ? ` · ${ageFrom(t.updatedAt)}` : ''}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.4] text-[var(--chat-body)]">
                        {t.sourceMessage || '(no source message)'}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10.5px] text-[var(--chat-text-dim)]">
                        {t.lead && (
                          <>
                            <User className="h-2.5 w-2.5" /> {t.lead}
                          </>
                        )}
                        {t.status === 'gated' && (
                          <span className="ml-auto inline-flex items-center gap-0.5">
                            <Lock className="h-2.5 w-2.5" /> gated
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )
          })}

          {/* The recurring/scheduled lane — placeholder until TS-REC templates land. */}
          <section className="flex w-[262px] shrink-0 flex-col rounded-[28px] border border-dashed border-[var(--chat-hairline)] bg-white/50">
            <header className="flex items-center gap-2 border-b border-dashed border-[var(--chat-hairline)] px-3.5 py-3">
              <span className="rounded-[200px] bg-[#fdf8ec] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#8a6114]">
                Recurring
              </span>
              <ClipboardList className="ml-auto h-3.5 w-3.5 text-[var(--chat-text-faint)]" />
            </header>
            <div className="px-3.5 py-8 text-center text-[12px] leading-[1.6] text-[var(--chat-text-faint)]">
              Nightly graph rebuild lands here
              <br />
              once recurring templates ship
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
