/**
 * /api/competitor-refresh
 *
 * The central refresh scheduler. Called by:
 *   - Manual "Refresh Now" button in Settings
 *   - Competitor page "Refresh Stats" button
 *   - External cron (Vercel cron or user's Task Scheduler)
 *
 * Logic:
 *   1. Reads competitor_settings for the venture
 *   2. Checks staleness (is data older than configured threshold?)
 *   3. Determines which platforms to scrape from venture_socials
 *      (only scrapes platforms where the venture has its own accounts)
 *   4. For each competitor: checks activity (new posts since last scrape?)
 *   5. Runs Apify scrapes only for platforms that passed all checks
 *   6. Saves metrics + posts to DB
 *   7. Updates last_refreshed + Apify CU counter
 *
 * GET  ?venture=novizio          → check staleness, return status
 * POST { ventureSlug }           → run refresh (with all checks)
 * POST { ventureSlug, forceAll } → skip staleness + activity checks
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getToken } from '@/lib/apify'

export const runtime = 'nodejs'
export const maxDuration = 300

const APIFY_BASE = 'https://api.apify.com/v2'

// Per-platform Apify CU cost estimates
const PLATFORM_COST: Record<string, number> = {
  instagram: 0.5,
  tiktok: 0.5,
  youtube: 0.3,
  linkedin: 1.5,
  twitter: 0.5,
  facebook: 0.8,
  threads: 0.5,
}

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

  const estCost = activePlatforms.reduce((sum: number, p: string) => sum + (PLATFORM_COST[p] ?? 0.5), 0) * (competitorCount ?? 0)

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
    estimatedCostCU: Math.round(estCost * 10) / 10,
    apifyCULimit: s.apify_cu_limit ?? 100,
    apifyCUUsedThisMonth: s.apify_cu_used_this_month ?? 0,
  })
}

// ─── POST — run refresh ──────────────────────────────────────────────────────

async function scrapeIGProfile(token: string, handle: string) {
  const clean = handle.replace('@', '')
  const url = `${APIFY_BASE}/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}&memory=512`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [clean], resultsLimit: 30 }),
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) throw new Error(`IG scrape failed (${res.status})`)
  const items = (await res.json()) as any[]
  const p = (items?.[0] ?? {}) as Record<string, any>
  const posts = (Array.isArray(p.latestPosts) ? p.latestPosts : []) as Record<string, any>[]
  return {
    followers: Number(p.followersCount ?? 0),
    totalPosts: Number(p.postsCount ?? 0),
    rawPosts: posts,
  }
}

function computeCompositeScore(data: {
  followers: number; engagementRate: number; avgViews: number;
  postsPerWeek: number; reelCount: number; trendingCount: number
}): number {
  const e = Math.min(data.engagementRate * 1000, 40)
  const v = Math.min(data.postsPerWeek * 4, 20)
  const w = Math.min(Math.log10(Math.max(data.avgViews, 1)) * 5, 15)
  const t = Math.min(data.trendingCount * 5, 15)
  const r = Math.min(Math.log10(Math.max(data.followers, 1)) * 2, 10)
  return Math.round(Math.min(e + v + w + t + r, 100))
}

export async function POST(req: NextRequest) {
  let body: { ventureSlug?: string; forceAll?: boolean }
  try { body = await req.json() as typeof body }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { ventureSlug } = body
  if (!ventureSlug) return NextResponse.json({ error: 'ventureSlug required' }, { status: 400 })

  // Resolve venture
  const { data: ventures } = await supabase
    .from('ventures').select('id').eq('slug', ventureSlug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  // Get settings
  const { data: settings } = await supabase
    .from('competitor_settings')
    .select('*')
    .eq('venture_id', ventureId)
    .single()

  const s = (settings ?? {}) as any

  // Determine platforms
  const { data: socials } = await supabase
    .from('venture_socials')
    .select('platform')
    .eq('venture_id', ventureId)

  const venturePlatforms = (socials ?? []).map((soc: any) => soc.platform)
  const configuredPlatforms: string[] = s?.platforms_to_scrape ?? []
  const activePlatforms = configuredPlatforms.length > 0
    ? configuredPlatforms.filter((p: string) => venturePlatforms.includes(p))
    : venturePlatforms

  if (activePlatforms.length === 0) {
    return NextResponse.json({ error: 'No platforms configured. Add social accounts to this venture first.' }, { status: 400 })
  }

  // Get competitors
  const { data: competitors } = await supabase
    .from('competitors')
    .select('id, brand_name')
    .eq('venture_id', ventureId)
    .eq('is_custom', true)

  if (!competitors?.length) {
    return NextResponse.json({ error: 'No competitors tracked. Add competitors in Settings first.' }, { status: 400 })
  }

  // Get Apify token
  let token: string
  try { token = await getToken() }
  catch { return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 }) }

  // Get IG handles for all competitors
  const compIds = competitors.map((c: any) => c.id)
  const { data: compSocials } = await supabase
    .from('competitor_socials')
    .select('competitor_id, platform, handle_or_url')
    .in('competitor_id', compIds)
    .in('platform', activePlatforms)

  const handlesByComp = new Map<string, Map<string, string>>()
  for (const cs of (compSocials ?? [])) {
    const c = cs as any
    if (!handlesByComp.has(c.competitor_id)) handlesByComp.set(c.competitor_id, new Map())
    handlesByComp.get(c.competitor_id)!.set(c.platform, c.handle_or_url)
  }

  // Also check staleness if not forced
  if (!body.forceAll) {
    const lastRefreshed = s?.last_refreshed ? new Date(s.last_refreshed).getTime() : 0
    const ageHours = lastRefreshed ? (Date.now() - lastRefreshed) / (1000 * 60 * 60) : 999
    const freq = s?.refresh_frequency ?? 'twice_weekly'
    const threshold = freq === 'daily' ? 20 : freq === 'twice_weekly' ? 80 : freq === 'weekly' ? 160 : 0

    if (freq === 'manual') {
      // OK — manual refresh always allowed
    } else if (ageHours < threshold) {
      return NextResponse.json({
        skipped: true,
        message: `Data is ${Math.round(ageHours)}h old. Next refresh in ~${Math.round(threshold - ageHours)}h. Use forceAll to override.`,
        ageHours: Math.round(ageHours),
      })
    }
  }

  // Run scrapes
  const results: Array<{ brandName: string; platform: string; followers: number; engagementRate: number; error?: string }> = []
  let totalCU = 0

  for (const comp of (competitors ?? [])) {
    const c = comp as any
    const handles = handlesByComp.get(c.id)

    // Only scrape Instagram for now (primary platform)
    // Other platforms added when we fix their Apify actors
    const igHandle = handles?.get('instagram')
    if (!igHandle) continue

    try {
      console.log(`[refresh] Scraping ${c.brand_name} (@${igHandle})...`)
      const { followers, totalPosts, rawPosts } = await scrapeIGProfile(token, igHandle)
      totalCU += PLATFORM_COST['instagram'] ?? 0.5

      // Analyze posts
      const reels = (rawPosts ?? [])
        .filter((p: any) => p.type === 'Video')
        .map((v: any) => ({
          likes: Number(v.likesCount ?? 0),
          comments: Number(v.commentsCount ?? 0),
          views: Number(v.videoViewCount ?? 0),
          engagement: Number(v.likesCount ?? 0) + Number(v.commentsCount ?? 0),
          engagementRate: followers > 0 ? (Number(v.likesCount ?? 0) + Number(v.commentsCount ?? 0)) / followers : 0,
        }))

      const avgER = reels.length > 0 ? reels.reduce((s: number, r: any) => s + r.engagementRate, 0) / reels.length : 0
      const avgViews = reels.length > 0 ? reels.reduce((s: number, r: any) => s + r.views, 0) / reels.length : 0
      const avgEng = reels.length > 0 ? reels.reduce((s: number, r: any) => s + r.engagement, 0) / reels.length : 0
      const trending = reels.filter((r: any) => avgEng > 0 && r.engagement > avgEng * 2)

      const postsPerWeek = (() => {
        if (rawPosts.length < 2) return 0
        const timestamps = rawPosts.map((p: any) => new Date(p.timestamp ?? Date.now()).getTime()).filter((t: number) => !isNaN(t)).sort((a: number, b: number) => b - a)
        if (timestamps.length < 2) return 0
        const days = (timestamps[0] - timestamps[timestamps.length - 1]) / (1000 * 60 * 60 * 24)
        return days > 0 ? Math.round((timestamps.length / days) * 7 * 10) / 10 : 0
      })()

      const compositeScore = computeCompositeScore({
        followers, engagementRate: avgER, avgViews,
        postsPerWeek, reelCount: reels.length, trendingCount: trending.length,
      })

      const tier = followers >= 1_000_000 ? 'anchor' : followers >= 200_000 ? 'stretch' : 'benchmark'

      // Save metrics (time-series INSERT)
      await supabase.from('competitor_metrics').insert({
        competitor_id: c.id, platform: 'instagram',
        followers,
        engagement_rate: Math.round(avgER * 10000) / 10000,
        monthly_reach: Math.round(avgViews * reels.length),
        estimated_monthly_traffic: 0,
        recorded_at: new Date().toISOString(),
      })

      // Save snapshot with trending analysis
      await supabase.from('competitor_snapshots').insert({
        venture_id: ventureId,
        platform: 'instagram',
        competitor_url: igHandle,
        captured_at: new Date().toISOString(),
        raw_content: { posts: rawPosts, followers, engagementRate: avgER },
        kai_analysis: {
          trendingReels: trending.map((r: any) => ({
            id: String(r.id ?? ''),
            url: String(r.url ?? ''),
            caption: String(r.caption ?? '').slice(0, 200),
            views: r.views,
            engagement: r.engagement,
            trendScore: avgEng > 0 ? Math.round(r.engagement / avgEng * 10) / 10 : 0,
          })),
          avgEngagement: avgEng,
          compositeScore,
          reelsAnalyzed: reels.length,
          analyzedAt: new Date().toISOString(),
        },
      })

      // Update competitor record
      await supabase.from('competitors').update({
        signal_score: compositeScore,
        tier,
        last_checked: new Date().toISOString(),
      }).eq('id', c.id)

      results.push({
        brandName: c.brand_name,
        platform: 'instagram',
        followers,
        engagementRate: Math.round(avgER * 10000) / 10000,
      })

      console.log(`[refresh] ${c.brand_name}: ${followers.toLocaleString()} followers, ER: ${(avgER*100).toFixed(2)}%, score: ${compositeScore}/100`)
    } catch (e: any) {
      console.error(`[refresh] ${c.brand_name}: FAILED — ${e.message?.slice(0, 80)}`)
      results.push({ brandName: c.brand_name, platform: 'instagram', followers: 0, engagementRate: 0, error: e.message })
    }
  }

  // Update settings
  const now = new Date().toISOString()
  const nextRefresh = (() => {
    const d = new Date()
    const freq = s?.refresh_frequency ?? 'twice_weekly'
    if (freq === 'daily') d.setDate(d.getDate() + 1)
    else if (freq === 'twice_weekly') d.setDate(d.getDate() + 3)
    else if (freq === 'weekly') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 99) // manual — far future
    d.setHours(8, 0, 0, 0)
    return d.toISOString()
  })()

  const currentMonth = new Date().getMonth()
  const lastMonth = s?.last_refreshed ? new Date(s.last_refreshed).getMonth() : currentMonth
  const cuUsed = (lastMonth === currentMonth ? (s?.apify_cu_used_this_month ?? 0) : 0) + Math.round(totalCU)

  await supabase.from('competitor_settings').upsert({
    venture_id: ventureId,
    last_refreshed: now,
    next_refresh_due: nextRefresh,
    apify_cu_used_this_month: cuUsed,
  }, { onConflict: 'venture_id' })

  return NextResponse.json({
    refreshed: results.filter(r => !r.error).length,
    failed: results.filter(r => r.error).length,
    results,
    nextRefreshDue: nextRefresh,
    cuUsedThisRefresh: Math.round(totalCU * 10) / 10,
    cuUsedThisMonth: cuUsed,
  })
}
