// lib/cie/sources/ventures.ts — Venture registry source (Supabase `ventures` table)
//
// system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §8.3 Cross-scope bridge query needs to know, for a given brand: (a) is
// it "core"/"venture" (owned, bridges freely) or "client" (Master-mediated only, §0 Principle
// 1), and (b) where its own codebase lives, so a future repo-aware bridge could query INTO that
// sibling's own graph rather than just this process's.
//
// VERIFIED (2026-08-09): the live `ventures` table (Supabase project cjjllgexiecesgwenpph) was
// missing `repo_url`, `local_repo_path`, and `kind` entirely, despite the migration ledger
// listing 014/020/030/032/033/038/040/050 as applied and dashboard/lib/db/ventures.ts already
// writing to those columns (Settings → Venture → Technical's "Repo URL" field was silently
// failing to persist). Repaired via dashboard/supabase/migrations/108_ventures_schema_repair.sql
// and 109_ventures_kind_column.sql (new column, never existed before this session) — applied
// live via the Supabase MCP and verified with a direct information_schema query before this file
// was written. See those two migration files for the full drift writeup.
//
// No @supabase/supabase-js dependency — src/cie's other sources (graphify.ts, hermes-memory.ts)
// are all zero-runtime-dependency (fs reads, subprocess calls). This follows the same pattern: a
// plain fetch() against Supabase's PostgREST endpoint, the same as any other HTTP source would
// be treated. Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from process.env directly — these
// are secrets, not project structure, so they don't belong in yvon.config.json; same two env var
// names dashboard/lib/supabase.ts already uses, not reinvented here.
//
// UNVERIFIED — flagged per rule 0.6, same as sources/mempalace.ts's own flag: this sandbox's
// egress allowlist blocks *.supabase.co outbound (confirmed 2026-08-09 via curl — connection
// refused, HTTP_STATUS:000 — not an auth/schema error), so the fetch() -> PostgREST round trip
// below could not be exercised end-to-end here. What WAS verified live: the schema itself,
// through the Supabase MCP tool (a first-party integration with its own network path, unaffected
// by this sandbox's fetch() allowlist) -- see the two migration files referenced above. The
// fail-soft contract (empty array on network failure) WAS exercised directly against this exact
// blocked endpoint, so that path is real, not assumed. Re-verify the success path (parsed rows,
// field mapping) the first time this runs somewhere with real egress to Supabase.

export interface VentureRow {
  id: string
  name: string
  slug: string
  kind: 'core' | 'venture' | 'client'
  repoUrl: string | null
  localRepoPath: string | null
  status: string
}

function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return { url, key }
}

let cachedVentures: VentureRow[] | null = null
let cachedAt = 0
// Ventures change rarely (brand onboarding, not per-query) — a short TTL avoids a network
// round-trip on every bridge call within a burst without risking long-lived staleness.
const CACHE_TTL_MS = 60_000

/**
 * listVentures — all ventures, service-role read. Fails soft (empty array) if Supabase env vars
 * aren't set or the request fails — same posture as every other optional source in src/cie
 * (mempalace.ts's searchMemPalace, etc.): a missing venture registry should degrade the caller,
 * not throw.
 */
export async function listVentures(opts: { skipCache?: boolean } = {}): Promise<VentureRow[]> {
  if (!opts.skipCache && cachedVentures && Date.now() - cachedAt < CACHE_TTL_MS) return cachedVentures

  const env = supabaseEnv()
  if (!env) return []

  try {
    const res = await fetch(
      `${env.url}/rest/v1/ventures?select=id,name,slug,kind,repo_url,local_repo_path,status`,
      { headers: { apikey: env.key, Authorization: `Bearer ${env.key}` } },
    )
    if (!res.ok) return []
    const rows = (await res.json()) as Array<Record<string, unknown>>
    const ventures = rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      slug: r.slug as string,
      kind: (r.kind as VentureRow['kind']) ?? 'venture',
      repoUrl: (r.repo_url as string | null) ?? null,
      localRepoPath: (r.local_repo_path as string | null) ?? null,
      status: (r.status as string) ?? 'active',
    }))
    cachedVentures = ventures
    cachedAt = Date.now()
    return ventures
  } catch {
    return []
  }
}

export function invalidateVenturesCache(): void {
  cachedVentures = null
  cachedAt = 0
}
