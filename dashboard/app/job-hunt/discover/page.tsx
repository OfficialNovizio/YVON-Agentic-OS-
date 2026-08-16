'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { Search, Loader2, ExternalLink, Bookmark, Archive, MapPin, Building2, Key } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — DISCOVER (2026-08-15)
// ═══════════════════════════════════════════════════════════════════════════
// Second Job Hunt artifact. Searches real free sources (Adzuna, RemoteOK,
// Remotive, Arbeitnow, a tracked-company Greenhouse list pulled from
// santifer/career-ops, and freehire.dev — see lib/job-hunt/sources/*) and
// stores results as status='discovered'. This page's only write action is
// "Queue" (status -> 'queued') or "Archive" — it never applies to anything.
// LinkedIn is deliberately not a source here (ToS risk).
//
// 2026-08-15 course-correction: the operator's real target is Canada-based,
// 5 industries (Aerospace/IT/Trucking/Drone/Business) — pulled from their
// own prior YVON-OS design. Adzuna now takes Industry + Province and maps
// them the same way that design did (lib/job-hunt/sources/adzuna.ts). The
// Greenhouse source (an AI-labs company list from career-ops) doesn't match
// this profile, so it's off by default — still there, still correct for
// what it is, just not relevant here.

interface SourceMeta { id: string; label: string; needsKey: boolean }
const SOURCES: SourceMeta[] = [
  { id: 'adzuna', label: 'Adzuna', needsKey: true },
  { id: 'remoteok', label: 'RemoteOK', needsKey: false },
  { id: 'remotive', label: 'Remotive', needsKey: false },
  { id: 'arbeitnow', label: 'Arbeitnow', needsKey: false },
  { id: 'freehire', label: 'freehire', needsKey: false },
  { id: 'greenhouse', label: 'Greenhouse (AI-labs list — off by default, not this profile)', needsKey: false },
]
const DEFAULT_ENABLED = new Set(SOURCES.filter((s) => s.id !== 'greenhouse').map((s) => s.id))

const INDUSTRIES = ['Aerospace', 'IT', 'Trucking', 'Drone', 'Business']
const PROVINCES = ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'Remote']

interface Posting {
  id: string
  source: string
  title: string
  company: string
  location: string | null
  remote: boolean | null
  url: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  posted_at: string | null
  status: string
  discovered_at: string
}

type SourceStatus = Record<string, { count: number; skipped: string | null; error?: string }>

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const d = (Date.now() - new Date(iso).getTime()) / 86400000
  if (d < 1) return 'today'
  if (d < 2) return 'yesterday'
  return `${Math.floor(d)}d ago`
}

