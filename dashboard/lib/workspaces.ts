export type WorkspaceKey = 'yvon-os' | 'novizio' | 'hourbour' | 'agentx'

export type Workspace = {
  key: WorkspaceKey
  name: string
  business: string
  theme: string
  accent: string
  isVenture?: boolean
  ventureSlug?: string
}

export const WORKSPACES: Workspace[] = [
  { key: 'yvon-os', name: 'YVON OS', business: 'AI Operating System', theme: 'Midnight', accent: '#6366F1' },
  { key: 'novizio', name: 'Novizio', business: 'Fashion e-commerce', theme: 'Crimson', accent: '#E94560', isVenture: true, ventureSlug: 'novizio' },
  { key: 'hourbour', name: 'Hourbour', business: 'Fintech SaaS', theme: 'Ocean', accent: '#3B82F6', isVenture: true, ventureSlug: 'hourbour' },
  { key: 'agentx', name: 'AgentX', business: 'Agent SaaS platform', theme: 'Aurora', accent: '#5ee0ff', isVenture: true, ventureSlug: 'agentx' },
]

export const WORKSPACE_MAP: Record<WorkspaceKey, Workspace> = Object.fromEntries(
  WORKSPACES.map((w) => [w.key, w])
) as Record<WorkspaceKey, Workspace>

/** Resolve the active venture from the yvon_active_venture cookie (TS-023).
 * Unknown/missing values fall back to 'yvon-os'. Single source of truth —
 * used by both send and stream routes (was duplicated). */
export function activeWorkspace(cookieValue: string | undefined): WorkspaceKey {
  const value = (cookieValue ?? '').trim().toLowerCase()
  if (!value) return 'yvon-os'
  for (const w of WORKSPACES) {
    if (w.key === value || w.ventureSlug === value) return w.key
  }
  return 'yvon-os'
}
