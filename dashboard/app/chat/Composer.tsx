// Composer — bottom of /chat. Textarea + @mention autocomplete + send button.
// Owner: mia · TS-009 Push C2
'use client'

import { useMemo, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { FLEET } from '@/lib/fleet'

interface ComposerProps {
  sending: boolean
  disabled?: boolean
  disabledReason?: string
  onSend: (content: string, mentions: string[]) => Promise<void> | void
}

export function Composer({ sending, disabled, disabledReason, onSend }: ComposerProps) {
  const [text, setText] = useState('')
  const [caretPos, setCaretPos] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // @mention completion — find the incomplete handle at the caret.
  const activeQuery = useMemo(() => {
    if (caretPos == null) return null
    const upToCaret = text.slice(0, caretPos)
    const match = upToCaret.match(/@([a-z0-9-]*)$/i)
    return match ? match[1].toLowerCase() : null
  }, [text, caretPos])

  const suggestions = useMemo(() => {
    if (activeQuery == null) return []
    return FLEET.filter(
      (a) => a.id.startsWith(activeQuery) || a.name.toLowerCase().startsWith(activeQuery)
    ).slice(0, 6)
  }, [activeQuery])

  function completeMention(agentId: string) {
    if (caretPos == null) return
    const before = text.slice(0, caretPos).replace(/@([a-z0-9-]*)$/i, `@${agentId} `)
    const after = text.slice(caretPos)
    const next = before + after
    setText(next)
    const newPos = before.length
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(newPos, newPos)
      setCaretPos(newPos)
    })
  }

  const mentions = useMemo(() => {
    return Array.from(text.matchAll(/@([a-z][a-z0-9-]*)/g), (m) => m[1])
  }, [text])

  async function submit() {
    const content = text.trim()
    if (!content || sending) return
    try {
      await onSend(content, Array.from(new Set(mentions)))
      setText('')
    } catch {
      // Parent shows the error; keep the text so the user can retry.
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const isDisabled = disabled || sending

  return (
    <div className="border-t border-white/[0.06] bg-black/20 p-3 md:p-4">
      {disabled && disabledReason && (
        <div className="mb-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-on-surface-variant">
          {disabledReason}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mb-2 overflow-hidden rounded-lg border border-white/10 bg-surface-container">
          {suggestions.map((a) => (
            <button
              key={a.id}
              onClick={() => completeMention(a.id)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] transition hover:bg-white/[0.05]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: a.color }}
              />
              <span className="font-mono text-on-surface">@{a.id}</span>
              <span className="text-on-surface-variant">{a.name}</span>
              <span className="ml-auto text-[10px] text-on-surface-variant/60">{a.department}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setCaretPos(e.target.selectionStart)
          }}
          onSelect={(e) => setCaretPos((e.target as HTMLTextAreaElement).selectionStart)}
          onKeyDown={onKeyDown}
          disabled={isDisabled}
          rows={2}
          placeholder="Message the team… Use @agent-id to target a specific agent. Enter to send, Shift+Enter for newline."
          className="flex-1 resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 focus:border-white/25 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={isDisabled || text.trim().length === 0}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-[#06121f] transition hover:opacity-90 disabled:opacity-40"
          aria-label="Send"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
