import 'server-only'
import { supabase } from '@/lib/supabase'
import { hermesConfig } from '@/lib/hermes-client'

// venture-graphify.ts — artifact 4 (trigger wiring), 2026-08-12. Deliberately
// kept OUT of lib/db/ventures.ts (VentureConfig / mapVentureRow / SAFE_SELECT):
// mapVentureRow's output is what GET /api/ventures returns straight to the
// browser (WorkspaceContext's `ventures` list) — folding a write-scoped
// GitHub PAT into that object would leak it to the client. This file talks
// to the `github_pat` column (migration 119) directly and never lets it flow
// through mapVentureRow. Also a separate file rather than an edit to
// ventures.ts because that file is mid-edit elsewhere this session (see
// CLAUDE.md file-scope note / git status at the time this was written).
//
// Known caveat, not fixed here (pre-existing, already flagged separately):
// the `ventures` table has RLS disabled, same as ~50 other tables in this
// DB. This column inherits that exposure at the Postgres level. The app
// itself only ever reads/writes it through this service-role-only module —
// a follow-up to enable RLS on `ventures` would close the gap properly.

export async function setVentureGithubPat(id: string, pat: string | null): Promise<void> {
  const { error } = await supabase.from('ventures').update({ github_pat: pat }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getVentureRepoAndPat(
  id: string
): Promise<{ slug: string; repoUrl: string | null; githubPat: string | null } | null> {
  const { data } = await supabase
    .from('ventures')
    .select('slug, repo_url, github_pat')
    .eq('id', id)
    .single()
  if (!data) return null
  return {
    slug: data.slug as string,
    repoUrl: (data.repo_url as string) ?? null,
    githubPat: (data.github_pat as string) ?? null,
  }
}

/**
 * Fires the VPS graphify build for a venture. Best-effort and never throws —
 * callers (the PATCH auto-trigger, the dedicated /graphify route) treat this
 * as fire-and-forget so a slow/unreachable Hermes never blocks a venture
 * save. Actual build progress is reported by graphify-venture.sh into
 * Supabase (venture_graphs, migration 118), not through this call's result.
 */
export async function triggerVentureGraphify(id: string): Promise<{ ok: boolean; reason?: string }> {
  const info = await getVentureRepoAndPat(id)
  if (!info) return { ok: false, reason: 'venture not found' }
  if (!info.repoUrl) return { ok: false, reason: 'no repoUrl set' }
  if (!info.githubPat) return { ok: false, reason: 'no githubPat set' }

  const cfg = hermesConfig()
  if (!cfg.configured || !cfg.url || !cfg.token) {
    return { ok: false, reason: cfg.reason ?? 'Hermes not configured' }
  }

  try {
    const res = await fetch(`${cfg.url}/v1/venture/graphify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.token}`,
      },
      body: JSON.stringify({
        venture_slug: info.slug,
        repo_url: info.repoUrl,
        github_pat: info.githubPat,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, reason: `Hermes returned ${res.status}: ${text.slice(0, 200)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}
