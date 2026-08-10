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

import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { supabaseServer } from '@/lib/supabase-server'
import { streamHermesChat, hermesConfig } from '@/lib/hermes-client'
import { sendPush, type PushSubscriptionRow } from '@/lib/push-server'
import type { WorkspaceKey } from '@/lib/workspaces'
import { activeWorkspace } from '@/lib/workspaces'
import { errMsg } from '@/lib/errors'

// TS-018 WI-2 (YVON-CHAT §3.2): the workspace was hardcoded to 'yvon-os' here
// (the "one defect that underlies more than it appears to"). Now read from the
// yvon_active_venture cookie set by /switch; unknown/missing values fall back
// to 'yvon-os'. The value flows to events.context_id via main.py → events.py.

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
  const cookieStore = await cookies()
  // Real ventures from the DB — no hardcoded sub-brands (TS-026).
  let validVentureSlugs: string[] = []
  try {
    const { data: ventureRows } = await supabase.from('ventures').select('slug')
    validVentureSlugs = ((ventureRows as unknown as { slug: string }[] | null) ?? []).map((r) => r.slug)
  } catch {
    // fall through with yvon-os only
  }
  const workspace: WorkspaceKey = activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validVentureSlugs)

  const cfg = hermesConfig()
  if (!cfg.configured) {
    // Actionable error: name exactly which env var is missing (TS-021).
    const reason = cfg.reason ?? 'Hermes not configured (HERMES_URL / HERMES_TOKEN missing)'
    return new Response(
      `data: ${JSON.stringify({ kind: 'error', message: reason })}\n\n`,
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

      let turnCorrelation: string | null = null
      let correlationPersisted = false

      try {
        const content = userMsg.content ?? ''
        const mentions: string[] = Array.isArray(userMsg.mentions) ? userMsg.mentions : []

        // TS-027/TS-028: Input Analysis + Context, INLINED (no self-fetch —
        // the old NEXT_PUBLIC_SITE_URL fetch broke the pipeline events when the
        // env wasn't set / port differed, leaving the HUD on "waiting").
        const { analyzeMessage } = await import('@pipelines/input-analysis')
        const { agentContextFor, ventureContextFor } = await import('@/lib/context-resolver')

        const analysis = await analyzeMessage(content)
        const tier = analysis.tier
        let inputAnalysis: string | null = null
        if (tier === 'build' && analysis.analyzed) {
          inputAnalysis =
            `WHAT: ${analysis.what}\n` +
            `WHY: ${analysis.why}\n` +
            `HOW: ${analysis.how}\n` +
            `END RESULT: ${analysis.endResult}\n` +
            `DESIRED OUTPUT: ${analysis.desiredOutput}`
        } else if (tier === 'info') {
          // Info tier: inject the dynamic breakdown so the agent answers to it.
          inputAnalysis =
            `QUESTION: ${analysis.what}\n` +
            `TYPE: ${analysis.type ?? ''}\n` +
            `SUBJECT: ${analysis.subject ?? ''}\n` +
            `SCOPE: ${analysis.scope ?? ''}\n` +
            `EXPECTED: ${analysis.expected ?? ''}\n` +
            `FORMAT: ${analysis.format ?? ''}`
        }

        // Emit the analysis event UNCONDITIONALLY (except generic) so the HUD
        // leaves "waiting" and shows the analysis for every turn. Dynamic
        // fields: info → type/subject/scope/expected/format; build → 5 fields.
        if (tier !== 'generic') {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                kind: 'input.analysis',
                tier,
                what: analysis.what,
                why: analysis.why,
                how: analysis.how,
                endResult: analysis.endResult,
                desiredOutput: analysis.desiredOutput,
                type: analysis.type,
                subject: analysis.subject,
                scope: analysis.scope,
                expected: analysis.expected,
                format: analysis.format,
                relation: analysis.relation,
                mustHaves: analysis.mustHaves,
                targetAgents: analysis.targetAgents,
                correlation: turnCorrelation,
              })}\n\n`,
            ),
          )
        }

        // TS-030: persist the input-analysis breakdown (tier/relation/fields/
        // must-haves/routing) so past turns render the same pipeline section
        // as live ones. Rides chat_emit_input_analysis_event (migration 106) —
        // best-effort like the TS-029 emit below; never breaks the turn. If
        // migration 106 isn't pushed yet, this silently no-ops (degrading
        // loudly: live HUD unaffected, past turns show no analysis until push).
        if (tier !== 'generic') {
          try {
            await (supabase as unknown as {
              rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
            }).rpc('chat_emit_input_analysis_event', {
              p_context_id: workspace,
              p_correlation: turnCorrelation ?? randomUUID(),
              p_room_id: userMsg.room_id,
              p_author_id: user.id,
              p_payload: {
                tier,
                relation: analysis.relation,
                what: analysis.what,
                why: analysis.why,
                how: analysis.how,
                endResult: analysis.endResult,
                desiredOutput: analysis.desiredOutput,
                type: analysis.type,
                subject: analysis.subject,
                scope: analysis.scope,
                expected: analysis.expected,
                format: analysis.format,
                mustHaves: analysis.mustHaves,
                targetAgents: analysis.targetAgents,
              },
            })
          } catch {
            // observability never breaks the send
          }
        }

        // TS-029: general (non-venture) messages are recorded as a distinct
        // graph node kind 'chat.general' so /brain can show venture-task nodes
        // vs general-chat nodes separately. Best-effort, never breaks the turn.
        if (tier !== 'generic' && analysis.relation === 'general') {
          try {
            await (supabase as unknown as {
              rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
            }).rpc('chat_emit_conversation_event', {
              p_context_id: workspace,
              p_correlation: randomUUID(),
              p_room_id: userMsg.room_id,
              p_author_id: user.id,
              p_kind: 'chat.general',
              p_preview: content.slice(0, 120),
            })
          } catch {
            // observability never breaks the send
          }
        }

        // Generic messages are answered directly by the client — no Hermes call.
        if (tier === 'generic') {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ kind: 'done', response: 'Hey! How can I help?', correlation: turnCorrelation })}\n\n`,
            ),
          )
          controller.close()
          return
        }

        // TS-029: context injection ONLY for venture-related messages. General
        // messages skip context/CAOS/RAG and go straight to the answer.
        let agentContext: string | undefined
        let ventureContext: string | undefined
        if (analysis.relation === 'venture') {
          agentContext = (await agentContextFor(mentions[0] ?? '')) ?? undefined
          ventureContext = (await ventureContextFor(workspace)) ?? undefined
        }
        // Emit the context stage always (real, or honest 'none defined').
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              kind: 'context.injected',
              label: 'context',
              detail: agentContext
                ? ventureContext
                  ? 'agent skills · venture memory'
                  : 'agent skills'
                : ventureContext
                  ? 'venture memory'
                  : 'no context defined',
              correlation: turnCorrelation,
            })}\n\n`,
          ),
        )

        // TS-028: context-injection stage event (real — resolved above).
        if (agentContext || ventureContext) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                kind: 'context.injected',
                label: 'context',
                detail: agentContext
                  ? ventureContext
                    ? 'agent skills · venture memory'
                    : 'agent skills'
                  : 'venture memory',
                correlation: turnCorrelation,
              })}\n\n`,
            ),
          )
        }

        for await (const event of streamHermesChat(
          {
            message: content,
            userId: user.id,
            roomId: userMsg.room_id,
            workspace,
            mentions,
            agentContext,
            ventureContext,
            inputAnalysis: inputAnalysis ?? undefined,
          },
          cfg,
        )) {
          const data = JSON.stringify(event)
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))

          // TS-018 WI-2 (YVON-CHAT §5.2): capture the turn's correlation from
          // the first event that carries it, then link the user message row so
          // the pipeline panel can reconstruct the turn with one query.
          // Best-effort (WI-11 live fix): if migration 106 isn't applied the
          // write fails quietly and the turn still completes — correlation
          // simply isn't persisted until the migration runs.
          if (!turnCorrelation && event.correlation) {
            turnCorrelation = event.correlation
            const { error: corrErr } = await supabase
              .from('chat_messages')
              .update({ correlation: turnCorrelation })
              .eq('id', userMessageId)
              .is('correlation', null)
            if (corrErr) {
              // eslint-disable-next-line no-console
              console.warn(
                'chat_messages.correlation write failed (migration 106 not applied?):',
                corrErr.message,
              )
            } else {
              correlationPersisted = true
            }
          }

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
        const msg = `[Hermes error] ${errMsg(e)}`
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
          correlation: correlationPersisted ? turnCorrelation ?? undefined : undefined,
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
