/**
 * OrgBook BC integration — the BC government's free, public, official
 * corporate-registry API (orgbook.gov.bc.ca), not scraped. Shared between
 * the /api/job-hunt/companies/leads/fetch-batch route (the live path, runs
 * on whatever server the dashboard is running on — dev or deployed) and
 * documented for scripts/fetch-orgbook-leads.mjs (the standalone CLI
 * fallback, which keeps its own small copy of this map so it stays
 * dependency-free plain Node).
 */

export const ORGBOOK_BASE = 'https://orgbook.gov.bc.ca/api/v4/search/topic'

// Deliberately broad. Generic terms (systems, consulting, financial) pull
// in plenty of noise on purpose — these land as unverified leads for a
// human to skim and promote, not directly into the curated watchlist.
export const KEYWORD_INDUSTRY: Record<string, string> = {
  aerospace: 'Aerospace',
  aviation: 'Aerospace',
  aircraft: 'Aerospace',
  avionics: 'Aerospace',
  helicopter: 'Aerospace',
  drone: 'Drone',
  uav: 'Drone',
  'unmanned aerial': 'Drone',
  'unmanned aircraft': 'Drone',
  trucking: 'Trucking',
  freight: 'Trucking',
  transport: 'Trucking',
  transportation: 'Trucking',
  logistics: 'Trucking',
  cartage: 'Trucking',
  hauling: 'Trucking',
  carrier: 'Trucking',
  technologies: 'IT',
  software: 'IT',
  systems: 'IT',
  'information technology': 'IT',
  'tech solutions': 'IT',
  'data systems': 'IT',
  consulting: 'Business',
  financial: 'Business',
  insurance: 'Business',
  capital: 'Business',
  holdings: 'Business',
  ventures: 'Business',
}

export const ORGBOOK_KEYWORDS = Object.keys(KEYWORD_INDUSTRY)

interface OrgBookName { type: string; text: string }
interface OrgBookAttribute { type: string; value: string }
interface OrgBookTopic {
  source_id: string
  names?: OrgBookName[]
  attributes?: OrgBookAttribute[]
}
interface OrgBookTopicSearchResponse {
  total: number
  next: string | null
  results: OrgBookTopic[]
}

export function extractName(topic: OrgBookTopic): string | null {
  const nameEntry = (topic.names ?? []).find((n) => n.type === 'entity_name') ?? topic.names?.[0]
  return nameEntry?.text?.trim() ?? null
}

export function extractAttribute(topic: OrgBookTopic, type: string): string | null {
  return (topic.attributes ?? []).find((a) => a.type === type)?.value ?? null
}

export interface LeadRow {
  name: string
  source: 'orgbook_bc'
  registration_id: string
  entity_status: string | null
  entity_type: string | null
  matched_keyword: string
  industry_guess: string | null
  province: 'BC'
}

/**
 * Fetches one page from OrgBook (either a fresh keyword search or a `next`
 * URL) and maps it to lead rows.
 *
 * Empirically confirmed 2026-08-15 (from a real full run, not the docs):
 * OrgBook's own pagination caps out around page 11 (offset 100) with an
 * HTTP 400, regardless of how large `total` claims to be — e.g. "consulting"
 * reports 51,054 matches but only the first ~100 are actually retrievable
 * through this endpoint. That 400 is treated here as a normal end-of-results
 * signal (next: null), not an error, since it's the API's own hard limit
 * rather than something wrong with the request.
 */
export async function fetchOrgBookPage(urlOrKeyword: { keyword: string } | { url: string }): Promise<{
  rows: LeadRow[]
  next: string | null
  total: number
  seen: number
}> {
  const url = 'keyword' in urlOrKeyword
    ? `${ORGBOOK_BASE}?q=${encodeURIComponent(urlOrKeyword.keyword)}`
    : urlOrKeyword.url

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (res.status === 400) return { rows: [], next: null, total: 0, seen: 0 }
  if (!res.ok) throw new Error(`OrgBook HTTP ${res.status}`)
  const data: OrgBookTopicSearchResponse = await res.json()

  const keyword = 'keyword' in urlOrKeyword ? urlOrKeyword.keyword : new URL(url).searchParams.get('q') ?? ''

  const rows: LeadRow[] = (data.results ?? [])
    .map((topic): LeadRow | null => {
      const name = extractName(topic)
      if (!name) return null
      return {
        name,
        source: 'orgbook_bc',
        registration_id: topic.source_id,
        entity_status: extractAttribute(topic, 'entity_status'),
        entity_type: extractAttribute(topic, 'entity_type'),
        matched_keyword: keyword,
        industry_guess: KEYWORD_INDUSTRY[keyword] ?? null,
        province: 'BC',
      }
    })
    .filter((r): r is LeadRow => r !== null)

  return { rows, next: data.next, total: data.total, seen: data.results?.length ?? 0 }
}
