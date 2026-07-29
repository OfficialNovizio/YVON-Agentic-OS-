// GET /api/chat/messages?roomId=<uuid>&before=<iso>
// Returns paginated messages for a room. RLS blocks rooms the caller can't see.
// Owner: raj · TS-009 Push C1
import { supabaseServer } from '@/lib/supabase-server'

export interface ChatMessage {
  id: string
  roomId: string
  authorKind: 'user' | 'agent'
  authorId: string
  authorName: string
  content: string
  mentions: string[]
  createdAt: string
}

const PAGE_SIZE = 50

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')
  const before = searchParams.get('before') // ISO timestamp for cursor
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 })

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  let q = supabase
    .from('chat_messages')
    .select('id, room_id, author_kind, author_id, author_name, content, mentions, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (before) q = q.lt('created_at', before)

  const { data, error } = await q
  if (error) {
    return Response.json({ error: String(error.message ?? error) }, { status: 500 })
  }

  const rows = ((data as unknown as Array<Record<string, unknown>>) ?? []).map((r) => ({
    id: String(r.id),
    roomId: String(r.room_id),
    authorKind: String(r.author_kind) as ChatMessage['authorKind'],
    authorId: String(r.author_id),
    authorName: String(r.author_name),
    content: String(r.content),
    mentions: Array.isArray(r.mentions) ? (r.mentions as string[]) : [],
    createdAt: String(r.created_at),
  } satisfies ChatMessage))

  // Return in chronological order (oldest → newest) so the UI can append.
  return Response.json({ messages: rows.reverse() })
}
