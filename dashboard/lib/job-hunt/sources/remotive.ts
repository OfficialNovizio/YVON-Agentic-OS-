// Remotive — remotive.com/api/remote-jobs. Free, no key.
import type { JobSource, NormalizedJob, SourceSearchOptions } from '../types'

interface RemotiveJob {
  id?: number
  url?: string
  title?: string
  company_name?: string
  tags?: string[]
  job_type?: string
  publication_date?: string
  candidate_required_location?: string
  salary?: string
  description?: string
}

export const remotiveSource: JobSource = {
  id: 'remotive',
  label: 'Remotive',
  needsKey: false,
  async search({ query, limit = 25 }: SourceSearchOptions): Promise<NormalizedJob[]> {
    try {
      const url = new URL('https://remotive.com/api/remote-jobs')
      if (query.trim()) url.searchParams.set('search', query.trim())
      url.searchParams.set('limit', String(limit))

      const res = await fetch(url.toString(), { next: { revalidate: 0 } })
      if (!res.ok) return []
      const data = (await res.json()) as { jobs?: RemotiveJob[] }

      return (data.jobs ?? []).slice(0, limit).map((j): NormalizedJob => ({
        source: 'remotive',
        external_id: String(j.id ?? j.url ?? ''),
        title: j.title ?? 'Untitled role',
        company: j.company_name ?? 'Unknown company',
        location: j.candidate_required_location ?? 'Remote',
        remote: true,
        url: j.url ?? '',
        description: j.description ?? null,
        salary_min: null,
        salary_max: null,
        salary_currency: null,
        posted_at: j.publication_date ?? null,
        raw: j,
      })).filter((j) => j.external_id && j.url)
    } catch {
      return []
    }
  },
}
