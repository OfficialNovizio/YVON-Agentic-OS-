// Adzuna — api.adzuna.com. Free tier: 1,000 calls/month, needs a free
// app_id + app_key from developer.adzuna.com (no card required). Credentials
// come from job_hunt_source_keys (config: { app_id, app_key, country? }) —
// see app/api/job-hunt/source-keys/route.ts. Returns [] (not an error) when
// unconfigured so the rest of a multi-source search still succeeds.
import type { JobSource, NormalizedJob, SourceSearchOptions } from '../types'

interface AdzunaResult {
  id?: string
  title?: string
  company?: { display_name?: string }
  location?: { display_name?: string }
  redirect_url?: string
  description?: string
  salary_min?: number
  salary_max?: number
  created?: string
}

export const adzunaSource: JobSource = {
  id: 'adzuna',
  label: 'Adzuna',
  needsKey: true,
  async search({ query, location, limit = 25, config }: SourceSearchOptions): Promise<NormalizedJob[]> {
    const appId = config?.app_id as string | undefined
    const appKey = config?.app_key as string | undefined
    if (!appId || !appKey) return [] // not configured — silent no-op, not an error

    const country = (config?.country as string | undefined) || 'us'
    try {
      const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`)
      url.searchParams.set('app_id', appId)
      url.searchParams.set('app_key', appKey)
      url.searchParams.set('results_per_page', String(limit))
      url.searchParams.set('content-type', 'application/json')
      if (query.trim()) url.searchParams.set('what', query.trim())
      if (location?.trim()) url.searchParams.set('where', location.trim())

      const res = await fetch(url.toString(), { next: { revalidate: 0 } })
      if (!res.ok) return []
      const data = (await res.json()) as { results?: AdzunaResult[] }

      return (data.results ?? []).slice(0, limit).map((j): NormalizedJob => ({
        source: 'adzuna',
        external_id: j.id ?? j.redirect_url ?? '',
        title: j.title ?? 'Untitled role',
        company: j.company?.display_name ?? 'Unknown company',
        location: j.location?.display_name ?? null,
        remote: null,
        url: j.redirect_url ?? '',
        description: j.description ?? null,
        salary_min: j.salary_min ?? null,
        salary_max: j.salary_max ?? null,
        salary_currency: j.salary_min || j.salary_max ? 'USD' : null,
        posted_at: j.created ?? null,
        raw: j,
      })).filter((j) => j.external_id && j.url)
    } catch {
      return []
    }
  },
}
