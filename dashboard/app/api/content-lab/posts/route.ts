import { NextRequest } from 'next/server'
import { supabase }    from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const month  = searchParams.get('month') // YYYY-MM

  let query = supabase.from('linkedin_posts').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  if (month)  query = query.gte('scheduled_date', `${month}-01`).lte('scheduled_date', `${month}-31`)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ posts: data })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.content || !body.industry_tag) {
    return Response.json({ error: 'content and industry_tag are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('linkedin_posts')
    .insert({
      content:        body.content,
      industry_tag:   body.industry_tag,
      venture_slug:   body.venture_slug ?? null,
      tone:           body.tone ?? 'story',
      format:         body.format ?? 'text',
      status:         body.status ?? 'draft',
      scheduled_date: body.scheduled_date ?? null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ post: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, ...updates } = body
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('linkedin_posts').update(updates).eq('id', id).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ post: data })
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('linkedin_posts').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
