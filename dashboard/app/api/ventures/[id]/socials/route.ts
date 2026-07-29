import { getVentureSocials, upsertVentureSocial } from '@/lib/db'
import type { SocialPlatform } from '@/lib/types'

const VALID_PLATFORMS: SocialPlatform[] = [
  'instagram','youtube','linkedin','tiktok',
  'twitter','facebook','pinterest','github','discord','telegram',
]

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params
  try {
    const socials = await getVentureSocials(id)
    return Response.json(socials)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params

  let body: { platform?: string; handleOrUrl?: string }
  try {
    body = await request.json() as { platform?: string; handleOrUrl?: string }
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { platform, handleOrUrl } = body
  if (!platform || !handleOrUrl) {
    return Response.json({ error: 'platform and handleOrUrl are required' }, { status: 400 })
  }

  if (!VALID_PLATFORMS.includes(platform as SocialPlatform)) {
    return Response.json({ error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}` }, { status: 400 })
  }

  try {
    const social = await upsertVentureSocial(id, platform as SocialPlatform, handleOrUrl)
    return Response.json(social, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}
