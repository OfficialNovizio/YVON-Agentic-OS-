/**
 * MuAPI server-side edge. Owner: quinn · engineering
 *
 * THE ONE RULE
 * ------------
 * The MuAPI key never reaches the browser. Upstream (Open-Generative-AI) stores
 * it in a non-HttpOnly `muapi_key` cookie and attaches it from client code via a
 * shared axios interceptor — which also leaks it onto every relative URL the app
 * fetches. We do not port that. The key lives in MUAPI_KEY on the server and is
 * attached here, on this side of the wire, or the call does not go out.
 */
export const MUAPI_BASE = 'https://api.muapi.ai/api/v1'

export function muapiKey(): string | null {
  const k = process.env.MUAPI_KEY
  return k && k.trim() ? k.trim() : null
}

export function missingKey() {
  return Response.json(
    { error: 'MUAPI_KEY is not set on the server — set it in .env.local and restart.' },
    { status: 503 },
  )
}
