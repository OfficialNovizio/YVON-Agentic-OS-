// POST /api/intelligence/approve
// Updates a pitch status: pending → approved (or drafted/passed)

import { updatePitchStatus } from '@/lib/intelligence'

export async function POST(request: Request): Promise<Response> {
  let body: { pitchId: string; status?: string }
  try {
    body = await request.json() as typeof body
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.pitchId) {
    return Response.json({ error: 'pitchId required' }, { status: 400 })
  }

  const status = body.status ?? 'approved'

  try {
    await updatePitchStatus(body.pitchId, status as 'approved' | 'drafted' | 'deployed' | 'passed')
    return Response.json({ success: true, pitchId: body.pitchId, status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}
