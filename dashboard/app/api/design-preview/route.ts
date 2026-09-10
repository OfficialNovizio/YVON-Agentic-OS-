// GET /api/design-preview?taskId=<TS-NNN>
//
// Resolves a task's design_origin (cli/task.py's design_session_id/
// design_tool/design_artifact_id/design_project_id/design_handoff_path —
// docs/PRD-design-first-workflow.md) into renderable content for
// TaskFocusView's unified design-preview panel. One response shape
// regardless of which tool produced the task (operator's decision,
// 2026-08-19) — three tabs (preview/code/designMd), each independently
// `available` with an honest `reason` when it isn't, never a guess.
//
// Reuses the same execFile-into-`cli/task.py list` technique the sibling
// /api/task-spec route already uses (task.py owns the only parser for its
// own YAML), then reads store/design-sessions/{id}.json directly off disk
// — same read-only-off-disk pattern /api/task-spec's readPrd() already
// uses for {id}-prd.md.
//
// open-design's tab: `GET /api/live-artifacts/:artifactId/preview` on the
// daemon is gated by requireLocalDaemonRequest (apps/daemon/src/http/
// local-daemon-request.ts, verified against the real open-design source)
// — it 403s any request whose TCP peer address isn't loopback, regardless
// of API token. This route only works because the dashboard itself runs
// on the same box as the daemon (yvon-hermes-dashboard.service's existing
// convention) — a server-side `fetch('http://127.0.0.1:<port>/...')` from
// THIS process genuinely originates from loopback. If the dashboard is
// ever deployed off that box, this tab stops resolving and must degrade
// honestly (it already does — see the OPEN_DESIGN_URL-unset path below),
// not silently break.
//
// Owner: dev · design-first-workflow, 2026-08-19

import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { ensureRepoPreview, hermesConfig } from '@/lib/hermes-client'

const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')
const TASK_PY = path.join(REPO_ROOT, 'cli', 'task.py')
const DESIGN_SESSIONS_DIR = path.join(REPO_ROOT, 'store', 'design-sessions')

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type DesignTool = 'screenshot-to-code' | 'open-design' | 'custom' | 'reference-build'

interface PreviewTab {
  available: boolean
  reason?: string
}
interface PreviewTabHtml extends PreviewTab {
  html?: string
  stub?: boolean
  /** reference-build: URL of the built product's live dev server
   * (https://<venture>.preview.yvon.in/) — link-out, never an iframe
   * (next.config.ts sets frame-src 'none'). */
  url?: string
  note?: string
}
interface CodeTab extends PreviewTab {
  code?: string
  stack?: string
  stub?: boolean
  /** reference-build: the dashboard repo browser for the built product
   * (/repo/<venture>) — link-out for the same frame-src 'none' reason. */
  repoFilesUrl?: string
  note?: string
}
interface DesignMdTab extends PreviewTab {
  text?: string
}

interface DesignPreviewResponse {
  ok: boolean
  taskId: string
  designSessionId: string | null
  tool: DesignTool | null
  tabs: {
    preview: PreviewTabHtml
    code: CodeTab
    designMd: DesignMdTab
  }
  error?: string
}

// Mirrors cli/design.py's session JSON shape (docs/PRD-design-first-workflow.md
// §3) — only the fields this route actually reads.
interface DesignSessionRecord {
  id: string
  generation?: { code?: string | null; stack?: string | null; stub?: boolean | null }
  design_md?: { path?: string | null }
}

// design-session ids are uuid4 (cli/design.py's `uuid.uuid4()`) — validated
// before it ever touches a filesystem path, same discipline as the sibling
// route validating `^TS-\d+$` before building a path from `id`.
const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function unavailable(reason: string): PreviewTab {
  return { available: false, reason }
}

