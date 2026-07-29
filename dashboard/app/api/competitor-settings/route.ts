/**
 * /api/competitor-settings
 * GET  ?venture=novizio  → read settings
 * PATCH { ventureSlug, refresh_frequency, platforms_to_scrape } → update
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('venture')
  if (!slug) return NextResponse.json({ error: 'venture required' }, { status: 400 })

  const { data: ventures } = await supabase.from('ventures').select('id').eq('slug', slug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  // Get or create settings
  let { data: settings } = await supabase
    .from('competitor_settings')
    .select('*')
    .eq('venture_id', ventureId)
    .single()

  if (!settings) {
    await supabase.from('competitor_settings').insert({
      venture_id: ventureId,
      refresh_frequency: 'twice_weekly',
      platforms_to_scrape: [],
    })
    const { data: created } = await supabase
      .from('competitor_settings')
      .select('*')
      .eq('venture_id', ventureId)
      .single()
    settings = created
  }

  // Get venture's connected social platforms
  const { data: socials } = await supabase
    .from('venture_socials')
    .select('platform')
    .eq('venture_id', ventureId)

  const venturePlatforms = (socials ?? []).map((s: any) => s.platform)

  return NextResponse.json({
    ...(settings as any),
    venture_platforms: venturePlatforms,
  })
}

export async function PATCH(req: NextRequest) {
  let body: { ventureSlug?: string; refresh_frequency?: string; platforms_to_scrape?: string[] }
  try { body = await req.json() as typeof body }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { ventureSlug } = body
  if (!ventureSlug) return NextResponse.json({ error: 'ventureSlug required' }, { status: 400 })

  const { data: ventures } = await supabase.from('ventures').select('id').eq('slug', ventureSlug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  const updates: Record<string, any> = {}
  if (body.refresh_frequency) updates.refresh_frequency = body.refresh_frequency
  if (body.platforms_to_scrape !== undefined) updates.platforms_to_scrape = body.platforms_to_scrape

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data: settings } = await supabase
    .from('competitor_settings')
    .upsert({ venture_id: ventureId, ...updates }, { onConflict: 'venture_id' })
    .select('*')
    .single()

  return NextResponse.json(settings)
}
