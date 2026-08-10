// lib/workspaces.ts — venture workspace resolution (TS-026 sweep).
// NO hardcoded sub-brands. The only static workspace is the system venture
// 'yvon-os'; every real venture comes from the DB (ventures table, added via
// Settings). Callers pass the list of real slugs they fetched from the DB.
export type WorkspaceKey = string

export type Workspace = {
  key: WorkspaceKey
  name: string
  business: string
  theme: string
  accent: string
  isVenture?: boolean
  ventureSlug?: string
}

/** The system venture — the only static workspace. Never a DB row. */
export const YVON_OS_WORKSPACE: Workspace = {
  key: 'yvon-os',
  name: 'YVON OS',
  business: 'AI Operating System',
  theme: 'Midnight',
  accent: '#6366F1',
}

// Backward-compat exports (TS-026): the workspace list is the system venture
// ONLY — no hardcoded sub-brands. Real ventures come from the DB via
// /api/ventures; consumers that need them should fetch that.
export const WORKSPACES: Workspace[] = [YVON_OS_WORKSPACE]

export const WORKSPACE_MAP: Record<string, Workspace> = {
  'yvon-os': YVON_OS_WORKSPACE,
}

/**
 * Resolve the active venture from the yvon_active_venture cookie against the
 * REAL list of venture slugs (fetched from the DB by the caller). Unknown or
 * missing values fall back to 'yvon-os'. Single source of truth.
 */
export function activeWorkspace(cookieValue: string | undefined, validSlugs: string[]): WorkspaceKey {
  const value = (cookieValue ?? '').trim().toLowerCase()
  if (!value) return 'yvon-os'
  if (value === 'yvon-os' || validSlugs.includes(value)) return value
  return 'yvon-os'
}
