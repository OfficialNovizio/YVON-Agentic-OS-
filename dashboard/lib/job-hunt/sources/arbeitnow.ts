// Arbeitnow — arbeitnow.com/api/job-board-api. Free, no key. Verified live
// shape (2026-08-15): { data: [{ slug, company_name, title, description,
// remote, url, tags, job_types, location, created_at }] }. No server-side
// keyword search param, so we filter client-side against title/tags.
import type { JobSource, NormalizedJob, SourceSearchOptions } from '../types'

interface ArbeitnowJob {
  slug?: string
  company_name?: string
  title?: string
  description?: string
  remote?: boolean
  url?: string
  tags?: string[]
  location?: string
  created_at?: number // unix seconds
}

export const arbeitnowSource: JobSource = {
  id: 'arbeitnow',
  label: 'Arbeitnow',
  needsKey: false,
  async search({ query, limit = 25 }: SourceSearchOptions): Promise<NormalizedJob[]> {
    try {
      const res = await fetch('https://www.arbeitnow.com/api/job-board-api', { next: { revalidate: 0 } })
      if (!res.ok) return []
      const data = (await res.json()) as { data?: ArbeitnowJob[] }
      const jobs = data.data ?? []

      const q = query.trim().toLowerCase()
      const filtered = q
        ? jobs.filter((j) =>
            (j.title ?? '').toLowerCase().includes(q) ||
            (j.tags ?? []).some((t) => t.toLowerCase().includes(q)))
        : jobs

      return filtered.slice(0, limit).map((j): NormalizedJob => ({
        source: 'arbeitnow',
        external_id: j.slug ?? j.url ?? '',
        title: j.title ?? 'Untitled role',
        company: j.company_name ?? 'Unknown company',
        location: j.location ?? null,
        remote: j.remote ?? null,
        url: j.url ?? '',
        description: j.description ?? null,
        salary_min: null,
        salary_max: null,
        salary_currency: null,
        posted_at: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
        raw: j,
      })).filter((j) => j.external_id && j.url)
    } catch {
      return []
    }
  },
}