// 2026-09-08: derive the venture slug for reference-build tabs from the
// record's stamped work-item produces ("workspaces/novizio/" → "novizio") —
// the disk value written at convert time (createTaskFromPrd reads the design
// session's venture; scripts/run-task-suite.mjs parses the same shape), never
// the session cookie. Regex-validated before it touches any URL or the VPS
// call: a crafted produces value like "workspaces/../_dev_logs/" must not
// flow into the VPS path join (main.py _venture_repo_dir).
function deriveWorkspaceSlug(task: Record<string, unknown>): string | null {
  const items = task.workItems as Array<{ produces?: string }> | undefined
  const produces = items?.map((wi) => wi?.produces ?? '').find((p) => /^workspaces\/[^/]+\/?$/.test(p.trim()))
  if (!produces) return null
  const slug = produces.trim().split('/')[1]
  return /^[a-z0-9-]+$/.test(slug) ? slug : null
}

async function resolveOpenDesignPreview(artifactId: string, projectId: string): Promise<PreviewTabHtml> {
  const base = (process.env.OPEN_DESIGN_URL || '').replace(/\/$/, '')
  if (!base) {
    return unavailable(
      'OPEN_DESIGN_URL is not set in this dashboard process’s environment — the daemon’s ' +
      'live-artifact preview route only accepts requests from its own loopback interface, so this ' +
      'must run on the same host as the daemon (see vps-scripts/deploy-open-design.sh).',
    )
  }
  const token = process.env.OD_API_TOKEN || ''
  try {
    const res = await fetch(
      `${base}/api/live-artifacts/${encodeURIComponent(artifactId)}/preview?projectId=${encodeURIComponent(projectId)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(10_000),
      },
    )
    if (!res.ok) {
      return unavailable(`open-design daemon returned ${res.status} for artifact ${artifactId}`)
    }
    const html = await res.text()
    return { available: true, html }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return unavailable(`couldn't reach the open-design daemon at ${base} (${msg})`)
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const taskId = url.searchParams.get('taskId') || ''
  if (!/^TS-\d+$/.test(taskId)) {
    return NextResponse.json({ ok: false, error: `invalid task id: ${taskId}` }, { status: 400 })
  }

  let tasks: Array<Record<string, unknown>>
  try {
    const { stdout } = await execFileAsync('python3', [TASK_PY, 'list'], {
      cwd: REPO_ROOT,
      timeout: 15_000,
      maxBuffer: 10 * 1024 * 1024,
    })
    tasks = JSON.parse(stdout) as Array<Record<string, unknown>>
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error }, { status: 502 })
  }

  const task = tasks.find((t) => t.id === taskId)
  if (!task) {
    return NextResponse.json({ ok: false, error: `no such task: ${taskId}` }, { status: 404 })
  }

  const designSessionId = (task.designSessionId as string) || ''
  const designTool = ((task.designTool as string) || '') as DesignTool | ''
  const designArtifactId = (task.designArtifactId as string) || ''
  const designProjectId = (task.designProjectId as string) || ''

  const empty: DesignPreviewResponse = {
    ok: true,
    taskId,
    designSessionId: null,
    tool: null,
    tabs: {
      preview: unavailable('this task has no design_origin — it was not sourced from a design session'),
      code: unavailable('this task has no design_origin — it was not sourced from a design session'),
      designMd: unavailable('this task has no design_origin — it was not sourced from a design session'),
    },
  }
  if (!designSessionId || !designTool) {
    return NextResponse.json(empty)
  }
  if (!SESSION_ID_RE.test(designSessionId)) {
    // Malformed rather than absent — set by hand, or a future format
    // drift. Refuse to build a filesystem path from it, same guard
    // discipline as the taskId regex check above.
    return NextResponse.json({
      ...empty,
      designSessionId,
      tool: designTool,
      error: `design_session_id on ${taskId} doesn't look like a uuid — refusing to read a file path built from it`,
    })
  }

  let session: DesignSessionRecord | null = null
  try {
    const raw = fs.readFileSync(path.join(DESIGN_SESSIONS_DIR, `${designSessionId}.json`), 'utf-8')
    session = JSON.parse(raw) as DesignSessionRecord
  } catch {
    session = null
  }

  let designMdText: string | null = null
  try {
    const mdPath = path.join(DESIGN_SESSIONS_DIR, `${designSessionId}-design.md`)
    if (fs.existsSync(mdPath)) designMdText = fs.readFileSync(mdPath, 'utf-8')
  } catch {
    designMdText = null
  }
  const designMd: DesignMdTab = designMdText
    ? { available: true, text: designMdText }
    : unavailable(`no design.md found on disk for session ${designSessionId} — draft may not have run yet`)

  let preview: PreviewTabHtml
  let code: CodeTab

  if (designTool === 'screenshot-to-code') {
    const genCode = session?.generation?.code || null
    if (genCode) {
      code = { available: true, code: genCode, stack: session?.generation?.stack || undefined, stub: !!session?.generation?.stub }
      preview = { available: true, html: genCode, stub: !!session?.generation?.stub }
    } else {
      code = unavailable(session ? 'no generated code recorded on this session yet' : `session record ${designSessionId}.json not found on disk`)
      preview = code
    }
  } else if (designTool === 'open-design') {
    code = unavailable("open-design artifacts aren't single-file generated code — this tool has no code tab")
    if (designArtifactId && designProjectId) {
      preview = await resolveOpenDesignPreview(designArtifactId, designProjectId)
    } else {
      preview = unavailable(
        'no design_artifact_id/design_project_id recorded on this task yet — nothing for open-design to preview ' +
        '(Stage 5b, which would produce these, is not built yet).',
      )
    }
  } else if (designTool === 'reference-build') {
    // Re-engineer Phase 5 (2026-09-05): the chat reference-build pipeline's
    // sessions (store/design-sessions/{sid}.json, kind "reference-build").
    // Their design.md is written by the design-gate cascade; the preview and
    // code live in the BUILT product (workspaces/<venture>/), not in the
    // session. 2026-09-08: the two tabs now RESOLVE the built product the same
    // way the chat repo-links block does — venture slug derived from the
    // record's stamped WI produces (the disk value, never the session cookie),
    // dev server via ensureRepoPreview (same call stream/route.ts makes), and
    // the code tab opens the dashboard's own /repo/<slug> browser. Both are
    // link-out: next.config.ts sets frame-src 'none', so neither URL can be
    // iframed into this panel.
    const slug = deriveWorkspaceSlug(task)
    if (!slug) {
      code = unavailable('no workspaces/<venture>/ product home stamped on this task yet — the design session has no venture or convert never stamped WI produces')
      preview = code
    } else {
      const p = await ensureRepoPreview(slug, hermesConfig())
      preview = p.ok && p.previewHost
        ? {
            available: true,
            // http:// until a wildcard TLS cert exists for *.preview.yvon.in
            // (per-venture certbot needs the DNS record first) — the nginx
            // vhost serves the dev server on port 80 today.
            url: `http://${p.previewHost}/`,
            note: 'the built product itself, served by its dev server on the VPS — opens in a new tab (dashboard CSP sets frame-src \'none\', so it cannot render inline here)',
          }
        : unavailable(`live preview not ready: ${p.error ?? 'unknown error'}`)
      code = {
        available: true,
        repoFilesUrl: `/repo/${slug}`,
        note: 'the built product\'s source tree on the VPS checkout — read-only file browser, opens in a new tab',
      }
    }
  } else {
    // custom / stub-only session — no generation tool was actually called.
    code = unavailable('no code-generation tool was used for this session (custom/stub)')
    preview = unavailable('no live-preview tool was used for this session (custom/stub)')
  }

  const response: DesignPreviewResponse = {
    ok: true,
    taskId,
    designSessionId,
    tool: designTool,
    tabs: { preview, code, designMd },
  }
  return NextResponse.json(response)
}
