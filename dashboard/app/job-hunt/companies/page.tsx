'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui'
import { Star, ExternalLink, MapPin, Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — COMPANIES (2026-08-15)
// ═══════════════════════════════════════════════════════════════════════════
// Target company watchlist. Schema + the 22-company seed are pulled verbatim
// from the operator's own prior YVON-OS design (024_career_dashboard.sql),
// confirmed accurate — real Canadian companies across the operator's five
// target industries (Aerospace, IT, Trucking, Drone, Business).

interface Company {
  id: string
  name: string
  domain: string | null
  industry: string
  province: string
  size: string
  description: string | null
  careers_url: string | null
  is_watching: boolean
  open_roles: number
}

const INDUSTRIES = ['Aerospace', 'IT', 'Trucking', 'Drone', 'Business']
const SIZE_TONE: Record<string, string> = {
  startup: 'bg-primary/10 text-primary',
  small: 'bg-primary/10 text-primary',
  medium: 'bg-tertiary/15 text-tertiary',
  large: 'bg-emerald-400/10 text-emerald-300',
  enterprise: 'bg-emerald-400/10 text-emerald-300',
}

export default function JobHuntCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [industryFilter, setIndustryFilter] = useState<string | null>(null)
  const [watchingOnly, setWatchingOnly] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (industryFilter) params.set('industries', industryFilter)
      if (watchingOnly) params.set('watching', 'true')
      const res = await fetch(`/api/job-hunt/companies?${params}`)
      const data = await res.json()
      setCompanies(data.companies ?? [])
    } catch {
      setCompanies([])
    }
    setLoading(false)
  }, [industryFilter, watchingOnly])

  useEffect(() => { load() }, [load])

  const toggleWatch = useCallback(async (c: Company) => {
    setCompanies((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_watching: !x.is_watching } : x)))
    await fetch('/api/job-hunt/companies', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, is_watching: !c.is_watching }),
    })
  }, [])

  const grouped = useMemo(() => {
    const byIndustry: Record<string, Company[]> = {}
    for (const c of companies) (byIndustry[c.industry] ??= []).push(c)
    return byIndustry
  }, [companies])

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Companies</h1>
        <p className="mt-1 text-sm text-on-surface-variant max-w-2xl">
          Your target company watchlist across Aerospace, IT, Trucking, Drone, and Business — star the ones worth checking regularly.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setIndustryFilter(null)}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition ${!industryFilter ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
          All industries
        </button>
        {INDUSTRIES.map((ind) => (
          <button key={ind} onClick={() => setIndustryFilter(ind)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition ${industryFilter === ind ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
            {ind}
          </button>
        ))}
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button onClick={() => setWatchingOnly((v) => !v)}
          className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition ${watchingOnly ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
          <Star size={11} className={watchingOnly ? 'fill-current' : ''} /> Watching only
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 size={20} className="animate-spin text-on-surface-variant" /></div>
      ) : companies.length === 0 ? (
        <p className="text-sm text-on-surface-variant/60 italic py-8 text-center">No companies match this filter.</p>
      ) : (
        Object.entries(grouped).map(([industry, list]) => (
          <div key={industry} className="mb-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60 mb-2">{industry}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {list.map((c) => (
                <Card key={c.id} className="p-3.5 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-medium text-on-surface">{c.name}</span>
                    <button onClick={() => toggleWatch(c)} className="shrink-0">
                      <Star size={14} className={c.is_watching ? 'fill-current text-tertiary' : 'text-on-surface-variant/40'} />
                    </button>
                  </div>
                  {c.description && <p className="text-[11.5px] text-on-surface-variant/70 line-clamp-2">{c.description}</p>}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${SIZE_TONE[c.size] ?? 'bg-white/5 text-on-surface-variant'}`}>{c.size}</span>
                    <span className="text-[10px] flex items-center gap-1 text-on-surface-variant/60"><MapPin size={10} /> {c.province}</span>
                    {c.careers_url && (
                      <a href={c.careers_url} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 text-on-surface-variant/60 hover:text-on-surface ml-auto">
                        careers <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
