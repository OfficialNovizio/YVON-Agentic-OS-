/**
 * /api/job-hunt/network/contacts — Network CRM. Ported from the operator's
 * own YVON-OS app/api/network/contacts/route.ts (2026-08-15), same logic
 * on this project's service-role client pattern.
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
  const industry = searchParams.get('industry')
  const type = searchParams.get('type')
  const strength = searchParams.get('strength')
  const search = searchParams.get('search')
  const id = searchParams.get('id')

  try {
    const sb = getServiceClient()

    if (id) {
      const { data, error } = await sb.from('network_contacts').select('*').eq('id', id).single()
      if (error) return Response.json({ error: error.message }, { status: 404 })
      return Response.json({ contact: data })
    }

    let query = sb.from('network_contacts').select('*').order('last_contacted', { ascending: false, nullsFirst: false })
    if (industry && industry !== 'All') query = query.eq('industry_tag', industry)
    if (type && type !== 'All') query = query.eq('relationship_type', type)
    if (strength && strength !== 'All') query = query.eq('relationship_strength', strength)
    if (search) query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%`)

    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ contacts: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.name) return Response.json({ error: 'name is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('network_contacts')
      .insert({
        name: body.name,
        title: body.title ?? null,
        company: body.company ?? null,
        industry_tag: body.industry_tag ?? null,
        linkedin_url: body.linkedin_url ?? null,
        email: body.email ?? null,
        location: body.location ?? null,
        how_met: body.how_met ?? null,
        relationship_type: body.relationship_type ?? 'peer',
        relationship_strength: body.relationship_strength ?? 'weak',
        venture_slug: body.venture_slug ?? null,
        notes: body.notes ?? null,
        last_contacted: body.last_contacted ?? null,
        next_action: body.next_action ?? null,
        next_action_date: body.next_action_date ?? null,
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ contact: data }, { status: 201 })
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
    const { data, error } = await sb.from('network_contacts').update(updates).eq('id', id as string).select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ contact: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { error } = await sb.from('network_contacts').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
