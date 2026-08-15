/**
 * /api/job-hunt/postings — list stored postings (GET) and change a posting's
 * status (PATCH) — the only write this route allows is status, and it never
 * goes further than 'queued' from here. 'applied'/'interview'/'offer'/
 * 'rejected' are for the tracker artifact (Job Hunt #4), set by the operator
 * after they've actually gone and applied on the real site themselves.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Number(searchParams.get('limit') ?? '100')

    const sb = getServiceClient()
    let q = sb.from('job_postings').select('*').order('discovered_at', { ascending: false }).limit(limit)
    if (status) q = q.eq('status', status)

    const { data, error } = await q
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ postings: data ?? [] })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

const ALLOWED_STATUSES = ['discovered', 'queued', 'applied', 'interview', 'offer', 'rejected', 'archived']

export async function PATCH(request: NextRequest) {
  let body: { id?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id, status } = body
  if (!id || !status) return Response.json({ error: 'id and status are required' }, { status: 400 })
  if (!ALLOWED_STATUSES.includes(status)) return Response.json({ error: `status must be one of ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('job_postings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, posting: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
