// Greenhouse public boards API — boards-api.greenhouse.io/v1/boards/{slug}/jobs.
// Free, no key, one call per tracked company. Company slug list below is
// pulled from santifer/career-ops' real templates/portals.example.yml
// tracked_companies (MIT-licensed), trimmed to the entries that carry a real
// `api:` field (i.e. confirmed live Greenhouse JSON API, not a
// Playwright/WebSearch-only entry) — see migrations/122_job_hunt_discovery.sql
// for the full provenance note. That source file's title_filter is specific
// to career-ops' own AI/ML-focused job search; we deliberately do NOT pull
// that filter — company reach is reusable for any role, keyword relevance
// comes from the operator's own Master Profile / search query instead.
import type { JobSource, NormalizedJob, SourceSearchOptions } from '../types'

// name -> Greenhouse board slug (from the `api:` URL's /boards/{slug}/ segment)
export const GREENHOUSE_COMPANIES: Record<string, string> = {
  Anthropic: 'anthropic',
  PolyAI: 'polyai',
  Parloa: 'parloa',
  Intercom: 'intercom',
  'Hume AI': 'humeai',
  Airtable: 'airtable',
  Vercel: 'vercel',
  Temporal: 'temporal',
  'Arize AI': 'arizeai',
  RunPod: 'runpod',
  'Weights & Biases (CoreWeave)': 'coreweave',
  Glean: 'gleanwork',
  Speechmatics: 'speechmatics',
  Boomi: 'boomilp',
  Later: 'later',
  'Safari AI': 'safariai',
  Hootsuite: 'hootsuite',
  'Black Forest Labs': 'blackforestlabs',
  Helsing: 'helsing',
  Celonis: 'celonis',
  Contentful: 'contentful',
  GetYourGuide: 'getyourguide',
  HelloFresh: 'hellofresh',
  N26: 'n26',
  'Trade Republic': 'traderepublicbank',
  SumUp: 'sumup',
  Scandit: 'scandit',
  Wayve: 'wayve',
  'Isomorphic Labs': 'isomorphiclabs',
  PhysicsX: 'physicsx',
  'Stability AI': 'stabilityai',
  Runway: 'runwayml',
  Hightouch: 'hightouch',
  PlanetScale: 'planetscale',
  Amplemarket: 'amplemarket',
}

interface GreenhouseJob {
  id?: number
  absolute_url?: string
  title?: string
  location?: { name?: string }
  updated_at?: string
  first_published?: string
}

async function fetchCompany(name: string, slug: string, query: string): Promise<NormalizedJob[]> {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=false`, {
      next: { revalidate: 0 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { jobs?: GreenhouseJob[] }
    const q = query.trim().toLowerCase()
    const jobs = (data.jobs ?? []).filter((j) => !q || (j.title ?? '').toLowerCase().includes(q))

    return jobs.map((j): NormalizedJob => ({
      source: 'greenhouse',
      external_id: `${slug}-${j.id ?? j.absolute_url ?? ''}`,
      title: j.title ?? 'Untitled role',
      company: name,
      location: j.location?.name ?? null,
      remote: j.location?.name?.toLowerCase().includes('remote') ?? null,
      url: j.absolute_url ?? '',
      description: null, // content=false keeps each call small; fetch detail on demand later
      salary_min: null,
      salary_max: null,
      salary_currency: null,
      posted_at: j.first_published ?? j.updated_at ?? null,
      raw: j,
    })).filter((j) => j.url)
  } catch {
    return [] // one company failing (renamed board, 404) never blocks the rest
  }
}

export const greenhouseSource: JobSource = {
  id: 'greenhouse',
  label: 'Greenhouse (tracked companies)',
  needsKey: false,
  async search({ query, limit = 25 }: SourceSearchOptions): Promise<NormalizedJob[]> {
    const entries = Object.entries(GREENHOUSE_COMPANIES)
    const results = await Promise.all(entries.map(([name, slug]) => fetchCompany(name, slug, query)))
    return results.flat().slice(0, limit)
  },
}
