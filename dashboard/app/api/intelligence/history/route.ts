// GET /api/intelligence/history?ventureId=x&limit=10
// Returns past intelligence batches (timeline for CEO dashboard history view).

import { cookies } from 'next/headers'
import { getBatchHistory, getPitchesByBatch } from '@/lib/intelligence'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const ventureId = url.searchParams.get('ventureId') ?? ''
  const limit = parseInt(url.searchParams.get('limit') ?? '10')

  const cookieStore = await cookies()
  const vId = ventureId || (cookieStore.get('yvon_active_venture')?.value ?? 'novizio')

  try {
    const batches = await getBatchHistory(vId, limit)

    const result = await Promise.all(
      batches.map(async (b) => {
        const pitches = await getPitchesByBatch(b.id)
        return {
          id: b.id,
          batchNumber: b.batchNumber,
          status: b.status,
          createdAt: b.createdAt,
          pitchCount: pitches.length,
          topScore: pitches.length > 0
            ? Math.max(...pitches.map((p) => p.psychologyScore ?? 0))
            : null,
          topPitches: pitches.slice(0, 2).map((p) => ({
            rank: p.rank,
            category: p.category,
            hookA: p.hookA.slice(0, 60),
            psychologyScore: p.psychologyScore,
          })),
        }
      }),
    )

    return Response.json({ batches: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}
