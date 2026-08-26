/**
 * POST /api/muapi/marketing — submit the ad, return the request_id.
 * Owner: quinn · engineering
 *
 * WHY THIS SUBMITS AND RETURNS, RATHER THAN POLLING
 * -------------------------------------------------
 * Upstream's generateMarketingStudioAd() polls for up to 900 attempts × 2s —
 * thirty minutes — inside the browser tab. A refresh loses the job and the money
 * with it. We submit, persist the row, and hand back the request_id; the library
 * polls /api/generations, which reads a row that outlives the tab.
 */
import { MUAPI_BASE, muapiKey, missingKey } from '../_shared'

export const runtime = 'nodejs'

const ALLOWED = new Set([
  'seedance-2-vip-omni-reference',
  'seedance-2-vip-omni-reference-1080p',
])
const RATIOS = new Set(['9:16', '3:4', '4:3', '16:9', '1:1'])

export async function POST(req: Request) {
  const key = muapiKey()
  if (!key) return missingKey()

  const body = await req.json().catch(() => null)
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : ''
  if (!ALLOWED.has(endpoint)) return Response.json({ error: `endpoint not allowed: ${endpoint}` }, { status: 400 })

  const p = body?.payload ?? {}
  // Re-validate server-side. The client's disabled button is a courtesy, not a gate.
  if (typeof p.prompt !== 'string' || !p.prompt.trim()) return Response.json({ error: 'prompt is required' }, { status: 400 })
  if (!Array.isArray(p.images_list) || p.images_list.length === 0) return Response.json({ error: 'a product image is required' }, { status: 400 })
  if (!RATIOS.has(p.aspect_ratio)) return Response.json({ error: `unsupported aspect_ratio ${p.aspect_ratio}` }, { status: 400 })
  if (!Number.isInteger(p.duration) || p.duration < 4 || p.duration > 15) return Response.json({ error: 'duration must be an integer 4–15' }, { status: 400 })
  if (typeof body?.estimateUsd !== 'number' || !Number.isFinite(body.estimateUsd)) {
    return Response.json({ error: 'refusing to spend without a fetched estimate' }, { status: 400 })
  }

  const res = await fetch(`${MUAPI_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
    body: JSON.stringify({
      prompt: p.prompt,
      aspect_ratio: p.aspect_ratio,
      duration: p.duration,
      images_list: p.images_list,
      video_files: Array.isArray(p.video_files) ? p.video_files : [],
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) {
    return Response.json({ error: `submit failed — ${res.status}`, detail: (await res.text()).slice(0, 200) }, { status: 502 })
  }
  const data = await res.json().catch(() => null)
  const requestId = data?.request_id ?? data?.id
  if (!requestId) return Response.json({ error: 'upstream returned no request_id' }, { status: 502 })

  // TODO(quinn): insert the `generations` row here once the migration lands.
  // Until then the id is returned but nothing durable records the spend — the
  // job survives a refresh only once that table exists.
  return Response.json({ requestId, endpoint, estimateUsd: body.estimateUsd, persisted: false })
}
