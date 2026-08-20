// CommandCard — a command result (author_kind='system') as a gallery plaque.
//
// The result message IS the source of truth; when it starts with '/' the
// leading token is shown as a mono label. Copy copies the message. No invented
// status — ok/error comes from the content itself. Restyled 2026-08-17 (Adora):
// white card, hairline border, a lime-pop dot for success and a soft red for
// failures — pastels stay decorative, never a solid button fill.
'use client'

import { useState } from 'react'
import { Check, Copy, TriangleAlert } from 'lucide-react'

export function CommandCard({ content, createdAt }: { content: string; createdAt: string }) {
  const [copied, setCopied] = useState(false)
  const firstLine = content.split('\n')[0] ?? ''
  const looksLikeCommand = firstLine.trim().startsWith('/')
  const label = looksLikeCommand ? firstLine.trim().split(/\s+/)[0] : null
  // Error detection: plain heuristics on the real text — never invented status.
  const isError =
    /(did not run|failed|FAILED|unknown command|blocked|error)/i.test(content.slice(0, 200)) ||
    content.trim().startsWith('❌')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="chat-agent-card group flex w-full max-w-[92%] items-start gap-3 px-5 py-4">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          background: isError ? 'rgba(239,68,68,0.1)' : 'rgba(162,234,19,0.2)',
          color: isError ? '#b91c1c' : '#587000',
        }}
      >
        {isError ? <TriangleAlert className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
      </span>

      <div className="min-w-0 flex-1">
        {label && (
          <div className="chat-mono font-semibold uppercase text-[var(--chat-accent)]">{label}</div>
        )}
        <p className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.6] text-[var(--chat-body)]">
          {content}
        </p>
        <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[var(--chat-text-faint)]">
          system · {createdAt}
        </div>
      </div>

      <button
        onClick={copy}
        aria-label="Copy result"
        className="chat-ghost-btn h-7 w-7 shrink-0 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
      >
        {copied ? <Check className="h-3.5 w-3.5" style={{ color: '#587000' }} /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
