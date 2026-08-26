// Task Lineage — one request → its record chain (2026-08-24).
//
// The artifact's board surface ("One Request, End to End", beats 12/17/21/22):
//   · revision_of — same goal, previous attempt superseded → COLLAPSES to an
//     attempt count on the root card. A rework is a quality signal, not a thing
//     to read.
//   · derived_from — different goal, made possible by the first → NESTS one
//     level. Those are genuinely different jobs with different owners.
//   · blocked_by — ordering inside a fan-out (from work_items[].blocked_by).
// Two views: By request (one card per request) and All records (the engineer's
// flat view — every record, superseded ones dimmed).
//
// Real data only: /api/task-spec → cli/task.py list → store/tasks/TS-NNN.yaml.
// Nothing here is invented: no cost (no ledger link exists), no roles beyond
// what the records carry.
//
// Owner: dev · task-surface v4, 2026-08-24
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useShellFullBleed } from '@/components/Shell'
import type { TaskSpecItem } from '../chat/TasksPanel'
import './tasks.css'

type View = 'req' | 'rec'

const STCOL: Record<string, [string, string]> = {
  closed: ['#f2f2ee', '#6b6b74'],
  done: ['#eef4e2', '#587000'],
  executing: ['#ede8ff', '#592eff'],
  review: ['#e6f4f9', '#0a7ea6'],
  gated: ['#fdf8ec', '#8a6114'],
  approved: ['#ede8ff', '#592eff'],
  discovery: ['#f3f0ff', '#7c5cf0'],
  draft: ['#f2f2ee', '#6b6b74'],
}

function firstLine(s: string): string {
  return (s || '').split('\n')[0] || '(no source message)'
}

function accSummary(t: TaskSpecItem): string {
  const total = t.workItems.reduce((n, wi) => n + wi.acceptance.length, 0)
  if (total === 0) return 'not started'
  const met = t.workItems.reduce((n, wi) => n + wi.acceptance.filter((a) => a.status === 'pass').length, 0)
  return `${met} of ${total}`
}

/** Follow revision_of/derived_from links up to the root of the request. */
function followRoot(t: TaskSpecItem, byId: Map<string, TaskSpecItem>): string {
  let cur = t
  const seen = new Set<string>()
  while (cur.revisionOf || cur.derivedFrom) {
    if (seen.has(cur.id)) break
    seen.add(cur.id)
    const parent = byId.get(cur.revisionOf) ?? byId.get(cur.derivedFrom)
    if (!parent) break
    cur = parent
  }
  return cur.id
}

interface Group {
  root: TaskSpecItem
  kids: TaskSpecItem[]
}

