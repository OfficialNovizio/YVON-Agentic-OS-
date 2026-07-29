/**
 * /api/manual-competitor
 * Manual competitor tracking — user provides brand name + Instagram handle.
 * Scrapes only Instagram via Apify, saves to competitors table.
 *
 * GET  ?venture=novizio          → list manual competitors
 * POST { ventureSlug, brandName, instagramHandle } → scrape & save
 * DELETE ?venture=novizio&id=<uuid> → remove
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getToken } from '@/lib/apify'

export const runtime = 'nodejs'
export const maxDuration = 120

const APIFY_BASE = 'https://api.apify.com/v2'

// ── GET — list manual competitors ──────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('venture')
  if (!slug) return NextResponse.json({ error: 'Missing venture param' }, { status: 400 })

  const { data: ventures } = await supabase
    .from('ventures').select('id').eq('slug', slug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  const { data: competitors } = await supabase
    .from('competitors')
    .select('id, brand_name, tier, signal_score, last_checked, is_custom')
    .eq('venture_id', ventureId)
    .eq('is_custom', true)
    .order('brand_name')

  // Also fetch the IG handle for each
  const compIds = (competitors ?? []).map((c: any) => c.id)
  const { data: socials } = await supabase
    .from('competitor_socials')
    .select('competitor_id, handle_or_url')
    .eq('platform', 'instagram')
    .in('competitor_id', compIds)

  const handleMap = new Map((socials ?? []).map((s: any) => [s.competitor_id, s.handle_or_url]))

  const result = (competitors ?? []).map((c: any) => ({
    ...c,
    instagram_handle: handleMap.get(c.id) ?? null,
  }))

  return NextResponse.json({ competitors: result })
}

// ── POST — add and scrape a single Instagram handle ────────────────────────────

export async function POST(req: NextRequest) {
  let body: { ventureSlug?: string; brandName?: string; instagramHandle?: string }
  try { body = await req.json() as typeof body }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { ventureSlug, brandName, instagramHandle } = body
  if (!ventureSlug || !brandName?.trim() || !instagramHandle?.trim()) {
    return NextResponse.json({ error: 'ventureSlug, brandName, and instagramHandle are required' }, { status: 400 })
  }

  const name = brandName.trim()
  const handle = instagramHandle.trim().replace('@', '')

  // Resolve venture
  const { data: ventures } = await supabase
    .from('ventures').select('id').eq('slug', ventureSlug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  // Check Apify
  let token: string
  try { token = await getToken() }
  catch { return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 }) }

  // Upsert competitor record
  const { data: upserted } = await supabase
    .from('competitors')
    .upsert({
      venture_id: ventureId,
      brand_name: name,
      tier: 'benchmark',
      signal_score: 0,
      follower_growth_rate: 0,
      share_of_voice: 0,
      week_over_week_change: 0,
      is_custom: true,
      last_checked: new Date().toISOString(),
    }, { onConflict: 'venture_id,brand_name' })
    .select('id')
    .single()

  let competitorId: string
  if (upserted) {
    competitorId = (upserted as any).id
  } else {
    const { data: existing } = await supabase
      .from('competitors')
      .select('id')
      .eq('venture_id', ventureId)
      .eq('brand_name', name)
      .limit(1)
      .single()
    competitorId = (existing as any)?.id
    if (!competitorId) return NextResponse.json({ error: 'Failed to create competitor record' }, { status: 500 })
  }

  // Save the Instagram handle
  try {
    await supabase.from('competitor_socials').upsert({
      competitor_id: competitorId,
      platform: 'instagram',
      handle_or_url: handle,
    }, { onConflict: 'competitor_id,platform' })
  } catch { /* ok if fails */ }

  // Scrape Instagram
  let followers = 0
  let engagementRate = 0
  let postCount = 0
  let scrapeError: string | null = null

  try {
    const url = `${APIFY_BASE}/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}&memory=256`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [handle], resultsLimit: 10 }),
      signal: AbortSignal.timeout(120_000),
    })
    if (!res.ok) throw new Error(`Apify returned ${res.status}`)

    const items = await res.json() as any[]
    const p = (items?.[0] ?? {}) as Record<string, any>
    const pArr = (Array.isArray(p.latestPosts) ? p.latestPosts : []) as Record<string, any>[]

    followers = Number(p.followersCount ?? 0)
    postCount = Number(p.postsCount ?? 0)
    const count = pArr.length || 1
    const avgLikes = pArr.reduce((s: number, v: any) => s + Number(v.likesCount ?? 0), 0) / count
    const avgComments = pArr.reduce((s: number, v: any) => s + Number(v.commentsCount ?? 0), 0) / count
    engagementRate = followers > 0 ? (avgLikes + avgComments) / followers : 0

    // Save metrics (time-series: INSERT)
    await supabase.from('competitor_metrics').insert({
      competitor_id: competitorId,
      platform: 'instagram',
      followers,
      engagement_rate: Math.round(engagementRate * 10000) / 10000,
      monthly_reach: 0,
      estimated_monthly_traffic: 0,
      recorded_at: new Date().toISOString(),
    })
  } catch (e: any) {
    scrapeError = e.message ?? 'Unknown scrape error'
  }

  // Compute signal score
  const followerScore = Math.min(Math.log10(Math.max(followers, 1)) * 10, 35)
  const engagementScore = Math.min(engagementRate * 1000, 30)
  const signalScore = Math.round(Math.min(followerScore + engagementScore + 10 + Math.min(postCount * 0.5, 15), 100))

  // Determine tier from actual data
  let tier = 'benchmark'
  if (followers >= 1_000_000) tier = 'anchor'
  else if (followers >= 200_000) tier = 'stretch'

  // Update competitor record
  await supabase.from('competitors').update({
    signal_score: signalScore,
    tier,
    last_checked: new Date().toISOString(),
  }).eq('id', competitorId)

  return NextResponse.json({
    competitor: {
      id: competitorId,
      brand_name: name,
      instagram_handle: handle,
      tier,
      signal_score: signalScore,
      ig_followers: followers,
      ig_engagement_rate: Math.round(engagementRate * 10000) / 10000,
      ig_posts: postCount,
      last_checked: new Date().toISOString(),
      is_custom: true,
    },
    scrape_error: scrapeError,
  })
}

// ── DELETE — remove a manual competitor ────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('venture')
  const id = req.nextUrl.searchParams.get('id')
  if (!slug || !id) return NextResponse.json({ error: 'Missing venture or id param' }, { status: 400 })

  const { data: ventures } = await supabase
    .from('ventures').select('id').eq('slug', slug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  await supabase.from('competitors').delete().eq('id', id).eq('venture_id', ventureId)
  return NextResponse.json({ ok: true })
}
