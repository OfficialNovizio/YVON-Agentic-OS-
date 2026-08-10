// POST /api/transcribe — forward audio to Hermes wrapper for Whisper transcription.
// Requires HERMES_URL and HERMES_TOKEN to be set in Vercel env.
//
// Flow: Dashboard AudioRecorder → uploads to Supabase → calls this API →
//       forwards to VPS Whisper → returns transcript
//
// Owner: raj · TS-017 WI-5

import { NextRequest, NextResponse } from 'next/server'
import { errMsg } from '@/lib/errors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const hermesUrl = process.env.HERMES_URL?.trim()
  const hermesToken = process.env.HERMES_TOKEN?.trim()

  if (!hermesUrl || !hermesToken) {
    return NextResponse.json({ error: 'Hermes not configured' }, { status: 503 })
  }

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio')

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Forward to Hermes wrapper's transcribe endpoint
    const forwardForm = new FormData()
    forwardForm.append('audio', audioFile, 'voice.webm')

    const response = await fetch(`${hermesUrl}/v1/transcribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hermesToken}`,
      },
      body: forwardForm,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json(
        { error: `Transcription failed: ${response.status} ${text.slice(0, 200)}` },
        { status: 502 },
      )
    }

    const data = await response.json()
    return NextResponse.json({ text: data.text ?? '' })
  } catch (error) {
    return NextResponse.json(
      { error: `Transcription error: ${errMsg(error)}` },
      { status: 500 },
    )
  }
}
