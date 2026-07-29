/**
 * /api/competitor-trending
 * GET ?venture=novizio → returns trending reels from latest competitor snapshots
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('venture')
  if (!slug) return NextResponse.json({ error: 'Missing venture param' }, { status: 400 })

  const { data: ventures } = await supabase
    .from('ventures').select('id').eq('slug', slug).limit(1)
  const ventureId = (ventures?.[0] as any)?.id
  if (!ventureId) return NextResponse.json({ error: 'Venture not found' }, { status: 404 })

  // Get latest snapshots with kai_analysis (trending data)
  const { data: snapshots } = await supabase
    .from('competitor_snapshots')
    .select('*')
    .eq('venture_id', ventureId)
    .eq('platform', 'instagram')
    .not('kai_analysis', 'is', null)
    .order('captured_at', { ascending: false })
    .limit(50)

  if (!snapshots?.length) {
    return NextResponse.json({ trendingReels: [], message: 'No competitor data yet. Run Bulk Analyze in Settings → Competitors.' })
  }

  // Get competitor names
  const { data: competitors } = await supabase
    .from('competitors')
    .select('id, brand_name')
    .eq('venture_id', ventureId)

  // Get IG handles
  const compIds = (competitors ?? []).map((c: any) => c.id)
  const { data: socials } = await supabase
    .from('competitor_socials')
    .select('competitor_id, handle_or_url')
    .eq('platform', 'instagram')
    .in('competitor_id', compIds)

  const nameMap = new Map((competitors ?? []).map((c: any) => [c.id, c.brand_name]))
  const handleMap = new Map((socials ?? []).map((s: any) => [s.competitor_id, s.handle_or_url]))

  // Extract trending reels from snapshots
  const allReels: Array<{
    id: string
    url: string
    caption: string
    views: number
    engagement: number
    trendScore: number
    brandName: string
    instagramHandle: string
    capturedAt: string
  }> = []

  for (const snap of (snapshots ?? [])) {
    const s = snap as any
    const analysis = s.kai_analysis as Record<string, any> | null
    const reels = (analysis?.trendingReels ?? []) as Array<{
      id: string; url: string; caption: string; views: number; engagement: number; trendScore: number
    }>

    for (const reel of reels) {
      // Map competitor_url (IG handle) to brand name
      const handle = s.competitor_url as string
      // Find matching competitor by handle
      let brandName = ''
      for (const [compId, h] of handleMap) {
        if (h === handle) { brandName = nameMap.get(compId) ?? ''; break }
      }

      allReels.push({
        ...reel,
        brandName: brandName || handle,
        instagramHandle: handle,
        capturedAt: s.captured_at as string,
      })
    }
  }

  // Deduplicate by reel id, keep highest trendScore
  const seen = new Map<string, typeof allReels[0]>()
  for (const r of allReels) {
    const existing = seen.get(r.id)
    if (!existing || r.trendScore > existing.trendScore) {
      seen.set(r.id, r)
    }
  }

  const trendingReels = Array.from(seen.values())
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 20)

  return NextResponse.json({ trendingReels })
}
