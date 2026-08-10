import { getAllVentures, createVenture } from '@/lib/db'
import type { VentureConfig } from '@/lib/types'
import { errMsg } from '@/lib/errors'

export async function GET(): Promise<Response> {
  try {
    // yvon-os is now a real `ventures` row (kind='core'), inserted by
    // dashboard/supabase/migrations/112_context_graph_columns.sql — system-harness/graph-brain/YVON-GRAPH.md §1.2.
    // This route used to hardcode a synthetic YVON_OS object and prepend it ("always present,
    // never a DB row"); as of 2026-08-09 that produced a duplicate 'yvon-os' entry alongside the
    // real DB row. Removed — getAllVentures() already returns it, correctly ordered
    // (kind='core' first) since it filters/orders by kind/sort_order/slug.
    const ventures = await getAllVentures()
    return Response.json(ventures)
  } catch (err) {
    const msg = errMsg(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: Partial<Omit<VentureConfig, 'id'>>
  try {
    body = await request.json() as Partial<Omit<VentureConfig, 'id'>>
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, slug } = body
  if (!name || !slug) {
    return Response.json({ error: 'name and slug are required' }, { status: 400 })
  }

  try {
    const venture = await createVenture({
      name,
      slug,
      color:         body.color         ?? '#E94560',
      igHandle:      body.igHandle      ?? '',
      ytChannelId:   body.ytChannelId   ?? '',
      liProfileUrl:  body.liProfileUrl  ?? '',
      ga4PropertyId: body.ga4PropertyId ?? '',
      description:   body.description,
      tagline:       body.tagline,
      brandType:     body.brandType,
      status:        body.status        ?? 'active',
      websiteUrl:    body.websiteUrl,
      logoUrl:       body.logoUrl,
      foundedYear:   body.foundedYear,
      repoUrl:       body.repoUrl,
      notionUrl:     body.notionUrl,
    })
    return Response.json(venture, { status: 201 })
  } catch (err) {
    const msg = errMsg(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}
