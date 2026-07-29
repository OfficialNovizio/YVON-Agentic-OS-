import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industries = searchParams.get('industries')?.split(',').filter(Boolean) ?? []
  const provinces  = searchParams.get('provinces')?.split(',').filter(Boolean) ?? []
  const sizes      = searchParams.get('sizes')?.split(',').filter(Boolean) ?? []
  const watching   = searchParams.get('watching') === 'true'

  let query = supabase.from('target_companies').select('*').order('name')

  if (industries.length) query = query.in('industry', industries)
  if (provinces.length)  query = query.in('province', provinces)
  if (sizes.length)      query = query.in('size', sizes)
  if (watching)          query = query.eq('is_watching', true)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ companies: data })
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, ...updates } = body
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('target_companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ company: data })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const required = ['name', 'industry', 'province']
  for (const f of required) {
    if (!body[f]) return Response.json({ error: `${f} is required` }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('target_companies')
    .insert({
      name:        body.name,
      domain:      body.domain ?? null,
      industry:    body.industry,
      province:    body.province,
      size:        body.size ?? 'medium',
      description: body.description ?? null,
      careers_url: body.careers_url ?? null,
      is_watching: body.is_watching ?? false,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ company: data }, { status: 201 })
}
