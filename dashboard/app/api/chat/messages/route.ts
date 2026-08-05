// GET /api/chat/messages?roomId=<uuid>&before=<iso>
// Returns paginated messages for a room. RLS blocks rooms the caller can't see.
// Owner: raj · TS-009 Push C1
import { supabaseServer } from '@/lib/supabase-server'

export interface ChatMessageAttachment {
  id: string
  storagePath: string
  filename: string
  mimeType: string
  sizeBytes: number
  durationMs?: number | null
  waveform?: number[] | null
}

export interface ChatMessage {
  id: string
  roomId: string
  authorKind: 'user' | 'agent' | 'system'
  authorId: string
  authorName: string
  content: string
  mentions: string[]
  createdAt: string
  /** TS-018 WI-2: turn id linking this message to its events (pipeline panel) */
  correlation: string | null
  attachments?: ChatMessageAttachment[]
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

  // TS-018 WI-11 (live fix 2026-08-04): migration 106 (chat_messages.correlation)
  // must be applied before the column exists. Until then, fall back to a select
  // without it so chat keeps working — and re-enable automatically once the
  // migration runs. Warned once per process, not per poll.
  const SELECT_WITH_CORRELATION = `
    id, room_id, author_kind, author_id, author_name, content, mentions, created_at, correlation,
    chat_attachments(id, storage_path, filename, mime_type, size_bytes, duration_ms, waveform)
  `
  const SELECT_NO_CORRELATION = `
    id, room_id, author_kind, author_id, author_name, content, mentions, created_at,
    chat_attachments(id, storage_path, filename, mime_type, size_bytes, duration_ms, waveform)
  `
  let correlationFallbackWarned = false

  const build = (select: string) => {
    let q = supabase.from('chat_messages').select(select).eq('room_id', roomId)
    if (before) q = q.lt('created_at', before)
    return q.order('created_at', { ascending: false }).limit(PAGE_SIZE)
  }

  let { data, error } = await build(SELECT_WITH_CORRELATION)
  if (error && /does not exist/.test(error.message ?? '')) {
    if (!correlationFallbackWarned) {
      correlationFallbackWarned = true
      // eslint-disable-next-line no-console
      console.warn(
        'chat_messages.correlation missing — apply migration 106_chat_commands.sql; falling back without it',
      )
    }
    ;({ data, error } = await build(SELECT_NO_CORRELATION))
  }
  if (error) {
    return Response.json({ error: String(error.message ?? error) }, { status: 500 })
  }

  const rows = ((data as unknown as Array<Record<string, unknown>>) ?? []).map((r) => {
    const rawAtts = (r.chat_attachments as unknown as Array<Record<string, unknown>> | null) ?? []
    const attachments: ChatMessageAttachment[] = rawAtts.map((a) => ({
      id: String(a.id),
      storagePath: String(a.storage_path),
      filename: String(a.filename),
      mimeType: String(a.mime_type),
      sizeBytes: Number(a.size_bytes ?? 0),
      durationMs: a.duration_ms == null ? null : Number(a.duration_ms),
      waveform: Array.isArray(a.waveform) ? (a.waveform as number[]) : null,
    }))
    return {
      id: String(r.id),
      roomId: String(r.room_id),
      authorKind: String(r.author_kind) as ChatMessage['authorKind'],
      authorId: String(r.author_id),
      authorName: String(r.author_name),
      content: String(r.content ?? ''),
      mentions: Array.isArray(r.mentions) ? (r.mentions as string[]) : [],
      createdAt: String(r.created_at),
      correlation: r.correlation == null ? null : String(r.correlation),
      attachments,
    } satisfies ChatMessage
  })

  return Response.json({ messages: rows.reverse() })
}
