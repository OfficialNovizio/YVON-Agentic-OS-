// freehire.dev public REST API — same API MadsLorentzen/ai-job-search's
// freehire-search skill wraps in its Bun CLI; called directly here rather
// than porting the CLI (a Next.js route calling fetch() IS the adaptation —
// see migrations/122_job_hunt_discovery.sql). Free, no key. Verified live
// shape (2026-08-15): { data: [{ public_slug, title, company, company_slug,
// location, description, url, countries, regions, work_mode, skills,
// posted_at, enrichment }], meta: { limit, offset, total } }.
import type { JobSource, NormalizedJob, SourceSearchOptions } from '../types'

interface FreehireJob {
  public_slug?: string
  title?: string
  company?: string
  location?: string
  description?: string
  url?: string
  work_mode?: string
  posted_at?: string
  enrichment?: { salary_min?: number; salary_max?: number; salary_currency?: string }
}

export const freehireSource: JobSource = {
  id: 'freehire',
  label: 'freehire',
  needsKey: false,
  async search({ query, location, limit = 25 }: SourceSearchOptions): Promise<NormalizedJob[]> {
    try {
      const base = process.env.FREEHIRE_API_URL || 'https://freehire.dev'
      const url = new URL('/api/v1/jobs', base)
      if (query.trim()) url.searchParams.set('q', query.trim())
      if (location?.trim()) url.searchParams.set('city', location.trim())
      url.searchParams.set('limit', String(limit))

      const res = await fetch(url.toString(), { next: { revalidate: 0 } })
      if (!res.ok) return []
      const data = (await res.json()) as { data?: FreehireJob[] }

      return (data.data ?? []).slice(0, limit).map((j): NormalizedJob => ({
        source: 'freehire',
        external_id: j.public_slug ?? j.url ?? '',
        title: j.title ?? 'Untitled role',
        company: j.company ?? 'Unknown company',
        location: j.location ?? null,
        remote: j.work_mode === 'remote' ? true : j.work_mode ? false : null,
        url: j.url ?? '',
        description: j.description ?? null,
        salary_min: j.enrichment?.salary_min ?? null,
        salary_max: j.enrichment?.salary_max ?? null,
        salary_currency: j.enrichment?.salary_currency ?? null,
        posted_at: j.posted_at ?? null,
        raw: j,
      })).filter((j) => j.external_id && j.url)
    } catch {
      return []
    }
  },
}
