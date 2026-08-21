// POST /api/chat/reset-context — manual "reset conversation" action
// (2026-08-21). Drops the room's pooled AIAgent on the VPS (main.py's
// POST /v1/pool/drop) so the next message starts with a clean, cheap
// history instead of whatever's accumulated so far. Sibling to
// stream/route.ts's automatic threshold-based reset — this is the
// user-triggered version, for "I want a fresh context right now" rather
// than waiting for the token count to cross the auto-reset threshold.
import { supabaseServer } from '@/lib/supabase-server'
import { dropPool } from '@/lib/hermes-client'
import { errMsg } from '@/lib/errors'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  let body: { roomId?: string }
  try {
    body = (await request.json()) as { roomId?: string }
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const roomId = body.roomId?.trim()
  if (!roomId) return Response.json({ error: 'missing roomId' }, { status: 400 })

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const result = await dropPool(user.id, roomId)
    if (!result.ok) {
      return Response.json({ error: result.error ?? 'reset failed' }, { status: 502 })
    }
    return Response.json({ dropped: !!result.dropped })
  } catch (err) {
    return Response.json({ error: errMsg(err) }, { status: 502 })
  }
}
