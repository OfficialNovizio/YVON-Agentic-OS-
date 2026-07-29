import { NextRequest } from 'next/server'
import { supabase }    from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry')
  const type     = searchParams.get('type')
  const strength = searchParams.get('strength')
  const search   = searchParams.get('search')
  const id       = searchParams.get('id')

  // Single contact fetch
  if (id) {
    const { data, error } = await supabase
      .from('network_contacts').select('*').eq('id', id).single()
    if (error) return Response.json({ error: error.message }, { status: 404 })
    return Response.json({ contact: data })
  }

  let query = supabase
    .from('network_contacts')
    .select('*')
    .order('last_contacted', { ascending: false, nullsFirst: false })

  if (industry && industry !== 'All') query = query.eq('industry_tag', industry)
  if (type     && type     !== 'All') query = query.eq('relationship_type', type)
  if (strength && strength !== 'All') query = query.eq('relationship_strength', strength)
  if (search) {
    query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ contacts: data })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.name) return Response.json({ error: 'name is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('network_contacts')
    .insert({
      name:                  body.name,
      title:                 body.title                 ?? null,
      company:               body.company               ?? null,
      industry_tag:          body.industry_tag          ?? null,
      linkedin_url:          body.linkedin_url          ?? null,
      email:                 body.email                 ?? null,
      location:              body.location              ?? null,
      how_met:               body.how_met               ?? null,
      relationship_type:     body.relationship_type     ?? 'peer',
      relationship_strength: body.relationship_strength ?? 'weak',
      venture_slug:          body.venture_slug          ?? null,
      notes:                 body.notes                 ?? null,
      last_contacted:        body.last_contacted        ?? null,
      next_action:           body.next_action           ?? null,
      next_action_date:      body.next_action_date      ?? null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ contact: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, ...updates } = body
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('network_contacts').update(updates).eq('id', id as string).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ contact: data })
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('network_contacts').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
