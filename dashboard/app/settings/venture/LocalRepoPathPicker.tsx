// LocalRepoPathPicker — "Browse…" button + folder-navigation popover for
// the Local Repo Path field (Settings → Venture → Technical).
//
// Why this exists instead of a native file picker (2026-08-11 feedback):
// browsers never expose a real filesystem path to a webpage — even
// `showDirectoryPicker()` only returns a folder handle + its bare name, by
// design (security sandbox), never `/Users/you/...`. This dashboard's
// server runs on the same machine as the paths that matter here, so instead
// this browses real directories server-side (/api/fs/list-dirs, scoped to
// the home directory) and fills the field on selection — same practical
// result as a native picker, without pretending browsers can do something
// they structurally can't.
//
// Portal fix (2026-08-11 feedback): `.glass-card` (globals.css) sets
// `backdrop-filter`, which — per the CSS spec — creates a NEW stacking
// context on every card. A z-index set on a descendant of one card can
// never outrank a LATER sibling card's own stacking context, no matter how
// high the number; that's why the popover was rendering underneath the AI
// Provider / Security cards despite `z-50`. Fixed by portalling the
// popover straight to document.body — position: fixed, coordinates read
// from the trigger button's real screen position — so it escapes every
// ancestor's stacking context entirely instead of trying to out-rank them.
//
// Owner: mia · Local Repo Path picker, 2026-08-11
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Folder, FolderOpen, ArrowUp, X, Check } from 'lucide-react'

interface ListResult {
  cwd: string
  parent: string | null
  root: string
  dirs: string[]
}

export function LocalRepoPathPicker({ value, onSelect }: { value: string; onSelect: (path: string) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ListResult | null>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (popoverRef.current?.contains(t)) return
      setOpen(false)
    }
    const onScrollOrResize = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    // Simplest correct behavior for a fixed-position popover: close rather
    // than track scroll (avoids stale coordinates chasing the trigger).
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [])

  const load = async (path?: string) => {
    setLoading(true)
    setError('')
    try {
      const qs = path ? `?path=${encodeURIComponent(path)}` : ''
      const res = await fetch(`/api/fs/list-dirs${qs}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Failed to list directory')
      } else {
        setResult(data as ListResult)
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  const openPicker = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 6, left: rect.left })
    }
    setOpen(true)
    load(value && value.trim() ? value : undefined)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openPicker}
        className="text-xs text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1 mt-1"
      >
        <FolderOpen size={12} /> Browse…
      </button>

      {open && coords &&
        createPortal(
          <div
            ref={popoverRef}
            className="glass-card fixed z-[9999] w-96 overflow-hidden p-3"
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Choose a folder</span>
              <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={14} />
              </button>
            </div>

            {result && (
              <div className="text-[11px] font-mono text-on-surface-variant/70 mb-2 truncate" title={result.cwd}>
                {result.cwd}
              </div>
            )}

            {error && <div className="text-xs text-red-400 mb-2">{error}</div>}

            <div className="max-h-56 overflow-y-auto rounded-lg border border-white/[0.06]">
              {result?.parent && (
                <button
                  onClick={() => load(result.parent as string)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-on-surface-variant hover:bg-white/[0.04] text-left"
                >
                  <ArrowUp size={13} /> ..
                </button>
              )}
              {loading && <div className="px-2.5 py-3 text-xs text-on-surface-variant/50">Loading…</div>}
              {!loading && result && result.dirs.length === 0 && !result.parent && (
                <div className="px-2.5 py-3 text-xs text-on-surface-variant/50">No subfolders here</div>
              )}
              {!loading &&
                result?.dirs.map((name) => (
                  <button
                    key={name}
                    onClick={() => load(`${result.cwd}/${name}`)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-on-surface hover:bg-white/[0.04] text-left truncate"
                  >
                    <Folder size={13} className="shrink-0 text-on-surface-variant" /> {name}
                  </button>
                ))}
            </div>

            <button
              disabled={!result}
              onClick={() => {
                if (result) {
                  onSelect(result.cwd)
                  setOpen(false)
                }
              }}
              className="btn-accent w-full mt-2.5 flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 disabled:opacity-50"
            >
              <Check size={13} /> Select this folder
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}
