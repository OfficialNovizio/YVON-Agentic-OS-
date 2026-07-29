/**
 * /api/competitor-gaps
 * GET ?venture=novizio → content gap analysis comparing our metrics vs competitors
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

  const { data: compRows } = await supabase
    .from('competitors').select('*').eq('venture_id', ventureId).eq('is_custom', true)

  const allComps = (compRows ?? []) as any[]
  if (!allComps.length) {
    return NextResponse.json({ gaps: [], message: 'No competitors tracked yet.' })
  }

  const compIds = allComps.map(c => c.id)

  const { data: metricRows } = await supabase
    .from('competitor_metrics')
    .select('*')
    .in('competitor_id', compIds)
    .order('recorded_at', { ascending: false })

  const metricsByComp: Record<string, any[]> = {}
  for (const m of (metricRows ?? [])) {
    const c = m as any
    if (!metricsByComp[c.competitor_id]) metricsByComp[c.competitor_id] = []
    metricsByComp[c.competitor_id].push(c)
  }

  const gaps = allComps.map(c => {
    const metrics = metricsByComp[c.id] ?? []
    const latest = metrics[0] ?? {}
    const previous = metrics[1] ?? {}
    const followers = Number(latest.followers ?? 0)
    const prevFollowers = Number(previous.followers ?? 0)
    const er = Number(latest.engagement_rate ?? 0)
    const prevER = Number(previous.engagement_rate ?? 0)

    return {
      brandName: c.brand_name,
      tier: c.tier ?? 'benchmark',
      score: Math.round(Number(c.signal_score ?? 0)),
      followers,
      followerDelta: prevFollowers > 0 ? Math.round((followers - prevFollowers) / prevFollowers * 1000) / 10 : 0,
      engagementRate: Math.round(er * 10000) / 100,
      engagementDelta: prevER > 0 ? Math.round((er - prevER) / prevER * 1000) / 10 : 0,
      lastChecked: c.last_checked,
    }
  })

  // Compute category averages
  const avgER = gaps.length > 0 ? gaps.reduce((s, g) => s + g.engagementRate, 0) / gaps.length : 0
  const avgFollowers = gaps.length > 0 ? gaps.reduce((s, g) => s + g.followers, 0) / gaps.length : 0

  return NextResponse.json({
    gaps,
    benchmarks: { avgEngagementRate: Math.round(avgER * 10) / 10, avgFollowers: Math.round(avgFollowers) },
    message: gaps.every(g => g.engagementRate === 0)
      ? 'No real data yet. Run Refresh Now in Settings → Competitors to scrape competitor profiles.'
      : null,
  })
}
