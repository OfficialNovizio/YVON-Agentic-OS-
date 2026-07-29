/**
 * /api/competitor-bulk
 *
 * POST — Analyze up to 10 competitors at once.
 *   Body: { ventureSlug, competitors: [{ brandName, instagramHandle }] }
 *
 *   1. Scrapes each IG profile via Apify
 *   2. Computes engagement rate, posting velocity, avg views per reel
 *   3. Ranks by composite score (engagement-heavy weighting)
 *   4. Detects trending reels (posts > 2x account average engagement)
 *   5. Saves metrics + posts to DB
 *   6. Returns top 5 ranked + trending reels for each
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getToken } from '@/lib/apify'

export const runtime = 'nodejs'
export const maxDuration = 300

const APIFY_BASE = 'https://api.apify.com/v2'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompetitorInput {
  brandName: string
  instagramHandle: string
}

interface IGPost {
  id: string
  url: string
  caption: string
  type: 'reel' | 'carousel' | 'static'
  likes: number
  comments: number
  views: number
  engagement: number        // likes + comments
  engagementRate: number    // engagement / followers
  publishedAt: string
  isTrending: boolean
  trendScore: number        // how many x above average
  displayUrl: string        // Apify CDN thumbnail / image URL
  images: string[]          // carousel slides (Sidecar type only)
  videoUrl: string          // direct MP4 URL (reels only)
}

interface CompetitorResult {
  brandName: string
  instagramHandle: string
  followers: number
  engagementRate: number
  avgViewsPerReel: number
  postsPerWeek: number      // growth proxy — posting velocity
  totalPosts: number
  reelCount: number
  rank: number
  compositeScore: number    // 0-100
  trendingReels: IGPost[]
  allReels: IGPost[]        // reels only (for trending analysis)
  allPosts: IGPost[]        // ALL post types — what gets stored in DB
  error?: string
}

// ─── Scrape single IG profile ─────────────────────────────────────────────────

async function scrapeIGProfile(token: string, handle: string) {
  const clean = handle.replace('@', '')
  const url = `${APIFY_BASE}/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}&memory=512`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [clean], resultsLimit: 30 }),
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) throw new Error(`Apify returned ${res.status}`)
  const items = (await res.json()) as any[]
  const p = (items?.[0] ?? {}) as Record<string, any>
  const posts = (Array.isArray(p.latestPosts) ? p.latestPosts : []) as Record<string, any>[]

  const followers = Number(p.followersCount ?? 0)
  const totalPosts = Number(p.postsCount ?? 0)

  return { followers, totalPosts, rawPosts: posts }
}

// ─── Analyze posts — classify reels, compute trending ─────────────────────────

function analyzePosts(rawPosts: Record<string, any>[], followers: number): { reels: IGPost[]; allPosts: IGPost[]; avgEngagement: number } {
  const all: IGPost[] = rawPosts.map((v: any) => {
    const likes = Number(v.likesCount ?? 0)
    const comments = Number(v.commentsCount ?? 0)
    const views = Number(v.videoViewCount ?? v.playCount ?? 0)
    const engagement = likes + comments
    const postType: IGPost['type'] = v.type === 'Video' ? 'reel' : v.type === 'Sidecar' ? 'carousel' : 'static'

    const carouselImages: string[] = Array.isArray(v.images)
      ? (v.images as string[]).filter(Boolean)
      : Array.isArray(v.sidecarMedia)
        ? (v.sidecarMedia as any[]).map((m: any) => String(m.displayUrl ?? m.url ?? '')).filter(Boolean)
        : []

    return {
      id: String(v.id ?? v.shortCode ?? ''),
      url: String(v.url ?? `https://instagram.com/p/${v.shortCode ?? ''}`),
      caption: String(v.caption ?? '').slice(0, 300),
      type: postType,
      likes,
      comments,
      views,
      engagement,
      engagementRate: followers > 0 ? engagement / followers : 0,
      publishedAt: String(v.timestamp ?? new Date().toISOString()),
      isTrending: false,
      trendScore: 0,
      displayUrl: String(v.displayUrl ?? v.thumbnailUrl ?? ''),
      images: carouselImages,
      videoUrl: String(v.videoUrl ?? ''),
    }
  })

  // For trending analysis, use all posts (not just reels)
  const reels = all.filter(p => p.type === 'reel')
  const avgEngagement = all.length > 0
    ? all.reduce((s, p) => s + p.engagement, 0) / all.length
    : 0

  // Mark trending: engagement > 2x account average
  for (const post of all) {
    if (avgEngagement > 0 && post.engagement > avgEngagement * 2) {
      post.isTrending = true
      post.trendScore = post.engagement / avgEngagement
    }
  }

  return { reels, allPosts: all, avgEngagement }
}

// ─── Composite score — engagement-weighted ranking ────────────────────────────

function computeCompositeScore(result: {
  followers: number
  engagementRate: number
  avgViewsPerReel: number
  postsPerWeek: number
  reelCount: number
  trendingCount: number
}): number {
  // Weights: engagement quality is king, then content velocity, then reach
  const engagementScore = Math.min(result.engagementRate * 1000, 40)  // 0-40
  const velocityScore    = Math.min(result.postsPerWeek * 4, 20)       // 0-20
  const viewsScore       = Math.min(Math.log10(Math.max(result.avgViewsPerReel, 1)) * 5, 15) // 0-15
  const trendingBonus    = Math.min(result.trendingCount * 5, 15)      // 0-15
  const reachScore       = Math.min(Math.log10(Math.max(result.followers, 1)) * 2, 10) // 0-10

  return Math.round(Math.min(
    engagementScore + velocityScore + viewsScore + trendingBonus + reachScore,
    100,
  ))
}

// ─── Estimate posts per week ──────────────────────────────────────────────────

function estimatePostsPerWeek(rawPosts: Record<string, any>[]): number {
  if (rawPosts.length < 2) return 0
  const timestamps = rawPosts
    .map(p => new Date(p.timestamp ?? Date.now()).getTime())
    .filter(t => !isNaN(t))
    .sort((a, b) => b - a)

  if (timestamps.length < 2) return 0
  const newest = timestamps[0]
  const oldest = timestamps[timestamps.length - 1]
  const daysSpan = (newest - oldest) / (1000 * 60 * 60 * 24)
  if (daysSpan <= 0) return 0
  return Math.round((timestamps.length / daysSpan) * 7 * 10) / 10
}

// ─── Save to DB ───────────────────────────────────────────────────────────────

async function saveToDB(
  ventureId: string,
  ventureSlug: string,
  result: CompetitorResult,
) {
  // Upsert competitor record
  const { data: upserted } = await supabase
    .from('competitors')
    .upsert({
      venture_id: ventureId,
      brand_name: result.brandName,
      tier: result.followers >= 1_000_000 ? 'anchor' : result.followers >= 200_000 ? 'stretch' : 'benchmark',
      signal_score: result.compositeScore,
      follower_growth_rate: 0,
      share_of_voice: 0,
      week_over_week_change: 0,
      is_custom: true,
      last_checked: new Date().toISOString(),
    }, { onConflict: 'venture_id,brand_name' })
    .select('id')
    .single()

  const competitorId = (upserted as any)?.id
  if (!competitorId) return

  // Save IG handle
  try {
    await supabase.from('competitor_socials').upsert({
      competitor_id: competitorId,
      platform: 'instagram',
      handle_or_url: result.instagramHandle,
    }, { onConflict: 'competitor_id,platform' })
  } catch { /* ok */ }

  // Save metrics (time-series INSERT)
  await supabase.from('competitor_metrics').insert({
    competitor_id: competitorId,
    platform: 'instagram',
    followers: result.followers,
    engagement_rate: Math.round(result.engagementRate * 10000) / 10000,
    monthly_reach: Math.round(result.avgViewsPerReel * result.reelCount),
    estimated_monthly_traffic: 0,
    recorded_at: new Date().toISOString(),
  })

  // Save posts snapshot — ALL post types (static, carousel, reel) with full media fields
  await supabase.from('competitor_snapshots').insert({
    venture_id: ventureId,
    platform: 'instagram',
    competitor_url: result.instagramHandle,
    captured_at: new Date().toISOString(),
    raw_content: {
      posts: result.allPosts,
      followers: result.followers,
      engagementRate: result.engagementRate,
    },
    kai_analysis: {
      trendingReels: result.trendingReels.map(r => ({
        id: r.id,
        url: r.url,
        caption: r.caption,
        views: r.views,
        engagement: r.engagement,
        trendScore: r.trendScore,
      })),
      avgEngagement: result.allPosts.length > 0
        ? result.allPosts.reduce((s, r) => s + r.engagement, 0) / result.allPosts.length
        : 0,
      reelsAnalyzed: result.allReels.length,
      analyzedAt: new Date().toISOString(),
    },
  })
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { ventureSlug?: string; competitors?: CompetitorInput[] }
  try { body = await req.json() as typeof body }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { ventureSlug, competitors } = body
  if (!ventureSlug) return NextResponse.json({ error: 'ventureSlug required' }, { status: 400 })
  if (!Array.isArray(competitors) || competitors.length === 0) {
    return NextResponse.json({ error: 'competitors array required (1-10)' }, { status: 400 })
  }
  if (competitors.length > 10) {
    return NextResponse.json({ error: 'Max 10 competitors at once' }, { status: 400 })
  }

  // Validate inputs
  const valid = competitors.filter(c => c.brandName?.trim() && c.instagramHandle?.trim())
  if (valid.length === 0) {
    return NextResponse.json({ error: 'Each competitor needs brandName + instagramHandle' }, { status: 400 })
  }

  // Resolve venture
  const { data: ventures } = await supabase
    .from('ventures').select('id').eq('slug', ventureSlug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  // Check Apify
  let token: string
  try { token = await getToken() }
  catch { return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 }) }

  // Scrape all competitors
  const results: CompetitorResult[] = []

  for (const comp of valid) {
    console.log(`[competitor-bulk] Scraping ${comp.brandName} (@${comp.instagramHandle})...`)
    try {
      const { followers, totalPosts, rawPosts } = await scrapeIGProfile(token, comp.instagramHandle)
      const { reels, allPosts, avgEngagement } = analyzePosts(rawPosts, followers)
      const postsPerWeek = estimatePostsPerWeek(rawPosts)
      const trendingPosts = allPosts.filter(p => p.isTrending).sort((a, b) => b.trendScore - a.trendScore)
      const trendingReels = reels.filter(r => r.isTrending).sort((a, b) => b.trendScore - a.trendScore)
      const avgViewsPerReel = reels.length > 0
        ? reels.reduce((s, r) => s + r.views, 0) / reels.length
        : 0

      const compositeScore = computeCompositeScore({
        followers,
        engagementRate: allPosts.length > 0
          ? allPosts.reduce((s, r) => s + r.engagementRate, 0) / allPosts.length
          : 0,
        avgViewsPerReel,
        postsPerWeek,
        reelCount: reels.length,
        trendingCount: trendingPosts.length,
      })

      results.push({
        brandName: comp.brandName,
        instagramHandle: comp.instagramHandle,
        followers,
        engagementRate: allPosts.length > 0
          ? Math.round(allPosts.reduce((s, r) => s + r.engagementRate, 0) / allPosts.length * 10000) / 10000
          : 0,
        avgViewsPerReel: Math.round(avgViewsPerReel),
        postsPerWeek,
        totalPosts,
        reelCount: reels.length,
        rank: 0,
        compositeScore,
        trendingReels,
        allReels: reels,
        allPosts,
      })

      console.log(`[competitor-bulk] ${comp.brandName}: ${followers.toLocaleString()} followers, ER: ${(results[results.length-1].engagementRate * 100).toFixed(2)}%, score: ${compositeScore}/100, trending: ${trendingReels.length} reels`)
    } catch (e: any) {
      console.log(`[competitor-bulk] ${comp.brandName}: FAILED — ${e.message?.slice(0, 80)}`)
      results.push({
        brandName: comp.brandName,
        instagramHandle: comp.instagramHandle,
        followers: 0,
        engagementRate: 0,
        avgViewsPerReel: 0,
        postsPerWeek: 0,
        totalPosts: 0,
        reelCount: 0,
        rank: 0,
        compositeScore: 0,
        trendingReels: [],
        allReels: [],
        allPosts: [],
        error: e.message ?? 'Scrape failed',
      })
    }
  }

  // Rank by composite score (descending)
  results.sort((a, b) => b.compositeScore - a.compositeScore)
  results.forEach((r, i) => { r.rank = i + 1 })

  // Top 5
  const top5 = results.slice(0, 5)

  // Save all to DB (even non-top-5 for historical data)
  for (const r of results) {
    if (!r.error) {
      try { await saveToDB(ventureId, ventureSlug, r) } catch { /* non-fatal */ }
    }
  }

  return NextResponse.json({
    top5: top5.map(r => ({
      rank: r.rank,
      brandName: r.brandName,
      instagramHandle: r.instagramHandle,
      followers: r.followers,
      engagementRate: r.engagementRate,
      avgViewsPerReel: r.avgViewsPerReel,
      postsPerWeek: r.postsPerWeek,
      compositeScore: r.compositeScore,
      trendingReelsCount: r.trendingReels.length,
      reelCount: r.reelCount,
    })),
    trendingReels: top5.flatMap(r =>
      r.trendingReels.map(reel => ({
        ...reel,
        brandName: r.brandName,
        instagramHandle: r.instagramHandle,
      })),
    ).sort((a, b) => b.trendScore - a.trendScore).slice(0, 15),
    allResults: results.map(r => ({
      rank: r.rank,
      brandName: r.brandName,
      compositeScore: r.compositeScore,
      followers: r.followers,
      engagementRate: r.engagementRate,
      error: r.error,
    })),
  })
}
