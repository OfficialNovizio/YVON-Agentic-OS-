import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// GET /api/morning-brief/goals?week=2026-05-20
export async function GET(req: NextRequest) {
  const week = req.nextUrl.searchParams.get('week')
  if (!week) return Response.json({ error: 'week param required' }, { status: 400 })

  const { data, error } = await supabase
    .from('weekly_goals')
    .select('*')
    .eq('week_start', week)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ goals: data ?? [] })
}

// POST /api/morning-brief/goals — create
export async function POST(req: NextRequest) {
  let body: { goal?: string; week_start?: string }
  try { body = await req.json() } catch { body = {} }

  if (!body.goal || !body.week_start) {
    return Response.json({ error: 'goal and week_start required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('weekly_goals')
    .insert({ goal: body.goal, week_start: body.week_start })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ goal: data })
}

// PATCH /api/morning-brief/goals — toggle completed
export async function PATCH(req: NextRequest) {
  let body: { id?: string; completed?: boolean }
  try { body = await req.json() } catch { body = {} }

  if (!body.id || body.completed === undefined) {
    return Response.json({ error: 'id and completed required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('weekly_goals')
    .update({ completed: body.completed })
    .eq('id', body.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

// DELETE /api/morning-brief/goals?id=...
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase.from('weekly_goals').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
