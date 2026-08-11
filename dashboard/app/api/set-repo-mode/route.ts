// POST /api/set-repo-mode — mirrors /api/set-venture's pattern exactly.
// Sets the yvon_repo_mode cookie ('local' | 'github') read by
// /api/chat/stream to decide whether to pass a repo URL through to the VPS
// agent (see main.py's clone/pull step). httpOnly:false so the client-side
// RepoModeToggle can read its own state back without a round-trip.
//
// 'github' is only ever paired with the ACTIVE VENTURE's own repo_url —
// this route never accepts an arbitrary URL from the client, by design
// (the allowlist decision from discovery: only what's set in Settings →
// Venture → Technical is ever clonable). See RepoModeToggle.tsx.
//
// Owner: mia · repo-mode toggle, 2026-08-11
import { cookies } from 'next/headers'

export async function POST(request: Request): Promise<Response> {
  let mode: string
  try {
    const body = (await request.json()) as { mode?: string }
    mode = body.mode ?? ''
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (mode !== 'local' && mode !== 'github') {
    return Response.json({ error: "mode must be 'local' or 'github'" }, { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set('yvon_repo_mode', mode, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false, // must be readable client-side for RepoModeToggle
    sameSite: 'lax',
  })

  return Response.json({ ok: true, mode })
}
