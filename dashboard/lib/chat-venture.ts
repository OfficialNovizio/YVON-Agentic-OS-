// Shared "which venture is this request scoped to?" resolver for the chat
// API routes (2026-08-21, extracted when /api/chat/threads needed the same
// logic /api/chat/rooms already had).
//
// Extracted rather than copied: the rule is subtle — the cookie's raw value
// is never trusted, it is validated against the ventures table first, and
// the sentinel 'yvon-os' maps to NULL (the original default/shared rooms,
// which pre-date venture scoping and must never be reassigned to a venture).
// Two drifting copies of that would silently split a user's rooms across
// two scopes.
import { cookies } from 'next/headers'
import type { supabaseServer } from '@/lib/supabase-server'
import { activeWorkspace } from '@/lib/workspaces'

type SupaClient = Awaited<ReturnType<typeof supabaseServer>>

/** The caller's active venture slug, or null for the default/shared scope. */
export async function resolveVentureSlug(supabase: SupaClient): Promise<string | null> {
  const cookieStore = await cookies()
  let validSlugs: string[] = []
  try {
    const { data } = await supabase.from('ventures').select('slug')
    validSlugs = ((data as unknown as { slug: string }[] | null) ?? []).map((r) => r.slug)
  } catch {
    // fall through — activeWorkspace() defaults to 'yvon-os' with an empty list
  }
  const workspace = activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validSlugs)
  return workspace === 'yvon-os' ? null : workspace
}
