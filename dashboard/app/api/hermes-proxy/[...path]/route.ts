// GET/POST/PUT/PATCH/DELETE /api/hermes-proxy/[...path]
// Forwards authenticated requests to Hermes API on the VPS.
// The bearer token is set server-side from Vercel env var — never exposed to client.
//
// Flow: Dashboard → api/hermes-proxy/* → Next.js (adds token) → hermes.yvon.in/api/hermes/* → Hermes API
//
// Owner: raj · TS-018 WI-1

import { NextRequest, NextResponse } from 'next/server'

const HERMES_BASE = process.env.HERMES_URL?.trim() ?? ''
const HERMES_TOKEN = process.env.HERMES_TOKEN?.trim() ?? ''

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  if (!HERMES_BASE || !HERMES_TOKEN) {
    return NextResponse.json({ error: 'Hermes not configured' }, { status: 503 })
  }

  const path = params.path.join('/')
  const targetUrl = `${HERMES_BASE}/api/hermes/${path}`

  // Build query string
  const url = new URL(request.url)
  const queryString = url.searchParams.toString()
  const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl

  // Read body for mutating methods
  let body: BodyInit | null = null
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    body = await request.blob()
  }

  try {
    const response = await fetch(fullUrl, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${HERMES_TOKEN}`,
        'Content-Type': request.headers.get('content-type') || 'application/json',
      },
      body,
    })

    // Read response body
    const responseBody = await response.blob()

    // Forward response headers (selectively)
    const headers: Record<string, string> = {
      'content-type': response.headers.get('content-type') || 'application/json',
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers,
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Hermes proxy error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 502 },
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
