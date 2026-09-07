import 'server-only'
import { supabase } from '@/lib/supabase'

// Cache-only social analytics (2026-09-07).
// This is the surviving half of lib/apify.ts after Apify was decommissioned:
// reads of the social_snapshots / social_posts cache tables that Apify runs
// used to populate. No scraping happens here — with Apify gone the cache is
// frozen until another source writes these tables.

export interface SocialMetrics {
  platform:        'instagram' | 'tiktok' | 'linkedin' | 'youtube'
  handle:          string
  followers:       number
  following:       number
  posts_count:     number
  avg_likes:       number
  avg_comments:    number
  avg_views:       number
  engagement_rate: number  // decimal e.g. 0.034 = 3.4%
  fetched_at:      string
  from_cache:      boolean
}

export interface SocialPost {
  post_id:         string
  url:             string
  thumbnail_url:   string
  caption:         string
  post_type:       string
  likes:           number
  comments:        number
  shares:          number
  saves:           number
  views:           number
  reach:           number
  engagement_rate: number
  published_at:    string
}

async function getCachedSnapshot(ventureSlug: string, platform: string, handle: string) {
  const { data } = await supabase
    .from('social_snapshots')
    .select('*')
    .eq('venture_slug', ventureSlug)
    .eq('platform', platform)
    .eq('handle', handle)
    .gt('cache_expires_at', new Date().toISOString())
    .order('captured_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

function emptyMetrics(platform: SocialMetrics['platform'], handle: string): SocialMetrics {
  return {
    platform, handle,
    followers: 0, following: 0, posts_count: 0,
    avg_likes: 0, avg_comments: 0, avg_views: 0,
    engagement_rate: 0,
    fetched_at: new Date().toISOString(),
    from_cache: false,
  }
}

/** Cached social metrics for a connected platform. Cache-only — Apify (the
 *  original writer of these snapshots) was decommissioned 2026-09-07, so
 *  uncached handles return empty metrics rather than scraping. */
export async function getSocialMetrics(
  ventureSlug: string,
  platform: SocialMetrics['platform'],
  handle: string,
): Promise<SocialMetrics> {
  const cached = await getCachedSnapshot(ventureSlug, platform, handle)
  if (cached) {
    return {
      platform, handle,
      followers:       cached.followers       ?? 0,
      following:       cached.following        ?? 0,
      posts_count:     cached.posts_count      ?? 0,
      avg_likes:       Number(cached.avg_likes     ?? 0),
      avg_comments:    Number(cached.avg_comments  ?? 0),
      avg_views:       Number(cached.avg_views     ?? 0),
      engagement_rate: Number(cached.engagement_rate ?? 0),
      fetched_at:      cached.captured_at as string,
      from_cache:      true,
    }
  }
  return emptyMetrics(platform, handle)
}

/** Cached posts (populated by former Apify refresh runs). Pure table read. */
export async function getSocialPosts(
  ventureSlug: string,
  platform: SocialMetrics['platform'],
  limit = 10,
): Promise<SocialPost[]> {
  const { data } = await supabase
    .from('social_posts')
    .select('*')
    .eq('venture_slug', ventureSlug)
    .eq('platform', platform)
    .order('published_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map((r: Record<string, unknown>) => ({
    post_id: r.post_id, url: r.url ?? '', thumbnail_url: r.thumbnail_url ?? '', caption: r.caption ?? '', post_type: r.post_type ?? 'static',
    likes: r.likes ?? 0, comments: r.comments ?? 0, shares: r.shares ?? 0, saves: r.saves ?? 0,
    views: r.views ?? 0, reach: r.reach ?? 0, engagement_rate: Number(r.engagement_rate ?? 0),
    published_at: r.published_at ?? new Date().toISOString(),
  })) as SocialPost[]
}
