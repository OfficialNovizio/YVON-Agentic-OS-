/**
 * Marketing Studio presets — ported from Open-Generative-AI.
 * Source: packages/studio/src/components/MarketingStudio.jsx, const ASSETS / OPTIONS.
 * Owner: mia · design.motion
 *
 * WHY THIS IS A VERBATIM PORT
 * ---------------------------
 * These are not decorative thumbnails. The `ugc` entries are the motion
 * templates the endpoint actually conditions on — the chosen url is sent as
 * `video_files: [url]`. The `avatar` entries are real reference images that
 * land in `images_list[1]`. Inventing our own list would produce a picker that
 * looks right and generates nothing, which is exactly the failure this file
 * exists to prevent. The ids are upstream's ids; keep them.
 *
 * The urls point at upstream's CloudFront distribution. That host is blocked
 * from our build container but resolves fine in a browser, so these are
 * hotlinked rather than vendored — same call as PROVIDER_LOGOS. Every consumer
 * must render a fallback for the load-failure case.
 */

export interface AvatarPreset { id: string; name: string; url: string }
export interface FormatPreset { id: number; name: string; url: string }

const CDN = 'https://d3adwkbyhxyrtq.cloudfront.net/web-app'

/** Reference faces. Selecting one fills the Avatar slot → `images_list[1]`. */
export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'aa252283-8591-4d14-91a8-41ce54187992', name: 'Priya',  url: `${CDN}/Priya.webp` },
  { id: 'ba6c9b18-f79c-4dab-9649-88a181d0a038', name: 'Elena',  url: `${CDN}/Elena.webp` },
  { id: '30e2cadd-987c-4a7a-81c3-094d4fb3a65e', name: 'Kai',    url: `${CDN}/Kai.webp` },
  { id: 'fbed59e1-4b8d-4625-9140-ef2044e0be72', name: 'Sora',   url: `${CDN}/Sora.webp` },
  { id: 'bcd9e6ee-c000-48e6-9f4b-a20fc2a674f7', name: 'Minji',  url: `${CDN}/Minji.webp` },
  { id: '1da384ed-3856-45e4-bf4c-a496c7aa95ff', name: 'Margot', url: `${CDN}/Margot.webp` },
  { id: 'b799c8f5-fb6e-4905-b33b-cdefac153ec3', name: 'Niko',   url: `${CDN}/Niko.webp` },
  { id: 'b6971dd4-55fa-4e64-b318-392b16504284', name: 'Jin',    url: `${CDN}/Jin.webp` },
]

/** Motion templates. The selected url is sent as `video_files: [url]`. */
export const FORMAT_PRESETS: FormatPreset[] = [
  { id: 1, name: 'UGC',            url: `${CDN}/ugc.mp4` },
  { id: 2, name: 'Tutorial',       url: `${CDN}/ugc_how_to.mp4` },
  { id: 3, name: 'Unboxing',       url: `${CDN}/ugc_unboxing.mp4` },
  { id: 4, name: 'Hyper Motion',   url: `${CDN}/hyper-motion-mini.mp4` },
  { id: 5, name: 'Product Review', url: `${CDN}/product_review.mp4` },
  { id: 6, name: 'TV Spot',        url: `${CDN}/tv-spot-mini.mp4` },
]

export const MARKETING_RATIOS = ['9:16', '3:4', '4:3', '16:9', '1:1'] as const
export const MARKETING_RES = ['720p', '1080p'] as const
export const MARKETING_DURATIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const

export type MarketingRatio = (typeof MARKETING_RATIOS)[number]
export type MarketingRes = (typeof MARKETING_RES)[number]

/**
 * Resolution picks the endpoint — there is no model dropdown in this studio.
 * Mirrors generateMarketingStudioAd() in upstream muapi.js:196.
 */
export const marketingEndpoint = (res: MarketingRes): string =>
  res === '1080p' ? 'seedance-2-vip-omni-reference-1080p' : 'seedance-2-vip-omni-reference'

export const MARKETING_MAX_REFS = 6

export interface MarketingParams {
  prompt: string
  ratio: MarketingRatio
  res: MarketingRes
  duration: number
  productImage: string | null
  avatarImage: string | null
  additionalImages: string[]
  formatUrl: string | null
}

/**
 * The exact payload shape upstream sends. `images_list` order is load-bearing:
 * the prompt refers to the slots as @image1, @image2, … in this order, so a
 * missing avatar must collapse the list rather than leave a hole.
 */
export function marketingPayload(p: MarketingParams) {
  return {
    prompt: p.prompt,
    aspect_ratio: p.ratio,
    duration: p.duration,
    images_list: [p.productImage, p.avatarImage, ...p.additionalImages].filter(Boolean) as string[],
    video_files: p.formatUrl ? [p.formatUrl] : [],
  }
}

/** Returns the reason this cannot be submitted, or null when it can. */
export function marketingBlocker(p: MarketingParams): string | null {
  if (!p.prompt.trim()) return 'Write the ad script first'
  if (!p.productImage) return 'Upload a product image — it is @image1'
  if (!MARKETING_RATIOS.includes(p.ratio)) return `Unsupported aspect ratio ${p.ratio}`
  if (p.duration < 4 || p.duration > 15) return 'Duration must be 4–15s'
  return null
}
