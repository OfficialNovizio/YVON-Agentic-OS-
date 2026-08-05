// CommandCard — renders a command result (author_kind='system') as a glass
// card (TS-020). The result message IS the source of truth; when it starts
// with '/' the leading token is shown as a mono label. Copy button copies the
// message. No invented status — ok/error comes from the content itself.
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
    <div className="chat-glass my-1.5 flex max-w-[92%] items-start gap-2.5 px-3 py-2.5">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          isError ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
        }`}
      >
        {isError ? <TriangleAlert className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
      </span>
      <div className="min-w-0 flex-1">
        {label && (
          <div className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--chat-text-faint)]">
            {label}
          </div>
        )}
        <p className="mt-0.5 whitespace-pre-wrap text-[12px] leading-relaxed text-[var(--chat-text-dim)]">
          {content}
        </p>
        <div className="mt-1 text-[9px] uppercase tracking-widest text-[var(--chat-text-faint)]">
          system · {createdAt}
        </div>
      </div>
      <button
        onClick={copy}
        aria-label="Copy result"
        className="shrink-0 rounded-md p-1 text-[var(--chat-text-faint)] transition hover:bg-white/[0.06] hover:text-[var(--chat-text)]"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
