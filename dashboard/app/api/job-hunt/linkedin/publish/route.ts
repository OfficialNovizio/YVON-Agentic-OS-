/**
 * POST /api/job-hunt/linkedin/publish — publishes a drafted post to LinkedIn
 * via the official UGC Posts API (w_member_social scope), using the stored
 * connection's access token. Ported from the operator's own YVON-OS
 * app/api/linkedin/publish/route.ts, adapted to this project's Content Lab
 * schema (linkedin_posts) and OIDC `sub`-based author URN (see callback/route.ts).
 * This is the only route that actually touches the operator's real LinkedIn
 * account — every other Content Lab action (idea capture, AI expand, save
 * draft) is local-only. Requires an active connection; never auto-triggered.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  let body: { post_id?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.post_id) return Response.json({ error: 'post_id is required' }, { status: 400 })

  try {
    const sb = getServiceClient()

    const { data: conn } = await sb
      .from('linkedin_connection')
      .select('access_token, person_id, token_expiry')
      .order('connected_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!conn) return Response.json({ error: 'No LinkedIn account connected yet' }, { status: 400 })
    if (conn.token_expiry && new Date(conn.token_expiry).getTime() < Date.now()) {
      return Response.json({ error: 'LinkedIn connection expired — reconnect from the LinkedIn tab' }, { status: 400 })
    }

    const { data: post, error: postErr } = await sb.from('linkedin_posts').select('content, status').eq('id', body.post_id).single()
    if (postErr || !post) return Response.json({ error: 'Post not found' }, { status: 404 })
    if (post.status === 'published') return Response.json({ error: 'Already published' }, { status: 400 })

    const ugcRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${conn.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${conn.person_id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: post.content },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    })

    if (!ugcRes.ok) {
      const text = await ugcRes.text()
      return Response.json({ error: `LinkedIn publish failed: ${text.slice(0, 300)}` }, { status: 502 })
    }

    const linkedinPostId = ugcRes.headers.get('x-restli-id') ?? (await ugcRes.json().catch(() => ({})))?.id ?? null

    const { data: updated, error: updateErr } = await sb
      .from('linkedin_posts')
      .update({ status: 'published', published_at: new Date().toISOString(), linkedin_post_id: linkedinPostId })
      .eq('id', body.post_id)
      .select()
      .single()

    if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })
    return Response.json({ post: updated })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
