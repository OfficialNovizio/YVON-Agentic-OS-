// Server-side Web Push helpers — send notifications to subscriber endpoints.
// Requires VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT in Vercel env.
//
// Setup (one-time):
//   npx web-push generate-vapid-keys
//   Add the public + private keys to Vercel env vars (Production + Preview).
//   VAPID_SUBJECT = "mailto:you@example.com" (contact for push service abuse).
//
// If any var is missing, sendPush() returns { sent: false, reason: 'not configured' }
// and chat continues without pushes — no crash.
//
// Owner: raj · TS-014 WI-3
import webpush from 'web-push'

let configured = false
function ensureConfigured(): boolean {
  if (configured) return true
  const pub = process.env.VAPID_PUBLIC_KEY?.trim()
  const priv = process.env.VAPID_PRIVATE_KEY?.trim()
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:chat.gpt73890@gmail.com'
  if (!pub || !priv) return false
  try {
    webpush.setVapidDetails(subject, pub, priv)
    configured = true
    return true
  } catch {
    return false
  }
}

export interface PushSubscriptionRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

export interface NotificationPayload {
  title: string
  body: string
  /** Deep link URL (e.g. /chat?room=<id>) */
  url?: string
  /** Notifications with the same tag replace each other (per-room grouping) */
  tag?: string
  /** Optional icon override (defaults to the app icon) */
  icon?: string
  /** For click-through analytics later */
  messageId?: string
  roomId?: string
}

export interface PushResult {
  sent: boolean
  reason?: string
  /** Per-subscription outcome — useful for pruning dead endpoints */
  results?: Array<{ endpoint: string; ok: boolean; status?: number; error?: string }>
}

/**
 * Send a push notification to every subscription in `subs`.
 * Best-effort: individual subscription failures don't throw.
 * A 404/410 response means the sub is dead and should be pruned by the caller.
 */
export async function sendPush(
  subs: PushSubscriptionRow[],
  payload: NotificationPayload
): Promise<PushResult> {
  if (!ensureConfigured()) {
    return { sent: false, reason: 'VAPID keys not set in Vercel env' }
  }
  if (subs.length === 0) {
    return { sent: false, reason: 'no subscriptions' }
  }

  const body = JSON.stringify(payload)
  const results = await Promise.all(
    subs.map(async (sub) => {
      try {
        const res = await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
          { TTL: 60 * 60, urgency: 'normal' }
        )
        return { endpoint: sub.endpoint, ok: true, status: res.statusCode }
      } catch (err) {
        const status = (err as { statusCode?: number })?.statusCode
        const message = err instanceof Error ? err.message : String(err)
        return { endpoint: sub.endpoint, ok: false, status, error: message }
      }
    })
  )

  return { sent: results.some((r) => r.ok), results }
}
