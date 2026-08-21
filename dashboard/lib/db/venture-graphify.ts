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
 * Slug-keyed sibling to getVentureRepoAndPat, added 2026-08-19 so
 * app/api/chat/stream/route.ts (which only has the active venture's slug
 * from the yvon_active_venture cookie, not its id) can forward the same
 * write-scoped PAT to chat's GitHub repo-mode clone/pull step — the fix for
 * chat's toggle failing to authenticate against private repos even though
 * a PAT was already saved in Settings → Venture → Technical (it was saved,
 * just never read by anything except graphify/MemPalace until now).
 *
 * Kept in this service-role-only module rather than the general ventures
 * query in stream/route.ts, same reasoning as getVentureRepoAndPat's header
 * comment: never let github_pat flow through a query a browser-facing
 * response could echo back.
 */
export async function getVentureGithubPatBySlug(slug: string): Promise<string | null> {
  const { data } = await supabase
    .from('ventures')
    .select('github_pat')
    .eq('slug', slug)
    .single()
  return (data?.github_pat as string) ?? null
}

async function postToHermes(
  path: string,
  info: { slug: string; repoUrl: string; githubPat: string }
): Promise<{ ok: boolean; reason?: string }> {
  const cfg = hermesConfig()
  if (!cfg.configured || !cfg.url || !cfg.token) {
    return { ok: false, reason: cfg.reason ?? 'Hermes not configured' }
  }
  try {
    const res = await fetch(`${cfg.url}${path}`, {
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
  return postToHermes('/v1/venture/graphify', {
    slug: info.slug,
    repoUrl: info.repoUrl,
    githubPat: info.githubPat,
  })
}

/**
 * Fires the VPS MemPalace repo-knowledge build for a venture (artifact 3,
 * ADR-002) — semantic knowledge, sibling to triggerVentureGraphify's
 * structural graph. Same fire-and-forget contract; status lands in
 * venture_repo_knowledge (migration 118).
 */
export async function triggerVentureMempalace(id: string): Promise<{ ok: boolean; reason?: string }> {
  const info = await getVentureRepoAndPat(id)
  if (!info) return { ok: false, reason: 'venture not found' }
  if (!info.repoUrl) return { ok: false, reason: 'no repoUrl set' }
  if (!info.githubPat) return { ok: false, reason: 'no githubPat set' }
  return postToHermes('/v1/venture/mempalace', {
    slug: info.slug,
    repoUrl: info.repoUrl,
    githubPat: info.githubPat,
  })
}

/**
 * Fires the VPS's persistent per-venture CHAT workspace clone right away
 * (2026-08-21) — sibling to triggerVentureGraphify/triggerVentureMempalace
 * above, but for REPO_WORKSPACES_DIR (main.py's _ensure_repo_clone), the
 * checkout chat's Hermes turns actually `cd` into (see
 * app/api/chat/stream/route.ts). This used to only happen lazily, on
 * whichever chat turn came in first after a repo was linked — so the first
 * message paid the clone latency, and a venture with a bad URL/PAT gave no
 * signal until someone tried chatting. Firing it here means the clone (or
 * its failure) happens the moment the repo is saved in Settings instead.
 *
 * Unlike graphify/mempalace, a PAT is NOT required — public repos clone
 * fine without one (same as the lazy chat-time clone), so this only gates
 * on repoUrl being set. Fire-and-forget, same contract as its siblings —
 * the real outcome also surfaces later via main.py's [WORKING REPO] notice
 * on the first chat turn either way, so a failure here is never silent.
 */
export async function triggerRepoEnsure(id: string): Promise<{ ok: boolean; reason?: string }> {
  const info = await getVentureRepoAndPat(id)
  if (!info) return { ok: false, reason: 'venture not found' }
  if (!info.repoUrl) return { ok: false, reason: 'no repoUrl set' }
  return postToHermes('/v1/repo/ensure', {
    slug: info.slug,
    repoUrl: info.repoUrl,
    githubPat: info.githubPat ?? '',
  })
}

/**
 * Fires the graphify build, the MemPalace build, AND the chat-workspace
 * repo clone for a venture — the combined onboarding step whenever a
 * venture's repo is (re)configured. Returns all three results
 * independently; one failing doesn't block the others.
 */
export async function triggerVentureOnboarding(
  id: string
): Promise<{
  graphify: { ok: boolean; reason?: string }
  mempalace: { ok: boolean; reason?: string }
  repoEnsure: { ok: boolean; reason?: string }
}> {
  const [graphify, mempalace, repoEnsure] = await Promise.all([
    triggerVentureGraphify(id),
    triggerVentureMempalace(id),
    triggerRepoEnsure(id),
  ])
  return { graphify, mempalace, repoEnsure }
}
