'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { WORKSPACE_MAP, type WorkspaceKey, type Workspace } from './workspaces'

const STORAGE_KEY = 'yvon_active_workspace'
const DEFAULT: WorkspaceKey = 'yvon-os'

function getStoredWorkspace(): WorkspaceKey {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return stored as WorkspaceKey
    }
  } catch { /* localStorage blocked */ }
  return DEFAULT
}

function persistWorkspace(key: WorkspaceKey) {
  try { localStorage.setItem(STORAGE_KEY, key) } catch { /* ignore */ }
}

/** Sync the venture cookie so API routes scope data to the active venture. */
function syncVentureCookie(key: WorkspaceKey) {
  if (typeof document === 'undefined') return
  const ws = WORKSPACE_MAP[key]
  if (ws?.ventureSlug) {
    document.cookie = `yvon_active_venture=${ws.ventureSlug};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`
  }
}

export interface VentureLite {
  id?: string
  slug: string
  name: string
  color: string
  description?: string
  // Context graph fields (system-harness/graph-brain/YVON-GRAPH.md §1.2, migrations 109/111/112) — carried through from
  // /api/ventures once the duplicate-yvon-os regression was fixed. Used by /brain's L3
  // satellites (§2.3) to distinguish the core row from real brands, resolve one-level client
  // nesting (parentId → another venture's id), and build the events.context_id join key.
  kind?: 'core' | 'venture' | 'client'
  status?: string
  tier?: string
  contextPath?: string
  parentId?: string
  sortOrder?: number
}

type Ctx = {
  workspace: Workspace
  setWorkspace: (k: WorkspaceKey) => void
  /** Live venture list (yvon-os + DB) — shared so a new venture appears
   * everywhere instantly, no refresh (TS-030). */
  ventures: VentureLite[]
  /** Re-fetch ventures (called after creating one). */
  refreshVentures: () => void
  /** Add a venture to the local list immediately (optimistic, no refetch wait). */
  addVenture: (v: VentureLite) => void
}

const WorkspaceCtx = createContext<Ctx | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<WorkspaceKey>(DEFAULT)
  const [mounted, setMounted] = useState(false)
  const [ventures, setVentures] = useState<VentureLite[]>([])

  // Load ventures once at provider mount (shared source of truth).
  const refreshVentures = useCallback(() => {
    fetch('/api/ventures')
      .then((r) => r.json())
      .then((data: VentureLite[]) => { if (Array.isArray(data)) setVentures(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const stored = getStoredWorkspace()
    setKey(stored)
    syncVentureCookie(stored)
    setMounted(true)
    refreshVentures()
  }, [refreshVentures])

  const addVenture = useCallback((v: VentureLite) => {
    setVentures((prev) => (prev.some((x) => x.slug === v.slug) ? prev : [...prev, v]))
  }, [])

  const workspace = WORKSPACE_MAP[key]

  const handleSetWorkspace = (k: WorkspaceKey) => {
    setKey(k)
    persistWorkspace(k)
    syncVentureCookie(k)
  }

  if (!mounted) {
    return (
      <WorkspaceCtx.Provider value={{ workspace: WORKSPACE_MAP[DEFAULT], setWorkspace: handleSetWorkspace, ventures, refreshVentures, addVenture }}>
        <div data-workspace={DEFAULT} className="min-h-screen">
          {children}
        </div>
      </WorkspaceCtx.Provider>
    )
  }

  return (
    <WorkspaceCtx.Provider value={{ workspace, setWorkspace: handleSetWorkspace, ventures, refreshVentures, addVenture }}>
      <div data-workspace={key} className="min-h-screen">
        {children}
      </div>
    </WorkspaceCtx.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
