// AudioRecorder — mic button that toggles into recording mode. Shows a live
// pulse + timer while recording. Stop returns the recording to the parent.
// Owner: mia · TS-016 WI-3
'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Square, X } from 'lucide-react'
import { AudioRecorder as Recorder, type RecordedAudio } from '@/lib/audio-recorder'

interface AudioRecorderButtonProps {
  onRecorded: (audio: RecordedAudio) => void
  disabled?: boolean
}

export function AudioRecorderButton({ onRecorded, disabled }: AudioRecorderButtonProps) {
  const [state, setState] = useState<'idle' | 'starting' | 'recording'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [level, setLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<Recorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      recorderRef.current?.cancel()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  async function start() {
    if (disabled) return
    setError(null)
    setState('starting')
    try {
      const r = new Recorder({ onLevel: setLevel })
      await r.start()
      recorderRef.current = r
      setState('recording')
      setElapsed(0)
      const t = setInterval(() => setElapsed((e) => e + 100), 100)
      timerRef.current = t
    } catch (e) {
      setState('idle')
      setError(e instanceof Error ? e.message : 'mic permission denied')
    }
  }

  async function stop() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    const audio = await recorderRef.current?.stop()
    recorderRef.current = null
    setState('idle')
    setLevel(0)
    if (audio) onRecorded(audio)
  }

  function cancel() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    recorderRef.current?.cancel()
    recorderRef.current = null
    setState('idle')
    setLevel(0)
  }

  if (state === 'recording' || state === 'starting') {
    const secs = Math.floor(elapsed / 1000)
    const label = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
    return (
      <div className="flex items-center gap-2 rounded-[200px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-3 py-1 text-[12px] text-[#b91c1c]">
        {/* Pulse ring reacting to level */}
        <span
          className="h-2 w-2 rounded-full bg-red-500"
          style={{ boxShadow: `0 0 0 ${Math.round(level * 8)}px rgba(239,68,68,0.15)` }}
        />
        <span className="font-mono text-[11px]">{label}</span>
        <button
          onClick={stop}
          aria-label="Stop recording and send"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition hover:opacity-90"
        >
          <Square className="h-3 w-3" />
        </button>
        <button
          onClick={cancel}
          aria-label="Cancel recording"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--chat-hairline)] text-[var(--chat-text-dim)] transition hover:text-[var(--chat-text)]"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={start}
        disabled={disabled}
        aria-label="Record voice message"
        className="chat-ghost-btn h-9 w-9 shrink-0 rounded-full border-[var(--chat-hairline)] disabled:opacity-40"
        title="Record voice"
      >
        <Mic className="h-4 w-4" />
      </button>
      {error && <span className="text-[10px] text-[#b91c1c]">{error}</span>}
    </div>
  )
}