export default function JobHuntDiscoverPage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [industry, setIndustry] = useState<string | null>(null)
  const [province, setProvince] = useState<string | null>(null)
  const [enabledSources, setEnabledSources] = useState<Set<string>>(new Set(DEFAULT_ENABLED))
  const [searching, setSearching] = useState(false)
  const [sourceStatus, setSourceStatus] = useState<SourceStatus | null>(null)
  const [postings, setPostings] = useState<Posting[]>([])
  const [statusFilter, setStatusFilter] = useState<'discovered' | 'queued' | 'archived' | 'all'>('discovered')
  const [loadingList, setLoadingList] = useState(true)
  const [adzunaOpen, setAdzunaOpen] = useState(false)
  const [adzunaId, setAdzunaId] = useState('')
  const [adzunaKey, setAdzunaKey] = useState('')
  const [adzunaConfigured, setAdzunaConfigured] = useState(false)

  const loadPostings = useCallback(async (status: typeof statusFilter) => {
    setLoadingList(true)
    try {
      const url = status === 'all' ? '/api/job-hunt/postings' : `/api/job-hunt/postings?status=${status}`
      const res = await fetch(url)
      const data = await res.json()
      setPostings(data.postings ?? [])
    } catch {
      setPostings([])
    }
    setLoadingList(false)
  }, [])

  useEffect(() => { loadPostings(statusFilter) }, [statusFilter, loadPostings])

  useEffect(() => {
    fetch('/api/job-hunt/source-keys').then((r) => r.json()).then((d: { sources?: { source: string; configured: boolean }[] }) => {
      setAdzunaConfigured(!!d.sources?.find((s) => s.source === 'adzuna')?.configured)
    }).catch(() => {})
  }, [])

  const toggleSource = (id: string) => {
    setEnabledSources((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const search = useCallback(async () => {
    setSearching(true); setSourceStatus(null)
    try {
      const res = await fetch('/api/job-hunt/discover', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, industry, province, sources: Array.from(enabledSources) }),
      })
      const data = await res.json()
      setSourceStatus(data.sourceStatus ?? null)
      await loadPostings(statusFilter === 'archived' ? 'discovered' : statusFilter)
      if (statusFilter === 'archived') setStatusFilter('discovered')
    } catch {
      setSourceStatus(null)
    }
    setSearching(false)
  }, [query, location, industry, province, enabledSources, statusFilter, loadPostings])

  const setPostingStatus = useCallback(async (id: string, status: string) => {
    setPostings((prev) => prev.filter((p) => p.id !== id)) // optimistic — it leaves the current filtered view
    await fetch('/api/job-hunt/postings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
  }, [])

  const saveAdzunaKeys = useCallback(async () => {
    if (!adzunaId.trim() || !adzunaKey.trim()) return
    await fetch('/api/job-hunt/source-keys', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'adzuna', config: { app_id: adzunaId.trim(), app_key: adzunaKey.trim() } }),
    })
    setAdzunaConfigured(true)
    setAdzunaOpen(false)
    setAdzunaId(''); setAdzunaKey('')
  }, [adzunaId, adzunaKey])

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Discover</h1>
        <p className="mt-1 text-sm text-on-surface-variant max-w-2xl">
          Searches real free sources, no bot logins, nothing applied automatically. Leave the keyword blank to use your Master Profile&apos;s primary target role.
        </p>
      </div>

      {/* Search controls */}
      <Card className="p-4 mb-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Keyword (optional — Industry below drives Adzuna if left blank)"
            className="flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:border-white/25 focus:outline-none" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (overrides Province)"
            className="sm:w-56 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:border-white/25 focus:outline-none" />
          <button onClick={search} disabled={searching} className="btn-accent flex items-center gap-1.5 text-xs px-4 py-2 whitespace-nowrap">
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-on-surface-variant/50">Industry:</span>
          <button onClick={() => setIndustry(null)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition ${!industry ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
            Any
          </button>
          {INDUSTRIES.map((ind) => (
            <button key={ind} onClick={() => setIndustry(ind)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition ${industry === ind ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
              {ind}
            </button>
          ))}
          <span className="text-[11px] text-on-surface-variant/50 ml-2">Province:</span>
          <select value={province ?? ''} onChange={(e) => setProvince(e.target.value || null)}
            className="text-[11px] rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-on-surface-variant focus:outline-none">
            <option value="">Any</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SOURCES.map((s) => {
            const needsSetup = s.needsKey && !adzunaConfigured
            const on = enabledSources.has(s.id)
            return (
              <button key={s.id} onClick={() => toggleSource(s.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                  on ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'
                }`}>
                {s.label}{needsSetup && ' ⚠'}
              </button>
            )
          })}
          {!adzunaConfigured && (
            <button onClick={() => setAdzunaOpen((v) => !v)} className="text-[11px] flex items-center gap-1 text-on-surface-variant hover:text-on-surface underline decoration-dotted">
              <Key size={11} /> set up Adzuna key
            </button>
          )}
        </div>

        {adzunaOpen && (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center rounded-md border border-white/10 bg-white/[0.02] p-2.5">
            <span className="text-[11px] text-on-surface-variant/70 whitespace-nowrap">Free at developer.adzuna.com —</span>
            <input value={adzunaId} onChange={(e) => setAdzunaId(e.target.value)} placeholder="App ID"
              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[12px] text-on-surface" />
            <input value={adzunaKey} onChange={(e) => setAdzunaKey(e.target.value)} placeholder="App Key" type="password"
              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[12px] text-on-surface" />
            <button onClick={saveAdzunaKeys} className="btn-accent text-[11px] px-3 py-1">Save</button>
          </div>
        )}

        {sourceStatus && (
          <div className="flex flex-wrap gap-2 text-[11px] text-on-surface-variant/70">
            {Object.entries(sourceStatus).map(([id, s]) => (
              <span key={id}>{id}: {s.error ? 'error' : s.skipped ? s.skipped : `${s.count} found`}</span>
            ))}
          </div>
        )}
      </Card>

      {/* Status filter */}
      <div className="flex gap-1 mb-3">
        {(['discovered', 'queued', 'archived', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition capitalize ${
              statusFilter === f ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      {loadingList ? (
        <div className="flex items-center justify-center h-32"><Loader2 size={20} className="animate-spin text-on-surface-variant" /></div>
      ) : postings.length === 0 ? (
        <p className="text-sm text-on-surface-variant/60 italic py-8 text-center">No postings in this view yet. Run a search above.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {postings.map((p) => (
            <Card key={p.id} className="p-3.5 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-on-surface hover:underline flex items-center gap-1">
                    {p.title} <ExternalLink size={11} className="opacity-50" />
                  </a>
                  <span className="text-[10px] uppercase tracking-wide text-on-surface-variant/50 px-1.5 py-0.5 rounded border border-white/10">{p.source}</span>
                  {p.remote && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300">remote</span>}
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-on-surface-variant/70">
                  <span className="flex items-center gap-1"><Building2 size={11} /> {p.company}</span>
                  {p.location && <span className="flex items-center gap-1"><MapPin size={11} /> {p.location}</span>}
                  {(p.salary_min || p.salary_max) && (
                    <span>{p.salary_currency ?? ''} {p.salary_min ?? '?'}–{p.salary_max ?? '?'}</span>
                  )}
                  <span>{timeAgo(p.posted_at ?? p.discovered_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {p.status === 'discovered' && (
                  <button onClick={() => setPostingStatus(p.id, 'queued')} title="Queue for review"
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface">
                    <Bookmark size={12} /> Queue
                  </button>
                )}
                {p.status !== 'archived' && (
                  <button onClick={() => setPostingStatus(p.id, 'archived')} title="Archive"
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant/60 hover:text-on-surface">
                    <Archive size={12} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
