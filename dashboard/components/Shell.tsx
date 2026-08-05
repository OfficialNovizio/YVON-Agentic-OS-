'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

// Routes that render WITHOUT the shell (sidebar + top bar).
// Login screens must stand alone or they show a signed-out sidebar behind them.
const BARE_ROUTE_PREFIXES = ['/login', '/auth/']

// ── Responsive context ────────────────────────────────────────────────────────
type SidebarMode = 'full' | 'icons'

interface ShellContextValue {
  sidebarMode: SidebarMode
  setSidebarMode: (m: SidebarMode) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (v: boolean) => void
}

const ShellContext = createContext<ShellContextValue>({
  sidebarMode: 'full',
  setSidebarMode: () => {},
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
})

export function useShell() {
  return useContext(ShellContext)
}

// ── Full-bleed mode (TS-018 WI-3 · YVON-CHAT §1.3) ──────────────────────────
// Pages that fill the viewport (chat, dashboards) opt out of the padding
// wrapper: the Shell hands them a correctly-sized flex child instead, and the
// page stops doing viewport math. The Shell owns the state because it renders
// ABOVE the page — descendants can't affect an ancestor's props, but they can
// flip a context flag.
interface ShellFullBleedValue {
  fullBleed: boolean
  setFullBleed: (v: boolean) => void
}
const ShellFullBleedContext = createContext<ShellFullBleedValue>({
  fullBleed: false,
  setFullBleed: () => {},
})

/** Call from a page's useEffect: `setFullBleed(true)` on mount, false on unmount. */
export function useShellFullBleed() {
  return useContext(ShellFullBleedContext)
}

// ── Shell component ───────────────────────────────────────────────────────────
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('full')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fullBleed, setFullBleed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu on route change (Listen for popstate / clicked links)
  useEffect(() => {
    const close = () => setMobileMenuOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  // Bare routes (login, auth callback) render standalone — no shell.
  const isBare = BARE_ROUTE_PREFIXES.some((p) => pathname === p.replace(/\/$/, '') || pathname.startsWith(p))
  if (isBare) {
    return <>{children}</>
  }

  if (!mounted) {
    return (
      <div className="flex h-screen bg-background text-on-surface">
        <div className="hidden md:block w-60 shrink-0" />
        <div className="flex-1 flex flex-col">
          <div className="h-14" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    )
  }

  return (
    <ShellContext.Provider value={{ sidebarMode, setSidebarMode, mobileMenuOpen, setMobileMenuOpen }}>
      <ShellFullBleedContext.Provider value={{ fullBleed, setFullBleed }}>
      {/* h-dvh where supported: browser chrome overlays 100vh on mobile (YVON-CHAT §1.2) */}
      <div className="flex h-screen supports-[height:100dvh]:h-dvh bg-background text-on-surface overflow-hidden">
        {/* ── Desktop sidebar (hidden on mobile, collapses on tablet) ──────── */}
        <aside
          className={`
            hidden md:flex shrink-0 flex-col
            ${sidebarMode === 'full' ? 'w-60' : 'w-[72px]'}
            transition-all duration-200
            border-r border-white/[0.06]
          `}
        >
          <Sidebar
            mode={sidebarMode}
            onToggle={() => setSidebarMode(sidebarMode === 'full' ? 'icons' : 'full')}
          />
        </aside>

        {/* ── Mobile sidebar overlay ────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Slide-over panel */}
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0c0c0c] border-r border-white/[0.08] shadow-2xl animate-slide-in">
              <Sidebar
                mode="full"
                onToggle={() => setMobileMenuOpen(false)}
                mobileClose={() => setMobileMenuOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* ── Main content area ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            sidebarMode={sidebarMode}
            onToggleSidebar={() => setSidebarMode(sidebarMode === 'full' ? 'icons' : 'full')}
            onMobileMenu={() => setMobileMenuOpen(true)}
          />
          <main className={fullBleed ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto'}>
            {fullBleed ? (
              // Full-bleed: correctly-sized flex child, no viewport math —
              // the page fills it with h-full min-h-0 (§1.3).
              <div className="h-full">{children}</div>
            ) : (
              <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
                {children}
              </div>
            )}
          </main>
        </div>
      </div>
      </ShellFullBleedContext.Provider>
    </ShellContext.Provider>
  )
}
