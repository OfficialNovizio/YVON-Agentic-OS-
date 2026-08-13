import { setVentureGithubPat, triggerVentureOnboarding } from '@/lib/db/venture-graphify'
import { errMsg } from '@/lib/errors'

// POST /api/ventures/[id]/graphify — artifacts 2+3+4 combined (trigger
// wiring), 2026-08-12. Despite the route name (kept for backward
// compatibility with earlier artifact-4 work), this now fires BOTH the
// graphify structural build AND the MemPalace semantic build together
// (triggerVentureOnboarding) — matching the original request to treat
// "graph + memory" as one combined onboarding step, not two separate calls.
//
// Two uses:
//  1. First-time setup: body { githubPat: "<write-scoped PAT>" } — persists
//     the PAT (kept out of the general venture read path, see
//     lib/db/venture-graphify.ts) and immediately kicks off both builds.
//  2. Manual re-trigger: empty body — uses whichever PAT is already stored.
//
// Fire-and-forget: this returns as soon as Hermes accepts both jobs, not
// when the (multi-minute) builds finish. Poll venture_graphs /
// venture_repo_knowledge (migration 118) for live status.
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
    const { graphify, mempalace } = await triggerVentureOnboarding(id)
    if (!graphify.ok && !mempalace.ok) {
      return Response.json(
        { started: false, graphify, mempalace },
        { status: 502 }
      )
    }
    // Partial success (one of the two started) still returns 202 — each
    // build reports its own status independently in Supabase.
    return Response.json({ started: true, graphify, mempalace }, { status: 202 })
  } catch (err) {
    return Response.json({ error: errMsg(err) }, { status: 502 })
  }
}
