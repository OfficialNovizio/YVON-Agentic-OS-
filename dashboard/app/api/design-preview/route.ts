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

const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')
const TASK_PY = path.join(REPO_ROOT, 'cli', 'task.py')
const DESIGN_SESSIONS_DIR = path.join(REPO_ROOT, 'store', 'design-sessions')

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type DesignTool = 'screenshot-to-code' | 'open-design' | 'custom'

interface PreviewTab {
  available: boolean
  reason?: string
}
interface PreviewTabHtml extends PreviewTab {
  html?: string
  stub?: boolean
}
interface CodeTab extends PreviewTab {
  code?: string
  stack?: string
  stub?: boolean
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
      preview: unavailable('this task has no design_origin — it was not sourced from cli/design.py'),
      code: unavailable('this task has no design_origin — it was not sourced from cli/design.py'),
      designMd: unavailable('this task has no design_origin — it was not sourced from cli/design.py'),
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
