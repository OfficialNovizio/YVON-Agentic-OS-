/**
 * /api/job-hunt/linkedin/posts — LinkedIn post drafts/schedule (Content Lab).
 * Schema pulled from the operator's own YVON-OS 025_content_lab.sql.
 * Publishing (actually posting to LinkedIn) is a separate route —
 * app/api/job-hunt/linkedin/publish/route.ts — this one is CRUD only.
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
  const status = searchParams.get('status')

  try {
    const sb = getServiceClient()
    let query = sb.from('linkedin_posts').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ posts: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.content) return Response.json({ error: 'content is required' }, { status: 400 })
  if (!body.industry_tag) return Response.json({ error: 'industry_tag is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('linkedin_posts')
      .insert({
        content: body.content,
        industry_tag: body.industry_tag,
        venture_slug: body.venture_slug ?? null,
        tone: body.tone ?? 'story',
        format: body.format ?? 'text',
        status: body.status ?? 'draft',
        scheduled_date: body.scheduled_date ?? null,
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ post: data }, { status: 201 })
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
    const { data, error } = await sb.from('linkedin_posts').update(updates).eq('id', id as string).select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ post: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { error } = await sb.from('linkedin_posts').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
