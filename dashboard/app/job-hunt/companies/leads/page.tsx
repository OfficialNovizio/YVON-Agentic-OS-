'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui'
import { ArrowLeft, Loader2, Plus, X, Search, ExternalLink, Download, Square } from 'lucide-react'
import { INDUSTRIES, AddCompanyModal, type AddForm } from '../shared'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — COMPANIES / RAW LEADS (2026-08-15)
// ═══════════════════════════════════════════════════════════════════════════
// Raw, unverified company leads bulk-pulled from OrgBook BC (the BC
// government's free, public, official corporate-registry API — not
// scraped). Pulled live from this page via /api/job-hunt/companies/leads/
// fetch-batch (runs on whichever server is running this dashboard — dev or
// deployed, both have normal internet) or, as a fallback, via
// scripts/fetch-orgbook-leads.mjs run locally. Each row here is a real
// registered legal entity name and
// nothing else — no confirmed industry, city, size, or description. This
// page is where a human skims and promotes the real ones into the curated
// target_companies watchlist; it deliberately never writes to that table
// automatically.

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

  // "Pull leads now" — client-driven loop over OrgBook keywords/pages.
  // Each call hits fetch-batch for ONE page, so no single request risks a
  // serverless timeout; the delay + stop flag live here in the browser.
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

  return (
    <div>
      <div className="mb-4">
        <Link href="/job-hunt/companies" className="inline-flex items-center gap-1 text-[11.5px] text-on-surface-variant/70 hover:text-on-surface mb-2">
          <ArrowLeft size={12} /> Back to Companies
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Raw leads — British Columbia</h1>
        <p className="mt-1 text-sm text-on-surface-variant max-w-2xl">
          Real company names pulled from{' '}
          <a href="https://orgbook.gov.bc.ca" target="_blank" rel="noopener noreferrer" className="underline hover:text-on-surface">
            OrgBook BC
          </a>
          , the BC government&apos;s free public corporate registry — not scraped, not invented. Each row is just a
          registered legal name and status; nothing here is verified as a real employer worth applying to.
          Skim and <strong>promote</strong> the ones that look real to add them to your watchlist with full details.
        </p>
      </div>

      <Card className="p-3.5 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[12.5px] font-medium text-on-surface">Pull leads now</p>
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
              Runs live from this browser tab against OrgBook BC — 29 industry keywords, paginated, ~30 pages/keyword max.
              {pulling && ` ${pullCounts.seen} seen, ${pullCounts.upserted} upserted so far.`}
            </p>
          </div>
          {pulling ? (
            <button onClick={() => { stopRef.current = true }}
              className="shrink-0 flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-white/10 text-on-surface-variant hover:text-on-surface">
              <Square size={12} /> Stop
            </button>
          ) : (
            <button onClick={startPull}
              className="shrink-0 flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg bg-primary text-on-primary">
              <Download size={13} /> Pull leads now
            </button>
          )}
        </div>
        {pullLog.length > 0 && (
          <div className="mt-2.5 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-2 font-mono text-[10.5px] text-on-surface-variant/70 leading-relaxed">
            {pullLog.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setIndustryFilter(null)}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition ${!industryFilter ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
          All ({Object.values(stats).reduce((a, b) => a + b, 0)})
        </button>
        {INDUSTRIES.map((ind) => (
          <button key={ind} onClick={() => setIndustryFilter(ind)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition ${industryFilter === ind ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
            {ind} ({stats[ind] ?? 0})
          </button>
        ))}
        {totalUnclassified > 0 && (
          <button onClick={() => setIndustryFilter('unclassified')}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition ${industryFilter === 'unclassified' ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
            Unclassified ({totalUnclassified})
          </button>
        )}
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button onClick={() => setActiveOnly((v) => !v)}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition ${activeOnly ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
          Active registrations only
        </button>
        <div className="relative ml-auto">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name…"
            className="text-[11.5px] pl-7 pr-2.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-white/25 w-48" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 size={20} className="animate-spin text-on-surface-variant" /></div>
      ) : leads.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-on-surface-variant/70">
            No leads match this filter yet. Click <strong>Pull leads now</strong> above to fetch some from OrgBook BC.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 mb-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="p-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12.5px] font-medium text-on-surface truncate">{lead.name}</span>
                    {lead.industry_guess && (
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-white/5 text-on-surface-variant/70">{lead.industry_guess}</span>
                    )}
                    {lead.entity_status && (
                      <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full ${lead.entity_status === 'ACT' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-on-surface-variant/50'}`}>
                        {lead.entity_status === 'ACT' ? 'active' : lead.entity_status.toLowerCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-on-surface-variant/50 mt-0.5">
                    {lead.registration_id} · matched &quot;{lead.matched_keyword}&quot;
                    {' · '}
                    <a href={`https://orgbook.gov.bc.ca/entity/${lead.registration_id}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 hover:text-on-surface">
                      verify on OrgBook <ExternalLink size={9} />
                    </a>
                  </p>
                </div>
                <button onClick={() => openPromote(lead)}
                  className="shrink-0 flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-primary text-on-primary">
                  <Plus size={11} /> Promote
                </button>
                <button onClick={() => dismiss(lead)}
                  className="shrink-0 flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-white/10 text-on-surface-variant/60 hover:text-on-surface">
                  <X size={11} /> Dismiss
                </button>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11.5px] text-on-surface-variant/60">
            <span>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                className="px-2.5 py-1 rounded-lg border border-white/10 disabled:opacity-30">Previous</button>
              <button disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset((o) => o + PAGE_SIZE)}
                className="px-2.5 py-1 rounded-lg border border-white/10 disabled:opacity-30">Next</button>
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
  )
}
