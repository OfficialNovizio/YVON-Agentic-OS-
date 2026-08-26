/**
 * /api/job-hunt/companies/leads — raw, unverified leads pulled from OrgBook
 * BC (scripts/fetch-orgbook-leads.mjs) into company_leads. GET lists/filters
 * them for review; PATCH marks one dismissed or promoted (promotion itself
 * happens via a normal POST to /api/job-hunt/companies — this route just
 * flips the flag once that succeeds, see ../route.ts for the target_companies
 * insert).
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry') // 'Aerospace' | ... | 'unclassified'
  const status = searchParams.get('status') // e.g. 'ACT'
  const search = searchParams.get('search')?.trim()
  const promoted = searchParams.get('promoted') // 'true' | 'false' | null (any)
  const dismissed = searchParams.get('dismissed') ?? 'false' // default: hide dismissed
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200)
  const offset = Number(searchParams.get('offset') ?? '0')

  try {
    const sb = getServiceClient()
    let query = sb.from('company_leads').select('*', { count: 'exact' }).order('name').range(offset, offset + limit - 1)

    if (industry === 'unclassified') query = query.is('industry_guess', null)
    else if (industry) query = query.eq('industry_guess', industry)
    if (status) query = query.eq('entity_status', status)
    if (search) query = query.ilike('name', `%${search}%`)
    if (promoted === 'true') query = query.eq('promoted', true)
    else if (promoted === 'false') query = query.eq('promoted', false)
    if (dismissed !== 'any') query = query.eq('dismissed', dismissed === 'true')

    const { data, error, count } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ leads: data ?? [], total: count ?? 0 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  let body: { id?: string; promoted?: boolean; dismissed?: boolean }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { id, promoted, dismissed } = body
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const updates: Record<string, boolean> = {}
  if (typeof promoted === 'boolean') updates.promoted = promoted
  if (typeof dismissed === 'boolean') updates.dismissed = dismissed
  if (!Object.keys(updates).length) return Response.json({ error: 'promoted or dismissed required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { data, error } = await sb.from('company_leads').update(updates).eq('id', id).select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ lead: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
