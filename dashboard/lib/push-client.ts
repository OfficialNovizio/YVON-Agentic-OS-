// Browser-side Web Push helpers — subscribe/unsubscribe from notifications.
// Owner: mia · TS-014 WI-3
'use client'

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

/** Detects whether the browser can do Web Push at all. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function pushPermission(): PushPermissionState {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission as PushPermissionState
}

/** Convert URL-safe base64 (VAPID public key) to Uint8Array for browser API. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/**
 * Full subscribe flow — asks for permission, registers the SW if needed,
 * subscribes to Push, POSTs the subscription to /api/push/subscribe.
 *
 * Returns:
 *   { ok: true }                    — subscribed successfully
 *   { ok: false, reason: '...' }    — user denied / browser blocks / VAPID missing
 */
export async function enablePush(vapidPublicKey: string): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  if (!isPushSupported()) return { ok: false, reason: 'browser does not support push' }
  if (!vapidPublicKey) return { ok: false, reason: 'VAPID public key missing' }

  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return { ok: false, reason: `permission ${perm}` }

  // Register / get the service worker
  const reg = (await navigator.serviceWorker.getRegistration('/')) ??
    (await navigator.serviceWorker.register('/sw.js', { scope: '/' }))
  await navigator.serviceWorker.ready

  // Reuse existing subscription if one exists (idempotent)
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    // The PushManager typing across DOM lib versions is finicky about
    // Uint8Array<ArrayBufferLike> vs BufferSource — cast to unknown then Uint8Array
    // to satisfy every TS lib version. Runtime behavior is identical.
    const appServerKey = urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
    })
  }

  // Extract the p256dh + auth keys from the browser's subscription object
  const rawKey = sub.getKey('p256dh')
  const rawAuth = sub.getKey('auth')
  if (!rawKey || !rawAuth) return { ok: false, reason: 'subscription missing keys' }

  const b64 = (buf: ArrayBuffer) =>
    window.btoa(String.fromCharCode(...new Uint8Array(buf)))

  const payload = {
    endpoint: sub.endpoint,
    p256dh: b64(rawKey),
    auth: b64(rawAuth),
    userAgent: navigator.userAgent,
  }

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return { ok: false, reason: `server ${res.status}: ${await res.text().catch(() => '')}` }

  return { ok: true }
}

export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return
  const reg = await navigator.serviceWorker.getRegistration('/')
  const sub = await reg?.pushManager.getSubscription()
  if (sub) {
    const endpoint = sub.endpoint
    await sub.unsubscribe()
    // Best-effort delete from the server; ignore failures
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    }).catch(() => {})
  }
}
