// CaptureProgressCard — live progress for the stealth-browser reference
// capture relay (2026-09-07). While the agent works, the wrapper streams
// capture.progress frames (stage + honest pct + detail + elapsed) and ends
// with capture.done carrying the published preview/report URLs and the
// capture's measured digest. Every number here is measured — stage-based
// honest percentages, never a fake spinner.
//
// Owner: mia/dev · reference-capture relay, 2026-09-07
'use client'

import { ExternalLink, FileText, Loader2, Radar, TriangleAlert } from 'lucide-react'

export interface CaptureProgressState {
  stage: string
  pct: number
  detail: string
  elapsedS: number
}

export interface CaptureDonePayload {
  url: string
  out: string
  previewUrl?: string
  reportUrl?: string
  seconds?: number
  summary?: Record<string, string | number>
}

const STAGE_LABELS: Record<string, string> = {
  dispatch: 'queued for the capture relay',
  claimed: 'stealth browser capturing',
  bundle: 'bundle arriving — unpacking',
  done: 'capture published',
}

export function CaptureProgressCard({
  progress,
  done,
}: {
  progress: CaptureProgressState | null
  done: CaptureDonePayload | null
}) {
  if (!progress && !done) return null

  if (progress && !done) {
    const failed = progress.stage === 'failed' || progress.stage === 'timeout' || progress.stage === 'error'
    const label = STAGE_LABELS[progress.stage] ?? progress.stage
    return (
      <div className="relative z-10 px-4 pb-2 sm:px-8">
        <div className="mx-auto w-full max-w-[780px] rounded-[18px] border border-[var(--chat-hairline)] bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--chat-body)]">
            {failed ? (
              <TriangleAlert size={14} className="text-amber-600" />
            ) : (
              <Loader2 size={14} className="animate-spin text-[var(--chat-accent)]" />
            )}
            {failed ? 'Reference capture stopped' : 'Capturing the reference site'}
            <span className="ml-auto chat-mono text-[11px] text-[var(--chat-text-faint)]">
              {progress.pct}% · {Math.round(progress.elapsedS)}s
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--chat-surface-strong)]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${failed ? 'bg-amber-500' : 'bg-[var(--chat-accent)]'}`}
              style={{ width: `${Math.max(3, Math.min(100, progress.pct))}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11.5px] text-[var(--chat-text-dim)]">
            {progress.detail || label}
          </div>
        </div>
      </div>
    )
  }
  // done state — the published capture card (preview + report + digest)
  const d = done as CaptureDonePayload
  const entries = d.summary ? Object.entries(d.summary).slice(0, 8) : []
  return (
    <div className="relative z-10 px-4 pb-2 sm:px-8">
      <div className="mx-auto w-full max-w-[780px] overflow-hidden rounded-[18px] border border-[var(--chat-hairline)] bg-white">
        <div className="flex items-center gap-2 border-b border-[var(--chat-hairline)] px-4 py-3">
          <Radar size={14} className="text-[var(--chat-accent)]" />
          <span className="text-[12.5px] font-medium text-[var(--chat-body)]">
            Reference captured
          </span>
          <span className="chat-mono ml-auto text-[11px] text-[var(--chat-text-faint)]">
            {d.seconds !== undefined ? `${d.seconds}s round trip` : 'relay'}
          </span>
        </div>
        <div className="px-4 py-3">
          <div className="chat-mono truncate text-[11.5px] text-[var(--chat-text-dim)]" title={d.url}>
            {d.url}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {d.previewUrl && (
              <a
                href={d.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chat-hairline)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--chat-body)] transition-colors hover:border-[var(--chat-accent)] hover:text-[var(--chat-accent)]"
              >
                <ExternalLink size={12} /> Open site preview
              </a>
            )}
            {d.reportUrl && (
              <a
                href={d.reportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chat-hairline)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--chat-body)] transition-colors hover:border-[var(--chat-accent)] hover:text-[var(--chat-accent)]"
              >
                <FileText size={12} /> Scrape report (.md)
              </a>
            )}
          </div>
          {entries.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {entries.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="text-[var(--chat-text-faint)]">{k}</span>
                  <span className="chat-mono text-[var(--chat-body)]">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
