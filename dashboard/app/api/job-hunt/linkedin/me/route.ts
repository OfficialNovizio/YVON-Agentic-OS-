/**
 * GET /api/job-hunt/linkedin/me — current connection status for the LinkedIn
 * tab's UI. Never returns the raw access token.
 */

import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET() {
  try {
    const sb = getServiceClient()

    const { data: keyRow } = await sb.from('job_hunt_source_keys').select('config').eq('source', 'linkedin').maybeSingle()
    const config = (keyRow?.config ?? {}) as { client_id?: string }
    const appConfigured = Boolean(config.client_id)

    const { data: conn } = await sb
      .from('linkedin_connection')
      .select('person_name, person_headline, token_expiry, connected_at')
      .order('connected_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const expired = conn?.token_expiry ? new Date(conn.token_expiry).getTime() < Date.now() : false

    return Response.json({
      app_configured: appConfigured,
      connected: Boolean(conn) && !expired,
      expired,
      person_name: conn?.person_name ?? null,
      person_headline: conn?.person_headline ?? null,
      connected_at: conn?.connected_at ?? null,
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
