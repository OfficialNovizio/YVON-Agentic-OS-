// Composer — the writing desk. Bottom of /chat.
//
// Redesigned 2026-08-17 (Adora): a floating white card with a 30px radius that
// lifts into a soft violet ring on focus. Send logic, mention parsing, the
// command registry, attachments and voice are unchanged — this is a shape and
// interaction pass on top of the existing TS-016/TS-020 behaviour.
//
// Interaction upgrades:
//   · The textarea auto-grows 1 → 8 rows as you type and snaps back on send
//     (it was locked to a single row before, so long messages were typed
//     through a letterbox).
//   · Esc stops an in-flight generation from the keyboard.
//   · A live "⏎ send · ⇧⏎ newline" hint, plus a character counter that only
//     appears once a message gets long.
//   · Starter prompts and other callers can prefill the field (`prefill`).
//   · Slash-command palette and @mention list are gallery cards with keyboard
//     control and a violet selected row.
//
// Owner: mia · TS-016 WI-4 · Adora redesign
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, ArrowUp, Square, X, FileText, Mic, CornerDownLeft } from 'lucide-react'
import { FLEET } from '@/lib/fleet'
import { uploadFiles, type UploadedAttachment } from '@/lib/attachments-client'
import { AttachmentPicker } from './AttachmentPicker'
import { AudioRecorderButton } from './AudioRecorder'
import type { RecordedAudio } from '@/lib/audio-recorder'
import type { CommandInfo } from '@/app/api/chat/commands/route'
import { UsageIndicator } from './UsageIndicator'
import type { TurnUsage } from '@/lib/hermes-client'

export interface ComposerAttachment extends UploadedAttachment {
  /** stable key so previews don't remount on each render */
  key: string
  /** upload status for the previews strip */
  status: 'ready' | 'uploading' | 'error'
  errorMsg?: string
}

interface ComposerProps {
  sending: boolean
  /** True while awaiting an agent reply — swaps Send for Stop. */
  awaitingReply?: boolean
  disabled?: boolean
  disabledReason?: string
  forcedMention?: string | null
  placeholder?: string
  /** Called when user asks to stop the in-flight generation. */
  onStop?: () => void
  onSend: (content: string, mentions: string[], attachments: UploadedAttachment[]) => Promise<void> | void
  /** Current auth user id — passed by parent so we can upload under {userId}/… */
  userId: string
  /** Text pushed in from outside (starter prompts). Consumed once. */
  prefill?: string | null
  onPrefillConsumed?: () => void
  /** Added 2026-08-20 (Task #20): usage/context data from the most recently
   * completed turn's `done` event (see hermes-client.ts's TurnUsage). Null
   * until the first reply of the session lands — the chip row is simply
   * absent until then, never a placeholder guess. */
  usage?: TurnUsage | null
}

const MAX_ROWS_PX = 208 // ≈ 8 rows

