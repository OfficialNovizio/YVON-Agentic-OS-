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
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { supabaseServer } from '@/lib/supabase-server'
import { streamHermesChat, hermesConfig, ensureRepoPreview, dropPool, type ActiveTaskPayload, type VerifyTaskPayload } from '@/lib/hermes-client'
import { getVentureGithubPatBySlug } from '@/lib/db/venture-graphify'
import { sendPush, type PushSubscriptionRow } from '@/lib/push-server'
import type { WorkspaceKey } from '@/lib/workspaces'
import { activeWorkspace } from '@/lib/workspaces'
import { errMsg } from '@/lib/errors'
import {
  createDesignSession,
  extractThinDesignSystem,
  findLatestSessionByRoom,
  readDesignSession,
  updateDesignSession,
  writeDesignMd,
  type BrandSuggestion,
  type ReferenceTaxonomy,
} from '@/lib/design-session'
import type { MotionNeed } from '@/lib/motion-brief'

// ── Re-engineer Phase 7 (2026-09-06): verify-fence types ───────────────────
// One verdict row per acceptance criterion (ref "WI-1:2" → set-acceptance's
// --wi/--i) and one per original user ask. Unknown statuses normalize to
// 'gap' — an unverifiable claim can never launder itself into 'aligned'.
export interface VerifyVerdict {
  ref: string
  status: 'aligned' | 'gap'
  evidence: string
}
export interface VerifyAskVerdict {
  ask: string
  status: 'aligned' | 'gap'
  evidence: string
}

/** Normalizes the fence's verdicts[]/asks[] rows: keeps only rows with the
 * key present, caps count, clamps text, coerces status. */
function normVerifyRows<T extends { status: 'aligned' | 'gap'; evidence: string }>(
  raw: unknown,
  key: 'ref' | 'ask',
  cap: number,
): T[] {
  return (Array.isArray(raw) ? raw : [])
    .filter((v): v is Record<string, unknown> => !!v && typeof v === 'object')
    .slice(0, cap)
    .map((v) => ({
      [key]: typeof v[key] === 'string' ? (v[key] as string).trim().slice(0, 400) : '',
      status: v.status === 'aligned' ? ('aligned' as const) : ('gap' as const),
      evidence: typeof v.evidence === 'string' ? v.evidence.trim().slice(0, 400) : '',
    }))
    .filter((v) => (v as Record<string, unknown>)[key]) as T[]
}

// ── Evidence rail fix ③ (2026-09-04): reference scrape helpers ──────────────
/** A "reference URL" is an external https URL the agent should study instead
 * of improvising. Internal/Private-range hosts are excluded — localhost
 * previews belong to the repo-links feature, not to scraping. */
