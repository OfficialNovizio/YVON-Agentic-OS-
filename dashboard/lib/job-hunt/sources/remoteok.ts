// RemoteOK — remoteok.com/api. Free, no key. First array element is a legal
// notice object (not a job) — always skip it. Requires a real User-Agent or
// the API 403s.
import type { JobSource, NormalizedJob, SourceSearchOptions } from '../types'

interface RemoteOkJob {
  id?: string
  slug?: string
  company?: string
  position?: string
  tags?: string[]
  url?: string
  date?: string
  location?: string
  salary_min?: number
  salary_max?: number
  description?: string
}

export const remoteOkSource: JobSource = {
  id: 'remoteok',
  label: 'RemoteOK',
  needsKey: false,
  async search({ query, limit = 25 }: SourceSearchOptions): Promise<NormalizedJob[]> {
    try {
      const res = await fetch('https://remoteok.com/api', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobHuntBot/1.0)' },
        next: { revalidate: 0 },
      })
      if (!res.ok) return []
      const data = (await res.json()) as RemoteOkJob[]
      const jobs = data.slice(1) // drop the legal-notice entry

      const q = query.trim().toLowerCase()
      const filtered = q
        ? jobs.filter((j) =>
            (j.position ?? '').toLowerCase().includes(q) ||
            (j.tags ?? []).some((t) => t.toLowerCase().includes(q)))
        : jobs

      return filtered.slice(0, limit).map((j): NormalizedJob => ({
        source: 'remoteok',
        external_id: String(j.id ?? j.slug ?? j.url ?? ''),
        title: j.position ?? 'Untitled role',
        company: j.company ?? 'Unknown company',
        location: j.location || 'Remote',
        remote: true,
        url: j.url ?? '',
        description: j.description ?? null,
        salary_min: j.salary_min ?? null,
        salary_max: j.salary_max ?? null,
        salary_currency: j.salary_min || j.salary_max ? 'USD' : null,
        posted_at: j.date ?? null,
        raw: j,
      })).filter((j) => j.external_id && j.url)
    } catch {
      return [] // best-effort source — an outage degrades this source, not the whole search
    }
  },
}
