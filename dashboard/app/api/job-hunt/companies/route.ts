/**
 * /api/job-hunt/companies — target company watchlist/browser. Adapted from
 * the operator's own YVON-OS app/api/jobs/companies/route.ts (2026-08-15),
 * same logic ported to this project's service-role client pattern.
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
  const industries = searchParams.get('industries')?.split(',').filter(Boolean) ?? []
  const provinces = searchParams.get('provinces')?.split(',').filter(Boolean) ?? []
  const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) ?? []
  const watching = searchParams.get('watching') === 'true'

  try {
    const sb = getServiceClient()
    let query = sb.from('target_companies').select('*').order('name')

    if (industries.length) query = query.in('industry', industries)
    if (provinces.length) query = query.in('province', provinces)
    if (sizes.length) query = query.in('size', sizes)
    if (watching) query = query.eq('is_watching', true)

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ companies: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, ...updates } = body
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { data, error } = await sb.from('target_companies').update(updates).eq('id', id).select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ company: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const required = ['name', 'industry', 'province']
  for (const f of required) {
    if (!body[f]) return Response.json({ error: `${f} is required` }, { status: 400 })
  }

  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('target_companies')
      .insert({
        name: body.name,
        domain: body.domain ?? null,
        industry: body.industry,
        province: body.province,
        size: body.size ?? 'medium',
        description: body.description ?? null,
        careers_url: body.careers_url ?? null,
        is_watching: body.is_watching ?? false,
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ company: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
