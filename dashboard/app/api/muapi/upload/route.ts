/**
 * POST /api/muapi/upload — multipart passthrough to MuAPI's upload_file.
 * Owner: quinn · engineering
 *
 * Mirrors uploadFile() in upstream muapi.js:311, minus the browser-side key.
 * The browser posts a FormData here; we re-post it upstream with the key
 * attached server-side and hand back only the resulting url.
 */
import { MUAPI_BASE, muapiKey, missingKey } from '../_shared'

export const runtime = 'nodejs'
const MAX_BYTES = 25 * 1024 * 1024

export async function POST(req: Request) {
  const key = muapiKey()
  if (!key) return missingKey()

  let form: FormData
  try { form = await req.formData() } catch { return Response.json({ error: 'expected multipart/form-data' }, { status: 400 }) }

  const file = form.get('file')
  if (!(file instanceof File)) return Response.json({ error: 'no file field' }, { status: 400 })
  if (file.size > MAX_BYTES) return Response.json({ error: `file is ${(file.size / 1e6).toFixed(1)}MB — limit is 25MB` }, { status: 413 })
  if (!file.type.startsWith('image/')) return Response.json({ error: `expected an image, got ${file.type || 'unknown'}` }, { status: 415 })

  const out = new FormData()
  out.append('file', file, file.name)

  const res = await fetch(`${MUAPI_BASE}/upload_file`, {
    method: 'POST', headers: { 'x-api-key': key }, body: out,
    signal: AbortSignal.timeout(300_000),
  })
  if (!res.ok) {
    return Response.json({ error: `upstream upload failed — ${res.status}`, detail: (await res.text()).slice(0, 200) }, { status: 502 })
  }
  const data = await res.json().catch(() => null)
  const url = data?.url ?? data?.file_url ?? data?.data?.url
  if (!url) return Response.json({ error: 'upstream returned no url' }, { status: 502 })
  return Response.json({ url })
}
