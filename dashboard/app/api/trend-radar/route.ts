import { getTrendingItems } from '@/lib/db'
import type { TrendItem } from '@/lib/types'

// Public read endpoint for the Trend Radar page.
// Reads cached rows only — no live source since the Apify trend scrape was
// retired 2026-09-07 (/api/trending removed with it).
export async function GET(): Promise<Response> {
  try {
    const items = await getTrendingItems('yvon-os')
    const trends = items.slice(0, 8).map((item: TrendItem, i: number) => ({
      id: item.id,
      topic: item.keyword,
      platform: item.platform === 'all' ? 'X / LinkedIn' : item.platform,
      strength: Math.max(50, 95 - i * 5),
      tone: (['green', 'yellow', 'blue'] as const)[i % 3],
      detail: item.angle,
    }))
    return Response.json({ trends, source: 'live' })
  } catch {
    return Response.json({ trends: [], source: 'error' }, { status: 200 })
  }
}
