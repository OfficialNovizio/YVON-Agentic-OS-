// POST /api/chat/send  body: { roomId, content, mentions?, attachments? }
// Fast-path: saves the user message + attachments, returns immediately.
// Hermes execution + reply save happens asynchronously via the SSE stream
// endpoint (GET /api/chat/stream). The client opens that after this returns.
//
// This was decoupled in TS-017 to enable live status streaming — the old
// blocking Hermes call lived here and held the response for 30-60s.
//
// Owner: raj · TS-009 Push C1 · TS-013 WI-5 · TS-016 WI-6 · TS-017 WI-1
import { supabaseServer } from '@/lib/supabase-server'

const MENTION_RE = /@([a-z][a-z0-9-]*)/g

interface IncomingAttachment {
  storagePath: string
  filename: string
  mimeType: string
  sizeBytes: number
  durationMs?: number
  waveform?: number[]
}

export async function POST(request: Request): Promise<Response> {
  let body: {
    roomId?: string
    content?: string
    mentions?: string[]
    attachments?: IncomingAttachment[]
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const roomId = body.roomId?.trim()
  const content = body.content?.trim() ?? ''
  const attachments = Array.isArray(body.attachments) ? body.attachments.slice(0, 10) : []
  if (!roomId || (content.length === 0 && attachments.length === 0)) {
    return Response.json(
      { error: 'roomId and either content or attachments required' },
      { status: 400 },
    )
  }

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  // Look up profile for the display name on the message row.
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, email')
    .eq('id', user.id)
    .single()
  const profileRow = profile as unknown as { username?: string; email?: string } | null
  const authorName = profileRow?.username || (profileRow?.email ?? 'unknown').split('@')[0]

  // Extract mentions from the body (client can also send an explicit list).
  const parsedMentions = Array.from(content.matchAll(MENTION_RE), (m) => m[1])
  const mentions = Array.from(new Set([...(body.mentions ?? []), ...parsedMentions]))

  // Insert the user message. RLS blocks rooms the caller can't see.
  const { data: userMsg, error: userErr } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      author_kind: 'user',
      author_id: user.id,
      author_name: authorName,
      content,
      mentions,
    })
    .select('id, created_at')
    .single()

  if (userErr) {
    const code = (userErr as { code?: string })?.code
    if (
      code === '42501' ||
      String((userErr as { message?: string })?.message ?? '').includes('row-level security')
    ) {
      return Response.json({ error: "you don't have access to this room" }, { status: 403 })
    }
    return Response.json(
      { error: String((userErr as { message?: string })?.message ?? userErr) },
      { status: 500 },
    )
  }

  const userMessageId = (userMsg as { id: string; created_at: string } | null)?.id

  // Attach uploaded files to the user message.
  if (userMessageId && attachments.length > 0) {
    const rows = attachments.map((a) => ({
      message_id: userMessageId,
      uploader_user_id: user.id,
      storage_path: a.storagePath,
      filename: a.filename,
      mime_type: a.mimeType,
      size_bytes: a.sizeBytes,
      duration_ms: a.durationMs ?? null,
      waveform: a.waveform ?? null,
    }))
    const { error: attErr } = await supabase.from('chat_attachments').insert(rows)
    if (attErr) {
      // eslint-disable-next-line no-console
      console.warn('chat_attachments insert failed:', (attErr as { message?: string })?.message)
    }
  }

  // Return immediately — Hermes execution happens via SSE stream
  return Response.json({
    userMessage: {
      id: (userMsg as { id: string; created_at: string } | null)?.id,
      createdAt: (userMsg as { id: string; created_at: string } | null)?.created_at,
    },
  })
}
