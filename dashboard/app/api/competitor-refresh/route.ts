/**
 * /api/competitor-refresh
 *
 * The staleness/schedule checker for competitor tracking.
 *
 * (POST refresh scraping retired with Apify, 2026-09-07 — POST now returns
 * 501 loudly instead of pretending to refresh. GET staleness status remains
 * fully functional, minus the Apify-CU cost fields.)
 *
 * GET  ?venture=<slug>          → check staleness, return status
 * POST { ventureSlug }           → 501 (scraping retired, no replacement wired)
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

// ─── GET — staleness check ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('venture')
  if (!slug) return NextResponse.json({ error: 'venture required' }, { status: 400 })

  const { data: ventures } = await supabase.from('ventures').select('id').eq('slug', slug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  const { data: settings } = await supabase
    .from('competitor_settings')
    .select('*')
    .eq('venture_id', ventureId)
    .single()

  const s = (settings ?? {}) as any
  const lastRefreshed = s.last_refreshed ? new Date(s.last_refreshed).getTime() : 0
  const now = Date.now()
  const ageHours = lastRefreshed ? Math.round((now - lastRefreshed) / (1000 * 60 * 60)) : 999

  // Determine which platforms would be scraped
  const { data: socials } = await supabase
    .from('venture_socials')
    .select('platform')
    .eq('venture_id', ventureId)

  const venturePlatforms = (socials ?? []).map((s: any) => s.platform)
  const configuredPlatforms: string[] = s.platforms_to_scrape ?? []
  const activePlatforms = configuredPlatforms.length > 0
    ? configuredPlatforms.filter((p: string) => venturePlatforms.includes(p))
    : venturePlatforms // auto-detect from venture_socials

  // Count competitors
  const { count: competitorCount } = await supabase
    .from('competitors')
    .select('id', { count: 'exact', head: true })
    .eq('venture_id', ventureId)
    .eq('is_custom', true)

  let staleness: 'fresh' | 'aging' | 'stale' = 'fresh'
  if (ageHours > 84) staleness = 'stale'      // > 3.5 days
  else if (ageHours > 36) staleness = 'aging'  // > 1.5 days

  return NextResponse.json({
    lastRefreshed: s.last_refreshed ?? null,
    ageHours,
    staleness,
    refreshFrequency: s.refresh_frequency ?? 'twice_weekly',
    activePlatforms,
    competitorCount: competitorCount ?? 0,
  })
}

// ─── POST — retired with Apify (2026-09-07) ──────────────────────────────────

export async function POST() {
  return NextResponse.json({
    error: 'Competitor refresh scraping retired with Apify (2026-09-07) — no replacement metric source is wired. Staleness status remains available via GET.',
  }, { status: 501 })
}

