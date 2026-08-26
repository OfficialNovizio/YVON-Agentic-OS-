/**
 * /api/job-hunt/sectors/explorer — the saved candidate list (2026-08-25).
 * POST   { sector_id }  → add a sector to the Explorer (idempotent).
 * DELETE ?sector_id=…    → remove a sector from the Explorer.
 * The Explorer is the middle stage: candidates live here until they are
 * promoted to ACTIVE sectors (the page selection → job_hunt_sync_queries).
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  let body: { sector_id?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const sector_id = (body.sector_id ?? '').trim()
  if (!sector_id) return Response.json({ error: 'sector_id is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { error } = await sb.from('job_hunt_explorer').upsert(
      { sector_id },
      { onConflict: 'sector_id', ignoreDuplicates: true },
    )
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const sector_id = (request.nextUrl.searchParams.get('sector_id') ?? '').trim()
  if (!sector_id) return Response.json({ error: 'sector_id is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { error } = await sb.from('job_hunt_explorer').delete().eq('sector_id', sector_id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
