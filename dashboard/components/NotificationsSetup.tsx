// NotificationsSetup — soft banner shown on /chat first visit.
// Prompts for Web Push permission; dismissable; remembers user choice in localStorage.
// Owner: mia · TS-014 WI-5
'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { enablePush, isPushSupported, pushPermission } from '@/lib/push-client'

const DISMISS_KEY = 'yvon-notif-banner-dismissed'

export function NotificationsSetup() {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<'idle' | 'enabling' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isPushSupported()) return
    if (pushPermission() !== 'default') return
    if (typeof window !== 'undefined' && window.localStorage.getItem(DISMISS_KEY) === '1') return
    // Hide the banner entirely if the server hasn't been configured yet —
    // clicking Enable would just fail immediately.
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return
    setVisible(true)
  }, [])

  async function enable() {
    setStatus('enabling')
    setError('')
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!key) {
      setStatus('error')
      setError('Server not configured for notifications.')
      return
    }
    const res = await enablePush(key)
    if (res.ok) {
      setVisible(false)
    } else {
      setStatus('error')
      setError(res.reason)
      // If user denied, don't nag them again this session
      if (res.reason.includes('denied')) {
        try {
          window.localStorage.setItem(DISMISS_KEY, '1')
        } catch {
          // ignore storage errors
        }
      }
    }
  }

  function dismiss() {
    setVisible(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore storage errors
    }
  }

  if (!visible) return null

  return (
    <div className="mb-3 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-3 text-[13px] text-on-surface">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Bell className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">Get notified when agents reply</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-on-surface-variant">
          {status === 'error' ? (
            <span className="text-error">{error}</span>
          ) : (
            <>
              Enable browser notifications so you don&rsquo;t miss messages while working in
              another tab. Works on desktop, iPhone (add to home screen first), and Android.
            </>
          )}
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={enable}
            disabled={status === 'enabling'}
            className="rounded-md bg-primary px-3 py-1 text-[12px] font-semibold text-[#06121f] transition hover:opacity-90 disabled:opacity-50"
          >
            {status === 'enabling' ? 'Enabling…' : 'Enable'}
          </button>
          <button
            onClick={dismiss}
            className="rounded-md border border-white/10 px-3 py-1 text-[12px] text-on-surface-variant transition hover:border-white/20 hover:text-on-surface"
          >
            Later
          </button>
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
