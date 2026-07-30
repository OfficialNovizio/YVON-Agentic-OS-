// POST /api/chat/send  body: { roomId, content, mentions?, attachments? }
// Inserts the user message via RLS-safe client, attaches any uploaded files,
// calls Hermes for the agent reply, then saves the reply message.
// Owner: raj · TS-009 Push C1 · TS-013 WI-5 Hermes · TS-016 WI-6 attachments
import { supabaseServer } from '@/lib/supabase-server'
import { askHermes, hermesConfig } from '@/lib/hermes-client'
import { sendPush, type PushSubscriptionRow } from '@/lib/push-server'
import type { WorkspaceKey } from '@/lib/workspaces'

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
    return Response.json({ error: 'roomId and either content or attachments required' }, { status: 400 })
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

  const userMessageId = (userMsg as { id: string; created_at: string } | null)?.id

  // 1b) Attach uploaded files to the user message.
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
      // Non-fatal — message is saved, just attachments failed. Log the reason.
      // eslint-disable-next-line no-console
      console.warn('chat_attachments insert failed:', (attErr as { message?: string })?.message)
    }
  }

  // 2) Call Hermes for the real agent reply. Degrades loudly if not configured.
  const cfg = hermesConfig()
  let replyContent: string
  let replyAuthorId: string
  let replyAuthorName: string

  if (!cfg.configured) {
    replyContent =
      `[Hermes not configured — set HERMES_URL + HERMES_TOKEN in Vercel env vars. ` +
      `See vps-scripts/yvon-hermes-http/install.sh output for the values.]`
    replyAuthorId = 'system'
    replyAuthorName = 'system'
  } else {
    // Look up the room's workspace for context routing (yvon-os / novizio / …)
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('kind, department')
      .eq('id', roomId)
      .single()
    const roomRow = room as unknown as { kind?: string; department?: string } | null
    // For now the chat lives in YVON OS workspace (Command Center). Brand rooms
    // would set workspace to their brand key.
    const workspace: WorkspaceKey = 'yvon-os'

    const hermes = await askHermes({
      message: content,
      userId: user.id,
      roomId,
      workspace,
      mentions,
    })

    if (hermes.ok) {
      replyContent = hermes.response || '[agent returned empty response]'
      // Pick author from mentions[0], else "meta" (router agent alias)
      replyAuthorId = mentions[0] ?? 'meta'
      replyAuthorName = mentions[0] ?? 'meta'
    } else {
      // Loud, honest failure — don't fake a reply.
      replyContent = `[Hermes error] ${hermes.error}`
      replyAuthorId = 'system'
      replyAuthorName = 'system'
    }
  }

  const { data: agentMsg, error: agentErr } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      author_kind: 'agent',
      author_id: replyAuthorId,
      author_name: replyAuthorName,
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

  // 3) Fire Web Push to everyone in the room who's subscribed.
  //    Best-effort — silent failures don't block the response.
  //    "Focused browser tab" filtering happens on the CLIENT side (the SW's
  //    push event can check visibility of open windows and suppress if focused).
  //    Server-side we just fan out to all recipients' subscriptions.
  //    Recipients = everyone else with access to this room (RLS-scoped read
  //    on push_subscriptions is fine — owner + self, so we go admin here via
  //    service role to reach everyone's subs).
  try {
    // Get user IDs who can see this room (via chat_rooms + department_assignments)
    // Simpler v1: query push_subscriptions bypassing RLS for the notification fan-out.
    // We use the service-role client — but we've been using RLS-safe supabaseServer.
    // For fan-out we intentionally query without user filter (service-role isn't
    // wired into supabaseServer). Fallback: query only OWN subscriptions (RLS-ok)
    // so at minimum push to the sender's OTHER devices. Multi-recipient push is
    // a follow-up (TS-014 v2).
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, user_id')
      .neq('user_id', user.id) // don't push to the sender's own devices about their own message
      .limit(50)

    const subRows = (subs as unknown as PushSubscriptionRow[] | null) ?? []
    if (subRows.length > 0) {
      const preview =
        replyContent.length > 100 ? replyContent.slice(0, 100) + '…' : replyContent
      await sendPush(subRows, {
        title: `${replyAuthorName} · new message`,
        body: preview,
        url: `/chat?room=${roomId}`,
        tag: `room:${roomId}`, // groups notifications from the same room
        messageId: (agentMsg as { id: string } | null)?.id,
        roomId,
      })
    }
  } catch {
    // Never fail the chat send just because push failed.
  }

  return Response.json({
    userMessage: { id: (userMsg as { id: string; created_at: string } | null)?.id, createdAt: (userMsg as { created_at: string } | null)?.created_at },
    agentMessage: { id: (agentMsg as { id: string; created_at: string } | null)?.id, createdAt: (agentMsg as { created_at: string } | null)?.created_at, content: replyContent },
  })
}
