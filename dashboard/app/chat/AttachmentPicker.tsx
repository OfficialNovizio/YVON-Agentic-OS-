// AttachmentPicker — hidden file input + button. Multi-select. Client-side size validation.
// Owner: mia · TS-016 WI-3
'use client'

import { useRef } from 'react'
import { Paperclip } from 'lucide-react'
import { MAX_FILE_BYTES, MAX_FILES_PER_MESSAGE } from '@/lib/attachments-client'

interface AttachmentPickerProps {
  onSelect: (files: File[]) => void
  disabled?: boolean
  currentCount: number
}

export function AttachmentPicker({ onSelect, disabled, currentCount }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canAddMore = currentCount < MAX_FILES_PER_MESSAGE

  function open() {
    if (!canAddMore || disabled) return
    inputRef.current?.click()
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Array.from(e.target.files ?? [])
    const remaining = MAX_FILES_PER_MESSAGE - currentCount
    const files = raw.slice(0, remaining).filter((f) => {
      if (f.size > MAX_FILE_BYTES) return false
      return true
    })
    if (files.length > 0) onSelect(files)
    // reset input so picking the same file twice fires onchange
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <button
        onClick={open}
        disabled={disabled || !canAddMore}
        aria-label="Attach files"
        className="chat-ghost-btn h-9 w-9 shrink-0 rounded-full border-[var(--chat-hairline)] disabled:opacity-40"
        title={canAddMore ? 'Attach files (up to 25 MB each)' : `${MAX_FILES_PER_MESSAGE}-file limit reached`}
      >
        <Paperclip className="h-4 w-4" />
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={onChange}
        className="hidden"
        // accept everything — server validates mime; some UAs use accept as a filter hint only
      />
    </>
  )
}
