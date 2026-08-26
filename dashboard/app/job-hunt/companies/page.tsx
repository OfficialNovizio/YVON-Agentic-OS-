'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ExternalLink, MapPin, Building2, Loader2, ListChecks, Briefcase, Search, Send, Download, RefreshCw, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { PROVINCES, citiesFor } from '@/lib/job-hunt/canada-geo'
import { INDUSTRIES, MultiSelect } from './shared'
import { AtelierBackdrop, Squiggle } from '../../chat/Atelier'
import '../../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — COMPANIES (2026-08-15 · Adora restyle · Discover-merge 2026-08-25)
// ═══════════════════════════════════════════════════════════════════════════
// The one place for jobs + employers (Discover features merged in):
//   · PULL 60 DAYS / QUICK SYNC — the async pull (runs every saved sector;
//     Adzuna/Remotive/Arbeitnow directly, Indeed/LinkedIn via the VPS boards
//     script), live progress panel, cancel.
//   · Platform (source) filter dropdown + pagination on the hiring list.
//   · Hiring cards show top postings with location, source, TEER, PR
//     compatibility (heuristic), and pay — plus per-company TEER 0–2 and
//     BC-PNP counts.
//   · Watchlist unchanged — curated target_companies, star to watch.
// BC is the default province filter.
// ═══════════════════════════════════════════════════════════════════════════

interface HiringCompany {
  name: string
  locations: string[]
  sources: string[]
  postingCount: number
  sampleUrl: string | null
  samplePostingId: string | null
  onWatchlist: boolean
  teerCounts: Record<string, number>
  bcPnp: number
  canExp: number
  payMin: number | null
  payMax: number | null
  postings: {
    id: string; title: string; location: string | null; source: string | null
    teer: string | null; bcPnp: boolean; canExp: boolean
    salaryMin: number | null; salaryMax: number | null; salaryCurrency: string | null
    url: string | null; prScore: number
  }[]
}

interface PullState {
  status: string
  stepsDone: number
  stepsTotal: number
  etaSec: number | null
  perSource: Record<string, { count: number; skipped: string | null; error?: string }>
  log: string[]
  error: string | null
}

interface JobPosting {
  id: string; title: string; company: string; location: string | null; source: string | null
  teer: string | null; bcPnp: boolean; canExp: boolean
  salaryMin: number | null; salaryMax: number | null; salaryCurrency: string | null
  url: string | null; postedAt: string | null; prScore: number
  fitScore: number; fitVetoed: boolean
}

const PAGE_SIZE = 24
const JOBS_PAGE_SIZE = 48
const PLATFORMS = [
  { value: 'adzuna', label: 'Adzuna' },
  { value: 'remoteok', label: 'RemoteOK' },
  { value: 'remotive', label: 'Remotive' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'linkedin', label: 'LinkedIn' },
]
// Every source gets a card in the pull panel — including Indeed/LinkedIn,
// which always show their status (count, skipped, or the classified error).
const ALL_SOURCES = PLATFORMS

const chip = (active: boolean) =>
  `rounded-[200px] px-3 py-1.5 text-[11.5px] font-medium transition border transition-colors ` +
  (active
    ? 'border-transparent bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]'
    : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)] hover:border-[var(--chat-text-faint)]')

const prTone = (score: number) =>
  score >= 65 ? 'bg-[rgba(16,185,129,0.12)] text-[#047857]'
  : score >= 35 ? 'bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]'
  : 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]'

