// POST /api/chat/send  body: { roomId, content, mentions?, attachments? }
// Two paths:
//   · normal message — saves the user message + attachments, returns
//     immediately; Hermes execution + reply save happens asynchronously via
//     GET /api/chat/stream (SSE).
//   · slash command (content starts with '/') — dispatched by the command
//     registry BEFORE any insert (YVON-CHAT §2.3). Never reaches Hermes, never
//     stored as a user message. The result is persisted as a system message
//     (author_kind='system' via chat_insert_system_message), audited in
//     chat_command_log, and emitted to the events table as 'command.run'.
//
// Owner: raj · TS-009 Push C1 · TS-013 WI-5 · TS-016 WI-6 · TS-017 WI-1 · TS-018 WI-1
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { supabaseServer } from '@/lib/supabase-server'
import { dispatchCommand } from '@/lib/commands/registry'
import type { DbClient } from '@/lib/commands/types'
import { activeWorkspace } from '@/lib/workspaces'

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
  const cookieStore = await cookies()
  // Real ventures from the DB — no hardcoded sub-brands (TS-026).
  let validVentureSlugs: string[] = []
  try {
    const { data: ventureRows } = await supabase.from('ventures').select('slug')
    validVentureSlugs = ((ventureRows as unknown as { slug: string }[] | null) ?? []).map((r) => r.slug)
  } catch {
    // fall through with yvon-os only
  }
  const contextId = activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validVentureSlugs)

  // ── Command path — dispatch BEFORE the insert (YVON-CHAT §2.3) ────────────
  if (content.startsWith('/')) {
    // Structural seam: the ssr client's generic type churns between versions;
    // the command contract only needs .from/.rpc (see types.ts).
    const db = supabase as unknown as DbClient
    const commandName = content.slice(1).split(/\s+/)[0]?.toLowerCase() ?? ''
    const result = await dispatchCommand({
      userId: user.id,
      roomId,
      args: [],
      raw: content,
      supabase: db,
      cookies: cookieStore,
    })
    const correlation = randomUUID()

    // 1) Persist the result as a system message (definer fn — RLS-guarded).
    const { error: sysErr } = await (supabase as unknown as DbClient).rpc('chat_insert_system_message', {
      p_room_id: roomId,
      p_content: result.message,
      p_author_id: 'system',
      p_author_name: 'system',
      p_mentions: [],
      p_correlation: correlation,
    })
    if (sysErr) {
      // Persisting the system row is best-effort — the command still ran.
      // eslint-disable-next-line no-console
      console.warn('chat_insert_system_message failed:', sysErr.message)
    }

    // 2) Audit the run (append-only log).
    await supabase.from('chat_command_log').insert({
      room_id: roomId,
      user_id: user.id,
      command: commandName,
      args: result.message.length > 400 ? [result.message.slice(0, 400)] : [result.message],
      ok: result.ok,
      message: result.message.slice(0, 2000),
    })

    // 3) Emit to the events table so /brain and the pipeline panel see it.
    await (supabase as unknown as DbClient).rpc('chat_emit_command_event', {
      p_context_id: contextId,
      p_correlation: correlation,
      p_command: commandName,
      p_args: result.detail ?? {},
      p_ok: result.ok,
      p_message: result.message.slice(0, 500),
    })

    return Response.json({
      userMessage: null,
      command: {
        ok: result.ok,
        message: result.message,
        effect: result.effect ?? { kind: 'none' },
        detail: result.detail,
      },
    })
  }

  // ── Normal message path ───────────────────────────────────────────────────
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

  // TS-023 #2 — emit a chat.conversation event so /brain + the pipeline panel
  // see this message in the graph, linked by its own correlation. Best-effort.
  try {
    await (supabase as unknown as DbClient).rpc('chat_emit_conversation_event', {
      p_context_id: contextId,
      p_correlation: randomUUID(),
      p_room_id: roomId,
      p_author_id: user.id,
      p_kind: 'chat.conversation',
      p_preview: content.slice(0, 120),
    })
  } catch {
    // observability never breaks the send
  }

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
