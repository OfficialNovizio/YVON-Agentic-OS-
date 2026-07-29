/**
 * GET /api/competitor-intelligence
 * Returns dashboard-ready competitor data — signals, KPIs, competitor list.
 *
 * GET ?venture=novizio
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCompetitorIntelligence } from '@/lib/competitor-pipeline'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    return NextResponse.json({ error: 'Venture not found' }, { status: 404 })
  }

  try {
    const data = await getCompetitorIntelligence(ventureId)
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[competitor-intelligence]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