export default function TasksPage() {
  const { setFullBleed } = useShellFullBleed()
  useEffect(() => {
    setFullBleed(true)
    return () => setFullBleed(false)
  }, [setFullBleed])

  const [tasks, setTasks] = useState<TaskSpecItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('req')

  useEffect(() => {
    let cancelled = false
    fetch('/api/task-spec')
      .then((r) => r.json())
      .then((data: { tasks?: TaskSpecItem[]; error?: string }) => {
        if (cancelled) return
        if (!data.tasks) throw new Error(data.error ?? 'no tasks returned')
        setTasks(data.tasks)
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const groups = useMemo<Group[]>(() => {
    const byId = new Map(tasks.map((t) => [t.id, t]))
    const map = new Map<string, Group>()
    for (const t of tasks) {
      const rootId = followRoot(t, byId)
      if (rootId === t.id) {
        if (!map.has(rootId)) map.set(rootId, { root: t, kids: [] })
      } else {
        const g = map.get(rootId) ?? { root: byId.get(rootId) ?? t, kids: [] }
        g.kids.push(t)
        map.set(rootId, g)
      }
    }
    return [...map.values()].sort((a, b) => (b.root.createdAt || '').localeCompare(a.root.createdAt || ''))
  }, [tasks])

  const activeId = tasks.find((t) => t.active)?.id

  return (
    <div className="lg-shell flex h-full flex-col overflow-hidden">
      <div className="lg-head flex items-center gap-3 px-6 pt-5 pb-3">
        <div>
          <h1 className="lg-title">Task lineage</h1>
          <p className="lg-sub">
            One request → its record chain. <b>revision_of</b> collapses to an attempt count ·{' '}
            <b>derived_from</b> nests one level.
          </p>
        </div>
        <div className="lg-toggle ml-auto">
          <button className={view === 'req' ? 'on' : ''} onClick={() => setView('req')} type="button">
            By request
          </button>
          <button className={view === 'rec' ? 'on' : ''} onClick={() => setView('rec')} type="button">
            All records
          </button>
        </div>
      </div>

      <div className="lg-scroll flex-1 overflow-y-auto px-6 pb-10">
        {loading && <div className="lg-empty">Loading…</div>}
        {error && <div className="lg-err">{error}</div>}
        {!loading && !error && tasks.length === 0 && (
          <div className="lg-empty">No TASK-SPEC records yet — store/tasks/ is empty.</div>
        )}

        {!loading && !error && view === 'rec' && (
          <div className="lg-grid">
            {tasks.map((t) => {
              const link = t.revisionOf ? `revision_of ${t.revisionOf}` : t.derivedFrom ? `derived_from ${t.derivedFrom}` : 'root'
              const superseded = Boolean(t.supersededBy)
              const st = superseded ? 'closed' : t.status
              return (
                <div key={t.id} className={superseded ? 'lg-card sup' : 'lg-card'} style={t.id === activeId ? { borderColor: '#592eff', boxShadow: '0 0 0 2px rgba(89,46,255,.14)' } : undefined}>
                  <div className="lg-tid">
                    <span>{t.id}</span>
                    <span className="lg-pill" style={STCOL[st] ? { background: STCOL[st][0], color: STCOL[st][1] } : undefined}>
                      {st}
                    </span>
                  </div>
                  <p className="lg-tt">{firstLine(t.sourceMessage)}</p>
                  <p className="lg-tm">
                    {t.lead || t.requester || '—'} · {accSummary(t)}
                    <br />
                    <span className="lg-lnk">{link}</span>
                    {superseded && <span className="lg-sup2"> · superseded by {t.supersededBy}</span>}
                    {t.blocked && <span className="lg-sup2"> · blocked</span>}
                  </p>
                </div>
              )
            })}
            <p className="lg-note" style={{ gridColumn: '1 / -1' }}>
              {tasks.length} cards for the whole ledger. This is the view that made you ask the question — and it is the
              right view <i>for an engineer picking up work</i>, which is why it stays available rather than being deleted.
            </p>
          </div>
        )}

        {!loading && !error && view === 'req' && (
          <div className="lg-stack">
            {groups.map(({ root, kids }) => {
              const doneKids = kids.filter((k) => k.status === 'done').length
              const pct = kids.length ? Math.round((doneKids / kids.length) * 100) : 0
              const attempts = kids.filter((k) => k.revisionOf).length + 1
              const rootSt = root.supersededBy ? 'closed' : root.status
              return (
                <div key={root.id} className="lg-rootcard">
                  <div className="lg-rh">
                    <div className="lg-rhm">
                      <p className="lg-rt2">{firstLine(root.sourceMessage)}</p>
                      <p className="lg-ra">{root.sourceMessage.replace(/\s+/g, ' ').slice(0, 120)}{root.sourceMessage.length > 120 ? '…' : ''}</p>
                    </div>
                    <div className="lg-rst">
                      <span className="lg-pill" style={STCOL[rootSt] ? { background: STCOL[rootSt][0], color: STCOL[rootSt][1] } : undefined}>
                        {rootSt}
                      </span>
                      <p className="lg-rid">{root.id}</p>
                    </div>
                  </div>
                  <div className="lg-rbar">
                    <div className="lg-rbf" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="lg-rmeta">
                    <span>
                      <b>{doneKids} of {kids.length}</b> steps done
                    </span>
                    <span>{root.lead || root.requester || '—'}</span>
                    {attempts > 1 && (
                      <span className="att">
                        <b>{attempts} attempts</b> · earlier ones superseded
                      </span>
                    )}
                  </div>
                  {kids.length > 0 && (
                    <div className="lg-kids">
                      {kids.map((k) => {
                        const link = k.revisionOf ? 'revision' : 'derived'
                        const note = k.blockedReason
                          ? ` · blocked: ${k.blockedReason.slice(0, 60)}`
                          : k.workItems.flatMap((wi) => wi.blockedBy).length
                            ? ` · blocked_by ${k.workItems.flatMap((wi) => wi.blockedBy).join(', ')}`
                            : ''
                        return (
                          <div key={k.id} className={k.id === activeId ? 'lg-kid now' : 'lg-kid'}>
                            <span className={k.status === 'done' ? 'lg-kdot ok' : k.status === 'draft' ? 'lg-kdot' : 'lg-kdot run'} />
                            <div className="lg-km">
                              <span className="lg-kr">{firstLine(k.sourceMessage)}</span>
                              <span className="lg-kn">
                                {k.id} · {k.lead || k.requester || '—'}
                                {note}
                              </span>
                            </div>
                            <span className={link === 'revision' ? 'lg-klk revision' : 'lg-klk derived'}>{link}</span>
                            <span className="lg-kac">{accSummary(k)}</span>
                            <span className="lg-pill" style={STCOL[k.status] ? { background: STCOL[k.status][0], color: STCOL[k.status][1] } : undefined}>
                              {k.status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <p className="lg-note">
                    <b>One card, because you asked for one thing.</b> The {attempts - 1} superseded attempt{attempts - 1 === 1 ? '' : 's'} never
                    appear{attempts - 1 === 1 ? 's' : ''} — <code>revision_of</code> collapses to a count, because a rework is a quality
                    signal rather than a thing to read. <code>derived_from</code> nests instead, because those are genuinely different
                    jobs with different owners.
                  </p>
                </div>
              )
            })}
            {groups.length === 0 && <div className="lg-empty">No records to group.</div>}
            <div className="lg-legend">
              <span>
                <b>revision_of</b> — same goal · collapses to an attempt count
              </span>
              <span>
                <b>derived_from</b> — different goal · nests one level
              </span>
              <span>
                <b>blocked_by</b> — ordering inside the fan-out
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