function externalReferenceUrls(content: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const m of content.matchAll(/https?:\/\/[^\s<>()"']+/g)) {
    try {
      // Sentence punctuation glues onto a URL in prose ("see https://x.com/. "
      // or "for https://x.com/:"), and `new URL` keeps some of it as the
      // path — the stored reference then never equals the same URL mentioned
      // bare, which orphaned a session per follow-up turn (2026-09-07).
      // Strip before parsing; mirrors the wrapper's detect_reference_urls
      // rstrip.
      const raw = m[0].replace(/[.,;:!?)\]}…’”]+$/, '')
      if (!raw) continue
      const u = new URL(raw)
      if (u.protocol !== 'https:') continue
      const h = u.hostname
      if (
        h === 'localhost' ||
        h.endsWith('.local') ||
        h.endsWith('.internal') ||
        /^(127\.|10\.|192\.168\.|169\.254\.)/.test(h) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(h)
      ) {
        continue
      }
      // Dedupe by host+path (query strings differ per user session; the page
      // is the reference, not its tracking params).
      const key = `${u.hostname}${u.pathname.replace(/\/+$/, '')}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(u.toString())
    } catch {
      // not a URL — keep scanning
    }
    if (out.length >= 2) break
  }
  return out
}

/** Comparison form for "is this the room's live reference session" — trailing
 * punctuation and trailing slashes stripped so a colon-glued variant of the
 * URL ("for https://x.com/:") matches the bare one stored on the record. */
function normRefUrl(u: string): string {
  return u
    .trim()
    .replace(/[.,;:!?)\]}…’”]+$/, '')
    .replace(/\/+$/, '')
}

/** Evidence refs parsed out of a ```task-proposal block — mirrors the
 * artifacts[] field the [TASK PROPOSAL] prompt block now asks the agent for. */
interface ProposalArtifactRef {
  url: string
  label: string
  kind?: string
}

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

// ── Re-engineer Phase 6 (2026-09-05): the execution engine's feed ──────────
// A turn in an execution-unlocked room whose chat_rooms.execution_task_id is
// set carries the [ACTIVE TASK] payload: the REAL TASK-SPEC facts (read via
// cli/task.py list — task.py owns the only parser for its own YAML) plus the
// linked design session's design.md + routed recipe. Best-effort: any failure
// leaves activeTask undefined (the turn proceeds as an ordinary execution-room
// turn) and logs loudly — a degraded turn is never dressed up as a steered one.
const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')

interface TaskListRow {
  id: string
  status: string
  sourceMessage: string
  workItems?: {
    id?: string
    objective?: string
    produces?: string
    // task.py v3 emits per-criterion objects {text, status, evidence}; old
    // records may still carry flat strings — both handled where read.
    acceptance?: (string | { text?: string })[]
  }[]
  evidence?: { url?: string; label?: string; kind?: string }[]
  designSessionId?: string
  designHandoffPath?: string
}

async function loadActiveTask(taskId: string): Promise<ActiveTaskPayload | null> {
  if (!/^TS-\d+$/.test(taskId)) return null
  let rows: TaskListRow[]
  try {
    const { stdout } = await execFileAsync('python3', [path.join(REPO_ROOT, 'cli', 'task.py'), 'list'], {
      cwd: REPO_ROOT,
      timeout: 15_000,
      maxBuffer: 10 * 1024 * 1024,
    })
    rows = JSON.parse(stdout) as TaskListRow[]
  } catch (e) {
    console.error('[chat/stream] activeTask: task.py list failed:', errMsg(e))
    return null
  }
  const t = rows.find((r) => r.id === taskId)
  if (!t) {
    console.error('[chat/stream] activeTask: execution_task_id not found in task.py list:', taskId)
    return null
  }
  // Both acceptance shapes (v3 objects / legacy flat strings) collapse to the
  // criterion text — a dict repr in the builder's prompt checks nothing.
  const acceptanceText = (a: string | { text?: string }): string =>
    typeof a === 'string' ? a : (a?.text ?? '')
  const acceptance = (t.workItems ?? []).flatMap((w) => (w.acceptance ?? []).map(acceptanceText))
  const workItems = (t.workItems ?? []).map((w) => w.objective ?? '').filter(Boolean)
  let designMd: string | undefined
  let recipe: Record<string, unknown> | undefined
  // Design context rides only from a real reference-build session record —
  // the uuid guard keeps a hand-edited design_session_id from building paths.
  if (t.designSessionId && /^[a-f0-9-]{36}$/i.test(t.designSessionId)) {
    try {
      const mdPath = t.designHandoffPath
        ? path.join(REPO_ROOT, t.designHandoffPath)
        : path.join(REPO_ROOT, 'store', 'design-sessions', `${t.designSessionId}-design.md`)
      if (fs.existsSync(mdPath)) designMd = fs.readFileSync(mdPath, 'utf-8')
      const session = JSON.parse(
        fs.readFileSync(path.join(REPO_ROOT, 'store', 'design-sessions', `${t.designSessionId}.json`), 'utf-8'),
      ) as { kind?: string; recipe?: Record<string, unknown> }
      if (session?.kind === 'reference-build' && session.recipe) recipe = session.recipe
    } catch {
      // design context is enrichment — absent stays absent
    }
  }
  return {
    taskId: t.id,
    title: t.sourceMessage?.split('\n')[0]?.slice(0, 120) || t.id,
    sourceMessage: t.sourceMessage || '',
    acceptanceCriteria: acceptance,
    workItems,
    ...(designMd ? { designMd } : {}),
    ...(recipe ? { recipe } : {}),
  }
}

// ── Re-engineer Phase 7 (2026-09-06): the alignment loop's feed ────────────
// A verify turn (marker written by /api/chat/task-kickoff mode=verify) gets
// the [TASK VERIFY] payload: every acceptance criterion WITH its WI ref (so
// the verdict fence can cite exactly what it judged — set-acceptance needs
// the wi+index to record the verdict), the produced paths to inspect, and
// the evidence artifacts from the build turns. original_asks is injected by
// the caller (it needs the room's chat_messages, which live behind Supabase
// RLS in request scope).
async function loadVerifyTask(
  taskId: string,
): Promise<Omit<VerifyTaskPayload, 'originalAsks'> | null> {
  if (!/^TS-\d+$/.test(taskId)) return null
  let rows: TaskListRow[]
  try {
    const { stdout } = await execFileAsync('python3', [path.join(REPO_ROOT, 'cli', 'task.py'), 'list'], {
      cwd: REPO_ROOT,
      timeout: 15_000,
      maxBuffer: 10 * 1024 * 1024,
    })
    rows = JSON.parse(stdout) as TaskListRow[]
  } catch (e) {
    console.error('[chat/stream] verifyTask: task.py list failed:', errMsg(e))
    return null
  }
  const t = rows.find((r) => r.id === taskId)
  if (!t) {
    console.error('[chat/stream] verifyTask: task not found in task.py list:', taskId)
    return null
  }
  const acceptanceText = (a: string | { text?: string }): string =>
    typeof a === 'string' ? a : (a?.text ?? '')
  const criteria = (t.workItems ?? []).flatMap((w) =>
    (w.acceptance ?? [])
      .map(acceptanceText)
      .map((text, i) => ({ ref: `${w.id ?? 'WI'}:${i + 1}`, text }))
      .filter((c) => c.text),
  )
  const produces = (t.workItems ?? []).map((w) => w.produces ?? '').filter(Boolean)
  const evidenceUrls = (t.evidence ?? []).map((e) => e.url ?? '').filter((u) => u.startsWith('https://'))
  return {
    taskId: t.id,
    criteria,
    produces,
    ...(evidenceUrls.length ? { evidenceUrls } : {}),
  }
}

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
    .select('kind, department, execution_unlocked_at, execution_task_id')
    .eq('id', userMsg.room_id)
    .single()

  // Safety gate (2026-08-21, concern #5): a room only gets real repo/tool
  // access once its discussion has been explicitly converted into an
  // approved task — flipped by /api/chat/task-proposal 'accept' or
  // /api/chat/prd-proposal 'convert' (see chat_rooms_execution_gate
  // migration). Until then this stays discussion-only: repoUrl/repoGithubPat
  // are withheld below regardless of what the venture has configured, so
  // Hermes has no checkout to steer terminal/code_execution tools into.
  const executionUnlocked = !!(room as { execution_unlocked_at?: string | null } | null)?.execution_unlocked_at
  // FIX (2026-08-21, concern #1): forwarded to Hermes so real CAOS
  // retrieval/gates (main.py's _run_rag_pipeline_sync) can pass a
  // recognized department to rag/core/plan_lock.py's Rail-1 check —
  // undefined for department-less rooms (Workforce/whole_team, a thread).
  const roomDepartment = (room as { department?: string | null } | null)?.department ?? undefined
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

  // Gated versions actually forwarded to Hermes (see executionUnlocked above)
  // — repoUrl/repoGithubPat themselves stay ungated so the rest of this
  // route (e.g. the repo-links-shown logic below) still knows what the
  // venture has configured; only what reaches Hermes is restricted.
  const hermesRepoUrl = executionUnlocked ? repoUrl : undefined
  const hermesRepoGithubPat = executionUnlocked ? repoGithubPat : undefined

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

  // Re-engineer Phase 6: when this turn runs in a room whose execution gate
  // is open AND has an execution task, load the [ACTIVE TASK] payload so the
  // builder receives the TASK-SPEC + design.md + recipe on every turn (the
  // agent finally SEES the task it's executing — the engine is connected).
  const executionTaskId = (room as { execution_task_id?: string | null } | null)?.execution_task_id
  const activeTask = executionUnlocked && executionTaskId ? await loadActiveTask(executionTaskId) : undefined

  // Re-engineer Phase 7: verify-turn detection. The task-kickoff route (mode
  // 'verify') writes the marker into the message row — a server-written row,
  // the same trust level as execution_task_id itself. The payload still comes
  // from disk, never from the message text; the marker only says "this turn
  // is a verify turn". The room's own execution_task_id is authoritative for
  // WHICH task — a marker naming another task is ignored.
  const VERIFY_MARKER_RE = /^\[TASK VERIFY\] (TS-\d+)/
  const verifyMarker = (userMsg as { content?: string }).content?.match(VERIFY_MARKER_RE)
  let verifyTask: VerifyTaskPayload | undefined
  if (executionUnlocked && executionTaskId && verifyMarker) {
    const [vt, askRows] = await Promise.all([
      loadVerifyTask(executionTaskId),
      supabase
        .from('chat_messages')
        .select('content')
        .eq('room_id', userMsg.room_id)
        .eq('author_kind', 'user')
        .order('created_at', { ascending: true })
        .limit(40),
    ])
    if (vt) {
      // The verbatim asks: the room's user messages minus this pipeline's own
      // machinery messages (verify markers, fix-gap markers, kickoff
      // boilerplate) — the output is judged against what the user actually
      // typed, most recent 8.
      const MACHINERY_RE = /^(\[TASK VERIFY\]|\[TASK FIX\]|\[GATE DECISION\]|Motion decision:|Decision for reference|Brand suggestions reviewed|Start build on TS-\d+)/
      const originalAsks = ((askRows.data ?? []) as { content?: string }[])
        .map((r) => (r.content ?? '').trim())
        .filter((c) => c && !MACHINERY_RE.test(c))
        .map((c) => c.slice(0, 400))
        .slice(-8)
      verifyTask = { ...vt, originalAsks }
    }
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
      // Evidence rail fix ① (2026-09-04): the parsed task-proposal, hoisted
      // out of the try block below (same reason as turnContent) so the
      // post-try persist (task.proposed event row for rehydration) can read
      // it. Set inside the done branch; null when the reply had no (valid)
      // proposal block.
      let taskProposal: { title: string; summary: string; derivedFrom?: string; artifacts: ProposalArtifactRef[] } | null = null
      // Re-engineer Phase 2 (2026-09-05): the reference-build design session
      // opened below when this turn's message carries a reference URL.
      // Hoisted so the done branch (design-gate fence parse) and the artifact
      // passthrough (motion-profile.md URL capture) can reach it.
      let designSessionId: string | null = null
      // Fence-append fallback (2026-09-08): which gate that session is
      // waiting on, from the record's status — 'captured' → 'intent',
      // 'intent' → 'motion', anything else (motion recorded / briefed /
      // abandoned) → null, no gate pending. Forwarded to the wrapper so IT
      // can append the canonical fence when the model answers the gate in
      // prose and skips the fence (observed live; prose renders no card and
      // the flow stalls).
      let designGateStage: 'intent' | 'motion' | null = null
      // The session's reference URL, for URL-less gate turns: the fence-append
      // fallback on the wrapper needs a url for the intent fence payload, but
      // a "continue" turn doesn't mention the URL — carry the record's stored
      // one instead (2026-09-07).
      let designSessionReferenceUrl: string | null = null

      try {
        const content = userMsg.content ?? ''
        turnContent = content
        const mentions: string[] = Array.isArray(userMsg.mentions) ? userMsg.mentions : []

        // TS-027/TS-028: Input Analysis + Context, INLINED (no self-fetch —
        // the old NEXT_PUBLIC_SITE_URL fetch broke the pipeline events when the
        // env wasn't set / port differed, leaving the HUD on "waiting").
        const { analyzeMessage } = await import('@pipelines/input-analysis')
        const { resolveRoute } = await import('@pipelines/input-analysis/routing')
        const { skillDisclosureFor, ventureContextFor } = await import('@/lib/context-resolver')

        const analysis = await analyzeMessage(content)
        turnRelation = analysis.relation
        const tier = analysis.tier

        // 2026-09-04 — continuation-aware routing (agent stickiness). The
        // scorer in pipelines/input-analysis/routing.ts is per-message and
        // memoryless: the user's follow-up "yes i have a reference website
        // - <url>" matched zero keywords and fell to the meta fallback,
        // stealing the frame from the agent already answering. Now the room's
        // previous agent reply defines the conversation frame: zero/weak
        // keyword signals HOLD the previous agent; only a strong match
        // (score ≥ 2), a lapsed hold (idle > 30 min) or an explicit @mention
        // releases it. See routing.ts resolveRoute for the full rule table.
        let previousAgentId: string | null = null
        let previousAgentAt: string | null = null
        {
          const { data: prevRows } = await supabase
            .from('chat_messages')
            .select('author_id, created_at')
            .eq('room_id', userMsg.room_id)
            .eq('author_kind', 'agent')
            .order('created_at', { ascending: false })
            .limit(1)
          const prevRow = (prevRows as { author_id: string; created_at: string }[] | null)?.[0]
          previousAgentId = prevRow?.author_id ?? null
          previousAgentAt = prevRow?.created_at ?? null
        }
        const resolved = resolveRoute(
          {
            primary: analysis.targetAgents!.primary,
            team: analysis.targetAgents!.team,
            reason: analysis.targetAgents!.reason,
            scores: analysis.targetAgents!.scores ?? [],
          },
          {
            previousAgent: previousAgentId,
            previousAt: previousAgentAt,
            // FIX (2026-09-11): pass the text so the continuation-only rule can
            // fire. Without it "convert to task" looked like a fresh request and
            // the scorer handed an in-flight web-clone from mia to lena.
            message: content,
          },
        )
        analysis.targetAgents = {
          ...analysis.targetAgents!,
          primary: resolved.primary,
          reason: resolved.resolution,
          sticky: resolved.sticky,
          previousAgent: previousAgentId,
          resolution: resolved.resolution,
        }
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
          } catch (emitErr) {
            // observability never breaks the send — but it must not die
            // silently either (failure-matrix row 21): a dead emit shows up as
            // phantom panel state, so the failure goes to the server log.
            console.error('[chat/stream] observability emit failed:', emitErr instanceof Error ? emitErr.message : emitErr)
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
          } catch (emitErr) {
            // observability never breaks the send — but it must not die
            // silently either (failure-matrix row 21): a dead emit shows up as
            // phantom panel state, so the failure goes to the server log.
            console.error('[chat/stream] observability emit failed:', emitErr instanceof Error ? emitErr.message : emitErr)
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
        // the continuation-resolved primary (stickiness may hold the previous
        // agent against a weak scorer signal — see resolveRoute above).
        // Previously targetAgents was computed and shown on the HUD but never
        // consumed here — Hermes got no identity unless the user typed
        // @agent, so it answered as itself instead of the routed agent
        // (2026-08-11 fix). Identity is cheap (one skills-roster block), so
        // it's injected regardless of relation; venture memory stays gated
        // to relation === 'venture' since that's genuinely project-specific
        // and general chat shouldn't pull it in (TS-029).
        const effectiveAgentId = mentions[0] ?? analysis.targetAgents?.primary ?? ''
        const agentSwitched = !!previousAgentId && effectiveAgentId !== previousAgentId
        let agentContext: string | undefined
        let ventureContext: string | undefined
        if (effectiveAgentId) {
          // TS-027/CAOS phase 02 (2026-08-11): real progressive-disclosure
          // skill matching, not just a flat list — see lib/context-resolver.ts
          // for why the match logic differs from rag/harness/disclosure.py's
          // (that one's trigger-heading parsing never matches real files).
          const { prompt, disclosure } = await skillDisclosureFor(effectiveAgentId, content)
          agentContext = prompt ?? undefined
          // Concern #5: tool access is withheld below (hermesRepoUrl), but
          // the agent itself still needs to know NOT to promise/describe
          // work as already done — tell it plainly so it discusses and
          // proposes instead of narrating actions it can't actually take.
          if (repoUrl && !executionUnlocked) {
            const lockNotice =
              'NOTE: this chat has not been converted into an approved task yet, so ' +
              'you do NOT have file/terminal/repo access this turn. Discuss the ' +
              'request, ask clarifying questions, and propose a plan in words only ' +
              '— never claim to have made, committed, or run anything. If real work ' +
              'is warranted, tell the user to approve this as a task (or click the ' +
              'task-proposal prompt) before any code changes can happen.'
            agentContext = agentContext ? `${agentContext}\n\n${lockNotice}` : lockNotice
          }
          // 2026-09-04 — handover context. The Hermes pool keys conversation
          // state per (user_id, room_id) PER AGENT, so an agent switch used
          // to drop the new agent into an empty pool: it re-asked for the
          // URL the user had already given two messages ago, because from
          // its side the conversation had never happened. When the frame
          // changes hands, carry the recent thread with it.
          if (agentSwitched) {
            const { data: recentRows } = await supabase
              .from('chat_messages')
              .select('author_kind, author_name, content')
              .eq('room_id', userMsg.room_id)
              .order('created_at', { ascending: false })
              .limit(10)
            const recent = ((recentRows as { author_kind: string; author_name: string; content: string }[] | null) ?? [])
              .reverse()
              .map((m) => `${m.author_kind === 'user' ? 'user' : m.author_name || 'agent'}: ${(m.content ?? '').slice(0, 300)}`)
              .join('\n')
            const handover =
              `[HANDOVER — you are taking over this conversation from @${previousAgentId}. ` +
              'What was established so far, so you do NOT re-ask for anything already provided:\n' +
              recent +
              '\nContinue from this context; answer the latest message.]\n'
            agentContext = agentContext ? `${agentContext}\n\n${handover}` : handover
          }
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
            } catch (emitErr) {
              // observability never breaks the send — but it must not die
              // silently either (failure-matrix row 21).
              console.error('[chat/stream] observability emit failed:', emitErr instanceof Error ? emitErr.message : emitErr)
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
        } catch (emitErr) {
          // observability never breaks the send — but it must not die
          // silently either (failure-matrix row 21).
          console.error('[chat/stream] observability emit failed:', emitErr instanceof Error ? emitErr.message : emitErr)
        }

        // Concern #5: tell the user plainly, in the live event feed, that
        // this turn is discussion-only — not a silent restriction. Only
        // fires when there's actually a repo that WOULD have been forwarded
        // if this room were unlocked, so a venture with no repo configured
        // (nothing to gate) stays quiet.
        if (repoUrl && !executionUnlocked) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                kind: 'notice',
                level: 'info',
                message: 'Discussion only — this chat has no repo/file access yet. Approve it as a task to let an agent actually make changes.',
                correlation: turnCorrelation,
              })}\n\n`,
            ),
          )
        }

        // ── Evidence rail fix ③ (2026-09-04, REWIRED 2026-09-05) ──────────────
        // Reference scraping is AGENT-SIDE: the agent runs `agent-reach read
        // <url>` via its terminal tool (Jina Reader — sidesteps the Akamai 403
        // brunellocucinelli.com gives the VPS) and saves the result with
        // save_artifact, so the scrape produces real evidence cards instead of
        // a hidden context block. reference_url is still forwarded so the
        // wrapper can name the reference explicitly.
        const refUrls = externalReferenceUrls(content)
        const referenceContext: string | undefined = undefined
        if (refUrls.length > 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                kind: 'notice',
                level: 'info',
                message: `Reference URL detected — the agent will scrape ${refUrls[0]}${refUrls.length > 1 ? ` (+${refUrls.length - 1} more)` : ''} with its own tools (agent-reach) and save the evidence.`,
                correlation: turnCorrelation,
              })}\n\n`,
            ),
          )
          // Re-engineer Phase 2 (2026-09-05): open the design session for this
          // reference and hand its id to the wrapper. The wrapper injects the
          // [DESIGN GATE] contract ONLY when a session id is present, and the
          // agent only emits the intent gate when that contract is in its
          // prompt — so an incidental URL in a message ("check this bug
          // report …") never surfaces a gate card unless the turn actually
          // becomes a reference build. Failure to create the record is loud
          // here but never fatal to the turn: the wrapper falls back to the
          // free-text clone-or-adapt question.
          try {
            // Live-E2E fix (2026-09-06): a gate follow-up turn ("Design
            // decision recorded — <changes> for <reference url>…")
            // re-mentions the reference URL, which used to open a SECOND
            // session here and orphan the first. The gate stage machine
            // lived in the orphaned record while the agent saw a fresh
            // 'captured' session — so the motion brief never presented and
            // the chain jumped straight to task.proposed. Reuse the room's
            // live session (same reference, not abandoned) instead; only a
            // genuinely new reference or an abandoned prior session opens a
            // fresh record.
            const existingSession = await findLatestSessionByRoom(userMsg.room_id)
            if (
              existingSession &&
              existingSession.status !== 'abandoned' &&
              normRefUrl(existingSession.reference?.url ?? '') === normRefUrl(refUrls[0])
            ) {
              designSessionId = existingSession.id
              designSessionReferenceUrl = refUrls[0]
              designGateStage =
                existingSession.status === 'captured'
                  ? 'intent'
                  : existingSession.status === 'intent'
                    ? 'motion'
                    : null
              await updateDesignSession(
                existingSession.id,
                {},
                'session_reused',
                `a follow-up turn re-mentioned ${refUrls[0]} — continued the live gate chain instead of opening a second session`,
              )
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    kind: 'design.session',
                    sessionId: existingSession.id,
                    referenceUrl: refUrls[0],
                    correlation: turnCorrelation,
                  })}\n\n`,
                ),
              )
            } else {
              const session = await createDesignSession({
                roomId: userMsg.room_id,
                referenceUrl: refUrls[0],
                venture: workspace,
                correlation: turnCorrelation,
              })
              designSessionId = session.id
              designSessionReferenceUrl = refUrls[0]
              // A fresh record starts 'captured' — the intent gate is pending.
              designGateStage = 'intent'
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    kind: 'design.session',
                    sessionId: session.id,
                    referenceUrl: refUrls[0],
                    correlation: turnCorrelation,
                  })}\n\n`,
                ),
              )
            }
          } catch (sessionErr) {
            console.error(
              '[chat/stream] design session creation failed:',
              sessionErr instanceof Error ? sessionErr.message : sessionErr,
            )
          }
        } else {
          // Live-E2E fix (2026-09-06), second half: the gate chain spans
          // several turns and the user will NOT repeat the reference URL in
          // each one ("present the motion brief", "adapt it differently").
          // A URL-less turn used to hand the wrapper NO session id, so the
          // [DESIGN GATE] contract vanished from the prompt and the agent
          // freelanced prose instead of the stage fence. Continue the
          // room's live session (same reference, gates still open) on these
          // turns; the contract is status-aware (briefed → "BOTH GATES
          // ANSWERED: proceed …; emit no further gates"), so a briefed
          // session stays injected — that is the turn the design study is
          // presented and the build proposed. Only 'abandoned' (user
          // dismissed it) drops the contract. Live-E2E correction
          // 2026-09-06: the earlier 'briefed' exclusion stripped the gate
          // context from the proposal turn itself.
          try {
            const liveSession = await findLatestSessionByRoom(userMsg.room_id)
            if (liveSession && liveSession.status !== 'abandoned' && liveSession.reference?.url) {
              designSessionId = liveSession.id
              designSessionReferenceUrl = liveSession.reference.url
              designGateStage =
                liveSession.status === 'captured'
                  ? 'intent'
                  : liveSession.status === 'intent'
                    ? 'motion'
                    : null
            }
          } catch (reuseErr) {
            console.error(
              '[chat/stream] design session reuse lookup failed:',
              reuseErr instanceof Error ? reuseErr.message : reuseErr,
            )
          }
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

        // One parsed task-proposal per turn — set inside the done branch
        // (evidence rail fix ①) into the hoisted `taskProposal` above.
        for await (const event of streamHermesChat(
          {
            message: content,
            userId: user.id,
            roomId: userMsg.room_id,
            workspace,
            mentions,
            department: roomDepartment,
            // FIX (2026-08-22, cost teardown Cause 01): forward the tier we
            // already computed so Hermes can cap its tool loop per tier
            // instead of giving every turn a 30-iteration budget.
            tier: analysis.tier,
            agentContext,
            ventureContext,
            inputAnalysis: inputAnalysis ?? undefined,
            repoUrl: hermesRepoUrl,
            // 2026-09-04 (repo-link false-negative fix): when the venture HAS
            // a repo but the execution gate is closed, tell Hermes that via
            // repoGatedUrl — otherwise main.py's else-branch injects its
            // "No repo is linked to this venture yet" prompt block and the
            // agent tells the user exactly that falsehood, even though the
            // URL is visible in Settings. Needs the matching main.py field
            // deployed to take effect.
            repoGatedUrl: !executionUnlocked ? repoUrl : undefined,
            repoGithubPat: hermesRepoGithubPat,
            // Evidence rail fix ③ REWIRE (2026-09-05): the dashboard no longer
            // pre-scrapes (agent-reach covers it key-free from the VPS; Apify
            // was decommissioned 2026-09-07). referenceContext is permanently
            // undefined — the wrapper's [REFERENCE — DASHBOARD-SCRAPED CONTENT]
            // block is dead code that stays harmless if ever set again.
            referenceContext,
            // Re-engineer Phase 2 (2026-09-05): the wrapper injects the
            // [DESIGN GATE] contract only when a design session id is
            // present. Undefined here means "turn without a reference URL"
            // or "record creation failed" — both fall back to the wrapper's
            // free-text gate. Requires the matching main.py field deployed.
            designSessionId: designSessionId ?? undefined,
            // Fence-append fallback stage (2026-09-08) — see designGateStage
            // above. Requires the matching main.py field deployed.
            designGateStage: designGateStage ?? undefined,
            // The session's stored reference URL — covers URL-less gate turns
            // ("continue"), where the wrapper's fence-append fallback needs a
            // url for the intent fence but the message doesn't carry one.
            referenceUrl: designSessionReferenceUrl ?? undefined,
            // Re-engineer Phase 6: the executing TASK-SPEC + design context
            // (undefined outside execution rooms — ordinary turns unaffected).
            activeTask: activeTask ?? undefined,
            // Re-engineer Phase 7: the verify turn's contract (undefined on
            // build/ordinary turns). Requires the matching main.py field.
            verifyTask: verifyTask ?? undefined,
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
            // hermesRepoUrl (not repoUrl) — repoChanged can only be true if
            // Hermes actually had repo access this turn, i.e. the room was
            // unlocked; guarding on the gated value keeps that explicit
            // rather than relying on Hermes never touching a repo it wasn't
            // given.
            if (event.repoChanged && hermesRepoUrl) {
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
                  // http:// until a wildcard TLS cert exists for *.preview.yvon.in —
                  // the nginx preview vhost serves on port 80 (see preview-yvon.conf).
                  const previewLink = preview.ok
                    ? `[Live preview](http://${preview.previewHost}/)`
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

            // ── Evidence rail fix ① (2026-09-04): task-proposal handling moved
            // INTO the done branch. Previously this strip+parse+emit ran AFTER
            // the stream loop, so the `task.proposed` SSE frame was enqueued
            // AFTER `done` — and the browser reader loop breaks on `done`
            // (page.tsx) — meaning no proposal frame ever reached a live
            // client (0 task.proposed rows in the events table, all-time). The
            // forwarded done frame also still carried the raw
            // ```task-proposal fence, which the live token stream rendered as
            // literal text (MessageStream renders tokens verbatim). Now:
            // strip → parse → emit task.proposed → forward done. Wire order:
            // …tokens → task.proposed → done.
            const PROPOSAL_RE = /```task-proposal[ \t]*\r?\n([\s\S]*?)(?:```|$)/
            const proposalMatch = replyContent.match(PROPOSAL_RE)
            if (proposalMatch) {
              replyContent = replyContent.replace(PROPOSAL_RE, '').trim()
              const raw = proposalMatch[1].trim()
              try {
                const parsed = JSON.parse(raw) as Record<string, unknown>
                if (typeof parsed.title === 'string' && typeof parsed.summary === 'string') {
                  taskProposal = {
                    title: parsed.title.slice(0, 200),
                    summary: parsed.summary.slice(0, 800),
                    // Re-engineer Phase 8: follow-on builds (continue-to-backend)
                    // declare the task that made them possible — task.py's
                    // derived_from, NOT revision_of (a different goal, not a
                    // superseding attempt). Absent/invalid → undefined; every
                    // existing consumer ignores it.
                    derivedFrom:
                      typeof parsed.derivedFrom === 'string' && /^TS-\d+$/.test(parsed.derivedFrom)
                        ? parsed.derivedFrom
                        : undefined,
                    artifacts: Array.isArray(parsed.artifacts)
                      ? (parsed.artifacts as Record<string, unknown>[])
                          .filter((a) => a && typeof a.url === 'string')
                          .slice(0, 12)
                          .map((a) => ({
                            url: String(a.url),
                            label:
                              typeof a.label === 'string' && a.label
                                ? a.label.slice(0, 120)
                                : String(a.url).split('/').pop() || 'artifact',
                            kind: typeof a.kind === 'string' ? a.kind.slice(0, 20) : undefined,
                          }))
                      : [],
                  }
                } else {
                  throw new Error('missing title/summary strings')
                }
              } catch (parseErr) {
                // Loud, not silent (the old code hid every malformed block —
                // bug A in the research diagnosis). The fence is gone from the
                // reply either way, but the operator sees WHY no proposal card
                // appeared.
                console.error(
                  '[chat/stream] malformed task-proposal block:',
                  parseErr instanceof Error ? parseErr.message : parseErr,
                  'raw:',
                  raw.slice(0, 300),
                )
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      kind: 'notice',
                      level: 'warn',
                      message: 'Task proposal was offered but its JSON block was malformed — no proposal card can be shown.',
                      correlation: turnCorrelation,
                    })}\n\n`,
                  ),
                )
              }
            }

            if (taskProposal) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    kind: 'task.proposed',
                    title: taskProposal.title,
                    summary: taskProposal.summary,
                    ...(taskProposal.derivedFrom ? { derivedFrom: taskProposal.derivedFrom } : {}),
                    artifacts: taskProposal.artifacts,
                    correlation: turnCorrelation,
                  })}\n\n`,
                ),
              )
            }

            // ── Re-engineer Phase 2+3 (2026-09-05): design-gate fence ──────
            // The [DESIGN GATE] contract (main.py) makes the agent end a
            // reference turn with a machine-parseable gate instead of a
            // free-text question — stage "intent" (clone vs adapt) or, after
            // intent is answered, stage "motion" (the observed needs the
            // video-vs-code brief compares). Same strip→parse→emit
            // discipline as the proposal block above: the fence leaves the
            // reply, the card frame is enqueued BEFORE done (the browser
            // reader breaks on done — the exact bug evidence-rail fix ①
            // cured for task.proposed). One gate per turn, and it only
            // becomes a card when its sessionId matches the session THIS
            // turn opened — a mismatched or fabricated id never renders a
            // card or touches another record. Wire order:
            // …tokens → task.proposed → design.gate → done.
            const DESIGN_GATE_RE = /```design-gate[ \t]*\r?\n([\s\S]*?)(?:```|$)/
            const gateMatch = replyContent.match(DESIGN_GATE_RE)
            if (gateMatch) {
              replyContent = replyContent.replace(DESIGN_GATE_RE, '').trim()
              let gatePayload:
                | {
                    stage: 'intent'
                    sessionId: string
                    reference: { url?: string; taxonomy?: string; motionSummary?: string }
                  }
                | {
                    stage: 'motion'
                    sessionId: string
                    needs: MotionNeed[]
                  }
                  | {
                      stage: 'brand'
                      sessionId: string
                      suggestions: BrandSuggestion[]
                    }
                // Re-engineer Phase 7: the alignment loop's verdict fence —
                // keyed on taskId (verify turns happen in gated rooms, with
                // or without a design session), not sessionId.
                | {
                    stage: 'verify'
                    taskId: string
                    verdicts: VerifyVerdict[]
                    asks: VerifyAskVerdict[]
                    summary: string
                  }
                | null = null
              try {
                const parsed = JSON.parse(gateMatch[1].trim()) as Record<string, unknown>
                if (parsed.stage === 'verify') {
                  // Phase 7: no sessionId — the fence must name the task the
                  // ROOM has gated (checked below), not a session id.
                  if (typeof parsed.taskId !== 'string' || !/^TS-\d+$/.test(parsed.taskId)) {
                    throw new Error('verify gate missing/invalid taskId')
                  }
                  gatePayload = {
                    stage: 'verify',
                    taskId: parsed.taskId,
                    verdicts: normVerifyRows<VerifyVerdict>(parsed.verdicts, 'ref', 24),
                    asks: normVerifyRows<VerifyAskVerdict>(parsed.asks, 'ask', 12),
                    summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 1000) : '',
                  }
                } else {
                // FIX (2026-09-08): take the UUID out of the string instead of
                // trusting it verbatim — a model-emitted fence with a stray
                // leading/trailing (or zero-width) char compared unequal to
                // the route's session id, the gate was silently dropped as a
                // "mismatch", and the console printed two identical-looking
                // ids. Matching the UUID shape recovers the id and keeps the
                // === check meaningful.
                const sidMatch = typeof parsed.sessionId === 'string'
                  ? parsed.sessionId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
                  : null
                if (!sidMatch) {
                  throw new Error('missing/invalid sessionId')
                }
                const gateSessionId = sidMatch[0]
                if (parsed.stage === 'intent') {
                  const refObj = (parsed.reference ?? null) as Record<string, unknown> | null
                  if (!refObj || typeof refObj !== 'object') {
                    throw new Error('intent gate missing reference')
                  }
                  gatePayload = {
                    stage: 'intent',
                    sessionId: gateSessionId,
                    reference: {
                      ...(typeof refObj.url === 'string' && refObj.url
                        ? { url: refObj.url }
                        : {}),
                      ...(typeof refObj.taxonomy === 'string' && refObj.taxonomy
                        ? { taxonomy: refObj.taxonomy }
                        : {}),
                      ...(typeof refObj.motionSummary === 'string' && refObj.motionSummary
                        ? { motionSummary: refObj.motionSummary }
                        : {}),
                    },
                  }
                } else if (parsed.stage === 'motion') {
                  if (!Array.isArray(parsed.needs)) {
                    throw new Error('motion gate missing needs[]')
                  }
                  const BEST_PATHS = ['video', 'code', 'either']
                  gatePayload = {
                    stage: 'motion',
                    sessionId: gateSessionId,
                    needs: (parsed.needs as Record<string, unknown>[])
                      .filter((n) => n && typeof n === 'object')
                      .slice(0, 8)
                      .map((n) => ({
                        ...(typeof n.need === 'string' && n.need ? { need: n.need.slice(0, 120) } : {}),
                        ...(typeof n.reference === 'string' && n.reference ? { reference: n.reference.slice(0, 200) } : {}),
                        ...(typeof n.bestPath === 'string' && BEST_PATHS.includes(n.bestPath)
                          ? { bestPath: n.bestPath as 'video' | 'code' | 'either' }
                          : {}),
                        ...(typeof n.why === 'string' && n.why ? { why: n.why.slice(0, 200) } : {}),
                      }))
                      .filter((n) => n.need),
                  }
                } else if (parsed.stage === 'brand') {
                  if (!Array.isArray(parsed.suggestions)) {
                    throw new Error('brand gate missing suggestions[]')
                  }
                  const brandSuggestions = (parsed.suggestions as Record<string, unknown>[])
                    .filter((sg) => sg && typeof sg === 'object')
                    .slice(0, 6)
                    .filter((sg) => typeof sg.title === 'string' && sg.title)
                    .map((sg) => ({
                      title: (sg.title as string).slice(0, 80),
                      text: typeof sg.text === 'string' ? sg.text.slice(0, 300) : '',
                      why: typeof sg.why === 'string' ? sg.why.slice(0, 300) : '',
                    }))
                  if (brandSuggestions.length === 0) {
                    throw new Error('brand gate suggestions[] empty')
                  }
                  gatePayload = {
                    stage: 'brand',
                    sessionId: gateSessionId,
                    suggestions: brandSuggestions,
                  }
                } else {
                  throw new Error(`unknown gate stage: ${String(parsed.stage)}`)
                }
                }
              } catch (parseErr) {
                // Loud, not silent — same discipline as the proposal parser.
                console.error(
                  '[chat/stream] malformed design-gate block:',
                  parseErr instanceof Error ? parseErr.message : parseErr,
                  'raw:',
                  gateMatch[1].trim().slice(0, 300),
                )
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      kind: 'notice',
                      level: 'warn',
                      message: 'A design gate was offered but its JSON block was malformed — no gate card can be shown.',
                      correlation: turnCorrelation,
                    })}\n\n`,
                  ),
                )
              }
              if (gatePayload) {
                if (gatePayload.stage === 'verify') {
                  // Phase 7: the verdict fence becomes the design.verify
                  // frame (before done — the browser reader breaks on done).
                  // Same safety discipline as the session gates: the fence
                  // must name the task THIS room has gated — anything else
                  // is ignored loudly, never rendered.
                  if (executionTaskId && gatePayload.taskId === executionTaskId) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          kind: 'design.verify',
                          taskId: gatePayload.taskId,
                          verdicts: gatePayload.verdicts,
                          asks: gatePayload.asks,
                          summary: gatePayload.summary,
                          correlation: turnCorrelation,
                        })}\n\n`,
                      ),
                    )
                  } else {
                    console.error(
                      '[chat/stream] verify gate taskId mismatch:',
                      gatePayload.taskId,
                      'expected:',
                      executionTaskId,
                    )
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          kind: 'notice',
                          level: 'warn',
                          message: 'The agent returned a verify verdict for a different task than this room has gated — ignored as a safety check.',
                          correlation: turnCorrelation,
                        })}\n\n`,
                      ),
                    )
                  }
                } else if (
                  gatePayload.sessionId === designSessionId &&
                  (await readDesignSession(gatePayload.sessionId))
                ) {
                  if (gatePayload.stage === 'intent') {
                    // Fold what the agent observed (taxonomy + motion summary,
                    // from the motion profile it was shown) into the session.
                    // Only defined fields land — an undefined value in the
                    // spread would erase the existing one.
                    const refPatch: {
                      url?: string
                      taxonomy?: ReferenceTaxonomy
                      motionSummary?: string
                    } = {}
                    if (gatePayload.reference.url) refPatch.url = gatePayload.reference.url
                    if (gatePayload.reference.motionSummary) {
                      refPatch.motionSummary = gatePayload.reference.motionSummary
                    }
                    const tax = gatePayload.reference.taxonomy
                    if (
                      tax &&
                      ['static-editorial', 'motion-marketing', 'video-led', 'immersive-3d', 'dashboard', 'unknown'].includes(tax)
                    ) {
                      refPatch.taxonomy = tax as ReferenceTaxonomy
                    }
                    void updateDesignSession(
                      gatePayload.sessionId,
                      { reference: refPatch },
                      'intent_gate_emitted',
                      refPatch.taxonomy ?? refPatch.motionSummary ?? undefined,
                    ).catch(() => {})
                  } else if (gatePayload.stage === 'motion') {
                    void updateDesignSession(
                      gatePayload.sessionId,
                      {},
                      'motion_gate_emitted',
                      `${gatePayload.needs.length} observed motion need(s)`,
                    ).catch(() => {})
                  } else {
                    // Gate 3: suggestions land on the record immediately; the
                    // card POST (action 'brand') records the adoptions.
                    void updateDesignSession(
                      gatePayload.sessionId,
                      { suggestions: gatePayload.suggestions },
                      'brand_gate_emitted',
                      gatePayload.suggestions.map((sg) => sg.title).join(' | '),
                    ).catch(() => {})
                  }
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        kind: 'design.gate',
                        stage: gatePayload.stage,
                        sessionId: gatePayload.sessionId,
                        ...(gatePayload.stage === 'intent'
                          ? { reference: gatePayload.reference }
                          : gatePayload.stage === 'motion'
                            ? { needs: gatePayload.needs }
                            : { suggestions: gatePayload.suggestions }),
                        correlation: turnCorrelation,
                      })}\n\n`,
                    ),
                  )
                } else {
                  console.error(
                    '[chat/stream] design-gate sessionId mismatch:',
                    gatePayload.sessionId,
                    'expected:',
                    designSessionId,
                  )
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        kind: 'notice',
                        level: 'warn',
                        message: 'The agent offered a design gate for a session this turn did not open — ignored as a safety check.',
                        correlation: turnCorrelation,
                      })}\n\n`,
                    ),
                  )
                }
              }
            }

            // Re-serialize with the (possibly link-augmented, fence-stripped)
            // final response so the SAME turn's live view matches what gets
            // persisted — augmenting replyContent after the raw event was
            // already sent would only affect what gets saved to the DB.
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ ...event, response: replyContent })}\n\n`),
            )
          } else if (event.kind === 'error') {
            replyContent = `[Hermes error] ${event.message}`
            replyAuthorId = 'system'
            replyAuthorName = 'system'
            let outgoing: typeof event = event

            // CORRECTION (2026-08-21, second pass): the reasoning below was
            // wrong about the CAUSE, though the reset itself is a harmless
            // backstop and stays. "Used 143383, Requested 75716" is not a
            // room carrying too much history — `Requested` is ONE call, and
            // at ~76k per call a 200k/min ceiling affords only two of them,
            // so any turn needing three round-trips died regardless of how
            // clean the room was. That is a RATE problem, and it is now
            // fixed where it belongs: main.py's TPM governor paces outbound
            // calls against a rolling 60s ledger. Dropping the pool here
            // neither caused nor cured it — keep it, but do not read the
            // note below as an explanation.
            //
            // 2026-08-21 fix: the auto-reset above only ever ran on a
            // SUCCESSFUL turn (event.kind === 'done'), because that's the
            // only place main.py attaches usage.totalTokens. But a room
            // whose pooled history is ALREADY too big can fail with a rate
            // limit INSIDE the turn's own multi-call tool loop — before any
            // 'done' event ever fires — so the reset above never ran, and
            // every retry kept hitting the same oversized history forever
            // (confirmed live: "Used 143383, Requested 75716" on a turn
            // that never got a usage figure to check against 130k). Detect
            // a rate-limit failure by message text and force the same
            // pool-drop here, unconditionally — there's no token count to
            // gate on this path, so any rate-limit error is reason enough.
            if (/rate limit|tokens per min|\bTPM\b/i.test(event.message)) {
              try {
                const drop = await dropPool(user.id, userMsg.room_id, cfg)
                if (drop.ok && drop.dropped) {
                  const resetMsg = `${event.message}\n\n(This room's agent was reset. Note the real cause is the AI account's per-minute token ceiling, not this room — Hermes now paces its own calls to stay under it, so a retry should go through, just more slowly on long tasks.)`
                  replyContent = `[Hermes error] ${resetMsg}`
                  outgoing = { ...event, message: resetMsg }
                }
              } catch {
                // Best-effort — never break error reporting just because the reset failed.
              }
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(outgoing)}\n\n`))
          } else {
            // Re-engineer Phase 2 (2026-09-05): the motion probe's evidence
            // card flowing past (generic artifact frame) carries the
            // published motion-profile.md URL — fold it into the session so
            // design.md (Phase 4) can cite the probe's actual output.
            // Fire-and-forget: the frame itself must not wait on disk.
            if (
              designSessionId &&
              event.kind === 'artifact' &&
              event.url.includes('motion-profile')
            ) {
              void updateDesignSession(
                designSessionId,
                { reference: { motionProfileUrl: event.url } },
                'motion_profile_published',
                event.url,
              ).catch(() => {})
            }

            // Stealth-browser capture relay landed (2026-09-07): measured
            // facts go on the session record so design.md can cite them —
            // fire-and-forget, the frame itself must not wait on disk.
            if (
              designSessionId &&
              event.kind === 'capture.done' &&
              typeof event.url === 'string' &&
              event.url
            ) {
              // Stealth-browser capture relay landed: measured facts go on the
              // session record (design.md cites them) - fire-and-forget, the
              // frame itself must not wait on disk.
              const capSum = (event.summary ?? null) as Record<string, string | number> | null
              const capUrl: string = typeof event.url === 'string' ? event.url : ''
              const dsid: string = designSessionId
              void updateDesignSession(
                designSessionId,
                {
                  capture: {
                    url: capUrl,
                    out: typeof event.out === 'string' ? event.out : '',
                    ...(typeof event.previewUrl === 'string' && event.previewUrl
                      ? { previewUrl: event.previewUrl }
                      : {}),
                    ...(typeof event.reportUrl === 'string' && event.reportUrl
                      ? { reportUrl: event.reportUrl }
                      : {}),
                    ...(typeof event.seconds === 'number' ? { seconds: event.seconds } : {}),
                    ...(capSum ? { summary: capSum } : {}),
                    capturedAt: new Date().toISOString(),
                  },
                },
                'capture_completed',
                `${event.out ?? ''} - round trip ${event.seconds ?? '?'}s`,
              )
                .then(async (updated) => {
                  // 2026-09-08: chain the thin design-system extraction —
                  // inventory.json lives next to the capture preview, and a
                  // fresh session's design.md should be measured-not-empty.
                  // Skips when a deep analysis is already on the record, and
                  // never clobbers one.
                  const prevUrl = typeof event.previewUrl === 'string' ? event.previewUrl : ''
                  const invUrl = prevUrl.replace(/reference\.html$/, 'inventory.json')
                  if (!updated || updated.designSystem || !invUrl.endsWith('inventory.json')) return
                  const thin = await extractThinDesignSystem(invUrl, capUrl)
                  if (!thin) return
                  const withFacts = await updateDesignSession(
                    dsid,
                    { designSystem: thin },
                    'design_system_thin_extracted',
                    invUrl,
                  )
                  if (withFacts) await writeDesignMd(withFacts)
                })
                .catch(() => {})
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
          }
        }
      } catch (e) {
        let msg = `[Hermes error] ${errMsg(e)}`
        // Same rate-limit reset as the in-stream 'error' branch above — a
        // rate-limit failure can also surface as a thrown exception here
        // (e.g. the whole HTTP call to Hermes failing) rather than a clean
        // SSE 'error' event, so the same forced pool-drop applies.
        if (/rate limit|tokens per min|\bTPM\b/i.test(msg)) {
          try {
            const drop = await dropPool(user.id, userMsg.room_id, cfg)
            if (drop.ok && drop.dropped) {
              msg = `${msg}\n\n(This room's agent was reset. Note the real cause is the AI account's per-minute token ceiling, not this room — Hermes now paces its own calls to stay under it, so a retry should go through, just more slowly on long tasks.)`
            }
          } catch {
            // Best-effort — never break error reporting just because the reset failed.
          }
        }
        replyContent = msg
        replyAuthorId = 'system'
        replyAuthorName = 'system'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ kind: 'error', message: msg })}\n\n`),
        )
      }

      // ── Task-proposal marker (2026-08-11, restructured 2026-09-04 — fix ①) ──
      // Strip + parse + live SSE emit happen INSIDE the done branch above
      // (wire order: …tokens → task.proposed → done). What remains here is
      // the observability write: the persisted `task.proposed` event row that
      // rehydration (GET /api/chat/task-proposal?roomId=) reads on reload.
      // Malformed blocks are never fabricated into a fake proposal — but the
      // failure is now LOUD (done-branch console.error + warn notice), not
      // silent.
      if (taskProposal) {
        try {
          await (supabase as unknown as {
            rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
          }).rpc('chat_emit_task_proposal_event', {
            p_context_id: workspace,
            p_correlation: turnCorrelation,
            p_room_id: userMsg.room_id,
            p_author_id: replyAuthorId,
            p_payload: { title: taskProposal.title, summary: taskProposal.summary, artifacts: taskProposal.artifacts },
            p_kind: 'task.proposed',
          })
        } catch (emitErr) {
          // observability never breaks the send — but it must not die
          // silently either (failure-matrix row 21).
          console.error('[chat/stream] observability emit failed:', emitErr instanceof Error ? emitErr.message : emitErr)
        }
      }

      // ── Empty-reply guard (2026-09-10, operator bug #4) ───────────────────
      // An agent turn that ends WITHOUT any reply content must fail loudly:
      // persisting a blank agent message makes the room look answered while
      // nothing actually happened (pool recycle, terminated run, silent
      // rate-limit stop). The blank message then advances every downstream
      // reader — verify turns, originalAsks chains, proposal detection — as
      // if the turn had happened. Nothing advances on an empty turn.
      if (!replyContent.trim()) {
        replyContent =
          '[no reply] The agent turn ended without producing a response — most likely the agent pool was recycled mid-run or the turn hit its token/time ceiling. Nothing advanced; send the message again to retry.'
        replyAuthorId = 'system'
        replyAuthorName = 'system'
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ kind: 'error', message: replyContent })}\n\n`,
          ),
        )
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
