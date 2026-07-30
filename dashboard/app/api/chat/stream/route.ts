// GET /api/chat/stream?userMessageId=<id>
// SSE endpoint — streams Hermes execution events live to the client (TS-017).
//
// Flow:
//   1. Auth check + read user message from DB
//   2. Open SSE connection to Hermes wrapper via streamHermesChat()
//   3. Pipe ALL events (thinking, tool_call.*, notice, token, done/error) to client
//   4. On 'done': save agent reply to DB + fire push notification
//
// Decoupled from POST /api/chat/send — that endpoint just saves the user message
// and returns immediately with a userMessageId. The client opens this SSE stream
// to get the real-time agent response.
//
// Owner: raj (TS-017 WI-1)

import { supabaseServer } from '@/lib/supabase-server'
import { streamHermesChat, hermesConfig } from '@/lib/hermes-client'
import { sendPush, type PushSubscriptionRow } from '@/lib/push-server'
import type { WorkspaceKey } from '@/lib/workspaces'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const userMessageId = searchParams.get('userMessageId')?.trim()

  if (!userMessageId) {
    return new Response('missing userMessageId', { status: 400 })
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  // ── Read user message + room context ──────────────────────────────────────
  const { data: userMsg, error: msgErr } = await supabase
    .from('chat_messages')
    .select('id, room_id, content, mentions')
    .eq('id', userMessageId)
    .single()

  if (msgErr || !userMsg) {
    return new Response('message not found', { status: 404 })
  }

  const { data: room } = await supabase
    .from('chat_rooms')
    .select('kind, department')
    .eq('id', userMsg.room_id)
    .single()
  const workspace: WorkspaceKey = 'yvon-os'

  const cfg = hermesConfig()
  if (!cfg.configured) {
    return new Response(
      `data: ${JSON.stringify({ kind: 'error', message: 'Hermes not configured' })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
        },
      },
    )
  }

  // ── Streaming response ────────────────────────────────────────────────────
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let replyContent = ''
      let replyAuthorId = '[unknown]'
      let replyAuthorName = '[unknown]'

      try {
        const content = userMsg.content ?? ''
        const mentions: string[] = Array.isArray(userMsg.mentions) ? userMsg.mentions : []

        for await (const event of streamHermesChat(
          {
            message: content,
            userId: user.id,
            roomId: userMsg.room_id,
            workspace,
            mentions,
          },
          cfg,
        )) {
          const data = JSON.stringify(event)
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))

          if (event.kind === 'done') {
            replyContent = event.response
            replyAuthorId = mentions[0] ?? 'meta'
            replyAuthorName = mentions[0] ?? 'meta'
          } else if (event.kind === 'error') {
            replyContent = `[Hermes error] ${event.message}`
            replyAuthorId = 'system'
            replyAuthorName = 'system'
          }
        }
      } catch (e) {
        const msg = `[Hermes error] ${e instanceof Error ? e.message : String(e)}`
        replyContent = msg
        replyAuthorId = 'system'
        replyAuthorName = 'system'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ kind: 'error', message: msg })}\n\n`),
        )
      }

      // ── Save agent reply to DB ──────────────────────────────────────────
      try {
        const { error: agentErr } = await supabase.from('chat_messages').insert({
          room_id: userMsg.room_id,
          author_kind: 'agent',
          author_id: replyAuthorId,
          author_name: replyAuthorName,
          content: replyContent,
          mentions: [],
        })

        if (!agentErr) {
          // Best-effort push notification
          try {
            const { data: subs } = await supabase
              .from('push_subscriptions')
              .select('id, endpoint, p256dh, auth, user_id')
              .neq('user_id', user.id)
              .limit(50)

            const subRows = (subs as unknown as PushSubscriptionRow[] | null) ?? []
            if (subRows.length > 0) {
              const preview =
                replyContent.length > 100 ? replyContent.slice(0, 100) + '…' : replyContent
              await sendPush(subRows, {
                title: `${replyAuthorName} · new message`,
                body: preview,
                url: `/chat?room=${userMsg.room_id}`,
                tag: `room:${userMsg.room_id}`,
                messageId: undefined,
                roomId: userMsg.room_id,
              })
            }
          } catch {
            // Never fail the stream just because push failed
          }
        }
      } catch {
        // Best-effort — user message is already saved
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
    },
  })
}
