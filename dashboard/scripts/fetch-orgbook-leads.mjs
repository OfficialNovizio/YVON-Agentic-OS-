/**
 * fetch-orgbook-leads.mjs
 * ─────────────────────────────────────────────────────────────────────────
 * Bulk-pulls raw company leads from OrgBook BC (orgbook.gov.bc.ca) — the BC
 * government's free, public, official corporate-registry API — into the
 * company_leads table (migration 130). Not scraping: this is an open API
 * the BC government built specifically for third-party integration
 * (bcgov.github.io/orgbook-bc-api-docs).
 *
 * Runs `/v4/search/topic?q=<keyword>` for a fixed list of industry
 * keywords, follows real pagination (`next` URL from the response), and
 * upserts every match into company_leads with a best-effort industry guess
 * based on which keyword found it. These are RAW LEADS — a name,
 * registration ID, and status only. No industry/city/size/description is
 * verified. Review and promote real ones into target_companies via the
 * /job-hunt/companies/leads page.
 *
 * Why this exists alongside the "Pull leads now" button and the automatic
 * cron on the leads page: this script is the manual/local fallback. The
 * live paths (/api/job-hunt/companies/leads/fetch-batch, driven from the
 * browser, and /api/job-hunt/companies/leads/cron, driven by Vercel cron)
 * run on whatever server the dashboard is running on and need no terminal
 * at all — prefer those. This script is here for anyone who wants a one-off
 * CLI pull without opening the dashboard.
 *
 * Real ceiling, confirmed empirically (2026-08-15, not from the docs):
 * OrgBook's own pagination caps at page 11 (offset 100) with an HTTP 400,
 * regardless of how large `total` claims to be — e.g. "consulting" reports
 * 51,054 matches but only ~100 are actually retrievable per keyword. The
 * --max-per-keyword flag below is a ceiling this script won't exceed, not a
 * guarantee it'll be reached; in practice you'll hit ~100/keyword max.
 *
 * Usage:
 *   node scripts/fetch-orgbook-leads.mjs
 *   node scripts/fetch-orgbook-leads.mjs --max-per-keyword=50
 *   node scripts/fetch-orgbook-leads.mjs --keywords=aerospace,drone
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Load env vars (same pattern as scripts/migrate.mjs) ──────────────────
function loadEnv() {
  try {
    const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf8')
    for (const line of envFile.split('\n')) {
      if (!line.trim() || line.startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // No .env.local — fine if env vars are already set some other way
  }
}

// ─── Keyword -> Job Hunt industry map ──────────────────────────────────────
// Deliberately broad. Generic terms (systems, consulting, financial) will
// pull in plenty of noise — that's expected and fine, since these land as
// unverified leads for a human to skim, not directly into the watchlist.
const KEYWORD_INDUSTRY = {
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

const ORGBOOK_BASE = 'https://orgbook.gov.bc.ca/api/v4/search/topic'
const DELAY_MS = 250 // politeness delay between page requests — free gov API, no documented rate limit

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Add to .env.local.')
    process.exit(1)
  }
  return createClient(url, key)
}

function extractName(topic) {
  const nameEntry = (topic.names ?? []).find((n) => n.type === 'entity_name') ?? topic.names?.[0]
  return nameEntry?.text?.trim() ?? null
}

function extractAttribute(topic, type) {
  const attr = (topic.attributes ?? []).find((a) => a.type === type)
  return attr?.value ?? null
}

async function fetchKeyword(keyword, maxResults, sb) {
  let url = `${ORGBOOK_BASE}?q=${encodeURIComponent(keyword)}`
  let fetched = 0
  let attempted = 0
  let page = 1

  while (url && fetched < maxResults) {
    let res
    try {
      res = await fetch(url, { headers: { Accept: 'application/json' } })
    } catch (err) {
      console.error(`  ✗ network error on page ${page}: ${err.message}`)
      break
    }
    if (res.status === 400) {
      // Confirmed empirically (2026-08-15, real run): OrgBook's pagination
      // caps around page 11 (offset 100) with a 400, regardless of the
      // `total` it reports — e.g. "consulting" claims 51,054 matches but
      // only ~100 are actually retrievable. Treat as end-of-results, not
      // an error.
      console.log(`  (OrgBook pagination cap reached at page ${page} — this is expected, not a failure)`)
      break
    }
    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status} on page ${page}`)
      break
    }
    const data = await res.json()
    const results = data.results ?? []

    const rows = results
      .map((topic) => {
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
      .filter(Boolean)

    if (rows.length) {
      // ignoreDuplicates: true so re-running with overlapping keywords
      // doesn't error on the (source, registration_id) unique constraint.
      // Row count under ignoreDuplicates isn't reliable across PostgREST
      // versions, so "new rows" is measured via a before/after table count
      // in main() instead of trusting this call's return value.
      const { error } = await sb
        .from('company_leads')
        .upsert(rows, { onConflict: 'source,registration_id', ignoreDuplicates: true })
      if (error) console.error(`  ✗ upsert error: ${error.message}`)
      attempted += rows.length
    }

    fetched += results.length
    console.log(`  page ${page}: +${results.length} (total seen ${fetched}/${data.total ?? '?'})`)

    url = data.next
    page += 1
    if (url) await sleep(DELAY_MS)
  }

  return { fetched, attempted }
}

async function main() {
  loadEnv()
  const sb = getServiceClient()

  const args = process.argv.slice(2)
  const maxArg = args.find((a) => a.startsWith('--max-per-keyword='))
  const maxPerKeyword = maxArg ? parseInt(maxArg.split('=')[1], 10) : 100
  const keywordsArg = args.find((a) => a.startsWith('--keywords='))
  const keywords = keywordsArg ? keywordsArg.split('=')[1].split(',') : Object.keys(KEYWORD_INDUSTRY)

  console.log(`\n🔎 OrgBook BC lead pull — ${keywords.length} keywords, up to ${maxPerKeyword} results each\n`)

  const { count: countBefore } = await sb.from('company_leads').select('*', { count: 'exact', head: true })

  let totalFetched = 0
  let totalAttempted = 0

  for (const keyword of keywords) {
    console.log(`\n"${keyword}" (-> ${KEYWORD_INDUSTRY[keyword] ?? 'unclassified'})`)
    const { fetched, attempted } = await fetchKeyword(keyword, maxPerKeyword, sb)
    totalFetched += fetched
    totalAttempted += attempted
    console.log(`  done: ${fetched} seen, ${attempted} upserted (may include dupes across keywords)`)
  }

  const { count: countAfter } = await sb.from('company_leads').select('*', { count: 'exact', head: true })

  console.log(`\n─────────────────────────────────────────`)
  console.log(`Total seen across all keywords: ${totalFetched}`)
  console.log(`Upsert calls made: ${totalAttempted}`)
  console.log(`company_leads table: ${countBefore} -> ${countAfter} (${countAfter - countBefore} genuinely new)`)
  console.log(`─────────────────────────────────────────\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
