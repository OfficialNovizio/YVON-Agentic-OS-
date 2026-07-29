import { deleteVentureSocial } from '@/lib/db'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; socialId: string }> }
): Promise<Response> {
  const { socialId } = await params
  try {
    await deleteVentureSocial(socialId)
    return Response.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}
