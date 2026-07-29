import { NextRequest } from 'next/server'
import { supabase }    from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry')

  let query = supabase.from('post_ideas').select('*').order('created_at', { ascending: false })
  if (industry) query = query.eq('industry_tag', industry)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ideas: data })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.topic || !body.industry_tag) {
    return Response.json({ error: 'topic and industry_tag are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('post_ideas')
    .insert({
      topic:        body.topic,
      industry_tag: body.industry_tag,
      venture_slug: body.venture_slug ?? null,
      rough_idea:   body.rough_idea ?? null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ idea: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, ...updates } = body
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('post_ideas').update(updates).eq('id', id as string).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ idea: data })
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('post_ideas').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
