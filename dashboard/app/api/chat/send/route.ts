// POST /api/chat/send  body: { roomId, content, mentions? }
// Inserts the user message via RLS-safe client, then emits a placeholder agent
// message. C3 replaces the placeholder with a real Hermes streaming call.
// Owner: raj · TS-009 Push C1
import { supabaseServer } from '@/lib/supabase-server'

// Match agent handles that appear right after '@'. Handles are lowercase kebab
// (fleet.ts ids). Anything after '@' up to whitespace / punctuation.
const MENTION_RE = /@([a-z][a-z0-9-]*)/g

export async function POST(request: Request): Promise<Response> {
  let body: { roomId?: string; content?: string; mentions?: string[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const roomId = body.roomId?.trim()
  const content = body.content?.trim()
  if (!roomId || !content) {
    return Response.json({ error: 'roomId and content required' }, { status: 400 })
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

  // 1) Insert the user message. RLS blocks rooms the caller can't see.
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
    // Distinguish RLS block (42501) from other errors.
    const code = (userErr as { code?: string })?.code
    if (code === '42501' || String((userErr as { message?: string })?.message ?? '').includes('row-level security')) {
      return Response.json({ error: "you don't have access to this room" }, { status: 403 })
    }
    return Response.json({ error: String((userErr as { message?: string })?.message ?? userErr) }, { status: 500 })
  }

  // 2) Placeholder agent reply — swapped for real Hermes streaming in C3.
  const replyContent =
    mentions.length > 0
      ? `[wired: awaiting Hermes] mentions=${mentions.join(', ')} — agent will respond once Hermes is connected.`
      : `[wired: awaiting Hermes] meta.classify would pick the right department leader here; Hermes will stream the response.`

  const { data: agentMsg, error: agentErr } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      author_kind: 'agent',
      author_id: mentions[0] ?? 'meta',
      author_name: mentions[0] ?? 'meta',
      content: replyContent,
      mentions: [],
    })
    .select('id, created_at')
    .single()

  if (agentErr) {
    // User message saved fine but reply failed — return partial success.
    return Response.json(
      { userMessageId: (userMsg as { id: string } | null)?.id, error: 'reply save failed' },
      { status: 200 }
    )
  }

  return Response.json({
    userMessage: { id: (userMsg as { id: string; created_at: string } | null)?.id, createdAt: (userMsg as { created_at: string } | null)?.created_at },
    agentMessage: { id: (agentMsg as { id: string; created_at: string } | null)?.id, createdAt: (agentMsg as { created_at: string } | null)?.created_at, content: replyContent },
  })
}
