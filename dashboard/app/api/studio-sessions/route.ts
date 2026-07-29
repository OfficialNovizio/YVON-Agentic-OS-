// Studio Sessions — save and retrieve Creative Studio history for Load & Remix
// POST → save a completed session
// GET  → fetch last 15 sessions for the active venture

import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export const maxDuration = 30

interface SessionBody {
  mode: 'single' | 'storyline' | 'shoot'
  brief: Record<string, unknown>
  moods?: unknown[]
  selectedMoodName?: string | null
  scriptData?: Record<string, unknown> | null
  captionsData?: Record<string, unknown> | null
  promptsData?: Record<string, unknown> | null
  imageUrls?: { index: number; title: string; url: string }[]
  storylineData?: Record<string, unknown> | null
  shotListData?: Record<string, unknown> | null
}

export async function POST(request: Request): Promise<Response> {
  const cookieStore = await cookies()
  const slug = cookieStore.get('yvon_active_venture')?.value ?? 'novizio'

  let body: SessionBody
  try { body = await request.json() as SessionBody }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.mode || !body.brief) {
    return Response.json({ error: 'mode and brief required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('studio_sessions')
    .insert({
      venture_slug:       slug,
      mode:               body.mode,
      brief:              body.brief,
      moods:              body.moods ?? null,
      selected_mood_name: body.selectedMoodName ?? null,
      script_data:        body.scriptData ?? null,
      captions_data:      body.captionsData ?? null,
      prompts_data:       body.promptsData ?? null,
      image_urls:         body.imageUrls?.length ? body.imageUrls : null,
      storyline_data:     body.storylineData ?? null,
      shot_list_data:     body.shotListData ?? null,
    })
    .select('id, created_at')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ id: data.id, createdAt: data.created_at })
}

export async function GET(): Promise<Response> {
  const cookieStore = await cookies()
  const slug = cookieStore.get('yvon_active_venture')?.value ?? 'novizio'

  const { data, error } = await supabase
    .from('studio_sessions')
    .select('id, created_at, mode, brief, moods, selected_mood_name, script_data, captions_data, prompts_data, image_urls, storyline_data, shot_list_data')
    .eq('venture_slug', slug)
    .order('created_at', { ascending: false })
    .limit(15)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ sessions: data ?? [] })
}
