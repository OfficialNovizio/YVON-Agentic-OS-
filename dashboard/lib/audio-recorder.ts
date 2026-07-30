// Browser MediaRecorder wrapper for voice messages.
// - Records webm/opus (universal browser + Whisper-compatible)
// - Samples amplitude for a lightweight waveform (32 bars)
// - Returns Blob + durationMs + waveform on stop
//
// Owner: mia · TS-016 WI-2
'use client'

export interface RecordedAudio {
  blob: Blob
  mimeType: string
  durationMs: number
  waveform: number[]  // 32 samples, each 0..1
}

export interface RecorderState {
  isRecording: boolean
  elapsedMs: number
  level: number  // current amplitude 0..1
}

const WAVEFORM_SAMPLES = 32

/** Preferred MediaRecorder MIME type — webm/opus is best-supported. */
function pickMimeType(): string {
  const cands = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  for (const c of cands) {
    if (MediaRecorder.isTypeSupported?.(c)) return c
  }
  return 'audio/webm'
}

export class AudioRecorder {
  private stream: MediaStream | null = null
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private startTs = 0
  private levelBuffer: number[] = []
  private audioCtx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private raf = 0
  private onLevel: (level: number) => void

  constructor(opts: { onLevel?: (level: number) => void } = {}) {
    this.onLevel = opts.onLevel ?? (() => {})
  }

  async start(): Promise<void> {
    if (this.recorder) return
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = pickMimeType()
    this.recorder = new MediaRecorder(this.stream, { mimeType })
    this.chunks = []
    this.levelBuffer = []
    this.startTs = performance.now()

    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data)
    }

    // Set up the analyser for waveform sampling + live level indicator
    this.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const source = this.audioCtx.createMediaStreamSource(this.stream)
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = 256
    source.connect(this.analyser)

    const buf = new Uint8Array(this.analyser.frequencyBinCount)
    const tick = () => {
      if (!this.analyser) return
      this.analyser.getByteTimeDomainData(buf)
      // RMS-ish level
      let sum = 0
      for (const v of buf) {
        const norm = (v - 128) / 128
        sum += norm * norm
      }
      const rms = Math.sqrt(sum / buf.length)
      const level = Math.min(1, rms * 4)
      this.levelBuffer.push(level)
      this.onLevel(level)
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)

    this.recorder.start(100)  // gather chunks every 100ms
  }

  async stop(): Promise<RecordedAudio | null> {
    if (!this.recorder) return null
    const durationMs = performance.now() - this.startTs
    return new Promise((resolve) => {
      this.recorder!.onstop = () => {
        const mimeType = this.recorder!.mimeType || 'audio/webm'
        const blob = new Blob(this.chunks, { type: mimeType })
        const waveform = downsampleWaveform(this.levelBuffer, WAVEFORM_SAMPLES)
        this.cleanup()
        resolve({ blob, mimeType, durationMs, waveform })
      }
      this.recorder!.stop()
    })
  }

  cancel(): void {
    if (!this.recorder) return
    try { this.recorder.stop() } catch { /* noop */ }
    this.cleanup()
  }

  private cleanup(): void {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    this.recorder = null
    this.chunks = []
    this.analyser?.disconnect()
    this.analyser = null
    void this.audioCtx?.close()
    this.audioCtx = null
    this.levelBuffer = []
  }
}

function downsampleWaveform(buffer: number[], samples: number): number[] {
  if (buffer.length === 0) return new Array(samples).fill(0)
  const step = buffer.length / samples
  const out: number[] = []
  for (let i = 0; i < samples; i++) {
    const start = Math.floor(i * step)
    const end = Math.floor((i + 1) * step)
    let peak = 0
    for (let j = start; j < end; j++) if (buffer[j] > peak) peak = buffer[j]
    out.push(Math.min(1, peak))
  }
  return out
}
