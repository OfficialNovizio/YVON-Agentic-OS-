// GET /api/fs/list-dirs?path=<abs path, optional>
// Server-side directory listing for LocalRepoPathPicker.tsx — browsers never
// expose a real filesystem path from a native picker (showDirectoryPicker()
// only returns a folder handle + bare name, by design, for security), but
// this dashboard's Next.js server runs on the SAME machine as the paths
// Settings → Venture → Technical → Local Repo Path cares about, so a small
// server-side "browse" endpoint gives the actual UX a native picker would,
// without needing one.
//
// Security: this endpoint lists real local directory names over HTTP.
// Auth-gated (same supabaseServer() session check as every other route) AND
// scoped to the user's home directory — never lists outside it, so it can't
// become a whole-disk directory-listing oracle even for an authenticated
// user. Directories only (no file names/contents ever returned).
//
// Owner: mia · Local Repo Path picker, 2026-08-11
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { supabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ROOT = os.homedir()

export async function GET(request: Request): Promise<Response> {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const requested = searchParams.get('path') || ROOT
  const resolved = path.resolve(requested)

  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    return Response.json({ error: 'path is outside the allowed root (your home directory)' }, { status: 400 })
  }

  try {
    const entries = await fs.readdir(resolved, { withFileTypes: true })
    const dirs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b))
    const parent = resolved === ROOT ? null : path.dirname(resolved)
    return Response.json({ cwd: resolved, parent, root: ROOT, dirs })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 })
  }
}