export function Composer({
  sending,
  awaitingReply,
  disabled,
  disabledReason,
  forcedMention,
  placeholder,
  onStop,
  onSend,
  userId,
  prefill,
  onPrefillConsumed,
  usage,
}: ComposerProps) {
  const [text, setText] = useState('')
  const [caretPos, setCaretPos] = useState<number | null>(null)
  const [atts, setAtts] = useState<ComposerAttachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // ── Auto-grow ─────────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_PX)}px`
    el.style.overflowY = el.scrollHeight > MAX_ROWS_PX ? 'auto' : 'hidden'
  }, [])
  useEffect(resize, [text, resize])

  // ── Prefill from starter prompts ──────────────────────────────────────
  useEffect(() => {
    if (prefill == null) return
    setText(prefill)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      el?.focus()
      el?.setSelectionRange(prefill.length, prefill.length)
      setCaretPos(prefill.length)
    })
    onPrefillConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill])

  // ── Command popover (TS-020) — real commands from the registry ──────────
  const [cmds, setCmds] = useState<CommandInfo[] | null>(null)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/chat/commands')
        if (!res.ok) return
        const data = (await res.json()) as { commands: CommandInfo[] }
        if (!cancelled) setCmds(data.commands)
      } catch {
        // popover just stays hidden — never invent commands
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Popover is shown only for a bare leading '/' (no space yet).
  const cmdQuery = text.startsWith('/') && !text.includes(' ') ? text.slice(1).toLowerCase() : null
  const filtered = useMemo(() => {
    if (cmdQuery == null || !cmds) return []
    return cmds
      .filter((c) => c.name.startsWith(cmdQuery) || (c.aliases ?? []).some((a) => a.startsWith(cmdQuery)))
      .slice(0, 5)
  }, [cmdQuery, cmds])
  const [cmdIndex, setCmdIndex] = useState(0)

  const applyCommand = (name: string) => {
    setText(`/${name} `)
    setCmdIndex(0)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  // @mention autocomplete
  const activeQuery = useMemo(() => {
    if (caretPos == null) return null
    const upToCaret = text.slice(0, caretPos)
    const match = upToCaret.match(/@([a-z0-9-]*)$/i)
    return match ? match[1].toLowerCase() : null
  }, [text, caretPos])

  const suggestions = useMemo(() => {
    if (activeQuery == null) return []
    return FLEET.filter(
      (a) => a.id.startsWith(activeQuery) || a.name.toLowerCase().startsWith(activeQuery),
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

  // ── File attachments ──────────────────────────────────────────────────
  const addFiles = useCallback(async (files: File[]) => {
    // Insert placeholder previews immediately
    const drafts: ComposerAttachment[] = files.map((f) => ({
      key: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 8)}`,
      storagePath: '',
      filename: f.name,
      mimeType: f.type || 'application/octet-stream',
      sizeBytes: f.size,
      status: 'uploading',
    }))
    setAtts((prev) => [...prev, ...drafts])
    const { uploaded, errors } = await uploadFiles(files, userId)

    // Reconcile: match uploads back to drafts by filename+size (first match)
    setAtts((prev) => {
      const next = [...prev]
      for (const up of uploaded) {
        const idx = next.findIndex(
          (a) => a.status === 'uploading' && a.filename === up.filename && a.sizeBytes === up.sizeBytes,
        )
        if (idx !== -1) {
          next[idx] = { ...next[idx], ...up, status: 'ready' }
        }
      }
      for (const err of errors) {
        const idx = next.findIndex((a) => a.status === 'uploading' && a.filename === err.filename)
        if (idx !== -1) {
          next[idx] = { ...next[idx], status: 'error', errorMsg: err.error }
        }
      }
      return next
    })
  }, [userId])

  const removeAtt = useCallback((key: string) => {
    setAtts((prev) => prev.filter((a) => a.key !== key))
  }, [])

  // ── Voice recording ──────────────────────────────────────────────────
  const addRecording = useCallback(async (rec: RecordedAudio) => {
    const filename = `voice-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`
    const file = new File([rec.blob], filename, { type: rec.mimeType })
    const draft: ComposerAttachment = {
      key: `${Date.now()}-audio-${Math.random().toString(36).slice(2, 8)}`,
      storagePath: '',
      filename,
      mimeType: rec.mimeType,
      sizeBytes: file.size,
      durationMs: Math.round(rec.durationMs),
      waveform: rec.waveform,
      status: 'uploading',
    }
    setAtts((prev) => [...prev, draft])
    const { uploaded } = await uploadFiles([file], userId)
    if (uploaded[0]) {
      setAtts((prev) =>
        prev.map((a) =>
          a.key === draft.key ? { ...a, ...uploaded[0], durationMs: draft.durationMs, waveform: draft.waveform, status: 'ready' } : a,
        ),
      )
    } else {
      setAtts((prev) =>
        prev.map((a) => (a.key === draft.key ? { ...a, status: 'error', errorMsg: 'upload failed' } : a)),
      )
    }
  }, [userId])

  // ── Send ────────────────────────────────────────────────────────────
  async function submit() {
    const raw = text.trim()
    const ready = atts.filter((a) => a.status === 'ready')
    if ((!raw && ready.length === 0) || sending) return

    let content = raw
    const finalMentions = new Set(mentions)
    if (forcedMention && !finalMentions.has(forcedMention)) {
      content = content ? `@${forcedMention} ${content}` : `@${forcedMention}`
      finalMentions.add(forcedMention)
    }

    try {
      // Cast to UploadedAttachment[] shape (drop ComposerAttachment-only fields)
      const sendAtts: UploadedAttachment[] = ready.map((a) => ({
        storagePath: a.storagePath,
        filename: a.filename,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        durationMs: a.durationMs,
        waveform: a.waveform,
      }))
      await onSend(content || (ready.length > 0 ? '📎' : ''), Array.from(finalMentions), sendAtts)
      setText('')
      setAtts([])
      requestAnimationFrame(resize)
    } catch {
      // Parent shows error; keep everything so user can retry
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Esc stops an in-flight generation without reaching for the mouse.
    if (e.key === 'Escape' && awaitingReply && onStop) {
      e.preventDefault()
      onStop()
      return
    }
    // Command popover keyboard control
    if (filtered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCmdIndex((i) => (i + 1) % filtered.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCmdIndex((i) => (i - 1 + filtered.length) % filtered.length)
        return
      }
      if (e.key === 'Escape') {
        setCmdIndex(0)
        setText('')
        return
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault()
        applyCommand(filtered[Math.min(cmdIndex, filtered.length - 1)].name)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const isDisabled = disabled || sending
  const hasReady = atts.some((a) => a.status === 'ready')
  const canSend = (text.trim().length > 0 || hasReady) && !isDisabled

  return (
    <div
      className="relative z-10 px-4 pb-4 pt-1 sm:px-8"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0))' }}
    >
      <div className="relative mx-auto w-full max-w-[780px]">
        {/* ── Command palette — real registry commands ─────────────────── */}
        {filtered.length > 0 && (
          <div className="adora-rise absolute bottom-full left-2 z-50 mb-3 w-[340px] overflow-hidden rounded-[22px] border border-[var(--chat-hairline)] bg-white p-1.5 shadow-[0_24px_60px_-38px_rgba(33,22,76,0.75)]">
            <div className="px-2.5 pb-1 pt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--chat-text-faint)]">
              Commands
            </div>
            {filtered.map((c, i) => (
              <button
                key={c.name}
                onClick={() => applyCommand(c.name)}
                onMouseEnter={() => setCmdIndex(i)}
                className={`flex w-full items-center gap-2.5 rounded-[14px] px-2.5 py-2 text-left transition ${
                  i === cmdIndex ? 'bg-[rgba(89,46,255,0.07)]' : 'hover:bg-[var(--chat-surface-strong)]'
                }`}
              >
                <span className="chat-mono shrink-0 text-[12px] font-semibold text-[var(--chat-accent)]">
                  /{c.name}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--chat-text-dim)]">
                  {c.summary}
                </span>
                {i === cmdIndex && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[var(--chat-accent)]" />}
              </button>
            ))}
            <div className="px-2.5 pb-1 pt-1.5 text-[10px] text-[var(--chat-text-faint)]">
              ↑↓ navigate · ⏎ insert
            </div>
          </div>
        )}

        {/* ── @mention list ────────────────────────────────────────────── */}
        {suggestions.length > 0 && (
          <div className="adora-rise absolute bottom-full left-2 z-50 mb-3 w-[340px] overflow-hidden rounded-[22px] border border-[var(--chat-hairline)] bg-white p-1.5 shadow-[0_24px_60px_-38px_rgba(33,22,76,0.75)]">
            <div className="px-2.5 pb-1 pt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--chat-text-faint)]">
              Mention an agent
            </div>
            {suggestions.map((a) => (
              <button
                key={a.id}
                onClick={() => completeMention(a.id)}
                className="flex w-full items-center gap-2.5 rounded-[14px] px-2.5 py-2 text-left text-[12.5px] transition hover:bg-[var(--chat-surface-strong)]"
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} />
                <span className="chat-mono text-[11.5px] font-semibold text-[var(--chat-text)]">@{a.id}</span>
                <span className="truncate text-[var(--chat-text-dim)]">{a.name}</span>
                <span className="ml-auto shrink-0 text-[10.5px] text-[var(--chat-text-faint)]">{a.department}</span>
              </button>
            ))}
          </div>
        )}

        <div className="chat-composer px-3 py-2.5">
          {disabled && disabledReason && (
            <div className="mb-2 flex items-center gap-2 rounded-[14px] bg-[var(--chat-surface-strong)] px-3 py-2 text-[12px] text-[var(--chat-text-dim)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {disabledReason}
            </div>
          )}

          {/* Attachment chips */}
          {atts.length > 0 && (
            <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
              {atts.map((a) => (
                <AttachmentChip key={a.key} att={a} onRemove={() => removeAtt(a.key)} />
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            data-composer
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setCaretPos(e.target.selectionStart)
            }}
            onSelect={(e) => setCaretPos((e.target as HTMLTextAreaElement).selectionStart)}
            onKeyDown={onKeyDown}
            disabled={isDisabled}
            rows={1}
            placeholder={placeholder ?? 'Message the team… @agent-id to target. Enter to send.'}
            className="max-h-[208px] w-full resize-none bg-transparent px-3 pb-1.5 pt-1.5 text-[15px] leading-[1.6] text-[var(--chat-body)] focus:outline-none disabled:opacity-50"
          />

          <div className="flex items-end gap-2 pl-1 pt-1">
            <AttachmentPicker onSelect={addFiles} disabled={isDisabled} currentCount={atts.length} />
            <AudioRecorderButton onRecorded={addRecording} disabled={isDisabled} />

            <div className="ml-auto flex items-center gap-3">
              {text.length > 280 && (
                <span className="chat-mono hidden text-[var(--chat-text-faint)] sm:inline">
                  {text.length}
                </span>
              )}
              <span className="hidden text-[11px] text-[var(--chat-text-faint)] sm:inline">
                {awaitingReply ? 'Esc to stop' : '⏎ send · ⇧⏎ newline'}
              </span>

              {awaitingReply && onStop ? (
                <button
                  onClick={onStop}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ef4444] text-white transition hover:brightness-110"
                  aria-label="Stop agent"
                  title="Stop (Esc)"
                >
                  <Square className="h-4 w-4" fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!canSend}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--chat-accent)] text-white transition hover:brightness-110 disabled:bg-[var(--chat-hairline)] disabled:text-[var(--chat-text-faint)]"
                  aria-label="Send"
                  title="Send (⏎)"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-[18px] w-[18px]" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {usage && <UsageIndicator usage={usage} />}
      </div>
    </div>
  )
}

function AttachmentChip({ att, onRemove }: { att: ComposerAttachment; onRemove: () => void }) {
  const isAudio = att.mimeType.startsWith('audio/')
  const tone =
    att.status === 'error'
      ? { color: '#b91c1c', label: att.errorMsg || 'failed' }
      : att.status === 'uploading'
        ? { color: 'var(--chat-text-faint)', label: 'uploading…' }
        : { color: '#587000', label: 'ready' }

  return (
    <div className="relative flex shrink-0 items-center gap-2.5 rounded-[200px] border border-[var(--chat-hairline)] bg-white py-1.5 pl-2 pr-8">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--chat-surface-strong)]">
        {isAudio ? (
          <Mic className="h-3.5 w-3.5 text-[var(--chat-text-dim)]" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-[var(--chat-text-dim)]" />
        )}
      </span>
      <span className="min-w-0 max-w-[9rem]">
        <span className="block truncate text-[12px] font-medium text-[var(--chat-text)]">{att.filename}</span>
        <span className="block text-[10px]" style={{ color: tone.color }}>
          {tone.label}
        </span>
      </span>
      <button
        onClick={onRemove}
        className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[var(--chat-text-faint)] transition hover:bg-[var(--chat-surface-strong)] hover:text-[var(--chat-text)]"
        aria-label="Remove attachment"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
