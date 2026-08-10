'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useWorkspace } from '@/lib/WorkspaceContext'
import { WORKSPACES, WORKSPACE_MAP } from '@/lib/workspaces'
import type { WorkspaceKey } from '@/lib/workspaces'

interface SidebarProps {
  mode: 'full' | 'icons'
  onToggle?: () => void
  mobileClose?: () => void
}

// ── Navigation data ──────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  /** When true, the badge value comes from live API counts (overrides static badge) */
  liveBadge?: boolean
}

interface NavSection {
  heading: string
  items: NavItem[]
  /**
   * Which workspaces this section is visible in.
   * Omitted = visible in ALL workspaces (system-wide sections).
   * Set = visible only in the listed workspaces (e.g. brand-only content sections).
   *
   * YVON OS is the parent control plane — it manages other software and doesn't
   * run social/content campaigns, so brand-only sections are hidden there.
   */
  workspaces?: WorkspaceKey[]
}

// Strict workspace segregation — no section is duplicated across workspaces:
//   YVON OS  = control plane. Fleet-level surfaces live here ONLY (no cloning).
//   Brands   = content workbenches. Per-brand production surfaces live here ONLY.
// Rationale: one team runs everything, so shared surfaces (agents, decisions,
// settings) belong on the control plane. Switch to YVON to see them.
const YVON_ONLY:  WorkspaceKey[] = ['yvon-os']
const BRAND_ONLY: WorkspaceKey[] = [] // TS-026: no hardcoded sub-brands — brand-only nav comes from real DB ventures

