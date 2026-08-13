import { updateVenture, deleteVenture } from '@/lib/db'
import { triggerVentureOnboarding } from '@/lib/db/venture-graphify'
import type { VentureConfig } from '@/lib/types'
import { errMsg } from '@/lib/errors'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params

  let body: Partial<Omit<VentureConfig, 'id'>>
  try {
    body = await request.json() as Partial<Omit<VentureConfig, 'id'>>
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    await updateVenture(id, body)

    // Artifacts 2+3+4 (2026-08-12): if this save touched repoUrl, check
    // whether a write-scoped PAT is already on file (set via POST
    // /api/ventures/[id]/graphify) and fire both the graphify and MemPalace
    // builds automatically if so. Best-effort — a venture save must never
    // fail because Hermes is slow/unreachable, and most saves won't have a
    // PAT yet until Settings grows a field for it.
    if (body.repoUrl !== undefined) {
      triggerVentureOnboarding(id).catch(() => {})
    }

    return Response.json({ updated: true })
  } catch (err) {
    const msg = errMsg(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params
  try {
    await deleteVenture(id)
    return Response.json({ deleted: true })
  } catch (err) {
    const msg = errMsg(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}
