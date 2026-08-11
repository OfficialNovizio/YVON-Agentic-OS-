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
  // Real ventures from the DB — no hardcoded sub-brands (TS-026). Also pulls
  // repo_url so the repo-mode toggle (2026-08-11) can resolve the active
  // venture's linked repo without a second query.
  let validVentureSlugs: string[] = []
  let ventureRepoUrls: Record<string, string> = {}
  try {
    const { data: ventureRows } = await supabase.from('ventures').select('slug, repo_url')
    const rows = (ventureRows as unknown as { slug: string; repo_url: string | null }[] | null) ?? []
    validVentureSlugs = rows.map((r) => r.slug)
    ventureRepoUrls = Object.fromEntries(rows.filter((r) => r.repo_url).map((r) => [r.slug, r.repo_url as string]))
  } catch {
    // fall through with yvon-os only
  }
  const workspace: WorkspaceKey = activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validVentureSlugs)

  // Repo-mode toggle (2026-08-11, RepoModeToggle.tsx): 'github' only ever
  // pairs with the ACTIVE venture's own configured repo_url — the allowlist
  // from discovery. A stale 'github' cookie for a venture with no linked
  // repo silently falls back to local rather than sending a bad/missing URL.
  const repoModeCookie = cookieStore.get('yvon_repo_mode')?.value
  const repoUrl = ventureRepoUrls[workspace]
  const repoMode: 'local' | 'github' = repoModeCookie === 'github' && repoUrl ? 'github' : 'local'

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
      // Hoisted out of the try block below (content/analysis are block-scoped
      // there) so the MemPalace drawer write after the try/catch can still
      // read this turn's message text and venture-relation gate.
      let turnContent = ''
      let turnRelation: string | undefined

      try {
        const content = userMsg.content ?? ''
        turnContent = content
        const mentions: string[] = Array.isArray(userMsg.mentions) ? userMsg.mentions : []

        // TS-027/TS-028: Input Analysis + Context, INLINED (no self-fetch —
        // the old NEXT_PUBLIC_SITE_URL fetch broke the pipeline events when the
        // env wasn't set / port differed, leaving the HUD on "waiting").
        const { analyzeMessage } = await import('@pipelines/input-analysis')
        const { skillDisclosureFor, ventureContextFor } = await import('@/lib/context-resolver')

        const analysis = await analyzeMessage(content)
        turnRelation = analysis.relation
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

        // Which agent actually answers: an explicit @mention wins; otherwise
        // fall back to what CLASSIFY/ROUTE (pipelines/input-analysis) already
        // decided. Previously targetAgents was computed and shown on the HUD
        // but never consumed here — Hermes got no identity unless the user
        // typed @agent, so it answered as itself instead of the routed agent
        // (2026-08-11 fix). Identity is cheap (one skills-roster block), so
        // it's injected regardless of relation; venture memory stays gated
        // to relation === 'venture' since that's genuinely project-specific
        // and general chat shouldn't pull it in (TS-029).
        const effectiveAgentId = mentions[0] ?? analysis.targetAgents?.primary ?? ''
        let agentContext: string | undefined
        let ventureContext: string | undefined
        if (effectiveAgentId) {
          // TS-027/CAOS phase 02 (2026-08-11): real progressive-disclosure
          // skill matching, not just a flat list — see lib/context-resolver.ts
          // for why the match logic differs from rag/harness/disclosure.py's
          // (that one's trigger-heading parsing never matches real files).
          const { prompt, disclosure } = await skillDisclosureFor(effectiveAgentId, content)
          agentContext = prompt ?? undefined
          if (disclosure) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  kind: 'skill.disclosure',
                  active: disclosure.active,
                  inactiveCount: disclosure.inactiveCount,
                  totalSkills: disclosure.totalSkills,
                  savingsPct: disclosure.savingsPct,
                  correlation: turnCorrelation,
                })}\n\n`,
              ),
            )
          }
        }
        // RESOLVE (2026-08-11): was two duplicate 'context.injected' emissions
        // carrying both an agent-skills signal and a venture-memory signal
        // bundled together. The agent-skills half is phase 02's job now
        // (skill.disclosure, above) — src/cie/graph-resolver.ts's graph-tier/
        // CAG-cache/MemPalace story that RESOLVE's Reference used to describe
        // isn't wired into chat at all (checked: only imported by the
        // standalone src/cie/ CIE pipeline, never dashboard/ or the Hermes
        // wrapper). The one real, RESOLVE-relevant fact this turn has is
        // whether venture memory attached — so that's the whole signal now,
        // honest and un-padded, instead of implying a richer mechanism ran.
        if (analysis.relation === 'venture') {
          ventureContext = (await ventureContextFor(workspace)) ?? undefined
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              kind: 'venture.context',
              attached: !!ventureContext,
              // Strip the prompt-block prefix and swap the "name — desc" em
              // dash for a comma — this renders straight into the HUD, and
              // rendered UI text stays em-dash-free (2026-08-11 house rule).
              detail: ventureContext
                ? ventureContext.replace(/^VENTURE MEMORY:\s*/, '').replace(/\s+—\s+/, ', ')
                : undefined,
              correlation: turnCorrelation,
            })}\n\n`,
          ),
        )

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
            repoMode,
            repoUrl: repoMode === 'github' ? repoUrl : undefined,
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
            // Was hardcoded 'meta' regardless of who CLASSIFY actually
            // routed to — now the same effectiveAgentId used for context.
            replyAuthorId = effectiveAgentId || 'meta'
            replyAuthorName = effectiveAgentId || 'meta'
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

      // ── Task-proposal marker (2026-08-11) ────────────────────────────────
      // The agent may end a reply with a fenced ```task-proposal block (see
      // the prompt instruction in vps-scripts/yvon-hermes-http/main.py) when
      // a discussion reaches an actionable conclusion. Strip it out of the
      // visible/stored message and emit it as a `task.proposed` event
      // instead of raw text — mirrors the input.analysis event pattern
      // (052/106 migrations). A malformed block is stripped but never
      // fabricated into a fake proposal; it just silently produces no event.
      const PROPOSAL_RE = /```task-proposal\s*\n([\s\S]*?)```/
      const proposalMatch = replyContent.match(PROPOSAL_RE)
      let taskProposal: { title: string; summary: string } | null = null
      if (proposalMatch) {
        replyContent = replyContent.replace(PROPOSAL_RE, '').trim()
        try {
          const parsed = JSON.parse(proposalMatch[1].trim())
          if (parsed && typeof parsed.title === 'string' && typeof parsed.summary === 'string') {
            taskProposal = { title: parsed.title.slice(0, 200), summary: parsed.summary.slice(0, 800) }
          }
        } catch {
          // Malformed block — already stripped above; no proposal event fires.
        }
      }

      if (taskProposal) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              kind: 'task.proposed',
              title: taskProposal.title,
              summary: taskProposal.summary,
              correlation: turnCorrelation,
            })}\n\n`,
          ),
        )
        try {
          await (supabase as unknown as {
            rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
          }).rpc('chat_emit_task_proposal_event', {
            p_context_id: workspace,
            p_correlation: turnCorrelation ?? randomUUID(),
            p_room_id: userMsg.room_id,
            p_author_id: replyAuthorId,
            p_payload: { title: taskProposal.title, summary: taskProposal.summary },
            p_kind: 'task.proposed',
          })
        } catch {
          // observability never breaks the send
        }
      }

      // ── Save agent reply to DB ──────────────────────────────────────────
      let agentMessageId: string | undefined
      try {
        const { data: agentRow, error: agentErr } = await supabase
          .from('chat_messages')
          .insert({
            room_id: userMsg.room_id,
            author_kind: 'agent',
            author_id: replyAuthorId,
            author_name: replyAuthorName,
            content: replyContent,
            mentions: [],
            correlation: correlationPersisted ? turnCorrelation ?? undefined : undefined,
          })
          .select('id')
          .single()

        if (!agentErr) {
          agentMessageId = (agentRow as { id?: string } | null)?.id
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

      // ── MemPalace Phase 2 (2026-08-11) ───────────────────────────────────
      // Work item B, docs/PRD-graph-memory-live-brands.md. Same gate RESOLVE
      // already uses (relation === 'venture', and yvon-os is explicitly "no
      // venture" — see ventureContextFor) so a general-relation turn writes
      // nothing, matching the PRD's acceptance criteria. One row per
      // (chat_messages.id, role) — mempalace_drawers' own unique constraint
      // (migration 114) makes a retried write a no-op, not a duplicate,
      // satisfying the design doc's "one verbatim drawer per message,
      // idempotent" invariant without extra application-level dedup logic.
      if (turnRelation === 'venture' && workspace && workspace !== 'yvon-os') {
        try {
          const drawerRows: {
            wing: string
            room_id: string
            source_message_id: string
            correlation: string | null
            role: 'user' | 'agent'
            actor: string | null
            content: string
          }[] = [
            {
              wing: workspace,
              room_id: userMsg.room_id,
              source_message_id: userMessageId,
              correlation: turnCorrelation,
              role: 'user',
              actor: null,
              content: turnContent,
            },
          ]
          if (agentMessageId) {
            drawerRows.push({
              wing: workspace,
              room_id: userMsg.room_id,
              source_message_id: agentMessageId,
              correlation: turnCorrelation,
              role: 'agent',
              actor: replyAuthorId,
              content: replyContent,
            })
          }
          const { error: drawerErr } = await supabase
            .from('mempalace_drawers')
            .upsert(drawerRows, { onConflict: 'source_message_id,role', ignoreDuplicates: true })
          if (!drawerErr) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  kind: 'mempalace.drawer',
                  wing: workspace,
                  count: drawerRows.length,
                  correlation: turnCorrelation,
                })}\n\n`,
              ),
            )
          } else {
            // eslint-disable-next-line no-console
            console.warn('mempalace_drawers write failed:', drawerErr.message)
          }
        } catch {
          // Best-effort — memory persistence never breaks the turn
        }
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
