/**
 * /api/job-hunt/companies/leads/cron — fully automatic OrgBook BC lead
 * pull, zero manual action once deployed (matches the pattern of the
 * existing /api/briefing and /api/trending crons in vercel.json).
 *
 * One keyword's full pagination per invocation (bounded — OrgBook's own
 * pagination caps around page 11/offset 100 regardless of `total`, so this
 * is naturally ~3-4s of work, safely inside any Vercel plan's function
 * timeout). Progress is persisted in company_lead_pull_state (migration
 * 131) so each tick picks up where the last one left off, cycling through
 * all 29 keywords and wrapping around to keep refreshing forever.
 *
 * Same auth pattern as app/api/briefing/route.ts: Vercel calls this with
 * `Authorization: Bearer $CRON_SECRET`.
 */

import { createClient } from '@supabase/supabase-js'
import { getSecret } from '@/lib/secrets'
import { fetchOrgBookPage, ORGBOOK_KEYWORDS } from '@/lib/job-hunt/orgbook'

export const maxDuration = 60

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

const MAX_PAGES_PER_TICK = 12 // real ceiling is ~10-11 pages before OrgBook 400s; a little headroom

export async function GET(request: Request): Promise<Response> {
  const cronSecret = await getSecret('CRON_SECRET')
  if (!cronSecret) return Response.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = getServiceClient()

  const { data: state, error: stateErr } = await sb.from('company_lead_pull_state').select('*').eq('id', 1).single()
  if (stateErr || !state) return Response.json({ error: stateErr?.message ?? 'pull state row missing' }, { status: 500 })

  const keywordIndex = state.keyword_index % ORGBOOK_KEYWORDS.length
  let url: string | null = state.next_url
  const keyword = ORGBOOK_KEYWORDS[keywordIndex]

  let seen = 0
  let upserted = 0
  let pages = 0
  let finishedKeyword = false

  try {
    for (; pages < MAX_PAGES_PER_TICK; pages++) {
      const page = await fetchOrgBookPage(url ? { url } : { keyword })
      seen += page.seen

      if (page.rows.length) {
        const { error } = await sb.from('company_leads').upsert(page.rows, { onConflict: 'source,registration_id', ignoreDuplicates: true })
        if (error) throw new Error(`upsert failed: ${error.message}`)
        upserted += page.rows.length
      }

      url = page.next
      if (!url) { finishedKeyword = true; break }
    }
  } catch (err) {
    // Save nothing on error — next tick retries this same keyword/url from scratch.
    return Response.json({ error: String(err instanceof Error ? err.message : err), keyword }, { status: 500 })
  }

  const nextIndex = finishedKeyword ? (keywordIndex + 1) % ORGBOOK_KEYWORDS.length : keywordIndex
  const nextUrl = finishedKeyword ? null : url

  const result = `"${keyword}": ${pages} page(s), ${seen} seen, ${upserted} upserted${finishedKeyword ? ' (keyword complete)' : ' (continuing next tick)'}`

  await sb.from('company_lead_pull_state').update({
    keyword_index: nextIndex,
    next_url: nextUrl,
    last_run_at: new Date().toISOString(),
    last_result: result,
    updated_at: new Date().toISOString(),
  }).eq('id', 1)

  return Response.json({ keyword, pages, seen, upserted, finishedKeyword, nextKeyword: ORGBOOK_KEYWORDS[nextIndex] })
}
