import { getSecret } from '@/lib/secrets'
import { errMsg } from '@/lib/errors'

// Krea.ai Job Status — poll a generation job until completion
// GET /api/krea/status?jobId=xxx
// Returns: { status: 'pending' | 'completed' | 'failed', imageUrl?: string, resultUrl?: string }
//
// `imageUrl` is kept for existing callers (originally still-only). `resultUrl` is the
// same value under a provider-neutral name, added when /api/krea/generate-video was
// introduced (scroll-world skill install, 2026-08-10) so video callers aren't stuck
// reading a field named "imageUrl" for an mp4.

const KREA_BASE = 'https://api.krea.ai'

type KreaJob = {
  status: string
  completed_at?: string | null
  result?: {
    urls?: string[]
  }
}

export async function GET(request: Request): Promise<Response> {
  const apiKey = await getSecret('KREA_API_KEY')
  if (!apiKey) {
    return Response.json({ error: 'KREA_API_KEY is not configured', status: 'failed' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  if (!jobId) {
    return Response.json({ error: 'Missing jobId query parameter', status: 'failed' }, { status: 400 })
  }

  try {
    const res = await fetch(`${KREA_BASE}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!res.ok) {
      const errText = await res.text()
      return Response.json(
        { error: `Krea API returned ${res.status}: ${errText}`, status: 'failed' },
        { status: 502 }
      )
    }

    const job = await res.json() as KreaJob

    // Job is complete when completed_at is set
    if (job.completed_at) {
      if (job.status === 'completed' && job.result?.urls?.[0]) {
        const url = job.result.urls[0]
        return Response.json({ status: 'completed', imageUrl: url, resultUrl: url })
      }
      // completed_at set but status isn't 'completed' — treat as failed
      return Response.json({ status: 'failed' })
    }

    // Still running
    return Response.json({ status: job.status ?? 'pending' })
  } catch (err) {
    const msg = errMsg(err)
    return Response.json({ error: msg, status: 'failed' }, { status: 502 })
  }
}
