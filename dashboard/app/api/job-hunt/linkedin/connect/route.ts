/**
 * GET /api/job-hunt/linkedin/connect — starts the LinkedIn OAuth
 * authorization-code flow (official API, "Sign In with LinkedIn using
 * OpenID Connect" + "Share on LinkedIn" products — not scraping). Ported
 * from the operator's own YVON-OS app/api/linkedin/connect/route.ts logic,
 * adapted to read the app's Client ID/Secret from job_hunt_source_keys
 * (source='linkedin') instead of raw env vars, matching the Adzuna key
 * pattern already built for Discover. Needs the operator to create a real
 * LinkedIn Developer App and save its Client ID/Secret via Settings before
 * this does anything — see the LinkedIn tab's "App credentials" card.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  try {
    const sb = getServiceClient()
    const { data } = await sb.from('job_hunt_source_keys').select('config').eq('source', 'linkedin').maybeSingle()
    const config = (data?.config ?? {}) as { client_id?: string; redirect_uri?: string }

    if (!config.client_id) {
      return Response.redirect(new URL('/job-hunt/linkedin?error=not_configured', req.url))
    }

    const redirectUri = config.redirect_uri || new URL('/api/job-hunt/linkedin/callback', req.url).toString()
    const state = randomBytes(16).toString('hex')

    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', config.client_id)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('scope', 'openid profile w_member_social')

    const res = Response.redirect(authUrl.toString())
    res.headers.append('Set-Cookie', `jh_li_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`)
    return res
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
