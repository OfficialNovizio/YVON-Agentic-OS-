import { NextRequest } from 'next/server'
import { supabase }    from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: { post_id: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { post_id } = body
  if (!post_id) return Response.json({ error: 'post_id is required' }, { status: 400 })

  // Get connection
  const { data: conn } = await supabase
    .from('linkedin_connection')
    .select('access_token, person_id, token_expiry')
    .limit(1)
    .single()

  if (!conn) return Response.json({ error: 'LinkedIn not connected' }, { status: 401 })
  if (conn.token_expiry && new Date(conn.token_expiry) < new Date()) {
    return Response.json({ error: 'LinkedIn token expired — reconnect' }, { status: 401 })
  }

  // Get post content
  const { data: post } = await supabase
    .from('linkedin_posts')
    .select('content')
    .eq('id', post_id)
    .single()

  if (!post) return Response.json({ error: 'Post not found' }, { status: 404 })

  // Publish via LinkedIn UGC Posts API
  const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization:              `Bearer ${conn.access_token}`,
      'Content-Type':             'application/json',
      'X-Restli-Protocol-Version':'2.0.0',
    },
    body: JSON.stringify({
      author:        `urn:li:person:${conn.person_id}`,
      lifecycleState:'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary:   { text: post.content },
          shareMediaCategory:'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  })

  if (!liRes.ok) {
    const errText = await liRes.text()
    return Response.json({ error: `LinkedIn API error: ${errText}` }, { status: 502 })
  }

  const liData  = await liRes.json() as { id: string }
  const postId  = liData.id

  // Mark as published in DB
  await supabase
    .from('linkedin_posts')
    .update({
      status:           'published',
      published_at:     new Date().toISOString(),
      linkedin_post_id: postId,
    })
    .eq('id', post_id)

  return Response.json({ ok: true, linkedin_post_id: postId })
}
