'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2, Trash2, FileText, Briefcase } from 'lucide-react'
import { AtelierBackdrop, Squiggle } from '../../chat/Atelier'
import '../../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — APPLY HUB (2026-08-25)
//  The board of jobs ready to apply: add from Companies (Apply button), drop
//  freely, bind each row to a resume variant, move status prepared →
//  reviewing → applied. Applying always happens on the real site by the
//  operator — this prepares and tracks; nothing sends or submits.
// ═══════════════════════════════════════════════════════════════════════════

interface QueueRow {
  id: string
  posting_id: string
  resume_variant: string
  cover_letter: string | null
  status: string
  notes: string | null
  fit: { score: number; vetoed: boolean; vetoReason: string | null } | null
  pr: { score: number; bcPnpInDemand: boolean; canadianExp: boolean } | null
  posting: {
    id: string; title: string; company: string; location: string | null
    url: string; salary_min: number | null; salary_max: number | null; source: string
  } | null
}

const STATUSES = ['prepared', 'reviewing', 'applied', 'interview', 'offer', 'rejected']

export default function JobHuntApplyPage() {
  const [queue, setQueue] = useState<QueueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sectors, setSectors] = useState<Record<string, { queries: string[]; enabled: boolean }> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-hunt/apply')
      const data = await res.json()
      setQueue(data.queue ?? [])
    } catch { setQueue([]) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch('/api/job-hunt/sync-config').then((r) => r.json()).then((d) => { if (d.config) setSectors(d.config) }).catch(() => {})
  }, [])

  const update = useCallback(async (id: string, patch: Record<string, unknown>) => {
    await fetch('/api/job-hunt/apply', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    })
    load()
  }, [load])

  const drop = useCallback(async (id: string) => {
    await fetch(`/api/job-hunt/apply?id=${id}`, { method: 'DELETE' })
    load()
  }, [load])

  const variantOptions = sectors ? Object.entries(sectors).filter(([, s]) => s.enabled).map(([name]) => name) : []

  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <Link href="/job-hunt" className="mb-3 inline-flex items-center gap-1 text-[11.5px] text-[var(--chat-text-dim)] hover:text-[var(--chat-accent)]">← Back to Job Hunt</Link>
        <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
          <Squiggle>Apply Hub</Squiggle>
        </h1>
        <p className="mt-2 max-w-[680px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
          Jobs you're preparing to apply to — added from Companies, each bound to a resume variant. Applying always
          happens on the real site, by you; this tracks and prepares.
        </p>

        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--chat-text-faint)]" /></div>
        ) : queue.length === 0 ? (
          <div className="chat-glass mt-6 p-10 text-center">
            <Briefcase size={22} className="mx-auto text-[var(--chat-text-faint)]" />
            <p className="mt-2 text-[13px] text-[var(--chat-text-dim)]">
              Queue is empty — hit <strong className="text-[var(--chat-body)]">Apply</strong> on a hiring company's posting in Companies to add it here.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {queue.map((q) => (
              <div key={q.id} className="chat-glass flex flex-col gap-2 p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <a href={q.posting?.url} target="_blank" rel="noopener noreferrer" className="text-[13.5px] font-semibold text-[var(--chat-body)] hover:underline">
                      {q.posting?.title ?? 'Posting removed'} <ExternalLink size={10} className="inline opacity-50" />
                    </a>
                    <p className="mt-0.5 text-[11px] text-[var(--chat-text-faint)]">
                      {q.posting?.company}{q.posting?.location ? ` · ${q.posting.location}` : ''} · {q.posting?.source}
                      {q.posting?.salary_min || q.posting?.salary_max ? ` · ${q.posting.salary_min ?? '?'}–${q.posting.salary_max ?? '?'}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {typeof q.fit?.score === 'number' && (
                      <span className={`rounded-[200px] px-2 py-0.5 text-[10.5px] font-bold ${q.fit.vetoed ? 'bg-[rgba(239,68,68,0.12)] text-[#b91c1c]' : 'bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]'}`}>
                        {q.fit.vetoed ? 'vetoed' : `fit ${q.fit.score}`}
                      </span>
                    )}
                    {q.pr?.bcPnpInDemand && (
                      <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--chat-accent)]" title="PR heuristic">PR {q.pr.score}</span>
                    )}
                    <button onClick={() => drop(q.id)} className="rounded-[10px] border border-[var(--chat-hairline)] p-1.5 text-[var(--chat-text-faint)] hover:text-[#b91c1c]" title="Drop from queue">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] text-[var(--chat-text-faint)]">
                    <FileText size={11} /> resume:
                  </span>
                  <select value={q.resume_variant} onChange={(e) => update(q.id, { resume_variant: e.target.value })}
                    className="rounded-[200px] border border-[var(--chat-hairline)] bg-white px-2.5 py-1 text-[11px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]">
                    <option value="default">default</option>
                    {variantOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>

                  <div className="mx-1 h-4 w-px bg-[var(--chat-hairline)]" />

                  <span className="text-[11px] text-[var(--chat-text-faint)]">status:</span>
                  <div className="flex flex-wrap gap-1">
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => update(q.id, { status: s })}
                        className={`rounded-[200px] px-2.5 py-1 text-[10.5px] font-semibold capitalize transition border ${
                          q.status === s
                            ? 'border-transparent bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]'
                            : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)] hover:border-[var(--chat-text-faint)]'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {q.status === 'applied' && (
                  <p className="text-[11px] text-[#047857]">Marked applied — move to interview/offer/rejected as the process advances.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
