// Registers /sw.js as soon as the app mounts on the client. Silent no-op if
// unsupported. Runs in every authenticated route via the root layout.
// Owner: mia · TS-014 WI-2
'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => {
        // Non-fatal; log to console for debugging
        // eslint-disable-next-line no-console
        console.warn('[sw] registration failed:', err)
      })
  }, [])
  return null
}