export default function JobHuntCompaniesPage() {
  const [hiring, setHiring] = useState<HiringCompany[]>([])
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [viewMode, setViewMode] = useState<'jobs' | 'companies'>('jobs')
  const [sortMode, setSortMode] = useState<'fit' | 'newest'>('fit')
  const [sortOpen, setSortOpen] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [recentCount, setRecentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [industryFilter, setIndustryFilter] = useState<string | null>(null)
  const [provinceFilter, setProvinceFilter] = useState<string[]>([]) // All provinces — every pulled posting shows
  const [cityFilter, setCityFilter] = useState<string[]>([])
  const [platformFilter, setPlatformFilter] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [leadCount, setLeadCount] = useState<number | null>(null)
  // Industry chips follow the SAVED sectors (sync-config), like Discover.
  const [sectorOptions, setSectorOptions] = useState<string[]>([])
  useEffect(() => {
    fetch('/api/job-hunt/sync-config')
      .then((r) => r.json())
      .then((d: { config?: Record<string, { queries: string[]; enabled: boolean }> }) => {
        if (d.config) setSectorOptions(Object.keys(d.config).filter((k) => d.config?.[k].enabled))
      })
      .catch(() => {})
  }, [])

  // Async pull — Pull 60 days / Quick sync, with live progress (merged from Discover).
  const [pullJobId, setPullJobId] = useState<string | null>(null)
  const [pull, setPull] = useState<PullState | null>(null)
  const [pullError, setPullError] = useState<string | null>(null)

  // Live BC-directory count — the full OrgBook registry lives in company_leads.
  useEffect(() => {
    fetch('/api/job-hunt/companies/leads/stats')
      .then((r) => r.json())
      .then((d) => {
        const counts = d.counts ?? {}
        setLeadCount(Object.values(counts as Record<string, number>).reduce((a: number, b) => a + (b ?? 0), 0))
      })
      .catch(() => {})
  }, [])

  const cityOptions = useMemo(() => citiesFor(provinceFilter), [provinceFilter])
  useEffect(() => {
    setCityFilter((prev) => prev.filter((c) => cityOptions.includes(c)))
  }, [cityOptions])

  const pageSize = viewMode === 'jobs' ? JOBS_PAGE_SIZE : PAGE_SIZE

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (industryFilter) params.set('industries', industryFilter)
      if (provinceFilter.length) params.set('provinces', provinceFilter.join(','))
      if (cityFilter.length) params.set('cities', cityFilter.join(','))
      if (platformFilter.length) params.set('sources', platformFilter.join(','))
      params.set('view', viewMode)
      params.set('sort', sortMode)
      params.set('offset', String(page * pageSize))
      params.set('limit', String(pageSize))
      const res = await fetch(`/api/job-hunt/companies?${params}`)
      const data = await res.json()
      setHiring(data.hiring ?? [])
      setJobs(data.jobs ?? [])
      setTotal(data.total ?? 0)
      setRecentCount(data.recentCount ?? 0)
    } catch {
      setHiring([])
      setJobs([])
    }
    setLoading(false)
  }, [industryFilter, provinceFilter, cityFilter, platformFilter, viewMode, sortMode, page, pageSize])

  useEffect(() => { load() }, [load])

  const startPullJob = useCallback(async (mode: 'deep' | 'quick') => {
    setPullError(null)
    try {
      const res = await fetch('/api/job-hunt/pull', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      const data = await res.json()
      if (!data.ok || !data.jobId) { setPullError(data.error ?? 'could not start pull'); return }
      setPullJobId(data.jobId)
      setPull({ status: 'running', stepsDone: 0, stepsTotal: 0, etaSec: null, perSource: {}, log: [], error: null })
    } catch {
      setPullError('could not start pull')
    }
  }, [])

  const cancelPull = useCallback(async () => {
    if (!pullJobId) return
    await fetch('/api/job-hunt/pull', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: pullJobId, cancel: true }),
    })
  }, [pullJobId])

  // Poll the running job every 2s; a 404 means the job is GONE (server
  // restarted — jobs live in server memory) — surface it, don't poll a ghost.
  useEffect(() => {
    if (!pullJobId) return
    let stopped = false
    const tick = async () => {
      try {
        const res = await fetch(`/api/job-hunt/pull?jobId=${encodeURIComponent(pullJobId)}`)
        if (res.status === 404) {
          if (!stopped) {
            clearInterval(interval)
            setPullJobId(null)
            setPullError('Pull job was lost — the server restarted mid-pull (jobs live in server memory). Start a new pull; avoid editing files while it runs.')
          }
          return
        }
        const data = await res.json()
        if (data.status) setPull(data)
        if (data.status === 'lost') {
          // Server restarted mid-pull — show the recovered progress, then
          // AUTO-RESTART. Safe: every insert dedupes on (source, external_id),
          // so re-running never duplicates — just refetches.
          clearInterval(interval)
          setPullJobId(null)
          setPull(data)
          setPullError('Pull job was lost — the server restarted mid-pull. Auto-restarting it now (no duplicates — pulls are idempotent).')
          setTimeout(() => { startPullJob(data.mode === 'deep' ? 'deep' : 'quick') }, 2500)
          return
        }
        if (data.status === 'done' || data.status === 'error' || data.status === 'cancelled') {
          clearInterval(interval)
          setPullJobId(null)
          await load()
        }
      } catch { /* transient */ }
    }
    const interval = setInterval(tick, 2000)
    tick()
    return () => { stopped = true; clearInterval(interval) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullJobId, load])

  // Search applies to both views (within the current page).
  const visibleHiring = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return hiring
    return hiring.filter((h) => h.name.toLowerCase().includes(q))
  }, [hiring, search])

  const visibleJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q))
  }, [jobs, search])

  const provLabel = provinceFilter.length === 0 ? 'all of Canada' : provinceFilter.length === 1 ? (PROVINCES.find((p) => p.code === provinceFilter[0])?.name ?? provinceFilter[0]) : 'the selected provinces'
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
              <Squiggle>Companies</Squiggle>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
              Pull 60 days of jobs, ranked by your chance of being hired (fit score), with PR compatibility, TEER,
              platform, and pay on every card. Switch to Company view to group by employer.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              onClick={() => startPullJob('deep')}
              disabled={pullJobId !== null}
              title="Pull 60 days of postings across every saved sector — takes ~10–15 min, live progress"
              className="flex items-center gap-1.5 rounded-[10px] bg-[#592eff] px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-[#4520cc] disabled:opacity-50"
            >
              {pullJobId !== null ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Pull 60 days
            </button>
            <button
              onClick={() => startPullJob('quick')}
              disabled={pullJobId !== null}
              title="Quick incremental sync — only the newest postings"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[var(--chat-hairline)] bg-white px-3.5 py-2 text-[12px] font-semibold text-[var(--chat-text-dim)] hover:border-[var(--chat-accent)] hover:text-[var(--chat-accent)] disabled:opacity-50"
            >
              <RefreshCw size={13} /> Quick sync
            </button>
            <Link
              href="/job-hunt/companies/leads"
              className="chat-ghost-btn flex items-center gap-1.5 rounded-[200px] px-3.5 py-2 text-[12px] font-medium"
            >
              <ListChecks size={13} /> Raw leads (BC)
            </Link>
          </div>
        </div>

        {leadCount !== null && leadCount > 0 && (
          <div className="chat-glass mt-6 flex flex-wrap items-center gap-2 p-3.5">
            <ListChecks size={14} className="text-[var(--chat-accent)]" />
            <p className="flex-1 text-[12.5px] text-[var(--chat-text-dim)]">
              The full BC registry ({leadCount.toLocaleString()} businesses, hiring or not) lives in the raw leads directory.
            </p>
            <Link href="/job-hunt/companies/leads" className="whitespace-nowrap rounded-[10px] bg-[#592eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4520cc]">
              Browse BC directory
            </Link>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button onClick={() => { setIndustryFilter(null); setPage(0) }} className={chip(!industryFilter)}>
            All industries
          </button>
          {(sectorOptions.length > 0 ? sectorOptions : INDUSTRIES).map((ind) => (
            <button key={ind} onClick={() => { setIndustryFilter(ind); setPage(0) }} className={chip(industryFilter === ind)}>
              {ind}
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-[var(--chat-hairline)]" />
          <MultiSelect
            label="Province"
            allLabel="All provinces"
            options={PROVINCES.map((p) => ({ value: p.code, label: `${p.name} (${p.code})` }))}
            selected={provinceFilter}
            onChange={(v) => { setProvinceFilter(v); setPage(0) }}
          />
          <MultiSelect
            label="City"
            allLabel={provinceFilter.length ? 'All cities in province' : 'All cities (Canada)'}
            options={cityOptions.map((c) => ({ value: c, label: c }))}
            selected={cityFilter}
            onChange={(v) => { setCityFilter(v); setPage(0) }}
            searchable
          />
          <div className="mx-1 h-4 w-px bg-[var(--chat-hairline)]" />
          <button onClick={() => { setViewMode('jobs'); setPage(0) }} className={chip(viewMode === 'jobs')} title="View every posting individually">
            Job title
          </button>
          <button onClick={() => { setViewMode('companies'); setPage(0) }} className={chip(viewMode === 'companies')} title="Group postings by company">
            Company
          </button>
          <div className="mx-1 h-4 w-px bg-[var(--chat-hairline)]" />
          <MultiSelect
            label="Platform"
            allLabel="All platforms"
            options={PLATFORMS.map((p) => ({ value: p.value, label: p.label }))}
            selected={platformFilter}
            onChange={(v) => { setPlatformFilter(v); setPage(0) }}
          />
          {viewMode === 'jobs' && (
            <div className="relative">
              <button onClick={() => setSortOpen((v) => !v)} className={chip(false)} title="Sort order">
                Sort: {sortMode === 'fit' ? 'Best fit' : 'Newest first'}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-[12px] border border-[var(--chat-hairline)] bg-white py-1 shadow-lg">
                  <button
                    onClick={() => { setSortMode('fit'); setPage(0); setSortOpen(false) }}
                    className={`block w-full px-3 py-1.5 text-left text-[12px] ${sortMode === 'fit' ? 'font-semibold text-[var(--chat-accent)]' : 'text-[var(--chat-text-dim)] hover:bg-[var(--chat-surface-strong)]'}`}
                  >
                    Best fit first
                  </button>
                  <button
                    onClick={() => { setSortMode('newest'); setPage(0); setSortOpen(false) }}
                    className={`block w-full px-3 py-1.5 text-left text-[12px] ${sortMode === 'newest' ? 'font-semibold text-[var(--chat-accent)]' : 'text-[var(--chat-text-dim)] hover:bg-[var(--chat-surface-strong)]'}`}
                  >
                    Newest first
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="relative ml-auto">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--chat-text-faint)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={viewMode === 'jobs' ? 'Search jobs…' : 'Search companies…'}
              className="w-48 rounded-[200px] border border-[var(--chat-hairline)] bg-white py-1.5 pl-8 pr-3 text-[11.5px] text-[var(--chat-body)] outline-none placeholder:text-[var(--chat-text-faint)] focus:border-[var(--chat-accent)]"
            />
          </div>
        </div>

        {pullError && (
          <div className="mt-3 rounded-[12px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-[11.5px] text-[#b91c1c]">
            {pullError}
          </div>
        )}

        {pullJobId && pull && (
          <div className="chat-glass mt-3 p-4">
            <div className="flex items-center gap-2">
              {pull.status === 'running' ? (
                <Loader2 size={15} className="animate-spin text-[var(--chat-accent)]" />
              ) : pull.status === 'done' ? (
                <CheckCircle2 size={15} className="text-[#047857]" />
              ) : (
                <AlertCircle size={15} className="text-[#b91c1c]" />
              )}
              <span className="text-[12.5px] font-bold capitalize text-[var(--chat-body)]">{pull.status}</span>
              {pull.stepsTotal > 0 && (
                <span className="text-[11px] text-[var(--chat-text-faint)]">
                  {pull.stepsDone}/{pull.stepsTotal} steps
                  {pull.etaSec != null ? ` · ~${Math.ceil(pull.etaSec / 60)} min left` : ''}
                </span>
              )}
              <button onClick={cancelPull} className="ml-auto flex items-center gap-1 rounded-[10px] border border-[var(--chat-hairline)] px-2 py-1 text-[10.5px] text-[var(--chat-text-dim)] hover:text-[#b91c1c]">
                <X size={11} /> Cancel
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-2.5 h-2 overflow-hidden rounded-[200px] bg-[var(--chat-surface-strong)]">
              <div
                className="h-full rounded-[200px] bg-[#592eff] transition-all duration-500"
                style={{ width: `${pull.stepsTotal > 0 ? Math.min(100, Math.round((pull.stepsDone / pull.stepsTotal) * 100)) : 4}%` }}
              />
            </div>

            {/* Per-source cards — every platform visible, even the ones that failed */}
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {ALL_SOURCES.map((src) => {
                const st = pull.perSource[src.value]
                return (
                  <div
                    key={src.value}
                    className={`rounded-[12px] border p-2.5 ${
                      st?.error
                        ? 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.04)]'
                        : st?.count && st.count > 0
                          ? 'border-[var(--chat-hairline)] bg-white'
                          : 'border-[var(--chat-hairline)] bg-white/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold capitalize text-[var(--chat-body)]">{src.label}</span>
                      {st?.error ? (
                        <span className="flex items-center gap-0.5 rounded-[200px] bg-[rgba(239,68,68,0.1)] px-1.5 py-px text-[9.5px] font-bold text-[#b91c1c]">
                          <AlertCircle size={9} /> error
                        </span>
                      ) : st?.count && st.count > 0 ? (
                        <span className="rounded-[200px] bg-[rgba(16,185,129,0.12)] px-1.5 py-px text-[10px] font-bold text-[#047857]">{st.count}</span>
                      ) : (
                        <span className="text-[10px] text-[var(--chat-text-faint)]">{pull.status === 'running' ? 'queued…' : '0'}</span>
                      )}
                    </div>
                    {st?.error && (
                      <p className="mt-1 break-words text-[9.5px] leading-[1.4] text-[#b91c1c]" title={st.error}>
                        {st.error.slice(0, 100)}
                      </p>
                    )}
                    {st?.skipped && <p className="mt-1 text-[9.5px] text-[var(--chat-text-faint)]">{st.skipped}</p>}
                    {!st && pull.status === 'running' && <p className="mt-1 text-[9.5px] text-[var(--chat-text-faint)]">waiting</p>}
                  </div>
                )
              })}
            </div>

            {/* Live log */}
            {pull.log.length > 0 && (
              <div className="mt-2.5 max-h-28 overflow-auto rounded-[10px] bg-[var(--chat-surface-strong)] px-2.5 py-1.5 font-mono text-[10px] leading-[1.6] text-[var(--chat-text-dim)]">
                {pull.log.slice(-6).map((l, i) => <div key={i}>{l}</div>)}
              </div>
            )}
          </div>
        )}

        {industryFilter && (
          <p className="mt-2 text-[11.5px] text-[var(--chat-text-faint)]">
            Hiring companies aren&apos;t industry-tagged yet — clear the industry filter to see the hiring list.
          </p>
        )}

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 size={20} className="animate-spin text-[var(--chat-text-faint)]" />
          </div>
        ) : (
          <>
            {/* ── HIRING NOW ── */}
            {!industryFilter && (
              <div className="mt-6">
                <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-faint)]">
                  <Briefcase size={12} className="text-[var(--chat-accent)]" /> {viewMode === 'jobs' ? `Jobs in ${provLabel}` : `Hiring now in ${provLabel}`}
                  <span
                    className="normal-case text-[var(--chat-text-faint)]"
                    title={viewMode === 'jobs'
                      ? 'Every pulled posting, paginated (48 per page) — flip to Company view to group by employer.'
                      : 'Companies are grouped from all pulled postings (up to 8,000, after filters) — the raw BC registry has many more companies, this is the hiring snapshot. Posting counts per company skew high because chains and staffing agencies post many roles.'}
                  >
                    ({viewMode === 'jobs' ? `${total} postings` : `${total} companies in the latest postings`}{platformFilter.length > 0 ? ` · ${platformFilter.map((v) => PLATFORMS.find((p) => p.value === v)?.label ?? v).join(' + ')}` : ''})
                  </span>
                  {recentCount > 0 && (
                    <span className="rounded-[200px] bg-[rgba(16,185,129,0.12)] px-2 py-0.5 text-[10px] font-bold normal-case text-[#047857]">
                      {recentCount} pulled in last 24h
                    </span>
                  )}
                </h3>
                {viewMode === 'jobs' ? (
                  visibleJobs.length === 0 ? (
                    <p className="py-6 text-center text-sm italic text-[var(--chat-text-faint)]">
                      No postings in {provLabel} yet — hit “Pull 60 days” above to fill this.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {visibleJobs.map((j) => (
                        <div key={j.id} className="chat-glass flex flex-col gap-1.5 p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <a href={j.url ?? undefined} target="_blank" rel="noopener noreferrer" className="line-clamp-2 text-[12.5px] font-semibold text-[var(--chat-body)] hover:text-[var(--chat-accent)]">
                              {j.title} <ExternalLink size={10} className="inline opacity-50" />
                            </a>
                            {j.source && <span className="shrink-0 rounded border border-[var(--chat-hairline)] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[var(--chat-text-faint)]">{j.source}</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--chat-text-faint)]">
                            <span className="flex items-center gap-1"><Building2 size={10} /> {j.company}</span>
                            {j.location && <span className="flex items-center gap-1"><MapPin size={10} /> {j.location}</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {j.fitVetoed ? (
                              <span className="rounded-[200px] bg-[rgba(239,68,68,0.12)] px-1.5 py-0.5 text-[9.5px] font-bold text-[#b91c1c]" title="Blocked by a deal-breaker in your evaluation preferences">
                                vetoed
                              </span>
                            ) : (
                              <span className={`rounded-[200px] px-1.5 py-0.5 text-[9.5px] font-bold ${prTone(j.fitScore)}`} title="Fit score — your probability of being hired, from your profile">
                                fit {j.fitScore}
                              </span>
                            )}
                            <span className="rounded-[200px] bg-[var(--chat-surface-strong)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[var(--chat-text-dim)]" title="NOC TEER category (heuristic)">TEER {j.teer ?? '—'}</span>
                            <span className={`rounded-[200px] px-1.5 py-0.5 text-[9.5px] font-bold ${prTone(j.prScore)}`} title="PR compatibility (heuristic from TEER / BC-PNP / Canadian-experience flags)">
                              PR {j.prScore}
                            </span>
                            {j.bcPnp && <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-1.5 py-0.5 text-[9.5px] font-bold text-[var(--chat-accent)]" title="BC-PNP in-demand flag (heuristic)">BC-PNP</span>}
                            {(j.salaryMin || j.salaryMax) && (
                              <span className="text-[10px] font-semibold text-[var(--chat-text-dim)]">{j.salaryCurrency ?? ''} {j.salaryMin ?? '?'}–{j.salaryMax ?? '?'}</span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <button
                              onClick={async () => {
                                await fetch('/api/job-hunt/apply', {
                                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ posting_id: j.id }),
                                })
                                window.location.href = '/job-hunt/apply'
                              }}
                              className="flex items-center gap-1 rounded-[10px] bg-[#047857] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#036149]"
                              title="Add to the Apply Hub"
                            >
                              <Send size={11} /> Apply
                            </button>
                            {j.url && (
                              <a href={j.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-0.5 text-[10.5px] text-[var(--chat-text-faint)] hover:text-[var(--chat-accent)]">
                                original <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  visibleHiring.length === 0 ? (
                    <p className="py-6 text-center text-sm italic text-[var(--chat-text-faint)]">
                      No companies with live postings in {provLabel} yet — hit “Pull 60 days” above to fill this.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {visibleHiring.map((h) => (
                      <div key={h.name} className="chat-glass flex flex-col gap-1.5 p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold text-[var(--chat-body)]">{h.name}</span>
                          <span className="shrink-0 rounded-[200px] bg-[rgba(89,46,255,0.1)] px-2 py-0.5 text-[10px] font-bold text-[var(--chat-accent)]">
                            {h.postingCount} posting{h.postingCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-[11px] text-[var(--chat-text-faint)]">
                          {h.locations.slice(0, 2).join(' · ')}
                          {h.sources?.length > 0 && <span className="ml-1 text-[10px] font-semibold text-[var(--chat-text-dim)]">· {h.sources.join(' · ')}</span>}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {h.teerCounts && (() => {
                            const breakdown = [0, 1, 2, 3].map((t) => `TEER ${t}: ${h.teerCounts?.[String(t)] ?? 0}`)
                            const t012 = [0, 1, 2].reduce((n, t) => n + (h.teerCounts?.[String(t)] ?? 0), 0)
                            if (t012 === 0 && h.bcPnp === 0 && h.payMin == null && h.payMax == null) return null
                            return (
                              <>
                                {t012 > 0 && (
                                  <span className="rounded-[200px] bg-[rgba(16,185,129,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[#047857]" title={`Skilled postings (${breakdown.join(' · ')})`}>
                                    TEER 0–2 · {t012}
                                  </span>
                                )}
                                {h.bcPnp > 0 && (
                                  <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-accent)]" title="Postings flagged BC-PNP in-demand (heuristic — verify before relying on it)">
                                    BC-PNP · {h.bcPnp}
                                  </span>
                                )}
                                {(h.payMin != null || h.payMax != null) && (
                                  <span className="rounded-[200px] bg-[var(--chat-surface-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-text-dim)]" title="Pay range across this company's pulled postings">
                                    {h.payMin != null ? `$${h.payMin}` : '?'}–{h.payMax != null ? `$${h.payMax}` : '?'}
                                  </span>
                                )}
                              </>
                            )
                          })()}
                        </div>

                        {h.postings.length > 0 && (
                          <div className="mt-1 flex flex-col gap-2 border-t border-[var(--chat-hairline)] pt-1.5">
                            {h.postings.map((p) => (
                              <div key={p.id} className="flex flex-col gap-0.5">
                                <a href={p.url ?? undefined} target="_blank" rel="noopener noreferrer" className="line-clamp-1 text-[11px] font-medium text-[var(--chat-body)] hover:text-[var(--chat-accent)]">
                                  {p.title} <ExternalLink size={9} className="inline opacity-50" />
                                </a>
                                <div className="flex flex-wrap items-center gap-1">
                                  {p.location && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--chat-text-faint)]">
                                      <MapPin size={8} /> {p.location}
                                    </span>
                                  )}
                                  {p.source && (
                                    <span className="rounded border border-[var(--chat-hairline)] px-1 py-px text-[9px] uppercase tracking-wide text-[var(--chat-text-faint)]">{p.source}</span>
                                  )}
                                  {p.teer && (
                                    <span className="rounded-[200px] bg-[var(--chat-surface-strong)] px-1.5 py-px text-[9px] font-semibold text-[var(--chat-text-dim)]">TEER {p.teer}</span>
                                  )}
                                  {p.prScore > 0 && (
                                    <span className={`rounded-[200px] px-1.5 py-px text-[9px] font-bold ${prTone(p.prScore)}`} title="PR compatibility (heuristic from TEER / BC-PNP / Canadian-experience flags)">
                                      PR {p.prScore}
                                    </span>
                                  )}
                                  {p.bcPnp && (
                                    <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-1.5 py-px text-[9px] font-bold text-[var(--chat-accent)]" title="BC-PNP in-demand flag (heuristic)">
                                      BC-PNP
                                    </span>
                                  )}
                                  {(p.salaryMin || p.salaryMax) && (
                                    <span className="text-[9.5px] font-semibold text-[var(--chat-text-dim)]">
                                      {p.salaryCurrency ?? ''} {p.salaryMin ?? '?'}–{p.salaryMax ?? '?'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-1 flex items-center gap-1.5">
                          {h.samplePostingId && (
                            <button
                              onClick={async () => {
                                await fetch('/api/job-hunt/apply', {
                                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ posting_id: h.samplePostingId }),
                                })
                                window.location.href = '/job-hunt/apply'
                              }}
                              className="flex items-center gap-1 rounded-[10px] bg-[#047857] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#036149]"
                              title="Add to the Apply Hub"
                            >
                              <Send size={11} /> Apply
                            </button>
                          )}
                          {h.sampleUrl && (
                            <a href={h.sampleUrl} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-0.5 text-[10.5px] text-[var(--chat-text-faint)] hover:text-[var(--chat-accent)]">
                              posting <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                  )
                )}

                {total > pageSize && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--chat-text-dim)] hover:border-[var(--chat-accent)] hover:text-[var(--chat-accent)] disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <span className="text-[11.5px] text-[var(--chat-text-faint)]">
                      Page {page + 1} of {totalPages} · {total} companies
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={(page + 1) * pageSize >= total}
                      className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--chat-text-dim)] hover:border-[var(--chat-accent)] hover:text-[var(--chat-accent)] disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}

          </>
        )}

      </div>
    </div>
  )
}
