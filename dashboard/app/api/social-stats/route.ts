/**
 * /api/social-stats
 *
 * GET  ?venture=<slug>&platform=instagram&handle=novizio&refresh=false
 *      → Returns SocialMetrics (cache-only)
 *
 * POST { venture, platforms: [{ platform, handle }], refresh? }
 *      → Returns metrics for multiple platforms in one request
 *
 * Cache-only since 2026-09-07: Apify (which populated the social_snapshots /
 * social_posts cache) was decommissioned. Uncached handles return empty
 * metrics rather than scraping; the `refresh` param is accepted for URL
 * compatibility and ignored.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSocialMetrics, getSocialPosts } from '@/lib/social-cache'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const venture  = searchParams.get('venture')
  const platform = searchParams.get('platform') as 'instagram' | 'tiktok' | 'linkedin' | 'youtube' | null
  const handle   = searchParams.get('handle')
  const refresh  = searchParams.get('refresh') === 'true' // accepted, ignored (cache-only)
  void refresh
  const posts    = searchParams.get('posts') === 'true'

  if (!venture || !platform || !handle) {
    return NextResponse.json({ error: 'Missing venture, platform, or handle' }, { status: 400 })
  }

  try {
    const [metrics, recentPosts] = await Promise.all([
      getSocialMetrics(venture, platform, handle),
      posts ? getSocialPosts(venture, platform, 10) : Promise.resolve([]),
    ])
    return NextResponse.json({ metrics, posts: recentPosts })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[social-stats GET]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  interface PlatformRequest {
    platform: 'instagram' | 'tiktok' | 'linkedin' | 'youtube'
    handle: string
  }
  interface Body {
    venture: string
    platforms: PlatformRequest[]
    refresh?: boolean
    includePosts?: boolean
  }

  let body: Body
  try {
    body = await req.json() as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { venture, platforms, refresh = false, includePosts = false } = body
  if (!venture || !Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json({ error: 'Missing venture or platforms array' }, { status: 400 })
  }

  // Cap at 4 platforms (one per connected account)
  const capped = platforms.slice(0, 4)

  try {
    const results = await Promise.allSettled(
      capped.map(async ({ platform, handle }) => {
        const [metrics, posts] = await Promise.all([
          getSocialMetrics(venture, platform, handle),
          includePosts ? getSocialPosts(venture, platform, 10) : Promise.resolve([]),
        ])
        return { platform, handle, metrics, posts }
      }),
    )

    const data = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value
      return { platform: capped[i].platform, handle: capped[i].handle, error: (r.reason as Error).message }
    })

    return NextResponse.json({ results: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[social-stats POST]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
