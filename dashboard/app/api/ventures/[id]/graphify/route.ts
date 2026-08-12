import { setVentureGithubPat, triggerVentureGraphify } from '@/lib/db/venture-graphify'
import { errMsg } from '@/lib/errors'

// POST /api/ventures/[id]/graphify — artifact 4 (trigger wiring), 2026-08-12.
//
// Two uses:
//  1. First-time setup: body { githubPat: "<write-scoped PAT>" } — persists
//     the PAT (kept out of the general venture read path, see
//     lib/db/venture-graphify.ts) and immediately kicks off a build.
//  2. Manual re-trigger: empty body — uses whichever PAT is already stored.
//
// Fire-and-forget: this returns as soon as Hermes accepts the job, not when
// the (multi-minute) build finishes. Poll venture_graphs (migration 118) for
// live status.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params

  let body: { githubPat?: string } = {}
  try {
    const text = await request.text()
    if (text) body = JSON.parse(text) as { githubPat?: string }
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    if (body.githubPat !== undefined) {
      await setVentureGithubPat(id, body.githubPat || null)
    }
    const result = await triggerVentureGraphify(id)
    if (!result.ok) {
      return Response.json({ started: false, reason: result.reason }, { status: 502 })
    }
    return Response.json({ started: true }, { status: 202 })
  } catch (err) {
    return Response.json({ error: errMsg(err) }, { status: 502 })
  }
}
