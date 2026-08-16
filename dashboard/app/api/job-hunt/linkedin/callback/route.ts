/**
 * GET /api/job-hunt/linkedin/callback — exchanges the OAuth code for an
 * access token, fetches the operator's identity via LinkedIn's OIDC
 * userinfo endpoint, and stores the connection (linkedin_connection is
 * kept as a single-row table: any prior connection is replaced). Ported
 * from the operator's own YVON-OS app/api/linkedin/callback/route.ts,
 * adapted to the job_hunt_source_keys credential lookup (see connect/route.ts)
 * and to OIDC's `sub` claim as the member id, per LinkedIn's current
 * "Sign In with LinkedIn using OpenID Connect" product (the old /v2/me
 * numeric-id flow is deprecated).
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

function getCookie(req: NextRequest, name: string): string | null {
  const raw = req.headers.get('cookie') ?? ''
  const match = raw.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return Response.redirect(new URL(`/job-hunt/linkedin?error=${errorParam}`, req.url))
  }
  if (!code) {
    return Response.redirect(new URL('/job-hunt/linkedin?error=missing_code', req.url))
  }

  const expectedState = getCookie(req, 'jh_li_state')
  if (expectedState && state !== expectedState) {
    return Response.redirect(new URL('/job-hunt/linkedin?error=state_mismatch', req.url))
  }

  try {
    const sb = getServiceClient()
    const { data: keyRow } = await sb.from('job_hunt_source_keys').select('config').eq('source', 'linkedin').maybeSingle()
    const config = (keyRow?.config ?? {}) as { client_id?: string; client_secret?: string; redirect_uri?: string }

    if (!config.client_id || !config.client_secret) {
      return Response.redirect(new URL('/job-hunt/linkedin?error=not_configured', req.url))
    }

    const redirectUri = config.redirect_uri || new URL('/api/job-hunt/linkedin/callback', req.url).toString()

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: config.client_id,
        client_secret: config.client_secret,
      }),
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      return Response.redirect(new URL(`/job-hunt/linkedin?error=token_exchange_failed&detail=${encodeURIComponent(text.slice(0, 200))}`, req.url))
    }

    const tokenData = await tokenRes.json() as { access_token: string; expires_in?: number }

    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    if (!userRes.ok) {
      return Response.redirect(new URL('/job-hunt/linkedin?error=userinfo_failed', req.url))
    }
    const user = await userRes.json() as { sub: string; name?: string; headline?: string }

    const tokenExpiry = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null

    // Single-connection table — clear any prior row before inserting.
    await sb.from('linkedin_connection').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await sb.from('linkedin_connection').insert({
      access_token: tokenData.access_token,
      person_id: user.sub,
      person_name: user.name ?? 'LinkedIn member',
      person_headline: user.headline ?? null,
      token_expiry: tokenExpiry,
    })

    const res = Response.redirect(new URL('/job-hunt/linkedin?connected=1', req.url))
    res.headers.append('Set-Cookie', 'jh_li_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
    return res
  } catch (err) {
    return Response.redirect(new URL(`/job-hunt/linkedin?error=${encodeURIComponent(String(err)).slice(0, 200)}`, req.url))
  }
}
