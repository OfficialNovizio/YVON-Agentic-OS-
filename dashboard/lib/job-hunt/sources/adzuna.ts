// Adzuna — api.adzuna.com. Free tier: 1,000 calls/month, needs a free
// app_id + app_key from developer.adzuna.com (no card required). Credentials
// come from job_hunt_source_keys (config: { app_id, app_key }) — see
// app/api/job-hunt/source-keys/route.ts.
//
// Industry -> category/keyword mapping and province -> location mapping
// pulled verbatim from the operator's own prior design, github.com/
// OfficialNovizio/YVON-OS app/api/jobs/search/route.ts (2026-08-15,
// confirmed accurate: Canada-based, 5 target industries). Country defaults
// to 'ca' — this replaces the earlier generic global/US default.
import type { JobSource, NormalizedJob, SourceSearchOptions } from '../types'

interface AdzunaResult {
  id?: string
  title?: string
  company?: { display_name?: string }
  location?: { display_name?: string; area?: string[] }
  redirect_url?: string
  description?: string
  salary_min?: number
  salary_max?: number
  created?: string
}

export const INDUSTRY_TO_ADZUNA: Record<string, { category: string; keywords: string }> = {
  Aerospace: { category: 'engineering-jobs', keywords: 'aerospace OR aircraft OR aviation OR aeronautics' },
  IT: { category: 'it-jobs', keywords: 'software OR developer OR engineer' },
  Trucking: { category: 'logistics-warehouse-jobs', keywords: 'truck OR dispatch OR logistics OR freight' },
  Drone: { category: 'engineering-jobs', keywords: 'drone OR UAV OR unmanned aerial' },
  Business: { category: 'management-jobs', keywords: 'MBA OR business OR operations OR management' },
}

export const PROVINCE_TO_LOCATION: Record<string, string> = {
  ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', QC: 'Quebec',
  MB: 'Manitoba', SK: 'Saskatchewan', NS: 'Nova Scotia', NB: 'New Brunswick',
  Remote: 'Canada',
}

export const adzunaSource: JobSource = {
  id: 'adzuna',
  label: 'Adzuna',
  needsKey: true,
  async search({ query, location, industry, province, limit = 25, config }: SourceSearchOptions): Promise<NormalizedJob[]> {
    const appId = config?.app_id as string | undefined
    const appKey = config?.app_key as string | undefined
    if (!appId || !appKey) return [] // not configured — silent no-op, not an error

    const country = (config?.country as string | undefined) || 'ca'
    const map = industry ? INDUSTRY_TO_ADZUNA[industry] : undefined
    const what = query.trim() || map?.keywords || ''
    const where = location?.trim() || (province ? PROVINCE_TO_LOCATION[province] ?? province : '')

    try {
      const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`)
      url.searchParams.set('app_id', appId)
      url.searchParams.set('app_key', appKey)
      url.searchParams.set('results_per_page', String(limit))
      url.searchParams.set('content-type', 'application/json')
      url.searchParams.set('sort_by', 'date')
      if (what) url.searchParams.set('what', what)
      if (where) url.searchParams.set('where', where)
      if (map?.category) url.searchParams.set('category', map.category)

      const res = await fetch(url.toString(), { next: { revalidate: 0 } })
      if (!res.ok) return []
      const data = (await res.json()) as { results?: AdzunaResult[] }

      return (data.results ?? []).slice(0, limit).map((j): NormalizedJob => ({
        source: 'adzuna',
        external_id: j.id ?? j.redirect_url ?? '',
        title: j.title ?? 'Untitled role',
        company: j.company?.display_name ?? 'Unknown company',
        location: j.location?.display_name ?? (j.location?.area?.slice(-2).join(', ') ?? null),
        remote: (j.title ?? '').toLowerCase().includes('remote') || null,
        url: j.redirect_url ?? '',
        description: j.description ?? null,
        salary_min: j.salary_min ?? null,
        salary_max: j.salary_max ?? null,
        salary_currency: j.salary_min || j.salary_max ? 'CAD' : null,
        posted_at: j.created ?? null,
        raw: j,
      })).filter((j) => j.external_id && j.url)
    } catch {
      return []
    }
  },
}
