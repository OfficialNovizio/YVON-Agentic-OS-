// GET /api/chat/events?correlation=<uuid>
// Returns the full phase/tool/gate event timeline for one turn (YVON-CHAT §5).
// Guard: the correlation must belong to a chat message in a room the caller
// can see — RLS on chat_messages enforces that before any events are returned,
// so a correlation id alone cannot leak another room's turn.
//
// Owner: raj · TS-018 WI-5
import { supabaseServer } from '@/lib/supabase-server'

export interface TurnEvent {
  ts: string
  kind: string
  actor: string | null
  payload: Record<string, unknown>
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const correlation = searchParams.get('correlation')?.trim()
  if (!correlation) return Response.json({ error: 'correlation required' }, { status: 400 })

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  // 1) RLS-guarded ownership probe: is there a message with this correlation
  //    in a room the caller can see? If migration 106 isn't applied yet, the
  //    column is absent — treat as not found (the panel shows nothing, the
  //    turn still works). Never 500 on a missing schema.
  const { data: msgs, error: probeErr } = await supabase
    .from('chat_messages')
    .select('id')
    .eq('correlation', correlation)
    .limit(1)
  if (probeErr || !msgs || msgs.length === 0) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }

  // 2) Fetch the turn's events — one indexed query (§5.2).
  const { data, error } = await supabase
    .from('events')
    .select('ts, kind, actor, payload')
    .eq('correlation', correlation)
    .order('ts', { ascending: true })

  if (error) {
    return Response.json({ error: String(error.message ?? error) }, { status: 500 })
  }

  const events: TurnEvent[] = ((data as unknown as Array<Record<string, unknown>>) ?? []).map(
    (r) => ({
      ts: String(r.ts),
      kind: String(r.kind),
      actor: r.actor == null ? null : String(r.actor),
      payload: (r.payload as Record<string, unknown>) ?? {},
    }),
  )
  return Response.json({ events })
}
