import { getSecret } from '@/lib/secrets'
import { errMsg } from '@/lib/errors'

// Krea.ai Video Generation — submit an async video generation job.
// POST: sends prompt (+ optional start/end reference images) to Krea API, returns
// job_id for polling via GET /api/krea/status?jobId=xxx (same poller as stills —
// krea's job lifecycle is shared across image and video routes).
// Docs: https://docs.krea.ai/api-reference/introduction
//
// Added for the scroll-world skill install (Teams/Engineering/mia/marketplace/
// scroll-world, 2026-08-10) — mia's dive/connector clips need image-conditioned
// video generation, which /api/krea/generate (stills-only) doesn't cover.
//
// SCHEMA CAVEAT: the request-body field names below (start_image/end_image/ratio)
// match krea's documented convention for image-conditioned generation but are NOT
// confirmed against a live response for the video routes specifically — see the
// scroll-world SKILL.md Gotchas section. Run one real generation and check the
// response shape before relying on this for a batch.
//
// start_image / end_image must be public https:// URLs, not inline bytes — this
// matches the async-media-API norm and mirrors /api/krea/generate's still-only
// contract; if your caller only has local files, upload them (e.g. Supabase
// Storage) and pass the resulting URL.

export const maxDuration = 60

const KREA_BASE = 'https://api.krea.ai'

type RequestBody = {
  prompt?: string
  model?: string
  startImageUrl?: string
  endImageUrl?: string
  duration?: number
  ratio?: string
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = await getSecret('KREA_API_KEY')
  if (!apiKey) {
    return Response.json({ error: 'KREA_API_KEY is not configured. Add it to your .env.local file.' }, { status: 500 })
  }

  let body: RequestBody
  try {
    body = await request.json() as RequestBody
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.prompt?.trim()) {
    return Response.json({ error: 'Missing prompt' }, { status: 400 })
  }
  if (!body.startImageUrl?.trim()) {
    return Response.json({ error: 'Missing startImageUrl — video routes need an image to condition on (start_image)' }, { status: 400 })
  }

  // Default model is a Seedance-class route — same family scroll-world's roster
  // defaults to. Not yet verified against docs.krea.ai's current catalog; confirm
  // the exact route id before a real batch (catalog ids can drift).
  const model = body.model ?? 'bytedance/seedance-pro'
  const endpoint = `${KREA_BASE}/generate/video/${model}`

  const payload: Record<string, unknown> = {
    prompt: body.prompt,
    start_image: body.startImageUrl,
    duration: body.duration ?? 8,
    ratio: body.ratio ?? '16:9',
  }
  if (body.endImageUrl?.trim()) payload.end_image = body.endImageUrl

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text()
      return Response.json(
        { error: `Krea API returned ${res.status}: ${errText}` },
        { status: 502 }
      )
    }

    const data = await res.json() as { job_id?: string }
    if (!data.job_id) {
      return Response.json({ error: 'Krea API did not return a job_id' }, { status: 502 })
    }

    return Response.json({ jobId: data.job_id })
  } catch (err) {
    const msg = errMsg(err)
    return Response.json({ error: msg }, { status: 502 })
  }
}
