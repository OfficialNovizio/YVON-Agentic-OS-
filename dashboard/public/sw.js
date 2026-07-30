// Service Worker — TS-014 WI-4
//
// Handles Web Push events. Not offline-caching anything in v1 (Vercel serves
// the app fast enough; offline mode adds complexity we don't need yet).
//
// Lifecycle:
//   install  → skip waiting (activate immediately on new deploys)
//   activate → claim all clients (take control without a reload)
//   push     → showNotification with the payload
//   click    → focus existing tab OR open /chat

const CACHE_NAME = 'yvon-os-sw-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ── Push event — show a notification ────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {}
  try {
    if (event.data) data = event.data.json()
  } catch (_) {
    // Payload isn't JSON — fall back to plain text
    data = { title: 'YVON OS', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'YVON OS'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon',
    badge: '/apple-icon',
    tag: data.tag,             // group notifications by tag (e.g. per-room)
    data: {
      url: data.url || '/chat',
      messageId: data.messageId,
      roomId: data.roomId,
    },
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Click event — focus / open the app ──────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/chat'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Prefer an already-open dashboard window
        for (const client of clientList) {
          const url = new URL(client.url)
          if (url.origin === self.location.origin) {
            // Navigate the existing window to targetUrl then focus
            return client.focus().then(() => client.navigate(targetUrl))
          }
        }
        // Otherwise open a new window at the target URL
        return self.clients.openWindow(targetUrl)
      })
  )
})
