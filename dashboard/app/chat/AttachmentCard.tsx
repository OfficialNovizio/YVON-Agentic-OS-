// AttachmentCard — renders one attachment in the message stream.
// Image → thumbnail; Audio → waveform + play button; File → icon + name/size.
// Signed URLs are fetched on mount (cached in a module-level Map).
// Owner: mia · TS-016 WI-3
'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Play, Pause, Download } from 'lucide-react'
import { signedUrl } from '@/lib/attachments-client'

const urlCache = new Map<string, { url: string; expires: number }>()

async function getUrl(storagePath: string): Promise<string | null> {
  const now = Date.now()
  const cached = urlCache.get(storagePath)
  if (cached && cached.expires > now) return cached.url
  const url = await signedUrl(storagePath, 60 * 60)
  if (url) urlCache.set(storagePath, { url, expires: now + 55 * 60 * 1000 })
  return url
}

export interface AttachmentCardProps {
  id: string
  storagePath: string
  filename: string
  mimeType: string
  sizeBytes: number
  durationMs?: number | null
  waveform?: number[] | null
}

export function AttachmentCard(a: AttachmentCardProps) {
  const isImage = a.mimeType.startsWith('image/')
  const isAudio = a.mimeType.startsWith('audio/')

  if (isImage) return <ImageAttachment {...a} />
  if (isAudio) return <AudioAttachment {...a} />
  return <FileAttachment {...a} />
}

function ImageAttachment({ storagePath, filename }: AttachmentCardProps) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    getUrl(storagePath).then((u) => { if (!cancelled) setUrl(u) })
    return () => { cancelled = true }
  }, [storagePath])

  return (
    <a
      href={url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-xs overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02]"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={filename} className="h-auto max-h-64 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center text-[11px] text-on-surface-variant/60">
          Loading…
        </div>
      )}
    </a>
  )
}

function AudioAttachment({ storagePath, filename, durationMs, waveform }: AttachmentCardProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let cancelled = false
    getUrl(storagePath).then((u) => { if (!cancelled) setUrl(u) })
    return () => { cancelled = true }
  }, [storagePath])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setProgress(el.duration ? el.currentTime / el.duration : 0)
    const onEnd = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnd)
    }
  }, [url])

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { void el.play(); setPlaying(true) }
  }

  const bars = waveform ?? new Array(32).fill(0.4)
  const durLabel = durationMs ? formatDuration(durationMs) : '—:—'

  return (
    <div className="flex max-w-md items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <button
        onClick={toggle}
        disabled={!url}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[#06121f] transition hover:opacity-90 disabled:opacity-40"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="flex flex-1 items-center gap-0.5">
        {bars.map((h, i) => {
          const played = i / bars.length <= progress
          return (
            <span
              key={i}
              className="w-[3px] shrink-0 rounded-full transition-colors"
              style={{
                height: `${Math.max(4, h * 24)}px`,
                background: played ? 'var(--ws-accent, #6366F1)' : 'rgba(255,255,255,0.20)',
              }}
            />
          )
        })}
      </div>
      <span className="shrink-0 font-mono text-[11px] text-on-surface-variant">{durLabel}</span>
      {url && <audio ref={audioRef} src={url} preload="metadata" />}
      {/* SR hidden fallback link */}
      <span className="sr-only">{filename}</span>
    </div>
  )
}

function FileAttachment({ storagePath, filename, sizeBytes }: AttachmentCardProps) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    getUrl(storagePath).then((u) => { if (!cancelled) setUrl(u) })
    return () => { cancelled = true }
  }, [storagePath])

  return (
    <a
      href={url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      download={filename}
      className="flex max-w-md items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 transition hover:border-white/20"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
        <FileText className="h-4 w-4 text-on-surface-variant" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] text-on-surface">{filename}</div>
        <div className="text-[11px] text-on-surface-variant/70">{formatBytes(sizeBytes)}</div>
      </div>
      <Download className="h-4 w-4 shrink-0 text-on-surface-variant/70" />
    </a>
  )
}

// ── helpers ────────────────────────────────────────────────────────
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}
