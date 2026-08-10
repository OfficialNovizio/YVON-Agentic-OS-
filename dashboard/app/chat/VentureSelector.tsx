// VentureSelector — top-bar venture picker (TS-023).
// Lists REAL ventures from /api/ventures; writes the same yvon_active_venture
// cookie /switch uses (via /api/set-venture), so selecting here changes the
// workspace context for the next message. Defaults to yvon-os when no cookie.
// Reloads the page so every surface (top bar, stream context) picks it up.
'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useWorkspace } from '@/lib/WorkspaceContext'

export function VentureSelector() {
  const { ventures } = useWorkspace()
  const [active, setActive] = useState<string>('yvon-os')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // TS-030: read from the SHARED venture store (no own fetch) — so a new
    // venture appears here instantly. Validate the cookie against the list;
    // a stale/unknown cookie (e.g. 'agentx') falls back to yvon-os.
    const match = document.cookie.match(/(?:^|;\s*)yvon_active_venture=([^;]+)/)
    const cookieVenture = match ? decodeURIComponent(match[1]) : null
    const real = ventures.some((v) => v.slug === cookieVenture)
    setActive(real && cookieVenture ? cookieVenture : 'yvon-os')
  }, [ventures])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const select = async (slug: string) => {
    if (slug === active) {
      setOpen(false)
      return
    }
    setBusy(true)
    try {
      await fetch('/api/set-venture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventureSlug: slug }),
      })
      // Reload so every surface (stream context, top bar) picks up the cookie.
      window.location.reload()
    } catch {
      setBusy(false)
      setOpen(false)
    }
  }

  const current = ventures.find((v) => v.slug === active) ?? { slug: active, name: active, color: undefined }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-lg border border-[var(--chat-hairline-soft)] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--chat-text)] transition hover:bg-white/[0.06] disabled:opacity-50"
        aria-label="Switch venture"
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: current.color ?? '#6366f1' }}
        />
        <span className="max-w-[120px] truncate">{current.name ?? active}</span>
        <ChevronDown className="h-3 w-3 text-[var(--chat-text-faint)]" />
      </button>

      {open && (
        <div className="chat-glass absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden p-1">
          <div className="px-2 pb-1 pt-1.5 text-[9px] font-semibold uppercase tracking-widest text-[var(--chat-text-faint)]">
            working venture
          </div>
          {ventures.map((v) => (
            <button
              key={v.slug}
              onClick={() => select(v.slug)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/[0.06]"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: v.color ?? '#6366f1' }}
              />
              <span className="flex-1 truncate text-[11.5px] text-[var(--chat-text)]">{v.name}</span>
              <span className="font-mono text-[9px] text-[var(--chat-text-faint)]">{v.slug}</span>
              {v.slug === active && <Check className="h-3 w-3 text-[var(--chat-accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
