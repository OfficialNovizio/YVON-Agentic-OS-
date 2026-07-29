import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabase.from('job_applications').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ applications: data })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const required = ['title', 'company', 'industry', 'province']
  for (const f of required) {
    if (!body[f]) return Response.json({ error: `${f} is required` }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      title:           body.title,
      company:         body.company,
      company_domain:  body.company_domain ?? null,
      industry:        body.industry,
      province:        body.province,
      location_type:   body.location_type ?? 'onsite',
      salary_min:      body.salary_min ?? null,
      salary_max:      body.salary_max ?? null,
      source:          body.source ?? null,
      job_url:         body.job_url ?? null,
      status:          body.status ?? 'saved',
      resume_id:       body.resume_id ?? null,
      cover_letter:    body.cover_letter ?? null,
      notes:           body.notes ?? null,
      contact_name:    body.contact_name ?? null,
      contact_linkedin:body.contact_linkedin ?? null,
      next_action:     body.next_action ?? null,
      next_action_date:body.next_action_date ?? null,
      match_score:     body.match_score ?? null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ application: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, ...updates } = body
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  if (updates.status === 'applied' && !updates.applied_at) {
    updates.applied_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('job_applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ application: data })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('job_applications').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
