import type { VentureConfig } from '@/lib/types'

const COOKIE_NAME = 'yvon_active_venture'

// ─── Server-side (cookies from next/headers) ──────────────────────────────────

export function getActiveVentureSlug(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): string {
  return cookieStore.get(COOKIE_NAME)?.value ?? 'yvon-os'
}

// ─── Client-side ──────────────────────────────────────────────────────────────

export function getActiveVentureSlugClient(): string {
  if (typeof document === 'undefined') return 'yvon-os'
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : 'yvon-os'
}

export async function setActiveVentureSlugClient(slug: string): Promise<void> {
  await fetch('/api/set-venture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ventureSlug: slug }),
  })
}

// P1 (TS-026): the system venture is yvon-os. The hardcoded novizio/hourbour
// fallbacks below are REMOVED — getVentureConfig now returns yvon-os when the
// slug isn't a real (Settings-added) venture, so no phantom sub-brands appear.

// ─── Sync fallback (env vars) — used by analytics/briefing routes ─────────────
// These routes call getVentureConfig() synchronously. Keep this until they are
// migrated to the async DB version below.

/** TS-026: resolve a venture's REAL name + brandType from the DB (no hardcoded
 * sub-brand assumptions). Falls back to the slug itself — truthful, never invented. */
export async function ventureNameAndBrand(
  slug: string,
): Promise<{ name: string; brandType?: string }> {
  try {
    const { getVentureBySlug } = await import('@/lib/db/ventures')
    const v = await getVentureBySlug(slug)
    if (v) return { name: v.name ?? slug, brandType: v.brandType }
  } catch {
    // DB unavailable — fall through to slug
  }
  return { name: slug }
}

export function getVentureConfig(slug: string): VentureConfig {
  // P1 (TS-026): no hardcoded sub-brand configs. Real ventures resolve via the
  // DB (async); this sync fallback returns the system venture (yvon-os) unless
  // the slug matches one of the known real venture env configs (kept for
  // existing sync consumers until they migrate to the DB lookup).
  if (slug && slug !== 'yvon-os' && process.env[`${slug.toUpperCase()}_IG_HANDLE`]) {
    return {
      id: slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
      color: '#E94560',
      igHandle:      process.env[`${slug.toUpperCase()}_IG_HANDLE`] ?? '',
      ytChannelId:   process.env[`${slug.toUpperCase()}_YT_CHANNEL_ID`] ?? '',
      liProfileUrl:  process.env[`${slug.toUpperCase()}_LI_PROFILE_URL`] ?? '',
      ga4PropertyId: process.env[`${slug.toUpperCase()}_GA4_PROPERTY_ID`] ?? '',
    }
  }

  // Default: yvon-os (the system venture).
  return {
    id: 'yvon-os',
    name: 'YVON OS',
    slug: 'yvon-os',
    color: '#6366F1',
    igHandle: '',
    ytChannelId: '',
    liProfileUrl: '',
    ga4PropertyId: '',
    description: 'The AI operating system',
  }
}
