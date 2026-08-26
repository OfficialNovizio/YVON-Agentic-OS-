'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, X, Search, ExternalLink, Download, Square } from 'lucide-react'
import { INDUSTRIES, AddCompanyModal, type AddForm } from '../shared'
import { AtelierBackdrop, Squiggle } from '../../../chat/Atelier'
import '../../../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — COMPANIES / RAW LEADS (2026-08-15 · Adora restyle 2026-08-25)
// ═══════════════════════════════════════════════════════════════════════════
// Raw, unverified company leads bulk-pulled from OrgBook BC (the BC
// government's free, public, official corporate-registry API — not
// scraped). Since 2026-08-25 the nightly VPS puller
// (vps-scripts/fetch-orgbook-bc-leads.py) enumerates the FULL registry —
// every active BC business, hiring or not — into company_leads, page by
// page. This page lists them at 50/page; a human skims and promotes the
// real ones into the curated target_companies watchlist; it deliberately
// never writes to that table automatically.
//
// Adora treatment: same gallery surface as /chat and /task-board — shell
// canvas, painterly washes, display face, glass cards.

interface Lead {
  id: string
  name: string
  registration_id: string
  entity_status: string | null
  entity_type: string | null
  matched_keyword: string | null
  industry_guess: string | null
  province: string
  promoted: boolean
  dismissed: boolean
}

interface FetchBatchResult {
  error?: string
  seen: number
  upserted: number
  next: string | null
  total: number
}

const PAGE_SIZE = 50

