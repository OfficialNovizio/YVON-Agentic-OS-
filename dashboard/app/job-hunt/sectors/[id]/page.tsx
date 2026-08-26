'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ExternalLink, Loader2, TrendingUp, DollarSign, ShieldCheck, Send } from 'lucide-react'
import { AtelierBackdrop, Squiggle } from '../../../chat/Atelier'
import '../../../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — SECTOR DETAIL (2026-08-25)
//  One sector: its demand/pay/PR profile plus the live postings matching its
//  keywords, with fit + PR tags and an Apply button straight into the hub.
// ═══════════════════════════════════════════════════════════════════════════

interface Sector {
  id: string; name: string; description: string | null; keywords: string[]
  demand: string | null; typical_pay: string | null; pr_value: string | null; teer: string | null
}
interface Posting {
  id: string; title: string; company: string; location: string | null; url: string
  source: string; salary_min: number | null; salary_max: number | null; posted_at: string | null
  fit_score: number | null; teer_category: string | null; canadian_exp: boolean | null; bc_pnp_indemand: boolean | null
}

const DEMAND_TONE: Record<string, string> = { high: 'bg-[rgba(16,185,129,0.12)] text-[#047857]', medium: 'bg-[rgba(138,97,20,0.12)] text-[#8a6114]', low: 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]' }
const PR_TONE: Record<string, string> = { excellent: 'bg-[rgba(16,185,129,0.12)] text-[#047857]', good: 'bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]', moderate: 'bg-[rgba(138,97,20,0.12)] text-[#8a6114]' }

export default function SectorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [sector, setSector] = useState<Sector | null>(null)
  const [postings, setPostings] = useState<Posting[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/job-hunt/sectors/${id}`)
      const data = await res.json()
      setSector(data.sector ?? null)
      setPostings(data.postings ?? [])
    } catch { setSector(null); setPostings([]) }
    setLoading(false)
  }, [id])
  useEffect(() => { load() }, [load])

  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />
      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <Link href="/job-hunt/sectors" className="mb-3 inline-flex items-center gap-1 text-[11.5px] text-[var(--chat-text-dim)] hover:text-[var(--chat-accent)]">← Back to Sector Explorer</Link>

        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--chat-text-faint)]" /></div>
        ) : !sector ? (
          <p className="py-8 text-center text-sm italic text-[var(--chat-text-faint)]">Sector not found.</p>
        ) : (
          <>
            <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
              <Squiggle>{sector.name}</Squiggle>
            </h1>
            {sector.description && <p className="mt-2 max-w-[680px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">{sector.description}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {sector.demand && (
                <span className={`flex items-center gap-1 rounded-[200px] px-2.5 py-1 text-[11px] font-bold capitalize ${DEMAND_TONE[sector.demand] ?? ''}`}>
                  <TrendingUp size={11} /> {sector.demand} demand
                </span>
              )}
              {sector.typical_pay && (
                <span className="flex items-center gap-1 rounded-[200px] bg-[var(--chat-surface-strong)] px-2.5 py-1 text-[11px] font-semibold text-[var(--chat-text-dim)]">
                  <DollarSign size={11} /> {sector.typical_pay}
                </span>
              )}
              {sector.pr_value && (
                <span className={`flex items-center gap-1 rounded-[200px] px-2.5 py-1 text-[11px] font-bold capitalize ${PR_TONE[sector.pr_value] ?? ''}`}>
                  <ShieldCheck size={11} /> PR {sector.pr_value}
                </span>
              )}
              {sector.teer && <span className="rounded-[200px] bg-[var(--chat-surface-strong)] px-2.5 py-1 text-[11px] text-[var(--chat-text-faint)]">TEER {sector.teer}</span>}
              <span className="rounded-[200px] px-2.5 py-1 text-[11px] font-semibold text-[var(--chat-text-faint)]">{postings.length} live postings</span>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {postings.length === 0 ? (
                <p className="py-8 text-center text-sm italic text-[var(--chat-text-faint)]">
                  No postings match this sector yet — run a pull (Pull 60 days) and they'll appear here.
                </p>
              ) : postings.map((p) => (
                <div key={p.id} className="chat-glass flex items-start justify-between gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[13px] font-semibold text-[var(--chat-body)] hover:underline">
                        {p.title} <ExternalLink size={10} className="opacity-50" />
                      </a>
                      <span className="rounded border border-[var(--chat-hairline)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--chat-text-faint)]">{p.source}</span>
                      {typeof p.fit_score === 'number' && (
                        <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--chat-accent)]">fit {p.fit_score}</span>
                      )}
                      {p.bc_pnp_indemand && (
                        <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--chat-accent)]">BC-PNP</span>
                      )}
                      {p.canadian_exp && (
                        <span className="rounded-[200px] bg-[rgba(16,185,129,0.12)] px-1.5 py-0.5 text-[10px] font-bold text-[#047857]">Can-exp</span>
                      )}
                      {p.teer_category && <span className="rounded-[200px] bg-[var(--chat-surface-strong)] px-1.5 py-0.5 text-[10px] text-[var(--chat-text-faint)]">TEER {p.teer_category}</span>}
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--chat-text-faint)]">
                      {p.company}{p.location ? ` · ${p.location}` : ''}
                      {p.salary_min || p.salary_max ? ` · ${p.salary_min ?? '?'}–${p.salary_max ?? '?'}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch('/api/job-hunt/apply', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ posting_id: p.id }),
                      })
                      window.location.href = '/job-hunt/apply'
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-[10px] bg-[#047857] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#036149]"
                  >
                    <Send size={11} /> Apply
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
