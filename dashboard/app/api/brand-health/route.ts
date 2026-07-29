/**
 * /api/brand-health
 * Returns competitive brand health data for the Portfolio tab.
 * Reads from competitors + competitor_metrics tables. Empty when no competitors.
 *
 * GET ?venture=novizio&period=8w
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CompetitorRow {
  id: string
  venture_id: string
  brand_name: string
  url: string | null
  signal_score: number
  follower_growth_rate: number
  traffic_spike_detected: boolean
  viral_content_count: number
  funding_round_detected: boolean
  share_of_voice: number
  week_over_week_change: number
  last_checked: string | null
}

interface CompetitorMetricRow {
  id: string
  competitor_id: string
  platform: string
  followers: number
  engagement_rate: number
  monthly_reach: number
  estimated_monthly_traffic: number
  recorded_at: string | null
}

function brandScore(c: CompetitorRow, metrics: CompetitorMetricRow[]): number {
  const totalFollowers = metrics.reduce((s, m) => s + (m.followers ?? 0), 0)
  const avgEng = metrics.length > 0
    ? metrics.reduce((s, m) => s + Number(m.engagement_rate ?? 0), 0) / metrics.length
    : 0

  let score = 0
  // Signal score (0-100 scale from DB)
  score += Number(c.signal_score ?? 0) * 0.35
  // Follower scale (logarithmic, caps at ~1M)
  score += Math.min(35, Math.log10(Math.max(totalFollowers, 1)) * 5) * 0.35
  // Engagement rate contribution
  score += Math.min(30, avgEng * 1000) * 0.30

  return Math.min(100, Math.round(score * 10) / 10)
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const venture = searchParams.get('venture')

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
  if (!ventureId) {
    return NextResponse.json({
      hasData: false,
      hasCompetitors: false,
      ourScore: null,
      compAvg: null,
      target: null,
      industryBenchmark: null,
      bestCompetitor: null,
      competitors: [],
      trend: [],
    })
  }

  // Fetch competitors for this venture
  const { data: compRows } = await supabase
    .from('competitors')
    .select('*')
    .eq('venture_id', ventureId)
    .order('signal_score', { ascending: false })

  const competitors = (compRows ?? []) as CompetitorRow[]

  if (competitors.length === 0) {
    return NextResponse.json({
      hasData: false,
      hasCompetitors: false,
      ourScore: null,
      compAvg: null,
      target: null,
      industryBenchmark: null,
      bestCompetitor: null,
      competitors: [],
      trend: [],
    })
  }

  // Fetch metrics for all competitors
  const compIds = competitors.map(c => c.id)
  const { data: metricRows } = await supabase
    .from('competitor_metrics')
    .select('*')
    .in('competitor_id', compIds)
    .order('recorded_at', { ascending: false })

  const metricsByComp: Record<string, CompetitorMetricRow[]> = {}
  for (const m of (metricRows ?? []) as CompetitorMetricRow[]) {
    if (!metricsByComp[m.competitor_id]) metricsByComp[m.competitor_id] = []
    metricsByComp[m.competitor_id].push(m)
  }

  // Build competitor results with brand scores
  const scored = competitors.map(c => {
    const metrics = metricsByComp[c.id] ?? []
    const score = brandScore(c, metrics)
    const totalFollowers = metrics.reduce((s, m) => s + (m.followers ?? 0), 0)
    const avgEng = metrics.length > 0
      ? metrics.reduce((s, m) => s + Number(m.engagement_rate ?? 0), 0) / metrics.length
      : 0

    return {
      name: c.brand_name,
      url: c.url,
      brandScore: score,
      signalScore: Number(c.signal_score ?? 0),
      followerGrowthRate: Number(c.follower_growth_rate ?? 0),
      shareOfVoice: Number(c.share_of_voice ?? 0),
      wowChange: Number(c.week_over_week_change ?? 0),
      trafficSpike: c.traffic_spike_detected,
      viralContent: c.viral_content_count,
      fundingDetected: c.funding_round_detected,
      totalFollowers,
      engagementRate: avgEng,
      platformCount: metrics.length,
      lastChecked: c.last_checked,
    }
  })

  const scores = scored.map(s => s.brandScore)
  const compAvg = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : null
  const bestCompetitor = scored.length > 0
    ? scored.reduce((best, c) => c.brandScore > best.brandScore ? c : best)
    : null

  return NextResponse.json({
    hasData: true,
    hasCompetitors: true,
    competitorCount: scored.length,
    ourScore: null,
    compAvg,
    target: compAvg ? Math.round(Math.min(100, compAvg * 1.2) * 10) / 10 : null,
    industryBenchmark: null,
    bestCompetitor: bestCompetitor ? {
      name: bestCompetitor.name,
      brandScore: bestCompetitor.brandScore,
    } : null,
    competitors: scored,
    trend: scored.map(c => ({
      name: c.name,
      score: c.brandScore,
      wow: c.wowChange,
    })),
  })
}