const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'Command Center',
    workspaces: YVON_ONLY,
    items: [
      { label: 'Dashboard Home', href: '/dashboard', icon: 'dashboard' },
      { label: 'Decision Queue', href: '/decision-queue', icon: 'filter_list', liveBadge: true },
      { label: 'Task Board', href: '/task-board', icon: 'view_kanban', liveBadge: true },
      { label: 'Advisory Council', href: '/advisory-council', icon: 'groups' },
      { label: 'Chat', href: '/chat', icon: 'forum' },
      { label: 'Org Chart', href: '/org-chart', icon: 'account_tree' },
      { label: 'Office', href: '/office', icon: 'apartment' },
      { label: 'Foundry', href: '/foundry', icon: 'science' },
    ],
  },
  {
    heading: 'Long-form',
    workspaces: BRAND_ONLY,
    items: [
      { label: 'Content Pipeline', href: '/content-pipeline', icon: 'movie' },
      { label: 'Production Calendar', href: '/production-calendar', icon: 'calendar_month' },
      { label: 'YouTube Studio', href: '/youtube-studio', icon: 'play_circle' },
      { label: 'YouTube Analytics', href: '/youtube-analytics', icon: 'analytics' },
    ],
  },
  {
    heading: 'Shorts',
    workspaces: BRAND_ONLY,
    items: [
      { label: 'Short Pipeline', href: '/short-pipeline', icon: 'short_text' },
      { label: 'Shorts', href: '/shorts', icon: 'smart_display' },
    ],
  },
  {
    heading: 'Posts',
    workspaces: BRAND_ONLY,
    items: [
      { label: 'Social Approvals', href: '/social-approvals', icon: 'check_circle', badge: 6 },
      { label: 'Scheduler', href: '/scheduler', icon: 'calendar_month' },
      { label: 'Social Analytics', href: '/social-analytics', icon: 'trending_up' },
      { label: 'Newsletter', href: '/newsletter', icon: 'mail' },
    ],
  },
  {
    heading: 'Knowledge',
    workspaces: YVON_ONLY,
    items: [
      { label: 'Brain & Wiki', href: '/brain-wiki', icon: 'psychology' },
      { label: 'Asset Lab', href: '/asset-lab', icon: 'palette' },
      { label: 'Trend Radar', href: '/trend-radar', icon: 'radar' },
    ],
  },
  {
    heading: 'Build',
    workspaces: YVON_ONLY,
    items: [
      { label: 'Idea Feed', href: '/idea-feed', icon: 'lightbulb', badge: 94 },
      { label: 'Software Pipeline', href: '/software-pipeline', icon: 'code', badge: 1 },
    ],
  },
  {
    heading: 'Revenue',
    workspaces: BRAND_ONLY,
    items: [
      { label: 'Consulting CRM', href: '/consulting-crm', icon: 'handshake', badge: 3 },
      { label: 'Cinematic Sites', href: '/cinematic-sites', icon: 'palette' },
    ],
  },
  {
    heading: 'System',
    workspaces: YVON_ONLY,
    items: [
      { label: 'Email Inbox', href: '/inbox', icon: 'inbox' },
      { label: 'Settings', href: '/settings', icon: 'settings' },
      { label: 'Hardware', href: '/hardware', icon: 'dns' },
      { label: 'Projects', href: '/projects', icon: 'folder' },
      { label: 'People', href: '/people', icon: 'people' },
      { label: 'Docs', href: '/docs', icon: 'description' },
      { label: 'Logs', href: '/logs', icon: 'receipt_long' },
    ],
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

// ── Component ────────────────────────────────────────────────────────────────
export function Sidebar({ mode, onToggle, mobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { workspace } = useWorkspace()

  // Live badge counts fetched from API (with mock fallback)
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({
    '/decision-queue': 0,
    '/task-board': 0,
  })

  useEffect(() => {
    let cancelled = false

    async function loadCounts() {
      try {
        // Fetch dashboard for decision queue count
        const dashRes = await fetch('/api/dashboard')
        const decisionCount: number = dashRes.ok
          ? ((await dashRes.json()).decisions?.total ?? 7)
          : 7

        // Fetch task board for proposed count
        let proposedCount = 0
        try {
          const taskRes = await fetch('/api/task-board')
          if (taskRes.ok) {
            const taskData = await taskRes.json()
            proposedCount =
              taskData.tasks?.filter((t: { stage: string }) => t.stage === 'proposed').length ?? 0
          }
        } catch {
          proposedCount = 2 // mock fallback
        }

        if (!cancelled) {
          setLiveCounts({
            '/decision-queue': decisionCount,
            '/task-board': proposedCount || 2,
          })
        }
      } catch {
        // Full mock fallback when APIs are unreachable
        if (!cancelled) {
          setLiveCounts({
            '/decision-queue': 7,
            '/task-board': 2,
          })
        }
      }
    }

    loadCounts()
    return () => { cancelled = true }
  }, [])

  /** Resolve the effective badge count for a nav item */
  function getBadge(item: NavItem): number | undefined {
    if (item.liveBadge) return liveCounts[item.href] ?? item.badge ?? 0
    return item.badge
  }

  const handleNav = () => {
    mobileClose?.()
  }

  // Current workspace
  const ws = WORKSPACES.find((w: { key: WorkspaceKey }) => w.key === workspace.key)
  const wsLabel = ws?.name ?? workspace.key

  return (
    <div className="flex flex-col h-full text-[13px] overflow-y-auto no-scrollbar">
      {/* ── Logo + workspace switcher ──────────────────────────────────────── */}
      <div className="px-3 py-4 border-b border-white/[0.06]">
        {mode === 'full' ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-[#06121f] font-bold text-sm">
                Y
              </div>
              <div>
                <div className="font-semibold text-on-surface leading-tight text-sm">YVON OS</div>
                <div className="text-[10px] text-on-surface-variant tracking-widest uppercase">Mission Control</div>
              </div>
            </div>
            {/* Workspace — static label (TS-030: the interactive selector lives
                in the TopBar WorkspaceSwitcher — one place, not two) */}
            <div className="flex w-full items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs">
              <span className="text-[10px] tracking-widest text-on-surface-variant uppercase shrink-0">
                WORKSPACE
              </span>
              <span className="flex-1 text-left text-on-surface font-medium truncate">
                {wsLabel}
              </span>
            </div>
          </>
        ) : (
          /* Icon-only mode — just the logo */
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-[#06121f] font-bold text-sm">
              Y
            </div>
          </div>
        )}
      </div>

      {/* ── Nav sections ───────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto no-scrollbar" onClick={handleNav}>
        {NAV_SECTIONS
          .filter((s) => !s.workspaces || s.workspaces.includes(workspace.key))
          .map((section) => (
          <div key={section.heading}>
            {mode === 'full' && (
              <div className="text-[10px] tracking-[0.15em] text-on-surface-variant px-3 mb-1.5 uppercase">
                {section.heading}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href)
                const badgeCount = getBadge(item)
                const showBadge = badgeCount != null && badgeCount > 0

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`nav-link ${active ? 'active' : ''} ${mode === 'icons' ? 'justify-center px-2' : ''}`}
                      title={mode === 'icons' ? item.label : undefined}
                    >
                      <span className="material-symbols-outlined text-[20px] shrink-0">
                        {item.icon}
                      </span>
                      {mode === 'full' && <span className="flex-1 truncate">{item.label}</span>}
                      {mode === 'full' && showBadge && (
                        <span className="bg-red-500/20 text-red-300 text-[10px] px-1.5 py-0.5 rounded-full leading-none font-medium">
                          {badgeCount! > 99 ? '99+' : badgeCount}
                        </span>
                      )}
                      {mode === 'icons' && showBadge && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500/20 text-red-300 text-[9px] font-bold flex items-center justify-center px-1">
                          {badgeCount! > 9 ? '9+' : badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Bottom: collapse toggle (desktop only) ──────────────────────────── */}
      <div className="p-3 border-t border-white/[0.06] hidden md:block">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition text-on-surface-variant text-xs"
          title={mode === 'full' ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {mode === 'full' ? 'chevron_left' : 'chevron_right'}
          </span>
          {mode === 'full' && <span>Collapse</span>}
        </button>
      </div>
    </div>
  )
}
