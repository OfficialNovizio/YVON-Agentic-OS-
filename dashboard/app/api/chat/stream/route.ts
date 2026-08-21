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
import { streamHermesChat, hermesConfig, ensureRepoPreview, dropPool } from '@/lib/hermes-client'
import { getVentureGithubPatBySlug } from '@/lib/db/venture-graphify'
import { sendPush, type PushSubscriptionRow } from '@/lib/push-server'
import type { WorkspaceKey } from '@/lib/workspaces'
import { activeWorkspace } from '@/lib/workspaces'
import { errMsg } from '@/lib/errors'

// Reworked 2026-08-21: dropped the Local/GitHub toggle entirely (explicit
// user decision — one system, not two: "hermes keep repo work in it's vps
// and only push to live github when i said so"). Previously briefly routed
// through a direct-to-LLM in-process tool loop instead of Hermes at all —
// reverted per "all the power is for hermes... don't direct connect to
// llm". Every turn always goes through streamHermesChat(). There's no mode
// cookie/gate anymore: whenever the active venture has a repo_url, it's
// always forwarded, and Hermes always ensures its persistent per-venture
// checkout is cloned/pulled fresh (main.py). No repo_url → Hermes says so
// plainly instead of guessing.

// TS-018 WI-2 (YVON-CHAT §3.2): the workspace was hardcoded to 'yvon-os' here
// (the "one defect that underlies more than it appears to"). Now read from the
// yvon_active_venture cookie set by /switch; unknown/missing values fall back
// to 'yvon-os'. The value flows to events.context_id via main.py → events.py.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 2026-08-21: auto-reset threshold for main.py's per-room agent pool. Real
// journalctl evidence (agent.conversation_loop logs) showed a pooled room's
// per-call input tokens climbing turn over turn — 18k → 72k across one
// active session — because _pool reuses the same AIAgent (and its internal
// history) for as long as the room stays active, only evicting after 30min
// idle. Prompt caching keeps that growth fast/cheap per call but does NOT
// exempt it from the account's tokens-per-minute rate limit, so an
// uninterrupted room eventually trips it. 130k leaves real headroom under
// the observed 200k/min ceiling for whatever else shares that same quota
// (other rooms, other agents) within the same 60s window.
const POOL_AUTO_RESET_TOTAL_TOKENS = 130_000

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
    .select('id, room_id, content, mentions, correlation')
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
  // repo_url so the active venture's linked repo resolves without a second query.
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

  // Reworked 2026-08-21: no more Local/GitHub toggle — whenever the active
  // venture has a repo_url saved, it's always forwarded and Hermes always
  // ensures its persistent per-venture checkout (main.py). No repo_url at
  // all → nothing forwarded, Hermes says so plainly instead of guessing.
  const repoUrl = ventureRepoUrls[workspace]

  // Fixed 2026-08-19: chat's repo access used to have no credential of its
  // own — it relied on a VPS-side GITHUB_PAT env var that install.sh never
  // sets, so a private venture repo failed to clone with an auth error even
  // when a PAT was already saved in Settings → Venture → Technical (that
  // PAT was only ever wired to graphify/MemPalace before now). Reuse the
  // SAME saved PAT here — one credential per venture, sourced from
  // Supabase, nothing to configure on the VPS. Only fetched when there's
  // actually a repo to clone.
  const repoGithubPat = repoUrl ? ((await getVentureGithubPatBySlug(workspace)) ?? undefined) : undefined

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

      // TS-018 WI-2 fix (2026-08-11): correlation is now minted ONCE by
      // /api/chat/send at message-creation time (chat_messages.correlation),
      // not scattered across three separate randomUUID() calls plus whatever
      // Hermes made up on its own — see send/route.ts's header comment for
      // the full story. Falling back to a fresh id only covers pre-fix rows
      // or the (should-be-rare) case send's write failed.
      let turnCorrelation: string = (userMsg as { correlation?: string }).correlation ?? randomUUID()
      let correlationPersisted = !!(userMsg as { correlation?: string }).correlation
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

        // Emit the analysis event UNCONDITIONALLY, including generic, so the
        // HUD's CLASSIFY phase leaves "waiting" and shows real classifier
        // output for every turn (bug found 2026-08-11: the comment already
        // said "every turn" but the code excluded generic — classifyTier()
        // ran either way to produce the tier value, so this was free to emit
        // and just wasn't). Dynamic fields: info → type/subject/scope/
        // expected/format; build → 5 fields; generic → tier/relation only,
        // the rest come back empty from analyzeMessage() and that's fine.
        {
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
        // Unconditional now too (see emit above) — generic-tier turns get a
        // persisted CLASSIFY record same as everything else.
        {
          try {
            await (supabase as unknown as {
              rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
            }).rpc('chat_emit_input_analysis_event', {
              p_context_id: workspace,
              p_correlation: turnCorrelation,
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
              p_correlation: turnCorrelation,
              p_room_id: userMsg.room_id,
              p_author_id: user.id,
              p_kind: 'chat.general',
              p_preview: content.slice(0, 120),
            })
          } catch {
            // observability never breaks the send
          }
        }

        // Generic messages (bare greetings etc.) are answered directly by the
        // client — no Hermes call. Bug found 2026-08-11: this used to close
        // the stream here without ever saving the reply, and the client's
        // 'done' handler never read event.response either — so the canned
        // reply was silently dropped end to end (user saw nothing). Now it's
        // saved to chat_messages like any other agent reply (author 'meta',
        // the fleet's default identity) so it persists, survives a reload,
        // and renders via the normal message-list path instead of needing
        // special client-side handling.
        if (tier === 'generic') {
          const genericReply = 'Hey! How can I help?'
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ kind: 'done', response: genericReply, correlation: turnCorrelation })}\n\n`,
            ),
          )
          try {
            await supabase.from('chat_messages').insert({
              room_id: userMsg.room_id,
              author_kind: 'agent',
              author_id: 'meta',
              author_name: 'meta',
              content: genericReply,
              mentions: [],
              correlation: turnCorrelation,
            })
          } catch {
            // Best-effort — user message is already saved; worst case the
            // canned reply just doesn't persist for this one turn.
          }
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
            // Persist so past turns render the same rich phase 02 breakdown
            // as live ones (migration 117 — this never had a DB write path
            // before, unlike phase 01's chat_emit_input_analysis_event).
            try {
              await (supabase as unknown as {
                rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
              }).rpc('chat_emit_skill_disclosure_event', {
                p_context_id: workspace,
                p_correlation: turnCorrelation,
                p_room_id: userMsg.room_id,
                p_author_id: user.id,
                p_payload: {
                  active: disclosure.active,
                  inactiveCount: disclosure.inactiveCount,
                  totalSkills: disclosure.totalSkills,
                  savingsPct: disclosure.savingsPct,
                },
              })
            } catch {
              // observability never breaks the send
            }
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
        // Persist so past turns render the same rich phase 03 breakdown as
        // live ones (migration 117 — venture.context never had a DB write
        // path before; past turns fell back to the sparse Hermes-only
        // phase.resolve event, 'targets → meta' with no venture-memory info).
        try {
          await (supabase as unknown as {
            rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
          }).rpc('chat_emit_venture_context_event', {
            p_context_id: workspace,
            p_correlation: turnCorrelation,
            p_room_id: userMsg.room_id,
            p_author_id: user.id,
            p_payload: {
              attached: !!ventureContext,
              detail: ventureContext
                ? ventureContext.replace(/^VENTURE MEMORY:\s*/, '').replace(/\s+—\s+/, ', ')
                : undefined,
            },
          })
        } catch {
          // observability never breaks the send
        }

        // Safety net: normally userMsg.correlation is already set (send/route.ts
        // sets it at insert time), so this is a no-op. Only fires for rows that
        // predate that fix or if send's write somehow failed.
        if (!correlationPersisted) {
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
            repoUrl,
            repoGithubPat,
            // TS-018 WI-2 fix (2026-08-11): forward the dashboard's turn
            // correlation so Hermes reuses it instead of minting its own
            // (main.py used to always uuid4() a fresh one, completely
            // disconnected from everything else the turn emits — see
            // send/route.ts's header comment). Requires the matching VPS
            // change (main.py reads req.correlation) to be deployed.
            correlation: turnCorrelation,
          },
          cfg,
        )) {
          if (event.kind === 'done') {
            replyContent = event.response
            // Was hardcoded 'meta' regardless of who CLASSIFY actually
            // routed to — now the same effectiveAgentId used for context.
            replyAuthorId = effectiveAgentId || 'meta'
            replyAuthorName = effectiveAgentId || 'meta'

            // 2026-08-21: repo-files / live-preview links ("give me 2 URLs
            // whenever you work on something new"). event.repoChanged is
            // computed server-side in main.py from real git state
            // before/after the turn — never a self-reported marker. Only
            // fires once per ROOM (checked via chat_rooms.repo_links_shown_at,
            // migration chat_rooms_repo_links_shown_at), not every turn that
            // touches the repo — a long work session shouldn't repeat the
            // same two links every message.
            if (event.repoChanged && repoUrl) {
              try {
                const { data: roomFlag } = await supabase
                  .from('chat_rooms')
                  .select('repo_links_shown_at')
                  .eq('id', userMsg.room_id)
                  .single()
                const alreadyShown = !!(roomFlag as { repo_links_shown_at?: string | null } | null)?.repo_links_shown_at
                if (!alreadyShown) {
                  const preview = await ensureRepoPreview(workspace, cfg)
                  const filesLink = `[View repo files](/repo/${workspace})`
                  const previewLink = preview.ok
                    ? `[Live preview](https://${preview.previewHost}/)`
                    : `Live preview: not ready yet (${preview.error ?? 'unknown error'})`
                  replyContent = `${replyContent}\n\n---\n📁 ${filesLink} · 🔴 ${previewLink}`
                  await supabase
                    .from('chat_rooms')
                    .update({ repo_links_shown_at: new Date().toISOString() })
                    .eq('id', userMsg.room_id)
                }
              } catch {
                // Best-effort — never break the turn just because the links
                // couldn't be added (missing migration, VPS unreachable, etc).
              }
            }

            // 2026-08-21: automatic pool reset — see POOL_AUTO_RESET_TOTAL_TOKENS's
            // comment above for the real evidence behind this. Fires AFTER this
            // turn's own reply (never blocks or degrades the current response),
            // so the room's NEXT message gets a fresh, cheap pooled agent instead
            // of riding the same ballooning history until it hits the TPM ceiling.
            if ((event.usage?.totalTokens ?? 0) >= POOL_AUTO_RESET_TOTAL_TOKENS) {
              try {
                const drop = await dropPool(user.id, userMsg.room_id, cfg)
                if (drop.ok && drop.dropped) {
                  replyContent = `${replyContent}\n\n_(context reset — this conversation was getting close to the rate limit, so the next message starts fresh)_`
                }
              } catch {
                // Best-effort — never break the turn just because the reset failed.
              }
            }

            // Re-serialize with the (possibly link-augmented) final response
            // so the SAME turn's live view shows the links, not just a
            // reload later — augmenting replyContent after the raw event
            // was already sent would only affect what gets saved to the DB.
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ ...event, response: replyContent })}\n\n`),
            )
          } else if (event.kind === 'error') {
            replyContent = `[Hermes error] ${event.message}`
            replyAuthorId = 'system'
            replyAuthorName = 'system'
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
          } else {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
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
            p_correlation: turnCorrelation,
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
