/**
 * /api/analytics-overview
 * Returns overview dashboard data from connected social accounts.
 * Reads from cached social_snapshots + social_posts — no live Apify calls.
 * Empty arrays only when no data exists.
 *
 * GET ?venture=novizio&period=30d
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Signal {
  id: string
  severity: 'red' | 'amber' | 'green'
  text: string
  route: string
  cta: string
}

interface TopicRow {
  topic: string
  score: number
  multiplier: string
  revenue: string
  highlight: boolean
}

interface CacChannel {
  channel: string
  cac: number
  up: boolean
  label: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const venture = searchParams.get('venture')
  const period = searchParams.get('period') ?? '30D'

  if (!venture) {
    return NextResponse.json({ error: 'Missing venture param' }, { status: 400 })
  }

  // Resolve venture
  const { data: ventures } = await supabase
    .from('ventures')
    .select('id')
    .eq('slug', venture)
    .limit(1)

  const ventureId = (ventures?.[0] as any)?.id
  let connectedPlatforms = 0
  let hasSnapshots = false

  if (!ventureId) {
    return NextResponse.json({
      hasLiveData: false,
      connectedPlatforms: 0,
      hasSnapshots: false,
      revenueByChannel: [],
      followerGrowth: [],
      cacChannels: [],
      signals: [],
      topics: [],
      insights: [],
    })
  }

  // Count connected accounts
  const { count: acctCount } = await supabase
    .from('venture_socials')
    .select('*', { count: 'exact', head: true })
    .eq('venture_id', ventureId)
  connectedPlatforms = acctCount ?? 0

  // Fetch cached snapshots (non-expired) for this venture
  const { data: snapshots } = await supabase
    .from('social_snapshots')
    .select('*')
    .eq('venture_slug', venture)
    .order('captured_at', { ascending: false })

  const validSnapshots = (snapshots ?? []).filter(
    (s: any) => s.cache_expires_at && new Date(s.cache_expires_at) > new Date(),
  )
  hasSnapshots = validSnapshots.length > 0

  // Fetch recent posts for this venture
  const { data: recentPosts } = await supabase
    .from('social_posts')
    .select('*')
    .eq('venture_slug', venture)
    .order('published_at', { ascending: false })
    .limit(20)

  const posts = (recentPosts ?? []).map((p: any) => ({
    post_id: p.post_id,
    platform: p.platform,
    caption: p.caption ?? '',
    post_type: p.post_type ?? 'static',
    likes: p.likes ?? 0,
    comments: p.comments ?? 0,
    shares: p.shares ?? 0,
    saves: p.saves ?? 0,
    views: p.views ?? 0,
    reach: p.reach ?? 0,
    engagement_rate: Number(p.engagement_rate ?? 0),
    published_at: p.published_at,
  }))

  // ── Build signals from real data ──────────────────────────────────────────
  const signals: Signal[] = []

  if (hasSnapshots) {
    const totalFollowers = validSnapshots.reduce(
      (sum: number, s: any) => sum + (s.followers ?? 0), 0,
    )
    const avgEng = validSnapshots.length > 0
      ? validSnapshots.reduce((sum: number, s: any) => sum + Number(s.engagement_rate ?? 0), 0) / validSnapshots.length
      : 0

    if (totalFollowers > 0) {
      signals.push({
        id: 'followers',
        severity: totalFollowers > 5000 ? 'green' : totalFollowers > 1000 ? 'amber' : 'red',
        text: `${totalFollowers.toLocaleString()} total followers across ${validSnapshots.length} platform${validSnapshots.length > 1 ? 's' : ''}`,
        route: '/screens/analytics/social-media',
        cta: 'View details',
      })
    }

    if (avgEng > 0) {
      const engPct = (avgEng * 100).toFixed(2)
      signals.push({
        id: 'engagement',
        severity: avgEng > 0.03 ? 'green' : avgEng > 0.01 ? 'amber' : 'red',
        text: `Average engagement rate: ${engPct}% across connected platforms`,
        route: '/screens/analytics/social-media',
        cta: 'Analyze',
      })
    }

    // Per-platform signals
    for (const s of validSnapshots) {
      if (s.followers > 0) {
        signals.push({
          id: `${s.platform}-health`,
          severity: s.followers > 1000 ? 'green' : 'amber',
          text: `${s.platform}: ${s.followers.toLocaleString()} followers · ${(Number(s.engagement_rate ?? 0) * 100).toFixed(2)}% engagement`,
          route: '/screens/analytics/social-media',
          cta: 'View platform',
        })
      }
    }
  } else if (connectedPlatforms > 0) {
    signals.push({
      id: 'no-data',
      severity: 'amber',
      text: `${connectedPlatforms} account${connectedPlatforms > 1 ? 's' : ''} connected. Click Refresh on the Social Media page to fetch data.`,
      route: '/screens/analytics/social-media',
      cta: 'Go to Social Media',
    })
  }

  // ── Build topic correlations from post data ────────────────────────────────
  const topics: TopicRow[] = []
  if (posts.length > 0) {
    const postTypeMap: Record<string, { count: number; totalEng: number; totalViews: number }> = {}
    for (const p of posts) {
      const pt = p.post_type || 'static'
      if (!postTypeMap[pt]) postTypeMap[pt] = { count: 0, totalEng: 0, totalViews: 0 }
      postTypeMap[pt].count++
      postTypeMap[pt].totalEng += p.engagement_rate
      postTypeMap[pt].totalViews += p.views
    }
    const entries = Object.entries(postTypeMap)
      .map(([pt, d]) => ({
        topic: pt.charAt(0).toUpperCase() + pt.slice(1),
        score: Math.min(100, Math.round((d.totalEng / d.count) * 1000)),
        multiplier: d.totalViews > 0 ? `${(d.totalViews / d.count / 1000).toFixed(1)}x` : '—',
        revenue: '—',
        highlight: pt === 'reel' || pt === 'short',
      }))
      .sort((a, b) => b.score - a.score)
    topics.push(...entries.slice(0, 5))
  }

  // ── Build CAC channels from platform data ──────────────────────────────────
  const cacChannels: CacChannel[] = []
  if (hasSnapshots) {
    for (const s of validSnapshots) {
      const platformName = s.platform.charAt(0).toUpperCase() + s.platform.slice(1)
      cacChannels.push({
        channel: platformName,
        cac: 0,
        up: false,
        label: 'No conversion data',
      })
    }
  }

  const hasLiveData = hasSnapshots || posts.length > 0

  return NextResponse.json({
    hasLiveData,
    connectedPlatforms,
    hasSnapshots,
    revenueByChannel: [],
    followerGrowth: validSnapshots.map((s: any) => ({
      platform: s.platform,
      followers: s.followers ?? 0,
      capturedAt: s.captured_at,
    })),
    cacChannels,
    signals,
    topics,
    insights: signals.map((s) => ({
      text: s.text,
      severity: s.severity,
    })),
  })
}
