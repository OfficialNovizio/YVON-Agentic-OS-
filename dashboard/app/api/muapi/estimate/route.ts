/**
 * POST /api/muapi/estimate — what will this cost, before we spend it.
 * Owner: quinn · engineering
 *
 * Mirrors estimateV2VCost() in upstream muapi.js:224. Upstream validates the
 * response shape before trusting it and so do we: a non-finite cost, or a
 * currency that is not three letters, is an error rather than a number we
 * render. The spend rule is "no number, no spend" — a bad number is worse than
 * no number, so it must not become one.
 */
import { MUAPI_BASE, muapiKey, missingKey } from '../_shared'

export const runtime = 'nodejs'

// Only endpoints we actually drive. An open passthrough is an open proxy.
const ALLOWED = new Set([
  'seedance-2-vip-omni-reference',
  'seedance-2-vip-omni-reference-1080p',
])

export async function POST(req: Request) {
  const key = muapiKey()
  if (!key) return missingKey()

  const body = await req.json().catch(() => null)
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : ''
  if (!ALLOWED.has(endpoint)) return Response.json({ error: `endpoint not allowed: ${endpoint}` }, { status: 400 })

  const res = await fetch(`${MUAPI_BASE}/models/${endpoint}/estimate-cost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
    body: JSON.stringify(body?.payload ?? {}),
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) {
    return Response.json({ error: `estimate failed — ${res.status}`, detail: (await res.text()).slice(0, 200) }, { status: 502 })
  }
  const data = await res.json().catch(() => null)
  const cost = data?.cost
  const currency = typeof data?.currency === 'string' ? data.currency.trim().toUpperCase() : ''
  if (typeof cost !== 'number' || !Number.isFinite(cost) || cost < 0) {
    return Response.json({ error: 'estimate returned an invalid cost' }, { status: 502 })
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    return Response.json({ error: 'estimate returned an invalid currency' }, { status: 502 })
  }
  return Response.json({ cost, currency })
}