export default function CompanyLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [industryFilter, setIndustryFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(true)
  const [offset, setOffset] = useState(0)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [addModal, setAddModal] = useState<{ open: boolean; prefill?: Partial<AddForm>; leadId?: string }>({ open: false })

  // "Pull leads now" — client-driven loop over OrgBook keywords/pages
  // (legacy keyword path; the nightly full-registry puller supersedes it).
  const [pulling, setPulling] = useState(false)
  const [pullLog, setPullLog] = useState<string[]>([])
  const [pullCounts, setPullCounts] = useState({ seen: 0, upserted: 0 })
  const stopRef = useRef(false)
  const MAX_PAGES_PER_KEYWORD = 30 // ~300 results/keyword, matches the CLI script's default cap

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/job-hunt/companies/leads/stats')
      const data = await res.json()
      setStats(data.counts ?? {})
    } catch {
      setStats({})
    }
  }, [])
  useEffect(() => { loadStats() }, [loadStats])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (industryFilter) params.set('industry', industryFilter)
      if (search.trim()) params.set('search', search.trim())
      if (activeOnly) params.set('status', 'ACT')
      params.set('limit', String(PAGE_SIZE))
      params.set('offset', String(offset))
      const res = await fetch(`/api/job-hunt/companies/leads?${params}`)
      const data = await res.json()
      setLeads(data.leads ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setLeads([])
    }
    setLoading(false)
  }, [industryFilter, search, activeOnly, offset])

  useEffect(() => { setOffset(0) }, [industryFilter, search, activeOnly])
  useEffect(() => { load() }, [load])

  const log = useCallback((line: string) => {
    setPullLog((prev) => [...prev.slice(-60), line])
  }, [])

  const startPull = useCallback(async () => {
    setPulling(true)
    stopRef.current = false
    setPullLog([])
    setPullCounts({ seen: 0, upserted: 0 })

    try {
      const kwRes = await fetch('/api/job-hunt/companies/leads/fetch-batch')
      const { keywords } = await kwRes.json()

      for (const keyword of keywords as string[]) {
        if (stopRef.current) break
        log(`▶ "${keyword}"`)
        let next: string | null = null
        let page = 0

        while (page < MAX_PAGES_PER_KEYWORD) {
          if (stopRef.current) break
          const res: Response = await fetch('/api/job-hunt/companies/leads/fetch-batch', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(next ? { url: next } : { keyword }),
          })
          const data: FetchBatchResult = await res.json()
          if (!res.ok) { log(`  ✗ ${data.error ?? 'error'}`); break }

          page += 1
          setPullCounts((prev) => ({ seen: prev.seen + data.seen, upserted: prev.upserted + data.upserted }))
          log(`  page ${page}: +${data.seen} (of ${data.total} total for this term)`)

          next = data.next
          if (!next) break
          await new Promise((r) => setTimeout(r, 250)) // politeness delay, same as the CLI script
        }
      }
      log(stopRef.current ? '■ stopped' : '✓ done — all keywords complete')
    } catch (err) {
      log(`✗ fatal: ${String(err instanceof Error ? err.message : err)}`)
    }

    setPulling(false)
    loadStats()
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log, loadStats, load])

  const dismiss = useCallback(async (lead: Lead) => {
    setLeads((prev) => prev.filter((l) => l.id !== lead.id))
    await fetch('/api/job-hunt/companies/leads', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, dismissed: true }),
    })
    loadStats()
  }, [loadStats])

  const openPromote = (lead: Lead) => {
    setAddModal({
      open: true,
      leadId: lead.id,
      prefill: { name: lead.name, province: 'BC', industry: lead.industry_guess ?? '' },
    })
  }

  const onPromoted = useCallback(async () => {
    if (addModal.leadId) {
      setLeads((prev) => prev.filter((l) => l.id !== addModal.leadId))
      await fetch('/api/job-hunt/companies/leads', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: addModal.leadId, promoted: true }),
      })
      loadStats()
    }
  }, [addModal.leadId, loadStats])

  const totalUnclassified = stats.unclassified ?? 0
  const totalAll = Object.values(stats).reduce((a, b) => a + b, 0)

  const chip = (active: boolean) =>
    `rounded-[200px] px-3 py-1.5 text-[11.5px] font-medium transition border transition-colors ` +
    (active
      ? 'border-transparent bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]'
      : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)] hover:border-[var(--chat-text-faint)]')

  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <Link href="/job-hunt/companies" className="mb-3 inline-flex items-center gap-1 text-[11.5px] text-[var(--chat-text-dim)] hover:text-[var(--chat-accent)]">
          <ArrowLeft size={12} /> Back to Companies
        </Link>
        <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
          <Squiggle>Raw leads</Squiggle> — British Columbia
        </h1>
        <p className="mt-2 max-w-[640px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
          Real company names pulled from{' '}
          <a href="https://orgbook.gov.bc.ca" target="_blank" rel="noopener noreferrer" className="text-[var(--chat-accent)] underline hover:opacity-80">
            OrgBook BC
          </a>
          , the BC government&apos;s free public corporate registry — not scraped, not invented. The nightly puller
          enumerates the full registry: every active BC business, hiring or not. Skim and{' '}
          <strong className="text-[var(--chat-body)]">promote</strong> the ones worth applying to.
        </p>

        {/* Pull card — legacy keyword path; the nightly full-registry pull supersedes it */}
        <div className="chat-glass mt-6 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[12.5px] font-semibold text-[var(--chat-body)]">Pull leads now</p>
              <p className="mt-0.5 text-[11px] text-[var(--chat-text-dim)]">
                Legacy keyword pull from this tab. The nightly full-registry puller already fills this page — this is
                for immediate small refreshes.
                {pulling && ` ${pullCounts.seen} seen, ${pullCounts.upserted} upserted so far.`}
              </p>
            </div>
            {pulling ? (
              <button onClick={() => { stopRef.current = true }} className="chat-ghost-btn flex shrink-0 items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px]">
                <Square size={12} /> Stop
              </button>
            ) : (
              <button onClick={startPull}
                className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#592eff] px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-[#4520cc]">
                <Download size={13} /> Pull leads now
              </button>
            )}
          </div>
          {pullLog.length > 0 && (
            <div className="mt-2.5 max-h-40 overflow-y-auto rounded-[12px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] p-2.5 font-mono text-[10.5px] leading-relaxed text-[var(--chat-text-dim)]">
              {pullLog.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button onClick={() => setIndustryFilter(null)} className={chip(!industryFilter)}>
            All ({totalAll})
          </button>
          {INDUSTRIES.map((ind) => (
            <button key={ind} onClick={() => setIndustryFilter(ind)} className={chip(industryFilter === ind)}>
              {ind} ({stats[ind] ?? 0})
            </button>
          ))}
          {totalUnclassified > 0 && (
            <button onClick={() => setIndustryFilter('unclassified')} className={chip(industryFilter === 'unclassified')}>
              Unclassified ({totalUnclassified})
            </button>
          )}
          <div className="mx-1 h-4 w-px bg-[var(--chat-hairline)]" />
          <button onClick={() => setActiveOnly((v) => !v)} className={chip(activeOnly)}>
            Active registrations only
          </button>
          <div className="relative ml-auto">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--chat-text-faint)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name…"
              className="w-48 rounded-[200px] border border-[var(--chat-hairline)] bg-white py-1.5 pl-8 pr-3 text-[11.5px] text-[var(--chat-body)] outline-none placeholder:text-[var(--chat-text-faint)] focus:border-[var(--chat-accent)]"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 size={20} className="animate-spin text-[var(--chat-text-faint)]" />
          </div>
        ) : leads.length === 0 ? (
          <div className="chat-glass mt-4 p-8 text-center">
            <p className="text-sm text-[var(--chat-text-dim)]">
              No leads match this filter yet. The nightly puller keeps the full BC registry here — or click{' '}
              <strong className="text-[var(--chat-body)]">Pull leads now</strong> above for an immediate refresh.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-2">
              {leads.map((lead) => (
                <div key={lead.id} className="chat-glass flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[13px] font-semibold text-[var(--chat-body)]">{lead.name}</span>
                      {lead.industry_guess && (
                        <span className="rounded-[200px] bg-[rgba(89,46,255,0.07)] px-2 py-0.5 text-[9.5px] font-medium text-[var(--chat-accent)]">
                          {lead.industry_guess}
                        </span>
                      )}
                      {lead.entity_status && (
                        <span className={`rounded-[200px] px-2 py-0.5 text-[9.5px] font-medium ${lead.entity_status === 'ACT' ? 'bg-[rgba(16,185,129,0.12)] text-[#047857]' : 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]'}`}>
                          {lead.entity_status === 'ACT' ? 'active' : lead.entity_status.toLowerCase()}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10.5px] text-[var(--chat-text-faint)]">
                      {lead.registration_id}
                      {lead.matched_keyword && <> · matched &quot;{lead.matched_keyword}&quot;</>}
                      {!lead.matched_keyword && <> · full-registry pull</>}
                      {!lead.registration_id.startsWith('topic:') && (
                        <>
                          {' · '}
                          <a
                            href={`https://orgbook.gov.bc.ca/entity/${lead.registration_id}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[var(--chat-accent)] hover:opacity-80"
                          >
                            verify on OrgBook <ExternalLink size={9} />
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => openPromote(lead)}
                    className="flex shrink-0 items-center gap-1 rounded-[10px] bg-[#592eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4520cc]"
                  >
                    <Plus size={11} /> Promote
                  </button>
                  <button
                    onClick={() => dismiss(lead)}
                    className="chat-ghost-btn flex shrink-0 items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-[11px]"
                  >
                    <X size={11} /> Dismiss
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[11.5px] text-[var(--chat-text-dim)]">
              <span>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}</span>
              <div className="flex gap-2">
                <button
                  disabled={offset === 0}
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                  className="chat-ghost-btn rounded-[10px] px-3 py-1.5 disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  disabled={offset + PAGE_SIZE >= total}
                  onClick={() => setOffset((o) => o + PAGE_SIZE)}
                  className="chat-ghost-btn rounded-[10px] px-3 py-1.5 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        <AddCompanyModal
          open={addModal.open}
          prefill={addModal.prefill}
          onClose={() => setAddModal({ open: false })}
          onSaved={onPromoted}
        />
      </div>
    </div>
  )
}
