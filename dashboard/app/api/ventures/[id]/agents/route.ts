import { supabase } from '@/lib/supabase'
import { errMsg } from '@/lib/errors'

// GET/POST /api/ventures/[id]/agents — grants UI backend (2026-08-15).
// venture_agents (migration 111_venture_agents_and_tier.sql) is keyed by
// venture_slug (FK -> ventures.slug, composite PK with agent_id), not
// venture id, so both handlers resolve the slug from the route's [id]
// first. Writes use the service-role client — RLS on this table gives
// `authenticated` SELECT-only and `service_role` full access, same split
// every other ventures/[id]/* write route already relies on
// (lib/supabase.ts, same client as lib/db/venture-graphify.ts).
//
// Until this route existed, venture_agents had no write path at all —
// the only rows ever in it came from a one-time manual SQL backfill
// (migration comment: "no runtime enforcement wired yet"), since wiped
// along with a Novizio reset. This is what YvonGraph's "Team" mode reads
// (components/YvonGraph.tsx, `.eq("enabled", true)`).

async function ventureSlug(id: string): Promise<string | null> {
  const { data } = await supabase.from('ventures').select('slug').eq('id', id).single()
  return data?.slug ?? null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params
  try {
    const slug = await ventureSlug(id)
    if (!slug) return Response.json({ error: 'venture not found' }, { status: 404 })
    const { data, error } = await supabase
      .from('venture_agents')
      .select('agent_id')
      .eq('venture_slug', slug)
      .eq('enabled', true)
    if (error) throw error
    return Response.json({ agentIds: (data ?? []).map((r) => r.agent_id as string) })
  } catch (err) {
    return Response.json({ error: errMsg(err) }, { status: 500 })
  }
}

// Full-replace sync: whatever's checked in the UI becomes the complete
// grant set for this venture — delete then re-insert rather than diffing.
// Simpler, and the composite PK (venture_slug, agent_id) makes re-insert
// safe. Not wrapped in a DB transaction (no multi-statement transaction
// API via supabase-js here) — acceptable for a single-operator settings
// save; worth revisiting if this ever needs concurrent-write safety.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params
  let body: { agentIds?: string[] } = {}
  try {
    const text = await request.text()
    if (text) body = JSON.parse(text) as { agentIds?: string[] }
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const agentIds = Array.isArray(body.agentIds) ? body.agentIds.filter((a) => typeof a === 'string') : []

  try {
    const slug = await ventureSlug(id)
    if (!slug) return Response.json({ error: 'venture not found' }, { status: 404 })

    const { error: delErr } = await supabase.from('venture_agents').delete().eq('venture_slug', slug)
    if (delErr) throw delErr

    if (agentIds.length) {
      const rows = agentIds.map((agent_id) => ({ venture_slug: slug, agent_id, enabled: true, granted_by: 'settings-ui' }))
      const { error: insErr } = await supabase.from('venture_agents').insert(rows)
      if (insErr) throw insErr
    }
    return Response.json({ ok: true, count: agentIds.length })
  } catch (err) {
    return Response.json({ error: errMsg(err) }, { status: 500 })
  }
}
