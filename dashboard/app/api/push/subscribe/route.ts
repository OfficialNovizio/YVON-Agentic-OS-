// POST /api/push/subscribe  — save a browser's Push subscription to Supabase.
// DELETE /api/push/subscribe — remove a subscription (by endpoint) on unsubscribe.
// Auth via supabase session; RLS on push_subscriptions ensures self-only writes.
// Owner: raj · TS-014 WI-3
import { supabaseServer } from '@/lib/supabase-server'

interface SubscribeBody {
  endpoint?: string
  p256dh?: string
  auth?: string
  userAgent?: string
}

export async function POST(request: Request): Promise<Response> {
  let body: SubscribeBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const { endpoint, p256dh, auth, userAgent } = body
  if (!endpoint || !p256dh || !auth) {
    return Response.json({ error: 'endpoint/p256dh/auth required' }, { status: 400 })
  }

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  // Upsert — if same (user_id, endpoint) exists (unique index), just update it.
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: userAgent ?? null,
      },
      { onConflict: 'user_id,endpoint' }
    )

  if (error) {
    return Response.json({ error: String((error as { message?: string })?.message ?? error) }, { status: 500 })
  }
  return Response.json({ ok: true })
}

export async function DELETE(request: Request): Promise<Response> {
  let body: { endpoint?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid JSON' }, { status: 400 })
  }
  if (!body.endpoint) return Response.json({ error: 'endpoint required' }, { status: 400 })

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', body.endpoint)

  if (error) {
    return Response.json({ error: String((error as { message?: string })?.message ?? error) }, { status: 500 })
  }
  return Response.json({ ok: true })
}
