/**
 * /api/competitor-content-intel
 * GET ?venture=novizio → real competitor content intelligence data
 *
 * Returns:
 *   - signals: real alerts from latest scrapes (anomalies, spikes, trending)
 *   - kpis: computed from competitor_metrics (SOV, avg engagement, velocity, etc.)
 *   - competitors: ranked list with real scores
 *   - contentFeed: real posts from competitor_snapshots, sorted by engagement
 *   - activityTimeline: recent scrape activity
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('venture')
  if (!slug) return NextResponse.json({ error: 'Missing venture param' }, { status: 400 })

  const { data: ventures } = await supabase.from('ventures').select('id').eq('slug', slug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  // Get competitors
  const { data: compRows } = await supabase
    .from('competitors')
    .select('*')
    .eq('venture_id', ventureId)
    .order('signal_score', { ascending: false })

  const allComps = (compRows ?? []) as any[]
  if (!allComps.length) {
    return NextResponse.json({ signals: [], kpis: [], competitors: [], contentFeed: [], activityTimeline: [] })
  }

  const compIds = allComps.map(c => c.id)

  // Get latest metrics per competitor
  const { data: metricRows } = await supabase
    .from('competitor_metrics')
    .select('*')
    .in('competitor_id', compIds)
    .order('recorded_at', { ascending: false })

  // Get latest snapshots with posts
  const { data: snapshots } = await supabase
    .from('competitor_snapshots')
    .select('*')
    .eq('venture_id', ventureId)
    .order('captured_at', { ascending: false })
    .limit(20)

  // Get social handles
  const { data: socials } = await supabase
    .from('competitor_socials')
    .select('competitor_id, platform, handle_or_url')
    .in('competitor_id', compIds)

  const handleMap = new Map<string, string>()
  for (const s of (socials ?? [])) {
    const c = s as any
    if (c.platform === 'instagram') handleMap.set(c.competitor_id, c.handle_or_url)
  }

  const nameMap = new Map(allComps.map(c => [c.id, c.brand_name]))

  // ── Signals from real data ──────────────────────────────────────────────────

  const signals: Array<{ id: string; severity: 'red' | 'amber' | 'green'; text: string; cta: string }> = []

  for (const c of allComps) {
    if (Number(c.signal_score ?? 0) > 60) {
      signals.push({
        id: `signal-${c.id}`,
        severity: 'red',
        text: `${c.brand_name}: High activity — score ${Math.round(c.signal_score)}/100. ${Number(c.follower_growth_rate ?? 0).toFixed(1)}% growth.`,
        cta: 'Analyze',
      })
    }
  }

  // Check for trending reels in snapshots
  for (const snap of (snapshots ?? [])) {
    const s = snap as any
    const analysis = s.kai_analysis as Record<string, any> | null
    const trending = (analysis?.trendingReels ?? []) as any[]
    if (trending.length > 0) {
      const brand = nameMap.get(
        allComps.find(c => handleMap.get(c.id) === s.competitor_url)?.id ?? ''
      ) ?? s.competitor_url
      signals.push({
        id: `trending-${s.id}`,
        severity: 'amber',
        text: `${brand}: ${trending.length} trending reel${trending.length > 1 ? 's' : ''} detected — ${trending[0].trendScore}x average engagement.`,
        cta: 'View Reels',
      })
    }
  }

  // ── KPIs ────────────────────────────────────────────────────────────────────

  const metricsByComp: Record<string, any[]> = {}
  for (const m of (metricRows ?? [])) {
    const c = m as any
    if (!metricsByComp[c.competitor_id]) metricsByComp[c.competitor_id] = []
    if (metricsByComp[c.competitor_id].length < 2) metricsByComp[c.competitor_id].push(c)
  }

  const latestMetrics = allComps.map(c => (metricsByComp[c.id] ?? [])[0]).filter(Boolean)

  const avgScore = allComps.length > 0
    ? allComps.reduce((s: number, c: any) => s + Number(c.signal_score ?? 0), 0) / allComps.length
    : 0

  const avgER = latestMetrics.length > 0
    ? latestMetrics.reduce((s: number, m: any) => s + Number(m.engagement_rate ?? 0), 0) / latestMetrics.length
    : 0

  const kpis = [
    {
      label: 'Competitors', icon: 'radar',
      value: String(allComps.length), unit: '',
      delta: `${latestMetrics.filter((m: any) => Number(m.followers ?? 0) > 0).length} with data`,
      up: null as boolean | null,
    },
    {
      label: 'Avg Score', icon: 'trending_up',
      value: String(Math.round(avgScore)), unit: '/100',
      delta: avgScore > 40 ? 'Above threshold' : 'Below threshold',
      up: avgScore > 40,
    },
    {
      label: 'Avg Engagement', icon: 'favorite',
      value: (avgER * 100).toFixed(1), unit: '%',
      delta: 'Real data from IG',
      up: avgER > 0.01,
    },
    {
      label: 'Trending Reels', icon: 'play_circle',
      value: String(signals.filter(s => s.id.startsWith('trending-')).length),
      unit: '',
      delta: 'Last 7 days',
      up: null as boolean | null,
    },
  ]

  // ── Competitor list ─────────────────────────────────────────────────────────

  const totalFollowers = latestMetrics.reduce((s: number, m: any) => s + Number(m.followers ?? 0), 0)

  const competitors = allComps.map((c: any, i: number) => {
    const metrics = metricsByComp[c.id] ?? []
    const latest = metrics[0] ?? {}
    const followers = Number(latest.followers ?? 0)
    const score = Number(c.signal_score ?? 0)
    const sov = totalFollowers > 0 ? Math.round((followers / totalFollowers) * 1000) / 10 : 0

    return {
      name: c.brand_name,
      initial: c.brand_name.charAt(0).toUpperCase(),
      handle: handleMap.get(c.id) ?? null,
      followers,
      engagementRate: Number(latest.engagement_rate ?? 0),
      sov: `${sov.toFixed(1)}%`,
      score: Math.round(score),
      tier: c.tier ?? 'benchmark',
      accent: i === 0,
      dashed: score === 0,
    }
  })

  // ── Content Feed from real posts ────────────────────────────────────────────

  const contentFeed: Array<{
    id: string; brandName: string; handle: string; caption: string;
    type: string; likes: number; comments: number; views: number; shares: number;
    engagement: number; url: string; displayUrl: string; images: string[];
    capturedAt: string; publishedAt: string;
  }> = []

  // Build a reverse map: handle → competitor id (for robust matching)
  const handleToCompId = new Map<string, string>()
  for (const [compId, handle] of handleMap.entries()) {
    handleToCompId.set(handle.toLowerCase().replace(/^@/, ''), compId)
    // Also store with @ prefix variant
    handleToCompId.set(handle.replace(/^@/, ''), compId)
  }

  for (const snap of (snapshots ?? [])) {
    const s = snap as any
    const raw = s.raw_content as Record<string, any> | null
    const posts = (raw?.posts ?? []) as any[]
    const snapHandle = s.competitor_url as string

    // Robust brand resolution: try exact match, then strip @, then partial
    const normalizedHandle = snapHandle.toLowerCase().replace(/^@/, '')
    const compId = handleMap.get(snapHandle)
      ? allComps.find(c => handleMap.get(c.id) === snapHandle)?.id
      : allComps.find(c => {
          const h = (handleMap.get(c.id) ?? '').toLowerCase().replace(/^@/, '')
          return h === normalizedHandle || snapHandle.includes(h) || h.includes(normalizedHandle)
        })?.id
    const brand = compId ? nameMap.get(compId) ?? snapHandle : snapHandle

    for (const post of posts.slice(0, 6)) {
      // Handle two snapshot formats:
      // Format A (competitor-bulk): type='reel'|'carousel'|'static', id, displayUrl, images, publishedAt
      // Format B (competitor-pipeline scrapeInstagramFull): post_type, post_id, published_at, likesCount etc (raw Apify fields)
      const isFormatA = 'type' in post && (post.type === 'reel' || post.type === 'carousel' || post.type === 'static')

      const postType: string = isFormatA
        ? post.type
        : post.post_type === 'Video' ? 'reel' : post.post_type === 'Sidecar' ? 'carousel' : (post.post_type ?? 'static')

      const rawTypeMap = post.type === 'Video' ? 'reel' : post.type === 'Sidecar' ? 'carousel' : isFormatA ? postType : 'static'

      const carouselImages: string[] = Array.isArray(post.images)
        ? (post.images as string[]).filter(Boolean).slice(0, 5)
        : Array.isArray(post.sidecarMedia)
          ? (post.sidecarMedia as any[]).map((m: any) => String(m.displayUrl ?? m.url ?? '')).filter(Boolean).slice(0, 5)
          : []

      const likes = Number(post.likes ?? post.likesCount ?? 0)
      const comments = Number(post.comments ?? post.commentsCount ?? 0)

      contentFeed.push({
        id: String(post.id ?? post.post_id ?? post.shortCode ?? ''),
        brandName: brand,
        handle: snapHandle,
        caption: String(post.caption ?? '').slice(0, 300),
        type: rawTypeMap,
        likes,
        comments,
        views: Number(post.views ?? post.videoViewCount ?? post.videoPlayCount ?? 0),
        shares: Number(post.shares ?? post.sharesCount ?? 0),
        engagement: likes + comments,
        url: String(post.url ?? `https://instagram.com/p/${post.shortCode ?? post.post_id ?? ''}`),
        displayUrl: String(post.displayUrl ?? post.thumbnailUrl ?? ''),
        images: carouselImages,
        capturedAt: s.captured_at as string,
        publishedAt: String(post.publishedAt ?? post.published_at ?? post.timestamp ?? s.captured_at ?? ''),
      })
    }
  }

  contentFeed.sort((a, b) => b.engagement - a.engagement)

  // ── Activity Timeline ───────────────────────────────────────────────────────

  const activityTimeline = (snapshots ?? []).map((s: any) => {
    const handle = s.competitor_url
    const brand = nameMap.get(
      allComps.find(c => handleMap.get(c.id) === handle)?.id ?? ''
    ) ?? handle
    const analysis = s.kai_analysis as Record<string, any> | null
    return {
      id: s.id,
      brandName: brand,
      handle,
      capturedAt: s.captured_at,
      reelsAnalyzed: analysis?.reelsAnalyzed ?? 0,
      trendingCount: (analysis?.trendingReels ?? []).length,
      compositeScore: analysis?.compositeScore ?? 0,
    }
  })

  return NextResponse.json({
    signals: signals.slice(0, 5),
    kpis,
    competitors,
    contentFeed: contentFeed.slice(0, 20),
    activityTimeline: activityTimeline.slice(0, 10),
    lastRefreshed: allComps[0]?.last_checked ?? null,
  })
}
