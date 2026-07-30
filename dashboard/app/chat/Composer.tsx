// Composer — bottom of /chat. Textarea + @mention autocomplete + attachments
// + audio + send/stop button. Mobile-first responsive.
// Owner: mia · TS-016 WI-4
'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { Loader2, Send, Square, X, FileText, Mic } from 'lucide-react'
import { FLEET } from '@/lib/fleet'
import { uploadFiles, type UploadedAttachment } from '@/lib/attachments-client'
import { AttachmentPicker } from './AttachmentPicker'
import { AudioRecorderButton } from './AudioRecorder'
import type { RecordedAudio } from '@/lib/audio-recorder'

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
}

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
}: ComposerProps) {
  const [text, setText] = useState('')
  const [caretPos, setCaretPos] = useState<number | null>(null)
  const [atts, setAtts] = useState<ComposerAttachment[]>([])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

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
    } catch {
      // Parent shows error; keep everything so user can retry
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
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
      className="border-t border-white/[0.06] bg-black/30 p-2.5 md:p-3.5"
      style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0))' }}
    >
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

      {/* Attachment previews — horizontal scroll on phone */}
      {atts.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {atts.map((a) => (
            <AttachmentPreview key={a.key} att={a} onRemove={() => removeAtt(a.key)} />
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5 md:gap-2">
        <AttachmentPicker onSelect={addFiles} disabled={isDisabled} currentCount={atts.length} />
        <AudioRecorderButton onRecorded={addRecording} disabled={isDisabled} />

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
          rows={1}
          placeholder={placeholder ?? 'Message the team… @agent-id to target. Enter to send.'}
          className="min-h-[36px] flex-1 resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 focus:border-white/25 focus:outline-none disabled:opacity-50"
        />

        {awaitingReply && onStop ? (
          <button
            onClick={onStop}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white transition hover:opacity-90"
            aria-label="Stop agent"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-[#06121f] transition hover:opacity-90 disabled:opacity-40"
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

function AttachmentPreview({ att, onRemove }: { att: ComposerAttachment; onRemove: () => void }) {
  const isAudio = att.mimeType.startsWith('audio/')
  return (
    <div className="relative shrink-0 rounded-lg border border-white/10 bg-white/[0.03] p-2">
      <div className="flex items-center gap-2 pr-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.05]">
          {isAudio ? <Mic className="h-4 w-4 text-on-surface-variant" /> : <FileText className="h-4 w-4 text-on-surface-variant" />}
        </div>
        <div className="min-w-0 max-w-[8rem]">
          <div className="truncate text-[11px] text-on-surface">{att.filename}</div>
          <div className="text-[10px] text-on-surface-variant/70">
            {att.status === 'uploading' ? 'uploading…' : att.status === 'error' ? att.errorMsg || 'error' : 'ready'}
          </div>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-on-surface-variant hover:bg-black/80 hover:text-on-surface"
        aria-label="Remove"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
