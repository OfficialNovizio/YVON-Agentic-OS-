/**
 * /api/job-hunt/companies/leads/fetch-batch — pulls ONE page of results
 * from OrgBook BC and upserts them into company_leads. Deliberately scoped
 * to a single page per call (not a full multi-keyword crawl) so it stays
 * well inside serverless function time limits regardless of hosting tier —
 * the frontend (leads page "Pull leads now" button) drives the loop across
 * keywords and pages, one fetch-batch call at a time, with live progress.
 *
 * This runs wherever the Next.js server is running — local dev on the
 * operator's machine today, whatever host it's deployed to later. Either
 * way it has normal internet access, unlike the sandbox this was built in
 * (orgbook.gov.bc.ca isn't reachable from there — confirmed via direct
 * testing, a 403 from that sandbox's network proxy).
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { fetchOrgBookPage, ORGBOOK_KEYWORDS } from '@/lib/job-hunt/orgbook'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET() {
  return Response.json({ keywords: ORGBOOK_KEYWORDS })
}

export async function POST(req: NextRequest) {
  let body: { keyword?: string; url?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.keyword && !body.url) return Response.json({ error: 'keyword or url is required' }, { status: 400 })

  try {
    const { rows, next, total, seen } = await fetchOrgBookPage(
      body.url ? { url: body.url } : { keyword: body.keyword! }
    )

    let upserted = 0
    if (rows.length) {
      const sb = getServiceClient()
      const { error } = await sb.from('company_leads').upsert(rows, { onConflict: 'source,registration_id', ignoreDuplicates: true })
      if (error) return Response.json({ error: error.message }, { status: 500 })
      upserted = rows.length
    }

    return Response.json({ seen, upserted, next, total })
  } catch (err) {
    return Response.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 })
  }
}
