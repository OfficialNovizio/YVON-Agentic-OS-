/**
 * /api/competitor-keywords
 * GET ?venture=novizio → keyword/hashtag intelligence from competitor posts
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

  const { data: snapshots } = await supabase
    .from('competitor_snapshots')
    .select('competitor_url, raw_content, captured_at')
    .eq('venture_id', ventureId)
    .order('captured_at', { ascending: false })
    .limit(10)

  if (!snapshots?.length) {
    return NextResponse.json({ keywords: [], message: 'No data yet. Run Refresh Now in Settings.' })
  }

  // Extract hashtags and keywords from captions
  const wordFreq = new Map<string, { count: number; brands: Set<string> }>()

  for (const snap of (snapshots ?? [])) {
    const s = snap as any
    const raw = s.raw_content as Record<string, any> | null
    const posts = (raw?.posts ?? []) as any[]
    const brand = s.competitor_url as string

    for (const post of posts) {
      const caption = String(post.caption ?? '')
      // Extract hashtags
      const hashtags = caption.match(/#[\w]+/g) ?? []
      for (const tag of hashtags) {
        const t = tag.toLowerCase()
        const existing = wordFreq.get(t)
        if (existing) { existing.count++; existing.brands.add(brand) }
        else { wordFreq.set(t, { count: 1, brands: new Set([brand]) }) }
      }
    }
  }

  const keywords = Array.from(wordFreq.entries())
    .map(([word, data]) => ({
      word,
      count: data.count,
      brandCount: data.brands.size,
      brands: Array.from(data.brands),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)

  return NextResponse.json({
    keywords,
    totalKeywords: wordFreq.size,
    competitorsScraped: new Set((snapshots ?? []).map((s: any) => s.competitor_url)).size,
  })
}
